/**
 * The simple card maker: a GPX and a race name in, a print PDF or a social
 * image out. The older tools (orders, batches, invoices) open with ?avance.
 */
import * as React from "react"
import type { Finish } from "@/lib/card"
import { readGpxFile, type TrackStats } from "@/lib/gpx"
import { saveFile } from "@/lib/saveFile"
import { buildEditionCard, Preview } from "./EditionPanel"

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

// Exaprint's hot-foil cards: 55 × 85 mm, 3 mm bleed.
const PRINT = { widthMm: 55, heightMm: 85, bleedMm: 3 }

export function SimpleTool() {
  const [stats, setStats] = React.useState<TrackStats | null>(null)
  const [race, setRace] = React.useState("")
  const [finish, setFinish] = React.useState<Finish>("or")
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const loadGpx = async (file?: File) => {
    if (!file) return
    setError(null)
    try {
      const s = await readGpxFile(file)
      setStats(s)
      if (!race && s.name) setRace(s.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ce fichier GPX est illisible.")
    }
  }

  const card = React.useMemo(() => {
    if (!stats || !race.trim()) return null
    const year = (stats.date ?? new Date().toISOString()).slice(0, 4)
    return buildEditionCard(stats, race.trim(), stats.date ?? "", finish, {
      label: `Édition ${year}`,
      qrUrl: `https://traildex.fr/c/${slug(race)}`,
    })
  }, [stats, race, finish])

  const run = async (label: string, job: () => Promise<void>) => {
    setBusy(label)
    setError(null)
    try {
      await job()
    } catch (e) {
      // The viewer declining the download is not an error.
      if ((e as { code?: string })?.code !== "declined") {
        console.error(e)
        setError("Le fichier n'a pas pu être créé.")
      }
    } finally {
      setBusy(null)
    }
  }

  const downloadPdf = () =>
    run("Création du PDF…", async () => {
      if (!card) return
      const ex = await import("@/lib/exaprint")
      const { loadSavedProfileBytes, loadCmykProfile } = await import("@/lib/cmyk")
      const icc = await loadSavedProfileBytes()
      const cmyk = icc ? await loadCmykProfile(icc).catch(() => undefined) : undefined
      const files = await ex.buildCardFiles(card, { ...ex.DEFAULT_SETTINGS, ...PRINT }, undefined, cmyk)
      const name = `traildex-${slug(race)}`
      await saveFile(files.print, `${name}.pdf`, "application/pdf")
      if (files.foil) await saveFile(files.foil, `${name}-dorure.pdf`, "application/pdf")
    })

  const downloadImage = (format: "story" | "post") =>
    run("Création de l'image…", async () => {
      if (!card) return
      const { renderShareImage } = await import("@/lib/shareImage")
      await saveFile(await renderShareImage(card, format), `traildex-${slug(race)}-${format}.png`, "image/png")
    })

  const step = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white"
  const pill = (on: boolean) => "rounded-full px-4 py-2 text-[14px] font-medium " + (on ? "bg-ink text-white" : "bg-white ring-1 ring-line")
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-center gap-3">
        <span className={step}>1</span>
        <label className="flex-1 cursor-pointer rounded-xl border-2 border-dashed border-line px-4 py-5 text-center text-[15px] hover:bg-mist">
          {stats ? `GPX chargé · ${stats.distanceKm.toFixed(1).replace(".", ",")} km · ${Math.round(stats.gain)} m D+ (changer)` : "Choisis le fichier GPX de la course"}
          <input id="simple-gpx" type="file" accept=".gpx" className="hidden" onChange={(e) => loadGpx(e.target.files?.[0])} />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={step}>2</span>
        <input
          id="simple-race"
          value={race}
          onChange={(e) => setRace(e.target.value)}
          placeholder="Nom de la course"
          className="h-12 flex-1 rounded-xl border border-line px-4 text-[16px]"
        />
      </div>

      {error && <p className="mt-3 text-[14px] text-[#e30000]">{error}</p>}

      {card && (
        <>
          <div className="mt-5 flex justify-center gap-2">
            <button className={pill(finish === "or")} onClick={() => setFinish("or")}>
              Or
            </button>
            <button className={pill(finish === "holo")} onClick={() => setFinish("holo")}>
              Holographique
            </button>
          </div>
          <Preview card={card} />

          <div className="mt-6 flex items-start gap-3">
            <span className={step}>3</span>
            <div className="flex flex-1 flex-wrap gap-2">
              <button onClick={downloadPdf} disabled={!!busy} className="rounded-full bg-[#0071e3] px-5 py-3 text-[15px] font-medium text-white disabled:opacity-40">
                PDF à imprimer
              </button>
              <button onClick={() => downloadImage("story")} disabled={!!busy} className="rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-white disabled:opacity-40">
                Image Story
              </button>
              <button onClick={() => downloadImage("post")} disabled={!!busy} className="rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-white disabled:opacity-40">
                Image Post
              </button>
            </div>
          </div>
        </>
      )}
      {busy && <p className="mt-3 text-[14px] text-muted">{busy}</p>}
    </section>
  )
}
