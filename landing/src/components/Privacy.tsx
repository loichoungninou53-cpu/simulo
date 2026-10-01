import { EyeOff, Lock, ServerOff, WifiOff } from "lucide-react";
import Reveal from "./Reveal";

const points = [
  {
    icon: WifiOff,
    title: "Fonctionne hors-ligne",
    text: "USB et Wi-Fi local ne nécessitent pas d'internet. Coupe le routeur — Simulo se connecte quand même.",
  },
  {
    icon: Lock,
    title: "100% local",
    text: "Ta session vit entre ton PC et ton téléphone. Rien ne transite par un serveur tiers.",
  },
  {
    icon: EyeOff,
    title: "Zéro télémétrie",
    text: "Pas de suivi d'utilisation, pas de ping de crash, pas d'analytics. Si on ne te connaît pas, on ne te vend pas.",
  },
  {
    icon: ServerOff,
    title: "Pas de compte",
    text: "Rien à enregistrer, rien à synchroniser. Ferme l'app, rien ne reste nulle part.",
  },
];

export default function Privacy() {
  return (
    <section id="privacy" className="section">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Confidentialité</p>
          <h2 className="h2 mt-2 max-w-3xl">
            Ton téléphone est à toi. Ton écran aussi.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="card card-hover h-full p-5 sm:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent-15)] text-[var(--accent-soft)]">
                  <p.icon size={19} strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 font-bold text-white">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                  {p.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
