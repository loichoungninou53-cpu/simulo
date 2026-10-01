# Privacy — SIMULO

## En une phrase

**Ton téléphone, ton écran, ton réseau : rien ne sort de chez toi.**

## Détail

| Donnée | Où elle va | Où elle reste |
|---|---|---|
| Flux vidéo du téléphone | PC (fenêtre scrcpy) | jamais stocké (sauf enregistrement demandé, sur ton disque) |
| Tap/clic/saisie | téléphone (via ADB local) | nulle part |
| IP/port du pairing | session locale (5 min max) | jeton expiré = détruit, jamais persisté |
| Historique « Recent devices » | localStorage de l'app | uniquement sur ton PC |
| Journal d'activité | mémoire + Diagnostics | uniquement sur ton PC |

## Ce qu'il n'y a PAS

- ❌ aucun compte, aucun e-mail, aucun identifiant
- ❌ aucune télémétrie / analytics / crash report
- ❌ aucun appel réseau externe (testable : coupe le Wi-Fi du PC,
  SIMULO marche toujours en USB)
- ❌ aucun tracking publicitaire, aucune revente de données

## Vérifier par toi-même

- Coupe l'internet du PC → SIMULO se connecte toujours en USB.
- Diagnostics → tout est affiché en clair, rien de caché.
- Le code est public et lisible : `crates/` contient toute la logique.
