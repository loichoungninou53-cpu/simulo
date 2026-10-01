import { Usb, MonitorPlay, MousePointerClick } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    icon: Usb,
    n: "01",
    title: "Connecter",
    text: "Branche ton téléphone en USB — ou connecte-toi en Wi-Fi ou par QR. Simulo le détecte tout seul, sans taper de commande.",
  },
  {
    icon: MonitorPlay,
    n: "02",
    title: "Voir",
    text: "Ton écran apparaît en direct sur le PC, en haute définition et à faible latence. Chaque notification est là.",
  },
  {
    icon: MousePointerClick,
    n: "03",
    title: "Contrôler",
    text: "Clique, tape et pilote ton téléphone avec ta souris et ton clavier. Raccourcis Android (retour, accueil) en un clic.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section section--tight">
      <div className="wrap">
        <Reveal>
          <p className="kicker">Comment ça marche</p>
          <h2 className="h2 mt-2 max-w-2xl">
            Trois gestes, zéro barrière technique.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-15)] text-[var(--accent-soft)]">
                    <s.icon size={20} />
                  </span>
                  <span className="font-mono text-sm font-bold text-neutral-700">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
