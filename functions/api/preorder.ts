/**
 * POST /api/preorder — Cloudflare Pages Function.
 *
 * Receives a pre-order from the site and writes it to the "Commandes" table
 * of the TrailDex Airtable base. The Airtable token lives only here, as an
 * environment secret (AIRTABLE_TOKEN), never in the code sent to browsers.
 *
 * With STRIPE_SECRET_KEY set, the order is then paid online: the response
 * carries a Stripe Checkout URL, and /api/stripe-webhook marks the order
 * "Payée" once Stripe confirms the payment. Without it, orders stay
 * pre-orders with no payment.
 */
import { buildRecord, validatePreorder, type PreorderPayload } from "../../src/lib/preorder"
import { checkoutParams, createCheckoutSession } from "../../src/lib/stripe"

type Env = {
  AIRTABLE_TOKEN: string
  AIRTABLE_BASE_ID?: string
  AIRTABLE_TABLE_ID?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
}

const BASE_ID = "appFtEAvDkYtjLleM"
const TABLE_ID = "tbl4QdVEf4WWnoE4P"
const PHOTO_FIELD_ID = "fldgc96Od5PWvGInP"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } })

/**
 * Tells the site whether orders are paid online, and which settings are in
 * place (yes/no only, never the values), to check the setup from outside.
 */
export const onRequestGet = ({ env }: { env: Env }) =>
  json({
    paiement: Boolean(env.STRIPE_SECRET_KEY),
    reglages: {
      airtable: Boolean(env.AIRTABLE_TOKEN),
      stripe: env.STRIPE_SECRET_KEY ? (env.STRIPE_SECRET_KEY.startsWith("sk_live_") ? "réel" : "test") : false,
      webhook: Boolean(env.STRIPE_WEBHOOK_SECRET),
    },
  })

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.AIRTABLE_TOKEN) return json({ error: "Le serveur n'est pas configuré." }, 500)

  let payload: PreorderPayload
  try {
    payload = await request.json()
  } catch {
    return json({ error: "Requête invalide." }, 400)
  }

  // Honeypot: real visitors never fill this hidden field.
  if (payload.website) return json({ ok: true, reference: "TD-OK" })

  const errors = validatePreorder(payload)
  if (errors.length) return json({ error: errors[0] }, 400)

  const baseId = env.AIRTABLE_BASE_ID || BASE_ID
  const tableId = env.AIRTABLE_TABLE_ID || TABLE_ID
  const reference = "TD-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 4).toUpperCase()
  const headers = { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "content-type": "application/json" }

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ records: [{ fields: buildRecord(payload, reference) }], typecast: true }),
  })
  if (!res.ok) {
    console.error("airtable create failed", res.status, await res.text())
    return json({ error: "La précommande n'a pas pu être enregistrée. Réessaie dans un instant." }, 502)
  }
  const created = (await res.json()) as { records: { id: string }[] }
  const recordId = created.records[0]?.id

  // The photo goes in as a real attachment so it is ready for printing.
  const photo = payload.photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if (recordId && photo && photo[2].length < 6_500_000) {
    const up = await fetch(`https://content.airtable.com/v0/${baseId}/${recordId}/${PHOTO_FIELD_ID}/uploadAttachment`, {
      method: "POST",
      headers,
      body: JSON.stringify({ contentType: photo[1], file: photo[2], filename: `${reference}.jpg` }),
    })
    if (!up.ok) console.error("airtable photo upload failed", up.status, await up.text())
  }

  if (env.STRIPE_SECRET_KEY && recordId) {
    try {
      const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, checkoutParams(payload, reference, recordId, new URL(request.url).origin))
      return json({ ok: true, reference, checkoutUrl: session.url })
    } catch (e) {
      console.error("stripe checkout failed", e)
      return json({ error: "Le paiement n'a pas pu être ouvert. Réessaie dans un instant." }, 502)
    }
  }

  return json({ ok: true, reference })
}
