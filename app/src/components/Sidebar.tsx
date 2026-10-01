import {
  Home,
  Smartphone,
  Cable,
  MonitorSmartphone,
  Stethoscope,
  Settings2,
} from "lucide-react";
import type { AdbStatus } from "../lib/types";
import { NAV, type View } from "../lib/nav";

const ICONS: Record<View, typeof Home> = {
  home: Home,
  devices: Smartphone,
  connect: Cable,
  mirror: MonitorSmartphone,
  diagnostics: Stethoscope,
  settings: Settings2,
};

type Props = {
  view: View;
  onNavigate: (v: View) => void;
  adb: AdbStatus | null;
  onDiagnostics: () => void;
  mirroring: boolean;
};

/**
 * Barre latérale minimale (esprit produit) : navigation + vrai état d'ADB.
 * Aucune stat inutile — juste ce qui sert.
 */
export default function Sidebar({ view, onNavigate, adb, onDiagnostics, mirroring }: Props) {
  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-sky-400/10 bg-[#050b1a] md:w-60">
      {/* logo */}
      <div className="flex items-center gap-2.5 border-b border-sky-400/10 px-3 py-4 md:px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg shadow-blue-950/50">
          <Smartphone size={18} className="text-slate-950" strokeWidth={2.4} />
        </span>
        <div className="hidden md:block">
          <div className="text-sm font-bold tracking-wide text-white">SIMULO</div>
          <div className="text-[10px] text-slate-500">Connecte. Voit. Contrôle.</div>
        </div>
      </div>

      {/* navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3 md:px-3">
        {NAV.map((item) => {
          const Icon = ICONS[item.id];
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
              {item.id === "mirror" && mirroring && (
                <span className="ml-auto hidden md:inline">
                  <span className="pulse-dot" style={{ width: 7, height: 7 }} />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* pied : état ADB + version */}
      <div className="space-y-2 border-t border-sky-400/10 p-3">
        {adb === null ? (
          <div className="hidden text-[11px] text-slate-500 md:block">Vérification d'ADB…</div>
        ) : adb.found ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-400/10 px-3 py-2 text-[11px] font-semibold text-green-300">
            <span className="pulse-dot" style={{ width: 7, height: 7 }} />
            <span className="hidden md:inline">ADB {adb.version ?? "prêt"}</span>
          </div>
        ) : (
          <button
            onClick={onDiagnostics}
            className="flex w-full items-center gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-left text-[11px] font-semibold text-red-300 hover:bg-red-400/20"
          >
            <Stethoscope size={13} className="shrink-0" />
            <span className="hidden md:inline">ADB introuvable</span>
          </button>
        )}
        <div className="hidden text-[10px] text-slate-600 md:block">Simulo 0.1.0 · local only</div>
      </div>
    </aside>
  );
}
