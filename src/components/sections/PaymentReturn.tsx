import * as React from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/**
 * The page Stripe sends the runner back to: /?commande=REF after paying,
 * /?paiement=annule if they left the payment page.
 */
export function PaymentReturn() {
  const [state] = React.useState(() => {
    const q = new URLSearchParams(location.search)
    if (q.get("commande")) return { paid: true, reference: q.get("commande")! }
    if (q.get("paiement") === "annule") return { paid: false, reference: "" }
    return null
  })
  const [open, setOpen] = React.useState(state !== null)

  // Drop the parameters so a reload does not show the message again.
  React.useEffect(() => {
    if (state) history.replaceState(null, "", location.pathname + location.hash)
  }, [state])

  if (!state) return null
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="flex flex-col items-center py-6 text-center">
          {state.paid && (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </div>
          )}
          <DialogTitle className="mt-6 text-[28px] font-semibold tracking-tight">{state.paid ? "Merci pour ta commande !" : "Paiement interrompu"}</DialogTitle>
          <DialogDescription className="mt-2 max-w-sm text-[16px] text-muted">
            {state.paid ? (
              <>
                Ton paiement est validé. Stripe t'envoie le reçu par e-mail, et on te prévient dès que ta carte part à l'impression.
                <span className="mt-3 block text-[14px]">
                  Référence : <strong className="font-mono text-ink">{state.reference}</strong>
                </span>
              </>
            ) : (
              "Aucun montant n'a été débité. Ta carte est toujours dans ta collection : tu peux la commander quand tu veux."
            )}
          </DialogDescription>
          <Button size="lg" className="mt-8" onClick={() => setOpen(false)}>
            {state.paid ? "Voir le site" : "Revenir à ma carte"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
