use serde::{Deserialize, Serialize};

/// Ce qu'un appareil sait réellement faire.
///
/// Principe SIMULO : une capacité est listée **seulement si** le moteur
/// (scrcpy officiel / ADB) la supporte sur cette version de OS.
/// Sinon le code UI masque le bouton — jamais de bouton mort.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Capability {
    /// Mirroring écran en temps réel (scrcpy).
    ScreenMirroring,
    /// Contrôle souris + clavier (scrcpy).
    MouseKeyboard,
    /// Clipboard PC <-> téléphone (scrcpy --no-audio? non : via ADB).
    Clipboard,
    /// Audio du téléphone sur le PC (scrcpy --audio-source, Android 10+).
    Audio,
    /// Enregistrement de l'écran (scrcpy --record).
    Recording,
    /// Débogage sans fil (adb tcpip / connect).
    WirelessDebug,
    /// Appairage par QR (fonction native Android 11+ : "Pair device with QR code").
    QrPairing,
    /// Diagnostic et infos appareil (toujours dispo si connecté).
    Diagnostics,
}

impl Capability {
    pub fn label(&self) -> &'static str {
        match self {
            Capability::ScreenMirroring => "Screen mirroring",
            Capability::MouseKeyboard => "Mouse & keyboard",
            Capability::Clipboard => "Clipboard sync",
            Capability::Audio => "Audio",
            Capability::Recording => "Recording",
            Capability::WirelessDebug => "Wireless debugging",
            Capability::QrPairing => "QR pairing",
            Capability::Diagnostics => "Diagnostics",
        }
    }
}

/// Capacités Android selon la version majeure.
///
/// `major` = None => version inconnue : on ne promet que l'essentiel
/// (mirroring + contrôle), jamais le bonus.
///
/// Références (scrcpy officiel, doc Android) :
/// - mirroring / souris / clavier / enregistrement : scrcpy 1.x, Android 4.1+
/// - audio source : scrcpy 2.3+, Android 10+
/// - QR pairing (Pair device with QR code) : Android 11+
/// - wireless debugging natif : Android 11+
pub fn android_capabilities(major: Option<u32>) -> Vec<Capability> {
    let mut v = vec![
        Capability::ScreenMirroring,
        Capability::MouseKeyboard,
        Capability::Recording,
        Capability::WirelessDebug,
        Capability::Diagnostics,
    ];
    if major.map(|m| m >= 11).unwrap_or(false) {
        v.push(Capability::QrPairing);
    }
    if major.map(|m| m >= 10).unwrap_or(false) {
        v.push(Capability::Audio);
    }
    // Clipboard : possible dès que ADB est autorisé (pas dépendant de la version).
    v.push(Capability::Clipboard);
    v.sort();
    v
}

/// Capacités iPhone.
///
/// **Règle 79 du cahier des charges, appliquée en code :**
/// sur iOS standard (sans jailbreak, sans MDM), Apple n'autorise pas
/// le mirroring d'écran ni le contrôle externe. SIMULO ne promet donc
/// que le diagnostic / infos appareil, et affiche honnêtement le reste.
pub fn ios_capabilities() -> Vec<Capability> {
    vec![Capability::Diagnostics]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn android15_aura_le_qr_pairing() {
        let caps = android_capabilities(Some(15));
        assert!(caps.contains(&Capability::QrPairing));
        assert!(caps.contains(&Capability::Audio));
        assert!(caps.contains(&Capability::ScreenMirroring));
    }

    #[test]
    fn android9_n_aura_pas_le_qr() {
        let caps = android_capabilities(Some(9));
        assert!(!caps.contains(&Capability::QrPairing));
        assert!(!caps.contains(&Capability::Audio));
        assert!(caps.contains(&Capability::ScreenMirroring));
    }

    #[test]
    fn version_inconnue_promet_le_minimum() {
        let caps = android_capabilities(None);
        assert!(caps.contains(&Capability::ScreenMirroring));
        assert!(!caps.contains(&Capability::Audio));
        assert!(!caps.contains(&Capability::QrPairing));
    }

    #[test]
    fn iphone_honnete() {
        let caps = ios_capabilities();
        assert_eq!(caps, vec![Capability::Diagnostics]);
    }
}
