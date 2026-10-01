# Support iPhone — la version honnête

## Ce que SIMULO fait aujourd'hui

- ✅ **Détection** de l'iPhone (canal usbmuxd, pas ADB).
- ✅ **Infos appareil** (modèle, iOS) et **diagnostics**.
- ✅ Un écran de session avec ce qui est réellement possible.

## Ce que SIMULO ne fait PAS (et pourquoi)

- ❌ **Mirroring d'écran** : sur iOS **standard** (sans jailbreak, sans
  MDM/entreprise), Apple n'autorise aucun outil tiers à capturer
  l'écran. C'est une restriction d'Apple, pas un choix de SIMULO.
- ❌ **Contrôle complet** (clavier/souris sur l'iOS).

SIMULO **ne simule jamais** ces fonctions : l'écran « Devices » le dit
explicitement, et les boutons inexistants n'apparaissent pas.

## Pourquoi (pour les curieux)

- L'écosystème iOS ferme le mirroring aux apps tierces hors
  **AirPlay** (Apple) et des outils **MDM/entreprise** (payants,
  destinés aux flottes).
- Des projets open source existent (libimobiledevice, frida, etc.)
  mais ils ne débloquent pas le mirroring complet sur iOS stock.
- Promettre « ça marche comme sur Android » serait mentir — règle 79
  du cahier des charges, appliquée.

## Ce qui est envisagé (roadmap, honnête)

- Améliorer la détection et les diagnostics iPhone.
- Documenter les solutions officielles Apple (AirPlay vers un Mac,
  « Mon iPhone » dans Explorer Windows pour les fichiers).
- Si Apple ouvre un API public un jour → l'intégrer en premier.
