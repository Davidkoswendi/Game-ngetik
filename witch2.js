/* witch2.js: 6 SIHIR BARU untuk skill WITCH (dimuat setelah witch.js).
   Isi:
   - WT_X[id](X, sp)  : animasi tiap sihir (X = konteks dari wtFx di witch.js, sp = data sihir di WT_SP)
   - wtVictimX(sp)    : efek ke korban (debuff, gangguan layar)
   - wtMeltX(o)       : cara lantai hancur untuk sihir yang mengurangi lantai (es, pasir)
   - wtXStop()        : bersih-bersih saat game selesai / reset
   Sihir: ice, shadow, curse, web, sand, sleep.
   Memakai: WT, WT_SP, wtT, wtLockMe, wtSpr, lgPos, lgFlash, ringAt, shake, mk, rnd, popup, drawWord, stat, sync, push, me, tws, ST, list, idx, combo, ck, lkC, tbEnd. */
const WT_X = {};
const WTX = { els: new Set(), gv: null };
const wtxEl = e => { WTX.els.add(e); return e };
const wtxCls = (el, cls, ms) => { if (!el) return; el.classList.add(cls); wtT(() => el.classList.remove(cls), ms) };
const wtxRm = (e, ms) => wtT(() => { try { e.remove() } catch (x) {} WTX.els.delete(e) }, ms);
const wtxC = (a, k) => "rgba(" + a.join(",") + "," + k + ")";

/* peluru sihir dari ujung tongkat ke menara; mkTrail(x, y, k) dipanggil tiap frame */
function wtxProj(X, T, mkTrail, yf) {
  const { E, gm, wand } = X, w = wand(), g = gm(), x1 = g.cx, y1 = g.top + g.h * (yf == null ? .3 : yf), st = performance.now();
  E.emit(T + 30, () => {
    const k = Math.min(1, (performance.now() - st) / T), e = k * k * .6 + k * .4;
    mkTrail(w.x + (x1 - w.x) * e, w.y + (y1 - w.y) * e - Math.sin(k * Math.PI) * 30, k);
  });
}
const wtxRock = (E, x, y, n, sp, c0, c1, big) => { for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), s = rnd(sp * .3, sp); E.p({ t: "rock", x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: Math.cos(a) * s, vy: Math.sin(a) * s - sp * .3, ay: 800, vr: rnd(-12, 12), m: rnd(.7, 1.3), s0: rnd(2, big || 6), s1: rnd(1, (big || 6) * .6), c0, c1, a0: 1, a1: .15 }) } };

