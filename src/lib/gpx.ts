/**
 * GPX parsing and trail statistics. Everything runs in the browser:
 * the file is read with FileReader/DOMParser and never leaves the device.
 */

export type TrackPoint = { lat: number; lon: number; ele: number | null; time: number | null }

export type TrackStats = {
  name: string | null
  /** ISO date (yyyy-mm-dd) taken from the track timestamps, if any. */
  date: string | null
  /** Elapsed seconds between first and last timestamp, if any. */
  durationSec: number | null
  distanceKm: number
  gain: number
  loss: number
  minEle: number | null
  maxEle: number | null
  pointCount: number
  /** SVG path in a 100×100 box, aspect ratio preserved and centred. */
  routePath: string
  /** Start / finish markers in the same 100×100 box. */
  start: [number, number]
  end: [number, number]
  /** Elevation profile as an SVG area and line in a 100×30 box. */
  profileArea: string
  profileLine: string
}

export class GpxError extends Error {}

const R = 6371008.8

export function haversine(a: TrackPoint, b: TrackPoint) {
  const toRad = Math.PI / 180
  const dLat = (b.lat - a.lat) * toRad
  const dLon = (b.lon - a.lon) * toRad
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function parseGpx(xml: string): { name: string | null; points: TrackPoint[] } {
  const doc = new DOMParser().parseFromString(xml, "application/xml")
  if (doc.getElementsByTagName("parsererror").length) {
    throw new GpxError("Ce fichier n'est pas un GPX valide.")
  }
  let nodes = Array.from(doc.getElementsByTagNameNS("*", "trkpt"))
  if (!nodes.length) nodes = Array.from(doc.getElementsByTagNameNS("*", "rtept"))
  if (!nodes.length) nodes = Array.from(doc.getElementsByTagNameNS("*", "wpt"))

  const points: TrackPoint[] = []
  for (const n of nodes) {
    const lat = parseFloat(n.getAttribute("lat") ?? "")
    const lon = parseFloat(n.getAttribute("lon") ?? "")
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const eleText = n.getElementsByTagNameNS("*", "ele")[0]?.textContent
    const timeText = n.getElementsByTagNameNS("*", "time")[0]?.textContent
    const ele = eleText != null ? parseFloat(eleText) : NaN
    const time = timeText ? Date.parse(timeText) : NaN
    points.push({
      lat,
      lon,
      ele: Number.isFinite(ele) ? ele : null,
      time: Number.isFinite(time) ? time : null,
    })
  }
  if (points.length < 2) throw new GpxError("Aucun tracé trouvé dans ce fichier GPX.")

  const nameNode =
    doc.getElementsByTagNameNS("*", "trk")[0]?.getElementsByTagNameNS("*", "name")[0] ??
    doc.getElementsByTagNameNS("*", "metadata")[0]?.getElementsByTagNameNS("*", "name")[0] ??
    doc.getElementsByTagNameNS("*", "rte")[0]?.getElementsByTagNameNS("*", "name")[0]
  // Strava and watches decorate names ("Finisher UTDP by UTMB®️ 🟢"): keep the words.
  const name =
    nameNode?.textContent
      ?.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}®™©]/gu, "")
      .replace(/\s+/g, " ")
      .trim() || null
  return { name, points }
}

/**
 * Positive / negative elevation with light smoothing and a hysteresis
 * threshold, so GPS altitude noise does not inflate the D+ the way a naive
 * sum of differences does.
 */
export function elevationChange(eles: number[], threshold = 3) {
  if (eles.length < 2) return { gain: 0, loss: 0 }
  const w = 2
  const smooth = eles.map((_, i) => {
    let s = 0
    let c = 0
    for (let j = Math.max(0, i - w); j <= Math.min(eles.length - 1, i + w); j++) {
      s += eles[j]
      c++
    }
    return s / c
  })
  let gain = 0
  let loss = 0
  let ref = smooth[0]
  for (let i = 1; i < smooth.length; i++) {
    const d = smooth[i] - ref
    if (d >= threshold) {
      gain += d
      ref = smooth[i]
    } else if (d <= -threshold) {
      loss -= d
      ref = smooth[i]
    }
  }
  return { gain, loss }
}

