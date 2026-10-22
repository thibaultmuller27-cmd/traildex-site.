# Étude comparative des modèles — 04 · Opérations et automatisation

Agent 4 « Opérations et automatisation » · 22 octobre 2026 · rien n'a été envoyé, aucun compte créé, personne contacté.

Légende des sources : ✅ vérifié (page consultée, URL donnée) · 🔎 estimation (raisonnement, ordre de grandeur, ou source secondaire) · ⚠️ hypothèse (à confirmer par Thibault ou par un devis).

---

## 0. En bref

| Question | Réponse courte |
|---|---|
| Temps par commande B2C aujourd'hui (tout à la main) | **≈ 31 min** (21 à 46) + ≈ 5 h/mois de frais fixes (lots, poste, compta) 🔎 |
| Temps par commande B2C optimisée (Stripe, e-mails automatiques validés, étiquettes en lot), Thibault fait encore la mise sous pli | **≈ 12 min** (8 à 18) + ≈ 4 h/mois de fixe 🔎 |
| Temps par commande B2C en print-on-demand avec envoi direct par l'imprimeur (via API) | **≈ 7 à 8 min** (5 à 12), dont la moitié de SAV 🔎 |
| Temps par événement B2B, design fait de zéro | **≈ 16 h** (10 à 25) 🔎 |
| Temps par événement B2B avec un modèle de carte paramétrable + livraison directe de l'imprimeur à l'organisateur | **≈ 6,5 h** (4,5 à 10) ; renouvellement d'une même course : ≈ 3 h 🔎 |
| Temps disponible | 4 à 8 h/semaine ≈ **17 à 35 h/mois** en tout, dont **≈ 9 à 17 h/mois** pour les opérations si l'on en garde la moitié pour le produit, le marketing et l'administratif ⚠️ |
| Seuil de saturation B2C | Manuel : **≈ 10 à 25 commandes/mois**. Optimisé : **≈ 25 à 65**. Dropshipping : **≈ 65 à 125** (ensuite, c'est le SAV qui sature) 🔎 |
| Seuil de saturation B2B | De zéro : **1 événement/mois**. Avec le modèle : **2, au mieux 3**. À 4 ou plus, il faut un graphiste indépendant ou que ce soient surtout des renouvellements 🔎 |
| Meilleure piste de dropshipping trouvée | **QPMN** (groupe de MakePlayingCards) : cartes à l'unité, sans minimum, impression holographique, mise sous étui et envoi individuel en marque blanche, connexion par boutique ou API ✅. Points faibles : envoi depuis Hong Kong (≈ 10 à 15 jours ouvrés vers la France 🔎), droit de douane UE de 3 € par article depuis le 1/7/2026 ✅, dorure « Or » à chaud non confirmée |

---

## 1. Ce qui existe déjà (relu dans le dépôt)

| Brique | État | Fichier |
|---|---|---|
| Créateur : GPX lu dans le navigateur, aperçu, formulaire de précommande | Fait, **pas encore déployé** | `src/lib/gpx.ts`, `src/lib/preorder.ts` |
| Précommande → Airtable (statut « Nouvelle », photo en pièce jointe, prix recalculé côté serveur) | Fait | `functions/api/preorder.ts` |
| Paiement en ligne | **Absent** : le paiement est demandé par e-mail, que Thibault envoie lui-même | `docs/facturation.md` étapes 2-3 |
| Facture : automatisation Airtable « Commande payée → facture » | Décrite, **à créer par Thibault** | `docs/facturation.md` |
| PDF d'impression Exaprint (CMJN + fichier de dorure séparé), lots en Sets de ≤ 20 cartes, bordereau | Fait, **dans le navigateur** (rendu canvas) : un clic par lot à partir d'un CSV | `src/lib/exaprint.ts`, `src/print/` |
| PDF de factures + livre des recettes | Fait (spécimens tant qu'il n'y a pas de SIRET) ; Abby recommandé pour la vraie numérotation | `src/print/InvoicePanel.tsx`, `docs/finance/logiciels-facturation.md` |
| Étiquettes, e-mails d'expédition, suivi | Absent (à la main) | — |
| Format | 63 × 88 mm impossible avec la dorure Exaprint (limite 40-55 × 55-95 mm), question en attente | `docs/journal-projet.md` |

Conséquence : aujourd'hui, **tout ce qui suit la précommande est manuel**, sauf la génération des fichiers d'impression et des factures.

---

## 2. Modèle A — B2C (une carte personnalisée par commande)

### 2.1 Processus et temps par commande

Hypothèses ⚠️ : lettre verte suivie (2,02 € jusqu'à 20 g, distribuée en 3 jours en métropole ✅ [La Poste](https://www.laposte.fr/tarifs-postaux-courrier-lettres-timbres)) ; une commande = une carte ; Thibault prépare les envois à la maison, par séries ; 2 commandes Exaprint par mois, 4 si le volume dépasse 50 commandes ; SAV : environ 1 commande sur 8 donne lieu à un échange (adresse, délai, question), 2 à 4 % à une réimpression (carte abîmée, faute, perte).

Colonnes : **M** = manuel (aujourd'hui) · **O** = optimisé (Stripe, e-mails automatiques validés par Thibault, étiquettes importées en lot, Thibault met encore sous pli) · **D** = dropshipping (l'imprimeur imprime et envoie au client).

| # | Étape | Qui / outil aujourd'hui | M (min) | O (min) | D (min) |
|---|---|---|---|---|---|
| 1 | Vérifier les données : tracé GPX cohérent, orthographe du prénom et de la course, chrono et classement plausibles, qualité de la photo, adresse complète | Thibault · Airtable (JSON de la carte, photo) | 3-8 (**5**) | 1-3 (**2**) — contrôles automatiques dans le formulaire, Thibault ne regarde que les alertes | 1-3 (**2**) |
| 2 | Confirmation et paiement : brouillon d'e-mail, envoi, relance, pointage du virement ou du lien | Thibault · Gmail + Airtable | 4-10 (**6**) | 0-1 (**0,5**) — Stripe Checkout + webhook | 0-1 (**0,5**) |
| 3 | Facture : passer en « Payée », automatisation, mode de paiement, PDF, pièce jointe, envoi | Thibault · Airtable + `/print.html` + Gmail | 3-6 (**4**) | 0-1 (**0,5**) — facture créée par le logiciel (Abby) via webhook | 0-1 (**0,5**) |
| 4 | Lot d'impression, part par carte : relire l'aperçu PDF de la carte, contrôle de la dorure | Thibault · `/print.html` | 1-2 (**1,5**) | 1 (**1**) | 0,5-2 (**0,5** par API, **≈ 4** si la commande est saisie à la main chez l'imprimeur) |
| 5 | Réception et contrôle qualité de la carte (comparer au bordereau, défauts de dorure, coupe) | Thibault | 1-2 (**1,5**) | 1 (**1**) | 0 (contrôle seulement sur échantillons, dans le fixe) |
| 6 | Mise sous pli : pochette, rigidifiant, enveloppe, mot, fermeture | Thibault | 2-4 (**3**) | 2-4 (**3**) | 0 |
| 7 | Étiquette et affranchissement : saisie de l'adresse, achat du timbre suivi, impression, collage | Thibault · La Poste en ligne | 3-5 (**4**) | 0,5-1,5 (**1**) — import CSV dans un outil d'expédition, étiquettes imprimées en série | 0 |
| 8 | Suivi : reporter le numéro, e-mail « carte expédiée » | Thibault · Airtable + Gmail | 2-4 (**3**) | 0-0,5 (**0,3**) | 0-0,5 (**0,3**, le numéro remonte de l'imprimeur) |
| 9 | SAV moyen par commande (≈ 12 % × 10-15 min + 3 % × 30-45 min de réimpression) | Thibault · Gmail | 2-5 (**3**) | 2-4 (**2,5**) | 3-6 (**4** : délais plus longs, douane, moins de contrôle) |
| | **Total variable par commande** | | **21-46 (≈ 31)** | **8-18 (≈ 12)** | **5-12 (≈ 7,5)** |

Frais fixes mensuels (indépendants du nombre exact de commandes) 🔎 :

| Fixe mensuel | M | O | D |
|---|---|---|---|
| Commandes Exaprint (export CSV, génération du zip, configuration des Sets, dépôt des fichiers, paiement) | 2 × 60 min, puis 4 × 60 dès 50 cmd/mois | 2 × 45, puis 4 × 45 | — |
| Configuration par Set (≤ 20 cartes) | 5 min/Set | 5 min/Set | — |
| Réception des colis Exaprint | 2 × 15 min | 2 × 15 | — |
| Dépôts à la poste (≈ 1 par semaine ; les lettres suivies passent en boîte aux lettres tant qu'elles sont peu nombreuses) | 4 × 20 min, 8 × 25 min à 300 cmd/mois | idem | — |
| Compta (registre des achats, rapprochement) | 45 à 90 min | 30 à 60 min | 60 à 120 min (contrôle d'échantillons, factures de l'imprimeur, rapprochement) |

### 2.2 Charge mensuelle B2C

| Commandes/mois | M : manuel | O : optimisé | D : dropshipping (API) | Disponible (en tout / pour les opérations) |
|---|---|---|---|---|
| 10 | 310 + 280 = **≈ 10 h** | 120 + 235 = **≈ 6 h** | 75 + 60 = **≈ 2,3 h** | 17-35 h / 9-17 h |
| 30 | 930 + 285 = **≈ 20 h** | 360 + 240 = **≈ 10 h** | 225 + 60 = **≈ 4,8 h** | 17-35 h / 9-17 h |
| 100 | 3 100 + 465 = **≈ 59 h** | 1 200 + 390 = **≈ 26,5 h** | 750 + 90 = **≈ 14 h** | 17-35 h / 9-17 h |
| 300 | 9 300 + 665 = **≈ 166 h** | 3 600 + 575 = **≈ 70 h** | 2 250 + 120 = **≈ 40 h** | 17-35 h / 9-17 h |

Lecture :
- **Manuel** : à 10 commandes par mois, les opérations prennent déjà tout le temps qui leur est réservé. À 30, elles prennent tout le temps libre de Thibault.
- **Optimisé** : tenable jusqu'à ≈ 30 commandes/mois en moyenne. À 100, cela demande 6 h par semaine, rien que pour les commandes.
- **Dropshipping** : tenable jusqu'à ≈ 100/mois. À 300, le SAV seul prend ≈ 20 h/mois : il faut quelqu'un pour répondre aux clients, ou une FAQ et un suivi en libre-service très soignés.
- **Saisonnalité** ⚠️ : la plupart des trails ont lieu de mai à octobre, et les commandes arrivent en rafales le lundi qui suit les grandes courses. Un mois de pointe représente probablement 1,5 à 2 fois la moyenne. Les seuils ci-dessus valent pour **le mois de pointe**, pas pour la moyenne de l'année.

### 2.3 Seuils de saturation B2C

Calcul : (temps réservé aux opérations − fixe) ÷ minutes variables par commande, avec 9 à 17 h/mois pour les opérations 🔎.

| Mode | Commandes/mois tenables | Si Thibault y met tout son temps libre (35 h/mois) |
|---|---|---|
| M · manuel | **≈ 8 à 24** | ≈ 60 |
| O · optimisé | **≈ 25 à 65** | ≈ 140 |
| D · dropshipping | **≈ 65 à 125** | ≈ 260 |

**Mise sous pli seule** (mode O : réception 1 + pli 3 + étiquette 1 + dépôt amorti ≈ 1 → **≈ 6 min par carte**) :
- 30 commandes = 3 h/mois : supportable, c'est une soirée ;
- **≈ 50 commandes/mois = 5 h/mois**, avec des pointes de 25 à 30 enveloppes le même week-end après une grande course : c'est là que cela devient **un problème** pour quelqu'un qui a 4 à 8 h par semaine et une famille ;
- 100 commandes = 10 h/mois de logistique physique, soit plus de la moitié du temps disponible pour toute l'entreprise.

---

## 3. Modèle B — B2B (une édition par course)

La prospection est exclue (Agent 3). Hypothèses ⚠️ : 100 à 1 000 cartes identiques ; l'organisateur fournit son logo et le GPX officiel ; 1 à 3 tours de corrections ; facture à 30 jours.

Colonnes : **Z** = design fait de zéro, livraison chez Thibault puis réexpédition · **T** = modèle de carte paramétrable par course + livraison directe de l'imprimeur à l'organisateur (Exaprint livre en marque blanche chez le client du revendeur, sans mention de l'imprimeur 🔎 [graphiste.com](https://graphiste.com/blog/?p=8098), à confirmer).

| # | Étape | Outil | Z (min) | T (min) |
|---|---|---|---|---|
| 1 | Brief : visio ou appel, objectifs, quantité, date limite, budget | Visio + formulaire | 45-90 (**60**) | 30-60 (**45**) avec un formulaire de brief type |
| 2 | Collecte : logo vectoriel, GPX officiel, charte, partenaires, mentions | E-mail | 30-90 (**45**) | 15-45 (**25**) avec une liste fixe de pièces |
| 3 | Design propre à la course | Code de la carte / Figma | 240-600 (**420**) | 60-150 (**90**) : couleurs, logo, tracé, textes injectés dans le modèle |
| 4 | BAT : export PDF, aperçu 3D, préparation de l'e-mail (Thibault envoie) | `/print.html` + Gmail | 20-40 (**30**) | 15-25 (**20**) |
| 5 | Allers-retours de corrections (1 à 3 tours) | Gmail | 30-180 (**90**) | 30-90 (**45**) |
| 6 | Devis, bon de commande, conditions (acompte) | Logiciel de facturation | 30-60 (**40**) | 15-30 (**20**) |
| 7 | Fichiers d'impression, configuration et paiement chez l'imprimeur, validation de son BAT | Exaprint | 45-90 (**60**) | 30-60 (**40**) |
| 8 | Contrôle qualité à réception (comptage, échantillonnage) | — | 30-60 (**40**) | 10-20 (**15**) : un échantillon, ou des photos demandées à l'organisateur |
| 9 | Expédition : colis, étiquette Colissimo, dépôt | La Poste | 30-45 (**35**) | 0-10 (**5**) |
| 10 | Facture B2B (réception électronique obligatoire depuis le 01/09/2026, émission au plus tard le 01/09/2027 — voir `docs/facturation.md`) | Abby | 15-30 (**20**) | 10-15 (**10**) |
| 11 | Relance de paiement (souvent nécessaire avec les associations) | Gmail | 10-30 (**15**) | 5-15 (**10**) avec relances programmées dans le logiciel de facturation |
| 12 | Coordination, imprévus, appels | — | 30-120 (**60**) | 30-60 (**40**) |
| 13 | Après la course : bilan, photos, témoignage, proposition pour l'année suivante | Gmail | 30-60 (**40**) | 20-40 (**30**) |
| | **Total par événement** | | **585-1 495 min ≈ 10 à 25 h (≈ 16 h)** | **270-620 min ≈ 4,5 à 10 h (≈ 6,5 h)** |

Renouvellement de la même course l'année suivante : ≈ **3 h** (2 à 5) 🔎. Mise au point du modèle paramétrable (une seule fois) : **15 à 30 h**, développées surtout par Claude, avec validation et tests par Thibault ⚠️.

### 3.1 Charge mensuelle B2B

| Événements/mois | Z : de zéro | T : modèle | Renouvellements | Disponible (en tout / pour les opérations) |
|---|---|---|---|---|
| 1 | **≈ 16 h** | **≈ 6,5 h** | ≈ 3 h | 17-35 h / 9-17 h |
| 2 | **≈ 32 h** | **≈ 13 h** | ≈ 6 h | idem |
| 4 | **≈ 64 h** | **≈ 26 h** | ≈ 12 h | idem |
| 8 | **≈ 128 h** | **≈ 53 h** | ≈ 24 h | idem |

(+ ≈ 1 h/mois de suivi administratif.)

Lecture :
- Le travail se fait **4 à 10 semaines avant la course** ⚠️ : la charge réelle tombe de mars à septembre, avec des rendus le soir et le week-end, qui entrent en concurrence avec les courses de Thibault et sa famille.
- Le **design** représente 45 % du temps en mode Z. Le modèle paramétrable est l'investissement le plus rentable du modèle B.
- Le B2B rapporte beaucoup plus **par heure** (une seule facture et un seul colis pour des centaines de cartes), mais il **sature vite en nombre d'événements**. À partir de 4 événements par mois, il faut sous-traiter le design (graphiste indépendant payé à la carte) ou ne faire que des renouvellements.

---

## 4. Modèle hybride (B + QR code vers des cartes personnalisées en B2C)

| Bloc | Temps 🔎 |
|---|---|
| Édition de la course (comme B, mode T) | ≈ 6,5 h |
| Page d'atterrissage de la course, avec le tracé et le design préremplis (QR code imprimé sur la carte) | 30 à 60 min par course, une fois le gabarit de page fait |
| Import des résultats officiels (prénom, chrono, classement) pour préremplir et éviter les erreurs | ≈ 30 min par course ⚠️ (dépend du format des résultats) |
| Commandes B2C générées : par exemple 500 finishers × 1 à 5 % = 5 à 25 commandes ⚠️ | O : 12 min chacune → 1 à 5 h ; D : 7,5 min → 0,6 à 3 h |

Points propres à l'hybride :
- **Plus fiable que le B2C pur** : le tracé est officiel et les données viennent des résultats ; la vérification passe à ≈ 1 min.
- **Mais la charge arrive en rafale** : 80 % des commandes tombent sans doute dans les 10 jours qui suivent la course ⚠️. Vingt-cinq enveloppes la même semaine, c'est faisable une fois, pas quatre week-ends de suite. **C'est le modèle qui profite le plus du dropshipping.**
- Le design de la course est réutilisé tel quel en B2C : pas de design à faire par commande.

---

## 5. Automatisations possibles

> **Règle d'or** : chaque automatisation qui **écrit à un client, paie, dépense ou publie** demande une décision explicite de Thibault (base « Décisions » dans Notion), et les verrous de `.claude/settings.json` restent en place. Les automatisations ci-dessous sont à **préparer**, pas à activer, et aucun compte n'a été créé.

| # | Automatisation | Ce qu'elle remplace | Coût | Temps gagné | Source |
|---|---|---|---|---|---|
| 1 | **Paiement Stripe Checkout** (ou Payment Link) + **webhook** `checkout.session.completed` → Cloudflare Function → Airtable « Payée » | Étapes 2 et 3 : e-mail de demande de paiement, relance, pointage | 1,5 % + 0,25 € par carte EEE standard (≈ 0,47 € sur une Holo à 14,90 €), sans abonnement ; ≈ 1 jour de développement | **≈ 6 min/commande** | ✅ [Wise (grille Stripe)](https://wise.com/fr/blog/stripe-carte-bancaire-paiement), [Indy](https://www.indy.fr/guide/comptabilite-en-ligne/commerce/stripe-comptabilite/frais-stripe/) |
| 2 | **Facture automatique** : le webhook Stripe crée la facture dans le logiciel (Abby, API) ou dans la table Factures | Étape 3 | 0 € (Abby gratuit, d'après `docs/finance/logiciels-facturation.md`). Attention : **Airtable gratuit = 100 exécutions d'automatisation par mois et par espace de travail** ✅ ; au-delà de ≈ 80 commandes/mois, passer par le webhook plutôt que par une automatisation Airtable, ou payer le plan Team | ≈ 3,5 min/commande | ✅ [Airtable support](https://support.airtable.com/docs/creating-an-automation) |
| 3 | **Contrôles automatiques dans le formulaire** : longueur du prénom, chrono et classement plausibles, résolution minimale de la photo, adresse validée par l'API Adresse (BAN, gratuite), alerte si le tracé GPX est incohérent | Étape 1 | 0 € ; ≈ 0,5 jour de développement | ≈ 3 min/commande, et moins de réimpressions | 🔎 |
| 4 | **Génération des PDF et des lots** : déjà semi-automatique (un clic par lot). Le rendu se fait dans le navigateur (`canvas`), donc l'automatiser côté serveur demande un navigateur sans interface ou un portage vers node-canvas. **Pas prioritaire** : on gagne quelques minutes par lot. Plus utile : une vue Airtable « Lot prêt » qui signale quand 20 cartes de même finition attendent | Fixe des lots | 0 € | 10 à 15 min/lot | 🔎 |
| 5 | **E-mails transactionnels** : confirmation de commande, paiement reçu (reçu Stripe natif), « carte expédiée » avec numéro de suivi | Étapes 2 et 8 | Reçus Stripe : 0 €. E-mails personnalisés : Brevo ou Resend, offre gratuite ⚠️ (quotas à vérifier). **Décision de Thibault requise** : textes validés une fois, puis envoi automatique. En attendant, solution prudente : la fonction crée des **brouillons Gmail** que Thibault envoie en un clic (≈ 0,5 min au lieu de 3) | ≈ 5 min/commande | 🔎 |
| 6 | **Étiquettes en lot** : **Sendcloud** avec la Lettre suivie La Poste. Il faut d'abord signer avec La Poste le contrat « API Affranchissement Courrier Suivie » (offre 3125), puis saisir le numéro de contrat dans Sendcloud ✅. Boxtal est cité pour le même usage, sans documentation trouvée 🔎. Solution sans contrat : timbre suivi en ligne chez La Poste, adresse par adresse (aucun gain) | Étape 7 | Abonnement Sendcloud ⚠️ (tarif à vérifier) + affranchissement La Poste | ≈ 3 min/commande | ✅ [Sendcloud, activation Lettre suivie](https://support.sendcloud.com/hc/en-us/articles/360056918391-Lettre-Suivie-contract-activation), [Sendcloud, transporteur Lettre suivie](https://www.sendcloud.com/fr/transporteurs/lettre-suivie/), 🔎 [communauté Shopify](https://community.shopify.com/t/configurer-lettre-suivie/288915) |
| 7 | **Print-on-demand avec dropshipping** : voir le §5.1 | Étapes 4 à 8 et la quasi-totalité du fixe | Prix à l'unité plus élevé, plus le port, plus la douane si l'imprimeur est hors UE | **≈ 9 à 11 min/commande** + ≈ 3 à 9 h/mois de fixe | §5.1 |
| 8 | **Logistique tierce (3PL)** : Bigblue, Cubyn… | Pli et expédition | Sur devis, frais de mise en place ; la cible typique, ce sont les marques à **500-2 000 commandes/mois** 🔎. **Ne convient pas** : nos cartes sont fabriquées à la commande, sans stock, et il faudrait leur faire livrer chaque lot | — | 🔎 [La Fabrique du Net](https://www.lafabriquedunet.fr/logiciels/alternatives/alternative-bigblue), [ExpertMarket (Cubyn)](https://www.expertmarket.com/fr/logistique-ecommerce/cubyn-avis) |
| 9 | **Mise sous pli sous-traitée localement** (ESAT, étudiant, proche rémunéré) : Thibault reçoit les cartes et les confie avec les étiquettes déjà imprimées | Étape 6 | ≈ 0,3 à 1 € par pli ⚠️ | ≈ 3 min/commande | ⚠️ à vérifier localement |
| 10 | **B2B : modèle de carte paramétrable par course** (fichier de configuration : couleurs, logo SVG, GPX officiel, typographies, textes, partenaires) + page BAT générée automatiquement (aperçu 3D et PDF) | Design et BAT en B2B | 15 à 30 h une fois | ≈ 9 h par événement | 🔎 |
| 11 | **B2B : livraison directe de l'imprimeur à l'organisateur, en marque blanche** | Contrôle et expédition B2B | 0 € (livraison souvent comprise chez les imprimeurs en ligne 🔎) | ≈ 1 h par événement | 🔎 [graphiste.com](https://graphiste.com/blog/?p=8098) |

### 5.1 Print-on-demand avec envoi direct au client : qui le fait pour des cartes ?

| Prestataire | Cartes à collectionner à l'unité ? | Envoi direct au client, en marque blanche ? | Branchement | Remarques | Statut |
|---|---|---|---|---|---|
| **QPMN** (QP Market Network, groupe QP, Hong Kong) | **Oui** : « une carte unique 1-of-1 », sans minimum ; format standard 2,5 × 3,5 in ≈ 63 × 88 mm (**notre format**, alors qu'Exaprint le refuse avec la dorure) | **Oui** : « chaque commande est imprimée, mise sous étui et expédiée individuellement, sans minimum » ; marque blanche | Shopify, WooCommerce, Etsy, Squarespace, **API sur mesure** | Finitions holographiques et métalliques (8 effets de foil). Prix seulement sur grille dégressive, non publiés. Délai vers la France ≈ 10 à 15 jours ouvrés pour un deck 🔎. Avis Shopify : intégration fluide, mais livraison en « quelques semaines » | ✅ [QPMN, cartes personnalisées](https://www.qpmarketnetwork.com/create-your-own-custom-trading-cards/), ✅ [app Shopify](https://apps.shopify.com/qp-market-network), ✅ [fiche produit](https://www.qpmarketnetwork.com/app/products/Custom_Trading_Card_Games_%28TCG%29) |
| **MakePlayingCards (MPC)** (même groupe) | Oui, sans minimum ; production en 2 à 3 jours ouvrés | **Non indiqué** sur la page : c'est QPMN qui fait le dropshipping | Créateur en ligne | Dorure : design spécifique seulement à partir de 1 000 exemplaires | ✅ [MPC, print-on-demand](https://makeplayingcards.com/print-on-demand-cards.aspx), [WOPC](https://www.wopc.co.uk/explore/manufacturer/mpc-makeplayingcardscom/) |
| **Printful** | **Non** : un jeu de poker (dos personnalisé), pas de cartes à collectionner | Oui | Boutiques + API | ≈ 13,69 $ le jeu | ✅ [Printful](https://www.printful.com/custom-playing-cards) |
| **Gelato** | **Non trouvé** : cartes postales et cartes de vœux, avec dorure possible | Oui, production dans 32 pays | API + boutiques | Une carte postale n'est pas notre produit | ✅ [Gelato, cartes postales](https://www.gelato.com/uk/printed-gifts), [Gelato](https://gelato.com/products) |
| **Prodigi** | **Non trouvé** dans le catalogue public (seuls des sites tiers parlent de « jeux de cartes ») | Oui | API v4 | — | 🔎 [apis.io](https://apis.io/providers/prodigi/), [ecomposer](https://ecomposer.io/blogs/pod/best-print-on-demand-card-deck-suppliers) |
| **Cloudprinter** (Pays-Bas) | Cartes de visite dans le catalogue ; réseau de 381 imprimeurs dans 104 pays, **production proche du client (UE)** | Oui (API, Shopify, WooCommerce) | API REST + webhooks | Format, dorure et holographie à vérifier : piste « européenne » de secours | 🔎 [Cloudprinter](https://www.cloudprinter.com/blog/how-cloudprinter-com-revolutionizes-print-on-demand-with-the-global-print-api), [CB Insights](https://www.cbinsights.com/compare/cloudprintercom-vs-dreamship) |
| **Peecho** | Non : livres, magazines, posters | Oui | API | — | ✅ [Peecho](https://www.peecho.com/print-api) |
| **Exaprint** | Sets de ≤ 20 variantes ; minimum par variante **inconnu** (question en attente) | Livraison en marque blanche **à une adresse** par commande 🔎 ; pas de multi-adresses trouvé | Site web, sans API publique trouvée | Bien adapté au **B2B** (un colis à l'organisateur), pas au B2C à l'unité | 🔎 [graphiste.com](https://graphiste.com/blog/?p=8098) |

**Coûts cachés de QPMN (hors UE)** :
- **droit de douane de 3 € par article** sur les colis de moins de 150 € importés dans l'UE depuis le **1er juillet 2026**, IOSS compris ✅ ([Commission européenne](https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en)) ; des frais de traitement supplémentaires sont envisagés fin 2026 🔎 ([EMTA](https://emta.ee/en/private-client/consignments-travel-moving/consignments/taxation-consignments-01072026)) ;
- TVA à l'import ;
- un délai de 2 à 3 semaines : délicat pour un produit-souvenir commandé juste après la course ;
- aucune maîtrise du contrôle qualité.

À faire **par Thibault** :
- une commande d'échantillon (avec son accord ; aucun compte n'a été créé) ;
- vérifier le prix d'une carte unique holographique, le port vers la France et l'existence d'une dorure à chaud « or ».

---

## 6. Risques de complexité quand le volume monte

| Risque | Ce qui se passe | Parade |
|---|---|---|
| **Pics de saison (mai à octobre)** | Rafales de commandes le lundi après les grandes courses ; délais Exaprint plus longs en haute saison ⚠️ ; ce sont aussi les mois où Thibault court | Délai annoncé honnête (« expédition sous 3 semaines ») ; lots à date fixe (1er et 15 du mois) ; dropshipping au-delà du seuil |
| **Erreurs de données** (prénom, nom de la course, chrono, GPX partiel ou montre en pause, D+ faux) | Carte unique fausse = réimpression à nos frais + ≈ 45 min de SAV | Contrôles dans le formulaire ; case « J'ai vérifié mon aperçu » ; pour l'hybride, données issues des résultats officiels ; la référence de commande est déjà imprimée au verso |
| **Cartes abîmées ou perdues** | La lettre suivie n'est pas indemnisée comme un colis ⚠️ | Rigidifiant + pochette ; politique écrite « 1 réimpression gratuite » ; photo avant envoi pour les cartes Or |
| **Retards de l'imprimeur** (Exaprint ou QPMN) | Le client relance, du SAV en cascade | Statut de suivi visible par le client (lien) ; e-mail automatique de retard (validé par Thibault) |
| **SAV** | Croît de façon linéaire, et sans réponse rapide cela fait vite de mauvais avis | FAQ « Où en est ma carte ? » ; page de suivi par référence ; modèles de réponse en brouillons Gmail |
| **RGPD** | Photos de visage, adresses, e-mails dans Airtable, Gmail, Stripe, l'outil d'expédition, et peut-être chez l'imprimeur hors UE (QPMN à Hong Kong = **transfert hors UE**, à mentionner) | Registre des traitements ; mentions sur le site ; purge des photos ≈ 3 mois après l'expédition ; minimum de données envoyées à l'imprimeur |
| **Stock** | En B2C, aucun stock de cartes, mais un stock d'emballages ; en B2B, risque de surplus si l'organisateur surestime la quantité | Quantité ferme au bon de commande, acompte |
| **Outils gratuits plafonnés** | Airtable gratuit : 100 exécutions d'automatisation par mois ✅ ; Make gratuit : 1 000 crédits et 2 scénarios 🔎 ([jetadmin](https://www.jetadmin.io/blog/make-pricing/amp/)) | Faire porter la logique par la fonction Cloudflare (gratuite) plutôt que par des outils sans code |
| **Facturation électronique** | Émission obligatoire au plus tard le 01/09/2027 : B2B d'abord, puis e-reporting des ventes aux particuliers | Abby dès la première vente (voir `docs/finance/logiciels-facturation.md`) |
| **Point unique de défaillance** | Thibault malade, en vacances ou en course = plus rien n'est expédié | Délais annoncés avec de la marge ; dropshipping ; procédure écrite pour qu'un proche puisse mettre sous pli |

---

## 7. Version minimale pour démarrer, et ce qui casse en premier

### A — B2C

**Version minimale** (≈ 2 jours de développement + 1 h de réglages par Thibault) :
1. Site déployé, précommande → Airtable (déjà fait).
2. **Stripe Payment Link ou Checkout** avec la référence de commande, plus un webhook qui passe la commande en « Payée ».
3. **Reçu Stripe automatique** comme seule confirmation au client. Décision de Thibault requise : c'est un e-mail automatique.
4. **Lots à date fixe, deux fois par mois**, avec `/print.html`.
5. Étiquettes : timbre suivi en ligne au début ; Sendcloud dès ≈ 30 commandes/mois.
6. Brouillon Gmail « carte expédiée » préparé en lot, que Thibault envoie.
7. Délai affiché : **« expédiée sous 3 semaines »**.

Ce qui casse en premier, dans l'ordre :
1. **le temps de mise sous pli et de dépôt pendant le pic de saison** (≈ 25-30 enveloppes en une semaine) ;
2. **le SAV « où est ma carte ? »** ;
3. **les erreurs de données**, qui font des réimpressions ;
4. **la limite de 100 exécutions Airtable** si la facturation passe par une automatisation Airtable.

### B — B2B

**Version minimale** :
1. Formulaire de brief type ; liste des pièces à fournir.
2. **Un premier événement fait « à la main »** (≈ 16 h), qui sert à construire le **modèle paramétrable**.
3. BAT en PDF + lien vers l'aperçu 3D, envoyé par Thibault.
4. Exaprint (cartes identiques, sans le problème des Sets) **livré directement à l'organisateur**.
5. Devis et facture dans Abby, avec acompte de 30 à 50 % ⚠️.

Ce qui casse en premier, dans l'ordre :
1. **le temps de design et de corrections** : au-delà d'un événement par mois sans modèle ;
2. **la concentration au printemps**, puisque toutes les éditions se préparent de mars à juillet ;
3. **les délais serrés** : un organisateur qui valide le BAT 10 jours avant la course ;
4. **les relances de paiement** auprès des associations.

### Hybride

**Version minimale** : modèle B, plus une page de la course avec le design prérempli, plus le paiement Stripe. Les commandes B2C issues du QR code sont expédiées en **lot unique** 2 à 3 semaines après la course, avec un délai annoncé sur la page.

Ce qui casse en premier : **la rafale de commandes après la course**. C'est l'argument le plus fort pour le dropshipping.

---

## 8. Point clé : le B2C est-il viable sans dropshipping ?

- **Oui, au démarrage.** C'est même préférable pour contrôler la qualité des premières cartes. Il faut au minimum le paiement Stripe et les étiquettes en lot, sinon ≈ 31 min par commande rendent l'activité intenable dès 10 à 15 commandes/mois.
- En mode optimisé (≈ 12 min par commande, dont ≈ 6 min de logistique physique), **la limite est d'environ 30 commandes/mois en moyenne**, soit ≈ 50 en mois de pointe. **La mise sous pli devient « le » problème vers 50 commandes/mois** : 5 h de logistique physique, concentrées sur quelques week-ends, sur 17 à 35 h disponibles en tout.
- **Au-delà de ≈ 50 commandes/mois**, trois options, de la plus simple à la plus radicale :
  1. confier la mise sous pli à quelqu'un (ESAT, proche rémunéré) : Thibault garde le contrôle qualité ;
  2. passer en **dropshipping QPMN** pour la Holo, tout en gardant l'Or en interne si la dorure à chaud n'existe pas chez QPMN ;
  3. tout passer en dropshipping et ne garder que le SAV.
- La marge par carte baisse avec QPMN : port + 3 € de douane + un prix unitaire probablement plus élevé ⚠️. **C'est à chiffrer par l'Agent Finance** sur un devis réel.

**Recommandation opérations** :
1. Démarrer le B2C en mode **O** (Stripe + webhook + brouillons Gmail + lots deux fois par mois).
2. Commander dès maintenant un **échantillon QPMN** (décision et action de Thibault) pour avoir une solution de secours prête avant le pic de mai 2027.
3. Pour le B2B, ne signer un 2e événement par mois qu'une fois le modèle paramétrable construit.

---

## Sources

- La Poste, tarifs 2026 : https://www.laposte.fr/tarifs-postaux-courrier-lettres-timbres
- Sendcloud, Lettre suivie : https://www.sendcloud.com/fr/transporteurs/lettre-suivie/ · https://support.sendcloud.com/hc/en-us/articles/360056918391-Lettre-Suivie-contract-activation · https://www.sendcloud.com/fr/blog/blog-lettre-suivie-pro/
- Communauté Shopify (Boxtal / Sendcloud) : https://community.shopify.com/t/configurer-lettre-suivie/288915
- Stripe, frais : https://wise.com/fr/blog/stripe-carte-bancaire-paiement · https://www.indy.fr/guide/comptabilite-en-ligne/commerce/stripe-comptabilite/frais-stripe/
- Airtable, limites d'automatisation : https://support.airtable.com/docs/creating-an-automation
- Make, tarifs : https://www.jetadmin.io/blog/make-pricing/amp/
- QPMN : https://www.qpmarketnetwork.com/create-your-own-custom-trading-cards/ · https://apps.shopify.com/qp-market-network · https://www.qpmarketnetwork.com/app/products/Custom_Trading_Card_Games_%28TCG%29
- MakePlayingCards : https://makeplayingcards.com/print-on-demand-cards.aspx · https://www.wopc.co.uk/explore/manufacturer/mpc-makeplayingcardscom/
- Printful : https://www.printful.com/custom-playing-cards
- Gelato : https://www.gelato.com/uk/printed-gifts · https://gelato.com/products
- Prodigi : https://apis.io/providers/prodigi/ · https://ecomposer.io/blogs/pod/best-print-on-demand-card-deck-suppliers
- Cloudprinter : https://www.cloudprinter.com/blog/how-cloudprinter-com-revolutionizes-print-on-demand-with-the-global-print-api
- Peecho : https://www.peecho.com/print-api
- Exaprint, livraison en marque blanche : https://graphiste.com/blog/?p=8098
- Droit de douane UE de 3 € : https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en · https://emta.ee/en/private-client/consignments-travel-moving/consignments/taxation-consignments-01072026
- Logistique tierce : https://www.lafabriquedunet.fr/logiciels/alternatives/alternative-bigblue · https://www.expertmarket.com/fr/logistique-ecommerce/cubyn-avis
