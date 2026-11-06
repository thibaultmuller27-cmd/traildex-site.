import { chromium } from "playwright-core"
import fs from "fs"
const d = process.argv[2]
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" })
const p = await b.newPage()
p.on("pageerror", e => console.log("pageerror", e.message))
await p.goto("file://" + d + "/card.html", { waitUntil: "networkidle" })
await p.waitForFunction(() => document.title === "done", null, { timeout: 60000 })
const o = await p.evaluate(() => window.OUT)
for (const [k, v] of Object.entries(o)) fs.writeFileSync(`${d}/TrailDex-O1-${k}-78x122mm-600dpi.png`, Buffer.from(v.split(",")[1], "base64"))
await b.close()
