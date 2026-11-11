# Carte au fond BD dessiné en code (11/11/2026)

Version d'attente, sans IA, en attendant le retour de l'illustratrice PAQAP.
- `bdfond.js` : le fond (ciel de nuit à l'aube, trame de points, crêtes encrées et hachurées, frontales, sapins, sentier, rochers), 860 × 1200 unités = 63 × 88 mm.
- `carte-bd.html` : la mise en page (logo vectoriel DNF Cards, titre en lettrage comics, carré au vrai relief ombré, tracé fin lissé : lime 2,6 + cœur blanc 0,8 + contour 4,4 unités, stats, prénom). Rendu Playwright à 3440 × 4800 px (≈ 1 390 dpi). Attend `dem.json` et `track.json` (voir `outils-impression-63x88/`), `LuckiestGuy.ttf` et `DNF-Cards-logo.svg` dans le même dossier, servis en HTTP.
- `apercu-UTDP.png` : la carte UTDP de Thibault. Validée « ok pour le moment ». Pas encore branchée dans `outils-impression-63x88/`.
