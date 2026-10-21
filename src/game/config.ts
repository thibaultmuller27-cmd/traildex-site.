/**
 * TrailDex Quest — business settings in one place.
 * Prices, Stripe links and partner codes are PLACEHOLDERS: replace them before launch.
 */
import type { Rarity } from "@/lib/card"

/* ---------- Abonnements ---------- */

/**
 * Stripe Payment Links (Stripe dashboard → Payment Links → New, type "subscription").
 * In each link, set "After payment → Redirect" to:
 *   https://<ton-domaine>/jeu/?abonnement=merci&plan=mensuel   (or plan=annuel)
 * Leave empty to use the local 7-day trial instead (demo).
 */
export const STRIPE = {
  monthly: "", // ex. "https://buy.stripe.com/xxxxxxxx"
  yearly: "", // ex. "https://buy.stripe.com/yyyyyyyy"
  /** Stripe → Settings → Billing → Customer portal → link, so subscribers can cancel. */
  portal: "",
}

export const PLANS = {
  free: {
    name: "Explorateur",
    price: 0,
    tagline: "Pour découvrir les sentiers autour de toi.",
    perks: [
      "Carte interactive et sentiers réels",
      `5 coffres par jour`,
      "Coffres communs, rares et épiques",
      "10 défis et évolutions d'avatar",
    ],
  },
  premium: {
    name: "Traileur+",
    monthly: 4.99, // PRIX À DÉFINIR
    yearly: 39.0, // PRIX À DÉFINIR
    tagline: "Pour chasser les gains rares des marques partenaires.",
    perks: [
      "Coffres illimités",
      "Coffres légendaires : gains rares et codes -30 %",
      "XP ×2 sur chaque coffre",
      "Skins holographiques exclusifs",
      "Défi Légende et tirages au sort mensuels",
    ],
  },
} as const

export const FREE_DAILY_CHESTS = 5
export const PREMIUM_XP_MULTIPLIER = 2
export const TRIAL_DAYS = 7

/** Brands that want to sponsor chests on the map — a second revenue stream. */
export const PARTNER_CONTACT = "mailto:contact@traildex.fr?subject=Sponsoriser%20des%20coffres%20TrailDex%20Quest"

/* ---------- Gameplay ---------- */

/** You must be this close (meters) to open a chest or mark a trail point as visited. */
export const REACH_M = 35
/** Demo mode: tap the map to walk there. Turn off to require real GPS for rewards. */
export const ALLOW_SIMULATION = true
/** Simulated running speed, m/s (sped up so the demo stays fun). */
export const SIM_SPEED = 28
/** Map start when geolocation is refused: Chamonix. */
export const DEFAULT_CENTER: [number, number] = [6.8694, 45.9237]

export const CHEST_ODDS: [Rarity, number][] = [
  ["commune", 0.58],
  ["rare", 0.26],
  ["epique", 0.12],
  ["legendaire", 0.04],
]

export const CHEST_XP: Record<Rarity, number> = { commune: 50, rare: 150, epique: 400, legendaire: 1000 }

export const RARITY_STYLE: Record<Rarity, { label: string; color: string; glow: string }> = {
  commune: { label: "Commun", color: "#c7ccd6", glow: "rgba(199,204,214,.55)" },
  rare: { label: "Rare", color: "#4cc3ff", glow: "rgba(76,195,255,.6)" },
  epique: { label: "Épique", color: "#c77dff", glow: "rgba(199,125,255,.65)" },
  legendaire: { label: "Légendaire", color: "#ffcf5a", glow: "rgba(255,207,90,.75)" },
}

/* ---------- Partenaires ----------
 * EXEMPLES FICTIFS : remplace-les par les marques avec qui tu signes.
 * En production, les codes doivent être uniques et délivrés par un serveur
 * (sinon ils sont lisibles dans le code du site).
 */
export type Partner = { id: string; name: string; category: string; color: string }

export const PARTNERS: Partner[] = [
  { id: "altitude", name: "Altitude Lab", category: "Chaussures", color: "#ff6a3d" },
  { id: "crete", name: "Crête Nutrition", category: "Nutrition", color: "#34d399" },
  { id: "lumen", name: "Lumen", category: "Frontales", color: "#facc15" },
  { id: "sommet", name: "Sommet Gear", category: "Textile", color: "#60a5fa" },
]

export type Prize = { partner: string; label: string; code: string; rare?: boolean }

export const PRIZES: Record<"epique" | "legendaire", Prize[]> = {
  epique: [
    { partner: "altitude", label: "-15 % sur les chaussures trail", code: "TDXALT15" },
    { partner: "crete", label: "-20 % sur les gels et barres", code: "TDXCRETE20" },
    { partner: "lumen", label: "-15 % sur les frontales", code: "TDXLUMEN15" },
    { partner: "sommet", label: "Livraison offerte + -10 %", code: "TDXSOM10" },
  ],
  legendaire: [
    { partner: "altitude", label: "-30 % sur toute la boutique", code: "TDXALT30", rare: true },
    { partner: "lumen", label: "Frontale 1 200 lm offerte (tirage au sort)", code: "TDXLUMENWIN", rare: true },
    { partner: "sommet", label: "Veste imperméable offerte (tirage au sort)", code: "TDXSOMWIN", rare: true },
    { partner: "crete", label: "Un mois de nutrition offert", code: "TDXCRETEMOIS", rare: true },
  ],
}
