//! # simulo-core
//!
//! Cœur logique de SIMULO, écrit pour être :
//! - **testable sans Windows** (aucune dépendance système, aucun process),
//! - **sécable** : chaque sous-module est indépendant,
//! - **honnête** : les capacités sont calculées, jamais supposées.
//!
//! Modules :
//! - [`device`]   : modèle d'appareil (`Device`) + statuts
//! - [`adb`]      : parsing de la sortie `adb devices` (le vrai format)
//! - [`caps`]     : détection des capacités réelles (Android / iPhone)
//! - [`session`]  : machine à états du cycle de connexion
//! - [`qr`]       : sessions QR temporaires (jamais de token permanent)

pub mod adb;
pub mod caps;
pub mod device;
pub mod qr;
pub mod session;

pub use adb::{AdbDevice, AdbState, parse_devices_output};
pub use caps::{Capability, android_capabilities, ios_capabilities};
pub use device::{ConnectionStatus, ConnectionType, Device, Platform};
pub use qr::QrSession;
pub use session::{ConnectEvent, ConnectPhase, Session};
