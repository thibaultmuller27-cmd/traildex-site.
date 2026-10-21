export type Rarity = "commune" | "rare" | "epique" | "legendaire"
export type Finish = "standard" | "holo" | "or"

export type CardData = {
  id: string
  runner: string
  race: string
  /** yyyy-mm-dd */
  date: string
  /** Seconds */
  timeSec: number | null
  /** Free text such as "42" or "42/850" */
  rank: string
  distanceKm: number | null
  gain: number | null
  maxEle: number | null
  routePath: string
  start?: [number, number]
  end?: [number, number]
  profileArea: string
  profileLine: string
  photo?: string
  rarity: Rarity
  number: number
  demo?: boolean
}

/** Kilomètre-effort: 1 km + 1 km per 100 m of climbing. */
export const effortKm = (km: number | null, gain: number | null) =>
  (km ?? 0) + (gain ?? 0) / 100

export function rarityFor(finish: Finish, km: number | null, gain: number | null): Rarity {
  if (finish === "standard") return "commune"
  if (finish === "or") return "legendaire"
  return effortKm(km, gain) >= 60 ? "epique" : "rare"
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString("fr-FR")

export const fmtKm = (km: number | null) =>
  km == null ? "—" : km >= 100 ? Math.round(km).toString() : (Math.round(km * 10) / 10).toLocaleString("fr-FR")

/** 26160 → "7 h 16" */
export function fmtDuration(sec: number | null) {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return "—"
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h === 0) return `${m} min`
  return `${h} h ${String(m).padStart(2, "0")}`
}

/** Accepts "7h16", "7 h 16", "07:16:00", "7:16", "436" (minutes). */
export function parseDuration(text: string): number | null {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const colon = t.match(/^(\d{1,3}):(\d{1,2})(?::(\d{1,2}))?$/)
  if (colon) return +colon[1] * 3600 + +colon[2] * 60 + (colon[3] ? +colon[3] : 0)
  const hm = t.match(/^(\d{1,3})\s*h\s*(\d{1,2})?\s*(?:m(?:in)?)?\s*(\d{1,2})?\s*s?$/)
  if (hm) return +hm[1] * 3600 + (hm[2] ? +hm[2] * 60 : 0) + (hm[3] ? +hm[3] : 0)
  const min = t.match(/^(\d{1,4})\s*(?:m|min)?$/)
  if (min) return +min[1] * 60
  return null
}

export function durationToInput(sec: number | null) {
  if (sec == null) return ""
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return `${h}h${String(m).padStart(2, "0")}`
}

/** "42/850" → { pos: 42, total: 850 } */
export function parseRank(rank: string) {
  const m = rank.match(/(\d+)\s*(?:\/\s*(\d+))?/)
  if (!m) return null
  return { pos: +m[1], total: m[2] ? +m[2] : null }
}

export function fmtRank(rank: string) {
  const r = parseRank(rank)
  if (!r) return "—"
  return r.pos === 1 ? "1er" : `${r.pos}e`
}

export function fmtPace(sec: number | null, km: number | null) {
  if (!sec || !km) return "—"
  const p = sec / km
  const m = Math.floor(p / 60)
  const s = Math.round(p % 60)
  return `${m}:${String(s).padStart(2, "0")} /km`
}

export function fmtDate(iso: string) {
  if (!iso) return ""
  const d = new Date(iso + "T12:00:00")
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}
