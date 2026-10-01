use serde::{Deserialize, Serialize};

/// Session QR **temporaire** (section 11 du cahier des charges).
///
/// SÉCURITÉ :
/// - le `code` est un jeton d'une seule utilisation,
/// - il expire (par défaut 5 minutes),
/// - il ne contient JAMAIS de mot de passe permanent,
///   de credential sensible, ni de donnée privée du téléphone.
///
/// Le QR code encode uniquement :
/// `simulo://pair?sid=<session_id>&tok=<code>&exp=<expires_at>`
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QrSession {
    /// Identifiant court de session (généré par la couche desktop).
    pub session_id: String,
    /// Jeton aléatoire hexadécimal (généré par la couche desktop, 16 octets).
    pub token: String,
    /// Création, horodatage UNIX secondes.
    pub created_at: u64,
    /// Expiration, horodatage UNIX secondes.
    pub expires_at: u64,
}

impl QrSession {
    /// Durée de vie par défaut : 5 minutes.
    pub const DEFAULT_TTL_SECS: u64 = 300;

    pub fn new(session_id: &str, token: &str, now_unix: u64) -> Self {
        Self {
            session_id: session_id.into(),
            token: token.into(),
            created_at: now_unix,
            expires_at: now_unix + Self::DEFAULT_TTL_SECS,
        }
    }

    pub fn new_with_ttl(session_id: &str, token: &str, now_unix: u64, ttl_secs: u64) -> Self {
        Self {
            session_id: session_id.into(),
            token: token.into(),
            created_at: now_unix,
            expires_at: now_unix + ttl_secs,
        }
    }

    /// La session est-elle encore valable ? (jamais de panique, jamais
    /// de sous-décalage : `now` peut être avant `created_at`, c'est OK.)
    pub fn is_valid(&self, now_unix: u64) -> bool {
        now_unix < self.expires_at
    }

    /// La charge utile exacte encodée dans le QR code.
    ///
    /// Format court, sans information sensible permanente.
    pub fn payload(&self) -> String {
        format!(
            "simulo://pair?sid={}&tok={}&exp={}",
            self.session_id, self.token, self.expires_at
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expiration_par_defaut_5_min() {
        let s = QrSession::new("s1", "abcd1234", 1_000);
        assert_eq!(s.expires_at - s.created_at, 300);
    }

    #[test]
    fn validite_tourne_autour_de_l_expiration() {
        let s = QrSession::new("s2", "abcd", 1_000);
        assert!(s.is_valid(1_299));
        assert!(!s.is_valid(1_300));
        assert!(!s.is_valid(1_301));
    }

    #[test]
    fn horloge_avant_creation_est_ok() {
        let s = QrSession::new("s3", "abcd", 1_000);
        assert!(s.is_valid(900));
    }

    #[test]
    fn payload_ne_contient_pas_de_secret_permanent() {
        let s = QrSession::new("s4", "tok123", 1_000);
        let p = s.payload();
        assert!(p.starts_with("simulo://pair?"));
        assert!(p.contains("tok=tok123"));
        assert!(p.contains("exp=1300"));
        // Pas de mot de passe, pas de serial téléphone.
        assert!(!p.contains("password"));
    }

    #[test]
    fn ttl_personnalise() {
        let s = QrSession::new_with_ttl("s5", "t", 10, 60);
        assert!(s.is_valid(69));
        assert!(!s.is_valid(70));
    }
}
