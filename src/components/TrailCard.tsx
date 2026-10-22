import * as React from "react"
import { HoloCard, type FoilFinish } from "@/components/ui/holo-card"
import {
  effortKm,
  fmtDate,
  fmtDuration,
  fmtInt,
  fmtKm,
  fmtPace,
  fmtRank,
  parseRank,
  type CardData,
  type Rarity,
} from "@/lib/card"
import { RARITIES } from "@/lib/config"
import { cn, seeded } from "@/lib/utils"

type Theme = {
  bg: string
  ink: string
  sub: string
  line: string
  panel: string
  route: string
  routeGlow: string
  profile: string
  pill: string
  pillInk: string
  foil: FoilFinish | null
  foilOpacity: number
  backBg: string
}

export const THEMES: Record<Rarity, Theme> = {
  rare: {
    bg: "radial-gradient(120% 80% at 20% 0%,#1d4f86 0%,#0b2546 45%,#061325 100%)",
    ink: "#ffffff",
    sub: "rgba(220,235,255,0.65)",
    line: "rgba(180,215,255,0.22)",
    panel: "rgba(140,190,255,0.08)",
    route: "#7fe3ff",
    routeGlow: "rgba(127,227,255,0.55)",
    profile: "#7fe3ff",
    pill: "rgba(255,255,255,0.14)",
    pillInk: "#ffffff",
    foil: "silver",
    foilOpacity: 0.55,
    backBg: "radial-gradient(120% 90% at 50% 10%,#174476,#081a33 60%,#040b17)",
  },
  epique: {
    bg: "radial-gradient(120% 80% at 80% 0%,#6a1f9a 0%,#2a0d4f 45%,#12062a 100%)",
    ink: "#ffffff",
    sub: "rgba(240,220,255,0.68)",
    line: "rgba(230,190,255,0.24)",
    panel: "rgba(220,160,255,0.08)",
    route: "#ff9ff0",
    routeGlow: "rgba(255,120,230,0.6)",
    profile: "#ffb8f4",
    pill: "rgba(255,255,255,0.14)",
    pillInk: "#ffffff",
    foil: "pearl",
    foilOpacity: 0.75,
    backBg: "radial-gradient(120% 90% at 50% 10%,#4a1675,#1b0838 60%,#0a0318)",
  },
  legendaire: {
    bg: "radial-gradient(120% 80% at 50% 0%,#3a2a0c 0%,#15100a 50%,#050403 100%)",
    ink: "#fff3d1",
    sub: "rgba(255,230,170,0.62)",
    line: "rgba(240,200,110,0.32)",
    panel: "rgba(240,200,110,0.07)",
    route: "#ffd877",
    routeGlow: "rgba(255,200,90,0.6)",
    profile: "#f3c35f",
    pill: "linear-gradient(135deg,#f9e3a3,#c99332)",
    pillInk: "#2a1d05",
    foil: "gold",
    foilOpacity: 0.7,
    backBg: "radial-gradient(120% 90% at 50% 10%,#33250b,#120d06 60%,#000)",
  },
}

/** Topographic contour lines, seeded so each card has its own terrain. */
export function TopoLines({ seed, color, className }: { seed: number; color: string; className?: string }) {
  const paths = React.useMemo(() => {
    const rnd = seeded(seed)
    const centers = [0, 1].map(() => [20 + rnd() * 60, 20 + rnd() * 60])
    const out: string[] = []
    const ph = Array.from({ length: 4 }, () => rnd() * 6.28)
    for (const [cx, cy] of centers) {
      for (let r = 6; r < 70; r += 6.5) {
        let d = ""
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2
          const k = 1 + 0.18 * Math.sin(3 * a + ph[0] + r * 0.05) + 0.1 * Math.cos(5 * a + ph[1])
          d += (i ? "L" : "M") + (cx + Math.cos(a) * r * k).toFixed(1) + " " + (cy + Math.sin(a) * r * k * 0.8).toFixed(1)
        }
        out.push(d + "Z")
      }
    }
    return out
  }, [seed])
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={0.35} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

