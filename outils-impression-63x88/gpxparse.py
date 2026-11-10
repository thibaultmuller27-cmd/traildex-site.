import sys, re, json, math
src, out = sys.argv[1], sys.argv[2]
txt = open(src, encoding="utf-8").read()
pts = [(float(a), float(b), float(c), t or None) for a, b, c, t in re.findall(r'<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)</ele>\s*(?:<time>([^<]+)</time>)?', txt)]
def hav(a, b):
    R = 6371000; p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))
dist = sum(hav(pts[i - 1], pts[i]) for i in range(1, len(pts)))
# D+ with a simple smoothing (moving average 15 pts) and 3 m hysteresis
e = [p[2] for p in pts]; k = 15; sm = [sum(e[max(0, i - k):i + k + 1]) / len(e[max(0, i - k):i + k + 1]) for i in range(len(e))]
gain = 0; ref = sm[0]
for v in sm:
    if v - ref > 3: gain += v - ref; ref = v
    elif ref - v > 3: ref = v
from datetime import datetime, timedelta
if pts[0][3]:
    t0 = datetime.fromisoformat(pts[0][3].replace("Z", "+00:00")); t1 = datetime.fromisoformat(pts[-1][3].replace("Z", "+00:00"))
else:
    t0 = t1 = datetime(2000, 1, 1)
step = max(1, len(pts) // 1500)
name = re.search(r"<name>([^<]*)</name>", txt).group(1)
json.dump({ "name": name, "km": round(dist / 1000, 1), "gain": round(gain), "durSec": int((t1 - t0).total_seconds()), "date": pts[0][3][:10] if pts[0][3] else None,
  "maxEle": round(max(e)), "minEle": round(min(e)), "n": len(pts), "pts": [[round(p[0], 5), round(p[1], 5), round(p[2])] for p in pts[::step]] }, open(out, "w"))
print(name, len(pts), round(dist / 1000, 1), "km", round(gain), "D+", t1 - t0, "max", max(e), "min", min(e))
print("bbox", min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts))
