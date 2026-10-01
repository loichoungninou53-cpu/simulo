# Wireless Connection

Sans câble, sur le même Wi-Fi que le PC.

## Étapes

1. Téléphone + PC : **même réseau Wi-Fi** (attention : certains
   routeurs isolent le 2,4 GHz du 5 GHz — mets les deux sur le même).
2. Téléphone : Options développeur → **Wireless debugging** → activé.
3. Lis l'**IP** et le **port** affichés (le port change quand le Wi-Fi
   redémarre).
4. SIMULO → onglet **Wireless** → saisis IP + port → **Connect**.
5. Première fois : Windows peut demander d'autoriser **adb** sur le
   réseau → accepte.

## Comportements normaux

- Le téléphone verrouillé longtemps → ADB se coupe (économie Android)
  → reconnecte.
- Changement de réseau → il faut reconnecter.
- Le mode **Battery saver** du téléphone coupe les connexions → désactive-le.

## Sécurité

- Ne **jamais** faire de mirroring sans fil sur un Wi-Fi public.
- Sur Android 11+, le pairing chiffré est utilisé automatiquement.
