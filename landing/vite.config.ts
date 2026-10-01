import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Le build final ne doit AUCUNE dépendance externe (pas de CDN, pas de
  // fonts distantes) : la landing doit fonctionner 100% hors-ligne.
  preview: {
    allowedHosts: true,
  },
});
