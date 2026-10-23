# Paiement en ligne (Stripe)

Mis en place le 23/10/2026. Tant que Cloudflare n'a pas la clé Stripe, le site reste en précommande sans paiement : rien ne casse.

## Comment ça marche

1. Le coureur crée sa carte et clique sur « Commander » → formulaire (nom, e-mail, adresse) → bouton **Payer xx,xx €**.
2. `functions/api/preorder.ts` enregistre la commande dans Airtable (statut **Nouvelle**), puis ouvre une page de paiement Stripe Checkout. Le prix vient de `FINISHES` (`src/lib/config.ts`), jamais du navigateur. Livraison offerte.
3. Le coureur paie sur la page Stripe (carte bancaire, Apple Pay, Google Pay selon les réglages Stripe), puis revient sur `/?commande=REF` : message « Merci pour ta commande ».
4. Stripe prévient `functions/api/stripe-webhook.ts` (appel signé, vérifié) → la commande passe **Payée**, avec `Paiement Stripe` (pi_…), `Payé le` et `Montant payé`. L'automatisation Airtable « Commande payée → facture » (à créer, voir `docs/facturation.md`) fait la facture.
5. Paiement abandonné : la session Stripe expire (24 h) → la commande encore **Nouvelle** passe **Annulée**. Une commande déjà payée ou modifiée à la main n'est jamais touchée.

Pendant la pause du site (`SITE_OUVERT` absent), les commandes sont refusées mais le webhook Stripe passe toujours.

## Mise en route (Thibault)

### 1. Compte Stripe, en mode test d'abord
- Créer le compte sur stripe.com (gratuit). Pour **recevoir** l'argent, Stripe demandera le SIREN, une pièce d'identité et l'IBAN ; en **mode test** on peut tout essayer sans rien de tout ça.
- Développeurs → Clés API : copier la **clé secrète de test** (`sk_test_…`). Ne jamais la coller dans le chat.

### 2. Webhook
- Développeurs → Webhooks → **Ajouter une destination** :
  - URL : `https://traildex-site.pages.dev/api/stripe-webhook` (puis le vrai domaine quand il existera)
  - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
- Copier le **secret de signature** (`whsec_…`).

### 3. Cloudflare
Projet `traildex-site` → Settings → Variables and secrets → Add, type **Secret** :
- `STRIPE_SECRET_KEY` = `sk_test_…`
- `STRIPE_WEBHOOK_SECRET` = `whsec_…`

Puis Deployments → ⋯ sur le **dernier** déploiement → Retry deployment.

### 4. Réglages Stripe utiles
- Paramètres → E-mails clients : activer **Paiements réussis** (reçu envoyé automatiquement au client).
- Paramètres → Informations publiques : nom affiché, e-mail de support, et l'URL des CGV quand elles existeront.

### 5. Tester
Site ouvert (`SITE_OUVERT=oui`) ou temporairement : faire une commande, payer avec la carte de test `4242 4242 4242 4242`, date future, CVC quelconque. Vérifier dans Airtable : statut **Payée**, `Paiement Stripe`, `Payé le`, `Montant payé`. Supprimer ensuite la commande de test.

### 6. Passage en réel
Une fois le compte Stripe activé (SIREN, IBAN), et **CGV + mentions légales en ligne** : remplacer les deux secrets par la clé `sk_live_…` et le secret d'un webhook créé en mode réel, puis redéployer.

## À savoir
- Frais Stripe : à vérifier sur stripe.com/fr/pricing (de l'ordre de 1,5 % + 0,25 € par carte européenne).
- Remboursement : depuis le tableau de bord Stripe (rechercher le `pi_…`), puis passer la commande en **Annulée** et faire l'avoir dans Airtable.
- Si Stripe ne joint pas le webhook (erreur, site coupé), il réessaie pendant 3 jours ; on peut aussi renvoyer l'événement depuis Stripe → Webhooks.
