import { renderApiUrl, renderConfigsFromEnv, type RenderConfig } from "./render.js";
import { checkSafeBrowsing } from "./safebrowsing.js";
import type { SiteSnapshot } from "./types.js";

/** En dessous de ce nombre de caracteres visibles, la page est jugee "non rendue" (contenu en JS). */
const THIN_TEXT = 400;

/** Liste de suffixes multi-niveaux courants pour deduire le domaine enregistrable. Suffisant pour l'UEMOA. */
const MULTI_LEVEL_SUFFIXES = new Set([
  "co.ci", "com.ci", "co.bj", "com.bj", "co.tg", "com.tg", "co.sn", "com.sn",
  "com.ml", "com.ne", "com.bf", "gov.ci", "org.sn", "co.uk", "com.ng", "co.za",
]);

export function registrableDomain(host: string): string {
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  return MULTI_LEVEL_SUFFIXES.has(lastTwo) ? lastThree : lastTwo;
}

export function stripAccentsLower(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Texte visible approximatif : on retire script/style et les balises, on compacte les espaces. */
export function htmlToText(html: string): string {
  const withoutScripts = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ");
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, " ");
  const decoded = withoutTags
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, " ");
  return stripAccentsLower(decoded.replace(/\s+/g, " ").trim());
}

export interface FetchOptions {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  /** Recherche l'age du domaine via RDAP (reseau). Desactivable pour les tests. */
  lookupDomainAge?: boolean;
  /**
   * API(s) de rendu JS. Par defaut lues dans l'environnement (principal + relais). `null` ou `[]`
   * force la lecture directe ; un seul objet ou une liste remplace la configuration d'environnement.
   */
  render?: RenderConfig | RenderConfig[] | null;
  /** Cle Google Safe Browsing. Par defaut lue dans l'environnement ; null desactive la detection. */
  safeBrowsingKey?: string | null;
}

interface FetchResult {
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
}

async function fetchOnce(url: string, doFetch: typeof fetch, timeoutMs: number): Promise<FetchResult> {
  const response = await doFetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { "user-agent": "Mozilla/5.0 (scam-detector; +https://crezzuss.com)", accept: "text/html,*/*" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const headers: Record<string, string> = {};
  response.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  return { status: response.status, finalUrl: response.url || url, html: (await response.text()).slice(0, 2_000_000), headers };
}

/**
 * Prend un instantane du site, en LECTURE SEULE : une requete GET, on suit les redirections, on lit
 * les en-tetes et le HTML. On n'envoie aucune donnee, on ne se connecte a rien, on ne teste aucune
 * faille. L'outil regarde le site de l'exterieur, comme un visiteur prudent.
 */
export async function snapshot(inputUrl: string, options: FetchOptions = {}): Promise<SiteSnapshot> {
  const doFetch = options.fetchImpl ?? fetch;
  const normalized = /^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`;
  const startHost = safeHost(normalized);

  const base: SiteSnapshot = {
    inputUrl, finalUrl: normalized, host: startHost, registrableDomain: registrableDomain(startHost),
    tld: startHost.split(".").pop() ?? "", reachable: false, statusCode: null, usedHttps: normalized.startsWith("https:"),
    redirectChain: [], headers: {}, html: "", text: "", domainAgeDays: null,
  };

  const renders = resolveRenders(options.render);
  const plainTimeout = options.timeoutMs ?? 15_000;

  // 1) Lecture directe, gratuite. On s'en contente si la page est deja pleine.
  let result: FetchResult | null = null;
  try {
    result = await fetchOnce(normalized, doFetch, plainTimeout);
    applyResult(base, result, startHost, false);
  } catch (error) {
    base.error = error instanceof Error ? error.message : String(error);
  }

  // 2) Rendu JS payant SEULEMENT si necessaire (page quasi vide ou injoignable), avec bascule de
  //    fournisseur en relais. On economise ainsi les credits sur les sites normaux.
  const needsRender = renders.length > 0 && (!result || htmlToText(result.html).length < THIN_TEXT);
  if (needsRender) {
    const renderTimeout = options.timeoutMs ?? 55_000;
    for (const cfg of renders) {
      try {
        const rendered = await fetchOnce(renderApiUrl(normalized, cfg), doFetch, renderTimeout);
        // Derriere l'API de rendu, l'URL finale reste la cible d'origine.
        applyResult(base, { ...rendered, finalUrl: normalized }, startHost, true);
        delete base.error;
        if (base.text.length >= THIN_TEXT) break; // rendu utile obtenu
      } catch {
        // fournisseur en echec ou quota epuise : on tente le relais suivant
      }
    }
  }

  if (!base.reachable) return base;

  if (options.lookupDomainAge !== false) {
    base.domainAgeDays = await domainAgeDays(base.registrableDomain, doFetch, options.timeoutMs ?? 15_000).catch(() => null);
  }
  base.threats = await checkSafeBrowsing(base.finalUrl, {
    ...(options.safeBrowsingKey !== undefined ? { key: options.safeBrowsingKey } : {}),
    fetchImpl: doFetch,
  }).catch(() => null);
  return base;
}

/** Normalise l'option render en liste de fournisseurs (env par defaut). */
function resolveRenders(opt: FetchOptions["render"]): RenderConfig[] {
  if (opt === undefined) return renderConfigsFromEnv();
  if (opt === null) return [];
  return Array.isArray(opt) ? opt : [opt];
}

/** Reporte le resultat d'une requete dans l'instantane. */
function applyResult(base: SiteSnapshot, r: FetchResult, startHost: string, rendered: boolean): void {
  const finalHost = safeHost(r.finalUrl);
  base.reachable = true;
  base.statusCode = r.status;
  base.finalUrl = r.finalUrl;
  base.host = finalHost;
  base.registrableDomain = registrableDomain(finalHost);
  base.tld = finalHost.split(".").pop() ?? "";
  base.usedHttps = r.finalUrl.startsWith("https:");
  base.redirectChain = finalHost === startHost ? [startHost] : [startHost, finalHost];
  base.headers = r.headers;
  base.html = r.html;
  base.text = htmlToText(r.html);
  base.rendered = rendered;
}

function safeHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

/** Age du domaine via RDAP (rdap.org suit la delegation). Renvoie null en cas d'echec, jamais une erreur. */
export async function domainAgeDays(domain: string, doFetch: typeof fetch, timeoutMs: number): Promise<number | null> {
  const response = await doFetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
    headers: { accept: "application/rdap+json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { events?: { eventAction?: string; eventDate?: string }[] };
  const registration = data.events?.find((e) => e.eventAction === "registration")?.eventDate;
  if (!registration) return null;
  const days = (Date.now() - new Date(registration).getTime()) / 86_400_000;
  return Number.isFinite(days) ? Math.floor(days) : null;
}
