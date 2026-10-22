import { Logo } from "@/components/sections/Nav"

const COLS = [
  { title: "Créer", links: [["Créateur de carte", "#createur"], ["Comment ça marche", "#comment"], ["Finitions et prix", "#createur"]] },
  { title: "Collection", links: [["Ma collection", "#collection"]] },
  { title: "Aide", links: [["Questions fréquentes", "#faq"], ["Contact", "mailto:contact@traildex.fr"]] },
]

export function Footer() {
  return (
    <footer className="bg-mist px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16 text-[13px] text-muted">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="text-ink" />
            <p className="mt-3 max-w-xs leading-relaxed">Des cartes de collection pour les traileurs. Ta course, ton tracé, ton chrono — en holo.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="font-semibold text-ink">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="hover:text-ink hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} TrailDex. Tous droits réservés.</p>
          <p>Fait pour les sentiers, en France.</p>
        </div>
      </div>
    </footer>
  )
}
