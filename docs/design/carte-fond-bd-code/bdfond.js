// Fond de carte dessiné en code, esprit BD : encrage noir épais, hachures, aplats, aucune IA.
function bdFond(x, W, H) {
  const INK = "#0f0b1e"; let seed = 20261111; const R = () => (seed = seed * 16807 % 2147483647) / 2147483647
  x.save(); x.lineJoin = x.lineCap = "round"
  // ciel
  let g = x.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, "#0d0826"); g.addColorStop(.42, "#2a1660"); g.addColorStop(.66, "#5a2a8a"); g.addColorStop(.82, "#b4508e"); g.addColorStop(1, "#f09a62"); x.fillStyle = g; x.fillRect(0, 0, W, H)
  // trame de points (halftone) en haut
  for (let y = 6; y < 300; y += 9) for (let xx = (y / 9 % 2) * 4.5; xx < W; xx += 9) { const r = 1.6 * (1 - y / 300); if (r > .2) { x.beginPath(); x.arc(xx, y, r, 0, 7); x.fillStyle = "rgba(160,120,255,.35)"; x.fill() } }
  // étoiles
  for (let i = 0; i < 70; i++) { const sx = R() * W, sy = R() * 420, s = R() < .15 ? 6 : 1.6; x.fillStyle = "rgba(255,255,255," + (.5 + R() * .5) + ")"; if (s > 2) { x.beginPath(); x.moveTo(sx, sy - s); x.lineTo(sx + 1.2, sy - 1.2); x.lineTo(sx + s, sy); x.lineTo(sx + 1.2, sy + 1.2); x.lineTo(sx, sy + s); x.lineTo(sx - 1.2, sy + 1.2); x.lineTo(sx - s, sy); x.lineTo(sx - 1.2, sy - 1.2); x.closePath(); x.fill() } else { x.beginPath(); x.arc(sx, sy, s * .7, 0, 7); x.fill() } }
  // lune
  x.beginPath(); x.arc(720, 128, 26, 0, 7); x.fillStyle = "#fff4c8"; x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke(); x.beginPath(); x.arc(732, 120, 24, 0, 7); x.fillStyle = "#1a0e40"; x.fill()
  const hatch = (clip, x0, y0, x1, y1, step, col, lw) => { x.save(); clip(); x.clip(); x.strokeStyle = col; x.lineWidth = lw; for (let k = x0 - 400; k < x1; k += step) { x.beginPath(); x.moveTo(k, y1); x.lineTo(k + (y1 - y0) * .6, y0); x.stroke() } x.restore() }
  // crêtes lointaines (3 plans)
  const ridge = (base, amp, f, ph, fill, lw, hcol) => {
    const pts = []; for (let X = -10; X <= W + 10; X += 6) pts.push([X, base - amp * (.55 + .45 * Math.sin(X / f + ph)) - amp * .25 * Math.sin(X / (f * .37) + ph * 2)])
    const shape = () => { x.beginPath(); x.moveTo(-10, H); pts.forEach(([a, b]) => x.lineTo(a, b)); x.lineTo(W + 10, H); x.closePath() }
    shape(); x.fillStyle = fill; x.fill()
    hatch(() => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b + 18) : x.moveTo(a, b + 18)); for (let i = pts.length - 1; i >= 0; i--) x.lineTo(pts[i][0], pts[i][1] + 46); x.closePath() }, 0, base - amp, W, base + 60, 7, hcol, 1.1)
    x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.lineWidth = lw; x.strokeStyle = INK; x.stroke()
    return pts }
  ridge(560, 150, 95, 1.2, "#3a2470", 2.4, "rgba(15,11,30,.35)")
  // frontales sur la crête du milieu
  const mid = ridge(640, 130, 70, 3.1, "#2a1a58", 2.8, "rgba(15,11,30,.4)")
  for (let i = 8; i < mid.length - 8; i += 9) { const [a, b] = mid[i]; x.beginPath(); x.arc(a, b + 10, 1.8, 0, 7); x.fillStyle = "#fff6a0"; x.fill(); x.beginPath(); x.arc(a, b + 10, 5, 0, 7); x.fillStyle = "rgba(255,246,160,.18)"; x.fill() }
  // brume
  for (const [y, a] of [[700, .5], [760, .4]]) { x.beginPath(); x.moveTo(-10, y); for (let X = 0; X <= W + 20; X += 40) x.quadraticCurveTo(X + 20, y - 18 - R() * 14, X + 40, y); x.lineTo(W + 10, y + 70); x.lineTo(-10, y + 70); x.closePath(); x.fillStyle = `rgba(190,160,240,${a * .45})`; x.fill() }
  ridge(780, 110, 55, 5.0, "#1d123f", 3.2, "rgba(0,0,0,.4)")
  // sapins
  const pine = (cx, by, h, w, dark, light) => {
    const tiers = 6; for (let t = 0; t < tiers; t++) {
      const top = by - h + t * h / (tiers + 1), bot = top + h / (tiers - 1) * .95, hw = w * (.25 + .75 * (t + 1) / tiers) / 2
      const pts = [[cx, top]]; const n = 7
      for (let k = 0; k <= n; k++) { const xx = cx + hw - 2 * hw * k / n; pts.push([xx, bot + (k % 2 ? -6 : 3) * (h / 300)]) }
      const sh = () => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath() }
      sh(); x.fillStyle = dark; x.fill()
      x.save(); sh(); x.clip(); x.beginPath(); x.moveTo(cx, top); x.lineTo(cx - hw, bot); x.lineTo(cx - hw * .2, bot); x.closePath(); x.fillStyle = light; x.fill(); x.restore()
      hatch(sh, cx, top, cx + hw, bot, 4.2, "rgba(0,0,0,.45)", 1); x.save(); sh(); x.clip(); x.fillStyle = "rgba(0,0,0,0)"; x.restore()
      sh(); x.lineWidth = Math.max(2, h / 110); x.strokeStyle = INK; x.stroke() }
    x.fillStyle = "#3b2414"; x.fillRect(cx - w * .04, by - 2, w * .08, h * .08); x.lineWidth = 2; x.strokeStyle = INK; x.strokeRect(cx - w * .04, by - 2, w * .08, h * .08) }
  const far = [], near = []
  for (let i = 0; i < 9; i++) far.push([R() * 150 + 10, 820 + R() * 60, 150 + R() * 70], [W - 160 + R() * 150, 820 + R() * 60, 150 + R() * 70])
  far.sort((a, b) => a[1] - b[1]).forEach(([cx, by, h]) => pine(cx, by, h, h * .48, "#16392e", "#22584a"))
  ;[[48, 1010, 470], [150, 1040, 330], [W - 50, 1015, 480], [W - 150, 1045, 320]].forEach(([cx, by, h]) => pine(cx, by, h, h * .5, "#1b4a37", "#2f7a55"))
  // sol + sentier
  x.beginPath(); x.moveTo(-10, H); x.lineTo(-10, 960); x.quadraticCurveTo(W / 2, 900, W + 10, 965); x.lineTo(W + 10, H); x.closePath(); x.fillStyle = "#1a2a1c"; x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke()
  x.beginPath(); x.moveTo(W / 2 - 20, 915); x.quadraticCurveTo(W / 2 - 80, 1010, W / 2 - 230, H + 10); x.lineTo(W / 2 + 210, H + 10); x.quadraticCurveTo(W / 2 + 40, 1010, W / 2 + 18, 915); x.closePath(); x.fillStyle = "#5a3a22"; x.fill(); x.lineWidth = 3; x.stroke()
  hatch(() => { x.beginPath(); x.moveTo(W / 2 - 20, 915); x.quadraticCurveTo(W / 2 - 80, 1010, W / 2 - 230, H + 10); x.lineTo(W / 2 - 60, H + 10); x.quadraticCurveTo(W / 2 - 20, 1010, W / 2, 915); x.closePath() }, 0, 900, W, H, 6, "rgba(0,0,0,.35)", 1.2)
  x.beginPath(); x.ellipse(W / 2 + 40, 1080, 60, 14, -.1, 0, 7); x.fillStyle = "#6c3fb0"; x.fill(); x.lineWidth = 2.5; x.stroke(); x.beginPath(); x.ellipse(W / 2 + 30, 1077, 30, 4, -.1, 0, 7); x.fillStyle = "rgba(255,255,255,.35)"; x.fill()
  // rochers
  const rock = (cx, cy, s) => { const n = 8, pts = []; for (let k = 0; k < n; k++) { const a = Math.PI + k / (n - 1) * Math.PI; pts.push([cx + Math.cos(a) * s * (1 + R() * .2), cy + Math.sin(a) * s * .7 * (1 + R() * .2)]) } const sh = () => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath() }; sh(); x.fillStyle = "#4a4a5e"; x.fill(); hatch(sh, cx, cy - s, cx + s, cy, 4, "rgba(0,0,0,.4)", 1); sh(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke() }
  rock(250, 990, 34); rock(620, 985, 40); rock(110, 1070, 50); rock(760, 1075, 46)
  // touffes d'herbe
  for (let i = 0; i < 40; i++) { const gx = R() * W, gy = 960 + R() * 200; if (Math.abs(gx - W / 2) < 120) continue; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(gx, gy); x.quadraticCurveTo(gx + k * 3, gy - 8, gx + k * 6, gy - 14 - R() * 6); x.strokeStyle = R() < .5 ? "#c6e536" : "#5fa84a"; x.lineWidth = 1.6; x.stroke() } }
  x.restore()
}
