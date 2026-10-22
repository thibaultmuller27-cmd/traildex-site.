/**
 * Synthetic but realistic tracks for the demo cards and the "try an example"
 * button. Seeded, so every visit draws the same routes.
 */
import { computeStats, elevationChange, haversine, type TrackPoint } from "./gpx"
import type { CardData, Rarity } from "./card"
import { seeded } from "./utils"

type TrackSpec = {
  seed: number
  km: number
  gain: number
  durationSec: number
  date: string
  lat: number
  lon: number
  baseEle: number
  loop?: boolean
}

export function makeTrack(spec: TrackSpec): TrackPoint[] {
  const rnd = seeded(spec.seed)
  const n = Math.max(400, Math.round((spec.km * 1000) / 35))
  const harm = [1, 2, 3, 4].map((k) => ({
    k,
    a: (0.6 + rnd()) / k ** 1.4,
    b: (0.6 + rnd()) / k ** 1.4,
    p: rnd() * Math.PI * 2,
    q: rnd() * Math.PI * 2,
  }))
  const wig = [11, 17, 23, 31].map((k) => ({ k, a: 0.012 + rnd() * 0.012, p: rnd() * 6.28 }))
  const drift = spec.loop === false ? [1.6 * (rnd() - 0.5) + 1.2, 1.6 * (rnd() - 0.5)] : [0, 0]

  const shape = (t: number): [number, number] => {
    let x = drift[0] * t
    let y = drift[1] * t
    for (const h of harm) {
      x += h.a * Math.cos(2 * Math.PI * h.k * t + h.p)
      y += h.b * Math.sin(2 * Math.PI * h.k * t + h.q)
    }
    for (const w of wig) {
      x += w.a * Math.cos(2 * Math.PI * w.k * t + w.p)
      y += w.a * Math.sin(2 * Math.PI * w.k * t + w.p * 1.3)
    }
    return [x, y]
  }

  // Elevation: a few mountain-sized waves plus some summits.
  const waves = [2, 3, 5, 7, 11].map((m) => ({ m, a: (0.4 + rnd()) / Math.sqrt(m), p: rnd() * 6.28 }))
  const bumps = [0, 1, 2].map(() => ({ c: 0.15 + rnd() * 0.7, w: 0.03 + rnd() * 0.05, a: 0.8 + rnd() }))
  const eleRaw = (t: number) => {
    let e = 0
    for (const w of waves) e += w.a * Math.sin(2 * Math.PI * w.m * t + w.p)
    for (const b of bumps) e += b.a * Math.exp(-(((t - b.c) / b.w) ** 2))
    return e
  }

  const ts = Array.from({ length: n }, (_, i) => i / (n - 1))
  const raw = ts.map(shape)
  const rawE = ts.map(eleRaw)
  const minE = Math.min(...rawE)

  const build = (s: number, amp: number): TrackPoint[] =>
    raw.map(([x, y], i) => ({
      lat: spec.lat + y * s,
      lon: spec.lon + (x * s) / Math.cos((spec.lat * Math.PI) / 180),
      ele: spec.baseEle + (rawE[i] - minE) * amp,
      time: Date.parse(spec.date + "T06:00:00Z") + ts[i] * spec.durationSec * 1000,
    }))

  const length = (pts: TrackPoint[]) => {
    let d = 0
    for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i])
    return d / 1000
  }

  let s = 0.02
  let amp = 100
  for (let i = 0; i < 4; i++) {
    const pts = build(s, amp)
    s *= spec.km / length(pts)
    const g = elevationChange(pts.map((p) => p.ele as number)).gain
    amp *= spec.gain / Math.max(g, 1)
  }
  return build(s, amp)
}

export const CRETES_SPEC: TrackSpec = {
  seed: 53,
  km: 53,
  gain: 2023,
  durationSec: 7 * 3600 + 16 * 60,
  date: "2026-06-14",
  lat: 48.03,
  lon: 7.05,
  baseEle: 520,
  loop: false,
}

type DemoInput = {
  id: string
  runner: string
  race: string
  rank: string
  rarity: Rarity
  number: number
  spec: TrackSpec
}

const DEMOS: DemoInput[] = [
  { id: "d-cretes", runner: "Camille", race: "Crêtes Vosgiennes", rank: "42/612", rarity: "epique", number: 53, spec: CRETES_SPEC },
  { id: "d-balcon", runner: "Léa", race: "Balcons du Lac", rank: "118/740", rarity: "rare", number: 7, spec: { seed: 11, km: 21.4, gain: 820, durationSec: 2 * 3600 + 41 * 60, date: "2026-04-19", lat: 45.86, lon: 6.17, baseEle: 450 } },
  { id: "d-douaniers", runner: "Hugo", race: "Sentier des Douaniers", rank: "64/980", rarity: "rare", number: 12, spec: { seed: 27, km: 32, gain: 610, durationSec: 3 * 3600 + 5 * 60, date: "2026-05-03", lat: 48.7, lon: -3.5, baseEle: 5, loop: false } },
  { id: "d-aiguille", runner: "Inès", race: "Trail du Mont Aiguille", rank: "9/430", rarity: "rare", number: 31, spec: { seed: 4, km: 38, gain: 1950, durationSec: 5 * 3600 + 2 * 60, date: "2026-07-05", lat: 44.84, lon: 5.55, baseEle: 830 } },
  { id: "d-calanques", runner: "Nathan", race: "Ultra des Calanques", rank: "27/350", rarity: "rare", number: 18, spec: { seed: 91, km: 45, gain: 1400, durationSec: 5 * 3600 + 48 * 60, date: "2026-03-08", lat: 43.21, lon: 5.45, baseEle: 10, loop: false } },
  { id: "d-vercors", runner: "Jules", race: "Traversée du Vercors", rank: "15/520", rarity: "epique", number: 77, spec: { seed: 65, km: 86, gain: 3900, durationSec: 13 * 3600 + 22 * 60, date: "2026-08-23", lat: 45.0, lon: 5.5, baseEle: 640, loop: false } },
  { id: "d-mercantour", runner: "Sarah", race: "Grand Raid du Mercantour", rank: "3/260", rarity: "legendaire", number: 1, spec: { seed: 7, km: 112, gain: 6800, durationSec: 22 * 3600 + 40 * 60, date: "2026-09-12", lat: 44.15, lon: 7.2, baseEle: 780 } },
  { id: "d-aiguilles", runner: "Tom", race: "Tour des Aiguilles Rouges", rank: "1/410", rarity: "legendaire", number: 2, spec: { seed: 33, km: 57, gain: 4100, durationSec: 8 * 3600 + 55 * 60, date: "2026-07-26", lat: 45.98, lon: 6.85, baseEle: 1030 } },
]

export const DEMO_CARDS: CardData[] = DEMOS.map((d) => {
  const st = computeStats(makeTrack(d.spec), d.race)
  return {
    id: d.id,
    runner: d.runner,
    race: d.race,
    date: d.spec.date,
    timeSec: d.spec.durationSec,
    rank: d.rank,
    distanceKm: d.spec.km,
    gain: d.spec.gain,
    maxEle: st.maxEle,
    routePath: st.routePath,
    start: st.start,
    end: st.end,
    profileArea: st.profileArea,
    profileLine: st.profileLine,
    rarity: d.rarity,
    number: d.number,
    demo: true,
  }
})

export const HERO_CARD = DEMO_CARDS[0]
