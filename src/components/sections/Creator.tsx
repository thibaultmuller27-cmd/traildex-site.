import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bike, Download, Eye, FileUp, Footprints, Loader2, Lock, Mountain, Route, Share2, Timer, TrendingUp, Upload } from "lucide-react"
import { DnfCard } from "@/components/DnfCard"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { FadeIn } from "@/components/FadeIn"
import { PreorderDialog } from "@/components/sections/PreorderDialog"
import { ShareDialog } from "@/components/ShareDialog"
import { computeStats, readGpxFile, toGpx, GpxError, type TrackStats } from "@/lib/gpx"
import { CRETES_SPEC, HERO_CARD, makeTrack } from "@/lib/demo"
import {
  durationToInput,
  fmtInt,
  fmtKm,
  parseDuration,
  rarityFor,
  type CardData,
  type Finish,
  type Discipline,
} from "@/lib/card"
import { FINISHES, formatPrice } from "@/lib/config"
import { cn } from "@/lib/utils"

type Form = { runner: string; race: string; date: string; time: string; rank: string; photo?: string }

const EMPTY: Form = { runner: "", race: "", date: "", time: "", rank: "" }

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-mist px-3 py-3 sm:px-4">
      <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-muted">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 whitespace-nowrap text-[17px] font-semibold tabular-nums tracking-tight sm:text-[20px]">{value}</div>
    </div>
  )
}

const DISCIPLINES = [
  { id: "trail", label: "Trail", icon: Mountain, joke: "Boue, cailloux, et ravito fromage." },
  { id: "running", label: "Running", icon: Footprints, joke: "Bitume, chrono, et ampoules assorties." },
  { id: "velo", label: "Vélo", icon: Bike, joke: "Cols, cuissard, et descentes à 70." },
] as const

