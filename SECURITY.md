# SECURITY — SIMULO

## Ce que SIMULO ne fait PAS (liste négative, à protéger)

1. **Ne télécharge rien.** Ni adb, ni scrcpy, ni autre binaire.
   L'utilisateur installe les composants depuis leurs sources
   officielles (GitHub) ; SIMULO les *détecte*.
2. **N'envoie rien.** Pas de télémétrie, pas de crash report, pas
   d'analytique, pas de "vérification de licence" en ligne.
3. **Ne demande aucun compte.** Pas d'identifiant, pas de token cloud.
4. **Ne stocke aucun secret.** Pas de mot de passe, pas de credential
   persistant, pas de clé sur disque.
5. **Ne contourne aucune protection d'OS.** Si Android demande une
   autorisation à l'utilisateur, SIMULO affiche un message et attend.

## Le QR code (section 11 du cahier des charges)

- Session **temporaire** : 5 minutes, usage unique, expirée = morte.
- Charge utile : `simulo://pair?sid=<8 hex>&tok=<16 hex>&exp=<unix>`.
- `sid`/`tok` : 8 + 16 octets aléatoires (rand), **générés au moment**
  de l'affichage, jamais persistés.
- Ce qu'on n'y met JAMAIS : mot de passe permanent, credential,
  donnée privée du téléphone, serial de l'appareil.

## Le pairing Android (QR natif, Android 11+)

- SIMULO exécute `adb pair <ip:port> <code>` : le code est celui que
  le téléphone affiche (généré par Android, jeton court qui expire).
- Le code n'est **pas** enregistré par SIMULO après usage.
- La reconnexion utilise la mémoire ADB native (`adb connect` sur un
  appareil déjà paired) — c'est Android qui gère la confiance, pas nous.

## Autorisations (le modèle de confiance d'Android)

- **USB debugging** : autorisé par l'utilisateur sur le téléphone
  (la case « Toujours autoriser ce PC » est le comportement normal).
- SIMULO détecte l'état `unauthorized` et guide l'utilisateur — il ne
  force rien.

## Réseau local (wireless)

- `adb connect <ip:port>` sur le Wi-Fi local. La communication
  ADB sur TCP est **chiffrée par ADB lui-même** sur Android 11+
  (pairing). Sur les anciennes versions, le risque est le même que
  pour n'importe quel outil ADB : ne pas exposer le port 5555 sur
  un réseau non fiable (caveat documenté dans TROUBLESHOOTING.md).

## Code & audit

- Les deux cratés logiques sont **100 % testés** (42 tests) : parsing,
  transitions d'état, capacités, erreurs.
- CSP Tauri stricte : `default-src 'self'`.
- Release : `strip + lto + panic=abort` (pas de message de panic
  exploitable, binaire allégé).
- Audit recommandé avant publication : `cargo audit` (dépendances
  Rust) + `npm audit` (frontend).