/* ============================ 1. ES: menara membeku ============================ */
WT_X.ice = (X, sp) => {
  const { A, E, t, sc, q, mineV, N, gm, say, cast, eff, setMode, vig } = X;
  setMode("wave", sp.col); say(sp.say, 1300); eff("ice");
  A.at(250, () => { cast(); vig("ivg") });
  A.at(350, () => wtxProj(X, 520, (x, y) => {
    E.p({ x, y, m: .07, s0: 20, s1: 22, c0: [235, 250, 255], a0: .95 });
    for (let i = 0; i < 2; i++) E.p({ x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-20, 20), vy: rnd(0, 40), m: rnd(.3, .6), s0: rnd(8, 14), s1: 2, c0: [170, 225, 255], c1: [90, 160, 255], a0: .8 });
    if (Math.random() < .5) E.p({ t: "spark", x, y, vx: rnd(-60, 60), vy: rnd(-60, 60), m: .5, s0: 1.6, s1: .4, c0: [255, 255, 255], c1: [150, 210, 255] });
  }));
  A.at(sp.hit - 40, () => {
    const g = gm(), PW = 450, dur = sp.ms + 300, FR = "brightness(1.22) saturate(.55) hue-rotate(165deg)";
    ringAt(t.el, g.ex, g.ey + g.h * .5, "wti", 4.6, 700); ringAt(t.el, g.ex, g.ey + g.h * .8, "wti", 3, 560, 120);
    if (!q) lgFlash(sc, "rgba(190,235,255,.65)", .5);
    if (mineV && !q) shake(8, 5, 420, sc);
    E.p({ x: g.cx, y: g.top + g.h * .4, m: .35, s0: 20, s1: 130, c0: [235, 250, 255], c1: [120, 190, 255], a0: .9 });
    wtxRock(E, g.cx, g.top + g.h * .5, N(30), 340, [214, 242, 255], [130, 190, 240], 6);
    for (let i = 0; i < N(14); i++) E.p({ t: "smoke", x: g.cx + rnd(-g.w * .6, g.w * .6), y: g.top + rnd(0, g.h), vx: rnd(-60, 60), vy: -rnd(10, 60), drag: 1, m: rnd(.9, 1.5), s0: 12, s1: rnd(34, 58), c0: [230, 246, 255], a0: .5 });
    /* lapisan es: naik dari bawah, retak berkilau, es menggantung */
    let ic = ""; for (let i = 0; i < 8; i++) ic += '<b class="ic" style="left:' + (6 + i * 12) + '%;height:' + (10 + (i * 37 % 22)) + 'px;width:' + (5 + (i * 11 % 5)) + 'px"></b>';
    const sh = A.add(mk(sc, "wt-ice", "left:" + (g.cx - g.w / 2 - 3) + "px;top:" + (g.top - 5) + "px;width:" + (g.w + 6) + "px;height:" + (g.h + 10) + "px", '<i class="sh1"></i><i class="sh2"></i>' + ic));
    sh.animate([{ clipPath: "inset(100% 0 0 0)", opacity: 1 }, { clipPath: "inset(0 0 0 0)", opacity: 1, offset: PW / dur }, { clipPath: "inset(0 0 0 0)", opacity: 1, offset: sp.ms / dur }, { clipPath: "inset(0 0 0 0)", opacity: 0 }], { duration: dur, fill: "forwards", easing: "ease-out" });
    try { t.stack.animate([{ filter: "none" }, { filter: FR, offset: PW / dur }, { filter: FR, offset: sp.ms / dur }, { filter: "none" }], { duration: dur }) } catch (x) {}
    E.emit(sp.ms, () => { if (Math.random() < .5) { const g2 = gm(); E.p({ t: "smoke", x: g2.cx + rnd(-g2.w * .5, g2.w * .5), y: g2.top + rnd(0, g2.h * .3), vx: rnd(-10, 10), vy: -rnd(10, 30), m: rnd(1, 1.6), s0: 8, s1: rnd(22, 36), c0: [225, 242, 255], a0: .3 }) } if (Math.random() < .3) { const g2 = gm(); E.p({ x: g2.cx + rnd(-g2.w * .5, g2.w * .5), y: g2.top + rnd(0, g2.h), m: .5, s0: rnd(6, 12), s1: 1, c0: [255, 255, 255], a0: .9 }) } });
    A.at(sp.ms, () => {
      const g2 = gm();
      wtxRock(E, g2.cx, g2.top + g2.h * .5, N(44), 420, [220, 244, 255], [140, 195, 240], 7);
      ringAt(t.el, g2.ex, g2.ey + g2.h * .5, "wti", 5, 650);
      if (!q) lgFlash(sc, "rgba(210,240,255,.6)", .45);
      if (mineV && !q) shake(12, 7, 460, sc);
    });
  });
};

