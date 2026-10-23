/**
 * Organiser edition: one card for a whole race, from the race's GPX, with the
 * organiser's and sponsor's logos and a QR code to the race page. The card is
 * previewed here, then handed to the Exaprint export below.
 */
import * as React from "react"
import type { CardData, Edition, Finish } from "@/lib/card"
import { readGpxFile, type TrackStats } from "@/lib/gpx"

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

function readDataUrl(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = () => rej(r.error)
    r.readAsDataURL(file)
  })
}

export function buildEditionCard(stats: TrackStats, race: string, date: string, finish: Finish, edition: Edition): CardData {
  return {
    id: `edition-${slug(race)}-${slug(edition.label)}`,
    runner: "",
    race,
    date,
    timeSec: null,
    rank: "",
    distanceKm: Math.round(stats.distanceKm * 10) / 10,
    gain: Math.round(stats.gain),
    maxEle: stats.maxEle != null ? Math.round(stats.maxEle) : null,
    routePath: stats.routePath,
    start: stats.start,
    end: stats.end,
    profileArea: stats.profileArea,
    profileLine: stats.profileLine,
    rarity: finish === "or" ? "legendaire" : "rare",
    number: 0,
    edition,
  }
}

function Preview({ card }: { card: CardData }) {
  const front = React.useRef<HTMLCanvasElement>(null)
  const back = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    let live = true
    ;(async () => {
      const { drawCardBack, drawCardFront, loadCardFonts } = await import("@/lib/cardCanvas")
      await loadCardFonts()
      // 55 × 85 mm, the Exaprint foil format, at 6 px/mm.
      const w = 330
      const h = 510
      for (const [ref, side] of [
        [front, "front"],
        [back, "back"],
      ] as const) {
        const cv = ref.current
        if (!cv || !live) return
        cv.width = w
        cv.height = h
        const ctx = cv.getContext("2d")!
        if (side === "front") await drawCardFront(ctx, card, 0, 0, w, { print: true, h })
        else await drawCardBack(ctx, card, 0, 0, w, { print: true, h })
      }
    })()
    return () => {
      live = false
    }
  }, [card])
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      <canvas ref={front} className="w-[165px] rounded-md shadow-lg" />
      <canvas ref={back} className="w-[165px] rounded-md shadow-lg" />
    </div>
  )
}

export function EditionPanel({ onUse }: { onUse: (card: CardData) => void }) {
  const [stats, setStats] = React.useState<TrackStats | null>(null)
  const [race, setRace] = React.useState("")
  const [date, setDate] = React.useState("")
  const [label, setLabel] = React.useState(`Édition ${new Date().getFullYear() + 1}`)
  const [place, setPlace] = React.useState("")
  const [copies, setCopies] = React.useState(300)
  const [finish, setFinish] = React.useState<Finish>("or")
  const [sponsorName, setSponsorName] = React.useState("")
  const [sponsorLogo, setSponsorLogo] = React.useState<string>()
  const [organizerLogo, setOrganizerLogo] = React.useState<string>()
  const [qrUrl, setQrUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const loadGpx = async (file?: File) => {
    if (!file) return
    setError(null)
    try {
      const s = await readGpxFile(file)
      setStats(s)
      if (!race && s.name) setRace(s.name)
      if (!date && s.date) setDate(s.date)
    } catch (e) {
      setError(e instanceof Error ? e.message : "GPX illisible.")
    }
  }

  const defaultQr = race ? `https://traildex.fr/c/${slug(race)}` : ""
  const card = React.useMemo(
    () =>
      stats && race
        ? buildEditionCard(stats, race, date, finish, {
            label,
            place: place || undefined,
            copies: copies || undefined,
            sponsorName: sponsorName || undefined,
            sponsorLogo,
            organizerLogo,
            qrUrl: qrUrl || defaultQr,
          })
        : null,
    [stats, race, date, finish, label, place, copies, sponsorName, sponsorLogo, organizerLogo, qrUrl, defaultQr],
  )

  const input = "h-10 rounded-lg border border-line bg-white px-3 text-[14px]"
  const field = "flex flex-col gap-1 text-[13px] font-medium"
  return (
    <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line">
      <h2 className="text-[20px] font-semibold tracking-tight">Édition course (organisateur)</h2>
      <p className="mt-1 text-[14px] text-muted">
        Une carte identique pour tous les finishers : GPX de la course, logos de l'organisateur et du partenaire, QR code vers la page de la course pour commander sa carte
        personnalisée.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={field}>
          GPX de la course
          <input id="ed-gpx" type="file" accept=".gpx" onChange={(e) => loadGpx(e.target.files?.[0])} className="text-[13px]" />
        </label>
        <label className={field}>
          Nom de la course
          <input id="ed-race" value={race} onChange={(e) => setRace(e.target.value)} className={input} />
        </label>
        <label className={field}>
          Date
          <input id="ed-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </label>
        <label className={field}>
          Lieu
          <input id="ed-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="ex. Munster, Vosges" className={input} />
        </label>
        <label className={field}>
          Édition
          <input id="ed-label" value={label} onChange={(e) => setLabel(e.target.value)} className={input} />
        </label>
        <label className={field}>
          Nombre de cartes (finishers)
          <input id="ed-copies" type="number" min={1} value={copies} onChange={(e) => setCopies(Math.max(0, +e.target.value || 0))} className={input} />
        </label>
        <label className={field}>
          Finition
          <select id="ed-finish" value={finish} onChange={(e) => setFinish(e.target.value as Finish)} className={input}>
            <option value="or">Or</option>
            <option value="holo">Holographique</option>
          </select>
        </label>
        <label className={field}>
          Lien du QR code
          <input id="ed-qr" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder={defaultQr || "https://…"} className={input} />
        </label>
        <label className={field}>
          Logo de l'organisateur
          <input id="ed-orga" type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setOrganizerLogo(await readDataUrl(e.target.files[0]))} className="text-[13px]" />
        </label>
        <label className={field}>
          Partenaire : nom
          <input id="ed-sponsor" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} className={input} />
        </label>
        <label className={field}>
          Partenaire : logo
          <input id="ed-sponsor-logo" type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setSponsorLogo(await readDataUrl(e.target.files[0]))} className="text-[13px]" />
        </label>
      </div>
      {error && <p className="mt-3 text-[14px] text-[#e30000]">{error}</p>}
      {card ? (
        <>
          <Preview card={card} />
          <div className="mt-4 flex justify-center">
            <button onClick={() => onUse(card)} className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white">
              Utiliser cette carte pour l'export Exaprint
            </button>
          </div>
        </>
      ) : (
        <p className="mt-4 text-[14px] text-muted">Charge le GPX et indique le nom de la course pour voir la carte.</p>
      )}
    </section>
  )
}
