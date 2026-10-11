/** Gravite d'un drapeau. Le score global en decoule, ponderation dans analyze.ts. */
export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Flag {
  /** Identifiant stable, en anglais, pour les tests et le tri. */
  code: string;
  severity: Severity;
  /** Titre court, affiche a l'utilisateur. */
  title: string;
  /** Pourquoi c'est un signal, en une phrase. */
  detail: string;
}

/** Tout ce qu'un signal recoit : on ne refait pas le reseau dans chaque signal. */
export interface SiteSnapshot {
  inputUrl: string;
  finalUrl: string;
  host: string;
  registrableDomain: string;
  tld: string;
  reachable: boolean;
  statusCode: number | null;
  usedHttps: boolean;
  /** Redirections suivies, hotes successifs. */
  redirectChain: string[];
  headers: Record<string, string>;
  html: string;
  /** Texte visible, minuscules, accents retires : pour la recherche de mots. */
  text: string;
  /** Renseignements WHOIS/RDAP si disponibles, sinon null (jamais bloquant). */
  domainAgeDays: number | null;
  error?: string;
}

export type Signal = (site: SiteSnapshot) => Flag[] | Promise<Flag[]>;

export type Verdict = "danger" | "suspect" | "prudence" | "aucun_signal_fort";

export interface Report {
  inputUrl: string;
  finalUrl: string;
  registrableDomain: string;
  score: number;
  verdict: Verdict;
  flags: Flag[];
  checkedAt: string;
  note: string;
}
