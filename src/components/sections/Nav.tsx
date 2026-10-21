import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "#comment", label: "Comment ça marche" },
  { href: "#createur", label: "Créer" },
  { href: "#galerie", label: "Galerie" },
  { href: "#collection", label: "Ma collection" },
  { href: "#jeu", label: "Le jeu" },
  { href: "#abonnement", label: "Abonnement" },
  { href: "#faq", label: "FAQ" },
]

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <a href="#top" className={cn("inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 32" className="h-6 w-[18px]" aria-hidden>
        <rect x="1" y="1" width="22" height="30" rx="4" fill="currentColor" />
        <path d="M5 21l5-7 3 4 2-3 4 6" fill="none" stroke={inverted ? "#000" : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      TrailDex
    </a>
  )
}

export function Nav() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
  }, [open])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open ? "bg-white/80 backdrop-blur-xl backdrop-saturate-150" : "bg-transparent",
        scrolled && !open && "border-b border-black/5",
      )}
    >
      <nav className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-5">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[13px] text-ink/80 transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href="/jeu/"
            className="holo-bg hidden h-8 items-center rounded-full px-4 text-[13px] font-semibold text-[#0c0b1d] sm:inline-flex"
          >
            Jouer
          </a>
          <a
            href="#createur"
            className="hidden h-8 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-black sm:inline-flex"
          >
            Créer ma carte
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-full md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-white md:hidden"
          >
            <ul className="flex flex-col gap-1 px-8 pt-6">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-[28px] font-semibold tracking-tight">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
