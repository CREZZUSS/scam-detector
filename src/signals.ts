import { matchLicensed } from "./bceao.js";
import { stripAccentsLower } from "./fetch.js";
import type { Flag, SiteSnapshot } from "./types.js";

/** Extensions souvent gratuites ou a bas cout, surrepresentees dans les sites jetables. */
const RISKY_TLDS = new Set(["top", "xyz", "icu", "cfd", "sbs", "rest", "club", "online", "site", "fun", "cyou", "buzz"]);

/** Mots du discours "gains faciles", sans accent. Chaque groupe pese dans le score. */
const EARN_WORDS = ["gagnez", "gagner", "gain", "earn", "revenus", "income", "profit", "benefice"];
const FAST_WORDS = ["rapide", "facile", "instant", "immediat", "aujourd hui", "chaque jour", "quotidien", "daily", "per day", "par jour"];
const REFERRAL_WORDS = ["parrain", "parrainage", "invitez", "invite", "referral", "code d invitation", "filleul", "equipe"];
const DEPOSIT_WORDS = ["recharge", "depot", "deposez", "investir", "investissez", "invest", "vip", "forfait", "plan ", "palier"];
const BONUS_WORDS = ["bonus", "offert", "offerts", "cadeau", "welcome", "bienvenue", "inscription offerte"];
const WITHDRAW_WORDS = ["retrait", "retirer", "withdraw", "payout", "encaisser"];
// "garantie" et "100%" seuls sont trop courants (garantie legale, "100% sur mesure") : le drapeau
// n'est leve que si ces mots coexistent avec un contexte de gains/depot (voir discourseSignal).
const GUARANTEE_WORDS = ["garanti", "garantie", "sans risque", "risk free", "rendement garanti", "gain garanti", "profit garanti"];

function count(text: string, words: string[]): string[] {
  return words.filter((w) => text.includes(w));
}

export function tldSignal(site: SiteSnapshot): Flag[] {
  if (!RISKY_TLDS.has(site.tld)) return [];
  return [{
    code: "risky_tld",
    severity: "low",
    title: `Extension de domaine a risque (.${site.tld})`,
    detail: "Extension souvent gratuite ou tres bon marche, frequente sur les sites montes vite puis abandonnes.",
  }];
}

export function httpsSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable || site.usedHttps) return [];
  return [{
    code: "no_https",
    severity: "medium",
    title: "Pas de connexion securisee (HTTPS)",
    detail: "Un site qui demande de l'argent ou des identifiants sans HTTPS n'offre aucune garantie de confidentialite.",
  }];
}

export function domainAgeSignal(site: SiteSnapshot): Flag[] {
  if (site.domainAgeDays === null) return [];
  if (site.domainAgeDays <= 30) {
    return [{ code: "very_new_domain", severity: "high", title: `Domaine tres recent (${site.domainAgeDays} jours)`,
      detail: "Un site de moins d'un mois qui promet des gains disparait souvent avant le premier retrait." }];
  }
  if (site.domainAgeDays <= 180) {
    return [{ code: "new_domain", severity: "medium", title: `Domaine recent (${site.domainAgeDays} jours)`,
      detail: "Moins de six mois d'existence : prudence, surtout si le site sollicite de l'argent." }];
  }
  return [];
}

