import { test } from "node:test";
import assert from "node:assert/strict";
import { snapshot } from "../src/fetch.js";
import type { RenderConfig } from "../src/render.js";

const SB_OFF = { safeBrowsingKey: null as string | null, lookupDomainAge: false as const };
const FULL = "<html><body>" + "<p>Contenu bien rempli pour ce site normal, assez long pour depasser le seuil. </p>".repeat(8) + "</body></html>";
const THIN = "<html><body><div id=root></div></body></html>";
const SCRAPER: RenderConfig = { provider: "scraperapi", key: "k1" };
const BEE: RenderConfig = { provider: "scrapingbee", key: "k2" };

function countingFetch(byUrl: (url: string) => string, calls: string[]): typeof fetch {
  return (async (url: string) => {
    calls.push(String(url));
    return new Response(byUrl(String(url)), { status: 200, headers: { "content-type": "text/html" } });
  }) as unknown as typeof fetch;
}

test("ECONOMIE : page deja pleine => aucun appel a l'API de rendu (pas de credit depense)", async () => {
  const calls: string[] = [];
  const site = await snapshot("https://site-normal.com", { ...SB_OFF, render: SCRAPER, fetchImpl: countingFetch(() => FULL, calls) });
  assert.equal(site.rendered, false);
  assert.equal(calls.length, 1); // seulement la lecture directe gratuite
  assert.ok(!calls[0]!.includes("scraperapi"));
});

test("page en JS (quasi vide) => rendu declenche une seule fois", async () => {
  const calls: string[] = [];
  const fetchImpl = countingFetch((u) => (u.includes("scraperapi") ? FULL : THIN), calls);
  const site = await snapshot("https://spa.top", { ...SB_OFF, render: SCRAPER, fetchImpl });
  assert.equal(site.rendered, true);
  assert.ok(calls.some((c) => c.includes("api.scraperapi.com")));
  assert.ok(site.text.length >= 400);
});

test("RELAIS : si le 1er fournisseur echoue, bascule sur le 2e", async () => {
  const calls: string[] = [];
  const fetchImpl = (async (url: string) => {
    calls.push(String(url));
    if (String(url).includes("scraperapi")) throw new Error("quota epuise");
    if (String(url).includes("scrapingbee")) return new Response(FULL, { status: 200 });
    return new Response(THIN, { status: 200 });
  }) as unknown as typeof fetch;
  const site = await snapshot("https://spa.top", { ...SB_OFF, render: [SCRAPER, BEE], fetchImpl });
  assert.equal(site.rendered, true);
  assert.ok(calls.some((c) => c.includes("scraperapi")));
  assert.ok(calls.some((c) => c.includes("scrapingbee")));
  assert.ok(site.text.length >= 400);
});

test("sans rendu configure : une page vide reste lue en direct (pas d'erreur)", async () => {
  const calls: string[] = [];
  const site = await snapshot("https://spa.top", { ...SB_OFF, render: null, fetchImpl: countingFetch(() => THIN, calls) });
  assert.equal(site.reachable, true);
  assert.equal(site.rendered, false);
  assert.equal(calls.length, 1);
});
