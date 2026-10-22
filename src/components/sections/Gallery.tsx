import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { TrailCard } from "@/components/TrailCard"
import { FadeIn } from "@/components/FadeIn"
import { DEMO_CARDS } from "@/lib/demo"
import { RARITIES } from "@/lib/config"
import { fmtInt, fmtKm, type Rarity } from "@/lib/card"
import { cn } from "@/lib/utils"

const ORDER: Rarity[] = ["rare", "epique", "legendaire"]

export function Gallery() {
  const [filter, setFilter] = React.useState<Rarity | "all">("all")
  const cards = DEMO_CARDS.filter((c) => filter === "all" || c.rarity === filter).sort(
    (a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity),
  )

  return (
    <section id="galerie" className="overflow-hidden bg-black px-5 py-24 text-white md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <p className="eyebrow text-white/50">Galerie</p>
          <h2 className="headline mx-auto mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            Trois raretés.
            <br />
            <span className="text-gradient-holo">Une seule légende.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/60 md:text-[19px]">
            Passe la souris sur les cartes, ou touche-les. Clique pour voir le verso.
          </p>
        </FadeIn>

        <div className="no-scrollbar -mx-5 mt-12 flex justify-start gap-2 overflow-x-auto px-5 sm:justify-center">
          {(["all", ...ORDER] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
                filter === r ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15",
              )}
            >
              {r !== "all" && <span className="h-2 w-2 rounded-full" style={{ background: RARITIES[r].color }} />}
              {r === "all" ? "Toutes" : RARITIES[r].label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {filter !== "all" && (
            <motion.p
              key={filter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 text-center text-[15px] text-white/60"
            >
              {RARITIES[filter].description}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[12vw] pb-10 pt-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {cards.map((c) => (
            <motion.div
              layout
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex shrink-0 snap-center flex-col items-center"
            >
              <TrailCard card={c} width="min(76vw, 270px)" />
              <div className="mt-6 text-center">
                <p className="flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: RARITIES[c.rarity].color }}>
                  {RARITIES[c.rarity].label}
                </p>
                <p className="mt-1 text-[17px] font-semibold">{c.race}</p>
                <p className="text-[14px] text-white/50">
                  {fmtKm(c.distanceKm)} km · {fmtInt(c.gain ?? 0)} m D+
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
