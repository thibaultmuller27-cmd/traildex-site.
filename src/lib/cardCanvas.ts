/**
 * Draws TrailDex cards with Canvas 2D, from the same data and colours as the
 * live card. Used for the share images and for the print files. Route and
 * profile reuse the card's SVG path data through Path2D.
 */
import { THEMES } from "@/components/TrailCard"
import { RARITIES } from "./config"
import { effortKm, fmtDate, fmtDuration, fmtInt, fmtKm, fmtPace, fmtRank, parseRank, type CardData, type Rarity } from "./card"
import { seeded } from "./utils"

/** Canvas versions of the card backgrounds (the CSS ones are gradient strings). */
const CARD_BG: Record<Rarity, { stops: [number, string][]; radial?: [number, number] }> = {
  commune: { stops: [[0, "#fdfcf9"], [1, "#f1eee6"]] },
  rare: { stops: [[0, "#1d4f86"], [0.45, "#0b2546"], [1, "#061325"]], radial: [0.2, 0] },
  epique: { stops: [[0, "#6a1f9a"], [0.45, "#2a0d4f"], [1, "#12062a"]], radial: [0.8, 0] },
  legendaire: { stops: [[0, "#3a2a0c"], [0.5, "#15100a"], [1, "#050403"]], radial: [0.5, 0] },
}

/** Backs of the cards (CSS backBg in TrailCard). */
const BACK_BG: Record<Rarity, { stops: [number, string][]; radial?: [number, number] }> = {
  commune: { stops: [[0, "#f6f3ec"], [1, "#e7e2d6"]] },
  rare: { stops: [[0, "#174476"], [0.6, "#081a33"], [1, "#040b17"]], radial: [0.5, 0.1] },
  epique: { stops: [[0, "#4a1675"], [0.6, "#1b0838"], [1, "#0a0318"]], radial: [0.5, 0.1] },
  legendaire: { stops: [[0, "#33250b"], [0.6, "#120d06"], [1, "#000000"]], radial: [0.5, 0.1] },
}

const FOIL: Partial<Record<Rarity, string[]>> = {
  rare: ["#9aa4b5", "#ffffff", "#7c8799", "#e9eef6", "#9aa4b5"],
  epique: ["#ff8ad8", "#ffd36e", "#8cff9e", "#6ee7ff", "#9a8cff", "#ff8ad8"],
  legendaire: ["#a86b1f", "#ffe29a", "#b77a2a", "#fff1c4", "#a86b1f"],
}

export const SANS = "Inter, -apple-system, 'Segoe UI', sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Spaced uppercase text (canvas letterSpacing is not everywhere yet). */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "right" = "left") {
  const chars = [...text]
  const width = chars.reduce((s, c) => s + ctx.measureText(c).width + spacing, -spacing)
  let cx = align === "right" ? x - width : x
  ctx.textAlign = "left"
  for (const c of chars) {
    ctx.fillText(c, cx, y)
    cx += ctx.measureText(c).width + spacing
  }
  return width
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const test = line ? line + " " + w : w
    if (ctx.measureText(test).width <= maxW || !line) line = test
    else {
      lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (ctx.measureText(last + "…").width > maxW && last.length) last = last.slice(0, -1)
    kept[maxLines - 1] = last + "…"
    return kept
  }
  return lines
}