/* ============================ 2. GELAP: layar korban gelap ============================ */
WT_X.shadow = (X, sp) => {
  const { A, E, t, sc, q, N, gm, say, cast, eff, setMode, vig } = X;
  setMode("sky", sp.col); say(sp.say, 1300); eff("shadow");
  A.at(250, () => { cast(); vig("dvg") });
  A.at(350, () => wtxProj(X, 520, (x, y) => {
    E.p({ t: "smoke", x, y, vx: rnd(-20, 20), vy: rnd(-20, 20), m: .7, s0: 10, s1: 30, c0: [50, 24, 86], c1: [10, 5, 24], a0: .75 });
    E.p({ x, y, m: .1, s0: 14, s1: 14, c0: [190, 140, 255], a0: .8 });
  }));
  A.at(sp.hit - 40, () => {
    const g = gm(), dur = sp.dk + 600;
    const dk = A.add(mk(sc, "wt-dark")); dk.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: dur, fill: "forwards" });
    for (let i = 0; i < N(30); i++) { const a = rnd(0, 6.283); E.p({ t: "smoke", x: g.cx + Math.cos(a) * 14, y: g.top + g.h * .5 + Math.sin(a) * 14, vx: Math.cos(a) * rnd(60, 240), vy: Math.sin(a) * rnd(40, 200) - 40, drag: 2, m: rnd(1, 1.7), s0: 14, s1: rnd(40, 70), c0: [42, 20, 78], c1: [8, 4, 20], a0: .8, a1: 0 }) }
    ringAt(t.el, g.ex, g.ey + g.h * .5, "wtp", 4.4, 700);
    /* kabut hitam berputar mengelilingi menara */
    E.emit(sp.dk, (dt, el) => {
      const g2 = gm(), ramp = Math.min(1, el / 500) * Math.min(1, (sp.dk - el) / 600);
      for (let i = 0; i < Math.round(N(3) * ramp); i++) {
        const a = rnd(0, 6.283), r = Math.max(g2.w * .8, 56) * rnd(.7, 1.1), x = g2.cx + Math.cos(a) * r, y = rnd(g2.top - 10, g2.bot);
        E.p({ t: "smoke", x, y, vx: -Math.sin(a) * rnd(70, 140), vy: -rnd(10, 60), ax: (g2.cx - x) * 2.4, m: rnd(1, 1.7), s0: 14, s1: rnd(34, 58), c0: [58, 30, 104], c1: [10, 5, 22], a0: .55 * ramp, a1: 0 });
      }
      if (Math.random() < .3 * ramp) E.p({ x: g2.cx + rnd(-g2.w * .5, g2.w * .5), y: rnd(g2.top, g2.bot), m: .6, s0: rnd(8, 16), s1: 2, c0: [170, 110, 255], a0: .5 });
    });
    /* dua mata menyala di atas menara */
    const ey = A.add(mk(sc, "wt-eyes", "left:" + (g.cx - 26) + "px;top:" + (g.top - 40) + "px", "<i></i><i></i>"));
    ey.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)", offset: .15 }, { opacity: 1, offset: .3 }, { opacity: .1, offset: .34 }, { opacity: 1, offset: .38 }, { opacity: 1, offset: .85 }, { opacity: 0, transform: "scale(.6)" }], { duration: dur, fill: "forwards" });
    try { t.stack.animate([{ filter: "none" }, { filter: "brightness(.4) saturate(.6) hue-rotate(20deg)", offset: .15 }, { filter: "brightness(.4) saturate(.6) hue-rotate(20deg)", offset: .85 }, { filter: "none" }], { duration: dur }) } catch (x) {}
  });
};

