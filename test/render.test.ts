import { test } from "node:test";
import assert from "node:assert/strict";
import { renderApiUrl, renderConfigFromEnv } from "../src/render.js";

test("sans variables d'environnement : pas de rendu (null)", () => {
  assert.equal(renderConfigFromEnv({}), null);
  assert.equal(renderConfigFromEnv({ RENDER_KEY: "k" }), null);
  assert.equal(renderConfigFromEnv({ RENDER_PROVIDER: "scraperapi" }), null);
  assert.equal(renderConfigFromEnv({ RENDER_PROVIDER: "inconnu", RENDER_KEY: "k" }), null);
});

test("provider + cle : config lue", () => {
  assert.deepEqual(renderConfigFromEnv({ RENDER_PROVIDER: "ScraperAPI", RENDER_KEY: " k " }), { provider: "scraperapi", key: "k" });
});

test("URL d'appel par fournisseur, cible et cle encodees", () => {
  const target = "https://gains.top/a?b=1";
  assert.match(renderApiUrl(target, { provider: "scraperapi", key: "sk" }), /api\.scraperapi\.com.*render=true.*gains\.top/);
  assert.match(renderApiUrl(target, { provider: "scrapingbee", key: "sk" }), /scrapingbee\.com.*render_js=true/);
  assert.match(renderApiUrl(target, { provider: "scrapedo", key: "sk" }), /api\.scrape\.do.*render=true/);
  assert.ok(renderApiUrl(target, { provider: "scraperapi", key: "sk" }).includes(encodeURIComponent(target)));
});