function Gems({ rarity, color }: { rarity: Rarity; color: string }) {
  const n = RARITIES[rarity].gems
  return (
    <span className="inline-flex gap-[0.6cqw]" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <svg key={i} viewBox="0 0 10 10" style={{ width: "2.2cqw", height: "2.2cqw", opacity: i < n ? 1 : 0.28 }}>
          <path d="M5 0L10 5L5 10L0 5Z" fill={color} />
        </svg>
      ))}
    </span>
  )
}

function hashSeed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export type TrailCardProps = {
  card: CardData
  width?: string
  spin?: boolean
  idle?: boolean
  webgl?: boolean
  flippable?: boolean
  className?: string
  /** Placeholder mode for the creator before a GPX is loaded. */
  placeholder?: boolean
}

export function TrailCard({ card, width, spin, idle = true, webgl = false, flippable = true, className, placeholder }: TrailCardProps) {
  const theme = THEMES[card.rarity]
  return (
    <HoloCard
      width={width}
      spin={spin}
      idle={idle}
      webgl={webgl}
      flippable={flippable}
      className={className}
      finish={theme.foil}
      foilOpacity={theme.foilOpacity}
      label={`Carte ${card.race || "TrailDex"} de ${card.runner || "coureur"}`}
      front={<CardFront card={card} theme={theme} placeholder={placeholder} />}
      back={<CardBack card={card} theme={theme} />}
    />
  )
}

