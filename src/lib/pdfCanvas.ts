/**
 * A drop-in for the parts of CanvasRenderingContext2D the card drawing uses,
 * that writes vector PDF instead of pixels: paths, gradients, text in the
 * embedded fonts, all in CMYK when a profile is given. The card is drawn by
 * the same code as on screen (cardCanvas.ts), so the print file matches it.
 *
 * Two canvas effects have no PDF equivalent and are rebuilt in vector form:
 * a stroke's shadow glow (stacked translucent strokes, widest first) and the
 * conic gradient of the seal (thin coloured wedges). Only a runner's photo
 * stays a bitmap.
 *
 * Units: the canvas starts with a scale of `unit` PDF points per canvas pixel,
 * so the drawing code works in the same pixels as the raster renderer (its
 * minimum line widths and shadow blur stay right); y grows downwards.
 */
import { PDFDict, PDFDocument, PDFName, type PDFFont, type PDFPage, type PDFRef } from "pdf-lib"
import type { CmykProfile } from "./cmyk"

export type PdfFonts = {
  /** The embedded font for a canvas font weight and family. */
  pick: (weight: number, mono: boolean) => PDFFont
  /** Swaps characters the font cannot draw (e.g. narrow no-break space in Mono). */
  clean: (font: PDFFont, text: string) => string
}

type RGBA = [number, number, number, number]
type Matrix = [number, number, number, number, number, number]

type Stop = { offset: number; color: RGBA }

class PdfGradient {
  stops: Stop[] = []
  constructor(
    readonly kind: "linear" | "radial" | "conic",
    readonly coords: number[],
  ) {}
  addColorStop(offset: number, color: string) {
    this.stops.push({ offset, color: parseColor(color) })
    this.stops.sort((a, b) => a.offset - b.offset)
  }
}

type State = {
  m: Matrix
  fillStyle: string | PdfGradient
  strokeStyle: string | PdfGradient
  lineWidth: number
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
  globalAlpha: number
  globalCompositeOperation: string
  shadowBlur: number
  shadowColor: string
  font: string
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
}

/** "#rgb", "#rrggbb", "rgb(…)" or "rgba(…)" → [r, g, b, a] (0–255, alpha 0–1). */
export function parseColor(c: string): RGBA {
  const s = c.trim()
  if (s[0] === "#") {
    const h = s.length === 4 ? [...s.slice(1)].map((x) => x + x).join("") : s.slice(1, 7)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]
  }
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 1]
  const [r, g, b, a = "1"] = m[1].split(",").map((v) => v.trim())
  return [+r, +g, +b, +a]
}

/**
 * Chrome's canvas shadow comes out brighter than a true Gaussian of
 * sigma = blur / 2; this gain was fitted on rendered cards (route glow, Or and
 * Holo themes) so the PDF matches the screen.
 */
const GLOW_GAIN = 1.8

/** Error function (Abramowitz–Stegun 7.1.26, error < 1.5e-7). */
function erf(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x < 0 ? -y : y
}

const f = (n: number) => (Math.abs(n) < 1e-6 ? "0" : n.toFixed(3).replace(/\.?0+$/, ""))

export class PdfCanvas {
  private parts: string[] = []
  private st: State
  private stack: State[] = []
  /** Current path, already in page coordinates (PDF operators). */
  private path: string[] = []
  /** Same points in user space, for arcTo. */
  private currentUser: [number, number] = [0, 0]
  private gsCache = new Map<string, string>()
  private fontNames = new Map<PDFFont, string>()
  private colorCache = new Map<string, number[]>()
  private counter = 0
  /** Highest C+M+Y+K among the colours used, in % (CMYK only). */
  maxInk = 0

  constructor(
    private doc: PDFDocument,
    private page: PDFPage,
    private fonts: PdfFonts,
    private cmyk?: CmykProfile,
    /** Resolution for bitmaps (photo), in dots per inch. */
    private dpi = 600,
    /** PDF points per canvas pixel; shadow blur is measured in these pixels. */
    private unit = 1,
  ) {
    this.st = {
      m: [unit, 0, 0, unit, 0, 0],
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      lineCap: "butt",
      lineJoin: "miter",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      shadowBlur: 0,
      shadowColor: "rgba(0,0,0,0)",
      font: "10px sans-serif",
      textAlign: "start",
      textBaseline: "alphabetic",
    }
  }