/* ============================ 3. KUTUKAN: kata terbalik ============================ */
const WT_RUNE = (() => {
  const gl = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ";
  let g1 = "", g2 = "";
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; g1 += '<text x="' + (100 + Math.sin(a) * 80).toFixed(1) + '" y="' + (106 - Math.cos(a) * 80).toFixed(1) + '" transform="rotate(' + i * 30 + " " + (100 + Math.sin(a) * 80).toFixed(1) + " " + (100 - Math.cos(a) * 80).toFixed(1) + ')">' + gl[i] + "</text>" }
  for (let i = 0; i < 6; i++) { const a = i * 60 * Math.PI / 180; g2 += '<path d="M' + (100 + Math.sin(a) * 52).toFixed(1) + " " + (100 - Math.cos(a) * 52).toFixed(1) + "L" + (100 + Math.sin(a + 2.094) * 52).toFixed(1) + " " + (100 - Math.cos(a + 2.094) * 52).toFixed(1) + '"/>' }
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><g class="r1" fill="#e2c4ff" font-size="15" font-family="serif" text-anchor="middle"><circle cx="100" cy="100" r="92" fill="none" stroke="#c58aff" stroke-width="2.4"/><circle cx="100" cy="100" r="68" fill="none" stroke="#c58aff" stroke-width="1.6"/>' + g1 + '</g><g class="r2" fill="none" stroke="#e8d0ff" stroke-width="2">' + g2 + '<circle cx="100" cy="100" r="52"/></g></svg>';
})();
WT_X.curse = (X, sp) => {
  const { A, E, t, sc, q, mineV, N, gm, say, cast, eff, setMode, vig } = X;
  setMode("hover", sp.col); say(sp.say, 1300); eff("curse");
  A.at(250, () => { cast(); vig("pvg") });
  A.at(100, () => {
    const g = gm(), d = Math.max(g.w * 2.1, 110), r = A.add(mk(sc, "wt-rune", "left:" + (g.cx - d / 2) + "px;top:" + (g.gy - d * .17) + "px;width:" + d + "px;height:" + d, WT_RUNE));
    r.animate([{ opacity: 0, transform: "scaleY(.34) scale(.3)" }, { opacity: 1, transform: "scaleY(.34) scale(1)", offset: .15 }, { opacity: 1, transform: "scaleY(.34) scale(1)", offset: .8 }, { opacity: 0, transform: "scaleY(.34) scale(1.2)" }], { duration: sp.hit + 1800, fill: "forwards", easing: "ease-out" });
  });
  /* pusaran sihir berputar berlawanan arah jam (mantra terbalik) */
  A.at(300, () => E.emit(sp.hit + 1400, (dt, el) => {
    const g = gm(), ramp = Math.min(1, el / 400) * Math.min(1, (sp.hit + 1400 - el) / 400);
    for (let i = 0; i < Math.round(N(3) * ramp); i++) {
      const a = -el * .006 + rnd(0, 6.283), r = Math.max(g.w * .7, 50) * rnd(.6, 1.1), y = rnd(g.top, g.bot + 4);
      E.p({ x: g.cx + Math.cos(a) * r, y, vx: Math.sin(a) * 90, vy: -rnd(60, 150), m: rnd(.6, 1), s0: rnd(6, 12), s1: 2, c0: [226, 190, 255], c1: [140, 70, 230], a0: .8 * ramp });
    }
  }));
  A.at(sp.hit - 40, () => {
    const g = gm();
    ringAt(t.el, g.ex, g.ey + g.h * .5, "wtp", 4.6, 700); ringAt(t.el, g.ex, g.ey + g.h * .5, "wtp", 2.8, 520, 140);
    if (!q) lgFlash(sc, "rgba(190,120,255,.5)", .45);
    if (mineV && !q) shake(8, 5, 420, sc);
    E.p({ x: g.cx, y: g.top + g.h * .5, m: .35, s0: 20, s1: 120, c0: [240, 220, 255], c1: [150, 80, 240], a0: .85 });
    for (let i = 0; i < N(34); i++) { const a = rnd(0, 6.283), s = rnd(60, 260); E.p({ t: "spark", x: g.cx, y: g.top + g.h * .5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 1.8, m: rnd(.5, 1), s0: 2.2, s1: .4, c0: [245, 230, 255], c1: [160, 90, 240] }) }
    /* kata melayang terbalik */
    ["kilabret", "tabalik", "!taK"].forEach((w, i) => {
      const e = A.add(mk(sc, "wt-fw", "left:" + (g.cx + (i - 1) * Math.max(34, g.w * .5)) + "px;top:" + (g.top + g.h * .4) + "px", w));
      e.animate([{ opacity: 0, transform: "translate(-50%,0) scaleX(-1) scale(.4)" }, { opacity: 1, transform: "translate(-50%,-30px) scaleX(-1) scale(1)", offset: .25 }, { opacity: 0, transform: "translate(-50%,-90px) scaleX(-1) rotate(" + (i - 1) * 12 + "deg)" }], { duration: 1500, delay: i * 120, fill: "both" });
    });
    try { t.stack.animate([{ transform: "none" }, { transform: "scaleX(-1)", offset: .2 }, { transform: "scaleX(-1)", offset: .55 }, { transform: "none" }], { duration: 1500, easing: "ease-in-out" }) } catch (x) {}
  });
};

