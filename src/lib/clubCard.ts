/**
 * Club card: the club's logo in the middle instead of a map, in a bold,
 * cartoon-like "anime" style (sunburst, speed lines, comic halftone), for
 * running clubs ordering member cards. Drawn with the canvas API so the same
 * code makes the screen preview and the vector print PDF (PdfCanvas), like
 * the race cards.
 */
import { PDFDocument } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import { SANS, roundRect } from "./cardCanvas"
import { addOutputIntent, addTrimmedPage, DEFAULT_SETTINGS, loadFontBytes, Ops, type PrintSettings } from "./exaprint"
import type { CmykProfile } from "./cmyk"
import { embedCardFonts, PdfCanvas } from "./pdfCanvas"

export type ClubCard = {
  club: string
  /** Line under the name plate, e.g. "Course à pied · Trail · Partage · Dépassement" */
  tagline?: string
  /** Front badge, e.g. "MEMBRE" */
  badge: string
  /** Member's name on the plate, or the club name for a generic card */
  member?: string
  season: string
  number?: number
  /** The club logo (transparent PNG works best) */
  logo: HTMLImageElement
  finish: "or" | "holo"
  colors: { dark: string; mid: string; accent: string; ink: string }
}

const MONO = "'JetBrains Mono', ui-monospace, monospace"
const FINISH = {
  or: { a: "#ffe9a8", b: "#d9a03a", c: "#fff4cc", text: "#2a1d05" },
  holo: { a: "#9ff3ff", b: "#d7a6ff", c: "#ffd6f3", text: "#1d1440" },
}

/** Foil geometry of the front, in canvas pixels. */
export type ClubFrontGeometry = {
  frame: { x: number; y: number; w: number; h: number; r: number; width: number }
  ring: { cx: number; cy: number; r: number; width: number }
  stars: [number, number][][]
  pill: { x: number; y: number; w: number; h: number }
}

const star = (cx: number, cy: number, r: number): [number, number][] => {
  const pts: [number, number][] = []
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const rr = i % 2 ? r * 0.28 : r
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
  }
  return pts
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath()
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
  ctx.closePath()
}

function foilGradient(ctx: CanvasRenderingContext2D, finish: ClubCard["finish"], x: number, y: number, w: number, h: number) {
  const f = FINISH[finish]
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, f.a)
  g.addColorStop(0.5, f.b)
  g.addColorStop(1, f.c)
  return g
}

