/* zeus-fx.js: efek realistis untuk Zeus: awan badai prosedural (noise fBm berlapis, bayangan dari atas, kilat di dalam awan),
   langit badai yang menggantikan latar, petir bercabang dengan "stepped leader" + return stroke + restrike, cahaya ledakan, bara, asap.
   Dimuat sebelum zeus.js. Memakai: mk, rnd, SVGN (script.js), ST (kualitas), ZS (zeus.js, opsional). */

/* ---------- noise ---------- */
const ZN = (() => {
  const P = new Uint8Array(512), perm = [...Array(256).keys()]; let s = 1337; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0;[perm[i], perm[j]] = [perm[j], perm[i]] }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const f = t => t * t * t * (t * (t * 6 - 15) + 10), l = (a, b, t) => a + (b - a) * t, h = (x, y) => P[P[x & 255] + (y & 255)] / 255;
  const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = f(x - xi), v = f(y - yi); return l(l(h(xi, yi), h(xi + 1, yi), u), l(h(xi, yi + 1), h(xi + 1, yi + 1), u), v) };
  return { fbm(x, y, o) { let a = .5, s = 0, m = 0; for (let i = 0; i < o; i++) { s += n(x, y) * a; m += a; a *= .5; x = x * 2.03 + 17.1; y = y * 2.03 + 9.7 } return s / m } };
})();
const zsSm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) };

/* tekstur awan: dua kanvas dari satu peta kepadatan (gelap berbayang + versi terang untuk kilat) */
function zsCloudTex(w, h, o) {
  o = o || {}; const oct = o.oct || 5, sc = o.sc || 3.4, thr = o.thr == null ? .4 : o.thr, ox = Math.random() * 90, oy = Math.random() * 90, gain = o.gain || 2.6;
  const mkc = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); return { c, g, im: g.createImageData(w, h) } };
  const A = mkc(), B = mkc(), cs = [10, 13, 30], cm = [66, 78, 112], ch = [158, 172, 206];
  for (let y = 0; y < h; y++) {
    const vy = y / h, bot = 1 - zsSm(o.fade == null ? .5 : o.fade, 1, vy), top = o.solidTop ? 1 : zsSm(0, .12, vy) * .5 + .5;
    for (let x = 0; x < w; x++) {
      let nx = x / w * sc + ox, ny = vy * sc * (h / w) * 1.25 + oy; const wp = ZN.fbm(nx * .45 + 5, ny * .45, 3) - .5, wq = ZN.fbm(nx * .45, ny * .45 + 9, 3) - .5; nx += wp * 1.1; ny += wq * 1.1; const v = ZN.fbm(nx, ny, oct) + (1 - vy / .85) * (o.bias == null ? .32 : o.bias);
      let d = Math.max(0, Math.min(1, (v - thr) / (1 - thr) * gain)); d *= Math.min(1, Math.min(x, w - 1 - x) / (w * .1)) * bot * top;
      const i = (y * w + x) * 4; if (d < .01) continue;
      const vu = ZN.fbm(nx, ny - .12, oct) + (1 - (vy - .02) / .85) * (o.bias == null ? .32 : o.bias); let sh = Math.max(0, Math.min(1, .45 + (v - vu) * 9)); sh *= 1 - .4 * d * d; sh = sh * .9 + .1 * (1 - vy);
      const t = sh < .5 ? sh * 2 : (sh - .5) * 2, a = sh < .5 ? cs : cm, b = sh < .5 ? cm : ch, al = Math.pow(d, .85) * (o.alpha || .96) * 255;
      A.im.data[i] = a[0] + (b[0] - a[0]) * t; A.im.data[i + 1] = a[1] + (b[1] - a[1]) * t; A.im.data[i + 2] = a[2] + (b[2] - a[2]) * t; A.im.data[i + 3] = al;
      B.im.data[i] = 205; B.im.data[i + 1] = 226; B.im.data[i + 2] = 255; B.im.data[i + 3] = Math.min(255, al * (.5 + .8 * (1 - sh)));
    }
  }
  A.g.putImageData(A.im, 0, 0); B.g.putImageData(B.im, 0, 0); return { dark: A.c, lit: B.c };
}
/* bank awan: dua kanvas bertumpuk, melayang pelan; flash() menyalakan bagian dalam awan di sekitar titik x (0..1) */
function zsBank(parent, css, o) {
  o = o || {}; const lo = !!(typeof ST !== "undefined" && ST.lite), T = zsCloudTex(lo ? 220 : 340, lo ? 90 : 140, { ...o, oct: lo ? 4 : 5 });
  const el = mk(parent, "zs-bank", css), a = el.appendChild(T.dark), b = el.appendChild(T.lit); a.className = "zs-cv"; b.className = "zs-cv lit";
  const dur = rnd(26000, 42000), dir = Math.random() < .5 ? -1 : 1;
  const an = a.animate([{ transform: `translateX(${-3 * dir}%) scale(1.02)` }, { transform: `translateX(${3 * dir}%) scale(1.07)` }], { duration: dur, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
  const bn = b.animate([{ transform: `translateX(${-3 * dir}%) scale(1.02)` }, { transform: `translateX(${3 * dir}%) scale(1.07)` }], { duration: dur, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
  return {
    el, flash(x, k) {
      const m = `radial-gradient(ellipse 38% 90% at ${(x * 100).toFixed(0)}% 62%,#000 0,rgba(0,0,0,.5) 45%,transparent 100%)`; b.style.webkitMaskImage = b.style.maskImage = m;
      b.animate([{ opacity: 0 }, { opacity: k, offset: .12 }, { opacity: k * .25, offset: .3 }, { opacity: k * .85, offset: .45 }, { opacity: k * .3, offset: .7 }, { opacity: 0 }], { duration: 560 });
    }, stop() { an.cancel(); bn.cancel() }
  };
}
/* langit badai: menggantikan latar scene (berada di belakang bukit/menara), memudar masuk pelan */
function zsSkyOn(Z) {
  const sc = $("scene"), lo = !!ST.lite, sky = document.createElement("div"); sky.className = "zs-sky"; sc.insertBefore(sky, sc.firstChild);
  mk(sky, "zs-sg"); const far = zsBank(sky, "top:-2%;left:-10%;width:120%;height:46%;opacity:.8", { thr: .5, sc: 2.6, alpha: .85, fade: .6 }),
    mid = zsBank(sky, "top:6%;left:-12%;width:124%;height:40%;opacity:.95", { thr: .46, sc: 3.4, fade: .55 }); mk(sky, "zs-hz"); const fl = mk(sky, "zs-sf");
  sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1700, easing: "ease-in-out", fill: "forwards" }); sc.classList.add("zeus");
  Z.sky = {
    el: sky, far, mid, flash(x, k) { fl.style.background = `radial-gradient(ellipse 70% 60% at ${(x * 100).toFixed(0)}% 12%,rgba(190,214,255,${k}),rgba(120,140,255,${k * .35}) 45%,transparent 75%)`; fl.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: .3, offset: .3 }, { opacity: .8, offset: .45 }, { opacity: 0 }], { duration: 520 }); far.flash(x, .8); mid.flash(x, .9) },
    off(ms) { sc.classList.remove("zeus"); sky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: "forwards", easing: "ease-in-out" }).onfinish = () => { far.stop(); mid.stop(); sky.remove() } }
  };
}

