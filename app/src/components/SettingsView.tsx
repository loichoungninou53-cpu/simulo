import { useEffect, useState } from "react";
import { AlertTriangle, Maximize2, Minimize2, Pin, RotateCcw } from "lucide-react";
import { DEFAULTS, getPrefs, savePrefs, type Prefs, type Quality } from "../lib/prefs";
import * as win from "../lib/window";

/**
 * Paramètres.
 * - Session (qualité, bitrate, FPS, audio) : appliqués à la CONNEXION.
 * - Connexion : méthode par défaut.
 * - Fenêtre : appliqués en DIRECT (API Tauri, erreurs remontées en clair).
 */
export default function SettingsView() {
  const [p, setP] = useState<Prefs>(() => getPrefs());
  const [aot, setAot] = useState(false);
  const [full, setFull] = useState(false);
  const [mini, setMini] = useState(false);
  const [winErr, setWinErr] = useState<string | null>(null);

  useEffect(() => {
    win.isAlwaysOnTop().then(setAot).catch((e) => setWinErr(String(e)));
    win.isFullscreen().then(setFull).catch((e) => setWinErr(String(e)));
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...p, ...patch };
    setP(next);
    savePrefs(next);
  };

  const tglAot = async () => {
    const next = !aot;
    try {
      await win.setAlwaysOnTop(next);
      setAot(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };
  const tglFull = async () => {
    const next = !full;
    try {
      await win.setFullscreen(next);
      setFull(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };
  const tglMini = async () => {
    const next = !mini;
    try {
      await win.setMiniView(next);
      setMini(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Paramètres</h1>
      <p className="mt-1 text-sm text-slate-400">
        Les réglages de session s'appliquent à la prochaine connexion.
      </p>

      {/* Session */}
      <section className="card mt-8 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Session</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Qualité</span>
            <select
              className="input mt-1.5"
              value={p.maxSize}
              onChange={(e) => update({ maxSize: e.target.value as Quality })}
            >
              <option value="720">720p (léger)</option>
              <option value="1080">1080p (recommandé)</option>
              <option value="1280">1280p (max)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Bitrate</span>
            <select
              className="input mt-1.5"
              value={p.bitRate}
              onChange={(e) => update({ bitRate: e.target.value as Prefs["bitRate"] })}
            >
              <option value="4M">4 Mbit/s</option>
              <option value="8M">8 Mbit/s</option>
              <option value="12M">12 Mbit/s</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Images / s</span>
            <select
              className="input mt-1.5"
              value={String(p.maxFps)}
              onChange={(e) => update({ maxFps: Number(e.target.value) as Prefs["maxFps"] })}
            >
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex cursor-pointer items-center justify-between">
          <span>
            <span className="block text-sm font-semibold text-white">Audio</span>
            <span className="text-xs text-slate-400">Activé à la connexion si l'appareil le permet.</span>
          </span>
          <Toggle on={p.audio} onClick={() => update({ audio: !p.audio })} label="Audio" />
        </label>
      </section>

      {/* Connexion */}
      <section className="card mt-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Connexion</h2>
        <label className="mt-4 block">
          <span className="text-xs font-semibold text-slate-400">Méthode par défaut</span>
          <select
            className="input mt-1.5"
            value={p.defaultMode}
            onChange={(e) => update({ defaultMode: e.target.value as Prefs["defaultMode"] })}
          >
            <option value="usb">USB</option>
            <option value="wireless">Sans fil</option>
            <option value="qr">QR Code</option>
          </select>
        </label>
      </section>

      {/* Fenêtre */}
      <section className="card mt-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Fenêtre</h2>
        <div className="mt-4 space-y-4">
          <ToggleRow icon={Pin} label="Always-on-top" hint="Simulo reste au-dessus des autres fenêtres." on={aot} onToggle={() => void tglAot()} />
          <ToggleRow icon={Maximize2} label="Plein écran" hint="Plein écran / fenêtre normale." on={full} onToggle={() => void tglFull()} />
          <ToggleRow icon={Minimize2} label="Mini view" hint="Petite colonne posée au coin de l'écran." on={mini} onToggle={() => void tglMini()} />
        </div>
      </section>

      {winErr && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4 text-sm text-amber-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Fenêtre : {winErr}
        </div>
      )}

      <button
        className="btn-ghost mt-6"
        onClick={() => {
          setP(DEFAULTS);
          savePrefs(DEFAULTS);
        }}
      >
        <RotateCcw size={14} />
        Réinitialiser
      </button>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "#38bdf8" : "rgba(255,255,255,0.16)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  hint,
  on,
  onToggle,
}: {
  icon: typeof Pin;
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <Icon size={16} className="mt-0.5 shrink-0 text-sky-300" />
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-[11px] leading-snug text-slate-400">{hint}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={on}
        className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors"
        style={
          on
            ? { background: "#38bdf8", color: "#020617" }
            : { border: "1px solid rgba(125,180,255,0.35)", color: "#cfe6ff" }
        }
      >
        {on ? "Activé" : "Activer"}
      </button>
    </div>
  );
}
