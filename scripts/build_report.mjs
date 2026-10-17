// Print the sample insights report (nine 16:9 pages) to PDF, in English and French.
//
//     npm run report
//
// Starts a Vite dev server, opens report.html?lang=… in the local Chrome (puppeteer-core),
// and writes public/downloads/HarbourMarket_Insights_Report_DEMO_{EN,FR}.pdf.
// Set CHROME_PATH if Chrome is not in the default macOS location.
import { createServer } from "vite";
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { statSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const server = await createServer({ root: ROOT, logLevel: "error", server: { port: 5199, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const lang of ["en", "fr"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1320, height: 800 });
    await page.goto(`${base}report.html?lang=${lang}`, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const pages = await page.$$eval(".rp-page", (xs) => xs.length);
    if (pages !== 9) throw new Error(`expected 9 report pages, found ${pages}`);
    // every page must keep its content inside its 1280 × 720 frame
    const over = await page.$$eval(".rp-page", (xs) => xs.map((p, i) => {
      const r = p.getBoundingClientRect();
      const bottom = Math.max(...[...p.querySelectorAll("*")].map((e) => e.getBoundingClientRect().bottom));
      const body = p.querySelector(".rp-body");
      const inner = body ? Math.max(...[...body.children].map((e) => e.getBoundingClientRect().bottom)) - body.getBoundingClientRect().bottom : 0;
      if (inner > 0.5) return `page ${i + 1}: content runs ${Math.round(inner)}px into the closing line`;
      return bottom > r.bottom + 0.5 ? `page ${i + 1} overflows by ${Math.round(bottom - r.bottom)}px` : null;
    }).filter(Boolean));
    if (over.length) throw new Error(over.join("; "));
    const out = resolve(ROOT, `public/downloads/HarbourMarket_Insights_Report_DEMO_${lang.toUpperCase()}.pdf`);
    await page.pdf({ path: out, width: "1280px", height: "720px", printBackground: true, preferCSSPageSize: true });
    console.log(`  -> ${out.replace(ROOT + "/", "")} (${Math.round(statSync(out).size / 1024)} KB)`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
