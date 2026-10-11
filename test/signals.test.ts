import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/analyze.js";
import { runSignals } from "../src/analyze.js";
import { snapshot } from "../src/fetch.js";
import type { SiteSnapshot } from "../src/types.js";

/**
 * fetch simule : sert un HTML fixe, sans reseau. On ne touche pas a Response.url (lecture seule) :
 * snapshot retombe alors sur l'URL d'entree, ce qui suffit aux tests (le schema http/https vient de
 * l'URL fournie).
 */
function makeFetch(html: string): typeof fetch {
  return (async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } })) as unknown as typeof fetch;
}

async function snap(url: string, html: string): Promise<SiteSnapshot> {
  return snapshot(url, { fetchImpl: makeFetch(html), lookupDomainAge: false });
}

const SCAM_HTML = `<!doctype html><html><body>
  <h1>Gagnez de l'argent facilement chaque jour</h1>
  <p>800 FCFA offerts a l'inscription. Invitez vos proches avec votre code de parrainage.</p>
  <p>Rechargez votre compte VIP et investissez pour un rendement garanti. Retrait instantane.</p>
</body></html>`;

test("site de gains typique : verdict danger, drapeaux attendus", async () => {
  const report = await analyze("https://earnfast.example.top", { fetchImpl: makeFetch(SCAM_HTML), lookupDomainAge: false });
  assert.equal(report.verdict, "danger");
  const codes = report.flags.map((f) => f.code);
  assert.ok(codes.includes("referral_rewards"));
  assert.ok(codes.includes("deposit_to_earn"));
  assert.ok(codes.includes("guaranteed_return"));
  assert.ok(codes.includes("signup_bonus"));
  assert.ok(codes.includes("risky_tld"));
});

test("gabarit chinois sur /admin : interface signalee (sans affirmer l'absence d'auth) + modele connu", async () => {
  const html = `<html><body><div>Skill Money 管理后台 用户 余额 收款账号 demandes de retrait</div></body></html>`;
  const site = await snap("https://earnfast.example.top/admin", html);
  const flags = await runSignals(site);
  const codes = flags.map((f) => f.code);
  assert.ok(codes.includes("admin_interface_present"));
  assert.ok(codes.includes("foreign_template_cjk"));
  assert.ok(codes.includes("known_scam_kit"));
  // On n'affirme jamais passivement que l'admin est sans protection.
  assert.equal(codes.includes("admin_without_auth"), false);
});

test("site bancaire legitime et identifie : pas de verdict danger", async () => {
  const html = `<html><body>
    <h1>Ecobank, votre banque</h1>
    <p>Mentions legales. RCCM. Politique de confidentialite. Siege social a Lome.</p>
    <p>Epargne et credit pour les particuliers.</p>
  </body></html>`;
  const report = await analyze("https://ecobank.example.com", { fetchImpl: makeFetch(html), lookupDomainAge: false });
  assert.notEqual(report.verdict, "danger");
  assert.equal(report.flags.some((f) => f.code === "not_in_licensed_seed"), false);
});

test("site sans HTTPS qui parle d'argent : drapeau medium", async () => {
  const site = await snap("http://gains.example.top", SCAM_HTML);
  const flags = await runSignals(site);
  assert.ok(flags.some((f) => f.code === "no_https"));
});

test("site injoignable : signal info, jamais une exception", async () => {
  const boom = (async () => { throw new Error("getaddrinfo ENOTFOUND"); }) as unknown as typeof fetch;
  const report = await analyze("https://nexistepas.example.top", { fetchImpl: boom, lookupDomainAge: false });
  assert.ok(report.flags.some((f) => f.code === "unreachable"));
});

test("le score est plafonne a 100 et le verdict suit les seuils", async () => {
  const report = await analyze("https://earnfast.example.top", { fetchImpl: makeFetch(SCAM_HTML), lookupDomainAge: false });
  assert.ok(report.score <= 100 && report.score >= 70);
});
