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

### Exaprint (30/10)
- Réponse d'Exaprint : produit « carte de visite dorure à chaud » 55 × 85 mm portrait recto verso ; séries finisher configurables en ligne ; cartes toutes différentes « à vérifier selon le volume » (service sur mesure). Consignes fichiers : document **59 × 89 mm (fond perdu 2 mm)**, CMJN + fichier de dorure séparé noir 100 % sans trame superposé, **polices vectorisées**, pas de détails trop fins. Ils demandent : nombre de séries, quantité par série, nombre de cartes personnalisées, face à dorer, couleur de dorure.
- **01/11 : demande de devis envoyée par Thibault via le formulaire « sur mesure » d'Exaprint** (fichiers 59 × 89 mm vectorisés, 2 séries test or + holo, volumes finisher et cartes personnalisées, questions holo, plaque par carte, envoi direct aux clients). En attente de réponse. Printeurope écarté par Thibault.
- **02/11 : réponse Exaprint (Beya S., service client) : refus car dorure recto ET verso impossible ; dorure possible uniquement au recto.** Outil adapté : dorure au recto seulement par défaut (`foilBack` désactivé), le logo et le sceau du verso restent imprimés en couleur ; fichier de dorure d'une seule page. Nouveaux PDF test générés pour renvoyer la demande.
- **04/11 : appel de Thibault à Exaprint : tout est possible dès 50 exemplaires par commande, chaque carte pouvant être différente** (lots de 50 cartes individuelles). Paiement différé seulement après 6 commandes. Décision recommandée : pas d'achat de machine ; impression par lots de 50 chez Exaprint (précommande, expédition sous 2–3 semaines), places libres remplies par des cartes de démonstration. À obtenir : prix pour 50 cartes dorure recto (or / hologramme), mélange or + holo dans un même lot ?
- 03/11 : réponse type d'Exaprint renvoyant vers la gamme « cartes de visite luxe » : **dorure hologramme disponible** (et or, argent, cuivre…). Cartes à l'unité toujours sans réponse. Documentation API ExaConnect lue (voir `docs/exaprint-api.md`) : commandes multi-articles, fichiers par URL, livraison directe au client, mode test `fakeOrder` ; accès via un Account Manager.
- 02/11 : relance envoyée par Thibault (fichiers dorure recto seule) avec une question claire : 20 cartes toutes différentes à 1 exemplaire avec dorure or au recto, possible oui/non, prix, minimum par modèle, holographique oui/non. En attente.
- Outil mis à jour : fond perdu 2 mm par défaut (55 × 85), texte converti en tracés (plus aucune police dans les PDF), traits de dorure ≥ 0,3 mm. Nouveaux PDF test générés.
- Alternative trouvée : **Printeurope** (Mundolsheim, 67) jeux de cartes 63 × 89 mm, dès 1 jeu, cartes toutes différentes au même prix : 1 jeu de 54 cartes couché 350 g + pelliculage brillant = 46 € HT (≈ 1 €/carte) ; 25 jeux = 280 € HT livraison comprise (≈ 0,25 €/carte). Dorure / holographique sur cartes différentes : à leur demander.

### Notion réorganisé (04/11)
- Page « TrailDex — Direction » refaite en tableau de bord coloré : 6 dossiers (Impression & fournisseurs, Site & produit, Paiement & finances, Juridique & administratif, Marketing & marque, Stratégie & pilotage), 3 priorités, et une base **Tâches** (Kanban) : vues Kanban (par statut), Par thème, Par responsable ; chaque dossier a son Kanban filtré. 27 tâches créées depuis l'état du projet. Base Décisions, rapports CEO et étude business model rangés dans Stratégie & pilotage ; plan Instagram dans Marketing. Skill `ceo` mis à jour (rapports dans Stratégie, Kanban à tenir à jour).

