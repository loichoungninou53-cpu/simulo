import { Github, Mail } from "lucide-react";
import Logo from "./Logo";

/** ⚠️ Remplace par le dépôt GitHub réel avant mise en ligne. */
const REPO = "https://github.com/loichoungninou53-cpu/simulo";

const cols = [
  {
    h: "Produit",
    links: [
      ["Démo", "#demo"],
      ["Fonctionnement", "#how"],
      ["Appareils", "#devices"],
      ["Espace Simulo", "#espace"],
      ["Télécharger", "#download"],
    ],
  },
  {
    h: "Ressources",
    links: [
      ["Documentation", `${REPO}/tree/main/docs`],
      ["Dépannage", `${REPO}/blob/main/TROUBLESHOOTING.md`],
      ["Guide débutant", `${REPO}/blob/main/GUIDE_DEBUTANT.md`],
      ["Confidentialité", "#privacy"],
    ],
  },
  {
    h: "Projet",
    links: [
      ["GitHub", REPO],
      ["Licences", `${REPO}/blob/main/LICENSES.md`],
      ["Contribuer", `${REPO}/blob/main/CONTRIBUTING.md`],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--bg-2)] py-12">
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="h-8 w-8" withWord />
            <p className="mt-3 max-w-xs text-sm text-neutral-500">
              Connecte. Voit. Contrôle. Ton téléphone sur ton bureau — local-first,
              sans cloud, sans compte.
            </p>
            <div className="mt-4 flex gap-4 text-neutral-500">
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="transition-colors hover:text-white"
              >
                <Github size={17} />
              </a>
              <a
                href="mailto:hello@simulo.dev"
                aria-label="Contact"
                className="transition-colors hover:text-white"
              >
                <Mail size={17} />
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                {c.h}
              </h4>
              <ul className="mt-3 space-y-2">
                {c.links.map(([label, href]) => {
                  const external = href.startsWith("http");
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        {...(external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="text-sm text-neutral-500 transition-colors hover:text-white"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-neutral-600">
          © 2026 Simulo · Construit sur scrcpy (GPL-3.0) &amp; ADB (Apache-2.0) ·
          Fait avec soin, zéro télémétrie
        </div>
      </div>
    </footer>
  );
}
