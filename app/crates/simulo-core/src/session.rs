use serde::{Deserialize, Serialize};

/// Phases du cycle de connexion d'un appareil.
///
/// Machine à états **évent-driven** : chaque transition est une fonction
/// pure, testable sans système d'exploitation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConnectPhase {
    /// Rien ne se passe.
    Idle,
    /// L'appareil est vu, SIMULO vérifie ADB / autorisation.
    Detecting,
    /// Le téléphone affiche la case d'autorisation : on attend,
    /// avec un message clair (jamais de silence).
    AwaitingAuthorization,
    /// Le moteur de mirroring démarre.
    Starting,
    /// L'écran est affiché : l'utilisateur interagit.
    Streaming,
    /// Arrêt propre demandé.
    Stopped,
    /// Échec — le message est en langage clair, prêt à afficher.
    Failed(String),
}

/// Événements qui font avancer la machine.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ConnectEvent {
    /// ADB vient de détecter l'appareil.
    DeviceDetected,
    /// ADB indique "unauthorized".
    AuthorizationPending,
    /// L'utilisateur a appuyé sur "Autoriser" (ou l'appareil est déjà paired).
    Authorized,
    /// Le moteur a démarré et le flux vidéo tourne.
    StreamReady,
    /// L'appareil a disparu (USB débranché, Wi-Fi coupé, redémarrage).
    Disconnected,
    /// L'utilisateur a demandé l'arrêt.
    UserStop,
    /// Erreur, avec message utilisateur.
    Error(String),
}

/// Session de connexion d'un appareil.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub device_id: String,
    pub phase: ConnectPhase,
    /// Horodatage UNIX (secondes) du début.
    pub started_at: Option<u64>,
    /// Journal clair (affiché dans Diagnostics).
    pub log: Vec<String>,
}

impl Session {
    pub fn new(device_id: &str) -> Self {
        Self {
            device_id: device_id.into(),
            phase: ConnectPhase::Idle,
            started_at: None,
            log: vec!["Session created.".into()],
        }
    }

    /// Applique un événement : retourne la **nouvelle phase** et
    /// met à jour le journal. Fonction déterministe = testable.
    pub fn apply(&mut self, ev: &ConnectEvent) -> ConnectPhase {
        let next = transition(&self.phase, ev);
        self.log.push(format!("{:?} -> {next:?}", ev));
        self.phase = next.clone();
        if matches!(next, ConnectPhase::Detecting) && self.started_at.is_none() {
            // started_at est fixé au premier événement réel.
            self.started_at = Some(self.last_log_ts());
        }
        next
    }

    fn last_log_ts(&self) -> u64 {
        // Le noyau est déterministe : le temps réel est injecté par la
        // couche desktop (voir `tick`). Ici on garde un compteur de logs.
        self.log.len() as u64
    }

    /// Injecte l'horloge réelle (appelé par la couche desktop).
    pub fn tick(&mut self, now_unix: u64) {
        if self.started_at.is_none() && self.log.len() > 1 {
            self.started_at = Some(now_unix);
        }
    }

    pub fn is_active(&self) -> bool {
        matches!(self.phase, ConnectPhase::Streaming)
    }

    pub fn message_for_user(&self) -> String {
        match &self.phase {
            ConnectPhase::Idle => "Ready to connect.".into(),
            ConnectPhase::Detecting => "Looking for your phone…".into(),
            ConnectPhase::AwaitingAuthorization => {
                "Allow USB debugging on your phone (a dialog is showing).".into()
            }
            ConnectPhase::Starting => "Starting the screen…".into(),
            ConnectPhase::Streaming => "Connected. Your phone is on your desktop.".into(),
            ConnectPhase::Stopped => "Disconnected.".into(),
            ConnectPhase::Failed(m) => format!("Connection failed: {m}"),
        }
    }
}

