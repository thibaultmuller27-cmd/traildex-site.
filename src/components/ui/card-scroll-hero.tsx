import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * CardScrollHero — adapted from the 21st.dev "Phone Scroll Hero" by
 * @ruixen.ui (https://21st.dev/@ruixen.ui/components/phone-scroll-hero).
 *
 * The phone mockup is replaced by any object (here, the 3D trading card).
 * It starts tilted back, straightens as the section scrolls through and
 * climbs over the headline. Honours prefers-reduced-motion.
 */
export interface CardScrollHeroProps {
  titleComponent: React.ReactNode
  children: React.ReactNode
  /** How far the object climbs into the title, as a share of its own height. */
  overlap?: number
  /** Backward tilt at the start of the scroll, in deg. */
  tilt?: number
  className?: string
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

export function CardScrollHero({ titleComponent, children, overlap = 14, tilt = 24, className }: CardScrollHeroProps) {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = React.useRef<HTMLElement>(null)
  const progress = useMotionValue(0)

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion) return
    const el = sectionRef.current
    if (!el) return
    const win = el.ownerDocument.defaultView ?? window
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const travel = Math.max(1, rect.height - win.innerHeight)
      progress.set(Math.min(1, Math.max(0, -rect.top / travel)))
    }
    const onScroll = () => {
      if (!raf) raf = win.requestAnimationFrame(update)
    }
    update()
    win.addEventListener("scroll", onScroll, { passive: true })
    win.addEventListener("resize", onScroll)
    return () => {
      win.removeEventListener("scroll", onScroll)
      win.removeEventListener("resize", onScroll)
      if (raf) win.cancelAnimationFrame(raf)
    }
  }, [prefersReducedMotion, progress])

  const rotateX = useTransform(progress, [0, 1], [tilt, 0])
  const scale = useTransform(progress, [0, 1], [0.9, 1.06])
  const titleY = useTransform(progress, [0, 1], [0, -40])
  const titleOpacity = useTransform(progress, [0, 0.7, 1], [1, 0.9, 0.35])
  const cardY = useTransform(progress, [0, 1], ["0%", `-${overlap}%`])
  const still = Boolean(prefersReducedMotion)

  return (
    <section
      ref={sectionRef}
      aria-label="Accueil"
      className={cn("relative w-full", className)}
    >
      <div className="sticky top-0 flex min-h-[100svh] items-start justify-center overflow-hidden pt-24 md:pt-28">
        <div className="w-full" style={{ perspective: "1200px" }}>
          <motion.div
            style={{ y: still ? 0 : titleY, opacity: still ? 1 : titleOpacity }}
            className="relative z-0 mx-auto max-w-5xl px-5 text-center"
          >
            {titleComponent}
          </motion.div>
          <motion.div
            style={{ y: still ? 0 : cardY, rotateX: still ? 0 : rotateX, scale: still ? 1 : scale }}
            className="relative z-10 mt-8 flex justify-center md:mt-10"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default CardScrollHero
