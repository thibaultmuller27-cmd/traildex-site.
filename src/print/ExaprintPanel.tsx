/**
 * Exaprint export: one PDF per card with the foil layer, either for the card
 * loaded in the print tool or for a whole batch exported from Airtable.
 */
import * as React from "react"
import type { CardData } from "@/lib/card"
import { RARITIES } from "@/lib/config"

type Settings = import("@/lib/exaprint").PrintSettings
type BatchOrder = import("@/lib/exaprint").BatchOrder
type CmykProfile = import("@/lib/cmyk").CmykProfile

const SETTINGS_KEY = "traildex.exaprint.settings"

/** RFC 4180 CSV, as Airtable exports it (quoted fields, "" escapes, newlines inside quotes). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...body] = rows.filter((r) => r.some((v) => v.trim()))
  if (!header) return []
  const keys = header.map((h) => h.replace(/^﻿/, "").trim())
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])))
}

function toOrders(rows: Record<string, string>[]): { orders: BatchOrder[]; skipped: string[] } {
  const orders: BatchOrder[] = []
  const skipped: string[] = []
  for (const r of rows) {
    const ref = r["Référence"] || "?"
    try {
      const card = JSON.parse(r["Données carte (JSON)"]) as CardData
      if (!card.rarity || !RARITIES[card.rarity] || !card.routePath) throw new Error()
      orders.push({
        reference: ref,
        name: r["Nom"] ?? "",
        email: r["E-mail"] ?? "",
        address: r["Adresse"] ?? "",
        zip: r["Code postal"] ?? "",
        city: r["Ville"] ?? "",
        qty: Math.max(1, parseInt(r["Quantité"] || "1", 10) || 1),
        finish: r["Finition"] || "Holo",
        card: { ...card, id: card.id === "draft" ? ref : card.id },
      })
    } catch {
      skipped.push(ref)
    }
  }
  return { orders, skipped }
}

function download(data: Uint8Array | Blob, name: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export function ExaprintPanel({ card }: { card: CardData | null }) {
  const [settings, setSettings] = React.useState<Settings>(() => {
    const defaults = { widthMm: 63, heightMm: 88, bleedMm: 3, spotGold: "Dorure Or", spotHolo: "Dorure Holographique", dpi: 600, foilMode: "separate" as const }
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }
    } catch {
      return defaults
    }
  })
  const [busy, setBusy] = React.useState<string | null>(null)
  const [batch, setBatch] = React.useState<{ orders: BatchOrder[]; skipped: string[] } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [cmyk, setCmyk] = React.useState<CmykProfile | null>(null)
  const [maxInk, setMaxInk] = React.useState<number | null>(null)

  // Reload the CMYK profile chosen on a previous visit.
  React.useEffect(() => {
    ;(async () => {
      const { loadSavedProfileBytes, loadCmykProfile } = await import("@/lib/cmyk")
      const icc = await loadSavedProfileBytes()
      if (icc) setCmyk(await loadCmykProfile(icc).catch(() => null))
    })()
  }, [])

  const loadIcc = async (file?: File) => {
    if (!file) return
    setError(null)
    try {
      const { loadCmykProfile, saveProfileBytes } = await import("@/lib/cmyk")
      const icc = new Uint8Array(await file.arrayBuffer())
      setCmyk(await loadCmykProfile(icc))
      await saveProfileBytes(icc).catch(() => undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profil ICC illisible.")
    }
  }

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const exportOne = async () => {
    if (!card) return
    setBusy("Génération du PDF…")
    setError(null)
    try {
      const { buildCardFiles } = await import("@/lib/exaprint")
      const files = await buildCardFiles(card, settings, undefined, cmyk ?? undefined)
      setMaxInk(files.maxInk ?? null)
      download(files.print, `traildex-${card.id}-impression.pdf`, "application/pdf")
      if (files.foil) download(files.foil, `traildex-${card.id}-dorure.pdf`, "application/pdf")
    } catch (e) {
      console.error(e)
      setError("Le PDF n'a pas pu être généré.")
    } finally {
      setBusy(null)
    }
  }

  const loadCsv = async (file?: File) => {
    if (!file) return
    setError(null)
    const result = toOrders(parseCsv(await file.text()))
    setBatch(result)
    if (!result.orders.length) setError("Aucune commande lisible dans ce fichier. Exporte la vue « À imprimer » de la table Commandes en CSV.")
  }

  const exportBatch = async () => {
    if (!batch?.orders.length) return
    setError(null)
    try {
      const ex = await import("@/lib/exaprint")
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      const sets = ex.groupIntoSets(batch.orders)
      let n = 0
      let worst = 0
      for (const set of sets) {
        const folder = zip.folder(ex.setFolder(set))!
        for (const [i, o] of set.orders.entries()) {
          setBusy(`Carte ${++n} / ${batch.orders.length}…`)
          const files = await ex.buildCardFiles(o.card, settings, o.reference, cmyk ?? undefined)
          worst = Math.max(worst, files.maxInk ?? 0)
          if (files.foil) {
            folder.file(ex.cardFileName(o, i, "impression"), files.print)
            folder.file(ex.cardFileName(o, i, "dorure"), files.foil)
          } else folder.file(ex.cardFileName(o, i), files.print)
        }
      }
      setBusy("Bordereau…")
      zip.file("bordereau.pdf", await ex.buildPackingSlip(sets))
      zip.file("LISEZ-MOI.txt", ex.readme(sets, settings, cmyk?.name))
      setMaxInk(cmyk ? worst : null)
      const blob = await zip.generateAsync({ type: "blob" })
      download(blob, `traildex-lot-${new Date().toISOString().slice(0, 10)}.zip`, "application/zip")
    } catch (e) {
      console.error(e)
      setError("Le lot n'a pas pu être généré.")
    } finally {
      setBusy(null)
    }
  }

  const input = "h-10 rounded-lg border border-line bg-white px-3 text-[14px]"
  return (
    <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line">
      <h2 className="text-[20px] font-semibold tracking-tight">Export Exaprint</h2>
      <p className="mt-1 text-[14px] text-muted">
        Par carte : un PDF d'impression (recto, verso, 1:1 avec fond perdu) et, pour les cartes Holo et Or, un PDF de dorure en noir 100 % K, comme le demande le guide
        Exaprint. Recopie le fond perdu du gabarit Exaprint.
      </p>
      <div className="mt-4 rounded-xl bg-mist p-4 text-[14px]">
        <p className="font-medium">Profil couleur CMJN</p>
        {cmyk ? (
          <p className="mt-1 text-muted">
            {cmyk.name} : les fichiers sont convertis en CMJN.{maxInk !== null && <> Encrage maximal du dernier export : {maxInk} %.</>}
          </p>
        ) : (
          <p className="mt-1 text-[#b25000]">
            Aucun profil : les fichiers restent en RVB. Choisis ISOcoated_v2_300_eci.icc (archive « ECI Offset 2009 » sur eci.org), il est gardé dans ce navigateur.
          </p>
        )}
        <label className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[14px] font-medium ring-1 ring-line">
          {cmyk ? "Changer de profil…" : "Choisir le profil .icc…"}
          <input id="ex-icc" type="file" accept=".icc,.icm" className="hidden" onChange={(e) => loadIcc(e.target.files?.[0])} />
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-[13px] font-medium">
          Largeur (mm)
          <input id="ex-w" type="number" step="0.5" min="40" max="105" value={settings.widthMm} onChange={(e) => update({ widthMm: +e.target.value || 63 })} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-medium">
          Hauteur (mm)
          <input id="ex-h" type="number" step="0.5" min="40" max="210" value={settings.heightMm} onChange={(e) => update({ heightMm: +e.target.value || 88 })} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-medium">
          Fond perdu (mm)
          <input id="ex-bleed" type="number" step="0.5" min="0" max="5" value={settings.bleedMm} onChange={(e) => update({ bleedMm: Math.max(0, +e.target.value || 0) })} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-medium">
          Fichier de dorure
          <select id="ex-foil" value={settings.foilMode} onChange={(e) => update({ foilMode: e.target.value as Settings["foilMode"] })} className={input}>
            <option value="separate">Fichier séparé, 100 % K</option>
            <option value="layer">Calque « Acabado »</option>
          </select>
        </label>
        {settings.foilMode === "layer" && (
          <>
            <label className="flex flex-col gap-1 text-[13px] font-medium">
              Couleur directe Or
              <input id="ex-gold" value={settings.spotGold} onChange={(e) => update({ spotGold: e.target.value })} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-medium">
              Couleur directe Holo
              <input id="ex-holo" value={settings.spotHolo} onChange={(e) => update({ spotHolo: e.target.value })} className={input} />
            </label>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={exportOne} disabled={!card || !!busy} className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40">
          PDF Exaprint de cette carte
        </button>
        <label className="rounded-full bg-mist px-4 py-2 text-[14px] font-medium">
          Lot depuis Airtable (CSV)… <input id="ex-csv" type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => loadCsv(e.target.files?.[0])} />
        </label>
      </div>

      {batch && batch.orders.length > 0 && (
        <div className="mt-4 rounded-xl bg-mist p-4 text-[14px]">
          <p>
            <strong>{batch.orders.length}</strong> commande(s) prête(s)
            {batch.skipped.length > 0 && <span className="text-[#e30000]"> · ignorée(s) : {batch.skipped.join(", ")}</span>}
          </p>
          <button onClick={exportBatch} disabled={!!busy} className="mt-3 rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40">
            Générer le lot (.zip)
          </button>
        </div>
      )}
      {busy && <p className="mt-3 text-[14px] text-muted">{busy}</p>}
      {error && <p className="mt-3 text-[14px] text-[#e30000]">{error}</p>}
    </section>
  )
}
