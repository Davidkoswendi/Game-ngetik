/* air.js: skill PESAWAT NABRAK & BOM PESAWAT
   Jet tempur dan pembom bergaya medan perang (SVG): jet terbakar lalu menghantam menara,
   pembom melintas dan menjatuhkan bom yang meluncur balistik. Dimuat setelah script.js,
   dipanggil dari skfx() (memakai mk, run, rnd, ringAt). */
let AIR_N = 0;
const AIR_DEG = 180 / Math.PI,
  airF = n => Math.round(n * 10) / 10,
  airRun = (e, kf, o) => run(e, kf, Object.assign({ fill: "both" }, o));

/* ---------- gambar ---------- */
function airJet(burn) {
  const g = "aj" + (AIR_N++);
  return '<svg viewBox="0 0 132 46" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<linearGradient id="' + g + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d9a82"/><stop offset=".5" stop-color="#58654f"/><stop offset="1" stop-color="#2b3226"/></linearGradient>' +
    '<linearGradient id="' + g + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5642"/><stop offset="1" stop-color="#242b20"/></linearGradient>' +
    '<linearGradient id="' + g + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f2ff"/><stop offset=".55" stop-color="#4b86b5"/><stop offset="1" stop-color="#1b3550"/></linearGradient></defs>' +
    '<path d="M16 21L5 12H19L30 19Z" fill="#2a3126"/>' +
    '<path d="M22 19L14 2L28 1L48 17Z" fill="url(#' + g + 'a)"/><path d="M17.2 8H36.7L41 11.5H18.9Z" fill="#e8892b"/>' +
    '<path d="M3 20.5L9 17.5L36 16.5L66 15.5L92 17L112 20L131 23.5L112 26L90 28.5L56 29.5L22 28L8 25.5L3 24Z" fill="url(#' + g + 'a)"/>' +
    '<path d="M30 18Q44 15 52 19Q40 22 30 21Z" fill="rgba(34,42,28,.5)"/><path d="M92 22Q104 21 112 24Q100 27 90 26Z" fill="rgba(34,42,28,.45)"/>' +
    '<path d="M112 20L131 23.5L112 26Z" fill="#30382b"/>' +
    '<path d="M12 25L3 34H20L32 28Z" fill="url(#' + g + 'b)"/>' +
    '<path d="M56 27L36 43L66 44L92 28.5Z" fill="url(#' + g + 'b)"/><path d="M56 27L36 43" stroke="rgba(255,255,255,.25)" stroke-width="1"/>' +
    '<rect x="40" y="42.5" width="24" height="2.6" rx="1.3" fill="#cfd1c8"/><path d="M64 42.5L69 43.8L64 45.1Z" fill="#bb2d25"/>' +
    '<path d="M66 24L88 25.5L85 31L66 29.5Z" fill="#14180f"/>' +
    '<path d="M80 17.2Q93 7 108 20.4L82 19.6Z" fill="url(#' + g + 'c)" stroke="#161b12" stroke-width="1"/>' +
    '<path d="M86 15Q94 11.5 102 17" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M12 18L62 16L100 19" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>' +
    '<path d="M38 16.7V28M62 15.7V29.5M76 16V25" stroke="rgba(0,0,0,.28)" stroke-width=".8"/>' +
    '<circle cx="50" cy="22.5" r="4.4" fill="#e9e6d6"/><circle cx="50" cy="22.5" r="2.5" fill="#c3312a"/>' +
    '<path d="M3 19.5L10 18.5V26L3 25Z" fill="#15180f"/><path d="M3 20.5L1 21V24L3 24.5Z" fill="#f08a2e"/>' +
    (burn ? '<path d="M44 20Q56 16 70 20Q60 26 46 25Z" fill="rgba(10,8,6,.55)"/><circle cx="72" cy="21" r="2.6" fill="#ff8a24"/><path d="M26 21L34 19.5L33 24Z" fill="rgba(10,8,6,.6)"/>' : "") +
    "</svg>";
}

