import { ChevronRight } from "lucide-react"
import { CardScrollHero } from "@/components/ui/card-scroll-hero"
import { DnfCard } from "@/components/DnfCard"
import { BoosterReveal } from "@/components/BoosterReveal"
import { buttonClass } from "@/components/ui/button"
import { HERO_CARD } from "@/lib/demo"

export function Hero() {
  return (
    <div id="top" className="bg-night">
      <CardScrollHero
        className="h-[175svh] md:h-[190vh]"
        titleComponent={
          <>
            <p className="eyebrow text-mint">Cartes de collection · Trail · Running · Vélo</p>
            <h1 className="headline mx-auto mt-4 max-w-4xl text-[44px] sm:text-6xl md:text-7xl lg:text-[88px]">
              T'as fini ? Ça mérite <span className="text-gradient-dnf">une carte.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted md:text-[21px]">
              Trail, running ou vélo : choisis ta discipline, ton blaze, glisse ton GPX… et repars avec une carte holo plus brillante que ta frontale à 3 h du mat'.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <a href="#createur" className={buttonClass("primary", "lg")}>
                Je veux ma carte
              </a>
              <a href="#comment" className="inline-flex items-center gap-1 text-[17px] text-mint hover:underline">
                Comment ça marche <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </>
        }
      >
        <BoosterReveal width="clamp(240px, 70vw, 360px)">
          <DnfCard card={{ ...HERO_CARD, discipline: "trail", runner: HERO_CARD.runner || "Camille" }} width="100%" />
        </BoosterReveal>
      </CardScrollHero>
    </div>
  )
}
