# Journal du projet TrailDex

Résumé des décisions et de l'état du projet, pour reprendre dans une nouvelle session sans l'historique de conversation. À tenir à jour à chaque étape importante.

## État au 22 octobre 2026

### Site (branche `claude/practical-cray-da49sb`)
- Site React/Vite/Tailwind complet : accueil 3D, comment ça marche, créateur (import GPX, aperçu en direct), galerie par rareté, collection (niveaux, badges), FAQ.
- Composants 21st.dev adaptés : « Holo Card » (@kedhareswer) et « Phone Scroll Hero » (@ruixen.ui).
- Design de carte validé par Thibault : **recto = tracé en grand + effet holographique**, **verso = photo en petit + fiche de course**.
- Partage gratuit Instagram/Strava : image Story 9:16 ou post 4:5 générée dans le navigateur.
- Précommande → fonction Cloudflare `functions/api/preorder.ts` → Airtable. **Pas encore déployé** (Cloudflare Pages + secret `AIRTABLE_TOKEN` à configurer par Thibault).
- Prix **provisoires** : Standard 9,90 €, Holo 14,90 €, Or 24,90 € (`src/lib/config.ts`).
- Aperçu en ligne (privé) : https://claude.ai/artifact/L6g2axqytsZ13j8B78hwgA

### Impression
- Imprimeur visé : **Exaprint**, produit « Carte de visite dorure à chaud », option **Sets** (≤ 20 variantes, même quantité).
- Contrainte découverte : avec dorure, format personnalisé limité à **40–55 mm × 55–95 mm** → 63 × 88 mm impossible en dorure. Question posée à trancher : demander le 63 × 88 avec dorure à Exaprint, sinon 55 × 77 mm, ou un autre imprimeur (MakePlayingCards) pour Or/Holo.
- Export `/print.html` : PDF par carte (calque « Acabado », couleur directe, surimpression), taille et fond perdu réglables. **À régler avec le gabarit Exaprint** : fond perdu exact et noms des couleurs de dorure.
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

### Juridique
- Étude `docs/juridique/etude-statut-frontalier.md` : micro-entreprise française recommandée, cotisations à la CCSS Luxembourg (dispense possible sous ≈ 11 085 €/an), télétravail salarié à garder < 25 %, pas de société au Luxembourg, Legalstart non nécessaire (INPI gratuit). **À valider avec un expert-comptable frontaliers.**

## Prochaines étapes (côté Thibault)
1. Réponse d'Exaprint sur le format avec dorure + gabarit.
2. Ajouter connexions et dépôt à la tâche « Point CEO TrailDex ».
3. Expert-comptable frontaliers, contrat de travail, télétravail.
4. Déployer sur Cloudflare Pages + secret Airtable, nom de domaine.
5. Fixer les prix définitifs.
