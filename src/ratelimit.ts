/**
 * Limiteur par visiteur, fenetre glissante, en memoire. Empeche qu'on se serve du service comme
 * relais pour marteler des sites tiers. Un seul processus : suffisant ici. Pour plusieurs instances,
 * passer a Redis (INCR + EXPIRE).
 */
export interface RateLimitOptions {
  /** Nombre d'appels autorises par fenetre. */
  max: number;
  /** Duree de la fenetre, en millisecondes. */
  windowMs: number;
  clock?: () => number;
}

export interface RateDecision {
  allowed: boolean;
  remaining: number;
  /** Secondes avant de pouvoir reessayer (0 si autorise). */
  retryAfterSeconds: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly max: number;
  private readonly windowMs: number;
  private readonly clock: () => number;

  constructor(options: RateLimitOptions) {
    this.max = options.max;
    this.windowMs = options.windowMs;
    this.clock = options.clock ?? Date.now;
  }

  check(key: string): RateDecision {
    const now = this.clock();
    const since = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > since);

    if (recent.length >= this.max) {
      const oldest = recent[0] ?? now;
      this.hits.set(key, recent);
      this.maybeSweep(now);
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000)) };
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.maybeSweep(now);
    return { allowed: true, remaining: this.max - recent.length, retryAfterSeconds: 0 };
  }

  /** Nettoyage occasionnel des cles inactives, pour ne pas garder la memoire de tous les visiteurs. */
  private maybeSweep(now: number): void {
    if (this.hits.size < 5000) return;
    const since = now - this.windowMs;
    for (const [key, times] of this.hits) {
      const kept = times.filter((t) => t > since);
      if (kept.length === 0) this.hits.delete(key);
      else this.hits.set(key, kept);
    }
  }
}

/** IP du visiteur derriere Caddy : premiere valeur de X-Forwarded-For, sinon l'adresse directe. */
export function clientIp(forwardedFor: string | string[] | undefined, remoteAddress: string | undefined): string {
  const xff = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return remoteAddress ?? "inconnu";
}