  // ---- state -------------------------------------------------------------
  get fillStyle() { return this.st.fillStyle as string }
  set fillStyle(v: string | PdfGradient) { this.st.fillStyle = v }
  get strokeStyle() { return this.st.strokeStyle as string }
  set strokeStyle(v: string | PdfGradient) { this.st.strokeStyle = v }
  get lineWidth() { return this.st.lineWidth }
  set lineWidth(v: number) { this.st.lineWidth = v }
  get lineCap() { return this.st.lineCap }
  set lineCap(v: CanvasLineCap) { this.st.lineCap = v }
  get lineJoin() { return this.st.lineJoin }
  set lineJoin(v: CanvasLineJoin) { this.st.lineJoin = v }
  get globalAlpha() { return this.st.globalAlpha }
  set globalAlpha(v: number) { this.st.globalAlpha = v }
  get globalCompositeOperation() { return this.st.globalCompositeOperation }
  set globalCompositeOperation(v: string) { this.st.globalCompositeOperation = v }
  get shadowBlur() { return this.st.shadowBlur }
  set shadowBlur(v: number) { this.st.shadowBlur = v }
  get shadowColor() { return this.st.shadowColor }
  set shadowColor(v: string) { this.st.shadowColor = v }
  get font() { return this.st.font }
  set font(v: string) { this.st.font = v }
  get textAlign() { return this.st.textAlign }
  set textAlign(v: CanvasTextAlign) { this.st.textAlign = v }
  get textBaseline() { return this.st.textBaseline }
  set textBaseline(v: CanvasTextBaseline) { this.st.textBaseline = v }

  save() {
    this.stack.push({ ...this.st, m: [...this.st.m] as Matrix })
    this.parts.push("q")
  }
  restore() {
    const s = this.stack.pop()
    if (!s) return
    this.st = s
    this.parts.push("Q")
  }

  // ---- transforms ----------------------------------------------------------
  private mul(n: Matrix) {
    const [a, b, c, d, e, g] = this.st.m
    this.st.m = [a * n[0] + c * n[1], b * n[0] + d * n[1], a * n[2] + c * n[3], b * n[2] + d * n[3], a * n[4] + c * n[5] + e, b * n[4] + d * n[5] + g]
  }
  translate(x: number, y: number) { this.mul([1, 0, 0, 1, x, y]) }
  scale(x: number, y: number) { this.mul([x, 0, 0, y, 0, 0]) }
  rotate(r: number) { this.mul([Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]) }
  getTransform() {
    const [a, b, c, d, e, g] = this.st.m
    return new DOMMatrix([a, b, c, d, e, g])
  }
  private T(x: number, y: number): [number, number] {
    const [a, b, c, d, e, g] = this.st.m
    return [a * x + c * y + e, b * x + d * y + g]
  }
  /** Canvas user space → PDF space (y up) as a cm operator. */
  private cm() {
    const [a, b, c, d, e, g] = this.st.m
    const H = this.page.getHeight()
    return `${f(a)} ${f(-b)} ${f(c)} ${f(-d)} ${f(e)} ${f(H - g)} cm`
  }
  private pt([x, y]: [number, number]) {
    return `${f(x)} ${f(this.page.getHeight() - y)}`
  }
  private get scaleFactor() {
    const [a, b, c, d] = this.st.m
    return Math.sqrt(Math.abs(a * d - b * c))
  }

