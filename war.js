/* war.js: MAP PERANG
   Latar medan perang (kota hancur, asap, searchlight, tank, tentara, pertempuran udara) dan
   serangan dari latar: pesawat jatuh, pembomanan, kawanan burung yang menimpa menara pemain mana pun.
   Jadwal serangan dibuat dari seed (kode room + ronde) sehingga semua pemain melihat kejadian yang sama.
   Dimuat setelah script.js (memakai mk, run, rnd, ringAt, skfx, skBanner, hit, botHit, ...). */
const WR = { on: false, L: null, L2: null, tm: new Set(), iv: new Set(), ht: new Set(), hv: null, ids: [] };

const wrT = (f, ms) => { const id = setTimeout(() => { WR.tm.delete(id); if (WR.on) f() }, ms); WR.tm.add(id); return id };
const wrI = (f, ms) => { const id = setInterval(() => { if (WR.on && !document.hidden) f() }, ms); WR.iv.add(id); return id };
const wrTr = (x, y, r) => "translate(" + f1(x) + "px," + f1(y) + "px)" + (r ? " rotate(" + f1(r) + "deg)" : "");
const wrZh = () => { const g = WR.L && WR.L.parentNode.querySelector(".ground"); return g ? g.offsetHeight : 200 };

const WR_JET = '<svg viewBox="0 0 80 26"><path d="M2 13L22 10L50 8L57 2L65 2L61 9L74 11L79 13L74 15L61 16L65 24L57 24L50 18L22 16Z" fill="currentColor"/><path d="M30 10L44 9L46 12L30 12Z" fill="rgba(255,190,110,.55)"/></svg>';
const WR_TANK = '<svg viewBox="0 0 96 38"><rect x="6" y="25" width="76" height="11" rx="5.5" fill="#12100c"/><g fill="#2b281d"><circle cx="15" cy="30.5" r="4"/><circle cx="31" cy="30.5" r="4"/><circle cx="47" cy="30.5" r="4"/><circle cx="63" cy="30.5" r="4"/><circle cx="75" cy="30.5" r="4"/></g><path d="M10 25L17 15H72L80 25Z" fill="#3b3d2a"/><path d="M30 15L35 7H58L63 15Z" fill="#4b4e33"/><rect x="60" y="9" width="32" height="3.4" rx="1.4" fill="#2a2c1e"/><rect x="38" y="3" width="2" height="5" fill="#2a2c1e"/></svg>';

/* ---------- membangun / membongkar peta ---------- */
function warOff() {
  const hs = WR.L && WR.L.parentNode;
  warHazStop();
  WR.on = false;
  WR.tm.forEach(clearTimeout); WR.tm.clear();
  WR.iv.forEach(clearInterval); WR.iv.clear();
  [WR.L, WR.L2].forEach(e => { if (e) e.remove() });
  WR.L = WR.L2 = null;
  const sc = hs || document.getElementById("scene");
  if (sc) { sc.classList.remove("war"); sc.querySelectorAll(".wr-warn,.wr-alert").forEach(x => x.remove()) }
}

