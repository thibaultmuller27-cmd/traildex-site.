# Une carte DNF Cards 63 x 88 mm.
#   python3 -I carte.py <fichier.gpx | trace.json> <prenom> <numero> <dossier> ["nom de course"] [AAAA-MM-JJ] [12h34] [--sceau FINISHER|DNF]
# trace.json : {"name", "km", "gain", "durSec", "date", "maxEle", "minEle", "pts": [[lat, lon, ele], ...]} (ce que produit gpxparse.py,
# ou ce que lot.py fabrique depuis une commande Airtable).
import sys, json, re, subprocess, shutil, os
args = [a for a in sys.argv[1:]]
sceau = None
if "--sceau" in args:
    i = args.index("--sceau"); sceau = args[i + 1].upper(); del args[i:i + 2]
src, runner, number, out = args[0:4]
race_override = args[4] if len(args) > 4 and args[4] else None
date_override = args[5] if len(args) > 5 and args[5] else None
chrono_override = args[6] if len(args) > 6 and args[6] else None
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(out, exist_ok=True)
if src.lower().endswith(".json"):
    if os.path.abspath(src) != os.path.abspath(f"{out}/track.json"): shutil.copy(src, f"{out}/track.json")
else:
    subprocess.run(["python3", "-I", f"{HERE}/gpxparse.py", src, f"{out}/track.json"], check=True)
os.makedirs(f"{out}/tiles", exist_ok=True)
subprocess.run(["python3", "-I", f"{HERE}/demhq.py", out], check=True)
tr = json.load(open(f"{out}/track.json")); dem = json.load(open(f"{out}/dem.json"))
if date_override: tr["date"] = date_override
if chrono_override:
    hh, mm = re.match(r"(\d+)h(\d+)", chrono_override).groups(); tr["durSec"] = int(hh) * 3600 + int(mm) * 60
open(f"{out}/tracks.js", "w").write("const TRACKS={};const TRACK=" + json.dumps(tr) + ";const DEM=" + json.dumps(dem, separators=(",", ":")) + ";const DEMO={};")
def clean(t):
    t = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️‍®™©]", "", t or "")
    t = re.sub(r"^\s*finisher\s*", "", t, flags=re.I); return re.sub(r"\s+", " ", t).strip()
race = clean(race_override or tr.get("name")) or "Ma course"
w = race.upper().split(); best = (1, 1e9)
for i in range(1, len(w)):
    d = abs(len(" ".join(w[:i])) - len(" ".join(w[i:]))); best = min(best, (i, d), key=lambda b: b[1])
t1, t2 = (" ".join(w[:best[0]]), " ".join(w[best[0]:])) if len(w) > 1 else (w[0], "")
M = ["JANV.", "FÉVR.", "MARS", "AVRIL", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."]
km = f"{tr['km']:.1f}".replace(".", ",")
dur = tr.get("durSec") or 0
h, mi = dur // 3600, round(dur % 3600 / 60)
if mi == 60: h, mi = h + 1, 0
chrono = f"{h}h{mi:02d}" if dur else "—"
gain = f"{tr['gain']:,}".replace(",", " ")
date_txt = ""
if tr.get("date"):
    y, m, dd = tr["date"].split("-"); date_txt = f"{int(dd)} {M[int(m)-1]} {y}"
alt = f"ALT. MAX {tr['maxEle']:,} M".replace(",", " ") if tr.get("maxEle") is not None else ""
card = { "t1": t1, "t2": t2, "date": " · ".join(x for x in [date_txt, alt] if x), "km": f"{km} KM DE BONHEUR",
  "st": [["DIST.", f"{km} km"], ["D+", f"{gain} m"], ["CHRONO", chrono]], "runner": runner.upper(), "number": f"{int(number):03d}" }
open(f"{out}/data.js", "w").write("const CARD=" + json.dumps(card, ensure_ascii=False) + ";")
shutil.copy(f"{HERE}/template.html", f"{out}/card.html"); shutil.copy(f"{HERE}/qr.js", f"{out}/qr.js")
subprocess.run(["node", f"{HERE}/render-carte.mjs", os.path.abspath(out)], check=True)
# fond perdu de 2 mm (bords prolonges en miroir)
from PIL import Image
import numpy as np
for side in ["recto", "verso"]:
    a = np.asarray(Image.open(f"{out}/{side}.png").convert("RGB")); b = round(2 * a.shape[1] / 63)
    Image.fromarray(np.pad(a, ((b, b), (b, b), (0, 0)), mode="reflect")).save(f"{out}/{side}-bleed.png")
name = f"{card['number']}_{re.sub(r'[^A-Za-z0-9]+', '-', race).strip('-')}_{re.sub(r'[^A-Za-z0-9]+', '-', runner).strip('-')}"
subprocess.run(["node", f"{HERE}/pdfs.mjs", os.path.abspath(out), name], check=True)
cmd = ["python3", "-I", f"{HERE}/couches_o1.py", out, name]
if sceau: cmd += ["--sceau", sceau]
subprocess.run(cmd, check=True)
json.dump({"name": name, **card}, open(f"{out}/carte.json", "w"), ensure_ascii=False)
print(json.dumps(card, ensure_ascii=False))
