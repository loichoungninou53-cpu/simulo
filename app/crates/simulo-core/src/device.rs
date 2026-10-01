use serde::{Deserialize, Serialize};
use std::fmt;

use crate::caps::{android_capabilities, ios_capabilities};

/// Plateforme du téléphone.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Android,
    Ios,
    Unknown,
}

impl Platform {
    /// Détermine la plateforme à partir des métadonnées ADB.
    ///
    /// `ro.product.model` contient "iPhone" sur certains bridges ;
    /// sinon, `adb` ne parle qu'à Android, donc tout device ADB est
    /// considéré Android. L'iPhone est détecté par le canal séparé
    /// `IOSDetector` (usbmuxd) côté desktop, pas par ADB.
    pub fn from_adb_metadata(product_model: &str) -> Platform {
        let m = product_model.to_lowercase();
        if m.contains("iphone") || m.contains("ipad") {
            Platform::Ios
        } else {
            Platform::Android
        }
    }
}

/// Type de connexion utilisée.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionType {
    Usb,
    Wireless,
    Qr,
}

/// État de la connexion d'un appareil.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ConnectionStatus {
    /// Jamais connecté / déconnecté.
    Disconnected,
    /// SIMULO a vu l'appareil, vérification en cours.
    Detecting,
    /// Le téléphone affiche la case "Autoriser le débogage USB".
    AuthorizationPending,
    /// Connecté et autorisé : le mirroring peut démarrer.
    Connected,
    /// ADB voit l'appareil mais l'utilisateur n'a pas autorisé.
    Unauthorized,
    /// L'appareil a disparu sans déconnexion propre.
    Offline,
    /// Erreur descriptive (le message est affiché tel quel, en clair).
    Error(String),
}

impl ConnectionStatus {
    pub fn is_active(&self) -> bool {
        matches!(self, ConnectionStatus::Connected)
    }

    /// Message utilisateur honnête, sans jargon technique.
    pub fn plain_message(&self) -> String {
        match self {
            ConnectionStatus::Disconnected => "Not connected".into(),
            ConnectionStatus::Detecting => "Detecting your phone…".into(),
            ConnectionStatus::AuthorizationPending => {
                "Please allow USB debugging on your phone.".into()
            }
            ConnectionStatus::Connected => "Connected".into(),
            ConnectionStatus::Unauthorized => {
                "Waiting for authorization on the phone…".into()
            }
            ConnectionStatus::Offline => "Phone disconnected or network changed".into(),
            ConnectionStatus::Error(m) => format!("Problem: {m}"),
        }
    }
}

impl fmt::Display for ConnectionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.plain_message())
    }
}

/// Modèle interne d'un appareil (section 7 du cahier des charges).
///
/// Tout champ optionnel signifie "pas encore connu" — jamais une
/// valeur inventée.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    pub id: String,
    pub platform: Platform,
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub os_version: Option<String>,
    /// Identifiant unique ADB (serial) ou usbmuxd (UDID).
    pub serial: String,
    pub connection_type: ConnectionType,
    pub connection_status: ConnectionStatus,
    /// 0..=100, si le téléphone le rapporte.
    pub battery: Option<u8>,
    /// (largeur, hauteur), si connue.
    pub resolution: Option<(u32, u32)>,
    pub refresh_rate: Option<u32>,
    pub capabilities: Vec<crate::caps::Capability>,
    /// Horodatage UNIX (secondes) de la dernière vue.
    pub last_seen: Option<u64>,
    pub paired: bool,
    pub trusted: bool,
}

impl Device {
    /// Crée un Device minimal à partir d'un serial ADB.
    ///
    /// C'est la fonction d'entrée unique : tout Device SIMULO naît ici,
    /// puis est enrichi (`fill_from_props`, etc.).
    pub fn new_adb(serial: &str, state: crate::adb::AdbState) -> Device {
        let status = match state {
            crate::adb::AdbState::Device => ConnectionStatus::Connected,
            crate::adb::AdbState::Unauthorized => ConnectionStatus::Unauthorized,
            crate::adb::AdbState::Offline => ConnectionStatus::Offline,
        };
        Device {
            id: serial.to_string(),
            platform: Platform::Android,
            manufacturer: None,
            model: None,
            os_version: None,
            serial: serial.to_string(),
            connection_type: ConnectionType::Usb,
            connection_status: status,
            battery: None,
            resolution: None,
            refresh_rate: None,
            capabilities: Vec::new(),
            last_seen: None,
            paired: false,
            trusted: state == crate::adb::AdbState::Device,
        }
    }

