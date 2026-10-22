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

/**
 * The seller, as printed on invoices. Until the business is registered
 * (no SIRET yet), invoices come out as specimens.
 */
export const COMPANY = {
  name: "Thibault Muller",
  tradeName: "TrailDex",
  legalForm: "Entrepreneur individuel (EI)",
  address: "", // ADRESSE À COMPLÉTER
  siret: "", // SIRET À COMPLÉTER après l'immatriculation
  email: "", // E-MAIL À COMPLÉTER
  vatMention: "TVA non applicable, art. 293 B du CGI",
}
