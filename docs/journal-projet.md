# Journal du projet TrailDex

Résumé des décisions et de l'état du projet, pour reprendre dans une nouvelle session sans l'historique de conversation. À tenir à jour à chaque étape importante.

## État au 22 octobre 2026

### Site (branche `claude/practical-cray-da49sb`)
- Site React/Vite/Tailwind complet : accueil 3D, comment ça marche, créateur (import GPX, aperçu en direct), collection (sans niveaux ni badges ; galerie retirée le 22/10), FAQ.
- Composants 21st.dev adaptés : « Holo Card » (@kedhareswer) et « Phone Scroll Hero » (@ruixen.ui).
- Design de carte validé par Thibault : **recto = tracé en grand + effet holographique**, **verso = photo en petit + fiche de course**.
- Partage gratuit Instagram/Strava : image Story 9:16 ou post 4:5 générée dans le navigateur.
- Précommande → fonction Cloudflare `functions/api/preorder.ts` → Airtable. **Déployé le 23/10 sur Cloudflare Pages : https://traildex-site.pages.dev** (projet `traildex-site`, relié au dépôt GitHub, branche `claude/practical-cray-da49sb`, build `npm run build` → `dist`, `NODE_VERSION=22`, secret `AIRTABLE_TOKEN` en écriture seule sur la base TrailDex). Testé : précommande test TD-L2ME6F2V arrivée dans Airtable (à supprimer par Thibault). Adresse à ne pas diffuser avant mentions légales/CGV/prix définitifs ; domaine personnalisé à brancher après le choix du nom. Chaque push sur la branche redéploie automatiquement. **23/10 : site mis en pause** (`functions/_middleware.ts`) : page « Bientôt disponible » et précommandes refusées tant que la variable Cloudflare `SITE_OUVERT` n'est pas `oui` (Settings → Variables and secrets, puis Retry deployment). Adresses de déploiement `*.traildex-site.pages.dev` verrouillées par Cloudflare Access (« Allow Members », compte de Thibault) ; `robots.txt` interdit l'indexation. Attention : un « Retry »/« Rollback » sur un déploiement d'avant la pause remet le site complet en ligne.
- **Deux finitions seulement depuis le 22/10** : Holo (Rare, ou Épique dès 60 km-effort) et Or (Légendaire). Standard et rareté « Commune » retirées (coût d'impression quasi identique sur le produit dorure, marge la plus faible, Sets plus faciles à remplir). L'image de partage gratuite sert d'entrée de gamme.
- Prix **provisoires** : Holo 14,90 €, Or 24,90 € (`src/lib/config.ts`).
- Aperçu en ligne (privé) : https://claude.ai/artifact/L6g2axqytsZ13j8B78hwgA

### Paiement en ligne (23/10)
- Stripe Checkout branché, **pas encore activé** : `functions/api/preorder.ts` ouvre le paiement si `STRIPE_SECRET_KEY` existe, `functions/api/stripe-webhook.ts` passe la commande **Payée** (+ champs Airtable créés : `Paiement Stripe`, `Payé le`, `Montant payé`) ou **Annulée** si la session expire. Écran « Merci pour ta commande » au retour. 15 tests (signature, prix serveur, statuts, pause) OK en local.
- **Activé en mode test le 23/10** (compte Stripe « TrailDex », webhook vers `/api/stripe-webhook` avec 4 événements, secrets `STRIPE_SECRET_KEY` sk_test + `STRIPE_WEBHOOK_SECRET` dans Cloudflare ; jeton Airtable régénéré et passé en Secret). **Test réussi de bout en bout** : commande TD-L581LBDQ (Or, 24,90 €) payée avec la carte 4242 → Airtable Payée + pi_… + date + montant. Commandes de test à supprimer : TD-L2ME6F2V, TD-L5296NVT, TD-L581LBDQ. `GET /api/preorder` indique oui/non pour chaque réglage.
- Reste avant le réel : Mode réel après SIREN + IBAN + CGV/mentions légales. Pas à pas : `docs/paiement-stripe.md`.

### CGV, mentions légales, confidentialité (23/10)
- Pages `/cgv`, `/mentions-legales`, `/confidentialite` (`src/pages/Legal.tsx`), liées dans le pied de page. Projet rédigé par Claude, **à relire par Thibault (idéalement avocat/expert-comptable)**. Points clés : pas de droit de rétractation (produit personnalisé, art. L221-28 3°) avec case à cocher obligatoire avant paiement (version CGV enregistrée dans le champ Airtable `CGV acceptées`), encadré garanties légales, livraison 30 jours max, noms/logos de courses = titulaires (aucune affiliation), données : Cloudflare, Airtable, Stripe, Google, imprimeur, transporteur ; photo gardée 6 mois après expédition (à appliquer).
- **À compléter dans `COMPANY` (`src/lib/config.ts`)** : adresse, SIRET, e-mail, téléphone, médiateur de la consommation (adhésion obligatoire et payante, à choisir), zone de livraison (par défaut France métropolitaine). Tant que vide : surligné « à compléter » sur les pages.
- Polices désormais hébergées par le site (`@fontsource`), plus aucun appel à Google Fonts. FAQ mise à jour (paiement Stripe, pas de rétractation, GPX transmis seulement à la commande).

### Impression
- Imprimeur visé : **Exaprint**, produit « Carte de visite dorure à chaud », option **Sets** (≤ 20 variantes, même quantité).
- Contrainte découverte : avec dorure, format personnalisé limité à **40–55 mm × 55–95 mm** → 63 × 88 mm impossible en dorure. Question posée à trancher : demander le 63 × 88 avec dorure à Exaprint, sinon 55 × 77 mm, ou un autre imprimeur (MakePlayingCards) pour Or/Holo.
- Export `/print.html` (revu le 22/10, conforme au guide Exaprint France) : par carte, un PDF d'impression **CMJN** (profil ISO Coated v2 300 %, encrage max ≈ 297 %) + un PDF de **dorure séparé en 100 % K vectoriel** pour Holo/Or. Ancien mode calque « Acabado » gardé en option. Testé de bout en bout. **À confirmer avec le gabarit Exaprint** : fond perdu exact et profil ICC attendu. Textes de 3 à 4 pt au verso (libellés, sceau) : lisibles en numérique mais sous les 6 pt souvent conseillés.
- API Exaprint (ExaConnect) : existe, gratuite, sur demande ; dorure à chaud dans le catalogue API non confirmée. Utile pour le B2C plus tard, pas nécessaire pour le B2B. Voir `docs/exaprint-api.md`.
- 22/10 : fichiers test 55 × 85 mm (cartes démo Or « Grand Raid du Mercantour » et Holo « Trail du Mont Aiguille », carte 100 % vectorielle (toile PDF, polices intégrées, aucune image), style validé par Thibault : carte topo seulement dans l'encadré, verso sans fond de carte, plus d'effet holographique WebGL sur le site, CMJN 600 dpi + dorure 100 % K) envoyés à Thibault ; brouillon Gmail Exaprint recentré sur les cartes finisher (vérification des fichiers + demande de 2 exemplaires test, un holo et un or). Pièces jointes à ajouter par Thibault (trop lourdes pour l'outil Gmail). Régénérables dans /print.html (format 55 × 85, fond perdu 3).
- Maquette réalisée sur la course de Thibault (UTDP · Trail Alsace, 112,65 km, 3 927 m D+, 22 h 11). Nom exact de la course et classement : à confirmer par Thibault.

### Organisation (agents)
- Skill `ceo` + agents `operations`, `produit`, `marketing`, `finance-fournisseurs`, `juridique-fiscal`. Schéma : `docs/organisation-agents.png`.
- Tâche programmée « Point CEO TrailDex » : mercredi 7 h 41 (Paris). **Connexions Notion/Airtable/Gmail et dépôt à ajouter par Thibault** dans la tâche sur claude.ai.
- Notion : page privée « TrailDex — Direction » + base « Décisions ». Section « État du projet » ajoutée le 22/10 et 4 décisions « À valider » créées (format dorure, prix définitifs, expert-comptable, mise en ligne).
- Vérifié le 22/10 : la tâche n'a encore **aucune connexion** (Notion, Airtable, Gmail) ; aucun e-mail d'Exaprint dans Gmail.
- Verrou `.claude/settings.json` : aucun envoi, aucune suppression, aucune fusion, aucune tâche programmée sans accord.

### Finance
- Étude `docs/finance/prix-de-revient.md` (22/10) : marges par niveau selon le coût d'impression. **Inconnue décisive : quantité minimale par variante dans les Sets Exaprint** (cartes uniques). Brouillon de 4 questions pour Exaprint inclus, non envoyé.
- Airtable : seule la commande de test « Camille » (TD-EXEMPLE).

### Édition course (23/10)
- Modèle « carte finisher » pour les organisateurs dans `/print.html` (section Édition course) : GPX → carte identique pour tous, recto FINISHER + stats course, verso fiche + logos organisateur/partenaire + QR code (~12 mm, lisible) vers la page de la course. Export Exaprint vectoriel. Exemple : « Trail des Crêtes Vosgiennes, Édition 2027 ».
- **Outil d'impression en ligne (privé)** : https://claude.ai/artifact/LtuVK93ipUN6rCrfubbnvT — même outil que `/print.html` (édition course, export Exaprint, factures), polices intégrées. Chaque téléchargement de PDF demande une confirmation. Pour du CMJN, choisir une fois le profil `ISOcoated_v2_300_eci.icc` (sinon export RVB). À republier depuis Claude après chaque modification de l'outil. **23/10 : décision de Thibault, l'outil reste privé** : retiré du build du site public (`vite.config.ts`), construit à part par `npm run build:outil`. **Simplifié le 23/10 à la demande de Thibault** : écran principal = GPX → nom de la course → (Or/Holo) → « PDF pour l'imprimer » (55 × 85 mm, fond perdu 3, + fichier dorure) ou image Story/Post pour les réseaux. Puis, toujours le 23/10, **épuré complètement** : la page ne montre plus que le créateur de carte ; les anciens outils (JSON Airtable, lots, réglages Exaprint, profil CMJN, factures, édition avec logos) ne s'affichent qu'avec `print.html?avance` en local. PDF du créateur en RVB sauf profil CMJN déjà enregistré (Exaprint convertit). Lien ajouté en tête de la page Notion « TrailDex — Direction ».

### Facturation (22/10)
- Airtable : tables **Factures** (numéro F-AAAA-0001 / AV-AAAA-0001, avoirs, paiement) et **Achats** (registre des achats) créées ; lien Commande ↔ Facture.
- `/print.html` → section Factures : CSV de la table Factures → PDF par facture + `livre-des-recettes.csv` (totaux mensuels). Spécimens tant que `COMPANY` (SIRET, adresse, e-mail) n'est pas rempli dans `src/lib/config.ts`.
- **À faire par Thibault** : créer et activer l'automatisation « Commande payée → facture » (pas d'outil pour la créer depuis Claude) et passer les champs Total au format monétaire. Détail : `docs/facturation.md`.

- Logiciel de facturation (étude `docs/finance/logiciels-facturation.md`, 22/10) : **Abby** recommandé (plateforme agréée, gratuit, API + Make/Airtable), **Tiime** en secours. Ouvrir le compte gratuit dès le SIREN (réception obligatoire). Une seule numérotation : celle du logiciel dès la première vraie vente (notre générateur reste pour les spécimens/tests). Nouvelle mention TVA « art. L. 233-3 du CIBS » au 01/01/2027 (à confirmer). Fonctions URSSAF du logiciel à ignorer (cotisations CCSS).

### Business model (22/10)
- Étude des 4 agents : `docs/etude-modeles/` (00-synthese + marché, finances, commercial, opérations). Page Notion « Étude business model — B2C, B2B ou hybride » sous Direction.
- **Recommandation : démarrer en B2B (éditions de cartes vendues aux organisateurs, 2,50–3 € HT/carte, forfait min. 200 €, acompte 30 %) avec un QR code vers la carte personnalisée, sans remise.** B2C ouvert seulement via QR/communauté, pas de pub. Plan 90 jours jusqu'au 20/01/2027, critère d'arrêt : < 2 bons de commande sur ≈ 25 contacts chauds fin février. **Validé par Thibault le 22/10 : on commence par les cartes finisher pour les organisateurs, le personnalisé viendra ensuite.**

### Marketing (23/10)
- Nom de marque : étude de l'agent marketing. Recommandé **Peaksake**, alternatives **Isolyne** et **Vestigia** (Kairn et Arête risqués). Rien réservé ; INPI/EUIPO (classes 16, 28, 41), WHOIS et @ Instagram à vérifier par Thibault. **À trancher avant de créer le compte Instagram.**
- Instagram : pas d'automatisation (interdit par Instagram, risque de suppression du compte). Plan de démarrage manuel `docs/marketing/instagram-demarrage.md` + page Notion « Démarrage Instagram » sous Direction : 47 comptes, hashtags, 12 posts avec légendes (26/10 → 22/11), routine de 15 min, bio. Règle : aucun nom ni logo de course sur une carte sans accord de l'organisateur.
- Avis donné : pas de vente du fichier numérique « à quelques centimes » (frais de paiement, dorure impossible à reproduire chez soi, fichier piratable) ; Shopify possible plus tard pour le B2C, le PDF d'impression restant privé.

### Juridique
- Étude `docs/juridique/etude-statut-frontalier.md` : micro-entreprise française recommandée, cotisations à la CCSS Luxembourg (dispense possible sous ≈ 11 085 €/an), télétravail salarié à garder < 25 %, pas de société au Luxembourg, Legalstart non nécessaire (INPI gratuit). **À valider avec un expert-comptable frontaliers.**

- **22/10 au soir : Thibault a envoyé la demande à Exaprint via leur formulaire** (vérification des fichiers + 2 exemplaires test or et holo), avec les PDF d'avant le passage au 100 % vectoriel. À la réponse : renvoyer les fichiers vectoriels comme version définitive.

## Prochaines étapes (côté Thibault)
1. Réponse d'Exaprint sur le format avec dorure + gabarit.
2. Ajouter connexions et dépôt à la tâche « Point CEO TrailDex ».
3. Expert-comptable frontaliers, contrat de travail, télétravail.
4. Nom de domaine (après le choix du nom) ; mentions légales et CGV avant de diffuser le site.
5. Fixer les prix définitifs.
