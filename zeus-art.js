/* zeus-art.js: model SVG Zeus (dewa petir) berlapis: jubah, kaki, toga bermotif Yunani, torso berotot, dua lengan yang bisa diputar
   (bahu dan siku), kepala berjanggut dengan mahkota daun salam, mata bercahaya, dan lapisan petir yang digambar ulang tiap beberapa frame.
   Acuan: gambar Zeus pengguna (toga putih, selendang biru, gelang emas, mata putih-biru bersinar). viewBox 0 0 300 470. */
const ZA = { W: 300, H: 470, SH: [[88, 134], [212, 134]], FL: [[9, 9, 7], [11, 12, 6.6], [12, 13, 6.6], [11, 12, 6.2], [9, 10, 5.6]] };
/* ---------- tangan berjari: 0 = jempol, 1..4 = telunjuk..kelingking; tiap jari 2 ruas (pangkal + ujung) yang bisa menekuk dan merenggang ---------- */
function zaFg(i, sd, c, s) {
  const L = ZA.FL[i], bx = i ? sd * (9.5 - 6.3 * (i - 1)) : sd * 13, by = i ? 27 : 6, rot = i ? -(bx / 10) * 14 * s : -sd * (14 + 38 * s), sP = 1 - .5 * c, sD = 1 - .55 * c, w = 1 + .12 * c;
  return { g: `translate(${bx.toFixed(1)} ${by}) rotate(${rot.toFixed(1)})`, p: `scale(${w.toFixed(3)} ${sP.toFixed(3)})`, d: `translate(0 ${(L[0] * sP).toFixed(2)}) scale(${w.toFixed(3)} ${sD.toFixed(3)})` };
}
function zaHand(sd) {
  const fg = [], rl = [.25, .4, .48, .55, .62];
  for (let i = 0; i < 5; i++) {
    const L = ZA.FL[i], w = L[2], t = zaFg(i, sd, rl[i], 0);
    fg[i] = `<g class="za-fg" data-i="${i}" transform="${t.g}"><g class="fp" transform="${t.p}"><rect x="${-w / 2}" y="-1" width="${w}" height="${L[0] + 1.6}" rx="${w / 2}" fill="url(#zgSkinR)" stroke="#7b3f27" stroke-opacity=".5" stroke-width=".9"/><path d="M${-w / 2 + 1} ${L[0] * .55}H${w / 2 - 1}" stroke="#7b3f27" stroke-opacity=".35" stroke-width=".8"/></g><g class="fd" transform="${t.d}"><rect x="${-(w - .8) / 2}" y="-.6" width="${w - .8}" height="${L[1] + .6}" rx="${(w - .8) / 2}" fill="url(#zgSkinR)" stroke="#7b3f27" stroke-opacity=".5" stroke-width=".9"/><ellipse cx="0" cy="${L[1] - 3.2}" rx="${(w - 2.4) / 2}" ry="2.1" fill="#f6dcc8" opacity=".75"/></g></g>`;
  }
  return fg[1] + fg[2] + fg[3] + fg[4] +
    `<path d="M-15 -8C-18 6 -16 22 -13 29L13 29C16 22 18 6 15 -8Z" fill="url(#zgSkinR)" stroke="#7b3f27" stroke-opacity=".5" stroke-width="1"/><path d="M-9 8C-3 15 5 15 10 7M-7 20C-2 24 4 24 8 19" stroke="#7b3f27" stroke-opacity=".45" stroke-width="1.2" fill="none"/><path d="M-10 -4C-5 -8 5 -8 10 -4" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/><circle cx="${sd * 9.5}" cy="27" r="3.2" fill="url(#zgSkinR)" opacity=".9"/><circle cx="${sd * 3.2}" cy="28" r="3.2" fill="url(#zgSkinR)" opacity=".9"/><circle cx="${-sd * 3.1}" cy="28" r="3.2" fill="url(#zgSkinR)" opacity=".9"/><circle cx="${-sd * 9.4}" cy="27" r="3" fill="url(#zgSkinR)" opacity=".9"/>` + fg[0];
}
/* ---------- jubah yang terus tertiup angin: dibangun ulang tiap frame dari gelombang sinus, makin ke bawah makin liar ---------- */
function zaSpline(p) {
  let d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
  for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c; d += "C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1) }
  return d;
}
function zaCloakPts(t, wind, f) {
  const N = 12, p = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, e = Math.pow(u, .9), xl = 96 - 78 * e, xr = 204 + 80 * e, x = xl + (xr - xl) * f,
      w = Math.sin(t * 2.4 - u * 5.2 + f * 2.1) * 8 * u + Math.sin(t * 4.3 - u * 9 + f * 3) * 2.6 * u * u, y = 112 + u * (300 + Math.sin(t * 3 + f * 5) * 6 * u * u);
    p.push([x + w + wind * Math.pow(u, 1.5) * (.8 + .4 * Math.sin(t * 1.3 + f * 2)), y]);
  }
  return p;
}
function zaCloak(t, wind) {
  const L = zaCloakPts(t, wind, 0), R = zaCloakPts(t, wind, 1), hem = [];
  for (let k = 1; k < 8; k++) { const q = zaCloakPts(t, wind, k / 8)[12]; hem.push([q[0], q[1] + (k % 2 ? 16 : -3) + Math.sin(t * 3.2 + k * 1.3) * 5]) }
  const body = zaSpline(L.concat(hem, R.slice().reverse())) + "Z", folds = [.2, .4, .6, .8].map(f => zaSpline(zaCloakPts(t, wind, f).slice(1))).join(""),
    inner = zaSpline(zaCloakPts(t, wind, .3).slice(1).concat(zaCloakPts(t, wind, .7).slice(1).reverse())) + "Z", hm = zaSpline([L[12]].concat(hem, [R[12]]));
  return { b: body, f: folds, i: inner, h: hm };
}
function zaCloakSet(c, t, w) { const r = zaCloak(t, w); c.b.setAttribute("d", r.b); c.i.setAttribute("d", r.i); c.f.setAttribute("d", r.f); c.h.setAttribute("d", r.h) }
/* sinar halo di belakang kepala dan badan: 18 sinar runcing berselang-seling panjang, diputar pelan lewat CSS */
function zaRays() {
  let s = "";
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2, L = i % 2 ? 150 : 215, w = i % 2 ? .05 : .075, cx = 150, cy = 150,
      p = [[cx + Math.cos(a - w) * 30, cy + Math.sin(a - w) * 30], [cx + Math.cos(a) * L, cy + Math.sin(a) * L], [cx + Math.cos(a + w) * 30, cy + Math.sin(a + w) * 30]];
    s += `<path d="M${p.map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L")}Z" fill="url(#zgRay)" opacity="${i % 2 ? .35 : .55}"/>`;
  }
  return s;
}
function zaLeaves() {
  let s = "";
  for (let i = 0; i < 15; i++) {
    const u = i / 14, x = 112 + u * 76, y = 46 - Math.sin(u * Math.PI) * 16 + (u > .5 ? 0 : 0), a = -50 + u * 100;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8.5" ry="3.1" transform="rotate(${(a + (i % 2 ? 22 : -22)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#zgLeaf)" stroke="#2c4a14" stroke-width=".6"/>`;
  }
  return s;
}
function zaArm(id, sd) {
  return `<g class="za-arm" id="${id}">
  <g class="za-up">
    <path d="M-21 -8C-31 20 -29 52 -18 80L18 80C30 52 33 20 23 -8Z" fill="url(#zgSkinH)"/>
    <path d="M-14 6C-22 28 -18 54 -10 72" stroke="#7b3f27" stroke-opacity=".45" stroke-width="2.4" fill="none"/>
    <path d="M10 8C20 30 18 52 12 72" stroke="#ffe2c6" stroke-opacity=".35" stroke-width="3" fill="none"/>
    <ellipse cx="0" cy="-2" rx="29" ry="26" fill="url(#zgSkinR)"/>
    <path d="M-20 -14C-8 -26 8 -26 20 -14" stroke="#fff" stroke-opacity=".28" stroke-width="3" fill="none"/>
    <path d="M-8 24C-2 34 6 34 10 24" stroke="#7b3f27" stroke-opacity=".4" stroke-width="2" fill="none"/>
    <path d="M-17 8C-12 14 -5 16 2 14M-15 40C-9 46 0 48 8 44" stroke="#7b3f27" stroke-opacity=".35" stroke-width="1.6" fill="none"/>
    <path d="M-24 40C-8 48 10 48 26 40L24 54C8 62 -8 62 -24 54Z" fill="url(#zgGold)" stroke="#6a4208" stroke-width="1.3"/><path d="M-20 47C-6 53 8 53 22 47" stroke="#fff3b0" stroke-opacity=".6" stroke-width="1.4" fill="none"/><path d="M-3 43L3 43L1 49L5 49L-3 58L-1 51L-5 51Z" fill="#fff6c8" opacity=".9"/>
    <g class="za-fo" transform="translate(0 78)">
      <path d="M-17 -4C-23 28 -21 60 -13 84L13 84C21 60 23 28 17 -4Z" fill="url(#zgSkinH)"/>
      <path d="M-12 8C-16 30 -12 54 -8 70" stroke="#7b3f27" stroke-opacity=".4" stroke-width="2" fill="none"/>
      <path d="M-18 36L18 36L15 86L-15 86Z" fill="url(#zgGold)" stroke="#6a4208" stroke-width="1.4"/>
      <path d="M-17 46H17M-16.5 58H16.5M-16 70H16" stroke="#7a4d0b" stroke-width="1.5"/>
      <path d="M-14 40L-6 84M0 38V86M14 40L6 84" stroke="#fff3b0" stroke-opacity=".55" stroke-width="1.6"/>
      <circle cx="-9" cy="41" r="1.8" fill="#fff6c8"/><circle cx="9" cy="41" r="1.8" fill="#fff6c8"/><circle cx="0" cy="80" r="2" fill="#fff6c8"/>
      <g transform="translate(0 100)">
        ${zaHand(sd)}
        <circle class="za-glow" cx="0" cy="14" r="26" fill="url(#zgGlow)" opacity="0"/>
      </g>
    </g>
  </g></g>`;
}
function zaArt() {
  return `<svg class="za-svg" viewBox="0 0 ${ZA.W} ${ZA.H}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
<defs>
 <linearGradient id="zgSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3bb92"/><stop offset=".55" stop-color="#d28d64"/><stop offset="1" stop-color="#9a5a3c"/></linearGradient>
 <linearGradient id="zgSkinH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d5034"/><stop offset=".38" stop-color="#e3a47c"/><stop offset=".7" stop-color="#c98760"/><stop offset="1" stop-color="#8f5237"/></linearGradient>
 <radialGradient id="zgSkinR" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#f6c39b"/><stop offset=".7" stop-color="#cf8b62"/><stop offset="1" stop-color="#975739"/></radialGradient>
 <linearGradient id="zgToga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e6ebf6"/><stop offset="1" stop-color="#a9b4d0"/></linearGradient>
 <linearGradient id="zgBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa9ff"/><stop offset=".5" stop-color="#2f5fc4"/><stop offset="1" stop-color="#162c78"/></linearGradient>
 <linearGradient id="zgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#e9b83c"/><stop offset=".7" stop-color="#a86d12"/><stop offset="1" stop-color="#f4d46a"/></linearGradient>
 <linearGradient id="zgBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#d9dde7"/><stop offset="1" stop-color="#9ba2b3"/></linearGradient>
 <linearGradient id="zgHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f3f7"/><stop offset=".5" stop-color="#a5acbb"/><stop offset="1" stop-color="#5c6374"/></linearGradient>
 <linearGradient id="zgCloak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3f95"/><stop offset=".5" stop-color="#16256b"/><stop offset="1" stop-color="#0a1240"/></linearGradient>
 <linearGradient id="zgLeaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b6d460"/><stop offset="1" stop-color="#4a7a24"/></linearGradient>
 <radialGradient id="zgGlow"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#bfeaff"/><stop offset=".7" stop-color="#4aa8ff" stop-opacity=".5"/><stop offset="1" stop-color="#2a6cff" stop-opacity="0"/></radialGradient>
 <radialGradient id="zgRay" cx="150" cy="150" r="215" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".35" stop-color="#9fd8ff" stop-opacity=".55"/><stop offset="1" stop-color="#3a7cff" stop-opacity="0"/></radialGradient>
 <radialGradient id="zgAura"><stop offset="0" stop-color="#cdeeff" stop-opacity=".75"/><stop offset=".45" stop-color="#5aa8ff" stop-opacity=".4"/><stop offset="1" stop-color="#2a5cff" stop-opacity="0"/></radialGradient>
 <pattern id="zgKey" width="14" height="12" patternUnits="userSpaceOnUse"><rect width="14" height="12" fill="#fafcff"/><path d="M1 10.5H13V1.5H3.5V8H10.5V4" fill="none" stroke="#2f5fc4" stroke-width="1.6"/></pattern>
 <filter id="zfGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="zfSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.2"/></filter>
</defs>
<ellipse class="za-aura" cx="150" cy="210" rx="230" ry="290" fill="url(#zgAura)"/>
<g class="za-halo">${zaRays()}</g>
<g id="zaCloakW"><g class="za-cloak"><path class="zc-b" d="${zaCloak(0, -14).b}" fill="url(#zgCloak)" stroke="#8ab4ff" stroke-opacity=".6" stroke-width="2"/>
 <path class="zc-i" d="${zaCloak(0, -14).i}" fill="#5a7cf0" opacity=".2"/>
 <path class="zc-f" d="${zaCloak(0, -14).f}" stroke="#9ab8ff" stroke-opacity=".38" stroke-width="2" fill="none"/>
 <path class="zc-h" d="${zaCloak(0, -14).h}" stroke="#e8f2ff" stroke-width="3" fill="none" stroke-opacity=".85"/></g></g>
<g id="zaLegsW"><g class="za-legs">
 <g class="za-lgL"><path d="M104 392L100 452C100 462 134 462 136 452L140 392Z" fill="url(#zgSkinH)"/>
  <path d="M100 420L138 432M101 436L137 446" stroke="#7a4a1a" stroke-width="2.6" opacity=".85"/>
  <path d="M96 456C96 466 138 468 140 458L136 452L102 452Z" fill="#7a4a1a"/>
  <path d="M110 400C108 420 112 440 116 450" stroke="#6b3a25" stroke-opacity=".4" stroke-width="2.2" fill="none"/>
  <path d="M104 396C102 408 104 420 110 428M132 398C134 412 132 424 128 432" stroke="#ffe2c6" stroke-opacity=".3" stroke-width="3" fill="none"/>
  <path d="M100 404L138 412M101 428L137 440" stroke="#ffe2c6" stroke-opacity=".35" stroke-width="1.2"/><path d="M104 462V466M112 464V468M120 464V468M128 462V466" stroke="#e9c2a0" stroke-width="3" stroke-linecap="round"/></g>
 <g class="za-lgR"><path d="M160 392L164 452C166 462 200 462 200 452L196 392Z" fill="url(#zgSkinH)"/>
  <path d="M162 432L200 420M163 446L199 436" stroke="#7a4a1a" stroke-width="2.6" opacity=".85"/>
  <path d="M160 458C162 468 204 466 204 456L198 452L164 452Z" fill="#7a4a1a"/>
  <path d="M190 400C192 420 188 440 184 450" stroke="#6b3a25" stroke-opacity=".4" stroke-width="2.2" fill="none"/>
  <path d="M164 398C162 412 164 424 170 432M192 396C194 410 192 422 188 430" stroke="#ffe2c6" stroke-opacity=".3" stroke-width="3" fill="none"/>
  <path d="M162 410L200 402M163 434L199 424" stroke="#ffe2c6" stroke-opacity=".35" stroke-width="1.2"/><path d="M168 462V466M176 464V468M184 464V468M192 462V466" stroke="#e9c2a0" stroke-width="3" stroke-linecap="round"/></g></g></g>
<g id="zaUp"><g class="za-body">
 <path d="M128 98C108 104 84 110 72 128C65 150 74 178 86 202C95 226 103 250 111 272L190 272C198 250 206 226 215 202C227 178 235 150 228 128C216 110 192 104 172 98Z" fill="url(#zgSkin)"/>
 <path d="M96 152C116 182 144 182 150 162M204 152C184 182 156 182 150 162M150 156V252" stroke="#7b3f27" stroke-opacity=".55" stroke-width="2.4" fill="none"/>
 <path d="M104 148C122 160 142 160 150 150M196 148C178 160 158 160 150 150" stroke="#ffe3c8" stroke-opacity=".35" stroke-width="3" fill="none"/>
 <path d="M134 200H166M134 217H166M135 234H165M136 250H164" stroke="#7b3f27" stroke-opacity=".5" stroke-width="2.2"/>
 <path d="M120 200C116 224 118 244 124 262M180 200C184 224 182 244 176 262" stroke="#7b3f27" stroke-opacity=".4" stroke-width="2.2" fill="none"/>
 <path d="M128 100C118 112 104 118 92 118M172 100C182 112 196 118 208 118" stroke="#7b3f27" stroke-opacity=".5" stroke-width="2.2" fill="none"/>
 <ellipse cx="198" cy="168" rx="16" ry="22" fill="#fff" opacity=".1"/>
 <path d="M96 184C112 200 134 202 148 190M204 184C188 200 166 202 152 190" stroke="#7b3f27" stroke-opacity=".32" stroke-width="3" fill="none" filter="url(#zfSoft)"/>
 <path d="M110 138C102 156 100 176 108 194M190 138C198 156 200 176 192 194" stroke="#ffe3c8" stroke-opacity=".28" stroke-width="3.4" fill="none"/>
 <path d="M96 210C104 226 112 240 120 252M204 210C196 226 188 240 180 252M110 214L124 220M110 228L122 232M190 214L176 220M190 228L178 232" stroke="#7b3f27" stroke-opacity=".38" stroke-width="2" fill="none"/>
 <path d="M140 202C146 206 154 206 160 202M140 219C146 223 154 223 160 219M141 236C146 240 154 240 159 236" stroke="#ffe3c8" stroke-opacity=".3" stroke-width="2" fill="none"/>
 <path d="M130 104C138 112 144 122 150 134C156 122 162 112 170 104" stroke="#7b3f27" stroke-opacity=".4" stroke-width="2" fill="none"/>
 <path d="M72 128C66 140 66 156 72 172M228 128C234 140 234 156 228 172" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none"/>
 <path d="M96 258C84 310 78 356 74 406L226 406C222 356 216 310 204 258Z" fill="url(#zgToga)"/>
 <path d="M100 290C98 330 96 370 94 404M122 296C122 336 120 374 120 404M150 300C150 340 150 376 150 404M178 296C180 336 182 374 182 404M200 290C204 330 206 370 208 404" stroke="#8c97b8" stroke-opacity=".5" stroke-width="2.4" fill="none"/>
 <path d="M112 290C134 312 170 312 196 290" stroke="#fff" stroke-opacity=".8" stroke-width="3" fill="none"/>
 <rect x="74" y="392" width="152" height="14" fill="url(#zgKey)" stroke="#2f5fc4" stroke-width="1.2"/>
 <path d="M80 124C96 106 124 102 140 106C150 140 176 192 208 238L216 274L88 274C86 228 80 172 80 124Z" fill="url(#zgToga)"/>
 <path d="M84 140C90 190 94 226 96 268M104 126C108 176 118 220 132 262M124 122C130 168 148 210 170 250" stroke="#8c97b8" stroke-opacity=".5" stroke-width="2.4" fill="none"/>
 <path d="M140 106C150 140 176 192 208 238L216 274" stroke="#2f5fc4" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M140 106C150 140 176 192 208 238L216 274" stroke="#fafcff" stroke-width="4" fill="none" stroke-dasharray="6 4"/>
 <path d="M96 150C100 190 104 226 106 262M112 140C116 180 124 214 136 246" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none"/>
 <circle cx="141" cy="109" r="11" fill="url(#zgGold)" stroke="#6a4208" stroke-width="1.4"/><circle cx="141" cy="109" r="7" fill="none" stroke="#fff3b0" stroke-opacity=".7" stroke-width="1"/><path d="M144 102L138 110L142 110L139 117L146 107L142 107Z" fill="#fff" opacity=".95"/>
 <path d="M92 252C130 270 172 270 210 252L214 274C172 292 130 292 88 274Z" fill="url(#zgBlue)" stroke="#12276a" stroke-width="1.4"/>
 <path d="M96 258C132 274 170 274 206 258" stroke="#bcd6ff" stroke-opacity=".65" stroke-width="2" fill="none"/>
 <path d="M120 276C108 312 98 346 96 388C104 392 114 388 118 380C122 346 128 316 136 282Z" fill="url(#zgBlue)" stroke="#12276a" stroke-width="1.2"/>
 <path d="M148 280C152 314 160 346 166 384C174 388 182 384 184 378C176 344 170 312 166 280Z" fill="url(#zgBlue)" stroke="#12276a" stroke-width="1.2"/>
 <ellipse cx="152" cy="276" rx="14" ry="10" fill="url(#zgBlue)" stroke="#12276a" stroke-width="1.4"/>
 <circle cx="152" cy="276" r="8.5" fill="url(#zgGold)" stroke="#6a4208" stroke-width="1.2"/><path d="M155 270L149 277L153 277L150 283L157 275L153 275Z" fill="#fff" opacity=".95"/>
 <path d="M96 262C130 280 172 280 206 262" stroke="#f6d36a" stroke-width="2" fill="none" stroke-opacity=".9"/></g>
${zaArm("zaA", 1)}${zaArm("zaB", -1)}
<g id="zaHeadW"><g class="za-head">
 <path d="M104 62C98 22 126 4 150 4C176 4 204 22 198 62C208 86 202 108 190 122C186 98 180 82 176 72L124 72C120 84 114 100 110 122C98 108 94 84 104 62Z" fill="url(#zgHair)"/>
 <path d="M106 80C94 100 92 130 100 156C108 148 112 132 112 114Z" fill="url(#zgHair)" stroke="#6a7283" stroke-opacity=".5" stroke-width="1"/><path d="M194 80C206 100 208 130 200 156C192 148 188 132 188 114Z" fill="url(#zgHair)" stroke="#6a7283" stroke-opacity=".5" stroke-width="1"/>
 <path d="M101 104C98 122 99 138 101 150M199 104C202 122 201 138 199 150" stroke="#5c6374" stroke-opacity=".6" stroke-width="1.2" fill="none"/>
 <path d="M110 70C104 90 104 108 108 124M192 70C198 90 198 108 192 124M118 60C112 80 112 96 114 112M184 60C190 80 190 96 188 112" stroke="#6a7283" stroke-opacity=".6" stroke-width="1.6" fill="none"/>
 <path d="M130 90H172L176 120H124Z" fill="url(#zgSkinH)"/>
 <path d="M116 54C116 32 132 22 150 22C168 22 184 32 184 54C186 74 176 92 166 100C158 108 142 108 134 100C124 92 114 74 116 54Z" fill="url(#zgSkin)"/>
 <path d="M118 66C122 88 134 100 150 102" stroke="#7b3f27" stroke-opacity=".28" stroke-width="5" fill="none" filter="url(#zfSoft)"/>
 <path d="M182 66C178 88 166 100 150 102" stroke="#7b3f27" stroke-opacity=".28" stroke-width="5" fill="none" filter="url(#zfSoft)"/>
 <path d="M112 58C106 26 134 12 150 12C170 12 194 26 188 58C182 42 172 34 150 33C128 34 118 42 112 58Z" fill="url(#zgHair)"/>
 <path d="M128 36C140 30 160 30 172 36M120 46C136 36 164 36 180 46" stroke="#6a7283" stroke-opacity=".5" stroke-width="1.4" fill="none"/>
 <g class="za-laurel">${zaLeaves()}<path d="M112 52C128 34 172 34 188 52" stroke="#3a5c1a" stroke-width="1.6" fill="none"/></g>
 <g class="za-brL"><path d="M120 54Q134 46 147 54" stroke="#f2f3f8" stroke-width="5.4" stroke-linecap="round" fill="none"/></g><g class="za-brR"><path d="M153 54Q166 46 180 54" stroke="#f2f3f8" stroke-width="5.4" stroke-linecap="round" fill="none"/></g>
 <path d="M122 60Q134 63 146 60M154 60Q166 63 178 60" stroke="#7b3f27" stroke-opacity=".4" stroke-width="2" fill="none"/>
 <g class="za-eyes"><ellipse cx="134" cy="59" rx="16" ry="8" fill="#7fd0ff" opacity=".45" filter="url(#zfGlow)"/><ellipse cx="166" cy="59" rx="16" ry="8" fill="#7fd0ff" opacity=".45" filter="url(#zfGlow)"/>
  <path d="M124 60Q134 54 145 60Q134 65 124 60ZM155 60Q166 54 176 60Q166 65 155 60Z" fill="#fff" filter="url(#zfGlow)"/></g>
 <path d="M122 76C124 88 128 94 134 98M178 76C176 88 172 94 166 98" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>
 <path d="M130 30C140 26 160 26 170 30M134 36C144 33 156 33 166 36" stroke="#7b3f27" stroke-opacity=".22" stroke-width="1.4" fill="none"/>
 <path d="M152 62L154 78" stroke="#ffe3c8" stroke-opacity=".5" stroke-width="2" fill="none"/>
 <path d="M150 60L146 80Q150 84 154 80Z" fill="#b66f4c" opacity=".7"/><path d="M144 80Q150 84 156 80" stroke="#7b3f27" stroke-width="1.6" fill="none" opacity=".7"/>
 <g class="za-beard"><path d="M118 80C110 98 110 120 120 142C128 162 142 178 150 186C158 178 172 162 180 142C190 120 190 98 182 80C176 94 166 100 150 100C134 100 124 94 118 80Z" fill="url(#zgBeard)" stroke="#9aa1b2" stroke-width="1.2"/>
 <path d="M126 96C122 118 128 144 140 168M138 102C136 126 142 156 150 178M162 102C164 126 158 156 150 178M174 96C178 118 172 144 160 168M130 120C128 136 134 152 144 170" stroke="#9aa2b4" stroke-opacity=".75" stroke-width="1.4" fill="none"/></g>
 <path d="M150 88C140 80 126 84 121 94C132 94 142 91 150 92C158 91 168 94 179 94C174 84 160 80 150 88Z" fill="#fff" stroke="#aeb4c2" stroke-width="1"/>
 <path d="M128 90C136 92 144 92 150 92M172 90C164 92 156 92 150 92M126 94C134 96 142 95 148 94M174 94C166 96 158 95 152 94" stroke="#aeb4c2" stroke-opacity=".8" stroke-width="1" fill="none"/>
 <path d="M142 99Q150 101 158 99" stroke="#6b3a2a" stroke-width="1.8" fill="none" opacity=".8"/>
 <g class="za-mouth" transform="translate(150 101) scale(1 .001)"><path d="M-10 0Q0 -2 10 0Q8 9 0 10Q-8 9 -10 0Z" fill="#3a1410" stroke="#6b3a2a" stroke-width="1.2"/><path d="M-6 6Q0 10 6 6Q0 4 -6 6Z" fill="#a8504a"/></g></g></g></g>
<g class="za-fx"></g>
</svg>`;
}
/* petir di sekitar tubuh: dipanggil berkala, menggambar ulang busur acak */
function zaBolt(x0, y0, x1, y1, seg, jit) {
  let d = "M" + x0.toFixed(1) + " " + y0.toFixed(1);
  for (let i = 1; i < seg; i++) { const u = i / seg; d += "L" + (x0 + (x1 - x0) * u + (Math.random() - .5) * jit).toFixed(1) + " " + (y0 + (y1 - y0) * u + (Math.random() - .5) * jit).toFixed(1) }
  return d + "L" + x1.toFixed(1) + " " + y1.toFixed(1);
}
/* petir aura: tiga lapis garis (tanpa filter blur supaya ringan) agar terang dan jelas: halo biru lebar, lapis tengah, inti putih.
   Ada busur radial dari badan, mahkota petir dari kepala, dan busur menjalar di tanah dari kaki. */
function zaLay(d, w, o) { return `<path d="${d}" stroke="#3a7cff" stroke-width="${(w * 3.4).toFixed(1)}" fill="none" opacity="${(.2 * o).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#9fd8ff" stroke-width="${(w * 1.7).toFixed(1)}" fill="none" opacity="${(.6 * o).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#fff" stroke-width="${w.toFixed(1)}" fill="none" opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>` }
function zaArcs(g, n, eyes) {
  let h = "";
  const R = Math.random;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, r0 = 85 + R() * 45, r1 = r0 + 90 + R() * 120, cx = 150, cy = 215,
      x0 = cx + Math.cos(a) * r0 * 1.1, y0 = cy + Math.sin(a) * r0 * 1.45, x1 = cx + Math.cos(a) * r1 * 1.2, y1 = cy + Math.sin(a) * r1 * 1.65, d = zaBolt(x0, y0, x1, y1, 8, 40), th = 1.6 + R() * 1.6;
    h += zaLay(d, th, 1);
    for (let b = 0; b < 2; b++) if (R() < .6) { const u = .3 + R() * .5, bx = x0 + (x1 - x0) * u, by = y0 + (y1 - y0) * u, ba = a + (R() - .5) * 2.2, bl = 40 + R() * 70, bd = zaBolt(bx, by, bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl, 5, 22); h += zaLay(bd, th * .55, .9); if (R() < .4) { const qx = bx + Math.cos(ba) * bl * .6, qy = by + Math.sin(ba) * bl * .6; h += zaLay(zaBolt(qx, qy, qx + (R() - .5) * 60, qy + (R() - .5) * 60, 3, 12), th * .35, .8) } }
  }
  for (let i = 0; i < 2; i++) { const x = 150 + (i ? 1 : -1) * (14 + R() * 20), d = zaBolt(x, 8, x + (R() - .5) * 90, -60 - R() * 80, 7, 30); h += zaLay(d, 1.6, .95) }
  if (n > 2) for (let i = 0; i < 2; i++) { const s = i ? 1 : -1, x1 = 150 + s * (90 + R() * 110); h += zaLay(zaBolt(150 + s * 30, 464, x1, 462 + (R() - .5) * 8, 8, 18), 1.8, .9) }
  if (eyes) for (const s of [-1, 1]) h += zaLay(zaBolt(150 + s * 18, 58, 150 + s * (70 + R() * 50), 58 + (R() - .5) * 60, 6, 16), 1.7, 1);
  g.innerHTML = h;
}
function zaArcsOld(g, n, eyes) {
  let h = "";
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r0 = 70 + Math.random() * 40, r1 = r0 + 60 + Math.random() * 90, cx = 150, cy = 200,
      x0 = cx + Math.cos(a) * r0 * 1.1, y0 = cy + Math.sin(a) * r0 * 1.5, x1 = cx + Math.cos(a) * r1 * 1.15, y1 = cy + Math.sin(a) * r1 * 1.6, d = zaBolt(x0, y0, x1, y1, 7, 34);
    h += `<path d="${d}" stroke="#9fd8ff" stroke-width="5" fill="none" opacity=".35" filter="url(#zfGlow)"/><path d="${d}" stroke="#fff" stroke-width="1.8" fill="none"/>`;
    if (Math.random() < .4) { const bx = x0 + (x1 - x0) * .5, by = y0 + (y1 - y0) * .5; h += `<path d="${zaBolt(bx, by, bx + (Math.random() - .5) * 90, by + (Math.random() - .5) * 90, 4, 18)}" stroke="#cfeaff" stroke-width="1.2" fill="none"/>` }
  }
  if (eyes) for (const s of [-1, 1]) h += `<path d="${zaBolt(150 + s * 18, 58, 150 + s * (56 + Math.random() * 34), 58 + (Math.random() - .5) * 40, 5, 12)}" stroke="#e8f8ff" stroke-width="1.6" fill="none" filter="url(#zfGlow)"/>`;
  g.innerHTML = h;
}