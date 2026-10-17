// Record the 1-minute version of the demo as an MP4, for LinkedIn and emails.
//
//     FFMPEG=/path/to/ffmpeg node scripts/record_video.mjs [en|fr] [speed]
//
// Starts a Vite dev server, plays ?path=quick&autoplay=1 in the local Chrome (puppeteer-core),
// captures the screencast frames with their timestamps, then encodes them at 30 fps, 1920×1080.
// Output: media/altera-demo-1min-{lang}.mp4 (not committed).
import { createServer } from "vite";
import puppeteer from "puppeteer-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const lang = process.argv[2] === "fr" ? "fr" : "en";
const speed = Number(process.argv[3]) || 1.4;
const TAIL_MS = 4500; // stay on the closing page

const server = await createServer({ root: ROOT, logLevel: "error", server: { port: 5198, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
const frames = mkdtempSync(join(tmpdir(), "altera-frames-"));
const shots = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 });
  // load once to warm the dev server, then start from the cover
  await page.goto(`${base}?lang=${lang}`, { waitUntil: "networkidle0" });
  const cdp = await page.createCDPSession();
  cdp.on("Page.screencastFrame", async (f) => {
    const file = join(frames, `f${String(shots.length).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(f.data, "base64"));
    shots.push({ file, t: f.metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await page.goto(`${base}?lang=${lang}&path=quick&autoplay=1&speed=${speed}#cover`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 2880, maxHeight: 1620, everyNthFrame: 1 });
  await page.waitForFunction(() => location.hash === "#end", { timeout: 180000, polling: 250 });
  await new Promise((r) => setTimeout(r, TAIL_MS));
  await cdp.send("Page.stopScreencast");
} finally {
  await browser.close();
  await server.close();
}

// constant 30 fps: each frame lasts until the next one arrived
const list = shots.map((s, i) => {
  const next = shots[i + 1]?.t ?? s.t + 0.1;
  return `file '${s.file}'\nduration ${Math.max(0.001, next - s.t).toFixed(4)}`;
}).join("\n") + `\nfile '${shots.at(-1).file}'\n`;
writeFileSync(join(frames, "list.txt"), list);
mkdirSync(resolve(ROOT, "media"), { recursive: true });
const out = resolve(ROOT, `media/altera-demo-1min-${lang}.mp4`);
execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(frames, "list.txt"),
  "-vf", "scale=1920:1080:flags=lanczos,fps=30", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
rmSync(frames, { recursive: true, force: true });
const secs = shots.at(-1).t - shots[0].t;
console.log(`  -> ${out.replace(ROOT + "/", "")} (${secs.toFixed(0)} s, ${shots.length} frames, ${Math.round(statSync(out).size / 1024 / 1024 * 10) / 10} MB)`);
