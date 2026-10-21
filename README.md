# TrailDex

Site de vente de cartes de collection pour traileurs : le coureur importe le GPX de sa course, remplit ses infos et voit sa carte holographique se créer en direct avant de la précommander.

## TrailDex Quest — le jeu (`/jeu/`)

Chasse aux trésors façon Pokémon Go sur les sentiers réels autour du joueur :

- **Carte 3D** (MapLibre + fond OpenFreeMap gratuit, sans clé) ; les sentiers sont chargés depuis OpenStreetMap (API Overpass) autour du joueur, avec des sentiers de démonstration si l'API ne répond pas.
- **Coffres** posés chaque jour le long des sentiers (les mêmes pour tout le monde ce jour-là) : Commun, Rare, Épique (codes promo partenaires), Légendaire (gains rares, réservé Traileur+). Il faut être à moins de 35 m pour ouvrir.
- **Défis** (distance, sentiers découverts / complétés, coffres…) qui débloquent de l'équipement ; **défi du jour**.
- **Avatar** SVG qui évolue : 6 stades (aura verte → bleue → violette → holographique → or) + équipement (casquette, frontale, gilet, bâtons, chaussures, maillots holo/or).
- **GPS réel** ou **mode démo** (toucher la carte pour courir). La progression est sauvegardée dans le navigateur.

### Où modifier quoi (jeu)

| Quoi | Fichier |
| --- | --- |
| **Prix de l'abonnement, liens Stripe**, limite de coffres gratuits | `src/game/config.ts` |
| **Marques partenaires et codes promo** (exemples fictifs à remplacer) | `src/game/config.ts` (`PARTNERS`, `PRIZES`) |
| Probabilités et XP des coffres, rayon d'ouverture, mode démo | `src/game/config.ts` |
| Défis | `src/game/lib/challenges.ts` |
| Équipements et stades d'évolution | `src/game/lib/items.ts` |
| Dessin de l'avatar | `src/game/components/Avatar.tsx` |

### Encaisser les abonnements (Stripe)

1. Crée un compte sur https://stripe.com, puis deux **produits récurrents** : Traileur+ mensuel et annuel.
2. Pour chacun, crée un **Payment Link**. Dans « Après le paiement », choisis « Rediriger vers ton site » :
   `https://<ton-domaine>/jeu/?abonnement=merci&plan=mensuel` (ou `plan=annuel`).
3. Colle les deux liens dans `STRIPE.monthly` / `STRIPE.yearly` de `src/game/config.ts`, et le lien du portail client (Settings → Billing → Customer portal) dans `STRIPE.portal` pour que les abonnés puissent résilier.
4. Tant que les liens sont vides, le bouton propose un **essai gratuit de 7 jours** (local).

Deuxième source de revenus : les **marques qui sponsorisent des coffres** (bouton « Sponsorise des coffres », adresse dans `PARTNER_CONTACT`).

> ⚠️ Limites de cette première version : le statut Traileur+ et la progression sont stockés dans le navigateur, et les codes promo sont dans le code du site. Avant d'ouvrir à de vrais partenaires, il faut des comptes joueurs + un webhook Stripe côté serveur (Cloudflare Function) pour vérifier l'abonnement, et des codes uniques délivrés par le serveur. Désactive aussi `ALLOW_SIMULATION` pour que les gains exigent le vrai GPS.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173 (site) et http://localhost:5173/jeu/ (jeu)
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
