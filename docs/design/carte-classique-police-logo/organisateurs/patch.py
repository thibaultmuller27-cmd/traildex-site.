# Passe une carte « dessin animé » au modèle de référence du 12/11 : police du logo, tracé fin, infos sans doublon, lune + frontales.
import sys, json
f, shadow = sys.argv[1], sys.argv[2]; extra = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []
s = open(f).read()
def rp(a, b, need=True):
    global s
    if s.count(a) != 1:
        if need: raise SystemExit(f"motif introuvable ({s.count(a)}) : {a[:70]}")
        return
    s = s.replace(a, b)
rp('<script src="qr.js"></script>', '<script src="qr.js"></script><script src="glyphs.js"></script>')
rp('''  ctx.fillStyle = C.txt; ctx.font = "800 26px Inter"; ctx.letterSpacing = "6px"; ctx.fillText("DNF CARDS", 42, 58); ctx.letterSpacing = "0px"
  ctx.font = "600 20px 'JetBrains Mono'"; ctx.textAlign = "right"; ctx.fillStyle = C.a; ctx.fillText("◆ " + CFG[DISC].label, W - 42, 58); ctx.textAlign = "left"
  dtext(ctx, CFG[DISC].t1, W / 2, 140, 84, C.txt, -.025); dtext(ctx, CFG[DISC].t2, W / 2, 208, 48, C.a, -.025)
  ctx.font = "500 20px 'JetBrains Mono'"; ctx.textAlign = "center"; ctx.fillStyle = C.txt; ctx.letterSpacing = "3px"; ctx.fillText(CFG[DISC].date, W / 2, 250);''',
'''  DNFLOGO.draw(ctx, 34, 30, 112)
  { let th = 84; while (DNFLOGO.width(CFG[DISC].t1, th) > 520 && th > 40) th -= 4
    DNFLOGO.text(ctx, CFG[DISC].t1, W / 2 - th * .1, 150 - th, th, { align: "center", fill: C.txt, shadow: "%s", stroke: INK })
    let sh = 32; while (DNFLOGO.width(CFG[DISC].t2, sh, 1) > 520 && sh > 18) sh -= 2
    DNFLOGO.text(ctx, CFG[DISC].t2, W / 2 - 4, 176, sh, { align: "center", fill: C.a, stroke: INK, gap: 1 }) }
  ctx.font = "500 20px 'JetBrains Mono'"; ctx.textAlign = "center"; ctx.fillStyle = C.txt; ctx.letterSpacing = "3px"; ctx.fillText(CFG[DISC].date.replace(/ · ALT\\. MAX.*/, ""), W / 2, 250);''' % shadow)
rp('path(); ctx.strokeStyle = INK; ctx.lineWidth = 17; ctx.stroke()', 'path(); ctx.strokeStyle = INK; ctx.lineWidth = 8.5; ctx.stroke()')
rp('ctx.globalAlpha = .35; ctx.lineWidth = 30; ctx.shadowColor = "#bff8ff"; ctx.shadowBlur = 40;', 'ctx.globalAlpha = .22; ctx.lineWidth = 13; ctx.shadowColor = "#bff8ff"; ctx.shadowBlur = 16;')
rp('    ctx.lineWidth = 10; ctx.lineCap = "round"\n    for (let k = 1; k < P.length; k++) { const h = (L[k - 1] / 3.2)', '    ctx.lineWidth = 5; ctx.lineCap = "round"\n    for (let k = 1; k < P.length; k++) { const h = (L[k - 1] / 3.2)')
rp('ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); P.forEach', 'ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); P.forEach')
rp('for (let k = 0; k < 26; k++) { const [x, y] = P[Math.floor(Rs() * P.length)], r = 3 + Rs() * 6;', 'for (let k = 0; k < 10; k++) { const [x, y] = P[Math.floor(Rs() * P.length)], r = 2.5 + Rs() * 3.5;')
rp('ctx.arc(sx, sy + 40, 11, 0, 7); ctx.fill(); ctx.strokeStyle = C.a; ctx.lineWidth = 4; ctx.stroke(); dstar(ctx, ex, ey + 40, 18, "#ffe14d")', 'ctx.arc(sx, sy + 40, 7.5, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); dstar(ctx, ex, ey + 40, 13, "#ffe14d")', False)
rp('  dtext(ctx, CFG[DISC].km, PX + PS / 2, PY + PS + 2, 22, "#fff", -.02, undefined, 5)\n', '')
a = s.index("  st.forEach(([l, v], i) => { const x = 42 + i *"); b = s.index("\n}\nfunction finish")
s = s[:a] + '''  st.forEach(([l, v], i) => { const x = 42 + i * 280; ctx.font = "500 16px 'JetBrains Mono'"; ctx.fillStyle = C.mute; ctx.letterSpacing = "3px"; ctx.fillText(l, x, 1058); ctx.letterSpacing = "0px"; DNFLOGO.text(ctx, v, x, 1072, 32, { fill: i % 2 ? C.a : C.txt, stroke: INK, sw: 5 }) })
  { const nw = DNFLOGO.width(CARD.runner, 26) + 40; ctx.save(); ctx.translate(38, 1128); ctx.beginPath(); [[10, 0], [nw, 0], [nw, 36], [nw - 10, 46], [0, 46], [0, 10]].forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.fillStyle = C.a; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.stroke(); DNFLOGO.text(ctx, CARD.runner, 16, 10, 26, { fill: INK }); ctx.restore() }
  DNFLOGO.text(ctx, "N° " + CARD.number, W - 42, 1144, 17, { align: "right", fill: C.mute })''' + s[b:]
rp('  // little motion lines near the finish\n', '''  // lune et file de frontales
  ctx.beginPath(); ctx.arc(W - 78, 86, 26, 0, 7); ctx.fillStyle = "#fff4c8"; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.arc(W - 78, 86, 24, 0, 7); ctx.clip(); ctx.beginPath(); ctx.arc(W - 64, 78, 23, 0, 7); ctx.fillStyle = K.top; ctx.fill(); ctx.restore()
  for (let i = 0; i < 7; i++) { const x = 250 + i * 34, y = 905 - Math.sin(i / 6 * Math.PI) * 26 + i * 4; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fillStyle = "rgba(255,246,160,.22)"; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = "#fff6a0"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke() }
''')
rp('if (PRINT) { ctx.lineWidth = 3; ctx.strokeStyle = "rgba(170,255,220,.55)"; ctx.beginPath(); ctx.roundRect(14, 14, W - 28, H - 28, 26); ctx.stroke(); return }', 'if (PRINT) return', False)
for a, b in extra: rp(a, b)
open(f, "w").write(s)
