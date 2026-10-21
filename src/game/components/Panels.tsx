import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy, Crown, Gift, Lock, Map as MapIcon, Sparkles, X } from "lucide-react"
import { PricingCards } from "@/components/sections/Pricing"
import { cn } from "@/lib/utils"
import { FREE_DAILY_CHESTS, PARTNERS, RARITY_STYLE, TRIAL_DAYS } from "../config"
import { CHALLENGES, DAILY, isDone } from "../lib/challenges"
import { fmtDist } from "../lib/geo"
import { ITEMS, SLOT_LABEL, STAGES, itemById, type Slot } from "../lib/items"
import { useGame, type Loot } from "../lib/state"
import { Avatar } from "./Avatar"
import { ChestIcon } from "./ChestIcon"

/* ---------- Shell ---------- */

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.section
            role="dialog"
            aria-label={title}
            className="glass holo-border fixed inset-x-2 bottom-2 z-50 flex max-h-[82dvh] flex-col rounded-[28px] sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-4 sm:max-h-none sm:w-[420px]"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            exit={{ y: "105%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <header className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div className="holo-bg h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(1, value) * 100}%` }} transition={{ duration: 0.8 }} />
    </div>
  )
}

/* ---------- Chest opening ---------- */

export function ChestReveal({ loot, onClose }: { loot: Loot | null; onClose: () => void }) {
  const [phase, setPhase] = React.useState<"shake" | "open">("shake")
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!loot) return
    setPhase("shake")
    setCopied(false)
    const t = setTimeout(() => setPhase("open"), 1100)
    return () => clearTimeout(t)
  }, [loot])
  if (!loot) return null
  const st = RARITY_STYLE[loot.rarity]
  const item = loot.item ? itemById(loot.item) : null
  const partner = loot.prize ? PARTNERS.find((p) => p.id === loot.prize!.partner) : null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#05040f]/85 p-5 backdrop-blur-md" onClick={phase === "open" ? onClose : undefined}>
      {/* Light rays */}
      <motion.div
        className="pointer-events-none absolute h-[140vmax] w-[140vmax]"
        style={{ background: `repeating-conic-gradient(from 0deg, ${st.glow} 0deg 6deg, transparent 6deg 18deg)`, maskImage: "radial-gradient(circle, #000 0%, transparent 32%)", WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 32%)" }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: phase === "open" ? 0.7 : 0.2, rotate: 360 }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.6 } }}
      />
      <div className="relative w-full max-w-sm text-center text-white" onClick={(e) => e.stopPropagation()}>
        <motion.div
          className="mx-auto w-fit"
          style={{ filter: `drop-shadow(0 0 40px ${st.glow})` }}
          animate={phase === "shake" ? { rotate: [0, -8, 8, -10, 10, -6, 6, 0], scale: [1, 1.05, 1, 1.08, 1.1] } : { scale: 0.8, y: -10 }}
          transition={{ duration: phase === "shake" ? 1.1 : 0.4 }}
        >
          <ChestIcon color={st.color} size={140} />
        </motion.div>
        <AnimatePresence>
          {phase === "open" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="eyebrow mt-4" style={{ color: st.color }}>
                Coffre {st.label}
              </p>
              <p className="mt-2 text-[44px] font-semibold tracking-tight">
                <span className="text-gradient-holo">+{loot.xp} XP</span>
              </p>
              {item && (
                <div className="glass holo-border mx-auto mt-4 flex items-center gap-3 rounded-2xl p-3 text-left">
                  <Sparkles className="h-5 w-5 shrink-0 text-[#ffcf5a]" />
                  <div>
                    <p className="text-[12px] text-white/60">Nouvel équipement</p>
                    <p className="font-semibold">{item.name}</p>
                  </div>
                </div>
              )}
              {loot.prize && partner && (
                <div className="holo-border holo-sheen mx-auto mt-4 rounded-2xl bg-gradient-to-br from-[#2a1a4a] to-[#0c1f33] p-4 text-left">
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider" style={{ color: partner.color }}>
                    <Gift className="h-4 w-4" /> {partner.name} · {partner.category}
                  </p>
                  <p className="mt-1 text-[17px] font-semibold">{loot.prize.label}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(loot.prize!.code).then(() => setCopied(true), () => {})
                    }}
                    className="mt-3 flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 font-mono text-[17px] font-semibold tracking-wider ring-1 ring-white/20"
                  >
                    {loot.prize.code}
                    {copied ? <Check className="h-4 w-4 text-[#8cffb0]" /> : <Copy className="h-4 w-4 text-white/60" />}
                  </button>
                </div>
              )}
              <button onClick={onClose} className="holo-bg mt-6 h-12 w-full rounded-full font-semibold text-[#0c0b1d]">
                Continuer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- Défis ---------- */

export function ChallengesPanel({ onUpgrade }: { onUpgrade: () => void }) {
  const { state, premium, claim, claimDaily } = useGame()
  const dailyDone = state.daily.count >= DAILY.goal
  return (
    <div className="space-y-3 pt-2">
      <div className="holo-border holo-sheen rounded-2xl bg-gradient-to-br from-[#2a1a4a] to-[#0c1f33] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-[#94d0ff]">{DAILY.name}</p>
            <p className="mt-1 font-semibold">{DAILY.hint}</p>
          </div>
          <p className="font-mono text-[13px] text-white/60">+{DAILY.xp} XP</p>
        </div>
        <Bar value={state.daily.count / DAILY.goal} className="mt-3" />
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span className="text-white/60">
            {Math.min(state.daily.count, DAILY.goal)}/{DAILY.goal} · {premium ? "coffres illimités" : `${Math.max(0, FREE_DAILY_CHESTS - state.daily.count)} coffres restants`}
          </span>
          {state.daily.claimed ? (
            <span className="text-[#8cffb0]">Récupéré ✓</span>
          ) : (
            <button disabled={!dailyDone} onClick={claimDaily} className="holo-bg rounded-full px-3 py-1 text-[12px] font-semibold text-[#0c0b1d] disabled:opacity-30">
              Récupérer
            </button>
          )}
        </div>
      </div>

      {CHALLENGES.map((c) => {
        const [cur, goal] = c.progress(state)
        const done = isDone(c, state)
        const claimed = state.claimed.includes(c.id)
        const locked = c.premium && !premium
        const item = c.item ? itemById(c.item) : null
        return (
          <div key={c.id} className={cn("rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10", claimed && "opacity-60")}>
            <div className="flex items-start gap-3">
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", done ? "holo-bg text-[#0c0b1d]" : "bg-white/10")}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {c.name}
                  {c.premium && <Crown className="h-3.5 w-3.5 text-[#ffcf5a]" />}
                </p>
                <p className="text-[13px] text-white/60">{c.hint}</p>
                <Bar value={cur / goal} className="mt-2" />
                <p className="mt-1.5 flex justify-between text-[12px] text-white/50">
                  <span>
                    {Math.min(cur, goal).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} / {goal.toLocaleString("fr-FR")}
                  </span>
                  <span>
                    +{c.xp} XP{item ? ` · ${item.name}` : ""}
                  </span>
                </p>
              </div>
            </div>
            {done && !claimed && (
              <button
                onClick={() => (locked ? onUpgrade() : claim(c.id))}
                className="holo-bg mt-3 h-10 w-full rounded-full text-[14px] font-semibold text-[#0c0b1d]"
              >
                {locked ? "Réservé aux Traileurs+" : "Récupérer la récompense"}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Avatar / vestiaire ---------- */

export function LockerPanel({ onUpgrade }: { onUpgrade: () => void }) {
  const { state, level, premium, equip } = useGame()
  const slots = Object.keys(SLOT_LABEL) as Slot[]
  return (
    <div className="pt-2">
      <div className="holo-border relative grid place-items-center overflow-hidden rounded-[24px] bg-gradient-to-b from-[#1d1640] to-[#0c1f33] py-4">
        <Avatar equipped={state.equipped} level={level.level} size={170} />
        <p className="eyebrow mt-1 text-gradient-holo">{STAGES[level.level - 1].name}</p>
        <p className="mt-1 text-[13px] text-white/60">
          Niveau {level.level} · {state.xp.toLocaleString("fr-FR")} XP
        </p>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {STAGES.map((s, i) => (
          <div key={s.name} className={cn("shrink-0 rounded-xl px-3 py-2 text-center text-[11px] ring-1", i < level.level ? "bg-white/10 ring-white/20" : "opacity-40 ring-white/10")}>
            <Avatar equipped={state.equipped} level={i + 1} size={44} animate={false} />
            <p className="mt-1 w-16 truncate">{s.name}</p>
          </div>
        ))}
      </div>

      {slots.map((slot) => {
        const items = ITEMS.filter((i) => i.slot === slot)
        return (
          <div key={slot} className="mt-5">
            <p className="text-[13px] font-semibold text-white/60">{SLOT_LABEL[slot]}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {items.map((it) => {
                const owned = state.items.includes(it.id)
                const on = state.equipped[slot] === it.id
                const needsPremium = it.premium && !premium
                return (
                  <button
                    key={it.id}
                    onClick={() => {
                      if (needsPremium) return onUpgrade()
                      if (owned) equip(slot, on && slot !== "shirt" && slot !== "shoes" ? null : it.id)
                    }}
                    className={cn(
                      "relative rounded-xl p-2 text-left text-[12px] ring-1 transition",
                      on ? "holo-border bg-white/15 ring-transparent" : "bg-white/[0.05] ring-white/10",
                      !owned && "opacity-45",
                    )}
                  >
                    <span
                      className={cn("block h-6 w-6 rounded-full ring-2 ring-white/30", it.color === "holo" && "holo-bg")}
                      style={it.color === "holo" ? undefined : { background: it.color === "gold" ? "linear-gradient(135deg,#fff3b0,#ffcf5a,#d99a1e)" : it.color }}
                    />
                    <span className="mt-1.5 block font-semibold leading-tight">{it.name}</span>
                    <span className="block text-[10px] leading-tight" style={{ color: RARITY_STYLE[it.rarity].color }}>
                      {owned ? RARITY_STYLE[it.rarity].label : it.source}
                    </span>
                    {(!owned || needsPremium) && <Lock className="absolute right-2 top-2 h-3 w-3 text-white/60" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Butin ---------- */

export function LootPanel() {
  const { state } = useGame()
  const [copied, setCopied] = React.useState<string | null>(null)
  const trails = Object.values(state.trails)
  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="text-[13px] font-semibold text-white/60">Mes codes et gains</p>
        {state.rewards.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white/[0.05] p-4 text-[14px] text-white/60 ring-1 ring-white/10">
            Ouvre des coffres <span style={{ color: RARITY_STYLE.epique.color }}>épiques</span> et{" "}
            <span style={{ color: RARITY_STYLE.legendaire.color }}>légendaires</span> pour gagner des codes promo de nos marques partenaires.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {state.rewards.map((r) => {
              const p = PARTNERS.find((x) => x.id === r.partner)
              return (
                <div key={r.id} className={cn("rounded-2xl p-4 ring-1 ring-white/10", r.rare ? "holo-border holo-sheen bg-gradient-to-br from-[#2a1a4a] to-[#0c1f33]" : "bg-white/[0.06]")}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: p?.color }}>
                    {p?.name} · {RARITY_STYLE[r.rarity].label}
                  </p>
                  <p className="mt-0.5 font-semibold">{r.label}</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText(r.code).then(() => setCopied(r.id), () => {})}
                    className="mt-2 flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 font-mono text-[15px] tracking-wider"
                  >
                    {r.code}
                    {copied === r.id ? <Check className="h-4 w-4 text-[#8cffb0]" /> : <Copy className="h-4 w-4 text-white/50" />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-white/60">Coffres ouverts</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {(Object.keys(RARITY_STYLE) as (keyof typeof RARITY_STYLE)[]).map((r) => (
            <div key={r} className="rounded-xl bg-white/[0.05] p-2 text-center ring-1 ring-white/10">
              <ChestIcon color={RARITY_STYLE[r].color} size={30} />
              <p className="text-[18px] font-semibold">{state.chests[r]}</p>
              <p className="text-[10px] text-white/50">{RARITY_STYLE[r].label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-white/60">
          Sentiers découverts · {trails.length} · {fmtDist(state.distanceM)} parcourus
        </p>
        <div className="mt-2 space-y-2">
          {trails.length === 0 && <p className="text-[14px] text-white/50">Approche-toi d'un sentier sur la carte pour le découvrir.</p>}
          {trails.map((t) => (
            <div key={t.name + t.total} className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/10">
              <MapIcon className="h-4 w-4 shrink-0 text-[#c774e8]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{t.name}</p>
                <Bar value={t.visited.length / t.total} className="mt-1.5 h-1.5" />
              </div>
              <span className="font-mono text-[12px] text-white/60">{Math.round((t.visited.length / t.total) * 100)} %</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Pass ---------- */

export function PassPanel({ reason }: { reason?: string | null }) {
  const { premium, state, activatePremium, reset } = useGame()
  return (
    <div className="pt-2">
      {reason && <p className="mb-4 rounded-2xl bg-[#ffcf5a]/10 p-3 text-[14px] text-[#ffe9a8] ring-1 ring-[#ffcf5a]/30">{reason}</p>}
      {premium && state.premiumUntil && (
        <p className="mb-4 text-[13px] text-white/60">
          Traileur+ actif jusqu'au {new Date(state.premiumUntil).toLocaleDateString("fr-FR")}.
        </p>
      )}
      <PricingCards compact premium={premium} onTrial={() => activatePremium(TRIAL_DAYS)} />
      <button
        onClick={() => confirm("Effacer toute ta progression ?") && reset()}
        className="mx-auto mt-8 block text-[12px] text-white/30 hover:text-white/60"
      >
        Réinitialiser ma partie
      </button>
    </div>
  )
}
