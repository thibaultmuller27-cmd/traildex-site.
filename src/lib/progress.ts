import { Award, Crown, Flag, Footprints, Gem, Layers, Medal, Mountain, MountainSnow, Rainbow, type LucideIcon } from "lucide-react"
import { effortKm, parseRank, type CardData, type Rarity } from "./card"

export const XP: Record<Rarity, number> = { commune: 100, rare: 250, epique: 500, legendaire: 1000 }

export const LEVELS = [
  { at: 0, name: "Randonneur" },
  { at: 300, name: "Coureur des sentiers" },
  { at: 800, name: "Grimpeur" },
  { at: 1600, name: "Coureur des crêtes" },
  { at: 3000, name: "Ultra-traileur" },
  { at: 5000, name: "Légende des cimes" },
]

export function xpOf(cards: CardData[]) {
  return cards.reduce((s, c) => s + XP[c.rarity] + Math.round(effortKm(c.distanceKm, c.gain)), 0)
}

export function levelOf(xp: number) {
  let i = 0
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++
  const cur = LEVELS[i]
  const next = LEVELS[i + 1]
  return {
    level: i + 1,
    name: cur.name,
    next: next ?? null,
    progress: next ? (xp - cur.at) / (next.at - cur.at) : 1,
  }
}

export type Badge = {
  id: string
  name: string
  hint: string
  icon: LucideIcon
  color: string
  test: (cards: CardData[]) => boolean
}

const sum = (cards: CardData[], f: (c: CardData) => number) => cards.reduce((s, c) => s + f(c), 0)

export const BADGES: Badge[] = [
  { id: "first", name: "Premier dossard", hint: "Ta première carte", icon: Flag, color: "#34c759", test: (c) => c.length >= 1 },
  { id: "marathon", name: "Marathonien", hint: "Une course de 42 km ou plus", icon: Footprints, color: "#0a84ff", test: (c) => c.some((x) => (x.distanceKm ?? 0) >= 42) },
  { id: "chamois", name: "Chamois", hint: "2 000 m de D+ en une course", icon: Mountain, color: "#ff9f0a", test: (c) => c.some((x) => (x.gain ?? 0) >= 2000) },
  { id: "ultra", name: "Ultra", hint: "Une course de 80 km ou plus", icon: Award, color: "#ff375f", test: (c) => c.some((x) => (x.distanceKm ?? 0) >= 80) },
  { id: "podium", name: "Podium", hint: "Finir dans le top 3", icon: Medal, color: "#e0a93b", test: (c) => c.some((x) => (parseRank(x.rank)?.pos ?? 99) <= 3) },
  { id: "holo", name: "Arc-en-ciel", hint: "Posséder une carte Holo", icon: Rainbow, color: "#bf5af2", test: (c) => c.some((x) => x.rarity === "rare" || x.rarity === "epique") },
  { id: "legend", name: "Légende", hint: "Posséder une carte Or", icon: Crown, color: "#d4a017", test: (c) => c.some((x) => x.rarity === "legendaire") },
  { id: "collector", name: "Collectionneur", hint: "5 cartes dans ta collection", icon: Layers, color: "#5e5ce6", test: (c) => c.length >= 5 },
  { id: "century", name: "Centurion", hint: "100 km cumulés", icon: Gem, color: "#30b0c7", test: (c) => sum(c, (x) => x.distanceKm ?? 0) >= 100 },
  { id: "everest", name: "Everest", hint: "8 848 m de D+ cumulés", icon: MountainSnow, color: "#64d2ff", test: (c) => sum(c, (x) => x.gain ?? 0) >= 8848 },
]