function airBomberSvg() {
  const g = "ab" + (AIR_N++);
  return '<svg viewBox="0 0 170 52" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<linearGradient id="' + g + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8c76"/><stop offset=".5" stop-color="#4d5a46"/><stop offset="1" stop-color="#262d22"/></linearGradient>' +
    '<linearGradient id="' + g + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#434f3c"/><stop offset="1" stop-color="#20271c"/></linearGradient>' +
    '<linearGradient id="' + g + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f2ff"/><stop offset=".55" stop-color="#4b86b5"/><stop offset="1" stop-color="#1b3550"/></linearGradient></defs>' +
    '<path d="M12 23L8 2L26 1L56 20Z" fill="url(#' + g + 'a)"/><path d="M9 7H35.5L43.4 12H10Z" fill="#e8892b"/>' +
    '<path d="M3 25L12 21.5L50 19.5L100 18.5L140 20.5L169 26.5L140 30L100 32L50 32L12 29Z" fill="url(#' + g + 'a)"/>' +
    '<path d="M14 28L3 36H26L42 30Z" fill="url(#' + g + 'b)"/>' +
    '<path d="M42 31.5H70L68 36H44Z" fill="#0f120c"/>' +
    '<path d="M74 30L46 48L98 49L128 31Z" fill="url(#' + g + 'b)"/><path d="M74 30L46 48" stroke="rgba(255,255,255,.22)" stroke-width="1"/>' +
    '<path d="M64 38H100L102 46H66Z" fill="#2c3327"/><ellipse cx="101" cy="42" rx="2.6" ry="4.2" fill="#0f120c"/>' +
    '<rect x="62" y="38.5" width="4" height="7" fill="#15180f"/><rect x="60" y="40" width="2.5" height="4" fill="#f08a2e"/>' +
    '<path d="M138 21.5Q148 14 160 24.5L140 24Z" fill="url(#' + g + 'c)" stroke="#161b12" stroke-width="1"/>' +
    '<path d="M143 19.5Q150 16.5 156 22" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M10 21L50 19.5L100 18.8" fill="none" stroke="rgba(255,255,255,.26)" stroke-width="1.2"/>' +
    '<path d="M60 19V32M96 18.5V32M120 19.5V31" stroke="rgba(0,0,0,.28)" stroke-width=".8"/>' +
    '<circle cx="28" cy="26" r="4.4" fill="#e9e6d6"/><circle cx="28" cy="26" r="2.5" fill="#c3312a"/>' +
    '<path d="M3 24L9 23V28L3 28Z" fill="#15180f"/>' +
    "</svg>";
}

function airBombSvg() {
  const g = "ao" + (AIR_N++);
  return '<svg viewBox="0 0 40 14" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8a62"/><stop offset=".55" stop-color="#4b5738"/><stop offset="1" stop-color="#252c1b"/></linearGradient></defs>' +
    '<path d="M1 7L0 .5L9 3ZM1 7L0 13.5L9 11Z" fill="#3a4231"/><rect x="4" y="2.5" width="3" height="9" fill="#4a5442"/>' +
    '<path d="M7 3Q26 .5 36 6L38 7L36 8Q26 13.5 7 11Z" fill="url(#' + g + ')"/>' +
    '<rect x="17" y="1.8" width="3" height="10.4" rx="1" fill="#e5b92a" opacity=".92"/>' +
    '<path d="M33 4Q38 6.2 38 7Q38 7.8 33 10Z" fill="#8c2a22"/>' +
    '<path d="M10 4Q22 2.2 32 5" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/></svg>';
}

const AIR_WING = '<svg viewBox="0 0 34 14" xmlns="http://www.w3.org/2000/svg"><path d="M0 12L22 0L34 2L14 14Z" fill="#4d5946"/><path d="M0 12L22 0" stroke="rgba(255,255,255,.3)" stroke-width="1"/><path d="M20 3L26 6L22 10Z" fill="rgba(10,8,6,.5)"/></svg>';

/* ---------- efek dasar ---------- */
function airPuff(el, x, y, z, dur, dl, rise, cls) {
  const p = mk(el, "air-sm " + (cls || ""), "left:" + airF(x - z / 2) + "px;top:" + airF(y - z / 2) + "px;width:" + airF(z) + "px;height:" + airF(z) + "px");
  airRun(p, [
    { transform: "translate(0,0) scale(.3)", opacity: 0 },
    { transform: "translate(" + airF(rnd(-8, 8)) + "px," + airF(-rise * .45) + "px) scale(1)", opacity: .9, offset: .25 },
    { transform: "translate(" + airF(rnd(-20, 20)) + "px," + airF(-rise) + "px) scale(1.9)", opacity: 0 }
  ], { duration: dur, delay: dl || 0, easing: "ease-out" });
}

