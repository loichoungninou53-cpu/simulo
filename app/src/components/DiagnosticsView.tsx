import { useEffect, useState } from "react";
import { Check, Crosshair, Loader2, ScrollText, X } from "lucide-react";
import type { DiagCheck } from "../lib/types";
import { getLogs, runDiagnostics } from "../lib/tauri";

/** Diagnostics — vue plein écran (mêmes appels Rust que l'ancien panneau). */
export default function DiagnosticsView() {
  const [checks, setChecks] = useState<DiagCheck[] | null>(null);
  const [logs, setLogs] = useState<string[] | null>(null);

  useEffect(() => {
    void runDiagnostics().then(setChecks);
    void getLogs().then(setLogs);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="flex items-center gap-2.5 text-3xl font-bold text-white">
        <Crosshair size={26} className="text-sky-300" /> Diagnostics
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Chaque vérification est réelle ; chaque échec propose un conseil en clair.
      </p>

      {checks === null ? (
        <div className="mt-10 flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          Vérifications en cours…
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-2.5">
            {checks.map((c) => (
              <li
                key={c.name}
                className={`rounded-xl border p-4 ${
                  c.ok
                    ? "border-green-400/25 bg-green-950/20"
                    : "border-amber-400/30 bg-amber-950/20"
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  {c.ok ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <X size={16} className="text-amber-400" />
                  )}
                  <span className={c.ok ? "text-green-200" : "text-amber-200"}>{c.name}</span>
                </div>
                {!c.ok && c.advice && (
                  <p className="mt-2 pl-7 text-xs leading-relaxed text-slate-300">{c.advice}</p>
                )}
              </li>
            ))}
          </ul>

          {logs && logs.length > 0 && (
            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <ScrollText size={15} /> Activité récente
              </h3>
              <pre className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-sky-400/15 bg-slate-950/60 p-3 text-[11px] leading-relaxed text-slate-400">
                {logs.slice(-40).join("\n")}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