const f = (n: number) => (Math.round(n * 100) / 100).toString()

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr
  const out: T[] = []
  const step = (arr.length - 1) / (max - 1)
  for (let i = 0; i < max; i++) out.push(arr[Math.round(i * step)])
  return out
}

export function computeStats(points: TrackPoint[], name: string | null = null): TrackStats {
  // Cumulative distance
  const cum: number[] = [0]
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + haversine(points[i - 1], points[i]))
  const distance = cum[cum.length - 1]

  const withEle = points.filter((p) => p.ele != null)
  const eles = withEle.map((p) => p.ele as number)
  const { gain, loss } = elevationChange(eles)
  // A loop, not Math.min(...eles): a long run has more points than an engine
  // accepts as call arguments (Safari stops at 65 536).
  let minEle: number | null = null
  let maxEle: number | null = null
  for (const e of eles) {
    if (minEle == null || e < minEle) minEle = e
    if (maxEle == null || e > maxEle) maxEle = e
  }

  const times = points.map((p) => p.time).filter((t): t is number => t != null)
  const durationSec = times.length > 1 ? Math.round((times[times.length - 1] - times[0]) / 1000) : null
  const date = times.length ? new Date(times[0]).toISOString().slice(0, 10) : null

  // Route: equirectangular projection, fitted into 100×100 with padding.
  const lat0 = (points.reduce((s, p) => s + p.lat, 0) / points.length) * (Math.PI / 180)
  const proj = downsample(points, 500).map((p) => [p.lon * Math.cos(lat0), -p.lat] as [number, number])
  const xs = proj.map((p) => p[0])
  const ys = proj.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX || 1e-9
  const spanY = Math.max(...ys) - minY || 1e-9
  const pad = 8
  const scale = (100 - pad * 2) / Math.max(spanX, spanY)
  const offX = (100 - spanX * scale) / 2
  const offY = (100 - spanY * scale) / 2
  const pts = proj.map(([x, y]) => [offX + (x - minX) * scale, offY + (y - minY) * scale] as [number, number])
  const routePath = pts.map(([x, y], i) => (i ? "L" : "M") + f(x) + " " + f(y)).join("")

  // Profile: elevation against distance in a 100×30 box.
  let profileArea = ""
  let profileLine = ""
  if (eles.length > 1 && maxEle != null && minEle != null) {
    const idx = points.map((p, i) => (p.ele != null ? i : -1)).filter((i) => i >= 0)
    const samples = downsample(idx, 160)
    const range = Math.max(maxEle - minEle, 1)
    const line = samples.map((i) => {
      const x = (cum[i] / (distance || 1)) * 100
      const y = 28 - (((points[i].ele as number) - minEle) / range) * 24
      return [x, y] as [number, number]
    })
    profileLine = line.map(([x, y], i) => (i ? "L" : "M") + f(x) + " " + f(y)).join("")
    profileArea = profileLine + "L100 30L0 30Z"
  }

  return {
    name,
    date,
    durationSec,
    distanceKm: distance / 1000,
    gain,
    loss,
    minEle,
    maxEle,
    pointCount: points.length,
    routePath,
    start: pts[0],
    end: pts[pts.length - 1],
    profileArea,
    profileLine,
  }
}

export function readGpxFile(file: File): Promise<TrackStats> {
  return new Promise((resolve, reject) => {
    if (!/\.gpx$/i.test(file.name) && file.type !== "application/gpx+xml") {
      reject(new GpxError("Choisis un fichier au format .gpx."))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new GpxError("Impossible de lire ce fichier."))
    reader.onload = () => {
      try {
        const { name, points } = parseGpx(String(reader.result))
        resolve(computeStats(points, name))
      } catch (e) {
        reject(e instanceof GpxError ? e : new GpxError("Ce fichier GPX est illisible."))
      }
    }
    reader.readAsText(file)
  })
}

export function toGpx(points: TrackPoint[], name: string) {
  const pts = points
    .map(
      (p) =>
        `<trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">` +
        (p.ele != null ? `<ele>${p.ele.toFixed(1)}</ele>` : "") +
        (p.time != null ? `<time>${new Date(p.time).toISOString()}</time>` : "") +
        `</trkpt>`,
    )
    .join("\n      ")
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TrailDex" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>
      ${pts}
    </trkseg>
  </trk>
</gpx>
`
}
