# LICENSES — SIMULO

## Code SIMULO

- **MIT** — tout le code de ce dépôt (crates Rust, frontend, landing,
  documentation). Libre d'utiliser, modifier, distribuer.

## Composants externes (orchestrés, jamais recopiés)

| Composant | Licence | Comment SIMULO l'utilise |
|---|---|---|
| **scrcpy** (Genymobile) | GPL-3.0 | binaire officiel installé par l'utilisateur ; SIMULO le *lance* (`scrcpy -s …`) et lit sa sortie. Pas de code scrcpy copié dans SIMULO. |
| **ADB** (Android platform-tools) | Apache-2.0 | binaire officiel ; SIMULO l'appelle (`devices`, `connect`, `pair`, `shell`). |

> **Note de compatibilité de licences** : scrcpy est GPL-3.0 et est
> distribué séparément (l'utilisateur l'installe lui-même depuis le
> GitHub officiel). SIMULO ne le lie pas, ne le modifie pas et ne le
> redistribue pas : il l'orchestre via la ligne de commande. Cette
> séparation conserve le code SIMULO sous MIT. Si tu veux redistribuer
> SIMULO **avec** scrcpy pré-emballé, consulte un juriste (obligation
> GPL sur le bundle).

## Dépendances Rust (workspace)

| Crate | Licence | Rôle |
|---|---|---|
| serde / serde_json | MIT / Apache-2.0 | (dé)sérialisation JSON entre Rust et React |
| thiserror | MIT / Apache-2.0 | types d'erreur typés |
| rand | MIT / Apache-2.0 | jetons QR aléatoires |
| tauri | Apache-2.0 / MIT | coquille desktop |

## Dépendances npm (frontend + landing)

| Paquet | Licence | Rôle |
|---|---|---|
| react / react-dom | MIT | interface |
| @tauri-apps/api | Apache-2.0 / MIT | appels Rust ↔ JS |
| tailwindcss | MIT | styles |
| lucide-react | ISC | icônes |
| qrcode | MIT | génération du QR de session |
| vite / typescript | MIT | outillage |

Vérifie à la publication : `cargo audit` + `npm audit` dans chaque
dossier (`app/` et `landing/`).
