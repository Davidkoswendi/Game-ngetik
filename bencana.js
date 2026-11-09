/* bencana.js: MAP BENCANA
   Latar gunung erupsi, badai petir, hujan abu, dan tiga bencana yang menimpa SEMUA menara sekaligus:
   gempa bumi, tornado yang memutari seluruh tim, dan badai petir. Jadwal dibuat dari seed (kode room + ronde)
   sehingga semua pemain melihat kejadian yang sama. Dimuat setelah script.js dan war.js. */
const DSR = { on: false, L: null, L2: null, tm: new Set(), iv: new Set(), ht: new Set(), hv: null, ids: [], bn: {}, raf: 0, rv: 1, rt: 1, gust: 0, em: 0, cr: null };

const bnT = (f, ms) => { const id = setTimeout(() => { DSR.tm.delete(id); if (DSR.on) f() }, ms); DSR.tm.add(id); return id };
const bnI = (f, ms) => { const id = setInterval(() => { if (DSR.on && !document.hidden) f() }, ms); DSR.iv.add(id); return id };
const bnZh = () => { const g = DSR.L && DSR.L.parentNode.querySelector(".ground"); return g ? g.offsetHeight : 200 };
const bnTr = (x, y, r) => "translate(" + f1(x) + "px," + f1(y) + "px)" + (r ? " rotate(" + f1(r) + "deg)" : "");
const bnBl = p => !!(p.sh || p.dg > Date.now());

const DSR_VOL = '<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMax meet"><defs><linearGradient id="bnvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a30"/><stop offset="1" stop-color="#150f14"/></linearGradient></defs><path d="M0 300L120 192L215 120L262 54Q300 38 338 54L392 118L480 190L600 300Z" fill="url(#bnvg)"/><path d="M215 120L262 54L300 168L250 300L120 300Z" fill="rgba(0,0,0,.28)"/><ellipse cx="300" cy="48" rx="36" ry="9" fill="#ffa03e"/><g class="bn-lv2" fill="none" stroke="#ff6a1a" stroke-width="3" stroke-linecap="round"><path d="M288 52Q276 98 294 142T272 232"/><path d="M312 52Q326 106 306 152T332 254"/><path d="M266 58Q238 100 252 162"/><path d="M334 58Q362 104 350 170"/></g></svg>';
const DSR_PALM = '<svg viewBox="0 0 120 240"><path d="M60 240Q52 160 66 90" stroke="#090e0b" stroke-width="7" fill="none"/><g fill="#090e0b"><path d="M66 90Q30 70 4 96Q38 78 66 90Z"/><path d="M66 90Q40 52 12 50Q44 58 66 90Z"/><path d="M66 90Q70 46 96 30Q76 58 66 90Z"/><path d="M66 90Q100 66 118 90Q90 76 66 90Z"/><path d="M66 90Q60 120 30 130Q58 108 66 90Z"/><path d="M66 90Q86 120 112 124Q84 106 66 90Z"/></g></svg>';
const DSR_GCR = '<svg class="bn-gcr" viewBox="0 0 1000 100" preserveAspectRatio="none"><g fill="none" stroke="#ff6a1a" stroke-width="2" stroke-linecap="round"><path d="M40 30L90 44L140 36L210 60L260 52"/><path d="M380 22L430 40L470 34L540 58L600 50"/><path d="M700 34L750 52L800 40L880 66L960 56"/><path d="M180 78L250 70L330 88"/><path d="M560 84L640 74L720 90"/></g></svg>';

/* ---------- membangun / membongkar peta ---------- */
function bnOff() {
  bnHazStop();
  DSR.on = false; cancelAnimationFrame(DSR.raf);
  DSR.tm.forEach(clearTimeout); DSR.tm.clear();
  DSR.iv.forEach(clearInterval); DSR.iv.clear();
  [DSR.L, DSR.L2].forEach(e => { if (e) e.remove() });
  DSR.L = DSR.L2 = null;
  const sc = document.getElementById("scene");
  if (sc) { sc.classList.remove("dis"); sc.querySelectorAll(".bn-ban,.wr-alert").forEach(x => x.remove()) }
}

