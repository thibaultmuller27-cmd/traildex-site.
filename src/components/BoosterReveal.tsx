import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import boosterFront from "@/assets/booster-front.webp"
import { cn } from "@/lib/utils"

type Phase = "closed" | "shake" | "tear" | "rise" | "drop" | "open"

/** Zig-zag (crimped seal) edge points across the width, as clip-path percentages. */
function crimp(y: number, depth: number, dir: 1 | -1, teeth = 18) {
  const pts: string[] = []
  for (let i = 0; i <= teeth * 2; i++) pts.push(`${(i / (teeth * 2)) * 100}% ${y + (i % 2 ? dir * depth : 0)}%`)
  return pts
}
/** Ragged tear line across the width (seeded, so both halves match). */
function tear(y: number) {
  const pts: string[] = []
  for (let i = 0; i <= 24; i++) pts.push(`${(i / 24) * 100}% ${y + Math.sin(i * 2.3) * 0.9 + (i % 3 ? 0.5 : -0.6)}%`)
  return pts
}
const TEAR = 15 // % of the pack height where it tears open
const TOP_CLIP = `polygon(${[...crimp(0, 2.2, 1), ...tear(TEAR).reverse()].join(",")})`
const BODY_CLIP = `polygon(${[...tear(TEAR), ...crimp(100, 2.2, -1).reverse()].join(",")})`

/**
 * Shows a DNF Cards booster that tears open and lets the card rise out of it,
 * the first time it scrolls into view (and again on demand).
 */
export function BoosterReveal({ children, width }: { children: React.ReactNode; width: string }) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = React.useState<Phase>(reduced ? "open" : "closed")
  const ref = React.useRef<HTMLDivElement>(null)
  const timers = React.useRef<number[]>([])

  const play = React.useCallback(() => {
    timers.current.forEach(clearTimeout)
    if (reduced) return setPhase("open")
    setPhase("closed")
    const steps: [Phase, number][] = [["shake", 350], ["tear", 900], ["rise", 1250], ["drop", 2050], ["open", 2800]]
    timers.current = steps.map(([p, t]) => window.setTimeout(() => setPhase(p), t))
  }, [reduced])

  React.useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect()
        play()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => {
      io.disconnect()
      timers.current.forEach(clearTimeout)
    }
  }, [play, reduced])

  const at = (p: Phase) => ["closed", "shake", "tear", "rise", "drop", "open"].indexOf(phase) >= ["closed", "shake", "tear", "rise", "drop", "open"].indexOf(p)
  const art = { backgroundImage: `url(${boosterFront})`, backgroundSize: "100% 100%" }
  const packW = `calc(${width} * 1.12)`

  return (
    <div ref={ref} className="relative flex flex-col items-center" style={{ width }}>
      {/* the card, hidden inside the pack until it rises out */}
      <motion.div
        className={cn("relative w-full", !at("drop") && "[&_button]:invisible")}
        style={{ zIndex: at("drop") ? 30 : 10 }}
        initial={false}
        animate={
          at("drop") ? { y: "0%", scale: 1, opacity: 1 } : at("rise") ? { y: "-62%", scale: 1, opacity: 1 } : { y: "6%", scale: 0.94, opacity: 1 }
        }
        transition={at("drop") ? { type: "spring", stiffness: 140, damping: 16 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>

      {phase !== "open" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-3%] z-20 aspect-[75/100]"
          style={{ width: packW, x: "-50%", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}
          animate={phase === "shake" ? { rotate: [0, -2.5, 2.5, -2, 2, 0], scale: [1, 1.03, 1] } : { rotate: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* body */}
          <motion.div
            className="absolute inset-0"
            style={{ ...art, clipPath: BODY_CLIP }}
            animate={at("drop") ? { y: "70%", opacity: 0, rotate: 6 } : { y: "0%", opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.55, 0, 0.75, 0.2] }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.35)_45%,transparent_55%)]" />
          </motion.div>
          {/* top strip, torn off */}
          <motion.div
            className="absolute inset-0"
            style={{ ...art, clipPath: TOP_CLIP, transformOrigin: "85% 10%" }}
            animate={at("tear") ? { y: "-45%", x: "35%", rotate: 28, opacity: 0 } : { y: "0%", x: "0%", rotate: 0, opacity: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* burst of light where it tears */}
          <motion.div
            className="absolute left-1/2 top-[12%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,220,.95),rgba(198,229,54,.4)_40%,transparent_70%)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={at("tear") && !at("drop") ? { scale: 3, opacity: [0, 1, 0.6] } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>
      )}

      {phase === "open" && !reduced && (
        <button
          type="button"
          onClick={play}
          className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Rouvrir le booster
        </button>
      )}
    </div>
  )
}
