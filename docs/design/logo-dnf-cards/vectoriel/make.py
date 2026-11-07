import math, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
D = sys.argv[1]
font = TTFont(f"{D}/lg-latin.ttf"); gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font["hmtx"]
UPM = font["head"].unitsPerEm; ASC, DESC = font["hhea"].ascent, font["hhea"].descent
INK = "#160a2e"

def text_d(t, size, spacing=0.0):
    s = size / UPM
    names = [cmap[ord(c)] for c in t]
    width = sum(hmtx[n][0] * s for n in names) + spacing * len(t)
    x = -width / 2; base = (ASC + DESC) / 2 * s   # canvas textBaseline "middle"
    out = []
    for n in names:
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        gs[n].draw(TransformPen(pen, (s, 0, 0, -s, x, base)))
        out.append(pen.getCommands()); x += hmtx[n][0] * s + spacing
    return " ".join(out), width

def star(x, y, r, inner=.45):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5; rr = r * inner if i % 2 else r
        pts.append(f"{x + math.cos(a) * rr:.2f},{y + math.sin(a) * rr:.2f}")
    return "M" + " L".join(pts) + "Z"
def sparkle(x, y, r):
    p = [(x, y - r*2), (x + r*.5, y - r*.5), (x + r*2, y), (x + r*.5, y + r*.5), (x, y + r*2), (x - r*.5, y + r*.5), (x - r*2, y), (x - r*.5, y - r*.5)]
    return "M" + " L".join(f"{a:.2f},{b:.2f}" for a, b in p) + "Z"

HOLO = ["#ff5cf0", "#5cf3ff", "#7dff6a", "#fff35c", "#ff9d5c", "#a85cff"]
def stops(cols): return "".join(f'<stop offset="{i/(len(cols)-1):.3f}" stop-color="{c}"/>' for i, c in enumerate(cols))

def logo(motto_col="#c6e536", cards_col="#ffffff", uid="a"):
    rot = math.degrees(-.04)
    dnf, wd = text_d("DNF", 156); cards, wc = text_d("CARDS", 92); motto, wm = text_d("DÉJÀ NOSTALGIQUE DU FINISH", 25, 3)
    defs = f'''<defs>
  <linearGradient id="g-dnf-{uid}" x1="0" y1="-70" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d8ff5c"/><stop offset=".45" stop-color="#5cf08a"/><stop offset="1" stop-color="#14b37a"/></linearGradient>
  <linearGradient id="g-holo-{uid}" x1="-8" y1="78" x2="48" y2="-92" gradientUnits="userSpaceOnUse">{stops(HOLO)}</linearGradient>
  <clipPath id="c-top-{uid}"><rect x="{-wd/2:.1f}" y="-78" width="{wd:.1f}" height="31.2"/></clipPath>
  <path id="p-dnf-{uid}" d="{dnf}"/><path id="p-cards-{uid}" d="{cards}"/>
</defs>'''
    # DNF: deep green extrusion, ink outline, gradient fill, white highlight, top gloss
    d = 156 * .11; ext = "".join(f'<use href="#p-dnf-{uid}" x="{k*.75:.2f}" y="{k:.2f}"/>' for k in [d - i*1.2 for i in range(int(d/1.2)+1)] if k > 0)
    g_dnf = f'''<g transform="translate(-150 0) rotate({rot:.3f})">
  <g fill="#0b5c3c">{ext}</g>
  <use href="#p-dnf-{uid}" x="{d*.75:.2f}" y="{d:.2f}" fill="none" stroke="{INK}" stroke-width="{156*.17:.2f}" stroke-linejoin="round"/>
  <use href="#p-dnf-{uid}" fill="none" stroke="{INK}" stroke-width="{156*.17:.2f}" stroke-linejoin="round"/>
  <use href="#p-dnf-{uid}" fill="url(#g-dnf-{uid})"/>
  <use href="#p-dnf-{uid}" x="{-156*.018:.2f}" y="{-156*.028:.2f}" fill="none" stroke="#ffffff" stroke-width="{156*.03:.2f}" stroke-linejoin="round"/>
  <use href="#p-dnf-{uid}" fill="#ffffff" fill-opacity=".35" clip-path="url(#c-top-{uid})"/>
</g>'''
    # CARDS: ink extrusion + outline, white fill
    dc = 92 * .1; extc = "".join(f'<use href="#p-cards-{uid}" x="{k*.7:.2f}" y="{k:.2f}"/>' for k in [dc - i*1.5 for i in range(int(dc/1.5)+1)] if k > 0)
    g_cards = f'''<g transform="translate(200 14) rotate({rot:.3f})">
  <g fill="{INK}">{extc}</g>
  <use href="#p-cards-{uid}" fill="none" stroke="{INK}" stroke-width="{92*.16:.2f}" stroke-linejoin="round"/>
  <use href="#p-cards-{uid}" fill="{cards_col}"/>
</g>'''
    tr = "M-8 78 C30 34 -16 4 18 -30 C40 -52 26 -70 48 -92"
    sp = "".join(f'<path d="{sparkle(x, y, r)}" fill="#ffffff"/>' for x, y, r in [(78, -116, 5), (70, -80, 4), (32, -120, 4)])
    g_trail = f'''<g transform="translate(22 -4)" stroke-linecap="round" fill="none">
  <path d="{tr}" stroke="{INK}" stroke-width="28"/>
  <path d="{tr}" stroke="url(#g-holo-{uid})" stroke-width="18"/>
  <path d="{tr}" stroke="#ffffff" stroke-width="5" stroke-dasharray="2 12"/>
  <circle cx="-8" cy="78" r="9" fill="#ffffff" stroke="{INK}" stroke-width="4"/>
  <path d="{star(54, -102, 17)}" fill="#fff35c" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>
  {sp}
</g>'''
    g_motto = f'''<g transform="translate(20 116)">
  <path d="{motto}" fill="none" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>
  <path d="{motto}" fill="{motto_col}"/>
</g>'''
    return defs, g_dnf + g_trail + g_cards + g_motto

