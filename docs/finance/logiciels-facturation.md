# TrailDex — Quel logiciel de facturation pour la réforme de la facture électronique ?

*Étude de l'agent « Juridique & fiscalité » (volet finance), 22 octobre 2026.*
*Recherche documentaire uniquement : aucun compte créé, aucun éditeur contacté. Ce n'est pas un conseil juridique ou fiscal. Les points marqués « à confirmer » doivent être validés par l'expert-comptable.*

**Légende**
- ✅ **Vérifié** : lu aujourd'hui sur une source officielle (service-public, impots.gouv…) ou sur le site de l'éditeur pour ses propres prix et fonctions.
- 🔎 **Interprétation** : déduction raisonnable, ou information tirée d'un site spécialisé (non officiel).
- ⚠️ **Incertain / à confirmer** : sources contradictoires, ou rien trouvé d'officiel.

> **Limite importante de cette étude** : le site impots.gouv.fr était **en maintenance** le 22/10/2026 (pages « facturation électronique » et « liste des plateformes agréées » inaccessibles), Légifrance et le BOFiP répondaient en erreur (403/503). Le statut « plateforme agréée » de chaque logiciel repose donc sur les déclarations des éditeurs **et** sur des sites spécialisés qui ont relu la liste officielle (liste DGFiP datée du 22/09/2026 selon eux). **À revérifier sur la liste officielle avant de choisir.**

**Rappel de la situation** : micro-entreprise française (EI), franchise en base de TVA, vente en ligne de cartes (Holo 14,90 €, Or 24,90 €) à des particuliers, surtout en France, un peu dans l'UE ; quelques dizaines à quelques centaines de ventes par mois. Commandes dans Airtable, factures PDF générées par notre outil (`/print.html`). Paiement en ligne prévu plus tard (Stripe probablement). Cotisations sociales attendues à la **CCSS luxembourgeoise**, pas à l'URSSAF (voir `docs/juridique/etude-statut-frontalier.md`).

---

## 1. En bref

