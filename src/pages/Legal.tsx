/**
 * Legal pages: /cgv, /mentions-legales, /confidentialite.
 *
 * Seller details come from COMPANY (src/lib/config.ts); anything still
 * missing shows as a highlighted "à compléter" so it cannot go unnoticed.
 * Drafted on 23/10/2026, to be checked by Thibault (and ideally a lawyer or
 * accountant) before the site opens.
 */
import * as React from "react"
import { Logo } from "@/components/sections/Nav"
import { CGV_VERSION, COMPANY, FINISHES, formatPrice } from "@/lib/config"

export type LegalPage = "cgv" | "mentions-legales" | "confidentialite"

export const LEGAL_PAGES: Record<LegalPage, string> = {
  cgv: "Conditions générales de vente",
  "mentions-legales": "Mentions légales",
  confidentialite: "Politique de confidentialité",
}

export function legalPageFromPath(path: string): LegalPage | null {
  const p = path.replace(/^\/+|\/+$/g, "") as LegalPage
  return p in LEGAL_PAGES ? p : null
}

const todo = (what: string) => <mark className="rounded bg-[#fff3b0] px-1 text-ink">[à compléter : {what}]</mark>
const v = (value: string, what: string) => (value ? value : todo(what))

const SELLER = () => (
  <>
    {COMPANY.name}, {COMPANY.legalForm}, exerçant sous le nom commercial « {COMPANY.tradeName} » · adresse : {v(COMPANY.address, "adresse")} · SIRET :{" "}
    {v(COMPANY.siret, "numéro SIRET")} · e-mail : {v(COMPANY.email, "e-mail de contact")} · téléphone : {v(COMPANY.phone, "téléphone")}
  </>
)

const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-10 text-[20px] font-semibold tracking-tight text-ink">{children}</h2>
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-3">{children}</p>
const UL = ({ children }: { children: React.ReactNode }) => <ul className="mt-3 list-disc space-y-1.5 pl-5">{children}</ul>

