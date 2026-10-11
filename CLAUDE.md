# scam-detector

Projet n°2 du portfolio cybersecurite de CREZZUSS (voir memoire projet-securite-portfolio) :
detecteur de fausses plateformes d'investissement / de gains en ligne (zone UEMOA) a partir d'une URL.
Automatise ce qui a ete fait a la main pour ficdes-bank.com (20/09) et pour earnfast.jn0933.top (11/10).

## Principe
Lecture seule et non intrusive : une seule requete GET, on lit en-tetes + HTML, on n'envoie rien, on
ne se connecte a rien, on ne teste aucune faille. On regarde le site de l'exterieur.

## Commandes
- `npm run scan -- <url> [--json]` : analyse une URL, affiche un verdict.
- `npm test` : build + `node --test` (6 tests, fetch simule, sans reseau).

## Structure
- `src/fetch.ts` : instantane du site (snapshot), domaine enregistrable, texte visible, age via RDAP (optionnel, jamais bloquant).
- `src/signals.ts` : signaux independants (TLD a risque, pas d'HTTPS, domaine recent, discours gains/parrainage/depot/bonus/garanti, absence de mentions legales, gabarit etranger + modele connu, interface admin).
- `src/bceao.ts` : graine PARTIELLE d'etablissements agrees ; "non trouve" n'est pas "illegal". A rafraichir depuis bceao.int.
- `src/analyze.ts` : ponderation -> score 0-100 -> verdict (danger / suspect / prudence / aucun_signal_fort).
- `src/cli.ts` : sortie texte ou `--json`.

## Regles d'honnetete (importantes)
- Un verdict n'est PAS une preuve : ce sont des signaux, a confronter a la liste officielle BCEAO.
- Ne jamais affirmer passivement "admin sans authentification" : une page de connexion contient les memes titres. Le signal admin est "low" et renvoie a une verif dans le code.
- Erreur evitee le 11/10 : sur earnfast, le squelette admin servi n'exposait pas de donnees (tableaux vides, page de connexion presente). Ne pas conclure a une fuite sans preuve.

## Cas de test reel
`earnfast.jn0933.top` : verdict DANGER (79/100), gabarit chinois "Skill Money", parrainage + bonus, .top, pas de mentions legales.

## Suite prevue
Rafraichir la liste BCEAO depuis la source officielle, petite page web (coller un lien -> verdict), README FR/EN, licence MIT, publication GitHub (apres accord utilisateur).
