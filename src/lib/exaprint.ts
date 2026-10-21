/**
 * Print files for Exaprint (hot-foil business card, custom size).
 *
 * One PDF per card, two pages (front, back), 1:1 scale with bleed. The
 * artwork is a 600 dpi image; the foil is real vector artwork in a spot
 * colour named after the finish, on a layer (optional content group) called
 * "Acabado", with overprint on — as Exaprint's file guide asks.
 */
import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFRef,
} from "pdf-lib"
import { drawCardBack, drawCardFront, loadCardFonts, type BackGeometry, type FrontGeometry } from "./cardCanvas"
import type { CardData } from "./card"

export type PrintSettings = {
  /** Trimmed card size in mm (Exaprint's foil cards accept 40–55 × 55–95). */
  widthMm: number
  heightMm: number
  /** Bleed in mm, as given by the Exaprint template. */
  bleedMm: number
  /** Spot colour names, exactly as written in the Exaprint template. */
  spotGold: string
  spotHolo: string
  dpi: number
}

export const DEFAULT_SETTINGS: PrintSettings = {
  widthMm: 63,
  heightMm: 88,
  bleedMm: 3,
  spotGold: "Dorure Or",
  spotHolo: "Dorure Holographique",
  dpi: 600,
}

const PT_PER_MM = 72 / 25.4

/** Which spot colour a card's foil uses, or null for a Standard card. */
export function foilSpot(card: CardData, s: PrintSettings) {
  if (card.rarity === "legendaire") return { name: s.spotGold, cmyk: [0, 0.25, 0.7, 0.15] }
  if (card.rarity === "rare" || card.rarity === "epique") return { name: s.spotHolo, cmyk: [0.25, 0, 0.05, 0] }
  return null
}

type Raster = { jpg: Uint8Array; front?: FrontGeometry; back?: BackGeometry; pxPerMm: number }

async function rasterFace(card: CardData, side: "front" | "back", s: PrintSettings, reference?: string): Promise<Raster> {
  const pxPerMm = s.dpi / 25.4
  const bleed = s.bleedMm * pxPerMm
  const canvas = document.createElement("canvas")
  canvas.width = Math.round((s.widthMm + 2 * s.bleedMm) * pxPerMm)
  canvas.height = Math.round((s.heightMm + 2 * s.bleedMm) * pxPerMm)
  const ctx = canvas.getContext("2d")!
  const w = s.widthMm * pxPerMm
  const h = s.heightMm * pxPerMm
  const opts = { print: true, bleed, h }
  const out: Raster = { jpg: new Uint8Array(), pxPerMm }
  if (side === "front") out.front = await drawCardFront(ctx, card, bleed, bleed, w, opts)
  else out.back = await drawCardBack(ctx, card, bleed, bleed, w, { ...opts, reference })
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.92))
  out.jpg = new Uint8Array(await blob.arrayBuffer())
  return out
}

/** Builds PDF path operators from canvas-pixel points. */
class Ops {
  parts: string[] = []
  constructor(
    private pxPerMm: number,
    private pageH: number,
  ) {}
  private p(x: number, y: number) {
    const X = (x / this.pxPerMm) * PT_PER_MM
    const Y = this.pageH - (y / this.pxPerMm) * PT_PER_MM
    return `${X.toFixed(3)} ${Y.toFixed(3)}`
  }
  /** A length in canvas pixels, as PDF points. */
  px(v: number) {
    return ((v / this.pxPerMm) * PT_PER_MM).toFixed(3)
  }
  polyline(pts: [number, number][], close = false) {
    pts.forEach(([x, y], i) => this.parts.push(`${this.p(x, y)} ${i ? "l" : "m"}`))
    if (close) this.parts.push("h")
  }
  /** An SVG path made of M/L/Z commands, mapped through (ox, oy, sx, sy). */
  svg(d: string, ox: number, oy: number, sx: number, sy: number) {
    const re = /([MLZ])\s*([-\d.]+)?\s*([-\d.]+)?/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(d))) {
      const c = m[1].toUpperCase()
      if (c === "Z") this.parts.push("h")
      else this.parts.push(`${this.p(ox + +m[2] * sx, oy + +m[3] * sy)} ${c === "M" ? "m" : "l"}`)
    }
  }
  roundRect(x: number, y: number, w: number, h: number, r: number) {
    // Bezier corners (k = 0.5523 approximates a quarter circle)
    const k = 0.5523 * r
    const P = (a: number, b: number) => this.p(a, b)
    this.parts.push(
      `${P(x + r, y)} m`,
      `${P(x + w - r, y)} l`,
      `${P(x + w - r + k, y)} ${P(x + w, y + r - k)} ${P(x + w, y + r)} c`,
      `${P(x + w, y + h - r)} l`,
      `${P(x + w, y + h - r + k)} ${P(x + w - r + k, y + h)} ${P(x + w - r, y + h)} c`,
      `${P(x + r, y + h)} l`,
      `${P(x + r - k, y + h)} ${P(x, y + h - r + k)} ${P(x, y + h - r)} c`,
      `${P(x, y + r)} l`,
      `${P(x, y + r - k)} ${P(x + r - k, y)} ${P(x + r, y)} c`,
      "h",
    )
  }
  circle(cx: number, cy: number, r: number) {
    this.roundRect(cx - r, cy - r, 2 * r, 2 * r, r)
  }
}

