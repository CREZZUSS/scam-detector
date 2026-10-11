# scam-detector

**Repérer une fausse plateforme d'investissement ou de gains en ligne, à partir d'une simple URL.**
*English version below.*

Chaque semaine, de nouveaux sites promettent de « gagner de l'argent en regardant des pubs » ou de
« doubler votre dépôt ». Ils se ressemblent tous : bonus d'inscription, parrainage, retrait facile,
et un jour le site disparaît avec l'argent. `scam-detector` lit les signaux publics d'un site et rend
un avis argumenté, en français et en anglais.

L'analyse est **non intrusive** : une seule lecture de la page, aucune connexion, aucune donnée
envoyée, aucun test de faille. L'outil regarde le site de l'extérieur, comme un visiteur prudent.

## Utilisation

En ligne de commande :

```bash
npm install
npm run scan -- https://le-site-a-verifier.top
```

Dans le navigateur (coller un lien, voir le verdict) :

```bash
npm run serve   # puis ouvrir http://localhost:8099
```

Sortie JSON pour un autre programme : `npm run scan -- <url> --json`.

## Exemple réel

Lancé sur un vrai site « regarde des pubs et gagne » (gabarit chinois « Skill Money », parrainage,
bonus de 800 FCFA) :

```
Site analyse : https://earnfast.jn0933.top/
Domaine      : jn0933.top
Score risque : 79/100
Verdict      : DANGER

[!!] Aucun etablissement agree reconnu
[!]  Bonus d'inscription
[!]  Pas de mentions legales ni d'identite d'entreprise
[.]  Extension de domaine a risque (.top)
```

## Ce que l'outil regarde

| Signal | Pourquoi |
|---|---|
| Nom absent de la liste BCEAO | Collecter de l'épargne dans l'UEMOA exige un agrément. Un site qui sollicite de l'argent sans y figurer est à vérifier en priorité. |
| Discours de gains + parrainage + dépôt + bonus | Le cœur des systèmes pyramidaux : récompenser l'invitation de proches, faire déposer pour « débloquer » des gains. |
| « Rendement garanti », « sans risque » | Aucun placement légitime ne garantit un gain. |
| Domaine très récent | Un site d'un mois qui promet de l'argent disparaît souvent avant le premier retrait (âge via RDAP). |
| Extension jetable (.top, .xyz…), pas d'HTTPS | Sites montés vite et abandonnés. |
| Pas de mentions légales | Personne d'identifiable, personne à poursuivre. |
| Gabarit étranger revendu (chinois, cyrillique) | Modèle d'arnaque clé en main, habillé à la hâte. |

Chaque signal a une gravité ; la somme pondérée donne un score sur 100 et un verdict :
**danger**, **suspect**, **prudence** ou **aucun signal fort**.

## Honnêteté de l'outil

Un verdict **n'est pas une preuve**, ce sont des signaux. Deux garde-fous importants :

- Trouver un nom d'établissement agréé n'authentifie pas le site : un escroc peut usurper un nom.
  Ne pas y figurer n'est pas une condamnation, seulement un signal.
- L'outil ne prétend **jamais** qu'un panneau d'administration est « sans protection » juste parce
  qu'il le voit : une page de connexion contient les mêmes titres. L'absence réelle
  d'authentification se vérifie dans le code, pas en attaquant le site.

La liste BCEAO fournie est une **graine indicative**. Pour un usage sérieux, la remplacer par la
liste officielle (voir `scripts/update-bceao.md`).

## Tests

```bash
npm test   # 10 tests, node:test, fetch simulé, sans réseau ni dépendance
```

Le serveur refuse d'analyser une adresse locale ou privée (garde-fou contre le détournement SSRF).

---

# English

**Spot a fake investment or "earn money" platform from a single URL.**

New sites promise to "earn money watching ads" or "double your deposit" every week, with the same
pattern: signup bonus, referral rewards, easy withdrawals, then the site vanishes with the money.
`scam-detector` reads a site's public signals and returns a reasoned verdict (FR/EN).

The analysis is **non-intrusive**: one read of the page, no login, no data sent, no vulnerability
testing. It looks at the site from the outside.

```bash
npm install
npm run scan -- https://site-to-check.top   # CLI
npm run serve                               # web page at http://localhost:8099
```

**What it checks:** name absent from the BCEAO licensed list, earn/referral/deposit/bonus wording,
"guaranteed returns", very new domain (RDAP), throwaway TLD, no HTTPS, no legal notice, resold
foreign template. Each signal has a severity; the weighted total gives a 0–100 score and a verdict.

**Honesty:** a verdict is not proof, only signals. Matching a licensed name does not authenticate a
site, and the tool never claims an admin panel is "unprotected" just from seeing it — that is checked
in the code, not by attacking the site. The bundled BCEAO list is an indicative seed; replace it with
the official list for serious use.

## License

MIT, by [CREZZUSS](https://crezzuss.com), Lomé, Togo.