function topo(ctx: CanvasRenderingContext2D, seed: number, x: number, y: number, w: number, h: number, color: string, lw: number) {
  const rnd = seeded(seed)
  const size = Math.max(w, h)
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  const ph = [rnd() * 6.28, rnd() * 6.28]
  for (let k = 0; k < 2; k++) {
    const cx = x + (0.2 + rnd() * 0.6) * w
    const cy = y + (0.2 + rnd() * 0.6) * h
    for (let r = 0.06; r < 0.7; r += 0.065) {
      ctx.beginPath()
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2
        const m = 1 + 0.18 * Math.sin(3 * a + ph[0] + r * 5) + 0.1 * Math.cos(5 * a + ph[1])
        const px = cx + Math.cos(a) * r * size * m
        const py = cy + Math.sin(a) * r * size * m * 0.8
        if (i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
}

function hashSeed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export type DrawOptions = {
  /** Card height; defaults to the 5:7 ratio of the live card. */
  h?: number
  /** Print mode: square trim, background run into the bleed, no simulated foil or glare. */
  print?: boolean
  /** Bleed around the card, in canvas pixels (print mode). */
  bleed?: number
}

/** Where the foil-able vector elements of a face landed, in canvas pixels. */
export type FrontGeometry = {
  u: number
  logo: [number, number][]
  gems: { cx: number; cy: number; r: number }[]
  art: { x: number; y: number; w: number; h: number; r: number }
  route: { ox: number; oy: number; s: number } | null
  profile: { x: number; y: number; w: number; h: number } | null
}

export type BackGeometry = {
  u: number
  logo: [number, number][]
  seal: { cx: number; cy: number; outer: number; inner: number }
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  bg: { stops: [number, string][]; radial?: [number, number] },
  x: number,
  y: number,
  w: number,
  h: number,
  bleed: number,
) {
  const grad = bg.radial
    ? ctx.createRadialGradient(x + bg.radial[0] * w, y + bg.radial[1] * h, 0, x + bg.radial[0] * w, y + bg.radial[1] * h, h * 1.05)
    : ctx.createLinearGradient(x, y, x + w * 0.4, y + h)
  for (const [o, c] of bg.stops) grad.addColorStop(o, c)
  ctx.fillStyle = grad
  ctx.fillRect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed)
}

/** The TrailDex mountain mark, as points (also used for the foil layer). */
function logoPoints(lx: number, ly: number, u: number): [number, number][] {
  return [
    [lx + 0.3 * u, ly + 2.5 * u],
    [lx + 1.2 * u, ly + 1.1 * u],
    [lx + 1.8 * u, ly + 1.9 * u],
    [lx + 2.2 * u, ly + 1.4 * u],
    [lx + 2.9 * u, ly + 2.5 * u],
  ]
}

function drawLogo(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, u: number) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.55 * u
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
  ctx.stroke()
  ctx.restore()
}

/** Draws the front of the card with its top-left corner at (x, y). */
export async function drawCardFront(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  x: number,
  y: number,
  w: number,
  opts: DrawOptions = {},
): Promise<FrontGeometry> {
  const t = THEMES[card.rarity]
  const u = w / 100 // 1 "cqw", the unit the live card is designed in
  const h = opts.h ?? w * 1.4
  const pad = 5.5 * u
  const radius = 4.5 * u
  const print = !!opts.print
  const geo: FrontGeometry = { u, logo: [], gems: [], art: { x: 0, y: 0, w: 0, h: 0, r: 0 }, route: null, profile: null }

  ctx.save()
  if (!print) {
    roundRect(ctx, x, y, w, h, radius)
    ctx.clip()
  }

  fillBackground(ctx, CARD_BG[card.rarity], x, y, w, h, print ? opts.bleed ?? 0 : 0)

  // Header
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = t.ink
  ctx.font = `700 ${2.8 * u}px ${SANS}`
  const headY = y + pad + 2.6 * u
  const lx = x + pad
  geo.logo = logoPoints(lx, headY - 2.6 * u, u)
  drawLogo(ctx, geo.logo, t.ink, u)
  spaced(ctx, "TRAILDEX", lx + 4 * u, headY, 0.6 * u)

  const rarity = RARITIES[card.rarity]
  ctx.font = `600 ${2.3 * u}px ${SANS}`
  const label = rarity.label.toUpperCase()
  const labelW = [...label].reduce((s, c) => s + ctx.measureText(c).width + 0.32 * u, 0)
  const pillW = labelW + 4.4 * u + 4 * 2.8 * u
  const pillH = 4.4 * u
  const pillX = x + w - pad - pillW
  const pillY = headY - 3.3 * u
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
  if (card.rarity === "legendaire") {
    const pg = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY + pillH)
    pg.addColorStop(0, "#f9e3a3")
    pg.addColorStop(1, "#c99332")
    ctx.fillStyle = pg
  } else ctx.fillStyle = t.pill
  ctx.fill()
  const gemColor = card.rarity === "legendaire" ? t.pillInk : card.rarity === "commune" ? "#fff" : rarity.color
  for (let i = 0; i < 4; i++) {
    const gx = pillX + 2.2 * u + i * 2.8 * u + 1.1 * u
    const gy = pillY + pillH / 2
    ctx.globalAlpha = i < rarity.gems ? 1 : 0.28
    if (i < rarity.gems) geo.gems.push({ cx: gx, cy: gy, r: 1.1 * u })
    ctx.fillStyle = gemColor
    ctx.beginPath()
    ctx.moveTo(gx, gy - 1.1 * u)
    ctx.lineTo(gx + 1.1 * u, gy)
    ctx.lineTo(gx, gy + 1.1 * u)
    ctx.lineTo(gx - 1.1 * u, gy)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = t.pillInk
  spaced(ctx, label, pillX + pillW - 2.2 * u, pillY + pillH / 2 + 0.85 * u, 0.32 * u, "right")

  // Title and date
  ctx.fillStyle = t.ink
  ctx.font = `700 ${7.4 * u}px ${SANS}`
  const titleLines = wrap(ctx, card.race || "Ma course", w - pad * 2, 2)
  let cy = headY + 4 * u + 6.4 * u
  for (const line of titleLines) {
    ctx.fillText(line, x + pad, cy)
    cy += 7.6 * u
  }
  cy -= 7.6 * u
  ctx.fillStyle = t.sub
  ctx.font = `500 ${2.4 * u}px ${MONO}`
  const dateLine = (fmtDate(card.date) + (card.maxEle != null ? ` · alt. ${fmtInt(card.maxEle)} m` : "")).toUpperCase()
  spaced(ctx, dateLine, x + pad, cy + 4.4 * u, 0.38 * u)

  // Bottom block, measured from the card's foot like the live layout
  const footY = y + h - pad
  const statsTop = footY - 3.6 * u - 3.2 * u - 10.4 * u
  const profH = 11 * u
  const profTop = statsTop - 2.6 * u - 2.4 * u - profH
  const artTop = cy + 4.4 * u + 3.6 * u
  const artBottom = profTop - 2.6 * u
  const artX = x + pad
  const artW = w - pad * 2
  const artH = artBottom - artTop
  geo.art = { x: artX, y: artTop, w: artW, h: artH, r: 3 * u }

  // Art window
  ctx.save()
  roundRect(ctx, artX, artTop, artW, artH, 3 * u)
  ctx.fillStyle = t.panel
  ctx.fill()
  ctx.clip()
  topo(ctx, hashSeed(card.race + card.id), artX, artTop, artW, artH, t.line, Math.max(1, 0.18 * u))
  if (card.routePath) {
    // The route lives in a 100×100 box drawn "meet" (centred, uniform scale).
    const s = Math.min(artW, artH) / 100
    const ox = artX + (artW - 100 * s) / 2
    const oy = artTop + (artH - 100 * s) / 2
    geo.route = { ox, oy, s }
    const route = new Path2D(card.routePath)
    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(s, s)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.shadowColor = t.routeGlow
    ctx.shadowBlur = 3 * u
    ctx.strokeStyle = t.route
    ctx.lineWidth = 1.3
    ctx.stroke(route)
    ctx.shadowBlur = 0
    ctx.stroke(route)
    if (card.start) {
      ctx.beginPath()
      ctx.arc(card.start[0], card.start[1], 2, 0, Math.PI * 2)
      ctx.fillStyle = t.ink
      ctx.fill()
      ctx.lineWidth = 0.8
      ctx.strokeStyle = t.route
      ctx.stroke()
    }
    if (card.end) {
      ctx.save()
      ctx.translate(card.end[0], card.end[1])
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = t.route
      ctx.fillRect(-1.8, -1.8, 3.6, 3.6)
      ctx.restore()
    }
    ctx.restore()
  }
  const rank = parseRank(card.rank)
  if (rank && rank.pos <= 3) {
    ctx.font = `700 ${2.1 * u}px ${SANS}`
    const pw = [..."PODIUM"].reduce((s2, c) => s2 + ctx.measureText(c).width + 0.25 * u, 0) + 3.6 * u
    roundRect(ctx, artX + 2.6 * u, artTop + 2.4 * u, pw, 3.6 * u, 1.8 * u)
    const pg = ctx.createLinearGradient(artX, artTop, artX + pw, artTop)
    pg.addColorStop(0, "#ffe8a3")
    pg.addColorStop(1, "#d69a2b")
    ctx.fillStyle = pg
    ctx.fill()
    ctx.fillStyle = "#2a1d05"
    spaced(ctx, "PODIUM", artX + 4.4 * u, artTop + 4.95 * u, 0.25 * u)
  }
  ctx.restore()
  ctx.save()
  roundRect(ctx, artX, artTop, artW, artH, 3 * u)
  ctx.strokeStyle = t.line
  ctx.lineWidth = Math.max(1, 0.25 * u)
  ctx.stroke()
  ctx.restore()

  // Elevation profile (100×30 box stretched to the strip)
  if (card.profileArea) {
    geo.profile = { x: x + pad, y: profTop, w: artW, h: profH }
    ctx.save()
    ctx.translate(x + pad, profTop)
    ctx.scale(artW / 100, profH / 30)
    const pf = ctx.createLinearGradient(0, 0, 0, 30)
    pf.addColorStop(0, hexA(t.profile, 0.45))
    pf.addColorStop(1, hexA(t.profile, 0))
    ctx.fillStyle = pf
    ctx.fill(new Path2D(card.profileArea))
    ctx.restore()
    // The line is transformed path by path, so the pen is not stretched.
    const line = new Path2D()
    line.addPath(new Path2D(card.profileLine), new DOMMatrix().translate(x + pad, profTop).scale(artW / 100, profH / 30))
    ctx.strokeStyle = t.profile
    ctx.lineWidth = Math.max(1.5, 0.35 * u)
    ctx.stroke(line)
  }

  // Stats
  ctx.fillStyle = t.line
  ctx.fillRect(x + pad, statsTop, artW, Math.max(1, 0.2 * u))
  const stats: [string, string][] = [
    ["DIST.", card.distanceKm != null ? `${fmtKm(card.distanceKm)} km` : "— km"],
    ["D+", card.gain != null ? `${fmtInt(card.gain)} m` : "— m"],
    ["CHRONO", fmtDuration(card.timeSec).replace(" h ", "h")],
    ["CLASS.", fmtRank(card.rank)],
  ]
  const colW = (artW - 3 * 2 * u) / 4
  stats.forEach(([k, v], i) => {
    const sx = x + pad + i * (colW + 2 * u)
    ctx.fillStyle = t.sub
    ctx.font = `500 ${2.1 * u}px ${MONO}`
    spaced(ctx, k, sx, statsTop + 2.6 * u + 2.1 * u, 0.29 * u)
    ctx.fillStyle = t.ink
    ctx.font = `700 ${4.6 * u}px ${SANS}`
    let val = v
    while (ctx.measureText(val).width > colW && val.length > 1) val = val.slice(0, -1)
    ctx.fillText(val, sx, statsTop + 2.6 * u + 2.1 * u + 5.4 * u)
  })

  // Footer
  ctx.fillStyle = t.ink
  ctx.font = `600 ${3.6 * u}px ${SANS}`
  ctx.fillText(card.runner || "", x + pad, footY)
  ctx.fillStyle = t.sub
  ctx.font = `500 ${2.3 * u}px ${MONO}`
  spaced(ctx, `NO. ${String(card.number).padStart(3, "0")}`, x + w - pad, footY, 0.32 * u, "right")

  if (print) {
    // The printer lays the real foil from the vector layer; nothing to fake.
    ctx.restore()
    return geo
  }

  // Foil and glare: a frozen frame of what the live card does
  const foil = FOIL[card.rarity]
  if (foil) {
    ctx.save()
    ctx.globalCompositeOperation = "color-dodge"
    ctx.globalAlpha = card.rarity === "epique" ? 0.3 : 0.24
    const fg = ctx.createLinearGradient(x, y, x + w, y + h * 0.7)
    foil.forEach((c, i) => fg.addColorStop(i / (foil.length - 1), c))
    ctx.fillStyle = fg
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }
  ctx.save()
  ctx.globalCompositeOperation = "overlay"
  const glare = ctx.createRadialGradient(x + w * 0.3, y + h * 0.18, 0, x + w * 0.3, y + h * 0.18, w * 0.9)
  glare.addColorStop(0, "rgba(255,255,255,0.55)")
  glare.addColorStop(0.3, "rgba(255,255,255,0.12)")
  glare.addColorStop(0.6, "rgba(255,255,255,0)")
  ctx.fillStyle = glare
  ctx.fillRect(x, y, w, h)
  ctx.restore()
  ctx.restore()

  // Edge
  roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius)
  ctx.strokeStyle = "rgba(255,255,255,0.22)"
  ctx.lineWidth = 2
  ctx.stroke()
  return geo
}

