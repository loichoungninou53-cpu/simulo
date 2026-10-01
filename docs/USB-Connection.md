# USB Connection

Le mode le plus stable (recommandé pour le jeu, le streaming, la prod).

## Étapes

1. Câble **data** branché (pas un câble charge-only).
2. Téléphone : notifications → USB → **Transfert de fichiers (MTP)**.
3. Première fois : accepte « **Autoriser le débogage USB** » sur le
   téléphone (coche « Toujours autoriser ce PC »).
4. SIMULO détecte l'appareil automatiquement → **Connect**.

## Ce que SIMULO fait en interne (pour les curieux)

1. `adb devices` → trouve le serial + l'état (`device` / `unauthorized`).
2. `adb shell getprop` → nom, modèle, version d'Android.
3. Calcul des capacités (mirroring, QR, audio selon la version).
4. `scrcpy -s <serial>` → la fenêtre vidéo s'ouvre.

## Si ça ne détecte pas

- Autre câble (80 % des cas).
- Mode MTP choisi sur le téléphone.
- Diagnostics → il dira exactement ce qui manque.
