import * as React from "react"
import type { Rarity } from "@/lib/card"
import { levelOf } from "@/lib/progress"
import { seeded } from "@/lib/utils"
import { CHEST_XP, FREE_DAILY_CHESTS, PREMIUM_XP_MULTIPLIER, PRIZES, REACH_M, type Prize } from "../config"
import { CHALLENGES, DAILY, isDone } from "./challenges"
import { haversine, hash, today, type LngLat } from "./geo"
import { CHEST_DROPS, STARTER_EQUIP, STARTER_ITEMS, itemById, type Slot } from "./items"
import type { Trail, Treasure } from "./trails"

export type Reward = Prize & { id: string; at: number; rarity: Rarity }

export type GameState = {
  v: 1
  xp: number
  distanceM: number
  /** Days played, yyyy-mm-dd. */
  days: string[]
  trails: Record<string, { name: string; total: number; visited: number[] }>
  /** Treasure id → opened (today's ids only matter). */
  opened: Record<string, true>
  chests: Record<Rarity, number>
  daily: { date: string; count: number; claimed: boolean }
  items: string[]
  equipped: Partial<Record<Slot, string>>
  rewards: Reward[]
  claimed: string[]
  premiumUntil: number | null
}

const KEY = "traildex.quest.v1"

const fresh = (): GameState => ({
  v: 1,
  xp: 0,
  distanceM: 0,
  days: [],
  trails: {},
  opened: {},
  chests: { commune: 0, rare: 0, epique: 0, legendaire: 0 },
  daily: { date: today(), count: 0, claimed: false },
  items: [...STARTER_ITEMS],
  equipped: { ...STARTER_EQUIP },
  rewards: [],
  claimed: [],
  premiumUntil: null,
})

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch {
    /* private mode or corrupt save */
  }
  return fresh()
}

export type Loot = { rarity: Rarity; xp: number; item?: string; prize?: Reward }

export type OpenResult =
  | { ok: true; loot: Loot }
  | { ok: false; reason: "far" | "limit" | "premium" | "opened"; distance?: number }

type Store = {
  state: GameState
  premium: boolean
  level: ReturnType<typeof levelOf>
  /** Returns names of newly discovered trails. */
  move: (to: LngLat, from: LngLat | null, trails: Trail[]) => string[]
  open: (t: Treasure, player: LngLat | null) => OpenResult
  claim: (challengeId: string) => void
  claimDaily: () => void
  equip: (slot: Slot, id: string | null) => void
  activatePremium: (days: number) => void
  reset: () => void
}

const Ctx = React.createContext<Store | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<GameState>(load)
  const ref = React.useRef(state)
  ref.current = state

  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
  }, [state])

  const commit = (next: GameState) => {
    ref.current = next
    setState(next)
  }

  const premium = !!state.premiumUntil && state.premiumUntil > Date.now()

  const store = React.useMemo<Store>(() => {
    const isPremium = () => !!ref.current.premiumUntil && ref.current.premiumUntil > Date.now()
    const withDay = (s: GameState): GameState => {
      const d = today()
      return {
        ...s,
        days: s.days.includes(d) ? s.days : [...s.days, d],
        daily: s.daily.date === d ? s.daily : { date: d, count: 0, claimed: false },
      }
    }

    return {
      state,
      premium,
      level: levelOf(state.xp),

      move(to, from, trails) {
        let s = withDay(ref.current)
        const step = from ? haversine(from, to) : 0
        // Ignore GPS jumps (teleports) for the distance counter.
        if (step > 0 && step < 400) s = { ...s, distanceM: s.distanceM + step }
        const found: string[] = []
        const nextTrails = { ...s.trails }
        for (const t of trails) {
          const near: number[] = []
          t.points.forEach((p, i) => {
            if (Math.abs(p[1] - to[1]) < 0.001 && haversine(p, to) <= REACH_M) near.push(i)
          })
          if (!near.length) continue
          const prev = nextTrails[t.id]
          if (!prev) found.push(t.name)
          const visited = new Set(prev?.visited ?? [])
          const before = visited.size
          near.forEach((i) => visited.add(i))
          if (!prev || visited.size !== before)
            nextTrails[t.id] = { name: t.name, total: t.points.length, visited: [...visited] }
        }
        commit({ ...s, trails: nextTrails })
        return found
      },

      open(t, player) {
        const s0 = withDay(ref.current)
        if (s0.opened[t.id]) return { ok: false, reason: "opened" }
        if (t.rarity === "legendaire" && !isPremium()) return { ok: false, reason: "premium" }
        const distance = player ? haversine(player, t.at) : Infinity
        if (distance > REACH_M) return { ok: false, reason: "far", distance }
        if (!isPremium() && s0.daily.count >= FREE_DAILY_CHESTS) return { ok: false, reason: "limit" }

        const rand = seeded(hash(t.id + s0.xp))
        const xp = CHEST_XP[t.rarity] * (isPremium() ? PREMIUM_XP_MULTIPLIER : 1)
        const loot: Loot = { rarity: t.rarity, xp }
        const drops = CHEST_DROPS[t.rarity].filter((id) => !s0.items.includes(id))
        const dropChance = { commune: 0.3, rare: 0.6, epique: 0.5, legendaire: 1 }[t.rarity]
        if (drops.length && rand() < dropChance) loot.item = drops[Math.floor(rand() * drops.length)]
        if (t.rarity === "epique" || t.rarity === "legendaire") {
          const pool = PRIZES[t.rarity]
          const p = pool[Math.floor(rand() * pool.length)]
          loot.prize = { ...p, id: t.id, at: Date.now(), rarity: t.rarity }
        }

        commit({
          ...s0,
          xp: s0.xp + xp,
          opened: { ...s0.opened, [t.id]: true },
          chests: { ...s0.chests, [t.rarity]: s0.chests[t.rarity] + 1 },
          daily: { ...s0.daily, count: s0.daily.count + 1 },
          items: loot.item ? [...s0.items, loot.item] : s0.items,
          rewards: loot.prize ? [loot.prize, ...s0.rewards] : s0.rewards,
        })
        return { ok: true, loot }
      },

      claim(id) {
        const s = ref.current
        const c = CHALLENGES.find((x) => x.id === id)
        if (!c || s.claimed.includes(id) || !isDone(c, s) || (c.premium && !isPremium())) return
        commit({
          ...s,
          xp: s.xp + c.xp,
          claimed: [...s.claimed, id],
          items: c.item && !s.items.includes(c.item) ? [...s.items, c.item] : s.items,
        })
      },

      claimDaily() {
        const s = withDay(ref.current)
        if (s.daily.claimed || s.daily.count < DAILY.goal) return
        commit({ ...s, xp: s.xp + DAILY.xp, daily: { ...s.daily, claimed: true } })
      },

      equip(slot, id) {
        const s = ref.current
        if (id) {
          const it = itemById(id)
          if (!it || !s.items.includes(id) || (it.premium && !isPremium())) return
        }
        commit({ ...s, equipped: { ...s.equipped, [slot]: id ?? undefined } })
      },

      activatePremium(days) {
        const s = ref.current
        const base = Math.max(Date.now(), s.premiumUntil ?? 0)
        const items = s.items.includes("maillot-holo") ? s.items : [...s.items, "maillot-holo"]
        commit({ ...s, premiumUntil: base + days * 86400000, items })
      },

      reset() {
        commit(fresh())
      },
    }
  }, [state, premium])

  return React.createElement(Ctx.Provider, { value: store }, children)
}

export function useGame() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useGame outside GameProvider")
  return v
}
