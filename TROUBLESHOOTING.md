# TROUBLESHOOTING — SIMULO

Chaque problème avec sa cause réelle et sa solution. Commence toujours
par **Diagnostics** (bouton en haut à droite ou écran connecté) : il
vérifie ADB, scrcpy et les appareils, et te dit en clair ce qui cloche.

## « ADB not found »

**Cause** : les Android platform-tools ne sont pas installés.
**Solution** :
1. Télécharge *platform-tools* officiel : https://developer.android.com/tools/releases/platform-tools
2. Dézippe dans `C:\platform-tools` (le dossier contient `adb.exe`).
3. Ajoute `C:\platform-tools` à la variable d'environnement `Path`
   (Rechercher « modifier les variables d'environnement système »).
4. Relance SIMULO (ou redémarre le PC). Diagnostics doit afficher
   « ADB version 1.0.4x » en vert.

## Le téléphone est vu mais « unauthorized »

**Cause** : la case d'autorisation USB debugging n'a pas été acceptée
sur le téléphone.
**Solution** :
1. Sur le téléphone : accepte la boîte « Autoriser le débogage USB »
   (coche « Toujours autoriser ce PC »).
2. Si la boîte ne s'affiche pas : débranche, rebranche ; sinon
   Réglages → Options développeur → « Désautoriser les applications
   USB debugging » puis rebranche.

## « No device found » mais le câble est branché

**Causes fréquentes** (par ordre de probabilité) :
1. **Câble charge-only** : beaucoup de câbles USB ne transportent pas
   les données. Essaie un autre câble.
2. **Mode USB du téléphone** : sur TECNO/Android, tire le bandeau
   notifications → « USB » → choisis **Transfert de fichiers (MTP)**.
3. **USB debugging désactivé** : Réglages → À propos → tape 7 fois
   sur « Numéro de build » → retourne dans Réglages → **Options
   développeur** → active **Débogage USB**.

## L'écran ne s'affiche pas après « Connect »

**Cause** : scrcpy n'est pas installé, ou est trop ancien.
**Solution** :
1. Installe scrcpy **officiel** : https://github.com/Genymobile/scrcpy/releases
   (prends le `scrcpy-win64-vX.Y.zip`, dézippe, ajoute le dossier au Path).
2. Diagnostics → « scrcpy version 2.x » doit apparaître en vert.
3. Relance la connexion. La fenêtre scrcpy s'ouvre = c'est bon.

## « Connection refused » en sans fil

**Causes** :
1. Téléphone et PC ne sont pas sur le **même Wi-Fi** (vérifie le 2,4
   GHz et le 5 GHz : certains routeurs les isolent — passe les deux
   appareils sur le même).
2. **Wireless debugging** est désactivé sur le téléphone.
3. Le port a changé : Android affiche un port aléatoire (ex. 37291)
   qui change à chaque redémarrage du Wi-Fi. Relis l'IP + le port.
4. **Firewall Windows** : la première fois, accepte la fenêtre
   « Autoriser les accès réseau » pour adb.

## Le QR pairing échoue (« Pairing failed »)

- Le code du QR **expire en ~60 s** : re-scanne le QR sur le téléphone
  et ressaisis le code tout de suite.
- Le code doit être saisi **exactement** (chiffres uniquement).
- Si le téléphone est en mode avion ou hors Wi-Fi, ça ne marchera pas.

## Le téléphone se déconnecte tout seul (wireless)

**Causes** :
1. Écran verrouillé trop longtemps → Android coupe ADB wireless
   (comportement normal pour économiser). Garde l'écran allumé pendant
   la session, ou utilise un profil « toujours éveillé ».
2. Changement de réseau (passage 2,4↔5 GHz, roaming) → reconnecte.
3. Battery saver actif → désactive-le pendant la session.

## La latence est trop haute

Réglages du mirroring (dans le futur écran Settings ; en attendant,
les valeurs par défaut sont 1280 px / 8 Mbit/s / 60 fps) :
- baisse le bitrate (`6M`) si le Wi-Fi est faible,
- baisse la résolution (`960`) si c'est du Wi-Fi distant,
- privilégie **USB** pour du jeu ou du streaming : c'est nettement
  plus stable.

## Plusieurs téléphones branchés

SIMULO liste chaque appareil séparément (par serial). Choisis lequel
connecter — la session cible toujours le serial choisi.

## Windows : « adb.exe n'est pas un programme reconnu » (terminal)

Tu n'as pas ajouté `C:\platform-tools` au Path. Voir « ADB not found »
ci-dessus. (Dans SIMULO ce n'est pas nécessaire que tu tapes adb :
mais le Path aide la détection.)

## Caveat sécurité (sans fil, Android < 11)

Sur les anciennes versions d'Android, `adb connect` sans pairing sur
un Wi-Fi public est risqué (comme tout outil réseau). **Règle simple :
ne jamais faire de mirroring sans fil sur un Wi-Fi non fiable**
(cafés, aéroports). USB, lui, reste 100 % local.
