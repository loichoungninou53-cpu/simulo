import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "#demo", label: "Démo" },
  { href: "#how", label: "Fonctionnement" },
  { href: "#local", label: "Local-first" },
  { href: "#devices", label: "Appareils" },
  { href: "#espace", label: "Espace Simulo" },
];

type Theme = "blue" | "green";

function readTheme(): Theme {
  try {
    return localStorage.getItem("simulo-theme") === "green" ? "green" : "blue";
  } catch {
    return "blue";
  }
}

/**
 * Barre sticky, fond translucide. Inclut le sélecteur d'accent
 * bleu ciel ↔ vert clair (mémorisé, appliqué avant le rendu).
 */
export default function Nav() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-green", theme === "green");
    try {
      localStorage.setItem("simulo-theme", theme);
    } catch {
      /* stockage indisponible : le thème restera pour la session */
    }
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[rgba(5,7,13,0.82)] backdrop-blur-md">
      <nav className="wrap flex items-center justify-between py-3">
        <a href="#top" aria-label="Simulo — accueil">
          <Logo className="h-8 w-8" />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* sélecteur d'accent : bleu ciel / vert clair */}
          <div
            className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5"
            role="group"
            aria-label="Couleur d'accent du site"
          >
            <button
              onClick={() => setTheme("blue")}
              aria-label="Thème bleu ciel"
              aria-pressed={theme === "blue"}
              title="Bleu ciel"
              className={`grid h-7 w-7 place-items-center rounded-full transition-all ${
                theme === "blue"
                  ? "bg-white/15 ring-1 ring-white/50"
                  : "opacity-45 hover:opacity-90"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: "var(--simulo-blue)" }} />
            </button>
            <button
              onClick={() => setTheme("green")}
              aria-label="Thème vert clair"
              aria-pressed={theme === "green"}
              title="Vert clair"
              className={`grid h-7 w-7 place-items-center rounded-full transition-all ${
                theme === "green"
                  ? "bg-white/15 ring-1 ring-white/50"
                  : "opacity-45 hover:opacity-90"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: "var(--simulo-green)" }} />
            </button>
          </div>

          <a
            href="#download"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105"
          >
            Télécharger
          </a>
        </div>
      </nav>
    </header>
  );
}