function Stat({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div className="min-w-0">
      <div className="font-mono uppercase" style={{ fontSize: "2.1cqw", letterSpacing: "0.14em", color: theme.sub }}>
        {label}
      </div>
      <div className="truncate font-bold tabular-nums" style={{ fontSize: "4.6cqw", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  )
}

function Wordmark({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-[1cqw] font-bold" style={{ fontSize: "2.8cqw", letterSpacing: "0.22em", color }}>
      <svg viewBox="0 0 16 16" style={{ width: "3.2cqw", height: "3.2cqw" }} aria-hidden>
        <path d="M1.5 12.5l4.5-7 3 4.2 2-2.7 3.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      TRAILDEX
    </span>
  )
}

export function CardFront({ card, theme, placeholder, transparent }: { card: CardData; theme: Theme; placeholder?: boolean; transparent?: boolean }) {
  const seed = hashSeed(card.race + card.id)
  const gid = React.useId().replace(/:/g, "")
  const rarity = RARITIES[card.rarity]
  const rank = parseRank(card.rank)
  const podium = rank && rank.pos <= 3
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: transparent ? undefined : theme.bg, color: theme.ink, padding: "5.5cqw" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Wordmark color={theme.ink} />
        <span
          className="inline-flex items-center gap-[1.4cqw] rounded-full font-semibold uppercase"
          style={{
            background: theme.pill,
            color: theme.pillInk,
            fontSize: "2.3cqw",
            letterSpacing: "0.14em",
            padding: "0.9cqw 2.2cqw",
          }}
        >
          <Gems rarity={card.rarity} color={card.rarity === "legendaire" ? theme.pillInk : rarity.color} />
          {rarity.label}
        </span>
      </div>

      {/* Title */}
      <div style={{ marginTop: "4cqw" }}>
        <h3
          className="line-clamp-2 font-bold"
          style={{ fontSize: "7.4cqw", lineHeight: 1.02, letterSpacing: "-0.035em", opacity: placeholder && !card.race ? 0.35 : 1 }}
        >
          {card.race || "Nom de ta course"}
        </h3>
        <p className="font-mono uppercase" style={{ fontSize: "2.4cqw", letterSpacing: "0.16em", color: theme.sub, marginTop: "1.4cqw" }}>
          {fmtDate(card.date) || "Date de la course"}
          {card.maxEle != null && ` · alt. ${fmtInt(card.maxEle)} m`}
        </p>
      </div>

      {/* Map window: the route, large, over the terrain. The photo lives on the back. */}
      <div
        className="relative overflow-hidden"
        style={{
          marginTop: "3.6cqw",
          flex: "1 1 auto",
          minHeight: 0,
          borderRadius: "3cqw",
          background: theme.panel,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
        }}
      >
        <TopoLines seed={seed} color={theme.line} />
        {card.routePath && (
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <filter id={`glow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>
            <path
              d={card.routePath}
              fill="none"
              stroke={theme.routeGlow}
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${gid})`}
              opacity={placeholder ? 0.3 : 1}
            />
            <path
              d={card.routePath}
              fill="none"
              stroke={theme.route}
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={placeholder ? "2 2.5" : undefined}
              opacity={placeholder ? 0.45 : 1}
            />
            {!placeholder && card.start && (
              <circle cx={card.start[0]} cy={card.start[1]} r={2} fill={theme.ink} stroke={theme.route} strokeWidth={0.8} />
            )}
            {!placeholder && card.end && (
              <rect x={card.end[0] - 1.8} y={card.end[1] - 1.8} width={3.6} height={3.6} fill={theme.route} transform={`rotate(45 ${card.end[0]} ${card.end[1]})`} />
            )}
          </svg>
        )}
        <span
          className="absolute font-mono"
          style={{ right: "2.6cqw", top: "2cqw", fontSize: "2.2cqw", letterSpacing: "0.1em", color: theme.sub }}
        >
          N ↑
        </span>
        {podium && (
          <span
            className="absolute rounded-full font-bold uppercase"
            style={{
              left: "2.6cqw",
              top: "2.4cqw",
              fontSize: "2.1cqw",
              letterSpacing: "0.12em",
              padding: "0.6cqw 1.8cqw",
              background: "linear-gradient(135deg,#ffe8a3,#d69a2b)",
              color: "#2a1d05",
            }}
          >
            Podium
          </span>
        )}
      </div>

      {/* Elevation profile */}
      <div className="relative" style={{ height: "11cqw", marginTop: "2.6cqw" }}>
        {card.profileArea ? (
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id={`pf-${gid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={theme.profile} stopOpacity={0.45} />
                <stop offset="1" stopColor={theme.profile} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={card.profileArea} fill={`url(#pf-${gid})`} opacity={placeholder ? 0.4 : 1} />
            <path d={card.profileLine} fill="none" stroke={theme.profile} strokeWidth={1.2} vectorEffect="non-scaling-stroke" opacity={placeholder ? 0.4 : 1} />
          </svg>
        ) : (
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: theme.line }} />
        )}
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-4"
        style={{ gap: "2cqw", marginTop: "2.4cqw", paddingTop: "2.6cqw", borderTop: `1px solid ${theme.line}` }}
      >
        <Stat label="Dist." value={card.distanceKm != null ? `${fmtKm(card.distanceKm)} km` : "— km"} theme={theme} />
        <Stat label="D+" value={card.gain != null ? `${fmtInt(card.gain)} m` : "— m"} theme={theme} />
        <Stat label="Chrono" value={fmtDuration(card.timeSec).replace(" h ", "h")} theme={theme} />
        <Stat label="Class." value={fmtRank(card.rank)} theme={theme} />
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between" style={{ marginTop: "3cqw" }}>
        <span className="truncate font-semibold" style={{ fontSize: "3.6cqw", letterSpacing: "-0.01em", opacity: placeholder && !card.runner ? 0.4 : 1 }}>
          {card.runner || "Ton prénom"}
        </span>
        <span className="font-mono" style={{ fontSize: "2.3cqw", letterSpacing: "0.14em", color: theme.sub }}>
          No. {String(card.number).padStart(3, "0")}
        </span>
      </div>
    </div>
  )
}

function BackRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div className="flex items-baseline justify-between" style={{ padding: "1.6cqw 0", borderBottom: `1px solid ${theme.line}` }}>
      <span className="font-mono uppercase" style={{ fontSize: "2.3cqw", letterSpacing: "0.14em", color: theme.sub }}>
        {label}
      </span>
      <span className="font-semibold tabular-nums" style={{ fontSize: "3.4cqw" }}>
        {value}
      </span>
    </div>
  )
}

