# TrailDex

Site de vente de cartes de collection pour traileurs : le coureur importe le GPX de sa course, remplit ses infos et voit sa carte holographique se créer en direct avant de la précommander.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
```

## Où modifier quoi

| Quoi | Fichier |
| --- | --- |
| **Prix des finitions** (provisoires) | `src/lib/config.ts` |
| Raretés, couleurs, descriptions | `src/lib/config.ts`, `src/components/TrailCard.tsx` (`THEMES`) |
| Cartes de démo | `src/lib/demo.ts` |
| FAQ | `src/components/sections/Faq.tsx` |

## Notes techniques

- React 18 + Vite + Tailwind 3 + framer-motion, primitives Radix (style shadcn).
- Le GPX est lu et analysé dans le navigateur (`src/lib/gpx.ts`) : distance (haversine), D+ lissé avec seuil d'hystérésis, profil d'altitude, tracé. Rien n'est envoyé à un serveur.
- Carte holographique : adaptée du composant 21st.dev « Holo Card » (@kedhareswer), shader WebGL2 dont les reflets suivent l'angle de vue, inclinaison 3D, retournement au clic.
- Accueil : adapté du composant 21st.dev « Phone Scroll Hero » (@ruixen.ui).
- Pas de paiement : « Commander » ouvre un formulaire de précommande, envoyé à `functions/api/preorder.ts` (Cloudflare Pages Function) qui l'écrit dans la base Airtable **TrailDex**, table **Commandes**. Le prix est recalculé côté serveur.

## Précommandes → Airtable

La clé Airtable n'est jamais dans le code du site : elle est stockée comme secret chez Cloudflare.

1. Sur https://airtable.com/create/tokens, crée un jeton personnel :
   - scopes : `data.records:write` (et `data.records:read`) ;
   - accès : uniquement la base **TrailDex**.
2. Sur Cloudflare Pages, crée le projet depuis ce dépôt GitHub :
   - commande de build : `npm run build` ;
   - dossier de sortie : `dist`.
3. Dans le projet Cloudflare → Settings → Variables and Secrets, ajoute le secret `AIRTABLE_TOKEN` avec le jeton, puis redéploie.

Les identifiants de la base et de la table sont dans `functions/api/preorder.ts`, ceux des champs dans `src/lib/preorder.ts` (renommer une colonne dans Airtable ne casse rien ; la supprimer, si).

En local, `npm run dev` affiche le site mais pas l'API. Pour tester l'envoi : `npm run build && npx wrangler pages dev dist` avec un fichier `.dev.vars` contenant `AIRTABLE_TOKEN=...` (ne jamais le committer).

## Impression chez Exaprint

Outil : `/print.html` (section « Export Exaprint »).

- Produit Exaprint : carte de visite, format personnalisé **63 × 88 mm**, recto verso, option **Sets** (jusqu'à 20 variantes, même quantité par variante).
- Chaque carte = PDF 2 pages (recto, verso), échelle 1:1, fond perdu réglable. **Carte 100 % vectorielle** : le code de dessin de la carte (`src/lib/cardCanvas.ts`) s'exécute sur une « toile PDF » (`src/lib/pdfCanvas.ts`) qui écrit tracés, dégradés et textes en vrai PDF (polices Inter et JetBrains Mono intégrées, TTF dans `public/fonts/`, licence OFL). La lueur du tracé et l'anneau du sceau, qui n'existent pas en PDF, sont reconstruits en vectoriel. Seule la photo du coureur reste une image (à la résolution réglée).
- **Couleurs CMJN** : l'outil convertit l'illustration avec un profil ICC (LittleCMS, `src/lib/cmyk.ts`) et l'intègre au PDF comme profil de sortie. Profil conseillé : `ISOcoated_v2_300_eci.icc` (archive « ECI Offset 2009 », gratuite sur eci.org), à choisir une fois dans l'outil ; il est gardé dans le navigateur, pas dans le dépôt (licence). L'outil affiche l'encrage maximal (doit rester ≤ 300 %). Sans profil, le PDF reste en RVB.
- **Dorure, mode « Fichier séparé » (par défaut, guide Exaprint France)** : pour les cartes Holo et Or, un second PDF `*_dorure.pdf` avec uniquement les éléments à dorer, en vecteurs noir 100 % K, mêmes dimensions et repères que `*_impression.pdf`. Or → légendaire, Holo → rare/épique : toutes les cartes ont un fichier de dorure.
- Mode « Calque Acabado » (ancien) : la dorure dans le même PDF, sur un calque « Acabado » en couleur directe (nom réglable), surimpression activée.
- Contrôles faits sur les fichiers : traits de dorure ≥ 0,62 pt (min. 0,5 pt), dorure à ≥ 3,4 mm de la coupe (min. 2 mm), textes dans la zone de sécurité de 3 mm.
- Lot : dans Airtable, vue « À imprimer » → Télécharger CSV → déposer le fichier dans l'outil → un .zip avec un dossier par Set (≤ 20 cartes de même finition et quantité), `bordereau.pdf` (qui reçoit quelle carte) et `LISEZ-MOI.txt`. La référence de commande est imprimée en petit au verso.

## Factures

Processus complet : `docs/facturation.md`. Outil : `/print.html`, section « Factures » (CSV de la table Factures → PDF + livre des recettes). Les coordonnées du vendeur sont dans `COMPANY` (`src/lib/config.ts`) ; tant que le SIRET manque, les PDF sont marqués « SPÉCIMEN ».

## Édition course (cartes finisher pour les organisateurs)

`/print.html`, section « Édition course » : GPX de la course, nom, date, lieu, édition (ex. « Édition 2027 »), nombre de cartes, finition Or ou Holo, logos de l'organisateur et du partenaire, lien du QR code (par défaut `https://traildex.fr/c/<nom-de-la-course>`). Aperçu recto/verso, puis « Utiliser cette carte pour l'export Exaprint ».

- Recto : FINISHER au lieu de la rareté, distance, D+, altitude max, km-effort, nom de l'édition et nombre d'exemplaires.
- Verso : fiche de course, logos sur pastilles blanches, QR code vectoriel d'environ 12 mm (vérifié lisible). Garder des liens courts : moins de modules, lecture plus facile.
- Les logos sont des images (PNG, JPEG ou SVG) placées à la résolution d'export.
