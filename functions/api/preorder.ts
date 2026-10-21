/**
 * POST /api/preorder — Cloudflare Pages Function.
 *
 * Receives a pre-order from the site and writes it to the "Commandes" table
 * of the TrailDex Airtable base. The Airtable token lives only here, as an
 * environment secret (AIRTABLE_TOKEN), never in the code sent to browsers.
 */
import { buildRecord, validatePreorder, type PreorderPayload } from "../../src/lib/preorder"

type Env = {
  AIRTABLE_TOKEN: string
  AIRTABLE_BASE_ID?: string
  AIRTABLE_TABLE_ID?: string
}

const BASE_ID = "appFtEAvDkYtjLleM"
const TABLE_ID = "tbl4QdVEf4WWnoE4P"
const PHOTO_FIELD_ID = "fldgc96Od5PWvGInP"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } })

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

  return json({ ok: true, reference })
}
