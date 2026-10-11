import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBody, checkSafeBrowsing, safeBrowsingKey } from "../src/safebrowsing.js";
import { maliciousLinkSignal } from "../src/signals.js";
import type { SiteSnapshot } from "../src/types.js";

test("sans cle : detection desactivee (null)", async () => {
  assert.equal(safeBrowsingKey({}), null);
  assert.equal(await checkSafeBrowsing("https://x.top", { key: null }), null);
});

test("corps de requete conforme a l'API v4", () => {
  const body = buildBody("https://mauvais.top");
  assert.deepEqual(body.threatInfo.threatEntries, [{ url: "https://mauvais.top" }]);
  assert.ok(body.threatInfo.threatTypes.includes("SOCIAL_ENGINEERING"));
});

test("reponse avec menace : liste des types", async () => {
  const fetchImpl = (async () => new Response(JSON.stringify({ matches: [{ threatType: "SOCIAL_ENGINEERING" }, { threatType: "MALWARE" }] }), { status: 200 })) as unknown as typeof fetch;
  const threats = await checkSafeBrowsing("https://phish.top", { key: "k", fetchImpl });
  assert.deepEqual(threats?.sort(), ["MALWARE", "SOCIAL_ENGINEERING"]);
});

test("lien propre : liste vide", async () => {
  const fetchImpl = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
  assert.deepEqual(await checkSafeBrowsing("https://ok.com", { key: "k", fetchImpl }), []);
});

test("erreur HTTP : null, jamais d'exception", async () => {
  const fetchImpl = (async () => new Response("nope", { status: 500 })) as unknown as typeof fetch;
  assert.equal(await checkSafeBrowsing("https://x.com", { key: "k", fetchImpl }), null);
});

test("signal : menace detectee => drapeau critique", () => {
  const site = { reachable: true, threats: ["SOCIAL_ENGINEERING"] } as unknown as SiteSnapshot;
  const flags = maliciousLinkSignal(site);
  assert.equal(flags[0]?.severity, "critical");
  assert.ok(flags[0]?.code.startsWith("malicious_"));
});
