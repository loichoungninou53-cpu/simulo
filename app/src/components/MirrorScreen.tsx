import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Keyboard,
  Loader2,
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  Pin,
  Square,
  Stethoscope,
  TextCursorInput,
  Wifi,
} from "lucide-react";
import type { Capability, Device } from "../lib/types";
import { sendKey, sendText, stopMirror } from "../lib/tauri";
import { getPrefs } from "../lib/prefs";
import * as win from "../lib/window";

type Props = {
  device: Device;
  onBack: () => void;
  onDiagnostics: () => void;
};

const CAP: Record<Capability, string> = {
  screen_mirroring: "Mirroring d'écran",
  mouse_keyboard: "Souris & clavier",
  clipboard: "Presse-papiers",
  audio: "Audio",
  recording: "Enregistrement",
  wireless_debug: "Débogage sans fil",
  qr_pairing: "Appairage QR",
  diagnostics: "Diagnostics",
};

/**
 * Mirroring — panneau de contrôle de la session active.
 *
 * HONNÊTETÉ TECHNIQUE : la vidéo s'affiche dans la FENÊTRE scrcpy (moteur
 * officiel, latence minimale). Ici : texte, touches système, contrôles de
 * fenêtre (réels) et la CONFIG de session (valeurs demandées, pas de
 * métriques live inventées). Chaque bouton est relié à une vraie commande.
 */
