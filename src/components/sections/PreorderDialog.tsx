import * as React from "react"
import { motion } from "framer-motion"
import { Check, Loader2, Minus, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { THEMES } from "@/components/TrailCard"
import { useCollection } from "@/lib/collection"
import { FINISHES, RARITIES, formatPrice } from "@/lib/config"
import { fmtInt, fmtKm, type CardData, type Finish } from "@/lib/card"
import type { PreorderPayload } from "@/lib/preorder"

type Props = { open: boolean; onOpenChange: (o: boolean) => void; card: CardData; finish: Finish }

export function PreorderDialog({ open, onOpenChange, card, finish }: Props) {
  const { add } = useCollection()
  const [qty, setQty] = React.useState(1)
  const [done, setDone] = React.useState<string | null>(null)
  const [sending, setSending] = React.useState(false)
  const [sendError, setSendError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const f = FINISHES.find((x) => x.id === finish)!
  const theme = THEMES[card.rarity]

  React.useEffect(() => {
    if (open) {
      setDone(null)
      setErrors({})
      setSendError(null)
    }
  }, [open])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending) return
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const errs: Record<string, string> = {}
    if (!data.name?.trim()) errs.name = "Indique ton nom."
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) errs.email = "Adresse e-mail invalide."
    if (!data.address?.trim()) errs.address = "Indique ton adresse."
    if (!/^\d{4,5}$/.test((data.zip ?? "").trim())) errs.zip = "Code postal invalide."
    if (!data.city?.trim()) errs.city = "Indique ta ville."
    setErrors(errs)
    setSendError(null)
    if (Object.keys(errs).length) return

    const { photo, ...light } = card
    const payload: PreorderPayload = {
      name: data.name,
      email: data.email,
      address: data.address,
      zip: data.zip,
      city: data.city,
      website: data.website,
      qty,
      finish,
      card: light,
      photo,
    }
    setSending(true)
    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "La précommande n'a pas pu être envoyée.")
      add({ ...card, id: `c-${Date.now().toString(36)}` })
      setDone(body.reference ?? "")
    } catch (err) {
      setSendError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Connexion impossible. Vérifie ta connexion et réessaie.",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {done !== null ? (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white"
            >
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </motion.div>
            <DialogTitle className="mt-6 text-[28px] font-semibold tracking-tight">Précommande enregistrée</DialogTitle>
            <DialogDescription className="mt-2 max-w-sm text-[16px] text-muted">
              Merci ! On te recontacte par e-mail pour confirmer l'impression. Ta carte a rejoint ta collection.
              {done && (
                <span className="mt-3 block text-[14px]">
                  Référence : <strong className="font-mono text-ink">{done}</strong>
                </span>
              )}
            </DialogDescription>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#collection" onClick={() => onOpenChange(false)}>
                <Button size="lg">Voir ma collection</Button>
              </a>
              <Button size="lg" variant="secondary" onClick={() => onOpenChange(false)}>
                Créer une autre carte
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogTitle className="pr-10 text-[28px] font-semibold tracking-tight">Précommander ma carte</DialogTitle>
            <DialogDescription className="mt-1 text-[15px] text-muted">Aucun paiement maintenant. On te confirme tout par e-mail.</DialogDescription>

            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-mist p-4">
              <div className="h-[70px] w-[50px] shrink-0 rounded-md shadow ring-1 ring-black/10" style={{ background: theme.bg }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">{card.race}</p>
                <p className="text-[13px] text-muted">
                  {card.runner} · {fmtKm(card.distanceKm)} km · {card.gain != null ? fmtInt(card.gain) : "—"} m D+
                </p>
                <p className="mt-0.5 text-[13px]">
                  Finition {f.name} · <span style={{ color: RARITIES[card.rarity].color }}>{RARITIES[card.rarity].label}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" htmlFor="po-name" className="sm:col-span-2">
                <Input id="po-name" name="name" autoComplete="name" defaultValue={card.runner} />
                {errors.name && <span className="text-[13px] text-[#e30000]">{errors.name}</span>}
              </Field>
              <Field label="E-mail" htmlFor="po-email" className="sm:col-span-2">
                <Input id="po-email" name="email" type="email" autoComplete="email" inputMode="email" />
                {errors.email && <span className="text-[13px] text-[#e30000]">{errors.email}</span>}
              </Field>
              <Field label="Adresse" htmlFor="po-address" className="sm:col-span-2">
                <Input id="po-address" name="address" autoComplete="street-address" />
                {errors.address && <span className="text-[13px] text-[#e30000]">{errors.address}</span>}
              </Field>
              <Field label="Code postal" htmlFor="po-zip">
                <Input id="po-zip" name="zip" autoComplete="postal-code" inputMode="numeric" />
                {errors.zip && <span className="text-[13px] text-[#e30000]">{errors.zip}</span>}
              </Field>
              <Field label="Ville" htmlFor="po-city">
                <Input id="po-city" name="city" autoComplete="address-level2" />
                {errors.city && <span className="text-[13px] text-[#e30000]">{errors.city}</span>}
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <div>
                <p className="text-[13px] text-muted">Quantité</p>
                <div className="mt-1 flex items-center gap-3">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-mist hover:bg-line" aria-label="Moins">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-[17px] font-semibold tabular-nums">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-mist hover:bg-line" aria-label="Plus">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-muted">Total</p>
                <p className="text-[26px] font-semibold tabular-nums tracking-tight">{formatPrice(f.price * qty)}</p>
              </div>
            </div>
            {/* Honeypot for bots, hidden from people and screen readers */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            {sendError && (
              <p role="alert" className="mt-5 rounded-xl bg-[#e30000]/5 px-4 py-3 text-[14px] text-[#e30000]">
                {sendError}
              </p>
            )}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                </>
              ) : (
                "Valider ma précommande"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
