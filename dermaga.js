/* dermaga.js: MAP DERMAGA
   Dermaga pelabuhan di musim salju: banyak kapal, derek, mercusuar, kabut tipis, salju turun.
   Tiga tantangan (jadwal dibuat dari seed kode room + ronde, jadi semua pemain melihat kejadian yang sama):
   1. GURITA RAKSASA : muncul dari laut, menyerang 2 menara acak. Melilit 5 detik (ketikan terkunci),
                       setelah lepas pemain jadi PUSING (3 kata berikut hurufnya diacak).
   2. PEMBEKUAN      : 2 menara acak membeku 7 detik (sama seperti skill Beku Total).
   3. BADAI KABUT    : menyapu SEMUA menara, 3 kata berikut berkabut (2 huruf buram) seperti skill Kabut Tebal.
   Gaya CSS ada di dermaga.css. Dimuat setelah script.js dan bencana.js. */
const DM = { on: false, L: null, L2: null, kr: null, kt: "translateY(105%)", busy: 0, tm: new Set(), iv: new Set(), ht: new Set(), hv: null };

const dmT = (f, ms) => { const id = setTimeout(() => { DM.tm.delete(id); if (DM.on) f() }, ms); DM.tm.add(id); return id };
const dmI = (f, ms) => { const id = setInterval(() => { if (DM.on && !document.hidden) f() }, ms); DM.iv.add(id); return id };
const dmH = (f, ms) => { const id = setTimeout(() => { DM.ht.delete(id); f() }, ms); DM.ht.add(id); return id };
const dmZh = () => { const g = DM.L && DM.L.parentNode.querySelector(".ground"); return g ? g.offsetHeight : 200 };
const dmBl = p => !!(p.sh || p.dg > Date.now());

/* ---------- gambar kapal (haluan menghadap kanan) ---------- */
const dmWin = (x, y, w, h, n, g) => { let s = ""; for (let i = 0; i < n; i++) s += '<rect class="dm-wn" x="' + f1(x + i * g) + '" y="' + y + '" width="' + w + '" height="' + h + '" rx=".8"/>'; return s };
const dmPuff = (x, y, d) => '<circle class="dm-pf" cx="' + x + '" cy="' + y + '" r="4" fill="#e8eef4" style="animation-delay:-' + d + 's"/>';
const DM_CC = ["#d9381e", "#2f87e8", "#ffc21a", "#38c6a1", "#8a6bff", "#ff7a30"];

