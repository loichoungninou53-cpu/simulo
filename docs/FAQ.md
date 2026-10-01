# FAQ — SIMULO

**SIMULO est gratuit ?**
Oui, pour un usage personnel. Le code est MIT.

**Faut-il internet pour utiliser SIMULO ?**
Non. USB = 100 % local. Wi-Fi = réseau local seulement. Le seul moment
où internet sert : installer ADB et scrcpy (une fois, depuis leurs
sites officiels). La landing page elle-même fonctionne hors-ligne.

**Pourquoi l'écran du téléphone apparaît dans une fenêtre scrcpy ?**
scrcpy est le moteur officiel (GPL-3.0) : c'est lui qui fait le
streaming vidéo avec la latence minimale. SIMULO l'orchestre (démarrage,
options, arrêt, crash) et fournit l'interface de contrôle. C'est la
choix du cahier des charges : ne pas réécrire un moteur qui existe.

**Le mirroring marche-t-il avec l'écran du téléphone verrouillé ?**
Le flux s'arrête quand Android met l'écran en veille. Garde l'écran
allumé pendant la session (ou « Écran toujours allumé » dans le cas
d'un test).

**Puis-je connecter plusieurs téléphones ?**
Oui : SIMULO les liste tous (par serial). Une session de mirroring à
la fois (celle qui est lancée), mais l'historique se cumule.

**Où va le fichier d'enregistrement ?**
Dans le dossier temporaire Windows (`%TEMP%\nom.mp4`), format MP4
(scrcpy). L'écran de session te le dira.

**Mon antivirus bloque scrcpy / adb, c'est normal ?**
Des fausses détections arrivent sur les outils de dev. Vérifie que le
binaire vient des sources officielles (GitHub Genymobile /
developer.android.com) puis ajoute une exception si besoin.

**Windows 10 ou 11 ?**
Les deux (x64). Le MVP est développé pour Windows 11.

**Le QR code contient-il un mot de passe ?**
Non. Un jeton temporaire de 5 minutes, usage unique, sans aucune
donnée sensible (voir SECURITY.md).

**Mon TECNO POP 10 est le téléphone de test officiel ?**
Oui : c'est le premier appareil sur lequel chaque fonction est validée
avant d'être déclarée stable.
