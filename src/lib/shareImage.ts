/**
 * Renders a card as a shareable PNG (Instagram Story 9:16 or post 4:5),
 * entirely in the browser.
 */
import { drawCardFront, loadCardFonts, roundRect, SANS } from "./cardCanvas"
import { RARITIES } from "./config"
import { fmtDate, fmtDuration, fmtInt, fmtKm, type CardData, type Rarity } from "./card"

export type ShareFormat = "story" | "post"

export const FORMATS: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story · 9:16" },
  post: { w: 1080, h: 1350, label: "Post · 4:5" },
}

/** The glow behind the card on the share backdrop. */
const GLOW: Record<Rarity, string> = {
  commune: "rgba(226,86,43,0.35)",
  rare: "rgba(80,170,255,0.45)",
  epique: "rgba(220,90,255,0.5)",
  legendaire: "rgba(255,190,80,0.45)",
}

export async function renderShareImage(card: CardData, format: ShareFormat): Promise<Blob> {
  await loadCardFonts()

  const { w: W, h: H } = FORMATS[format]
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!

  // Backdrop: near-black with the card's colour glowing behind it
  ctx.fillStyle = "#0a0a0b"
  ctx.fillRect(0, 0, W, H)
  const cardW = format === "story" ? 760 : 640
  const cardH = cardW * 1.4
  const cardX = (W - cardW) / 2
  const cardY = format === "story" ? 360 : 200
  const glow = ctx.createRadialGradient(W / 2, cardY + cardH / 2, 0, W / 2, cardY + cardH / 2, W * 0.85)
  glow.addColorStop(0, GLOW[card.rarity])
  glow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Top line
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.font = `700 34px ${SANS}`
  ctx.textBaseline = "alphabetic"
  const top = format === "story" ? 190 : 110
  ctx.textAlign = "center"
  ctx.fillText("Ma carte TrailDex", W / 2, top)
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = `500 26px ${SANS}`
  const sub = [card.race, fmtDate(card.date)].filter(Boolean).join(" · ")
  ctx.fillText(sub, W / 2, top + 48)

  // Card with a soft shadow
  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.6)"
  ctx.shadowBlur = 80
  ctx.shadowOffsetY = 40
  roundRect(ctx, cardX, cardY, cardW, cardH, cardW * 0.045)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.restore()
  await drawCardFront(ctx, card, cardX, cardY, cardW)

  // Footer call to action
  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.font = `600 32px ${SANS}`
  const foot = cardY + cardH + (format === "story" ? 170 : 90)
  ctx.fillText("Crée la tienne sur traildex.fr", W / 2, foot)
  ctx.textAlign = "left"

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"),
  )
}

/** Caption for Instagram or a Strava activity description. */
export function shareCaption(card: CardData) {
  const parts = [
    card.distanceKm != null && `${fmtKm(card.distanceKm)} km`,
    card.gain != null && `${fmtInt(card.gain)} m D+`,
    card.timeSec && `en ${fmtDuration(card.timeSec)}`,
  ].filter(Boolean)
  return `Ma carte TrailDex ${RARITIES[card.rarity].label} : ${card.race}${parts.length ? ` — ${parts.join(", ")}` : ""}. Crée la tienne sur traildex.fr #trail #trailrunning #traildex`
}
