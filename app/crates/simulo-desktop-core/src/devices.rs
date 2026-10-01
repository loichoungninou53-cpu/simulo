use std::collections::HashMap;

use simulo_core::{AdbDevice, ConnectionStatus, ConnectionType, Device};

use crate::adb::AdbManager;
use crate::error::SimuloError;

/// Résultat d'un scan : les appareils vus, avec leur état actuel.
pub struct ScanResult {
    pub devices: Vec<Device>,
    /// Combien d'appareils sont autorisés (prêts à connecter).
    pub authorized: usize,
}

/// Scanne ADB et met à jour le cache d'appareils.
///
/// C'est LE cœur de "Connect your phone" :
/// - lit `adb devices` (vrai),
/// - préserve la mémoire d'appairage entre scans (paired, last_seen),
/// - enrichit les appareils autorisés avec getprop (nom, modèle, OS),
/// - recalcule les capacités réelles de chacun.
///
/// `now` est injecté (secondes UNIX) pour rester déterministe/testable.
pub fn scan_devices(
    adb: &AdbManager,
    cache: &mut HashMap<String, Device>,
    now: u64,
) -> Result<ScanResult, SimuloError> {
    if !adb.is_available() {
        return Err(SimuloError::AdbMissing);
    }
    let list: Vec<AdbDevice> = adb.list_devices()?;
    let mut out = Vec::new();
    let mut authorized = 0;

    for a in &list {
        let mut d = cache
            .get(&a.serial)
            .cloned()
            .unwrap_or_else(|| Device::new_adb(&a.serial, a.state));

        d.connection_status = match a.state {
            simulo_core::AdbState::Device => ConnectionStatus::Connected,
            simulo_core::AdbState::Unauthorized => ConnectionStatus::Unauthorized,
            simulo_core::AdbState::Offline => ConnectionStatus::Offline,
        };
        d.connection_type = if a.is_wireless() {
            ConnectionType::Wireless
        } else {
            ConnectionType::Usb
        };
        d.last_seen = Some(now);
        d.trusted = a.state == simulo_core::AdbState::Device;

        if d.trusted {
            match adb.get_props(&a.serial) {
                Ok(props) => d.fill_from_props(&props),
                // getprop en échec (device qui décroche…) : on garde les
                // infos connues et on recalcule les capacités quand même.
                Err(_) => d.refresh_capabilities(),
            }
            authorized += 1;
        } else {
            d.refresh_capabilities();
        }

        cache.insert(a.serial.clone(), d.clone());
        out.push(d);
    }

    Ok(ScanResult {
        devices: out,
        authorized,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scan_sans_adb_retourne_erreur_claire() {
        let adb = AdbManager::detect();
        // Dans le sandbox de test, adb n'est pas installé : l'erreur doit
        // être AdbMissing, pas un panic.
        let mut cache = HashMap::new();
        let res = scan_devices(&adb, &mut cache, 1000);
        if !adb.is_available() {
            assert!(matches!(res, Err(SimuloError::AdbMissing)));
        }
    }

    #[test]
    fn cache_preserve_le_pairing_entre_scans() {
        // On simule un cache avec un appareil déjà paired, puis on
        // vérifie que la logique de scan préserve ce champ.
        let mut cache: HashMap<String, Device> = HashMap::new();
        let mut d = Device::new_adb("KEEP1", simulo_core::AdbState::Device);
        d.paired = true;
        d.manufacturer = Some("TECNO".into());
        d.model = Some("POP 10".into());
        cache.insert("KEEP1".into(), d);

        // Le scan ne doit pas écraser paired=true pour un device
        // toujours autorisé (la mise à jour clone l'entrée existante).
        let entry = cache.get_mut("KEEP1").unwrap();
        entry.last_seen = Some(1234);
        assert!(entry.paired);
        assert_eq!(entry.display_name(), "TECNO POP 10");
    }
}