function dmCargo(h, s) {
  let c = "";
  for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) c += '<rect x="' + (58 + i * 14) + '" y="' + (39 - r * 12) + '" width="13" height="11" fill="' + DM_CC[(i * 2 + r * 3 + s) % 6] + '" stroke="rgba(0,0,0,.28)" stroke-width=".8"/><rect x="' + (58 + i * 14) + '" y="' + (39 - r * 12) + '" width="13" height="2" fill="rgba(255,255,255,.7)"/>';
  return '<svg viewBox="0 0 200 90"><path d="M6 52H194L176 80H24Z" fill="' + h + '"/><path d="M17 70H184L176 80H24Z" fill="rgba(0,0,0,.3)"/><rect x="6" y="50" width="188" height="3" fill="#f4faff"/>' + c +
    '<rect x="22" y="20" width="32" height="31" fill="#eef2f6"/><rect x="20" y="18" width="36" height="3" fill="#fff"/>' + dmWin(26, 26, 4, 5, 5, 5.5) + dmWin(26, 36, 4, 5, 5, 5.5) +
    '<rect x="33" y="6" width="11" height="13" fill="#c2492f"/><rect x="33" y="6" width="11" height="3" fill="#222"/>' + dmPuff(39, 4, 0) + dmPuff(39, 4, 1.6) +
    '<line x1="190" y1="50" x2="190" y2="38" stroke="#555" stroke-width="1.4"/><circle class="dm-lt" cx="190" cy="37" r="2" fill="#ff5a4a"/></svg>';
}
function dmFerry(h) {
  return '<svg viewBox="0 0 200 90"><path d="M8 56H190L172 80H22Z" fill="' + h + '"/><rect x="8" y="54" width="182" height="3" fill="#f4faff"/>' +
    '<rect x="20" y="42" width="150" height="14" rx="2" fill="#f7fafc"/><rect x="18" y="40" width="154" height="3" fill="#fff"/>' + dmWin(26, 46, 5, 5, 17, 8.4) +
    '<rect x="34" y="30" width="118" height="12" rx="2" fill="#eef3f8"/><rect x="32" y="28" width="122" height="3" fill="#fff"/>' + dmWin(40, 33, 5, 5, 13, 8.8) +
    '<rect x="58" y="18" width="62" height="12" rx="2" fill="#e4ebf2"/><rect x="56" y="16" width="66" height="3" fill="#fff"/>' + dmWin(63, 21, 6, 5, 8, 7.2) +
    '<rect x="132" y="12" width="14" height="16" fill="#d9381e"/><rect x="132" y="12" width="14" height="3" fill="#222"/>' + dmPuff(139, 10, 0) + dmPuff(139, 10, 1.4) +
    '<line x1="90" y1="16" x2="90" y2="4" stroke="#555" stroke-width="1.4"/><circle class="dm-lt" cx="90" cy="3" r="2" fill="#ffd23f"/></svg>';
}
function dmSail(s) {
  return '<svg viewBox="0 0 80 90"><path d="M6 66H74L63 80H15Z" fill="#7a4b2a"/><rect x="6" y="64" width="68" height="3" fill="#f4faff"/><line x1="38" y1="8" x2="38" y2="64" stroke="#4a3a2a" stroke-width="2"/>' +
    '<path d="M36 10V60H12Z" fill="#fafcff"/><path d="M41 18V60H68Z" fill="' + s + '"/><circle class="dm-lt" cx="38" cy="7" r="2" fill="#ffd23f"/></svg>';
}
function dmTug(h) {
  return '<svg viewBox="0 0 100 60"><path d="M4 38H94L84 54H12Z" fill="' + h + '"/><rect x="4" y="36" width="90" height="3" fill="#f4faff"/><rect x="28" y="20" width="30" height="17" fill="#f2f6fa"/><rect x="26" y="18" width="34" height="3" fill="#fff"/>' + dmWin(32, 25, 4, 5, 4, 6.5) +
    '<rect x="62" y="8" width="9" height="14" fill="#222"/><rect x="62" y="8" width="9" height="3" fill="#d9381e"/>' + dmPuff(66.5, 6, 0) + dmPuff(66.5, 6, 1.2) + '<circle class="dm-lt" cx="42" cy="16" r="2" fill="#ff5a4a"/></svg>';
}
const DM_SHIPS = [
  [() => dmCargo("#2b4a6b", 0), 15, 11, 150, -30, 0], [() => dmFerry("#27406a"), 9, 12, 110, -70, 1], [() => dmSail("#5fb2ff"), 6, 5, 90, -10, 0],
  [() => dmTug("#c2492f"), 3, 6, 80, -55, 1], [() => dmCargo("#7a2e2a", 2), 11, 10, 170, -120, 1], [() => dmSail("#ff7a30"), 14, 4, 130, -90, 0], [() => dmFerry("#1f6a5a"), 17, 8, 140, -40, 0]
];
const DM_MOOR = [[() => dmCargo("#35506e", 4), 4, 13, 3, 5], [() => dmFerry("#6a2a2a"), 5, 12, 78, 7], [() => dmTug("#2f6a8f"), 1, 6, 64, 9]];