function hexA(color: string, a: number) {
  const m = color.match(/^#([0-9a-f]{6})$/i)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}


function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export type BackOptions = DrawOptions & {
  /** Order reference printed small at the foot, to match card and parcel. */
  reference?: string
}

/** Draws the back of the card (the "fiche de course"), like CardBack. */
export async function drawCardBack(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  x: number,
  y: number,
  w: number,
  opts: BackOptions = {},
): Promise<BackGeometry> {
  const t = THEMES[card.rarity]
  const u = w / 100
  const h = opts.h ?? w * 1.4
  const pad = 6 * u
  const print = !!opts.print

  ctx.save()
  if (!print) {
    roundRect(ctx, x, y, w, h, 4.5 * u)
    ctx.clip()
  }
  fillBackground(ctx, BACK_BG[card.rarity], x, y, w, h, print ? opts.bleed ?? 0 : 0)
  ctx.save()
  ctx.globalAlpha = 0.6
  topo(ctx, hashSeed(card.id + "back"), x, y, w, h, t.line, Math.max(1, 0.18 * u))
  ctx.restore()

  // Header
  ctx.textBaseline = "alphabetic"
  const headY = y + pad + 2.6 * u
  const logo = logoPoints(x + pad, headY - 2.6 * u, u)
  drawLogo(ctx, logo, t.ink, u)
  ctx.fillStyle = t.ink
  ctx.font = `700 ${2.8 * u}px ${SANS}`
  spaced(ctx, "TRAILDEX", x + pad + 4 * u, headY, 0.6 * u)
  ctx.fillStyle = t.sub
  ctx.font = `500 ${2.3 * u}px ${MONO}`
  spaced(ctx, `NO. ${String(card.number).padStart(3, "0")}`, x + w - pad, headY, 0.32 * u, "right")

  // Km-effort and photo
  const effort = effortKm(card.distanceKm, card.gain)
  const blockTop = headY + (card.photo ? 5 : 7) * u
  const photoW = 40 * u
  const photoH = 30 * u
  let blockBottom = blockTop + 2.4 * u + 1.5 * u + 12 * u + 1 * u + 3.6 * u
  if (card.photo) {
    blockBottom = Math.max(blockBottom, blockTop + photoH)
    try {
      const img = await loadImage(card.photo)
      const px = x + w - pad - photoW
      const py = blockBottom - photoH
      ctx.save()
      roundRect(ctx, px, py, photoW, photoH, 2.4 * u)
      ctx.clip()
      const s = Math.max(photoW / img.width, photoH / img.height)
      ctx.drawImage(img, px + (photoW - img.width * s) / 2, py + (photoH - img.height * s) / 2, img.width * s, img.height * s)
      ctx.restore()
      roundRect(ctx, px, py, photoW, photoH, 2.4 * u)
      ctx.strokeStyle = t.line
      ctx.lineWidth = Math.max(1, 0.2 * u)
      ctx.stroke()
    } catch {
      /* unreadable photo: leave the space empty */
    }
  }
  const labelY = blockBottom - (3.6 * u + 1 * u + 12 * u + 1.5 * u)
  ctx.fillStyle = t.sub
  ctx.font = `500 ${2.4 * u}px ${MONO}`
  spaced(ctx, "FICHE DE COURSE", x + pad, labelY, 0.43 * u)
  ctx.fillStyle = t.ink
  ctx.font = `700 ${12 * u}px ${SANS}`
  ctx.fillText(effort ? String(Math.round(effort)) : "—", x + pad, labelY + 1.5 * u + 10 * u)
  ctx.fillStyle = t.sub
  ctx.font = `500 ${3.6 * u}px ${SANS}`
  ctx.fillText("km-effort", x + pad, blockBottom - 0.4 * u)

  // Rows
  const rank = parseRank(card.rank)
  const speed = card.timeSec && card.distanceKm ? (card.distanceKm / (card.timeSec / 3600)).toFixed(1).replace(".", ",") : null
  const dPerKm = card.gain && card.distanceKm ? Math.round(card.gain / card.distanceKm) : null
  const rows: [string, string][] = [
    ["COUREUR", card.runner || "—"],
    ["ALLURE MOYENNE", fmtPace(card.timeSec, card.distanceKm)],
    ["VITESSE", speed ? `${speed} km/h` : "—"],
    ["D+ PAR KM", dPerKm ? `${dPerKm} m` : "—"],
    ["POINT CULMINANT", card.maxEle != null ? `${fmtInt(card.maxEle)} m` : "—"],
    ["CLASSEMENT", rank ? `${fmtRank(card.rank)}${rank.total ? ` / ${fmtInt(rank.total)}` : ""}` : "—"],
  ]
  let ry = blockBottom + (card.photo ? 4 : 5) * u
  const rowH = 1.6 * u * 2 + 4.2 * u
  for (const [k, v] of rows) {
    const base = ry + 1.6 * u + 3.4 * u
    ctx.fillStyle = t.sub
    ctx.font = `500 ${2.3 * u}px ${MONO}`
    spaced(ctx, k, x + pad, base, 0.32 * u)
    ctx.fillStyle = t.ink
    ctx.font = `600 ${3.4 * u}px ${SANS}`
    ctx.textAlign = "right"
    ctx.fillText(v, x + w - pad, base)
    ctx.textAlign = "left"
    ry += rowH
    ctx.fillStyle = t.line
    ctx.fillRect(x + pad, ry, w - 2 * pad, Math.max(1, 0.2 * u))
  }

  // Foot: rarity and authenticity seal
  const footY = y + h - pad
  ctx.fillStyle = t.sub
  ctx.font = `500 ${2.2 * u}px ${MONO}`
  spaced(ctx, "RARETÉ", x + pad, footY - 5.2 * u, 0.35 * u)
  ctx.fillStyle = t.ink
  ctx.font = `600 ${3.6 * u}px ${SANS}`
  ctx.fillText(RARITIES[card.rarity].label, x + pad, footY)
  const seal = { cx: x + w - pad - 8 * u, cy: footY - 8 * u + 0.6 * u, outer: 8 * u, inner: 6.25 * u }
  const ring = ctx.createConicGradient(0, seal.cx, seal.cy)
  ;["#ff8ad8", "#ffd36e", "#8cff9e", "#6ee7ff", "#9a8cff", "#ff8ad8"].forEach((c, i) => ring.addColorStop(i / 5, c))
  ctx.beginPath()
  ctx.arc(seal.cx, seal.cy, seal.outer, 0, Math.PI * 2)
  ctx.fillStyle = ring
  ctx.fill()
  ctx.beginPath()
  ctx.arc(seal.cx, seal.cy, seal.inner, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(10,10,10,0.82)"
  ctx.fill()
  ctx.fillStyle = "#fff"
  ctx.font = `700 ${1.7 * u}px ${SANS}`
  ctx.textAlign = "center"
  ;["CARTE", "AUTHEN-", "TIQUE"].forEach((line, i) => ctx.fillText(line, seal.cx, seal.cy - 1.6 * u + i * 2.2 * u + 0.6 * u))
  ctx.textAlign = "left"
  if (opts.reference) {
    ctx.fillStyle = t.sub
    ctx.font = `500 ${1.8 * u}px ${MONO}`
    spaced(ctx, opts.reference, x + pad, footY + 3.2 * u, 0.2 * u)
  }
  ctx.restore()
  return { u, logo, seal }
}

/** Waits for the card typefaces, so canvas text never falls back. */
export async function loadCardFonts() {
  await Promise.all([
    document.fonts.load(`700 40px Inter`),
    document.fonts.load(`600 40px Inter`),
    document.fonts.load(`500 40px Inter`),
    document.fonts.load(`500 20px "JetBrains Mono"`),
  ]).catch(() => undefined)
}
