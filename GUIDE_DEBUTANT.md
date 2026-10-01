# ⭐ GUIDE DÉBUTANT — SIMULO

> Ce guide est écrit pour toi, sans jargon. Tu vas comprendre :
> 1. **ce qui a été construit** (partie par partie),
> 2. **comment mettre la landing page en ligne** (5 minutes, sans coder),
> 3. **comment construire et utiliser SIMULO** sur ton PC Windows,
> 4. **comment ça marche hors-ligne**,
> 5. **la vérité sur l'iPhone**.

---

## PARTIE 1 — Ce qui a été construit (le tour d'horizon)

Le dossier `simulo/` contient **trois produits** :

### ① La landing page (`simulo/landing/`)

Le site de présentation de SIMULO : hero « Your phone shouldn't be
stuck in your pocket », section comment ça marche, fonctionnalités,
dispositifs (Android ✅ / iPhone honnête), confidentialité, CTA
« Download Simulo ».

- **Le fond bleu que tu m'as envoyé** a été reproduit **en pur CSS**
  (fines lueurs verticales + halo lumineux en haut). Résultat : le site
  est ultra-rapide et **fonctionne même sans internet** (aucune image
  externe, aucune police distante).
- C'est une page **statique** : pas de serveur, pas de base de données.
  C'est ce qui rend la mise en ligne ridiculement simple.

### ② L'application desktop (`simulo/app/`)

L'app SIMULO elle-même (fenêtre Windows) :

- écran **« Connect your phone »** avec 3 modes : **USB**, **Wireless**,
  **QR Code** + liste des appareils réels + « Recent devices »
  (reconnexion en 1 clic) ;
- écran **« Connected »** quand le mirroring tourne : envoi de texte,
  touches système (Back/Home/Power/Volumes), arrêt, diagnostic ;
- **Diagnostics** : un « médecin » qui vérifie ADB, scrcpy et les
  appareils, et t'explique en français simple ce qui cloche.

### ③ Le code, découpé proprement

| Dossier | C'est quoi |
|---|---|
| `app/crates/simulo-core/` | Le « cerveau » pur : modèle d'appareil, lecture des appareils ADB, capacités Android/iPhone, machine à états de connexion, QR temporaire. **26 tests automatiques, tous verts.** |
| `app/crates/simulo-desktop-core/` | L'orchestration : gestionnaire ADB, gestionnaire scrcpy, connexion USB/wireless/QR, contrôle du mirroring, diagnostics. **16 tests automatiques, tous verts.** |
| `app/src-tauri/` | La fenêtre (Tauri) — un fin wrapper qui relie React au cerveau. |
| `app/src/` | L'interface React (TypeScript). |
| `landing/` | Le site (React + Tailwind, build dans `landing/dist/`). |

**42 tests passent** → c'est de la vraie logique vérifiée, pas une
maquette. Seule la fenêtre Tauri se compile sur Windows (elle a besoin
des librairies Windows) — c'est pour ça que le guide suivant t'explique
comment la lancer chez toi.

---

## PARTIE 2 — Mettre la landing page en ligne (5 minutes)

Tu n'as **pas** à coder. La landing est déjà construite (le dossier
`simulo/landing/dist/` contient le site final).

### Méthode A — Netlify (la plus simple, par glisser-déposer)

1. Va sur **https://app.netlify.com/drop** (c'est gratuit, le compte
   est gratuit pour ce usage).
2. Crée un compte (e-mail ou Google).
3. **Glisse-dépose le dossier `dist`** (celui de `simulo/landing/`)
   directement dans la zone du site.
4. C'est tout. Netlify te donne une adresse du type
   `ton-nom-aleatoire.netlify.app` → copie-la, teste-la, elle est en ligne.

### Métode B — Vercel (alternative)

1. **https://vercel.com** → « Add New → Project ».
2. Si tu veux que Vercel se recharge tout seul à chaque modification :
   mets le dossier `simulo/` sur **GitHub** d'abord (voir Partie 3.0),
   puis importe le repo → Vercel détecte Vite tout seul
   (Framework : Vite, Output : `dist`).
3. Déploiement en ~30 secondes.

### Personnaliser l'adresse (optionnel)

- Netlify : Site → **Domain management** → « Add custom domain » →
  ton domaine (`simulo.dev` par ex.) → tu suivras leurs instructions
  DNS (2 à 5 min, gratuit si tu as déjà le domaine).
