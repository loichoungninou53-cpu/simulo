import { useEffect, useMemo, useState } from "react";
import {
  Usb,
  Play,
  Smartphone,
  Check,
  Home,
  Cpu,
  Activity,
  Settings,
} from "lucide-react";
import Reveal from "./Reveal";
import { Laptop, Phone } from "./mockups";

const PHONE_IMG = "url('phone.jpg')";

const ORDER = ["off", "connecting", "connected", "mirroring", "control"] as const;
type Stage = (typeof ORDER)[number];

const LABEL: Record<Stage, string> = {
  off: "Brancher",
  connecting: "Connexion",
  connected: "Connecté",
  mirroring: "Mirroring",
  control: "Contrôle",
};

const DUR: Record<Stage, number> = {
  off: 1600,
  connecting: 1900,
  connected: 1700,
  mirroring: 2300,
  control: 3200,
};

function useReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
}

/** Indicateur de statut (droite de la barre de titre). */
function Status({ stage }: { stage: Stage }) {
  const dot = <span className="pulse-dot" style={{ width: 6, height: 6 }} />;
  switch (stage) {
    case "off":
      return <span style={{ color: "#8b95a5" }}>En attente</span>;
    case "connecting":
      return <span style={{ color: "#f6cf8a" }}>Connexion…</span>;
    case "connected":
    case "mirroring":
      return (
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: "#7ee0a2" }}
        >
          {dot}
          {stage === "connected" ? "Connecté" : "Mirroring"}
        </span>
      );
    case "control":
      return <span style={{ color: "var(--accent-bright)" }}>Contrôle prêt</span>;
  }
}

/** Une vraie fenêtre d'app Simulo dans l'écran du PC. */
function Screen({ stage }: { stage: Stage }) {
  const dot = <span className="pulse-dot" style={{ width: 6, height: 6 }} />;
  return (
    <div className="lb-ui">
      {/* barre de titre */}
      <div className="lb-title">
        <div className="lb-title-l">
          <span className="lb-win">
            <i />
            <i />
            <i />
          </span>
          <b>
            <span className="m" />
            SIMULO
          </b>
        </div>
        <Status stage={stage} />
      </div>

      <div className="lb-body">
        {/* mini-sidebar (IA de l'app) */}
        <div className="lb-side" aria-hidden>
          <span className="s logo">
            <Cpu size={9} strokeWidth={2.6} />
          </span>
          <span className="s">
            <Home size={9} strokeWidth={2.4} />
          </span>
          <span className="s on">
            <Cpu size={9} strokeWidth={2.4} />
          </span>
          <span className="s">
            <Activity size={9} strokeWidth={2.4} />
          </span>
          <span className="s spacer" />
          <span className="s">
            <Settings size={9} strokeWidth={2.4} />
          </span>
        </div>

        {/* contenu */}
        <div className="lb-content">
          <div className="lb-head">
            <span className="t">Appareils</span>
            <span className="sub">Local · sans cloud</span>
          </div>
          <div className="lb-main">
            {stage === "off" && (
              <div className="lb-empty">
                <div className="ico">
                  <Usb size={15} strokeWidth={2.2} />
                </div>
                <b>En attente d'un appareil</b>
                <span>Branche ton câble USB</span>
              </div>
            )}
            {stage === "connecting" && (
              <div className="lb-empty">
                <span
                  className="h-6 w-6 animate-spin rounded-full border-2 border-white/15"
                  style={{ borderTopColor: "var(--accent)" }}
                  aria-hidden
                />
                <b>TECNO POP 10 détecté</b>
                <span>Établissement de la session…</span>
              </div>
            )}
            {stage === "connected" && (
              <div className="lb-dev">
                <div className="row1">
                  <span className="ic">
                    <Smartphone size={14} strokeWidth={2} />
                  </span>
                  <span className="who">
                    <span className="name">TECNO POP 10</span>
                    <span className="meta">Android 15 · USB · 1080×2400</span>
                  </span>
                  <span className="lb-ok">
                    {dot}OK
                  </span>
                </div>
                <span className="btn">
                  <Play size={11} strokeWidth={2.6} />
                  Lancer le mirroring
                </span>
              </div>
            )}
            {(stage === "mirroring" || stage === "control") && (
              <div className="lb-mirror" style={{ backgroundImage: PHONE_IMG }}>
                <div className="scan" />
              </div>
            )}
            {stage === "control" && <div className="lb-cursor" />}
          </div>
        </div>
      </div>

      {(stage === "mirroring" || stage === "control") && (
        <div className="lb-cap">
          {stage === "control"
            ? "Prêt — clique, tape, contrôle"
            : (
                <>
                  {dot} Mirroring actif · 1080p · 12 ms
                </>
              )}
        </div>
      )}
    </div>
  );
}

export default function ProductDemo() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduced ? "mirroring" : "off");
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    if (!playing) return;
    const next = ORDER[(ORDER.indexOf(stage) + 1) % ORDER.length];
    const t = setTimeout(() => setStage(next), DUR[stage]);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const go = (s: Stage) => {
    setStage(s);
    setPlaying(false);
  };
  const replay = () => {
    setStage("off");
    setPlaying(true);
  };

  const active = stage === "mirroring" || stage === "control";
  const idx = ORDER.indexOf(stage);
  const pct = (idx / (ORDER.length - 1)) * 100;

  const phonePill =
    stage === "off" ? (
      <span className="pill pill--mute">Déconnecté</span>
    ) : stage === "connecting" ? (
      <span className="pill pill--warn">Connexion…</span>
    ) : (
      <span className="pill pill--ok">
        <span className="pulse-dot" style={{ width: 7, height: 7 }} /> Connecté
      </span>
    );

  return (
    <section id="demo" className="section">
      <div className="wrap">
        <Reveal>
          <div className="max-w-2xl">
            <p className="kicker">La démo</p>
            <h2 className="h2 mt-2">Un câble. C'est tout.</h2>
            <p className="lead mt-4">
              Branche ton téléphone. Simulo le détecte, ouvre la session et
              affiche son écran sur le PC. Clique sur chaque étape pour la
              parcourir.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="desk mt-10">
            <div className="desk-stage">
              <div className="lb-wrap">
                <Laptop screen={<Screen stage={stage} />} />
                {/* faisceau de connexion (laptop -> téléphone) */}
                <span className={`link ${active ? "on" : ""}`} aria-hidden>
                  <i className="link-dot" />
                </span>
              </div>
              <div className="pf-wrap flex flex-col items-center gap-2">
                <Phone />
                <span className="flex items-center gap-1.5">
                  <Smartphone size={12} className="text-neutral-500" />
                  {phonePill}
                </span>
              </div>
            </div>

            {/* stepper connecté */}
            <div
              className="steps"
              role="group"
              aria-label="Étapes de la connexion"
            >
              <span className="steps-track" aria-hidden>
                <span className="steps-fill" style={{ width: `${pct}%` }} />
              </span>
              {ORDER.map((s, i) => (
                <button
                  key={s}
                  className={`step ${
                    stage === s ? "active" : i < idx ? "done" : ""
                  }`}
                  onClick={() => go(s)}
                  aria-current={stage === s ? "step" : undefined}
                >
                  <span className="node">
                    {i < idx ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="lbl">{LABEL[s]}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <button onClick={replay} className="btn-ghost !px-4 !py-2 text-xs">
                <Play size={13} /> Rejouer la démo
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
