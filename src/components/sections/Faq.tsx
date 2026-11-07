import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn } from "@/components/FadeIn"

const QA = [
  {
    q: "C'est quoi, exactement, une carte DNF Cards ?",
    a: "Une carte de 76 × 120 mm (plus grande qu'une carte Pokémon, plus petite que ton ego après un ultra) avec ton tracé en holographique, le décor de ta discipline, tes chiffres et ton nom. Au dos : notre logo et un QR code pour que tes potes fassent la leur.",
  },
  {
    q: "DNF… ça veut pas dire « Did Not Finish » ?",
    a: "Si, et c'est exprès. Chez nous, DNF veut dire « Déjà Nostalgique du Finish » : on célèbre ceux qui passent l'arche. Et si un jour ta course s'est arrêtée au km 32 ? Ton GPX reste ton GPX : on imprime ce que tu as couru, sans jugement.",
  },
  {
    q: "Où trouver le fichier GPX de ma course ?",
    a: "Sur Strava : ouvre l'activité, menu « … » puis « Exporter le GPX ». Sur Garmin Connect, Suunto, Coros ou Polar : ouvre l'activité et cherche « Exporter » ou « Télécharger GPX ». Montre déchargée au km 12 ? Le tracé officiel publié par l'organisateur fonctionne aussi.",
  },
  {
    q: "Trail, running, vélo : ça change quoi ?",
    a: "Le décor de ta carte. Trail : montagnes et vrai relief autour de ton parcours. Running : la ville au coucher du soleil, avec ton allure. Vélo : cols, champs et petites routes. Dans tous les cas : tracé holographique qui brille, et zéro jugement sur tes pauses.",
  },
  {
    q: "Je peux mettre un surnom au lieu de mon prénom ?",
    a: "Bien sûr : « La Fusée », « Tonton », « Le Chamois du dimanche »… jusqu'à 20 caractères. On garde juste un minimum de bon goût : ta carte sera imprimée, et peut-être montrée à ta belle-mère.",
  },
  {
    q: "Les chiffres ne collent pas avec ma montre, c'est normal ?",
    a: "Oui, un peu. On lisse les altitudes du fichier pour ne pas compter chaque tremblement du GPS, donc le D+ peut différer de quelques pourcents. Ta montre dit 3 900 m, l'organisateur 3 830 m et tes cuisses 6 000 m : seules les deux premières sont fiables. Tu tiens au chiffre officiel ? Écris-nous après ta commande.",
  },
  {
    q: "Mon fichier GPX est-il envoyé quelque part ?",
    a: "Pas tant que tu ne commandes pas : ton fichier est lu et analysé directement dans ton navigateur. Pour le décor Trail, seule la zone du parcours sert à télécharger le relief (cartes d'altitude publiques). Quand tu commandes, seules les données de ta carte (tracé, chiffres, nom) nous sont transmises, pour l'imprimer.",
  },
  {
    q: "Combien ça coûte ?",
    a: "14,90 € la carte, livraison offerte en France métropolitaine. Moins cher qu'une paire de chaussettes de trail, et ça dure plus longtemps.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Au moment de la commande, par carte bancaire (ou Apple Pay / Google Pay) sur la page sécurisée de Stripe. Nous n'avons jamais accès à tes numéros de carte. Tu reçois un reçu par e-mail.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Compte environ 7 à 10 jours ouvrés entre ta commande et la réception, en France métropolitaine. Soit à peu près le temps qu'il faut pour récupérer d'un ultra.",
  },
  {
    q: "Je peux l'offrir à quelqu'un ?",
    a: "Oui : importe le GPX de la personne (demande-le-lui, ou récupère discrètement le tracé officiel de sa course), mets son nom, et indique son adresse à la livraison. Effet garanti au prochain repas de famille.",
  },
  {
    q: "Puis-je annuler ou retourner ma carte ?",
    a: "Chaque carte est fabriquée pour toi, avec ton tracé et tes infos : comme tout produit personnalisé, elle n'ouvre pas de droit de rétractation. Vérifie bien ton aperçu avant de payer. Si ta carte arrive abîmée, mal imprimée ou différente de l'aperçu, on la réimprime ou on te rembourse.",
  },
  {
    q: "Vous faites des cartes pour les clubs et les courses ?",
    a: "Oui, et on adore ça : une série aux couleurs de ton club ou de ta course, pour tous les finishers. Écris-nous, on en parle autour d'un ravito.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="bg-white px-5 pb-24 pt-8 md:pb-36">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h2 className="headline text-[40px] sm:text-6xl">Les questions <span className="text-gradient-dnf">(et nos réponses).</span></h2>
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