function bnOn(mp, ids) {
  bnOff();
  const sc = $("scene"); sc.classList.toggle("dis", mp === 2);
  if (mp !== 2) return;
  DSR.on = true; DSR.ids = ids && ids.length ? ids : [me.id]; DSR.bn = {}; DSR.rv = DSR.rt = 1; DSR.gust = 0; DSR.em = 0;
  const lo = !!ST.lite, L = mk(sc, "bn-lay"), L2 = mk(sc, "bn-lay2");
  sc.insertBefore(L, sc.querySelector(".towers")); sc.insertBefore(L2, $("crew"));
  DSR.L = L; DSR.L2 = L2;
  let pl = ""; for (let i = 0; i < (lo ? 4 : 8); i++) pl += '<i style="animation-delay:-' + f1(i * 1.2) + 's"></i>';
  L.innerHTML = '<i class="bn-sf"></i><div class="bn-cl"></div><div class="bn-cl b"></div>' + (lo ? "" : '<div class="bn-cl c"></div>') +
    '<div class="bn-vol">' + DSR_VOL + '<i class="bn-cg"></i><div class="bn-plume">' + pl + '</div></div><i class="bn-haze"></i>';
  L2.innerHTML = '<i class="bn-vig"></i>' + DSR_GCR + '<div class="bn-palm l">' + DSR_PALM + '</div><div class="bn-palm r">' + DSR_PALM + "</div>";
  bnCv(L2);
  bnT(() => bnErupt(false), 1800); bnI(() => bnErupt(Math.random() < .25), lo ? 15000 : 10500);
  bnT(bnLight, 1200); bnI(bnLight, lo ? 5200 : 3300);
}

/* hujan, abu, dan bara api digambar di satu canvas supaya ringan */
function bnCv(L) {
  const cv = document.createElement("canvas"); cv.className = "bn-cv"; L.appendChild(cv);
  const x = cv.getContext("2d"), lo = !!ST.lite, N = lo ? 50 : 120, A = lo ? 12 : 30, E = lo ? 8 : 20, R = [], S = [], M = [], dpr = Math.min(1.5, devicePixelRatio || 1);
  let w = 0, h = 0, last = 0;
  const gy = () => h - bnZh();
  const em = c => ({ x: c ? c.x + rnd(-20, 20) : rnd(0, w), y: c ? c.y : gy() - rnd(0, 90), v: rnd(30, 90), r: rnd(1, 2.4), a: 1, p: rnd(0, 6) });
  const seed = () => {
    R.length = S.length = M.length = 0;
    for (let i = 0; i < N * 2; i++) R.push({ x: rnd(0, w + 240), y: rnd(0, h), v: rnd(800, 1300), l: rnd(10, 22) });
    for (let i = 0; i < A; i++) S.push({ x: rnd(0, w), y: rnd(0, h), v: rnd(22, 60), r: rnd(1, 2.4) });
    for (let i = 0; i < E; i++) M.push(em());
  };
  const f = ts => {
    if (!DSR.on) return;
    DSR.raf = requestAnimationFrame(f);
    if (document.hidden) { last = ts; return }
    const dt = Math.min(.05, (ts - last) / 1000 || .016); last = ts;
    const W = L.clientWidth, H = L.clientHeight;
    if (W !== w || H !== h) { w = W; h = H; cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); seed() }
    DSR.rv += (DSR.rt - DSR.rv) * Math.min(1, dt * 2.5); DSR.gust = Math.max(0, DSR.gust - dt * .35);
    const wd = 200 + DSR.gust * 560 + DSR.rv * 60, g = gy(), n = Math.min(N * 2, (N * DSR.rv) | 0);
    x.clearRect(0, 0, w, h);
    x.strokeStyle = "rgba(196,214,238,.4)"; x.lineWidth = 1; x.beginPath();
    for (let i = 0; i < n; i++) {
      const p = R[i]; p.y += p.v * dt * (.85 + DSR.rv * .25); p.x -= wd * dt;
      if (p.y > g + p.l * 3 || p.x < -40) { p.y = rnd(-60, -5); p.x = rnd(0, w + 240) }
      x.moveTo(p.x, p.y); x.lineTo(p.x + wd / p.v * p.l, p.y - p.l);
    }
    x.stroke();
    x.fillStyle = "rgba(214,204,198,.5)";
    for (const p of S) { p.y += p.v * dt; p.x -= wd * .3 * dt; if (p.y > g) { p.y = -4; p.x = rnd(0, w + 100) } if (p.x < -6) p.x = w + 6; x.fillRect(p.x, p.y, p.r, p.r) }
    if (DSR.em > 0 && DSR.cr) { for (let k = 0; k < DSR.em && M.length < E + 70; k++) M.push(em(DSR.cr)); DSR.em = 0 }
    for (let i = M.length - 1; i >= 0; i--) {
      const p = M[i]; p.y -= p.v * dt; p.x -= wd * .12 * dt + Math.sin(ts / 400 + p.p) * .4; p.a -= dt * .22;
      if (p.a <= 0 || p.y < 0) { if (i >= E) { M.splice(i, 1); continue } M[i] = em(); continue }
      x.fillStyle = "rgba(255," + ((120 + p.a * 100) | 0) + ",40," + f1(p.a * .9) + ")"; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
  };
  DSR.raf = requestAnimationFrame(f);
}

