/**
 * Pre-order payload, shared by the site (which sends it) and the server
 * function (which validates it and writes it to Airtable).
 */
import type { CardData, Finish } from "./card"
import { FINISHES, RARITIES } from "./config"

export type PreorderPayload = {
  name: string
  email: string
  address: string
  zip: string
  city: string
  qty: number
  finish: Finish
  /** The card; its `photo` is a small copy for the print files. */
  card: CardData
  photo?: string
  /** Honeypot, must stay empty. */
  website?: string
}

export function validatePreorder(p: PreorderPayload): string[] {
  const errors: string[] = []
  const str = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max
  if (!str(p.name, 120)) errors.push("Indique ton nom.")
  if (typeof p.email !== "string" || !/^\S+@\S+\.\S+$/.test(p.email) || p.email.length > 200) errors.push("Adresse e-mail invalide.")
  if (!str(p.address, 300)) errors.push("Indique ton adresse.")
  if (typeof p.zip !== "string" || !/^\d{4,5}$/.test(p.zip.trim())) errors.push("Code postal invalide.")
  if (!str(p.city, 120)) errors.push("Indique ta ville.")
  if (!Number.isInteger(p.qty) || p.qty < 1 || p.qty > 10) errors.push("Quantité invalide.")
  if (!FINISHES.some((f) => f.id === p.finish)) errors.push("Finition invalide.")
  if (!p.card || !str(p.card.race, 80) || !str(p.card.runner, 40)) errors.push("Carte incomplète.")
  return errors
}

/** Airtable fields, keyed by field ID so renaming a column does not break it. */
export function buildRecord(p: PreorderPayload, reference: string) {
  const finish = FINISHES.find((f) => f.id === p.finish)!
  const c = p.card
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined)
  const fields: Record<string, unknown> = {
    fldBRi9Hum4zit6bf: reference,
    fldxhycISmd6YgN8r: "Nouvelle",
    fldpT4fx3BNABdFp2: p.name.trim(),
    fldHYENdjk7LkIV4v: p.email.trim(),
    fld0qn0xPhVSaARa1: p.address.trim(),
    fldoV4GqXtI4dxxeu: p.zip.trim(),
    fld5Z9FGnb9cGfKmT: p.city.trim(),
    fldWMhuPnHRBth2w0: c.runner,
    fldXE7btBUreMej8C: c.race,
    fldwzwqEen6Qy6Gh8: /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? c.date : undefined,
    fldhP1zHfjbSsIZQn: num(c.distanceKm) != null ? Math.round(c.distanceKm! * 10) / 10 : undefined,
    fldgvMpf0mp2wnsH4: num(c.gain) != null ? Math.round(c.gain!) : undefined,
    fldRLZMwXWMA7Iqca: num(c.maxEle) != null ? Math.round(c.maxEle!) : undefined,
    fldzPwkQdAG7jURjd: num(c.timeSec),
    fldLft2IvBMgnwb1Q: c.rank || undefined,
    fldPLZzZROMmMo87i: finish.name,
    fldD6lMsCuyeVPCZF: RARITIES[c.rarity]?.label,
    fldTFShF8TH62DVyK: num(c.number),
    fld3PaJa365DVv4SK: p.qty,
    // Price is taken from the server-side table, never from the browser.
    fldS8C6HkZ5ZqoK5B: finish.price,
    // Airtable long text holds 100 000 characters: drop the photo copy if it would not fit.
    fld1aonT4lBn1QhtB: JSON.stringify(c).length < 95_000 ? JSON.stringify(c) : JSON.stringify({ ...c, photo: undefined }),
  }
  for (const k of Object.keys(fields)) if (fields[k] === undefined) delete fields[k]
  return fields
}