/** The vector shapes that receive foil on the front. */
function frontFoil(o: Ops, g: FrontGeometry, card: CardData) {
  const u = g.u
  const stroke = (widthPx: number) => o.parts.push(`${o.px(widthPx)} w S`)
  o.parts.push("1 J 1 j")
  // Mountain mark
  o.polyline(g.logo)
  stroke(0.55 * u)
  // Frame of the map window
  o.roundRect(g.art.x, g.art.y, g.art.w, g.art.h, g.art.r)
  stroke(0.35 * u)
  // The route, the hero of the card
  if (g.route && card.routePath) {
    o.svg(card.routePath, g.route.ox, g.route.oy, g.route.s, g.route.s)
    stroke(1.3 * g.route.s)
    if (card.start) {
      o.circle(g.route.ox + card.start[0] * g.route.s, g.route.oy + card.start[1] * g.route.s, 2 * g.route.s)
      o.parts.push("f")
    }
  }
  // Elevation profile line
  if (g.profile && card.profileLine) {
    o.svg(card.profileLine, g.profile.x, g.profile.y, g.profile.w / 100, g.profile.h / 30)
    stroke(0.35 * u)
  }
  // Rarity gems
  for (const gem of g.gems) {
    o.polyline(
      [
        [gem.cx, gem.cy - gem.r],
        [gem.cx + gem.r, gem.cy],
        [gem.cx, gem.cy + gem.r],
        [gem.cx - gem.r, gem.cy],
      ],
      true,
    )
    o.parts.push("f")
  }
}

/** The vector shapes that receive foil on the back. */
function backFoil(o: Ops, g: BackGeometry) {
  o.parts.push("1 J 1 j")
  o.polyline(g.logo)
  o.parts.push(`${o.px(0.55 * g.u)} w S`)
  // Authenticity seal ring: outer circle minus inner circle (even-odd fill)
  o.circle(g.seal.cx, g.seal.cy, g.seal.outer)
  o.circle(g.seal.cx, g.seal.cy, g.seal.inner)
  o.parts.push("f*")
}

function addFoilLayer(doc: PDFDocument, page: PDFPage, ops: string, spot: { name: string; cmyk: number[] }, ocg: PDFRef) {
  const ctx = doc.context
  const tint = ctx.register(ctx.obj({ FunctionType: 2, Domain: [0, 1], C0: [0, 0, 0, 0], C1: spot.cmyk, N: 1 }))
  const sep = ctx.register(ctx.obj([PDFName.of("Separation"), PDFName.of(spot.name), PDFName.of("DeviceCMYK"), tint]))
  const gs = ctx.register(ctx.obj({ Type: "ExtGState", OP: true, op: true, OPM: 1 }))
  const res = page.node.Resources()!
  res.set(PDFName.of("ColorSpace"), ctx.obj({ CSFoil: sep }))
  res.set(PDFName.of("Properties"), ctx.obj({ OCFoil: ocg }))
  const egs = res.get(PDFName.of("ExtGState"))
  if (egs && "set" in egs) (egs as unknown as { set: (k: PDFName, v: PDFRef) => void }).set(PDFName.of("GSFoil"), gs)
  else res.set(PDFName.of("ExtGState"), ctx.obj({ GSFoil: gs }))
  const content = `q /OC /OCFoil BDC /GSFoil gs /CSFoil cs /CSFoil CS 1 scn 1 SCN\n${ops}\nEMC Q`
  page.node.addContentStream(ctx.register(ctx.flateStream(content)))
}

