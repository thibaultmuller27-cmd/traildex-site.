export type LngLat = [number, number]

const R = 6371008.8
const rad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in meters. */
export function haversine(a: LngLat, b: LngLat) {
  const dLat = rad(b[1] - a[1])
  const dLng = rad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Point `m` meters from `a` towards `b` (flat approximation, fine under a few km). */
export function stepTowards(a: LngLat, b: LngLat, m: number): LngLat {
  const d = haversine(a, b)
  if (d <= m || d === 0) return b
  const t = m / d
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** Offset a point by meters east/north. */
export function offset(p: LngLat, east: number, north: number): LngLat {
  return [p[0] + east / (R * Math.cos(rad(p[1]))) * (180 / Math.PI), p[1] + (north / R) * (180 / Math.PI)]
}

/** Resample a polyline so consecutive points are ~`every` meters apart. */
export function resample(line: LngLat[], every: number): LngLat[] {
  if (line.length < 2) return line
  const out: LngLat[] = [line[0]]
  let carry = 0
  for (let i = 1; i < line.length; i++) {
    let a = line[i - 1]
    const b = line[i]
    let seg = haversine(a, b)
    while (carry + seg >= every) {
      const p = stepTowards(a, b, every - carry)
      out.push(p)
      seg -= every - carry
      a = p
      carry = 0
    }
    carry += seg
  }
  const last = line[line.length - 1]
  if (haversine(out[out.length - 1], last) > every / 3) out.push(last)
  return out
}

export function lengthOf(line: LngLat[]) {
  let s = 0
  for (let i = 1; i < line.length; i++) s += haversine(line[i - 1], line[i])
  return s
}

/** GeoJSON polygon approximating a circle of `m` meters. */
export function circle(center: LngLat, m: number, steps = 48): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring: LngLat[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    ring.push(offset(center, Math.cos(t) * m, Math.sin(t) * m))
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } }
}

export const fmtDist = (m: number) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`

/** Stable 32-bit hash for seeding. */
export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export const today = () => new Date().toISOString().slice(0, 10)