def svg(bg=None, motto="#c6e536", uid="a", pad=18):
    defs, body = logo(motto, uid=uid)
    _, wd = text_d("DNF", 156); _, wc = text_d("CARDS", 92)
    left, right = -150 - wd / 2 - 16, 200 + wc / 2 + 22
    x0, y0, w, h = round(left - pad), -138 - pad, round(right - left + 2 * pad), 284 + 2 * pad
    rect = f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" width="{w*5}" height="{h*5}">\n<title>DNF Cards</title>\n{defs}\n{rect}\n{body}\n</svg>\n'

def icon(uid="i"):
    defs, _ = logo(uid=uid)
    dnf, wd = text_d("DNF", 92); cards, wc = text_d("CARDS", 26)
    d = 92 * .11; ext = "".join(f'<use href="#p-dnf2" x="{k*.75:.2f}" y="{k:.2f}"/>' for k in [d - i*1.2 for i in range(int(d/1.2)+1)] if k > 0)
    tr = "M-8 78 C30 34 -16 4 18 -30 C40 -52 26 -70 48 -92"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 240 240" width="1200" height="1200">
<title>DNF Cards</title>
<defs><linearGradient id="g-d2" x1="0" y1="-42" x2="0" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d8ff5c"/><stop offset=".45" stop-color="#5cf08a"/><stop offset="1" stop-color="#14b37a"/></linearGradient>
<linearGradient id="g-h2" x1="-8" y1="78" x2="48" y2="-92" gradientUnits="userSpaceOnUse">{stops(HOLO)}</linearGradient><path id="p-dnf2" d="{dnf}"/></defs>
<rect x="-110" y="-110" width="220" height="220" rx="48" fill="#2a1a6e" stroke="{INK}" stroke-width="8"/>
<g transform="translate(-6 -8) rotate(-2.29)"><g fill="#0b5c3c">{ext}</g>
<use href="#p-dnf2" fill="none" stroke="{INK}" stroke-width="15.6" stroke-linejoin="round"/><use href="#p-dnf2" fill="url(#g-d2)"/>
<use href="#p-dnf2" x="-1.66" y="-2.58" fill="none" stroke="#fff" stroke-width="2.76" stroke-linejoin="round"/></g>
<g transform="translate(66 28) scale(.42)" stroke-linecap="round" fill="none"><path d="{tr}" stroke="{INK}" stroke-width="28"/><path d="{tr}" stroke="url(#g-h2)" stroke-width="18"/><path d="{tr}" stroke="#fff" stroke-width="5" stroke-dasharray="2 12"/>
<circle cx="-8" cy="78" r="9" fill="#fff" stroke="{INK}" stroke-width="4"/><path d="{star(54, -102, 17)}" fill="#fff35c" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/></g>
<g transform="translate(-6 62)"><path d="{cards}" fill="none" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/><path d="{cards}" fill="#fff"/></g>
</svg>
'''

open(f"{D}/DNF-Cards-logo.svg", "w").write(svg(None, uid="t"))
open(f"{D}/DNF-Cards-logo-fond-sombre.svg", "w").write(svg("#0f0b1e", uid="s"))
open(f"{D}/DNF-Cards-logo-fond-clair.svg", "w").write(svg("#f4f1fb", "#7a2cff", uid="c"))
open(f"{D}/DNF-Cards-icone.svg", "w").write(icon())
print("ok")
