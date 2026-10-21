import { ChevronRight } from "lucide-react"
import { CardScrollHero } from "@/components/ui/card-scroll-hero"
import { TrailCard } from "@/components/TrailCard"
import { buttonClass } from "@/components/ui/button"
import { HERO_CARD } from "@/lib/demo"

export function Hero() {
  return (
    <div id="top" className="bg-white">
      <CardScrollHero
        className="h-[175svh] md:h-[190vh]"
        titleComponent={
          <>
            <p className="eyebrow text-muted">Cartes de collection pour traileurs</p>
            <h1 className="headline mx-auto mt-4 max-w-4xl text-[44px] sm:text-6xl md:text-7xl lg:text-[88px]">
              Ta course mérite d'être <span className="text-gradient-holo">collectionnée.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted md:text-[21px]">
              Importe ton GPX, regarde ta carte se créer en direct, et reçois-la chez toi.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <a href="#createur" className={buttonClass("primary", "lg")}>
                Créer ma carte
              </a>
              <a href="#galerie" className="inline-flex items-center gap-1 text-[17px] text-[#0066cc] hover:underline">
                Voir la galerie <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </>
        }
      >
        <TrailCard card={HERO_CARD} spin width="clamp(240px, 70vw, 360px)" />
      </CardScrollHero>
    </div>
  )
}
