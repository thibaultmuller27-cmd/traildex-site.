/**
 * Business settings in one place.
 * PRICES ARE PLACEHOLDERS — replace them with the final prices.
 */
import type { Finish, Rarity } from "./card"

export const FINISHES: {
  id: Finish
  name: string
  tagline: string
  details: string
  price: number
}[] = [
  {
    id: "standard",
    name: "Standard",
    tagline: "Mat premium",
    details: "Carton 350 g, finition mate soft-touch, coins arrondis.",
    price: 9.9, // PRIX À DÉFINIR
  },
  {
    id: "holo",
    name: "Holo",
    tagline: "Film holographique",
    details: "Reflets arc-en-ciel qui bougent avec la lumière. Rare ou Épique selon ta course.",
    price: 14.9, // PRIX À DÉFINIR
  },
  {
    id: "or",
    name: "Or",
    tagline: "Légendaire",
    details: "Dorure à chaud, numérotée, livrée dans un étui rigide.",
    price: 24.9, // PRIX À DÉFINIR
  },
]

export const RARITIES: Record<
  Rarity,
  { label: string; gems: number; color: string; description: string }
> = {
  commune: {
    label: "Commune",
    gems: 1,
    color: "#8e8e93",
    description: "La carte de toutes tes sorties. Mate, sobre, élégante.",
  },
  rare: {
    label: "Rare",
    gems: 2,
    color: "#2f8cff",
    description: "Film holo argent. Pour les courses qui ont compté.",
  },
  epique: {
    label: "Épique",
    gems: 3,
    color: "#b65cff",
    description: "Holo arc-en-ciel. Pour les gros chantiers : 60 km-effort et plus.",
  },
  legendaire: {
    label: "Légendaire",
    gems: 4,
    color: "#e0a93b",
    description: "Finition or, numérotée. Pour la course d'une vie.",
  },
}

export const formatPrice = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
