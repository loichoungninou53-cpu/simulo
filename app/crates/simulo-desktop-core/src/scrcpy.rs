use std::path::{Path, PathBuf};
use std::process::{Child, Command};

use crate::error::SimuloError;

/// Options de mirroring (exposées dans Settings).
#[derive(Debug, Clone)]
pub struct MirrorOptions {
    pub max_size: u32,
    pub bit_rate: String,
    pub max_fps: u32,
    /// Chemin de fichier vidéo (mp4) si enregistrement demandé.
    pub record_to: Option<PathBuf>,
    /// Audio (Android 10+, scrcpy 2.3+).
    pub audio: bool,
    pub window_title: String,
}

impl Default for MirrorOptions {
    fn default() -> Self {
        Self {
            max_size: 1280,
            bit_rate: "8M".into(),
            max_fps: 60,
            record_to: None,
            audio: false,
            window_title: "SIMULO".into(),
        }
    }
}

/// Scrcpy Manager (section 4 du cahier des charges).
///
/// SIMULO **orchestre** le binaire officiel scrcpy :
/// - on ne réécrit jamais le moteur,
/// - on ne télécharge jamais scrcpy depuis des sites inconnus :
///   l'utilisateur installe scrcpy officiellement (GitHub Genymobile),
///   SIMULO le détecte et l'orchestre.
pub struct ScrcpyManager {
    pub path: Option<PathBuf>,
    child: Option<Child>,
}

impl ScrcpyManager {
    /// Détecte scrcpy (PATH + emplacements classiques).
    pub fn detect() -> Self {
        let mut v = Vec::new();
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            let p = PathBuf::from(&local);
            v.push(p.join("scrcpy/scrcpy.exe"));
            v.push(p.join("Microsoft/WinGet/Links/scrcpy.exe"));
        }
        if let Ok(home) = std::env::var("USERPROFILE") {
            v.push(PathBuf::from(home).join("scrcpy/scrcpy.exe"));
        }
        if let Ok(home) = std::env::var("HOME") {
            let h = PathBuf::from(&home);
            v.push(h.join("bin/scrcpy"));
            v.push(h.join("scrcpy/scrcpy"));
        }
        for c in &v {
            if c.is_file() {
                return Self { path: Some(c.clone()), child: None };
            }
        }
        // Sinon : scrcpy nu dans le PATH.
        Self { path: which_scrcpy(), child: None }
    }

    pub fn is_available(&self) -> bool {
        self.path.is_some()
    }

    /// Version de scrcpy, ex. "2.7".
    pub fn version(&self) -> Option<String> {
        let out = self.run(&["--version"]).ok()?;
        out.lines().next()?.trim().to_string().into()
    }

    pub fn is_running(&self) -> bool {
        self.child.is_some()
    }

    /// Démarre le mirroring pour le serial donné.
    ///
    /// scrcpy ouvre sa propre fenêtre (c'est le comportement officiel :
    /// la vidéo y est affichée avec la latence minimale). SIMULO suit
    /// le processus (sortie, crash) et le relance/arrête à la demande.
    pub fn start(&mut self, serial: &str, opts: &MirrorOptions) -> Result<(), SimuloError> {
        if self.child.is_some() {
            return Err(SimuloError::Mirroring(
                "a mirroring session is already running — stop it first".into(),
            ));
        }
        let bin = self
            .path
            .clone()
            .unwrap_or_else(|| PathBuf::from(if cfg!(windows) { "scrcpy.exe" } else { "scrcpy" }));

        let mut args: Vec<String> = vec![
            "-s".into(),
            serial.to_string(),
            "--max-size".into(),
            opts.max_size.to_string(),
            "--bit-rate".into(),
            opts.bit_rate.clone(),
            "--max-fps".into(),
            opts.max_fps.to_string(),
            "--window-title".into(),
            opts.window_title.clone(),
        ];
        if let Some(rec) = &opts.record_to {
            args.push("--record".into());
            args.push(rec.to_string_lossy().to_string());
        }
        if opts.audio {
            args.push("--audio-source".into());
            args.push("output".into());
        }
        let refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();

        let child = Command::new(bin)
            .args(&refs)
            .spawn()
            .map_err(|e| {
                SimuloError::Mirroring(format!(
                    "could not start scrcpy ({e}). Is scrcpy installed? Check Diagnostics."
                ))
            })?;

        self.child = Some(child);
        Ok(())
    }

    /// Arrêt propre (Ctrl+C sémantique : kill du processus scrcpy).
    pub fn stop(&mut self) -> Result<(), SimuloError> {
        match self.child.take() {
            Some(mut c) => {
                c.kill()
                    .map_err(|e| SimuloError::Mirroring(format!("could not stop scrcpy: {e}")))?;
                c.wait()
                    .map_err(|e| SimuloError::Mirroring(format!("scrcpy did not exit: {e}")))?;
                Ok(())
            }
            None => Ok(()),
        }
    }

    fn run(&self, args: &[&str]) -> Result<String, SimuloError> {
        let bin = self
            .path
            .as_ref()
            .map(PathBuf::as_path)
            .unwrap_or(Path::new(if cfg!(windows) { "scrcpy.exe" } else { "scrcpy" }));
        let out = Command::new(bin)
            .args(args)
            .output()
            .map_err(|_| SimuloError::ScrcpyMissing)?;
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if out.status.success() {
            Ok(text)
        } else {
            Err(SimuloError::Mirroring("scrcpy did not answer".into()))
        }
    }
}

fn which_scrcpy() -> Option<PathBuf> {
    let probe = if cfg!(windows) { "scrcpy.exe" } else { "scrcpy" };
    match Command::new(probe).arg("--version").output() {
        Ok(o) if o.status.success() => Some(PathBuf::from(probe)),
        _ => None,
    }
}

impl Drop for ScrcpyManager {
    fn drop(&mut self) {
        // Au crash de SIMULO, scrcpy ne doit pas survivre.
        let _ = self.stop();
    }
}