/* ---------- kejadian latar ---------- */
function bnLight() {
  const L = DSR.L; if (!L) return; const W = L.clientWidth, H = L.clientHeight, gy = H - bnZh();
  const sf = L.querySelector(".bn-sf");
  if (sf) sf.animate([{ opacity: 0 }, { opacity: .85, offset: .1 }, { opacity: .2, offset: .3 }, { opacity: .7, offset: .45 }, { opacity: 0 }], { duration: 560 });
  bolt(L, rnd(.08, .92) * W, H * .04, gy - rnd(30, 120));
  bnT(() => { try { SFX.dis("dthunder") } catch (e) { } }, rnd(350, 1200));
}

function bnCrater() {
  const v = DSR.L && DSR.L.querySelector(".bn-vol"); if (!v) return null;
  const r = v.getBoundingClientRect(), b = DSR.L.getBoundingClientRect();
  return { x: r.left - b.left + r.width * .5, y: r.top - b.top + r.height * .16 };
}

function bnErupt(big) {
  const L = DSR.L, c = bnCrater(); if (!L || !c) return;
  const lo = !!ST.lite, n = Math.round((lo ? 7 : 16) * (big ? 1.6 : 1)), k = big ? 1.5 : 1;
  DSR.cr = c; DSR.em = lo ? 10 : big ? 40 : 22;
  run(mk(L, "bn-fb2", "left:" + f1(c.x) + "px;top:" + f1(c.y) + "px"), [
    { transform: "translate(-50%,-70%) scale(.2)", opacity: 1 },
    { transform: "translate(-50%,-70%) scale(" + k * 1.6 + ")", opacity: .9, offset: .3 },
    { transform: "translate(-50%,-70%) scale(" + k * 2.2 + ")", opacity: 0 }], { duration: 1300, easing: "ease-out" });
  for (let i = 0; i < n; i++) {
    const a = rnd(-1.15, 1.15), dx = Math.sin(a) * rnd(60, 200) * k, h = rnd(110, 260) * k, fy = rnd(30, 110), kf = [];
    for (let j = 0; j <= 8; j++) { const u = j / 8; kf.push({ transform: bnTr(c.x + dx * u, c.y - 4 * h * u * (1 - u) + u * u * fy), opacity: j === 8 ? 0 : 1 }) }
    run(mk(L, "bn-lv", "width:" + f1(rnd(4, 8)) + "px;height:" + f1(rnd(4, 8)) + "px"), kf, { duration: rnd(1500, 2400), delay: rnd(0, 300) });
  }
  for (let i = 0; i < (lo ? 3 : 5); i++) {
    const s = f1(rnd(70, 120));
    run(mk(L, "bn-ap", "left:" + f1(c.x + rnd(-26, 26)) + "px;top:" + f1(c.y) + "px;width:" + s + "px;height:" + s + "px"), [
      { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
      { transform: "translate(-50%,-50%) translate(-10px,-70px) scale(1.4)", opacity: .9, offset: .22 },
      { transform: "translate(-50%,-50%) translate(-110px," + f1(-rnd(230, 330) * k) + "px) scale(3)", opacity: 0 }], { duration: rnd(4800, 6200), delay: i * 220, easing: "ease-out" });
  }
  if (big) bnT(() => bolt(L, c.x + rnd(-30, 30), Math.max(0, c.y - 210), c.y - rnd(40, 100)), 700);
  try { SFX.dis("erupt") } catch (e) { }
}

/* ---------- bencana yang menimpa semua menara ---------- */
function bnHazStop() {
  if (DSR.hv) { clearInterval(DSR.hv); DSR.hv = null }
  DSR.ht.forEach(clearTimeout); DSR.ht.clear();
}

/* dipanggil begin(): jadwal sama untuk semua pemain (seed dari kode room dan ronde) */
function bnHaz() {
  bnHazStop();
  if (!DSR.on) return;
  const r = seedRng(code + "b" + me.round + "z"), ev = []; let t = 9000, prev = -1;
  for (let i = 0; i < 30; i++) {
    let k; do { const x = r(); k = x < .34 ? 4 : x < .68 ? 0 : 3 } while (k === prev);   /* gempa, tornado, badai petir */
    prev = k; ev.push({ t, k, n: i }); t += 13000 + r() * 6000;
  }
  let i = 0;
  DSR.hv = setInterval(() => {
    if (!started || ended) return;
    const el = Date.now() - t0;
    while (i < ev.length && ev[i].t <= el) { const e = ev[i++]; if (el - e.t < 3000) bnFire(e) }
  }, 200);
}

const DSR_TXT = { 4: ["GEMPA BUMI!", "🌋"], 0: ["TORNADO!", "🌪️"], 3: ["BADAI PETIR!", "⚡"] };

function bnFire(e) {
  if (!DSR.on) return;
  const sc = $("scene"), T = DSR_TXT[e.k];
  try { SFX.siren() } catch (x) { }
  const b = mk(sc, "bn-ban", "", "<em>" + T[1] + "</em><b>" + T[0] + "</b><small>Semua menara terkena</small>");
  b.animate([{ opacity: 0, transform: "translate(-50%,0) scale(.5)" }, { opacity: 1, transform: "translate(-50%,0) scale(1.1)", offset: .14 }, { opacity: 1, transform: "translate(-50%,0) scale(1)", offset: .28 }, { opacity: .4, offset: .45 }, { opacity: 1, offset: .6 }, { opacity: .4, offset: .75 }, { opacity: 1, offset: .9 }, { opacity: 0 }], { duration: 1400 }).onfinish = () => b.remove();
  const al = mk(sc, "wr-alert");
  al.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .2, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 1300 }).onfinish = () => al.remove();
  const id = setTimeout(() => { DSR.ht.delete(id); bnHit(e) }, 1400); DSR.ht.add(id);
}