/* ---------- petir ---------- */
function zsPts(x0, y0, x1, y1, j, depth) {
  let p = [[x0, y0], [x1, y1]];
  for (let d = 0; d < depth; d++) {
    const q = [p[0]];
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1], b = p[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, o = (Math.random() - .5) * l * j;
      q.push([(a[0] + b[0]) / 2 - (b[1] - a[1]) / l * o, (a[1] + b[1]) / 2 + (b[0] - a[0]) / l * o], b);
    }
    p = q;
  }
  return p;
}
const zsD = p => "M" + p.map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L");
/* kumpulan potongan: {p: titik, w: faktor lebar, u: kapan leader mencapai (0..1), a: alpha} */
function zsBoltSet(x0, y0, x1, y1, ty, lo) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, dep = lo ? 5 : 7, set = [], ang = Math.atan2(y1 - y0, x1 - x0);
  const branch = (p, n, wf, depth) => {
    for (let k = 0; k < n; k++) {
      const i = Math.floor(rnd(.15, .85) * p.length), q = p[i], u = i / p.length, a = ang + (Math.random() < .5 ? -1 : 1) * rnd(.4, 1) , len = L * rnd(.1, .28) * (depth ? .55 : 1),
        bp = zsPts(q[0], q[1], q[0] + Math.cos(a) * len, q[1] + Math.abs(Math.sin(a)) * len * (ang > 0 ? 1 : .2) + (ty === 4 ? -len * .3 : 0), .55, lo ? 3 : 4);
      set.push({ p: bp, w: wf, s: u, d: .5, a: .8 }); if (depth < 1 && !lo && Math.random() < .5) branch(bp, 1, wf * .6, depth + 1);
    }
  };
  const main = (a, b, c, d, j, wf, nb) => { const p = zsPts(a, b, c, d, j, dep), n = p.length, ch = [0, .34, .68, 1]; for (let i = 0; i < 3; i++) set.push({ p: p.slice(Math.floor(n * ch[i]) - (i ? 1 : 0), Math.floor(n * ch[i + 1]) + (i < 2 ? 1 : 0)), w: wf * (1 - i * .18), s: ch[i], d: .36, a: 1 }); if (nb) branch(p, nb, wf * .4, 0); return p };
  if (ty === 1) { const p = main(x0, y0, x1, y1, .42, 1, 2), q = p[Math.floor(p.length * .55)]; for (const s of [-1, 1]) { const bp = zsPts(q[0], q[1], x1 + s * L * .22, y1, .45, 6); set.push({ p: bp, w: .65, s: .55, d: .5, a: .95 }); if (!lo) branch(bp, 2, .3, 1) } }
  else if (ty === 2) { main(x0 - 18, y0, x1 - 5, y1, .38, .85, 2); main(x0 + 18, y0, x1 + 5, y1, .38, .85, 2) }
  else if (ty === 3) { const p = [[x0, y0]]; for (let i = 1; i < 7; i++) { const u = i / 7; p.push([x0 + (x1 - x0) * u + (i % 2 ? 1 : -1) * rnd(24, 60), y0 + (y1 - y0) * u + rnd(-8, 8)]) } p.push([x1, y1]); set.push({ p, w: 1.3, s: 0, d: 1, a: 1 }); branch(p, lo ? 1 : 3, .35, 1) }
  else if (ty === 4) { main(x1 + (Math.random() < .5 ? -1 : 1) * rnd(170, 280), y0 + 20, x1, y1, .4, 1, lo ? 2 : 4) }
  else if (ty === 5) { for (let i = -1; i <= 1; i++) main(x0 + i * 24, y0, x1 + i * 3, y1, .3, .6, i ? 0 : 1) }
  else if (ty === 6) { main(x0, y0, x1, y1, .45, 1, 3); for (let i = 0; i < 6; i++) { const a = Math.PI * (i / 5), r = rnd(30, 80); set.push({ p: zsPts(x1, y1, x1 + Math.cos(a + Math.PI) * r, y1 + Math.sin(a + Math.PI) * r * .55, .5, 3), w: .45, s: 1, d: .3, a: .9 }) } }
  else main(x0, y0, x1, y1, .46, 1, lo ? 2 : 4);
  return set;
}
function zsBolt(L, x0, y0, x1, y1, o) {
  o = o || {}; const W = L.clientWidth || 400, H = L.clientHeight || 600, w = o.w || 6, set = zsBoltSet(x0, y0, x1, y1, o.ty | 0, o.lo), dur = o.dur || 560;
  const ld = Math.max(70, Math.min(190, Math.hypot(x1 - x0, y1 - y0) / 6)), svg = document.createElementNS(SVGN, "svg"); svg.setAttribute("class", "zs-bolt"); svg.style.width = W + "px"; svg.style.height = H + "px";
  const ly = [["#5b78ff", 4.2, .34], ["#b4d2ff", 1.8, .9], ["#ffffff", .62, 1]], ps = [];
  set.forEach(s => ly.forEach(([c, k, al]) => {
    const p = document.createElementNS(SVGN, "path"); p.setAttribute("d", zsD(s.p)); p.setAttribute("pathLength", "1"); p.setAttribute("stroke", c); p.setAttribute("stroke-width", Math.max(.8, w * k * s.w).toFixed(2)); p.setAttribute("stroke-opacity", (al * s.a).toFixed(2)); p.style.strokeDasharray = "1 2"; p.style.strokeDashoffset = "1"; svg.appendChild(p); ps.push([p, s])
  }));
  L.appendChild(svg);
  ps.forEach(([p, s]) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: Math.max(30, s.d * ld), delay: s.s * ld, easing: "linear", fill: "both" }));
  const f = t => Math.min(.999, t / dur);
  svg.animate([{ opacity: .55 }, { opacity: .6, offset: f(ld) * .95 }, { opacity: 1, offset: f(ld + 20) }, { opacity: .32, offset: f(ld + 90) }, { opacity: 1, offset: f(ld + 135) }, { opacity: .45, offset: f(ld + 230) }, { opacity: .9, offset: f(ld + 275) }, { opacity: .25, offset: f(ld + 380) }, { opacity: 0 }], { duration: dur }).onfinish = () => svg.remove();
  const sk = (typeof ZS !== "undefined" && ZS) || null;
  if (y0 < H * .3 || o.cloud) { const k = Math.min(1, w / 8 + .3); if (sk) { sk.sky && setTimeout(() => sk.sky && sk.sky.flash(x0 / W, k * .7), ld); sk.fg && setTimeout(() => sk.fg && sk.fg.flash(clpx(x0 / W), k), ld) } }
  if (y1 > H * .4 && !o.noGlow) setTimeout(() => zsGlow(L, x1, y1, 90 + w * 14, .55 + w / 30, 420), ld);
}
const clpx = v => Math.max(0, Math.min(1, v));
function zsGlow(L, x, y, r, op, ms) {
  const g = mk(L, "zs-gl", `left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px`);
  g.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: op, transform: "scale(1)", offset: .18 }, { opacity: 0, transform: "scale(1.5)" }], { duration: ms || 500, easing: "ease-out" }).onfinish = () => g.remove();
}
function zsFlash(L, op, ms) { const f = mk(L, "zs-fl"); f.animate([{ opacity: op }, { opacity: op * .3, offset: .25 }, { opacity: op * .6, offset: .38 }, { opacity: 0 }], { duration: ms || 300, easing: "ease-out" }).onfinish = () => f.remove() }
function zsBoom(L, x, y, s, main, lo) {
  zsGlow(L, x, y, 120 * s, 1, 600);
  const c = mk(L, "zs-bm", `left:${x - 45 * s}px;top:${y - 45 * s}px;width:${90 * s}px;height:${90 * s}px`);
  c.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: "scale(1.3)", opacity: .95, offset: .3 }, { transform: "scale(1.9)", opacity: 0 }], { duration: 600, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => c.remove();
  for (let i = 0; i < (main && !lo ? 2 : 1); i++) {
    const r = mk(L, "zs-rg", `left:${x - 20 * s}px;top:${y - 20 * s}px;width:${40 * s}px;height:${40 * s}px`);
    r.animate([{ transform: "scale(.3)", opacity: .95 }, { transform: "scale(3.4)", opacity: 0 }], { duration: 680, delay: i * 130, easing: "ease-out", fill: "backwards" }).onfinish = () => r.remove();
  }
  const n = lo ? 4 : main ? 14 : 8;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 360, d = rnd(40, 140) * s, e = mk(L, "zs-sp", `left:${x}px;top:${y}px`);
    e.animate([{ transform: `rotate(${a}deg) translateY(0) scaleY(.6)`, opacity: 1 }, { transform: `rotate(${a}deg) translateY(${-d}px) scaleY(1.6)`, opacity: 0 }], { duration: rnd(380, 660), easing: "ease-out" }).onfinish = () => e.remove();
  }
  if (lo) return;
  for (let i = 0; i < (main ? 9 : 4); i++) {
    const e = mk(L, "zs-em", `left:${x}px;top:${y}px`), dx = rnd(-90, 90) * s, up = rnd(30, 110) * s;
    e.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${dx * .55}px,${-up}px)`, opacity: 1, offset: .4 }, { transform: `translate(${dx}px,${rnd(10, 60) * s}px)`, opacity: 0 }], { duration: rnd(700, 1200), easing: "cubic-bezier(.3,.6,.5,1)" }).onfinish = () => e.remove();
  }
  for (let i = 0; i < (main ? 4 : 2); i++) {
    const e = mk(L, "zs-sm", `left:${x - 26 * s + rnd(-20, 20) * s}px;top:${y - 20 * s}px;width:${52 * s}px;height:${52 * s}px`);
    e.animate([{ transform: "translateY(0) scale(.4)", opacity: 0 }, { transform: `translateY(${-30 * s}px) scale(1.2)`, opacity: .75, offset: .25 }, { transform: `translateY(${-90 * s}px) scale(2.3)`, opacity: 0 }], { duration: rnd(1200, 1800), delay: 120 + i * 90, easing: "ease-out", fill: "backwards" }).onfinish = () => e.remove();
  }
}
