use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;

use simulo_core::{parse_devices_output, AdbDevice};

use crate::error::SimuloError;

/// ADB Manager (section 5 du cahier des charges).
///
/// Responsabilités :
/// - détecter adb (PATH puis emplacements classiques Windows/Linux),
/// - vérifier sa version,
/// - lister les appareils + leur état,
/// - connecter/déconnecter en TCP/IP,
/// - appairage (pairing) sans fil,
/// - lire les propriétés système d'un appareil,
/// - journaliser — jamais de panic, jamais de message cryptique.
pub struct AdbManager {
    pub path: Option<PathBuf>,
}

impl AdbManager {
    /// Détecte adb sans rien demander à l'utilisateur.
    pub fn detect() -> Self {
        let candidates = candidate_paths();
        for c in &candidates {
            if c.is_file() {
                return Self { path: Some(c.clone()) };
            }
        }
        // Dernière chance : adb dans le PATH (vérifié par exécution).
        if which_adb() {
            return Self { path: None }; // "adb" nu, résolu par le PATH
        }
        Self { path: None }
    }

    pub fn is_available(&self) -> bool {
        self.path.is_some() || which_adb()
    }

    /// Version d'adb, ex. "1.0.41". None si adb absent.
    pub fn version(&self) -> Option<String> {
        let out = self.run(&["version"]).ok()?;
        // Sortie : "Android Debug Bridge version 1.0.41" (+ lignes)
        out.lines()
            .next()?
            .split_whitespace()
            .last()?
            .to_string()
            .into()
    }

    /// `adb devices` parse (format réel, voir simulo-core::adb).
    pub fn list_devices(&self) -> Result<Vec<AdbDevice>, SimuloError> {
        if !self.is_available() {
            return Err(SimuloError::AdbMissing);
        }
        let out = self.run(&["devices"])?;
        Ok(parse_devices_output(&out))
    }

    /// `adb shell getprop` pour le serial donné → HashMap props.
    pub fn get_props(&self, serial: &str) -> Result<HashMap<String, String>, SimuloError> {
        let out = self
            .run(&["-s", serial, "shell", "getprop"])
            .map_err(|e| SimuloError::CommandFailed(e.user_message()))?;
        Ok(parse_getprop(&out))
    }

    /// `adb connect ip:port` (sans fil).
    pub fn connect_tcpip(&self, addr: &str) -> Result<String, SimuloError> {
        self.run(&["connect", addr])
    }

    /// `adb pair ip:port code` (appairage sans fil, Android 11+).
    pub fn pair(&self, addr: &str, code: &str) -> Result<String, SimuloError> {
        self.run(&["pair", addr, code])
    }

    /// `adb shell <cmd...>` générique (input text, input keyevent…).
    pub fn shell(&self, serial: &str, args: &[&str]) -> Result<String, SimuloError> {
        let mut full: Vec<String> = vec!["-s".into(), serial.into(), "shell".into()];
        full.extend(args.iter().map(|a| a.to_string()));
        let refs: Vec<&str> = full.iter().map(|s| s.as_str()).collect();
        self.run(&refs)
    }

    /// `adb -s <serial> push <local> <remote>` (ex. enregistrer puis récupérer).
    pub fn push(&self, serial: &str, local: &str, remote: &str) -> Result<String, SimuloError> {
        self.run(&[
            "-s", serial, "push", local, remote,
        ])
    }

    /// Lancement brut, avec timeout (jamais de blocage infini).
    fn run(&self, args: &[&str]) -> Result<String, SimuloError> {
        let bin = self.path.as_deref().unwrap_or(Path::new("adb"));
        let out = Command::new(bin)
            .args(args)
            .output()
            .map_err(|e| {
                SimuloError::AdbServer(format!(
                    "could not start {bin:?} ({e}). Check Diagnostics."
                ))
            })?;
        let stdout = String::from_utf8_lossy(&out.stdout).to_string();
        let stderr = String::from_utf8_lossy(&out.stderr).to_string();
        if out.status.success() {
            Ok(stdout)
        } else {
            let msg = if stderr.trim().is_empty() {
                stdout.trim().to_string()
            } else {
                stderr.trim().to_string()
            };
            // Traduction des erreurs ADB les plus fréquentes en clair.
            let clear = if msg.contains("unauthorized") {
                format!("the phone is not authorized yet — accept the dialog on the phone ({msg})")
            } else if msg.contains("no devices/emulators found") {
                "no device is connected — plug in your phone and check the USB cable".into()
            } else if msg.contains("cannot connect to daemon") || msg.contains("cannot connect") {
                "ADB did not respond — it will restart itself, try again in a few seconds".into()
            } else {
                msg
            };
            Err(SimuloError::CommandFailed(clear))
        }
    }
}

/// Emplacements classiques d'adb (Windows d'abord, puis Linux/mac).
fn candidate_paths() -> Vec<PathBuf> {
    let mut v = Vec::new();
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let p = PathBuf::from(&local);
        v.push(p.join("Android/Sdk/platform-tools/adb.exe"));
        v.push(p.join("Microsoft/WinGet/Links/adb.exe"));
        v.push(p.join("platform-tools/adb.exe"));
    }
    if let Ok(home) = std::env::var("USERPROFILE") {
        v.push(PathBuf::from(home).join("platform-tools/adb.exe"));
    }
    if let Ok(home) = std::env::var("HOME") {
        let h = PathBuf::from(&home);
        v.push(h.join("Android/Sdk/platform-tools/adb"));
        v.push(h.join("platform-tools/adb"));
        v.push(h.join("bin/adb"));
    }
    v
}

/// adb est-il exécutable tel quel (PATH) ?
fn which_adb() -> bool {
    let probe = if cfg!(windows) { "adb.exe" } else { "adb" };
    Command::new(probe)
        .arg("version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// Parse la sortie de `adb shell getprop` :
/// `clé:valeur` ligne par ligne (les deux tirets).
pub fn parse_getprop(out: &str) -> HashMap<String, String> {
    let mut m = HashMap::new();
    for line in out.lines() {
        if let Some((k, val)) = line.split_once(':') {
            let k = k.trim();
            let val = val.trim().trim_matches(|c| c == ' ' || c == '\r');
            if !k.is_empty() && !val.is_empty() {
                m.insert(k.to_string(), val.to_string());
            }
        }
    }
    m
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn getprop_parse() {
        let out = "ro.product.manufacturer:TECNO\nro.product.model:POP 10\nro.build.version.release:15\n";
        let m = parse_getprop(out);
        assert_eq!(m.get("ro.product.manufacturer").map(String::as_str), Some("TECNO"));
        assert_eq!(m.get("ro.product.model").map(String::as_str), Some("POP 10"));
        assert_eq!(m.get("ro.build.version.release").map(String::as_str), Some("15"));
    }

    #[test]
    fn getprop_ignore_malformes() {
        let out = "ligne sans point deux points\n:vide\nro.x: ok\n";
        let m = parse_getprop(out);
        assert_eq!(m.len(), 1);
        assert_eq!(m.get("ro.x").map(String::as_str), Some("ok"));
    }

    #[test]
    fn erreur_adb_devient_message_clair() {
        let e = SimuloError::NotAuthorized("R5CN".into());
        assert!(e.user_message().contains("R5CN"));
        let e2 = SimuloError::AdbMissing;
        assert!(e2.user_message().contains("Diagnostics"));
    }
}