function airSpark(el, x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.283), d = rnd(14, 46);
    airRun(mk(el, "air-sp", "left:" + airF(x) + "px;top:" + airF(y) + "px"), [
      { transform: "translate(0,0)", opacity: 1 },
      { transform: "translate(" + airF(Math.cos(a) * d) + "px," + airF(Math.sin(a) * d + 16) + "px)", opacity: 0 }
    ], { duration: rnd(350, 650), easing: "ease-out" });
  }
}

function airFire(el, x, y, s, dur, dl) {
  const f = mk(el, "air-fire", "left:" + airF(x) + "px;top:" + airF(y) + "px;width:" + airF(s) + "px;height:" + airF(s * 1.6) + "px");
  airRun(f, [
    { transform: "translate(-50%,-100%) scale(.2,.2)", opacity: 0 },
    { transform: "translate(-50%,-100%) scale(1,1)", opacity: 1, offset: .15 },
    { transform: "translate(-50%,-100%) scale(.85,1.3)", opacity: 1, offset: .35 },
    { transform: "translate(-50%,-100%) scale(1.05,.95)", opacity: 1, offset: .55 },
    { transform: "translate(-50%,-100%) scale(.8,1.25)", opacity: .9, offset: .75 },
    { transform: "translate(-50%,-100%) scale(.4,.5)", opacity: 0 }
  ], { duration: dur, delay: dl || 0, easing: "ease-in-out" });
}

/* serpihan logam yang terlempar dan jatuh (gravitasi) */
function airDebris(el, x, y, k, bomb) {
  const sz = rnd(4, 10) * (bomb ? 1.2 : 1), hot = Math.random() < .35,
    col = hot ? "#ff9a2a" : ["#4d5946", "#2e3529", "#7c8872", "#1c2018"][Math.random() * 4 | 0],
    d = mk(el, "air-db", "left:" + airF(x) + "px;top:" + airF(y) + "px;width:" + airF(sz) + "px;height:" + airF(sz * rnd(.4, 1)) + "px;background:" + col +
      ";clip-path:polygon(" + (Math.random() * 40 | 0) + "% 0,100% " + (Math.random() * 50 | 0) + "%," + (50 + Math.random() * 50 | 0) + "% 100%,0 80%)" + (hot ? ";box-shadow:0 0 6px #ff7a1a" : "")),
    a = rnd(-2.95, -.2), v = rnd(170, 440) * Math.pow(k, .7), vx = Math.cos(a) * v, vy = Math.sin(a) * v, g = 1100, dur = rnd(750, 1350), kf = [], N = 9, rot = rnd(-720, 720);
  for (let i = 0; i <= N; i++) {
    const u = i / N, t = u * dur / 1000;
    kf.push({ transform: "translate(" + airF(vx * t) + "px," + airF(vy * t + .5 * g * t * t) + "px) rotate(" + airF(rot * u) + "deg)", opacity: u > .75 ? 1 - (u - .75) * 4 : 1 });
  }
  airRun(d, kf, { duration: dur });
}

/* bangkai sayap yang patah dan berputar jatuh */
function airFrag(el, p, dir) {
  const w = mk(el, "air", "left:0;top:0;width:34px;height:14px;margin:-7px 0 0 -17px", AIR_WING), N = 10, kf = [], dur = 1000, dx = rnd(10, 46) * dir, dy = rnd(120, 180);
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    kf.push({ transform: "translate(" + airF(p.x + dx * u) + "px," + airF(p.y + dy * u * u) + "px) rotate(" + airF(u * rnd(380, 560)) + "deg)", opacity: u > .85 ? 0 : 1 });
  }
  airRun(w, kf, { duration: dur });
  for (let i = 1; i <= 5; i++) setTimeout(() => airPuff(el, p.x + dx * i / 6, p.y + dy * (i / 6) * (i / 6), 14, 700, 0, 14, "bk"), i * 150);
}

