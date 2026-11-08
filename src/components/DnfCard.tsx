import * as React from "react"
import { RotateCw } from "lucide-react"
import type { CardData } from "@/lib/card"
import { fmtInt, fmtKm } from "@/lib/card"
import { profilePoints } from "@/lib/replay"
import { drawDnfCard, type DnfDrawData } from "@/lib/dnfCard/engine"
import { SITE_QR } from "@/lib/dnfCard/qr"
import { reliefGrid } from "@/lib/dnfCard/relief"
import { cn } from "@/lib/utils"

const MONTHS = ["JANV.", "FÉVR.", "MARS", "AVRIL", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."]

/** "M x y L x y…" (0–100 space) → points. */
function pathPoints(d: string): [number, number][] {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const pts: [number, number][] = []
  for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]])
  return pts
}

/** Splits a race name over the two title lines of the card. */
function splitTitle(race: string): [string, string] {
  const words = race.trim().toUpperCase().split(/\s+/).filter(Boolean)
  if (!words.length) return ["NOM DE TA", "COURSE"]
  if (words.length === 1) return [words[0], ""]
  let best = 1, bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length)
    if (diff < bestDiff) { best = i; bestDiff = diff }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")]
}

function chrono(sec: number | null) {
  if (!sec) return "—"
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60)
  return h ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`
}

export function cardDrawData(card: CardData): DnfDrawData {
  const disc: DnfDrawData["discipline"] = card.discipline === "running" ? "run" : card.discipline === "velo" ? "bike" : "trail"
  const [title1, title2] = splitTitle(card.race)
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(card.date)
  const dateTxt = date ? `${+date[3]} ${MONTHS[+date[2] - 1]} ${date[1]}` : "DATE DE LA COURSE"
  const km = card.distanceKm
  const extra = disc === "run" ? (km ? `${fmtKm(km)} KM` : "") : card.maxEle ? `ALT. MAX ${fmtInt(card.maxEle)} M` : ""
  const pace = km && card.timeSec ? card.timeSec / km : null
  const second: [string, string] =
    disc === "run"
      ? ["ALLURE", pace ? `${Math.floor(pace / 60)}'${String(Math.round(pace % 60)).padStart(2, "0")}/km` : "—"]
      : ["D+", card.gain != null ? `${fmtInt(card.gain)} m` : "—"]
  const first: [string, string] = ["DIST.", km ? `${fmtKm(km)} km` : "—"]
  const third: [string, string] = ["CHRONO", chrono(card.timeSec)]
  return {
    discipline: disc,
    title1,
    title2,
    dateLine: [dateTxt, extra].filter(Boolean).join(" · "),
    kmLine: km ? `${fmtKm(km)} KM DE BONHEUR` : "TON PARCOURS ICI",
    stats: [first, second, third],
    route: pathPoints(card.routePath),
    ele: profilePoints(card.profileLine).map(([, y]) => -y),
    runner: (card.runner || "TON BLAZE").toUpperCase(),
    number: String(card.number || 1).padStart(3, "0"),
    year: date ? date[1] : String(new Date().getFullYear()),
    qr: SITE_QR,
  }
}

let fontsReady: Promise<unknown> | null = null
const loadFonts = () =>
  (fontsReady ??= Promise.all([
    document.fonts.load('40px "Luckiest Guy"'),
    document.fonts.load("800 26px Inter"),
    document.fonts.load("500 20px 'JetBrains Mono'"),
    document.fonts.load("600 20px 'JetBrains Mono'"),
  ]).catch(() => undefined))

/** The DNF Cards card, drawn live on a canvas (front, click/tap to see the back). */
export function DnfCard({ card, width = "clamp(250px, 76vw, 360px)", className, flippable = true, tilt = true }: {
  card: CardData
  width?: string
  className?: string
  flippable?: boolean
  tilt?: boolean
}) {
  const front = React.useRef<HTMLCanvasElement>(null)
  const back = React.useRef<HTMLCanvasElement>(null)
  const [flipped, setFlipped] = React.useState(false)
  const [rot, setRot] = React.useState({ x: 0, y: 0 })
  const base = React.useMemo(() => cardDrawData(card), [card])
  const [dem, setDem] = React.useState<{ N: number; grid: number[][] } | null>(null)
  const routeKey = card.routePath
  React.useEffect(() => {
    let off = false
    setDem(null)
    if (!card.geo || card.demo) return
    reliefGrid(base.route, card.geo).then((g) => !off && setDem(g)).catch(() => undefined)
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])
  const data = React.useMemo(() => ({ ...base, dem }), [base, dem])
  const key = JSON.stringify(base) + (dem ? "dem" : "")

  React.useEffect(() => {
    let cancelled = false
    const t = window.setTimeout(() => {
      loadFonts().then(() => {
        if (cancelled) return
        if (front.current) drawDnfCard(front.current, data, "front")
        if (back.current && flippable) drawDnfCard(back.current, data, "back")
      })
    }, 120)
    return () => { cancelled = true; window.clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, flippable])

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || e.pointerType !== "mouse") return
    const r = e.currentTarget.getBoundingClientRect()
    setRot({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12 })
  }
  const label = `Carte DNF Cards ${card.race || ""} de ${card.runner || "coureur"}`.trim()
  const face = "absolute inset-0 h-full w-full rounded-[3.9%] [backface-visibility:hidden]"

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div style={{ width, perspective: "1200px" }}>
        <div
          role={flippable ? "button" : "img"}
          tabIndex={flippable ? 0 : undefined}
          aria-label={flippable ? `${label}. Appuie pour retourner la carte.` : label}
          onClick={() => flippable && setFlipped((f) => !f)}
          onKeyDown={(e) => flippable && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setFlipped((f) => !f))}
          onPointerMove={onMove}
          onPointerLeave={() => setRot({ x: 0, y: 0 })}
          className={cn("relative aspect-[860/1200] w-full transition-transform duration-500 [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/60", flippable && "cursor-pointer")}
          style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y + (flipped ? 180 : 0)}deg)` }}
        >
          <canvas ref={front} width={1290} height={1800} className={cn(face, "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]")} />
          {flippable && <canvas ref={back} width={1290} height={1800} className={cn(face, "[transform:rotateY(180deg)]")} />}
        </div>
      </div>
      {flippable && (
        <button type="button" onClick={() => setFlipped((f) => !f)} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <RotateCw className="h-3.5 w-3.5" /> {flipped ? "Voir le recto" : "Voir le dos"}
        </button>
      )}
    </div>
  )
}
