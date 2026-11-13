import fs from "fs"
import { createRequire } from "module"
import { chromium } from "playwright-core"
const require = createRequire("/home/user/traildex-site./package.json")
const { PDFDocument } = require("pdf-lib")
const d = process.argv[2], MM = 72 / 25.4
const doc = await PDFDocument.create(); doc.setTitle("DNF Cards - dos holographique"); doc.setCreator("DNF Cards")
const p = doc.addPage([67 * MM, 92 * MM]); p.setBleedBox(0, 0, 67 * MM, 92 * MM); p.setTrimBox(2 * MM, 2 * MM, 63 * MM, 88 * MM)
p.drawImage(await doc.embedPng(fs.readFileSync(`${d}/verso-bleed.png`)), { x: 0, y: 0, width: 67 * MM, height: 92 * MM })
fs.writeFileSync(`${d}/livraison/DNF-Cards_dos-holo_impression.pdf`, await doc.save())
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }), pg = await b.newPage()
for (const n of ["fond-sombre", "transparent"]) {
  const svg = fs.readFileSync(`${d}/DNF-Cards-logo_holo_${n}.svg`, "utf8"), vb = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number)
  const w = 200, h = w * vb[3] / vb[2]
  await pg.setContent(`<style>@page{margin:0}body{margin:0}svg{width:${w}mm;height:${h}mm;display:block}</style>${svg}`)
  await pg.pdf({ path: `${d}/livraison/DNF-Cards-logo_holo_${n}.pdf`, width: `${w}mm`, height: `${h}mm`, printBackground: true, pageRanges: "1" })
}
await b.close(); console.log("ok")
