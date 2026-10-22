import * as React from "react"
import { Plus, Share2 } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { TrailCard } from "@/components/TrailCard"
import { ShareDialog } from "@/components/ShareDialog"
import { useCollection } from "@/lib/collection"
import { RARITIES } from "@/lib/config"
import { fmtInt, type CardData } from "@/lib/card"

export function Collection() {
  const { cards, reset } = useCollection()
  const [sharing, setSharing] = React.useState<CardData | null>(null)
  const totalKm = cards.reduce((s, c) => s + (c.distanceKm ?? 0), 0)
  const totalGain = cards.reduce((s, c) => s + (c.gain ?? 0), 0)

  return (
    <section id="collection" className="bg-white px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow text-[#bf5af2]">Ma collection</p>
          <h2 className="headline mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            Toutes tes courses, <span className="text-muted">réunies.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-14 grid grid-cols-3 gap-3 rounded-[28px] bg-mist p-7 md:p-9">
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
          </div>
        </FadeIn>

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
