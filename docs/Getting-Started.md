# Getting Started — SIMULO

## 1. Installe les 2 composants (une seule fois)

| Composant | Source officielle | Où le poser |
|---|---|---|
| **ADB** (platform-tools) | https://developer.android.com/tools/releases/platform-tools | `C:\platform-tools` + ajouter au `Path` |
| **scrcpy** | https://github.com/Genymobile/scrcpy/releases | `C:\scrcpy` + ajouter au `Path` |

→ Pas à pas complet : voir **TROUBLESHOOTING.md** (« ADB not found »).

## 2. Active le débogage USB sur ton téléphone

1. Réglages → **À propos du téléphone** → tape **7 fois** sur « Numéro de build ».
2. Retourne dans Réglages → **Options développeur** (apparu en bas).
3. Active **Débogage USB**.

## 3. Branche et connecte

1. Branche le téléphone (câble **data**).
2. Sur le téléphone : **Autoriser le débogage USB** ✓ (coche « Toujours »).
3. Ouvre SIMULO → le téléphone apparaît → **Connect**.
4. L'écran du téléphone apparaît dans la fenêtre scrcpy. C'est tout.

## Sans fil (même Wi-Fi)

Téléphone : Options développeur → **Wireless debugging** → activé.
SIMULO → onglet **Wireless** → IP + port affichés sur le téléphone → Connect.

## QR pairing (Android 11+)

SIMULO → onglet **QR Code** → sur le téléphone : Wireless debugging →
« Pair device with QR code » → note l'IP + le code → SIMULO fait le reste.
