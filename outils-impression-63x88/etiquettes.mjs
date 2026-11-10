// Étiquettes colis pour un lot : node etiquettes.mjs <lot.json> <dossier>
// - etiquettes-A4-99x38.pdf : planche A4 de 14 étiquettes 99,1 x 38,1 mm (2 x 7, type Avery L7163)
// - etiquettes-100x150.pdf  : une étiquette 100 x 150 mm par page (imprimante d'étiquettes)
// Chaque étiquette : la vignette de la carte, le N° de carte, la course, le prénom, la quantité, et l'adresse du client.
import fs from "fs"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib")
const [lotFile, out] = process.argv.slice(2)
const rows = JSON.parse(fs.readFileSync(lotFile, "utf8"))
const MM = 72 / 25.4, INK = rgb(0.09, 0.04, 0.18), VIOLET = rgb(0.48, 0.17, 1), MUTED = rgb(0.35, 0.33, 0.42)
// Helvetica (WinAnsi) : on retire ce qu'elle ne sait pas écrire
const safe = (t) => String(t ?? "").normalize("NFC").replace(/[^\x20-\x7E -ÿ’–—…]/g, "").trim()

function wrap(font, text, size, width, maxLines) {
  const words = safe(text).split(/\s+/).filter(Boolean), lines = []
  let cur = ""
  for (const w of words) { const t = cur ? cur + " " + w : w; if (font.widthOfTextAtSize(t, size) <= width) cur = t; else { if (cur) lines.push(cur); cur = w } }
  if (cur) lines.push(cur)
  return lines.slice(0, maxLines)
}

async function label(doc, page, img, r, x, y, w, h, s, fonts) {
  // x, y = coin bas-gauche en points ; s = échelle (1 pour 99 x 38 mm)
  const { reg, bold } = fonts, pad = 2.6 * MM * s
  const th = h - 2 * pad, tw = th * 860 / 1200
  page.drawImage(img, { x: x + pad, y: y + pad, width: tw, height: th })
  page.drawRectangle({ x: x + pad, y: y + pad, width: tw, height: th, borderColor: INK, borderWidth: 0.4 })
  const tx = x + pad + tw + 2.6 * MM * s, tw2 = x + w - pad - tx
  let ty = y + h - pad - 8.5 * s
  page.drawText(`CARTE N° ${r.num}`, { x: tx, y: ty, size: 8.5 * s, font: bold, color: VIOLET })
  const q = `x ${r.qte}`; page.drawText(q, { x: x + w - pad - bold.widthOfTextAtSize(q, 8.5 * s), y: ty, size: 8.5 * s, font: bold, color: VIOLET })
  ty -= 8.4 * s
  page.drawText(wrap(reg, `${r.course} · ${String(r.coureur).toUpperCase()}`, 6.6 * s, tw2, 1)[0] || "", { x: tx, y: ty, size: 6.6 * s, font: reg, color: MUTED })
  if (r.sceau === "DNF") page.drawText("SCEAU DNF", { x: x + w - pad - bold.widthOfTextAtSize("SCEAU DNF", 6 * s), y: ty, size: 6 * s, font: bold, color: rgb(0.8, 0.15, 0.2) })
  ty -= 1.6 * MM * s
  page.drawLine({ start: { x: tx, y: ty }, end: { x: x + w - pad, y: ty }, thickness: 0.4, color: MUTED })
  ty -= 4.0 * MM * s
  page.drawText(wrap(bold, r.nom, 10 * s, tw2, 1)[0] || "", { x: tx, y: ty, size: 10 * s, font: bold, color: INK }); ty -= 10.5 * s
  for (const l of wrap(reg, r.adresse, 8.6 * s, tw2, 2)) { page.drawText(l, { x: tx, y: ty, size: 8.6 * s, font: reg, color: INK }); ty -= 9.6 * s }
  page.drawText(wrap(bold, `${r.cp} ${String(r.ville).toUpperCase()}`, 9.2 * s, tw2, 1)[0] || "", { x: tx, y: ty, size: 9.2 * s, font: bold, color: INK })
  page.drawText(safe(`Réf. ${r.ref} · DNF Cards`), { x: tx, y: y + pad, size: 5.6 * s, font: reg, color: MUTED })
}

async function build(format) {
  const doc = await PDFDocument.create(); doc.setTitle(`DNF Cards - étiquettes colis (${format})`); doc.setCreator("DNF Cards")
  const fonts = { reg: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) }
  const imgs = await Promise.all(rows.map((r) => doc.embedJpg(fs.readFileSync(r.vignette))))
  if (format === "A4") {
    const LW = 99.1 * MM, LH = 38.1 * MM, left = 4.65 * MM, top = 15.15 * MM, gap = 2.5 * MM
    let page
    for (let i = 0; i < rows.length; i++) {
      if (i % 14 === 0) page = doc.addPage([210 * MM, 297 * MM])
      const k = i % 14, col = k % 2, row = Math.floor(k / 2)
      await label(doc, page, imgs[i], rows[i], left + col * (LW + gap), 297 * MM - top - (row + 1) * LH, LW, LH, 1, fonts)
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      const page = doc.addPage([100 * MM, 150 * MM])
      // l'étiquette 99 x 38 agrandie, posée en haut, plus un grand rappel du numéro pour préparer les colis
      await label(doc, page, imgs[i], rows[i], 0, 150 * MM - 58 * MM, 100 * MM, 58 * MM, 1.5, fonts)
      const big = `N° ${rows[i].num}`
      page.drawText(big, { x: (100 * MM - fonts.bold.widthOfTextAtSize(big, 64)) / 2, y: 38 * MM, size: 64, font: fonts.bold, color: VIOLET })
      const sub = safe(`${rows[i].course} · ${String(rows[i].coureur).toUpperCase()} · x ${rows[i].qte}`)
      page.drawText(sub, { x: (100 * MM - fonts.reg.widthOfTextAtSize(sub, 11)) / 2, y: 26 * MM, size: 11, font: fonts.reg, color: INK })
    }
  }
  const name = format === "A4" ? "etiquettes-A4-99x38.pdf" : "etiquettes-100x150.pdf"
  fs.writeFileSync(`${out}/${name}`, await doc.save())
}
await build("A4"); await build("100x150")
console.log("étiquettes ok :", rows.length)