/** One card → one PDF (front, back), ready for an Exaprint "Set" variant. */
export async function buildCardPdf(card: CardData, s: PrintSettings, reference?: string): Promise<Uint8Array> {
  await loadCardFonts()
  const doc = await PDFDocument.create()
  doc.setTitle(`TrailDex ${reference ?? ""} ${card.race}`.trim())
  doc.setCreator("TrailDex")
  const spot = foilSpot(card, s)
  let ocg: PDFRef | null = null
  if (spot) {
    const ctx = doc.context
    ocg = ctx.register(ctx.obj({ Type: "OCG", Name: PDFString.of("Acabado") }))
    doc.catalog.set(PDFName.of("OCProperties"), ctx.obj({ OCGs: [ocg], D: { Order: [ocg], ON: [ocg] } }))
  }
  const wPt = (s.widthMm + 2 * s.bleedMm) * PT_PER_MM
  const hPt = (s.heightMm + 2 * s.bleedMm) * PT_PER_MM
  const b = s.bleedMm * PT_PER_MM

  for (const side of ["front", "back"] as const) {
    const r = await rasterFace(card, side, s, reference)
    const page = doc.addPage([wPt, hPt])
    page.setBleedBox(0, 0, wPt, hPt)
    page.setTrimBox(b, b, s.widthMm * PT_PER_MM, s.heightMm * PT_PER_MM)
    const img = await doc.embedJpg(r.jpg)
    page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt })
    if (spot && ocg) {
      const o = new Ops(r.pxPerMm, hPt)
      if (r.front) frontFoil(o, r.front, card)
      if (r.back) backFoil(o, r.back)
      addFoilLayer(doc, page, o.parts.join("\n"), spot, ocg)
    }
  }
  return doc.save()
}

export type BatchOrder = {
  reference: string
  name: string
  email: string
  address: string
  zip: string
  city: string
  qty: number
  finish: string
  card: CardData
}

export type PrintSet = { index: number; finish: string; qty: number; orders: BatchOrder[] }

/** Exaprint "Sets": up to 20 variants sharing finish and quantity. */
export function groupIntoSets(orders: BatchOrder[], max = 20): PrintSet[] {
  const groups = new Map<string, BatchOrder[]>()
  for (const o of orders) {
    const key = `${o.finish}|${o.qty}`
    groups.set(key, [...(groups.get(key) ?? []), o])
  }
  const sets: PrintSet[] = []
  for (const [key, list] of groups) {
    const [finish, qty] = key.split("|")
    for (let i = 0; i < list.length; i += max) {
      sets.push({ index: sets.length + 1, finish, qty: +qty, orders: list.slice(i, i + max) })
    }
  }
  return sets
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const setFolder = (set: PrintSet) =>
  `Set-${String(set.index).padStart(2, "0")}_${slug(set.finish) || "Standard"}_${set.orders.length}-variantes_x${set.qty}`

export const cardFileName = (o: BatchOrder, i: number) => `${String(i + 1).padStart(2, "0")}_${slug(o.reference)}.pdf`

/** Packing slip: which card goes to which address. */
export async function buildPackingSlip(sets: PrintSet[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  // Helvetica covers Latin-1; drop anything else (emoji) rather than fail.
  const clean = (t: string) => t.replace(/[^\x20-\x7E -ÿ]/g, "")
  let page = doc.addPage([595.28, 841.89])
  let y = 800
  const line = (text: string, size = 10, f = font, color = rgb(0.11, 0.11, 0.12)) => {
    if (y < 60) {
      page = doc.addPage([595.28, 841.89])
      y = 800
    }
    page.drawText(clean(text), { x: 48, y, size, font: f, color })
    y -= size + 6
  }
  line("TrailDex - Bordereau de lot", 18, bold)
  line(new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), 10, font, rgb(0.43, 0.43, 0.45))
  y -= 8
  for (const set of sets) {
    line(`${setFolder(set)}  -  finition ${set.finish}, ${set.qty} ex. par variante`, 12, bold)
    set.orders.forEach((o, i) => {
      line(`${cardFileName(o, i)}   ${o.reference}   ${o.card.race}   No. ${String(o.card.number).padStart(3, "0")}`, 10, bold)
      line(`      ${o.name}  -  ${o.address}, ${o.zip} ${o.city}  -  ${o.email}`, 9)
    })
    y -= 10
  }
  return doc.save()
}

export function readme(sets: PrintSet[], s: PrintSettings) {
  const lines = [
    "LOT TRAILDEX - COMMANDE EXAPRINT",
    "",
    `Produit : Carte de visite dorure a chaud, format personnalise ${s.widthMm} x ${s.heightMm} mm, portrait, recto verso.`,
    `Fond perdu des fichiers : ${s.bleedMm} mm. Chaque PDF = 1 carte (page 1 recto, page 2 verso).`,
    `Dorure : calque "Acabado", couleur directe "${s.spotGold}" (Or) ou "${s.spotHolo}" (Holo), surimpression activee.`,
    "",
    "Une commande Exaprint par dossier Set : option Sets, une variante par PDF, quantite indiquee dans le nom du dossier.",
    "",
  ]
  for (const set of sets) {
    lines.push(`${setFolder(set)} : ${set.orders.length} variante(s), finition ${set.finish}, ${set.qty} exemplaire(s) par variante`)
  }
  lines.push("", "Le bordereau.pdf indique a qui envoyer chaque carte (la reference est imprimee en petit au verso).")
  return lines.join("\r\n")
}
