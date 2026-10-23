/**
 * Stripe Checkout, called from the Cloudflare functions with fetch (no SDK,
 * so it runs as is on Workers). Prices always come from FINISHES on the
 * server, never from the browser.
 */
import { FINISHES } from "./config"
import type { PreorderPayload } from "./preorder"

/** Stripe's form encoding, with nested keys written as a[b][c]. */
export function formEncode(obj: Record<string, unknown>, prefix = ""): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === "object") parts.push(formEncode(v as Record<string, unknown>, key))
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
  }
  return parts.filter(Boolean).join("&")
}

export function checkoutParams(p: PreorderPayload, reference: string, recordId: string, origin: string) {
  const finish = FINISHES.find((f) => f.id === p.finish)!
  return {
    mode: "payment",
    locale: "fr",
    customer_email: p.email.trim(),
    client_reference_id: reference,
    line_items: {
      0: {
        quantity: p.qty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(finish.price * 100),
          product_data: {
            name: `Carte TrailDex ${finish.name}`,
            description: `${p.card.race} · ${p.card.runner}`.slice(0, 250),
          },
        },
      },
    },
    metadata: { reference, record_id: recordId },
    payment_intent_data: { description: `TrailDex ${reference}`, metadata: { reference, record_id: recordId } },
    success_url: `${origin}/?commande=${encodeURIComponent(reference)}`,
    cancel_url: `${origin}/?paiement=annule`,
  }
}

export async function createCheckoutSession(secretKey: string, params: Record<string, unknown>) {
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}`, "content-type": "application/x-www-form-urlencoded" },
    body: formEncode(params),
  })
  const body = (await res.json()) as { id?: string; url?: string; error?: { message?: string } }
  if (!res.ok || !body.url) throw new Error(body.error?.message || `Stripe ${res.status}`)
  return { id: body.id!, url: body.url }
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")

/**
 * Checks the Stripe-Signature header (t=…,v1=…): HMAC-SHA256 of "t.body"
 * with the endpoint's signing secret, at most `tolerance` seconds old.
 */
export async function verifyStripeSignature(body: string, header: string | null, secret: string, tolerance = 300, now = Date.now() / 1000) {
  if (!header) return false
  const parts = header.split(",").map((s) => s.split("=") as [string, string])
  const t = Number(parts.find(([k]) => k === "t")?.[1])
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v)
  if (!t || !sigs.length || Math.abs(now - t) > tolerance) return false
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${body}`)))
  // Constant-time comparison.
  return sigs.some((s) => s.length === expected.length && [...s].reduce((d, c, i) => d | (c.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0)
}
