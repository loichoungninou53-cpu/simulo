import {
  Download as DownloadIcon,
  FolderGit2,
  Cpu,
  MemoryStick,
  Usb,
  Smartphone,
  HardDrive,
} from "lucide-react";
import Reveal from "./Reveal";

/**
 * Source officielle du binaire Windows : GitHub Releases.
 * ⚠️ Remplace par le dépôt réel avant mise en ligne.
 * Le fichier SimuloSetup.exe est généré par `npm run tauri build`
 * (NSIS) SUR Windows — il n'est jamais hébergé sur ce site.
 */
const REPO = "https://github.com/simulo/simulo";
const RELEASES = `${REPO}/releases`;

const reqs = [
  { icon: Cpu, label: "Windows 10 / 11 · 64-bit" },
  { icon: MemoryStick, label: "4 Go de RAM min." },
  { icon: Usb, label: "Câble USB (ou même Wi-Fi)" },
  { icon: Smartphone, label: "Android 8+ pour le mirroring" },
];

export default function Download() {
  return (
    <section id="download" className="section relative overflow-hidden">
      <div aria-hidden className="halo-cta pointer-events-none absolute inset-0" />
      <div className="wrap relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="kicker">Téléchargement</p>
            <h2 className="h2 mt-2">Disponible pour Windows.</h2>
            <p className="lead mt-4">
              Installe SimuloSetup.exe, branche ton téléphone, et c'est parti.
              Gratuit pour un usage personnel. scrcpy et ADB sont installés
              automatiquement — rien à configurer.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={RELEASES} target="_blank" rel="noreferrer" className="btn-white text-base">
              <DownloadIcon size={18} strokeWidth={2.6} />
              Télécharger SimuloSetup.exe
            </a>
            <a href={REPO} target="_blank" rel="noreferrer" className="btn-ghost">
              <FolderGit2 size={16} />
              Voir le dépôt
            </a>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {reqs.map((r) => (
              <div
                key={r.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[var(--surface)] px-3 py-4 text-center"
              >
                <r.icon size={18} className="text-[var(--accent-soft)]" />
                <span className="text-xs font-semibold leading-snug text-neutral-300">
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center gap-1.5 text-center text-xs text-neutral-500 sm:flex-row sm:justify-center sm:gap-2">
            <span className="inline-flex items-center gap-1.5">
              <HardDrive size={13} className="text-neutral-400" />
              ~20 Mo · publié via GitHub Releases
            </span>
            <span aria-hidden>·</span>
            <span>Version portable dispo (aucune installation, clé USB)</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
