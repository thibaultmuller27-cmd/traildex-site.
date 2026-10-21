/**
 * Renders a card as a shareable PNG (Instagram Story 9:16 or post 4:5),
 * entirely in the browser with Canvas 2D. Route and profile reuse the card's
 * SVG path data through Path2D, so the image matches the live card.
 */
import { THEMES } from "@/components/TrailCard"
import { RARITIES } from "./config"
import { fmtDate, fmtDuration, fmtInt, fmtKm, fmtRank, parseRank, type CardData, type Rarity } from "./card"
import { seeded } from "./utils"

export type ShareFormat = "story" | "post"

export const FORMATS: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story · 9:16" },
  post: { w: 1080, h: 1350, label: "Post · 4:5" },
}

/** Canvas versions of the card backgrounds (the CSS ones are gradient strings). */
const CARD_BG: Record<Rarity, { stops: [number, string][]; radial?: [number, number] }> = {
  commune: { stops: [[0, "#fdfcf9"], [1, "#f1eee6"]] },
  rare: { stops: [[0, "#1d4f86"], [0.45, "#0b2546"], [1, "#061325"]], radial: [0.2, 0] },
  epique: { stops: [[0, "#6a1f9a"], [0.45, "#2a0d4f"], [1, "#12062a"]], radial: [0.8, 0] },
  legendaire: { stops: [[0, "#3a2a0c"], [0.5, "#15100a"], [1, "#050403"]], radial: [0.5, 0] },
}

/** The glow behind the card on the share backdrop. */
const GLOW: Record<Rarity, string> = {
  commune: "rgba(226,86,43,0.35)",
  rare: "rgba(80,170,255,0.45)",
  epique: "rgba(220,90,255,0.5)",
  legendaire: "rgba(255,190,80,0.45)",
}

const FOIL: Partial<Record<Rarity, string[]>> = {
  rare: ["#9aa4b5", "#ffffff", "#7c8799", "#e9eef6", "#9aa4b5"],
  epique: ["#ff8ad8", "#ffd36e", "#8cff9e", "#6ee7ff", "#9a8cff", "#ff8ad8"],
  legendaire: ["#a86b1f", "#ffe29a", "#b77a2a", "#fff1c4", "#a86b1f"],
}

const SANS = "Inter, -apple-system, 'Segoe UI', sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

/** Draws the front of the card with its top-left corner at (x, y). */
async function drawCard(ctx: CanvasRenderingContext2D, card: CardData, x: number, y: number, w: number) {
  const t = THEMES[card.rarity]
  const u = w / 100 // 1 "cqw", the unit the live card is designed in
  const h = w * 1.4
  const pad = 5.5 * u
  const radius = 4.5 * u

  ctx.save()
  roundRect(ctx, x, y, w, h, radius)
  ctx.clip()

  // Background
  const bg = CARD_BG[card.rarity]
  const grad = bg.radial
    ? ctx.createRadialGradient(x + bg.radial[0] * w, y + bg.radial[1] * h, 0, x + bg.radial[0] * w, y + bg.radial[1] * h, h * 1.05)
    : ctx.createLinearGradient(x, y, x + w * 0.4, y + h)
  for (const [o, c] of bg.stops) grad.addColorStop(o, c)
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)

  // Header
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = t.ink
  ctx.font = `700 ${2.8 * u}px ${SANS}`
  const headY = y + pad + 2.6 * u
  ctx.save()
  ctx.strokeStyle = t.ink
  ctx.lineWidth = 0.55 * u
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  const lx = x + pad
  const ly = headY - 2.6 * u
  ctx.moveTo(lx + 0.3 * u, ly + 2.5 * u)
  ctx.lineTo(lx + 1.2 * u, ly + 1.1 * u)
  ctx.lineTo(lx + 1.8 * u, ly + 1.9 * u)
  ctx.lineTo(lx + 2.2 * u, ly + 1.4 * u)
  ctx.lineTo(lx + 2.9 * u, ly + 2.5 * u)
  ctx.stroke()
  ctx.restore()
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

  // Art window
  ctx.save()
  roundRect(ctx, artX, artTop, artW, artH, 3 * u)
  ctx.fillStyle = t.panel
  ctx.fill()
  ctx.clip()
  if (card.photo) {
    try {
      const img = await loadImage(card.photo)
      const s = Math.max(artW / img.width, artH / img.height)
      ctx.drawImage(img, artX + (artW - img.width * s) / 2, artTop + (artH - img.height * s) / 2, img.width * s, img.height * s)
      const shade = ctx.createLinearGradient(0, artTop + artH, 0, artTop)
      shade.addColorStop(0, "rgba(0,0,0,0.55)")
      shade.addColorStop(0.6, "rgba(0,0,0,0.05)")
      ctx.fillStyle = shade
      ctx.fillRect(artX, artTop, artW, artH)
    } catch {
      /* unreadable photo: keep the terrain */
    }
  } else {
    topo(ctx, hashSeed(card.race + card.id), artX, artTop, artW, artH, t.line, Math.max(1, 0.18 * u))
  }
  if (card.routePath) {
    // The route lives in a 100×100 box drawn "meet" (centred, uniform scale).
    const s = Math.min(artW, artH) / 100
    const ox = artX + (artW - 100 * s) / 2
    const oy = artTop + (artH - 100 * s) / 2
    const route = new Path2D(card.routePath)
    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(s, s)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.shadowColor = card.photo ? "rgba(0,0,0,0.6)" : t.routeGlow
    ctx.shadowBlur = 3 * u
    ctx.strokeStyle = card.photo ? "#ffffff" : t.route
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
      ctx.strokeStyle = card.photo ? "#000" : t.route
      ctx.stroke()
    }
    if (card.end) {
      ctx.save()
      ctx.translate(card.end[0], card.end[1])
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = card.photo ? "#fff" : t.route
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
}

