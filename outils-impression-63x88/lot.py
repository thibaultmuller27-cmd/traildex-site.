# Lot d'impression : toutes les commandes Airtable au statut « À imprimer » -> cartes + etiquettes colis + bordereau.
#   AIRTABLE_TOKEN=... python3 -I lot.py <dossier de sortie>            (lit Airtable, lecture seule)
#   python3 -I lot.py <dossier de sortie> commandes.json                 (export deja fait : liste de {id, createdTime, fields})
# Rien n'est ecrit dans Airtable : apres l'impression, Thibault passe lui-meme les commandes en « Imprimée ».
import json, os, re, shutil, subprocess, sys, unicodedata, urllib.parse, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BASE, TABLE = "appFtEAvDkYtjLleM", "tbl4QdVEf4WWnoE4P"
F = {  # identifiants des colonnes de la table Commandes
    "ref": "fldBRi9Hum4zit6bf", "statut": "fldxhycISmd6YgN8r", "nom": "fldpT4fx3BNABdFp2", "adresse": "fld0qn0xPhVSaARa1",
    "cp": "fldoV4GqXtI4dxxeu", "ville": "fld5Z9FGnb9cGfKmT", "coureur": "fldWMhuPnHRBth2w0", "course": "fldXE7btBUreMej8C",
    "date": "fldwzwqEen6Qy6Gh8", "km": "fldhP1zHfjbSsIZQn", "dplus": "fldgvMpf0mp2wnsH4", "altmax": "fldRLZMwXWMA7Iqca",
    "chrono": "fldzPwkQdAG7jURjd", "qte": "fld3PaJa365DVv4SK", "json": "fld1aonT4lBn1QhtB", "num": "fldIiYvI7OMeiGVTj",
    "trace": "fldnvXG0HTlowB3gw", "dnf": "fldNIR5cYzMi365ON",
}
STATUT = "À imprimer"

def fetch():
    tok = os.environ.get("AIRTABLE_TOKEN")
    if not tok: sys.exit("Il faut AIRTABLE_TOKEN (jeton en lecture) ou un fichier commandes.json.")
    out, offset = [], None
    while True:
        q = {"returnFieldsByFieldId": "true", "pageSize": "100"}
        if offset: q["offset"] = offset
        req = urllib.request.Request(f"https://api.airtable.com/v0/{BASE}/{TABLE}?" + urllib.parse.urlencode(q), headers={"Authorization": f"Bearer {tok}"})
        page = json.load(urllib.request.urlopen(req)); out += page["records"]; offset = page.get("offset")
        if not offset: return out

def val(f, key):
    v = f.get(F[key], f.get(key))
    if isinstance(v, dict): v = v.get("name", v.get("value"))
    return v

def slug(t): return re.sub(r"[^A-Za-z0-9]+", "-", unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode()).strip("-")

def track_from(f):
    """Trace complet si le site l'a envoye, sinon reconstruit depuis le trace simplifie de « Données carte (JSON) »."""
    raw = val(f, "trace")
    if raw: return json.loads(raw), "complet"
    c = json.loads(val(f, "json") or "{}"); g = c.get("geo")
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", c.get("routePath", ""))]
    if not g or len(nums) < 4: return None, "absent"
    xy = list(zip(nums[0::2], nums[1::2]))
    pts = [(-((y - g["offY"]) / g["scale"] + g["minY"]), ((x - g["offX"]) / g["scale"] + g["minX"]) / g["cosLat"]) for x, y in xy]
    prof = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", c.get("profileLine", ""))][1::2] or [0]
    ele = [round((28 - prof[min(len(prof) - 1, int(i / max(1, len(pts) - 1) * (len(prof) - 1)))]) / 24 * 1000) for i in range(len(pts))]
    return [[round(a, 5), round(b, 5), e] for (a, b), e in zip(pts, ele)], "simplifié"

