// Renders one card folder (card.html + data.js + tracks.js) to PNG, and exports the route for the foil file.
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { chromium } = require("playwright")
import fs from "fs"
const d = process.argv[2]
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const p = await b.newPage({ viewport: { width: 1000, height: 800 } })
p.on("pageerror", e => console.log("pageerror", e.message))
await p.goto("file://" + d + "/card.html", { waitUntil: "networkidle" })
await p.waitForFunction(() => document.title === "done", null, { timeout: 180000 })
for (const [id, n] of [["trail-recto", "recto"], ["trail-verso", "verso"]]) {
  const data = await p.evaluate(i => document.getElementById(i).toDataURL("image/png"), id)
  fs.writeFileSync(`${d}/${n}.png`, Buffer.from(data.split(",")[1], "base64"))
}
fs.writeFileSync(`${d}/route.json`, JSON.stringify(await p.evaluate(() => window.ROUTE)))
await b.close()
