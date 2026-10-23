/**
 * Invoices: drop the CSV export of the Airtable "Factures" table, get a .zip
 * with one PDF per invoice and the receipts book.
 */
import * as React from "react"
import { saveFile } from "@/lib/saveFile"
import { parseCsv } from "./ExaprintPanel"

type Invoice = import("@/lib/invoice").Invoice


export function InvoicePanel() {
  const [invoices, setInvoices] = React.useState<Invoice[] | null>(null)
  const [issues, setIssues] = React.useState<string[]>([])
  const [missing, setMissing] = React.useState<string[]>([])
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const loadCsv = async (file?: File) => {
    if (!file) return
    setError(null)
    const inv = await import("@/lib/invoice")
    const list = inv.toInvoices(parseCsv(await file.text()))
    setInvoices(list)
    setMissing(inv.missingCompanyInfo())
    setIssues(list.flatMap((i) => (inv.invoiceIssues(i).length ? [`${i.number} : ${inv.invoiceIssues(i).join(", ")}`] : [])))
    if (!list.length) setError("Aucune facture lisible. Exporte la table Factures en CSV (vue Grid view → Télécharger CSV).")
  }

  const generate = async () => {
    if (!invoices?.length) return
    setError(null)
    try {
      const inv = await import("@/lib/invoice")
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      for (const [n, i] of invoices.entries()) {
        setBusy(`Facture ${n + 1} / ${invoices.length}…`)
        zip.file(`${i.number}.pdf`, await inv.buildInvoicePdf(i))
      }
      zip.file("livre-des-recettes.csv", inv.receiptsBookCsv(invoices))
      await saveFile(await zip.generateAsync({ type: "blob" }), `traildex-factures-${new Date().toISOString().slice(0, 10)}.zip`, "application/zip")
    } catch (e) {
      console.error(e)
      setError("Les factures n'ont pas pu être générées.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line">
      <h2 className="text-[20px] font-semibold tracking-tight">Factures</h2>
      <p className="mt-1 text-[14px] text-muted">
        Dans Airtable, table Factures → Télécharger CSV, puis dépose le fichier ici. Tu obtiens un PDF par facture (à joindre dans la colonne PDF et à envoyer toi-même au
        client) et le livre des recettes.
      </p>
      <label className="mt-4 inline-block rounded-full bg-mist px-4 py-2 text-[14px] font-medium">
        CSV des factures… <input id="inv-csv" type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => loadCsv(e.target.files?.[0])} />
      </label>
      {invoices && invoices.length > 0 && (
        <div className="mt-4 rounded-xl bg-mist p-4 text-[14px]">
          <p>
            <strong>{invoices.length}</strong> facture(s) / avoir(s)
          </p>
          {missing.length > 0 && (
            <p className="mt-1 text-[#b25000]">
              Spécimens seulement : il manque {missing.join(", ")} dans <code>src/lib/config.ts</code> (COMPANY). Ne les envoie pas à un client.
            </p>
          )}
          {issues.length > 0 && <p className="mt-1 text-[#e30000]">Incomplètes : {issues.join(" · ")}</p>}
          <button onClick={generate} disabled={!!busy} className="mt-3 rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40">
            Générer les PDF et le livre des recettes (.zip)
          </button>
        </div>
      )}
      {busy && <p className="mt-3 text-[14px] text-muted">{busy}</p>}
      {error && <p className="mt-3 text-[14px] text-[#e30000]">{error}</p>}
    </section>
  )
}