export function drawClubFront(ctx: CanvasRenderingContext2D, c: ClubCard, x: number, y: number, w: number, h: number, bleed = 0): ClubFrontGeometry {
  const u = w / 100
  const col = c.colors
  const cx = x + w / 2
  const cy = y + h * 0.43
  // Background, run into the bleed
  ctx.save()
  const bg = ctx.createLinearGradient(x, y - bleed, x, y + h + bleed)
  bg.addColorStop(0, col.mid)
  bg.addColorStop(1, col.dark)
  ctx.fillStyle = bg
  ctx.fillRect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed)

  // Sunburst: 28 rays from the logo
  const R = h * 1.2
  for (let i = 0; i < 28; i += 2) {
    const a0 = (i / 28) * Math.PI * 2
    const a1 = ((i + 1) / 28) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0))
    ctx.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1))
    ctx.closePath()
    ctx.fillStyle = "rgba(255,255,255,0.055)"
    ctx.fill()
  }
  // Accent glow behind the badge
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48 * u)
  glow.addColorStop(0, col.accent)
  glow.addColorStop(0.55, "rgba(168,214,58,0.35)")
  glow.addColorStop(1, "rgba(168,214,58,0)")
  ctx.fillStyle = glow
  ctx.fillRect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed)

  // Comic halftone in two corners
  ctx.fillStyle = "rgba(168,214,58,0.28)"
  for (let gy = 0; gy < 9; gy++)
    for (let gx = 0; gx < 9; gx++) {
      const d = Math.hypot(gx, gy)
      const r = Math.max(0, 1.1 - d * 0.11) * u
      if (r <= 0.05 * u) continue
      for (const [ox, oy, sx, sy] of [
        [x + 6 * u, y + 15 * u, 1, 1],
        [x + w - 6 * u, y + h - 16 * u, -1, -1],
      ]) {
        ctx.beginPath()
        ctx.arc(ox + sx * gx * 3.4 * u, oy + sy * gy * 3.4 * u, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

  // Speed lines on the sides
  ctx.strokeStyle = "rgba(255,255,255,0.35)"
  ctx.lineCap = "round"
  const lines: [number, number, number][] = [
    [0.16, 10, 0.5],
    [0.24, 16, 0.7],
    [0.33, 8, 0.4],
    [0.6, 14, 0.6],
    [0.68, 9, 0.45],
    [0.76, 18, 0.7],
  ]
  for (const [fy, len, lw] of lines) {
    ctx.lineWidth = lw * u
    for (const side of [0, 1]) {
      const lx = side ? x + w - 4 * u : x + 4 * u
      const ly = y + h * fy
      ctx.beginPath()
      ctx.moveTo(lx, ly)
      ctx.lineTo(lx + (side ? -1 : 1) * len * u, ly - len * 0.18 * u)
      ctx.stroke()
    }
  }
  ctx.restore()

  // Header: brand + badge pill
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.font = `700 ${2.8 * u}px ${SANS}`
  ctx.textBaseline = "alphabetic"
  ctx.textAlign = "left"
  ctx.fillText("TRAILDEX", x + 7 * u, y + 9.5 * u)
  ctx.font = `800 ${2.6 * u}px ${SANS}`
  const label = c.badge.toUpperCase()
  const pw = ctx.measureText(label).width + 6 * u
  const ph = 5.4 * u
  const px = x + w - 7 * u - pw
  const py = y + 5.6 * u
  roundRect(ctx, px, py, pw, ph, ph / 2)
  ctx.fillStyle = foilGradient(ctx, c.finish, px, py, pw, ph)
  ctx.fill()
  ctx.fillStyle = FINISH[c.finish].text
  ctx.textAlign = "center"
  ctx.fillText(label, px + pw / 2, py + ph * 0.7)

  // The badge: white disc, accent ring, the logo
  const br = 38 * u
  ctx.beginPath()
  ctx.arc(cx, cy, br + 2.2 * u, 0, Math.PI * 2)
  ctx.fillStyle = col.accent
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, br, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.fill()
  const ls = br * 1.86
  ctx.drawImage(c.logo, cx - ls / 2, cy - ls / 2, ls, ls)

  // Sparkles around the badge
  const stars = [
    star(cx - 41 * u, cy - 33 * u, 4.2 * u),
    star(cx + 42 * u, cy - 26 * u, 3 * u),
    star(cx + 37 * u, cy + 37 * u, 3.8 * u),
    star(cx - 38 * u, cy + 30 * u, 2.6 * u),
  ]
  for (const s of stars) {
    poly(ctx, s)
    ctx.fillStyle = foilGradient(ctx, c.finish, s[6][0], s[0][1], s[2][0] - s[6][0], s[4][1] - s[0][1])
    ctx.fill()
  }

  // Name plate: a tilted comic banner
  const plateY = y + h * 0.79
  ctx.save()
  ctx.translate(cx, plateY)
  ctx.rotate(-0.06)
  const plW = 80 * u
  const plH = 11 * u
  poly(ctx, [
    [-plW / 2 + 3 * u, -plH / 2],
    [plW / 2 + 1 * u, -plH / 2],
    [plW / 2 - 3 * u, plH / 2],
    [-plW / 2 - 1 * u, plH / 2],
  ])
  ctx.fillStyle = col.ink
  ctx.fill()
  poly(ctx, [
    [-plW / 2 + 2 * u, -plH / 2 - 1.2 * u],
    [plW / 2, -plH / 2 - 1.2 * u],
    [plW / 2 - 4 * u, plH / 2 - 1.2 * u],
    [-plW / 2 - 2 * u, plH / 2 - 1.2 * u],
  ])
  ctx.fillStyle = col.accent
  ctx.fill()
  ctx.fillStyle = col.dark
  ctx.textAlign = "center"
  const name = (c.member || c.club).toUpperCase()
  let size = 5.6
  ctx.font = `800 ${size * u}px ${SANS}`
  while (ctx.measureText(name).width > plW - 10 * u && size > 3) {
    size -= 0.2
    ctx.font = `800 ${size * u}px ${SANS}`
  }
  ctx.fillText(name, 0, 0.9 * u + size * 0.35 * u)
  ctx.restore()

  // Footer: season and number
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.textAlign = "left"
  ctx.font = `500 ${2.5 * u}px ${MONO}`
  ctx.fillText(c.season.toUpperCase(), x + 7 * u, y + h - 6.5 * u)
  ctx.textAlign = "right"
  if (c.number != null) ctx.fillText(`N° ${String(c.number).padStart(3, "0")}`, x + w - 7 * u, y + h - 6.5 * u)
  if (c.tagline) {
    ctx.textAlign = "center"
    ctx.font = `500 ${1.9 * u}px ${MONO}`
    ctx.fillStyle = "rgba(255,255,255,0.65)"
    ctx.fillText(c.tagline.toUpperCase(), cx, y + h * 0.885)
  }

  // Frame
  const fw = 1.1 * u
  const frame = { x: x + 3 * u, y: y + 3 * u, w: w - 6 * u, h: h - 6 * u, r: 4 * u, width: fw }
  roundRect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r)
  ctx.lineWidth = fw
  // Solid colour: the PDF canvas fills gradients, it does not stroke them.
  ctx.strokeStyle = FINISH[c.finish].b
  ctx.stroke()
  ctx.textAlign = "left"
  return { frame, ring: { cx, cy, r: br + 1.1 * u, width: 2.2 * u }, stars, pill: { x: px, y: py, w: pw, h: ph } }
}

export function drawClubBack(ctx: CanvasRenderingContext2D, c: ClubCard, x: number, y: number, w: number, h: number, bleed = 0) {
  const u = w / 100
  const col = c.colors
  ctx.save()
  ctx.fillStyle = col.dark
  ctx.fillRect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed)
  // Diagonal accent stripes
  for (let i = 0; i < 3; i++) {
    poly(ctx, [
      [x - bleed, y + h * (0.62 + i * 0.07)],
      [x + w + bleed, y + h * (0.48 + i * 0.07)],
      [x + w + bleed, y + h * (0.5 + i * 0.07)],
      [x - bleed, y + h * (0.64 + i * 0.07)],
    ])
    ctx.fillStyle = `rgba(168,214,58,${0.16 - i * 0.04})`
    ctx.fill()
  }
  ctx.restore()
  // Small logo badge
  const r = 13 * u
  ctx.beginPath()
  ctx.arc(x + w / 2, y + 19 * u, r + 1.2 * u, 0, Math.PI * 2)
  ctx.fillStyle = col.accent
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w / 2, y + 19 * u, r, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.fill()
  ctx.drawImage(c.logo, x + w / 2 - r * 0.93, y + 19 * u - r * 0.93, r * 1.86, r * 1.86)

  ctx.textAlign = "center"
  ctx.fillStyle = col.accent
  ctx.font = `500 ${2.4 * u}px ${MONO}`
  ctx.fillText("CARTE DE MEMBRE", x + w / 2, y + 40 * u)
  ctx.fillStyle = "#ffffff"
  ctx.font = `800 ${6 * u}px ${SANS}`
  ctx.fillText(c.club, x + w / 2, y + 48 * u)

  const rows: [string, string][] = [
    ["MEMBRE", c.member || "—"],
    ["SAISON", c.season],
    ["N°", c.number != null ? String(c.number).padStart(3, "0") : "—"],
  ]
  let ry = y + 60 * u
  for (const [k, v] of rows) {
    ctx.textAlign = "left"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = `500 ${2.3 * u}px ${MONO}`
    ctx.fillText(k, x + 8 * u, ry)
    ctx.textAlign = "right"
    ctx.fillStyle = "#ffffff"
    ctx.font = `600 ${3.4 * u}px ${SANS}`
    ctx.fillText(v, x + w - 8 * u, ry)
    ctx.fillStyle = "rgba(255,255,255,0.18)"
    ctx.fillRect(x + 8 * u, ry + 2.4 * u, w - 16 * u, 0.25 * u)
    ry += 9 * u
  }
  if (c.tagline) {
    ctx.textAlign = "center"
    ctx.fillStyle = col.accent
    ctx.font = `600 ${2.2 * u}px ${MONO}`
    ctx.fillText(c.tagline.toUpperCase(), x + w / 2, y + h - 10 * u)
  }
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = `700 ${2.4 * u}px ${SANS}`
  ctx.fillText("TRAILDEX", x + w / 2, y + h - 5.5 * u)
  ctx.textAlign = "left"
}

