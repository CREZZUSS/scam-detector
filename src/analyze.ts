import { snapshot, type FetchOptions } from "./fetch.js";
import { ALL_SIGNALS } from "./signals.js";
import type { Flag, Report, Severity, SiteSnapshot, Verdict } from "./types.js";

const WEIGHT: Record<Severity, number> = { info: 0, low: 8, medium: 18, high: 35, critical: 60 };

export function scoreFlags(flags: Flag[]): number {
  const raw = flags.reduce((sum, f) => sum + WEIGHT[f.severity], 0);
  return Math.min(100, raw);
}

export function verdictFor(score: number, flags: Flag[]): Verdict {
  if (flags.some((f) => f.severity === "critical") || score >= 70) return "danger";
  if (score >= 40) return "suspect";
  if (score >= 15) return "prudence";
  return "aucun_signal_fort";
}

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export function reportFromSnapshot(site: SiteSnapshot, flags: Flag[]): Report {
  const sorted = [...flags].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  const score = scoreFlags(flags);
  return {
    inputUrl: site.inputUrl,
    finalUrl: site.finalUrl,
    registrableDomain: site.registrableDomain,
    score,
    verdict: verdictFor(score, flags),
    flags: sorted,
    checkedAt: new Date().toISOString(),
    note: "Analyse automatique de signaux publics. Un verdict n'est pas une preuve : confronter a la liste officielle BCEAO et au bon sens.",
  };
}

/** Collecte les drapeaux de tous les signaux sur un instantane deja pris. */
export async function runSignals(site: SiteSnapshot): Promise<Flag[]> {
  const flags: Flag[] = [];
  for (const signal of ALL_SIGNALS) flags.push(...(await signal(site)));
  if (!site.reachable) {
    flags.push({ code: "unreachable", severity: "info", title: "Site injoignable",
      detail: site.error ? `Impossible de charger la page : ${site.error}` : "La page n'a pas repondu." });
  }
  return flags;
}

/** Point d'entree : prend une URL, renvoie un rapport. Lecture seule, voir fetch.ts. */
export async function analyze(url: string, options?: FetchOptions): Promise<Report> {
  const site = await snapshot(url, options);
  const flags = await runSignals(site);
  return reportFromSnapshot(site, flags);
}
