import { analyze } from "./analyze.js";
import type { Report, Severity } from "./types.js";

const VERDICT_LABEL: Record<Report["verdict"], string> = {
  danger: "DANGER",
  suspect: "SUSPECT",
  prudence: "PRUDENCE",
  aucun_signal_fort: "AUCUN SIGNAL FORT",
};

const MARK: Record<Severity, string> = { critical: "[!!!]", high: "[!!]", medium: "[!]", low: "[.]", info: "[i]" };

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const url = args.find((a) => !a.startsWith("--"));
  if (!url) {
    console.error("Usage : scam-detector <url> [--json]");
    process.exitCode = 2;
    return;
  }

  const report = await analyze(url);

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\nSite analyse : ${report.finalUrl}`);
  console.log(`Domaine      : ${report.registrableDomain}`);
  console.log(`Score risque : ${report.score}/100`);
  console.log(`Verdict      : ${VERDICT_LABEL[report.verdict]}\n`);
  if (report.flags.length === 0) {
    console.log("Aucun signal releve.");
  } else {
    for (const f of report.flags) console.log(`${MARK[f.severity]} ${f.title}\n      ${f.detail}`);
  }
  console.log(`\n${report.note}`);
  if (report.verdict === "danger") process.exitCode = 1;
}

await main();
