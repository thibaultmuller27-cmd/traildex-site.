// Print files for one card: impression (image + 2 mm bleed) and dorure holo (vector trace, 100 % K).
import fs from "fs"
import { createRequire } from "module"
const require = createRequire("/home/user/traildex-site./package.json")
const { PDFDocument, pushGraphicsState, popGraphicsState, setLineWidth, setLineCap, setLineJoin, setStrokingCmykColor, setFillingCmykColor, moveTo, lineTo, stroke, fill, closePath, appendBezierCurve, LineCapStyle, LineJoinStyle } = require("pdf-lib")
const [dir, name] = process.argv.slice(2)
const MM = 72 / 25.4, CW = 63, CH = 88, BL = 2, PW = CW + 2 * BL, PH = CH + 2 * BL, U = CW / 860 // mm per card unit
const page = (doc) => { const p = doc.addPage([PW * MM, PH * MM]); p.setBleedBox(0, 0, PW * MM, PH * MM); p.setTrimBox(BL * MM, BL * MM, CW * MM, CH * MM); return p }
for (const side of ["recto", "verso"]) {
  const doc = await PDFDocument.create(); doc.setTitle(`${name} - ${side} - impression`); doc.setCreator("DNF Cards")
  const img = await doc.embedPng(fs.readFileSync(`${dir}/${side}-bleed.png`)); const p = page(doc)
  p.drawImage(img, { x: 0, y: 0, width: PW * MM, height: PH * MM })
  fs.writeFileSync(`${dir}/${name}_${side}_impression.pdf`, await doc.save())
}
// foil: trace + start dot + finish star, card units -> PDF points (y up)
const route = JSON.parse(fs.readFileSync(`${dir}/route.json`, "utf8"))
const X = (x) => (BL + x * U) * MM, Y = (y) => (PH - BL - y * U) * MM
const doc = await PDFDocument.create(); doc.setTitle(`${name} - dorure holographique (tracé)`); doc.setCreator("DNF Cards")
const p = page(doc), ops = [pushGraphicsState(), setStrokingCmykColor(0, 0, 0, 1), setFillingCmykColor(0, 0, 0, 1), setLineWidth(12 * U * MM), setLineCap(LineCapStyle.Round), setLineJoin(LineJoinStyle.Round)]
ops.push(moveTo(X(route[0][0]), Y(route[0][1]))); for (const [x, y] of route.slice(1)) ops.push(lineTo(X(x), Y(y))); ops.push(stroke())
const circle = (cx, cy, r) => { const k = .5523 * r; return [moveTo(X(cx + r), Y(cy)), appendBezierCurve(X(cx + r), Y(cy + k), X(cx + k), Y(cy + r), X(cx), Y(cy + r)), appendBezierCurve(X(cx - k), Y(cy + r), X(cx - r), Y(cy + k), X(cx - r), Y(cy)), appendBezierCurve(X(cx - r), Y(cy - k), X(cx - k), Y(cy - r), X(cx), Y(cy - r)), appendBezierCurve(X(cx + k), Y(cy - r), X(cx + r), Y(cy - k), X(cx + r), Y(cy)), closePath(), fill()] }
const [sx, sy] = route[0], [ex, ey] = route[route.length - 1]
ops.push(...circle(sx, sy, 11))
for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 * .45 : 18; ops.push((i ? lineTo : moveTo)(X(ex + Math.cos(a) * r), Y(ey + Math.sin(a) * r))) } ops.push(closePath(), fill())
ops.push(popGraphicsState()); p.pushOperators(...ops)
fs.writeFileSync(`${dir}/${name}_recto_dorure-holo.pdf`, await doc.save())
console.log("pdf ok", name)
