# QR Pairing (Android 11+)

Le pairing le plus rapide, sans taper d'IP.

## Étapes

1. Téléphone : Options développeur → **Wireless debugging** → activé.
2. Touche « **Pair device with QR code** » → le téléphone affiche un QR
   + une **IP** + un **code d'appairage** (4–8 chiffres).
3. SIMULO → onglet **QR Code** → saisis l'IP, le port et le code.
4. **Pair & Connect** → SIMULO exécute l'appairage puis la connexion.

## À savoir

- Le QR (et donc le code) **expire en ~60 secondes** : re-scanne et
  ressaisis vite en cas d'échec.
- Le code n'est **jamais stocké** par SIMULO.
- Le QR « Simulo session » affiché côté PC (5 min, usage unique) est
  destiné au futur compagnon mobile — sans l'app, utilise simplement
  les champs IP/code (15 secondes).
