/* zeus.js: skill LEGENDARIS 1 "ZEUS, Dewa Petir".
   Alur: pemain memakai kartu -> Zeus turun dari langit (semua pemain stun 4 detik dan waktu berhenti) -> perisai petir melindungi menara
   pemanggil dari semua serangan -> pemanggil mengendalikan Zeus 30 detik: gerak kiri/kanan, pilih 1 dari 3 skill, bidik manual, tembak.
     A  Thunderbolt Hand (CD 2 dtk): 1 menara lawan, 2 sambaran = hingga 2 lantai.
     B  Divine Thunderstorm (CD 6 dtk): area bidikan, 6 sambaran utama (damage penuh) + 3 sambaran tambahan di sekitar (damage setengah).
     C  Seven Heavenly Thunder Horses (CD 8 dtk): 1 pemain lawan, 7 kuda petir dari berbagai arah, total hingga 8 lantai, ledakan akhir.
   "Bangunan" di game ini = lantai menara, jadi damage dihitung dalam lantai. Damage nyata: korban memotong lantainya sendiri (seperti skill lain).
   Sinkron lewat presence: atk{z:1} (kedatangan), za (setiap serangan), zp (posisi Zeus), zsh (batas waktu kebal pemanggil).
   Bergantung pada: script.js (mk, rnd, clp, shake, popup, tws, peersNow, push, fc, t0, BOTS, ST, SFX) dan zeus-art.js. */
const ZS_STUN = 4000, ZS_CTL = 30000, ZS_BYE = 1500, ZS_CDS = { a: 2000, b: 6000, c: 8000 };
const ZS_INFO = {
  a: { n: "THUNDERBOLT HAND", k: "1", s: "CD 2 dtk · 2 lantai", h: "Ketuk menara lawan untuk menembakkan petir dari telapak tangan" },
  b: { n: "DIVINE THUNDERSTORM", k: "2", s: "CD 6 dtk · 6+3 sambaran", h: "Ketuk atau seret untuk memilih area badai, lepas untuk memanggil petir" },
  c: { n: "7 THUNDER HORSES", k: "3", s: "CD 8 dtk · 7 kuda, 8 lantai", h: "Ketuk menara lawan yang akan diserbu tujuh kuda petir" }
};
let ZS = null, ZF = {};
const zsNow = () => Date.now();
const zsLo = own => !!ST.lite || (!!ST.far && !own);
const zsProt = id => !!ZS && ZS.by === id && zsNow() < ZS.end;
const zsStun = () => !!ZS && zsNow() < ZS.stunEnd;
const zsOwn = () => !!ZS && ZS.own && zsNow() < ZS.ctlEnd;
const zsT = (f, ms) => { if (!ZS) return 0; const Z = ZS, id = setTimeout(() => { Z.tm.delete(id); if (ZS === Z) f() }, ms); Z.tm.add(id); return id };
const zsSz = () => { const s = $("scene"); return { W: s.clientWidth || 400, H: s.clientHeight || 600 } };
const zsRel = el => { const r = el.getBoundingClientRect(), b = $("scene").getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height } };

/* ---------- geometri menara ---------- */
function zsTw(id) {
  const t = tws[id]; if (!t || !t.el.isConnected) return null;
  const r = zsRel(t.el), s = zsRel(t.stack), h = s.h > 4 ? s.h : 30;
  return { x: r.x + r.w / 2, l: s.x, w: s.w || r.w * .78, top: s.h > 4 ? s.y : r.y + r.h - 34, h, bot: s.h > 4 ? s.y + s.h : r.y + r.h - 4 };
}
const zsPt = (id, u) => { const g = zsTw(id); if (!g) return null; return { x: g.x + rnd(-g.w * .2, g.w * .2), y: g.top + g.h * clp(u, 0, 1) } };
const zsEnemies = () => peersNow().filter(p => p.id !== me.id && !p.fin && tws[p.id] && tws[p.id].el.isConnected);
function zsSnap(x) {
  let best = null, bd = 1e9;
  zsEnemies().forEach(p => { const g = zsTw(p.id); if (!g) return; const d = Math.abs(g.x - x); if (d < bd && d <= g.w / 2 + 46) { bd = d; best = p.id } });
  return best;
}
const zsGy = () => zsSz().H - (parseFloat(getComputedStyle($("scene")).getPropertyValue("--zh")) || 140) + 6;
const zsR = () => clp(zsSz().W * .17, 96, 190);
function zsInArea(ax) {
  const R = zsR(), o = [];
  zsEnemies().forEach(p => { const g = zsTw(p.id); if (g && Math.abs(g.x - ax) <= R + g.w * .35) o.push({ id: p.id, d: Math.abs(g.x - ax), f: p.floors || 0 }) });
  return o.sort((a, b) => a.d - b.d);
}

/* efek petir, awan, langit, ledakan: lihat zeus-fx.js */
const zsShake = (n, a, d) => { if (ZS && (ZS.own || !ZS.lo)) shake(n, a, d) };

/* posisi muncul Zeus: di SAMPING menara pemanggil, di sisi yang lebih lega (jauh dari menara lain). Hasil: pecahan lebar scene 0..1 */
function zsSpawn(id) {
  const { W, H } = zsSz(), g = zsTw(id); if (!g) return .5;
  const hz = clp(H * .4, 170, 400), zw = hz * 300 / 470, off = g.w / 2 + 34 + zw * .3;
  const oth = peersNow().filter(p => p.id !== id).map(p => zsTw(p.id)).filter(Boolean);
  let best = .5, bs = -1e9;
  [-1, 1].forEach(sd => {
    const x = g.x + sd * off, f = x / W; let sc = Math.min(1e4, ...oth.map(o => Math.abs(o.x - x)));
    if (f < .08 || f > .92) sc -= 5000; sc -= Math.abs(f - .5) * 40;
    if (sc > bs) { bs = sc; best = f }
  });
  return clp(best, .07, .93);
}
/* debu + percikan kecil tiap langkah kaki menapak */
function zsDust(Z, x) {
  const L = Z.L, gy = zsGy(), e = mk(L, "zs-sm", `left:${(x - 12).toFixed(0)}px;top:${(gy - 16).toFixed(0)}px;width:24px;height:24px`);
  e.animate([{ transform: "translate(0,0) scale(.4)", opacity: 0 }, { transform: `translate(${rnd(-12, 12)}px,-8px) scale(1)`, opacity: .55, offset: .3 }, { transform: `translate(${rnd(-26, 26)}px,-26px) scale(1.9)`, opacity: 0 }], { duration: 620, easing: "ease-out" }).onfinish = () => e.remove();
  if (!Z.lo && Math.random() < .55) { const a = rnd(-70, 70), p = mk(L, "zs-sp", `left:${x.toFixed(0)}px;top:${(gy - 4).toFixed(0)}px`); p.animate([{ transform: `rotate(${a}deg) translateY(0) scaleY(.6)`, opacity: 1 }, { transform: `rotate(${a}deg) translateY(-26px) scaleY(1.4)`, opacity: 0 }], { duration: 300, easing: "ease-out" }).onfinish = () => p.remove() }
}

/* ---------- awal pemakaian ---------- */
function zsStart() {
  if (ZS) { popup("Zeus sedang aktif"); return }
  if (!zsEnemies().length) { popup("Belum ada lawan untuk diserang"); return }
  const now = zsNow(), a = { s: me.id + now, k: K_ZS, to: "*", n: 0, b: 0, z: 1 };
  seen[me.id] = a.s; ZF = {}; push({ atk: a, zsh: now + ZS_STUN + ZS_CTL + ZS_BYE, zp: zsSpawn(me.id) }); play(me, a, peersNow());
}
/* pratinjau "Cara Main": Zeus kecil turun dan menyambar menara lawan, lalu lantai berkurang (floors diubah lewat cb) */
function zsDemo(sc, P, d, later) {
  const L = mk(sc, "zs-l"), W = sc.clientWidth || 300, H = sc.clientHeight || 200, vic = dws[P[1].id], lo = !!ST.lite;
  const dk = mk(L, "zs-dark"); dk.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 6500, fill: "forwards" });
  const hz = Math.min(H * .78, 330), z = mk(L, "zs-z", `left:50%;height:${hz}px;width:${hz * 300 / 470}px;opacity:1;bottom:20px`); z.innerHTML = zaArt() + '<div class="shadow"></div>';
  const A = z.querySelector("#zaA"), B = z.querySelector("#zaB"), gl = B.querySelector(".za-glow");
  const pose = (a, b, g) => { A.setAttribute("transform", `translate(${ZA.SH[0][0]} ${ZA.SH[0][1]}) rotate(${a})`); B.setAttribute("transform", `translate(${ZA.SH[1][0]} ${ZA.SH[1][1]}) rotate(${b})`); gl.setAttribute("opacity", g) };
  pose(8, -8, 0); SFX.zs("in", { far: true });
  z.animate([{ transform: "translateX(-50%) translateY(-110vh)" }, { transform: "translateX(-50%) translateY(0)" }], { duration: 420, delay: 300, easing: "cubic-bezier(.5,0,.9,.6)", fill: "backwards" });
  later(() => { zsFlash(L, .9, 500); zsBoom(L, W * .5, H - 24, 3, true, lo); zsBolt(L, W * .5, -10, W * .5, H - 24, { w: 7, dur: 500, lo }) }, 720);
  const arms = z.querySelector(".za-fx"); later(() => zaArcs(arms, 4, true), 900);
  later(() => { pose(8, -125, 1) }, 2200);
  const tp = () => { const r = vic.el.getBoundingClientRect(), b = sc.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + Math.max(24, r.height * .4) } };
  [3000, 3500].forEach((t, i) => later(() => {
    const g = gl.getBoundingClientRect(), b = sc.getBoundingClientRect(), p = tp();
    zsBolt(L, g.left - b.left + g.width / 2, g.top - b.top + g.height / 2, p.x, p.y, { w: 6, ty: i * 3, dur: 420, lo }); zsBoom(L, p.x, p.y, 1.5, true, lo); zsFlash(L, .5, 220); SFX.zs("hit", { far: true });
    P[1].floors = Math.max(0, Math.min(P[1].floors, vic.n) - 1); tower(P[1], dws, vic.el.parentNode);
  }, t));
  later(() => { pose(8, -8, 0) }, 4300);
  later(() => { zsBolt(L, W * .5, H * .5, W * .5, -10, { w: 6, dur: 500, lo }); z.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: "forwards" }) }, 5600);
  later(() => L.remove(), 7000);
}

