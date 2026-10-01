# SIMULO — Connect. See. Control.

**SIMULO** est une application desktop **Windows** qui connecte un smartphone
(Android, et iPhone avec un support honnête/limité) à un ordinateur pour :

- afficher l'écran du téléphone en temps réel,
- contrôler le téléphone avec la souris et le clavier,
- envoyer du texte, utiliser les touches système,
- enregistrer l'écran (quand disponible),
- tout ça **sans internet, sans cloud, sans compte** — par USB, Wi-Fi local ou QR code.

> Philosophie : « Je branche mon téléphone, et il apparaît sur mon ordinateur. »
> Jamais de jargon (ADB, TCP/IP, ports) visible par l'utilisateur.
> Jamais de fonctionnalité simulée : un bouton existe seulement si le code derrière existe.

---

## Ce qui est dans ce dépôt

```
simulo/
├── landing/                    # Landing page (Vite + React + TS + Tailwind)
│   └── dist/                   # → le build statique à mettre en ligne
├── app/                        # L'application desktop (Tauri v2)
│   ├── src/                    #   Interface React (TypeScript)
│   ├── src-tauri/              #   Shell Tauri (fin : wrapper de commandes)
│   └── crates/
│       ├── simulo-core/        #   Cœur logique PUR (26 tests) — testable partout
│       └── simulo-desktop-core #   Orchestration ADB/scrcpy (16 tests)
├── docs/                       # Documentation utilisateur
├── ARCHITECTURE.md             # Comment le projet est construit (et pourquoi)
├── GUIDE_DEBUTANT.md           # ⭐ LE GUIDE : mettre en ligne + utiliser, pas à pas
├── SECURITY.md                 # Le modèle de sécurité
├── TROUBLESHOOTING.md          # Les problèmes fréquents et leurs solutions
└── LICENSES.md                 # Licences de chaque dépendance
```

## Les 3 niveaux de code (pourquoi c'est propre)

| Couche | Fichier | Rôle | Testée ici ? |
|---|---|---|---|
| `simulo-core` | `app/crates/simulo-core` | Modèle d'appareil, parsing ADB, capacités, machine à états, QR | ✅ 26 tests |
| `simulo-desktop-core` | `app/crates/simulo-desktop-core` | AdbManager, ScrcpyManager, scan/connect/mirror, diagnostics | ✅ 16 tests |
| `simulo` (Tauri) | `app/src-tauri` | Fenêtre, état, commandes exposées à React | compile sur Windows |
| Frontend | `app/src` + `landing/` | L'interface React | ✅ build TypeScript propre |

## Démarrage rapide (détails dans `GUIDE_DEBUTANT.md`)

**Landing page** :
```bash
cd landing
npm install
npm run dev        # dev sur http://localhost:5173
npm run build      # produit dist/ → à déposer sur Netlify/Vercel
```

**Application desktop (Windows)** :
```bash
cd app
npm install
npm run tauri dev      # développement (fenêtre + rechargement chaud)
npm run tauri build    # produit l'installateur (.msi/.exe) dans src-tauri/target/release/bundle
```
Prérequis : Rust + Node.js + ADB (platform-tools) + scrcpy officiel.
→ Le guide débutant explique l'installation de chacun, pas à pas.

## Tests

```bash
cd app
cargo test     # 42 tests sur les deux cratés logiques
```

## Statut honnête (MVP)

| Fonctionnalité | Statut |
|---|---|
| Mirroring Android (scrcpy officiel) | ✅ cœur du MVP |
| Souris + clavier via scrcpy | ✅ (fenêtre scrcpy) |
| USB, Wireless, QR pairing (Android 11+) | ✅ |
| Envoi de texte / touches système | ✅ (ADB input) |
| Enregistrement | ✅ (scrcpy --record) |
| Audio | ✅ quand Android 10+ + scrcpy 2.3+ |
| Diagnostic / dépannage guidé | ✅ |
| Reconnexion one-click (historique local) | ✅ |
| iPhone : détection + diagnostic | ✅ |
| iPhone : mirroring | ⛔ bloqué par Apple sur iOS stock (documenté, pas simulé) |
| Companion mobile (QR depuis le PC, clipboard bidirectionnel) | 📍 roadmap |

## Licence

Code SIMULO : MIT. Voir `LICENSES.md` pour les licences des composants
utilisés (scrcpy GPL-3.0, ADB Apache-2.0, etc.).
