# Cartes à thème (modèle du 11/11/2026)

Un seul gabarit (63 × 88 mm, 860 × 1200 unités), et **un thème par organisateur**. Tout est dessiné en code, sans IA.

- `themes.js` : les thèmes (`alsace`, `jura`) et les cartes d'exemple. **Pour une nouvelle course : copier un thème, changer les couleurs et la liste `dessins`.**
- `doodles.js` : les petits dessins (bière, flammekueche, bretzel, cigogne, maison à colombages, kouglof, verre de vin, sapin, champignon, knack, cœur, feuille, renard, comté, cloche, montagne, chaussure). Chaque dessin tient dans ±30 unités ; en ajouter un = une fonction.
- `carte.html?carte=utdp&face=recto|verso` : la mise en page. Les dessins sont semés automatiquement autour du carré, sans chevauchement (tirage fixé par le nom de la course et du coureur). Carré : vrai relief ombré aux couleurs du thème, tracé fin lissé. Chaque information n'apparaît qu'une fois (titre, date, distance, D+, chrono, prénom, numéro).
- `glyphs.js` : le logo « gaming » en polygones (voir `../logo-dnf-cards/gaming/`), utilisé en petit au recto et en grand au verso (dos commun à toutes les cartes).

Rendu : servir le dossier en HTTP avec `LuckiestGuy.ttf` et les données (`data/<n>/dem.json`, `track.json`, produites par `outils-impression-63x88/`), puis capturer le canvas 3440 × 4800 px avec Playwright. Pas encore branché dans `outils-impression-63x88/lot.py`.
