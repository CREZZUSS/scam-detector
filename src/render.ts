/**
 * Rendu optionnel par une API externe qui execute le JavaScript. Sans cle, l'outil lit la page lui
 * meme (rapide, gratuit, mais aveugle au contenu charge en JS). Avec une cle, il delegue a l'API,
 * qui renvoie le HTML final, ce qui corrige les faux positifs sur les sites React/Next/Vue.
 *
 * Fournisseur et cle par variables d'environnement :
 *   RENDER_PROVIDER = scraperapi | scrapingbee | scrapedo
 *   RENDER_KEY      = votre cle
 * Aucune cle n'est jamais ecrite dans le code ni renvoyee au navigateur.
 */
export type RenderProvider = "scraperapi" | "scrapingbee" | "scrapedo";

export interface RenderConfig {
  provider: RenderProvider;
  key: string;
}

export function renderConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RenderConfig | null {
  const provider = env.RENDER_PROVIDER?.trim().toLowerCase();
  const key = env.RENDER_KEY?.trim();
  if (!key || !provider) return null;
  if (provider === "scraperapi" || provider === "scrapingbee" || provider === "scrapedo") {
    return { provider, key };
  }
  return null;
}

/** Construit l'URL d'appel a l'API de rendu pour la cible donnee. La cle reste cote serveur. */
export function renderApiUrl(target: string, config: RenderConfig): string {
  const t = encodeURIComponent(target);
  switch (config.provider) {
    case "scraperapi":
      return `https://api.scraperapi.com/?api_key=${encodeURIComponent(config.key)}&render=true&url=${t}`;
    case "scrapingbee":
      return `https://app.scrapingbee.com/api/v1/?api_key=${encodeURIComponent(config.key)}&render_js=true&url=${t}`;
    case "scrapedo":
      return `https://api.scrape.do/?token=${encodeURIComponent(config.key)}&render=true&url=${t}`;
  }
}
