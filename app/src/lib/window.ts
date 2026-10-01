import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";

/**
 * Contrôles de la fenêtre principale (Tauri).
 * Les permissions sont déclarées dans capabilities/default.json.
 * Les erreurs sont REMONTÉES en clair (jamais avalées) : le composant
 * affiche le message exact à l'utilisateur.
 */

export async function isAlwaysOnTop(): Promise<boolean> {
  return getCurrentWindow().isAlwaysOnTop();
}

export async function setAlwaysOnTop(on: boolean): Promise<void> {
  await getCurrentWindow().setAlwaysOnTop(on);
}

export async function isFullscreen(): Promise<boolean> {
  return getCurrentWindow().isFullscreen();
}

export async function setFullscreen(on: boolean): Promise<void> {
  await getCurrentWindow().setFullscreen(on);
}

/**
 * Mini view : réduit la fenêtre à une petite colonne "téléphone" qui peut
 * rester posée au coin de l'écran (avec Always-on-top).
 */
export async function setMiniView(on: boolean): Promise<void> {
  const win = getCurrentWindow();
  if (on) {
    await win.setSize(new LogicalSize(340, 680));
  } else {
    await win.setSize(new LogicalSize(1040, 720));
  }
}
