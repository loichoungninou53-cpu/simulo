import { Apple, Check, Info, Minus, Smartphone } from "lucide-react";
import Reveal from "./Reveal";

export default function Devices() {
  return (
    <section id="devices" className="section">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Appareils</p>
          <h2 className="h2 mt-2 max-w-3xl">
            Une compatibilité honnête. Zéro « ça marche par magie ».
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {/* Android */}
          <Reveal>
            <div className="card h-full p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-400/15 text-green-300">
                    <Smartphone size={21} />
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Android</h3>
                </div>
                <span className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-300">
                  Prise en charge complète
                </span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
                {[
                  "Mirroring d'écran en temps réel (scrcpy)",
                  "Contrôle souris, clavier et tactile",
                  "USB, débogage sans fil et appairage QR",
                  "Audio, presse-papiers et enregistrement quand supportés",
                  "Testé en premier sur TECNO POP 10 · Android 15",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-green-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* iPhone */}
          <Reveal delay={110}>
            <div className="card h-full p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white">
                    <Apple size={21} />
                  </span>
                  <h3 className="text-xl font-extrabold text-white">iPhone</h3>
                </div>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-300">
                  Prise en charge limitée
                </span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-green-400" />
                  Détection, infos appareil et diagnostics
                </li>
                <li className="flex items-start gap-2.5">
                  <Minus size={16} className="mt-0.5 shrink-0 text-amber-400" />
                  Le mirroring d'écran est restreint par Apple sur iOS standard
                </li>
                <li className="flex items-start gap-2.5">
                  <Minus size={16} className="mt-0.5 shrink-0 text-amber-400" />
                  Le contrôle complet nécessite les outils de l'écosystème Apple
                </li>
              </ul>
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border-[var(--accent-30)] bg-[var(--accent-10)] p-3.5 text-xs leading-relaxed text-neutral-300">
                <Info size={15} className="mt-0.5 shrink-0 text-[var(--accent-soft)]" />
                <span>
                  Simulo ne feint jamais une capacité. Ton iPhone affichera
                  exactement ce qu'il peut faire sur ta version d'iOS — le reste
                  est documenté.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