/* ---------- pemandangan jauh: pegunungan salju, gudang, derek ---------- */
const DM_FAR = '<svg viewBox="0 0 1000 100" preserveAspectRatio="xMidYMax slice"><path d="M0 100V60L90 28L150 50L240 18L330 54L420 36L520 58L610 24L700 52L800 32L900 56L1000 38V100Z" fill="#9fb4c8"/>' +
  '<path d="M240 18L222 34L240 30L256 36Z M610 24L592 40L610 36L626 42Z M90 28L74 42L92 38L104 44Z M800 32L784 46L802 42L816 48Z" fill="#fff"/>' +
  '<g fill="#7d8fa3"><rect x="30" y="78" width="90" height="22"/><rect x="260" y="82" width="70" height="18"/><rect x="430" y="76" width="110" height="24"/><rect x="660" y="80" width="80" height="20"/><rect x="860" y="78" width="100" height="22"/></g>' +
  '<g fill="#f4faff"><rect x="30" y="76" width="90" height="3"/><rect x="260" y="80" width="70" height="3"/><rect x="430" y="74" width="110" height="3"/><rect x="660" y="78" width="80" height="3"/><rect x="860" y="76" width="100" height="3"/></g>' +
  '<g stroke="#5f6f82" stroke-width="3" fill="none"><path d="M150 100V54H220V100M140 54H236M220 54L250 64"/><path d="M580 100V50H650V100M570 50H666M650 50L682 60"/><path d="M790 100V58H830V100M782 58H846"/></g></svg>';
const DM_LH = '<svg viewBox="0 0 30 100"><path d="M8 96L11 34H19L22 96Z" fill="#f4f6fa"/><path d="M9 82L9.8 64H20.2L21 82Z M10.2 56L10.7 44H19.3L19.8 56Z" fill="#d9381e"/><rect x="7" y="31" width="16" height="3" fill="#3a3f4a"/><rect x="11" y="21" width="8" height="10" fill="#ffe58a"/><path d="M9 21L15 12L21 21Z" fill="#c2392b"/><path d="M9 21L15 12L21 21Z" fill="#fff" opacity=".55" transform="translate(0,-1) scale(1 .35) translate(0,19)"/></svg><i class="dm-bm"></i>';

/* ---------- gurita raksasa ---------- */
function dmKrSvg() {
  const T = (d, r, dl, w) => '<g class="dm-tn" style="--r:' + r + 'deg;--dl:' + dl + 's"><path d="' + d + '" fill="none" stroke="#2a0a1d" stroke-width="' + (w + 7) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#7a2250" stroke-width="' + w + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#d8688f" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" opacity=".8"/></g>';
  return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMin meet"><defs><radialGradient id="dmkg" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#b8407a"/><stop offset=".6" stop-color="#7a2250"/><stop offset="1" stop-color="#3a0f2b"/></radialGradient></defs>' +
    T("M150 146C92 156 50 124 40 72C36 42 60 26 80 38", 7, -.2, 20) + T("M250 146C308 156 350 124 360 72C364 42 340 26 320 38", 7, -.9, 20) +
    T("M165 154C122 194 72 192 42 152C30 136 38 118 54 122", 6, -.5, 18) + T("M235 154C278 194 328 192 358 152C370 136 362 118 346 122", 6, -1.2, 18) +
    T("M180 160C160 214 112 236 82 266", 5, -.7, 17) + T("M220 160C240 214 288 236 318 266", 5, -.1, 17) +
    T("M194 164C188 222 170 250 150 288", 4, -1.4, 16) + T("M206 164C212 222 230 250 250 288", 4, -.4, 16) +
    '<ellipse cx="200" cy="82" rx="80" ry="72" fill="url(#dmkg)" stroke="#2a0a1d" stroke-width="5"/><ellipse cx="200" cy="132" rx="72" ry="40" fill="#8e2d5e" stroke="#2a0a1d" stroke-width="5"/>' +
    '<g fill="#5e1840" opacity=".7"><circle cx="170" cy="48" r="7"/><circle cx="216" cy="38" r="9"/><circle cx="238" cy="70" r="6"/><circle cx="188" cy="72" r="5"/><circle cx="160" cy="88" r="6"/></g>' +
    '<path d="M148 112Q165 100 186 114M252 112Q235 100 214 114" fill="none" stroke="#2a0a1d" stroke-width="6" stroke-linecap="round"/>' +
    '<g class="dm-ey"><circle cx="166" cy="124" r="14" fill="#ffe36b" stroke="#2a0a1d" stroke-width="4"/><circle cx="234" cy="124" r="14" fill="#ffe36b" stroke="#2a0a1d" stroke-width="4"/></g>' +
    '<rect x="162" y="114" width="8" height="20" rx="3" fill="#150510"/><rect x="230" y="114" width="8" height="20" rx="3" fill="#150510"/></svg>';
}

