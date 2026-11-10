# Fichiers par couches pour la xTool O1 (impression UV sur carte holo vierge), au format fini 63 x 88 mm, ~1 390 dpi.
#   python3 -I couches_o1.py <dossier de la carte> <nom> [--sceau FINISHER|DNF]
# Dans le dossier : recto.png (rendu 3440 x 4800) et route.json (trace en unites carte 860 x 1200).
#   <nom>_O1_1-couleur.png   l'image couleur
#   <nom>_O1_2-blanc.png     sous-couche blanche (noir = blanc imprime) partout SAUF le trace : la carte holo reste nue et brille
#   <nom>_O1_3-vernis.png    vernis brillant sur le trace (noir = vernis)
#   <nom>_O1_4-sceau-base.png / _5-sceau-motif.png   sceau en relief (vernis empile), si --sceau
import json, math, os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sceau as S

args = sys.argv[1:]; kind = None
if "--sceau" in args:
    i = args.index("--sceau"); kind = args[i + 1].upper(); del args[i:i + 2]
d, name = args[0], args[1]
rec = Image.open(f"{d}/recto.png").convert("RGB"); Wp, Hp = rec.size; k = Wp / 860  # px par unite carte
DPI = round(Wp / (63 / 25.4))
rec.save(f"{d}/{name}_O1_1-couleur.png", dpi=(DPI, DPI))
route = json.load(open(f"{d}/route.json"))
trace = Image.new("L", (Wp, Hp), 0); dr = ImageDraw.Draw(trace)
lw = 12 * k
P = [(x * k, y * k) for x, y in route]
dr.line(P, fill=255, width=round(lw), joint="curve")
for x, y in P[::4] + [P[-1]]: dr.ellipse([x - lw / 2, y - lw / 2, x + lw / 2, y + lw / 2], fill=255)
sx, sy = P[0]; r = 11 * k; dr.ellipse([sx - r, sy - r, sx + r, sy + r], fill=255)
ex, ey = P[-1]; R = 18 * k
dr.polygon([(ex + math.cos(-math.pi / 2 + i * math.pi / 5) * (R if i % 2 == 0 else R * .45), ey + math.sin(-math.pi / 2 + i * math.pi / 5) * (R if i % 2 == 0 else R * .45)) for i in range(10)], fill=255)
S.black(Image.eval(trace, lambda v: 255 - v)).save(f"{d}/{name}_O1_2-blanc.png", dpi=(DPI, DPI))
S.black(trace).save(f"{d}/{name}_O1_3-vernis.png", dpi=(DPI, DPI))
if kind:
    # sceau de 16 mm, a cheval sur le coin bas-droit du carre de la carte
    size = round(16 / 63 * Wp); cx, cy = 700 * k, 832 * k
    base, motif = S.layers(kind, size)
    for idx, (lbl, m) in enumerate([("4-sceau-base", base), ("5-sceau-motif", motif)]):
        full = Image.new("L", (Wp, Hp), 0); full.paste(m, (round(cx - size / 2), round(cy - size / 2)))
        S.black(full).save(f"{d}/{name}_O1_{lbl}.png", dpi=(DPI, DPI))
print("couches O1 ok", name, DPI, "dpi", "sceau " + kind if kind else "")