/* ---------- membangun / menghentikan Zeus ---------- */
function zsStop(q) {
  if (!ZS) return; const Z = ZS; ZS = null; ZF = {};
  Z.tm.forEach(clearTimeout); cancelAnimationFrame(Z.raf); clearInterval(Z.iv); if (Z.sky && !Z.sky.done) Z.sky.off(q === true ? 200 : 600); if (Z.fg) Z.fg.stop();
  if (Z.L) Z.L.remove(); zsHudOff();
  if (Z.own && started && !over && q !== true) { const t = $("typ"); if (t) t.focus() }
}
function zsPlay(att, a, ps) {
  if (ZS) return; const own = att.id === me.id, now = zsNow(), lo = zsLo(own), sx0 = zsSpawn(att.id);
  const L = document.createElement("div"); L.className = "zs-l"; $("scene").appendChild(L);
  ZS = { own, by: att.id, name: att.name, t0: now, stunEnd: now + ZS_STUN, ctlEnd: now + ZS_STUN + ZS_CTL, end: now + ZS_STUN + ZS_CTL + ZS_BYE, tm: new Set(), cd: { a: 0, b: 0, c: 0 }, sel: "a", aim: null, x: sx0, tx: sx0, mv: 0, kL: 0, kR: 0, bL: 0, bR: 0, busy: 0, lo, L, pm: "hide", sp: { au: { x: 8, v: 0 }, af: { x: -10, v: 0 }, bu: { x: -8, v: 0 }, bf: { x: 10, v: 0 }, lean: { x: 0, v: 0 }, head: { x: 0, v: 0 }, cloak: { x: 0, v: 0 }, dy: { x: 0, v: 0 }, sq: { x: 1, v: 0 }, hip: { x: 0, v: 0 }, spd: { x: 0, v: 0 }, wind: { x: -20, v: 0 } }, wk: 0, ph: 0, vel: 0, st: 0, nextSheet: 0, glc: [0, 0], lastPush: 0, last: performance.now() };
  const Z = ZS; Z.t0 = now;
  Z.dark = mk(L, "zs-dark"); zsSkyOn(Z);
  Z.fg = zsBank(L, "top:-5%;left:-10%;width:120%;height:34%;opacity:0;-webkit-mask-image:linear-gradient(#000 45%,transparent);mask-image:linear-gradient(#000 45%,transparent)", { thr: .46, sc: 3.2, fade: .5 });
  Z.fg.el.animate([{ opacity: 0, transform: "translateY(-60px)" }, { opacity: .95, transform: "none" }], { duration: 2400, fill: "forwards", easing: "cubic-bezier(.2,.6,.2,1)" });
  Z.spr = mk(L, "zs-z"); Z.spr.innerHTML = zaArt() + '<div class="shadow"></div>'; Z.svg = Z.spr.querySelector(".za-svg"); Z.fx = Z.spr.querySelector(".za-fx");
  Z.up = Z.spr.querySelector("#zaUp"); Z.hw = Z.spr.querySelector("#zaHeadW"); Z.cw = Z.spr.querySelector("#zaCloakW"); Z.lw = Z.spr.querySelector("#zaLegsW"); Z.armA = Z.spr.querySelector("#zaA"); Z.armB = Z.spr.querySelector("#zaB"); Z.glA = Z.armA.querySelector(".za-glow"); Z.glB = Z.armB.querySelector(".za-glow"); Z.foA = Z.armA.querySelector(".za-fo"); Z.foB = Z.armB.querySelector(".za-fo"); Z.lgL = Z.spr.querySelector(".za-lgL"); Z.lgR = Z.spr.querySelector(".za-lgR"); Z.shd = Z.spr.querySelector(".shadow");
  Z.brL = Z.spr.querySelector(".za-brL"); Z.brR = Z.spr.querySelector(".za-brR"); Z.eyG = Z.spr.querySelector(".za-eyes"); Z.mth = Z.spr.querySelector(".za-mouth"); Z.brd = Z.spr.querySelector(".za-beard");
  Z.sk = mk(Z.spr, "za-sparks"); Z.spr.insertBefore(Z.sk, Z.spr.firstChild); Z.skAcc = 0; Z.skN = 0;
  Z.cz = { b: Z.spr.querySelector(".zc-b"), i: Z.spr.querySelector(".zc-i"), f: Z.spr.querySelector(".zc-f"), h: Z.spr.querySelector(".zc-h") }; Z.cfr = 0;
  Z.fgs = [Z.armA, Z.armB].map(a => { const o = []; a.querySelectorAll(".za-fg").forEach(g => o[+g.dataset.i] = { g, p: g.querySelector(".fp"), d: g.querySelector(".fd"), s: { x: [.25, .4, .48, .55, .62][+g.dataset.i], v: 0 }, sp: { x: 0, v: 0 } }); return o });
  Z.fs = { brow: { x: 0, v: 0 }, brk: { x: 0, v: 0 }, mouth: { x: 0, v: 0 }, eye: { x: 1, v: 0 }, beard: { x: 0, v: 0 } }; Z.blinkAt = zsNow() + 1800; Z.blinkT = 0;
  Z.stunEl = mk(L, "zs-stun", "", "<b>4</b><small>ZEUS TURUN! SEMUA TERKUNCI</small>");
  const far = !own;
  Z.dark.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, easing: "ease-in-out", fill: "forwards" });
  SFX.zs("in", { far }); try { $("typ").blur() } catch (e) { }
  const { W, H } = zsSz(), sx = W * Z.x;
  zsT(() => { zsBolt(L, sx + rnd(-50, 50), -10, sx, zsGy() - 16, { w: 3, dur: 380, lo }); zsFlash(L, .35, 260) }, 520);
  zsT(() => {
    Z.pm = "land"; Z.spr.style.opacity = 1; Z.spr.animate([{ transform: "translateX(-50%) translateY(-130vh) scale(.8) rotate(-4deg)" }, { transform: "translateX(-50%) translateY(0) scale(1) rotate(0)" }], { duration: 460, easing: "cubic-bezier(.5,0,.9,.6)" });
    const gy = zsGy();
    for (let i = 0; i < 2; i++) zsBolt(L, sx + rnd(-90, 90), -10, sx + rnd(-40, 40), gy, { w: 9, ty: i * 2, dur: 520, lo });
  }, 900);
  zsT(() => {
    const gy = zsGy(), x = W * Z.x;
    zsFlash(L, .95, 650); zsShake(14, 16, 900); zsBoom(L, x, gy, 4.2, true, lo);
    for (let i = 0; i < (lo ? 2 : 4); i++) { const r = mk(L, "zs-rg", `left:${x - 30}px;top:${gy - 10}px;width:60px;height:20px;border-radius:50%`); r.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: `scale(${(W / 60) * 1.2})`, opacity: 0 }], { duration: 900, delay: i * 140, easing: "ease-out", fill: "backwards" }).onfinish = () => r.remove() }
    for (let i = 0; i < (lo ? 3 : 7); i++) zsBolt(L, x + rnd(-W * .4, W * .4), -10, x + rnd(-W * .45, W * .45), gy, { w: 4, ty: i % 6, dur: 400 + i * 40, lo });
    zsDome(); Z.shock = true; Z.spr.animate([{ transform: "translateX(-50%) scale(1.04,.93)" }, { transform: "translateX(-50%) scale(.99,1.02)", offset: .45 }, { transform: "translateX(-50%)" }], { duration: 520, easing: "ease-out" });
  }, 1360);
  zsT(() => { if (Z.pm === "land") Z.pm = "idle" }, 2700);
  Z.iv = setInterval(zsTick, 100);
  zsT(zsCtl, ZS_STUN);
  zsT(zsBye, ZS_STUN + ZS_CTL);
  zsT(() => zsStop(), ZS_STUN + ZS_CTL + ZS_BYE);
  Z.raf = requestAnimationFrame(zsLoop);
}
function zsTick() {
  const Z = ZS; if (!Z) return; const now = zsNow();
  if (Z.stunEl && Z.stunEl.firstChild) Z.stunEl.firstChild.textContent = Math.max(1, Math.ceil(Math.max(0, Z.stunEnd - now) / 1000));
  if (Z.sky && now > Z.nextSheet && now > Z.t0 + 1600) { Z.nextSheet = now + rnd(2300, 5200); const x = rnd(.1, .9); Z.sky.flash(x, .5); if (!Z.lo && Math.random() < .7) zsBolt(Z.sky.el, x * zsSz().W, 8, x * zsSz().W + rnd(-50, 50), zsSz().H * rnd(.3, .5), { w: 2.2, dur: 620, lo: Z.lo, noGlow: 1, ty: (Math.random() * 6) | 0 }); if (Math.random() < .5) SFX.zs("rum", { far: true }) }
  if (zsHold()) { const t = $("typ"); if (t && t.value) { t.value = ""; prevLen = 0 } }
}
const zsHold = () => zsStun() || zsOwn();
function zsCtl() {
  const Z = ZS; if (!Z) return;
  if (Z.stunEl) { Z.stunEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).onfinish = () => Z.stunEl && Z.stunEl.remove(); Z.stunEl = null }
  Z.dark.animate([{ opacity: 1 }, { opacity: .2 }], { duration: 1400, easing: "ease-in-out", fill: "forwards" });
  if (started && !over) t0 += ZS_STUN;
  Z.pm = "idle"; SFX.zs("go", { far: !Z.own });
  const L = Z.L, W = zsSz().W; zsBolt(L, W * Z.x, -10, W * Z.x, 120, { w: 3, dur: 300, lo: Z.lo });
  if (Z.own) { zsHud(); zsAimOn() } else if (ST.txr) popup("⚡ " + esc(Z.name) + " mengendalikan Zeus");
}
function zsBye() {
  const Z = ZS; if (!Z) return; Z.pm = "bye"; Z.aim = null;
  zsHudOff(); if (Z.aimEl) { Z.aimEl.remove(); Z.aimEl = null } ["ti", "ar", "tp", "ln"].forEach(k => { if (Z[k]) { Z[k].remove(); Z[k] = null } });
  if (Z.hl) { Z.hl.forEach(e => e.remove()); Z.hl = [] }
  const { W, H } = zsSz(); SFX.zs("bye", { far: !Z.own });
  zsFlash(Z.L, .6, 500); zsBolt(Z.L, W * Z.x, H * .45, W * Z.x + rnd(-30, 30), -20, { w: 10, dur: 700, lo: Z.lo }); zsShake(8, 8, 500);
  Z.spr.animate([{ opacity: 1, filter: "brightness(1)" }, { opacity: 1, filter: "brightness(3)", offset: .3 }, { opacity: 0, filter: "brightness(4)", transform: "translateX(-50%) translateY(-40px)" }], { duration: 900, delay: 350, fill: "forwards" });
  Z.dark.animate([{ opacity: .2 }, { opacity: 0 }], { duration: 1400, fill: "forwards" }); Z.fg.el.animate([{ opacity: .95 }, { opacity: 0 }], { duration: 1500, fill: "forwards" }); if (Z.sky) Z.sky.off(1700);
  if (Z.dome) { const d = Z.dome; d.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.25)" }], { duration: 1100, delay: 300, fill: "forwards" }) }
  if (Z.own && started && !over) { const t = $("typ"); if (t) t.focus() }
}