/* naik/turun gurita (fraksi tinggi wadahnya) */
function dmKr(to, ms, ez) {
  const k = DM.kr; if (!k) return;
  const a = k.animate([{ transform: DM.kt }, { transform: "translateY(" + to + "%)" }], { duration: ms, easing: ez || "ease-out", fill: "forwards" });
  DM.kt = "translateY(" + to + "%)";
  a.onfinish = () => { if (DM.kr === k) k.style.transform = DM.kt; a.cancel() };
}

/* ---------- membangun / membongkar peta ---------- */
function dmOff() {
  dmHazStop();
  DM.on = false;
  DM.tm.forEach(clearTimeout); DM.tm.clear();
  DM.iv.forEach(clearInterval); DM.iv.clear();
  [DM.L, DM.L2].forEach(e => { if (e) e.remove() });
  DM.L = DM.L2 = DM.kr = null; DM.busy = 0;
  const sc = document.getElementById("scene");
  if (sc) { sc.classList.remove("dock", "lite"); sc.querySelectorAll(".dm-tt,.dm-alert,.dm-warn,.dm-fr,.dm-storm").forEach(x => x.remove()) }
}

function dmOn(mp) {
  dmOff();
  const sc = $("scene"); sc.classList.toggle("dock", mp === 3);
  if (mp !== 3) return;
  const lo = !!ST.lite; sc.classList.toggle("lite", lo);
  DM.on = true; DM.busy = 0; DM.kt = "translateY(105%)";
  const L = mk(sc, "dm-lay"), L2 = mk(sc, "dm-lay2");
  sc.insertBefore(L, sc.querySelector(".towers")); sc.insertBefore(L2, $("crew"));
  DM.L = L; DM.L2 = L2;
  let wv = "", fg = "", ic = "", sh = "", sn = "";
  for (let i = 0; i < (lo ? 2 : 4); i++) wv += '<i class="dm-wv" style="top:' + (6 + i * 20) + "%;opacity:" + f1(.55 - i * .1) + ";animation-duration:" + (9 + i * 3) + "s;animation-direction:" + (i % 2 ? "reverse" : "normal") + '"></i>';
  [[20, 6, .5, 16], [16, 14, .4, 22], [24, 1, .45, 19]].slice(0, lo ? 2 : 3).forEach(([h, b, a, d]) => fg += '<i class="dm-fg" style="--h:' + h + "%;--b:" + b + "%;--a:" + a + ";--d:" + d + 's"></i>');
  [[5, 90, 9], [10, 60, 12], [2, 120, 8]].slice(0, lo ? 1 : 3).forEach(([y, w, d]) => ic += '<i class="dm-ic" style="--y:' + y + "%;--w:" + w + "px;--d:" + d + 's"></i>');
  DM_SHIPS.slice(0, lo ? 4 : 7).forEach(([f, y, w, d, dl, rv]) => sh += '<div class="dm-sh' + (rv ? " r" : "") + '" style="--w:clamp(' + Math.round(w * 5) + "px," + w + "vw," + Math.round(w * 18) + "px);--y:" + y + "%;--d:" + d + "s;--dl:" + dl + 's"><div class="dm-bob" style="--bd:' + f1(rnd(4, 7)) + 's;animation-delay:-' + f1(rnd(0, 5)) + 's">' + f(1) + "</div></div>");
  DM_MOOR.slice(0, lo ? 2 : 3).forEach(([f, y, w, x, d]) => sh += '<div class="dm-sh m" style="--w:clamp(' + Math.round(w * 5) + "px," + w + "vw," + Math.round(w * 18) + "px);--y:" + y + "%;--x:" + x + '%"><div class="dm-bob" style="--bd:' + d + 's">' + f(1) + "</div></div>");
  L.innerHTML = '<div class="dm-far">' + DM_FAR + '</div><div class="dm-lh">' + DM_LH + "</div>" +
    '<div class="dm-krc"><div class="dm-kr">' + dmKrSvg() + "</div></div>" +
    '<div class="dm-sea">' + wv + "</div>" + ic + sh + fg;
  for (let i = 0; i < (lo ? 24 : 60); i++) sn += '<i class="dm-sn" style="--x:' + f1(rnd(0, 100)) + "%;--s:" + f1(rnd(2, 5)) + "px;--o:" + f1(rnd(.5, 1)) + ";--d:" + f1(rnd(6, 12)) + "s;--dl:-" + f1(rnd(0, 12)) + "s;--sw:" + f1(rnd(-60, 60)) + 'px"></i>';
  L2.innerHTML = '<i class="dm-vg"></i>' + sn + (lo ? "" : '<i class="dm-fg" style="--h:16%;--b:0%;--a:.28;--d:13s"></i>');
  DM.kr = L.querySelector(".dm-kr");
  /* gurita sesekali mengintip dari dalam laut sebagai pertanda */
  dmI(() => { if (DM.busy) return; dmKr(8, 900); dmT(() => { if (!DM.busy) dmKr(105, 1000, "ease-in") }, 2600) }, 11000);
}