export default function MirrorScreen({ device, onBack, onDiagnostics }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [aot, setAot] = useState(false);
  const [mini, setMini] = useState(false);
  const [full, setFull] = useState(false);
  const [adv, setAdv] = useState(false);
  const [winErr, setWinErr] = useState<string | null>(null);

  const prefs = useMemo(() => getPrefs(), []);

  useEffect(() => {
    win.isAlwaysOnTop().then(setAot).catch((e) => setWinErr(String(e)));
    win.isFullscreen().then(setFull).catch((e) => setWinErr(String(e)));
  }, []);

  const name =
    [device.manufacturer, device.model].filter(Boolean).join(" ") ||
    `Appareil ${device.serial.slice(0, 6)}`;

  const run = async (label: string, fn: () => Promise<string>): Promise<string | null> => {
    setBusy(label);
    setErr(null);
    setMsg(null);
    try {
      const m = await fn();
      setMsg(m);
      return m;
    } catch (e) {
      setErr(String(e));
      return null;
    } finally {
      setBusy(null);
    }
  };

  const toggleAot = async () => {
    const next = !aot;
    try {
      await win.setAlwaysOnTop(next);
      setAot(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };
  const toggleFull = async () => {
    const next = !full;
    try {
      await win.setFullscreen(next);
      setFull(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };
  const toggleMini = async () => {
    const next = !mini;
    try {
      await win.setMiniView(next);
      setMini(next);
      setWinErr(null);
    } catch (e) {
      setWinErr(String(e));
    }
  };

  const caps = device.capabilities;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* Statut connecté */}
      <div className="card beams relative overflow-hidden p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700">
              <MonitorSmartphone size={26} className="text-slate-950" strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="pulse-dot" />
                <h1 className="text-2xl font-bold text-white">Connecté</h1>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                <b className="text-white">{name}</b>
                {device.osVersion ? ` · ${device.osVersion}` : ""} ·{" "}
                {device.connectionType === "usb" ? (
                  <span className="inline-flex items-center gap-1"><Check size={13} className="text-green-400" /> USB</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><Wifi size={13} className="text-sky-300" /> Wi-Fi</span>
                )}
              </p>
            </div>
          </div>
          <button className="btn-danger" onClick={() => void run("stop", stopMirror).then(() => onBack())} disabled={busy === "stop"}>
            {busy === "stop" ? <Loader2 size={15} className="animate-spin" /> : <Square size={15} />}
            Arrêter le mirroring
          </button>
        </div>
        <p className="relative z-10 mt-5 max-w-2xl rounded-xl border border-sky-400/25 bg-slate-950/50 p-4 text-sm text-slate-300">
          L'écran de ton téléphone s'affiche dans la <b className="text-white">fenêtre scrcpy</b>{" "}
          (moteur officiel — c'est là que tu le vois et le contrôles à la souris). Ce
          panneau gère le texte, les touches et la fenêtre.
        </p>
      </div>

      {/* Capabilités réelles de cet appareil */}
      <div className="mt-6 flex flex-wrap gap-2">
        {caps.map((c) => (
          <span key={c} className="rounded-full border border-sky-400/25 bg-sky-400/5 px-3.5 py-1.5 text-xs font-semibold text-sky-200">
            {CAP[c] ?? c}
          </span>
        ))}
      </div>

      {/* Session (avancé) — valeurs CONFIGURÉES, pas de métriques live inventées */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/15 bg-slate-950/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Session</span>
          {adv && (
            <>
              <span>{prefs.maxSize}p</span>
              <span>{prefs.bitRate}</span>
              <span>{prefs.maxFps} fps</span>
              <span className="text-slate-600">· configurées, appliquées à la connexion</span>
            </>
          )}
        </div>
        <button onClick={() => setAdv((v) => !v)} className="text-xs font-semibold text-sky-300 hover:text-sky-200">
          {adv ? "Masquer le détail" : "Avancé"}
        </button>
      </div>

      {(msg || err) && (
        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            err
              ? "border-red-400/40 bg-red-950/40 text-red-200"
              : "border-green-400/30 bg-green-950/30 text-green-300"
          }`}
        >
          {err ?? msg}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Envoi de texte (réel : input text) */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <TextCursorInput size={17} className="text-sky-300" /> Envoyer du texte
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Saisi à la position du curseur (vraie entrée ADB).
          </p>
          <input className="input mt-4" placeholder="Tapez un texte à envoyer…" value={text} onChange={(e) => setText(e.target.value)} />
          <button
            className="btn-primary mt-3 w-full"
            disabled={!text.trim() || !!busy}
            onClick={() =>
              void run("text", () => sendText(device.serial, text)).then((m) => {
                if (m) setText("");
              })
            }
          >
            {busy === "text" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Envoyer
          </button>
        </div>

        {/* Touches système (réelles : keyevent) */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Keyboard size={17} className="text-sky-300" /> Touches système
          </h3>
          <p className="mt-1 text-xs text-slate-400">Vrais événements de touche envoyés au téléphone.</p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              ["back", "Retour"],
              ["home", "Accueil"],
              ["power", "Power"],
              ["volume_up", "Vol +"],
              ["volume_down", "Vol −"],
              ["menu", "Menu"],
            ].map(([k, label]) => (
              <button
                key={k}
                className="btn-ghost"
                disabled={!!busy}
                onClick={() => void run(k, () => sendKey(device.serial, k))}
              >
                {busy === k ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Fenêtre (réelle : API Tauri) */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Pin size={17} className="text-sky-300" /> Fenêtre
          </h3>
          <p className="mt-1 text-xs text-slate-400">Garde Simulo où tu veux, sans bloquer ton bureau.</p>
          <div className="mt-4 space-y-4">
            <ToggleRow icon={Pin} label="Always-on-top" hint="Au-dessus des autres fenêtres." on={aot} onToggle={() => void toggleAot()} />
            <ToggleRow icon={Maximize2} label="Plein écran" hint="Plein écran / fenêtre normale." on={full} onToggle={() => void toggleFull()} />
            <ToggleRow icon={Minimize2} label="Mini view" hint="Petite colonne au coin de l'écran." on={mini} onToggle={() => void toggleMini()} />
          </div>
          {winErr && (
            <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-950/30 p-2.5 text-[11px] text-amber-200">
              Fenêtre : {winErr}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={15} />
          Retour aux appareils
        </button>
        <button className="btn-ghost" onClick={onDiagnostics}>
          <Stethoscope size={15} />
          Diagnostics
        </button>
      </div>
    </div>
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
        <Icon size={15} className="mt-0.5 shrink-0 text-sky-300" />
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
