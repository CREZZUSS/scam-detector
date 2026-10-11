/**
 * Detection des liens malveillants via Google Safe Browsing (v4). Gratuit, mais necessite une cle
 * Google dans l'environnement : GOOGLE_SAFE_BROWSING_KEY. Sans cle, la fonction renvoie null et la
 * detection est simplement desactivee. La cle reste cote serveur, jamais exposee au navigateur.
 */
export const SAFE_BROWSING_THREATS = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
] as const;

export type ThreatType = (typeof SAFE_BROWSING_THREATS)[number];

export function safeBrowsingKey(env: NodeJS.ProcessEnv = process.env): string | null {
  const k = env.GOOGLE_SAFE_BROWSING_KEY?.trim();
  return k ? k : null;
}

export interface SafeBrowsingBody {
  client: { clientId: string; clientVersion: string };
  threatInfo: {
    threatTypes: readonly string[];
    platformTypes: string[];
    threatEntryTypes: string[];
    threatEntries: { url: string }[];
  };
}

export function buildBody(url: string): SafeBrowsingBody {
  return {
    client: { clientId: "crezzuss-scam-detector", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: SAFE_BROWSING_THREATS,
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };
}

/**
 * Interroge Safe Browsing pour une URL. Renvoie la liste des menaces (p. ex. ["SOCIAL_ENGINEERING"])
 * ou [] si le lien est propre ; null si pas de cle ou erreur (jamais bloquant).
 */
export async function checkSafeBrowsing(
  url: string,
  options: { key?: string | null; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<ThreatType[] | null> {
  const key = options.key === undefined ? safeBrowsingKey() : options.key;
  if (!key) return null;
  const doFetch = options.fetchImpl ?? fetch;
  try {
    const response = await doFetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildBody(url)),
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { matches?: { threatType?: string }[] };
    const types = new Set<ThreatType>();
    for (const m of data.matches ?? []) {
      if ((SAFE_BROWSING_THREATS as readonly string[]).includes(m.threatType ?? "")) types.add(m.threatType as ThreatType);
    }
    return [...types];
  } catch {
    return null;
  }
}
