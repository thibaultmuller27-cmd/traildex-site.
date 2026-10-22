/**
 * Invoices and the cash-receipts book, from the Airtable "Factures" table.
 *
 * Input is the CSV export of a Factures view. Each row becomes a one-page A4
 * PDF with the mentions a French micro-entrepreneur under the VAT franchise
 * must print. The receipts book lists payments in date order, as the micro
 * regime requires, with monthly totals for the turnover declaration.
 */
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import { COMPANY } from "./config"

export type Invoice = {
  number: string
  type: "Facture" | "Avoir"
  date: string
  saleDate: string
  client: string
  email: string
  address: string
  designation: string
  qty: number
  unitPrice: number
  shipping: number
  status: string
  paidOn: string
  paymentMethod: string
  origin: string
}

/** "€14.90", "14,90 €", "-14.9" → number. */
export function parseAmount(s: string | undefined): number {
  if (!s) return 0
  let t = s.replace(/[^\d,.-]/g, "")
  if (t.includes(",") && !t.includes(".")) t = t.replace(",", ".")
  else t = t.replace(/,/g, "")
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : 0
}

/** "22/10/2026" or "2026-10-22" → "2026-10-22" (empty if unreadable). */
export function parseDate(s: string | undefined): string {
  const t = (s ?? "").trim()
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const eu = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (eu) return `${eu[3]}-${eu[2].padStart(2, "0")}-${eu[1].padStart(2, "0")}`
  return ""
}

export const fmtDateFr = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "")
export const fmtEur = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
export const invoiceTotal = (i: Invoice) => Math.round((i.qty * i.unitPrice + i.shipping) * 100) / 100

export function toInvoices(rows: Record<string, string>[]): Invoice[] {
  return rows
    .filter((r) => (r["N° facture"] ?? "").trim())
    .map((r) => ({
      number: r["N° facture"].trim(),
      type: r["Type"] === "Avoir" ? "Avoir" : "Facture",
      date: parseDate(r["Date de facture"]),
      saleDate: parseDate(r["Date de vente"]),
      client: r["Client"] ?? "",
      email: r["E-mail client"] ?? "",
      address: r["Adresse client"] ?? "",
      designation: r["Désignation"] ?? "",
      qty: parseInt(r["Quantité"] || "1", 10) || 1,
      unitPrice: parseAmount(r["Prix unitaire"]),
      shipping: parseAmount(r["Frais de port"]),
      status: r["Statut paiement"] ?? "",
      paidOn: parseDate(r["Date de paiement"]),
      paymentMethod: r["Mode de paiement"] ?? "",
      origin: r["Facture d'origine"] ?? "",
    }))
}

/** What still blocks a real (non-specimen) invoice. */
export function missingCompanyInfo(): string[] {
  const missing: string[] = []
  if (!COMPANY.siret.trim()) missing.push("SIRET")
  if (!COMPANY.address.trim()) missing.push("adresse")
  if (!COMPANY.email.trim()) missing.push("e-mail")
  return missing
}

/** Problems on one invoice row that would make it non-compliant. */
export function invoiceIssues(i: Invoice): string[] {
  const issues: string[] = []
  if (!i.date) issues.push("date de facture")
  if (!i.client.trim()) issues.push("client")
  if (!i.address.trim()) issues.push("adresse client")
  if (!i.designation.trim()) issues.push("désignation")
  if (!i.unitPrice) issues.push("prix")
  if (i.type === "Avoir" && !i.origin.trim()) issues.push("facture d'origine")
  return issues
}

const INK = rgb(0.11, 0.11, 0.12)
const MUTED = rgb(0.43, 0.43, 0.45)
const LINE = rgb(0.82, 0.82, 0.84)

/** Helvetica only covers WinAnsi: replace what it cannot draw rather than fail. */
const FALLBACK: Record<string, string> = { Ł: "L", ł: "l", Đ: "D", đ: "d", Ħ: "H", ħ: "h", ı: "i" }
function safe(font: PDFFont, text: string) {
  const ok = (c: string) => {
    try {
      font.encodeText(c)
      return true
    } catch {
      return false
    }
  }
  return [...text.replace(/\r/g, "")]
    .map((c) => {
      if (c === "\n" || ok(c)) return c
      const plain = FALLBACK[c] ?? c.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return plain && [...plain].every(ok) ? plain : "?"
    })
    .join("")
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const lines: string[] = []
  for (const para of text.split("\n")) {
    let line = ""
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else line = next
    }
    lines.push(line)
  }
  return lines
}