1. **Facture obligatoire ?** Oui pour TrailDex : une vente de biens à un particulier n'impose une facture que dans quelques cas, dont la **vente à distance** — ce qui est le cas d'une vente sur internet. ✅
2. **Calendrier** : depuis le **1er septembre 2026**, toute entreprise assujettie à la TVA (franchise comprise) doit pouvoir **recevoir** des factures électroniques ; au **1er septembre 2027**, les micro-entreprises doivent **émettre** en électronique (ventes aux professionnels) et faire l'**e-reporting** (ventes aux particuliers). ✅ (réception et émission) / 🔎 (e-reporting B2C)
3. **Mention TVA** : au **1er janvier 2027**, « art. 293 B du CGI » devient « **article L. 233-3 du CIBS** » ; l'ancienne mention reste admise jusqu'au **30 juin 2028**. 🔎 (plusieurs sources concordantes, texte officiel non relu)
4. **Recommandation provisoire** : **Abby** (plateforme agréée, offre gratuite, livre des recettes + registre des achats, API + Make/Zapier avec un modèle Airtable prêt). **Alternative : Tiime** (plateforme agréée, offre gratuite très complète, mais automatisation réservée à l'offre à 24,99 €/mois).
5. **À éviter pour notre cas** : Henrri et Freebe (pas plateformes agréées eux-mêmes), Indy (pas d'API ni de connecteur : impossible d'automatiser depuis Airtable/Stripe).

---

## 2. Ce que dit la règle

### 2.1 Une vente en ligne à un particulier impose-t-elle une facture ?

✅ **Oui.** Service-Public Entreprendre (fiche « Tout savoir sur la facturation », vérifiée le 07/08/2026) : « Lorsqu'une entreprise vend un bien à un particulier », l'émission d'une facture (ou d'une note) est obligatoire **uniquement** dans ces cas :
- à la demande du client ;
- pour les **ventes à distance** ;
- pour les livraisons intracommunautaires exonérées de TVA.
([entreprendre.service-public.gouv.fr/vosdroits/F23208](https://entreprendre.service-public.gouv.fr/vosdroits/F23208), consulté le 22/10/2026)

🔎 Une vente sur le site TrailDex est une vente à distance → **une facture par commande**. Pour les ventes à des particuliers d'autres pays de l'UE, l'article 289 du CGI impose aussi une facture pour les ventes à distance intracommunautaires (BOFiP cité par des résultats de recherche ; ⚠️ version en vigueur non relue, site indisponible).

Conséquences pratiques :
- ✅ Mentions obligatoires (même fiche + fiche F31808, vérifiée le 11/08/2026) : numéro unique et continu, date d'émission, date de vente, identité du vendeur (nom, « EI », SIREN, adresse), nom et adresse du client, désignation, quantité, prix, totaux, mention de franchise, date de règlement. Notre modèle (`src/lib/invoice.ts`) les contient déjà.
- 🔎 Les **« factures simplifiées »** et tickets de caisse ne sont pas la bonne piste pour nous : nous connaissons le nom et l'adresse du client (livraison) et la facture est obligatoire. Une facture complète par commande, générée automatiquement, est le plus simple.
- ✅ Pas de **facture électronique** (format Factur-X via plateforme) pour un particulier : la facture reste un **PDF** envoyé au client ; c'est l'**e-reporting** qui transmet les montants au fisc ([Tiime — facturation électronique B2C](https://www.tiime.fr/blog/facturation-electronique-b2c-2026), éditeur, consulté le 22/10/2026). 🔎

### 2.2 Calendrier de la réforme

| Date | Obligation pour TrailDex | Statut |
|---|---|---|
| **Depuis le 1er sept. 2026** | **Recevoir** les factures électroniques des fournisseurs (Exaprint, etc.) via une **plateforme agréée (PA)**. Concerne toutes les entreprises assujetties à la TVA, **franchise en base comprise**. | ✅ [Service-Public F23208](https://entreprendre.service-public.gouv.fr/vosdroits/F23208) (vérifié 07/08/2026) |
| **1er janv. 2027** | Nouvelle mention de franchise (voir § 2.3). | 🔎 |
| **1er sept. 2027** | **Émettre** en électronique les factures aux professionnels (rare chez nous) **et** transmettre l'**e-reporting** des ventes aux particuliers. | ✅ émission ([F23208](https://entreprendre.service-public.gouv.fr/vosdroits/F23208), [F31808](https://entreprendre.service-public.gouv.fr/vosdroits/F31808)) ; 🔎 e-reporting B2C (même date selon tous les sites spécialisés, la fiche officielle mentionne l'e-reporting sans date précise) |

**E-reporting des ventes aux particuliers** (🔎, sources non officielles) :
- Données transmises : **montants agrégés** (SIREN, période, total HT/TTC, taux de TVA = 0, nature « livraison de biens »). **Aucune donnée sur le client.**
- Concerne les franchisés en base « dès le premier euro ».
- **Fréquence pour la franchise en base : ⚠️ contradictoire** — **tous les 2 mois** selon Tiime, Legifiscal et ma-facture-electronique.org (fenêtre du 25 au 30 du mois suivant) ; **mensuelle** selon Abby. Peu importe en pratique si la plateforme le fait automatiquement, mais à confirmer.
- **Sanctions : ⚠️ contradictoire** — 250 € ou **500 €** par transmission manquante (plafond 15 000 €/an), la hausse à 500 € étant attribuée à la loi de finances 2026 par certains sites. Non vérifié dans le texte.

**Plateforme agréée (PA, ex-PDP)** : ✅ « La facture électronique est émise, transmise, reçue et conservée par l'intermédiaire d'une plateforme agréée » ([F23208](https://entreprendre.service-public.gouv.fr/vosdroits/F23208)). 🔎 Une seule PA pour la **réception** (c'est elle qui figure dans l'annuaire), plusieurs possibles pour l'émission. Une « **solution compatible** » (SC) est un logiciel qui n'est pas PA lui-même et passe par une PA partenaire : c'est autorisé, mais ajoute un intermédiaire.

### 2.3 La mention « TVA non applicable, art. 293 B du CGI » change-t-elle au 1er janvier 2027 ?

🔎 **Oui, mais sans urgence.**
- La TVA est transférée du Code général des impôts vers le **Code des impositions sur les biens et services (CIBS)**. Le transfert, prévu au 1er septembre 2026, a été **reporté au 1er janvier 2027** par l'**ordonnance n° 2026-671 du 27 juillet 2026** ([WebLex — TVA et CIBS, rendez-vous en 2027](https://www.weblex.fr/weblex-actualite/tva-et-cibs-rendez-vous-en-2027) ; [Landot avocats, 28/07/2026](https://blog.landot-avocats.net/2026/07/28/recodifications-en-matiere-de-tva-dechets-reseaux-de-froid-travaux-forestier-octroi-de-mer-ponts/) ; consultés le 22/10/2026).
- Nouvelle mention : **« TVA non applicable, article L. 233-3 du CIBS »**.
- **Période de transition** : l'ancienne mention reste admise **jusqu'au 30 juin 2028**.
- Le fond ne change pas (mêmes seuils, même franchise).
- ⚠️ **À confirmer** : le numéro exact de l'article (d'anciens articles, antérieurs au report, citaient « L. 223-3 ») et la date de fin de transition, dans le texte de l'ordonnance au Journal officiel (Légifrance inaccessible aujourd'hui). La fiche Service-Public F31808 (vérifiée le 11/08/2026) cite encore l'art. 293 B, ce qui est normal avant 2027.
- 🔎 **Action proposée** : passer à la nouvelle mention dans `src/lib/invoice.ts` (ou dans le logiciel choisi) **début 2027**, une fois le numéro confirmé ; pas besoin de corriger les factures déjà émises.

---

## 3. Les cinq logiciels comparés

Prix **HT par mois**, relevés le 22/10/2026 sur les pages tarifs des éditeurs (sauf mention). Les prix changent souvent et des promotions temporaires s'affichent.

| | **Abby** | **Tiime** | **Indy** | **Freebe** | **Henrri** |
|---|---|---|---|---|---|
| **Offre gratuite** | ✅ Basique 0 € : factures illimitées, facturation électronique, livre des recettes et des achats | ✅ Free 0 € : factures illimitées, PA, e-reporting, avoirs | ✅ Essentiel 0 € : factures, avoirs, PA | ❌ (essai 30 jours) | ✅ gratuit illimité (factures, devis, avoirs) |
| **Offre utile pour nous** | **Start 9 €** (envoi par e-mail, paiement Stripe) ou **Pro 15 €** (moins de frais Stripe, banque) — prix annuels ; 11 € / 19 € au mois ; promo –10 % affichée | **Business 24,99 €** (API, Make, liens de paiement Stripe) ; Initial 9,99 € / Smart 17,99 € exigent d'ouvrir le compte pro Tiime | Autonomie 15 € (19 € sans engagement) pour livre des recettes et déclarations | 12,50 € (150 € TTC/an) ou 15 € au mois, tout inclus | Pro 0 € ; Expert 17 € si besoin |
| **Plateforme agréée** | ✅🔎 **Oui, PA**, immatriculée le **29/01/2026** (déclaration éditeur + sites spécialisés) | ✅🔎 **Oui, PA** (déclaration éditeur + sites spécialisés) | ✅🔎 **Oui, PA** (déclaration éditeur ; numéro non publié) | ❌🔎 **Non** : « solution compatible » via la PA **SuperPDP** | ❌🔎 **Non** : solution compatible, PA partenaire annoncée **Pennylane** (⚠️ une source isolée dit le contraire) |
| **E-reporting B2C** | 🔎 Oui, automatique, toutes offres (gratuite comprise) | 🔎 Oui, inclus en Free | 🔎 Oui, inclus sans surcoût | ⚠️ non documenté (dépend de SuperPDP) | ⚠️ non documenté (dépend du partenaire) |
| **Livre des recettes** | ✅ Oui (dès Basique), exports Excel/PDF/FEC | ⚠️ incertain (cité dans une version de la page Free seulement) | ⚠️ Autonomie seulement, indiqué « micro-BNC » (pas clair pour la vente de marchandises) | ✅ Oui | ⚠️ non mentionné (export comptable seulement) |
| **Registre des achats** (obligatoire pour nous) | ✅ Oui (dès Basique) | ⚠️ non mentionné | ⚠️ non mentionné | ✅ Oui | ⚠️ non mentionné |
| **Déclaration URSSAF** (inutile pour Thibault) | Estimation des cotisations (Basique), télédéclaration (Start) | « Bientôt » | Autonomie | Pré-remplie, incluse | — |
| **API / Make / Zapier** | ✅ API publique (docs.abby.fr : factures, avoirs, livre des recettes, achats) ; ✅ modules **Make** (créer, finaliser, envoyer une facture, avoir) et Zapier ; **modèle « Airtable → Abby » prêt** | ✅ API et Make **uniquement en Business** | ❌🔎 pas d'API publique, pas de Zapier (l'app « Indy » de Zapier est un autre produit) | ⚠️ non mentionnés ; import CSV oui | ⚠️ API « bientôt » |
| **Stripe** | Paiement par carte via Stripe dès Start (frais Start 3,4 % + 0,60 € ; Pro 1,9 % + 0,50 €) | Liens de paiement Stripe/GoCardless en Business | « Pay by link » 2,2 % + 0,15 € (prestataire non nommé) | Lien Stripe sur facture, 0 % de commission Freebe | Henrri Pay (carte) |
| **Factures en série (dizaines/mois)** | 🔎 Oui via Make/API depuis Airtable (une facture par commande, numérotation automatique à la finalisation) | 🔎 Oui via Make en Business, sinon saisie manuelle | ❌ saisie manuelle une par une | 🔎 import CSV (à tester), sinon manuel | ❌ manuel |
| **Numérotation / avoirs** | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| **Pensé pour** | Micro-entrepreneurs, tous types | Indépendants et TPE | Indépendants (surtout services) | Freelances de services (consultants) | TPE, généraliste |

Sources (consultées le 22/10/2026) : [abby.fr/tarifs](https://abby.fr/tarifs), [abby.fr/ai-info.md](https://abby.fr/ai-info.md) (vérifiée par Abby le 03/09/2026), [docs.abby.fr](https://docs.abby.fr/llms.txt), [docs.abby.fr/sans-code](https://docs.abby.fr/sans-code), [Abby — modèle Airtable](https://abby.fr/ressources/automatiser-facturation-airtable), [Abby — e-reporting auto-entrepreneur](https://abby.fr/guide/facturation-electronique/e-reporting-auto-entrepreneur) (MAJ 24/09/2026) ; [tiime.fr/tarifs](https://www.tiime.fr/tarifs), [Tiime — B2C](https://www.tiime.fr/blog/facturation-electronique-b2c-2026) ; [indy.fr/tarifs](https://www.indy.fr/tarifs/) ; [freebe.me/tarifs](https://www.freebe.me/tarifs), [freebe.me](https://www.freebe.me/) ; [henrri.com](https://www.henrri.com/). Statuts PA : [ma-facture-electronique.org — Abby](https://ma-facture-electronique.org/plateforme-agreee/liste-officielle/abby/), [Tiime](https://ma-facture-electronique.org/plateforme-agreee/liste-officielle/tiime/), [Indy](https://ma-facture-electronique.org/plateforme-agreee/liste-officielle/indy/), [Freebe](https://ma-facture-electronique.org/plateforme-agreee/liste-officielle/freebe/), [Henrri](https://ma-facture-electronique.org/plateforme-agreee/liste-officielle/henrri/) (site affilié, MAJ 06/10/2026, se réfère à la liste DGFiP du 22/09/2026) ; [comparatif-facture-electronique.fr — Abby](https://www.comparatif-facture-electronique.fr/abby-avis-test/), [Henrri](https://www.comparatif-facture-electronique.fr/henrri-facturation-electronique-avis/) ; [Zapier — app Indy](https://zapier.com/apps/indy/integrations).

**Attention aux écarts de prix relevés** : Abby affichait le 22/10 Start 8,10 €, Pro 13,50 €, Business 29,70 € (promo –10 % sur 9 / 15 / 33 €) ; un site spécialisé donne 9 / 15 / 33 € en annuel et 11 / 19 / 39 € au mois. Indy : Premium de 15 à 49 € selon le statut d'après un site tiers. Freebe : une page parle d'un outil gratuit pour auto-entrepreneurs, la page tarifs n'en montre pas.

### Point frontalier : tous ces logiciels supposent l'URSSAF

🔎 Abby, Indy, Freebe (et bientôt Tiime) proposent d'**estimer** ou de **déclarer** les cotisations à l'URSSAF. Pour Thibault, qui devrait cotiser à la **CCSS luxembourgeoise** (ou être dispensé), ces fonctions sont **inutiles et risquées** :
- les **estimations de cotisations** affichées (≈ 12 % du CA pour la vente) seront **fausses** pour lui — à ignorer ou désactiver ;
- **ne pas connecter** le logiciel à l'URSSAF ni autoriser de télédéclaration automatique tant que l'expert-comptable n'a pas confirmé la procédure (une déclaration à l'URSSAF pourrait entretenir l'idée qu'il relève du régime micro-social) ;
- pas besoin de payer une formule plus chère pour la « déclaration URSSAF » : c'est un argument de vente sans valeur pour lui.
⚠️ Comment déclarer son chiffre d'affaires à l'URSSAF (s'il le faut) sans cotiser, dans la situation frontalière : question pour l'expert-comptable.

---

## 4. Recommandation

### Premier choix : **Abby** (offre gratuite au départ, puis Start ou Pro)

Pourquoi :
1. **Plateforme agréée elle-même** (pas d'intermédiaire) : réception des factures fournisseurs, e-reporting des ventes aux particuliers et émission électronique inclus **dès l'offre gratuite** (selon l'éditeur).
2. **Couvre nos deux registres obligatoires** : livre des recettes **et** registre des achats (les factures électroniques d'Exaprint arriveront directement dedans).
3. **S'automatise depuis Airtable** : API publique, modules Make (« créer facture → finaliser → envoyer », avoirs) et un **modèle Airtable → Abby** fourni par l'éditeur. On garde Airtable comme source des commandes ; Abby devient la source officielle des factures et de la numérotation.
4. **Stripe** possible plus tard : soit les paiements Stripe d'Abby (mais frais élevés en Start : 3,4 % + 0,60 € ≈ 1,11 € sur une carte à 14,90 €, soit ~7,5 %), soit — 🔎 probablement mieux — notre **propre compte Stripe** sur le site, avec un scénario Make « paiement Stripe réussi → commande Payée dans Airtable → facture Abby ». ⚠️ Tarifs Stripe standard non vérifiés ici.
5. Coût : **0 €** pour démarrer ; **9 à 15 €/mois HT** si l'API/Make ou l'envoi par e-mail exigent une formule payante (⚠️ la formule exacte requise pour l'API et Make n'est **pas indiquée** dans la documentation — à vérifier en ouvrant le compte gratuit).

Ce qu'on fait de notre outil maison : il reste utile pour les **spécimens** et en **secours**, mais ne doit plus émettre de numéros de facture une fois Abby en place (**une seule numérotation**, sinon trous ou doublons). La table Airtable « Factures » deviendrait une copie (numéro Abby + lien PDF), la table « Achats » pourrait être abandonnée au profit du registre Abby.

### Alternative : **Tiime**

- Plateforme agréée, **offre Free très complète** (PA, e-reporting B2C, factures illimitées, avoirs).
- Bon choix si l'on reste en **saisie manuelle** au début (quelques dizaines de factures/mois, c'est faisable) ou si l'expert-comptable choisi travaille avec Tiime (outil très répandu chez les comptables).
- Inconvénients : API, Make et paiement en ligne **seulement en Business (24,99 €/mois HT)** ; registre des achats et livre des recettes **non confirmés** ; les offres payantes intermédiaires imposent d'ouvrir le **compte pro Tiime**.

### Écartés pour TrailDex
- **Indy** : PA gratuite et sérieuse, mais **aucune API ni connecteur** → saisie à la main de chaque facture, ingérable à quelques centaines de ventes/mois ; livre des recettes réservé à l'offre à 15 € et décrit pour les « micro-BNC ».
- **Freebe** : **pas PA** (passe par SuperPDP), payant (12,50 €/mois), pensé pour les prestataires de services ; son point fort (déclaration URSSAF) ne sert pas à Thibault.
- **Henrri** : gratuit, mais **pas PA** (partenaire Pennylane annoncé), e-reporting non documenté, pas d'API à ce jour, pas de registre des achats affiché.

---

## 5. Calendrier proposé

| Quand | Quoi | Qui |
|---|---|---|
| **Maintenant → immatriculation** | Rien à acheter. L'outil maison continue de produire des spécimens. Vérifier sur impots.gouv.fr (quand le site revient) que **Abby et Tiime figurent bien sur la liste des PA**. | Agent juridique (veille) / Thibault |
| **Dès l'obtention du SIREN** | Ouvrir **Abby Basique (gratuit)** et la désigner comme **plateforme de réception** (obligation en vigueur depuis le 01/09/2026). Désactiver/ignorer les fonctions URSSAF. | Thibault |
| **Avant la première vraie vente** | Choisir **une seule source de numérotation**. Recommandé : émettre dès le départ les factures **dans Abby** (scénario Make depuis Airtable, testé sur la commande TD-EXEMPLE en brouillon). Sinon, outil maison pour quelques semaines au maximum. | Thibault (création du scénario) + agent opérations |
| **Janvier 2027** | Passer la mention à « TVA non applicable, article L. 233-3 du CIBS » (après confirmation du numéro). Ancienne mention tolérée jusqu'au 30/06/2028. | Agent juridique / produit |
| **Arrivée de Stripe** | Brancher Stripe → Airtable → Abby (Make). Comparer frais Stripe directs vs paiements Abby. | Thibault + agent finance |
| **Au plus tard juin 2027** | Vérifier dans Abby le **premier e-reporting à blanc** (paramétrage « franchise en base », périodicité) et la conformité de bout en bout. | Thibault + expert-comptable |
| **1er septembre 2027** | Obligation d'émission et d'e-reporting en vigueur. Tout doit déjà tourner. | — |

🔎 Basculer **tôt** (dès les premières ventes) plutôt qu'en 2027 : changer de numérotation en cours d'année complique le livre des recettes, et l'automatisation sera de toute façon nécessaire avec Stripe.

---

## 6. Ce qui reste à valider

### Avec l'expert-comptable (questions prêtes à poser)
1. « Je suis micro-entrepreneur en franchise en base, vente en ligne de biens à des particuliers, frontalier affilié à la CCSS luxembourgeoise. Une facture par commande est-elle bien obligatoire (vente à distance) ? Des factures automatiques générées par une plateforme agréée depuis Airtable/Stripe vous conviennent-elles ? »
2. « Pour l'e-reporting B2C à partir du 1er septembre 2027 : quelle périodicité pour la franchise en base (mensuelle ou bimestrielle) ? Faut-il aussi transmettre des **données de paiement** pour des ventes de biens ? Quelle sanction en cas d'oubli (250 € ou 500 €) ? »
3. « Abby (ou Tiime) vous convient-il ? Avez-vous un outil préféré avec lequel vous partagez les accès ? »
4. « Mon logiciel propose de déclarer mon chiffre d'affaires à l'URSSAF et d'estimer des cotisations : dois-je l'utiliser alors que je relève de la CCSS ? Dois-je quand même déclarer mon CA à l'URSSAF (à zéro cotisation), et comment ? »
5. « Nouvelle mention au 1er janvier 2027 : confirmez-vous "TVA non applicable, article L. 233-3 du CIBS" et la tolérance de l'ancienne mention jusqu'au 30 juin 2028 ? »
6. « Pour mes rares clients d'autres pays de l'UE : la facture et l'e-reporting changent-ils quelque chose tant que je reste sous 10 000 € de ventes à distance UE ? »
7. « Si je change de logiciel en cours d'année, comment gérer la numérotation (nouvelle série ?) et l'archivage des factures émises par mon outil maison ? »

### À vérifier par nous-mêmes (sans contacter personne)
- Liste officielle des PA sur impots.gouv.fr (site en maintenance le 22/10/2026) : Abby, Tiime, Indy ; absence de Freebe et Henrri.
- En ouvrant le compte Abby gratuit (décision de Thibault) : quelle formule débloque l'API et Make ; envoi des factures par e-mail ; comment la mention de franchise et la « nature : livraison de biens » sont paramétrées ; export du livre des recettes.
- Texte de l'ordonnance n° 2026-671 au Journal officiel (numéro d'article CIBS, fin de transition).

---

## 7. Propositions de décisions pour le CEO

1. **Logiciel** : retenir **Abby** comme logiciel de facturation et plateforme agréée, **Tiime** en alternative (si l'expert-comptable préfère). → À valider par Thibault.
2. **Réception** : dès l'immatriculation, ouvrir le compte Abby gratuit et le déclarer comme plateforme de réception. → Action Thibault (pas de dépense).
3. **Numérotation** : une seule source de numéros de facture, Abby, dès la première vraie vente ; l'outil maison reste pour les spécimens. → Décision Thibault.
4. **URSSAF** : ne pas activer les fonctions URSSAF du logiciel avant l'avis de l'expert-comptable. → Règle à ajouter à `docs/facturation.md`.
5. **Contact externe (brouillon, non envoyé)** — question à l'expert-comptable frontaliers, à joindre au rendez-vous déjà prévu : les 7 questions du § 6.
6. **Mention TVA** : mettre à jour `src/lib/invoice.ts` en janvier 2027 après confirmation (tâche pour l'agent produit, non urgente).

---

## 8. Sources (consultées le 22 octobre 2026)

**Officielles**
- Service-Public Entreprendre — Tout savoir sur la facturation (vérifié le 07/08/2026) : https://entreprendre.service-public.gouv.fr/vosdroits/F23208
- Service-Public Entreprendre — Mentions obligatoires sur une facture (vérifié le 11/08/2026) : https://entreprendre.service-public.gouv.fr/vosdroits/F31808
- impots.gouv.fr — pages facturation électronique et liste des PA : **inaccessibles (maintenance)** le 22/10/2026 : https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees
- economie.gouv.fr, Légifrance, BOFiP : **inaccessibles** (403/503) le 22/10/2026.

**Spécialisées / secondaires**
- WebLex — TVA et CIBS : rendez-vous en 2027 : https://www.weblex.fr/weblex-actualite/tva-et-cibs-rendez-vous-en-2027
- Landot avocats — ordonnance du 27/07/2026 : https://blog.landot-avocats.net/2026/07/28/recodifications-en-matiere-de-tva-dechets-reseaux-de-froid-travaux-forestier-octroi-de-mer-ponts/
- Legifiscal — mention facture et CIBS : https://www.legifiscal.fr/actualites-fiscales/4613-mention-facture-changement-article-exoneration-tva-autoentrepreneurs.html
- Legifiscal — périodicité de l'e-reporting (04/11/2025) : https://www.legifiscal.fr/creation-entreprise/e-reporting-periodicite.html
- ma-facture-electronique.org — fréquence e-reporting par régime : https://ma-facture-electronique.org/e-reporting/frequence-selon-regime-tva/
- data.gouv.fr — liste enrichie des PA (FNAE, MAJ 06/08/2026, non officielle) : https://www.data.gouv.fr/datasets/liste-des-plateformes-agreees-pour-la-facturation-electronique
- Pages éditeurs et comparateurs : voir sous le tableau du § 3.

**Chiffres et faits non vérifiés sur une source officielle** : date d'e-reporting B2C pour les micro-entreprises (01/09/2027, consensus des sites spécialisés) ; périodicité (mensuelle ou bimestrielle) ; montant des sanctions ; numéro d'article L. 233-3 du CIBS et transition au 30/06/2028 ; statut PA de chaque logiciel (liste officielle non consultée) ; formule Abby requise pour l'API/Make ; frais Stripe standard.