export function CardBack({ card, theme, transparent }: { card: CardData; theme: Theme; transparent?: boolean }) {
  const rank = parseRank(card.rank)
  const effort = effortKm(card.distanceKm, card.gain)
  const speed = card.timeSec && card.distanceKm ? (card.distanceKm / (card.timeSec / 3600)).toFixed(1).replace(".", ",") : "—"
  const dPerKm = card.gain && card.distanceKm ? Math.round(card.gain / card.distanceKm) : null
  const rarity = RARITIES[card.rarity]
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: transparent ? undefined : theme.backBg, color: theme.ink, padding: "6cqw" }}>
      <div className="relative flex items-center justify-between">
        <Wordmark color={theme.ink} />
        <span className="font-mono" style={{ fontSize: "2.3cqw", letterSpacing: "0.14em", color: theme.sub }}>
          No. {String(card.number).padStart(3, "0")}
        </span>
      </div>

      <div className="relative flex items-end justify-between" style={{ marginTop: card.photo ? "5cqw" : "7cqw", gap: "4cqw" }}>
        <div className="min-w-0">
          <p className="font-mono uppercase" style={{ fontSize: "2.4cqw", letterSpacing: "0.18em", color: theme.sub }}>
            Fiche de course
          </p>
          <p className="font-bold" style={{ fontSize: "12cqw", lineHeight: 1, letterSpacing: "-0.05em", marginTop: "1.5cqw" }}>
            {effort ? Math.round(effort) : "—"}
            <span className="block" style={{ fontSize: "3.6cqw", letterSpacing: "0", marginTop: "1cqw", color: theme.sub }}>
              km-effort
            </span>
          </p>
        </div>
        {card.photo && (
          <img
            src={card.photo}
            alt=""
            draggable={false}
            className="shrink-0 object-cover"
            style={{ width: "40cqw", height: "30cqw", borderRadius: "2.4cqw", boxShadow: `0 0 0 1px ${theme.line}` }}
          />
        )}
      </div>

      <div className="relative" style={{ marginTop: card.photo ? "4cqw" : "5cqw" }}>
        <BackRow label="Coureur" value={card.runner || "—"} theme={theme} />
        <BackRow label="Allure moyenne" value={fmtPace(card.timeSec, card.distanceKm)} theme={theme} />
        <BackRow label="Vitesse" value={speed === "—" ? "—" : `${speed} km/h`} theme={theme} />
        <BackRow label="D+ par km" value={dPerKm ? `${dPerKm} m` : "—"} theme={theme} />
        <BackRow label="Point culminant" value={card.maxEle != null ? `${fmtInt(card.maxEle)} m` : "—"} theme={theme} />
        <BackRow
          label="Classement"
          value={rank ? `${fmtRank(card.rank)}${rank.total ? ` / ${fmtInt(rank.total)}` : ""}` : "—"}
          theme={theme}
        />
      </div>

      <div className="relative mt-auto flex items-end justify-between">
        <div>
          <p className="font-mono uppercase" style={{ fontSize: "2.2cqw", letterSpacing: "0.16em", color: theme.sub }}>
            Rareté
          </p>
          <p className="font-semibold" style={{ fontSize: "3.6cqw" }}>
            {rarity.label}
          </p>
        </div>
        {/* Authenticity seal */}
        <div
          className="grid place-items-center rounded-full"
          style={{
            width: "16cqw",
            height: "16cqw",
            background: "conic-gradient(from 0deg,#ff8ad8,#ffd36e,#8cff9e,#6ee7ff,#9a8cff,#ff8ad8)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.4) inset",
          }}
        >
          <span
            className="grid place-items-center rounded-full text-center font-bold uppercase"
            style={{
              width: "12.5cqw",
              height: "12.5cqw",
              background: "rgba(10,10,10,0.82)",
              color: "#fff",
              fontSize: "1.7cqw",
              letterSpacing: "0.12em",
              lineHeight: 1.3,
            }}
          >
            Carte
            <br />
            authen-
            <br />
            tique
          </span>
        </div>
      </div>
    </div>
  )
}

export default TrailCard
