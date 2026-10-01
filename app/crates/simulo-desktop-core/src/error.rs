use thiserror::Error;

/// Erreurs SIMULO.
///
/// Règle du cahier des charges : chaque erreur porte un **message
/// utilisateur en langage clair** (`user_message`) — jamais de brut
/// "exit code 256" affiché tel quel.
#[derive(Debug, Error)]
pub enum SimuloError {
    #[error("ADB not found on this computer")]
    AdbMissing,

    #[error("ADB server problem: {0}")]
    AdbServer(String),

    #[error("Command failed: {0}")]
    CommandFailed(String),

    #[error("No device found: {0}")]
    NoDevice(String),

    #[error("Device not authorized: {0}")]
    NotAuthorized(String),

    #[error("scrcpy not found on this computer")]
    ScrcpyMissing,

    #[error("Mirroring problem: {0}")]
    Mirroring(String),

    #[error("{0}")]
    User(String),
}

impl SimuloError {
    /// Message prêt à afficher, en clair, sans jargon.
    pub fn user_message(&self) -> String {
        match self {
            SimuloError::AdbMissing => {
                "ADB (Android tool) is not installed. Open Diagnostics — it will guide you step by step."
                    .into()
            }
            SimuloError::AdbServer(m) => format!("ADB needs a little fix: {m}"),
            SimuloError::CommandFailed(m) => format!("Something went wrong: {m}"),
            SimuloError::NoDevice(what) => format!("No device found. {what}"),
            SimuloError::NotAuthorized(serial) => format!(
                "Your phone ({serial}) is waiting for authorization: accept the USB debugging dialog on the phone."
            ),
            SimuloError::ScrcpyMissing => {
                "scrcpy (screen engine) is not installed. Open Diagnostics — it will guide you."
                    .into()
            }
            SimuloError::Mirroring(m) => format!("Mirroring problem: {m}"),
            SimuloError::User(m) => m.clone(),
        }
    }
}

impl From<SimuloError> for String {
    fn from(e: SimuloError) -> String {
        e.user_message()
    }
}
