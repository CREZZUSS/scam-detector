import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/server.js";

async function withServer(fn: (base: string) => Promise<void>): Promise<void> {
  const server = createApp();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("la page d'accueil est servie", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Détecteur d'arnaques/);
  });
});

test("SSRF : une cible locale ou privee est refusee", async () => {
  await withServer(async (base) => {
    for (const target of ["http://localhost:8080", "http://127.0.0.1", "http://192.168.1.1", "http://169.254.169.254"]) {
      const res = await fetch(`${base}/api/scan?url=${encodeURIComponent(target)}`);
      assert.equal(res.status, 400, target);
    }
  });
});

test("logos : fichiers de la liste servis en PNG, le reste refusé", async () => {
  await withServer(async (base) => {
    const ok = await fetch(`${base}/logos/ecard.png`);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("content-type"), "image/png");
    for (const bad of ["/logos/../package.json", "/logos/%2e%2e%2fpackage.json", "/logos/autre.png"]) {
      assert.equal((await fetch(`${base}${bad}`)).status, 404, bad);
    }
  });
});

test("url manquante : 400", async () => {
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/api/scan`)).status, 400);
  });
});

test("chemin inconnu : 404", async () => {
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/autre`)).status, 404);
    assert.equal((await fetch(`${base}/robots.txt`)).status, 200);
    assert.equal((await fetch(`${base}/sitemap.xml`)).status, 200);
  });
});