/* ledakan berlapis: kilat putih, bola api, gelombang kejut, serpihan, kolom asap, api di puncak */
function airBoom(o, x, y, k, bomb) {
  const el = o.el, lo = o.lo, sw = o.sw;
  const ball = (r, cls, dur, dl) => airRun(mk(el, "air-fb2 " + cls, "left:" + airF(x - r) + "px;top:" + airF(y - r) + "px;width:" + airF(2 * r) + "px;height:" + airF(2 * r) + "px"), [
    { transform: "scale(.15)", opacity: 1 },
    { transform: "scale(1)", opacity: 1, offset: .3 },
    { transform: "scale(1.35)", opacity: 0 }], { duration: dur, delay: dl || 0, easing: "ease-out" });
  ball(28 * k, "w", 380);
  ball(52 * k, "", 760);
  if (!lo) ball(40 * k, "y", 900, 110);
  ringAt(el, x, y, "or", 3.6 * k, 640);
  if (!lo) ringAt(el, x, y, "", 5.8 * k, 960, 110);
  airRun(mk(el, "air-dust", "left:" + airF(x - 40 * k) + "px;top:" + airF(y - 8) + "px;width:" + airF(80 * k) + "px;height:" + airF(16 * k) + "px"), [
    { transform: "scaleX(.2)", opacity: .9 }, { transform: "scaleX(2.6)", opacity: 0 }], { duration: 900, easing: "ease-out" });
  const nd = lo ? 7 : bomb ? 22 : 14;
  for (let i = 0; i < nd; i++) airDebris(el, x, y, k, bomb);
  airSpark(el, x, y, lo ? 4 : 10);
  const ns = lo ? 4 : bomb ? 9 : 6;
  for (let i = 0; i < ns; i++) airPuff(el, x + rnd(-12, 12) * k, y - 4, rnd(26, 44) * k, rnd(1500, 2300), i * 90, (36 + i * 14) * k, "bk");
  if (bomb && !lo) for (let j = -2; j <= 2; j++) airPuff(el, x + j * 24, y - 70 * k, 46 * k - Math.abs(j) * 6, 2000, 280 + Math.abs(j) * 70, 36, "bk");
  for (let i = 0; i < (lo ? 2 : bomb ? 6 : 4); i++) airFire(el, x + rnd(-sw * .42, sw * .42), y + 4, rnd(12, 18) * (bomb ? 1.3 : 1), rnd(1200, 1900), 100 + i * 110);
}

/* ---------- PESAWAT NABRAK: jet tempur terbakar menukik ke menara ---------- */
function airPlane(o) {
  const { el, cx, top, sw, I, blk, lo, bg, flash, shake, impact, sway, st } = o;
  const JW = 120, JH = 42, ex = blk ? cx - sw * .62 : cx, ey = blk ? top - 14 : top + 14, sx = -90, sy = top - 170;
  const pos = u => ({ x: sx + (ex - sx) * (.7 * u + .3 * u * u), y: sy + (ey - sy) * Math.pow(u, 1.7) + Math.sin(u * 13) * 5 * (1 - u) });
  const ang = u => { const a = pos(Math.max(0, u - .02)), b = pos(Math.min(1, u + .02)); return Math.atan2(b.y - a.y, b.x - a.x) * AIR_DEG + Math.sin(u * 16) * 5 * (1 - u * .5) };
  const P = mk(el, "air", "left:0;top:0;width:" + JW + "px;height:" + JH + "px;margin:" + (-JH / 2) + "px 0 0 " + (-JW / 2) + "px"),
    R = mk(P, "air-roll", "", airJet(true));
  mk(R, "air-fl", "left:-58px;top:10px;width:60px;height:21px");
  const N = 24, kf = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, p = pos(u);
    kf.push({ transform: "translate(" + airF(p.x) + "px," + airF(p.y) + "px) rotate(" + airF(ang(u)) + "deg)", opacity: i ? 1 : 0 });
  }
  run(P, kf, { duration: I });
  /* jejak asap hitam dan percikan api sepanjang lintasan */
  const np = lo ? 9 : 24;
  for (let i = 1; i <= np; i++) {
    const u = i / (np + 1);
    setTimeout(() => {
      const p = pos(u), a = ang(u) / AIR_DEG, tx = p.x - Math.cos(a) * JW * .45, ty = p.y - Math.sin(a) * JW * .45;
      airPuff(el, tx, ty, rnd(16, 24) + u * 14, 1000 + u * 700, 0, rnd(18, 34), i % 3 ? "bk" : "");
      if (i % 2 === 0) airSpark(el, tx, ty, 2);
    }, u * I);
  }
  /* sayap patah di tengah lintasan */
  setTimeout(() => airFrag(el, pos(.5), 1), I * .5);
  sway(blk ? 1.5 : 5, 1500);
  impact(ex, ey, () => {
    flash(bg); shake(10, 9, 600, bg);
    airBoom(o, ex, ey, 1);
    st.animate([{ filter: "brightness(2.2) sepia(.4)" }, { filter: "brightness(.6)", offset: .3 }, { filter: "none" }], { duration: 900 });
  });
  if (blk) setTimeout(() => airBoom(o, ex, ey, .6), I);
}

