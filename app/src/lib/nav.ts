export type View =
  | "home"
  | "devices"
  | "connect"
  | "mirror"
  | "diagnostics"
  | "settings";

export const NAV: { id: View; label: string }[] = [
  { id: "home", label: "Accueil" },
  { id: "devices", label: "Appareils" },
  { id: "connect", label: "Connexion" },
  { id: "mirror", label: "Mirroring" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "settings", label: "Paramètres" },
];
