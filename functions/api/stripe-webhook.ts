/**
 * POST /api/stripe-webhook — Stripe calls this when a Checkout session ends.
 *
 * - paid (checkout.session.completed with payment_status "paid", or
 *   checkout.session.async_payment_succeeded): the order becomes "Payée",
 *   with the payment ID, date and amount. The Airtable automation
 *   "Commande payée → facture" then creates the invoice.
 * - never paid (checkout.session.expired, async_payment_failed): an order
 *   still "Nouvelle" becomes "Annulée".
 *
 * Every call is checked against STRIPE_WEBHOOK_SECRET (the endpoint's
 * signing secret in Stripe), so nobody else can mark an order as paid.
 */
import { verifyStripeSignature } from "../../src/lib/stripe"

type Env = {
  AIRTABLE_TOKEN: string
  AIRTABLE_BASE_ID?: string
  AIRTABLE_TABLE_ID?: string
  STRIPE_WEBHOOK_SECRET?: string
}

type Session = {
  id: string
  payment_status?: string
  payment_intent?: string | null
  amount_total?: number | null
  created?: number
  metadata?: { record_id?: string; reference?: string }
}

const BASE_ID = "appFtEAvDkYtjLleM"
const TABLE_ID = "tbl4QdVEf4WWnoE4P"
const F = {
  status: "fldxhycISmd6YgN8r",
  paymentId: "fld8AvhpI0lyrkn5P",
  paidOn: "fldnIFZ8mrKHaChFT",
  paidAmount: "fldpSrRVCw2RMIHoG",
}

const text = (body: string, status = 200) => new Response(body, { status })

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.AIRTABLE_TOKEN) return text("not configured", 500)
  const body = await request.text()
  if (!(await verifyStripeSignature(body, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET))) {
    return text("bad signature", 400)
  }

  const event = JSON.parse(body) as { type: string; data: { object: Session } }
  const s = event.data.object
  const recordId = s.metadata?.record_id
  // Events for other Stripe products, or sessions not made by the site.
  if (!recordId) return text("ignored")

  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID || BASE_ID}/${env.AIRTABLE_TABLE_ID || TABLE_ID}/${recordId}`
  const headers = { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "content-type": "application/json" }
  const update = async (fields: Record<string, unknown>) => {
    const res = await fetch(url, { method: "PATCH", headers, body: JSON.stringify({ fields, typecast: true }) })
    if (!res.ok) throw new Error(`airtable ${res.status} ${await res.text()}`)
  }

  try {
    const paid =
      (event.type === "checkout.session.completed" && s.payment_status === "paid") || event.type === "checkout.session.async_payment_succeeded"
    if (paid) {
      await update({
        [F.status]: "Payée",
        [F.paymentId]: s.payment_intent ?? s.id,
        [F.paidOn]: new Date().toISOString().slice(0, 10),
        [F.paidAmount]: s.amount_total != null ? s.amount_total / 100 : undefined,
      })
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      // Only cancel an order nobody has touched since: never undo a payment
      // or a manual change.
      const res = await fetch(`${url}?returnFieldsByFieldId=true`, { headers })
      const rec = (await res.json()) as { fields?: Record<string, unknown> }
      if (res.ok && rec.fields?.[F.status] === "Nouvelle") await update({ [F.status]: "Annulée" })
    }
  } catch (e) {
    // A non-2xx answer makes Stripe retry the event later.
    console.error("stripe webhook", event.type, s.metadata?.reference, e)
    return text("airtable error", 500)
  }
  return text("ok")
}
