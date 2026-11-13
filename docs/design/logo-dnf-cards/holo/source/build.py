# Logo DNF Cards holographique : mêmes tracés que le logo gaming, couleurs en dégradé holo.
import re, sys
src = open(sys.argv[1]).read(); out = sys.argv[2]
paths = re.findall(r'<path fill="(#[0-9a-f]+)" fill-rule="evenodd" d="([^"]+)"/>', src)
sh = [d for c, d in paths if c == "#7a2cff"]; dnf = [d for c, d in paths if c == "#c6e536"]
cards = [d for c, d in paths if c == "#ffffff"]; star = [d for c, d in paths if c == "#1fd6a0"]
HOLO = ["#ff6ec7", "#b07cff", "#5fd3ff", "#4ff0c0", "#d9f75a", "#ffc46b", "#ff6ec7", "#b07cff", "#5fd3ff"]
def stops(cols): return "".join(f'<stop offset="{i/(len(cols)-1):.3f}" stop-color="{c}"/>' for i, c in enumerate(cols))
defs = f'''<defs>
<linearGradient id="holo" gradientUnits="userSpaceOnUse" x1="0" y1="-1" x2="17" y2="10">{stops(HOLO)}</linearGradient>
<linearGradient id="holo2" gradientUnits="userSpaceOnUse" x1="0" y1="6.5" x2="15" y2="10">{stops(["#ffd6f2","#e2d4ff","#c9f2ff","#c8ffe9","#f4ffc4","#ffe6c4","#ffd6f2"])}</linearGradient>
<linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="16" y2="6">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".27" stop-color="#fff" stop-opacity=".75"/><stop offset=".31" stop-color="#fff" stop-opacity="0"/>
<stop offset=".58" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".5"/><stop offset=".645" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a0a5e" stop-opacity=".28"/></linearGradient>
<radialGradient id="starg" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#9ff7dc"/><stop offset=".7" stop-color="#7fb8ff"/><stop offset="1" stop-color="#ff8ad8"/></radialGradient>
</defs>'''
P = lambda ds, fill, extra="": "".join(f'<path fill="{fill}" fill-rule="evenodd" d="{d}"{extra}/>' for d in ds)
body = (P(sh, "#3a1488") +                                     # ombre portée, même décalage que le logo gaming
        P(dnf, "url(#holo)") + P(dnf, "url(#shade)") + P(dnf, "url(#sheen)") +
        P(dnf, "none", ' stroke="#ffffff" stroke-opacity=".55" stroke-width=".05" stroke-linejoin="round"') +
        P(cards, "url(#holo2)") + P(cards, "url(#sheen)") +
        P(star, "url(#starg)"))
def svg(bg, vb="-2.116 -3.500 22.640 15.120"):
    x, y, w, h = vb.split()
    rect = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.6" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>DNF Cards — holographique</title>{defs}{rect}{body}</svg>'
open(f"{out}/DNF-Cards-logo_holo_fond-sombre.svg", "w").write(svg("#0f0b1e"))
open(f"{out}/DNF-Cards-logo_holo_transparent.svg", "w").write(svg(None, "-0.2 -1.6 18.6 11.3"))
open(f"{out}/logo-body.svgfrag", "w").write(defs + body)
print("ok", len(sh), len(dnf), len(cards), len(star))