/* ============================ 5. JARING: laba-laba raksasa, korban terjerat ============================ */
const WT_SPIDER = '<svg viewBox="0 0 60 56" aria-hidden="true"><g class="lg" stroke="#1a1020" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M24 24L8 14L2 24M24 28L6 28L0 40M24 32L8 44L4 54M26 35L14 52L12 56"/><path d="M36 24L52 14L58 24M36 28L54 28L60 40M36 32L52 44L56 54M34 35L46 52L48 56"/></g><ellipse cx="30" cy="38" rx="11" ry="13" fill="#1a1020"/><path d="M26 34L34 34L30 40L34 46L26 46L30 40Z" fill="#d6263c"/><ellipse cx="30" cy="22" rx="8" ry="7" fill="#2a1a36"/><circle cx="26.5" cy="20" r="1.8" fill="#ff4a5a"/><circle cx="33.5" cy="20" r="1.8" fill="#ff4a5a"/><circle cx="29" cy="17.6" r="1" fill="#ff4a5a"/><circle cx="31" cy="17.6" r="1" fill="#ff4a5a"/></svg>';
const wtxWeb = () => {
  let s = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#f2f4fb" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke">';
  for (let i = 0; i < 10; i++) { const a = i * 36 * Math.PI / 180; s += '<path pathLength="1" d="M50 50L' + (50 + Math.sin(a) * 80).toFixed(1) + " " + (50 - Math.cos(a) * 80).toFixed(1) + '"/>' }
  for (let r = 1; r <= 5; r++) { let d = ""; for (let i = 0; i <= 10; i++) { const a = i * 36 * Math.PI / 180, rr = r * 15 - (i % 2 ? 2 : 0); d += (i ? "L" : "M") + (50 + Math.sin(a) * rr).toFixed(1) + " " + (50 - Math.cos(a) * rr).toFixed(1) } s += '<path pathLength="1" d="' + d + '"/>' }
  return s + "</g></svg>";
};
WT_X.web = (X, sp) => {
  const { A, E, t, sc, q, mineV, N, gm, say, cast, eff, setMode } = X;
  setMode("hover", sp.col); say(sp.say, 1300); eff("web");
  A.at(250, () => cast());
  const g0 = gm(), sw = A.add(mk(sc, "wt-spw", "left:" + (g0.cx - 24) + "px;top:0px", '<i class="thr"></i>' + WT_SPIDER));
  sw.animate([{ transform: "translateY(-120px)" }, { transform: "translateY(" + Math.max(10, g0.top - 62) + "px)", offset: .45 }, { transform: "translateY(" + Math.max(10, g0.top - 56) + "px)", offset: .5 }, { transform: "translateY(" + Math.max(10, g0.top - 62) + "px)", offset: .6 }, { transform: "translateY(" + Math.max(10, g0.top - 62) + "px)", offset: .85 }, { transform: "translateY(-160px)" }], { duration: sp.hit + sp.ms + 800, easing: "ease-in-out", fill: "forwards" });
  A.at(sp.hit - 60, () => {
    const g = gm(), pad = 8, dur = sp.ms + 500;
    if (!q) lgFlash(sc, "rgba(235,240,255,.4)", .3);
    if (mineV && !q) shake(6, 4, 360, sc);
    ringAt(t.el, g.ex, g.ey + g.h * .5, "wtw2", 3.6, 600);
    const web = A.add(mk(sc, "wt-web", "left:" + (g.cx - g.w / 2 - pad) + "px;top:" + (g.top - pad) + "px;width:" + (g.w + pad * 2) + "px;height:" + (g.h + pad * 2) + "px", wtxWeb()));
    web.querySelectorAll("path").forEach((p, i) => { p.style.strokeDasharray = "1"; p.style.strokeDashoffset = "1"; p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 420, delay: i * 28, fill: "forwards", easing: "ease-out" }) });
    web.animate([{ opacity: 1 }, { opacity: 1, offset: sp.ms / dur }, { opacity: 0 }], { duration: dur, fill: "forwards" });
    /* benang tarik dari sisi menara ke tanah */
    [-1, 1].forEach(s => {
      const ln = A.add(mk(sc, "wt-thr2", "left:" + (g.cx + s * (g.w / 2 + pad)) + "px;top:" + (g.top + g.h * .3) + "px;width:2px;height:" + Math.hypot(Math.abs(s) * 46, g.gy - g.top - g.h * .3) + "px;transform-origin:50% 0;transform:rotate(" + (s * 24) + "deg)"));
      ln.animate([{ opacity: 0, scale: "1 0" }, { opacity: .9, scale: "1 1", offset: .15 }, { opacity: .9, offset: sp.ms / dur }, { opacity: 0 }], { duration: dur, fill: "forwards" });
    });
    try { t.stack.animate([{ transform: "none" }, { transform: "rotate(-1.6deg)" }, { transform: "rotate(1.6deg)" }, { transform: "none" }], { duration: 300, iterations: Math.ceil(sp.ms / 300) }) } catch (x) {}
    for (let i = 0; i < N(20); i++) { const a = rnd(0, 6.283), s = rnd(40, 160); E.p({ t: "spark", x: g.cx, y: g.top + g.h * .5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2, m: rnd(.4, .9), s0: 1.6, s1: .4, c0: [255, 255, 255], c1: [200, 210, 240] }) }
  });
};