/* ---------- jadwal tantangan: sama untuk semua pemain ---------- */
function dmHazStop() {
  if (DM.hv) { clearInterval(DM.hv); DM.hv = null }
  DM.ht.forEach(clearTimeout); DM.ht.clear();
}

function dmHaz() {
  dmHazStop();
  if (!DM.on) return;
  const r = seedRng(code + "d" + me.round + "m"), ev = []; let t = 8000, prev = "";
  for (let i = 0; i < 30; i++) {
    let k; do { const x = r(); k = x < .36 ? "k" : x < .66 ? "f" : "g" } while (k === prev);   /* gurita, beku, kabut */
    prev = k; ev.push({ t, k, n: i }); t += 14000 + r() * 5000;
  }
  let i = 0;
  DM.hv = setInterval(() => {
    if (!started || ended) return;
    const el = Date.now() - t0;
    while (i < ev.length && ev[i].t <= el) { const e = ev[i++]; if (el - e.t < 3000) dmFire(e) }
  }, 200);
}

/* korban dipilih dengan acakan ber-seed supaya sama di semua layar */
function dmVic(e, n) {
  const ps = peersNow().filter(p => !p.fin && tws[p.id]), r = seedRng(code + "dv" + e.n + me.round);
  for (let i = ps.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ps[i], ps[j]] = [ps[j], ps[i]] }
  return ps.slice(0, n);
}

function dmPos(p) {
  const t = tws[p.id]; if (!t || !t.el.isConnected) return null;
  const b = $("scene").getBoundingClientRect(), r = t.el.getBoundingClientRect(), s = t.stack.getBoundingClientRect(), g = stackGeo(t);
  return { t, x: r.left - b.left + r.width / 2, top: Math.max(0, s.top - b.top), g, sx: g.x + g.w / 2, sy: g.y + g.h * .35 };
}