/* ---------- kubah perisai petir ---------- */
function zsDome() {
  const Z = ZS; if (!Z) return;
  Z.dome = mk(Z.L, "zs-dome", "", "<svg></svg>"); Z.dsv = Z.dome.firstChild; Z.dk = "";
  Z.dome.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }], { duration: 600, easing: "cubic-bezier(.2,1.4,.4,1)" });
  let n = 0;
  Z.arcs = () => {
    if (!ZS || ZS !== Z || !Z.dome) return; const g = zsTw(Z.by);
    if (g) {
      const w = Z.dome.offsetWidth, h = Z.dome.offsetHeight; let s = "";
      for (let i = 0; i < (Z.lo ? 3 : 6); i++) {
        const a = Math.PI * (1 + Math.random()), ex = (w + 28) / 2, ey = (h + 28) * .6, cx = ex, cy = (h + 28) * .62, x0 = cx + Math.cos(a) * (ex - 14), y0 = cy + Math.sin(a) * (ey - 14), r = rnd(18, 46),
          p = zsPts(x0, y0, x0 + Math.cos(a) * r + rnd(-10, 10), y0 + Math.sin(a) * r, .6, 3);
        s += `<path d="${zsD(p)}" stroke="#bfe8ff" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="${zsD(p)}" stroke="#4aa0ff" stroke-opacity=".4" stroke-width="6" fill="none"/>`;
      }
      Z.dsv.innerHTML = s;
    }
    n++; if (n % 6 === 0 && g) {
      const r = mk(Z.L, "zs-rg", `left:${g.x - 30}px;top:${g.bot - 12}px;width:60px;height:24px;border-radius:50%;border-width:3px`);
      r.animate([{ transform: "scale(.5)", opacity: .9 }, { transform: `scale(${Math.max(2.4, (g.w + 60) / 60 * 1.5)})`, opacity: 0 }], { duration: 1100, easing: "ease-out" }).onfinish = () => r.remove();
    }
    if (n % 5 === 0 && g && !Z.lo) zsBolt(Z.L, g.x + rnd(-130, 130), -10, g.x + rnd(-24, 24), g.top - 30, { w: 2.2, dur: 330, ty: n % 6 });
  };
  Z.dIv = setInterval(Z.arcs, 150); Z.tm.add(Z.dIv);
}
function zsDomePlace() {
  const Z = ZS; if (!Z || !Z.dome) return; const g = zsTw(Z.by); if (!g) return;
  const w = g.w + 60, h = Math.max(120, g.h + 62), l = g.x - w / 2, t = g.bot - h + 8, k = [l | 0, t | 0, w | 0, h | 0].join();
  if (k !== Z.dk) { Z.dk = k; const s = Z.dome.style; s.left = l + "px"; s.top = t + "px"; s.width = w + "px"; s.height = h + "px" }
}
function zsBlock() {
  const Z = ZS; if (!Z || !Z.dome) { return } const n = performance.now(); if (Z.bk && n - Z.bk < 700) return; Z.bk = n;
  Z.dome.classList.remove("hit"); void Z.dome.offsetWidth; Z.dome.classList.add("hit"); SFX.zs("hit", { far: !Z.own });
  const g = zsTw(Z.by); if (g) { zsBolt(Z.L, g.x + rnd(-100, 100), -10, g.x + rnd(-30, 30), g.top - 26, { w: 4, dur: 380, ty: 1, lo: Z.lo }); zsBoom(Z.L, g.x + rnd(-30, 30), g.top - 26, 1.3, false, Z.lo) }
  if (ZS.own && ST.txr) popup("⚡ PERISAI PETIR ZEUS!");
}

/* ---------- loop: posisi, pose lengan, indikator ---------- */
const zsArm = x => x < zsSz().W * ZS.x ? "a" : "b";
function zsPalm(k) {
  const el = k === "a" ? ZS.glA : ZS.glB, r = el.getBoundingClientRect(), b = $("scene").getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
}
function zsLoop(now) {
  const Z = ZS; if (!Z) return; Z.raf = requestAnimationFrame(zsLoop);
  const dt = Math.min(.05, (now - Z.last) / 1000); Z.last = now; const { W, H } = zsSz(), t = zsNow();
  if (Z.own && t >= Z.stunEnd && t < Z.ctlEnd) {
    Z.mv = (Z.kR || Z.bR ? 1 : 0) - (Z.kL || Z.bL ? 1 : 0);
    Z.vel += (Z.mv * .34 - Z.vel) * Math.min(1, dt * (Z.mv ? 7 : 12)); if (!Z.mv && Math.abs(Z.vel) < .004) Z.vel = 0;
    if (Z.vel) { Z.x = clp(Z.x + Z.vel * dt, .07, .93); Z.dirty = 1; if (t - Z.lastPush > 110) { Z.lastPush = t; push({ zp: Math.round(Z.x * 1000) / 1000 }) } }
    else if (Z.dirty) { Z.dirty = 0; Z.lastPush = t; push({ zp: Math.round(Z.x * 1000) / 1000 }) }
  } else Z.x += (Z.tx - Z.x) * Math.min(1, dt * 9);
  if (!Z.own) { /* tidak ada */ }
  const hz = clp(H * .4, 170, 400), w = hz * 300 / 470, st = Z.spr.style;
  if (Z.hz !== hz) { Z.hz = hz; st.height = hz + "px"; st.width = w + "px" }
  st.left = (Z.x * W).toFixed(1) + "px";
  const sr = Z.svg.getBoundingClientRect(), sb = $("scene").getBoundingClientRect(), sc = sr.width / 300 || 1;
  const sh = k => ({ x: sr.left - sb.left + ZA.SH[k][0] * sc, y: sr.top - sb.top + ZA.SH[k][1] * sc });
  const T0 = zsPose(Z, t, now, sh, sc), sp = Z.sp, step = (s, tg, k, c) => { const n = 4, h = dt / n; for (let i = 0; i < n; i++) { s.v += ((tg - s.x) * k - s.v * c) * h; s.x += s.v * h } };
  /* lapisan penghalus: target pose dari zsPose melompat saat ganti fase (bidik -> tembak -> idle). Di sini target dialirkan dulu
     (low-pass per sendi) sebelum masuk ke pegas, jadi perpindahan pose selalu mengalir, tidak patah seperti wayang */
  const RT = { au: 7, af: 6, bu: 7, bf: 6, lean: 7, head: 8, dy: 9, sq: 9, hip: 8, spd: 8, wm: 6, ga: 99, gb: 99 };
  if (!Z.sm) Z.sm = { ...T0 };
  const T = {}; for (const key in T0) { if (typeof T0[key] !== "number") { T[key] = T0[key]; continue } const r = RT[key] || 8; if (Z.sm[key] == null) Z.sm[key] = T0[key]; Z.sm[key] += (T0[key] - Z.sm[key]) * (1 - Math.exp(-r * dt)); T[key] = Z.sm[key] }
  T.ga = T0.ga; T.gb = T0.gb;
  const vx = (Z.x - (Z.px == null ? Z.x : Z.px)) / Math.max(dt, .001); Z.px = Z.x;
  Z.wk += (clp(Math.abs(vx) * 9, 0, 1) - Z.wk) * Math.min(1, dt * 7); const wk = Z.wk, air = clp(-sp.dy.x / 8, 0, 1), wE = wk * (1 - air), wm = T.wm == null ? 1 : T.wm, dr = clp(vx / .34, -1, 1);
  Z.ph += dt * (6 + 5 * wk) * wk; const sn = Math.sin(Z.ph), cs2 = Math.cos(Z.ph);
  /* ayunan langkah: lengan berlawanan, siku menekuk bergantian, badan condong ke arah jalan */
  T.au += sn * 6 * wE * wm; T.bu += sn * 6 * wE * wm; T.af -= sn * 10 * wE * wm; T.bf -= sn * 10 * wE * wm;
  T.lean += dr * 3.6 * wE - sn * 1.3 * wE; T.head += dr * 2.2 * wE + sn * .9 * wE; T.hip += sn * 2.6 * wE; T.dy += 0;
  /* pegas lebih lembut dan hampir kritis: ada sedikit overshoot / follow-through, siku tertinggal dari lengan atas seperti otot sungguhan */
  step(sp.au, T.au, 120, 19); step(sp.af, T.af, 95, 11.5); step(sp.bu, T.bu, 120, 19); step(sp.bf, T.bf, 95, 11.5); step(sp.lean, T.lean, 60, 9.5); step(sp.head, T.head, 55, 9);
  step(sp.dy, T.dy || 0, 100, 12); step(sp.sq, T.sq == null ? 1 : T.sq, 120, 13); step(sp.hip, T.hip || 0, 80, 10.5); step(sp.spd, T.spd || 0, 80, 10);
  zsFace(Z, T, t, now, dt, wk);
  /* jubah: angin dasar selalu bertiup, makin kencang saat menyerang, ikut terseret saat Zeus berjalan */
  { const wt = (-24 + Math.sin(now / 1100) * 9 + Math.sin(now / 340) * 3.5) * (Z.casting || Z.pm === "land" || Z.pm === "bye" ? 1.55 : 1) + clp(-vx * 95, -36, 36); step(sp.wind, wt, 20, 4.2);
    Z.cfr++; if (Z.cz && Z.cz.b && (!Z.lo || Z.cfr % 2 === 0)) zaCloakSet(Z.cz, now / 1000, sp.wind.x) }
  zsHands(Z, T, t, now, dt);
  zsSparks(Z, t, dt);
  step(sp.cloak, -clp(vx * 38, -14, 14) + sn * 1.6 * wE, 40, 5);
  const crouch = Math.max(0, sp.dy.x), lift = Math.max(0, -sp.dy.x), bob = -Math.abs(cs2) * 3.6 * wE - (1 - wk) * (1 + Math.sin(now / 700)) * .9 + crouch, tx = sp.hip.x, sqy = sp.sq.x, sxx = 1 + (1 - sqy) * .6;
  /* titik bahu mengikuti badan (geser, miring, mengempis) supaya lengan tidak terlepas */
  const rd = sp.lean.x * Math.PI / 180, cr = Math.cos(rd), sr2 = Math.sin(rd), anc = p => { const dx = p[0] - 150, dy = p[1] - 280, rx = 150 + dx * cr - dy * sr2, ry = 280 + dx * sr2 + dy * cr; return [150 + (rx - 150) * sxx + tx, 392 + (ry - 392) * sqy + bob] };
  const sA = anc(ZA.SH[0]), sB = anc(ZA.SH[1]);
  Z.armA.setAttribute("transform", `translate(${sA[0].toFixed(1)} ${sA[1].toFixed(1)}) rotate(${sp.au.x.toFixed(1)})`); Z.foA.setAttribute("transform", `translate(0 78) rotate(${sp.af.x.toFixed(1)})`);
  Z.armB.setAttribute("transform", `translate(${sB[0].toFixed(1)} ${sB[1].toFixed(1)}) rotate(${sp.bu.x.toFixed(1)})`); Z.foB.setAttribute("transform", `translate(0 78) rotate(${sp.bf.x.toFixed(1)})`);
  Z.up.setAttribute("transform", `translate(${tx.toFixed(1)} ${bob.toFixed(1)}) translate(150 392) scale(${sxx.toFixed(3)} ${sqy.toFixed(3)}) translate(-150 -392) rotate(${sp.lean.x.toFixed(2)} 150 280)`); Z.hw.setAttribute("transform", `rotate(${sp.head.x.toFixed(2)} 150 112)`);
  Z.cw.setAttribute("transform", `translate(${(tx * .5).toFixed(1)} ${crouch.toFixed(1)}) translate(150 110) skewX(${sp.cloak.x.toFixed(2)}) translate(-150 -110)`);
  /* kaki: tiap kaki berayun dari pinggul, terangkat saat melangkah, menekuk (mengempis) saat jongkok, merenggang saat melayang */
  const spd = sp.spd.x, ll = sn * 17 * wE + spd, lr = -sn * 17 * wE - spd, ul = Math.max(0, cs2) * 8 * wE, ur = Math.max(0, -cs2) * 8 * wE;
  Z.lgL.setAttribute("transform", `translate(0 ${(-ul).toFixed(1)}) rotate(${ll.toFixed(1)} 122 392)`); Z.lgR.setAttribute("transform", `translate(0 ${(-ur).toFixed(1)}) rotate(${lr.toFixed(1)} 178 392)`);
  Z.lw.setAttribute("transform", `translate(150 466) scale(1 ${(1 - crouch * .016).toFixed(3)}) translate(-150 -466)`);
  Z.svg.style.transform = lift > .3 ? `translateY(${(-lift * sc).toFixed(1)}px)` : ""; if (Z.shd) { Z.shd.style.transform = `translateX(-50%) scale(${(1 - air * .22).toFixed(2)})`; Z.shd.style.opacity = (1 - air * .45).toFixed(2) }
  const stp = Math.floor((Z.ph + Math.PI / 2) / Math.PI); if (stp !== Z.st) { Z.st = stp; if (wE > .35) { const w0 = Z.hz * 300 / 470; zsDust(Z, Z.x * W + (stp % 2 ? -1 : 1) * w0 * .1) } }
  const k = Math.min(1, dt * 9);
  [T.ga, T.gb].forEach((g, i) => { Z.glc[i] += (g - Z.glc[i]) * k; const ge = i ? Z.glB : Z.glA; ge.setAttribute("opacity", Math.min(1, Z.glc[i] * (.75 + .25 * Math.sin(now / 60 + i))).toFixed(2)); ge.style.transform = `scale(${(.6 + Z.glc[i] * .9).toFixed(2)})` });
  const pm = Z.pm;
  Z.spr.classList.toggle("cast", Z.busy > t || pm !== "idle");
  if (!Z.lo && (now - (Z.fxT || 0)) > 95 && Z.fx && t > Z.t0 + 1300) { Z.fxT = now; zaArcs(Z.fx, Z.casting ? 8 : 5, true) } else if (Z.lo && (now - (Z.fxT || 0)) > 420 && Z.fx && t > Z.t0 + 1300) { Z.fxT = now; zaArcs(Z.fx, 2, false) }
  zsDomePlace(); if (Z.own) { zsAimDraw(); zsHudTick() }
}