### « Revivre ma course » (04/11)
- Idée de Thibault : sur la carte du créateur, le tracé se dessine du départ à l'arrivée (5 s), un point suit le parcours et le profil d'altitude. Se lance tout seul après l'import du GPX et via le bouton « Revivre ma course ». Désactivé si « réduire les animations » est activé. `src/lib/replay.ts`, `src/components/TrailCard.tsx`. Vibrations abandonnées le 04/11 (pas sur iPhone).

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

### Nom « Hall of Trail » (02/11)
- Coup de cœur de Thibault. Vérifié par Claude : **halloftrail.com, hall-of-trail.com, halloftrail.fr, hall-of-trail.fr non enregistrés** (registres officiels RDAP Verisign et AFNIC, réponse 404 ; contrôle sur google.com/laposte.fr = 200). Aucune marque ni société « Hall of Trail » trouvée sur le web. Proches sans conflit direct : Trail Running Hall of Fame (Freetrail, US, honore des coureurs), Rail-Trail Hall of Fame (US). **Non vérifiable d'ici** : TMview/EUIPO (accès refusé), INPI (compte requis), Instagram (bloqué) → à faire par Thibault avant achat.

### Juridique
- 01/11 : vérifications CCSS ajoutées à `docs/juridique/etude-statut-frontalier.md` : activité **accessoire** = cotisations sur au moins **1/3 SSM** (pas 1 SSM) ; dispense ≤ ≈ 11 085 €/an ; déclaration CCSS sous 8 jours ; attention télétravail (sortie de l'accord 49,9 %) et seuil fiscal de 13 000 €. Questions à poser par Thibault à la CCSS. **Demande écrite envoyée par Thibault le 01/11** (formulaire ccss.public.lu/fr/support/contact.html) : revenu retenu pour une micro française, moment de la demande de dispense, assiette 1/3 SSM, délivrance de l'A1. **Réponse CCSS 03/11 : revenu retenu = CA après abattement (CA × 29 %)** ⇒ dispense jusqu'à ≈ 38 200 € de CA/an ; au-delà cotisations ≈ 7 % du CA.
- Télétravail : 27 jours/an sur un 80 % (≈ 15 %) → reste sous 25 % (sécurité sociale) et sous 34 jours (impôts) ; la micro-entreprise ne compte pas comme télétravail.
- Étude `docs/juridique/etude-statut-frontalier.md` : micro-entreprise française recommandée, cotisations à la CCSS Luxembourg (dispense possible sous ≈ 11 085 €/an), télétravail salarié à garder < 25 %, pas de société au Luxembourg, Legalstart non nécessaire (INPI gratuit). **À valider avec un expert-comptable frontaliers.**

- **22/10 au soir : Thibault a envoyé la demande à Exaprint via leur formulaire** (vérification des fichiers + 2 exemplaires test or et holo), avec les PDF d'avant le passage au 100 % vectoriel. À la réponse : renvoyer les fichiers vectoriels comme version définitive.

### Machines et carte « Holo dessin animé » (04–06/11)
- Matériel étudié (rien acheté) : Canon PIXMA PRO-200 + film holo + emporte-pièce 63 × 88 (≈ 1 000–1 300 €), Evolis Primacy 2 + lamination (≈ 3 200–3 600 €, format carte bancaire seulement), xTool M2 (bords roussis, pas de holo), X1 (trop cher). **Piste retenue : xTool O1 (UV)** sur **cartes holo xTool 76 × 120 mm** (16 € les 20, dégressif jusqu'à 11,20 €) : holo sélectif via la couche de blanc + vernis. Contact pris par Thibault avec une influenceuse qui a la machine (prix, code promo, échantillon, multi-cartes, recto-verso).
- Prix : idée d'un **prix unique 14,90 € livraison offerte** (≈ 10 € net par carte sous le seuil CCSS ; ≈ 5,20 € à 9,90 €). Seuil CCSS ≈ 38 200 € de CA/an ≈ 214 cartes/mois à 14,90 €. Non appliqué sur le site.
- **Design validé le 06/11 : carte Holo « dessin animé » + touches doodle, tracé dans un carré, tracé holographique à l'impression, police Luckiest Guy.** Tout est dans `docs/design/carte-holo-dessin-anime/` (PDF, maquette, gabarit xTool 12 cartes, gabarit illustratrice).
- Illustratrice **PAQAP** (doodle, événements sportifs) : demande de devis envoyée par Thibault le 06/11 ; complément avec le nouveau gabarit en brouillon Gmail.
- Abandonnés : cristal gravé 3D, cadre doodle sur fond clair, carte parchemin.

- 07/11 : carte promo BRC « La carte légendaire » validée (`docs/design/carte-holo-dessin-anime/brc-promo/`) et **première carte avec un vrai GPX et le vrai relief** (UTDP by UTMB de Thibault, tracé holographique arc-en-ciel) dans `.../utdp/`. Piste pour l'outil : relief du carré généré depuis les tuiles d'altitude publiques autour du GPX.

- 07/11 : nom envisagé **DNF Club** (dnfclub.fr, dnf-club.com, dnfclub.run libres ; « DNF » seul risqué : jeu Dungeon & Fighter). **Devise adorée par Thibault : « Déjà Nostalgique du Finish »** (DNF). Logos proposés (écusson, mascotte « carte qui court » retenue et améliorée en 3 poses). Carte promo BRC v6 redessinée par un agent « dessinateur BD » (caricatures façon couverture BD sportive) + brief pour un vrai caricaturiste.

- 07/11 : **nom retenu : DNF Cards** (devise « Déjà Nostalgique du Finish »). DNF Club écarté (course « The DNF » à Andilly), KOM Club écarté (kom.club existe, terme Strava). Domaines dnfcards.com / .fr libres au 07/11, à réserver. Points de vigilance marque : « DNF » = aussi le jeu Dungeon & Fighter (classe 28) → vérifier INPI/TMview (16, 28, 41). Carte UTDP recto verso refaite en DNF Cards.

- 08–10/11 : **modèle économique** discuté. Organisateurs : carte « toute faite » par course (même carte pour tous, QR code au dos vers le site) à ≈ 2,90–3,50 € (une médaille finisher coûte ≈ 2–5 €) ; ou option payée par le coureur à l'inscription (9–12 €), cartes commandées selon les ventes. Coureurs : carte premium personnalisée sur xTool O1 à **14,90 € port compris** avec pochette souple, +3 € la pochette rigide, 10–12 € en vente directe sur une course. Coût matière O1 ≈ 0,85–0,90 €/carte (carte holo 0,80 € + encre UV ≈ 0,05–0,10 €). **Carte d'abandon** : même carte + **tampon DNF** posé à la main au stand d'arrivée (encre pour surfaces lisses type StazOn, à tester), et tampon FINISHER pour les autres.
- 10/11 : fichiers pour un **imprimeur local** (4 cartes, recto + verso, sans cadre, fond perdu 3 mm, traits de coupe, sans dorure). Devis MatouBrillant à demander par Thibault (dorure possible sur devis). Agence **Fraich'Touch** (talents dont Clem Qui Court, Pau Capell) : d'abord le DM à Clem, l'agence plus tard avec de vraies cartes en photo.

- 10/11 : **chaîne commandes → colis** (`outils-impression-63x88/lot.py`, voir son LISEZMOI). Airtable : nouvelles colonnes **N° carte** (numéro auto, imprimé sur la carte et l'étiquette), **Tracé (JSON)** (tracé complet envoyé par le site à la commande) et **Abandon (DNF)** (case à cocher → sceau DNF). Le statut « À imprimer » déclenche le lot : PDF imprimeur, couches xTool O1 (couleur / blanc / vernis du tracé / sceau en relief), étiquettes colis A4 99,1 × 38,1 (Avery L7163) et 100 × 150, bordereau. Lecture seule sur Airtable. **Sceau en relief** FINISHER / DNF de 16 mm (`docs/design/sceau-relief-o1/`), réglage des passages de vernis à tester sur la O1. Les cartes d'impression n'ont plus de cadre près du bord.

- 11/11 : **style d'illustration validé** par Thibault : la case « KM 60 » de la BD Canva « Les aventures de Thibault – UTDP » (BD semi-réaliste façon comics, encrage épais, expressions exagérées et drôles, violets et verts, décor de trail réaliste). Référence dans `docs/design/style-illustration/` et média Canva `MAHamh7m1Xc`. Nouvel agent `illustrateur` (`.claude/agents/illustrateur.md`) qui s'en sert pour les prochaines illustrations et les fonds de carte, avec Canva (connecteur ajouté le 11/11). Point CEO du 11/11 refait à la main (tâche planifiée en échec : dépôt GitHub non rattaché ; réparé par Thibault le jour même).

- 11/11 : essai logo + carte UTDP « style maison » générés avec Canva (IA) : **refusés, rendu trop IA**. Règle : l'IA d'image = maquettes seulement, jamais de visuel final (logo, fond de carte). La carte validée reste celle du moteur actuel ; le style KM 60 passera par un illustrateur humain (PAQAP) ou par du dessin en code.

- 11/11 : carte UTDP avec **fond BD dessiné en code** (sans IA) + tracé fin et net + relief ombré : « ok pour le moment » (`docs/design/carte-fond-bd-code/`). À brancher dans l'outil d'impression si elle devient le modèle ; le style KM 60 attend PAQAP.

- 11/11 : **modèle de carte à thèmes** (`docs/design/carte-themes/`) : un gabarit, un thème par organisateur (couleurs + petits dessins doodle en code). Exemples : UTDP thème Alsace (bières, flammekueche, bretzels, cigognes…) et UTMJ thème Jura. **Nouveau logo « gaming »** en blocs, 100 % vectoriel (`docs/design/logo-dnf-cards/gaming/`, PDF/SVG/PNG), utilisé au dos de la carte. En attente de l'avis de Thibault.

- 12/11 : Thibault revient au **style d'origine** (dessin animé) avec la **police du logo gaming** sur le recto et un tracé plus fin : `docs/design/carte-classique-police-logo/`. Les essais « doodle » et « loot » restent dans `docs/design/carte-themes/`. Rapport CEO : chaque section d'agent commence désormais par la date de mise à jour et une phrase de résumé.

- 12/11 : carte de référence déclinée pour deux organisateurs : **Légende du Graoully** (rouge/noir, dragon) et **Marathon du Donon** (vert forêt/grès rose, temple) : `docs/design/carte-classique-police-logo/organisateurs/`.

## Vision (rappel de Thibault, 10/11)
**On commence petit, en activité accessoire, avec un petit chiffre d'affaires** (sous le seuil CCSS ≈ 38 200 €/an). **Si ça prend, Thibault envisage de démissionner pour créer une vraie marque de sport et faire grandir le CA.** Objectif long terme : une marque forte dans le sport (le « trophée moderne » du sportif amateur, humour « Déjà Nostalgique du Finish »), d'abord le trail en France, puis d'autres sports, collection, appli, collaborations, produits dérivés. Toute recommandation doit garder ces deux temps en tête : peu de risque et peu de dépenses maintenant, des choix qui permettent de grandir ensuite (marque protégée, outils qui passent à l'échelle).

## Prochaines étapes (côté Thibault)
1. Réponse d'Exaprint sur le format avec dorure + gabarit.
2. Ajouter connexions et dépôt à la tâche « Point CEO TrailDex ».
3. Expert-comptable frontaliers, contrat de travail, télétravail.
4. Nom de domaine (après le choix du nom) ; mentions légales et CGV avant de diffuser le site.
5. Fixer les prix définitifs.
