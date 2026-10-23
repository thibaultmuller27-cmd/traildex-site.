import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn } from "@/components/FadeIn"

const QA = [
  {
    q: "Mon fichier GPX est-il envoyé quelque part ?",
    a: "Pas tant que tu ne commandes pas. Le fichier est lu et analysé directement dans ton navigateur : distance, dénivelé, profil et tracé sont calculés sur ton appareil. Quand tu commandes, seules les données de ta carte (tracé, chiffres, photo) nous sont transmises, pour l'imprimer.",
  },
  {
    q: "Où trouver le fichier GPX de ma course ?",
    a: "Sur Strava : ouvre l'activité, menu « … » puis « Exporter le GPX ». Sur Garmin Connect, Suunto, Coros ou Polar : ouvre l'activité et cherche « Exporter » ou « Télécharger GPX ». Le tracé officiel publié par l'organisateur fonctionne aussi.",
  },
  {
    q: "Comment le dénivelé est-il calculé ?",
    a: "On lisse légèrement les altitudes de ton fichier et on ignore les micro-variations dues au GPS, pour éviter de gonfler le D+. Le résultat peut différer de quelques pourcents de ta montre. Tu connais le chiffre officiel ? Il fait foi.",
  },
  {
    q: "Quelle est la différence entre les finitions ?",
    a: "Deux finitions. Holo : film holographique dont les reflets bougent avec la lumière ; la carte devient Rare, ou Épique à partir de 60 km-effort. Or : dorure à chaud, carte numérotée et étui rigide — c'est la Légendaire.",
  },
  {
    q: "C'est quoi le km-effort ?",
    a: "Une mesure de la difficulté d'un trail : 1 km-effort par kilomètre parcouru, plus 1 par tranche de 100 m de dénivelé positif. Les Crêtes Vosgiennes (53 km, 2 023 m D+) font environ 73 km-effort.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Au moment de la commande, par carte bancaire (ou Apple Pay / Google Pay) sur la page sécurisée de Stripe. Nous n'avons jamais accès à tes numéros de carte. Tu reçois un reçu par e-mail.",
  },
  {
    q: "Puis-je annuler ou retourner ma carte ?",
    a: "Chaque carte est fabriquée pour toi, avec ton tracé et tes infos : comme tout produit personnalisé, elle n'ouvre pas de droit de rétractation. Vérifie bien ton aperçu avant de payer. Si ta carte arrive abîmée, mal imprimée ou différente de l'aperçu, on la réimprime ou on te rembourse.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Compte environ 7 à 10 jours ouvrés entre la validation de ta précommande et la réception, en France métropolitaine.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="bg-white px-5 pb-24 pt-8 md:pb-36">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h2 className="headline text-[40px] sm:text-6xl">Questions fréquentes.</h2>
        </FadeIn>
        <Accordion type="single" collapsible className="mt-10 border-t border-line">
          {QA.map((x, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger>{x.q}</AccordionTrigger>
              <AccordionContent>{x.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