function dmBanner(txt, col, glow) {
  const b = mk($("scene"), "dm-tt", "background:" + col + ";box-shadow:0 4px 0 rgba(0,0,0,.3),0 0 22px " + glow, txt);
  b.animate([{ opacity: 0, transform: "translateX(-50%) scale(.5)" }, { opacity: 1, transform: "translateX(-50%) scale(1.1)", offset: .14 }, { opacity: 1, transform: "translateX(-50%) scale(1)", offset: .28 },
    { opacity: .5, offset: .45 }, { opacity: 1, offset: .6 }, { opacity: .5, offset: .75 }, { opacity: 1, offset: .9 }, { opacity: 0, transform: "translateX(-50%) scale(1)" }], { duration: 2000 }).onfinish = () => b.remove();
}
function dmAlert(col) {
  const al = mk($("scene"), "dm-alert", "--c:" + col);
  al.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .2, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 1300 }).onfinish = () => al.remove();
}
function dmChip(q, ic, tx, col, glow) {
  const w = mk($("scene"), "dm-warn", "left:" + f1(q.x) + "px;top:" + f1(Math.max(8, q.top - 26)) + "px;--c:" + col + ";--g:" + glow, "<em>" + ic + "</em>" + tx);
  w.animate([{ opacity: 0, transform: "translateX(-50%) scale(.4)" }, { opacity: 1, transform: "translateX(-50%) scale(1.15)", offset: .18 }, { opacity: .5, transform: "translateX(-50%) scale(1)", offset: .4 },
    { opacity: 1, offset: .6 }, { opacity: .5, offset: .8 }, { opacity: 0, transform: "translateX(-50%) scale(1)" }], { duration: 1500 }).onfinish = () => w.remove();
}

function dmFire(e) {
  if (!DM.on || ended) return;
  try { SFX.siren() } catch (x) { }
  ({ k: dmKraken, f: dmFreeze, g: dmFog })[e.k](e);
}

/* kerusakan/efek pada pemain: dihitung oleh klien masing-masing (pemain sendiri dan bot miliknya), tepat saat efek mengenai */
function dmApply(p, k, at) {
  dmH(() => {
    if (ended || !DM.on) return;
    const q = peersNow().find(x => x.id === p.id); if (!q || q.fin) return;
    const s = SK[k], bl = dmBl(q), a = { s: "dm" + k + Date.now(), k, to: q.id, n: s.d, b: bl ? 1 : 0 };
    /* gurita: setelah lilitan 5 detik lepas, korban pusing */
    const dzMs = k === 10 && !bl ? IMP[10] + 40 + s.lk * 1000 + 150 : 0;
    if (q.id === me.id) {
      hit(a);
      if (dzMs) dmH(() => { if (ended || over || !started) return; dmDizzy() }, dzMs);
    } else {
      const b = BOTS.find(x => x.id === q.id);
      if (b) { botHit(a); if (dzMs) dmH(() => { if (!ended) b.dis = 3 }, dzMs) }
    }
  }, Math.max(0, at - IMP[k] - 40));
}
function dmDizzy() { dz = { k: 9, n: 3 }; drawWord(); if (ST.txr) popup("🌀 HURUF PUSING!") }

/* tentakel gurita di latar sendiri yang menjulur ke dasar menara korban.
   Pangkal tiap tentakel (koordinat viewBox gurita 400x300), indeks sesuai urutan <g class="dm-tn"> */
