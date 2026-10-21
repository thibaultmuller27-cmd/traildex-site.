import * as React from "react"
import { Check, Crown, Sparkles } from "lucide-react"
import { formatPrice } from "@/lib/config"
import { cn } from "@/lib/utils"
import { PARTNER_CONTACT, PLANS, STRIPE, TRIAL_DAYS } from "@/game/config"

type Billing = "monthly" | "yearly"

/** Sends the visitor to the Stripe Payment Link, or starts the local trial when none is set. */
export function subscribe(billing: Billing, onTrial?: () => void) {
  const link = STRIPE[billing]
  if (link) {
    window.location.href = link
    return
  }
  if (onTrial) onTrial()
  else window.location.href = "/jeu/?essai=1"
}

export function PricingCards({ onTrial, premium, compact }: { onTrial?: () => void; premium?: boolean; compact?: boolean }) {
  const [billing, setBilling] = React.useState<Billing>("yearly")
  const p = PLANS.premium
  const price = billing === "monthly" ? p.monthly : p.yearly / 12
  const saving = Math.round((1 - p.yearly / (p.monthly * 12)) * 100)

  return (
    <div>
      <div className="mx-auto flex w-fit rounded-full bg-white/10 p-1 text-[13px] font-medium ring-1 ring-white/15">
        {(["monthly", "yearly"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={cn("rounded-full px-4 py-1.5 transition-colors", billing === b ? "bg-white text-[#0c0b1d]" : "text-white/70 hover:text-white")}
          >
            {b === "monthly" ? "Mensuel" : `Annuel · -${saving} %`}
          </button>
        ))}
      </div>

      <div className={cn("mt-8 grid gap-5", compact ? "" : "md:grid-cols-2")}>
        <article className="rounded-[28px] bg-white/[0.06] p-7 ring-1 ring-white/10">
          <p className="text-[15px] font-semibold text-white/70">{PLANS.free.name}</p>
          <p className="mt-2 text-[44px] font-semibold leading-none tracking-tight">Gratuit</p>
          <p className="mt-3 text-[15px] text-white/60">{PLANS.free.tagline}</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            {PLANS.free.perks.map((x) => (
              <li key={x} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8cffb0]" /> {x}
              </li>
            ))}
          </ul>
          <a href="/jeu/" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white/10 text-[15px] font-medium ring-1 ring-white/20 transition hover:bg-white/15">
            Jouer gratuitement
          </a>
        </article>

        <article className="holo-border holo-sheen rounded-[28px] bg-gradient-to-br from-[#2a1a4a] via-[#151233] to-[#0c1f33] p-7 shadow-[0_30px_80px_-30px_rgba(199,116,232,.6)]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Crown className="h-4 w-4 text-[#ffcf5a]" /> <span className="text-gradient-holo">{p.name}</span>
            </p>
            <span className="holo-bg rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0c0b1d]">Populaire</span>
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-[44px] font-semibold leading-none tracking-tight">{formatPrice(price)}</span>
            <span className="text-white/60">/ mois</span>
          </p>
          <p className="mt-1 text-[13px] text-white/50">
            {billing === "yearly" ? `Soit ${formatPrice(p.yearly)} facturés par an` : "Sans engagement, résiliable en un clic"}
          </p>
          <p className="mt-3 text-[15px] text-white/70">{p.tagline}</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            {p.perks.map((x) => (
              <li key={x} className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#ffcf5a]" /> {x}
              </li>
            ))}
          </ul>
          {premium ? (
            <div className="mt-8 space-y-2 text-center">
              <p className="rounded-full bg-white/10 py-3 text-[15px] font-medium">Tu es Traileur+ ✦</p>
              {STRIPE.portal && (
                <a href={STRIPE.portal} className="text-[13px] text-white/60 underline-offset-4 hover:underline">
                  Gérer mon abonnement
                </a>
              )}
            </div>
          ) : (
            <button
              onClick={() => subscribe(billing, onTrial)}
              className="holo-bg mt-8 inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold text-[#0c0b1d] shadow-[0_10px_30px_-10px_rgba(255,106,213,.8)] transition active:scale-[0.98]"
            >
              {STRIPE[billing] ? "S'abonner" : `Essai gratuit ${TRIAL_DAYS} jours`}
            </button>
          )}
          <p className="mt-3 text-center text-[12px] text-white/40">Paiement sécurisé par Stripe · Carte, Apple Pay, Google Pay</p>
        </article>
      </div>
    </div>
  )
}

export function Pricing() {
  return (
    <section id="abonnement" className="relative overflow-hidden bg-[#0c0b1d] px-5 py-24 text-white md:py-36">
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#c774e8]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#94d0ff]/25 blur-[120px]" />
      <div className="relative mx-auto max-w-4xl">
        <p className="eyebrow text-center text-[#94d0ff]">Abonnement</p>
        <h2 className="headline mx-auto mt-3 max-w-3xl text-center text-[40px] sm:text-6xl">
          Les plus beaux trésors
          <br />
          <span className="text-gradient-holo">sont pour les Traileurs+.</span>
        </h2>
        <div className="mt-14">
          <PricingCards />
        </div>
        <p className="mt-10 text-center text-[14px] text-white/50">
          Une marque de trail ?{" "}
          <a href={PARTNER_CONTACT} className="text-white underline-offset-4 hover:underline">
            Sponsorise des coffres sur la carte
          </a>{" "}
          et offre tes codes aux coureurs qui passent près de chez toi.
        </p>
      </div>
    </section>
  )
}
