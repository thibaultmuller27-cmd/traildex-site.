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
| Cartes de démo (galerie) | `src/lib/demo.ts` |
| Niveaux, XP, badges | `src/lib/progress.ts` |
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
- Chaque carte = 1 PDF (page 1 recto, page 2 verso), échelle 1:1, fond perdu réglable, illustration à 600 dpi.
- Dorure : formes vectorielles sur un calque **« Acabado »**, en couleur directe (nom réglable, à recopier du gabarit Exaprint), surimpression activée. Or → légendaire, Holo → rare/épique, Standard → pas de dorure.
- Lot : dans Airtable, vue « À imprimer » → Télécharger CSV → déposer le fichier dans l'outil → un .zip avec un dossier par Set (≤ 20 cartes de même finition et quantité), `bordereau.pdf` (qui reçoit quelle carte) et `LISEZ-MOI.txt`. La référence de commande est imprimée en petit au verso.