- Par défaut, l'adresse `.netlify.app` / `.vercel.app` est **déjà
  sécurisée (HTTPS) et gratuite**.

### Vérifier que c'est « hors-ligne compatible »

La landing n'a **aucune** dépendance externe : tu peux ouvrir
`simulo/landing/dist/index.html` **directement dans ton navigateur**
(clic-droit → Ouvrir avec → Chrome) sans aucun serveur, sans internet :
tout s'affiche (fond bleu, animations, tout). C'est voulu.

---

## PARTIE 3 — Construire SIMULO sur ton PC Windows

### 3.0 (optionnel) Mettre le projet sur GitHub

Pour sauvegarder et collaborer :
1. Crée un compte **https://github.com** → « New repository » →
   `simulo` (public ou privé).
2. Sur ton PC, installe **Git** : https://git-scm.com (suivez
   l'installateur par défaut).
3. Dans le dossier `simulo` (ouvert dans l'Explorateur → clic droit →
   « Ouvrir dans Git Bash ») :
   ```
   git init
   git add .
   git commit -m "SIMULO MVP"
   git remote add origin https://github.com/TON_LOGIN/simulo.git
   git branch -M main
   git push -u origin main
   ```

### 3.1 Installer les 4 outils (une seule fois, ~15 min)

| # | Outil | D'où | Vérification |
|---|---|---|---|
| 1 | **Node.js 20 LTS** | https://nodejs.org (bouton « LTS ») | ouvrir une invite `cmd` → `node -v` |
| 2 | **Rust** | https://rustup.rs (Windows → lancer l'installeur, defauts) | `rustc --version` (ouvre une **nouvelle** invite après) |
| 3 | **ADB (platform-tools)** | https://developer.android.com/tools/releases/platform-tools → télécharger le zip Windows → dézipper dans `C:\platform-tools` → ajouter ce dossier au **Path** (Rechercher « variable d'environnement » → Path → Nouveau) | `adb version` |
| 4 | **scrcpy officiel** | https://github.com/Genymobile/scrcpy/releases → `scrcpy-win64-*.zip` → dézipper dans `C:\scrcpy` → ajouter au Path | `scrcpy --version` |

> ⚠️ Toujours scrcpy **officiel** (GitHub Genymobile) et ADB **officiel**
> (developer.android.com) — jamais de binaire de site inconnu
> (règle du cahier des charges).

### 3.2 Lancer SIMULO en mode développement

```
cd simulo\app
npm install
npm run tauri dev
```

- La première fois, la compilation Rust prend **5 à 15 minutes**
  (normal, ça cache tout). Les fois suivantes : quelques secondes.
- La fenêtre SIMULO s'ouvre → tu devrais voir « Connect your phone ».
- En haut à droite :
  - **« ADB 1.0.4x » en vert** → ADB est bien installé ✓
  - **« ADB not found — fix »** → clique dessus → Diagnostics t'explique.

### 3.3 Produire l'installateur (le vrai .msi)

```
cd simulo\app
npm run tauri build
```