const DM_ROOT = [[150, 146], [250, 146], [165, 154], [235, 154], [180, 160], [220, 160]];
function dmReach(q, used) {
  const L = DM.L, kc = L && L.querySelector(".dm-krc"); if (!L || !kc) return;
  const lb = L.getBoundingClientRect(), r = kc.getBoundingClientRect(), W = L.clientWidth, H = L.clientHeight;
  const sc = Math.min(r.width / 400, r.height / 300), ox = r.left - lb.left + (r.width - 400 * sc) / 2, oy = r.top - lb.top;
  const left = q.x < W / 2, pref = left ? [0, 2, 4] : [1, 3, 5];
  let ix = pref.find(i => !used.has(i)); if (ix == null) ix = [0, 1, 2, 3, 4, 5].find(i => !used.has(i)); if (ix == null) ix = pref[0];
  used.add(ix);
  const sx = ox + DM_ROOT[ix][0] * sc, sy = oy + DM_ROOT[ix][1] * sc, ex = q.x, ey = H - dmZh() + 4, dir = ex < sx ? -1 : 1;
  const d = "M" + f1(sx) + " " + f1(sy) + " C" + f1(sx + dir * 140 * sc) + " " + f1(sy - 110 * sc) + " " + f1(ex + dir * 90) + " " + f1(ey - 190) + " " + f1(ex) + " " + f1(ey);
  const wo = f1(27 * sc), wb = f1(20 * sc);
  const g = mk(L, "dm-rch", "", '<svg width="' + W + '" height="' + H + '" style="overflow:visible"><path pathLength="1" d="' + d + '" fill="none" stroke="#2a0a1d" stroke-width="' + wo + '" stroke-linecap="round" stroke-dasharray="1 1" stroke-dashoffset="1"/><path pathLength="1" d="' + d + '" fill="none" stroke="#7a2250" stroke-width="' + wb + '" stroke-linecap="round" stroke-dasharray="1 1" stroke-dashoffset="1"/><path pathLength="1" d="' + d + '" fill="none" stroke="#d8688f" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" opacity=".8"/></svg>');
  const ps = g.querySelectorAll("path"), tn = DM.kr && DM.kr.querySelectorAll(".dm-tn")[ix];
  /* tentakel aslinya disembunyikan, diganti tentakel panjang yang tumbuh dari pangkal yang sama */
  if (tn) tn.style.opacity = 0;
  ps[0].animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, easing: "ease-out", fill: "forwards" });
  ps[1].animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, easing: "ease-out", fill: "forwards" });
  ps[2].setAttribute("stroke-dashoffset", 0);
  dmT(() => { ps[0].animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -1 }], { duration: 700, easing: "ease-in", fill: "forwards" }); ps[1].animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -1 }], { duration: 700, easing: "ease-in", fill: "forwards" }); ps[2].style.display = "none" }, 5200);
  dmT(() => { g.remove(); if (tn) tn.style.opacity = "" }, 6100);
}

/* 1. GURITA RAKSASA: 2 menara acak dililit 5 detik, lalu pusing */
function dmKraken(e) {
  const ps = dmVic(e, 2); if (!ps.length) return;
  DM.busy = 1;
  dmBanner("🐙 GURITA RAKSASA MENYERANG!", "rgba(110,30,90,.92)", "rgba(210,90,170,.85)");
  dmAlert("rgba(150,30,120,.55)");
  dmKr(0, 1100, "cubic-bezier(.2,1.3,.4,1)"); try { SFX.dis("rumble") } catch (x) { }
  ps.forEach(p => { const q = dmPos(p); if (q) dmChip(q, "🐙", "Gurita!", "#8a2a64", "rgba(210,90,170,.9)") });
  dmT(() => {
    const used = new Set();
    ps.forEach(p => {
      const q = dmPos(p); if (!q) return;
      dmReach(q, used);
      q.t.sk = { k: 10, at: performance.now(), by: false };
      skfx(p.id, 10, dmBl(p));
      dmApply(p, 10, IMP[10]);
    });
  }, 1400);
  dmT(() => { dmKr(105, 1300, "ease-in"); DM.busy = 0 }, 7000);
}