export function discourseSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable) return [];
  const t = site.text;
  const flags: Flag[] = [];
  const earn = count(t, EARN_WORDS);
  const referral = count(t, REFERRAL_WORDS);
  const deposit = count(t, DEPOSIT_WORDS);
  const bonus = count(t, BONUS_WORDS);
  const withdraw = count(t, WITHDRAW_WORDS);
  const fast = count(t, FAST_WORDS);
  const guarantee = count(t, GUARANTEE_WORDS);

  if (earn.length && withdraw.length) {
    flags.push({ code: "earn_and_withdraw", severity: "medium", title: "Promesse de gains a retirer",
      detail: `Le site parle de gagner de l'argent et de le retirer (${[...earn, ...withdraw].slice(0, 4).join(", ")}).` });
  }
  if (referral.length && (bonus.length || earn.length)) {
    flags.push({ code: "referral_rewards", severity: "high", title: "Gains lies au parrainage",
      detail: "Recompenser l'invitation de proches est le coeur des systemes pyramidaux : les derniers inscrits paient les premiers." });
  }
  if (bonus.length) {
    flags.push({ code: "signup_bonus", severity: "medium", title: "Bonus d'inscription",
      detail: `Argent "offert" a l'inscription (${bonus.slice(0, 3).join(", ")}) : appat classique pour pousser au depot ou au parrainage.` });
  }
  if (deposit.length && earn.length) {
    flags.push({ code: "deposit_to_earn", severity: "high", title: "Il faut deposer pour gagner",
      detail: `Paliers ou depots pour debloquer des gains (${deposit.slice(0, 3).join(", ")}) : structure typique des arnaques a l'investissement.` });
  }
  // Une garantie n'est un signal d'arnaque que couplee a une promesse de gain ou d'investissement.
  if (guarantee.length && (earn.length || deposit.length)) {
    flags.push({ code: "guaranteed_return", severity: "high", title: "Rendement garanti ou sans risque",
      detail: "Aucun placement legitime ne garantit un gain. Cette promesse est un signal d'alerte majeur." });
  }
  if (fast.length && earn.length) {
    flags.push({ code: "fast_easy_money", severity: "low", title: "Argent rapide et facile",
      detail: `Vocabulaire de l'enrichissement rapide (${fast.slice(0, 3).join(", ")}).` });
  }
  return flags;
}

export function licenseSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable) return [];
  const solicitsMoney = count(site.text, [...DEPOSIT_WORDS, ...WITHDRAW_WORDS, ...EARN_WORDS]).length > 0;
  if (!solicitsMoney) return [];
  const match = matchLicensed(`${site.registrableDomain} ${site.text.slice(0, 5000)}`);
  if (match.licensed) return [];
  return [{
    code: "not_in_licensed_seed",
    severity: "high",
    title: "Aucun etablissement agree reconnu",
    detail: "Le site sollicite de l'argent mais n'est rattache a aucun etablissement connu de la liste BCEAO (graine). A confronter a la liste officielle sur bceao.int.",
  }];
}

export function legalMentionsSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable) return [];
  // Page quasi vide non rendue (React/Next/Vue sans API de rendu) : on ne peut pas juger du pied de
  // page, on se tait plutot que d'accuser a tort un vrai site. Avec une API de rendu, le texte est
  // complet et ce garde-fou ne s'applique plus.
  if (!site.rendered && site.text.length < 400) return [];
  const t = site.text;
  const hasLegal = ["mentions legales", "rccm", "nif", "politique de confidentialite", "conditions generales", "siege social", "privacy policy", "terms"].some((k) => t.includes(k));
  if (hasLegal) return [];
  return [{
    code: "no_legal_mentions",
    severity: "medium",
    title: "Pas de mentions legales ni d'identite d'entreprise",
    detail: "Aucune societe identifiee, aucune adresse, aucune politique : on ne sait pas qui est responsable ni qui poursuivre.",
  }];
}

/** Gabarit etranger revendu : back-office ou textes dans une autre ecriture que celle du public vise. */
export function foreignTemplateSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable) return [];
  const raw = site.html;
  const cjk = (raw.match(/[一-鿿]/g) ?? []).length;
  const cyrillic = (raw.match(/[Ѐ-ӿ]/g) ?? []).length;
  const flags: Flag[] = [];
  if (cjk >= 3) {
    flags.push({ code: "foreign_template_cjk", severity: "high", title: "Gabarit avec des caracteres chinois",
      detail: "Interface ou back-office en chinois sur un site destine au public francophone : signe d'un modele d'arnaque revendu cle en main." });
  }
  if (cyrillic >= 3) {
    flags.push({ code: "foreign_template_cyrillic", severity: "medium", title: "Gabarit avec des caracteres cyrilliques",
      detail: "Textes en cyrillique sur un site francophone : possible modele importe et habille a la hate." });
  }
  const knownKits = ["skill money", "task reward", "watch ads earn", "guadou", "lucky star", "money cash"];
  for (const kit of knownKits) {
    if (stripAccentsLower(raw).includes(kit)) {
      flags.push({ code: "known_scam_kit", severity: "high", title: `Modele connu de plateforme de gains ("${kit}")`,
        detail: "Nom de gabarit deja vu sur des plateformes de type regarde-des-pubs-et-gagne, souvent frauduleuses." });
      break;
    }
  }
  return flags;
}

