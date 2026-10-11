import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { isIP } from "node:net";
import { analyze } from "./analyze.js";
import { PAGE_HTML } from "./page.js";
import { clientIp, RateLimiter } from "./ratelimit.js";

/**
 * Petit serveur local : une page ou l'on colle un lien, et l'API `/api/scan?url=` qui renvoie le
 * rapport. L'analyse se fait cote serveur (le navigateur ne peut pas charger un autre site, CORS).
 * Garde-fou SSRF : on refuse localhost et les adresses privees, pour qu'on ne detourne pas l'outil
 * afin de sonder un reseau interne.
 */
const PORT = Number(process.env.PORT ?? 8099);

/** Par visiteur : 20 analyses par 10 minutes. Surchargageable par variables d'environnement. */
const scanLimiter = new RateLimiter({
  max: Number(process.env.RATE_MAX ?? 20),
  windowMs: Number(process.env.RATE_WINDOW_MS ?? 10 * 60 * 1000),
});

/** Logos de la bande defilante : liste fermee, servis depuis public/logos (dist/src -> ../../public). */
const LOGOS_DIR = new URL("../../public/logos/", import.meta.url);
const LOGO_FILES = new Set(["ecard.png", "crezzuss.png", "wintg.png", "tchin.png"]);

function isPrivateTarget(url: string): boolean {
  let host: string;
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    return true;
  }
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (isIP(h) === 0) return false; // un nom de domaine public : on laisse passer
  if (h.startsWith("127.") || h === "0.0.0.0" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("169.254.")) return true;
  const m = /^172\.(\d+)\./.exec(h);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd")) return true;
  return false;
}

export function createApp() {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff" }).end(PAGE_HTML);
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/logos/")) {
      const name = url.pathname.slice("/logos/".length);
      if (!LOGO_FILES.has(name)) {
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
        return;
      }
      try {
        const data = await readFile(new URL(name, LOGOS_DIR));
        res.writeHead(200, {
          "content-type": "image/png",
          "cache-control": "public, max-age=604800",
          "x-content-type-options": "nosniff",
        }).end(data);
      } catch {
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/scan") {
      const target = url.searchParams.get("url")?.trim() ?? "";
      const send = (status: number, body: unknown) =>
        res.writeHead(status, { "content-type": "application/json; charset=utf-8" }).end(JSON.stringify(body));
      if (!target) return send(400, { error: "Parametre url manquant." });
      if (isPrivateTarget(target)) return send(400, { error: "Adresse locale ou privee refusee." });

      const ip = clientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress ?? undefined);
      const decision = scanLimiter.check(ip);
      if (!decision.allowed) {
        res.setHeader("retry-after", String(decision.retryAfterSeconds));
        return send(429, { error: `Trop d'analyses. Reessayez dans ${decision.retryAfterSeconds} s.` });
      }
      try {
        send(200, await analyze(target));
      } catch (error) {
        send(502, { error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
  });
}

// Lance le serveur quand le fichier est execute directement (pas a l'import depuis les tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("server.js")) {
  createApp().listen(PORT, "127.0.0.1", () => {
    console.log(`scam-detector : ouvrez http://localhost:${PORT}`);
  });
}