function Panel({ step, title, children, aside }: { step: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-6 ring-2 ring-[#160a2e] md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-display text-[22px] tracking-wide text-lime">
          <span className="mr-2 font-mono text-[14px] text-muted">{step}</span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

/** Race name from the GPX: without emoji, ®/™ or a "Finisher" prefix; falls back to the file name. */
function raceName(gpxName: string | null, fileName: string) {
  const clean = (t: string) =>
    t
      .replace(/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}\uFE0F\u200D®™©]/gu, "")
      .replace(/\.gpx$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/^\s*finisher\s*/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40)
  return clean(gpxName || "") || clean(fileName) || "Ma course"
}

export function Creator() {
  const [stats, setStats] = React.useState<TrackStats | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [drag, setDrag] = React.useState(false)
  const [form, setForm] = React.useState<Form>(EMPTY)
  const [discipline, setDiscipline] = React.useState<Discipline>("trail")
  // One finish for now: the holo card (the Or finish is no longer offered).
  const finish: Finish = "holo"
  const [orderOpen, setOrderOpen] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [number] = React.useState(() => 100 + Math.floor(Math.random() * 900))
  const fileInput = React.useRef<HTMLInputElement>(null)
  const previewRef = React.useRef<HTMLDivElement>(null)
  const sectionRef = React.useRef<HTMLElement>(null)
  const [showPeek, setShowPeek] = React.useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const applyStats = (s: TrackStats, name: string) => {
    setStats(s)
    setFileName(name)
    setError(null)
    setForm((f) => ({
      ...f,
      race: raceName(s.name, name),
      date: s.date || "",
      time: durationToInput(s.durationSec),
    }))
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      applyStats(await readGpxFile(file), file.name)
    } catch (e) {
      setError(e instanceof GpxError ? e.message : "Impossible de lire ce fichier.")
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    const s = computeStats(makeTrack(CRETES_SPEC), "Crêtes Vosgiennes")
    // Shown as the official race figures, as a runner would enter them.
    applyStats({ ...s, distanceKm: CRETES_SPEC.km, gain: CRETES_SPEC.gain }, "cretes-vosgiennes.gpx")
    setForm((f) => ({
      runner: f.runner || "Camille",
      race: "Crêtes Vosgiennes",
      date: CRETES_SPEC.date,
      time: "7h16",
      rank: f.rank || "42/612",
      photo: f.photo,
    }))
  }

  const downloadExample = () => {
    const blob = new Blob([toGpx(makeTrack(CRETES_SPEC), "Crêtes Vosgiennes")], { type: "application/gpx+xml" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "cretes-vosgiennes.gpx"
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }


  // Mobile: offer a shortcut back to the preview when it is off screen.
  React.useEffect(() => {
    const p = previewRef.current
    const s = sectionRef.current
    if (!p || !s) return
    let inSection = false
    let previewVisible = true
    const sync = () => setShowPeek(inSection && !previewVisible)
    const io1 = new IntersectionObserver(([e]) => {
      previewVisible = e.isIntersecting
      sync()
    })
    const io2 = new IntersectionObserver(([e]) => {
      inSection = e.isIntersecting
      sync()
    }, { rootMargin: "-40% 0px -40% 0px" })
    io1.observe(p)
    io2.observe(s)
    return () => {
      io1.disconnect()
      io2.disconnect()
    }
  }, [])

  const timeSec = parseDuration(form.time)
  const rarity = rarityFor(finish, stats?.distanceKm ?? null, stats?.gain ?? null)
  const route = stats ?? HERO_CARD
  const card: CardData = {
    id: "draft",
    discipline,
    geo: stats?.geo,
    track: stats?.track,
    runner: form.runner.trim(),
    race: form.race.trim(),
    date: form.date,
    timeSec,
    rank: "",
    distanceKm: stats?.distanceKm ?? null,
    gain: stats?.gain ?? null,
    maxEle: stats?.maxEle ?? null,
    routePath: route.routePath,
    start: stats?.start,
    end: stats?.end,
    profileArea: route.profileArea,
    profileLine: route.profileLine,
    rarity,
    number,
  }
  const price = FINISHES.find((f) => f.id === finish)!.price
  const missing = [!stats && "ton fichier GPX", !card.runner && "ton prénom", !card.race && "un GPX avec un nom de course"].filter(Boolean) as string[]

  return (
    <section id="createur" ref={sectionRef} className="bg-mist px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <p className="eyebrow text-mint">Créateur de carte</p>
          <h2 className="headline mx-auto mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">Ta carte prend vie <span className="text-gradient-dnf">pendant que tu tapes.</span></h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-muted md:text-[19px]">
            Discipline, GPX, blaze. Trois clics, zéro abandon. Ce que tu vois est ce que tu reçois (en plus brillant).
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          {/* Live preview */}
          <div className="lg:order-2">
            <div ref={previewRef} className="flex flex-col items-center lg:sticky lg:top-24">
              <div className="py-6">
                <DnfCard card={card} width="clamp(250px, 76vw, 360px)" />
              </div>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Aperçu en direct · clique sur la carte pour la retourner
              </p>
              <Button variant="secondary" className="mt-5" disabled={missing.length > 0} onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" /> Partager gratuitement
              </Button>
              {missing.length > 0 && <p className="mt-2 text-[12px] text-muted">Ajoute ton GPX, ton prénom et ta course pour partager.</p>}
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-5 lg:order-1">
            <Panel step="1" title="Ta discipline">
              <div role="radiogroup" aria-label="Discipline" className="grid gap-3 sm:grid-cols-3">
                {DISCIPLINES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={discipline === d.id}
                    onClick={() => setDiscipline(d.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left ring-2 transition-all",
                      discipline === d.id ? "bg-lime text-night ring-[#160a2e]" : "bg-night text-ink ring-line hover:ring-mint",
                    )}
                  >
                    <span className="flex items-center gap-2 font-display text-[18px] tracking-wide"><d.icon className="h-5 w-5" /> {d.label}</span>
                    <span className={cn("text-[12px]", discipline === d.id ? "text-night/75" : "text-muted")}>{d.joke}</span>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel
              step="2"
              title="Ton parcours (GPX)"
              aside={
                <span className="hidden items-center gap-1 text-[12px] text-muted sm:flex">
                  <Lock className="h-3.5 w-3.5" /> Lu sur ton appareil
                </span>
              }
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInput.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDrag(true)
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDrag(false)
                  handleFile(e.dataTransfer.files[0])
                }}
                className={cn(
                  "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime/20",
                  drag ? "scale-[1.01] border-lime bg-lime/10" : "border-line hover:border-mint hover:bg-night/60",
                )}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".gpx,application/gpx+xml"
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
                <div className={cn("grid h-14 w-14 place-items-center rounded-2xl transition-colors", stats ? "bg-emerald-50 text-emerald-600" : "bg-mist text-ink")}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats ? <FileUp className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                </div>
                {stats ? (
                  <>
                    <p className="mt-4 text-[17px] font-semibold">{fileName}</p>
                    <p className="mt-1 text-[14px] text-muted">{fmtInt(stats.pointCount)} points · clique pour changer de fichier</p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-[17px] font-semibold">
                      <span className="hidden sm:inline">Glisse ton fichier .gpx ici</span>
                      <span className="sm:hidden">Choisis ton fichier .gpx</span>
                    </p>
                    <p className="mt-1 text-[14px] text-muted">
                      <span className="hidden sm:inline">ou clique pour parcourir · </span>Garmin, Suunto, Coros, Strava…
                    </p>
                  </>
                )}
              </div>
              {error && <p className="mt-3 text-[14px] text-[#e30000]">{error}</p>}

              <AnimatePresence initial={false}>
                {stats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                      <StatChip icon={Route} label="Distance" value={`${fmtKm(stats.distanceKm)} km`} />
                      <StatChip icon={TrendingUp} label="D+" value={`${fmtInt(stats.gain)} m`} />
                      <StatChip icon={Timer} label="Chrono" value={stats.durationSec ? durationToInput(stats.durationSec) : "—"} />
                    </div>
                    {stats.profileArea && (
                      <div className="mt-3 rounded-2xl bg-mist p-4">
                        <p className="text-[12px] text-muted">Profil d'altitude</p>
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-20 w-full">
                          <defs>
                            <linearGradient id="creator-pf" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0" stopColor="#1fd6a0" stopOpacity="0.45" />
                              <stop offset="1" stopColor="#1fd6a0" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={stats.profileArea} fill="url(#creator-pf)" />
                          <path d={stats.profileLine} fill="none" stroke="#c6e536" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!stats && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px]">
                  <button onClick={loadExample} className="font-medium text-lime hover:underline">
                    Essayer avec l'exemple (Crêtes Vosgiennes)
                  </button>
                  <button onClick={downloadExample} className="inline-flex items-center gap-1 text-muted hover:text-ink">
                    <Download className="h-3.5 w-3.5" /> Télécharger le GPX d'exemple
                  </button>
                </div>
              )}
            </Panel>

            <Panel step="3" title="Ton nom (ou ton blaze)">
              <Field label="Prénom ou surnom" hint="(La Fusée, Tonton… on ne juge pas)" htmlFor="f-runner">
                <Input id="f-runner" value={form.runner} onChange={set("runner")} placeholder="Camille" maxLength={20} autoComplete="given-name" />
              </Field>
              <p className="mt-3 text-[13px] text-muted">Le nom de la course, la date, la distance, le D+ et le chrono viennent de ton GPX. Rien d'autre à taper.</p>
            </Panel>


            <div className="flex flex-col items-stretch gap-3 rounded-[28px] bg-violet p-6 text-white ring-2 ring-[#160a2e] sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div>
                <p className="text-[13px] text-white/60">Total · livraison offerte</p>
                <p className="text-[32px] font-semibold tabular-nums tracking-tight">{formatPrice(price)}</p>
                {missing.length > 0 && <p className="mt-1 text-[13px] text-white/60">Il manque : {missing.join(", ")}.</p>}
              </div>
              <Button variant="light" size="lg" disabled={missing.length > 0} onClick={() => setOrderOpen(true)}>
                Commander
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPeek && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex justify-center lg:hidden"
          >
            <button
              onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-violet/90 px-5 py-3 text-[14px] font-medium text-white shadow-xl backdrop-blur"
            >
              <Eye className="h-4 w-4" /> Voir ma carte
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PreorderDialog open={orderOpen} onOpenChange={setOrderOpen} card={card} finish={finish} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} card={card} />
    </section>
  )
}
