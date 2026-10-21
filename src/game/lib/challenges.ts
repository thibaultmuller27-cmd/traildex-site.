import { Compass, Crown, Footprints, Gem, Map, Medal, Mountain, Sparkles, Trophy, CalendarCheck, type LucideIcon } from "lucide-react"
import type { GameState } from "./state"

export type Challenge = {
  id: string
  name: string
  hint: string
  icon: LucideIcon
  xp: number
  item?: string
  premium?: boolean
  /** [current, goal] */
  progress: (s: GameState) => [number, number]
}

const discovered = (s: GameState) => Object.keys(s.trails).length
const opened = (s: GameState) => Object.values(s.chests).reduce((a, b) => a + b, 0)
const bestCompletion = (s: GameState) =>
  Math.max(0, ...Object.values(s.trails).map((t) => (t.total ? t.visited.length / t.total : 0)))

export const CHALLENGES: Challenge[] = [
  { id: "premiers-pas", name: "Premiers pas", hint: "Parcours 1 km", icon: Footprints, xp: 100, item: "casquette", progress: (s) => [s.distanceM / 1000, 1] },
  { id: "explorateur", name: "Explorateur", hint: "Découvre 3 sentiers", icon: Compass, xp: 200, item: "gilet-hydra", progress: (s) => [discovered(s), 3] },
  { id: "chasseur", name: "Chasseur de trésors", hint: "Ouvre 5 coffres", icon: Gem, xp: 200, item: "batons", progress: (s) => [opened(s), 5] },
  { id: "pepite", name: "Pépite", hint: "Ouvre un coffre épique", icon: Sparkles, xp: 300, item: "frontale", progress: (s) => [s.chests.epique + s.chests.legendaire, 1] },
  { id: "cartographe", name: "Cartographe", hint: "Parcours 90 % d'un sentier", icon: Map, xp: 300, item: "bandeau", progress: (s) => [Math.round(bestCompletion(s) * 100), 90] },
  { id: "regulier", name: "Régulier", hint: "Joue 3 jours différents", icon: CalendarCheck, xp: 250, item: "tee-foret", progress: (s) => [s.days.length, 3] },
  { id: "semi", name: "Semi", hint: "21,1 km cumulés", icon: Medal, xp: 500, item: "chaussures-carbone", progress: (s) => [s.distanceM / 1000, 21.1] },
  { id: "marathon", name: "Marathon", hint: "42,2 km cumulés", icon: Mountain, xp: 800, item: "sac-ultra", progress: (s) => [s.distanceM / 1000, 42.2] },
  { id: "maitre", name: "Maître des sentiers", hint: "Découvre 10 sentiers", icon: Trophy, xp: 1000, item: "laurier", progress: (s) => [discovered(s), 10] },
  { id: "legende", name: "Légende", hint: "Ouvre un coffre légendaire", icon: Crown, xp: 1000, item: "maillot-or", premium: true, progress: (s) => [s.chests.legendaire, 1] },
]

export const DAILY = { goal: 3, xp: 150, name: "Défi du jour", hint: "Ouvre 3 coffres aujourd'hui" }

export const isDone = (c: Challenge, s: GameState) => {
  const [cur, goal] = c.progress(s)
  return cur >= goal
}
