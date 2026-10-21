import * as React from "react"
import { Activity, Camera, Check, Copy, Download, Loader2, Share2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FORMATS, renderShareImage, shareCaption, type ShareFormat } from "@/lib/shareImage"
import type { CardData } from "@/lib/card"
import { cn } from "@/lib/utils"

type Props = { open: boolean; onOpenChange: (o: boolean) => void; card: CardData }

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "carte"

export function ShareDialog({ open, onOpenChange, card }: Props) {
  const [format, setFormat] = React.useState<ShareFormat>("story")
  const [image, setImage] = React.useState<{ url: string; file: File } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const caption = shareCaption(card)
  const cardKey = JSON.stringify(card)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    let url = ""
    setImage(null)
    setError(null)
    renderShareImage(card, format)
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        const file = new File([blob], `traildex-${slug(card.race)}-${format}.png`, { type: "image/png" })
        setImage({ url, file })
      })
      .catch(() => !cancelled && setError("L'image n'a pas pu être générée."))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, format, cardKey])

  const canShareFile = !!image && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [image.file] })

  const share = async () => {
    if (!image) return
    try {
      await navigator.share({ files: [image.file], title: "Ma carte TrailDex" })
    } catch {
      /* the person closed the share sheet */
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(820px,calc(100vw-2rem))]">
        <DialogTitle className="pr-10 text-[28px] font-semibold tracking-tight">Partager ma carte</DialogTitle>
        <DialogDescription className="mt-1 text-[15px] text-muted">Gratuit. L'image est créée sur ton appareil, prête pour Instagram et Strava.</DialogDescription>

        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex rounded-full bg-mist p-1" role="tablist" aria-label="Format de l'image">
              {(Object.keys(FORMATS) as ShareFormat[]).map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={format === f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
                    format === f ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  {FORMATS[f].label}
                </button>
              ))}
            </div>
            <div
              className="relative w-full max-w-[220px] overflow-hidden rounded-2xl bg-[#0a0a0b] shadow-lg sm:max-w-none"
              style={{ aspectRatio: `${FORMATS[format].w} / ${FORMATS[format].h}` }}
            >
              {image ? (
                <img src={image.url} alt={`Aperçu de l'image à partager : carte ${card.race}`} className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-white/60">
                  {error ? <p className="px-4 text-center text-[13px]">{error}</p> : <Loader2 className="h-6 w-6 animate-spin" />}
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            {canShareFile && (
              <Button size="lg" onClick={share} disabled={!image}>
                <Share2 className="h-4 w-4" /> Partager…
              </Button>
            )}
            {image ? (
              <a
                href={image.url}
                download={image.file.name}
                className={cn(
                  "inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-[17px] font-medium transition-all",
                  canShareFile ? "bg-white text-ink ring-1 ring-inset ring-line hover:bg-mist" : "bg-ink text-white hover:bg-black",
                )}
              >
                <Download className="h-4 w-4" /> Enregistrer l'image
              </a>
            ) : (
              <Button size="lg" variant={canShareFile ? "secondary" : "primary"} disabled>
                <Download className="h-4 w-4" /> Enregistrer l'image
              </Button>
            )}

            <div className="mt-2 rounded-2xl bg-mist p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium">Légende</p>
                <button onClick={copy} className="inline-flex items-center gap-1 text-[13px] text-[#0066cc] hover:underline">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiée" : "Copier"}
                </button>
              </div>
              <p className="mt-1.5 select-all text-[14px] leading-snug text-muted">{caption}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl p-4 ring-1 ring-line">
                <p className="flex items-center gap-2 text-[14px] font-semibold">
                  <Camera className="h-4 w-4 text-[#d6249f]" /> Instagram
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  {canShareFile ? "Touche « Partager… » puis Instagram, ou" : "Enregistre l'image, puis"} ouvre Instagram → nouvelle Story ou publication → choisis l'image.
                </p>
              </div>
              <div className="rounded-2xl p-4 ring-1 ring-line">
                <p className="flex items-center gap-2 text-[14px] font-semibold">
                  <Activity className="h-4 w-4 text-[#fc4c02]" /> Strava
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  Enregistre l'image, ouvre ton activité dans Strava → Modifier → Ajouter des photos. Colle la légende dans la description.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
