import { stripAccentsLower } from "./fetch.js";

/**
 * Etablissements autorises a collecter de l'epargne ou offrir des services de paiement dans l'UEMOA
 * (banques, etablissements de monnaie electronique, grands SFD / microfinances), les 8 pays :
 * Benin, Burkina Faso, Cote d'Ivoire, Guinee-Bissau, Mali, Niger, Senegal, Togo.
 *
 * Liste CURATED a partir de la connaissance publique des agrements BCEAO / Commission bancaire UMOA.
 * Elle reste INDICATIVE : la liste officielle sur bceao.int fait seule foi, et des noms changent
 * (fusions, retraits d'agrement). Regles d'usage :
 *  - "trouve" ne prouve PAS qu'un site est l'etablissement en question (un escroc peut usurper un nom).
 *  - "non trouve" ne prouve PAS l'illegalite, seulement l'absence de cette graine.
 * Mettre a jour via `npm run update-bceao` (voir scripts/update-bceao.md) avant tout usage serieux.
 */
export const SEED_LICENSED = [
  // Groupes bancaires presents dans plusieurs pays
  "ecobank", "bank of africa", "boa", "orabank", "coris bank", "nsia banque", "societe generale",
  "sgbci", "bsic", "uba", "united bank for africa", "banque atlantique", "bgfibank", "diamond bank",
  "standard chartered", "citibank", "attijariwafa", "cbao", "bicici", "sib", "bni", "versus bank",
  "bridge bank", "gtbank", "guaranty trust", "afriland", "banque of africa", "vista bank", "sunu bank",
  "banque populaire", "wafa", "bdm", "bms", "bnda", "bim", "bank of baroda", "ltb", "lesi la",
  // Banques par pays (echantillon large)
  "boa benin", "banque atlantique benin", "bgfibank benin", "nsia banque benin", "sonibank",
  "bank of africa burkina", "coris bank burkina", "banque agricole", "banque de l habitat",
  "banque nationale d investissement", "bni ci", "banque de l union", "bdu", "oragroup",
  "banque sahelo saharienne", "banque malienne de solidarite", "banque commerciale du sahel",
  "banque de developpement du mali", "sonibank niger", "bagri", "banque atlantique niger",
  "banque agricole du senegal", "banque de l habitat du senegal", "cbao senegal", "bis", "bhs",
  "banque togolaise pour le commerce", "btci", "union togolaise de banque", "utb", "orabank togo",
  // Etablissements de monnaie electronique et mobile money agrees
  "wave", "flooz", "moov money", "moov africa", "mtn mobile money", "mtn momo", "orange money",
  "mixx by yas", "yas", "togocom", "celtiis cash", "wizall", "intouch", "e money", "emoney",
  "gime", "cofina", "paydunya", "cinetpay", "fedapay", "semoa", "sunu", "qats",
  // Grands SFD / microfinances agreees
  "baobab", "advans", "microcred", "cofina", "fucec", "faitiere des unites", "pamecas", "acep",
  "rcpb", "reseau des caisses populaires", "u imcec", "mec", "cms", "credit mutuel du senegal",
  "fidelis finance", "alios finance", "cofina",
];

export interface LicenseMatch {
  licensed: boolean;
  matchedName?: string;
}

/**
 * Cherche un etablissement connu dans le nom du site ou son texte. Voir l'avertissement en tete :
 * un resultat positif n'authentifie pas le site, un resultat negatif n'est pas un verdict.
 */
export function matchLicensed(haystack: string): LicenseMatch {
  const text = stripAccentsLower(haystack);
  // Tri par longueur decroissante : on prefere le nom le plus specifique trouve.
  for (const name of [...SEED_LICENSED].sort((a, b) => b.length - a.length)) {
    if (text.includes(name)) return { licensed: true, matchedName: name };
  }
  return { licensed: false };
}
