use std::collections::HashMap;

use simulo_core::{Capability, Device};

use crate::adb::AdbManager;
use crate::error::SimuloError;
use crate::scrcpy::{MirrorOptions, ScrcpyManager};

/// Démarre le mirroring pour l'appareil.
///
/// Vérifications (jamais de faux "Started") :
/// 1. scrcpy est installé,
/// 2. l'appareil est dans le cache, connecté ET autorisé,
/// 3. l'appareil a réellement la capacité ScreenMirroring
///    (règle 79 : un iPhone n'aura pas ce bouton actif),
/// 4. pas déjà une session en cours.
pub fn start_mirror(
    scrcpy: &mut ScrcpyManager,
    cache: &HashMap<String, Device>,
    serial: &str,
    opts: MirrorOptions,
) -> Result<String, SimuloError> {
    if !scrcpy.is_available() {
        return Err(SimuloError::ScrcpyMissing);
    }
    let d = cache
        .get(serial)
        .ok_or_else(|| SimuloError::NoDevice("connect the phone first".into()))?;
    if !d.connection_status.is_active() {
        return Err(SimuloError::NotAuthorized(serial.to_string()));
    }
    if !d.capabilities.contains(&Capability::ScreenMirroring) {
        return Err(SimuloError::User(format!(
            "{} does not support screen mirroring on this OS. See the Devices page for what is possible.",
            d.display_name()
        )));
    }
    if scrcpy.is_running() {
        return Err(SimuloError::Mirroring(
            "a mirroring session is already running — stop it first".into(),
        ));
    }
    scrcpy.start(serial, &opts)?;
    Ok(format!(
        "Mirroring started for {}. The scrcpy window is showing your phone's screen.",
        d.display_name()
    ))
}

/// Arrête la session en cours (rien d'autre à vérifier).
pub fn stop_mirror(scrcpy: &mut ScrcpyManager) -> Result<String, SimuloError> {
    scrcpy.stop()?;
    Ok("Mirroring stopped.".into())
}

/// Envoie du texte au téléphone (`adb shell input text`).
///
/// Honnêteté : le texte est tapé au curseur. La vraie synchro clipboard
/// bidirectionnelle passe par le compagnon mobile (roadmap) — on ne
/// simule pas une fonctionnalité absente.
pub fn send_text(adb: &AdbManager, serial: &str, text: &str) -> Result<String, SimuloError> {
    if !adb.is_available() {
        return Err(SimuloError::AdbMissing);
    }
    if text.is_empty() {
        return Err(SimuloError::User("Nothing to send (empty text).".into()));
    }
    let escaped = escape_input_text(text);
    adb.shell(serial, &["input", "text", &escaped])
        .map_err(|e| SimuloError::CommandFailed(e.user_message()))
        .map(|_| "Text sent to the phone (typed at the cursor).".into())
}

/// Échappement `input text` : l'espace devient `\ ` (règle officielle ADB).
pub fn escape_input_text(s: &str) -> String {
    s.replace(' ', r"\ ")
}

/// Envoie une touche système.
pub fn send_key(adb: &AdbManager, serial: &str, key: &str) -> Result<String, SimuloError> {
    if !adb.is_available() {
        return Err(SimuloError::AdbMissing);
    }
    // Codes keyevent officiels Android.
    let code = match key {
        "back" => "4",
        "home" => "3",
        "menu" => "82",
        "power" => "26",
        "volume_up" => "24",
        "volume_down" => "25",
        other => {
            return Err(SimuloError::User(format!("Unknown key: {other}")))
        }
    };
    adb.shell(serial, &["input", "keyevent", code])
        .map_err(|e| SimuloError::CommandFailed(e.user_message()))
        .map(|_| format!("Key '{key}' sent."))
}

#[cfg(test)]
mod tests {
    use super::*;
    use simulo_core::{ConnectionStatus, Platform};

    fn authorized_device(serial: &str, platform: Platform) -> Device {
        let mut d = Device::new_adb(serial, simulo_core::AdbState::Device);
        d.platform = platform;
        d.os_version = Some("Android 15".into());
        d.connection_status = ConnectionStatus::Connected;
        d.refresh_capabilities();
        d
    }

    #[test]
    fn escape_text_espaces() {
        assert_eq!(escape_input_text("bon jour"), "bon\\ jour");
        assert_eq!(escape_input_text("abc"), "abc");
        assert_eq!(escape_input_text("a  b"), "a\\ \\ b");
    }

    #[test]
    fn texte_vide_rejete() {
        let adb = AdbManager::detect();
        if adb.is_available() {
            // L'erreur vient de la règle, pas du système.
            match send_text(&adb, "X", "") {
                Err(SimuloError::User(m)) => assert!(m.contains("empty")),
                other => panic!("attendu User(Empty), obtenu {other:?}"),
            }
        }
    }

    #[test]
    fn cle_inconnue_rejete() {
        let adb = AdbManager::detect();
        if adb.is_available() {
            match send_key(&adb, "X", "teleport") {
                Err(SimuloError::User(m)) => assert!(m.contains("teleport")),
                other => panic!("attendu User(Unknown key), obtenu {other:?}"),
            }
        }
    }

    #[test]
    fn iphone_refuse_le_mirroring() {
        let mut scrcpy = ScrcpyManager::detect();
        let mut cache = HashMap::new();
        let mut iphone = Device::new_adb("udid-1", simulo_core::AdbState::Device);
        iphone.platform = Platform::Ios;
        iphone.connection_status = ConnectionStatus::Connected;
        iphone.refresh_capabilities();
        cache.insert("udid-1".into(), iphone);

        let r = start_mirror(&mut scrcpy, &cache, "udid-1", MirrorOptions::default());
        match r {
            Err(SimuloError::User(m)) => {
                assert!(m.contains("does not support screen mirroring"))
            }
            Err(SimuloError::ScrcpyMissing) => {
                // scrcpy absent du sandbox : l'ordre des vérifications a
                // mis scrcpy avant le device — acceptable, l'essentiel est
                // qu'aucun "Started" ne soit retourné.
            }
            other => panic!("attendu une erreur claire, obtenu {other:?}"),
        }
    }

    #[test]
    fn appareil_absent_rejete() {
        let mut scrcpy = ScrcpyManager::detect();
        let cache = HashMap::new();
        let r = start_mirror(&mut scrcpy, &cache, "nope", MirrorOptions::default());
        if scrcpy.is_available() {
            assert!(matches!(r, Err(SimuloError::NoDevice(_))));
        }
    }
}
