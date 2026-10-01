//! # simulo-desktop-core
//!
//! Orchestration desktop de SIMULO, **indépendante de Tauri** :
//! - [`adb`]      : AdbManager (détecter adb, lister, connecter, pairer, getprop)
//! - [`scrcpy`]   : ScrcpyManager (détecter le moteur officiel, le piloter)
//! - [`diag`]     : les vérifications du "médecin" SIMULO
//! - [`error`]    : les erreurs SIMULO en langage clair
//!
//! Séparer cette couche de Tauri permet de la compiler et de la tester
//! sur n'importe quelle machine (même sans Windows), et de la réutiliser
//! à l'avenir (CLI, service, etc.).

pub mod adb;
pub mod connect;
pub mod devices;
pub mod mirror;
pub mod diag;
pub mod error;
pub mod scrcpy;

pub use adb::AdbManager;
pub use connect::{connect_device, ConnectParams};
pub use devices::{scan_devices, ScanResult};
pub use diag::{run_checks, Check};
pub use mirror::{escape_input_text, send_key, send_text, start_mirror, stop_mirror};
pub use error::SimuloError;
pub use scrcpy::{MirrorOptions, ScrcpyManager};
