# Logo et dos de carte holographiques (validés par Thibault le 13/11/2026)

- **Logo** : mêmes tracés que le logo gaming (`../gaming/`), couleurs en dégradé holographique (rose, violet, bleu ciel, menthe, vert citron, pêche) avec reflets blancs ; « CARDS » en version nacrée ; ombre violet profond.
  `DNF-Cards-logo_holo_fond-sombre` et `_transparent` en SVG, PDF (vectoriels) et PNG.
- **Dos de carte** : `DNF-Cards_dos-holo_impression.pdf` (63 × 88 mm + 2 mm de fond perdu), aperçu `DNF-Cards_dos-holo_apercu.jpg`. Cadre arc-en-ciel à 2,5 mm de la coupe.
- En impression classique le dégradé imite l'holo ; un vrai reflet demande une couche de film holo sur le logo (à préparer si besoin).
- `source/` : `build.py <logo gaming .svg> <dossier>` fabrique les SVG du logo ; `verso.py` (à lancer dans ce même dossier) fabrique `verso.svg`/`verso.html` ; `shot.mjs` rend en PNG (Playwright) et `holopdf.mjs` fait les PDF.
- Validé tel quel : « Parfait ne change rien ». Le dos commun de l'outil d'impression n'a pas encore été remplacé.