    /// Enrichit le device avec les propriétés système lues via
    /// `adb shell getprop` (appelées par la couche desktop).
    ///
    /// Les clés attendues (format Android) :
    /// `ro.product.manufacturer`, `ro.product.model`, `ro.build.version.release`.
    pub fn fill_from_props(&mut self, props: &std::collections::HashMap<String, String>) {
        if let Some(m) = props.get("ro.product.manufacturer") {
            if !m.is_empty() {
                self.manufacturer = Some(m.clone());
            }
        }
        if let Some(m) = props.get("ro.product.model") {
            if !m.is_empty() {
                self.model = Some(m.clone());
                self.platform = Platform::from_adb_metadata(m);
            }
        }
        if let Some(v) = props.get("ro.build.version.release") {
            if !v.is_empty() {
                self.os_version = Some(format!("Android {v}"));
            }
        }
        // Les capacités sont toujours recalculées après enrichissement :
        // elles dépendent de la version OS, jamais de la mémoire.
        self.refresh_capabilities();
    }

    /// Recalcule les capacités réelles selon la plateforme/version.
    pub fn refresh_capabilities(&mut self) {
        self.capabilities = match self.platform {
            Platform::Android => {
                let major = self.os_version.as_deref().and_then(|v| {
                    v.trim_start_matches("Android ")
                        .split('.')
                        .next()
                        .and_then(|s| s.parse::<u32>().ok())
                });
                android_capabilities(major)
            }
            Platform::Ios => ios_capabilities(),
            Platform::Unknown => Vec::new(),
        };
    }

    /// L'appareil est-il prêt pour le mirroring ?
    pub fn can_mirror(&self) -> bool {
        self.connection_status.is_active()
            && self.capabilities.contains(&crate::caps::Capability::ScreenMirroring)
    }

    /// Nom court pour l'UI : "TECNO POP 10" ou "Device abc123".
    ///
    /// Totalement exhaustif : chaque combinaison Some/None et chaque cas
    /// de chaîne vide est couvert (pas de panic, pas de nom inventé).
    pub fn display_name(&self) -> String {
        let manuf = self.manufacturer.as_deref().filter(|s| !s.trim().is_empty());
        let model = self.model.as_deref().filter(|s| !s.trim().is_empty());
        match (manuf, model) {
            (Some(m), Some(mdl)) => format!("{m} {mdl}"),
            (Some(m), None) | (None, Some(m)) => m.to_string(),
            (None, None) => {
                let short: String = self.serial.chars().take(6).collect();
                format!("Device {short}…")
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn device_naissance_usb_authorized() {
        let d = Device::new_adb("R5CN60ABCDE", crate::adb::AdbState::Device);
        assert_eq!(d.connection_status, ConnectionStatus::Connected);
        assert!(d.trusted);
        assert!(!d.paired);
    }

    #[test]
    fn device_naissance_unauthorized() {
        let d = Device::new_adb("XYZ", crate::adb::AdbState::Unauthorized);
        assert_eq!(d.connection_status, ConnectionStatus::Unauthorized);
        assert!(!d.trusted);
    }

    #[test]
    fn fill_from_props_android15() {
        let mut d = Device::new_adb("SER123", crate::adb::AdbState::Device);
        let mut props = std::collections::HashMap::new();
        props.insert("ro.product.manufacturer".into(), "TECNO".into());
        props.insert("ro.product.model".into(), "POP 10".into());
        props.insert("ro.build.version.release".into(), "15".into());
        d.fill_from_props(&props);

        assert_eq!(d.display_name(), "TECNO POP 10");
        assert_eq!(d.os_version.as_deref(), Some("Android 15"));
        assert!(d.can_mirror()); // Android 15 => mirroring supporté
    }

    #[test]
    fn iphone_ne_promet_pas_le_mirroring() {
        use crate::caps::Capability;
        let mut d = Device {
            platform: Platform::Ios,
            ..Device::new_adb("udid-1", crate::adb::AdbState::Device)
        };
        d.refresh_capabilities();
        assert!(
            !d.capabilities.contains(&Capability::ScreenMirroring),
            "Règle 79 : ne jamais promettre le mirroring iPhone sur iOS stock"
        );
        assert!(d.capabilities.contains(&Capability::Diagnostics));
        assert!(!d.can_mirror());
    }

    #[test]
    fn props_vides_ne_pas_d_entree() {
        let mut d = Device::new_adb("S1", crate::adb::AdbState::Device);
        let props: std::collections::HashMap<String, String> =
            [("ro.product.manufacturer".into(), "".into())]
                .into_iter()
                .collect();
        d.fill_from_props(&props);
        assert_eq!(d.manufacturer, None);
        assert!(d.display_name().starts_with("Device"));
    }

    #[test]
    fn statut_plain_message() {
        assert!(
            ConnectionStatus::AuthorizationPending.plain_message().contains("allow")
        );
        assert_eq!(
            ConnectionStatus::Error("adb manquant".into()).plain_message(),
            "Problem: adb manquant"
        );
    }
}
