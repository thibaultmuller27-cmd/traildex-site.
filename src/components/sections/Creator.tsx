import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Download, Eye, FileUp, ImagePlus, Loader2, Lock, Mountain, Route, Sparkles, Trash2, TrendingUp, Upload } from "lucide-react"
import { TrailCard } from "@/components/TrailCard"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { FadeIn } from "@/components/FadeIn"
import { PreorderDialog } from "@/components/sections/PreorderDialog"
import { computeStats, readGpxFile, toGpx, GpxError, type TrackStats } from "@/lib/gpx"
import { CRETES_SPEC, HERO_CARD, makeTrack } from "@/lib/demo"
import {
  durationToInput,
  effortKm,
  fmtInt,
  fmtKm,
  parseDuration,
  rarityFor,
  type CardData,
  type Finish,
} from "@/lib/card"
import { FINISHES, RARITIES, formatPrice } from "@/lib/config"
import { cn } from "@/lib/utils"

type Form = { runner: string; race: string; date: string; time: string; rank: string; photo?: string }

const EMPTY: Form = { runner: "", race: "", date: "", time: "", rank: "" }

/** Downscale a photo in the browser so it stays light (and private). */
function loadPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const max = 900
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement("canvas")
      c.width = Math.round(img.width * s)
      c.height = Math.round(img.height * s)
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL("image/jpeg", 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("image"))
    }
    img.src = url
  })
}

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist px-4 py-3">
      <div className="flex items-center gap-1.5 text-[12px] text-muted">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-tight">{value}</div>
    </div>
  )
}

