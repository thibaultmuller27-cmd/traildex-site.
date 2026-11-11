// Petits dessins « doodle » (trait noir épais, aplats), dessinés en code dans une boîte d'environ ±30 unités.
// Chaque dessin : DOODLES.nom(ctx). Pour un nouveau thème, on en ajoute ici et on les cite dans themes.js.
const DINK = "#1a1026"
const DOODLES = (() => {
  const fs = (x, fill, lw = 3) => { x.fillStyle = fill; x.fill(); x.lineWidth = lw; x.strokeStyle = DINK; x.stroke() }
  const sf = (x, fill, lw = 6) => { x.lineWidth = lw; x.strokeStyle = DINK; x.stroke(); x.fillStyle = fill; x.fill() } // contour puis remplissage (formes fusionnées)
  const tube = (x, col, w) => { x.lineWidth = w + 6; x.strokeStyle = DINK; x.stroke(); x.lineWidth = w; x.strokeStyle = col; x.stroke() }
  const poly = (x, pts) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath() }
  const dot = (x, a, b, r, col) => { x.beginPath(); x.arc(a, b, r, 0, 7); x.fillStyle = col; x.fill() }
  const line = (x, pts, col, lw) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.strokeStyle = col; x.lineWidth = lw; x.stroke() }
  return {
    biere(x) {
      x.beginPath(); x.moveTo(10, -2); x.bezierCurveTo(28, -2, 28, 18, 10, 16); tube(x, "#fff3d0", 3.5)
      x.beginPath(); x.roundRect(-16, -10, 27, 34, 4); fs(x, "#f7b52c")
      line(x, [[-9, 0], [-9, 18]], "rgba(26,16,38,.45)", 2); line(x, [[-1, 0], [-1, 18]], "rgba(26,16,38,.45)", 2); line(x, [[6, 0], [6, 18]], "rgba(255,255,255,.7)", 2)
      x.beginPath(); for (const c of [-12, -3, 6]) { x.moveTo(c + 8, -12); x.arc(c, -12, 8, 0, 7) } x.moveTo(-10, -4); x.arc(-14, -4, 4.5, 0, 7); sf(x, "#ffffff")
      x.beginPath(); x.arc(-4, -27, 2.5, 0, 7); x.moveTo(6, -31); x.arc(4, -31, 1.8, 0, 7); x.lineWidth = 2; x.strokeStyle = DINK; x.stroke() },
    bretzel(x) {
      x.beginPath(); x.moveTo(-14, 15); x.bezierCurveTo(-36, -10, -10, -32, 0, -10); x.bezierCurveTo(10, -32, 36, -10, 14, 15); x.moveTo(-14, 15); x.lineTo(9, -9); x.moveTo(14, 15); x.lineTo(-9, -9); tube(x, "#b5651d", 7)
      for (const [a, b] of [[-19, -8], [-8, -20], [8, -20], [19, -8], [0, 1], [-10, 10], [10, 10]]) dot(x, a, b, 1.5, "#fff") },
    flamme(x) {
      x.beginPath(); x.roundRect(20, -5, 14, 10, 4); fs(x, "#a86a32"); x.beginPath(); x.roundRect(-29, -19, 54, 38, 9); fs(x, "#a86a32")
      x.beginPath(); x.roundRect(-25, -15, 46, 30, 11); fs(x, "#fbeec1"); x.beginPath(); x.roundRect(-21.5, -11.5, 39, 23, 8); x.strokeStyle = "#d9a441"; x.lineWidth = 2; x.stroke()
      for (const [a, b, r] of [[-15, -6, .4], [-4, 4, -.5], [6, -6, .9], [10, 5, .2], [-12, 6, 1.2], [-2, -8, -.2]]) { x.save(); x.translate(a, b); x.rotate(r); x.fillStyle = "#d9534f"; x.fillRect(-3.2, -1.6, 6.4, 3.2); x.restore() }
      for (const [a, b] of [[-8, -1], [3, -1], [12, -1], [-16, 1]]) { x.beginPath(); x.arc(a, b, 3.2, .3, 2.6); x.strokeStyle = "#b58fd6"; x.lineWidth = 1.8; x.stroke() }
      for (const [a, b] of [[-6, 8], [8, 9], [14, -9], [-18, -9]]) dot(x, a, b, 1.3, "#5fa84a") },
    sapin(x) {
      x.beginPath(); x.rect(-3.5, 14, 7, 12); fs(x, "#8a5a2b")
      for (let t = 2; t >= 0; t--) { poly(x, [[0, -30 + t * 12], [12 + t * 6, -6 + t * 11], [-12 - t * 6, -6 + t * 11]]); fs(x, ["#3fbf6a", "#2e9e5b", "#237a48"][t]) }
      line(x, [[-5, -12], [-9, -8]], "rgba(255,255,255,.6)", 2); line(x, [[-8, 0], [-13, 5]], "rgba(255,255,255,.5)", 2) },
    cigogne(x) {
      x.beginPath(); x.moveTo(-3, 12); x.lineTo(-5, 29); x.moveTo(4, 12); x.lineTo(7, 29); x.lineWidth = 5.5; x.strokeStyle = DINK; x.stroke(); x.lineWidth = 2.5; x.strokeStyle = "#e8452f"; x.stroke()
      x.beginPath(); x.moveTo(10, 0); x.quadraticCurveTo(20, -10, 12, -20); tube(x, "#ffffff", 5)
      x.beginPath(); x.ellipse(0, 4, 17, 11, -.1, 0, 7); fs(x, "#ffffff"); x.beginPath(); x.ellipse(-10, 6, 9, 5.5, .35, 0, 7); x.fillStyle = DINK; x.fill()
      poly(x, [[15, -24], [32, -19], [15, -17]]); fs(x, "#e8452f", 2.5); x.beginPath(); x.arc(12, -21, 5.5, 0, 7); fs(x, "#ffffff"); dot(x, 13.5, -22, 1.4, DINK) },
    maison(x) {
      x.beginPath(); x.rect(-18, -6, 36, 30); fs(x, "#fbeec1")
      x.beginPath(); x.moveTo(-18, 9); x.lineTo(18, 9); x.moveTo(0, -6); x.lineTo(0, 24); x.moveTo(-18, 24); x.lineTo(0, 9); x.lineTo(18, 24); x.strokeStyle = "#7a4a21"; x.lineWidth = 3; x.stroke()
      x.beginPath(); x.rect(-18, -6, 36, 30); x.lineWidth = 3; x.strokeStyle = DINK; x.stroke()
      poly(x, [[-24, -6], [0, -29], [24, -6]]); fs(x, "#d9534f"); x.beginPath(); x.rect(-13, -2, 8, 8); fs(x, "#8fd3f5", 2.2)
      x.beginPath(); x.moveTo(9, 5); x.bezierCurveTo(1, -1, 6, -7, 9, -2); x.bezierCurveTo(12, -7, 17, -1, 9, 5); x.fillStyle = "#e8452f"; x.fill() },
    kouglof(x) {
      x.beginPath(); x.ellipse(0, 18, 27, 5, 0, 0, 7); fs(x, "#ffffff", 2.5)
      x.beginPath(); x.moveTo(-21, 17); x.lineTo(-17, -6); for (let k = 0; k < 4; k++) x.quadraticCurveTo(-12.75 + k * 8.5, -15, -8.5 + k * 8.5, -6); x.lineTo(21, 17); x.closePath(); fs(x, "#c98a4b")
      for (const a of [-11, -4, 4, 11]) line(x, [[a * .8, -5], [a, 15]], "rgba(26,16,38,.4)", 2)
      x.beginPath(); x.ellipse(0, -9, 15, 5, 0, 0, 7); sf(x, "#ffffff", 5) },
    vin(x) {
      x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 19); tube(x, "#2e9e5b", 3); x.beginPath(); x.ellipse(0, 21, 10, 3.2, 0, 0, 7); fs(x, "#2e9e5b", 2.5)
      x.beginPath(); x.moveTo(-11, -24); x.lineTo(11, -24); x.bezierCurveTo(13, -4, 5, 1, 0, 1); x.bezierCurveTo(-5, 1, -13, -4, -11, -24); x.closePath(); fs(x, "#f4fbe0")
      x.beginPath(); x.moveTo(-10.5, -13); x.lineTo(10.5, -13); x.bezierCurveTo(10, -3, 5, 0, 0, 0); x.bezierCurveTo(-5, 0, -10, -3, -10.5, -13); x.closePath(); x.fillStyle = "#d9e86a"; x.fill(); line(x, [[-6, -20], [-6.5, -9]], "rgba(255,255,255,.9)", 2) },
    champi(x) {
      x.beginPath(); x.roundRect(-6, 0, 12, 20, 5); fs(x, "#fbeec1")
      x.beginPath(); x.moveTo(-21, 3); x.bezierCurveTo(-21, -27, 21, -27, 21, 3); x.closePath(); fs(x, "#e8452f")
      for (const [a, b, r] of [[-9, -8, 3.4], [4, -13, 3], [11, -4, 2.6], [-1, -3, 2]]) dot(x, a, b, r, "#fff") },
    coeur(x) { x.beginPath(); x.moveTo(0, 17); x.bezierCurveTo(-32, -6, -12, -27, 0, -10); x.bezierCurveTo(12, -27, 32, -6, 0, 17); x.closePath(); fs(x, "#e8452f"); line(x, [[-10, -10], [-13, -5]], "rgba(255,255,255,.8)", 2.5) },
    feuille(x) { x.beginPath(); x.moveTo(0, -21); x.quadraticCurveTo(19, 0, 0, 21); x.quadraticCurveTo(-19, 0, 0, -21); fs(x, "#7ed957"); line(x, [[0, -15], [0, 17]], DINK, 1.8); line(x, [[0, -4], [6, -9]], DINK, 1.5); line(x, [[0, 4], [-6, -1]], DINK, 1.5) },
    knack(x) { x.beginPath(); x.moveTo(-19, -7); x.quadraticCurveTo(0, 17, 19, -7); tube(x, "#d9825f", 8); x.beginPath(); x.moveTo(-12, -1); x.quadraticCurveTo(-4, 6, 4, 5); x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 2; x.stroke() },
    fromage(x) { poly(x, [[-23, 10], [18, -13], [23, 8], [23, 18], [-23, 18]]); fs(x, "#ffd23d"); line(x, [[-23, 10], [23, 8]], DINK, 2); for (const [a, b, r] of [[-6, 13, 2.6], [8, 13, 2], [10, -3, 3], [1, 3, 1.8]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fillStyle = "#e0a800"; x.fill(); x.lineWidth = 1.5; x.strokeStyle = DINK; x.stroke() } },
    cloche(x) { x.beginPath(); x.roundRect(-6, -27, 12, 10, 3); fs(x, "#e8452f"); x.beginPath(); x.arc(0, 16, 4.5, 0, 7); fs(x, "#7a4a21", 2.5); x.beginPath(); x.moveTo(-17, 13); x.bezierCurveTo(-13, -24, 13, -24, 17, 13); x.closePath(); fs(x, "#ffd23d"); line(x, [[-8, -6], [-10, 6]], "rgba(255,255,255,.8)", 2.5) },
    montagne(x) { poly(x, [[-27, 17], [-7, -19], [3, -5], [12, -15], [27, 17]]); fs(x, "#8f7ad9"); poly(x, [[-7, -19], [-1, -10], [-6, -8], [-11, -12]]); fs(x, "#ffffff", 2); poly(x, [[12, -15], [17, -6], [12, -5], [8, -10]]); fs(x, "#ffffff", 2) },
    chaussure(x) { x.beginPath(); x.roundRect(-24, 10, 50, 7, 3); fs(x, "#ffffff"); x.beginPath(); x.moveTo(-22, 10); x.lineTo(-20, -9); x.quadraticCurveTo(-10, -11, -6, -2); x.lineTo(14, 2); x.quadraticCurveTo(25, 4, 24, 10); x.closePath(); fs(x, "#c6e536"); for (const a of [-3, 3, 9]) line(x, [[a, -1 + (a + 3) * .15], [a - 3, 5 + (a + 3) * .1]], DINK, 2) },
    renard(x) {
      poly(x, [[-21, -8], [-15, -28], [-5, -9]]); fs(x, "#f08a2e"); poly(x, [[21, -8], [15, -28], [5, -9]]); fs(x, "#f08a2e")
      poly(x, [[-21, -8], [21, -8], [0, 23]]); fs(x, "#f08a2e"); poly(x, [[-21, -8], [0, 23], [-4, 3]]); fs(x, "#ffffff", 2.2); poly(x, [[21, -8], [0, 23], [4, 3]]); fs(x, "#ffffff", 2.2)
      dot(x, 0, 21, 3.6, DINK); dot(x, -7, -1, 2, DINK); dot(x, 7, -1, 2, DINK) },
    // petits bouche-trous
    _point(x, c) { x.beginPath(); x.arc(0, 0, 3.2, 0, 7); x.fillStyle = c; x.fill(); x.lineWidth = 1.6; x.strokeStyle = DINK; x.stroke() },
    _etoile(x, c) { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 2 : 6.5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r) } x.closePath(); x.fillStyle = c; x.fill(); x.lineWidth = 1.6; x.strokeStyle = DINK; x.stroke() },
    _plus(x, c) { x.beginPath(); x.moveTo(-5, 0); x.lineTo(5, 0); x.moveTo(0, -5); x.lineTo(0, 5); x.lineCap = "round"; x.lineWidth = 5.5; x.strokeStyle = DINK; x.stroke(); x.lineWidth = 2.6; x.strokeStyle = c; x.stroke() },
  }
})()
