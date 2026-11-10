# Cartes DNF Cards 63 × 88 mm : impression et colis

## Un lot depuis Airtable (le cas normal)

1. Dans Airtable, table **Commandes** : passer les commandes à sortir au statut **« À imprimer »**. Cocher **« Abandon (DNF) »** pour un coureur qui a abandonné (sceau DNF au lieu de FINISHER).
2. Lancer le lot (Claude peut le faire dans une session) :
   - `AIRTABLE_TOKEN=<jeton en lecture> python3 -I lot.py <dossier>` lit Airtable directement ;
   - ou `python3 -I lot.py <dossier> commandes.json` à partir d'un export (liste de `{id, createdTime, fields}` avec les champs par identifiant).
3. Le dossier contient :
   - `imprimeur/` : par carte, `NNN_<course>_<prénom>_recto_impression.pdf`, `…_verso_impression.pdf` (67 × 92 mm, 2 mm de fond perdu) et `…_recto_dorure-holo.pdf` (tracé en vectoriel 100 % noir) ;
   - `o1/` : par carte, les couches pour la **xTool O1** au format fini 63 × 88 (≈ 1 390 dpi) : `_O1_1-couleur`, `_O1_2-blanc` (partout sauf le tracé, qui reste en holo nu), `_O1_3-vernis` (le tracé), `_O1_4-sceau-base` et `_O1_5-sceau-motif` (sceau en relief) ;
   - `etiquettes-A4-99x38.pdf` : planche A4 de 14 étiquettes 99,1 × 38,1 mm (type Avery L7163), une par colis, avec la vignette de la carte, le **N° de carte**, la course, le prénom, la quantité, le nom et l'adresse du client ;
   - `etiquettes-100x150.pdf` : la même chose en 100 × 150 mm, une par page (imprimante d'étiquettes), avec le N° en très grand ;
   - `bordereau.csv` (quel numéro va à quel client) et `LISEZ-MOI.txt` (avec les points à vérifier).
4. Après l'impression, passer soi-même les commandes en « Imprimée » : **le script n'écrit jamais dans Airtable**.

Numéro de carte : colonne Airtable **« N° carte »** (numéro automatique), imprimé sur la carte (« NO. 042 ») et sur l'étiquette.
Tracé : colonne **« Tracé (JSON) »**, envoyée par le site à la commande (≈ 1 500 points). Pour une commande plus ancienne sans ce tracé, il est reconstruit depuis « Données carte (JSON) » (moins précis, signalé dans `LISEZ-MOI.txt`).

## Une carte seule

`python3 -I carte.py <fichier.gpx | trace.json> <prénom> <numéro> <dossier> ["Nom de course"] [AAAA-MM-JJ] [12h34] [--sceau FINISHER|DNF]`

## Sceau en relief (xTool O1)

`python3 -I sceau.py <dossier>` exporte les sceaux FINISHER et DNF de 16 mm (1 200 dpi) : `couche-1-base` (le disque dentelé), `couche-2-motif` (anneaux, texte, centre), une carte de hauteur en niveaux de gris et un aperçu. Exemplaires dans `docs/design/sceau-relief-o1/`.
Principe : vernis UV empilé. Imprimer la base, puis le motif plusieurs fois par-dessus : plus il y a de passages, plus le relief ressort. Le réglage exact (nombre de passages, couche blanche ou vernis) est à tester sur la machine.
Sur la carte, le sceau est posé à cheval sur le coin bas-droit du carré du tracé.

## Chaîne technique

Tracé → stats (`gpxparse.py`) → vrai relief (tuiles d'altitude publiques, zoom 13, `demhq.py`) → carte (`template.html`, rendu Playwright `render-carte.mjs`) → PDF (`pdfs.mjs`, pdf-lib) → couches O1 (`couches_o1.py`, `sceau.py`) → étiquettes (`etiquettes.mjs`).
Prérequis : Python 3 avec Pillow et numpy, Node avec `playwright` (Chromium) et les dépendances du site (`pdf-lib`), accès internet pour les tuiles d'altitude. `CHROMIUM_PATH` permet d'indiquer un Chromium précis.
Seul le design Trail existe pour l'impression : une commande Running ou Vélo sort pour l'instant avec le design Trail.
Police : Luckiest Guy (licence libre OFL, Google Fonts), dans `fonts/`.