function Cgv() {
  return (
    <>
      <P>Version du {CGV_VERSION.split("-").reverse().join("/")}.</P>

      <H>1. Objet</H>
      <P>
        Les présentes conditions générales de vente (CGV) s'appliquent aux ventes de cartes de collection personnalisées conclues sur ce site entre le vendeur et un
        consommateur. Les commandes passées par des professionnels (organisateurs de courses, clubs, partenaires) font l'objet d'un devis et de conditions particulières.
        Le client accepte les CGV en cochant la case prévue avant de payer. Elles restent consultables et enregistrables à tout moment sur cette page.
      </P>

      <H>2. Vendeur</H>
      <P>
        <SELLER />.
      </P>

      <H>3. Produits</H>
      <P>
        Le vendeur propose des cartes imprimées au format d'une carte à collectionner, créées à partir du tracé GPX et des informations saisies par le client (nom de
        la course, prénom, date, chrono, classement, photo). Finitions proposées :
      </P>
      <UL>
        {FINISHES.map((f) => (
          <li key={f.id}>
            <strong>{f.name}</strong> ({f.tagline}) : {f.details} Prix : {formatPrice(f.price)}.
          </li>
        ))}
      </UL>
      <P>
        L'aperçu affiché sur le site est une simulation : les reflets holographiques et la dorure, posés par l'imprimeur, peuvent légèrement différer de l'écran. La
        distance, le dénivelé et l'altitude sont calculés à partir du fichier GPX fourni et peuvent différer de quelques pourcents des chiffres officiels de la course.
      </P>

      <H>4. Contenus fournis par le client</H>
      <P>
        Le client garantit disposer des droits sur la photo et les informations qu'il fournit, et qu'ils ne portent atteinte aux droits de personne (droit à l'image,
        droit d'auteur, marques). Les noms, logos et marques des courses appartiennent à leurs titulaires : le vendeur n'est affilié à aucune course ni à aucun
        organisateur, et n'imprime pas de logo de course sans l'accord de son titulaire. Le vendeur peut refuser une commande dont le contenu serait illicite,
        injurieux ou porterait atteinte aux droits d'un tiers ; le client est alors remboursé.
      </P>

      <H>5. Prix</H>
      <P>
        Les prix sont indiqués en euros, toutes taxes comprises. {COMPANY.vatMention}. La livraison est offerte. Le prix applicable est celui affiché au moment de la
        commande et récapitulé avant le paiement.
      </P>

      <H>6. Commande</H>
      <P>Pour commander, le client :</P>
      <UL>
        <li>importe son fichier GPX et personnalise sa carte, dont il vérifie l'aperçu ;</li>
        <li>choisit la finition et la quantité, indique son nom, son e-mail et son adresse de livraison ;</li>
        <li>coche la case d'acceptation des CGV et de renonciation au droit de rétractation (article 8) ;</li>
        <li>paie sur la page sécurisée de notre prestataire de paiement.</li>
      </UL>
      <P>
        La vente est conclue dès la confirmation du paiement. Le client reçoit un reçu par e-mail et une référence de commande. Le vendeur archive la commande et
        les CGV acceptées, et les tient à la disposition du client sur demande.
      </P>

      <H>7. Paiement</H>
      <P>
        Le paiement s'effectue en ligne par carte bancaire (et, selon l'appareil, Apple Pay ou Google Pay) via la société Stripe, sur une page sécurisée. Le vendeur
        n'a jamais accès aux numéros de carte. Le montant est débité au moment de la commande.
      </P>

      <H>8. Absence de droit de rétractation</H>
      <P>
        Chaque carte est fabriquée à partir des données du client et nettement personnalisée. Conformément à l'article L221-28, 3°, du Code de la consommation, le
        droit de rétractation ne s'applique pas à ces biens. Le client en est informé avant la commande et y renonce expressément en cochant la case prévue. Cette
        exclusion ne prive pas le client des garanties légales (article 10).
      </P>

      <H>9. Fabrication et livraison</H>
      <P>
        La carte est imprimée après le paiement puis expédiée par courrier à l'adresse indiquée, en {COMPANY.delivery || todo("zone de livraison")}. Délai indicatif :
        7 à 10 jours ouvrés entre le paiement et la réception. Sauf autre date convenue, la livraison intervient au plus tard 30 jours après la commande. En cas de
        retard au-delà de ce délai, le client peut, après avoir demandé au vendeur de livrer dans un délai supplémentaire raisonnable, résoudre la vente et être
        remboursé (articles L216-1 et suivants du Code de la consommation). Les risques de perte ou d'endommagement passent au client à la réception.
      </P>

      <H>10. Garanties légales</H>
      <P>
        Le client bénéficie de la garantie légale de conformité (articles L217-3 à L217-20 du Code de la consommation) et de la garantie des vices cachés (articles
        1641 à 1649 du Code civil).
      </P>
      <div className="mt-4 rounded-xl border border-line bg-mist p-4 text-[14px]">
        <P>
          Le consommateur dispose d'un délai de deux ans à compter de la délivrance du bien pour obtenir la mise en œuvre de la garantie légale de conformité en cas
          d'apparition d'un défaut de conformité. Durant ce délai, il n'est tenu d'établir que l'existence du défaut de conformité et non la date d'apparition de
          celui-ci.
        </P>
        <P>
          La garantie légale de conformité emporte obligation pour le professionnel de fournir toutes les mises à jour nécessaires au maintien de la conformité du
          bien (sans objet pour une carte imprimée).
        </P>
        <P>
          La garantie légale de conformité donne au consommateur droit à la réparation ou au remplacement du bien dans un délai de trente jours suivant sa demande,
          sans frais et sans inconvénient majeur pour lui. Si le bien est réparé dans le cadre de la garantie légale de conformité, le consommateur bénéficie d'une
          extension de six mois de la garantie initiale. Si le consommateur demande la réparation du bien, mais que le vendeur impose le remplacement, la garantie
          légale de conformité est renouvelée pour une période de deux ans à compter de la date de remplacement du bien.
        </P>
        <P>
          Le consommateur peut obtenir une réduction du prix d'achat en conservant le bien ou mettre fin au contrat en se faisant rembourser intégralement contre
          restitution du bien, si le professionnel refuse de réparer ou de remplacer le bien, si la réparation ou le remplacement du bien intervient après un délai
          de trente jours, s'ils occasionnent un inconvénient majeur pour le consommateur, ou si la non-conformité persiste malgré une tentative de mise en
          conformité infructueuse. Il a également droit à une réduction du prix ou à la résolution du contrat lorsque le défaut de conformité est si grave qu'il
          justifie que la réduction du prix ou la résolution du contrat soit immédiate ; il n'est alors pas tenu de demander la réparation ou le remplacement au
          préalable. Le consommateur n'a pas droit à la résolution de la vente si le défaut de conformité est mineur.
        </P>
        <P>
          Toute période d'immobilisation du bien en vue de sa réparation ou de son remplacement suspend la garantie qui restait à courir jusqu'à la délivrance du bien
          remis en état. Ces droits résultent de l'application des articles L217-1 à L217-32 du Code de la consommation.
        </P>
        <P>
          Le vendeur qui fait obstacle de mauvaise foi à la mise en œuvre de la garantie légale de conformité encourt une amende civile d'un montant maximal de 300
          000 euros, qui peut être porté jusqu'à 10 % du chiffre d'affaires moyen annuel (article L241-5 du Code de la consommation).
        </P>
        <P>
          Le consommateur bénéficie également de la garantie légale des vices cachés en application des articles 1641 à 1649 du Code civil, pendant une durée de deux
          ans à compter de la découverte du défaut. Cette garantie donne droit à une réduction du prix si le bien est conservé ou à un remboursement intégral contre
          restitution du bien.
        </P>
      </div>
      <P>
        En pratique : une carte abîmée à la livraison, mal imprimée ou différente de l'aperçu validé (hors simulation des effets de lumière) est réimprimée
        gratuitement ou remboursée. Une donnée erronée saisie par le client (faute de frappe, mauvais fichier GPX) n'est pas un défaut de conformité. Pour toute
        demande, écrire à {v(COMPANY.email, "e-mail de contact")} avec la référence de commande et, si possible, une photo.
      </P>

      <H>11. Réclamations et médiation</H>
      <P>
        Toute réclamation s'adresse d'abord au service client : {v(COMPANY.email, "e-mail de contact")}. En l'absence de solution, le client peut recourir
        gratuitement au médiateur de la consommation du vendeur :{" "}
        {COMPANY.mediator.name ? (
          <>
            {COMPANY.mediator.name}
            {COMPANY.mediator.url && (
              <>
                {" "}
                (<a className="underline" href={COMPANY.mediator.url}>
                  {COMPANY.mediator.url}
                </a>
                )
              </>
            )}
          </>
        ) : (
          todo("nom et site du médiateur de la consommation")
        )}
        , dans un délai d'un an à compter de sa réclamation écrite au vendeur (articles L611-1 et suivants du Code de la consommation).
      </P>

      <H>12. Données personnelles</H>
      <P>
        Les données nécessaires à la commande sont traitées conformément à notre{" "}
        <a className="underline" href="/confidentialite">
          politique de confidentialité
        </a>
        .
      </P>

      <H>13. Propriété intellectuelle</H>
      <P>
        Le design des cartes, les gabarits, le logo et le site sont la propriété du vendeur. L'achat d'une carte donne le droit de l'utiliser à titre personnel, y
        compris de partager son image sur les réseaux sociaux ; il ne transfère aucun droit sur le design.
      </P>

      <H>14. Droit applicable</H>
      <P>
        Les présentes CGV sont soumises au droit français. En cas de litige, le client peut saisir, à son choix, la juridiction du lieu où il demeurait au moment de
        la conclusion du contrat ou de la survenance du fait dommageable, ou toute autre juridiction compétente selon la loi.
      </P>
    </>
  )
}