function bnPos(p) {
  const t = tws[p.id]; if (!t || !t.el.isConnected) return null;
  const b = $("scene").getBoundingClientRect(), r = t.el.getBoundingClientRect(), s = t.stack.getBoundingClientRect(), g = stackGeo(t);
  return { t, x: r.left - b.left + r.width / 2, top: Math.max(0, s.top - b.top), g, sx: g.x + g.w / 2, sy: g.y + g.h * .35 };
}
const bnSh = (q, at) => bnT(() => shieldHit(q.t, q.sx, q.sy), at);

/* kerusakan lantai: dihitung oleh klien masing-masing (pemain sendiri dan bot miliknya), tepat saat efek mengenai */
function bnApply(p, e, at) {
  const id = setTimeout(() => {
    DSR.ht.delete(id);
    if (ended || !DSR.on) return;
    const q = peersNow().find(x => x.id === p.id); if (!q || q.fin) return;
    const s = SK[e.k], a = { s: "bn" + e.n, k: e.k, to: q.id, n: s.d, b: bnBl(q) ? 1 : 0 }, t = tws[q.id];
    if (t) t.sk = { k: a.k, at: performance.now(), by: false };
    if (q.id === me.id) {
      if (ST.txr && !DSR.bn[e.n]) { DSR.bn[e.n] = 1; skBanner({ name: "Bencana Alam" }, q, s) }
      hit(a);
    } else if (BOTS.some(x => x.id === q.id)) botHit(a);
  }, Math.max(0, at - IMP[e.k] - 40));
  DSR.ht.add(id);
}