export async function buildInvoicePdf(inv: Invoice): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const page: PDFPage = doc.addPage([595.28, 841.89])
  const M = 56
  const W = 595.28 - 2 * M
  const text = (t: string, x: number, y: number, size = 10, f = font, color = INK) =>
    page.drawText(safe(f, t), { x, y, size, font: f, color })
  const right = (t: string, xr: number, y: number, size = 10, f = font, color = INK) =>
    text(t, xr - f.widthOfTextAtSize(safe(f, t), size), y, size, f, color)
  const specimen = missingCompanyInfo().length > 0
  const isCredit = inv.type === "Avoir"
  doc.setTitle(`${inv.type} ${inv.number}`)
  doc.setCreator("TrailDex")

  if (specimen) {
    page.drawText("SPÉCIMEN", { x: 120, y: 330, size: 90, font: bold, color: rgb(0.9, 0.9, 0.92), rotate: degrees(35) })
  }

  // Seller
  let y = 785
  text(COMPANY.tradeName, M, y, 20, bold)
  y -= 18
  for (const l of [
    `${COMPANY.name} — ${COMPANY.legalForm}`,
    ...(COMPANY.address ? COMPANY.address.split("\n") : ["Adresse à compléter"]),
    COMPANY.siret ? `SIRET ${COMPANY.siret}` : "SIRET à compléter",
    COMPANY.email || "",
  ].filter(Boolean)) {
    text(l, M, y, 9, font, MUTED)
    y -= 12
  }

  // Title block
  right(isCredit ? "AVOIR" : "FACTURE", M + W, 785, 20, bold)
  right(`N° ${inv.number}`, M + W, 767, 11, bold)
  right(`Date : ${fmtDateFr(inv.date)}`, M + W, 753, 9, font, MUTED)
  if (inv.saleDate) right(`Date de la vente : ${fmtDateFr(inv.saleDate)}`, M + W, 741, 9, font, MUTED)
  if (isCredit && inv.origin) right(`Annule / rembourse : ${inv.origin}`, M + W, 729, 9, font, MUTED)

  // Client
  y = 680
  text("Facturé à", M, y, 9, bold, MUTED)
  y -= 15
  for (const l of [inv.client, ...inv.address.split("\n"), inv.email].filter((s) => s && s.trim())) {
    text(l.trim(), M, y, 10)
    y -= 13
  }

  // Lines
  y = 560
  const cols = { qty: M + W - 190, unit: M + W - 95, total: M + W }
  text("Désignation", M, y, 9, bold, MUTED)
  right("Qté", cols.qty, y, 9, bold, MUTED)
  right("Prix unitaire", cols.unit, y, 9, bold, MUTED)
  right("Total", cols.total, y, 9, bold, MUTED)
  y -= 8
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.6, color: LINE })
  y -= 16
  const desc = wrap(font, safe(font, inv.designation || "Carte de collection TrailDex"), 10, W - 250)
  right(String(inv.qty), cols.qty, y, 10)
  right(fmtEur(inv.unitPrice), cols.unit, y, 10)
  right(fmtEur(inv.qty * inv.unitPrice), cols.total, y, 10)
  for (const l of desc) {
    text(l, M, y, 10)
    y -= 13
  }
  if (inv.shipping) {
    y -= 4
    text("Frais de livraison", M, y, 10)
    right(fmtEur(inv.shipping), cols.total, y, 10)
    y -= 13
  }
  y -= 6
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.6, color: LINE })

  // Totals (franchise: HT = TTC)
  y -= 22
  const total = invoiceTotal(inv)
  right("Total HT", cols.unit, y, 10, font, MUTED)
  right(fmtEur(total), cols.total, y, 10)
  y -= 15
  right("TVA", cols.unit, y, 10, font, MUTED)
  right(fmtEur(0), cols.total, y, 10)
  y -= 18
  right(isCredit ? "Total à rembourser" : "Total TTC", cols.unit, y, 12, bold)
  right(fmtEur(Math.abs(total)), cols.total, y, 12, bold)
  y -= 22
  right(COMPANY.vatMention, M + W, y, 9, font, MUTED)

  // Payment
  y -= 40
  if (!isCredit) {
    const paid = inv.status === "Payée" && inv.paidOn
    text(
      paid
        ? `Payée le ${fmtDateFr(inv.paidOn)}${inv.paymentMethod ? ` par ${inv.paymentMethod.toLowerCase()}` : ""}.`
        : "Paiement à réception de la facture. Pas d'escompte pour paiement anticipé.",
      M,
      y,
      10,
    )
  }

  // Footer
  const foot = [`${COMPANY.tradeName} — ${COMPANY.name}, ${COMPANY.legalForm}${COMPANY.siret ? ` — SIRET ${COMPANY.siret}` : ""}`, COMPANY.vatMention]
  foot.forEach((l, i) => text(l, M, 60 - i * 12, 8, font, MUTED))
  if (specimen) text(`Spécimen : à compléter avant envoi (${missingCompanyInfo().join(", ")}).`, M, 36, 8, bold, rgb(0.8, 0.2, 0.1))
  return doc.save()
}

/** Livre des recettes: payments in date order, with monthly totals (CSV, Excel-friendly). */
export function receiptsBookCsv(invoices: Invoice[]) {
  const paid = invoices
    .filter((i) => i.paidOn && (i.status === "Payée" || i.status === "Remboursée" || i.type === "Avoir"))
    .sort((a, b) => a.paidOn.localeCompare(b.paidOn) || a.number.localeCompare(b.number))
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`
  const amount = (n: number) => n.toFixed(2).replace(".", ",")
  const lines = [["Date d'encaissement", "N° de pièce", "Client", "Nature", "Montant", "Mode de règlement"].map(q).join(";")]
  const months = new Map<string, number>()
  for (const i of paid) {
    const total = invoiceTotal(i)
    lines.push([fmtDateFr(i.paidOn), i.number, i.client, i.type === "Avoir" ? "Remboursement (avoir)" : "Vente de marchandises", amount(total), i.paymentMethod].map(q).join(";"))
    months.set(i.paidOn.slice(0, 7), (months.get(i.paidOn.slice(0, 7)) ?? 0) + total)
  }
  lines.push("", q("Totaux par mois (chiffre d'affaires encaissé)"))
  for (const [m, t] of [...months].sort()) lines.push([q(m.split("-").reverse().join("/")), amount(t)].join(";"))
  return "﻿" + lines.join("\r\n")
}