function warOn(mp, ids, host) {
  warOff();
  const sc = host || $("scene");
  sc.classList.toggle("war", mp === 1);
  if (mp !== 1) return;
  WR.on = true; WR.ids = ids && ids.length ? ids : [me.id];
  const lo = !!ST.lite, L = mk(sc, "wr-lay"), L2 = mk(sc, "wr-lay2");
  sc.insertBefore(L, sc.querySelector(".towers"));
  sc.insertBefore(L2, sc.querySelector("#crew,#site"));
  WR.L = L; WR.L2 = L2;

  /* kota hancur: dua lapis siluet bangunan berpuncak patah, jendela berkedip, atap terbakar */
  let far = "", near = "", win = "", fire = "";
  for (let ly = 0; ly < 2; ly++) {
    let x = -12;
    while (x < 1012) {
      const w = rnd(28, 62), h = ly ? rnd(50, 130) : rnd(34, 90), y = 160 - h;
      const pts = [x + "," + 160, x + "," + f1(y + rnd(0, 16)), f1(x + w * .3) + "," + f1(y), f1(x + w * .45) + "," + f1(y + rnd(8, 26)), f1(x + w * .7) + "," + f1(y + rnd(0, 10)), f1(x + w) + "," + f1(y + rnd(0, 20)), f1(x + w) + ",160"].join(" ");
      if (ly) near += '<polygon points="' + pts + '"/>'; else far += '<polygon points="' + pts + '"/>';
      if (ly) {
        for (let gy = y + 24; gy < 150; gy += 18) for (let gx = x + 6; gx < x + w - 8; gx += 13) if (Math.random() > .62) win += '<rect class="wr-w" x="' + f1(gx) + '" y="' + f1(gy) + '" width="5" height="7" style="animation-delay:-' + rnd(0, 2).toFixed(2) + 's"/>';
        if (Math.random() < .3) fire += '<i class="wr-fire" style="left:' + f1((x + w * rnd(.3, .7)) / 10) + "%;bottom:" + f1((160 - y - 6) / 160 * 100) + '%"></i>';
      }
      x += w + rnd(-4, 4);
    }
  }
  let sk = "", tk = "";
  for (let i = 0; i < (lo ? 4 : 7); i++) sk += '<i class="wr-sk" style="top:' + f1(rnd(3, 38)) + "%;width:" + f1(rnd(220, 380)) + "px;height:" + f1(rnd(60, 110)) + "px;animation-duration:" + f1(rnd(60, 110)) + "s;animation-delay:-" + f1(rnd(0, 90)) + 's"></i>';
  [[18, 120, 7], [47, 90, 9], [74, 130, 6]].forEach(([p, w, d], i) => tk += '<i class="wr-col" style="left:' + p + "%;--w:" + w + "px;--h:" + (48 + i * 6) + "%;animation-duration:" + d + 's"></i>');
  L.innerHTML = '<i class="wr-haze"></i><i class="wr-glow"></i><div class="wr-skw">' + sk + "</div>" + tk +
    '<div class="wr-city"><svg viewBox="0 0 1000 160" preserveAspectRatio="none"><g fill="#3a1b20" opacity=".9">' + far + '</g><g fill="#140a0f">' + near + '</g><g class="wr-wg">' + win + "</g></svg>" + fire + "</div>" +
    (lo ? "" : '<i class="wr-sl" style="left:14%;--a1:-24deg;--a2:18deg;--d:7s"></i><i class="wr-sl" style="left:50%;--a1:20deg;--a2:-22deg;--d:9s"></i><i class="wr-sl" style="left:83%;--a1:-16deg;--a2:26deg;--d:8s"></i>') +
    '<div class="wr-tank" style="--d:52s;animation-delay:-14s"><div class="wr-tb">' + WR_TANK + '</div></div><div class="wr-tank l" style="--d:64s;animation-delay:-40s"><div class="wr-tb">' + WR_TANK + "</div></div>";

  /* medan depan: karung pasir, penghalang tank, kawat berduri, vinyet */
  const bag = () => { let s = '<svg viewBox="0 0 120 50">'; [[0, 34, 5], [12, 19, 4], [24, 5, 3]].forEach(([ox, oy, n], r) => { for (let i = 0; i < n; i++) s += '<rect x="' + (ox + i * 24) + '" y="' + oy + '" width="25" height="15" rx="7" fill="' + ((i + r) % 2 ? "#9c8658" : "#b19a68") + '" stroke="#3a2e18" stroke-width="1.5"/>' }); return s + "</svg>" },
    hog = '<svg viewBox="0 0 40 30"><g stroke="#2a2218" stroke-width="4" stroke-linecap="round"><path d="M6 27L34 4M34 27L6 4M20 29V2"/></g><g stroke="#6a5a40" stroke-width="1.5" stroke-linecap="round"><path d="M6 27L34 4M34 27L6 4M20 29V2"/></g></svg>',
    wire = '<svg viewBox="0 0 160 24" preserveAspectRatio="none"><path d="M0 14Q10 2 20 14T40 14T60 14T80 14T100 14T120 14T140 14T160 14" fill="none" stroke="#2a2420" stroke-width="2"/><path d="M0 14Q10 26 20 14T40 14T60 14T80 14T100 14T120 14T140 14T160 14" fill="none" stroke="#3a322b" stroke-width="1.6"/><g stroke="#2a2420" stroke-width="1.6"><path d="M10 8l4 8M30 8l4 8M50 8l4 8M70 8l4 8M90 8l4 8M110 8l4 8M130 8l4 8M150 8l4 8"/></g></svg>';
  L2.innerHTML = '<i class="wr-vig"></i><div class="wr-sb l">' + bag() + '</div><div class="wr-sb r">' + bag() + '</div><div class="wr-hg" style="left:24%">' + hog + '</div><div class="wr-hg s" style="left:63%">' + hog + '</div><div class="wr-hg" style="left:80%;opacity:.8">' + hog + '</div><div class="wr-wire" style="left:34%;width:170px">' + wire + '</div><div class="wr-wire" style="left:67%;width:140px;opacity:.85">' + wire + '</div><div class="wr-tp"></div>';

  /* siklus kejadian latar */
  wrT(wrFlash, 900);
  wrI(wrFlash, lo ? 3600 : 2100);
  wrI(wrAA, lo ? 5200 : 3200);
  wrT(wrFight, 3200); wrI(wrFight, lo ? 20000 : 14000);
  wrT(wrTroops, 1200); wrI(wrTroops, 10000);
  wrI(wrTankFire, 5600);
  wrI(wrEmber, lo ? 900 : 420);
}

