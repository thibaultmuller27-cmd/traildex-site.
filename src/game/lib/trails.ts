import { seeded } from "@/lib/utils"
import { CHEST_ODDS } from "../config"
import { hash, lengthOf, offset, resample, today, type LngLat } from "./geo"
import type { Rarity } from "@/lib/card"

export type Trail = {
  id: string
  name: string
  /** Resampled every ~25 m: one entry per "visitable" point. */
  points: LngLat[]
  lengthM: number
}

export type Treasure = {
  id: string
  trailId: string
  at: LngLat
  rarity: Rarity
}

const OVERPASS = "https://overpass-api.de/api/interpreter"
const MAX_TRAILS = 10

type OsmWay = { id: number; tags?: Record<string, string>; geometry?: { lat: number; lon: number }[] }

/**
 * Real footpaths around the player, from OpenStreetMap (Overpass API).
 * Ways sharing a name are merged into one trail; the longest are kept.
 */
export async function fetchTrails(center: LngLat, radius = 2500, signal: AbortSignal = AbortSignal.timeout(12000)): Promise<Trail[]> {
  const [lng, lat] = center
  const q = `[out:json][timeout:20];way["highway"~"^(path|track|footway|bridleway)$"]["name"](around:${radius},${lat},${lng});out tags geom 400;`
  const res = await fetch(OVERPASS, { method: "POST", body: "data=" + encodeURIComponent(q), signal })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const data: { elements: OsmWay[] } = await res.json()

  const groups = new Map<string, LngLat[][]>()
  for (const w of data.elements) {
    if (!w.geometry || w.geometry.length < 2) continue
    const name = w.tags?.name?.trim() || "Sentier"
    const line = w.geometry.map((g) => [g.lon, g.lat] as LngLat)
    groups.set(name, [...(groups.get(name) ?? []), line])
  }

  const trails: Trail[] = []
  for (const [name, lines] of groups) {
    const points = lines.flatMap((l) => resample(l, 25))
    const lengthM = lines.reduce((s, l) => s + lengthOf(l), 0)
    if (lengthM < 300) continue
    trails.push({ id: "osm-" + hash(name + Math.round(lat * 100) + Math.round(lng * 100)), name, points, lengthM })
  }
  return trails.sort((a, b) => b.lengthM - a.lengthM).slice(0, MAX_TRAILS)
}

const FAKE_NAMES = [
  "Sentier des Crêtes",
  "Boucle du Chamois",
  "Chemin des Bergers",
  "Montée de la Cascade",
  "Balcon du Lac",
  "Sente des Mélèzes",
]

/** Offline fallback: winding loops around the player, deterministic per location. */
export function fakeTrails(center: LngLat): Trail[] {
  const rand = seeded(hash(center.map((c) => c.toFixed(2)).join()))
  return FAKE_NAMES.map((name, i) => {
    const angle = (i / FAKE_NAMES.length) * Math.PI * 2 + rand()
    const dist = 250 + rand() * 900
    const c = offset(center, Math.cos(angle) * dist, Math.sin(angle) * dist)
    const r = 180 + rand() * 320
    const raw: LngLat[] = []
    for (let k = 0; k <= 60; k++) {
      const t = (k / 60) * Math.PI * 2
      const wob = 1 + 0.25 * Math.sin(t * 3 + i) + 0.1 * Math.sin(t * 7)
      raw.push(offset(c, Math.cos(t) * r * wob, Math.sin(t) * r * 0.7 * wob))
    }
    return { id: `fake-${i}-${hash(name + center[0].toFixed(2))}`, name, points: resample(raw, 25), lengthM: lengthOf(raw) }
  })
}

function rollRarity(r: number): Rarity {
  let acc = 0
  for (const [rarity, p] of CHEST_ODDS) {
    acc += p
    if (r < acc) return rarity
  }
  return "commune"
}

/**
 * Chests along the trails, about one every 350 m. Seeded by trail + day,
 * so everyone sees the same treasures today and new ones tomorrow.
 */
export function placeTreasures(trails: Trail[], day = today()): Treasure[] {
  const out: Treasure[] = []
  for (const t of trails) {
    const rand = seeded(hash(t.id + day))
    const n = Math.max(1, Math.round(t.lengthM / 350))
    for (let k = 0; k < n; k++) {
      const idx = Math.floor(((k + 0.2 + rand() * 0.6) / n) * t.points.length)
      const p = t.points[Math.min(idx, t.points.length - 1)]
      out.push({ id: `${t.id}:${day}:${k}`, trailId: t.id, at: p, rarity: rollRarity(rand()) })
    }
  }
  return out
}
