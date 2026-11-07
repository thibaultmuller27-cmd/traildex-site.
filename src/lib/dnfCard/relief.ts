/**
 * Real relief for the card's square: elevation from the public Terrarium tiles
 * (AWS Open Data "elevation-tiles-prod", CORS open), sampled on an N × N grid
 * aligned with the square as the card engine draws it.
 */
import type { RouteGeo } from "@/lib/gpx"

const PS = 520
const tileCache = new Map<string, Promise<ImageData | null>>()

function tile(z: number, x: number, y: number) {
  const key = `${z}/${x}/${y}`
  if (!tileCache.has(key)) {
    tileCache.set(
      key,
      new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const c = document.createElement("canvas")
          c.width = c.height = 256
          const ctx = c.getContext("2d", { willReadFrequently: true })!
          ctx.drawImage(img, 0, 0)
          try { resolve(ctx.getImageData(0, 0, 256, 256)) } catch { resolve(null) }
        }
        img.onerror = () => resolve(null)
        img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`
      }),
    )
  }
  return tileCache.get(key)!
}

const tx = (lon: number, z: number) => ((lon + 180) / 360) * 2 ** z
const ty = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z
}

/** Same fit as the engine's route(): route space (0–100) → square. */
export function squareFit(route: [number, number][]) {
  const xs = route.map((p) => p[0]), ys = route.map((p) => p[1])
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1
  return { sc: (PS * 0.8) / span, cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2 }
}

export async function reliefGrid(route: [number, number][], geo: RouteGeo, N = 150): Promise<{ N: number; grid: number[][] } | null> {
  if (route.length < 2) return null
  const { sc, cx, cy } = squareFit(route)
  // square position (0..PS) → route space → lat / lon
  const toLatLon = (u: number, v: number) => {
    const x = cx + (u - PS / 2) / sc, y = cy + (v - PS / 2) / sc
    const lon = ((x - geo.offX) / geo.scale + geo.minX) / geo.cosLat
    const lat = -((y - geo.offY) / geo.scale + geo.minY)
    return [lat, lon] as const
  }
  const [lat0, lon0] = toLatLon(0, 0), [lat1, lon1] = toLatLon(PS, PS)
  const lonSpan = Math.abs(lon1 - lon0) || 0.01
  const z = Math.max(7, Math.min(12, Math.floor(Math.log2((360 / lonSpan) * 2.5))))
  const X0 = Math.floor(tx(Math.min(lon0, lon1), z)), X1 = Math.floor(tx(Math.max(lon0, lon1), z))
  const Y0 = Math.floor(ty(Math.max(lat0, lat1), z)), Y1 = Math.floor(ty(Math.min(lat0, lat1), z))
  if ((X1 - X0 + 1) * (Y1 - Y0 + 1) > 36) return null
  const tiles = new Map<string, ImageData | null>()
  await Promise.all(
    Array.from({ length: (X1 - X0 + 1) * (Y1 - Y0 + 1) }, async (_, k) => {
      const x = X0 + (k % (X1 - X0 + 1)), y = Y0 + Math.floor(k / (X1 - X0 + 1))
      tiles.set(`${x}/${y}`, await tile(z, x, y))
    }),
  )
  if ([...tiles.values()].some((t) => !t)) return null
  const grid: number[][] = []
  for (let j = 0; j < N; j++) {
    const row: number[] = []
    for (let i = 0; i < N; i++) {
      const [lat, lon] = toLatLon((i / (N - 1)) * PS, (j / (N - 1)) * PS)
      const fx = tx(lon, z), fy = ty(lat, z), t = tiles.get(`${Math.floor(fx)}/${Math.floor(fy)}`)
      if (!t) { row.push(0); continue }
      const px = Math.min(255, Math.floor((fx % 1) * 256)), py = Math.min(255, Math.floor((fy % 1) * 256)), o = (py * 256 + px) * 4
      row.push(t.data[o] * 256 + t.data[o + 1] + t.data[o + 2] / 256 - 32768)
    }
    grid.push(row)
  }
  return { N, grid }
}