/* ============================ 7. PASIR: badai pasir, layar buram ============================ */
WT_X.sand = (X, sp) => {
  const { A, E, t, sc, q, mineV, lo, W, H, N, gm, say, cast, eff, setMode, sgn } = X;
  setMode("wave", sp.col); say(sp.say, 1300); eff("sand");
  A.at(300, () => cast());
  const dir = -sgn, dur = sp.hit + sp.sn;
  A.at(sp.hit - 700, () => {
    const hz = A.add(mk(sc, "wt-sand", ""));
    hz.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: dur - sp.hit + 700, fill: "forwards" });
    const x0 = dir > 0 ? -30 : W + 30;
    E.emit(dur - sp.hit + 500, (dt, el) => {
      const ramp = Math.min(1, el / 500) * Math.min(1, (dur - sp.hit + 500 - el) / 600), gg = gm();
      for (let i = 0; i < Math.round(N(5) * ramp); i++) E.p({ t: "smoke", x: x0, y: rnd(H * .12, gg.gy), vx: dir * rnd(420, 760), vy: rnd(-30, 30), m: rnd(.8, 1.3), s0: rnd(20, 40), s1: rnd(50, 90), c0: [220, 182, 116], c1: [176, 136, 84], a0: .42 * ramp, a1: 0 });
      for (let i = 0; i < Math.round(N(10) * ramp); i++) E.p({ t: "drop", x: x0, y: rnd(H * .1, gg.gy + 4), vx: dir * rnd(700, 1200), vy: rnd(-40, 40), m: rnd(.5, .9), s0: rnd(1, 2.4), s1: 1, c0: [238, 208, 150], c1: [200, 160, 100], a0: .8 });
    });
  });
  A.at(sp.hit, () => {
    const g = gm();
    if (!q) lgFlash(sc, "rgba(220,180,110,.5)", .4);
    if (mineV && !q) shake(14, 6, 1500, sc);
    try { t.stack.animate([{ filter: "none" }, { filter: "sepia(.85) brightness(.9) saturate(1.6)", offset: .15 }, { filter: "sepia(.85) brightness(.9) saturate(1.6)", offset: .8 }, { filter: "none" }], { duration: sp.sn }) } catch (x) {}
    E.emit(sp.sn - 600, () => { const g2 = gm(); for (let i = 0; i < N(4); i++) E.p({ t: "drop", x: g2.cx - dir * g2.w * .6, y: g2.top + rnd(0, g2.h), vx: dir * rnd(160, 380), vy: rnd(-30, 30), m: rnd(.3, .6), s0: rnd(1.2, 2.4), s1: 1, c0: [240, 210, 150], a0: .9 }) });
  });
};

/* ============================ 10. KANTUK: kelopak mata menutup ============================ */
WT_X.sleep = (X, sp) => {
  const { A, E, t, sc, q, N, gm, say, cast, eff, setMode, vig } = X;
  setMode("hover", sp.col); say(sp.say, 1500); eff("sleep");
  A.at(250, () => { cast(); vig("ivg") });
  A.at(350, () => wtxProj(X, 520, (x, y) => {
    E.p({ x, y, m: .5, s0: rnd(8, 14), s1: 2, c0: [190, 205, 255], c1: [110, 130, 235], a0: .7 });
    if (Math.random() < .6) E.p({ t: "spark", x, y, vx: rnd(-50, 50), vy: rnd(-50, 50), m: .6, s0: 1.8, s1: .4, c0: [255, 255, 255], c1: [150, 175, 255] });
  }, .15));
  A.at(sp.hit - 40, () => {
    const g = gm(), dur = sp.slp + 400;
    ringAt(t.el, g.ex, g.ey + g.h * .3, "wtb", 3.6, 620);
    for (let i = 0; i < N(28); i++) E.p({ x: g.cx + rnd(-g.w * .5, g.w * .5), y: g.top + rnd(-10, g.h * .4), vx: rnd(-30, 30), vy: -rnd(10, 60), m: rnd(1, 1.8), s0: rnd(6, 14), s1: 1, c0: [200, 215, 255], c1: [120, 140, 240], a0: .75 });
    const dk = A.add(mk(sc, "wt-dark")); dk.style.opacity = 0; dk.animate([{ opacity: 0 }, { opacity: .8, offset: .2 }, { opacity: .8, offset: .8 }, { opacity: 0 }], { duration: dur, fill: "forwards" });
    try { t.stack.animate([{ transform: "none" }, { transform: "rotate(-3.5deg) translateX(-3px)", offset: .25 }, { transform: "rotate(2.5deg) translateX(2px)", offset: .5 }, { transform: "rotate(-3deg)", offset: .75 }, { transform: "none" }], { duration: dur, easing: "ease-in-out" }) } catch (x) {}
    /* huruf Z melayang naik dari menara */
    for (let i = 0; i < 6; i++) A.at(i * (sp.slp / 7), () => {
      const g2 = gm(), z = A.add(mk(sc, "wt-z", "left:" + (g2.cx + rnd(-g2.w * .2, g2.w * .4)) + "px;top:" + (g2.top - 6) + "px;font-size:" + rnd(16, 30).toFixed(0) + "px", "Z"));
      z.animate([{ opacity: 0, transform: "translate(0,0) rotate(-10deg) scale(.5)" }, { opacity: 1, transform: "translate(" + rnd(6, 26).toFixed(0) + "px,-30px) rotate(8deg) scale(1)", offset: .3 }, { opacity: 0, transform: "translate(" + rnd(16, 44).toFixed(0) + "px,-90px) rotate(-6deg) scale(1.2)" }], { duration: 1500, fill: "forwards" });
    });
  });
};

