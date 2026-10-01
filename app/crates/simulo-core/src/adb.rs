use serde::{Deserialize, Serialize};

/// État d'une ligne `adb devices`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AdbState {
    /// Autorisé et prêt (l'état normal).
    Device,
    /// Le téléphone attend la case "Autoriser le débogage USB".
    Unauthorized,
    /// Vu mais injoignable.
    Offline,
}

/// Une ligne parseée de `adb devices`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AdbDevice {
    pub serial: String,
    pub state: AdbState,
}

impl AdbDevice {
    /// Le serial correspond-il à un appareil sans fil ?
    ///
    /// ADB nomme les appareils TCP sous la forme `192.168.1.12:5555`.
    /// C'est la seule distinction fiable USB vs wireless côté ADB.
    pub fn is_wireless(&self) -> bool {
        self.serial.contains(':') && self.serial.rsplit_once(':').map(|(_, p)| p.parse::<u16>().is_ok()).unwrap_or(false)
    }
}

/// Parse la sortie de `adb devices`.
///
/// Format réel d'ADB (vérifié sur la sortie officielle) :
/// ```text
/// List of devices attached
///
/// R5CN60XYZ123         device
/// 192.168.1.12:5555    unauthorized
/// emulator-5554        offline
/// * daemon started successfully *
/// ```
///
/// Règles :
/// - la 1ʳᵉ ligne (`List of devices attached`) est ignorée,
/// - les lignes vides et les commentaires (`*`, `#`) sont ignorés,
/// - `usb:123` (préfixe Windows) est accepté, le préfixe est retiré,
/// - une ligne sans état valide est ignorée (jamais de panic, jamais
///   de device inventé).
pub fn parse_devices_output(output: &str) -> Vec<AdbDevice> {
    let mut out = Vec::new();
    for raw in output.lines() {
        let line = raw.trim();
        if line.is_empty() {
            continue;
        }
        if line.starts_with('*') || line.starts_with('#') {
            continue;
        }
        // Séparateur : ADB utilise des tabulations/espaces ; on prend
        // le dernier mot comme état, le reste comme serial.
        let mut parts = line.rsplitn(2, char::is_whitespace);
        let state_str = parts.next().unwrap_or_default();
        let serial_raw = parts.next().unwrap_or_default().trim();
        if serial_raw.is_empty() || serial_raw.eq_ignore_ascii_case("List of devices attached") {
            continue;
        }
        let state = match state_str.to_lowercase().as_str() {
            "device" => AdbState::Device,
            "unauthorized" => AdbState::Unauthorized,
            "offline" => AdbState::Offline,
            // "recovery", "sideload", "no permissions"… : on ne connaît pas
            // cet état => on ne l'invente pas, on l'ignore proprement.
            _ => continue,
        };
        // Préfixes possibles : "usb:XXXX" (Windows), "emulator-5554" (OK tel quel).
        let serial = serial_raw.strip_prefix("usb:").unwrap_or(serial_raw).to_string();
        if serial.is_empty() {
            continue;
        }
        out.push(AdbDevice { serial, state });
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "List of devices attached\n\nR5CN60XYZ123\tdevice\n192.168.1.12:5555    unauthorized\nemulator-5554\toffline\n* daemon started successfully *\n";

    #[test]
    fn parse_sortie_reelle() {
        let v = parse_devices_output(SAMPLE);
        assert_eq!(v.len(), 3);
        assert_eq!(v[0].serial, "R5CN60XYZ123");
        assert_eq!(v[0].state, AdbState::Device);
        assert!(v[1].is_wireless());
        assert_eq!(v[1].state, AdbState::Unauthorized);
        assert_eq!(v[2].state, AdbState::Offline);
    }

    #[test]
    fn parse_sortie_vide() {
        assert!(parse_devices_output("").is_empty());
        assert!(parse_devices_output("List of devices attached\n").is_empty());
    }

    #[test]
    fn parse_ignore_etats_inconnus() {
        let v = parse_devices_output("A1 recovery\nB2 device\n");
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].serial, "B2");
    }

    #[test]
    fn parse_prefixe_usb_windows() {
        let v = parse_devices_output("usb:12AB34CD device\n");
        assert_eq!(v[0].serial, "12AB34CD");
    }

    #[test]
    fn serial_usb_n_est_pas_wireless() {
        assert!(!parse_devices_output("R5CN device")[0].is_wireless());
        assert!(parse_devices_output("10.0.0.5:5555 device")[0].is_wireless());
    }
}
