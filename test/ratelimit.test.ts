import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIp, RateLimiter } from "../src/ratelimit.js";

test("laisse passer jusqu'a la limite puis refuse", () => {
  let now = 0;
  const rl = new RateLimiter({ max: 3, windowMs: 1000, clock: () => now });
  assert.equal(rl.check("ip").allowed, true);
  assert.equal(rl.check("ip").allowed, true);
  assert.equal(rl.check("ip").allowed, true);
  const blocked = rl.check("ip");
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
});

test("la fenetre glisse : apres expiration, on repasse", () => {
  let now = 0;
  const rl = new RateLimiter({ max: 2, windowMs: 1000, clock: () => now });
  rl.check("ip"); rl.check("ip");
  assert.equal(rl.check("ip").allowed, false);
  now = 1001;
  assert.equal(rl.check("ip").allowed, true);
});

test("chaque visiteur a son propre compteur", () => {
  const rl = new RateLimiter({ max: 1, windowMs: 1000 });
  assert.equal(rl.check("a").allowed, true);
  assert.equal(rl.check("b").allowed, true);
  assert.equal(rl.check("a").allowed, false);
});

test("clientIp : prend la premiere adresse de X-Forwarded-For", () => {
  assert.equal(clientIp("41.207.1.2, 10.0.0.1", "127.0.0.1"), "41.207.1.2");
  assert.equal(clientIp(undefined, "41.207.1.2"), "41.207.1.2");
  assert.equal(clientIp(["41.207.1.2"], "127.0.0.1"), "41.207.1.2");
  assert.equal(clientIp(undefined, undefined), "inconnu");
});
