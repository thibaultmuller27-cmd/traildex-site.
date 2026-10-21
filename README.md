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
- Pas de paiement : « Commander » ouvre un formulaire de précommande, enregistré pour l'instant dans le `localStorage` du navigateur. Pour recevoir les précommandes, brancher un service (Formspree, Airtable, backend…) dans `src/components/sections/PreorderDialog.tsx`.
