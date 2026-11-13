import { chromium } from "playwright-core"
const [url, out, w, h, scale] = process.argv.slice(2)
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" })
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale })
await p.goto(url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: out, omitBackground: true }); await b.close()
