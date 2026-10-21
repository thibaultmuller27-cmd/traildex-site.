import type { Rarity } from "@/lib/card"

export type Slot = "shirt" | "head" | "vest" | "shoes" | "hands" | "neck"

export type Item = {
  id: string
  name: string
  slot: Slot
  /** Main color; "holo" and "gold" are animated gradients. */
  color: string
  rarity: Rarity
  /** How to get it, shown in the locker. */
  source: string
  premium?: boolean
}

export const SLOT_LABEL: Record<Slot, string> = {
  shirt: "Maillot",
  head: "Tête",
  vest: "Gilet / sac",
  shoes: "Chaussures",
  hands: "Mains",
  neck: "Cou",
}

export const ITEMS: Item[] = [
  { id: "tee-gris", name: "Tee coton", slot: "shirt", color: "#9aa3b2", rarity: "commune", source: "De départ" },
  { id: "tee-orange", name: "Maillot Brasier", slot: "shirt", color: "#ff6a3d", rarity: "commune", source: "Coffre commun" },
  { id: "tee-ocean", name: "Maillot Océan", slot: "shirt", color: "#2fa8ff", rarity: "rare", source: "Coffre rare" },
  { id: "tee-foret", name: "Maillot Forêt", slot: "shirt", color: "#22c55e", rarity: "rare", source: "Défi Régulier" },
  { id: "maillot-holo", name: "Maillot Holo", slot: "shirt", color: "holo", rarity: "epique", source: "Traileur+", premium: true },
  { id: "maillot-or", name: "Maillot d'Or", slot: "shirt", color: "gold", rarity: "legendaire", source: "Défi Légende" },

  { id: "casquette", name: "Casquette trail", slot: "head", color: "#1f2937", rarity: "commune", source: "Défi Premiers pas" },
  { id: "bandeau", name: "Bandeau", slot: "head", color: "#f43f5e", rarity: "rare", source: "Défi Cartographe" },
  { id: "frontale", name: "Frontale", slot: "head", color: "#facc15", rarity: "epique", source: "Défi Pépite" },
  { id: "laurier", name: "Couronne de laurier", slot: "head", color: "gold", rarity: "legendaire", source: "Défi Maître des sentiers" },

  { id: "gilet-hydra", name: "Gilet d'hydratation", slot: "vest", color: "#0ea5e9", rarity: "rare", source: "Défi Explorateur" },
  { id: "sac-ultra", name: "Sac ultra 12 L", slot: "vest", color: "#a855f7", rarity: "epique", source: "Défi Marathon" },

  { id: "chaussures-base", name: "Baskets", slot: "shoes", color: "#e5e7eb", rarity: "commune", source: "De départ" },
  { id: "chaussures-carbone", name: "Carbone", slot: "shoes", color: "#111827", rarity: "rare", source: "Défi Semi" },
  { id: "chaussures-feu", name: "Feu follet", slot: "shoes", color: "#ff4d00", rarity: "epique", source: "Coffre épique" },
  { id: "chaussures-holo", name: "Prisme", slot: "shoes", color: "holo", rarity: "legendaire", source: "Coffre légendaire", premium: true },

  { id: "batons", name: "Bâtons carbone", slot: "hands", color: "#cbd5e1", rarity: "rare", source: "Défi Chasseur" },
  { id: "buff", name: "Tour de cou", slot: "neck", color: "#14b8a6", rarity: "rare", source: "Coffre rare" },
]

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)

export const STARTER_ITEMS = ["tee-gris", "chaussures-base"]
export const STARTER_EQUIP: Partial<Record<Slot, string>> = { shirt: "tee-gris", shoes: "chaussures-base" }

/** Items a chest of a given rarity can drop. */
export const CHEST_DROPS: Record<Rarity, string[]> = {
  commune: ["tee-orange"],
  rare: ["tee-ocean", "buff"],
  epique: ["chaussures-feu"],
  legendaire: ["chaussures-holo", "maillot-holo"],
}

/** Evolution stages: the avatar's aura and frame grow with the level. */
export const STAGES = [
  { name: "Randonneur", aura: null },
  { name: "Coureur des sentiers", aura: "#9ae6b4" },
  { name: "Grimpeur", aura: "#4cc3ff" },
  { name: "Coureur des crêtes", aura: "#c77dff" },
  { name: "Ultra-traileur", aura: "holo" },
  { name: "Légende des cimes", aura: "gold" },
] as const