/* target pose per frame: dipetakan ke pegas (sudut lengan atas, siku, miring badan, kepala) sehingga gerakan mengalir, ada antisipasi dan overshoot */
/* percikan petir yang menguap dari belakang Zeus: kilatan zigzag kecil naik, melayang miring, mengecil dan memudar. Tanpa titik, semuanya garis petir bergerigi. */
function zsSparks(Z, t, dt) {
  if (!Z.sk || t < Z.t0 + 1100) return; const hot = Z.casting || Z.pm === "land" || Z.pm === "bye" || Z.pm === "aim", cap = Z.lo ? 18 : 70;
  Z.skAcc += dt * (Z.lo ? 7 : 30) * (hot ? 1.8 : 1); const hz = Z.hz || 200, w = hz * 300 / 470;
  while (Z.skAcc >= 1) {
    Z.skAcc--; if (Z.skN >= cap) continue; Z.skN++;
    const big = Math.random() < .22, L = (big ? rnd(44, 80) : rnd(14, 36)) * hz / 470 * 1.9, sw = L * .55, x = w * (.5 + (Math.random() - .5) * 1.15), y = hz * rnd(.18, .92);
    let p = "M" + (sw / 2).toFixed(1) + " " + L.toFixed(1), n = big ? 6 : 4;
    for (let i = 1; i <= n; i++) p += "L" + (sw / 2 + (i % 2 ? -1 : 1) * rnd(.15, .5) * sw).toFixed(1) + " " + (L * (1 - i / n)).toFixed(1);
    const e = mk(Z.sk, "", `left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${sw.toFixed(0)}px;height:${L.toFixed(0)}px`, `<svg viewBox="0 0 ${sw.toFixed(1)} ${L.toFixed(1)}" width="${sw.toFixed(1)}" height="${L.toFixed(1)}" style="position:absolute;left:0;top:0"><path d="${p}" stroke="#3a7cff" stroke-width="${big ? 5 : 3.6}" fill="none" opacity=".35" stroke-linejoin="round"/><path d="${p}" stroke="${Math.random() < .3 ? "#fff6c8" : "#e4f5ff"}" stroke-width="${big ? 1.8 : 1.3}" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`);
    e.style.position = "absolute"; const ang = rnd(-28, 28), rise = rnd(60, 190) * hz / 200, dx = rnd(-70, 70) * hz / 200, dur = rnd(800, 1700);
    e.animate([{ transform: `translate(0,0) rotate(${ang}deg) scale(.5)`, opacity: 0 }, { transform: `translate(${dx * .25}px,${-rise * .2}px) rotate(${ang}deg) scale(1)`, opacity: 1, offset: .15 }, { transform: `translate(${dx * .7}px,${-rise * .65}px) rotate(${ang + rnd(-18, 18)}deg) scale(.85)`, opacity: .85, offset: .55 }, { transform: `translate(${dx}px,${-rise}px) rotate(${ang + rnd(-30, 30)}deg) scale(.3)`, opacity: 0 }], { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => { e.remove(); Z.skN-- };
  }
}
/* jari-jari: tiap jari punya pegas tekukan sendiri. Santai = jari agak menekuk dan bergoyang pelan; menyalurkan petir = telapak terbuka dan jari merenggang;
   Thunderbolt Hand = telunjuk lurus menunjuk, jari lain mengepal; berjalan = jari ikut berayun. */
function zsHands(Z, T, t, now, dt) {
  if (!Z.fgs) return; const rl = [.25, .4, .48, .55, .62], op = [.04, .06, .03, .07, .1], pt = [.12, 0, .92, .96, 1], n = 3, h = dt / n;
  Z.fgs.forEach((F, hi) => {
    const arm = hi ? "b" : "a", sd = hi ? -1 : 1, open = clp((Z.glc[hi] || 0) * 1.25, 0, 1), cs = Z.cs, pointing = Z.pm === "aim" && Z.pt && cs && cs.type === "a" && zsArm(Z.pt.x) === arm, grip = !pointing && open < .35 && (Z.busy > t) && Z.pm === "idle";
    F.forEach((f, i) => {
      const wig = Math.sin(now / 780 + i * 1.3 + hi * 2.1) * .09 + Math.sin(now / 310 + i * 2.2) * .03 * (1 - open);
      let c = pointing ? pt[i] : rl[i] * (1 - open) + op[i] * open + wig * (1 - open * .8); if (grip) c = .85; c = clp(c, 0, 1);
      const sT = pointing ? 0 : open;
      for (let k = 0; k < n; k++) { f.s.v += ((c - f.s.x) * 150 - f.s.v * 13) * h; f.s.x += f.s.v * h; f.sp.v += ((sT - f.sp.x) * 110 - f.sp.v * 12) * h; f.sp.x += f.sp.v * h }
      const q = zaFg(i, sd, clp(f.s.x, -.1, 1.1), f.sp.x);
      f.g.setAttribute("transform", q.g); f.p.setAttribute("transform", q.p); f.d.setAttribute("transform", q.d);
    });
  });
}
/* mimik wajah: alis (marah / mengerut saat menyerang), mata (melebar, berkedip), mulut (terbuka saat mendarat, menyerang, pergi), janggut ikut rahang dan goyang saat kepala bergerak.
   Semua lewat pegas supaya berubah halus, bukan tukar gambar. */
function zsFace(Z, T, t, now, dt, wk) {
  if (!Z.fs || !Z.eyG) return; const pm = Z.pm, F = Z.fs, cast = Z.busy > t || pm === "aim" || pm === "b" || pm === "c";
  let br = 0, mo = 0, ey = 1, rs = 0;
  if (pm === "land") { const d = t - (Z.t0 + 1360); br = d < 0 ? .4 : .9; mo = d < 0 ? .15 : (d < 700 ? 1 : .3); ey = 1.18; rs = d < 0 ? 1 : 0 }
  else if (pm === "bye") { br = .5; mo = .8; ey = 1.2 }
  else if (pm === "b" || pm === "c") { br = 1; mo = .55 + .25 * Math.sin(now / 90); ey = 1.2 }
  else if (pm === "aim") { br = .75; mo = .3; ey = 1.12 }
  else if (cast) { br = .6; mo = .2; ey = 1.1 }
  else if (Z.own && Z.aim && t >= Z.stunEnd && t < Z.ctlEnd) { br = .35; ey = 1.05 }
  else if (wk > .3) { br = .12 }
  const sp = (s, tg, k, c) => { const n = 3, h = dt / n; for (let i = 0; i < n; i++) { s.v += ((tg - s.x) * k - s.v * c) * h; s.x += s.v * h } };
  sp(F.brow, br, 130, 13); sp(F.brk, rs, 110, 12); sp(F.mouth, mo, 150, 14); sp(F.eye, ey, 160, 15);
  if (t > Z.blinkAt) { Z.blinkT = t; Z.blinkAt = t + 2200 + Math.random() * 3000 + (Math.random() < .2 ? -1500 : 0) }
  const bl = t - Z.blinkT < 160 ? Math.sin(Math.PI * (t - Z.blinkT) / 160) : 0, e = Math.max(.06, F.eye.x * (1 - .94 * bl * (cast ? .35 : 1)));
  const a = F.brow.x, sway = Math.sin(now / 1900) * .6, lift = F.brk.x * 5 + sway;
  Z.brL.setAttribute("transform", `translate(134 52) rotate(${(a * 15 + sway).toFixed(2)}) translate(-134 -52) translate(0 ${(a * 3.4 - lift).toFixed(2)})`);
  Z.brR.setAttribute("transform", `translate(166 52) rotate(${(-a * 15 - sway).toFixed(2)}) translate(-166 -52) translate(0 ${(a * 3.4 - lift).toFixed(2)})`);
  Z.eyG.setAttribute("transform", `translate(150 59) scale(${(1 + (F.eye.x - 1) * .35).toFixed(3)} ${e.toFixed(3)}) translate(-150 -59)`);
  const m = Math.max(.001, F.mouth.x); Z.mth.setAttribute("transform", `translate(150 101) scale(${(1 + m * .2).toFixed(3)} ${m.toFixed(3)})`);
  const hv = clp(-Z.sp.head.v * .05, -3, 3);
  Z.brd.setAttribute("transform", `translate(150 88) rotate(${hv.toFixed(2)}) scale(1 ${(1 + m * .035).toFixed(3)}) translate(-150 -88) translate(0 ${(m * 3.4).toFixed(2)})`);
}
function zsPose(Z, t, now, sh, sc) {
  const sw = Math.sin(now / 520) * 3, tr = () => (Math.random() - .5) * 2.4, ez = x => x * x * (3 - 2 * x), W = zsSz().W,
    /* pulse: naik halus a ms sebelum d=0 lalu turun b ms sesudahnya (antisipasi dan tindak lanjut) */
    pulse = (d, a, b) => d < -a || d > b ? 0 : d < 0 ? ez(1 + d / a) : 1 - ez(d / b),
    P = { au: 8 + sw, af: -10 + Math.sin(now / 760) * 2.4, bu: -8 - sw, bf: 10 - Math.sin(now / 830) * 2.4, lean: Math.sin(now / 900) * .6, head: Math.sin(now / 1700) * 1.2, ga: 0, gb: 0, dy: 0, sq: 1, hip: Math.sin(now / 1300) * .9, spd: 0, wm: 1 };
  const cs = Z.cs, age = cs ? t - cs.t0 : 0, pm = Z.pm;
  const aim = (arm, p, flex, pre) => {
    const s0 = sh(arm === "a" ? 0 : 1), dx = p.x - s0.x, dy = p.y - s0.y; let th = Math.atan2(-dx, dy) * 180 / Math.PI, sg = arm === "a" ? 1 : -1;
    th = sg * clp(Math.abs(th), 0, 176); P[arm + "u"] = th * (pre || 1); P[arm + "f"] = sg * flex; P["g" + arm] = 1; P.head = clp(dx / (sc * 18), -11, 11); P.lean = clp(dx / (sc * 40), -6, 6); return sg;
  };
  if (pm === "land") {
    const d = t - (Z.t0 + 1360); P.wm = 0;
    if (d < 0) { P.au = 128; P.bu = -128; P.af = 20; P.bf = -20; P.ga = P.gb = .5; P.spd = 9; P.lean = -2; P.head = -5; P.dy = -4 }
    else { const c = clp(1 - d / 750, 0, 1), u = ez(clp(d / 950, 0, 1)); P.dy = 13 * c; P.sq = 1 - .09 * c; P.spd = 11 * c; P.au = 34 + 66 * u; P.bu = -P.au; P.af = 28 - 14 * u; P.bf = -P.af; P.ga = P.gb = .75 * u; P.lean = 2.5 * c; P.head = -4 * u }
  } else if (pm === "aim" && Z.pt && cs) {
    const arm = zsArm(Z.pt.x), hs = cs.hs, dxT = clp((Z.pt.x - Z.x * W) / (W * .2), -1, 1), h0 = hs[0] ? hs[0].t : 560, ph = age < h0 - 40 ? 0 : (hs[1] && age < hs[1].t - 60) ? 1 : 2;
    P.wm = 0;
    if (ph === 0) { const e = ez(clp(age / 260, 0, 1)); aim(arm, Z.pt, 96, .72); P["g" + arm] = Math.min(1, age / 300); P.lean = P.lean * -.5 - dxT * 3.4 * e; P.hip = -dxT * 4 * e; P.dy = 5 * e; P.sq = 1 - .03 * e; P.spd = 4 * e }
    else { aim(arm, Z.pt, ph === 1 ? 58 : 5, ph === 1 ? .92 : 1); P.spd = 3 }
    hs.forEach(h => { const p = pulse(t - (cs.t0 + h.t), 140, 300); P.hip += dxT * 6 * p; P.lean += dxT * 4.5 * p; P.dy -= 2 * p; P.head += dxT * 2 * p; P.spd += 2 * p });
  } else if (pm === "b" && cs) {
    P.wm = 0;
    if (age < 420) { P.au = 72; P.bu = -72; P.af = 28; P.bf = -28; P.lean = -2; P.ga = P.gb = .4; P.dy = 8; P.sq = .95; P.spd = 5 }
    else if (age > cs.dur - 750) { P.au = 105; P.bu = -105; P.af = 16; P.bf = -16; P.ga = P.gb = .5; P.dy = 0; P.spd = 3 }
    else { P.au = 158 + tr(); P.bu = -158 + tr(); P.af = 10; P.bf = -10; P.ga = P.gb = 1; P.head = -6; P.dy = -10 + Math.sin(now / 230) * 2.2; P.sq = 1.03; P.spd = 8 }
    cs.hs.forEach(h => { const d = t - (cs.t0 + h.t); if (d > -150 && d < 170) { const p = d < 0 ? 1 + d / 150 : 1 - d / 170, a = h.m ? 1 : .45; P.au -= p * 14 * a; P.bu += p * 14 * a; P.af += p * 22 * a; P.bf -= p * 22 * a; P.lean += p * 3 * a; P.dy += p * 2.5 * a } });
  } else if (pm === "c" && cs) {
    const tE = cs.hs[6] ? cs.hs[6].t : 2800, dxT = Z.pt ? clp((Z.pt.x - Z.x * W) / (W * .2), -1, 1) : 0; P.wm = 0;
    if (age < 450) { P.bu = -45; P.bf = -72; P.au = 35; P.af = 22; P.gb = .5; P.lean = -2; P.dy = 7 * ez(clp(age / 300, 0, 1)); P.sq = .95; P.spd = 6 }
    else if (age < 1000) { P.bu = -170 + tr(); P.bf = -6; P.au = 50; P.af = 10; P.gb = 1; P.ga = .4; P.lean = -2; P.head = -6; P.dy = -9; P.spd = 8; P.sq = 1.03 }
    else if (age < tE - 250 && Z.pt) { aim("b", Z.pt, 4); P.au = 30; P.af = 10; P.ga = .3; P.hip += dxT * 3; P.spd = 3 }
    else if (Z.pt) { aim("a", Z.pt, 5); aim("b", Z.pt, 5); P.lean += 2; P.hip += dxT * 6; P.dy = 4; P.spd = 5 }
  } else if (pm === "bye") { P.wm = 0; P.au = 165; P.bu = -165; P.af = 10; P.bf = -10; P.ga = P.gb = 1; P.lean = -3; P.head = -8; P.dy = -18 + Math.sin(now / 200) * 2; P.sq = 1.04; P.spd = 10 }
  else if (pm !== "hide" && Z.own && Z.aim && t >= Z.stunEnd && t < Z.ctlEnd && !(Z.busy > t)) {
    P.wm = .35;
    if (Z.sel === "b") { P.au = 150; P.bu = -150; P.af = 14; P.bf = -14; P.ga = P.gb = .5 }
    else if (Z.sel === "c") { P.bu = -165; P.bf = -8; P.gb = .5; P.head = -5 }
    else { const id = zsSnap(Z.aim.x), q = id && zsPt(id, .2); if (q) { aim(zsArm(q.x), q, 22); P["g" + zsArm(q.x)] = .4 } }
  }
  return P;
}
/* ---------- HUD, tombol, bidikan (hanya pemanggil) ---------- */
function zsHud() {
  const Z = ZS, h = document.createElement("div"); h.id = "zsHud";
  h.innerHTML = '<div class="zc-top"><b>KONSOL ZEUS</b><span id="zsTime"></span></div><div class="zt"><b id="zsTb"></b></div>' +
    '<div class="zc-st" id="zsSt"><span>1. PILIH SKILL (tombol 1 / 2 / 3)</span><span>2. BIDIK TARGET</span><span>3. TEMBAK (tombol SPASI)</span></div><div class="zh" id="zsH"></div>' +
    '<div class="zr">' + ["a", "b", "c"].map(k => `<button data-s="${k}"><i class="cd"></i><b class="kn">${ZS_INFO[k].k}</b><span class="nm">${ZS_INFO[k].n}</span><small>${ZS_INFO[k].s}</small><u></u></button>`).join("") + '</div>' +
    '<div class="zr zr2"><button class="mv" id="zsBL" aria-label="Geser Zeus ke kiri">&#9664;<small>A</small></button><button class="fire" id="zsFire"><b>TEMBAK <kbd>SPASI</kbd></b><small id="zsFs"></small></button><button class="mv" id="zsBR" aria-label="Geser Zeus ke kanan">&#9654;<small>D</small></button></div>' +
    '<div class="zk"><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> pilih skill</span><span><kbd>SPASI</kbd> tembak</span><span><kbd>A</kbd><kbd>D</kbd> atau <kbd>&larr;</kbd><kbd>&rarr;</kbd> geser Zeus</span><span><kbd>Esc</kbd> batal bidik</span></div>';
  $("s-game").appendChild(h); $("s-game").classList.add("zsc");
  h.querySelectorAll("button[data-s]").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); zsSel(b.dataset.s) }));
  $("zsFire").addEventListener("pointerdown", e => { e.preventDefault(); zsFire() });
  const hold = (id, key) => { const b = $(id), on = v => e => { e.preventDefault(); Z[key] = v }; b.addEventListener("pointerdown", on(1)); ["pointerup", "pointerleave", "pointercancel"].forEach(n => b.addEventListener(n, on(0))) };
  hold("zsBL", "bL"); hold("zsBR", "bR"); zsSel("a");
}
function zsHudOff() { const h = $("zsHud"); if (h) h.remove(); const g = $("s-game"); if (g) g.classList.remove("zsc") }
function zsSel(k) {
  const Z = ZS; if (!Z || !Z.own) return; Z.sel = k;
  document.querySelectorAll("#zsHud button[data-s]").forEach(b => b.classList.toggle("on", b.dataset.s === k));
  if (!Z.aim) { const e = zsEnemies()[0], g = e && zsTw(e.id); if (g) Z.aim = { x: g.x, y: g.top + g.h / 2 } }
}
/* status konsol: langkah aktif, petunjuk, tombol TEMBAK dan hitung mundur tiap skill */
function zsHudTick() {
  const Z = ZS, t = zsNow(), b = $("zsTb"); if (!b) return; const k = Z.sel, I = ZS_INFO[k], left = Math.max(0, Z.ctlEnd - t);
  b.style.transform = `scaleX(${clp(left / ZS_CTL, 0, 1).toFixed(3)})`; $("zsTime").textContent = "Zeus pergi dalam " + Math.ceil(left / 1000) + " dtk";
  document.querySelectorAll("#zsHud button[data-s]").forEach(el => { const kk = el.dataset.s, rem = Math.max(0, Z.cd[kk] - t), r = clp(rem / ZS_CDS[kk], 0, 1); el.firstChild.style.transform = `scaleY(${r.toFixed(3)})`; el.lastChild.textContent = rem > 0 ? (rem / 1000).toFixed(1) + "s" : "" });
  const cd = Math.max(0, Z.cd[k] - t), busy = Z.busy > t, ok = !!Z.okAim, ready = ok && !cd && !busy;
  const st = k === "b" ? "AREA" : "MENARA LAWAN";
  let msg, step;
  if (busy) { msg = "Zeus sedang menyerang..."; step = 3 }
  else if (cd) { msg = `${I.n} siap lagi dalam ${(cd / 1000).toFixed(1)} detik. Tekan 1, 2, atau 3 untuk memakai skill lain.`; step = 1 }
  else if (!ok) { msg = k === "b" ? `Skill ${I.k} dipilih. Arahkan lingkaran badai ke menara lawan (mouse atau sentuh layar).` : `Skill ${I.k} dipilih. Arahkan kursor ke menara lawan (mouse atau sentuh layar).`; step = 2 }
  else { msg = `Target: ${Z.tname || st}. Tekan SPASI untuk menembak (atau klik / ketuk target).`; step = 3 }
  const h = $("zsH"); if (h && h.textContent !== msg) h.textContent = msg;
  document.querySelectorAll("#zsSt span").forEach((s, i) => { s.className = i + 1 < step ? "ok" : i + 1 === step ? "on" : "" });
  const f = $("zsFire"); f.classList.toggle("rdy", ready); $("zsFs").textContent = cd ? "Siap lagi " + (cd / 1000).toFixed(1) + " dtk" : busy ? "Sedang menyerang" : ready ? I.n : "Pilih target dulu";
}
function zsAimOn() {
  const Z = ZS, a = mk(Z.L, "zs-aim"); a.style.zIndex = 1; Z.aimEl = a; Z.L.style.pointerEvents = "none"; Z.hl = [];
  const pos = e => { const b = $("scene").getBoundingClientRect(); Z.aim = { x: e.clientX - b.left, y: e.clientY - b.top } };
  a.addEventListener("pointerdown", e => { e.preventDefault(); try { a.setPointerCapture(e.pointerId) } catch (x) { } pos(e); Z.down = true; if (e.pointerType === "mouse") { Z.down = false; zsFire() } });
  a.addEventListener("pointermove", e => { pos(e) });
  a.addEventListener("pointerup", e => { pos(e); if (Z.down) { Z.down = false; zsFire() } });
  a.addEventListener("pointercancel", () => { Z.down = false });
  Z.ti = mk(Z.L, "zs-tgt"); Z.ar = mk(Z.L, "zs-area"); Z.tp = mk(Z.L, "zs-tip");
  Z.ln = document.createElementNS(SVGN, "svg"); Z.ln.setAttribute("class", "zs-bolt"); Z.ln.innerHTML = '<path stroke="#ffd23a" stroke-width="9" stroke-opacity=".2" fill="none"/><path stroke="#ffe35a" stroke-width="4" stroke-opacity=".6" fill="none"/><path stroke="#fffbe0" stroke-width="1.6" fill="none"/>'; Z.L.appendChild(Z.ln);
  [Z.ti, Z.ar, Z.tp].forEach(e => e.style.display = "none"); zsSel(Z.sel);
}
function zsAimDraw() {
  const Z = ZS; if (!Z.ti) return; const t = zsNow(), a = Z.aim, ok = Z.busy <= t;
  if (!a || t < Z.stunEnd || t >= Z.ctlEnd) { Z.ti.style.display = Z.ar.style.display = Z.tp.style.display = "none"; Z.ln.style.display = "none"; return }
  const { W, H } = zsSz(); Z.ln.style.display = ""; Z.ln.style.width = W + "px"; Z.ln.style.height = H + "px";
  let px = a.x, py = a.y, txt = "";
  Z.ar.style.display = Z.ti.style.display = "none";
  (Z.hl || []).forEach(e => e.style.display = "none");
  if (Z.sel === "b") {
    const R = zsR(), ar = zsInArea(a.x), n = ar.length; Z.ar.style.display = ""; Z.ar.style.left = a.x + "px"; Z.ar.style.top = a.y + "px"; Z.ar.style.width = Z.ar.style.height = 2 * R + "px";
    ar.forEach((o, i) => { const g = zsTw(o.id); if (!g) return; let e = Z.hl[i]; if (!e) e = Z.hl[i] = mk(Z.L, "zs-tgt hi"); e.style.display = ""; e.style.left = g.l - 6 + "px"; e.style.top = g.top - 8 + "px"; e.style.width = g.w + 12 + "px"; e.style.height = g.h + 16 + "px" });
    txt = n ? n + " menara dalam area · 6 utama + 3 tambahan" : "Geser area ke menara lawan"; Z.tp.style.left = a.x + "px"; Z.tp.style.top = Math.max(24, a.y - R - 8) + "px";
    Z.okAim = n > 0; Z.tname = n + " menara di area";
  } else {
    const id = zsSnap(a.x), g = id && zsTw(id); Z.okAim = !!g;
    if (g) { Z.ti.style.display = ""; Z.ti.className = "zs-tgt" + (Z.sel === "c" ? " hi" : ""); Z.ti.style.left = g.l - 6 + "px"; Z.ti.style.top = g.top - 8 + "px"; Z.ti.style.width = g.w + 12 + "px"; Z.ti.style.height = g.h + 16 + "px"; px = g.x; py = g.top + 6; const p = peersNow().find(q => q.id === id); Z.tname = p ? p.name : ""; txt = (p ? p.name : "") + (Z.sel === "c" ? " · 7 kuda" : " · 2 sambaran"); Z.tp.style.left = g.x + "px"; Z.tp.style.top = Math.max(24, g.top - 14) + "px" }
    else { txt = "Arahkan ke menara lawan"; Z.tp.style.left = a.x + "px"; Z.tp.style.top = Math.max(24, a.y - 14) + "px" }
  }
  Z.tp.style.display = ""; Z.tp.textContent = (ok ? "" : "Menunggu · ") + txt;
  const pm = zsPalm(Z.sel === "c" ? "b" : zsArm(px)), good = Z.okAim && ok && t >= Z.cd[Z.sel], nw = performance.now();
  { const dx = px - pm.x, dy = py - pm.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, N = 16; let d = "";
    for (let q = 0; q <= N; q++) { const u = q / N, o = Math.sin(u * 9 + nw / 75) * 5 * Math.sin(Math.PI * u) + Math.sin(u * 23 - nw / 40) * 1.8 * Math.sin(Math.PI * u); d += (q ? "L" : "M") + (pm.x + dx * u + nx * o).toFixed(1) + " " + (pm.y + dy * u + ny * o).toFixed(1) }
    const ps = Z.ln.children; for (let q = 0; q < ps.length; q++) ps[q].setAttribute("d", d);
    ps[0].setAttribute("stroke", good ? "#ffd23a" : "#ff4a4a"); ps[1].setAttribute("stroke", good ? "#ffe35a" : "#ff6a6a"); ps[2].setAttribute("stroke", good ? "#fffbe0" : "#ffd0d0") }
}
function zsZKey(e, dn) {
  const Z = ZS; if (!Z || !Z.own || zsNow() < Z.stunEnd || zsNow() >= Z.ctlEnd) return; const c = e.code;
  if (c === "ArrowLeft" || c === "KeyA") { Z.kL = dn ? 1 : 0; e.preventDefault() }
  else if (c === "ArrowRight" || c === "KeyD") { Z.kR = dn ? 1 : 0; e.preventDefault() }
  else if (dn && /^Digit[1-3]$/.test(c)) { zsSel("abc"[+c.slice(5) - 1]); e.preventDefault() }
  else if (dn && (c === "Space" || c === "Enter")) { zsFire(); e.preventDefault() }
  else if (dn && c === "Escape") Z.aim = null;
}
addEventListener("keydown", e => zsZKey(e, true)); addEventListener("keyup", e => zsZKey(e, false));

