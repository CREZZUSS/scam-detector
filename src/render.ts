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

function oneConfig(provider: string | undefined, key: string | undefined): RenderConfig | null {
  const p = provider?.trim().toLowerCase();
  const k = key?.trim();
  if (!k || !p) return null;
  if (p === "scraperapi" || p === "scrapingbee" || p === "scrapedo") return { provider: p, key: k };
  return null;
}

export function renderConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RenderConfig | null {
  return oneConfig(env.RENDER_PROVIDER, env.RENDER_KEY);
}

/**
 * Liste des fournisseurs de rendu, dans l'ordre d'essai : le principal
 * (RENDER_PROVIDER/RENDER_KEY), puis les relais RENDER_PROVIDER_2/RENDER_KEY_2 et _3. Si le principal
 * echoue ou epuise son quota, on bascule sur le suivant sans intervention.
 */
export function renderConfigsFromEnv(env: NodeJS.ProcessEnv = process.env): RenderConfig[] {
  const list = [
    oneConfig(env.RENDER_PROVIDER, env.RENDER_KEY),
    oneConfig(env.RENDER_PROVIDER_2, env.RENDER_KEY_2),
    oneConfig(env.RENDER_PROVIDER_3, env.RENDER_KEY_3),
  ];
  return list.filter((c): c is RenderConfig => c !== null);
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