/* ---------- efek dasar ---------- */
function wrPuff(x, y, s, dl, dur) {
  const L = WR.L; if (!L) return;
  run(mk(L, "wr-sm", "left:" + f1(x) + "px;top:" + f1(y) + "px;width:" + f1(s) + "px;height:" + f1(s) + "px"), [
    { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
    { transform: "translate(-50%,-50%) translate(" + f1(rnd(-8, 8)) + "px," + f1(-rnd(14, 30)) + "px) scale(1)", opacity: .75, offset: .3 },
    { transform: "translate(-50%,-50%) translate(" + f1(rnd(-24, 24)) + "px," + f1(-rnd(50, 90)) + "px) scale(2)", opacity: 0 }
  ], { duration: dur || 1600, delay: dl || 0, easing: "ease-out", fill: "both" });
}

function wrBoom(x, y, s) {
  const L = WR.L; if (!L) return; const lo = !!ST.lite;
  run(mk(L, "wr-fb", "left:" + f1(x) + "px;top:" + f1(y) + "px;width:" + f1(s * 2) + "px;height:" + f1(s * 2) + "px"), [
    { transform: "translate(-50%,-50%) scale(.15)", opacity: 1 },
    { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: .28 },
    { transform: "translate(-50%,-50%) scale(1.45)", opacity: 0 }], { duration: 720, easing: "ease-out" });
  ringAt(L, x, y, "or", s / 12, 760);
  for (let i = 0; i < (lo ? 3 : 6); i++) {
    const z = rnd(s * .7, s * 1.3);
    run(mk(L, "wr-sm", "left:" + f1(x + rnd(-s * .5, s * .5)) + "px;top:" + f1(y) + "px;width:" + f1(z) + "px;height:" + f1(z) + "px"), [
      { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
      { transform: "translate(-50%," + f1(-rnd(40, 90) - s) + "px) scale(1.2)", opacity: .9, offset: .35 },
      { transform: "translate(-50%," + f1(-rnd(110, 190) - s) + "px) scale(1.9)", opacity: 0 }], { duration: rnd(1900, 3200), delay: i * 90, easing: "ease-out", fill: "both" });
  }
  for (let i = 0; i < (lo ? 4 : 11); i++) {
    const a = rnd(0, 6.283), d = rnd(s * .8, s * 2.2);
    run(mk(L, "wr-sp", "left:" + f1(x) + "px;top:" + f1(y) + "px"), [
      { transform: "translate(0,0)", opacity: 1 },
      { transform: "translate(" + f1(Math.cos(a) * d) + "px," + f1(Math.sin(a) * d - 14) + "px)", opacity: 1, offset: .45 },
      { transform: "translate(" + f1(Math.cos(a) * d * 1.2) + "px," + f1(Math.sin(a) * d + 40) + "px)", opacity: 0 }], { duration: rnd(600, 1000), easing: "ease-out" });
  }
  const gl = L.querySelector(".wr-glow"); if (gl) gl.animate([{ opacity: .4 }, { opacity: 1, offset: .15 }, { opacity: .4 }], { duration: 800 });
}

/* ledakan di cakrawala dengan gemuruh jauh */
function wrFlash() {
  const L = WR.L; if (!L) return; const W = L.clientWidth, H = L.clientHeight, zh = wrZh();
  wrBoom(rnd(.04, .96) * W, H - zh - rnd(14, 90), rnd(18, 46));
  if (Math.random() < .5) wrT(() => wrBoom(rnd(.04, .96) * W, H - zh - rnd(14, 90), rnd(14, 30)), rnd(250, 600));
  try { SFX.rumble() } catch (e) { }
}

/* tembakan anti-pesawat: peluru pelacak naik, lalu meledak jadi kepulan flak */
function wrAA() {
  const L = WR.L; if (!L) return; const W = L.clientWidth, H = L.clientHeight, zh = wrZh(), lo = !!ST.lite,
    x = rnd(.06, .94) * W, y0 = H - zh - 6, ang = rnd(-.45, .45), len = rnd(.35, .62) * H, dx = Math.sin(ang) * len, dy = -Math.cos(ang) * len, deg = Math.atan2(dy, dx) * 180 / Math.PI;
  for (let i = 0; i < (lo ? 3 : 6); i++) wrT(() => {
    run(mk(L, "wr-tr"), [
      { transform: wrTr(x, y0, deg), opacity: 0 },
      { transform: wrTr(x + dx * .15, y0 + dy * .15, deg), opacity: 1, offset: .12 },
      { transform: wrTr(x + dx, y0 + dy, deg), opacity: .9, offset: .9 },
      { transform: wrTr(x + dx, y0 + dy, deg), opacity: 0 }], { duration: 760, easing: "ease-out" });
    if (i === 2) wrT(() => {
      const fl = mk(L, "wr-flak", "left:" + f1(x + dx) + "px;top:" + f1(y0 + dy) + "px");
      run(fl, [{ transform: "translate(-50%,-50%) scale(.2)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: .25 }, { transform: "translate(-50%,-50%) scale(1.7)", opacity: 0 }], { duration: 1900, easing: "ease-out" });
    }, 740);
  }, i * 110);
}

/* tank menembak: kilatan moncong dan peluru jatuh di kejauhan */
function wrTankFire() {
  const L = WR.L; if (!L) return;
  const ts = [...L.querySelectorAll(".wr-tank")], t = ts[Math.random() * ts.length | 0]; if (!t) return;
  const r = t.getBoundingClientRect(), b = L.getBoundingClientRect(), left = t.classList.contains("l"), d = left ? -1 : 1,
    mx = (left ? r.left : r.right) - b.left - d * 6, my = r.top - b.top + r.height * .3;
  if (mx < 10 || mx > b.width - 10) return;
  run(mk(L, "wr-mz", "left:" + f1(mx) + "px;top:" + f1(my) + "px"), [{ transform: "translate(-30%,-50%) scale(.3)", opacity: 1 }, { transform: "translate(-30%,-50%) scale(1.3)", opacity: 1, offset: .3 }, { transform: "translate(-30%,-50%) scale(1.6)", opacity: 0 }], { duration: 260 });
  wrPuff(mx + d * 10, my, 20, 0, 1300);
  const ex = Math.max(20, Math.min(b.width - 20, mx + d * rnd(220, 480))), ey = b.height - wrZh() - rnd(12, 50);
  run(mk(L, "wr-tr"), [{ transform: wrTr(mx, my, d > 0 ? -4 : 184), opacity: 1 }, { transform: wrTr(ex, ey, d > 0 ? 4 : 176), opacity: 1, offset: .95 }, { transform: wrTr(ex, ey), opacity: 0 }], { duration: 560, easing: "ease-in" });
  wrT(() => { wrBoom(ex, ey, rnd(16, 28)); try { SFX.rumble() } catch (e) { } }, 560);
}

function wrEmber() {
  const L = WR.L; if (!L) return; const W = L.clientWidth, H = L.clientHeight, y = H - wrZh() - rnd(0, 60);
  run(mk(L, "wr-em", "left:" + f1(rnd(0, W)) + "px;top:" + f1(y) + "px"), [
    { transform: "translate(0,0) scale(1)", opacity: 0 }, { opacity: .95, offset: .15 },
    { transform: "translate(" + f1(rnd(-50, 50)) + "px," + f1(-rnd(120, 300)) + "px) scale(.3)", opacity: 0 }], { duration: rnd(2200, 4200), easing: "ease-out" });
}

/* pasukan lari menyeberangi medan */
function wrTroops() {
  const L = WR.L2; if (!L) return; const tp = L.querySelector(".wr-tp"); if (!tp) return;
  const W = L.clientWidth, dir = Math.random() < .5 ? 1 : -1, n = ST.lite ? 2 : 4, k = rnd(.5, .64);
  for (let i = 0; i < n; i++) {
    const w = document.createElement("div");
    w.className = "wk walk" + (dir < 0 ? " rt" : "");
    w.style.cssText = "--s:" + f1(k) + ";--d:-" + (Math.random() * .5).toFixed(2) + "s;left:0;bottom:" + f1(rnd(-8, 8)) + "px;transition:none";
    w.innerHTML = WKS("#5d6d36").replace(/#ffd23f/g, "#4c5a35").replace(/#f0b400/g, "#39452b");
    tp.appendChild(w);
    const x0 = dir > 0 ? -50 - i * 36 : W + 50 + i * 36, x1 = dir > 0 ? W + 60 : -60;
    run(w, [{ translate: f1(x0) + "px 0" }, { translate: f1(x1) + "px 0" }], { duration: rnd(10500, 13500) });
  }
}

/* ---------- pesawat tempur: kejar-kejaran, tertembak, jatuh meledak ---------- */
function wrJet(L, col, dir, sz) {
  const e = mk(L, "wr-jet", "width:" + f1(sz) + "px;color:" + col, '<div class="wr-jf"' + (dir < 0 ? ' style="transform:scaleX(-1)"' : "") + ">" + WR_JET + '<i class="wr-ct"></i></div>');
  return e;
}

function wrFight() {
  const L = WR.L; if (!L) return;
  const W = L.clientWidth, H = L.clientHeight, zh = wrZh(), lo = !!ST.lite, dir = Math.random() < .5 ? 1 : -1, y = rnd(.1, .3) * H, sz = rnd(54, 70), dur = rnd(5600, 6800),
    x0 = dir > 0 ? -120 : W + 120, span = dir > 0 ? W + 240 : -(W + 240), hu = rnd(.42, .58), hx = x0 + span * hu, hd = dur * hu, gap = -dir * sz * 1.6;
  const V = wrJet(L, "#1a1218", dir, sz), C = wrJet(L, "#1d1014", dir, sz * .9);
  run(V, [{ transform: wrTr(x0, y) }, { transform: wrTr(hx, y) }], { duration: hd });
  run(C, [{ transform: wrTr(x0 + gap, y + 6) }, { transform: wrTr(x0 + gap + span, y + 6) }], { duration: dur });
  /* tembakan dari pesawat pengejar */
  for (let i = 0; i < 9; i++) {
    const e = hd - 950 + i * 85, cx = x0 + gap + span * (e / dur) + dir * sz * .5;
    wrT(() => run(mk(L, "wr-tr"), [{ transform: wrTr(cx, y + 14, dir > 0 ? 0 : 180), opacity: 1 }, { transform: wrTr(cx + dir * 230, y + 12, dir > 0 ? 0 : 180), opacity: 0 }], { duration: 300, easing: "ease-out" }), Math.max(0, e));
  }
  /* kena tembak: ledakan di udara, pilot terjun payung, bangkai pesawat jatuh dengan jejak asap */
  wrT(() => {
    wrBoom(hx, y + 8, 26);
    try { SFX.rumble() } catch (e) { }
    const pr = emo(L, "🪂", hx, y + 10, 18);
    run(pr, [{ transform: "translate(0,0) rotate(-8deg)", opacity: 0 }, { opacity: 1, offset: .1 }, { transform: "translate(" + f1(-dir * 40) + "px," + f1((H - zh - y) * .45) + "px) rotate(10deg)", opacity: 1, offset: .55 }, { transform: "translate(" + f1(-dir * 10) + "px," + f1(H - zh - y - 16) + "px) rotate(-6deg)", opacity: 1, offset: .96 }, { opacity: 0 }], { duration: 8500, easing: "ease-in-out" });
    const wr = wrJet(L, "#2a1210", dir, sz); wr.classList.add("burn");
    const gy = H - zh - 8, sx = rnd(150, 240) * dir, N = 14, kf = [], FD = 1900;
    for (let i = 0; i <= N; i++) {
      const u = i / N, px = hx + sx * u, py = y + 8 + u * u * (gy - y - 8);
      kf.push({ transform: wrTr(px, py, dir * (8 + u * 72)) });
      if (i % 2 === 0 && i < N) wrPuff(px, py, rnd(18, 30), u * FD, 1700);
    }
    run(wr, kf, { duration: FD, easing: "linear" });
    wrT(() => {
      const cx = hx + sx;
      wrBoom(cx, gy, 48); wrT(() => wrBoom(cx + rnd(-30, 30), gy - 10, 30), 260);
      try { SFX.rumble() } catch (e) { }
      const col = mk(L, "wr-col", "left:" + f1(cx) + "px;--w:80px;--h:36%;opacity:0;animation-duration:5s");
      col.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .78 }, { opacity: 0 }], { duration: 10000 }).onfinish = () => col.remove();
    }, FD);
  }, hd);
}

/* ---------- serangan dari latar: mengenai menara pemain ---------- */
function warHazStop() {
  if (WR.hv) { clearInterval(WR.hv); WR.hv = null }
  WR.ht.forEach(clearTimeout); WR.ht.clear();
}

/* dipanggil begin(): jadwal sama untuk semua pemain (seed dari kode room dan ronde) */
function warHaz() {
  warHazStop();
  if (!WR.on) return;
  const r = seedRng(code + "w" + me.round + "x"), ev = []; let t = 9000;
  for (let i = 0; i < 45; i++) {
    const x = r(), k = x < .36 ? 2 : x < .72 ? 5 : 1;   /* pesawat nabrak, bom pesawat, kawanan burung */
    ev.push({ t, k, to: WR.ids[Math.floor(r() * WR.ids.length)], n: i });
    t += 7500 + r() * 5500;
  }
  let i = 0;
  WR.hv = setInterval(() => {
    if (!started || ended) return;
    const el = Date.now() - t0;
    while (i < ev.length && ev[i].t <= el) { const e = ev[i++]; if (el - e.t < 3000) warFire(e) }
  }, 200);
}

const WR_TXT = { 2: "PESAWAT JATUH!", 5: "PEMBOMAN!", 1: "KAWANAN BURUNG!" };

function warFire(e) {
  const p = peersNow().find(x => x.id === e.to); if (!p || p.fin) return;
  const t = tws[p.id];
  try { SFX.siren() } catch (er) { }
  if (t && t.el.isConnected) {
    const g = stackGeo(t), x = g.x + g.w / 2, y = Math.max(0, g.y - 4);
    const lb = mk(t.el, "wr-warn", "left:" + f1(x) + "px;top:" + f1(Math.max(0, y - 34)) + "px", "<em>⚠</em><b>" + WR_TXT[e.k] + "</b>");
    lb.animate([{ opacity: 0, transform: "translateX(-50%) scale(.4)" }, { opacity: 1, transform: "translateX(-50%) scale(1.15)", offset: .15 }, { opacity: 1, transform: "translateX(-50%) scale(1)", offset: .3 }, { opacity: .35, offset: .45 }, { opacity: 1, offset: .6 }, { opacity: .35, offset: .75 }, { opacity: 1, offset: .9 }, { opacity: 0 }], { duration: 1300 }).onfinish = () => lb.remove();
    const rt = mk(t.el, "ret", "left:" + f1(x) + "px;top:" + f1(y + 8) + "px");
    run(rt, [{ transform: "translate(-50%,-50%) scale(2.4) rotate(0)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1) rotate(90deg)", opacity: 1, offset: .35 }, { transform: "translate(-50%,-50%) scale(.8) rotate(180deg)", opacity: 1, offset: .9 }, { opacity: 0 }], { duration: 1300 });
  }
  if (p.id === me.id) {
    const al = mk($("scene"), "wr-alert");
    al.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .2, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 1300 }).onfinish = () => al.remove();
  }
  const id = setTimeout(() => { WR.ht.delete(id); warHit(e) }, 1250);
  WR.ht.add(id);
}

function warHit(e) {
  if (ended) return;
  const p = peersNow().find(x => x.id === e.to); if (!p || p.fin) return;
  const s = SK[e.k], a = { s: "war" + e.n, k: e.k, to: e.to, n: s.d, b: (p.sh || p.dg > Date.now()) ? 1 : 0 }, t = tws[a.to];
  if (t) t.sk = { k: a.k, at: performance.now(), by: false };
  if (a.to === me.id) {
    if (ST.txr) skBanner({ name: "Medan Perang" }, p, s);
    $("scene").animate(SHK.concat(SHK), { duration: 700, delay: IMP[a.k] - 200 });
    hit(a);
  } else if (BOTS.some(x => x.id === a.to)) botHit(a);
  skfx(a.to, a.k, !!a.b);
}