/* ---------- rencana serangan (pemanggil) ---------- */
function zsFire() {
  const Z = ZS, t = zsNow(); if (!Z || !Z.own || t < Z.stunEnd || t >= Z.ctlEnd || !Z.aim) return;
  const k = Z.sel; if (t < Z.cd[k]) { popup(ZS_INFO[k].n + " belum siap"); return }
  if (Z.busy > t) return; const { W, H } = zsSz(); let za;
  const fl = {}; zsEnemies().forEach(p => fl[p.id] = p.floors || 0);
  const base = { s: me.id + t, c: k, x: Math.round(Z.x * 1000) / 1000 };
  if (k === "b") {
    const ar = zsInArea(Z.aim.x); if (!ar.length) { popup("Arahkan area badai ke menara lawan"); return }
    const R = zsR(), hs = [], others = zsEnemies().filter(p => !ar.some(o => o.id === p.id)).map(p => ({ id: p.id, d: Math.abs((zsTw(p.id) || { x: 0 }).x - Z.aim.x) })).sort((a, b) => a.d - b.d), ex = others.length ? others : ar;
    for (let i = 0; i < 6; i++) { const o = ar[i % ar.length], d = fl[o.id] >= 1 ? 1 : 0; fl[o.id] -= d; hs.push({ id: o.id, d, t: 1300 + i * 330, u: Math.random(), m: 1, ty: [0, 1, 2, 3, 5, 4][i] }) }
    for (let i = 0; i < 3; i++) { const o = ex[i % ex.length], d = fl[o.id] >= .5 ? .5 : 0; fl[o.id] -= d; hs.push({ id: o.id, d, t: 1500 + i * 720, u: Math.random(), m: 0, ty: [4, 3, 5][i] }) }
    za = { ...base, ax: Math.round(Z.aim.x / W * 1000) / 1000, ay: Math.round(Z.aim.y / H * 1000) / 1000, R: Math.round(R), hs, dur: 4000 };
  } else {
    const id = zsSnap(Z.aim.x); if (!id) { popup("Arahkan ke menara lawan"); return }
    const hs = [];
    if (k === "a") for (let i = 0; i < 2; i++) { const d = fl[id] >= 1 ? 1 : 0; fl[id] -= d; hs.push({ id, d, t: 560 + i * 360, u: i ? .5 : .12, m: 1 }) }
    else for (let i = 0; i < 7; i++) { const want = i === 6 ? 2 : 1, d = Math.min(want, Math.max(0, fl[id])); fl[id] -= d; hs.push({ id, d, t: 2050 + i * 90, u: rnd(.05, .95), m: 1, hi: i }) }
    za = { ...base, tid: id, hs, dur: k === "a" ? 1300 : 3900 };
  }
  Z.cd[k] = t + ZS_CDS[k]; Z.busy = t + (k === "a" ? 900 : za.dur - 600); push({ za, zp: Z.x }); zsApply(za, true);
}
function zsApply(za, own) {
  za.hs.forEach(h => {
    if (!h.d) return;
    if (h.id === me.id) setTimeout(() => zsDmg(h.d), h.t);
    const b = BOTS.find(x => x.id === h.id); if (b) setTimeout(() => zsBotDmg(b, h.d), h.t);
  });
  zsCast(za, own);
}
function zsDmg(d) {
  if (over || ended || zsProt(me.id)) return;
  const acc = (ZF.me || 0) + d, n = Math.floor(acc + 1e-6); ZF.me = acc - n; if (n <= 0) return;
  if (me.dg > zsNow()) { if (typeof lgDgBlock === "function") lgDgBlock(); return }
  if (me.sh) { push({ sh: 0 }); if (ST.txr) popup("🛡️ SERANGAN DITANGKIS!"); return }
  if (!fc) return; fc = Math.max(0, fc - n); SFX.hurt(); push({ floors: fc }); stat(); drawWord(); sync();
  const v = document.createElement("div"); v.className = "flash"; v.style.background = "radial-gradient(circle,transparent 35%,rgba(120,180,255,.75))"; $("scene").appendChild(v); v.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 0 }], { duration: 600 }).onfinish = () => v.remove();
  $("fl").animate([{ transform: "scale(1.3)", background: "#c8261a" }, { transform: "none" }], { duration: 600, easing: "ease-out" });
}
function zsBotDmg(b, d) {
  if (ended) return; const acc = (b.zf || 0) + d, n = Math.floor(acc + 1e-6); b.zf = acc - n; if (n <= 0) return;
  if (b.dg > zsNow()) return; if (b.sh) { b.sh = 0; pubBots(); return } if (!b.floors) return; b.floors = Math.max(0, b.floors - n); pubBots();
}