/* 2. PEMBEKUAN: 2 menara acak membeku 7 detik (sama dengan skill Beku Total) */
function dmFreeze(e) {
  const ps = dmVic(e, 2); if (!ps.length) return;
  dmBanner("🧊 PEMBEKUAN! 2 MENARA MEMBEKU", "rgba(40,100,170,.92)", "rgba(150,220,255,.9)");
  dmAlert("rgba(110,190,255,.55)");
  ps.forEach(p => { const q = dmPos(p); if (q) dmChip(q, "🧊", "Beku!", "#2f87e8", "rgba(150,225,255,.9)") });
  if (ps.some(p => p.id === me.id) && DM.on) { const f = mk($("scene"), "dm-fr"); f.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: .6, offset: .7 }, { opacity: 0 }], { duration: 2600, delay: 1300 }).onfinish = () => f.remove() }
  dmT(() => {
    ps.forEach(p => {
      const q = dmPos(p); if (!q) return;
      q.t.sk = { k: 11, at: performance.now(), by: false };
      skfx(p.id, 11, dmBl(p));
      dmApply(p, 11, IMP[11]);
    });
  }, 1300);
}

/* 3. BADAI KABUT: menyapu seluruh menara, 3 kata berikut berkabut */
function dmFog(e) {
  const ps = peersNow().filter(p => !p.fin && tws[p.id]); if (!ps.length) return;
  dmBanner("🌫️ BADAI KABUT! SEMUA MENARA TERKENA", "rgba(90,110,134,.92)", "rgba(220,234,248,.85)");
  dmAlert("rgba(200,215,232,.6)");
  dmT(() => dmStorm(ps, e), 1400);
}

function dmStorm(ps, e) {
  const sc = $("scene"), W = sc.clientWidth, lo = !!ST.lite;
  try { SFX.skill("fog", { I: 1900, mine: true }) } catch (x) { }
  dim(.5, 3600, "rgba(214,226,238,.62)", sc);
  const S = mk(sc, "dm-storm");
  for (let i = 0; i < (lo ? 4 : 7); i++) run(mk(S, "dm-sw", "top:" + f1(rnd(4, 70)) + "%;height:" + f1(rnd(14, 30)) + "%;opacity:0"),
    [{ transform: "translateX(-100%)", opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .75 }, { transform: "translateX(100%)", opacity: 0 }], { duration: rnd(2200, 3200), delay: i * 200, easing: "ease-in-out" });
  for (let i = 0; i < (lo ? 14 : 36); i++) run(mk(S, "dm-st", "top:" + f1(rnd(2, 92)) + "%;width:" + f1(rnd(90, 240)) + "px"),
    [{ transform: "translateX(-300px)", opacity: 0 }, { opacity: 1, offset: .15 }, { transform: "translateX(" + (W + 300) + "px)", opacity: 0 }], { duration: rnd(450, 800), delay: rnd(0, 2600) });
  dmT(() => S.remove(), 4400);
  ps.forEach((p, i) => {
    const q = dmPos(p); if (!q) return; const ts = 1500 + i * 170;
    q.t.sk = { k: 8, at: performance.now(), by: false };
    dmApply(p, 8, ts);
    if (dmBl(p)) { dmT(() => shieldHit(q.t, q.sx, q.sy), ts); return }
    q.t.stack.animate([{ filter: "blur(0)" }, { filter: "blur(5px)", offset: .25 }, { filter: "blur(5px)", offset: .75 }, { filter: "blur(0)" }], { duration: 2400, delay: Math.max(0, ts - 300) });
    for (let j = 0; j < (lo ? 1 : 3); j++) run(emo(q.t.el, "🌫️", q.sx + rnd(-q.g.w * .6, q.g.w * .6), q.g.y + rnd(0, q.g.h), rnd(40, 62)),
      [{ transform: "translateX(-40px) scale(.4)", opacity: 0 }, { transform: "translateX(0) scale(1)", opacity: .9, offset: .35 }, { transform: "translateX(50px) scale(1.15)", opacity: 0 }], { duration: 2300, delay: ts - 500 + j * 90 });
  });
}