/**
 * Print files for Exaprint (hot-foil business card, custom size).
 *
 * Per card, two pages (front, back), 1:1 scale with bleed. The artwork is a
 * 600 dpi image, converted to CMYK with the printer's ICC profile when one is
 * given. Text is real vector text in the embedded card typefaces (Inter,
 * JetBrains Mono), so it stays sharp at any zoom. The foil is real vector
 * artwork, either:
 * - "separate" (Exaprint's French file guide): a second PDF with the foil
 *   shapes only, in 100 % K, same size and boxes as the print file;
 * - "layer": in the print file, a spot colour on a layer called "Acabado",
 *   with overprint on.
 */
import fontkit from "@pdf-lib/fontkit"
import {
  PDFDocument,
  type PDFFont,
  PDFName,
  PDFString,
  StandardFonts,
  cmyk as pdfCmyk,
  rgb,
  type PDFPage,
  type PDFRef,
} from "pdf-lib"
import type { CmykProfile } from "./cmyk"
import { drawCardBack, drawCardFront, loadCardFonts, type BackGeometry, type FrontGeometry } from "./cardCanvas"
import type { CardData } from "./card"

export type FoilMode = "separate" | "layer"

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
  foilMode: FoilMode
}

export const DEFAULT_SETTINGS: PrintSettings = {
  widthMm: 63,
  heightMm: 88,
  bleedMm: 3,
  spotGold: "Dorure Or",
  spotHolo: "Dorure Holographique",
  dpi: 600,
  foilMode: "separate",
}

const PT_PER_MM = 72 / 25.4

/** Which spot colour a card's foil uses (Or → gold, Holo → holographic). */
export function foilSpot(card: CardData, s: PrintSettings) {
  if (card.rarity === "legendaire") return { name: s.spotGold, cmyk: [0, 0.25, 0.7, 0.15] }
  if (card.rarity === "rare" || card.rarity === "epique") return { name: s.spotHolo, cmyk: [0.25, 0, 0.05, 0] }
  return null
}

/** A piece of text the card drew, captured to be written as vector text. */
type TextOp = { text: string; x: number; y: number; size: number; weight: number; mono: boolean; color: string; alpha: number; align: "left" | "right" | "center" }

type Raster = { canvas: HTMLCanvasElement; front?: FrontGeometry; back?: BackGeometry; pxPerMm: number; texts: TextOp[] }

/**
 * Lets the card draw as usual, but takes over its fillText calls: plain-colour
 * text is recorded (position after transforms, font, colour) instead of being
 * rasterised. Anything unusual (gradient fill, other baseline) is drawn as before.
 */
function captureText(ctx: CanvasRenderingContext2D, texts: TextOp[]) {
  const draw = ctx.fillText.bind(ctx)
  ctx.fillText = (text: string, x: number, y: number, maxWidth?: number) => {
    const font = ctx.font.match(/(\d+|bold|normal)\s+([\d.]+)px\s+(.+)/)
    const m = ctx.getTransform()
    if (!font || typeof ctx.fillStyle !== "string" || ctx.textBaseline !== "alphabetic" || m.b || m.c || maxWidth !== undefined) {
      draw(text, x, y, maxWidth)
      return
    }
    const align = ctx.textAlign === "right" || ctx.textAlign === "end" ? "right" : ctx.textAlign === "center" ? "center" : "left"
    texts.push({
      text,
      x: m.a * x + m.e,
      y: m.d * y + m.f,
      size: +font[2] * m.a,
      weight: font[1] === "bold" ? 700 : font[1] === "normal" ? 400 : +font[1],
      mono: /JetBrains/i.test(font[3]),
      color: ctx.fillStyle,
      alpha: ctx.globalAlpha,
      align,
    })
  }
}

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
  const out: Raster = { canvas, pxPerMm, texts: [] }
  captureText(ctx, out.texts)
  if (side === "front") out.front = await drawCardFront(ctx, card, bleed, bleed, w, opts)
  else out.back = await drawCardBack(ctx, card, bleed, bleed, w, { ...opts, reference })
  return out
}

/** Draws the face as an RGB JPEG, or as a CMYK image through the ICC profile. Returns the max ink, in %. */
async function drawArtwork(doc: PDFDocument, page: PDFPage, canvas: HTMLCanvasElement, cmyk?: CmykProfile) {
  const { width: wPt, height: hPt } = page.getSize()
  if (!cmyk) {
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.92))
    page.drawImage(await doc.embedJpg(new Uint8Array(await blob.arrayBuffer())), { x: 0, y: 0, width: wPt, height: hPt })
    return undefined
  }
  const px = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data
  const { cmyk: data, maxInk } = cmyk.convert(px)
  const ctx = doc.context
  const img = ctx.register(
    ctx.flateStream(data, { Type: "XObject", Subtype: "Image", Width: canvas.width, Height: canvas.height, ColorSpace: "DeviceCMYK", BitsPerComponent: 8 }),
  )
  const name = page.node.newXObject("Im", img)
  page.node.addContentStream(ctx.register(ctx.flateStream(`q ${wPt.toFixed(3)} 0 0 ${hPt.toFixed(3)} 0 0 cm ${name} Do Q`)))
  return maxInk
}

