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
    assert.match(await res.text(), /Detecteur d'arnaques/);
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

test("url manquante : 400", async () => {
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/api/scan`)).status, 400);
  });
});

test("chemin inconnu : 404", async () => {
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/autre`)).status, 404);
  });
});
