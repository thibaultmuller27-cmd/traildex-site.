// Illustrations « signature » des courses, dessinées en code : volumes, ombres, reflets, encrage.
// (0,0) = point au sol, unités carte. L'appelant fait translate/scale.
const ILLUS = (() => {
  const INK = "#160a1e"
  const bez = (p0, p1, p2, p3, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]] })
  const chain = (...s) => s.reduce((a, b, i) => a.concat(i ? b.slice(1) : b), [])
  function taper(C, w) { const L = [], R = []; for (let i = 0; i < C.length; i++) { const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, ww = w(i / (C.length - 1)) / 2; L.push([C[i][0] - dy / n * ww, C[i][1] + dx / n * ww]); R.push([C[i][0] + dy / n * ww, C[i][1] - dx / n * ww]) } return { L, R, poly: L.concat([...R].reverse()) } }
  const P2 = (P, smooth = true) => { const p = new Path2D(), n = P.length; if (!smooth) { P.forEach(([a, b], i) => i ? p.lineTo(a, b) : p.moveTo(a, b)); p.closePath(); return p }
    const m = i => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2]; p.moveTo(...m(n - 1)); for (let i = 0; i < n; i++) p.quadraticCurveTo(...P[i], ...m(i)); p.closePath(); return p }
  const moved = (p, dx, dy) => { const q = new Path2D(); q.addPath(p, new DOMMatrix().translate(dx, dy)); return q }
  // couleur de base + ombre (bas-droite) + reflet (haut-gauche) + encrage
  let MODE = "bd"
  function shade(x, p, base, dark, light, lw = 4, o = 9) {
    if (MODE === "3d") return shade3d(x, p, base, dark, light, lw, o)
    x.fillStyle = base; x.fill(p)
    if (dark) { x.save(); x.clip(p); const q = new Path2D(); q.rect(-3000, -3000, 6000, 6000); q.addPath(p, new DOMMatrix().translate(-o, -o * .8)); x.fillStyle = dark; x.fill(q, "evenodd"); x.restore() }
    if (light) { x.save(); x.clip(p); const q = new Path2D(); q.rect(-3000, -3000, 6000, 6000); q.addPath(p, new DOMMatrix().translate(o * .55, o * .5)); x.fillStyle = light; x.fill(q, "evenodd"); x.restore() }
    if (lw) { x.lineJoin = "round"; x.lineWidth = lw; x.strokeStyle = INK; x.stroke(p) } }
  // rendu « 3D » : ombre et lumière diffuses (flou), reflet spéculaire, lumière de contour, trait fin coloré
  function shade3d(x, p, base, dark, light, lw, o) {
    const O = o * 1.8, B = Math.max(3, o * 1.05)
    x.fillStyle = base; x.fill(p)
    x.save(); x.clip(p); x.filter = `blur(${B}px)`
    let q = new Path2D(); q.rect(-3000, -3000, 6000, 6000); q.addPath(p, new DOMMatrix().translate(-O, -O * .85))
    x.globalCompositeOperation = "multiply"; x.globalAlpha = .85; x.fillStyle = typeof dark === "string" && dark[0] === "#" ? dark : "#9a7a9a"; x.fill(q, "evenodd")
    q = new Path2D(); q.rect(-3000, -3000, 6000, 6000); q.addPath(p, new DOMMatrix().translate(O * .55, O * .5))
    x.globalCompositeOperation = "screen"; x.globalAlpha = .55; x.fillStyle = "#ffffff"; x.fill(q, "evenodd")
    x.filter = `blur(${B * .6}px)`; q = new Path2D(); q.rect(-3000, -3000, 6000, 6000); q.addPath(p, new DOMMatrix().translate(O * .22, O * .2)); x.globalAlpha = .7; x.fill(q, "evenodd")
    x.restore()
    if (lw) { x.lineJoin = "round"; x.lineWidth = Math.max(1.6, lw * .5); x.strokeStyle = "rgba(40,8,30,.9)"; x.stroke(p) } }
  const line = (x, P, col, lw) => { x.beginPath(); P.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = x.lineJoin = "round"; x.stroke() }

  // ===================== LE GRAOULLY =====================
  function graoully(x, o = {}) { MODE = o.style || "bd"
    const RED = "#d3121c", REDD = "#86070f", REDL = "#ff5a4a", GOLD = "#f4c13d", GOLDD = "#b7811c", IVORY = "#f6ecd2", IVD = "#c9b48c", WING = "#9a0b14", WINGD = "#5c050b"
    x.save(); x.lineCap = x.lineJoin = "round"
    if (o.glow) { const g = x.createRadialGradient(-10, -170, 20, -10, -170, 260); g.addColorStop(0, "rgba(255,80,50,.42)"); g.addColorStop(1, "rgba(255,80,50,0)"); x.fillStyle = g; x.fillRect(-300, -460, 600, 470) }
    // ombre au sol
    x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(40, 4, 160, 16, 0, 0, 7); x.fill()
    // aile arrière
    const wing = (sh, el, tips, back, base, dk, veins) => {
      const pts = [sh, el, tips[0]]; for (let i = 1; i < tips.length; i++) { const a = tips[i - 1], b = tips[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; pts.push([mx - dy * .28, my + dx * .28], b) } pts.push(back)
      const p = new Path2D(); p.moveTo(...sh); p.lineTo(...el); p.lineTo(...tips[0]); for (let i = 1; i < tips.length; i++) { const a = tips[i - 1], b = tips[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; p.quadraticCurveTo(mx - dy * .32, my + dx * .32, ...b) } p.quadraticCurveTo((tips.at(-1)[0] + back[0]) / 2 - 10, (tips.at(-1)[1] + back[1]) / 2 + 20, ...back); p.closePath()
      const g = x.createLinearGradient(el[0], el[1], back[0], back[1]); g.addColorStop(0, base); g.addColorStop(1, dk); shade(x, p, g, "rgba(0,0,0,.28)", "rgba(255,255,255,.12)", 4.5, 10)
      tips.forEach(t => line(x, [el, [(el[0] + t[0]) / 2 + 4, (el[1] + t[1]) / 2 + 3], t], veins, 3.2))
      line(x, [sh, el], INK, 9); line(x, [sh, el], base, 4.5); x.beginPath(); x.moveTo(el[0] - 4, el[1]); x.quadraticCurveTo(el[0] + 2, el[1] - 22, el[0] - 10, el[1] - 26); x.lineTo(el[0] + 6, el[1] - 4); x.closePath(); x.fillStyle = IVORY; x.fill(); x.lineWidth = 2.5; x.strokeStyle = INK; x.stroke() }
    wing([40, -196], [150, -262], [[222, -286], [256, -224], [242, -160], [196, -118]], [92, -132], WING, WINGD, "rgba(40,0,5,.55)")
    // queue
    const tailC = chain(bez([70, -70], [150, -70], [205, -30], [180, 2]), bez([180, 2], [160, 22], [60, 18], [-10, 8]))
    const tail = taper(tailC, t => 52 * (1 - t) + 7)
    // pointes dorsales de la queue
    tailC.forEach((c, i) => { if (i % 5 || i < 3 || i > tailC.length - 6) return; const [ox, oy] = tail.R[i], dx = ox - c[0], dy = oy - c[1], n = Math.hypot(dx, dy) || 1, s = 14 * (1 - i / tailC.length) + 6
      const p = P2([[ox - dy / n * s * .55, oy + dx / n * s * .55], [ox + dx / n * s * 1.4, oy + dy / n * s * 1.4], [ox + dy / n * s * .55, oy - dx / n * s * .55]], false); shade(x, p, GOLD, GOLDD, null, 2.6, 4) })
    shade(x, P2(tail.poly), RED, REDD, REDL, 4.5, 10)
    const end = tailC.at(-1); shade(x, P2([[end[0] + 8, end[1] - 4], [end[0] - 30, end[1] - 20], [end[0] - 42, end[1] + 2], [end[0] - 30, end[1] + 18], [end[0] + 6, end[1] + 6]], false), RED, REDD, null, 4, 6)
    // patte arrière lointaine
    // corps
    const body = P2([[-38, -196], [8, -222], [66, -200], [98, -138], [96, -66], [58, -22], [-8, -24], [-50, -66], [-62, -128]])
    shade(x, body, RED, REDD, REDL, 5, 14)
    x.save(); x.clip(body); x.globalAlpha = .22; for (let j = -230; j < 0; j += 13) for (let i = -70; i < 110; i += 16) { const a = i + (j / 13 % 2) * 8; x.beginPath(); x.arc(a, j, 7, .15 * Math.PI, .85 * Math.PI); x.strokeStyle = "#3a0005"; x.lineWidth = 1.6; x.stroke() } x.restore()
    // plastron (écailles ventrales)
    const belly = P2([[-30, -188], [-2, -196], [6, -150], [10, -96], [-2, -44], [-30, -40], [-50, -76], [-54, -130], [-46, -172]])
    x.save(); x.clip(body); shade(x, belly, GOLD, GOLDD, "rgba(255,255,255,.35)", 3.2, 7)
    x.clip(belly); for (let k = 0; k < 9; k++) { const yy = -186 + k * 17; line(x, [[-60, yy + 4], [-24, yy + 9], [14, yy - 2]], GOLDD, 2.6) } x.restore()
    // cuisse et patte avant (au sol)
    shade(x, P2([[20, -112], [70, -110], [92, -70], [78, -34], [36, -30], [14, -62]]), RED, REDD, REDL, 4.5, 9)
    const foot = P2([[70, -46], [74, -12], [40, 0], [0, 2], [-18, -6], [6, -20], [36, -40]]); shade(x, foot, RED, REDD, REDL, 4.2, 7)
    for (const [a, b] of [[-14, -4], [0, 2], [16, 4]]) { const p = new Path2D(); p.moveTo(a + 6, b - 7); p.quadraticCurveTo(a - 10, b - 6, a - 16, b + 4); p.quadraticCurveTo(a - 4, b + 2, a + 8, b + 2); p.closePath(); shade(x, p, IVORY, IVD, null, 2.4, 3) }
    // bras levé, griffes en avant
    const arm = taper(chain(bez([-14, -162], [-40, -146], [-58, -122], [-60, -106]), bez([-60, -106], [-66, -116], [-82, -126], [-98, -132])), t => 36 - t * 14)
    shade(x, P2(arm.poly), RED, REDD, REDL, 4, 7)
    ;[[-112, -154], [-124, -136], [-118, -114]].forEach(([a, b], i) => { const h = [-98, -138 + i * 7], p = new Path2D(); p.moveTo(h[0] + 2, h[1] - 5); p.quadraticCurveTo((h[0] + a) / 2 - 2, (h[1] + b) / 2 - 8, a, b); p.quadraticCurveTo((h[0] + a) / 2 + 4, (h[1] + b) / 2 + 2, h[0] + 2, h[1] + 6); p.closePath(); shade(x, p, IVORY, IVD, null, 2.4, 3) })
    // cou
    const neckC = bez([0, -192], [-10, -232], [-40, -258], [-70, -282]), neck = taper(neckC, t => 66 - t * 26)
    neckC.forEach((c, i) => { if (i % 4 || i > neckC.length - 3) return; const [ox, oy] = neck.R[i], dx = ox - c[0], dy = oy - c[1], n = Math.hypot(dx, dy) || 1, s = 13
      shade(x, P2([[ox - dy / n * s * .6, oy + dx / n * s * .6], [ox + dx / n * s * 1.5, oy + dy / n * s * 1.5], [ox + dy / n * s * .6, oy - dx / n * s * .6]], false), GOLD, GOLDD, null, 2.6, 4) })
    ;[[8, -212], [40, -210], [70, -192], [90, -158]].forEach(([a, b], i) => { const s = 16 - i * 1.5, ang = -1.9 + i * .45, nx = Math.cos(ang), ny = Math.sin(ang)
      shade(x, P2([[a - ny * s * .6, b + nx * s * .6], [a + nx * s * 1.5, b + ny * s * 1.5], [a + ny * s * .6, b - nx * s * .6]], false), GOLD, GOLDD, null, 2.6, 4) })
    shade(x, P2(neck.poly), RED, REDD, REDL, 4.5, 10)
    x.save(); x.clip(P2(neck.poly)); for (let k = 2; k < neckC.length - 2; k += 3) { const [a, b] = neck.L[k], [c, d] = neckC[k]; line(x, [[a, b], [(a + c) / 2 + 4, (b + d) / 2 + 2]], GOLD, 5) } x.restore()
    // tête
    const H = [-78, -294]
    // feu
    if (o.fire !== false) { const fx = -150, fy = -262, FL = o.fireLen || 1
      const flame = (len, wid, col, ox = 0) => { const p = new Path2D(); p.moveTo(fx + ox, fy - 4); p.bezierCurveTo(fx - len * .3, fy - wid * .9, fx - len * .7, fy - wid * .5, fx - len, fy - wid * .15 - 8); p.bezierCurveTo(fx - len * .82, fy - 2, fx - len * .9, fy + wid * .2, fx - len * .78, fy + wid * .55); p.bezierCurveTo(fx - len * .55, fy + wid * .35, fx - len * .3, fy + wid * .6, fx + ox, fy + 6); p.closePath(); x.fillStyle = col; x.fill(p); return p }
      x.save(); x.shadowColor = "#ff6a2a"; x.shadowBlur = 26; const outer = flame(150 * FL, 70, "#e8341c"); x.restore(); x.lineWidth = 3.5; x.strokeStyle = INK; x.stroke(outer)
      flame(122 * FL, 50, "#ff8a1e", -4); flame(92 * FL, 32, "#ffd23d", -8); flame(56 * FL, 16, "#fff6d0", -10)
      for (let k = 0; k < 9; k++) { const a = fx - 40 * FL - (k * 37 % 120) * FL, b = fy - 46 + (k * 53 % 90); x.beginPath(); x.arc(a, b, 2 + (k % 3), 0, 7); x.fillStyle = k % 2 ? "#ffd23d" : "#ff8a1e"; x.fill() } }
    // mâchoire inférieure + gueule
    shade(x, P2([[-74, -270], [-112, -272], [-150, -262], [-152, -252], [-122, -246], [-80, -252]]), "#5a0710", null, null, 0)
    const jaw = P2([[-70, -268], [-108, -266], [-146, -258], [-150, -250], [-120, -242], [-82, -248], [-66, -256]]); shade(x, jaw, RED, REDD, null, 4, 6)
    for (let k = 0; k < 4; k++) shade(x, P2([[-140 + k * 15, -257], [-130 + k * 15, -258], [-135 + k * 15, -268]], false), IVORY, null, null, 1.8)
    // crâne et museau
    const head = P2([[-48, -300], [-58, -322], [-92, -326], [-128, -312], [-160, -300], [-166, -287], [-152, -276], [-112, -280], [-74, -270], [-48, -282]])
    // cornes
    const horn = (b0, c1, c2, tip, w0) => { const C = bez(b0, c1, c2, tip, 20), t = taper(C, u => w0 * (1 - u) + 1.5); shade(x, P2(t.poly), IVORY, IVD, null, 3.4, 5); for (let i = 4; i < 18; i += 4) line(x, [t.L[i], t.R[i]], IVD, 1.6) }
    horn([-60, -318], [-40, -346], [-10, -356], [12, -344], 18); horn([-78, -322], [-66, -356], [-40, -376], [-18, -372], 16)
    // collerette
    shade(x, P2([[-50, -300], [-22, -318], [-30, -296], [-12, -298], [-34, -280], [-20, -276], [-50, -270]], false), GOLD, GOLDD, null, 3, 4)
    shade(x, head, RED, REDD, REDL, 4.5, 10)
    for (let k = 0; k < 4; k++) shade(x, P2([[-146 + k * 17, -279], [-136 + k * 17, -279], [-141 + k * 17, -268]], false), IVORY, null, null, 1.8)
    // narine, arcade, oeil
    x.beginPath(); x.ellipse(-152, -295, 4.5, 2.4, -.3, 0, 7); x.fillStyle = INK; x.fill()
    line(x, [[-74, -312], [-96, -318], [-112, -306]], INK, 5.5)
    const eye = P2([[-82, -306], [-92, -309], [-104, -303], [-94, -298]]); shade(x, eye, "#ffe14d", "#d48a0c", null, 2.6, 3)
    x.beginPath(); x.ellipse(-93, -303.5, 1.6, 4.3, 0, 0, 7); x.fillStyle = INK; x.fill(); x.beginPath(); x.arc(-96, -306, 1.4, 0, 7); x.fillStyle = "#fff"; x.fill()
    line(x, [[-120, -288], [-150, -283]], "rgba(60,0,8,.6)", 2)
    // aile avant
    wing([22, -196], [96, -310], [[150, -362], [196, -312], [204, -236], [164, -176]], [62, -150], RED, "#a80a14", "rgba(80,0,10,.6)")
    x.restore() }

  // ===================== TEMPLE DU DONON =====================
  function donon(x, o = {}) { MODE = o.style || "bd"
    x.save(); x.lineJoin = x.lineCap = "round"
    const ST = "#f1e0cc", STM = "#d8bea3", STD = "#a98872", ROCK = "#c98068", ROCKD = "#8e4c3c", ROCKL = "#e8ab8f", MOSS = "#4f9a52", MOSSD = "#2e6a3a"
    if (o.glow) { const g = x.createRadialGradient(0, -150, 20, 0, -150, 260); g.addColorStop(0, "rgba(255,236,190,.5)"); g.addColorStop(1, "rgba(255,236,190,0)"); x.fillStyle = g; x.fillRect(-300, -420, 600, 430) }
    const DX = .58, DY = -.36, sk = (px, py, d) => [px + d * DX, py + d * DY]
    // sapins à l'arrière
    const fir = (cx, by, h, c1, c2) => { for (let t = 3; t >= 0; t--) { const top = by - h + t * h * .2, bot = top + h * .38, hw = h * (.16 + t * .08); shade(x, P2([[cx, top], [cx + hw, bot], [cx + hw * .3, bot - 4], [cx - hw * .3, bot - 4], [cx - hw, bot]], false), c1, c2, null, 3, 5) } }
    fir(-150, -40, 120, "#2c7a52", "#17533a"); fir(-118, -30, 90, "#358a5c", "#1b5c40"); fir(170, -46, 130, "#2c7a52", "#17533a"); fir(140, -34, 96, "#358a5c", "#1b5c40")
    // rocher de grès (strates)
    const rock = P2([[-176, 2], [-150, -42], [-96, -66], [-20, -74], [70, -80], [150, -66], [182, -30], [176, 4]])
    shade(x, rock, ROCK, ROCKD, ROCKL, 4.5, 14)
    x.save(); x.clip(rock); for (let k = 0; k < 5; k++) { const yy = -60 + k * 14; line(x, [[-190, yy + 6], [-80, yy - 2 + k], [20, yy + 4], [120, yy - 3], [200, yy + 5]], "rgba(110,50,40,.55)", 2.2) }
    for (const [a, b] of [[-90, -40], [40, -30], [110, -50]]) line(x, [[a, b], [a + 6, b + 14], [a + 2, b + 26]], "rgba(90,40,30,.6)", 2)
    x.restore()
    // mousse et herbes
    for (const [a, b, r] of [[-130, -48, 16], [-60, -66, 12], [120, -64, 14], [160, -40, 10]]) shade(x, P2([[a - r, b + 4], [a - r * .6, b - r * .5], [a, b - r * .7], [a + r * .7, b - r * .4], [a + r, b + 4]]), MOSS, MOSSD, "rgba(255,255,255,.18)", 2.6, 4)
    // emmarchement (3 marches)
    const F = 172, D = 96, L0 = -96
    const box = (l, y, w, h, d, cTop, cFront, cSide) => { const A = [l, y], B = [l + w, y], Cc = [l + w, y - h], Dd = [l, y - h]
      shade(x, P2([B, sk(...B, d), sk(...Cc, d), Cc], false), cSide, null, null, 3)
      shade(x, P2([Dd, Cc, sk(...Cc, d), sk(...Dd, d)], false), cTop, null, null, 3)
      shade(x, P2([A, B, Cc, Dd], false), cFront, null, null, 3) }
    let y = -74; for (let s = 0; s < 3; s++) { box(L0 - 20 + s * 8, y, F + 40 - s * 16, 10, D + 28 - s * 10, ST, STM, STD); y -= 10 }
    const base = y, l = L0, w = F, d = D, colH = 104
    // mur du fond (cella) et colonnes latérales
    shade(x, P2([sk(l + 8, base, d * .55), sk(l + w - 8, base, d * .55), sk(l + w - 8, base - colH, d * .55), sk(l + 8, base - colH, d * .55)], false), "#6c4f61", null, null, 2.5)
    const door = [sk(l + w / 2 - 18, base, d * .55), sk(l + w / 2 + 18, base, d * .55), sk(l + w / 2 + 18, base - 62, d * .55), sk(l + w / 2 - 18, base - 62, d * .55)]; shade(x, P2(door, false), "#2a1726", null, null, 2.5)
    const column = (cx, cy, r, h, depthShade) => {
      const g = x.createLinearGradient(cx - r, 0, cx + r, 0); g.addColorStop(0, "#fff7ea"); g.addColorStop(.35, ST); g.addColorStop(1, depthShade ? STD : "#bb9a82")
      shade(x, P2([[cx - r - 3, cy], [cx + r + 3, cy], [cx + r + 3, cy - 6], [cx - r - 3, cy - 6]], false), STM, null, null, 2.4)
      shade(x, P2([[cx - r, cy - 6], [cx + r, cy - 6], [cx + r * .86, cy - h + 12], [cx - r * .86, cy - h + 12]], false), g, null, null, 2.8)
      for (let k = -2; k <= 2; k++) line(x, [[cx + k * r * .38, cy - 9], [cx + k * r * .33, cy - h + 15]], "rgba(120,90,70,.45)", 1.3)
      shade(x, P2([[cx - r * .9, cy - h + 12], [cx + r * .9, cy - h + 12], [cx + r * 1.25, cy - h + 5], [cx - r * 1.25, cy - h + 5]], false), ST, null, null, 2.4)
      shade(x, P2([[cx - r * 1.4, cy - h + 5], [cx + r * 1.4, cy - h + 5], [cx + r * 1.4, cy - h], [cx - r * 1.4, cy - h]], false), STM, null, null, 2.4) }
    for (const t of [.85, .55, .25]) { const [cx, cy] = sk(l + w - 12, base, d * t); column(cx, cy, 8.5, colH, true) }
    for (let k = 0; k < 4; k++) column(l + 14 + k * (w - 28) / 3, base, 10, colH, false)
    // entablement
    const eT = base - colH, eH = 26
    shade(x, P2([[l + w, eT], sk(l + w, eT, d), sk(l + w, eT - eH, d), [l + w, eT - eH]], false), STD, null, null, 3)
    shade(x, P2([[l - 4, eT], [l + w + 4, eT], [l + w + 4, eT - eH], [l - 4, eT - eH]], false), ST, null, null, 3)
    line(x, [[l - 4, eT - 10], [l + w + 4, eT - 10]], STD, 2)
    for (let k = 0; k < 7; k++) { const a = l + 8 + k * (w - 10) / 6; x.fillStyle = "rgba(140,105,85,.55)"; x.fillRect(a, eT - 23, 7, 11) }
    // fronton et toit
    const pT = eT - eH, apex = [l + w / 2, pT - 46]
    shade(x, P2([apex, sk(...apex, d), sk(l + w + 8, pT, d), [l + w + 8, pT]], false), "#b5735e", null, null, 3)
    x.save(); x.clip(P2([apex, sk(...apex, d), sk(l + w + 8, pT, d), [l + w + 8, pT]], false)); for (let k = 1; k < 7; k++) { const t = k / 7; line(x, [[apex[0] + (l + w + 8 - apex[0]) * t, apex[1] + (pT - apex[1]) * t], sk(apex[0] + (l + w + 8 - apex[0]) * t, apex[1] + (pT - apex[1]) * t, d)], "rgba(80,35,25,.5)", 2) } x.restore()
    shade(x, P2([[l - 10, pT], [l + w + 10, pT], apex], false), ST, null, null, 3.2)
    shade(x, P2([[l + 12, pT - 6], [l + w - 12, pT - 6], [apex[0], apex[1] + 15]], false), STM, null, null, 2)
    line(x, [[l - 10, pT], [apex[0], apex[1] - 1], [l + w + 10, pT]], INK, 4)
    // acrotères
    for (const [a, b] of [[l - 8, pT], apex, [l + w + 8, pT]]) shade(x, P2([[a - 6, b], [a + 6, b], [a, b - 12]], false), ST, null, null, 2.2)
    x.restore() }

  return { graoully, donon }
})()
