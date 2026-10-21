import { motion } from "framer-motion"
import * as React from "react"
import { Lock, Plus, Share2 } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { TrailCard } from "@/components/TrailCard"
import { ShareDialog } from "@/components/ShareDialog"
import { useCollection } from "@/lib/collection"
import { BADGES, levelOf, xpOf } from "@/lib/progress"
import { RARITIES } from "@/lib/config"
import { fmtInt, type CardData, type Rarity } from "@/lib/card"
import { cn } from "@/lib/utils"

const ORDER: Rarity[] = ["commune", "rare", "epique", "legendaire"]

function LevelRing({ level, progress }: { level: number; progress: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="lvl" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff6ad5" />
            <stop offset="0.5" stopColor="#94d0ff" />
            <stop offset="1" stopColor="#8cffb0" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e8e8ed" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#lvl)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - progress) }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Niveau</p>
          <p className="text-[40px] font-semibold leading-none tracking-tight">{level}</p>
        </div>
      </div>
    </div>
  )
}

export function Collection() {
  const { cards, reset } = useCollection()
  const [sharing, setSharing] = React.useState<CardData | null>(null)
  const xp = xpOf(cards)
  const lvl = levelOf(xp)
  const unlocked = BADGES.filter((b) => b.test(cards))
  const totalKm = cards.reduce((s, c) => s + (c.distanceKm ?? 0), 0)
  const totalGain = cards.reduce((s, c) => s + (c.gain ?? 0), 0)

  return (
    <section id="collection" className="bg-white px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow text-[#bf5af2]">Ma collection</p>
          <h2 className="headline mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            Chaque course te fait <span className="text-muted">monter de niveau.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-6 rounded-[28px] bg-mist p-7 sm:flex-row sm:items-center md:p-9">
              <LevelRing level={lvl.level} progress={lvl.progress} />
              <div className="flex-1">
                <p className="text-[26px] font-semibold tracking-tight">{lvl.name}</p>
                <p className="mt-1 text-[15px] text-muted">
                  {fmtInt(xp)} XP{lvl.next && ` · encore ${fmtInt(lvl.next.at - xp)} XP pour « ${lvl.next.name} »`}
                </p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e8e8ed]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#ff6ad5,#94d0ff,#8cffb0)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.round(lvl.progress * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-3 text-[13px] text-muted">Commune +100 XP · Rare +250 · Épique +500 · Légendaire +1 000 · +1 XP par km-effort</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-[28px] bg-mist p-7 md:p-9">
              <div>
                <p className="text-[13px] text-muted">Cartes</p>
                <p className="text-[34px] font-semibold tracking-tight">{cards.length}</p>
              </div>
              <div>
                <p className="text-[13px] text-muted">Km cumulés</p>
                <p className="text-[34px] font-semibold tracking-tight">{fmtInt(totalKm)}</p>
              </div>
              <div>
                <p className="text-[13px] text-muted">D+ cumulé</p>
                <p className="text-[34px] font-semibold tracking-tight">{fmtInt(totalGain)}</p>
              </div>
              <div className="col-span-3 mt-2 flex flex-wrap gap-2">
                {ORDER.map((r) => (
                  <span key={r} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: RARITIES[r].color }} />
                    {RARITIES[r].label}
                    <strong className="tabular-nums">{cards.filter((c) => c.rarity === r).length}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Badges */}
        <div className="mt-16 flex items-end justify-between gap-4">
          <h3 className="text-[28px] font-semibold tracking-tight">Badges</h3>
          <p className="text-[15px] text-muted">
            {unlocked.length} / {BADGES.length} débloqués
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b, i) => {
            const on = unlocked.includes(b)
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className={cn("flex flex-col items-center rounded-3xl p-5 text-center", on ? "bg-mist" : "bg-mist/60")}
              >
                <div
                  className={cn("relative grid h-16 w-16 place-items-center rounded-full", !on && "grayscale")}
                  style={{
                    background: on ? `radial-gradient(circle at 30% 25%, #fff 0%, ${b.color} 70%)` : "#e8e8ed",
                    boxShadow: on ? `0 10px 24px -10px ${b.color}` : undefined,
                  }}
                >
                  <b.icon className={cn("h-7 w-7", on ? "text-white drop-shadow" : "text-[#b0b0b5]")} strokeWidth={1.8} />
                  {!on && (
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow">
                      <Lock className="h-3 w-3 text-muted" />
                    </span>
                  )}
                </div>
                <p className={cn("mt-3 text-[15px] font-semibold", !on && "text-muted")}>{b.name}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">{b.hint}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Cards */}
        <div className="mt-16 flex items-end justify-between gap-4">
          <h3 className="text-[28px] font-semibold tracking-tight">Mes cartes</h3>
          <button onClick={reset} className="text-[13px] text-muted hover:text-ink">
            Réinitialiser
          </button>
        </div>
        <div className="no-scrollbar -mx-5 mt-6 flex snap-x gap-6 overflow-x-auto px-5 pb-8 pt-2">
          {cards.map((c) => (
            <div key={c.id} className="flex shrink-0 snap-start flex-col items-center">
              <TrailCard card={c} width="210px" />
              <p className="mt-5 max-w-[210px] truncate text-[15px] font-semibold">{c.race}</p>
              <p className="text-[13px] text-muted">
                {RARITIES[c.rarity].label}
                {c.demo && " · exemple"}
              </p>
              <button
                onClick={() => setSharing(c)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-[#0066cc] transition-colors hover:bg-mist"
              >
                <Share2 className="h-3.5 w-3.5" /> Partager
              </button>
            </div>
          ))}
          <a
            href="#createur"
            className="flex h-[294px] w-[210px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-line text-muted transition-colors hover:border-[#a1a1a6] hover:text-ink"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-mist">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-medium">Ajouter une carte</span>
          </a>
        </div>
      </div>
      {sharing && <ShareDialog open onOpenChange={(o) => !o && setSharing(null)} card={sharing} />}
    </section>
  )
}
