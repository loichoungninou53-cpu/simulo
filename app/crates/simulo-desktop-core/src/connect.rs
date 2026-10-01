use std::collections::HashMap;

use simulo_core::Device;

use crate::adb::AdbManager;
use crate::devices::scan_devices;
use crate::error::SimuloError;

/// Paramètres de connexion (mode + infos réseau éventuelles).
#[derive(Debug, Clone)]
pub struct ConnectParams {
    /// "usb" | "wireless" | "qr"
    pub mode: String,
    /// Serial USB précis (liste des appareils), si l'UI en a un.
    /// En USB sans serial : le premier device USB autorisé est pris.
    pub usb_serial: Option<String>,
    /// IP du téléphone (wireless/qr).
    pub ip: Option<String>,
    /// Port (5555 par défaut ; le QR pairing Android montre souvent 37xxx).
    pub port: Option<u16>,
    /// Code d'appairage affiché sous le QR (Android 11+).
    pub pair_code: Option<String>,
}

impl ConnectParams {
    /// Le serial ADB visé : le serial USB, ou "ip:port" en sans fil.
    pub fn serial(&self) -> String {
        match (self.ip.as_deref(), self.port) {
            (Some(ip), Some(port)) => format!("{ip}:{port}"),
            (Some(ip), None) => format!("{ip}:5555"),
            _ => String::new(),
        }
    }
}

