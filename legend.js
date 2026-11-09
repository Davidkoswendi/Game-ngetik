/* legend.js: skill LEGENDARIS "Lubang Hitam", "Akar Merambat", "Last Bet", dan "Dragon Guardian".
   Lubang Hitam dan Akar Merambat menguras 1 lantai tiap detik dari semua musuh. Last Bet (taruhan 4 kata) dan Dragon Guardian (kebal 15 detik) dipakai untuk diri sendiri.
   Dimuat setelah script.js (memakai fungsi bantu yang sama: mk, run, emo, ringAt, shake, ...). */
const LG = { act: new Set(), hole: new Map(), tm: new Set(), iv: new Set(), drn: new Set(), bets: new Map(), dg: new Map(), bet: null, betA: null, rq: 0 };

const lgPos = (sc, el) => { const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height } };
const lgHole = el => { const sc = el.closest && el.closest(".scene"); return (sc && LG.hole.get(sc)) || null };
const lgT = (f, ms) => { const id = setTimeout(() => { LG.tm.delete(id); f() }, ms); LG.tm.add(id); return id };

function lgStop(q) {
  [...LG.act].forEach(a => a.end(q !== false));
  LG.tm.forEach(clearTimeout); LG.tm.clear();
  LG.iv.forEach(clearInterval); LG.iv.clear();
  LG.drn.forEach(clearInterval); LG.drn.clear(); LG.bets.clear(); LG.dg.clear(); LG.bet = null; LG.betA = null;
  document.querySelectorAll(".lgc,.lgt").forEach(x => x.remove());
}

function lgFlash(sc, col, peak) {
  const f = mk(sc, "flash", "background:" + col);
  f.animate([{ opacity: 0 }, { opacity: peak, offset: .15 }, { opacity: 0 }], { duration: 750 }).onfinish = () => f.remove();
}

/* ---------- sisi korban (pemain ini): lantai berkurang 1 tiap detik ---------- */
function lgIncoming(att, a) {
  const s = SK[a.k];
  if (!s || att.id === me.id || over || ended) return;
  lgT(() => {
    if (over || ended) return;
    if (me.dg > Date.now()) { lgDgBlock(); return }
    if (me.sh) { push({ sh: 0 }); if (ST.txr) popup("🛡️ SERANGAN DITANGKIS!"); return }
    lgDrain.am = 0;
    if (s.id === "roots") lockMe(a.k); else lgChip(a.k, s.tk);
    let n = 0;
    const iv = setInterval(() => {
      if (over || ended || n >= s.tk) { clearInterval(iv); LG.iv.delete(iv); LG.drn.delete(iv); return }
      n++; lgDrain();
    }, 1000);
    LG.iv.add(iv); LG.drn.add(iv);
  }, IMP[a.k]);
}

function lgDrain() {
  if (me.dg > Date.now()) return;
  if (!fc) { if (ST.txr && !lgDrain.am) { lgDrain.am = 1; popup("AMAN! Lantai masih kosong") } return }
  fc = Math.max(0, fc - 1);
  SFX.hurt(); push({ floors: fc }); stat(); drawWord(); sync();
  $("fl").animate([{ transform: "scale(1.3)", background: "#c8261a" }, { transform: "none" }], { duration: 600, easing: "ease-out" });
}

function lgChip(k, sec, lbl) {
  const s = SK[k], P = $("pnl");
  P.querySelectorAll(".lgc").forEach(x => x.remove());
  const c = mk(P, "lkc lgc " + s.id, "", "<em>" + s.ic + "</em><span></span><u><b></b></u>"),
    tx = c.querySelector("span"), bar = c.querySelector("b"), end = Date.now() + sec * 1000;
  bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: sec * 1000, easing: "linear", fill: "forwards" });
  c.animate([{ transform: "translateX(-50%) scale(.6)", opacity: 0 }, { transform: "translateX(-50%) scale(1.1)", opacity: 1, offset: .5 }, { transform: "translateX(-50%) scale(1)", opacity: 1 }], { duration: 420, easing: "ease-out" });
  const upd = () => { tx.textContent = (lbl || (s.id === "hole" ? "DIHISAP " : "TERJERAT ")) + (Math.max(0, end - Date.now()) / 1000).toFixed(1) + " dtk" };
  upd();
  const iv = setInterval(() => {
    upd();
    if (Date.now() >= end || !c.isConnected) {
      clearInterval(iv); LG.iv.delete(iv);
      if (c.isConnected) c.animate([{ opacity: 1 }, { opacity: 0, transform: "translateX(-50%) scale(.7)" }], { duration: 260 }).onfinish = () => c.remove();
    }
  }, 100);
  LG.iv.add(iv);
}

/* ---------- dipanggil play() untuk semua orang di room ---------- */
function lgPlay(att, a, ps) {
  const s = SK[a.k], vics = ps.filter(p => p.id !== att.id && !p.fin).map(p => ({ id: p.id, blk: !!(p.sh || p.dg > Date.now()), nm: p.name })),
    dur = IMP[a.k] + s.tk * 1000 + 1600;
  vics.forEach(v => { const t = tws[v.id]; if (t) t.sk = { k: a.k, at: performance.now(), by: att.id === me.id, dur } });
  lgFx(a.k, { sc: $("scene"), M: tws, att: att.id, attName: att.name, vics, mine: att.id === me.id, demo: false });
}

/* ---------- animasi latar menu (demo) ---------- */
function lgDemo(att, all, d, kk, scn) {
  if (LG.act.size) return;
  if (kk == null && Math.random() < .5) { lgDemoSelf(att, d); return }
  const k = kk != null ? kk : 14 + (Math.random() * 2 | 0), s = SK[k], I = IMP[k], vics = all.map(v => ({ id: v.id, blk: !!v.sh, nm: v.name, p: v })),
    dur = I + s.tk * 1000 + 1600;
  vics.forEach(v => { const t = dws[v.id]; if (t) t.sk = { k, at: performance.now(), dur } });
  lgFx(k, { sc: scn || $("sky"), M: dws, att: att.id, attName: att.name, vics, mine: false, demo: true });
  vics.forEach(v => {
    const p = v.p;
    lgT(() => {
      if (!ambient.on) return;
      if (v.blk) { p.sh = 0; tower(p, dws, d); return }
      if (s.id === "roots") p.frz = Date.now() + s.tk * 1000;
      for (let n = 1; n <= s.tk; n++) lgT(() => {
        if (!ambient.on) return;
        const t = dws[p.id];
        p.floors = Math.max(0, Math.min(p.floors, t ? t.n : p.floors) - 1);
        tower(p, dws, d);
      }, n * 1000);
    }, I);
  });
}

/* ---------- kerangka umum efek ---------- */
function lgFx(k, o) {
  const s = SK[k], I = IMP[k], sc = o.sc;
  const A = {
    k, o, tm: [], iv: [], dead: false, off: null, frame: null,
    at(ms, f) { const id = setTimeout(() => { if (!A.dead) f() }, ms); A.tm.push(id) },
    every(ms, f) { const id = setInterval(() => { if (A.dead) return; if (o.demo && !ambient.on) { A.end(true); return } f() }, ms); A.iv.push(id) },
    end(q) {
      if (A.dead) return; A.dead = true;
      A.tm.forEach(clearTimeout); A.iv.forEach(clearInterval); LG.act.delete(A);
      if (A.off) A.off(q);
    }
  };
  LG.act.add(A);
  A.t0 = performance.now();
  SFX.skill(s.id, { I, demo: o.demo, mine: o.mine, far: false, pan: 0 });
  A.meV = !o.demo && o.vics.some(v => v.id === me.id && !v.blk);
  if (!o.demo && (o.mine ? ST.txu : ST.txr)) lgTitle(A, o);
  (k === 14 ? bhFx : rtFx)(A, o, I);
  /* korban yang berpelindung: serangan menabrak perisai */
  A.at(I, () => o.vics.forEach(v => { if (!v.blk) return; const t = o.M[v.id]; if (t && t.el.isConnected) { const g = stackGeo(t); shieldHit(t, g.x + g.w / 2, g.y + g.h * .3) } }));
  A.at(I + s.tk * 1000 + 1500, () => A.end(false));
  lgKick();
}

function lgKick() { if (!LG.rq) LG.rq = requestAnimationFrame(lgRaf) }
function lgRaf(now) {
  LG.rq = 0;
  let any = false;
  LG.act.forEach(a => { if (a.frame) { any = true; if (a.o.demo && !ambient.on) a.end(true); else a.frame(now) } });
  if (any) LG.rq = requestAnimationFrame(lgRaf);
}

/* kartu judul besar khas skill legendaris */
function lgTitle(A, o, sx) {
  const s = SK[A.k], sc = o.sc, W = sc.clientWidth, H = sc.clientHeight;
  const txt = [...s.n].map((c, i) => '<span style="--i:' + i + '">' + (c === " " ? "&nbsp;" : c) + "</span>").join("");
  const sub = sx || (o.mine ? "Semua lawan terkena!" : esc(o.attName || "Lawan") + " menyerang semuanya!");
  const e = mk(sc, "lgt " + s.id, "", '<i class="lgt-rays"></i><small>★ SKILL LEGENDARIS ★</small><em>' + s.ic + "</em><b>" + txt + "</b><p>" + sub + "</p>");
  e.animate([
    { opacity: 0, transform: "translateX(-50%) scale(2.4)", filter: "blur(12px)" },
    { opacity: 1, transform: "translateX(-50%) scale(1)", filter: "blur(0)", offset: .16 },
    { opacity: 1, transform: "translateX(-50%) scale(1.04)", filter: "blur(0)", offset: .8 },
    { opacity: 0, transform: "translateX(-50%) translateY(-30px) scale(.9)", filter: "blur(4px)" }
  ], { duration: 2700, easing: "ease-out" }).onfinish = () => e.remove();
  const cy = H * .22;
  ringAt(sc, W / 2, cy, "gd", 10, 1200); ringAt(sc, W / 2, cy, "gd", 6, 1000, 180);
  for (let i = 0; i < (ST.lite ? 10 : 26); i++) {
    const a = rnd(0, 6.283), d = rnd(80, Math.min(W, 520) * .55);
    run(emo(sc, ["✦", "✧", "⭐", "✨"][i % 4], W / 2, cy, rnd(12, 24)), [
      { transform: "translate(0,0) scale(.3)", opacity: 1 },
      { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d * .7 + "px) scale(1.1) rotate(" + rnd(-180, 180) + "deg)", opacity: 1, offset: .5 },
      { transform: "translate(" + Math.cos(a) * d * 1.25 + "px," + (Math.sin(a) * d * .7 + 60) + "px) scale(.4)", opacity: 0 }
    ], { duration: rnd(1100, 1800), easing: "ease-out" });
  }
}

/* =====================================================================
   LUBANG HITAM
   ===================================================================== */