export function adminInterfaceSignal(site: SiteSnapshot): Flag[] {
  // Signal purement passif. Voir un back-office ne prouve PAS qu'il est sans protection : une page
  // de connexion contient les memes titres. On signale la presence du gabarit admin, rien de plus ;
  // l'absence reelle d'authentification se verifie dans le code, pas en attaquant le site.
  if (!site.reachable) return [];
  const t = site.text;
  const adminWords = ["管理后台", "admin panel", "tableau de bord admin", "back office", "gestion des utilisateurs", "demandes de retrait"];
  if (!adminWords.some((w) => site.html.includes(w) || t.includes(stripAccentsLower(w)))) return [];
  if (!/\/admin/i.test(site.finalUrl)) return [];
  return [{
    code: "admin_interface_present",
    severity: "low",
    title: "Interface d'administration detectee",
    detail: "Le gabarit d'administration est servi sur cette adresse. A verifier dans le code : l'API doit refuser les donnees sans authentification, pas seulement cacher l'ecran.",
  }];
}

/** Un type de menace Google -> un drapeau nommé clairement (le type est dans le titre). */
const THREAT_FLAG: Record<string, { title: string; detail: string }> = {
  SOCIAL_ENGINEERING: {
    title: "Hameçonnage (phishing)",
    detail: "Fausse page qui imite un vrai site (banque, Mobile Money, réseau social) pour voler vos mots de passe, vos codes ou votre argent. N'entrez aucune information.",
  },
  MALWARE: {
    title: "Virus / logiciel malveillant",
    detail: "Ce site peut installer un virus ou un logiciel espion sur votre téléphone ou votre ordinateur. Ne téléchargez rien et quittez la page.",
  },
  UNWANTED_SOFTWARE: {
    title: "Logiciel indésirable",
    detail: "Ce site pousse à installer des programmes non désirés qui peuvent gêner votre appareil ou vous pister.",
  },
  POTENTIALLY_HARMFUL_APPLICATION: {
    title: "Application dangereuse",
    detail: "Ce site propose une application potentiellement nuisible pour votre appareil.",
  },
};

export function maliciousLinkSignal(site: SiteSnapshot): Flag[] {
  if (!site.threats || site.threats.length === 0) return [];
  return site.threats.map((t) => {
    const f = THREAT_FLAG[t];
    return {
      code: "malicious_" + t.toLowerCase(),
      severity: "critical" as const,
      title: `${f ? f.title : "Lien dangereux"} · signalé par Google`,
      detail: f ? f.detail : "Google a signalé ce site comme dangereux. N'y entrez rien et ne téléchargez rien.",
    };
  });
}

export function thinPageSignal(site: SiteSnapshot): Flag[] {
  if (!site.reachable || site.rendered || site.text.length >= 400) return [];
  return [{
    code: "js_rendered_page",
    severity: "info",
    title: "Page construite en JavaScript, analyse limitée",
    detail: "Le contenu s'affiche via du JavaScript ; sans rendu complet, l'outil ne voit qu'une partie de la page. Le résultat porte surtout sur le domaine.",
  }];
}

export const ALL_SIGNALS = [
  tldSignal, httpsSignal, domainAgeSignal, discourseSignal, licenseSignal,
  legalMentionsSignal, foreignTemplateSignal, adminInterfaceSignal, maliciousLinkSignal, thinPageSignal,
];
