/**
 * Print tool (/print.html): turns a card into print files.
 *
 * - "Imprimeur": one page per face, 69 × 94 mm = 63 × 88 mm card + 3 mm bleed.
 * - "A4 maison": both faces at real size on A4 with crop marks, to print at
 *   home and cut out.
 *
 * Paste the "Données carte (JSON)" cell of an Airtable order, add the photo
 * if any, then use the browser's Print → Save as PDF.
 */
import * as React from "react"
import { CardBack, CardFront, THEMES } from "@/components/TrailCard"
import type { CardData } from "@/lib/card"
import { RARITIES } from "@/lib/config"

const STORAGE_KEY = "traildex.print"
type Layout = "bleed" | "a4"

const W = 63
const H = 88
const BLEED = 3

function loadCard(): CardData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** One face with its bleed: the background runs 3 mm past the trim line. */
function Face({ card, side }: { card: CardData; side: "front" | "back" }) {
  const theme = THEMES[card.rarity]
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: `${W + 2 * BLEED}mm`, height: `${H + 2 * BLEED}mm`, background: side === "front" ? theme.bg : theme.backBg }}
    >
      <div className="absolute" style={{ left: `${BLEED}mm`, top: `${BLEED}mm`, width: `${W}mm`, height: `${H}mm`, containerType: "inline-size" }}>
        {side === "front" ? <CardFront card={card} theme={theme} transparent /> : <CardBack card={card} theme={theme} transparent />}
      </div>
    </div>
  )
}

/** Crop marks at the trim line, drawn outside the bleed. */
function CropMarks() {
  const len = 5
  const gap = 1
  const out = BLEED + gap
  const marks: React.CSSProperties[] = []
  for (const x of [BLEED, BLEED + W]) {
    marks.push({ left: `${x}mm`, top: `${-out - len + BLEED}mm`, width: 0, height: `${len}mm`, borderLeft: "0.2mm solid #000" })
    marks.push({ left: `${x}mm`, top: `${BLEED + H + out}mm`, width: 0, height: `${len}mm`, borderLeft: "0.2mm solid #000" })
  }
  for (const y of [BLEED, BLEED + H]) {
    marks.push({ top: `${y}mm`, left: `${-out - len + BLEED}mm`, height: 0, width: `${len}mm`, borderTop: "0.2mm solid #000" })
    marks.push({ top: `${y}mm`, left: `${BLEED + W + out}mm`, height: 0, width: `${len}mm`, borderTop: "0.2mm solid #000" })
  }
  return (
    <>
      {marks.map((m, i) => (
        <span key={i} className="absolute" style={m} />
      ))}
    </>
  )
}

export function PrintTool() {
  const [card, setCard] = React.useState<CardData | null>(loadCard)
  const [layout, setLayout] = React.useState<Layout>(() =>
    new URLSearchParams(location.search).get("layout") === "a4" ? "a4" : "bleed",
  )
  const [json, setJson] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const apply = (c: CardData) => {
    setCard(c)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
    } catch {
      /* photo too large for storage: keep it in memory only */
    }
  }

  const fromJson = () => {
    try {
      const c = JSON.parse(json) as CardData
      if (!c.rarity || !RARITIES[c.rarity]) throw new Error()
      apply({ ...c, photo: card?.photo ?? c.photo })
      setError(null)
    } catch {
      setError("JSON invalide : colle le contenu de la colonne « Données carte (JSON) ».")
    }
  }

  const onPhoto = (file?: File) => {
    if (!file || !card) return
    const r = new FileReader()
    r.onload = () => apply({ ...card, photo: String(r.result) })
    r.readAsDataURL(file)
  }

  const pageCss =
    layout === "bleed"
      ? `@page { size: ${W + 2 * BLEED}mm ${H + 2 * BLEED}mm; margin: 0 }`
      : `@page { size: A4; margin: 0 }`

  return (
    <div className="min-h-screen bg-mist print:bg-white">
      <style>{`${pageCss}
        @media print { html, body { background: #fff } .sheet { box-shadow: none !important; margin: 0 !important } }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact }`}</style>

      <div className="mx-auto max-w-3xl px-5 py-8 print:hidden">
        <h1 className="text-[28px] font-semibold tracking-tight">Fichier d'impression</h1>
        <p className="mt-1 text-[15px] text-muted">
          Colle les données d'une commande Airtable, choisis la mise en page, puis Imprimer → Enregistrer en PDF (échelle 100 %, sans marges).
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["bleed", "a4"] as Layout[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={"rounded-full px-4 py-2 text-[14px] font-medium " + (layout === l ? "bg-ink text-white" : "bg-white ring-1 ring-line")}
            >
              {l === "bleed" ? "Imprimeur (fond perdu 3 mm)" : "A4 maison (traits de coupe)"}
            </button>
          ))}
          <button onClick={() => window.print()} disabled={!card} className="rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40">
            Imprimer / PDF
          </button>
        </div>
        <textarea
          id="print-json"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='{"runner":"…","race":"…", …}'
          className="mt-5 h-28 w-full rounded-xl border border-line p-3 font-mono text-[12px]"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button onClick={fromJson} className="rounded-full bg-white px-4 py-2 text-[14px] ring-1 ring-line">
            Charger la carte
          </button>
          <label className="text-[14px] text-muted">
            Photo : <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
        </div>
        {error && <p className="mt-2 text-[14px] text-[#e30000]">{error}</p>}
      </div>

      {card &&
        (layout === "bleed" ? (
          <div className="flex flex-col items-center gap-8 pb-10 print:block print:p-0">
            {(["front", "back"] as const).map((side) => (
              <div key={side} className="sheet w-fit shadow-xl" style={{ breakAfter: "page" }}>
                <Face card={card} side={side} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center pb-10 print:block print:p-0">
            <div className="sheet relative bg-white shadow-xl" style={{ width: "210mm", height: "297mm" }}>
              <div className="absolute text-[#1d1d1f]" style={{ left: "18mm", top: "16mm", right: "18mm" }}>
                <p className="text-[14pt] font-semibold">
                  TrailDex — {card.race} · {card.runner} · {RARITIES[card.rarity].label}
                </p>
                <p className="mt-1 text-[9pt] text-[#6e6e73]">
                  Imprimer à 100 % (taille réelle), papier 250 à 350 g. Découper sur les traits de coupe (63 × 88 mm), arrondir les coins à 3 mm, puis coller le recto et le
                  verso dos à dos. Les finitions Holo et Or sont simulées : seul un imprimeur peut poser le vrai film ou la dorure.
                </p>
              </div>
              {(["front", "back"] as const).map((side, i) => (
                <div key={side} className="absolute" style={{ left: `${24 + i * 90}mm`, top: "52mm" }}>
                  <CropMarks />
                  <Face card={card} side={side} />
                  <p className="mt-[8mm] text-center text-[9pt] text-[#6e6e73]">{side === "front" ? "Recto" : "Verso"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