/* ============================ EFEK KE KORBAN ============================ */
function wtVictimX(sp) {
  const P = $("pnl"), tx = ST.txr;
  switch (sp.id) {
    case "ice": wtLockMe(sp.ms, "freeze", "🧊", "BEKU ES"); if (tx) popup("🧊 MENARA MEMBEKU!"); break;
    case "web": wtLockMe(sp.ms, "octo", "🕸️", "JARING LABA-LABA"); if (tx) popup("🕸️ TERJERAT JARING!"); break;
    case "shadow": wtxCls(P, "wtx-dk", sp.dk); if (tx) popup("🌑 LAYAR GELAP!"); break;
    case "curse": {
      for (let j = 0; j < sp.rev; j++) { const w = list[idx + j]; if (w) list[idx + j] = [...w].reverse().join("") }
      combo = 0; ck = 0;
      const ty = $("typ"); ty.value = ""; prevLen = 0; ty.classList.remove("bad");
      stat(); drawWord();
      wtxCls(P, "wtx-crs", 900);
      if (tx) popup("🔮 " + sp.rev + " KATA TERBALIK! COMBO HILANG");
      break;
    }
    case "sand": wtxCls(P, "wtx-sand", sp.sn); if (tx) popup("🏜️ MATA PERIH, LAYAR BURAM!"); break;
    case "sleep": {
      const L = wtxEl(mk($("s-game"), "wtx-lids", "", '<i class="lt"></i><i class="lb"></i>')), o = { easing: "ease-in-out", duration: sp.slp, fill: "forwards" };
      const kf = [{ height: "0%" }, { height: "52%", offset: .16 }, { height: "52%", offset: .22 }, { height: "7%", offset: .38 }, { height: "52%", offset: .5 }, { height: "52%", offset: .58 }, { height: "0%", offset: .74 }, { height: "46%", offset: .86 }, { height: "0%" }];
      L.querySelector(".lt").animate(kf, o); L.querySelector(".lb").animate(kf, o);
      wtxRm(L, sp.slp + 100);
      if (tx) popup("😴 KELOPAK MATA BERAT...");
      break;
    }
  }
}

