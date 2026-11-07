# Carte Holo « dessin animé » — direction retenue (06/11/2026)

Maquette validée par Thibault : `TrailDex-carte-Holo-maquette.pdf` (page 1 grand format, page 2 taille réelle 78 × 122 mm) et `TrailDex-carte-HD.jpg`.

## Le style
- **Format** : carte xTool holographique 76 × 120 mm (fond perdu 1 mm pour l'impression UV, 3 mm pour l'illustratrice).
- **Fond de carte** : paysage façon dessin animé avec trait d'encre (ciel étoilé violet, soleil et rayons, montagnes enneigées en aplats, sapins), et éléments doodle à la PAQAP sur les bords (fanions, bulles « ALLEZ ! » / « GO GO ! », panneaux RAVITO / SOMMET / ARRIVÉE, étoiles jaunes).
- **Carré du tracé** (520 × 520 sur 760 × 1200) : relief vu du dessus en aplats cernés, **désaturé et assombri** pour que le tracé ressorte ; cadre encré épais + liseré lumineux.
- **Tracé** : version « B » = néon jaune cerné de noir à l'écran ; **à l'impression, le tracé est holographique** (pas de blanc dessous + vernis brillant). Départ = point blanc, arrivée = étoile.
- **Polices** : **Luckiest Guy** (titre, chiffres, prénom, panneaux ; Google Fonts, licence libre usage commercial) + JetBrains Mono (date, libellés).
- **Palettes** : Holo violet / vert / touche de jaune. Or = coucher de soleil cuivre et doré (même composition).
- Rejetés : cristal 3D gravé, cadre doodle sur fond clair, carte d'aventure parchemin.

## Impression xTool O1 (UV) sur carte holo
Trois couches alignées, 78 × 122 mm, 600 dpi : **couleur** (tracé laissé vide), **blanc** (partout sauf le tracé), **vernis** (tracé, départ, étoile). Ordre : blanc → couleur → vernis. Format des masques attendu par xTool Studio : à confirmer (influenceuse).
- Régénérer les couches : `node docs/design/carte-holo-dessin-anime/maquette/export-couches.mjs "$PWD/docs/design/carte-holo-dessin-anime/maquette"` (Playwright ; écrit les PNG 600 dpi dans le dossier). `maquette/card.html` est une maquette autonome (canvas), pas le code du site.
- Gabarit 12 cartes pour le grand plateau 330 × 420 : `xtool/gabarit-12-cartes-330x420.svg` + `xtool/test-calage-330x420.pdf` (retourner chaque carte dans sa poche pour le verso).

## Illustratrice (PAQAP)
`gabarit-illustratrice.pdf` : zones + direction artistique. Premier mail envoyé par Thibault le 06/11 ; complément en brouillon Gmail (gabarit à joindre à la main).

## Reste à faire
- Intégrer ce style dans l'outil (`src/lib/cardCanvas.ts`, `src/print/`) : relief du carré calculé depuis le GPX, export des 3 couches O1.
- Version Or définitive, verso dans le même style.

## Carte promo BRC « La carte légendaire » (validée le 07/11)
`brc-promo/` : carte publicitaire pour présenter TrailDex au Boulay Running Club. Coureurs en dessin animé (course dynamique, grosses têtes expressives, dossards) qui se jettent sur une carte holo « LÉGENDAIRE », nuage de bagarre, 6 bulles, logo BRC en pastille, étapes 1 TON GPX / 2 TON CHRONO / 3 TA CARTE, bandeau « OFFRE CLUB BRC ». Rejetées : version bonshommes ronds, version planche BD à 2 cases. Logo du club : accord à demander.

## Carte réelle de Thibault : UTDP by UTMB (07/11)
`utdp/` : premier exemple avec un **vrai GPX** (Strava, 15/05/2026 : 112,6 km, ≈ 3 830 m D+ calculé, 22h12) et un **vrai relief** : tuiles d'altitude publiques Terrarium (AWS `elevation-tiles-prod`, zoom 12) → bandes de couleur à surface égale + ombrage façon dessin animé + contours encrés. **Tracé holographique** : arc-en-ciel qui défile le long du parcours, halo blanc, cœur blanc, éclats. Scripts : `gpxparse.py` (stats), `dem.py` (relief) ; D+ à recouper avec Strava.