/** Exaprint files for a club card: CMYK print PDF (2 pages) + front-only foil PDF. */
export async function buildClubFiles(c: ClubCard, settings: Partial<PrintSettings> = {}, cmyk?: CmykProfile) {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  const doc = await PDFDocument.create()
  doc.setTitle(`TrailDex ${c.club} ${c.member ?? ""}`.trim())
  if (cmyk) addOutputIntent(doc, cmyk)
  doc.registerFontkit(fontkit)
  const fonts = await embedCardFonts(doc, await loadFontBytes(), fontkit as never)
  const foilDoc = await PDFDocument.create()
  const pxPerMm = s.dpi / 25.4
  const b = s.bleedMm * pxPerMm
  const w = s.widthMm * pxPerMm
  const h = s.heightMm * pxPerMm
  for (const side of ["front", "back"] as const) {
    const page = addTrimmedPage(doc, s)
    const pc = new PdfCanvas(doc, page, fonts, cmyk, s.dpi, (72 / 25.4) / pxPerMm)
    const ctx = pc as unknown as CanvasRenderingContext2D
    if (side === "front") {
      const g = drawClubFront(ctx, c, b, b, w, h, b)
      pc.finish()
      const o = new Ops(pxPerMm, page.getSize().height)
      o.parts.push("1 J 1 j")
      o.roundRect(g.frame.x, g.frame.y, g.frame.w, g.frame.h, g.frame.r)
      o.parts.push(`${o.foilWidth(g.frame.width)} w S`)
      // Ring around the badge (outer minus inner circle) and the sparkles
      const ring = (r: number) => o.roundRect(g.ring.cx - r, g.ring.cy - r, 2 * r, 2 * r, r)
      ring(g.ring.r + g.ring.width / 2)
      ring(g.ring.r - g.ring.width / 2)
      o.parts.push("f*")
      for (const st of g.stars) {
        o.polyline(st, true)
        o.parts.push("f")
      }
      const fp = addTrimmedPage(foilDoc, s)
      fp.node.addContentStream(foilDoc.context.register(foilDoc.context.flateStream(`q 0 0 0 1 k 0 0 0 1 K\n${o.parts.join("\n")}\nQ`)))
    } else {
      drawClubBack(ctx, c, b, b, w, h, b)
      pc.finish()
    }
  }
  return { print: await doc.save(), foil: await foilDoc.save() }
}