/* ============================ LANTAI HANCUR PER UNSUR ============================ */
function wtMeltX(o) {
  const { el, c, r, dir, gy, dl, lo, E, bx, by, sc, fin, later } = o;
  if (el === "ice") {
    fin([
      { transform: "none", opacity: 1, filter: "hue-rotate(165deg) saturate(.5) brightness(1.5)" },
      { transform: "translateX(" + dir * 3 + "px)", filter: "hue-rotate(165deg) saturate(.4) brightness(1.9)", opacity: 1, offset: .2 },
      { transform: "translate(" + dir * 14 + "px," + Math.min(gy * .4, 60) + "px) rotate(" + dir * 26 + "deg) scale(.85,.7)", filter: "hue-rotate(170deg) saturate(.5) brightness(1.6)", opacity: .95, offset: .65 },
      { transform: "translate(" + dir * 28 + "px," + Math.min(gy * .7, 110) + "px) rotate(" + dir * 60 + "deg) scale(.4,.2)", opacity: 0 }
    ]);
    if (E && sc) later(dl + 120, () => wtxRock(E, bx + r.w / 2, by + r.h / 2, lo ? 6 : 16, 260, [220, 244, 255], [140, 195, 240], 5));
    return true;
  }
  if (el === "sand") {
    fin([
      { transform: "none", opacity: 1, filter: "sepia(.85) brightness(.95)" },
      { transform: "translateX(" + dir * 8 + "px) scale(1,.96)", filter: "sepia(1) brightness(.9) saturate(1.8)", opacity: 1, offset: .3 },
      { transform: "translate(" + dir * 60 + "px," + Math.min(gy * .3, 50) + "px) scale(.8,.4)", filter: "sepia(1) saturate(2)", opacity: .7, offset: .7 },
      { transform: "translate(" + dir * 130 + "px," + Math.min(gy * .5, 80) + "px) scale(.3,.05)", opacity: 0 }
    ]);
    if (E && sc) later(dl, () => E.emit(900, () => { for (let j = 0; j < (lo ? 1 : 3); j++) E.p({ t: "drop", x: bx + rnd(0, r.w), y: by + rnd(0, r.h), vx: dir * rnd(100, 300), vy: rnd(-20, 40), ay: 200, m: rnd(.4, .8), s0: rnd(1.4, 2.6), s1: 1, c0: [236, 206, 148], a0: .9 }); if (Math.random() < .5) E.p({ t: "smoke", x: bx + rnd(0, r.w), y: by + r.h * .5, vx: dir * rnd(40, 120), vy: -rnd(0, 30), m: 1, s0: 8, s1: 28, c0: [214, 176, 110], a0: .35 }) }));
    return true;
  }
  /* sisanya (gelap, kutukan, jaring, kantuk): lantai retak lalu rontok sesuai warna sihirnya */
  const FX = {
    shadow: ["brightness(.25) saturate(.5) hue-rotate(20deg)", [60, 36, 110]],
    curse: ["hue-rotate(250deg) saturate(2) brightness(.8)", [190, 120, 250]], web: ["brightness(1.5) saturate(.2)", [238, 240, 250]],
    sleep: ["hue-rotate(200deg) saturate(1.4) brightness(.7)", [150, 170, 255]]
  }[el];
  if (FX) {
    const mir = false;
    fin([
      { transform: "none", opacity: 1, filter: FX[0] },
      { transform: "translateX(" + dir * 4 + "px) rotate(" + dir * 2 + "deg)", filter: FX[0], opacity: 1, offset: .2 },
      { transform: "translate(" + dir * (mir ? 26 : 10) + "px," + Math.min(gy * .45, 70) + "px) rotate(" + dir * (mir ? 40 : 18) + "deg) scale(.8,.6)", filter: FX[0], opacity: .85, offset: .65 },
      { transform: "translate(" + dir * (mir ? 50 : 18) + "px," + Math.min(gy * .7, 110) + "px) rotate(" + dir * 70 + "deg) scale(.3,.1)", opacity: 0 }
    ]);
    if (E && sc) later(dl + 100, () => { for (let j = 0; j < (lo ? 4 : 12); j++) E.p({ t: mir ? "rock" : "spark", x: bx + rnd(0, r.w), y: by + rnd(0, r.h), vx: rnd(-140, 140), vy: -rnd(30, 200), ay: 800, vr: rnd(-10, 10), m: rnd(.5, 1), s0: mir ? rnd(2, 5) : 2, s1: mir ? rnd(2, 5) : .5, c0: FX[1], c1: FX[1], a0: 1, a1: .3 }) });
    return true;
  }
  return false;
}

/* dipanggil wtStop(): game selesai / reset / pratinjau ditutup */
function wtXStop() {
  if (WTX.gv) { removeEventListener("input", WTX.gv, true); WTX.gv = null }
  WTX.els.forEach(e => { try { e.remove() } catch (x) {} }); WTX.els.clear();
  const P = document.getElementById("pnl");
  if (P) P.classList.remove("wtx-dk", "wtx-sand", "wtx-crs");
  document.querySelectorAll(".wtx-lids").forEach(x => x.remove());
}