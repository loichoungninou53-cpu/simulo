import { useEffect, useMemo, useState } from "react";
import { Usb, Play, Smartphone, Check } from "lucide-react";
import Reveal from "./Reveal";
import { Laptop, Phone } from "./mockups";

const PHONE_IMG = "url('/phone.jpg')";

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
  off: 1500,
  connecting: 1800,
  connected: 1500,
  mirroring: 2200,
  control: 3000,
};

function useReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
}

/** Barre de statut (droite de la top bar) selon l'étape. */
function Status({ stage }: { stage: Stage }) {
  const ok = (
    <span className="pulse-dot" style={{ width: 7, height: 7 }} />
  );
  switch (stage) {
    case "off":
      return <span style={{ color: "#94a3b8" }}>En attente</span>;
    case "connecting":
      return <span style={{ color: "#f6cf8a" }}>Connexion…</span>;
    case "connected":
      return (
        <span className="inline-flex items-center gap-1.5" style={{ color: "#7ee0a2" }}>
          {ok} Connecté
        </span>
      );
    case "mirroring":
      return (
        <span className="inline-flex items-center gap-1.5" style={{ color: "#7ee0a2" }}>
          {ok} Mirroring
        </span>
      );
    case "control":
      return <span style={{ color: "var(--accent-bright)" }}>Contrôle prêt</span>;
  }
}

/** Écran du laptop selon l'étape — structure identique dans les 5 états. */
function Screen({ stage }: { stage: Stage }) {
  const okDot = <span className="pulse-dot" style={{ width: 7, height: 7 }} />;
  return (
    <div className="lb-ui">
      <div className="lb-top">
        <div className="lb-brand">
          <span className="dot" />
          SIMULO
        </div>
        <div className="lb-status">
          <Status stage={stage} />
        </div>
      </div>
      <div className="lb-main">
        {stage === "off" && (
          <div className="lb-empty">
            <div className="ico">
              <Usb size={16} />
            </div>
            <b>En attente d'un appareil</b>
            <span>Branche ton câble USB.</span>
          </div>
        )}
        {stage === "connecting" && (
          <div className="lb-empty">
            <span
              className="h-7 w-7 animate-spin rounded-full border-2 border-white/15"
              style={{ borderTopColor: "var(--accent)" }}
              aria-hidden
            />
            <b>Recherche d'appareil…</b>
            <span>TECNO POP 10 détecté</span>
          </div>
        )}
        {stage === "connected" && (
          <div className="lb-dev">
            <div className="row1">
              <span className="name">TECNO POP 10</span>
              <span className="pill pill--ok">{okDot} Connecté</span>
            </div>
            <div className="meta">Android 15 · USB · 1080×2400</div>
          </div>
        )}
        {(stage === "mirroring" || stage === "control") && (
          <>
            <div className="lb-mirror" style={{ backgroundImage: PHONE_IMG }}>
              <div className="scan" />
            </div>
            {stage === "control" && <div className="lb-cursor" />}
          </>
        )}
      </div>
      {(stage === "mirroring" || stage === "control") && (
        <div className="lb-cap">
          {stage === "control"
            ? "Prêt — clique, tape, contrôle"
            : (
                <>
                  {okDot} Mirroring actif · 1080p · 12 ms
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

  const idx = ORDER.indexOf(stage);

  return (
    <section id="demo" className="section">
      <div className="wrap">
        <Reveal>
          <div className="max-w-2xl">
            <p className="kicker">La démo</p>
            <h2 className="h2 mt-2">Un câble. C'est tout.</h2>
            <p className="lead mt-4">
              Branche ton téléphone. Simulo le détecte, établit la session et
              affiche ton écran sur le PC. Clique sur chaque étape pour la
              parcourir.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="desk mt-10">
            <div className="desk-stage">
              <div className="lb-wrap">
                <Laptop screen={<Screen stage={stage} />} />
              </div>
              <div className="pf-wrap flex flex-col items-center gap-3">
                <Phone />
                <div className="flex items-center gap-1.5">
                  <Smartphone size={13} className="text-neutral-500" />
                  {phonePill}
                </div>
              </div>
            </div>

            {/* rail d'étapes interactif */}
            <div className="steps" role="group" aria-label="Étapes de la connexion">
              {ORDER.map((s, i) => (
                <button
                  key={s}
                  className={`step-btn ${stage === s ? "active" : i < idx ? "done" : ""}`}
                  onClick={() => go(s)}
                  aria-current={stage === s ? "step" : undefined}
                >
                  <span className="n">
                    {i < idx ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  {LABEL[s]}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
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
