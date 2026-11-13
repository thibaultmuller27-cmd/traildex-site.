# Carte classique + police du logo (12/11/2026)

Le style d'origine « dessin animé » (ciel violet, fanions, montagnes, panneaux, sapins, tente), repris à la demande de Thibault, avec :
- titre, chiffres, prénom et numéro dans la police du logo (`glyphs.js`, alphabet complet en polygones) ;
- tracé holo plus fin ; chaque information une seule fois (plus de « km de bonheur », d'altitude max ni de mention « Trail ») ;
- détails sobres : lune, file de frontales.
`card.html` est une copie modifiée de `outils-impression-63x88/template.html` (attend `data.js`, `tracks.js`, `qr.js`). Pas encore reporté dans l'outil d'impression.

## Cartes d'organisateurs (12/11/2026)

`organisateurs/` : le même modèle aux couleurs d'une course.
- **Légende du Graoully** (Woippy) : rouge et noir, dragon, bulle « GRAOU ! », panneau DRAGON.
- **Marathon du Donon** : vert forêt et grès rose (couleurs choisies par Claude, à caler sur le logo officiel), temple du Donon, panneau TEMPLE, bulle « HOPLA ! ».
Pour une nouvelle course : partir d'une carte « dessin animé », changer `HOLO`, `SKY.holo` et les `bands` du relief, ajouter le dessin emblématique, puis lancer `patch.py <card.html> <couleur de l'ombre du titre>`. Tracés indicatifs, chiffres officiels des courses.

- 13/11 : **illustrations redessinées** (`organisateurs/illus.js`) : Graoully (dragon en volume, ailes membraneuses, écailles, cornes, flammes) et temple du Donon (perspective, colonnes cannelées, toit, rocher de grès rose, sapins). Plus grandes sur la carte. Police : accents É/È.