function Panel({ step, title, children, aside }: { step: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-[21px] font-semibold tracking-tight">
          <span className="mr-2 font-mono text-[14px] text-muted">{step}</span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

const FINISH_SWATCH: Record<Finish, string> = {
  standard: "linear-gradient(160deg,#fdfcf9,#e7e2d6)",
  holo: "linear-gradient(110deg,#ff8ad8,#ffd36e,#8cff9e,#6ee7ff,#9a8cff,#ff8ad8)",
  or: "linear-gradient(135deg,#f9e3a3,#c99332 50%,#fff1c4 70%,#a86b1f)",
}

export function Creator() {
  const [stats, setStats] = React.useState<TrackStats | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [drag, setDrag] = React.useState(false)
  const [form, setForm] = React.useState<Form>(EMPTY)
  const [finish, setFinish] = React.useState<Finish>("holo")
  const [orderOpen, setOrderOpen] = React.useState(false)
  const [number] = React.useState(() => 100 + Math.floor(Math.random() * 900))
  const fileInput = React.useRef<HTMLInputElement>(null)
  const photoInput = React.useRef<HTMLInputElement>(null)
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
      race: f.race || s.name || "",
      date: f.date || s.date || "",
      time: f.time || durationToInput(s.durationSec),
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

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      const photo = await loadPhoto(file)
      setForm((f) => ({ ...f, photo }))
    } catch {
      setError("Cette image n'a pas pu être chargée.")
    }
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
    runner: form.runner.trim(),
    race: form.race.trim(),
    date: form.date,
    timeSec,
    rank: form.rank,
    distanceKm: stats?.distanceKm ?? null,
    gain: stats?.gain ?? null,
    maxEle: stats?.maxEle ?? null,
    routePath: route.routePath,
    start: stats?.start,
    end: stats?.end,
    profileArea: route.profileArea,
    profileLine: route.profileLine,
    photo: form.photo,
    rarity,
    number,
  }
  const price = FINISHES.find((f) => f.id === finish)!.price
  const missing = [!stats && "ton fichier GPX", !card.runner && "ton prénom", !card.race && "le nom de la course"].filter(Boolean) as string[]
  const effort = effortKm(stats?.distanceKm ?? null, stats?.gain ?? null)

  return (
    <section id="createur" ref={sectionRef} className="bg-mist px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <p className="eyebrow text-[#0071e3]">Créateur de carte</p>
          <h2 className="headline mx-auto mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">Ta carte prend vie pendant que tu tapes.</h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-muted md:text-[19px]">
            Importe ton parcours, remplis tes infos, choisis ta finition. Ce que tu vois est ce que tu reçois.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          {/* Live preview */}
          <div className="lg:order-2">
            <div ref={previewRef} className="flex flex-col items-center lg:sticky lg:top-24">
              <div className="py-6">
                <TrailCard card={card} placeholder={!stats} width="clamp(250px, 76vw, 360px)" />
              </div>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Aperçu en direct · clique sur la carte pour la retourner
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-5 lg:order-1">
            <Panel
              step="1"
              title="Ton parcours"
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
                  "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/20",
                  drag ? "scale-[1.01] border-[#0071e3] bg-[#0071e3]/5" : "border-line hover:border-[#a1a1a6] hover:bg-mist/60",
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
                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <StatChip icon={Route} label="Distance" value={`${fmtKm(stats.distanceKm)} km`} />
                      <StatChip icon={TrendingUp} label="Dénivelé +" value={`${fmtInt(stats.gain)} m`} />
                      <StatChip icon={Mountain} label="Alt. max" value={stats.maxEle != null ? `${fmtInt(stats.maxEle)} m` : "—"} />
                      <StatChip icon={Sparkles} label="Km-effort" value={fmtInt(effort)} />
                    </div>
                    {stats.profileArea && (
                      <div className="mt-3 rounded-2xl bg-mist p-4">
                        <p className="text-[12px] text-muted">Profil d'altitude</p>
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-20 w-full">
                          <defs>
                            <linearGradient id="creator-pf" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0" stopColor="#1d1d1f" stopOpacity="0.25" />
                              <stop offset="1" stopColor="#1d1d1f" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={stats.profileArea} fill="url(#creator-pf)" />
                          <path d={stats.profileLine} fill="none" stroke="#1d1d1f" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!stats && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px]">
                  <button onClick={loadExample} className="font-medium text-[#0066cc] hover:underline">
                    Essayer avec l'exemple (Crêtes Vosgiennes)
                  </button>
                  <button onClick={downloadExample} className="inline-flex items-center gap-1 text-muted hover:text-ink">
                    <Download className="h-3.5 w-3.5" /> Télécharger le GPX d'exemple
                  </button>
                </div>
              )}
            </Panel>

            <Panel step="2" title="Tes infos">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" htmlFor="f-runner">
                  <Input id="f-runner" value={form.runner} onChange={set("runner")} placeholder="Camille" maxLength={20} autoComplete="given-name" />
                </Field>
                <Field label="Nom de la course" htmlFor="f-race">
                  <Input id="f-race" value={form.race} onChange={set("race")} placeholder="Crêtes Vosgiennes" maxLength={40} />
                </Field>
                <Field label="Date" htmlFor="f-date">
                  <Input id="f-date" type="date" value={form.date} onChange={set("date")} />
                </Field>
                <Field label="Chrono" hint="(ex. 7h16)" htmlFor="f-time">
                  <Input
                    id="f-time"
                    value={form.time}
                    onChange={set("time")}
                    placeholder="7h16"
                    inputMode="text"
                    className={cn(form.time && timeSec == null && "border-[#e30000] focus:border-[#e30000] focus:ring-[#e30000]/15")}
                  />
                </Field>
                <Field label="Classement" hint="(ex. 42/612)" htmlFor="f-rank">
                  <Input id="f-rank" value={form.rank} onChange={set("rank")} placeholder="42/612" inputMode="numeric" />
                </Field>
                <Field label="Photo" hint="(optionnelle)">
                  <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
                  {form.photo ? (
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-line bg-white px-2">
                      <img src={form.photo} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      <span className="flex-1 truncate text-[14px]">Photo ajoutée</span>
                      <button
                        onClick={() => setForm((f) => ({ ...f, photo: undefined }))}
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-mist hover:text-ink"
                        aria-label="Retirer la photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => photoInput.current?.click()}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white text-[15px] text-muted transition-colors hover:border-[#a1a1a6] hover:text-ink"
                    >
                      <ImagePlus className="h-4 w-4" /> Ajouter une photo
                    </button>
                  )}
                </Field>
              </div>
            </Panel>

            <Panel step="3" title="Ta finition">
              <div role="radiogroup" aria-label="Finition" className="grid gap-3 sm:grid-cols-3">
                {FINISHES.map((f) => {
                  const active = f.id === finish
                  return (
                    <button
                      key={f.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFinish(f.id)}
                      className={cn(
                        "relative flex flex-row items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 sm:flex-col sm:items-start",
                        active ? "bg-white ring-2 ring-ink" : "bg-mist ring-1 ring-transparent hover:ring-line",
                      )}
                    >
                      <span
                        className="h-14 w-10 shrink-0 rounded-md shadow-sm ring-1 ring-black/10"
                        style={{
                          background: FINISH_SWATCH[f.id],
                          backgroundSize: f.id === "holo" ? "200% 100%" : undefined,
                          animation: f.id === "holo" ? "holo-shift 4s linear infinite" : undefined,
                        }}
                      />
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-[17px] font-semibold">{f.name}</span>
                          <span className="text-[15px] font-medium tabular-nums">{formatPrice(f.price)}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] font-medium text-ink/70">{f.tagline}</span>
                        <span className="mt-1 block text-[12px] leading-snug text-muted">{f.details}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-[14px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: RARITIES[rarity].color }} />
                <span>
                  Ta carte sera <strong>{RARITIES[rarity].label}</strong>
                  <span className="text-muted">
                    {finish === "holo" && stats && (rarity === "epique" ? " — plus de 60 km-effort, bravo." : " — Épique à partir de 60 km-effort.")}
                    {finish === "holo" && !stats && " ou Épique selon ta course."}
                  </span>
                </span>
              </div>
            </Panel>

            <div className="flex flex-col items-stretch gap-3 rounded-[28px] bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
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
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink/90 px-5 py-3 text-[14px] font-medium text-white shadow-xl backdrop-blur"
            >
              <Eye className="h-4 w-4" /> Voir ma carte
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PreorderDialog open={orderOpen} onOpenChange={setOrderOpen} card={card} finish={finish} />
    </section>
  )
}
