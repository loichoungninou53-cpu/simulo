# ARCHITECTURE — SIMULO

## Principe directeur

SIMULO n'est **pas** un script qui lance quelques commandes derrière un
bouton. C'est une application desktop structurée en 4 couches, avec une
dépendance strictement descendante :

```
┌────────────────────────────────────────────────────────────┐
│  Frontend React (TypeScript)                               │
│  ConnectScreen · MirrorScreen · DiagPanel · StatusHeader   │
│  — n'affiche QUE des données réelles renvoyées par Rust    │
└───────────────────────────┬────────────────────────────────┘
                            │ invoke() — commandes nommées
┌───────────────────────────▼────────────────────────────────┐
│  simulo (src-tauri) — FINE                                  │
│  AppState (Mutex) · commandes #[tauri::command]            │
│  — injecte l'horloge, la persistance, les events           │
│  — NE CONTIENT AUCUNE LOGIQUE MÉTIER                        │
└───────────────────────────┬────────────────────────────────┘
                            │ appels de fonctions
┌───────────────────────────▼────────────────────────────────┐
│  simulo-desktop-core — ORCHESTRATION                        │
│  AdbManager · ScrcpyManager · scan_devices · connect_      │
│  device · start/stop_mirror · send_text/send_key · diag    │
│  — 16 tests unitaires                                      │
└───────────────────────────┬────────────────────────────────┘
                            │ appels de fonctions
┌───────────────────────────▼────────────────────────────────┐
│  simulo-core — MODÈLE & RÈGLES (pur, zéro OS)              │
│  Device · AdbState (parsing) · Capability (Android/iOS)    │
│  ConnectPhase (machine à états) · QrSession                │
│  — 26 tests unitaires                                      │
└────────────────────────────────────────────────────────────┘
```

## Pourquoi cette découpe

1. **Testable sans Windows** : `simulo-core` et `simulo-desktop-core`
   n'ont aucune dépendance GUI. On les compile et on les teste sur
   n'importe quelle machine (c'est ce qui est fait : 42 tests verts).
2. **Le Tauri reste fin** : `src-tauri/src/lib.rs` est un wrapper.
   Chaque commande = 5 à 15 lignes + un appel core. Moins de surface
   de bug, plus facile à auditer.
3. **Honnêteté par construction** : les capacités d'un appareil sont
   *calculées* par `simulo-core::caps` à partir de la version OS.
   L'UI n'invente rien : un bouton n'existe que si la capacité existe.
4. **Event-driven** (exigence perf du cahier des charges) : la
   machine à états `ConnectPhase` avance par événements
   (`DeviceDetected`, `Authorized`, `StreamReady`, `Disconnected`,
   `Error`). Pas de `sleep`, pas de boucle de vérification aveugle.
   Le frontend fait un scan léger (4 s) uniquement sur l'écran
   de connexion — il est arrêté dès qu'une session est active.

## Le cycle de connexion (le cœur du produit)

```
 [IDLE]
   │ DeviceDetected            (ADB voit l'appareil)
   ▼
 [DETECTING] ──AuthorizationPending──▶ [AWAITING_AUTH]
   │ Authorized (déjà paired)              │ Authorized
   ▼                                       ▼
 [STARTING] ◀─────────────────────────────┘
   │ StreamReady             (scrcpy tourne, la fenêtre vidéo est ouverte)
   ▼
 [STREAMING] ◀── l'utilisateur utilise son téléphone sur le PC
   │ Disconnected | UserStop | Error(msg)
   ▼
 [STOPPED] / [FAILED(msg)] ── DeviceDetected ──▶ [DETECTING] (reconnexion)
```

Chaque transition est une fonction **pure** (`transition(phase, ev)`)
testée individuellement. Les événements hors contexte (ex. `StreamReady`
sans démarrage) sont ignorés proprement — jamais de panic.

## Les données

- **Device** : `id, platform, manufacturer, model, osVersion, serial,
  connectionType, connectionStatus, battery, resolution, refreshRate,
  capabilities, lastSeen, paired, trusted`. Tout champ inconnu est
  `None` — jamais une valeur inventée.
- **Mémoire de reconnexion** : le frontend stocke en `localStorage`
  (clé `simulo.recent`) les 5 derniers appareils (nom + serial +
  timestamp). Rien de sensible, rien sur le réseau.
- **QR** : session de 5 minutes à usage unique. La charge utile
  `simulo://pair?sid=…&tok=…&exp=…` ne contient **aucun** secret
  permanent, aucun credential, aucune donnée du téléphone.

## Les processus externes (et leur vie)

| Processus | Qui le lance | Qui le tue |
|---|---|---|
| `adb` (server) | AdbManager à la première commande | le système / arrêt SIMULO |
| `scrcpy` | ScrcpyManager.start | `stop_mirror`, crash SIMULO (impl `Drop`) |

Le `ScrcpyManager` implémente `Drop` : si SIMULO crash, scrcpy ne
survit pas. Les sorties des commandes sont journalisées dans
`AppState.logs` (visibles dans Diagnostics → Recent activity).

## Sécurité des surfaces

- **Rien ne passe par internet.** ADB/USB = câble ; wireless = réseau
  local (le téléphone et le PC sur le même Wi-Fi).
- **Tauri CSP** : `default-src 'self'` — le frontend ne peut charger
  aucun script distant.
- **Les chemins adb/scrcpy** sont détectés (PATH + emplacements
  classiques Windows) ; on ne télécharge **rien** automatiquement.
