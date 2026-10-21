import * as React from "react"
import { itemById, STAGES, type Slot } from "../lib/items"

type Props = {
  equipped: Partial<Record<Slot, string>>
  /** 1-based level, drives the aura (evolution stage). */
  level: number
  size?: number
  className?: string
  /** Gentle bobbing, off for tiny map markers if needed. */
  animate?: boolean
}

const SKIN = "#f2c6a0"
const SKIN_SHADE = "#e0a982"

/**
 * Chibi trail runner drawn in SVG. Every equipped item is a layer, and the
 * stage aura (none → green → blue → purple → holo → gold) shows evolution.
 */
export function Avatar({ equipped, level, size = 160, className, animate = true }: Props) {
  const uid = React.useId().replace(/:/g, "")
  const stage = STAGES[Math.min(level, STAGES.length) - 1]
  const fill = (slot: Slot, fallback: string) => {
    const c = itemById(equipped[slot] ?? "")?.color ?? fallback
    return c === "holo" ? `url(#holo-${uid})` : c === "gold" ? `url(#gold-${uid})` : c
  }
  const has = (slot: Slot, id?: string) => (id ? equipped[slot] === id : !!equipped[slot])
  const shirt = fill("shirt", "#9aa3b2")
  const shoes = fill("shoes", "#e5e7eb")
  const aura = stage.aura === "holo" ? `url(#auraHolo-${uid})` : stage.aura === "gold" ? `url(#auraGold-${uid})` : stage.aura

  return (
    <svg viewBox="0 0 120 150" width={size} height={size * 1.25} className={className} aria-label={`Avatar ${stage.name}`}>
      <defs>
        <linearGradient id={`holo-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6ad5" />
          <stop offset=".3" stopColor="#c774e8" />
          <stop offset=".55" stopColor="#94d0ff" />
          <stop offset=".8" stopColor="#8cffb0" />
          <stop offset="1" stopColor="#ffd36e" />
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="6s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".4" stopColor="#ffcf5a" />
          <stop offset=".7" stopColor="#d99a1e" />
          <stop offset="1" stopColor="#fff3b0" />
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="5s" repeatCount="indefinite" />
        </linearGradient>
        <radialGradient id={`auraHolo-${uid}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset=".45" stopColor="#c774e8" stopOpacity=".55" />
          <stop offset=".75" stopColor="#94d0ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#8cffb0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`auraGold-${uid}`}>
          <stop offset="0" stopColor="#fff8d6" stopOpacity=".95" />
          <stop offset=".5" stopColor="#ffcf5a" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffcf5a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`lamp-${uid}`}>
          <stop offset="0" stopColor="#fff9c4" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff9c4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="141" rx="30" ry="5" fill="#000" opacity=".18" />

      {/* Evolution aura */}
      {aura && (
        <g>
          <circle cx="60" cy="78" r="56" fill={stage.aura?.startsWith("#") ? stage.aura : aura} opacity={stage.aura?.startsWith("#") ? 0.28 : 1}>
            {animate && <animate attributeName="r" values="52;58;52" dur="3s" repeatCount="indefinite" />}
          </circle>
          {level >= 5 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} r="1.8" fill="#fff">
                <animateMotion dur={`${4 + i * 0.6}s`} repeatCount="indefinite" path="M60,24 a50,54 0 1,1 -0.1,0" begin={`${i * -0.7}s`} />
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </circle>
            ))}
        </g>
      )}

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="1.6s" repeatCount="indefinite" />}

        {/* Ultra pack behind the body */}
        {has("vest", "sac-ultra") && <rect x="34" y="66" width="52" height="34" rx="10" fill={fill("vest", "#a855f7")} opacity=".85" />}

        {/* Poles */}
        {has("hands") && (
          <g stroke={fill("hands", "#cbd5e1")} strokeWidth="2.6" strokeLinecap="round">
            <line x1="25" y1="96" x2="14" y2="140" />
            <line x1="95" y1="96" x2="106" y2="140" />
          </g>
        )}

        {/* Legs */}
        <rect x="45" y="104" width="11" height="26" rx="5.5" fill={SKIN} />
        <rect x="64" y="104" width="11" height="26" rx="5.5" fill={SKIN} />
        {/* Shorts */}
        <path d="M40 98h40l-2 16H63l-3-6-3 6H42z" fill="#1f2937" />
        {/* Shoes */}
        <g fill={shoes} stroke="#00000022" strokeWidth=".8">
          <path d="M41 128h16a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2H39a3 3 0 0 1-3-3c0-3 2-5 5-5z" />
          <path d="M79 128H63a3 3 0 0 0-3 3v3a2 2 0 0 0 2 2h19a3 3 0 0 0 3-3c0-3-2-5-5-5z" />
        </g>
        <g stroke="#fff" strokeOpacity=".7" strokeWidth="1.1" strokeLinecap="round">
          <path d="M42 131h8M70 131h8" />
        </g>

        {/* Arms */}
        <rect x="23" y="68" width="12" height="30" rx="6" fill={SKIN} transform="rotate(12 29 70)" />
        <rect x="85" y="68" width="12" height="30" rx="6" fill={SKIN} transform="rotate(-12 91 70)" />

        {/* Torso */}
        <path d="M36 70c0-6 5-10 11-10h26c6 0 11 4 11 10v30H36z" fill={shirt} />
        <path d="M36 70c0-6 5-10 11-10h26c6 0 11 4 11 10v30H36z" fill={`url(#shine-${uid})`} />
        {/* Sleeves */}
        <path d="M36 64l-9 9 6 6 5-4z M84 64l9 9-6 6-5-4z" fill={shirt} />

        {/* Race bib from level 3 */}
        {level >= 3 && (
          <g>
            <rect x="49" y="80" width="22" height="14" rx="2" fill="#fff" stroke="#00000018" />
            <text x="60" y="90.5" textAnchor="middle" fontSize="8" fontWeight="800" fontFamily="JetBrains Mono, monospace" fill="#111">
              {String(level).padStart(2, "0")}
            </text>
          </g>
        )}

        {/* Hydration vest */}
        {has("vest", "gilet-hydra") && (
          <g fill={fill("vest", "#0ea5e9")}>
            <path d="M40 62h9v38h-9z M71 62h9v38h-9z" opacity=".95" />
            <rect x="41" y="72" width="7" height="12" rx="2.5" fill="#e0f2fe" />
            <rect x="72" y="72" width="7" height="12" rx="2.5" fill="#e0f2fe" />
          </g>
        )}
        {has("vest", "sac-ultra") && (
          <g fill={fill("vest", "#a855f7")}>
            <path d="M38 62h8v38h-8z M74 62h8v38h-8z" />
            <path d="M46 76h28v3H46z" opacity=".8" />
          </g>
        )}

        {/* Neck buff */}
        {has("neck") && <rect x="48" y="55" width="24" height="8" rx="4" fill={fill("neck", "#14b8a6")} />}

        {/* Head */}
        <circle cx="60" cy="38" r="22" fill={SKIN} />
        <ellipse cx="39" cy="40" rx="3.5" ry="5" fill={SKIN_SHADE} />
        <ellipse cx="81" cy="40" rx="3.5" ry="5" fill={SKIN_SHADE} />
        {/* Hair */}
        <path d="M38 36c0-14 10-21 22-21s22 7 22 21c-5-6-12-9-22-9s-17 3-22 9z" fill="#3b2a20" />
        {/* Face */}
        <ellipse cx="52" cy="41" rx="2.6" ry="3.2" fill="#1f2937" />
        <ellipse cx="68" cy="41" rx="2.6" ry="3.2" fill="#1f2937" />
        <circle cx="53" cy="40" r=".9" fill="#fff" />
        <circle cx="69" cy="40" r=".9" fill="#fff" />
        <ellipse cx="47" cy="47" rx="3.2" ry="2" fill="#ff8a8a" opacity=".45" />
        <ellipse cx="73" cy="47" rx="3.2" ry="2" fill="#ff8a8a" opacity=".45" />
        <path d="M55 49q5 4 10 0" stroke="#7a3b2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* Headwear */}
        {has("head", "casquette") && (
          <g fill={fill("head", "#1f2937")}>
            <path d="M37 32c1-12 11-18 23-18s22 6 23 18z" />
            <path d="M60 30c10 0 24 1 30 5-6 2-20 1-30-1z" />
          </g>
        )}
        {has("head", "bandeau") && <rect x="37" y="27" width="46" height="7" rx="3.5" fill={fill("head", "#f43f5e")} />}
        {has("head", "frontale") && (
          <g>
            <circle cx="60" cy="14" r="16" fill={`url(#lamp-${uid})`}>
              {animate && <animate attributeName="opacity" values=".6;1;.6" dur="2s" repeatCount="indefinite" />}
            </circle>
            <rect x="37" y="27" width="46" height="5" rx="2.5" fill="#1f2937" />
            <rect x="54" y="24" width="12" height="9" rx="3" fill={fill("head", "#facc15")} />
            <circle cx="60" cy="28.5" r="2.6" fill="#fffde7" />
          </g>
        )}
        {has("head", "laurier") && (
          <g fill={fill("head", "gold")}>
            {[-1, 1].map((side) =>
              [0, 1, 2, 3].map((k) => (
                <ellipse
                  key={`${side}${k}`}
                  cx={60 + side * (10 + k * 5)}
                  cy={20 + k * 3.5}
                  rx="5"
                  ry="2.4"
                  transform={`rotate(${side * (25 + k * 12)} ${60 + side * (10 + k * 5)} ${20 + k * 3.5})`}
                />
              )),
            )}
            <circle cx="60" cy="17" r="3" />
          </g>
        )}
      </g>

      {/* Gold stage: little crown sparkle */}
      {level >= 6 && !has("head", "laurier") && (
        <path d="M48 12l4 6 8-9 8 9 4-6v10H48z" fill={`url(#gold-${uid})`} />
      )}
    </svg>
  )
}
