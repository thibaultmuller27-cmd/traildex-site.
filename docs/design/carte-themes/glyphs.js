// Logo DNF Cards « gaming » : lettres en blocs à pans coupés, 100 % vectoriel (polygones), sans police.
const DNFLOGO = (() => {
  const G = {
    D: [[[0,0],[3,0],[4,1],[4,5],[3,6],[0,6]], [[1,1],[2.6,1],[3,1.4],[3,4.6],[2.6,5],[1,5]]],
    N: [[[0,6],[0,0],[1.1,0],[3,3.9],[3,0],[4,0],[4,6],[2.9,6],[1,2.1],[1,6]]],
    F: [[[0,0],[4,0],[4,1],[1,1],[1,2.5],[3.2,2.5],[3.2,3.5],[1,3.5],[1,6],[0,6]]],
    C: [[[1,0],[4,0],[4,1],[1.4,1],[1,1.4],[1,4.6],[1.4,5],[4,5],[4,6],[1,6],[0,5],[0,1]]],
    A: [[[0,6],[0,1],[1,0],[3,0],[4,1],[4,6],[3,6],[3,4.2],[1,4.2],[1,6]], [[1,1.4],[1.4,1],[2.6,1],[3,1.4],[3,3.2],[1,3.2]]],
    R: [[[0,0],[3,0],[4,1],[4,2.6],[3.3,3.4],[4,6],[2.9,6],[2.3,3.6],[1,3.6],[1,6],[0,6]], [[1,1],[2.6,1],[3,1.4],[3,2.3],[2.7,2.6],[1,2.6]]],
    S: [[[1,0],[4,0],[4,1],[1.4,1],[1,1.4],[1,2.1],[1.4,2.5],[3,2.5],[4,3.5],[4,5],[3,6],[0,6],[0,5],[2.6,5],[3,4.6],[3,3.9],[2.6,3.5],[1,3.5],[0,2.5],[0,1]]],
  }
  const SK = .2, H = 9.42, WD = 13.8
  const sk = ([a, b]) => [a + SK * (H - b), b]
  function word(t, k, gap, ox, oy) { const out = []; let cx = ox; for (const ch of t) { out.push(G[ch].map(r => r.map(([a, b]) => sk([cx + a * k, oy + b * k])))); cx += 4 * k + gap } return out }
  const K = .42
  const dnf = word("DNF", 1, .9, 0, 0), cards = word("CARDS", K, (WD - 20 * K) / 4, 0, 6.9)
  const sc = [15.0, -.25], sr = 1.05, si = .3
  const spark = [[0,-sr],[si,-si],[sr,0],[si,si],[0,sr],[-si,si],[-sr,0],[-si,-si]].map(([a, b]) => sk([sc[0] + a, sc[1] + b]))
  const SH = .34 // décalage de l'ombre
  const all = [...dnf.flat(2), ...cards.flat(2), ...spark]
  const B = { x0: Math.min(...all.map(p => p[0])), x1: Math.max(...all.map(p => p[0])) + SH, y0: Math.min(...all.map(p => p[1])), y1: Math.max(...all.map(p => p[1])) }
  const d = (rings, dx = 0, dy = 0) => rings.map(r => "M" + r.map(([a, b]) => (a + dx).toFixed(3) + " " + (b + dy).toFixed(3)).join("L") + "Z").join("")
  const COL = { dnf: "#c6e536", cards: "#ffffff", shadow: "#7a2cff", spark: "#1fd6a0" }
  function parts(c = {}) { c = { ...COL, ...c }; const out = []
    if (c.shadow) dnf.forEach(g => out.push([d(g, SH, SH), c.shadow]))
    dnf.forEach(g => out.push([d(g), c.dnf])); if (c.cards) cards.forEach(g => out.push([d(g), c.cards])); if (c.spark) out.push([d([spark]), c.spark]); return out }
  // dessin sur un canvas : x, y = coin haut-gauche, w = largeur voulue
  function draw(ctx, x, y, w, c) { const s = w / (B.x1 - B.x0); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-B.x0, -B.y0); for (const [p, col] of parts(c)) { ctx.fillStyle = col; ctx.fill(new Path2D(p), "evenodd") } ctx.restore(); return w * (B.y1 - B.y0) / (B.x1 - B.x0) }
  function svg(c, o = {}) { const pad = o.pad ?? .6, bw = B.x1 - B.x0 + 2 * pad, bh = B.y1 - B.y0 + 2 * pad
    const body = parts(c).map(([p, col]) => `<path fill="${col}" fill-rule="evenodd" d="${p}"/>`).join("\n")
    const bg = o.bg ? `<rect x="${B.x0 - pad}" y="${B.y0 - pad}" width="${bw}" height="${bh}" rx="${o.rx ?? 0}" fill="${o.bg}"/>\n` : ""
    return { w: bw, h: bh, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(B.x0 - pad).toFixed(3)} ${(B.y0 - pad).toFixed(3)} ${bw.toFixed(3)} ${bh.toFixed(3)}">\n<title>DNF Cards</title>\n${bg}${body}\n</svg>\n` } }
  return { draw, svg, B, ratio: (B.y1 - B.y0) / (B.x1 - B.x0) }
})()
