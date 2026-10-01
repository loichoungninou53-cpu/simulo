use serde::Serialize;

use crate::adb::AdbManager;
use crate::scrcpy::ScrcpyManager;

/// Résultat d'une vérification individuelle du "médecin" SIMULO.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Check {
    pub name: String,
    pub ok: bool,
    /// Conseil clair, affiché seulement si ok == false.
    pub advice: String,
}

/// Diagnostics complets (section du cahier des charges : "Diagnostics").
///
/// Chaque vérification est indépendante : un échec n'arrête pas les
/// suivantes, et chaque échec propose un conseil en langage clair.
pub fn run_checks(adb: &AdbManager, scrcpy: &ScrcpyManager) -> Vec<Check> {
    let mut checks = Vec::new();

    // 1. ADB installé ?
    let adb_ok = adb.is_available();
    checks.push(Check {
        name: "ADB (Android tool) installed".into(),
        ok: adb_ok,
        advice: "Install Android Platform Tools: open Troubleshooting > USB in the docs, step by step (2 minutes).".into(),
    });

    // 2. Version d'ADB
    if adb_ok {
        if let Some(v) = adb.version() {
            checks.push(Check {
                name: format!("ADB version {v}"),
                ok: true,
                advice: String::new(),
            });
        }
    }

    // 3. scrcpy installé ?
    let sc_ok = scrcpy.is_available();
    checks.push(Check {
        name: "scrcpy (screen engine) installed".into(),
        ok: sc_ok,
        advice: "Install scrcpy from the official GitHub (github.com/Genymobile/scrcpy). Docs: Troubleshooting > Screen not appearing.".into(),
    });

    // 4. scrcpy version (doit être >= 2.x pour audio etc.)
    if sc_ok {
        if let Some(v) = scrcpy.version() {
            let major_ok = v.split('.').next().and_then(|s| s.parse::<u32>().ok()).unwrap_or(0) >= 2;
            checks.push(Check {
                name: format!("scrcpy version {v}"),
                ok: major_ok,
                advice: if major_ok {
                    String::new()
                } else {
                    "Your scrcpy is old: some features (audio) may not work. Update it from the official GitHub.".into()
                },
            });
        }
    }

    // 5. Appareils visibles ?
    if adb_ok {
        match adb.list_devices() {
            Ok(devs) if !devs.is_empty() => {
                let auth = devs.iter().filter(|d| d.state == simulo_core::AdbState::Device).count();
                checks.push(Check {
                    name: format!("{} device(s) seen by ADB, {} authorized", devs.len(), auth),
                    ok: auth > 0,
                    advice: if auth > 0 {
                        String::new()
                    } else {
                        "A phone is plugged in but not authorized: accept the USB debugging dialog on the phone (tick \"always allow\")".into()
                    },
                });
            }
            Ok(_) => checks.push(Check {
                name: "No device connected".into(),
                ok: false,
                advice: "Plug in your phone by USB (a data cable, not a charge-only cable) and enable USB debugging: docs > USB connection.".into(),
            }),
            Err(e) => checks.push(Check {
                name: "Device scan failed".into(),
                ok: false,
                advice: e.user_message(),
            }),
        }
    }

    checks
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_serde_camel_case() {
        let c = Check { name: "x".into(), ok: true, advice: "".into() };
        let s = serde_json::to_string(&c).unwrap();
        assert!(s.contains("\"ok\":true"));
    }
}