function hexA(color: string, a: number) {
  const m = color.match(/^#([0-9a-f]{6})$/i)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

export async function renderShareImage(card: CardData, format: ShareFormat): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`700 40px Inter`),
    document.fonts.load(`600 40px Inter`),
    document.fonts.load(`500 20px "JetBrains Mono"`),
  ]).catch(() => undefined)

  const { w: W, h: H } = FORMATS[format]
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!

  // Backdrop: near-black with the card's colour glowing behind it
  ctx.fillStyle = "#0a0a0b"
  ctx.fillRect(0, 0, W, H)
  const cardW = format === "story" ? 760 : 640
  const cardH = cardW * 1.4
  const cardX = (W - cardW) / 2
  const cardY = format === "story" ? 360 : 200
  const glow = ctx.createRadialGradient(W / 2, cardY + cardH / 2, 0, W / 2, cardY + cardH / 2, W * 0.85)
  glow.addColorStop(0, GLOW[card.rarity])
  glow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Top line
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.font = `700 34px ${SANS}`
  ctx.textBaseline = "alphabetic"
  const top = format === "story" ? 190 : 110
  ctx.textAlign = "center"
  ctx.fillText("Ma carte TrailDex", W / 2, top)
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = `500 26px ${SANS}`
  const sub = [card.race, fmtDate(card.date)].filter(Boolean).join(" · ")
  ctx.fillText(sub, W / 2, top + 48)

  // Card with a soft shadow
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.6)"
  ctx.shadowBlur = 80
  ctx.shadowOffsetY = 40
  roundRect(ctx, cardX, cardY, cardW, cardH, cardW * 0.045)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.restore()
  await drawCard(ctx, card, cardX, cardY, cardW)

  // Footer call to action
  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.font = `600 32px ${SANS}`
  const foot = cardY + cardH + (format === "story" ? 170 : 90)
  ctx.fillText("Crée la tienne sur traildex.fr", W / 2, foot)
  ctx.textAlign = "left"

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"),
  )
}

/** Caption for Instagram or a Strava activity description. */
export function shareCaption(card: CardData) {
  const parts = [
    card.distanceKm != null && `${fmtKm(card.distanceKm)} km`,
    card.gain != null && `${fmtInt(card.gain)} m D+`,
    card.timeSec && `en ${fmtDuration(card.timeSec)}`,
  ].filter(Boolean)
  return `Ma carte TrailDex ${RARITIES[card.rarity].label} : ${card.race}${parts.length ? ` — ${parts.join(", ")}` : ""}. Crée la tienne sur traildex.fr #trail #trailrunning #traildex`
}
