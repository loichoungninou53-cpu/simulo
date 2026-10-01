import { Download, Usb, Wifi, QrCode, Cpu, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { Laptop, Phone } from "./mockups";

const PHONE_IMG = "url('/phone.jpg')";

/** Écran du laptop en état "connecté + mirroring" (le plus lisible). */
function ConnectedScreen() {
  return (
    <div className="lb-ui">
      <div className="lb-top">
        <div className="lb-brand">
          <span className="dot" />
          SIMULO
        </div>
        <div className="lb-status" style={{ color: "#7ee0a2" }}>
          <span className="pulse-dot" style={{ width: 7, height: 7 }} />
          Mirroring actif
        </div>
      </div>
      <div className="lb-main">
        <div className="lb-mirror" style={{ backgroundImage: PHONE_IMG }}>
          <div className="scan" />
        </div>
        <div className="lb-cursor" />
      </div>
      <div className="lb-cap">TECNO POP 10 · 1080p · 12 ms</div>
    </div>
  );
}

const badges = [
  { icon: Usb, label: "USB" },
  { icon: Wifi, label: "Sans fil" },
  { icon: QrCode, label: "QR" },
  { icon: Cpu, label: "Local" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="halo-hero pointer-events-none absolute inset-0" />
      <div className="wrap relative grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-20">
        {/* ---------- texte ---------- */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-300">
              <span className="pulse-dot" />
              Disponible pour Windows
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-extrabold leading-[1.02] tracking-tight text-white text-[length:var(--h1)]">
              Ton téléphone.
              <br />
              <span className="text-[var(--accent)]">Sur ton PC.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-neutral-400 sm:text-base">
              Connecte ton smartphone à Windows. Regarde ton écran en temps
              réel et contrôle-le depuis ton bureau — simplement.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#download" className="btn-white">
                <Download size={17} strokeWidth={2.6} />
                Télécharger Simulo
              </a>
              <a href="#how" className="btn-ghost">
                Voir comment ça marche
                <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] font-medium text-neutral-500">
              {badges.map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5">
                  <b.icon size={14} className="text-[var(--accent)]" />
                  {b.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- scène : laptop + téléphone posés ---------- */}
        <Reveal delay={200} className="lg:col-span-7">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-6 lg:gap-10">
            <div className="w-full max-w-[440px]">
              <Laptop screen={<ConnectedScreen />} />
            </div>
            <div className="mb-2 w-[140px] shrink-0 sm:mb-6 sm:w-[164px]">
              <Phone />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
