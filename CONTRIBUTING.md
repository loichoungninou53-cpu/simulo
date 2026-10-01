# CONTRIBUTING — SIMULO

Merci d'apporter ton aide. Règles simples :

## Avant de proposer un changement

1. **Lis `ARCHITECTURE.md`** — la découpe en 4 couches n'est pas
   accidentelle : la logique métier vit dans `simulo-core` /
   `simulo-desktop-core`, jamais dans `src-tauri/src/lib.rs` ni dans
   le React.
2. **Règle absolue (section 64 du cahier des charges)** : ne jamais
   créer de bouton mort ni de fausse animation de connexion. Si la
   fonctionnalité n'est pas implémentée, elle ne s'affiche pas.
3. **Règle 79** : ne jamais promettre une capacité iPhone qu'Apple ne
   permet pas sur iOS stock. Les capacités sont calculées, pas déclarées.
4. Cherche d'abord un projet open source existant (officiel GitHub,
   licence compatible, maintenu) avant d'inventer une roue.

## Workflow

1. Branche ta branche depuis `main`.
2. Code + **tests** (le cœur logique est testé : ajoutes les tiens).
3. `cd app && cargo test` → 42+ tests doivent rester verts.
4. `cd app && npm run build` et `cd landing && npm run build` → builds propres.
5. Teste sur un vrai téléphone (premier de validation : **TECNO POP 10,
   Android 15**) avant de déclarer une fonction stable.

## Style

- Rust : `cargo fmt` + `cargo clippy` sans warning.
- TypeScript : strict mode, pas de `any`.
- Messages d'erreur : toujours en **langage utilisateur** (voir
  `simulo-desktop-core/src/error.rs` pour le ton).
- Pas de magic numbers : les constantes nommées vivent dans le cœur.

## Test matrix à couvrir pour les PRs importantes

- Android : TECNO, Samsung, Xiaomi, Infinix, OPPO, OnePlus, Pixel, Motorola.
- Modes : USB, Wi-Fi, wireless debugging, QR pairing, ADB authorization.
- Échecs (la section 67 du cahier des charges) : débranchement USB,
  coupure Wi-Fi, téléphone verrouillé, redémarrage PC/téléphone,
  crash ADB/scrcpy, device offline, firewall, multi-appareils.
