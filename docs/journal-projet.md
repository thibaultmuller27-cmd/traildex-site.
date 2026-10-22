# Journal du projet TrailDex

Résumé des décisions et de l'état du projet, pour reprendre dans une nouvelle session sans l'historique de conversation. À tenir à jour à chaque étape importante.

## État au 22 octobre 2026

### Site (branche `claude/practical-cray-da49sb`)
- Site React/Vite/Tailwind complet : accueil 3D, comment ça marche, créateur (import GPX, aperçu en direct), collection (sans niveaux ni badges ; galerie retirée le 22/10), FAQ.
- Composants 21st.dev adaptés : « Holo Card » (@kedhareswer) et « Phone Scroll Hero » (@ruixen.ui).
- Design de carte validé par Thibault : **recto = tracé en grand + effet holographique**, **verso = photo en petit + fiche de course**.
- Partage gratuit Instagram/Strava : image Story 9:16 ou post 4:5 générée dans le navigateur.
- Précommande → fonction Cloudflare `functions/api/preorder.ts` → Airtable. **Pas encore déployé** (Cloudflare Pages + secret `AIRTABLE_TOKEN` à configurer par Thibault).
- **Deux finitions seulement depuis le 22/10** : Holo (Rare, ou Épique dès 60 km-effort) et Or (Légendaire). Standard et rareté « Commune » retirées (coût d'impression quasi identique sur le produit dorure, marge la plus faible, Sets plus faciles à remplir). L'image de partage gratuite sert d'entrée de gamme.
- Prix **provisoires** : Holo 14,90 €, Or 24,90 € (`src/lib/config.ts`).
- Aperçu en ligne (privé) : https://claude.ai/artifact/L6g2axqytsZ13j8B78hwgA

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

### Facturation (22/10)
- Airtable : tables **Factures** (numéro F-AAAA-0001 / AV-AAAA-0001, avoirs, paiement) et **Achats** (registre des achats) créées ; lien Commande ↔ Facture.
- `/print.html` → section Factures : CSV de la table Factures → PDF par facture + `livre-des-recettes.csv` (totaux mensuels). Spécimens tant que `COMPANY` (SIRET, adresse, e-mail) n'est pas rempli dans `src/lib/config.ts`.
- **À faire par Thibault** : créer et activer l'automatisation « Commande payée → facture » (pas d'outil pour la créer depuis Claude) et passer les champs Total au format monétaire. Détail : `docs/facturation.md`.

- Logiciel de facturation (étude `docs/finance/logiciels-facturation.md`, 22/10) : **Abby** recommandé (plateforme agréée, gratuit, API + Make/Airtable), **Tiime** en secours. Ouvrir le compte gratuit dès le SIREN (réception obligatoire). Une seule numérotation : celle du logiciel dès la première vraie vente (notre générateur reste pour les spécimens/tests). Nouvelle mention TVA « art. L. 233-3 du CIBS » au 01/01/2027 (à confirmer). Fonctions URSSAF du logiciel à ignorer (cotisations CCSS).

### Business model (22/10)
- Étude des 4 agents : `docs/etude-modeles/` (00-synthese + marché, finances, commercial, opérations). Page Notion « Étude business model — B2C, B2B ou hybride » sous Direction.
- **Recommandation : démarrer en B2B (éditions de cartes vendues aux organisateurs, 2,50–3 € HT/carte, forfait min. 200 €, acompte 30 %) avec un QR code vers la carte personnalisée, sans remise.** B2C ouvert seulement via QR/communauté, pas de pub. Plan 90 jours jusqu'au 20/01/2027, critère d'arrêt : < 2 bons de commande sur ≈ 25 contacts chauds fin février. **Validé par Thibault le 22/10 : on commence par les cartes finisher pour les organisateurs, le personnalisé viendra ensuite.**

### Juridique
- Étude `docs/juridique/etude-statut-frontalier.md` : micro-entreprise française recommandée, cotisations à la CCSS Luxembourg (dispense possible sous ≈ 11 085 €/an), télétravail salarié à garder < 25 %, pas de société au Luxembourg, Legalstart non nécessaire (INPI gratuit). **À valider avec un expert-comptable frontaliers.**

## Prochaines étapes (côté Thibault)
1. Réponse d'Exaprint sur le format avec dorure + gabarit.
2. Ajouter connexions et dépôt à la tâche « Point CEO TrailDex ».
3. Expert-comptable frontaliers, contrat de travail, télétravail.
4. Déployer sur Cloudflare Pages + secret Airtable, nom de domaine.
5. Fixer les prix définitifs.
