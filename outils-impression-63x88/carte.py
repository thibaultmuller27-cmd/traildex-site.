# One card from a GPX: python3 -I carte.py <gpx> <prenom> <numero> <dossier> [nom de course]
import sys, json, re, subprocess, shutil, os
gpx, runner, number, out = sys.argv[1:5]; race_override = sys.argv[5] if len(sys.argv) > 5 else None
HERE = os.path.dirname(os.path.abspath(__file__)); PW = os.path.join(HERE, "..", "pw"); os.makedirs(out, exist_ok=True)
subprocess.run(["python3", "-I", f"{PW}/gpxparse.py", gpx, f"{out}/track.json"], check=True)
os.makedirs(f"{out}/tiles", exist_ok=True)
subprocess.run(["python3", "-I", f"{PW}/demhq.py", out], check=True)
tr = json.load(open(f"{out}/track.json")); dem = json.load(open(f"{out}/dem.json"))
open(f"{out}/tracks.js", "w").write("const TRACKS={};const TRACK=" + json.dumps(tr) + ";const DEM=" + json.dumps(dem, separators=(",", ":")) + ";const DEMO={};")
def clean(t):
    t = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️‍®™©]", "", t or "")
    t = re.sub(r"^\s*finisher\s*", "", t, flags=re.I); return re.sub(r"\s+", " ", t).strip()
race = clean(race_override or tr["name"]) or "Ma course"
w = race.upper().split(); best = (1, 1e9)
for i in range(1, len(w)):
    d = abs(len(" ".join(w[:i])) - len(" ".join(w[i:]))); best = min(best, (i, d), key=lambda b: b[1])
t1, t2 = (" ".join(w[:best[0]]), " ".join(w[best[0]:])) if len(w) > 1 else (w[0], "")
M = ["JANV.", "FÉVR.", "MARS", "AVRIL", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."]
y, m, dd = tr["date"].split("-"); km = f"{tr['km']:.1f}".replace(".", ",") if tr["km"] < 100 or tr["km"] % 1 else f"{tr['km']:.0f}"
km = f"{tr['km']:.1f}".replace(".", ",")
h, mi = tr["durSec"] // 3600, round(tr["durSec"] % 3600 / 60)
if mi == 60: h, mi = h + 1, 0
gain = f"{tr['gain']:,}".replace(",", " ")
card = { "t1": t1, "t2": t2, "date": f"{int(dd)} {M[int(m)-1]} {y} · ALT. MAX {tr['maxEle']:,} M".replace(",", " "), "km": f"{km} KM DE BONHEUR",
  "st": [["DIST.", f"{km} km"], ["D+", f"{gain} m"], ["CHRONO", f"{h}h{mi:02d}"]], "runner": runner.upper(), "number": f"{int(number):03d}" }
open(f"{out}/data.js", "w").write("const CARD=" + json.dumps(card, ensure_ascii=False) + ";")
shutil.copy(f"{HERE}/template.html", f"{out}/card.html"); shutil.copy(f"{HERE}/qr.js", f"{out}/qr.js")
subprocess.run(["node", f"{PW}/render-carte.mjs", os.path.abspath(out)], check=True)
# 2 mm bleed by extending the edge pixels
from PIL import Image
import numpy as np
for side in ["recto", "verso"]:
    a = np.asarray(Image.open(f"{out}/{side}.png").convert("RGB")); b = round(2 * a.shape[1] / 63)
    Image.fromarray(np.pad(a, ((b, b), (b, b), (0, 0)), mode="edge")).save(f"{out}/{side}-bleed.png")
name = f"{card['number']}_{re.sub(r'[^A-Za-z0-9]+', '-', race)}_{re.sub(r'[^A-Za-z0-9]+', '-', runner)}"
subprocess.run(["node", f"{HERE}/pdfs.mjs", os.path.abspath(out), name], check=True)
print(json.dumps(card, ensure_ascii=False))
