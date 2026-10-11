# Mettre a jour la liste des etablissements agrees

La graine `src/bceao.ts` est indicative. Pour un usage serieux, la remplacer par la liste officielle.

## Sources officielles
- BCEAO, etablissements de credit agrees : https://www.bceao.int (rubrique Supervision bancaire /
  Systeme bancaire / Etablissements agrees).
- BCEAO, etablissements de monnaie electronique agrees (meme site).
- Commission bancaire de l'UMOA : liste des banques et etablissements financiers.
- Par pays, les SFD (microfinances) agrees sont publies par les ministeres des Finances / cellules
  de surveillance (ex. DRS-SFD au Senegal).

## Methode
1. Telecharger la liste a jour (souvent un PDF ou un tableau).
2. En extraire les denominations, en minuscules, accents retires.
3. Remplacer `SEED_LICENSED` dans `src/bceao.ts`, en gardant l'avertissement en tete.
4. Dater la mise a jour dans ce fichier.

Ne pas aspirer automatiquement sans verifier les conditions d'utilisation du site source.

Derniere mise a jour de la graine : 2026-10-11 (curated, non officielle).
