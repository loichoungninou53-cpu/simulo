import { Maximize2, Move, Pin, PanelRight, Minimize2, Grid3x3 } from "lucide-react";
import Reveal from "./Reveal";
import { Phone } from "./mockups";

const modes = [
  {
    icon: Move,
    title: "Redimensionnable",
    text: "Ajuste la taille de la fenêtre à la volée.",
  },
  {
    icon: Pin,
    title: "Always-on-top",
    text: "Simulo reste au-dessus des autres fenêtres.",
  },
  {
    icon: Grid3x3,
    title: "Snap Windows",
    text: "Moitié, quart, plein écran — comme n'importe quelle app.",
  },
  {
    icon: Minimize2,
    title: "Mini view",
    text: "Un petit écran toujours visible à côté de ton travail.",
  },
];

/** Maquette : à gauche le travail, à droite Simulo. */
function SplitMock() {
  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="win-dots">
          <i />
          <i />
          <i />
        </div>
        <span className="text-xs text-neutral-500">Bureau Windows</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* travail */}
        <div className="space-y-3 p-5 sm:border-r sm:border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10">
              <PanelRight size={13} />
            </span>
            Rapport Q3 — Document
          </div>
          <div className="space-y-2">
            <div className="h-2 w-4/5 rounded bg-white/10" />
            <div className="h-2 w-full rounded bg-white/[0.07]" />
            <div className="h-2 w-11/12 rounded bg-white/[0.07]" />
            <div className="h-2 w-2/3 rounded bg-white/[0.07]" />
            <div className="h-2 w-3/4 rounded bg-white/[0.07]" />
          </div>
          <div className="pt-2 text-[11px] text-neutral-600">
            Tu continues à écrire, coder, planifier…
          </div>
        </div>
        {/* Simulo */}
        <div className="flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">
              SIMULO
            </span>
            <span className="pill pill--ok">
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              TECNO POP 10
            </span>
          </div>
          <div className="grid flex-1 place-items-center rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="w-[92px]">
              <Phone />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {[Maximize2, Minimize2].map((I, i) => (
              <span
                key={i}
                className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-neutral-400"
              >
                <I size={13} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SideBySide() {
  return (
    <section id="window" className="section">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <Reveal>
            <p className="kicker">Travaille à côté</p>
            <h2 className="h2 mt-2">
              Ton téléphone reste là. Toi, tu continues.
            </h2>
            <p className="lead mt-4">
              Simulo n'occupe pas tout l'écran. Place-le à droite ou à gauche,
              garde-le au-dessus des autres fenêtres, ou réduis-le en mini — tu
              continues sereinement sur ton travail.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {modes.map((m) => (
                <div key={m.title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-15)] text-[var(--accent-soft)]">
                    <m.icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{m.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SplitMock />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
