import type { SiteSnapshot } from "./types.js";

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

  try {
    const response = await doFetch(normalized, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (scam-detector; +https://crezzuss.com)", accept: "text/html,*/*" },
      signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
    });
    const finalUrl = response.url || normalized;
    const finalHost = safeHost(finalUrl);
    const html = (await response.text()).slice(0, 2_000_000);
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

    base.reachable = true;
    base.statusCode = response.status;
    base.finalUrl = finalUrl;
    base.host = finalHost;
    base.registrableDomain = registrableDomain(finalHost);
    base.tld = finalHost.split(".").pop() ?? "";
    base.usedHttps = finalUrl.startsWith("https:");
    base.redirectChain = finalHost === startHost ? [startHost] : [startHost, finalHost];
    base.headers = headers;
    base.html = html;
    base.text = htmlToText(html);
  } catch (error) {
    base.error = error instanceof Error ? error.message : String(error);
    return base;
  }

  if (options.lookupDomainAge !== false) {
    base.domainAgeDays = await domainAgeDays(base.registrableDomain, doFetch, options.timeoutMs ?? 15_000).catch(() => null);
  }
  return base;
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