function Mentions() {
  return (
    <>
      <H>Éditeur du site</H>
      <P>
        <SELLER />. {COMPANY.vatMention}.
      </P>
      <P>Directeur de la publication : {COMPANY.name}.</P>

      <H>Hébergement</H>
      <P>Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis · www.cloudflare.com</P>

      <H>Propriété intellectuelle</H>
      <P>
        Les textes, visuels, le logo et le design des cartes sont la propriété de l'éditeur. Toute reproduction sans autorisation est interdite. Les noms et marques
        des courses cités appartiennent à leurs titulaires ; le site n'est affilié à aucune course ni à aucun organisateur.
      </P>

      <H>Données personnelles</H>
      <P>
        Voir la{" "}
        <a className="underline" href="/confidentialite">
          politique de confidentialité
        </a>
        .
      </P>
    </>
  )
}

function Confidentialite() {
  return (
    <>
      <P>Mise à jour le {CGV_VERSION.split("-").reverse().join("/")}.</P>

      <H>Responsable du traitement</H>
      <P>
        <SELLER />.
      </P>

      <H>Ce qui reste sur ton appareil</H>
      <P>
        Tant que tu ne commandes pas, ton fichier GPX et ta photo sont lus et traités uniquement dans ton navigateur : rien n'est envoyé. Ta collection est gardée
        dans le stockage local de ton navigateur, pour que tu la retrouves. Le site n'utilise ni cookie publicitaire ni outil de mesure d'audience.
      </P>

      <H>Données collectées lors d'une commande</H>
      <UL>
        <li>identité et contact : nom, e-mail, adresse de livraison ;</li>
        <li>la carte : tracé et statistiques issus du GPX, nom de la course, date, prénom, chrono, classement, photo si tu en ajoutes une ;</li>
        <li>la commande : finition, quantité, prix, date, référence, version des CGV acceptée ;</li>
        <li>le paiement : identifiant et montant du paiement. Les données de carte bancaire sont saisies chez Stripe ; nous n'y avons jamais accès.</li>
      </UL>

      <H>Pourquoi, et sur quelle base</H>
      <UL>
        <li>fabriquer, expédier ta carte et gérer le service client : exécution du contrat ;</li>
        <li>facturation et comptabilité : obligation légale ;</li>
        <li>te prévenir de l'avancement de ta commande par e-mail : exécution du contrat.</li>
      </UL>
      <P>Aucune donnée n'est vendue ni utilisée pour de la publicité.</P>

      <H>Qui y a accès</H>
      <UL>
        <li>Cloudflare (hébergement du site) ;</li>
        <li>Airtable (gestion des commandes) ;</li>
        <li>Stripe (paiement) ;</li>
        <li>Google (messagerie, pour les échanges par e-mail) ;</li>
        <li>l'imprimeur (fichiers d'impression de ta carte) et La Poste ou le transporteur (adresse de livraison).</li>
      </UL>
      <P>
        Certains de ces prestataires sont situés aux États-Unis. Les transferts sont encadrés par le cadre de protection des données UE–États-Unis (Data Privacy
        Framework) ou par les clauses contractuelles types de la Commission européenne.
      </P>

      <H>Combien de temps</H>
      <UL>
        <li>commandes et échanges : 3 ans après ta dernière commande ;</li>
        <li>factures et pièces comptables : 10 ans (obligation légale) ;</li>
        <li>photo et fichiers d'impression : 6 mois après l'expédition, pour une éventuelle réimpression.</li>
      </UL>

      <H>Tes droits</H>
      <P>
        Tu peux accéder à tes données, les rectifier, les effacer, t'opposer à leur traitement, en demander la limitation ou la portabilité, en écrivant à{" "}
        {v(COMPANY.email, "e-mail de contact")}. Tu peux aussi adresser une réclamation à la CNIL (www.cnil.fr).
      </P>
    </>
  )
}

export function Legal({ page }: { page: LegalPage }) {
  React.useEffect(() => {
    document.title = `${LEGAL_PAGES[page]} — ${COMPANY.tradeName}`
    window.scrollTo(0, 0)
  }, [page])
  const Body = { cgv: Cgv, "mentions-legales": Mentions, confidentialite: Confidentialite }[page]
  return (
    <div className="min-h-screen bg-white px-5 pb-24 pt-8 text-[15px] leading-relaxed text-[#3a3a3c]">
      <div className="mx-auto max-w-3xl">
        <a href="/" aria-label="Retour à l'accueil">
          <Logo className="text-ink" />
        </a>
        <h1 className="mt-10 text-[34px] font-semibold leading-tight tracking-tight text-ink sm:text-[44px]">{LEGAL_PAGES[page]}</h1>
        <Body />
        <nav className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-[13px] text-muted">
          <a href="/" className="hover:text-ink">
            Accueil
          </a>
          {(Object.keys(LEGAL_PAGES) as LegalPage[])
            .filter((p) => p !== page)
            .map((p) => (
              <a key={p} href={`/${p}`} className="hover:text-ink">
                {LEGAL_PAGES[p]}
              </a>
            ))}
        </nav>
      </div>
    </div>
  )
}
