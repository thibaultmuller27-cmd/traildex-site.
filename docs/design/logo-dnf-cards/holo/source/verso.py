frag = open("logo-body.svgfrag").read()
W, H, s = 860, 1200, 30.5
lw = 17.0 * s; ox = (W - lw) / 2 - 0.2 * s; oy = 455
HOLO = ["#ff6ec7", "#b07cff", "#5fd3ff", "#4ff0c0", "#d9f75a", "#ffc46b", "#ff6ec7"]
st = lambda cols, op=1: "".join(f'<stop offset="{i/(len(cols)-1):.3f}" stop-color="{c}" stop-opacity="{op}"/>' for i, c in enumerate(cols))
def spark(x, y, r, fill):
    k = r * .22
    return f'<path d="M{x},{y-r} L{x+k},{y-k} L{x+r},{y} L{x+k},{y+k} L{x},{y+r} L{x-k},{y+k} L{x-r},{y} L{x-k},{y-k}Z" fill="{fill}"/>'
import random; R = random.Random(7)
pts=[(R.uniform(70, W-70), R.uniform(70, H-70), R.uniform(3, 7)) for _ in range(60)]
pts=[p for p in pts if not (110 < p[0] < 760 and 380 < p[1] < 830)][:26]
sparks = "".join(spark(x, y, r, "url(#vholo)") for x, y, r in pts)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<radialGradient id="bg" cx=".5" cy=".46" r=".75"><stop offset="0" stop-color="#2c1468"/><stop offset=".55" stop-color="#150a38"/><stop offset="1" stop-color="#08051a"/></radialGradient>
<linearGradient id="vholo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{W}" y2="{H}">{st(HOLO)}</linearGradient>
<linearGradient id="shimmer" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{W*1.2}" y2="{H*.7}">{st(HOLO + HOLO[1:], .16)}</linearGradient>
<radialGradient id="fade" cx=".5" cy=".46" r=".62"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".7" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></radialGradient>
<mask id="m"><rect width="{W}" height="{H}" fill="url(#fade)"/></mask>
<pattern id="plus" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 10v8M10 14h8" stroke="#6a3cff" stroke-opacity=".38" stroke-width="1.4" stroke-linecap="round"/></pattern>
<pattern id="diam" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H46M0 0V46" stroke="#ffffff" stroke-opacity=".05" stroke-width="1"/></pattern>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8a5cff" stop-opacity=".45"/><stop offset="1" stop-color="#8a5cff" stop-opacity="0"/></radialGradient>
<linearGradient id="tag" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="660" y2="0">{st(["#ffd6f2","#d8c8ff","#bff0ff","#c8ffe9","#f0ffb0","#ffe0b8"])}</linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<rect width="{W}" height="{H}" fill="url(#plus)"/>
<rect width="{W}" height="{H}" fill="url(#diam)"/>
<g mask="url(#m)" style="mix-blend-mode:screen"><rect width="{W}" height="{H}" fill="url(#shimmer)"/></g>
<g style="mix-blend-mode:screen" opacity=".55">{"".join(f'<path d="M{W/2},{oy+120} L{W/2+1400*__import__("math").cos(a)},{oy+120+1400*__import__("math").sin(a)} L{W/2+1400*__import__("math").cos(a+.045)},{oy+120+1400*__import__("math").sin(a+.045)}Z" fill="url(#vholo)" opacity=".07"/>' for a in [i*2*3.14159/40 for i in range(40)])}</g>
<ellipse cx="{W/2}" cy="{oy+130}" rx="360" ry="300" fill="url(#glow)"/>
{sparks}
<g transform="translate({ox},{oy}) scale({s})">{frag}</g>
<text x="{W/2}" y="{oy + 11.4*s}" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="21" letter-spacing="7.5" fill="url(#tag)">DÉJÀ NOSTALGIQUE DU FINISH</text>
<rect x="34" y="34" width="{W-68}" height="{H-68}" rx="30" fill="none" stroke="url(#vholo)" stroke-width="5"/>
<rect x="46" y="46" width="{W-92}" height="{H-92}" rx="22" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1.5"/>
{spark(24+6, 24+6, 0, "none")}
{"".join(spark(x, y, 16, "url(#vholo)") for x, y in [(46,46),(W-46,46),(46,H-46),(W-46,H-46)])}
</svg>'''
open("verso.svg", "w").write(svg)
open("verso.html", "w").write('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap"><style>body{margin:0;background:#000}</style>' + svg)