/// Transition pure : (phase courante, événement) -> nouvelle phase.
pub fn transition(phase: &ConnectPhase, ev: &ConnectEvent) -> ConnectPhase {
    match (phase, ev) {
        // --- erreurs et déconnexions : gagnent toujours ---
        (_, ConnectEvent::Error(m)) => ConnectPhase::Failed(m.clone()),
        (p, ConnectEvent::Disconnected)
            if matches!(p, ConnectPhase::Detecting | ConnectPhase::Starting | ConnectPhase::Streaming | ConnectPhase::AwaitingAuthorization) =>
        {
            ConnectPhase::Stopped
        }
        (_, ConnectEvent::UserStop) => ConnectPhase::Stopped,

        // --- cycle normal ---
        (ConnectPhase::Idle, ConnectEvent::DeviceDetected) => ConnectPhase::Detecting,
        (ConnectPhase::Detecting, ConnectEvent::AuthorizationPending) => {
            ConnectPhase::AwaitingAuthorization
        }
        (
            ConnectPhase::Detecting | ConnectPhase::AwaitingAuthorization,
            ConnectEvent::Authorized,
        ) => ConnectPhase::Starting,
        (ConnectPhase::Starting, ConnectEvent::StreamReady) => ConnectPhase::Streaming,

        // --- reconnexion après arrêt/échec : on repart par la détection ---
        (ConnectPhase::Stopped | ConnectPhase::Failed(_), ConnectEvent::DeviceDetected) => {
            ConnectPhase::Detecting
        }

        // --- événements hors contexte : on reste où on est (jamais de panic) ---
        (p, _) => p.clone(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cycle_complet_usb_authorized() {
        let mut s = Session::new("dev1");
        assert_eq!(s.phase, ConnectPhase::Idle);

        assert_eq!(s.apply(&ConnectEvent::DeviceDetected), ConnectPhase::Detecting);
        assert_eq!(s.apply(&ConnectEvent::Authorized), ConnectPhase::Starting);
        assert_eq!(s.apply(&ConnectEvent::StreamReady), ConnectPhase::Streaming);
        assert!(s.is_active());
        assert_eq!(s.apply(&ConnectEvent::UserStop), ConnectPhase::Stopped);
    }

    #[test]
    fn cycle_avec_autorisation_manuelle() {
        let mut s = Session::new("dev2");
        s.apply(&ConnectEvent::DeviceDetected);
        assert_eq!(s.apply(&ConnectEvent::AuthorizationPending), ConnectPhase::AwaitingAuthorization);
        assert_eq!(s.apply(&ConnectEvent::Authorized), ConnectPhase::Starting);
    }

    #[test]
    fn deconnexion_dans_streaming_arrete_tout() {
        let mut s = Session::new("dev3");
        s.apply(&ConnectEvent::DeviceDetected);
        s.apply(&ConnectEvent::Authorized);
        s.apply(&ConnectEvent::StreamReady);
        assert_eq!(s.apply(&ConnectEvent::Disconnected), ConnectPhase::Stopped);
        assert!(!s.is_active());
    }

    #[test]
    fn erreur_en_chemin() {
        let mut s = Session::new("dev4");
        s.apply(&ConnectEvent::DeviceDetected);
        assert_eq!(
            s.apply(&ConnectEvent::Error("adb introuvable".into())),
            ConnectPhase::Failed("adb introuvable".into())
        );
        // Après un échec, une redétection redémarre proprement.
        assert_eq!(s.apply(&ConnectEvent::DeviceDetected), ConnectPhase::Detecting);
    }

    #[test]
    fn evenement_hors_contexte_n_est_pas_fatal() {
        let mut s = Session::new("dev5");
        // StreamReady sans avoir démarré : on reste Idle, pas de panic.
        assert_eq!(s.apply(&ConnectEvent::StreamReady), ConnectPhase::Idle);
        // Authorized sans device : on reste Idle.
        assert_eq!(s.apply(&ConnectEvent::Authorized), ConnectPhase::Idle);
    }

    #[test]
    fn message_utilisateur_clair() {
        let mut s = Session::new("dev6");
        s.apply(&ConnectEvent::DeviceDetected);
        s.apply(&ConnectEvent::AuthorizationPending);
        assert!(s.message_for_user().contains("Allow USB debugging"));
    }
}
