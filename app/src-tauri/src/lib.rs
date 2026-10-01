//! SIMULO — couche desktop (Tauri).
//!
//! Ce fichier est **volontairement fin** : toute la logique métier vit
//! dans `simulo-desktop-core` (testée) et `simulo-core` (testée). Ici :
//! - l'état global (cache appareils, sessions, logs),
//! - les commandes exposées au frontend React,
//! - l'injection d'horloge et d'entrées/sorties réelles.
//!
//! Chaque commande retourne soit une vraie donnée, soit un message
//! utilisateur en clair. Jamais de faux état (règle 64).

use std::collections::HashMap;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, State};

use simulo_core::{Device, QrSession, Session};
use simulo_desktop_core::{
    connect_device, run_checks, start_mirror, stop_mirror, send_key, send_text,
    AdbManager, Check, ConnectParams, MirrorOptions, ScrcpyManager,
};

// ------------------------------------------------------------------ //
//  État global                                                        //
// ------------------------------------------------------------------ //

pub struct AppState {
    devices: Mutex<HashMap<String, Device>>,
    sessions: Mutex<HashMap<String, Session>>,
    logs: Mutex<Vec<String>>,
    adb: Mutex<AdbManager>,
    scrcpy: Mutex<ScrcpyManager>,
}

impl AppState {
    fn log(&self, msg: &str) {
        let ts = Self::now();
        self.logs.lock().unwrap().push(format!("[{ts}] {msg}"));
    }

    /// Maintenant en secondes UNIX.
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}

// ------------------------------------------------------------------ //
//  Structures retournées au frontend (camelCase)                      //
// ------------------------------------------------------------------ //

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdbStatus {
    pub found: bool,
    pub path: Option<String>,
    pub version: Option<String>,
}

// ------------------------------------------------------------------ //
//  Setup                                                              //
// ------------------------------------------------------------------ //

pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            devices: Mutex::new(HashMap::new()),
            sessions: Mutex::new(HashMap::new()),
            logs: Mutex::new(Vec::new()),
            adb: Mutex::new(AdbManager::detect()),
            scrcpy: Mutex::new(ScrcpyManager::detect()),
        })
        .invoke_handler(tauri::generate_handler![
            get_adb_status,
            refresh_devices,
            connect_device_cmd,
            start_mirror_cmd,
            stop_mirror_cmd,
            send_text_cmd,
            send_key_cmd,
            new_qr_session,
            run_diagnostics,
            get_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running Simulo");
}

// ------------------------------------------------------------------ //
//  Commandes (une par fonctionnalité, toutes fines)                   //
// ------------------------------------------------------------------ //

/// Statut d'ADB : trouvé ? où ? quelle version ?
#[tauri::command]
fn get_adb_status(state: State<AppState>) -> AdbStatus {
    let adb = state.adb.lock().unwrap();
    AdbStatus {
        found: adb.is_available(),
        path: adb.path.as_ref().map(|p| p.to_string_lossy().to_string()),
        version: adb.version(),
    }
}

/// Rafraîchit la liste des appareils (scan ADB réel + propriétés).
#[tauri::command]
fn refresh_devices(state: State<AppState>) -> Result<Vec<Device>, String> {
    let adb = state.adb.lock().unwrap();
    let mut cache = state.devices.lock().unwrap();
    let res = simulo_desktop_core::scan_devices(&adb, &mut cache, AppState::now())
        .map_err(|e| e.user_message())?;
    Ok(res.devices)
}

/// Connecte un appareil (usb / wireless / qr) — orchestration réelle.
///
/// `serial` : le serial USB listé par l'UI (vide en wireless/qr, où
/// l'adresse vient de ip/port). `mode` : "usb" | "wireless" | "qr".
#[tauri::command]
fn connect_device_cmd(
    app: AppHandle,
    state: State<AppState>,
    serial: String,
    mode: String,
    ip: Option<String>,
    port: Option<u16>,
    pair_code: Option<String>,
) -> Result<Device, String> {
    let params = ConnectParams {
        mode: mode.clone(),
        usb_serial: if mode == "usb" { Some(serial) } else { None },
        ip,
        port,
        pair_code,
    };

    let mut adb = state.adb.lock().unwrap();
    let mut cache = state.devices.lock().unwrap();
    let dev = connect_device(&adb, &mut cache, AppState::now(), &params)
        .map_err(|e| e.user_message())?;
    drop(cache);
    drop(adb);

    state.log(&format!("connected: {}", dev.display_name()));

    // Machine à états de la session (traçabilité dans Diagnostics).
    {
        let mut sessions = state.sessions.lock().unwrap();
        let s = sessions.entry(dev.serial.clone()).or_insert_with(|| Session::new(&dev.serial));
        s.tick(AppState::now());
        s.apply(&simulo_core::ConnectEvent::DeviceDetected);
        s.apply(&simulo_core::ConnectEvent::Authorized);
    }
    let _ = app.emit("simulo://device-connected", &dev.serial);
    Ok(dev)
}

/// Pilote le mirroring (scrcpy officiel).
#[tauri::command]
fn start_mirror_cmd(
    app: AppHandle,
    state: State<AppState>,
    serial: String,
    max_size: u32,
    bit_rate: String,
    max_fps: u32,
    record: Option<String>,
    audio: bool,
) -> Result<String, String> {
    let cache = state.devices.lock().unwrap();
    let name = cache
        .get(&serial)
        .map(|d| d.display_name())
        .unwrap_or_else(|| serial.clone());
    let opts = MirrorOptions {
        max_size,
        bit_rate,
        max_fps,
        record_to: record.map(|r| {
            let mut p = std::env::temp_dir();
            p.push(format!("{r}.mp4"));
            p
        }),
        audio,
        window_title: format!("SIMULO — {name}"),
    };
    drop(cache);

    let mut scrcpy = state.scrcpy.lock().unwrap();
    let cache = state.devices.lock().unwrap();
    let msg = start_mirror(&mut scrcpy, &cache, &serial, opts).map_err(|e| e.user_message())?;
    drop(cache);

    {
        let mut sessions = state.sessions.lock().unwrap();
        let s = sessions.entry(serial.clone()).or_insert_with(|| Session::new(&serial));
        s.apply(&simulo_core::ConnectEvent::StreamReady);
    }
    let _ = app.emit("simulo://mirror-started", &serial);
    state.log(&msg);
    Ok(msg)
}

/// Arrête le mirroring.
#[tauri::command]
fn stop_mirror_cmd(state: State<AppState>) -> Result<String, String> {
    let mut scrcpy = state.scrcpy.lock().unwrap();
    let msg = stop_mirror(&mut scrcpy).map_err(|e| e.user_message())?;
    {
        let mut sessions = state.sessions.lock().unwrap();
        for s in sessions.values_mut() {
            s.apply(&simulo_core::ConnectEvent::UserStop);
        }
    }
    state.log("mirror stopped");
    Ok(msg)
}

/// Envoie du texte au téléphone (réel : input text).
#[tauri::command]
fn send_text_cmd(state: State<AppState>, serial: String, text: String) -> Result<String, String> {
    let adb = state.adb.lock().unwrap();
    send_text(&adb, &serial, &text).map_err(|e| e.user_message())
}

/// Envoie une touche système (réel : keyevent).
#[tauri::command]
fn send_key_cmd(state: State<AppState>, serial: String, key: String) -> Result<String, String> {
    let adb = state.adb.lock().unwrap();
    send_key(&adb, &serial, &key).map_err(|e| e.user_message())
}

/// Crée une session QR temporaire (5 min, un usage, zéro secret).
#[tauri::command]
fn new_qr_session() -> QrSession {
    let mut rng = rand::thread_rng();
    let token: String = (0..16)
        .map(|_| format!("{:x}", rng.gen_range(0..16u8)))
        .collect();
    let sid: String = (0..8)
        .map(|_| format!("{:x}", rng.gen_range(0..16u8)))
        .collect();
    QrSession::new(&sid, &token, AppState::now())
}

/// Diagnostics complets (le "médecin").
#[tauri::command]
fn run_diagnostics(state: State<AppState>) -> Vec<Check> {
    let adb = state.adb.lock().unwrap();
    let scrcpy = state.scrcpy.lock().unwrap();
    let checks = run_checks(&adb, &scrcpy);
    for c in &checks {
        if !c.ok {
            state.log(&format!("diagnostic FAIL: {}", c.name));
        }
    }
    checks
}

/// Journal SIMULO (Diagnostics > Logs).
#[tauri::command]
fn get_logs(state: State<AppState>) -> Vec<String> {
    state.logs.lock().unwrap().clone()
}