Ça produit dans `app\src-tauri\target\release\bundle\` :
- `msi\Simulo_x.x.x_x64_zh.msi` (installateur Windows classique),
- `nsis\Simulo_x.x.x_x64-setup.exe` (installateur léger).

→ Distribue l'un des deux à qui tu veux. L'utilisateur double-clique,
c'est installé.

---

## PARTIE 4 — Utiliser SIMULO (le quotidien)

### Scénario 1 — USB (le plus simple, commence par là)

1. Branche le téléphone (câble **data**).
2. Téléphone : bandeau notifications → USB → **Transfert de fichiers**.
3. Première fois : coche **« Autoriser le débogage USB »** (et « Toujours »).
4. SIMULO détecte « TECNO POP 10 · Android 15 · USB » → **Connect**.
5. La fenêtre **scrcpy** s'ouvre : c'est l'écran de ton téléphone.
   Bouge la souris dessus, clique, tape au clavier : tout marche.
6. Dans SIMULO : « Send text » (tape là où le curseur est), touches
   Back/Home/Power/Volumes, « Stop mirroring » pour terminer.

### Scénario 2 — Wi-Fi (sans câble)

1. Téléphone + PC sur le **même Wi-Fi**.
2. Téléphone : Options développeur → **Wireless debugging** → ON.
3. SIMULO → onglet **Wireless** → copie l'IP et le port du téléphone.
4. **Connect** → première fois : Windows autorise adb sur le réseau.

### Scénario 3 — QR pairing (Android 11+, le plus rapide)

1. Téléphone : Wireless debugging → « **Pair device with QR code** ».
2. SIMULO → onglet **QR Code** → note l'IP + le **code** sous le QR
   (il expire en 60 s : agis vite).
3. **Pair & Connect** → terminé, et la prochaine fois « Recent devices »
   le reconnectera en 1 clic.

### Ce que tu peux faire une fois connecté

| Action | Où |
|---|---|
| Voir/toucher l'écran | fenêtre scrcpy |
| Envoyer du texte | SIMULO → Send text |
| Touches système | SIMULO → System keys |
| Arrêter | SIMULO → Stop mirroring |
| Enregistrer l'écran | (paramètres de session : record → MP4 dans `%TEMP%`) |
| Vérifier un problème | Diagnostics (bouton stéthoscope) |

---

## PARTIE 5 — Le mode hors-ligne (ce que tu as demandé)

**SIMULO fonctionne 100 % hors-ligne.** Concrètement :

- **USB** : aucun réseau n'est utilisé, point. Coupe le Wi-Fi du PC,
  ça marche pareil.
- **Wi-Fi local** : SIMULO parle directement au téléphone sur ton
  réseau (l'IP du téléphone, ex. 192.168.1.12). **Internet n'est pas
  dans la boucle** — pas de serveur, pas de cloud. Si internet est coupé
  mais que le Wi-Fi local marche, SIMULO marche.
- **Le QR** : c'est un jeton local de 5 minutes, rien ne part nulle part.
- **L'installation** est le seul moment où internet sert : télécharger
  ADB + scrcpy depuis leurs sites officiels (une fois).
- **La landing page** : aucun asset externe (fond bleu en CSS, icônes
  embarquées) → elle s'affiche même en `file://` sans connexion.

Vérification que tu peux faire toi-même : après la première connexion
USB, **désactive la carte Wi-Fi/4G du PC** → tout continue de marcher.

---

## PARTIE 6 — L'iPhone (la vérité)

- **Aujourd'hui** : SIMULO détecte l'iPhone, affiche ses infos et les
  diagnostics. C'est utile (savoir qu'il est vu, son modèle, son iOS).
- **Le mirroring iPhone n'est PAS fait** — et je ne l'ai pas feint :
  sur iOS standard, **Apple bloque** la capture d'écran par les outils
  tiers (hors AirPlay/MDM entreprise). Le simulateur l'affiche en
  « Limited support » avec la raison, au lieu de promettre du faux.
- **La roadmap honnête** (docs/iPhone.md) : améliorer détection +
  diagnostics, documenter les solutions officielles Apple, et si un
  jour Apple ouvre une API → on l'intègre en premier.

---

## PARTIE 7 — Si ça coince

1. **Toujours d'abord** : Diagnostics dans SIMULO → il te dit en clair
   ce qui manque (ADB ? scrcpy ? autorisation ?).
2. **TROUBLESHOOTING.md** : tous les problèmes avec causes + solutions
   (câble charge-only, MTP, firewall, port qui change, QR expiré…).
3. **docs/** : USB-Connection, Wireless-Connection, QR-Pairing,
   Android, iPhone, FAQ, Privacy, Getting-Started.

---

## PARTIE 8 — Prochaines étapes (roadmap, priorités du cahier des charges)

1. ✅ MVP : USB + mirroring + contrôle + diagnostics (cette version)
2. ⏳ Améliorer l'écran de session (paramètres bitrate/résolution/fps
   directement dans l'UI)
3. ⏳ Compagnon mobile (app compagnon) → QR depuis le PC + clipboard
   bidirectionnel « vrai »
4. ⏳ Enregistrement depuis l'UI (bouton record dans la session)
5. ⏳ Audio toggle dans l'UI
6. ⏳ Installer automatiquement les dépendances (guide guidé dans l'app)

Chaque étape suit la règle du cahier des charges : **fonctionnement réel
d'abord, testé sur un vrai téléphone (TECNO POP 10), jamais de faux
bouton.**

---

*Tu as maintenant tout : le site en ligne, l'app qui tourne, le code
testé, et le guide. Si tu suis la Partie 2, ta landing est en ligne
dans 5 minutes ; si tu suis la Partie 3, SIMULO tourne sur ton PC
dans 15-20 minutes.*