let fontBytes: Promise<Record<string, ArrayBuffer>> | null = null

/** The card typefaces as TTF (public/fonts, SIL Open Font License). */
function loadFontBytes() {
  fontBytes ??= Promise.all(
    ["Inter-Medium", "Inter-SemiBold", "Inter-Bold", "JetBrainsMono-Medium"].map(async (n) => {
      const res = await fetch(`/fonts/${n}.ttf`)
      if (!res.ok) throw new Error(`police ${n} introuvable`)
      return [n, await res.arrayBuffer()] as const
    }),
  ).then(Object.fromEntries)
  return fontBytes
}

type Fonts = { pick: (op: TextOp) => PDFFont; clean: (font: PDFFont, text: string) => string }

async function embedFonts(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit)
  const bytes = await loadFontBytes()
  const [medium, semibold, bold, mono] = await Promise.all(
    ["Inter-Medium", "Inter-SemiBold", "Inter-Bold", "JetBrainsMono-Medium"].map((n) => doc.embedFont(bytes[n], { subset: true })),
  )
  const charsets = new Map<PDFFont, Set<number>>()
  const has = (font: PDFFont, c: string) => {
    if (!charsets.has(font)) charsets.set(font, new Set(font.getCharacterSet()))
    return charsets.get(font)!.has(c.codePointAt(0)!)
  }
  return {
    pick: (op) => (op.mono ? mono : op.weight >= 700 ? bold : op.weight >= 600 ? semibold : medium),
    // French number formatting uses narrow no-break spaces that JetBrains Mono lacks.
    clean: (font, text) => [...text].map((c) => (has(font, c) ? c : /\s/.test(c) ? (has(font, "\u00a0") ? "\u00a0" : " ") : "?")).join(""),
  }
}

/** "#rrggbb" or "rgba(r, g, b, a)" → [r, g, b, a]. */
function parseColor(c: string): [number, number, number, number] {
  const hex = c.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as [number, number, number, number]
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 1]
  const [r, g, b, a = "1"] = m[1].split(",").map((v) => v.trim())
  return [+r, +g, +b, +a]
}

function drawTexts(page: PDFPage, texts: TextOp[], pxPerMm: number, fonts: Fonts, cmyk?: CmykProfile) {
  const toPt = (px: number) => (px / pxPerMm) * PT_PER_MM
  const pageH = page.getSize().height
  for (const op of texts) {
    const font = fonts.pick(op)
    const text = fonts.clean(font, op.text)
    const size = toPt(op.size)
    const width = font.widthOfTextAtSize(text, size)
    const x = toPt(op.x) - (op.align === "right" ? width : op.align === "center" ? width / 2 : 0)
    const [r, g, b, a] = parseColor(op.color)
    let color = rgb(r / 255, g / 255, b / 255)
    if (cmyk) {
      const k = cmyk.convert(new Uint8ClampedArray([r, g, b, 255])).cmyk
      color = pdfCmyk(k[0] / 255, k[1] / 255, k[2] / 255, k[3] / 255) as unknown as typeof color
    }
    page.drawText(text, { x, y: pageH - toPt(op.y), size, font, color, opacity: a * op.alpha })
  }
}