  // ---- paths ---------------------------------------------------------------
  beginPath() { this.path = [] }
  moveTo(x: number, y: number) {
    const p = this.T(x, y)
    this.path.push(`${this.pt(p)} m`)
    this.currentUser = [x, y]
  }
  lineTo(x: number, y: number) {
    const p = this.T(x, y)
    this.path.push(`${this.pt(p)} l`)
    this.currentUser = [x, y]
  }
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    const p = this.T(x, y)
    this.path.push(`${this.pt(this.T(x1, y1))} ${this.pt(this.T(x2, y2))} ${this.pt(p)} c`)
    this.currentUser = [x, y]
  }
  closePath() {
    this.path.push("h")
  }
  rect(x: number, y: number, w: number, h: number) {
    this.moveTo(x, y)
    this.lineTo(x + w, y)
    this.lineTo(x + w, y + h)
    this.lineTo(x, y + h)
    this.closePath()
  }
  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw = false) {
    let sweep = a1 - a0
    if (!ccw && sweep < 0) sweep += Math.PI * 2
    if (ccw && sweep > 0) sweep -= Math.PI * 2
    if (Math.abs(a1 - a0) >= Math.PI * 2) sweep = ccw ? -Math.PI * 2 : Math.PI * 2
    const sx = cx + r * Math.cos(a0)
    const sy = cy + r * Math.sin(a0)
    if (this.path.length) this.lineTo(sx, sy)
    else this.moveTo(sx, sy)
    const n = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)))
    const step = sweep / n
    const k = (4 / 3) * Math.tan(step / 4)
    for (let i = 0; i < n; i++) {
      const t0 = a0 + i * step
      const t1 = t0 + step
      this.bezierCurveTo(
        cx + r * (Math.cos(t0) - k * Math.sin(t0)),
        cy + r * (Math.sin(t0) + k * Math.cos(t0)),
        cx + r * (Math.cos(t1) + k * Math.sin(t1)),
        cy + r * (Math.sin(t1) - k * Math.cos(t1)),
        cx + r * Math.cos(t1),
        cy + r * Math.sin(t1),
      )
    }
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) {
    const [x0, y0] = this.currentUser
    const v1 = [x0 - x1, y0 - y1]
    const v2 = [x2 - x1, y2 - y1]
    const l1 = Math.hypot(v1[0], v1[1])
    const l2 = Math.hypot(v2[0], v2[1])
    const cross = v1[0] * v2[1] - v1[1] * v2[0]
    if (!r || !l1 || !l2 || Math.abs(cross) < 1e-9) return this.lineTo(x1, y1)
    const angle = Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2))))
    const dist = r / Math.tan(angle / 2)
    const t1 = [x1 + (v1[0] / l1) * dist, y1 + (v1[1] / l1) * dist]
    const t2 = [x1 + (v2[0] / l2) * dist, y1 + (v2[1] / l2) * dist]
    // Centre: from the corner along the bisector.
    const bis = [v1[0] / l1 + v2[0] / l2, v1[1] / l1 + v2[1] / l2]
    const bl = Math.hypot(bis[0], bis[1])
    const cd = Math.hypot(dist, r)
    const c = [x1 + (bis[0] / bl) * cd, y1 + (bis[1] / bl) * cd]
    const a0 = Math.atan2(t1[1] - c[1], t1[0] - c[0])
    const a1 = Math.atan2(t2[1] - c[1], t2[0] - c[0])
    this.lineTo(t1[0], t1[1])
    this.arc(c[0], c[1], r, a0, a1, cross > 0)
  }

  // ---- colours -------------------------------------------------------------
  /** RGB (0–255) → CMYK (0–1), or RGB (0–1) without a profile. */
  private components([r, g, b]: RGBA): number[] {
    const key = `${r},${g},${b}`
    let c = this.colorCache.get(key)
    if (!c) {
      if (this.cmyk) {
        const k = this.cmyk.convert(new Uint8ClampedArray([r, g, b, 255])).cmyk
        c = [k[0] / 255, k[1] / 255, k[2] / 255, k[3] / 255]
        this.maxInk = Math.max(this.maxInk, Math.round((c[0] + c[1] + c[2] + c[3]) * 100))
      } else c = [r / 255, g / 255, b / 255]
      this.colorCache.set(key, c)
    }
    return c
  }
  private colorOp(rgba: RGBA, stroke: boolean) {
    const c = this.components(rgba).map(f).join(" ")
    return this.cmyk ? `${c} ${stroke ? "K" : "k"}` : `${c} ${stroke ? "RG" : "rg"}`
  }
  private get space() {
    return this.cmyk ? "DeviceCMYK" : "DeviceRGB"
  }

  // ---- resources -----------------------------------------------------------
  private gs(alpha: number, smask?: PDFRef) {
    const a = Math.max(0, Math.min(1, alpha))
    const key = smask ? `m${smask.objectNumber}` : a.toFixed(3)
    let name = this.gsCache.get(key)
    if (!name) {
      const ctx = this.doc.context
      const dict: Record<string, unknown> = smask ? { Type: "ExtGState", SMask: smask } : { Type: "ExtGState", ca: a, CA: a }
      name = this.page.node.newExtGState("GS", ctx.register(ctx.obj(dict as never))).asString()
      this.gsCache.set(key, name)
    }
    return `${name} gs`
  }
  private fontName(font: PDFFont) {
    let name = this.fontNames.get(font)
    if (!name) {
      name = this.page.node.newFontDictionary("F", font.ref).asString()
      this.fontNames.set(font, name)
    }
    return name
  }

  /** PDF function (type 2 or stitched type 3) for gradient stops, colour or alpha. */
  private fn(stops: Stop[], value: (s: Stop) => number[]) {
    const ctx = this.doc.context
    const pairs = stops.length > 1 ? stops : [stops[0], stops[0]]
    const seg = (a: Stop, b: Stop) => ctx.obj({ FunctionType: 2, Domain: [0, 1], C0: value(a), C1: value(b), N: 1 })
    if (pairs.length === 2) return ctx.register(seg(pairs[0], pairs[1]))
    const fns = []
    const bounds = []
    const encode = []
    for (let i = 0; i < pairs.length - 1; i++) {
      fns.push(ctx.register(seg(pairs[i], pairs[i + 1])))
      if (i) bounds.push(pairs[i].offset)
      encode.push(0, 1)
    }
    return ctx.register(
      ctx.obj({ FunctionType: 3, Domain: [pairs[0].offset, pairs[pairs.length - 1].offset], Functions: fns, Bounds: bounds, Encode: encode }),
    )
  }
  private shading(g: PdfGradient, gray = false) {
    const ctx = this.doc.context
    const fn = this.fn(g.stops, gray ? (s) => [s.color[3]] : (s) => this.components(s.color))
    const sh = ctx.obj({
      ShadingType: g.kind === "linear" ? 2 : 3,
      ColorSpace: gray ? "DeviceGray" : this.space,
      Coords: g.coords,
      Domain: [g.stops[0].offset, g.stops[g.stops.length - 1].offset],
      Function: fn,
      Extend: [true, true],
    })
    return ctx.register(sh)
  }
  private shadingName(ref: PDFRef) {
    const res = this.page.node.Resources()!
    let shadings = res.lookupMaybe(PDFName.of("Shading"), PDFDict)
    if (!shadings) {
      shadings = this.doc.context.obj({})
      res.set(PDFName.of("Shading"), shadings)
    }
    const name = `Sh${++this.counter}`
    shadings.set(PDFName.of(name), ref)
    return `/${name}`
  }

  // ---- painting ------------------------------------------------------------
  private paint(style: string | PdfGradient, op: "fill" | "stroke", evenOdd = false) {
    if (!this.path.length) return
    const path = this.path.join("\n")
    const alpha = this.st.globalAlpha
    if (typeof style === "string") {
      const c = parseColor(style)
      if (c[3] * alpha <= 0) return
      if (op === "stroke" && this.st.shadowBlur > 0) this.glow(path)
      const head = [this.gs(c[3] * alpha), this.colorOp(c, op === "stroke")]
      if (op === "stroke") head.push(...this.strokeParams())
      this.parts.push(`q ${head.join(" ")}\n${path}\n${op === "stroke" ? "S" : evenOdd ? "f*" : "f"} Q`)
      return
    }
    // Gradients fill the clipped path in user space.
    const clip = `${path}\n${evenOdd ? "W*" : "W"} n`
    if (style.kind === "conic") return this.conic(style, clip, alpha)
    const sh = this.shadingName(this.shading(style))
    const translucent = style.stops.some((s) => s.color[3] < 1)
    if (!translucent) {
      this.parts.push(`q ${this.gs(alpha)} ${clip} ${this.cm()} ${sh} sh Q`)
      return
    }
    // Stops with alpha: a luminosity soft mask carries the transparency.
    const ctx = this.doc.context
    const maskSh = this.shading(style, true)
    const W = this.page.getWidth()
    const H = this.page.getHeight()
    const form = ctx.register(
      ctx.flateStream(`${this.cm()} /A sh`, {
        Type: "XObject",
        Subtype: "Form",
        BBox: [0, 0, W, H],
        Group: { S: "Transparency", CS: "DeviceGray" },
        Resources: { Shading: { A: maskSh } },
      } as never),
    )
    const mask = ctx.register(ctx.obj({ Type: "Mask", S: "Luminosity", G: form }))
    this.parts.push(`q ${this.gs(alpha)} ${this.gs(1, mask)} ${clip} ${this.cm()} ${sh} sh Q`)
  }

  private strokeParams() {
    const cap = { butt: 0, round: 1, square: 2 }[this.st.lineCap]
    const join = { miter: 0, round: 1, bevel: 2 }[this.st.lineJoin]
    return [`${f(this.st.lineWidth * this.scaleFactor)} w`, `${cap} J`, `${join} j`]
  }

  /** Canvas shadow under a stroke: translucent strokes from wide to narrow. */
  private glow(path: string) {
    const c = parseColor(this.st.shadowColor)
    const total = c[3] * this.st.globalAlpha
    if (total <= 0) return
    const layers = 48
    const base = this.st.lineWidth * this.scaleFactor
    // Canvas blur is a Gaussian of sigma = shadowBlur / 2, in device pixels.
    const sigma = (this.st.shadowBlur / 2) * this.unit
    const cap = { butt: 0, round: 1, square: 2 }[this.st.lineCap]
    const join = { miter: 0, round: 1, bevel: 2 }[this.st.lineJoin]
    // Nested strokes out to 3 sigma. The canvas shadow is the stroke blurred
    // by a Gaussian, so its opacity at distance r from the centre line is the
    // Gaussian integrated over the line's width; each ring adds what is missing.
    const k = Math.SQRT2 * sigma
    const at = (r: number) => Math.min(total, (GLOW_GAIN * total * (erf((r + base / 2) / k) - erf((r - base / 2) / k))) / 2)
    let below = 0
    for (let i = layers; i >= 1; i--) {
      const r = base / 2 + (3 * sigma * i) / layers
      const a = Math.max(0, Math.min(1, (at(r - (1.5 * sigma) / layers) - below) / (1 - below)))
      below = below + a * (1 - below)
      this.parts.push(`q ${this.gs(a)} ${this.colorOp(c, true)} ${f(2 * r)} w ${cap} J ${join} j\n${path}\nS Q`)
    }
  }

  /** Conic gradient as thin wedges, clipped to the path. */
  private conic(g: PdfGradient, clip: string, alpha: number) {
    const [start, cx, cy] = g.coords
    const n = 240
    const R = 10_000
    const out = [`q ${this.gs(alpha)} ${clip} ${this.cm()}`]
    const at = (t: number): RGBA => {
      const s = g.stops
      if (t <= s[0].offset) return s[0].color
      for (let i = 1; i < s.length; i++) {
        if (t <= s[i].offset) {
          const k = (t - s[i - 1].offset) / (s[i].offset - s[i - 1].offset || 1)
          return s[i - 1].color.map((v, j) => v + (s[i].color[j] - v) * k) as RGBA
        }
      }
      return s[s.length - 1].color
    }
    for (let i = 0; i < n; i++) {
      const a0 = start + (i / n) * Math.PI * 2
      // Overlap each wedge slightly so no hairline gaps show between them.
      const a1 = start + ((i + 1.15) / n) * Math.PI * 2
      const c = at((i + 0.5) / n).map((v, j) => (j < 3 ? Math.round(v) : v)) as RGBA
      out.push(
        `${this.colorOp(c, false)} ${f(cx)} ${f(cy)} m ${f(cx + R * Math.cos(a0))} ${f(cy + R * Math.sin(a0))} l ${f(cx + R * Math.cos(a1))} ${f(cy + R * Math.sin(a1))} l h f`,
      )
    }
    out.push("Q")
    // The cm above flips y, so user-space coordinates are used as they are.
    this.parts.push(out.join("\n"))
  }

  fill(rule?: CanvasFillRule) {
    this.paint(this.st.fillStyle, "fill", rule === "evenodd")
  }
  stroke() {
    this.paint(this.st.strokeStyle, "stroke")
  }
  clip(rule?: CanvasFillRule) {
    if (!this.path.length) return
    this.parts.push(`${this.path.join("\n")}\n${rule === "evenodd" ? "W*" : "W"} n`)
  }
  fillRect(x: number, y: number, w: number, h: number) {
    const saved = this.path
    this.beginPath()
    this.rect(x, y, w, h)
    this.fill()
    this.path = saved
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    return new PdfGradient("linear", [x0, y0, x1, y1]) as unknown as CanvasGradient
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    return new PdfGradient("radial", [x0, y0, r0, x1, y1, r1]) as unknown as CanvasGradient
  }
  createConicGradient(angle: number, x: number, y: number) {
    return new PdfGradient("conic", [angle, x, y]) as unknown as CanvasGradient
  }

  // ---- text ----------------------------------------------------------------
  private currentFont() {
    const m = this.st.font.match(/(\d+|bold|normal)?\s*([\d.]+)px\s+(.+)/)
    const weight = !m?.[1] || m[1] === "normal" ? 400 : m[1] === "bold" ? 700 : +m[1]
    const font = this.fonts.pick(weight, /JetBrains/i.test(m?.[3] ?? ""))
    return { font, size: m ? +m[2] : 10 }
  }
  measureText(text: string) {
    const { font, size } = this.currentFont()
    return { width: font.widthOfTextAtSize(this.fonts.clean(font, text), size) } as TextMetrics
  }
  fillText(text: string, x: number, y: number) {
    const style = this.st.fillStyle
    if (typeof style !== "string") return
    const { font, size } = this.currentFont()
    const t = this.fonts.clean(font, text)
    const width = font.widthOfTextAtSize(t, size)
    const align = this.st.textAlign
    const dx = align === "right" || align === "end" ? -width : align === "center" ? -width / 2 : 0
    const c = parseColor(style)
    const enc = font.encodeText(t).toString()
    // The cm flips y; the text matrix flips it back so glyphs stand upright.
    this.parts.push(
      `q ${this.gs(c[3] * this.st.globalAlpha)} ${this.cm()} BT ${this.fontName(font)} ${f(size)} Tf ${this.colorOp(c, false)} 1 0 0 -1 ${f(x + dx)} ${f(y)} Tm ${enc} Tj ET Q`,
    )
  }

  // ---- images (runner photo) -----------------------------------------------
  drawImage(img: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) {
    const src = img as HTMLImageElement
    // Pixels for the printed size at the target resolution, no more.
    const scale = this.scaleFactor
    const wantW = Math.max(1, Math.round(((dw * scale) / 72) * this.dpi))
    const wantH = Math.max(1, Math.round(((dh * scale) / 72) * this.dpi))
    const cw = Math.min(src.naturalWidth || wantW, wantW)
    const ch = Math.min(src.naturalHeight || wantH, wantH)
    const canvas = document.createElement("canvas")
    canvas.width = cw
    canvas.height = ch
    const c2 = canvas.getContext("2d")!
    c2.fillStyle = "#fff"
    c2.fillRect(0, 0, cw, ch)
    c2.drawImage(src, 0, 0, cw, ch)
    const px = c2.getImageData(0, 0, cw, ch).data
    let data: Uint8Array
    if (this.cmyk) data = this.cmyk.convert(px).cmyk
    else {
      data = new Uint8Array(cw * ch * 3)
      for (let i = 0, j = 0; i < px.length; i += 4, j += 3) data.set([px[i], px[i + 1], px[i + 2]], j)
    }
    const ctx = this.doc.context
    const ref = ctx.register(
      ctx.flateStream(data, { Type: "XObject", Subtype: "Image", Width: cw, Height: ch, ColorSpace: this.space, BitsPerComponent: 8 } as never),
    )
    const name = this.page.node.newXObject("Im", ref).asString()
    this.parts.push(`q ${this.gs(this.st.globalAlpha)} ${this.cm()} ${f(dw)} 0 0 ${f(-dh)} ${f(dx)} ${f(dy + dh)} cm ${name} Do Q`)
  }

  /** Writes everything drawn so far to the page. */
  finish() {
    while (this.stack.length) this.restore()
    const ctx = this.doc.context
    this.page.node.addContentStream(ctx.register(ctx.flateStream(this.parts.join("\n"))))
    this.parts = []
  }
}

/** Embeds the card typefaces in a document and picks them by weight. */
export async function embedCardFonts(doc: PDFDocument, bytes: Record<string, ArrayBuffer>): Promise<PdfFonts> {
  const [medium, semibold, bold, mono] = await Promise.all(
    ["Inter-Medium", "Inter-SemiBold", "Inter-Bold", "JetBrainsMono-Medium"].map((n) => doc.embedFont(bytes[n], { subset: true })),
  )
  const charsets = new Map<PDFFont, Set<number>>()
  const has = (font: PDFFont, c: string) => {
    if (!charsets.has(font)) charsets.set(font, new Set(font.getCharacterSet()))
    return charsets.get(font)!.has(c.codePointAt(0)!)
  }
  return {
    pick: (weight, isMono) => (isMono ? mono : weight >= 700 ? bold : weight >= 600 ? semibold : medium),
    clean: (font, text) => [...text].map((c) => (has(font, c) ? c : /\s/.test(c) ? (has(font, " ") ? " " : " ") : "?")).join(""),
  }
}
