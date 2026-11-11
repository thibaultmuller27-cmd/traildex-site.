// Un thème par organisateur : des couleurs + la liste des petits dessins. Rien d'autre ne change dans la carte.
const THEMES = {
  alsace: {
    nom: "Alsace, forêt et winstub",
    fond: "#1e6a4a", fond2: "#17573c",            // fond et motif ton sur ton
    titre: "#ffffff", sousTitre: "#ffd23d",        // lettrage
    accent: "#ffd23d", cadre: "#ffd23d",           // étiquette du prénom, liseré du carré
    trace: "#ffe14d",                              // couleur du tracé
    relief: [[10, 34, 28], [26, 84, 58], [150, 196, 96]], // bas, milieu, sommets
    confettis: ["#ffd23d", "#ffffff", "#e8452f", "#c6e536"],
    dessins: ["biere", "flamme", "bretzel", "cigogne", "maison", "kouglof", "sapin", "vin", "champi", "knack", "coeur", "feuille"],
  },
  jura: {
    nom: "Jura, sapins et comté",
    fond: "#2a4f9e", fond2: "#234488", titre: "#ffffff", sousTitre: "#ffd23d", accent: "#f08a2e", cadre: "#f08a2e", trace: "#ffffff",
    relief: [[14, 24, 60], [36, 66, 130], [150, 190, 220]], confettis: ["#ffd23d", "#ffffff", "#f08a2e", "#7ed957"],
    dessins: ["renard", "fromage", "sapin", "cloche", "montagne", "champi", "chaussure", "feuille", "biere"],
  },
}
const CARTES = {
  utdp: { theme: "alsace", data: "data/001", t1: "UTDP", t2: "BY UTMB", date: "15 MAI 2026", st: [["DISTANCE", "112,6 km"], ["D+", "3 827 m"], ["CHRONO", "22h12"]], runner: "THIBAULT", num: "001" },
  utmj: { theme: "jura", data: "data/003", t1: "UTMJ 2026", t2: "LA RENARD", date: "3 OCT. 2026", st: [["DISTANCE", "77,8 km"], ["D+", "2 456 m"], ["CHRONO", "12h12"]], runner: "MATTHIEU", num: "003" },
}
