# Sceau en relief DNF Cards pour la xTool O1 (vernis UV empile).
#   python3 -I sceau.py <dossier>   -> exporte les sceaux FINISHER et DNF (couches + carte de hauteur + apercu)
# Deux couches noires sur fond transparent, a imprimer en vernis l'une sur l'autre :
#   couche 1 « base »  = le disque dentele plein (le plateau du sceau)
#   couche 2 « motif » = anneaux, texte et centre, qui ressortent au-dessus de la base
# Plus il y a de passages de vernis sur la couche 2, plus le relief est marque.
import math, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts", "LuckiestGuy.ttf")
TEXTS = {
    "FINISHER": ("FINISHER", "DÉJÀ NOSTALGIQUE DU FINISH · DNF CARDS · "),
    "DNF": ("DNF", "DID NOT FINISH · MAIS QUEL VOYAGE · "),
}

def _star(d, cx, cy, r, fill):
    pts = [(cx + math.cos(-math.pi / 2 + i * math.pi / 5) * (r if i % 2 == 0 else r * .45), cy + math.sin(-math.pi / 2 + i * math.pi / 5) * (r if i % 2 == 0 else r * .45)) for i in range(10)]
    d.polygon(pts, fill=fill)

def layers(kind, size):
    """Returns (base, motif) as L images (255 = encre), size x size px."""
    S = size * 3  # supersampling
    c = S / 2; R = S / 2 * .98
    center, ring = TEXTS[kind]
    base = Image.new("L", (S, S), 0); motif = Image.new("L", (S, S), 0)
    db, dm = ImageDraw.Draw(base), ImageDraw.Draw(motif)
    teeth = 28
    db.polygon([(c + math.cos(i / (teeth * 2) * 2 * math.pi) * (R if i % 2 == 0 else R * .91), c + math.sin(i / (teeth * 2) * 2 * math.pi) * (R if i % 2 == 0 else R * .91)) for i in range(teeth * 2)], fill=255)
    w = R * .035
    for rr in (R * .84, R * .56):
        dm.ellipse([c - rr, c - rr, c + rr, c + rr], outline=255, width=max(2, round(w)))
    # texte en cercle
    fs = round(R * .15); font = ImageFont.truetype(FONT, fs)
    rt = R * .70; n = len(ring)
    for k, ch in enumerate(ring):
        a = -math.pi / 2 + k / n * 2 * math.pi
        g = Image.new("L", (fs * 2, fs * 2), 0); ImageDraw.Draw(g).text((fs, fs), ch, font=font, fill=255, anchor="mm")
        g = g.rotate(-math.degrees(a + math.pi / 2), resample=Image.BICUBIC)
        motif.paste(255, (round(c + math.cos(a) * rt - fs), round(c + math.sin(a) * rt - fs)), g)
    # centre
    cs = R * (.42 if len(center) <= 3 else .19)
    f2 = ImageFont.truetype(FONT, round(cs))
    dm.text((c, c + R * .02), center, font=f2, fill=255, anchor="mm")
    _star(dm, c, c - R * (.36 if len(center) <= 3 else .27), R * .09, 255)
    _star(dm, c, c + R * (.38 if len(center) <= 3 else .28), R * .07, 255)
    motif = Image.composite(motif, Image.new("L", (S, S), 0), base)
    return base.resize((size, size), Image.LANCZOS), motif.resize((size, size), Image.LANCZOS)

def black(mask):
    """L mask -> RGBA black ink on transparent."""
    im = Image.new("RGBA", mask.size, (0, 0, 0, 0)); im.putalpha(mask); return im

def export(out, kind, mm=16, dpi=1200):
    size = round(mm / 25.4 * dpi)
    base, motif = layers(kind, size)
    pre = f"{out}/sceau-{kind}_{mm}mm"
    black(base).save(f"{pre}_couche-1-base.png", dpi=(dpi, dpi))
    black(motif).save(f"{pre}_couche-2-motif.png", dpi=(dpi, dpi))
    height = Image.eval(base, lambda v: v // 2); height.paste(255, (0, 0), motif)
    height.filter(ImageFilter.GaussianBlur(size / 400)).save(f"{pre}_carte-de-hauteur.png", dpi=(dpi, dpi))
    # apercu : vernis argente avec un leger ombrage
    hm = height.filter(ImageFilter.GaussianBlur(size / 250)); px = hm.load(); prev = Image.new("RGBA", (size, size), (0, 0, 0, 0)); pp = prev.load()
    for y in range(1, size - 1):
        for x in range(1, size - 1):
            if base.getpixel((x, y)) < 40: continue
            sh = (px[x - 1, y - 1] - px[x + 1, y + 1]) * 1.4
            v = max(0, min(255, 170 + int(sh) + (40 if motif.getpixel((x, y)) > 128 else 0)))
            pp[x, y] = (v, v, min(255, v + 12), 255)
    prev.save(f"{pre}_apercu.png", dpi=(dpi, dpi))
    return pre

if __name__ == "__main__":
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in TEXTS: print(export(out, k))