/** PDF/X-style output intent: tells the printer which press condition the CMYK targets. */
function addOutputIntent(doc: PDFDocument, cmyk: CmykProfile) {
  const ctx = doc.context
  const icc = ctx.register(ctx.flateStream(cmyk.icc, { N: 4 }))
  const intent = ctx.obj({
    Type: "OutputIntent",
    S: "GTS_PDFX",
    OutputConditionIdentifier: PDFString.of(cmyk.name),
    Info: PDFString.of(cmyk.name),
    DestOutputProfile: icc,
  })
  doc.catalog.set(PDFName.of("OutputIntents"), ctx.obj([intent]))
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

export type CardFiles = {
  /** Artwork, front and back. */
  print: Uint8Array
  /** Foil shapes only, in 100 % K ("separate" mode, Holo and Or cards). */
  foil?: Uint8Array
  /** Highest total ink in the artwork, in % (CMYK only). */
  maxInk?: number
}

async function newDoc(card: CardData, reference?: string) {
  const doc = await PDFDocument.create()
  doc.setTitle(`TrailDex ${reference ?? ""} ${card.race}`.trim())
  doc.setCreator("TrailDex")
  return doc
}

function addTrimmedPage(doc: PDFDocument, s: PrintSettings) {
  const wPt = (s.widthMm + 2 * s.bleedMm) * PT_PER_MM
  const hPt = (s.heightMm + 2 * s.bleedMm) * PT_PER_MM
  const b = s.bleedMm * PT_PER_MM
  const page = doc.addPage([wPt, hPt])
  page.setBleedBox(0, 0, wPt, hPt)
  page.setTrimBox(b, b, s.widthMm * PT_PER_MM, s.heightMm * PT_PER_MM)
  return page
}

/** One card → its Exaprint files (one "Set" variant). */
export async function buildCardFiles(card: CardData, s: PrintSettings, reference?: string, cmyk?: CmykProfile): Promise<CardFiles> {
  await loadCardFonts()
  const doc = await newDoc(card, reference)
  if (cmyk) addOutputIntent(doc, cmyk)
  const fonts = await embedFonts(doc)
  const spot = foilSpot(card, s)
  const foilDoc = spot && s.foilMode === "separate" ? await newDoc(card, reference) : null
  let ocg: PDFRef | null = null
  if (spot && s.foilMode === "layer") {
    const ctx = doc.context
    ocg = ctx.register(ctx.obj({ Type: "OCG", Name: PDFString.of("Acabado") }))
    doc.catalog.set(PDFName.of("OCProperties"), ctx.obj({ OCGs: [ocg], D: { Order: [ocg], ON: [ocg] } }))
  }
  let maxInk: number | undefined

  for (const side of ["front", "back"] as const) {
    const r = await rasterFace(card, side, s, reference)
    const page = addTrimmedPage(doc, s)
    const ink = await drawArtwork(doc, page, r.canvas, cmyk)
    if (ink !== undefined) maxInk = Math.max(maxInk ?? 0, ink)
    drawTexts(page, r.texts, r.pxPerMm, fonts, cmyk)
    if (!spot) continue
    const o = new Ops(r.pxPerMm, page.getSize().height)
    if (r.front) frontFoil(o, r.front, card)
    if (r.back) backFoil(o, r.back)
    const ops = o.parts.join("\n")
    if (ocg) addFoilLayer(doc, page, ops, spot, ocg)
    if (foilDoc) {
      const fp = addTrimmedPage(foilDoc, s)
      fp.node.addContentStream(foilDoc.context.register(foilDoc.context.flateStream(`q 0 0 0 1 k 0 0 0 1 K\n${ops}\nQ`)))
    }
  }
  return { print: await doc.save(), foil: foilDoc ? await foilDoc.save() : undefined, maxInk }
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
  `Set-${String(set.index).padStart(2, "0")}_${slug(set.finish) || "Holo"}_${set.orders.length}-variantes_x${set.qty}`

export const cardFileName = (o: BatchOrder, i: number, part?: "impression" | "dorure") =>
  `${String(i + 1).padStart(2, "0")}_${slug(o.reference)}${part ? `_${part}` : ""}.pdf`

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

export function readme(sets: PrintSet[], s: PrintSettings, cmykName?: string) {
  const foil =
    s.foilMode === "separate"
      ? [
          "Dorure : fichier separe *_dorure.pdf (recto, verso), elements vectoriels en noir 100 % K, meme format et memes reperes que *_impression.pdf.",
        ]
      : [`Dorure : calque "Acabado", couleur directe "${s.spotGold}" (Or) ou "${s.spotHolo}" (Holo), surimpression activee.`]
  const lines = [
    "LOT TRAILDEX - COMMANDE EXAPRINT",
    "",
    `Produit : Carte de visite dorure a chaud, format personnalise ${s.widthMm} x ${s.heightMm} mm, portrait, recto verso.`,
    `Fond perdu des fichiers : ${s.bleedMm} mm. Chaque PDF = 1 carte (page 1 recto, page 2 verso).`,
    cmykName ? `Couleurs : CMJN, profil ${cmykName} (integre au PDF).` : "Couleurs : RVB (aucun profil CMJN choisi, conversion laissee a l'imprimeur).",
    ...foil,
    "",
    "Une commande Exaprint par dossier Set : option Sets, une variante par carte, quantite indiquee dans le nom du dossier.",
    "",
  ]
  for (const set of sets) {
    lines.push(`${setFolder(set)} : ${set.orders.length} variante(s), finition ${set.finish}, ${set.qty} exemplaire(s) par variante`)
  }
  lines.push("", "Le bordereau.pdf indique a qui envoyer chaque carte (la reference est imprimee en petit au verso).")
  return lines.join("\r\n")
}