function bhFx(A, o, I) {
  const s = SK[14], sc = o.sc, W = sc.clientWidth, H = sc.clientHeight, lo = !!ST.lite, M = o.M, tk = s.tk,
    D = Math.round(clp(Math.min(W * .74, H * .54), 150, 470)), hx = Math.round(W / 2), hy = Math.round(Math.max(D * .62, H * .3)),
    tw = sc.querySelector(".towers"), lay = mk(sc, "lg-lay bh-lay");
  sc.insertBefore(lay, tw);
  let st = "";
  for (let i = 0; i < (lo ? 12 : 44); i++) st += '<i style="left:' + rnd(0, 100).toFixed(1) + "%;top:" + rnd(0, 100).toFixed(1) + "%;--z:" + rnd(1, 2.6).toFixed(1) + "px;animation-delay:-" + rnd(0, 3).toFixed(1) + 's"></i>';
  lay.innerHTML = '<div class="bh-sky" style="background:radial-gradient(ellipse 130% 95% at ' + hx + "px " + hy + 'px,rgba(78,16,132,.9) 0,rgba(18,5,52,.88) 34%,rgba(3,0,18,.84) 100%)"></div><div class="bh-st">' + st + "</div>" +
    '<div class="bh-h" style="left:' + hx + "px;top:" + hy + "px;--d:" + D + 'px"><i class="bh-glow"></i><i class="bh-sp"></i><div class="bh-dk"><i></i></div><i class="bh-ph"></i><i class="bh-core"></i><div class="bh-dk f"><i></i></div></div>';
  const sky = lay.querySelector(".bh-sky"), hole = lay.querySelector(".bh-h"), vg = mk(sc, "lg-vig bh");
  LG.hole.set(sc, { x: hx, y: hy, D });
  sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: "forwards", easing: "ease-out" });
  vg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: "forwards" });
  hole.animate([
    { transform: "scale(0) rotate(-260deg)", opacity: 0 },
    { transform: "scale(1.1) rotate(0)", opacity: 1, offset: .72 },
    { transform: "scale(1)", opacity: 1 }
  ], { duration: 1300, fill: "forwards", easing: "cubic-bezier(.2,.8,.3,1)" });
  lgFlash(sc, "#b98cff", .5);
  /* lensa gravitasi, semburan jet, dan lubang yang terus membesar selama 8 detik */
  hole.insertAdjacentHTML("afterbegin", '<i class="bh-lens"></i><i class="bh-lens l2"></i><i class="bh-jet u"></i><i class="bh-jet d"></i>');
  hole.animate([{ scale: "1" }, { scale: "1.22" }], { duration: tk * 1000, delay: 1300, fill: "both", easing: "ease-in" });
  /* gelombang kejut saat lubang terbuka */
  A.at(260, () => { ringAt(lay, hx, hy, "bh", 12, 1300); ringAt(lay, hx, hy, "bh", 8, 1000, 150) });

  const V = o.vics.filter(v => !v.blk && M[v.id] && M[v.id].el.isConnected);
  V.forEach(v => { const t = M[v.id], g = lgPos(sc, t.el); t.el.style.setProperty("--ln", (g.x + g.w / 2 < hx ? 1 : -1) * 3.2 + "deg"); t.el.classList.add("bhv") });

  /* titik cahaya terhisap spiral ke lubang */
  const R0 = Math.max(W, H);
  A.every(lo ? 260 : 100, () => {
    const a0 = rnd(0, 6.283), r0 = rnd(.3, .62) * R0, N = 7, kf = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, r = r0 * Math.pow(1 - u, 1.7) + 4, a = a0 + u * u * 3.2 + u * 1.6;
      kf.push({ transform: "translate(" + f1(hx + Math.cos(a) * r) + "px," + f1(hy + Math.sin(a) * r * .78) + "px) scale(" + f1(1 - u * .85) + ")", opacity: i === 0 || i === N ? 0 : Math.min(1, u * 5) });
    }
    run(mk(lay, "bh-pt"), kf, { duration: rnd(900, 1500), easing: "ease-in" });
  });
  /* garis cahaya memanjang mengikuti spiral hisapan */
  A.every(lo ? 420 : 140, () => {
    const a0 = rnd(0, 6.283), r0 = rnd(.35, .72) * R0, N = 9, kf = [],
      pt = u => { const r = r0 * Math.pow(1 - u, 1.6) + D * .1, a = a0 + u * u * 3.8 + u * 1.4; return { x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r * .78 } };
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = pt(u), q = pt(Math.min(1, u + .03)), ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      kf.push({ transform: "translate(" + f1(p.x) + "px," + f1(p.y) + "px) rotate(" + f1(ang) + "deg) scaleX(" + f1(.5 + u * 3.2) + ")", opacity: i === 0 || i === N ? 0 : Math.min(1, u * 6) });
    }
    run(mk(lay, "bh-sk"), kf, { duration: rnd(1100, 1700), easing: "ease-in" });
  });
  /* serpihan dari menara korban melayang ke lubang */
  A.every(lo ? 650 : 360, () => V.forEach(v => {
    const t = M[v.id]; if (!t || !t.el.isConnected) return;
    const g = lgPos(sc, t.stack), x0 = g.x + g.w / 2 + rnd(-g.w * .4, g.w * .4), y0 = g.y + rnd(0, Math.max(6, g.h * .5)), dx = hx - x0, dy = hy - y0, px = -dy * .18, py = dx * .18;
    run(emo(sc, ["🧱", "▪️", "✦", "🪨"][Math.random() * 4 | 0], x0, y0, rnd(10, 16)), [
      { transform: "translate(0,0) scale(1) rotate(0)", opacity: 0 },
      { transform: "translate(" + (dx * .12) + "px," + (dy * .12 - 14) + "px) scale(1.1)", opacity: 1, offset: .12 },
      { transform: "translate(" + (dx * .55 + px) + "px," + (dy * .55 + py) + "px) scale(.8) rotate(260deg)", opacity: 1, offset: .6 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.05) rotate(620deg)", opacity: 0 }
    ], { duration: rnd(900, 1300), easing: "ease-in" });
  }));

  for (let n = 1; n <= tk; n++) A.at(I + n * 1000, () => {
    SFX.lgTick("hole", { demo: o.demo });
    hole.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.9) saturate(1.5)", offset: .22 }, { filter: "brightness(1)" }], { duration: 700, easing: "ease-out" });
    const pw = n / tk;
    ringAt(lay, hx, hy, "bh", 6 + 6 * pw, 900);
    if (!lo) ringAt(lay, hx, hy, "bh", 9 + 7 * pw, 1200, 120);
    if (n === Math.ceil(tk / 2)) {
      /* lonjakan tengah: lubang mengamuk */
      lgFlash(sc, "#d6b0ff", .5); ringAt(lay, hx, hy, "bh", 15, 1500); ringAt(lay, hx, hy, "bh", 10, 1200, 200);
      sky.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.8) hue-rotate(-22deg)" }, { filter: "brightness(1.2) hue-rotate(-12deg)" }], { duration: 1300, fill: "forwards" });
      if (A.meV) shake(16, 8, 900, sc);
    }
    if (n === tk) ringAt(lay, hx, hy, "bh", 16, 1300);
    V.forEach(v => {
      const t = M[v.id]; if (!t || !t.el.isConnected) return;
      const g = lgPos(sc, t.stack), x0 = g.x + g.w / 2, y0 = g.y + Math.min(g.h * .3, 30), L = Math.hypot(hx - x0, hy - y0), ang = Math.atan2(hy - y0, hx - x0) * 180 / Math.PI;
      run(mk(sc, "bh-bm", "left:" + f1(x0) + "px;top:" + f1(y0) + "px;width:" + f1(L) + "px"), [
        { transform: "rotate(" + ang + "deg) scaleX(0)", opacity: 0 },
        { transform: "rotate(" + ang + "deg) scaleX(1)", opacity: 1, offset: .35 },
        { transform: "rotate(" + ang + "deg) scaleX(1)", opacity: 0 }
      ], { duration: 650, easing: "ease-out" });
    });
    if (A.meV) shake(6, 4, 420, sc);
  });
  A.at(I, () => { if (A.meV) shake(12, 6, 700, sc); ringAt(lay, hx, hy, "bh", 8, 1000) });

  A.at(I + tk * 1000 + 450, () => {
    hole.animate([
      { transform: "scale(1) rotate(0)", opacity: 1 },
      { transform: "scale(1.15) rotate(90deg)", opacity: 1, offset: .4 },
      { transform: "scale(0) rotate(420deg)", opacity: 0 }
    ], { duration: 850, fill: "forwards", easing: "ease-in" });
    sky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    vg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    ringAt(lay, hx, hy, "bh", 8, 900); ringAt(lay, hx, hy, "bh", 14, 1000, 120); lgFlash(sc, "#fff", .5);
    if (A.meV) shake(14, 7, 700, sc);
    for (let i = 0; i < (lo ? 10 : 30); i++) { const a = rnd(0, 6.283), d = rnd(120, Math.min(W, 560) * .7); run(emo(lay, ["✦", "✧", "⭐", "✨"][i % 4], hx, hy, rnd(12, 26)), [{ transform: "translate(0,0) scale(.3)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d * .8 + "px) scale(1.2) rotate(" + rnd(-200, 200) + "deg)", opacity: 1, offset: .5 }, { transform: "translate(" + Math.cos(a) * d * 1.3 + "px," + (Math.sin(a) * d * .8 + 60) + "px) scale(.3)", opacity: 0 }], { duration: rnd(800, 1200), easing: "ease-out" }) }
    V.forEach(v => { const t = M[v.id]; if (t) t.el.classList.remove("bhv") });
  });
  A.off = () => { V.forEach(v => { const t = M[v.id]; if (t) t.el.classList.remove("bhv") }); LG.hole.delete(sc); lay.remove(); vg.remove() };
  A.rel = id => { const i = V.findIndex(v => v.id === id); if (i < 0) return; V.splice(i, 1); const t = M[id]; if (t) t.el.classList.remove("bhv") };
}

/* =====================================================================
   AKAR MERAMBAT
   ===================================================================== */
const LG_MON = '<svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMax meet"><defs>' +
  '<radialGradient id="rtE"><stop offset="0" stop-color="#fffbd0"/><stop offset=".35" stop-color="#ffd23a"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="rtB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12331a"/><stop offset="1" stop-color="#030a05"/></linearGradient></defs>' +
  '<g fill="url(#rtB)" stroke="#2c6a38" stroke-width="2" stroke-linejoin="round">' +
  '<path d="M205 420C220 330 190 260 200 190C208 140 250 110 300 108C350 110 392 140 400 190C410 260 380 330 395 420Z"/>' +
  '<path d="M215 175C170 140 140 90 110 40C140 70 175 100 225 130Z"/><path d="M385 175C430 140 460 90 490 40C460 70 425 100 375 130Z"/>' +
  '<path d="M245 120C230 80 238 40 262 8C262 48 272 80 285 112Z"/><path d="M355 120C370 80 362 40 338 8C338 48 328 80 315 112Z"/>' +
  '<path d="M208 230C150 250 90 290 40 370C70 345 110 320 150 308C130 335 110 365 100 400C130 365 160 335 205 300Z"/>' +
  '<path d="M392 230C450 250 510 290 560 370C530 345 490 320 450 308C470 335 490 365 500 400C470 365 440 335 395 300Z"/></g>' +
  '<g stroke="#3f9150" stroke-width="2" fill="none" opacity=".55"><path d="M250 400C262 330 244 270 252 210"/><path d="M300 410C310 340 296 280 302 220"/><path d="M350 400C340 330 356 270 348 210"/><path d="M232 300C250 280 262 262 280 250"/><path d="M368 300C350 280 338 262 320 250"/></g>' +
  '<g class="rt-face"><path d="M232 176L284 196L270 208Z" fill="#000"/><path d="M368 176L316 196L330 208Z" fill="#000"/>' +
  '<ellipse class="rt-eye" cx="266" cy="198" rx="24" ry="13" fill="url(#rtE)"/><ellipse class="rt-eye" cx="334" cy="198" rx="24" ry="13" fill="url(#rtE)" style="animation-delay:-.4s"/>' +
  '<ellipse cx="266" cy="198" rx="3.2" ry="10" fill="#1b0b00"/><ellipse cx="334" cy="198" rx="3.2" ry="10" fill="#1b0b00"/>' +
  '<path class="rt-mouth" d="M244 252L260 236L274 256L288 234L302 258L316 236L330 256L344 238L356 252C340 288 260 288 244 252Z" fill="#9dff3a" opacity=".6"/></g></svg>';

function rtFx(A, o, I) {
  const s = SK[15], sc = o.sc, W = sc.clientWidth, H = sc.clientHeight, lo = !!ST.lite, M = o.M, tk = s.tk,
    ws = Math.round(clp(Math.min(W * 1.05, H * 1.1), 260, 800)), tw = sc.querySelector(".towers"), lay = mk(sc, "lg-lay rt-lay");
  sc.insertBefore(lay, tw);
  lay.innerHTML = '<div class="rt-sky"></div>' + (lo ? "" : '<i class="rt-fog" style="top:4%"></i><i class="rt-fog" style="top:30%;animation-delay:-5s"></i>') +
    '<div class="rt-mon" style="left:' + Math.round((W - ws) / 2) + "px;width:" + ws + 'px">' + LG_MON + "</div>" +
    '<svg class="rt-tn" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '"></svg>';
  const sky = lay.querySelector(".rt-sky"), mon = lay.querySelector(".rt-mon"), face = lay.querySelector(".rt-face"), tn = lay.querySelector(".rt-tn"), vg = mk(sc, "lg-vig rt");
  sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: "forwards", easing: "ease-out" });
  vg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: "forwards" });
  mon.animate([{ transform: "translateY(45%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 1500, fill: "forwards", easing: "cubic-bezier(.2,.9,.3,1)" });
  lgFlash(sc, "#3dff6a", .35);

  const V = o.vics.filter(v => !v.blk && M[v.id] && M[v.id].el.isConnected), VN = [
    { dir: 1, th0: -1.5, turns: 2.1, hf: .96 }, { dir: -1, th0: 1.6, turns: 1.7, hf: .8 }, { dir: 1, th0: 3, turns: 1.4, hf: .62 }].slice(0, lo ? 2 : 3);
  const mkSvg = (cls, h) => { const e = document.createElementNS(SVGN, "svg"); e.setAttribute("class", "rtw " + cls); e.innerHTML = h; return e };
  const cs = V.map(v => {
    const t = M[v.id], bk = mkSvg("bk", '<path class="o"/><path class="b"/>'), fr = mkSvg("fr", '<path class="o"/><path class="b"/><path class="h"/><path class="t"/>');
    t.el.insertBefore(bk, t.stack); t.el.appendChild(fr);
    tn.insertAdjacentHTML("beforeend", '<g><path class="o" pathLength="1"/><path class="b" pathLength="1"/><path class="h" pathLength="1"/></g>');
    const g = tn.lastElementChild;
    return { v, t, bk, fr, ps: { bo: bk.children[0], bb: bk.children[1], fo: fr.children[0], fb: fr.children[1], fh: fr.children[2], ft: fr.children[3] }, tn: [...g.children], ph: rnd(0, 6), sq: 0 };
  });

  let last = 0;
  A.frame = now => {
    if (now - last < (lo ? 60 : 30)) return;
    const dt = Math.min(100, now - (last || now)); last = now;
    const T = now - A.t0, pr = eo(clp((T - 250) / 1250, 0, 1)) * (A.out ? clp(1 - (now - A.out) / 750, 0, 1) : 1);
    const k = mon.offsetWidth / 600, mx = mon.offsetLeft + 300 * k, my = mon.offsetTop + 300 * k;
    cs.forEach(c => {
      if (!c.t.el.isConnected) return;
      c.sq = Math.max(0, c.sq - dt / 600);
      /* akar besar dari monster ke puncak menara */
      const g = lgPos(sc, c.t.stack), tx = g.x + g.w / 2, ty = g.y + 4, bd = tx < mx ? -1 : 1,
        d = "M" + f1(mx) + " " + f1(my) + "C" + f1(mx + (tx - mx) * .3 + Math.sin(now / 500 + c.ph) * 16) + " " + f1(my + 60) + " " + f1(tx - bd * 70) + " " + f1(ty - 70 + Math.cos(now / 430 + c.ph) * 10) + " " + f1(tx) + " " + f1(ty);
      c.tn.forEach((p, i) => { p.setAttribute("d", d); p.setAttribute("stroke-dasharray", "1"); p.setAttribute("stroke-dashoffset", f1(1 - pr)); p.setAttribute("stroke-width", [16 + 6 * c.sq, 11 + 5 * c.sq, 3][i]) });
      /* sulur melilit menara (bagian belakang dan depan digambar di dua lapisan) */
      const sg = stackGeo(c.t), cx = sg.x + sg.w / 2, y0 = sg.y + sg.h + 3, h = Math.max(sg.h + 20, 48), R0 = sg.w / 2 + 2, bw = clp(sg.w * .12, 4, 11) * (1 + .35 * c.sq),
        W0 = c.t.el.clientWidth, H0 = c.t.el.clientHeight;
      [c.bk, c.fr].forEach(e => { e.setAttribute("width", W0); e.setAttribute("height", H0); e.setAttribute("viewBox", "0 0 " + W0 + " " + H0) });
      let F = "", B = "", TH = "";
      VN.forEach((V, vi) => {
        const N = lo ? 30 : 48, P = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N * pr, th = V.th0 + V.dir * V.turns * 6.2832 * u, R = R0 * (1 - .1 * c.sq) + 3 + Math.sin(now / 300 + vi * 2 + u * 9) * 1.4;
          P.push({ x: cx + R * Math.sin(th), y: y0 - h * V.hf * Math.pow(u, .9) + Math.sin(now / 380 + vi + u * 7) * 1.2, f: Math.cos(th) > 0, s: Math.sin(th) });
        }
        let a = 0;
        while (a < N) {
          let b = a; while (b < N && P[b + 1].f === P[a].f) b++;
          const e = Math.min(b + 1, N); let dd = "";
          for (let i = a; i <= e; i++) dd += (i > a ? "L" : "M") + f1(P[i].x) + " " + f1(P[i].y);
          if (P[a].f) F += dd; else B += dd;
          a = b + 1;
        }
        if (!lo) for (let i = 3; i < N; i += 4) if (P[i].f) TH += "M" + f1(P[i].x) + " " + f1(P[i].y) + "l" + f1(P[i].s * 7) + " -4";
      });
      const q = c.ps;
      q.bo.setAttribute("d", B); q.bb.setAttribute("d", B); q.fo.setAttribute("d", F); q.fb.setAttribute("d", F); q.fh.setAttribute("d", F); q.ft.setAttribute("d", TH);
      q.bo.setAttribute("stroke-width", f1(bw + 3)); q.bb.setAttribute("stroke-width", f1(bw)); q.fo.setAttribute("stroke-width", f1(bw + 3)); q.fb.setAttribute("stroke-width", f1(bw)); q.fh.setAttribute("stroke-width", f1(bw * .32));
    });
  };

  /* letusan tanah di dasar tiap menara saat akar muncul */
  A.at(I * .5, () => cs.forEach(c => {
    if (!c.t.el.isConnected) return;
    const g = stackGeo(c.t), cx = g.x + g.w / 2, gy = g.y + g.h;
    ringAt(c.t.el, cx, gy, "lm", 4, 800);
    for (let i = 0; i < (lo ? 4 : 10); i++) run(emo(c.t.el, ["🌿", "🍃", "🪵"][i % 3], cx + rnd(-g.w * .6, g.w * .6), gy, rnd(12, 20)), [
      { transform: "translate(0,0) scale(.4)", opacity: 0 }, { transform: "translate(" + rnd(-30, 30) + "px," + -rnd(30, 80) + "px) scale(1) rotate(" + rnd(-90, 90) + "deg)", opacity: 1, offset: .4 },
      { transform: "translate(" + rnd(-50, 50) + "px," + rnd(0, 20) + "px) scale(.6) rotate(" + rnd(-200, 200) + "deg)", opacity: 0 }], { duration: rnd(800, 1300), easing: "ease-out" });
  }));
  A.at(I, () => { lgFlash(sc, "#5dff4a", .3); if (A.meV) shake(12, 6, 800, sc); face.animate([{ filter: "brightness(1)" }, { filter: "brightness(2.4)" }, { filter: "brightness(1)" }], { duration: 700 }) });

  /* spora hijau naik dan daun berguguran */
  A.every(lo ? 420 : 170, () => {
    const x = rnd(0, W), y = H - rnd(120, 260);
    run(mk(lay, "rt-sp", "left:" + f1(x) + "px;top:" + f1(y) + "px"), [{ transform: "translate(0,0) scale(.4)", opacity: 0 }, { transform: "translate(" + rnd(-30, 30) + "px," + -rnd(60, 200) + "px) scale(1)", opacity: .9, offset: .4 }, { transform: "translate(" + rnd(-60, 60) + "px," + -rnd(160, 340) + "px) scale(.3)", opacity: 0 }], { duration: rnd(1500, 2600), easing: "ease-out" });
  });
  if (!lo) A.every(520, () => run(emo(lay, "🍃", rnd(0, W), -10, rnd(12, 20)), [{ transform: "translate(0,0) rotate(0)", opacity: 0 }, { opacity: .9, offset: .1 }, { transform: "translate(" + rnd(-80, 80) + "px," + H * .8 + "px) rotate(" + rnd(-400, 400) + "deg)", opacity: 0 }], { duration: rnd(2600, 4200), easing: "linear" }));

  for (let n = 1; n <= tk; n++) A.at(I + n * 1000, () => {
    SFX.lgTick("roots", { demo: o.demo });
    mon.animate([{ scale: "1" }, { scale: "1.05" }, { scale: "1" }], { duration: 520, easing: "ease-out" });
    face.animate([{ filter: "brightness(1)" }, { filter: "brightness(2.2)" }, { filter: "brightness(1)" }], { duration: 520 });
    cs.forEach(c => {
      if (!c.t.el.isConnected) return;
      c.sq = 1;
      c.t.stack.animate([{ transform: "scale(1,1)" }, { transform: "scale(.9,1.03)" }, { transform: "none" }], { duration: 520, easing: "ease-out" });
      const g = stackGeo(c.t);
      for (let i = 0; i < (lo ? 2 : 5); i++) run(emo(c.t.el, "🍃", g.x + rnd(0, g.w), g.y + rnd(0, g.h), rnd(12, 18)), [{ transform: "translate(0,0) scale(.5)", opacity: 1 }, { transform: "translate(" + rnd(-40, 40) + "px," + rnd(30, 90) + "px) rotate(" + rnd(-240, 240) + "deg) scale(1)", opacity: 0 }], { duration: rnd(700, 1100), easing: "ease-out" });
    });
    if (A.meV) shake(6, 4, 380, sc);
  });

  A.at(I + tk * 1000 + 300, () => {
    A.out = performance.now();
    mon.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(40%)", opacity: 0 }], { duration: 900, fill: "forwards", easing: "ease-in" });
    sky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    vg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
  });
  A.off = () => { cs.forEach(c => { c.bk.remove(); c.fr.remove() }); lay.remove(); vg.remove() };
  A.rel = id => { const i = cs.findIndex(c => c.v.id === id); if (i < 0) return; const c = cs[i]; c.bk.remove(); c.fr.remove(); if (c.tn[0] && c.tn[0].parentNode) c.tn[0].parentNode.remove(); cs.splice(i, 1) };
}

/* =====================================================================
   Pecahan lantai yang hilang (dipanggil dari debris() di script.js)
   ===================================================================== */
function lgSuck(t, e, c, r, i, dir, cx, cy) {
  const h = lgHole(t.el); let dx = 0, dy = -300;
  if (h) { const tb = t.el.getBoundingClientRect(), sb = t.el.closest(".scene").getBoundingClientRect(); dx = h.x - (tb.left - sb.left) - cx; dy = h.y - (tb.top - sb.top) - cy }
  const dl = i * 130, L = Math.hypot(dx, dy) || 1, px = -dy / L * dir * 40, py = dx / L * dir * 40;
  c.style.zIndex = 7;
  c.animate([
    { transform: "none", opacity: 1, filter: "none" },
    { transform: "translate(" + -dx * .02 + "px,-7px) rotate(" + dir * -4 + "deg) scale(1.04)", offset: .14 },
    { transform: "translate(" + (dx * .22 + px) + "px," + (dy * .22 + py) + "px) rotate(" + dir * 50 + "deg) scale(.94,1.12)", opacity: 1, filter: "brightness(1.2) saturate(1.3)", offset: .42 },
    { transform: "translate(" + (dx * .64 + px * .6) + "px," + (dy * .64 + py * .6) + "px) rotate(" + dir * 190 + "deg) scale(.55,.9)", opacity: 1, filter: "brightness(1.6) hue-rotate(40deg)", offset: .76 },
    { transform: "translate(" + dx + "px," + dy + "px) rotate(" + dir * 420 + "deg) scale(.03)", opacity: 0, filter: "brightness(2.2)" }
  ], { duration: 1150, delay: dl, easing: "cubic-bezier(.45,0,.9,.6)", fill: "both" }).onfinish = () => c.remove();
  for (let j = 0; j < (ST.lite ? 3 : 7); j++) run(emo(e, j % 2 ? "✦" : "·", cx, cy, rnd(10, 18)), [
    { transform: "translate(0,0) scale(1)", opacity: 0 },
    { transform: "translate(" + (dx * .4 + px) + "px," + (dy * .4 + py) + "px) scale(.8)", opacity: .95, offset: .45 },
    { transform: "translate(" + dx + "px," + dy + "px) scale(.1)", opacity: 0 }
  ], { duration: 1000, delay: dl + j * 70, easing: "ease-in" });
}

function lgCrush(t, e, c, r, i, dir, cx, cy, gy) {
  const dl = i * 110, bad = "brightness(.7) sepia(.8) hue-rotate(60deg) saturate(2)";
  c.animate([
    { transform: "none", filter: "none" },
    { transform: "scale(.9,1.02)", filter: bad, offset: .2 },
    { transform: "scale(.7,1.06) translateX(" + dir * 3 + "px)", filter: bad, offset: .45 },
    { transform: "scale(.3,1.12)", filter: bad, opacity: 1, offset: .9 },
    { transform: "scale(.25,1.1)", opacity: 0 }
  ], { duration: 620, delay: dl, easing: "ease-in", fill: "both" }).onfinish = () => c.remove();
  lgT(() => {
    if (!t.el.isConnected) return;
    for (let j = 0; j < 6; j++) {
      const p = c.cloneNode(true), m = j - 2.5, q = Math.random() - .5;
      p.style.clipPath = "inset(0 " + (100 - (j + 1) * 100 / 6) + "% 0 " + j * 100 / 6 + "%)"; p.style.opacity = ""; p.style.zIndex = 7;
      e.appendChild(p);
      p.animate([
        { transform: "scale(.28,1.12)", opacity: 1, filter: bad },
        { transform: "translate(" + m * 30 + "px," + -(22 + Math.random() * 26) + "px) scale(.28,1.1) rotate(" + m * 18 + "deg)", opacity: 1, offset: .28 },
        { transform: "translate(" + (m * 64 + q * 30) + "px," + gy + "px) rotate(" + (m * 150 + q * 90) + "deg) scale(.3)", opacity: 0 }
      ], { duration: 900, easing: "cubic-bezier(.3,.1,.6,1)", fill: "both" }).onfinish = () => p.remove();
    }
    ringAt(e, cx, cy, "lm", 3, 500);
    for (let j = 0; j < (ST.lite ? 3 : 8); j++) run(emo(e, ["🍃", "🪵", "✦"][j % 3], cx + rnd(-r.w / 2, r.w / 2), cy, rnd(12, 20)), [
      { transform: "translate(0,0) scale(.5)", opacity: 1 }, { transform: "translate(" + rnd(-60, 60) + "px," + rnd(-50, 40) + "px) rotate(" + rnd(-240, 240) + "deg) scale(1)", opacity: 1, offset: .35 },
      { transform: "translate(" + rnd(-80, 80) + "px," + rnd(30, 110) + "px) rotate(" + rnd(-360, 360) + "deg) scale(.5)", opacity: 0 }], { duration: rnd(800, 1300), easing: "ease-out" });
  }, dl + 560);
}

/* =====================================================================
   SKILL LEGENDARIS UNTUK DIRI SENDIRI: LAST BET dan DRAGON GUARDIAN
   Dipanggil dari play() lewat lgSelf(). Efeknya mengubah latar seperti skill legendaris lain.
   ===================================================================== */
function lgNew(k, o) {
  const A = {
    k, o, tm: [], iv: [], dead: false, off: null, frame: null,
    at(ms, f) { const id = setTimeout(() => { if (!A.dead) f() }, ms); A.tm.push(id) },
    every(ms, f) { const id = setInterval(() => { if (A.dead) return; if (o.demo && !ambient.on) { A.end(true); return } f() }, ms); A.iv.push(id) },
    end(q) {
      if (A.dead) return; A.dead = true;
      A.tm.forEach(clearTimeout); A.iv.forEach(clearInterval); LG.act.delete(A);
      if (A.off) A.off(q);
    }
  };
  LG.act.add(A); A.t0 = performance.now();
  return A;
}

function lgSelf(att, a, ps) {
  const o = { sc: $("scene"), M: tws, att: att.id, attName: att.name, vics: [], mine: att.id === me.id, demo: false };
  if (a.k === K_BET) {
    if (a.ph) lgBetRes(att.id, a.ph === "w", o);
    else lgBetShow(o);
  } else lgDgShow(o);
}

/* ---------- LAST BET: logika pemain ini ---------- */
function lgBetStart() { LG.bet = { n: 0 } }
function lgBetMiss() { if (LG.bet && !over && !ended) lgBetEnd(false) }
function lgBetWord() {
  const b = LG.bet; if (!b || over || ended) return;
  b.n++; push({ btn: b.n });
  if (LG.betA) LG.betA.setN(b.n);
  if (b.n >= BET_N) lgBetEnd(true);
}
function lgBetEnd(win) {
  LG.bet = null;
  fc = win ? (G.m === "race" ? Math.min(G.fl, fc + BET_UP) : fc + BET_UP) : Math.max(0, fc - BET_DN);
  const a = { s: me.id + Date.now() + "r", k: K_BET, to: me.id, n: 0, b: 0, ph: win ? "w" : "l" };
  seen[me.id] = a.s;
  push({ atk: a, bt: 0, btn: 0, floors: fc });
  stat(); drawWord(); sync();
  lgSelf(me, a, [me]);
}
/* hasil taruhan bot (dikirim lewat presence bot supaya semua pemain melihat animasinya) */
function lgBotBet(b, win) {
  b.atk = { s: b.id + Date.now() + "r", k: K_BET, to: b.id, n: 0, b: 0, ph: win ? "w" : "l" };
  pubBots();
}

function lgBetShow(o) {
  const old = LG.bets.get(o.att); if (old) old.end(true);
  const A = lgNew(K_BET, o), I = IMP[K_BET];
  SFX.skill("bet", { I, demo: o.demo, mine: o.mine, far: false, pan: 0 });
  if (!o.demo && (o.mine ? ST.txu : ST.txr)) lgTitle(A, o, o.mine ? "Ketik 4 kata tanpa salah!" : esc(o.attName || "Lawan") + " mempertaruhkan menaranya!");
  betFx(A, o, I);
  LG.bets.set(o.att, A); if (o.mine) LG.betA = A;
  lgKick();
}

function lgBetRes(id, win, o) {
  const A = LG.bets.get(id);
  if (A && !A.dead) { A.res(win); return }
  /* animasi taruhan belum berjalan di layar ini (mis. baru masuk): putar singkat langsung ke hasil */
  if (!o.M[id]) return;
  const B = lgNew(K_BET, o); betFx(B, o, 0); LG.bets.set(id, B);
  B.at(350, () => B.res(win)); lgKick();
}

function betFx(A, o, I) {
  const sc = o.sc, W = sc.clientWidth, H = sc.clientHeight, lo = !!ST.lite, M = o.M, id = o.att,
    tw = sc.querySelector(".towers"), lay = mk(sc, "lg-lay bt-lay"), fl = (c, p) => { if (!o.demo && (o.mine || !ST.far)) lgFlash(sc, c, p) };
  sc.insertBefore(lay, tw);
  const NL = lo ? 9 : 20; let lamps = "", st = "";
  for (let i = 0; i < NL; i++) lamps += '<i style="left:' + f1(i / (NL - 1) * 100) + '%;animation-delay:-' + f1((i % 4) * .22) + 's"></i>';
  for (let i = 0; i < (lo ? 8 : 26); i++) st += '<i style="left:' + rnd(0, 100).toFixed(1) + "%;top:" + rnd(0, 70).toFixed(1) + "%;--z:" + rnd(1, 2.8).toFixed(1) + 'px;animation-delay:-' + rnd(0, 3).toFixed(1) + 's"></i>';
  lay.innerHTML = '<div class="bt-sky"></div><div class="bt-sky g"></div><div class="bt-sky r"></div><i class="bt-rays"></i><div class="bt-st">' + st + '</div><i class="bt-spot"></i><div class="bt-lamps">' + lamps + "</div>";
  const [sky, skG, skR] = [...lay.children], rays = lay.querySelector(".bt-rays"), spot = lay.querySelector(".bt-spot"), vg = mk(sc, "lg-vig bt");
  [sky, vg].forEach(e => e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "forwards", easing: "ease-out" }));
  rays.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: "forwards" });
  fl("#ffd23f", .4);

  const hud = mk(sc, "bt-hud", "", "<small>LAST BET</small><div class=\"bt-pips\">" + "<i></i>".repeat(BET_N) + "</div><span>0/" + BET_N + " kata</span>"),
    pips = [...hud.querySelectorAll(".bt-pips i")], hs = hud.querySelector("span");
  hud.animate([{ opacity: 0, transform: "translateX(-50%) translateY(-24px) scale(.7)" }, { opacity: 1, transform: "translateX(-50%) scale(1)" }], { duration: 520, delay: 450, fill: "backwards", easing: "cubic-bezier(.2,1.5,.4,1)" });

  const dice = mk(sc, "bt-dice", "", "<em>🎲</em><u><i>🪙</i><i>♠️</i><i>🪙</i><i>♦️</i></u>"), de = dice.querySelector("em"), orb = [...dice.querySelectorAll("u i")];
  de.animate([
    { transform: "translateY(-" + H + "px) rotate(-540deg) scale(1.7)", opacity: 0 },
    { transform: "translateY(0) rotate(0) scale(1)", opacity: 1, offset: .55 },
    { transform: "translateY(-28px) rotate(40deg)", offset: .7 },
    { transform: "translateY(0) rotate(-20deg)", offset: .82 },
    { transform: "translateY(-8px) rotate(10deg)", offset: .92 },
    { transform: "none" }
  ], { duration: 1300, easing: "ease-out", fill: "backwards" });

  A.n = 0; A.hasT = false;
  const dpos = () => { const r = lgPos(sc, de); return { x: r.x + r.w / 2, y: r.y + r.h / 2 } };

  let last = 0;
  A.frame = now => {
    if (now - last < 30) return; last = now;
    const t = M[id]; if (!t || !t.el.isConnected) return;
    const g = lgPos(sc, t.stack), cx = g.x + g.w / 2, top = g.y, R0 = Math.max(34, (de.offsetWidth || 60) * .75), sw = g.w + 100;
    dice.style.transform = "translate(" + f1(cx) + "px," + f1(top - R0 - 10 - Math.sin(now / 260) * 5) + "px)";
    orb.forEach((e, i) => { const a = now / 420 + i * 1.5708; e.style.transform = "translate(" + f1(Math.cos(a) * R0) + "px," + f1(Math.sin(a) * R0 * .32) + "px) scale(" + f1(.85 + .3 * Math.sin(a)) + ")"; e.style.zIndex = Math.sin(a) > 0 ? 1 : 0 });
    spot.style.left = f1(cx - sw / 2) + "px"; spot.style.top = "0px"; spot.style.width = f1(sw) + "px"; spot.style.height = f1(g.y + g.h) + "px";
    rays.style.left = f1(cx) + "px"; rays.style.top = f1(top) + "px";
  };

  /* dadu mendarat */
  A.at(700, () => {
    const p = dpos(); fl("#ffd23f", .3);
    ringAt(sc, p.x, p.y, "gd", 6, 900); ringAt(sc, p.x, p.y, "gd", 9, 1200, 160);
    if (o.mine) shake(8, 5, 520, sc);
    for (let i = 0; i < (lo ? 5 : 14); i++) { const a = rnd(0, 6.283), d = rnd(60, 190); run(emo(sc, ["🪙", "✦", "♠️", "♦️", "✨"][i % 5], p.x, p.y, rnd(14, 24)), [{ transform: "translate(0,0) scale(.4)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + (Math.sin(a) * d * .6 - 30) + "px) scale(1.1) rotate(" + rnd(-200, 200) + "deg)", opacity: 1, offset: .5 }, { transform: "translate(" + Math.cos(a) * d * 1.2 + "px," + (Math.sin(a) * d * .6 + 90) + "px) scale(.5)", opacity: 0 }], { duration: rnd(900, 1500), easing: "ease-out" }) }
  });

  /* kartu dan chip melayang di latar kasino */
  A.every(lo ? 650 : 260, () => {
    if (A.done) return;
    const x = rnd(0, W), y = H * rnd(.55, .95);
    run(emo(lay, ["♠️", "♥️", "♦️", "♣️", "🪙", "🎲", "🃏"][Math.random() * 7 | 0], x, y, rnd(14, 26)), [{ transform: "translate(0,0) rotate(0) scale(.5)", opacity: 0 }, { transform: "translate(" + rnd(-30, 30) + "px," + -rnd(50, 130) + "px) rotate(" + rnd(-120, 120) + "deg) scale(1)", opacity: .85, offset: .3 }, { transform: "translate(" + rnd(-60, 60) + "px," + -rnd(160, 320) + "px) rotate(" + rnd(-300, 300) + "deg) scale(.6)", opacity: 0 }], { duration: rnd(2200, 3600), easing: "ease-out" });
  });

  /* penonton melihat kemajuan taruhan lewat presence */
  if (!o.mine && !o.demo) A.every(160, () => { const p = peersNow().find(x => x.id === id); if (p && (p.btn | 0) > A.n) A.setN(p.btn | 0) });

  A.setN = n => {
    n = Math.min(BET_N, n | 0); if (n <= A.n || A.done) return; A.n = n;
    pips.forEach((p, i) => { if (i < n && !p.classList.contains("on")) { p.classList.add("on"); p.animate([{ transform: "scale(2.3)" }, { transform: "scale(1)" }], { duration: 440, easing: "cubic-bezier(.2,1.6,.4,1)" }) } });
    hs.textContent = n + "/" + BET_N + " kata" + (n === BET_N - 1 ? " · tinggal satu!" : "");
    SFX.lgx("betTick", { mine: o.mine, demo: o.demo, n });
    de.animate([{ transform: "scale(1) rotate(0)" }, { transform: "scale(1.5) rotate(" + (n % 2 ? 18 : -18) + "deg)" }, { transform: "none" }], { duration: 440, easing: "ease-out" });
    rays.style.animationDuration = Math.max(1.6, 7 - n * 1.3) + "s";
    const p = dpos(); ringAt(sc, p.x, p.y, "gd", 4 + n, 800);
    for (let i = 0; i < (lo ? 3 : 8); i++) { const a = rnd(0, 6.283), d = rnd(40, 110); run(emo(sc, "🪙", p.x, p.y, rnd(14, 22)), [{ transform: "translate(0,0) scale(.5)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + (Math.sin(a) * d - 20) + "px) rotate(" + rnd(-300, 300) + "deg)", opacity: 1, offset: .45 }, { transform: "translate(" + Math.cos(a) * d * 1.1 + "px," + (Math.sin(a) * d + 70) + "px)", opacity: 0 }], { duration: rnd(700, 1100), easing: "ease-out" }) }
    fl("#ffd23f", .16);
  };

  A.fade = () => {
    [lay, vg, hud, dice].forEach(e => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" }));
  };

  A.res = win => {
    if (A.done) return; A.done = true;
    const t = M[id], ok = t && t.el.isConnected, g = ok ? lgPos(sc, t.stack) : { x: W / 2 - 30, y: H * .4, w: 60, h: 60 }, cx = g.x + g.w / 2, p = dpos();
    SFX.lgx(win ? "betWin" : "betLose", { mine: o.mine, demo: o.demo });
    hud.classList.add(win ? "win" : "lose"); hs.textContent = win ? "MENANG +" + BET_UP + " LANTAI!" : "KALAH -" + BET_DN + " LANTAI";
    if (win) pips.forEach(x => x.classList.add("on"));
    const r = mk(sc, "bt-res " + (win ? "win" : "lose"), "", win ? "<em>🎰</em><b>JACKPOT!</b><p>+" + BET_UP + " LANTAI</p>" : "<em>💔</em><b>KALAH TARUHAN!</b><p>-" + BET_DN + " LANTAI</p>");
    r.animate([{ opacity: 0, transform: "translateX(-50%) scale(2.2)", filter: "blur(10px)" }, { opacity: 1, transform: "translateX(-50%) scale(1)", filter: "blur(0)", offset: .16 }, { opacity: 1, transform: "translateX(-50%) scale(1.05)", offset: .8 }, { opacity: 0, transform: "translateX(-50%) translateY(-30px) scale(.9)" }], { duration: win ? 2800 : 2300, easing: "ease-out" }).onfinish = () => r.remove();
    if (win) {
      skG.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "forwards" });
      rays.style.animationDuration = "1.4s";
      fl("#ffe27a", .7);
      for (let i = 0; i < 3; i++) ringAt(sc, cx, g.y, "gd", 8 + i * 3, 1100, i * 170);
      if (o.mine) shake(10, 5, 600, sc);
      for (let i = 0; i < (lo ? 16 : 46); i++) {
        const x = rnd(0, W);
        run(emo(sc, ["🪙", "💰", "✨", "🪙"][i % 4], x, -30, rnd(16, 30)), [{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: "translate(" + rnd(-40, 40) + "px," + H * .85 + "px) rotate(" + rnd(-720, 720) + "deg)", opacity: 1, offset: .85 }, { transform: "translate(" + rnd(-50, 50) + "px," + H * .95 + "px) rotate(" + rnd(-900, 900) + "deg)", opacity: 0 }], { duration: rnd(1500, 2700), delay: rnd(0, 900), easing: "cubic-bezier(.4,0,.8,.6)", fill: "both" });
      }
      for (let i = 0; i < (lo ? 12 : 34); i++) { const a = rnd(0, 6.283), d = rnd(70, 260); run(emo(sc, ["✦", "✧", "⭐", "✨"][i % 4], cx, g.y, rnd(12, 24)), [{ transform: "translate(0,0) scale(.3)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d * .7 + "px) scale(1.1) rotate(" + rnd(-180, 180) + "deg)", opacity: 1, offset: .5 }, { transform: "translate(" + Math.cos(a) * d * 1.25 + "px," + (Math.sin(a) * d * .7 + 60) + "px) scale(.4)", opacity: 0 }], { duration: rnd(1100, 1800), easing: "ease-out" }) }
      if (ok) t.el.animate([{ filter: "none" }, { filter: "drop-shadow(0 0 22px #ffd23f) brightness(1.25)", offset: .4 }, { filter: "none" }], { duration: 1200, iterations: 2 });
    } else {
      skR.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: "forwards" });
      fl("#ff2a2a", .7); A.at(240, () => fl("#ff2a2a", .45));
      if (o.mine) shake(14, 8, 800, sc);
      de.animate([{ transform: "none", opacity: 1 }, { transform: "scale(1.6) rotate(25deg)", opacity: 1, offset: .25 }, { transform: "scale(.2) rotate(200deg)", opacity: 0 }], { duration: 520, fill: "forwards", easing: "ease-in" });
      orb.forEach(e => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }));
      /* retakan merah menjalar dari dadu */
      const crk = mk(sc, "bt-crk"), sv = document.createElementNS(SVGN, "svg"); sv.setAttribute("width", W); sv.setAttribute("height", H); sv.setAttribute("viewBox", "0 0 " + W + " " + H); sv.style.cssText = "position:absolute;left:0;top:0;overflow:visible";
      let d = "";
      for (let k = 0; k < (lo ? 6 : 11); k++) { let x = p.x, y = p.y; const a = k / (lo ? 6 : 11) * 6.283 + rnd(-.2, .2), L = rnd(.25, .6) * Math.max(W, H); d += "M" + f1(x) + " " + f1(y); for (let s = 1; s <= 7; s++) { const q = s / 7; d += "L" + f1(p.x + Math.cos(a) * L * q + rnd(-18, 18)) + " " + f1(p.y + Math.sin(a) * L * q + rnd(-18, 18)) } }
      sv.innerHTML = '<path pathLength="1" d="' + d + '"/>'; crk.appendChild(sv);
      const cp = sv.firstChild; cp.setAttribute("stroke-dasharray", "1");
      cp.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 360, fill: "forwards", easing: "ease-out" });
      crk.animate([{ opacity: 1 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 1600 }).onfinish = () => crk.remove();
      for (let i = 0; i < (lo ? 8 : 20); i++) { const a = rnd(0, 6.283), dd = rnd(80, 230); run(emo(sc, ["💥", "▪️", "💢", "✖️"][i % 4], p.x, p.y, rnd(14, 26)), [{ transform: "translate(0,0) scale(.4)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * dd + "px," + (Math.sin(a) * dd * .7 - 40) + "px) rotate(" + rnd(-300, 300) + "deg)", opacity: 1, offset: .35 }, { transform: "translate(" + Math.cos(a) * dd * 1.1 + "px," + (Math.sin(a) * dd * .7 + 180) + "px) rotate(" + rnd(-500, 500) + "deg) scale(.5)", opacity: 0 }], { duration: rnd(900, 1500), easing: "ease-out" }) }
      for (let i = 0; i < (lo ? 8 : 22); i++) run(emo(sc, ["🃏", "♠️", "♣️", "💔"][i % 4], rnd(0, W), -30, rnd(16, 28)), [{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: "translate(" + rnd(-30, 30) + "px," + H * .8 + "px) rotate(" + rnd(-540, 540) + "deg)", opacity: 1, offset: .85 }, { transform: "translateY(" + H * .9 + "px)", opacity: 0 }], { duration: rnd(1300, 2200), delay: rnd(0, 700), easing: "cubic-bezier(.4,0,.8,.6)", fill: "both" });
      if (ok) { t.el.animate([{ filter: "none" }, { filter: "sepia(1) saturate(4) hue-rotate(-35deg) brightness(.85)", offset: .3 }, { filter: "none" }], { duration: 800, iterations: 2 }); shake(12, 7, 600, t.el) }
    }
    const T = win ? 3000 : 2300;
    A.at(T, () => A.fade()); A.at(T + 1000, () => A.end(false));
  };

  A.at(90000, () => A.end(false));
  A.off = () => {
    lay.remove(); vg.remove(); hud.remove(); dice.remove();
    if (LG.bets.get(id) === A) LG.bets.delete(id);
    if (LG.betA === A) LG.betA = null;
  };
}

/* ---------- DRAGON GUARDIAN: logika pemain ini ---------- */
function lgDgStart() {
  lgDgCleanse();
  lgChip(K_DRG, DRG_MS / 1000, "NAGA MELINDUNGI ");
}
/* menetralkan semua efek lawan yang sedang menimpa pemain ini */
function lgDgCleanse() {
  if (frz) frzEnd(true);
  dz = null;
  LG.drn.forEach(clearInterval); LG.drn.clear();
  $("pnl").querySelectorAll(".lgc").forEach(x => x.remove());
  const t = tws[me.id]; if (t) t.sk = null;
  if (started && !over) drawWord();
}
/* serangan lawan menabrak naga di layar pemain ini */
function lgDgBlock() {
  if (ST.txr) popup("🐉 DITANGKIS NAGA!");
  const A = LG.dg.get(me.id); if (A && !A.dead && A.hit) A.hit();
}

function lgDgShow(o) {
  const old = LG.dg.get(o.att); if (old) old.end(true);
  const A = lgNew(K_DRG, o), I = IMP[K_DRG];
  SFX.skill("dragon", { I, demo: o.demo, mine: o.mine, far: false, pan: 0 });
  if (!o.demo && (o.mine ? ST.txu : ST.txr)) lgTitle(A, o, o.mine ? "Kebal semua skill lawan 15 detik!" : esc(o.attName || "Lawan") + " dilindungi sang naga!");
  /* efek legendaris lain yang sedang menimpa menara ini dinetralkan */
  LG.act.forEach(x => { if (x !== A && x.rel) x.rel(o.att) });
  dgFx(A, o, I);
  LG.dg.set(o.att, A); lgKick();
}

/* bantuan kurva untuk jalur terbang naga */
const dgBez = (P, u) => { const v = 1 - u; return { x: v * v * v * P[0].x + 3 * v * v * u * P[1].x + 3 * v * u * u * P[2].x + u * u * u * P[3].x, y: v * v * v * P[0].y + 3 * v * v * u * P[1].y + 3 * v * u * u * P[2].y + u * u * u * P[3].y } };
const dgTab = P => { const a = [0]; let pr = dgBez(P, 0); for (let i = 1; i <= 20; i++) { const q = dgBez(P, i / 20); a.push(a[i - 1] + Math.hypot(q.x - pr.x, q.y - pr.y)); pr = q } return a };
const dgAt = (P, tb, s) => { s = clp(s, 0, tb[20]); let i = 1; while (i < 20 && tb[i] < s) i++; const u = (i - 1 + (s - tb[i - 1]) / ((tb[i] - tb[i - 1]) || 1)) / 20; return dgBez(P, u) };

const DG_HEAD = '<g class="hd">' +
  '<path class="mn" d="M-4 -8C-20 -30 -40 -30 -56 -46C-48 -26 -40 -16 -30 -8C-46 -10 -58 -2 -72 -4C-56 6 -44 10 -28 10Z" fill="url(#dgMn)" stroke="#8a2d00" stroke-width="1.4"/>' +
  '<path d="M6 -14C0 -44 -16 -64 -48 -78C-26 -56 -14 -38 -6 -12Z" fill="#fff1b0" stroke="#7a4a00" stroke-width="1.8"/>' +
  '<path d="M20 -14C24 -42 16 -62 -4 -76C10 -52 12 -34 8 -12Z" fill="#ffe08a" stroke="#7a4a00" stroke-width="1.8"/>' +
  '<path d="M-20 -12C0 -26 32 -24 58 -12C68 -8 70 0 62 4C40 6 14 6 -6 4C-18 3 -24 -4 -20 -12Z" fill="url(#dgHg)" stroke="#05382a" stroke-width="2"/>' +
  '<g class="jw"><path d="M-12 4C12 8 42 9 62 5C58 18 28 24 -4 18C-12 14 -14 8 -12 4Z" fill="#12805f" stroke="#05382a" stroke-width="2"/><path d="M50 5L53 20L58 5M37 7L40 22L45 7M24 8L27 19L32 8" fill="#fff" stroke="#05382a" stroke-width=".8"/></g>' +
  '<path d="M52 -6L55 9L60 -6M38 -8L41 6L46 -8" fill="#fff" stroke="#05382a" stroke-width=".8"/>' +
  '<ellipse cx="58" cy="-6" rx="3" ry="2" fill="#05382a"/>' +
  '<path d="M4 -27L42 -9C32 -6 16 -6 6 -12Z" fill="#05382a"/>' +
  '<ellipse class="ey" cx="24" cy="-11" rx="7.5" ry="4.6" fill="#ff3d1a"/><ellipse cx="24" cy="-11" rx="1.7" ry="4.2" fill="#140000"/>' +
  '<path class="wh" d="M60 -4C80 -12 98 -4 112 -16"/><path class="wh" d="M60 0C80 6 98 2 114 14"/></g>';
const DG_DEFS = '<defs><linearGradient id="dgHg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43e3ab"/><stop offset="1" stop-color="#128a68"/></linearGradient>' +
  '<linearGradient id="dgMn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5a1f"/><stop offset=".6" stop-color="#ffb32a"/><stop offset="1" stop-color="#fff3a0"/></linearGradient></defs>';

function dgBolt(lay, x0, y0, x1, y1) {
  const s = document.createElementNS(SVGN, "svg"); s.setAttribute("class", "dg-bolt");
  let d = "M" + f1(x0) + " " + f1(y0); const n = 9;
  for (let i = 1; i <= n; i++) { const u = i / n; d += "L" + f1(x0 + (x1 - x0) * u + (i < n ? rnd(-28, 28) : 0)) + " " + f1(y0 + (y1 - y0) * u) }
  s.innerHTML = '<path d="' + d + '"/>'; lay.appendChild(s);
  s.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: .2, offset: .3 }, { opacity: 1, offset: .45 }, { opacity: 0 }], { duration: 420 }).onfinish = () => s.remove();
}

function dgFx(A, o, I) {
  const sc = o.sc, W = sc.clientWidth, H = sc.clientHeight, lo = !!ST.lite, M = o.M, id = o.att, t = M[id];
  if (!t || !t.el.isConnected) { A.at(0, () => A.end(true)); return }
  const tw = sc.querySelector(".towers"), lay = mk(sc, "lg-lay dg-lay"), fl = (c, p) => { if (!o.demo && (o.mine || !ST.far)) lgFlash(sc, c, p) };
  sc.insertBefore(lay, tw);
  let st = "";
  for (let i = 0; i < (lo ? 8 : 30); i++) st += '<i style="left:' + rnd(0, 100).toFixed(1) + "%;top:" + rnd(0, 55).toFixed(1) + "%;--z:" + rnd(1, 2.6).toFixed(1) + 'px;animation-delay:-' + rnd(0, 3).toFixed(1) + 's"></i>';
  lay.innerHTML = '<div class="dg-sky"></div>' + (lo ? "" : '<i class="dg-aur a"></i><i class="dg-aur b"></i>') + '<div class="dg-st">' + st + '</div><i class="dg-rays"></i><div class="dg-vx"><i style="--n:0"></i><i style="--n:1"></i><i style="--n:2"></i><i style="--n:3"></i></div>';
  const sky = lay.querySelector(".dg-sky"), rays = lay.querySelector(".dg-rays"), vx = lay.querySelector(".dg-vx"), vg = mk(sc, "lg-vig dg");
  sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "forwards", easing: "ease-out" });
  vg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "forwards" });
  rays.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, fill: "forwards" });
  fl("#9fe8ff", .4);

  /* kubah emas dan lingkaran rune di dasar menara */
  const dome = mk(t.el, "dg-dome", "opacity:0", "<i></i><b></b>"), rune = mk(t.el, "dg-rune", "", "<b></b>");
  t.dgA = A;
  const mkSvg = (cls, h) => { const e = document.createElementNS(SVGN, "svg"); e.setAttribute("class", "dgw " + cls); e.innerHTML = h; return e };
  const bk = mkSvg("bk", '<path class="wm"/><path class="wb"/><path class="lo"/><path class="lg"/><path class="cl"/><path class="b"/><path class="hl"/><path class="sc"/>'),
    fr = mkSvg("fr", DG_DEFS + '<path class="b"/><path class="hl"/><path class="sc"/><path class="sp"/><path class="lo"/><path class="lg"/><path class="cl"/><path class="wm"/><path class="wb"/>' + DG_HEAD);
  t.el.insertBefore(bk, t.stack); t.el.appendChild(fr);
  const g$ = (e, k) => [...e.children].find(x => x.getAttribute("class") === k),
    P = { bw: g$(bk, "wm"), bwb: g$(bk, "wb"), blo: g$(bk, "lo"), blg: g$(bk, "lg"), bcl: g$(bk, "cl"), bb: g$(bk, "b"), bh: g$(bk, "hl"), bs: g$(bk, "sc"),
      fb: g$(fr, "b"), fh: g$(fr, "hl"), fs: g$(fr, "sc"), fp: g$(fr, "sp"), flo: g$(fr, "lo"), flg: g$(fr, "lg"), fcl: g$(fr, "cl"), fw: g$(fr, "wm"), fwb: g$(fr, "wb") }, hd = fr.querySelector(".hd");
  rune.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 500, fill: "both" });

  const sdir = Math.random() < .5 ? 1 : -1, Tin = 2300, Tout = 1500;
  let last = 0, angS = null, fk = 1, wph = 0, flipK = 1;
  const rotp = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  /* sayap bergaya naga: lengan, jari, dan selaput bergerigi. Lebarnya dibatasi supaya tidak menutupi menara lain */
  const wing = (ox, oy, side, L, th, xl, xr) => {
    const loc = [[0, 0], [.16, -.6], [.42, -1.02], [.8, -.84], [.84, -.5], [.64, -.2], [.32, .02]],
      p = loc.map(q => { const r = rotp(q[0] * L * side, q[1] * L, th * side); return [clp(ox + r[0], xl, xr), oy + r[1]] }),
      pt = q => f1(q[0]) + " " + f1(q[1]),
      cv = (a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; return "Q" + f1(mx + (p[1][0] - mx) * .3) + " " + f1(my + (p[1][1] - my) * .3) + " " + pt(b) };
    return {
      m: "M" + pt(p[0]) + "L" + pt(p[1]) + "L" + pt(p[2]) + "L" + pt(p[3]) + cv(p[3], p[4]) + cv(p[4], p[5]) + cv(p[5], p[6]) + cv(p[6], p[0]) + "Z",
      b: "M" + pt(p[0]) + "L" + pt(p[1]) + "L" + pt(p[2]) + "M" + pt(p[2]) + "L" + pt(p[3]) + "M" + pt(p[2]) + "L" + pt(p[4]) + "M" + pt(p[2]) + "L" + pt(p[5]) + "M" + pt(p[2]) + "L" + pt(p[6])
    };
  };
  A.frame = now => {
    if (now - last < (lo ? 33 : 12)) return;
    const dt = Math.min(80, now - (last || now)); last = now;
    const tt = M[id]; if (!tt || !tt.el.isConnected) return;
    const T = now - A.t0, sg = stackGeo(tt), gp = lgPos(sc, tt.el);
    const bwB = clp(sg.w * .27, 16, 34), cx = sg.x + sg.w / 2, y0 = sg.y + sg.h + 2, hh = Math.max(sg.h + 26, 74), R0 = sg.w / 2 + bwB * .3,
      turns = clp(hh / 80, 1.4, 3), th = u => sdir * Math.PI / 2 - sdir * turns * 6.2832 * u, offT = -140 - gp.y, pd = Math.round(bwB * .9 + 10);
    /* kubah dan rune mengikuti menara yang terus tumbuh */
    dome.style.left = (sg.x - pd) + "px"; dome.style.top = (sg.y - 64 - pd * .5) + "px"; dome.style.width = (sg.w + pd * 2) + "px"; dome.style.height = (sg.h + 96 + pd * .5) + "px";
    rune.style.left = (sg.x - pd + 2) + "px"; rune.style.top = (sg.y + sg.h - 16) + "px"; rune.style.width = (sg.w + pd * 2 - 4) + "px"; rune.style.height = "38px";
    vx.style.left = f1(gp.x + cx) + "px"; vx.style.top = f1(gp.y + sg.y - 20) + "px";
    rays.style.left = f1(gp.x + cx) + "px"; rays.style.top = f1(gp.y + sg.y) + "px";
    /* jalur: turun dari langit tepat di atas menaranya sendiri, melilit, lalu naik lagi (tidak menyapu menara lain) */
    const PI = [{ x: cx + sdir * (R0 + 14), y: offT }, { x: cx + sdir * (R0 + 46), y: y0 - H * .5 }, { x: cx + sdir * (R0 + 26), y: y0 + 6 }, { x: cx + sdir * R0, y: y0 }], tI = dgTab(PI), Pi = tI[20];
    const Ph = Math.hypot(6.2832 * R0 * turns, hh) * .92, e1 = th(1), E1 = { x: cx + R0 * Math.sin(e1), y: y0 - hh };
    const PE = [E1, { x: E1.x + sdir * 10, y: E1.y - H * .25 }, { x: cx - sdir * (R0 + 30), y: offT + 80 }, { x: cx - sdir * (R0 + 20), y: offT }], tE = dgTab(PE), Pe = tE[20];
    const pos = s => {
      if (s <= Pi) { const p = dgAt(PI, tI, s); p.f = true; return p }
      if (s <= Pi + Ph) { const u = (s - Pi) / Ph, a = th(u); return { x: cx + (R0 + Math.sin(now / 330 + u * 9) * 2.2) * Math.sin(a), y: y0 - hh * u + Math.sin(now / 410 + u * 7) * 1.6, f: Math.cos(a) > 0 } }
      const p = dgAt(PE, tE, s - Pi - Ph); p.f = true; return p;
    };
    const Lt = Pi + Ph, Lb = Ph * .98;
    let sH = Lt * sm(clp(T / Tin, 0, 1));
    if (A.xt) sH = Lt + (Pe + Lb + 40) * Math.pow(clp((now - A.xt) / Tout, 0, 1), 1.6);
    const N = lo ? 36 : 56, step = Lb / N, bw = bwB * (1 + .08 * Math.sin(now / 260) + .28 * Math.max(0, 1 - (now - (A.rt || -1e5)) / 600)), S = [];
    for (let i = 0; i <= N; i++) {
      const p = pos(Math.max(0, sH - i * step)); p.w = bw * (i < 6 ? .72 + .047 * i : 1) * (1 - .5 * Math.pow(i / N, 1.6)); S.push(p);
    }
    for (let i = 0; i <= N; i++) {
      const a = S[Math.max(0, i - 1)], b = S[Math.min(N, i + 1)], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
      S[i].tx = dx / L; S[i].ty = dy / L; S[i].nx = -dy / L; S[i].ny = dx / L;
    }
    let FB = "", BB = "", FS = "", BS = "", SP = "", FH = "", BH = "";
    let a = 0;
    while (a < N) {
      let b = a; while (b < N && S[b + 1].f === S[a].f) b++;
      const e = Math.min(b + 1, N); let l = "", r = "", c = "", hl = "";
      for (let i = a; i <= e; i++) { const q = S[i], h = q.w / 2; l += (i > a ? "L" : "M") + f1(q.x + q.nx * h) + " " + f1(q.y + q.ny * h); r = "L" + f1(q.x - q.nx * h) + " " + f1(q.y - q.ny * h) + r; c += (i > a ? "L" : "M") + f1(q.x) + " " + f1(q.y); hl += (i > a ? "L" : "M") + f1(q.x - q.nx * q.w * .22) + " " + f1(q.y - q.ny * q.w * .22) }
      const d = l + r + "Z";
      if (S[a].f) { FB += d; FS += c; FH += hl } else { BB += d; BS += c; BH += hl }
      a = b + 1;
    }
    for (let i = 3; i < N - 2; i += 3) {
      const q = S[i]; if (!q.f) continue;
      const sd = q.ny < 0 ? 1 : -1, h = q.w / 2, bx = q.x + q.nx * sd * h, by = q.y + q.ny * sd * h, sp = q.w * .6;
      SP += "M" + f1(bx - q.tx * 4.5) + " " + f1(by - q.ty * 4.5) + "L" + f1(bx + q.nx * sd * sp + q.tx * 3.5) + " " + f1(by + q.ny * sd * sp + q.ty * 3.5) + "L" + f1(bx + q.tx * 4.5) + " " + f1(by + q.ty * 4.5) + "Z";
    }
    /* tangan dan kaki: mencengkeram menara, bergoyang halus */
    let FLO = "", BLO = "", FCL = "", BCL = "";
    const lm = (q, big, ph) => {
      const din = q.x <= cx ? 1 : -1, s2 = bwB * (big ? 1.05 : .88), u = s2 / 22, sway = Math.sin(now / 380 + ph) * 2.6 * u,
        hp = [q.x, q.y + q.w * .3], kn = [hp[0] + din * s2 * .5, hp[1] + s2 * .5 + sway], ft = [kn[0] + din * s2 * .3, kn[1] + s2 * .62 - sway * .4];
      let cl = "";
      for (let j = -1; j <= 1; j++) { const bx = ft[0] + j * 3.2 * u, by = ft[1]; cl += "M" + f1(bx - 2.2 * u) + " " + f1(by - u) + "L" + f1(bx + (j * 3 + din * 3.5) * u) + " " + f1(by + 10 * u) + "L" + f1(bx + 2.2 * u) + " " + f1(by - u) + "Z" }
      return { l: "M" + f1(hp[0]) + " " + f1(hp[1]) + "L" + f1(kn[0]) + " " + f1(kn[1]) + "L" + f1(ft[0]) + " " + f1(ft[1]), c: cl };
    };
    const iA = Math.round(N * .26), iL = Math.round(N * .56);
    [[iA, 1, 0], [iA + 4, 0, 1.7], [iL, 1, 3.1], [iL + 4, 0, 4.4]].forEach(z => {
      const q = S[z[0]]; if (!q || q.w < 5) return;
      const m = lm(q, z[1], z[2]);
      if (q.f) { FLO += m.l; FCL += m.c } else { BLO += m.l; BCL += m.c }
    });
    /* sayap: mengepak cepat saat terbang, pelan saat melilit */
    const flying = T < Tin + 300 || !!A.xt;
    fk += ((flying ? 1 : 0) - fk) * Math.min(1, dt / 500); wph += dt * (.0034 + .0052 * fk);
    const flap = Math.sin(wph) * (.38 + .3 * fk) + .12 + .25 * fk, iw = Math.round(N * .15), qw = S[iw], side = qw.x >= cx ? 1 : -1,
      ox = cx + (qw.x - cx) * .6, oy = qw.y - qw.w * .25, Lw = clp(sg.w * .62, 34, 70) * (.85 + .25 * fk), colw = sg.w * .85 + bwB,
      wn = wing(ox, oy, side, Lw, flap, cx - colw, cx + colw), wf = wing(ox, oy, -side, Lw * .82, flap * .9 + Math.sin(wph * .5) * .06, cx - colw, cx + colw);
    if (qw.f) { P.fw.setAttribute("d", wn.m); P.fwb.setAttribute("d", wn.b); P.bw.setAttribute("d", wf.m); P.bwb.setAttribute("d", wf.b) }
    else { P.fw.setAttribute("d", ""); P.fwb.setAttribute("d", ""); P.bw.setAttribute("d", wn.m + wf.m); P.bwb.setAttribute("d", wn.b + wf.b) }

    const W0 = tt.el.clientWidth, H0 = tt.el.clientHeight;
    [bk, fr].forEach(e => { e.setAttribute("width", W0); e.setAttribute("height", H0); e.setAttribute("viewBox", "0 0 " + W0 + " " + H0) });
    const off = String(f1(-now / 14 % 80)), lw = f1(bwB * .46);
    P.bb.setAttribute("d", BB); P.bs.setAttribute("d", BS); P.bh.setAttribute("d", BH); P.fb.setAttribute("d", FB); P.fs.setAttribute("d", FS); P.fh.setAttribute("d", FH); P.fp.setAttribute("d", SP);
    P.bs.setAttribute("stroke-dashoffset", off); P.fs.setAttribute("stroke-dashoffset", off);
    P.flo.setAttribute("d", FLO); P.flg.setAttribute("d", FLO); P.fcl.setAttribute("d", FCL); P.blo.setAttribute("d", BLO); P.blg.setAttribute("d", BLO); P.bcl.setAttribute("d", BCL);
    [P.blo, P.flo].forEach(e => e.setAttribute("stroke-width", f1(bwB * .46 + 3.5))); [P.blg, P.flg].forEach(e => e.setAttribute("stroke-width", lw));
    [P.bh, P.fh].forEach(e => e.setAttribute("stroke-width", f1(bwB * .14)));
    /* kepala kecil, menoleh mulus mengikuti arah terbang */
    const h0 = S[0], h1 = S[Math.min(N, 4)], raw = Math.atan2(h0.y - h1.y, h0.x - h1.x);
    if (angS == null) angS = raw; else angS += Math.atan2(Math.sin(raw - angS), Math.cos(raw - angS)) * Math.min(1, dt / 120);
    const ang = angS + Math.sin(now / 320) * .07 + (A.roarK ? Math.sin(now / 55) * .03 : 0);
    flipK += ((Math.cos(ang) < 0 ? -1 : 1) - flipK) * Math.min(1, dt / 90);
    const hs = clp(bw / 44, .46, .72);
    hd.setAttribute("transform", "translate(" + f1(h0.x) + " " + f1(h0.y) + ") rotate(" + f1(ang * 180 / Math.PI) + ") scale(" + f1(hs) + " " + f1(hs * flipK) + ")");
    A.hp = { x: gp.x + h0.x, y: gp.y + h0.y, a: ang };
  };

  A.hit = (x, y) => {
    if (!dome.isConnected) return;
    dome.animate([{ filter: "brightness(2.8) saturate(1.4)" }, { filter: "none" }], { duration: 620 });
    SFX.lgx("dgHit", { mine: o.mine, demo: o.demo });
    const sg = stackGeo(t), px = x == null ? sg.x + sg.w / 2 : x, py = y == null ? sg.y - 10 : y;
    ringAt(t.el, px, py, "gd", 3.4, 600);
    if (A.roar && !A.xt) A.roar(false);
    for (let i = 0; i < (lo ? 4 : 10); i++) { const a = rnd(0, 6.283), d = rnd(30, 80); run(emo(t.el, i % 2 ? "✦" : "✧", px, py, rnd(12, 20)), [{ transform: "translate(0,0)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d + "px) scale(.3)", opacity: 0 }], { duration: 700, easing: "ease-out" }) }
  };

  A.roar = big => {
    const hp = A.hp; if (!hp) return;
    A.rt = performance.now();
    hd.classList.remove("roar"); void hd.getBoundingClientRect(); hd.classList.add("roar");
    ringAt(sc, hp.x, hp.y, "gd", big ? 5 : 3, big ? 1000 : 700);
    if (big) ringAt(sc, hp.x, hp.y, "gd", 3.5, 800, 160);
    A.roarK = 1; A.at(700, () => { A.roarK = 0 });
    A.scare(big);
    A.fire(big);
    if (big) { fl("#ffb08a", .3); if (o.mine) shake(18, 9, 900, sc); rays.animate([{ filter: "brightness(1)" }, { filter: "brightness(2.4)" }, { filter: "brightness(1)" }], { duration: 900 }) }
  };

  /* semua menara lawan gemetar ketakutan saat naga mengaum */
  A.scare = big => {
    for (const k in M) {
      if (k === id) continue;
      const v = M[k]; if (!v || !v.el || !v.el.isConnected || !v.stack) continue;
      const sg2 = stackGeo(v), dx = (sg2.x + sg2.w / 2 < t.el.offsetLeft ? -1 : 1);
      v.stack.animate([{ translate: "0 0", rotate: "0deg" }, { translate: dx * 4 + "px 0", rotate: dx * 1.4 + "deg" }, { translate: -dx * 4 + "px 0", rotate: -dx * 1.4 + "deg" }, { translate: dx * 3 + "px 0", rotate: dx + "deg" }, { translate: "0 0", rotate: "0deg" }], { duration: big ? 900 : 520, iterations: big ? 2 : 1, easing: "ease-in-out" });
    }
  };
  /* semburan api: gumpalan gradasi yang mengalir dari mulut ke atas, mengikuti kepala */
  A.fire = big => {
    const dur = big ? 950 : 600, step = lo ? 90 : 36, steps = Math.round(dur / step);
    for (let i = 0; i < steps; i++) A.at(i * step, () => {
      const h = A.hp; if (!h) return;
      const k = Math.sin(i / steps * Math.PI), aa = -Math.PI / 2 + rnd(-.4, .4) + Math.cos(h.a) * .22, L = rnd(55, big ? 150 : 100) * (.65 + .35 * k),
        sz = rnd(16, big ? 36 : 26) * (.7 + .3 * k), x0 = h.x + Math.cos(h.a) * 18, y0 = h.y + Math.sin(h.a) * 18, dx = Math.cos(aa) * L, dy = Math.sin(aa) * L, du = rnd(650, 1000),
        tf = (m, s2) => "translate(-50%,-50%) translate(" + f1(dx * m) + "px," + f1(dy * m - 12 * m * m) + "px) scale(" + s2 + ")";
      run(mk(sc, "dg-fl", "left:" + f1(x0) + "px;top:" + f1(y0) + "px;width:" + f1(sz) + "px;height:" + f1(sz) + "px"), [
        { transform: tf(0, .35), opacity: 0 }, { transform: tf(.4, 1.15), opacity: .95, offset: .28 }, { transform: tf(1, .3), opacity: 0 }], { duration: du, easing: "ease-out", fill: "both" });
      if (!lo) run(mk(sc, "dg-fl c", "left:" + f1(x0) + "px;top:" + f1(y0) + "px;width:" + f1(sz * .55) + "px;height:" + f1(sz * .55) + "px"), [
        { transform: tf(0, .4), opacity: 0 }, { transform: tf(.3, 1), opacity: 1, offset: .25 }, { transform: tf(.65, .25), opacity: 0 }], { duration: du * .7, easing: "ease-out", fill: "both" });
    });
  };
  /* napas naga: kepulan asap lembut dari lubang hidung */
  A.every(lo ? 900 : 300, () => {
    const hp = A.hp; if (!hp || A.xt || performance.now() - A.t0 < I) return;
    const sz = rnd(12, 20), x0 = hp.x + Math.cos(hp.a) * 18, y0 = hp.y + Math.sin(hp.a) * 18 - 3, dx = rnd(-22, 22);
    run(mk(sc, "dg-sm", "left:" + f1(x0) + "px;top:" + f1(y0) + "px;width:" + f1(sz) + "px;height:" + f1(sz) + "px"), [
      { transform: "translate(-50%,-50%) scale(.4)", opacity: 0 },
      { transform: "translate(-50%,-50%) translate(" + f1(dx * .4) + "px,-16px) scale(1)", opacity: .55, offset: .3 },
      { transform: "translate(-50%,-50%) translate(" + f1(dx) + "px,-56px) scale(2.2)", opacity: 0 }], { duration: rnd(1100, 1700), easing: "ease-out", fill: "both" });
  });

  /* petir saat naga turun dari langit */
  [150, 650, 1350, 2000].forEach((ms, i) => A.at(ms, () => {
    const g = lgPos(sc, t.stack), x = g.x + g.w / 2 + rnd(-W * .3, W * .3);
    dgBolt(lay, x, 0, g.x + g.w / 2 + rnd(-40, 40), g.y - rnd(0, 40));
    fl("#d8f4ff", .22); if (o.mine && i === 1) shake(6, 4, 350, sc);
  }));
  /* naga tiba: raungan, kubah muncul, efek lawan dinetralkan */
  A.at(I, () => {
    A.roar(true);
    dome.animate([{ opacity: 0, transform: "scale(.25)", filter: "brightness(3)" }, { opacity: 1, transform: "scale(1.12)", filter: "brightness(1.6)", offset: .6 }, { opacity: 1, transform: "scale(1)", filter: "none" }], { duration: 1000, fill: "forwards", easing: "cubic-bezier(.2,1.4,.4,1)" });
    const g = lgPos(sc, t.stack);
    ringAt(sc, g.x + g.w / 2, g.y + g.h, "gd", 6, 1100); ringAt(sc, g.x + g.w / 2, g.y + g.h * .5, "cy", 4.5, 900, 120);
    for (let i = 0; i < (lo ? 8 : 24); i++) { const a = rnd(0, 6.283), d = rnd(40, 110); run(emo(sc, ["✦", "✧", "⭐", "✨"][i % 4], g.x + g.w / 2, g.y + g.h * .4, rnd(12, 24)), [{ transform: "translate(0,0) scale(.3)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d * .7 + "px) scale(1.1) rotate(" + rnd(-180, 180) + "deg)", opacity: 1, offset: .5 }, { transform: "translate(" + Math.cos(a) * d * 1.25 + "px," + (Math.sin(a) * d * .7 + 50) + "px) scale(.4)", opacity: 0 }], { duration: rnd(1100, 1700), easing: "ease-out" }) }
  });
  A.every(1900, () => { if (performance.now() - A.t0 > I + 1200 && !A.xt) A.roar(Math.random() < .3) });
  /* bara api naik dari kubah */
  A.every(lo ? 420 : 140, () => {
    if (performance.now() - A.t0 < 900 || A.xt) return;
    const tt = M[id]; if (!tt || !tt.el.isConnected) return;
    const g = lgPos(sc, tt.stack), x = g.x + g.w / 2 + rnd(-g.w * .6, g.w * .6), y = g.y + rnd(0, g.h);
    run(mk(lay, "dg-em", "left:" + f1(x) + "px;top:" + f1(y) + "px"), [{ transform: "translate(0,0) scale(.4)", opacity: 0 }, { transform: "translate(" + rnd(-14, 14) + "px," + -rnd(40, 90) + "px) scale(1)", opacity: .95, offset: .35 }, { transform: "translate(" + rnd(-28, 28) + "px," + -rnd(90, 170) + "px) scale(.3)", opacity: 0 }], { duration: rnd(1200, 2200), easing: "ease-out" });
  });
  /* kubah berkedip sebelum perlindungan habis */
  A.at(DRG_MS - 2700, () => dome.animate([{ opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 450, iterations: 3 }));
  /* naga terbang pergi */
  A.at(DRG_MS - Tout, () => {
    A.xt = performance.now(); SFX.lgx("dgLeave", { mine: o.mine, demo: o.demo }); A.roar(false); fl("#fff3b0", .35);
    dome.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.25)" }], { duration: Tout, fill: "forwards", easing: "ease-in" });
    rune.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
  });
  A.at(DRG_MS - 900, () => {
    [sky, vg, rays, vx].forEach(e => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" }));
  });
  A.at(DRG_MS + 300, () => A.end(false));

  A.off = () => {
    bk.remove(); fr.remove(); dome.remove(); rune.remove(); lay.remove(); vg.remove();
    if (t.dgA === A) t.dgA = null;
    if (LG.dg.get(id) === A) LG.dg.delete(id);
  };
}

/* ---------- animasi latar menu: kadang LAST BET atau DRAGON GUARDIAN muncul ---------- */
function lgDemoSelf(att, d, kk, scn, bwin) {
  if (!dws[att.id]) return;
  const o = { sc: scn || $("sky"), M: dws, att: att.id, attName: att.name, vics: [], mine: false, demo: true };
  if (kk === K_DRG || (kk == null && Math.random() < .5)) { lgDgShow(o); return }
  lgBetShow(o);
  const A = LG.bets.get(att.id), win = bwin != null ? bwin : Math.random() < .55, steps = win ? BET_N : 1 + (Math.random() * 3 | 0);
  for (let n = 1; n <= steps; n++) A.at(1100 + n * 850, () => A.setN(n));
  A.at(1100 + steps * 850 + 300, () => {
    A.res(win);
    att.floors = win ? Math.min(11, att.floors + 5) : Math.max(0, att.floors - 4);
    tower(att, dws, d);
  });
}


/* =====================================================================
   CARA MAIN > SKILL: pratinjau memakai efek asli game (skfx, lgFx, dll)
   Jenis skill: Penyerang (merah), Pengganggu (ungu), Pendukung (biru).
   Skill legendaris punya kasta sendiri berwarna hitam.
   ===================================================================== */
(function () {
  const CAT = {
    a: ["Penyerang", "Mengurangi lantai menara lawan", "a"],
    s: ["Pendukung", "Menguntungkan dirimu sendiri", "s"],
    x: ["Pengganggu", "Mengacaukan atau mengunci lawan", "x"],
    l: ["Legendaris", "Kasta tertinggi, efeknya mengubah seluruh latar", "l"]
  };
  const cat = s => s.r === 5 ? "l" : s.x ? "x" : s.t === "a" ? "a" : "s";
  const sub = s => s.id === "bet" ? "Taruhan" : s.t === "a" ? "Serang semua" : "Pelindung";
  const hB2 = $("hB2"); if (!hB2) return;
  const first = SK.findIndex(s => s.r === 1 && s.t === "a");

  const card = k => { const s = SK[k], c = cat(s); return '<div class="sc r' + s.r + " " + c + '" data-k="' + k + '" tabindex="0"><i class="an">' + s.ic + "</i><b>" + s.n + "</b><small>" + s.ds + '</small><em class="ct">' + (c === "l" ? sub(s) : SK_RAR[s.r]) + "</em></div>" };
  const sec = c => {
    const ks = SK.map((s, k) => k).filter(k => cat(SK[k]) === c).sort((p, q) => SK[p].r - SK[q].r);
    return '<section class="cs ' + c + '"><h4><i></i><b>' + CAT[c][0] + "</b><span>" + CAT[c][1] + '</span></h4><div class="sg">' + ks.map(card).join("") + "</div></section>";
  };
  hB2.innerHTML =
    '<p class="note">Ketuk kartu skill untuk melihat pratinjau animasinya. Animasinya sama persis dengan yang muncul saat bermain.</p>' +
    sec("a") + sec("s") + sec("x") + sec("l");

  const O = document.createElement("div"); O.id = "pvO"; O.className = "pvo hide";
  O.innerHTML = '<div class="pv"><div class="pvs" id="pvS"><div class="scene pvsc" id="pvSc"></div><button class="pvr" id="pvR" type="button">↻ Ulangi</button><button class="pvx" id="pvX" type="button" aria-label="Tutup">✕</button></div>' +
    '<div class="pvi"><div class="pvh"><b id="pvN"></b><u id="pvC"></u></div><p id="pvD"></p></div></div>';
  $("pHow").appendChild(O);
  const SC = $("pvSc");
  let sel = first, tm = [], running = false, P = [], D = null, bw = 0, gen = 0;
  const later = (f, ms) => { const g = gen; tm.push(setTimeout(() => { if (g === gen) f() }, ms)) };

  function clean() {
    gen++; tm.forEach(clearTimeout); tm = [];
    try { lgStop(true) } catch (e) { }
    Object.keys(dws).filter(id => id.startsWith("pv")).forEach(id => { try { tbStop(dws[id], true) } catch (e) { } delete dws[id] });
  }
  function build() {
    SC.innerHTML = '<div class="wst stars"></div><div class="sun"></div><div class="cl" style="top:12%;animation-duration:55s"></div><div class="cl" style="top:26%;animation-duration:80s;animation-delay:-35s;transform:scale(.7)"></div><div class="hills"></div><div class="towers"></div><div class="ground"></div>';
    D = SC.querySelector(".towers");
    const H = D.clientHeight || 200, fh = Math.max(9, Math.min(22, (H - 22) / 13.2));
    D.style.setProperty("--fh", fh + "px");
    P = [["pv0", "Kamu", 0], ["pv1", "Budi", 3], ["pv2", "Sari", 5]].map(([id, name, av]) => ({ id, name, av, floors: 6, bf: 0, sh: 0 }));
    P.forEach(p => { tower(p, dws, D); const t = dws[p.id]; let g = 0; while (t.n < p.floors && g++ < 30) add(t) });
  }
  const ready = () => P.every(p => dws[p.id] && performance.now() > dws[p.id].start + 500);

  /* lama satu putaran (ms) sebelum diulang */
  function lenOf(k) {
    const s = SK[k];
    if (s.ar) return IMP[k] + s.tk * 1000 + 2600;
    if (s.id === "bet") return 9500;
    if (s.id === "dragon") return DRG_MS + 1500;
    if (s.lk) return s.lk * 1000 + 2500;
    if (k === K_TB) return TB_MS + 2500;
    return 5000;
  }

  /* menjalankan skill dengan fungsi game yang sama seperti saat bermain */
  function fire(k) {
    const s = SK[k], att = P[0], v1 = P[1], v2 = P[2], d = D, now = () => Date.now();
    if (s.ar) { lgDemo(att, [v1, v2], d, k, SC); return }
    if (s.lg) { lgDemoSelf(att, d, k, SC, (bw++ % 2) === 0); if (k === K_DRG) later(() => { const t = dws[att.id]; if (t) { t.sk = { k: 5, at: performance.now(), by: false }; skfx(att.id, 5, true, dws, SC, SC) } }, 4200); return }
    if (s.t === "a") {
      const vic = v1, tt = dws[vic.id]; tt.sk = { k, at: performance.now() };
      skBanner(att, vic, s, SC); skfx(vic.id, k, false, dws, SC, SC);
      later(() => { if (s.lk) vic.frz = now() + s.lk * 1000; else if (!s.x) vic.floors = Math.max(0, Math.min(vic.floors, tt.n) - s.d); tower(vic, dws, d) }, IMP[k] + 40);
      return;
    }
    skBanner(att, null, s, SC);
    if (k === 6) att.sh = 1; else if (k === K_TB) att.tbU = now() + TB_MS; else if (k === K_LK) att.lk = LK_N; else att.bf = BUF;
    skfx(att.id, k, false, dws, SC, SC); tower(att, dws, d);
    /* tunjukkan hasilnya: lantai bertambah, atau serangan ditangkis perisai */
    const up = (n, ms) => later(() => { att.floors += n; tower(att, dws, d) }, ms);
    if (k === 7) { up(3, 1500); up(3, 2800) }
    else if (k === K_TB) for (let i = 1; i <= 6; i++) up(1, 1200 + i * 500)
    else if (k === K_LK) { up(1, 1800); up(1, 3200) }
    else if (k === 6) later(() => { const t = dws[att.id]; if (t) { t.sk = { k: 5, at: performance.now(), by: false }; skfx(att.id, 5, true, dws, SC, SC); att.sh = 0; later(() => tower(att, dws, d), 1000) } }, 2200);
  }

  function loop() {
    running = true; clean(); build();
    let tries = 0;
    (function wait() {
      if (!ready() && tries++ < 40) { later(wait, 200); return }
      later(() => { fire(sel); later(() => { if (running) loop() }, lenOf(sel)) }, 300);
    })();
  }
  function stop() { running = false; clean(); SC.innerHTML = "" }
  function pick(k) {
    sel = k; const s = SK[k], c = cat(s);
    document.querySelectorAll("#hB2 .sc").forEach(x => x.classList.toggle("sel", +x.dataset.k === k));
    $("pvN").textContent = s.ic + " " + s.n;
    const u = $("pvC"); u.textContent = c === "l" ? "Legendaris · " + sub(s) : CAT[c][0] + " · " + SK_RAR[s.r]; u.className = "pc " + c;
    $("pvD").textContent = s.ds;
    bw = 0; O.classList.remove("hide"); loop();
  }
  function closeP() { O.classList.add("hide"); stop() }
  hB2.addEventListener("click", e => { const c = e.target.closest(".sc"); if (c) pick(+c.dataset.k) });
  hB2.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("sc")) { e.preventDefault(); pick(+e.target.dataset.k) } });
  $("pvR").onclick = () => pick(sel);
  $("pvX").onclick = closeP;
  O.addEventListener("click", e => { if (e.target === O) closeP() });
  /* hanya berjalan saat tab Skill terlihat */
  setInterval(() => {
    const vis = !$("hB").classList.contains("hide") && !$("mdl").classList.contains("hide");
    if (!vis && !O.classList.contains("hide")) closeP();
  }, 400);
})();