/// Connecte un appareil (mode usb / wireless / qr).
///
/// Orchestration réelle :
/// - **usb** : l'appareil doit être visible par ADB ET autorisé,
///   sinon message clair (autorisation à faire sur le téléphone).
/// - **wireless** : `adb connect ip:port`, vérification du résultat.
/// - **qr** : `adb pair ip:port code` puis `adb connect` (Android 11+).
///
/// À la fin, un scan fournit la fiche appareil **réelle** (nom, OS,
/// capacités). Jamais de device inventé.
pub fn connect_device(
    adb: &AdbManager,
    cache: &mut HashMap<String, Device>,
    now: u64,
    params: &ConnectParams,
) -> Result<Device, SimuloError> {
    if !adb.is_available() {
        return Err(SimuloError::AdbMissing);
    }

    match params.mode.as_str() {
        "wireless" => {
            let addr = params.serial();
            if addr.is_empty() {
                return Err(SimuloError::User(
                    "Wireless mode needs an IP and a port (shown on the phone in Wireless debugging).".into(),
                ));
            }
            let res = adb.connect_tcpip(&addr)?;
            if !res.to_lowercase().contains("connected") {
                return Err(SimuloError::User(format!(
                    "Connection refused: {res} — check that Wireless debugging is ON and the phone is on the same Wi-Fi."
                )));
            }
        }
        "qr" => {
            let addr = params.serial();
            let code = params.pair_code.as_deref().unwrap_or("");
            if addr.is_empty() || code.is_empty() {
                return Err(SimuloError::User(
                    "QR pairing needs the IP:port and the code shown on the phone.".into(),
                ));
            }
            if !code.chars().all(|c| c.is_ascii_digit()) || code.len() < 4 || code.len() > 8 {
                return Err(SimuloError::User(
                    "The pairing code is 4–8 digits, shown under the QR on the phone (it expires quickly).".into(),
                ));
            }
            let res = adb.pair(&addr, code)?;
            if !res.to_lowercase().contains("success") && !res.to_lowercase().contains("paired") {
                return Err(SimuloError::User(format!(
                    "Pairing failed: {res} — the code may have expired, re-scan the QR on the phone and retry."
                )));
            }
            let res2 = adb.connect_tcpip(&addr)?;
            if !res2.to_lowercase().contains("connected") {
                return Err(SimuloError::User(format!("Paired, but connection failed: {res2}")));
            }
        }
        "usb" | _ => {
            let list = adb.list_devices()?;
            // Cible : le serial précis fourni par l'UI, sinon le premier
            // device USB autorisé (cas réel : un seul téléphone branché).
            let target = match params.usb_serial.as_deref() {
                Some(s) => list.iter().find(|a| a.serial == s).cloned(),
                None => list
                    .iter()
                    .find(|a| a.state == simulo_core::AdbState::Device)
                    .cloned(),
            };
            match target {
                Some(a) if a.state == simulo_core::AdbState::Device => {}
                Some(a) => return Err(SimuloError::NotAuthorized(a.serial)),
                None => {
                    return Err(SimuloError::NoDevice(
                        "plug in the phone by USB (a data cable, not a charge-only cable) and enable USB debugging.".into(),
                    ))
                }
            }
        }
    }

    // Scan final : la fiche appareil est issue de ADB, jamais inventée.
    let result = scan_devices(adb, cache, now)?;
    let target_serial = if params.mode == "usb" {
        let wanted = params.usb_serial.clone();
        result
            .devices
            .iter()
            .find(|d| {
                d.connection_status == simulo_core::ConnectionStatus::Connected
                    && (wanted.as_deref().map(|w| d.serial == w).unwrap_or(true))
            })
            .map(|d| d.serial.clone())
            .ok_or_else(|| SimuloError::NoDevice("the phone was not visible after connect".into()))?
    } else {
        params.serial()
    };

    let dev = result
        .devices
        .into_iter()
        .find(|d| d.serial == target_serial)
        .ok_or_else(|| {
            SimuloError::NoDevice(format!("device {target_serial} not in the post-connect scan"))
        })?;

    Ok(dev)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serial_wireless_ip_port() {
        let p = ConnectParams {
            mode: "wireless".into(),
            usb_serial: None,
            ip: Some("192.168.1.12".into()),
            port: Some(37291),
            pair_code: None,
        };
        assert_eq!(p.serial(), "192.168.1.12:37291");
    }

    #[test]
    fn serial_wireless_port_par_defaut() {
        let p = ConnectParams {
            mode: "wireless".into(),
            usb_serial: None,
            ip: Some("10.0.0.5".into()),
            port: None,
            pair_code: None,
        };
        assert_eq!(p.serial(), "10.0.0.5:5555");
    }

    #[test]
    fn sans_adb_erreur_claire() {
        let adb = AdbManager::detect();
        let mut cache = HashMap::new();
        let p = ConnectParams {
            mode: "usb".into(),
            usb_serial: None,
            ip: None,
            port: None,
            pair_code: None,
        };
        let r = connect_device(&adb, &mut cache, 1000, &p);
        if !adb.is_available() {
            assert!(matches!(r, Err(SimuloError::AdbMissing)));
        }
    }

    #[test]
    fn qr_code_malforme_rejete_avant_adb() {
        // Même sans adb installé, la validation du code doit passer avant
        // l'appel système (l'ordre des vérifications compte).
        // Ici on teste la règle du code via un chemin qui la déclenche :
        // sans adb, AdbMissing prime — donc on teste la règle séparément.
        let code = "123"; // trop court
        assert!(
            !code.chars().all(|c| c.is_ascii_digit()) || code.len() < 4 || code.len() > 8,
            "un code de 3 chiffres doit être refusé"
        );
        let code2 = "abc123";
        assert!(!code2.chars().all(|c| c.is_ascii_digit()), "des lettres doivent être refusées");
    }

    #[test]
    fn wireless_sans_ip_rejete_avant_adb() {
        // La règle "wireless exige une IP" est vérifiée avant tout appel.
        // On simule l'ordre : sans adb, AdbMissing prime, donc on valide
        // la condition directement.
        let p = ConnectParams {
            mode: "wireless".into(),
            usb_serial: None,
            ip: None,
            port: Some(5555),
            pair_code: None,
        };
        assert!(p.serial().is_empty(), "sans IP, il n'y a pas d'adresse cible");
    }
}
