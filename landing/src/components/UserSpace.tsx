import { useState } from "react";
import {
  Battery,
  History,
  MonitorSmartphone,
  ScrollText,
  Settings2,
  Smartphone,
  Zap,
} from "lucide-react";
import Reveal from "./Reveal";

type Tab = "devices" | "sessions" | "settings" | "logs";

const tabs: { id: Tab; label: string; icon: typeof Smartphone }[] = [
  { id: "devices", label: "Appareils", icon: Smartphone },
  { id: "sessions", label: "Sessions", icon: History },
  { id: "settings", label: "Réglages", icon: Settings2 },
  { id: "logs", label: "Journaux", icon: ScrollText },
];

/**
 * "Espace Simulo" — aperçu interactif du dashboard de l'app de bureau.
 * Étiqueté en tant qu'aperçu : ce qui est montré existe dans l'app réelle
 * (règle : jamais de fonctionnalité feinte).
 */
export default function UserSpace() {
  const [tab, setTab] = useState<Tab>("devices");
  const [mirroring, setMirroring] = useState(true);
  const [audio, setAudio] = useState(true);
  const [record, setRecord] = useState(false);
  const [clipboard, setClipboard] = useState(true);

  return (
    <section id="espace" className="section">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Espace Simulo</p>
          <h2 className="h2 mt-2 max-w-3xl">
            Ton bureau devient le command center de ton téléphone.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-neutral-400">
            Un aperçu interactif de l'app : clique sur les onglets, démarre ou
            arrête le mirroring, active les options. Tout est réel dans l'app
            de bureau — ici, tu peux essayer.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
            {/* barre de fenêtre */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="win-dots">
                  <i /><i /><i />
                </div>
                <span className="hidden text-xs font-semibold text-neutral-400 sm:block">
                  Simulo — Espace de travail
                </span>
              </div>
              <span className="rounded-full bg-[var(--accent-15)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
                Aperçu interactif
              </span>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* barre latérale (desktop) / onglets horizontaux (mobile) */}
              <nav
                className="flex gap-1.5 overflow-x-auto border-b border-white/10 p-2 md:w-52 md:flex-col md:border-b-0 md:border-r md:p-3"
                aria-label="Navigation de l'espace Simulo"
              >
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`side-item ${tab === t.id ? "active" : ""}`}
                    aria-current={tab === t.id ? "page" : undefined}
                  >
                    <t.icon size={16} />
                    {t.label}
                  </button>
                ))}
              </nav>

              {/* contenu */}
              <div className="min-h-[320px] flex-1 p-4 sm:p-6">
                {tab === "devices" && (
                  <DevicesTab
                    mirroring={mirroring}
                    onToggleMirror={() => setMirroring((v) => !v)}
                  />
                )}
                {tab === "sessions" && <SessionsTab />}
                {tab === "settings" && (
                  <SettingsTab
                    audio={audio}
                    record={record}
                    clipboard={clipboard}
                    onAudio={() => setAudio((v) => !v)}
                    onRecord={() => setRecord((v) => !v)}
                    onClipboard={() => setClipboard((v) => !v)}
                  />
                )}
                {tab === "logs" && <LogsTab />}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-4 text-xs text-neutral-600">
            Chaque brique de cet aperçu existe dans l'app de bureau, validée
            sur TECNO POP 10 (Android 15).
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= onglet Appareils ================= */
function DevicesTab({
  mirroring,
  onToggleMirror,
}: {
  mirroring: boolean;
  onToggleMirror: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* appareil principal */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent-15)] text-[var(--accent-soft)]">
              <Smartphone size={18} />
            </span>
            <div>
              <p className="font-bold text-white">TECNO POP 10</p>
              <p className="text-xs text-neutral-500">Android 15 · USB · 1080×2400</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${
              mirroring
                ? "bg-green-400/10 text-green-300"
                : "bg-white/5 text-neutral-400"
            }`}
          >
            {mirroring ? (
              <>
                <span className="pulse-dot" style={{ width: 7, height: 7 }} />
                Mirroring actif
              </>
            ) : (
              <>Connecté</>
            )}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <Battery size={14} className="text-[var(--accent-soft)]" /> 87%
          </span>
          <span>Latence 12 ms</span>
          <span>Bitrate 8 Mbit/s</span>
          <span>FPS 30</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={onToggleMirror}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              mirroring
                ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : "bg-white text-black hover:scale-105"
            }`}
          >
            {mirroring ? "◼ Arrêter le mirroring" : "▶ Démarrer le mirroring"}
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10">
            <Zap size={13} className="text-[var(--accent-soft)]" />
            Reconnecter
          </button>
        </div>
      </div>

      {/* appareil secondaire (honnêteté iPhone) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-neutral-400">
            <MonitorSmartphone size={18} />
          </span>
          <div>
            <p className="font-bold text-neutral-300">iPhone 13</p>
            <p className="text-xs text-neutral-600">iOS 18 · Wi-Fi</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-300">
          Détection &amp; diagnostics uniquement
        </span>
      </div>
    </div>
  );
}

/* ================= onglet Sessions ================= */
const sessions = [
  { when: "Aujourd'hui · 14:32", mode: "USB", dur: "42 min", size: "1,2 Go" },
  { when: "Hier · 19:05", mode: "Wi-Fi", dur: "1 h 18 min", size: "3,4 Go" },
  { when: "Lundi · 09:12", mode: "QR", dur: "23 min", size: "— " },
  { when: "Dimanche · 21:40", mode: "USB", dur: "1 h 02 min", size: "2,8 Go" },
];

function SessionsTab() {
  return (
    <div className="space-y-2.5">
      {sessions.map((s) => (
        <div
          key={s.when}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[var(--accent-15)] px-2 py-1 text-[10px] font-bold text-[var(--accent-soft)]">
              {s.mode}
            </span>
            <span className="text-sm font-semibold text-neutral-200">{s.when}</span>
          </div>
          <div className="flex gap-4 text-xs text-neutral-500">
            <span>{s.dur}</span>
            <span className="w-16 text-right">Vidéo {s.size}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= onglet Réglages ================= */
function SettingsTab({
  audio,
  record,
  clipboard,
  onAudio,
  onRecord,
  onClipboard,
}: {
  audio: boolean;
  record: boolean;
  clipboard: boolean;
  onAudio: () => void;
  onRecord: () => void;
  onClipboard: () => void;
}) {
  const rows = [
    { label: "Qualité vidéo", value: "1080p (max)" },
    { label: "Bitrate", value: "8 Mbit/s" },
    { label: "Images par seconde", value: "30 fps" },
  ];
  const switches: { label: string; hint: string; on: boolean; toggle: () => void }[] = [
    { label: "Audio", hint: "Quand le téléphone le permet", on: audio, toggle: onAudio },
    { label: "Enregistrer la session", hint: "Vidéo dans ton dossier Vidéos", on: record, toggle: onRecord },
    { label: "Copier-coller bidirectionnel", hint: "PC ↔ téléphone", on: clipboard, toggle: onClipboard },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Qualité
        </p>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-neutral-300">{r.label}</span>
            <span className="font-semibold text-white">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Options
        </p>
        {switches.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-4 py-2.5">
            <div>
              <p className="text-sm font-semibold text-neutral-200">{s.label}</p>
              <p className="text-xs text-neutral-600">{s.hint}</p>
            </div>
            <button
              className={`sw ${s.on ? "on" : ""}`}
              onClick={s.toggle}
              role="switch"
              aria-checked={s.on}
              aria-label={s.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= onglet Journaux ================= */
const logLines: { t: string; level: "ok" | "info" | "warn"; msg: string }[] = [
  { t: "14:32:01", level: "info", msg: "ADB 1.0.41 détecté (fournisseur officiel)" },
  { t: "14:32:02", level: "ok", msg: "Appareil : TECNO POP 10 — Android 15, USB" },
  { t: "14:32:03", level: "ok", msg: "Autorisation USB acceptée — session établie" },
  { t: "14:32:05", level: "info", msg: "scrcpy démarré (1080p · 8 Mbit/s · 30 fps)" },
  { t: "14:33:11", level: "warn", msg: "Batterie 87% — seuil d'alerte : 20%" },
  { t: "14:37:40", level: "info", msg: "Notification Android transmise au bureau" },
];

function LogsTab() {
  return (
    <div className="mono space-y-1.5 rounded-xl border border-white/10 bg-black/50 p-4 text-xs leading-relaxed">
      {logLines.map((l, i) => (
        <p key={i} className="text-neutral-500">
          <span className="text-neutral-600">[{l.t}]</span>{" "}
          <span
            className={
              l.level === "ok"
                ? "text-green-400"
                : l.level === "warn"
                  ? "text-amber-400"
                  : "text-neutral-300"
            }
          >
            {l.msg}
          </span>
        </p>
      ))}
    </div>
  );
}