function bnHit(e) {
  if (ended || !DSR.on) return;
  const ps = peersNow().filter(p => !p.fin && tws[p.id]); if (!ps.length) return;
  ({ 0: bnTor, 3: bnStorm, 4: bnQuake })[e.k](ps, e);
}

/* GEMPA: seluruh layar bergetar, gelombang kejut menjalar dari pusat gempa, tanah retak berpijar, menara berayun bergelombang */
function bnQuake(ps, e) {
  const sc = $("scene"), L2 = DSR.L2, W = sc.clientWidth, H = sc.clientHeight, gy = H - bnZh(), lo = !!ST.lite, I = IMP[4], ex = rnd(.3, .7) * W;
  try { SFX.skill("quake", { I, mine: true }) } catch (x) { }
  const f = []; for (let i = 0; i <= 28; i++) { const m = Math.sin(Math.min(1, i / 5) * 1.57) * (1 - i / 28) * 13; f.push({ transform: "translate(" + f1(rnd(-m, m)) + "px," + f1(rnd(-m, m) * .7) + "px)" }) }
  f.push({ transform: "none" }); sc.animate(f, { duration: 2400, delay: 250 });
  for (let i = 0; i < 3; i++) run(mk(L2, "bn-wv", "left:" + f1(ex) + "px;top:" + f1(gy + 10) + "px"), [{ transform: "translate(-50%,-50%) scale(.1,.03)", opacity: .9 }, { transform: "translate(-50%,-50%) scale(5.5,1.3)", opacity: 0 }], { duration: 1600, delay: 300 + i * 280, easing: "ease-out", fill: "both" });
  let d = ""; for (let x = 0; x <= W + 36; x += 36) d += f1(x) + "," + f1(8 + rnd(0, 40)) + " ";
  const ck = mk(L2, "bn-crk", "left:0;top:" + f1(gy + 4) + "px;width:" + W + "px;height:60px", '<svg width="' + W + '" height="60"><polyline points="' + d + '" fill="none" stroke="rgba(255,80,20,.55)" stroke-width="9" stroke-linejoin="round"/><polyline points="' + d + '" fill="none" stroke="#ffc060" stroke-width="2.5" stroke-linejoin="round"/></svg>');
  const pl = f1(ex / W * 100), pr = f1(100 - ex / W * 100);
  ck.animate([{ clipPath: "inset(0 " + pr + "% 0 " + pl + "%)", opacity: 1 }, { clipPath: "inset(0 0 0 0)", opacity: 1, offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 4400, delay: 350, fill: "both" }).onfinish = () => ck.remove();
  ps.forEach(p => {
    const q = bnPos(p); if (!q) return;
    bnApply(p, e, I);
    if (bnBl(p)) { bnSh(q, I); return }
    const dl = Math.max(0, I - 150) + Math.abs(q.x - ex) * .35;
    q.t.stack.animate([{ transform: "rotate(0)" }, { transform: "rotate(3deg)", offset: .16 }, { transform: "rotate(-2.6deg)", offset: .38 }, { transform: "rotate(1.8deg)", offset: .6 }, { transform: "rotate(-.8deg)", offset: .8 }, { transform: "rotate(0)" }], { duration: 2000, delay: dl, easing: "ease-in-out" });
    for (let j = 0; j < (lo ? 3 : 7); j++) run(mk(L2, "bn-ds", "left:" + f1(q.x + rnd(-46, 46)) + "px;top:" + f1(gy - 2) + "px;width:" + f1(rnd(34, 60)) + "px;height:" + f1(rnd(24, 40)) + "px"), [
      { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
      { transform: "translate(-50%,-50%) translate(" + f1(rnd(-16, 16)) + "px,-26px) scale(1)", opacity: .85, offset: .3 },
      { transform: "translate(-50%,-50%) translate(" + f1(rnd(-40, 40)) + "px,-80px) scale(2.2)", opacity: 0 }], { duration: rnd(1500, 2400), delay: dl + rnd(0, 380), easing: "ease-out", fill: "both" });
    if (!lo) for (let j = 0; j < 5; j++) {
      const x0 = q.x + rnd(-26, 26), y0 = q.top + rnd(0, 40);
      run(mk(L2, "bn-rk", "width:" + f1(rnd(3, 7)) + "px;height:" + f1(rnd(3, 7)) + "px"), [{ transform: bnTr(x0, y0), opacity: 0 }, { transform: bnTr(x0, y0), opacity: 1, offset: .05 }, { transform: bnTr(x0 + rnd(-30, 30), gy - 4, rnd(120, 360)), opacity: 1, offset: .85 }, { opacity: 0 }], { duration: rnd(800, 1300), delay: dl + rnd(0, 500), easing: "ease-in", fill: "both" });
    }
  });
  bnT(() => bnErupt(true), 600);
}

/* TORNADO: dua corong (belakang dan depan menara) membuat gerakan melingkar mengelilingi seluruh tim */
function bnFun(L) {
  const w = Math.min(150, L.clientWidth * .26), h = Math.min(L.clientHeight * .72, 470); let r = "", d = "";
  for (let i = 0; i < 12; i++) { const u = i / 11; r += '<i style="top:' + f1(u * 90) + "%;width:" + f1(100 - u * 74) + "%;animation-delay:-" + f1(i * .11) + "s;opacity:" + f1(.85 - u * .3) + '"></i>' }
  for (let i = 0; i < 9; i++) d += '<s style="--t:' + f1(rnd(.45, .9)) + "s;--r:" + f1(rnd(40, 95)) + "px;top:" + f1(rnd(8, 88)) + '%"></s>';
  return mk(L, "bn-tor", "width:" + w + "px;height:" + h + "px;opacity:0", r + "<b></b>" + d);
}

function bnTor(ps, e) {
  const sc = $("scene"), W = sc.clientWidth, H = sc.clientHeight, gy = H - bnZh(), I = IMP[0], D = 2600, lo = !!ST.lite;
  try { SFX.skill("wind", { I, mine: true }) } catch (x) { }
  const P = ps.map(p => ({ p, q: bnPos(p) })).filter(o => o.q), xs = P.map(o => o.q.x);
  const xl = Math.max(50, Math.min(...xs, W * .4) - 120), xr = Math.min(W - 50, Math.max(...xs, W * .6) + 120);
  const B = bnFun(DSR.L), F = bnFun(DSR.L2), tw = B.offsetWidth, th = B.offsetHeight;
  const T = (x, y, s, k) => "translate(" + f1(x - tw / 2) + "px," + f1(y) + "px) scale(" + s + ") skewX(" + k + "deg)", yb = gy - th - 4, yf = gy - th + 18;
  run(B, [{ transform: T(xl, yb, .55, 10), opacity: 0 }, { transform: T(xl + (xr - xl) * .1, yb, .57, 9), opacity: .9, offset: .1 }, { transform: T(xr, yb, .62, -8), opacity: .95, offset: .88 }, { transform: T(xr + 20, yb, .62, -8), opacity: 0 }], { duration: D, easing: "linear" });
  run(F, [{ transform: T(xr, yf, .9, -9), opacity: 0 }, { transform: T(xr - (xr - xl) * .11, yf, .95, -9), opacity: 1, offset: .1 }, { transform: T(xl, yf, 1.04, 8), opacity: 1, offset: .9 }, { transform: T(xl - 20, yf, 1.04, 8), opacity: 0 }], { duration: D, delay: D - 250, easing: "linear" });
  DSR.gust = 1.2; bnT(() => { DSR.gust = 1.2 }, D);
  dim(.4, D * 2, "rgba(24,18,14,.55)", sc);
  P.forEach(({ p, q }) => {
    const t = D - 250 + (xr - q.x) / (xr - xl) * D * .9;   /* saat corong depan melintas di menara ini */
    bnApply(p, e, t);
    if (bnBl(p)) { bnSh(q, t); return }
    q.t.stack.animate([{ transform: "rotate(0)" }, { transform: "rotate(-5deg)", offset: .28 }, { transform: "rotate(4deg)", offset: .58 }, { transform: "rotate(-1.4deg)", offset: .82 }, { transform: "rotate(0)" }], { duration: 1700, delay: Math.max(0, t - 600), easing: "ease-in-out" });
    for (let j = 0; j < (lo ? 3 : 7); j++) orbit(q.t.el, ["🍃", "🍂", "🪵", "▪️"][j % 4], q.sx, q.g.y + rnd(0, Math.max(10, q.g.h * .8)), rnd(46, 80), rnd(8, 16), rnd(900, 1400), Math.max(0, t - 650) + j * 70, rnd(12, 20));
  });
}

/* BADAI PETIR: hujan deras, langit gelap, petir menyambar menara satu per satu dengan cepat */
function bnStorm(ps, e) {
  const sc = $("scene"), lo = !!ST.lite;
  try { SFX.skill("storm", { I: 800, mine: true }) } catch (x) { }
  dim(.55, 3400, null, sc); DSR.rt = 2.3; DSR.gust = .9; bnT(() => { DSR.rt = 1 }, 4600);
  ps.forEach((p, i) => {
    const q = bnPos(p); if (!q) return; const ts = 800 + i * 230;
    bnApply(p, e, ts);
    bnT(() => {
      const L = DSR.L2; if (!L) return;
      bolt(L, q.x, 0, q.top + 4); bolt(L, q.x + rnd(-140, 140), 0, rnd(.3, .5) * sc.clientHeight);
      if (bnBl(p)) { shieldHit(q.t, q.sx, q.sy); return }
      ringAt(L, q.x, q.top, "or", 4, 600);
      q.t.stack.animate([{ filter: "brightness(3.2) drop-shadow(0 0 14px #bfe9ff)" }, { filter: "none" }], { duration: 650 });
      for (let j = 0; j < (lo ? 4 : 10); j++) { const a = rnd(0, 6.283), d = rnd(24, 70); run(mk(L, "wr-sp", "left:" + f1(q.x) + "px;top:" + f1(q.top) + "px"), [{ transform: "translate(0,0)", opacity: 1 }, { transform: "translate(" + f1(Math.cos(a) * d) + "px," + f1(Math.sin(a) * d + 20) + "px)", opacity: 0 }], { duration: rnd(500, 900), easing: "ease-out" }) }
    }, ts);
    if (i === 0 || i === ps.length - 1) bnT(() => flash(sc), ts);
  });
}