# Cartes DNF Cards 63 × 88 mm pour l'imprimeur

`python3 -I carte.py <fichier.gpx> <prénom> <numéro> <dossier> ["Nom de course"]`

Produit dans le dossier :
- `NNN_<course>_<prénom>_recto_impression.pdf` — 67 × 92 mm (63 × 88 + 2 mm de fond perdu), image ≈ 1 400 dpi, coins carrés (l'imprimeur coupe et arrondit).
- `NNN_<course>_<prénom>_verso_impression.pdf` — dos officiel (même pour toutes les cartes).
- `NNN_<course>_<prénom>_recto_dorure-holo.pdf` — **fichier de dorure à chaud holographique** : le tracé, le point de départ et l'étoile d'arrivée en vectoriel, 100 % noir, trait 0,88 mm, parfaitement calé sur le recto.

Chaîne : GPX → stats (`gpxparse.py`) → vrai relief (tuiles d'altitude publiques, zoom 13, `demhq.py`) → carte (`template.html`, rendu Playwright `render-carte.mjs`) → PDF (`pdfs.mjs`, pdf-lib). Les scripts attendent les chemins de la session de travail (dossier `pw/` avec playwright-core) : à adapter avant usage ailleurs.
