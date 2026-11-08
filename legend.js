/* legend.js: skill LEGENDARIS "Lubang Hitam" dan "Akar Merambat".
   Keduanya menyerang SEMUA musuh (kecuali pemakai), menguras 1 lantai tiap detik.
   Dimuat setelah script.js (memakai fungsi bantu yang sama: mk, run, emo, ringAt, shake, ...). */
const LG = { act: new Set(), hole: new Map(), tm: new Set(), iv: new Set(), rq: 0 };

const lgPos = (sc, el) => { const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height } };
const lgHole = el => { const sc = el.closest && el.closest(".scene"); return (sc && LG.hole.get(sc)) || null };
const lgT = (f, ms) => { const id = setTimeout(() => { LG.tm.delete(id); f() }, ms); LG.tm.add(id); return id };

function lgStop(q) {
  [...LG.act].forEach(a => a.end(q !== false));
  LG.tm.forEach(clearTimeout); LG.tm.clear();
  LG.iv.forEach(clearInterval); LG.iv.clear();
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
    if (me.sh) { push({ sh: 0 }); if (ST.txr) popup("🛡️ SERANGAN DITANGKIS!"); return }
    lgDrain.am = 0;
    lgChip(a.k, s.tk);
    let n = 0;
    const iv = setInterval(() => {
      if (over || ended || n >= s.tk) { clearInterval(iv); LG.iv.delete(iv); return }
      n++; lgDrain();
    }, 1000);
    LG.iv.add(iv);
  }, IMP[a.k]);
}

function lgDrain() {
  if (!fc) { if (ST.txr && !lgDrain.am) { lgDrain.am = 1; popup("AMAN! Lantai masih kosong") } return }
  fc = Math.max(0, fc - 1);
  SFX.hurt(); push({ floors: fc }); stat(); drawWord(); sync();
  $("fl").animate([{ transform: "scale(1.3)", background: "#c8261a" }, { transform: "none" }], { duration: 600, easing: "ease-out" });
}

function lgChip(k, sec) {
  const s = SK[k], P = $("pnl");
  P.querySelectorAll(".lgc").forEach(x => x.remove());
  const c = mk(P, "lkc lgc " + s.id, "", "<em>" + s.ic + "</em><span></span><u><b></b></u>"),
    tx = c.querySelector("span"), bar = c.querySelector("b"), end = Date.now() + sec * 1000;
  bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: sec * 1000, easing: "linear", fill: "forwards" });
  c.animate([{ transform: "translateX(-50%) scale(.6)", opacity: 0 }, { transform: "translateX(-50%) scale(1.1)", opacity: 1, offset: .5 }, { transform: "translateX(-50%) scale(1)", opacity: 1 }], { duration: 420, easing: "ease-out" });
  const upd = () => { tx.textContent = (s.id === "hole" ? "DIHISAP " : "TERJERAT ") + (Math.max(0, end - Date.now()) / 1000).toFixed(1) + " dtk" };
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
  const s = SK[a.k], vics = ps.filter(p => p.id !== att.id && !p.fin).map(p => ({ id: p.id, blk: !!p.sh, nm: p.name })),
    dur = IMP[a.k] + s.tk * 1000 + 1600;
  vics.forEach(v => { const t = tws[v.id]; if (t) t.sk = { k: a.k, at: performance.now(), by: att.id === me.id, dur } });
  lgFx(a.k, { sc: $("scene"), M: tws, att: att.id, attName: att.name, vics, mine: att.id === me.id, demo: false });
}

/* ---------- animasi latar menu (demo) ---------- */
function lgDemo(att, all, d) {
  if (LG.act.size) return;
  const k = 14 + (Math.random() * 2 | 0), s = SK[k], I = IMP[k], vics = all.map(v => ({ id: v.id, blk: !!v.sh, nm: v.name, p: v })),
    dur = I + s.tk * 1000 + 1600;
  vics.forEach(v => { const t = dws[v.id]; if (t) t.sk = { k, at: performance.now(), dur } });
  lgFx(k, { sc: $("sky"), M: dws, att: att.id, attName: att.name, vics, mine: false, demo: true });
  vics.forEach(v => {
    const p = v.p;
    lgT(() => {
      if (!ambient.on) return;
      if (v.blk) { p.sh = 0; tower(p, dws, d); return }
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
function lgTitle(A, o) {
  const s = SK[A.k], sc = o.sc, W = sc.clientWidth, H = sc.clientHeight;
  const txt = [...s.n].map((c, i) => '<span style="--i:' + i + '">' + (c === " " ? "&nbsp;" : c) + "</span>").join("");
  const sub = o.mine ? "Semua lawan terkena!" : esc(o.attName || "Lawan") + " menyerang semuanya!";
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
    ringAt(lay, hx, hy, "bh", 6, 900);
    if (!lo) ringAt(lay, hx, hy, "bh", 9, 1200, 120);
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
    ringAt(lay, hx, hy, "bh", 8, 900); lgFlash(sc, "#fff", .35);
    V.forEach(v => { const t = M[v.id]; if (t) t.el.classList.remove("bhv") });
  });
  A.off = () => { V.forEach(v => { const t = M[v.id]; if (t) t.el.classList.remove("bhv") }); LG.hole.delete(sc); lay.remove(); vg.remove() };
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