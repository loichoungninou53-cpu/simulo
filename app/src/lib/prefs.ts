/**
 * Préférences utilisateur (stockées en localStorage).
 * Appliquées à la CONNEXION (qualité, audio) ou en direct (fenêtre).
 * Jamais de valeur supposée : défauts explicites + merge sur le stocké.
 */
export type Quality = "720" | "1080" | "1280";

export type Prefs = {
  maxSize: Quality;
  bitRate: "4M" | "8M" | "12M";
  maxFps: 30 | 60;
  audio: boolean;
  defaultMode: "usb" | "wireless" | "qr";
};

const KEY = "simulo.prefs";

export const DEFAULTS: Prefs = {
  maxSize: "1080",
  bitRate: "8M",
  maxFps: 60,
  audio: true,
  defaultMode: "usb",
};

export function getPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>;
    return { ...DEFAULTS, ...raw };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(p: Prefs): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}