def main():
    out = os.path.abspath(sys.argv[1]); recs = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else fetch()
    recs = [r for r in recs if val(r["fields"], "statut") == STATUT]
    recs.sort(key=lambda r: (val(r["fields"], "num") or 0, r.get("createdTime", "")))
    if not recs: sys.exit(f"Aucune commande au statut « {STATUT} ».")
    for sub in ["imprimeur", "o1", "_travail"]: os.makedirs(f"{out}/{sub}", exist_ok=True)
    rows, problems = [], []
    for r in recs:
        f = r["fields"]; num = int(val(f, "num") or 0); ref = val(f, "ref") or r["id"]
        if not num: problems.append(f"{ref} : pas de N° carte"); continue
        pts, qual = track_from(f)
        if not pts: problems.append(f"{ref} : pas de tracé, carte non générée"); continue
        if qual != "complet": problems.append(f"{ref} : tracé reconstruit depuis la version simplifiée (moins précis)")
        eles = [p[2] for p in pts]
        tr = {"name": val(f, "course"), "km": float(val(f, "km") or 0), "gain": int(val(f, "dplus") or 0), "durSec": int(val(f, "chrono") or 0),
              "date": val(f, "date"), "maxEle": val(f, "altmax") if val(f, "altmax") is not None else max(eles), "minEle": min(eles), "n": len(pts), "pts": pts}
        work = f"{out}/_travail/{num:03d}"; os.makedirs(work, exist_ok=True)
        json.dump(tr, open(f"{work}/trace-commande.json", "w"))
        kind = "DNF" if val(f, "dnf") else "FINISHER"
        subprocess.run(["python3", "-I", f"{HERE}/carte.py", f"{work}/trace-commande.json", val(f, "coureur") or "", str(num), work, val(f, "course") or "", "", "", "--sceau", kind], check=True)
        card = json.load(open(f"{work}/carte.json")); name = card["name"]
        for fn in os.listdir(work):
            if fn.startswith(name) and fn.endswith(".pdf"): shutil.copy(f"{work}/{fn}", f"{out}/imprimeur/{fn}")
            if fn.startswith(name + "_O1_"): shutil.copy(f"{work}/{fn}", f"{out}/o1/{fn}")
        im = Image.open(f"{work}/recto.png").convert("RGB"); im.thumbnail((430, 600)); im.save(f"{work}/vignette.jpg", quality=88)
        rows.append({"num": f"{num:03d}", "ref": ref, "nom": val(f, "nom") or "", "adresse": val(f, "adresse") or "", "cp": val(f, "cp") or "",
                     "ville": val(f, "ville") or "", "course": val(f, "course") or "", "coureur": val(f, "coureur") or "", "qte": int(val(f, "qte") or 1),
                     "sceau": kind, "fichier": name, "vignette": f"{work}/vignette.jpg"})
    json.dump(rows, open(f"{out}/_travail/lot.json", "w"), ensure_ascii=False)
    if rows: subprocess.run(["node", f"{HERE}/etiquettes.mjs", f"{out}/_travail/lot.json", out], check=True)
    with open(f"{out}/bordereau.csv", "w", encoding="utf-8-sig") as b:
        b.write("N° carte;Référence;Client;Adresse;CP;Ville;Course;Prénom sur la carte;Quantité;Sceau;Fichier\n")
        for x in rows: b.write(";".join(str(x[k]).replace(";", ",") for k in ["num", "ref", "nom", "adresse", "cp", "ville", "course", "coureur", "qte", "sceau", "fichier"]) + "\n")
    n = sum(x["qte"] for x in rows)
    with open(f"{out}/LISEZ-MOI.txt", "w", encoding="utf-8") as t:
        t.write(f"Lot DNF Cards : {len(rows)} commande(s), {n} carte(s) à imprimer.\n\n")
        t.write("imprimeur/ : PDF recto, verso (63 x 88 + 2 mm de fond perdu) et dorure holo, par carte.\n")
        t.write("o1/ : couches pour la xTool O1 (couleur, blanc, vernis du tracé, sceau en relief base + motif), format fini 63 x 88.\n")
        t.write("etiquettes-A4-99x38.pdf : planche A4 de 14 étiquettes 99,1 x 38,1 mm (type Avery L7163), une par colis.\n")
        t.write("etiquettes-100x150.pdf : une étiquette 100 x 150 mm par page (imprimante d'étiquettes).\n")
        t.write("bordereau.csv : quel numéro de carte va à quel client.\n\n")
        t.write("Après l'impression : passer les commandes en « Imprimée » dans Airtable (le script n'écrit rien).\n")
        if problems: t.write("\nÀ VÉRIFIER :\n" + "\n".join("- " + p for p in problems) + "\n")
    print(f"lot ok : {len(rows)} commande(s), {n} carte(s)", *problems, sep="\n")

if __name__ == "__main__": main()
