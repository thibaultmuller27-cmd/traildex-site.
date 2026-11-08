import sys, json, math, os, subprocess
from PIL import Image
D = sys.argv[1]; tr = json.load(open(f"{D}/track.json")); Z = 13
lats = [p[0] for p in tr["pts"]]; lons = [p[1] for p in tr["pts"]]
clat, clon = (min(lats) + max(lats)) / 2, (min(lons) + max(lons)) / 2
k = math.cos(math.radians(clat)); half = max((max(lats) - min(lats)) / 2, (max(lons) - min(lons)) / 2 * k) * 1.12
la0, la1, lo0, lo1 = clat - half, clat + half, clon - half / k, clon + half / k
def tx(lon): return (lon + 180) / 360 * 2 ** Z
def ty(lat): r = math.radians(lat); return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** Z
X0, X1, Y0, Y1 = int(tx(lo0)), int(tx(lo1)), int(ty(la1)), int(ty(la0))
mosaic = Image.new("RGB", ((X1 - X0 + 1) * 256, (Y1 - Y0 + 1) * 256))
for x in range(X0, X1 + 1):
    for y in range(Y0, Y1 + 1):
        f = f"{D}/tiles/{Z}_{x}_{y}.png"
        if not os.path.exists(f): subprocess.run(["curl", "-s", "-o", f, f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png"], check=True)
        mosaic.paste(Image.open(f).convert("RGB"), ((x - X0) * 256, (y - Y0) * 256))
N = 720; grid = []
for j in range(N):
    lat = la1 - (la1 - la0) * j / (N - 1); row = []
    for i in range(N):
        lon = lo0 + (lo1 - lo0) * i / (N - 1)
        px = (tx(lon) - X0) * 256; py = (ty(lat) - Y0) * 256
        r, g, b = mosaic.getpixel((min(int(px), mosaic.width - 1), min(int(py), mosaic.height - 1)))
        row.append(round(r * 256 + g + b / 256 - 32768))
    grid.append(row)
json.dump({ "bbox": [la0, la1, lo0, lo1], "N": N, "grid": grid }, open(f"{D}/dem.json", "w"))
flat = [v for r in grid for v in r]; print("tiles", (X1 - X0 + 1) * (Y1 - Y0 + 1), "ele", min(flat), max(flat))