/* ---------- BOM PESAWAT: pembom melintas, bom meluncur balistik ---------- */
function airBomb(o) {
  const { el, cx, top, sw, I, blk, lo, bg, flash, shake, dim, impact, sway, st } = o;
  const BW = 150, BH = 46, vx = .15, tR = Math.round(I * .26), Tf = I - tR, ex = cx, ey = blk ? top - 36 : top + 8,
    py = Math.max(top - 150, 22), bx0 = ex - vx * Tf, xr = bx0 + 25, x0 = xr - vx * tR, TT = I + 1700, by0 = py + 8, X = t => x0 + vx * t;
  const B = mk(el, "air", "left:0;top:0;width:" + BW + "px;height:" + BH + "px;margin:" + (-BH / 2) + "px 0 0 " + (-BW / 2) + "px", airBomberSvg());
  mk(B, "air-fl s", "left:17px;top:32px;width:36px;height:9px");
  mk(B, "air-fl s", "left:-27px;top:19px;width:30px;height:7px");
  run(B, [
    { transform: "translate(" + airF(X(0)) + "px," + py + "px) rotate(0deg)", opacity: 0 },
    { transform: "translate(" + airF(X(140)) + "px," + py + "px) rotate(0deg)", opacity: 1, offset: 140 / TT },
    { transform: "translate(" + airF(X(tR)) + "px," + py + "px) rotate(0deg)", opacity: 1, offset: tR / TT },
    { transform: "translate(" + airF(X(tR + 600)) + "px," + (py - 10) + "px) rotate(-5deg)", opacity: 1, offset: (tR + 600) / TT },
    { transform: "translate(" + airF(X(TT * .85)) + "px," + (py - 36) + "px) rotate(-3deg)", opacity: 1, offset: .85 },
    { transform: "translate(" + airF(X(TT)) + "px," + (py - 46) + "px) rotate(-3deg)", opacity: 0 }
  ], { duration: TT });
  /* kontrail putih di belakang mesin pembom */
  const cs = lo ? 160 : 90;
  for (let t = 0; t < tR + 1500; t += cs) setTimeout(() => airPuff(el, X(t) - 24, py + 14, rnd(9, 14), 1200, 0, 8, "wh"), t);
  /* bom dilepas dari ruang bom */
  setTimeout(() => {
    const b = mk(el, "air", "left:0;top:0;width:48px;height:17px;margin:-8.5px 0 0 -24px", airBombSvg()), N = 16, bk = [], dxx = ex - bx0, dyy = ey - by0,
      bp = u => ({ x: bx0 + dxx * u, y: by0 + dyy * u * u });
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = bp(u);
      bk.push({ transform: "translate(" + airF(p.x) + "px," + airF(p.y) + "px) rotate(" + airF(Math.atan2(2 * dyy * u, dxx) * AIR_DEG) + "deg)" });
    }
    run(b, bk, { duration: Tf });
    airPuff(el, bx0 + 12, by0 + 4, 14, 500, 0, 6, "wh");
    const step = lo ? 140 : 70;
    for (let t = step; t < Tf - 40; t += step) setTimeout(() => { const p = bp(t / Tf); airPuff(el, p.x - 12, p.y - 2, 8, 520, 0, 6, "wh") }, t);
  }, tR);
  sway(blk ? 1.5 : 4, 1500);
  impact(ex, ey, () => {
    flash(bg); shake(14, 13, 800, bg); dim(.35, 900, "rgba(255,120,30,.5)", bg);
    airBoom(o, ex, ey, 1.6, true);
    st.animate([{ filter: "brightness(2.6) sepia(.5)" }, { filter: "brightness(.55)", offset: .3 }, { filter: "none" }], { duration: 1100 });
  });
  if (blk) setTimeout(() => airBoom(o, ex, ey, .8, true), I);
}