/* ---------- animasi serangan (semua pemain) ---------- */
function zsCast(za, own) {
  const Z = ZS; if (!Z) return; const L = Z.L, { W, H } = zsSz(), lo = Z.lo, t0 = zsNow(), far = !Z.own;
  if (typeof za.x === "number") Z.tx = za.x; if (!own) Z.x = Z.tx;
  Z.cs = { t0: t0, type: za.c, hs: za.hs, dur: za.dur }; Z.casting = (Z.casting | 0) + 1; zsT(() => { Z.casting-- }, za.dur);
  const tw = id => zsTw(id), hit = (h, big, sx, sy, ty) => {
    const p = zsPt(h.id, h.u); if (!p) return;
    zsBolt(L, sx, sy, p.x, p.y, { w: big ? 9 : 5, ty, lo, dur: big ? 520 : 400 }); zsBoom(L, p.x, p.y, big ? 1.9 : 1.1, big, lo); zsShake(big ? 8 : 4, big ? 8 : 4, 380); SFX.zs("hit", { far });
    const g = tw(h.id); if (g) { const e = tws[h.id].el; e.animate([{ filter: "brightness(3)" }, { filter: "none" }], { duration: 420 }) }
  };
  if (za.c === "a") {
    const g0 = tw(za.tid); if (!g0) return; Z.pm = "aim"; Z.pt = { x: g0.x, y: g0.top + g0.h * .15 }; Z.glowT = 1; SFX.zs("a", { far });
    zsT(() => { const g = tw(za.tid); if (g) Z.pt = { x: g.x, y: g.top + 8 } }, 300);
    for (let i = 0; i < 6; i++) zsT(() => { const pm = zsPalm(zsArm(Z.pt ? Z.pt.x : 0)); const e = mk(L, "zs-sp", `left:${pm.x}px;top:${pm.y}px`); const a = Math.random() * 360; e.animate([{ transform: `rotate(${a}deg) translateY(-30px) scaleY(1.3)`, opacity: 1 }, { transform: `rotate(${a}deg) translateY(0) scaleY(.4)`, opacity: 0 }], { duration: 360 }).onfinish = () => e.remove() }, i * 70);
    za.hs.forEach((h, i) => zsT(() => {
      const pm = zsPalm(zsArm(Z.pt ? Z.pt.x : 0));
      hit(h, true, pm.x, pm.y, i ? 3 : 0); zsFlash(L, .5, 220); Z.svg.animate([{ transform: "translateX(0)" }, { transform: `translateX(${zsArm(Z.pt ? Z.pt.x : 0) === "a" ? 9 : -9}px) rotate(${zsArm(Z.pt ? Z.pt.x : 0) === "a" ? 1 : -1}deg)`, offset: .25 }, { transform: "none" }], { duration: 320 });
      const rr = mk(L, "zs-rg", `left:${pm.x - 20}px;top:${pm.y - 20}px;width:40px;height:40px`); rr.animate([{ transform: "scale(.4)", opacity: 1 }, { transform: "scale(3)", opacity: 0 }], { duration: 400 }).onfinish = () => rr.remove();
    }, h.t));
    zsT(() => { if (Z.pm === "aim") Z.pm = "idle" }, za.dur);
  } else if (za.c === "b") {
    Z.pm = "b"; SFX.zs("b", { far }); const ax = za.ax * W, ay = za.ay * H, R = za.R || 120;
    Z.dark.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 1200, easing: "ease-in-out", fill: "forwards" }); if (Z.sky) Z.sky.el.animate([{ filter: "brightness(1)" }, { filter: "brightness(.55)" }], { duration: 1300, easing: "ease-in-out", fill: "forwards" });
    const ar = mk(L, "zs-area", `left:${ax}px;top:${ay}px;width:${2 * R}px;height:${2 * R}px`); ar.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    const bl = Math.max(0, ax - R * 1.7), bw = R * 3.4, st = zsBank(L, `left:${bl}px;top:-6%;width:${bw}px;height:38%;opacity:0;-webkit-mask-image:radial-gradient(ellipse 50% 75% at 50% 35%,#000 40%,transparent 78%);mask-image:radial-gradient(ellipse 50% 75% at 50% 35%,#000 40%,transparent 78%)`, { thr: .4, sc: 2.6, gain: 2.3, fade: .62 }), sf = (x, k) => st.flash(clp((x - bl) / bw, 0, 1), k);
    st.el.animate([{ opacity: 0, transform: "translateY(-70px) scale(.7)" }, { opacity: 1, transform: "none" }], { duration: 1300, easing: "cubic-bezier(.2,.6,.2,1)", fill: "forwards" });
    for (let i = 0; i < 3; i++) zsT(() => { zsFlash(L, .2, 240); const sx = ax + rnd(-R, R); sf(sx, .8); zsBolt(L, sx, H * .04, sx + rnd(-50, 50), H * .24, { w: 2, dur: 420, lo, ty: i, noGlow: 1 }) }, 450 + i * 380);
    za.hs.forEach(h => {
      zsT(() => { const p = zsPt(h.id, h.u); if (p) { zsFlash(L, h.m ? .3 : .15, 220); sf(p.x, .7); zsBolt(L, p.x + rnd(-50, 50), H * .05, p.x + rnd(-20, 20), H * .05 + (p.y - H * .05) * .5, { w: 1.6, dur: 300, lo, noGlow: 1 }) } }, h.t - 250);
      zsT(() => { const p = zsPt(h.id, h.u); if (!p) return; const sx = p.x + rnd(-70, 70); sf(sx, 1); hit(h, !!h.m, sx, H * .07 + rnd(-6, 12), h.ty | 0) }, h.t);
    });
    zsT(() => { ar.classList.add("hit"); ar.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" }) }, za.hs[5] ? za.hs[5].t + 150 : 3000);
    zsT(() => { Z.pm = "idle"; st.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, fill: "forwards" }); Z.dark.animate([{ opacity: 1 }, { opacity: .2 }], { duration: 1400, easing: "ease-in-out", fill: "forwards" }); if (Z.sky) Z.sky.el.animate([{ filter: "brightness(.55)" }, { filter: "brightness(1)" }], { duration: 1400, fill: "forwards" }); setTimeout(() => { st.stop(); st.el.remove(); ar.remove() }, 1200) }, za.dur - 400);
  } else if (za.c === "c") {
    Z.pm = "c"; SFX.zs("c", { far }); const g0 = tw(za.tid); if (!g0) return; const gx = g0.x, gy = clp(H * .14, 70, 130); Z.pt = { x: g0.x, y: g0.top + 20 }; zsT(() => { const g = tw(za.tid); if (g) Z.pt = { x: g.x, y: g.top + 20 } }, 900);
    zsT(() => { const pm = zsPalm("b"); zsBolt(L, pm.x, pm.y, gx, gy, { w: 7, ty: 4, dur: 600, lo }); zsFlash(L, .5, 300) }, 420);
    const gate = mk(L, "zs-gate", `left:${gx}px;top:${gy}px;opacity:0`); gate.animate([{ opacity: 0, transform: "scale(.1)" }, { opacity: 1, transform: "scale(1)" }], { duration: 800, delay: 300, easing: "cubic-bezier(.2,1.3,.4,1)", fill: "forwards" });
    zsT(() => { zsShake(10, 7, 700) }, 700);
    const ap = [[-400, -10], [400, -10], [-320, 120], [320, 120], [0, -60], [-470, 250], [470, 250]];
    za.hs.forEach((h, i) => {
      const ln = h.t - 1000, [dx, dy] = ap[i % 7], ax = gx + dx, ay = gy + dy;
      zsT(() => {
        const e = mk(L, "zs-hs"); e.innerHTML = zsHorse(i); const sc0 = lo ? .9 : 1.15, p = zsPt(h.id, h.u) || { x: gx, y: g0.bot }, tx = p.x + (i - 3) * 6, ty = p.y;
        const dir = (vx, vy) => { const s = vx >= 0 ? 1 : -1, a = (s > 0 ? Math.atan2(vy, vx) : Math.atan2(-vy, -vx)) * 180 / Math.PI; return `rotate(${a.toFixed(0)}deg) scaleX(${s})` };
        const d1 = dir(dx || 1, dy - 40), d2 = dir(tx - ax, ty - ay);
        e.animate([{ transform: `translate(${gx}px,${gy}px) ${d1} scale(.12)`, opacity: 0 }, { transform: `translate(${gx + dx * .5}px,${gy + dy * .5 - 20}px) ${d1} scale(${sc0 * .7})`, opacity: 1, offset: .12 },
          { transform: `translate(${ax}px,${ay}px) ${d1} scale(${sc0})`, opacity: 1, offset: .3 }, { transform: `translate(${ax}px,${ay}px) ${d2} scale(${sc0})`, opacity: 1, offset: .301 },
          { transform: `translate(${tx}px,${ty}px) ${d2} scale(${sc0 * .8})`, opacity: 1, offset: .97 }, { transform: `translate(${tx}px,${ty}px) ${d2} scale(${sc0 * .8})`, opacity: 0 }], { duration: 1050, easing: "cubic-bezier(.35,0,.7,.9)", fill: "forwards" }).onfinish = () => e.remove();
        const r = mk(L, "zs-rg", `left:${gx - 30}px;top:${gy - 30}px;width:60px;height:60px`); r.animate([{ transform: "scale(.4)", opacity: 1 }, { transform: "scale(3.2)", opacity: 0 }], { duration: 520 }).onfinish = () => r.remove();
        zsBolt(L, gx + rnd(-60, 60), -10, gx + dx * .35, gy + 40, { w: 6, ty: i % 6, dur: 420, lo }); zsFlash(L, .3, 200);
      }, ln);
      zsT(() => { const p = zsPt(h.id, h.u); if (!p) return; zsBolt(L, p.x + rnd(-30, 30), -10, p.x, p.y, { w: 11, ty: 1, dur: 500, lo }); zsBoom(L, p.x, p.y, 2.4, true, lo); zsShake(10, 9, 450); zsFlash(L, .45, 250); SFX.zs("hit", { far }); const t = tws[h.id]; if (t) t.el.animate([{ filter: "brightness(3.5)" }, { filter: "none" }], { duration: 480 }) }, h.t);
    });
    const tEnd = (za.hs[6] ? za.hs[6].t : 2800) + 450;
    zsT(() => { gate.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.1)" }], { duration: 500, fill: "forwards" }).onfinish = () => gate.remove() }, 2500);
    zsT(() => {
      const g = tw(za.tid) || g0, cx = g.x, cy = g.top + g.h * .5; zsFlash(L, 1, 800); zsShake(18, 18, 1000);
      zsBoom(L, cx, cy, 6.5, true, lo); zsBoom(L, cx, g.bot - 10, 4.5, true, lo);
      for (let i = 0; i < (lo ? 3 : 7); i++) zsBolt(L, cx + rnd(-170, 170), -10, cx + rnd(-130, 130), g.bot - rnd(0, g.h), { w: 8, ty: i % 6, dur: 600 + i * 40, lo });
      const bl = mk(L, "zs-bm", `left:${cx - 210}px;top:${cy - 210}px;width:420px;height:420px`); bl.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: "scale(1.2)", opacity: .85, offset: .4 }, { transform: "scale(1.6)", opacity: 0 }], { duration: 1000, easing: "ease-out" }).onfinish = () => bl.remove();
      SFX.zs("hit", { far });
    }, tEnd);
    zsT(() => { if (Z.pm === "c") Z.pm = "idle" }, tEnd + 500);
  }
}
/* kuda petir: kepala, leher, badan, empat kaki, surai dan ekor dari petir; tiap kuda dibuat dengan acak berbeda */
function zsHorse(seed) {
  const bz = (x0, y0, x1, y1, n, j) => zaBolt(x0, y0, x1, y1, n, j), gl = '<filter id="zhf' + seed + '"></filter>';
  let mane = "", tail = "", vein = "", legs = "";
  for (let i = 0; i < 7; i++) { const u = i / 6, mx = 150 + u * 48, my = 52 - u * 46; mane += `<path d="${bz(mx, my, mx - 34 - rnd(0, 26), my - 4 - rnd(0, 22), 5, 12)}" stroke="#e8f8ff" stroke-width="${(3 - u).toFixed(1)}" fill="none"/>` }
  for (let i = 0; i < 5; i++) tail += `<path d="${bz(56, 62 + i * 3, 2 - rnd(0, 10), 70 + i * 16 + rnd(-8, 8), 6, 14)}" stroke="#d6f0ff" stroke-width="${(3 - i * .35).toFixed(1)}" fill="none"/>`;
  for (let i = 0; i < 6; i++) vein += `<path d="${bz(64 + rnd(0, 30), 56 + rnd(0, 30), 120 + rnd(0, 50), 58 + rnd(0, 34), 5, 9)}" stroke="#fff" stroke-width="1.4" fill="none" opacity=".9"/>`;
  const leg = (x, c, f) => `<g class="lg ${c}" style="transform-origin:${x}px 90px"><path d="M${x - 7} 88L${x + 7} 88L${x + 4} 114L${x + 9} 128L${x + 6} 146L${x - 3} 146L${x - 4} 128L${x - 7} 112Z" fill="url(#zhg${seed})" stroke="#e8f8ff" stroke-width="1.6" opacity="${f}"/><path d="M${x - 4} 146L${x + 7} 146L${x + 8} 150L${x - 5} 150Z" fill="#fff"/><path d="${bz(x, 94, x + rnd(-3, 3), 146, 4, 7)}" stroke="#fff" stroke-width="1.3" fill="none"/></g>`;
  legs = leg(66, "a", .8) + leg(84, "b", .9) + leg(152, "c", .85) + leg(168, "a", 1);
  return `<svg viewBox="-10 -14 260 170"><defs><linearGradient id="zhg${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#8fd0ff"/><stop offset="1" stop-color="#2f6cff" stop-opacity=".75"/></linearGradient></defs>
  <g class="mn">${mane}</g><g class="tl">${tail}</g>${legs}
  <path d="M52 66C56 48 108 44 150 50C170 54 180 66 176 82C170 98 130 102 96 100C66 98 48 84 52 66Z" fill="url(#zhg${seed})" stroke="#e8f8ff" stroke-width="2"/>
  <path d="M142 58C156 36 176 14 198 4L214 12C206 28 198 46 188 70C182 84 176 92 170 90Z" fill="url(#zhg${seed})" stroke="#e8f8ff" stroke-width="2"/>
  <path d="M198 4L214 6C226 12 238 30 243 44C243 51 236 53 232 50C222 44 212 38 205 30C199 22 195 12 198 4Z" fill="url(#zhg${seed})" stroke="#e8f8ff" stroke-width="2"/>
  <path d="M199 5L201 -9L209 5Z" fill="#fff" stroke="#e8f8ff" stroke-width="1.4"/><circle cx="238" cy="44" r="2" fill="#2f6cff"/>
  <ellipse cx="210" cy="17" rx="4.5" ry="3" fill="#fff"/><ellipse cx="210" cy="17" rx="9" ry="6" fill="#bfe8ff" opacity=".6"/>
  <g class="mn">${vein}</g></svg>`;
}
/* dipanggil dari hits(): posisi Zeus pemain lain dan serangan barunya */
function zsPeers(ps) {
  if (!ZS || ZS.own) return; const p = ps.find(x => x.id === ZS.by); if (!p) return;
  if (typeof p.zp === "number") { if (ZS.zp0 == null) ZS.zp0 = p.zp; if (p.zp !== ZS.zp0 || ZS.zmv) { ZS.zmv = 1; ZS.tx = p.zp } }
  const za = p.za; if (za && ZS.zseen !== za.s && zsNow() >= ZS.stunEnd - 200) { ZS.zseen = za.s; zsApply(za, false) }
}