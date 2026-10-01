import { Cpu, MonitorSmartphone, MousePointerClick, CloudOff, Wifi } from "lucide-react";
import Reveal from "./Reveal";

const checks = [
  { icon: Cpu, label: "USB 100 % local" },
  { icon: MonitorSmartphone, label: "Mirroring local" },
  { icon: MousePointerClick, label: "Contrôle local" },
  { icon: CloudOff, label: "Pas de cloud obligatoire" },
];

export default function LocalFirst() {
  return (
    <section id="local" className="section">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <p className="kicker">Local-first</p>
            <h2 className="h2 mt-2">Pas besoin du cloud.</h2>
            <p className="lead mt-4">
              Le cœur de Simulo fonctionne localement. Ton écran n'a pas besoin
              de passer par un serveur pour apparaître sur ton PC : la vidéo
              circule directement entre ton téléphone et ta machine.
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-neutral-500">
              <Wifi size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <span>
                Le mode sans fil utilise <b className="text-neutral-300">ton réseau
                local</b> (même Wi-Fi) — jamais un serveur distant. Le mode USB,
                lui, fonctionne même sans Wi-Fi.
              </span>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-2">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-15)] text-[var(--accent-soft)]">
                    <c.icon size={17} />
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
