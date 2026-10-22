# TrailDex

Site et petite entreprise de **cartes de collection pour traileurs** : le coureur importe le GPX de sa course, personnalise sa carte (prénom, course, chrono, classement, photo), la voit en 3D holographique, la précommande (Standard / Holo / Or-Légendaire), et peut la partager gratuitement sur Instagram et Strava.

Fondateur : Thibault Muller. **Il garde la main sur tout ce qui touche au monde réel.**

## Règle d'or (pour toute session et tout agent)

Ne jamais contacter un acteur externe réel (fournisseur, imprimeur, client, organisateur, partenaire, influenceur, administration) sans l'accord explicite de Thibault, et même alors : préparer un brouillon, c'est lui qui envoie. Pas d'envoi, pas de publication, pas de suppression, pas de dépense, pas de fusion de code. Ces interdictions sont aussi verrouillées dans `.claude/settings.json`.

## Où sont les choses

- Code : React + Vite + Tailwind (`src/`), fonction serveur de précommande `functions/api/preorder.ts` (Cloudflare Pages → Airtable).
- Commandes : Airtable, base TrailDex `appFtEAvDkYtjLleM`, table Commandes `tbl4QdVEf4WWnoE4P`.
- Impression : outil `/print.html` (PDF par carte, calque de dorure « Acabado », lots en Sets pour Exaprint). Voir `README.md`.
- Pilotage : Notion, page « TrailDex — Direction » (rapports CEO hebdomadaires + base « Décisions »).
- Historique et état du projet : `docs/journal-projet.md` (à lire en début de session, à mettre à jour après chaque étape importante).
- Agents : skill `ceo` (`.claude/skills/ceo/SKILL.md`) et agents `operations`, `produit`, `marketing`, `finance-fournisseurs`, `juridique-fiscal` (`.claude/agents/`).

## Commandes

- `npm run dev` · `npm run build` (inclut la vérification TypeScript)
