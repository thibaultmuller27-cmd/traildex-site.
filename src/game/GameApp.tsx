import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Crown, Gem, LocateFixed, Navigation, Shirt, Swords, Footprints } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALLOW_SIMULATION, DEFAULT_CENTER, FREE_DAILY_CHESTS, REACH_M, SIM_SPEED, TRIAL_DAYS } from "./config"
import { fmtDist, haversine, stepTowards, type LngLat } from "./lib/geo"
import { STAGES } from "./lib/items"
import { GameProvider, useGame, type Loot } from "./lib/state"
import { fakeTrails, fetchTrails, placeTreasures, type Trail, type Treasure } from "./lib/trails"
import { Avatar } from "./components/Avatar"
import { MapView } from "./components/MapView"
import { ChallengesPanel, ChestReveal, LockerPanel, LootPanel, PassPanel, Sheet } from "./components/Panels"
import { CHALLENGES, isDone } from "./lib/challenges"

type Tab = "defis" | "avatar" | "butin" | "pass" | null
type Mode = "gps" | "demo"

function useToasts() {
  const [toasts, setToasts] = React.useState<{ id: number; text: string }[]>([])
  const push = React.useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  return { toasts, push }
}

function Game() {
  const game = useGame()
  const { state, premium, level } = game
  const [mode, setMode] = React.useState<Mode | null>(null)
  const [player, setPlayer] = React.useState<LngLat | null>(null)
  const [target, setTarget] = React.useState<LngLat | null>(null)
  const [trails, setTrails] = React.useState<Trail[]>([])
  const [loading, setLoading] = React.useState(false)
  const [follow, setFollow] = React.useState(true)
  const [tab, setTab] = React.useState<Tab>(null)
  const [passReason, setPassReason] = React.useState<string | null>(null)
  const [loot, setLoot] = React.useState<Loot | null>(null)
  const [pendingChest, setPendingChest] = React.useState<Treasure | null>(null)
  const [simOn, setSimOn] = React.useState(false)
  const { toasts, push } = useToasts()
  const loadedAt = React.useRef<LngLat | null>(null)
  const playerRef = React.useRef(player)
  playerRef.current = player
  const trailsRef = React.useRef(trails)
  trailsRef.current = trails

  const treasures = React.useMemo(() => placeTreasures(trails), [trails])

  // Return from Stripe, or trial started from the marketing site.
  React.useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.get("abonnement") === "merci") {
      game.activatePremium(q.get("plan") === "annuel" ? 366 : 31)
      push("Bienvenue chez les Traileurs+ ✦")
    } else if (q.get("essai") === "1" && !premium) {
      game.activatePremium(TRIAL_DAYS)
      push(`Essai Traileur+ activé pour ${TRIAL_DAYS} jours ✦`)
    }
    if (q.size) history.replaceState(null, "", location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTrails = React.useCallback(
    async (center: LngLat) => {
      loadedAt.current = center
      setLoading(true)
      try {
        const real = await fetchTrails(center)
        setTrails(real.length >= 2 ? real : [...real, ...fakeTrails(center)])
      } catch {
        setTrails(fakeTrails(center))
        push("Sentiers de démonstration (OpenStreetMap injoignable)")
      } finally {
        setLoading(false)
      }
    },
    [push],
  )

  const onMoved = React.useCallback(
    (to: LngLat, from: LngLat | null) => {
      const found = game.move(to, from, trailsRef.current)
      found.forEach((n) => push(`Sentier découvert : ${n}`))
      if (loadedAt.current && haversine(loadedAt.current, to) > 1800) loadTrails(to)
    },
    [game, push, loadTrails],
  )

  const start = (m: Mode) => {
    if (m === "demo") {
      setMode("demo")
      setPlayer(DEFAULT_CENTER)
      loadTrails(DEFAULT_CENTER)
      return
    }
    if (!navigator.geolocation) return start("demo")
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const here: LngLat = [p.coords.longitude, p.coords.latitude]
        setMode("gps")
        setPlayer(here)
        loadTrails(here)
      },
      () => {
        push("Position refusée : mode démo à Chamonix")
        start("demo")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  // Real GPS tracking
  React.useEffect(() => {
    if (mode !== "gps" || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (p.coords.accuracy > 60) return
        const to: LngLat = [p.coords.longitude, p.coords.latitude]
        onMoved(to, playerRef.current)
        setPlayer(to)
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 2000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [mode, onMoved])

  // Simulated walking towards the tapped point
  React.useEffect(() => {
    if (!target) return
    const id = setInterval(() => {
      const from = playerRef.current
      if (!from) return
      const to = stepTowards(from, target, SIM_SPEED / 10)
      onMoved(to, from)
      setPlayer(to)
      if (to === target) setTarget(null)
    }, 100)
    return () => clearInterval(id)
  }, [target, onMoved])

  const tryOpen = React.useCallback(
    (t: Treasure) => {
      const r = game.open(t, playerRef.current)
      if (r.ok) {
        setLoot(r.loot)
        return
      }
      if (r.reason === "premium") {
        setPassReason("Les coffres légendaires (gains rares, codes -30 %) sont réservés aux Traileurs+.")
        setTab("pass")
      } else if (r.reason === "limit") {
        setPassReason(`Tu as ouvert tes ${FREE_DAILY_CHESTS} coffres gratuits du jour. Passe Traileur+ pour des coffres illimités.`)
        setTab("pass")
      } else if (r.reason === "far") {
        if (ALLOW_SIMULATION && (mode === "demo" || simOn)) {
          setTarget(t.at)
          setFollow(true)
          setPendingChest(t)
        } else push(`Approche-toi encore de ${fmtDist((r.distance ?? 0) - REACH_M)}`)
      }
    },
    [game, mode, simOn, push],
  )

  // Arrived next to the chest we were walking to
  React.useEffect(() => {
    if (pendingChest && !target) {
      setPendingChest(null)
      tryOpen(pendingChest)
    }
  }, [pendingChest, target, tryOpen])

  const canWalk = ALLOW_SIMULATION && (mode === "demo" || simOn)

  const claimable = CHALLENGES.filter((c) => isDone(c, state) && !state.claimed.includes(c.id)).length
  const stage = STAGES[level.level - 1]
  const left = Math.max(0, FREE_DAILY_CHESTS - state.daily.count)
  const nearest = React.useMemo(() => {
    if (!player) return null
    let best: { d: number; t: Treasure } | null = null
    for (const t of treasures) {
      if (state.opened[t.id]) continue
      const d = haversine(player, t.at)
      if (!best || d < best.d) best = { d, t }
    }
    return best
  }, [player, treasures, state.opened])

  const avatar = <Avatar equipped={state.equipped} level={level.level} size={58} />

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0c0b1d] text-white">
      {mode && (
        <MapView
          player={player}
          trails={trails}
          treasures={treasures}
          state={state}
          premium={premium}
          follow={follow}
          onFollowChange={setFollow}
          onMapClick={(p) => {
            if (!canWalk) return
            setPendingChest(null)
            setTarget(p)
            setFollow(true)
          }}
          onChestClick={tryOpen}
          avatar={avatar}
        />
      )}

      {/* Holographic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(12,11,29,.55))]" />

      {/* Top HUD */}
      {mode && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button onClick={() => setTab("avatar")} className="glass holo-border pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4">
            <span className="holo-bg grid h-11 w-11 place-items-center rounded-full font-semibold text-[#0c0b1d]">{level.level}</span>
            <span className="text-left">
              <span className="block text-[13px] font-semibold leading-tight">{stage.name}</span>
              <span className="mt-1 block h-1.5 w-28 overflow-hidden rounded-full bg-white/15">
                <span className="holo-bg block h-full rounded-full" style={{ width: `${level.progress * 100}%` }} />
              </span>
              <span className="mt-0.5 block text-[10px] text-white/60">
                {state.xp.toLocaleString("fr-FR")} XP{level.next ? ` / ${level.next.at.toLocaleString("fr-FR")}` : ""}
              </span>
            </span>
          </button>
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <button
              onClick={() => {
                setPassReason(null)
                setTab("pass")
              }}
              className={cn("glass flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold", premium && "holo-border")}
            >
              <Crown className="h-4 w-4 text-[#ffcf5a]" />
              {premium ? <span className="text-gradient-holo">Traileur+</span> : `${left}/${FREE_DAILY_CHESTS} coffres`}
            </button>
            {mode === "gps" && ALLOW_SIMULATION && (
              <button onClick={() => setSimOn((s) => !s)} className="glass flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px]">
                <Footprints className="h-4 w-4" /> {simOn ? "Simulation" : "GPS"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status line */}
      {mode && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(max(0.75rem,env(safe-area-inset-top))+70px)] flex justify-center px-3">
          <div className="glass rounded-full px-4 py-1.5 text-[12px] text-white/80">
            {loading
              ? "Recherche des sentiers autour de toi…"
              : nearest
                ? `Trésor le plus proche : ${fmtDist(nearest.d)}${canWalk ? " · touche la carte pour courir" : ""}`
                : "Tous les trésors du jour sont ouverts. Reviens demain !"}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(max(0.75rem,env(safe-area-inset-top))+108px)] z-30 flex flex-col items-center gap-2 px-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass holo-border rounded-2xl px-4 py-2.5 text-[14px] font-medium"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recenter */}
      {mode && !follow && (
        <button onClick={() => setFollow(true)} className="glass absolute bottom-28 right-4 grid h-12 w-12 place-items-center rounded-full" aria-label="Recentrer">
          <LocateFixed className="h-5 w-5" />
        </button>
      )}

      {/* Bottom bar */}
      {mode && (
        <nav className="absolute inset-x-0 bottom-0 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="glass holo-border flex items-end gap-1 rounded-[26px] px-2 py-2">
            <TabButton icon={Swords} label="Défis" badge={claimable} onClick={() => setTab("defis")} />
            <TabButton icon={Gem} label="Butin" onClick={() => setTab("butin")} />
            <button onClick={() => setTab("avatar")} className="holo-border -mt-8 mx-1 grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-full bg-gradient-to-b from-[#2a1a4a] to-[#0c1f33]" aria-label="Mon avatar">
              <Avatar equipped={state.equipped} level={level.level} size={62} animate={false} />
            </button>
            <TabButton icon={Shirt} label="Vestiaire" onClick={() => setTab("avatar")} />
            <TabButton
              icon={Crown}
              label="Pass"
              onClick={() => {
                setPassReason(null)
                setTab("pass")
              }}
            />
          </div>
        </nav>
      )}

      <Sheet open={tab === "defis"} onClose={() => setTab(null)} title="Défis">
        <ChallengesPanel onUpgrade={() => setTab("pass")} />
      </Sheet>
      <Sheet open={tab === "avatar"} onClose={() => setTab(null)} title="Mon avatar">
        <LockerPanel onUpgrade={() => setTab("pass")} />
      </Sheet>
      <Sheet open={tab === "butin"} onClose={() => setTab(null)} title="Butin">
        <LootPanel />
      </Sheet>
      <Sheet open={tab === "pass"} onClose={() => setTab(null)} title="Traileur+">
        <PassPanel reason={passReason} />
      </Sheet>

      <ChestReveal loot={loot} onClose={() => setLoot(null)} />

      {!mode && <StartScreen onStart={start} />}
    </div>
  )
}

function TabButton({ icon: Icon, label, badge, onClick }: { icon: typeof Crown; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] text-white/80 hover:bg-white/10">
      <Icon className="h-5 w-5" />
      {label}
      {!!badge && <span className="holo-bg absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-[#0c0b1d]">{badge}</span>}
    </button>
  )
}

function StartScreen({ onStart }: { onStart: (m: Mode) => void }) {
  const { state, level } = useGame()
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#0c0b1d]">
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#c774e8]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#94d0ff]/25 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-[#8cffb0]/15 blur-[100px]" />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <a href="/" className="absolute left-5 top-5 flex items-center gap-1 text-[13px] text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> TrailDex
        </a>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="holo-border grid place-items-center rounded-full bg-gradient-to-b from-[#2a1a4a] to-[#0c1f33] p-6">
          <Avatar equipped={state.equipped} level={Math.max(level.level, 5)} size={150} />
        </motion.div>
        <p className="eyebrow mt-8 text-[#94d0ff]">TrailDex Quest</p>
        <h1 className="headline mt-3 text-[44px] sm:text-[56px]">
          Cours. Explore.
          <br />
          <span className="text-gradient-holo">Trouve les trésors.</span>
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-white/60">
          Des coffres apparaissent chaque jour sur les vrais sentiers autour de toi. Ouvre-les pour faire évoluer ton avatar et gagner des codes promo de marques de trail.
        </p>
        <div className="mt-8 w-full space-y-3">
          <button onClick={() => onStart("gps")} className="holo-bg flex h-14 w-full items-center justify-center gap-2 rounded-full text-[17px] font-semibold text-[#0c0b1d] shadow-[0_15px_40px_-10px_rgba(255,106,213,.7)]">
            <Navigation className="h-5 w-5" /> Jouer avec ma position
          </button>
          {ALLOW_SIMULATION && (
            <button onClick={() => onStart("demo")} className="h-14 w-full rounded-full bg-white/10 text-[16px] font-medium ring-1 ring-white/20 hover:bg-white/15">
              Mode démo à Chamonix
            </button>
          )}
        </div>
        <p className="mt-6 text-[12px] text-white/40">Ta position reste sur ton téléphone. Fond de carte © OpenStreetMap, OpenFreeMap.</p>
      </div>
    </div>
  )
}

export default function GameApp() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
