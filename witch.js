/* witch.js: skill LEGENDARIS "WITCH" (penyihir 5 elemen).
   Alur:
   1. Pemakai memilih skill. Si PENYIHIR terbang masuk, mengangkat tongkat, dan sebuah JAM RAKSASA berputar lalu berhenti: waktu berhenti.
      Semua pemain tidak bisa mengetik sampai pemakai memilih 1 target.
   2. Begitu target dipilih, PEMAKAI langsung jalan lagi. Lawan masih membeku 2 detik (WT_FREEZE).
   3. Penyihir menyerang 1 target dengan 10 sihir berurutan; tiap sihir ditunggu selesai + jeda 2 detik (WT_GAP), total WT_TOT:
      EMPAT LAMA: API (-2) > AIR (-2) > PETIR (-2) > RACUN (-2 + 3 kata menghilang).
      ENAM BARU (animasi + efek korban ada di witch2.js): ES (beku 2 dtk, -1) > GELAP (layar gelap) > KUTUKAN (3 kata terbalik, combo hilang)
      > JARING (terjerat 2 dtk) > PASIR (-3, layar buram) > KANTUK (kelopak mata menutup).
   4. Dilindungi Pelindung / Dragon Guardian = serangan ditangkis.
   Dimuat setelah legend.js dan script.js. Memakai: SK, IMP, K_WT, WT_TK, WT_DMG (script.js), lgPos, lgChip, lgTitle, lgFlash, lgDgBlock (legend.js), lockMe, frz, dz. */
const WT = { on: 0, own: 0, t: 0, cand: [], picked: 0, tok: null, seenAt: 0, ov: null, pz: [], kd: null, auto: 0, rel: 0, gt: 0, tm: new Set(), iv: new Set(), act: new Set(), E: null };
const WT_FREEZE = 2000;
/* daftar sihir: at = kapan mulai dilempar (ms setelah penyihir tiba), hit = kapan kena ke menara (ms setelah mulai) */
const WT_SP = [
  { id: "fire", len: 3000, hit: 1300, dmg: 4, col: "#ff7a1a", say: "Terbakarlah!" },
  { id: "water", len: 3600, hit: 1400, dmg: 3, col: "#3fa9ff", say: "Banjirrr!" },
  { id: "bolt", len: 2800, hit: 1000, dmg: 4, col: "#fff36a", say: "Sambar!" },
  { id: "poison", len: 4500, hit: 1300, dmg: 3, dz: 3, col: "#7dff4a", say: "Hihihi, racun!" },
  /* ---- 6 sihir baru (animasi di witch2.js). ms = kunci ketik, dmg = lantai, sisanya = durasi debuff (ms) ---- */
  { id: "ice", len: 3400, hit: 900, ms: 2000, dmg: 2, col: "#bfeaff", say: "Membekulah!" },
  { id: "shadow", len: 5600, hit: 900, dk: 4000, dmg: 2, col: "#8a5cff", say: "Gelap gulita~" },
  { id: "curse", len: 2800, hit: 900, rev: 3, dmg: 2, col: "#c58aff", say: "Terbalik semua!" },
  { id: "web", len: 3700, hit: 900, ms: 2000, dmg: 3, col: "#eceef6", say: "Terjerat jaring~" },
  { id: "sand", len: 5700, hit: 1000, sn: 4500, dmg: 3, col: "#e6c27a", say: "Badai pasir!" },
  { id: "sleep", len: 4800, hit: 900, slp: 3500, dmg: 2, col: "#7fa0ff", say: "Zzz... tidurlah" }
];
/* JEDA: penyihir menunggu sihir sebelumnya benar-benar beres (len), lalu diam WT_GAP ms, baru melempar sihir berikutnya.
   at dihitung otomatis dari len. WT_TOT = total lama serangan (ms). */
const WT_GAP = 2000;
let WT_TOT = 0;
WT_SP.forEach((sp, i) => { sp.at = WT_TOT; WT_TOT += sp.len + (i < WT_SP.length - 1 ? WT_GAP : 0) });
const SP = {}; WT_SP.forEach(sp => { SP[sp.id] = sp });
const wtHold = () => !!WT.on;
/* MODE TIPIS: sama seperti skill legendaris lain. Korban selalu melihat efek penuh. */
const wtLo = o => !!ST.lite || (!!ST.far && !o.mine && o.vic !== me.id);
const wtQ = o => !!ST.far && !o.mine && o.vic !== me.id;
const wtT = (f, ms) => { const id = setTimeout(() => { WT.tm.delete(id); f() }, ms); WT.tm.add(id); return id };

/* ============================ MODEL PENYIHIR ============================ */
const WT_SVG = '<svg viewBox="0 -24 176 156" aria-hidden="true"><g class="fl">' +
  /* sapu */
  '<path d="M6 100L146 72" stroke="#6b4220" stroke-width="7" stroke-linecap="round"/><path d="M8 98L144 70" stroke="#b7823f" stroke-width="2.4" stroke-linecap="round"/>' +
  '<path d="M24 94L2 82Q-4 98 2 116L24 106Z" fill="#e0b04a"/><path d="M22 96L0 88M22 100L-2 100M22 104L0 112" stroke="#a8741f" stroke-width="2" stroke-linecap="round"/><path d="M26 91L32 108" stroke="#a31f3a" stroke-width="6" stroke-linecap="round"/>' +
  /* kucing */
  '<g class="cat"><path d="M40 86Q22 82 28 62" stroke="#14101f" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="80" rx="11" ry="12" fill="#14101f"/><circle cx="56" cy="63" r="9" fill="#14101f"/><path d="M48 58L49 47L55 54ZM58 54L64 46L65 58Z" fill="#14101f"/><ellipse cx="52.5" cy="63" rx="2.4" ry="3" fill="#ffe14a"/><ellipse cx="60.5" cy="63" rx="2.4" ry="3" fill="#ffe14a"/><path d="M52.5 61.5V64.5M60.5 61.5V64.5" stroke="#14101f" stroke-width="1.2"/><path d="M56 67l-1.5 1.5h3z" fill="#ff8aa8"/></g>' +
  /* jubah belakang */
  '<path class="cp" d="M72 56Q46 54 36 74Q52 72 58 78Q50 86 64 90L74 84Z" fill="#43198c"/>' +
  /* rambut belakang */
  '<g class="hr"><path d="M82 22Q62 30 64 60Q74 56 76 44Z" fill="#ff8a3d"/><path d="M78 40Q52 52 58 78Q72 68 74 54Z" fill="#ff6f2a"/></g>' +
  /* kaki */
  '<path d="M80 86L76 104M92 84L98 102" stroke="#2a1050" stroke-width="7" stroke-linecap="round"/><path d="M68 102Q82 98 84 110L70 112Z" fill="#150822"/><path d="M92 100Q108 98 110 109L95 112Z" fill="#150822"/><path d="M76 94L83 93M95 92L103 91" stroke="#ffd23f" stroke-width="2.2"/>' +
  /* badan */
  '<path d="M72 54Q66 72 68 88L106 84Q104 66 100 52Q86 44 72 54Z" fill="#5b2aa8"/><path d="M78 56Q76 70 78 84" stroke="#7d4cc8" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M69 72L104 67" stroke="#f2c14e" stroke-width="3.6"/><rect x="82" y="66" width="8" height="8" rx="1.5" fill="#ffd23f" transform="rotate(-9 86 70)"/>' +
  /* lengan belakang */
  '<path d="M84 58L96 76" stroke="#43198c" stroke-width="7" stroke-linecap="round"/><circle cx="98" cy="79" r="4.5" fill="#cdf0b4"/>' +
  /* lengan tongkat */
  '<g class="arm"><path d="M94 58L120 54" stroke="#5b2aa8" stroke-width="9" stroke-linecap="round"/><path d="M116 54L122 53" stroke="#ffd23f" stroke-width="4"/><circle cx="125" cy="53" r="5.4" fill="#cdf0b4"/>' +
  '<path d="M123 54L152 30" stroke="#3a2210" stroke-width="3.4" stroke-linecap="round"/><path d="M130 48L134 44" stroke="#8a5a2b" stroke-width="3.4"/>' +
  '<circle class="wgl" cx="154" cy="28" r="15" style="fill:var(--wc,#9dff5a)" opacity=".28"/><circle cx="154" cy="28" r="9" style="fill:var(--wc,#9dff5a)" opacity=".5"/><circle class="wnd" cx="154" cy="28" r="4.6" fill="#fff"/>' +
  '<path d="M154 15V41M141 28H167" stroke="#fff" stroke-width="1.3" opacity=".7" stroke-linecap="round"/></g>' +
  /* kepala */
  '<circle cx="86" cy="36" r="13" fill="#cdf0b4"/><path d="M76 30Q82 24 96 28Q92 22 82 22Q74 24 74 32Z" fill="#ff8a3d"/>' +
  '<ellipse cx="92" cy="35" rx="3.5" ry="4" fill="#fff"/><circle cx="93" cy="35.5" r="2.2" fill="#1b0b2e"/><circle cx="93.7" cy="34.6" r=".8" fill="#fff"/><path d="M88 31L96 32.4" stroke="#1b0b2e" stroke-width="1.7" stroke-linecap="round"/><path d="M87 27.5L96 29" stroke="#7a2a10" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M97.5 37L107 41L98 42Z" fill="#b2de96"/><circle cx="85" cy="42" r="3" fill="#ff8aa8" opacity=".5"/><path d="M91 46Q96 51 102 44" stroke="#1b0b2e" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M96 48.4L97.6 45.6L99.2 47.6Z" fill="#fff"/>' +
  /* topi */
  '<ellipse cx="86" cy="25" rx="28" ry="6.4" fill="#2a1050"/><path d="M64 24Q70 4 84 -4Q94 -10 96 -22Q110 -12 106 -4Q98 0 102 10Q108 18 108 24Z" fill="#4a1d96"/><path d="M72 14Q82 6 90 0" stroke="#7d4cc8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>' +
  '<path d="M65 21Q86 29 107 21" stroke="#f2c14e" stroke-width="4.6" fill="none"/><rect x="80" y="19" width="11" height="8.5" rx="1.8" fill="none" stroke="#ffd23f" stroke-width="2.2"/>' +
  '<path d="M91 6L93 1L95 6L100 8L95 10L93 15L91 10L86 8Z" fill="#ffd23f"/>' +
  "</g></svg>";

/* ============================ JAM RAKSASA ============================ */
const WT_CLOCK = (() => {
  let tk = "";
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180, big = i % 3 === 0, r1 = big ? 70 : 76, r2 = 84; tk += '<path d="M' + (100 + Math.sin(a) * r1).toFixed(1) + " " + (100 - Math.cos(a) * r1).toFixed(1) + "L" + (100 + Math.sin(a) * r2).toFixed(1) + " " + (100 - Math.cos(a) * r2).toFixed(1) + '" stroke="' + (big ? "#ffd23f" : "#c9a4ff") + '" stroke-width="' + (big ? 5 : 3) + '" stroke-linecap="round"/>' }
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#2a1470" opacity=".5"/><circle cx="100" cy="100" r="92" fill="#150a3c" stroke="#f2c14e" stroke-width="7"/><circle cx="100" cy="100" r="86" fill="none" stroke="#c9a4ff" stroke-width="1.6" stroke-dasharray="3 5"/>' +
    '<circle cx="100" cy="100" r="60" fill="#241160" opacity=".7"/>' + tk +
    '<g fill="#f2e8ff" font-family="Georgia,serif" font-weight="700" font-size="17" text-anchor="middle"><text x="100" y="58">XII</text><text x="150" y="106">III</text><text x="100" y="156">VI</text><text x="50" y="106">IX</text></g>' +
    '<g class="hh" style="transform-origin:100px 100px"><path d="M100 100V56" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M100 54L95 62H105Z" fill="#ffd23f"/></g>' +
    '<g class="mh" style="transform-origin:100px 100px"><path d="M100 108V26" stroke="#c9a4ff" stroke-width="4.6" stroke-linecap="round"/><path d="M100 20L94 32H106Z" fill="#ffd23f"/></g>' +
    '<circle cx="100" cy="100" r="7" fill="#ffd23f"/><circle cx="100" cy="100" r="2.6" fill="#150a3c"/>' +
    '<g class="ck" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="0"><path d="M100 100L62 38L70 24M62 38L40 44"/><path d="M100 100L152 70L176 78M152 70L158 44"/><path d="M100 100L120 168L108 190M120 168L146 176"/><path d="M100 100L52 140L36 134"/></g></svg>';
})();

/* animasi jam + penyihir: dipakai layar waktu berhenti dan pratinjau Cara Main */
function wtClockAnim(root, cb) {
  const cl = root.querySelector(".wtcl"), wz = root.querySelector(".wtwz"), mh = root.querySelector(".mh"), hh = root.querySelector(".hh"), ck = root.querySelector(".ck");
  try {
    if (wz) {
      wz.animate([{ transform: "translate(-170%,-40%) rotate(-14deg) scale(.7)", opacity: 0 }, { transform: "translate(8%,6%) rotate(3deg) scale(1.04)", opacity: 1, offset: .7 }, { transform: "none", opacity: 1 }], { duration: 800, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
      wtT(() => { const gl = wz.querySelector(".wgl"); if (gl) gl.animate([{ r: 15 }, { r: 30 }, { r: 15 }], { duration: 700 }) }, 650);
    }
    if (cl) cl.animate([{ transform: "scale(.1) rotate(-200deg)", opacity: 0 }, { transform: "scale(1.15) rotate(8deg)", opacity: 1, offset: .6 }, { transform: "scale(1) rotate(0)", opacity: 1 }], { duration: 650, delay: 420, easing: "cubic-bezier(.2,1.3,.4,1)", fill: "backwards" });
    if (mh) mh.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(1440deg)" }], { duration: 1500, delay: 500, easing: "cubic-bezier(.25,.6,.3,1)", fill: "both" });
    if (hh) hh.animate([{ transform: "rotate(-120deg)" }, { transform: "rotate(360deg)" }], { duration: 1500, delay: 500, easing: "cubic-bezier(.25,.6,.3,1)", fill: "both" });
  } catch (x) {}
  wtT(() => {
    if (cl) { cl.classList.add("stop"); try { cl.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: .2 }, { transform: "scale(.96) rotate(-2deg)", offset: .45 }, { transform: "scale(1)" }], { duration: 520 }) } catch (x) {} }
    if (ck) ck.setAttribute("opacity", "1");
    if (cb) cb();
  }, 2000);
}

function wtFreeze(on, name, own, quiet) {
  if (on) {
    if (WT.on) return;
    WT.on = 1; WT.own = !!own; WT.t = Date.now(); WT.picked = 0;
    const ty = $("typ"); ty.value = ""; prevLen = 0; try { ty.blur() } catch (x) {}
    const ov = document.createElement("div");
    ov.className = "wtov" + (own ? " own" : "");
    ov.innerHTML = '<i class="wtw"></i><i class="wtw w2"></i><i class="wtw w3"></i><div class="wtst"><div class="wtrn"><i></i><i></i><i></i></div><div class="wtcl">' + WT_CLOCK + '</div><div class="wtwz">' + WT_SVG + '</div></div><p class="wtt2">' +
      (own ? "Pilih target sihirmu" : esc(name || "Seorang pemain") + " sedang memilih target…") + '</p><div class="wtpk"></div><small class="wtau"></small>';
    $("s-game").appendChild(ov); WT.ov = ov;
    const wz = ov.querySelector(".wtwz"); if (wz) wz.style.setProperty("--wc", "#c9a4ff");
    try { SFX.wtStop() } catch (x) {}
    wtClockAnim(ov, () => {
      /* jam berhenti: dunia jadi abu-abu dan semua animasi latar membeku */
      if (!WT.on) return;
      document.body.classList.add("wts");
      WT.pz = document.getAnimations().filter(a => { try { const e = a.effect && a.effect.target; return a.playState === "running" && !(window.CSSTransition && a instanceof CSSTransition) && e && e.id !== "scene" && e.closest && e.closest("#scene") && !e.closest('[class*="wt-"]') } catch (x) { return false } });
      WT.pz.forEach(a => { try { a.pause() } catch (x) {} });
      ov.classList.add("frozen");
    });
  } else {
    if (!WT.on) return;
    const dt = Date.now() - WT.t;
    WT.on = 0; WT.own = 0;
    clearInterval(WT.auto); WT.auto = 0;
    if (WT.kd) { removeEventListener("keydown", WT.kd, true); WT.kd = null }
    document.body.classList.remove("wts");
    WT.pz.forEach(a => { try { if (a.playState === "paused") a.play() } catch (x) {} }); WT.pz = [];
    const ov = WT.ov; WT.ov = null;
    if (ov) { if (quiet) ov.remove(); else { ov.classList.add("out"); setTimeout(() => ov.remove(), 520) } }
    if (!quiet) {
      /* jam permainan ikut berhenti: geser awal waktu sebesar lama berhenti */
      if (started && !over && !ended && t0) t0 += dt;
      try { SFX.wtGo() } catch (x) {}
      if (started && !over) { try { $("typ").focus() } catch (x) {} }
    }
    if (me.wts && !WT.rel) push({ wts: 0 });
  }
}

/* ============================ SISI PEMAKAI ============================ */
function wtStart() {
  if (WT.on) return;
  const ps = peersNow().filter(p => p.id !== me.id && !p.fin);
  if (!ps.length) { popup("Belum ada lawan untuk diserang"); return }
  WT.cand = ps.slice(0, 5);
  wtFreeze(true, me.name, true);
  push({ wts: Date.now() });
  const box = WT.ov.querySelector(".wtpk"), now = Date.now();
  box.innerHTML = WT.cand.map((p, i) => '<button type="button" class="wtc1" style="--i:' + i + '" data-id="' + esc(p.id) + '">' + ab(p, 44) + "<span><b>" + esc(p.name) + "</b><small>🏢 " + (p.floors | 0) + " lantai" + (p.sh ? " · 🛡️" : "") + (p.dg > now ? " · 🐉" : "") + "</small></span><em>" + (i + 1) + "</em></button>").join("");
  box.onpointerdown = e => { const b = e.target.closest("button"); if (!b) return; e.preventDefault(); wtPick(b.dataset.id) };
  WT.kd = e => {
    if (!WT.own || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") { e.preventDefault(); e.stopPropagation() }
    const d = /^[1-9]$/.test(e.key) ? +e.key : 0;
    if (d && WT.cand[d - 1]) wtPick(WT.cand[d - 1].id);
  };
  addEventListener("keydown", WT.kd, true);
  /* pengaman: kalau pemakai diam terlalu lama, lawan terdepan dipilih otomatis supaya game tidak macet */
  let left = 12; const au = WT.ov.querySelector(".wtau");
  const upd = () => { au.textContent = "Tidak memilih? Target otomatis dalam " + left + " dtk" };
  upd();
  WT.auto = setInterval(() => {
    if (!WT.own) { clearInterval(WT.auto); return }
    left--; upd();
    if (left <= 0) { const t = WT.cand.slice().sort((a, b) => (b.floors || 0) - (a.floors || 0))[0]; if (t) wtPick(t.id) }
  }, 1000);
}

function wtPick(id) {
  if (!WT.own || WT.picked) return;
  const now = Date.now(), p = peersNow().find(x => x.id === id) || WT.cand.find(x => x.id === id);
  if (!p) return;
  WT.picked = 1;
  const a = { s: me.id + now, k: K_WT, to: p.id, n: 0, b: (p.sh || p.dg > now) ? 1 : 0 };
  seen[me.id] = a.s;
  /* lawan tetap membeku WT_FREEZE ms lagi (wts baru dihapus nanti), pemakai langsung bisa mengetik */
  push({ atk: a });
  clearTimeout(WT.rel);
  WT.rel = setTimeout(() => { WT.rel = 0; if (me.wts) push({ wts: 0 }) }, WT_FREEZE);
  if (BOTS.some(x => x.id === a.to)) botHit(a);
  try { SFX.choose() } catch (x) {}
  wtFreeze(false);
  play(me, a, peersNow());
}

/* ============================ SISI PEMAIN LAIN ============================ */
function wtSync(ps) {
  if (WT.own) return;
  const o = ps.find(p => p.id !== me.id && !p.bot && p.wts);
  if (o) {
    if (WT.tok !== o.wts) { WT.tok = o.wts; WT.seenAt = performance.now() }
    if (performance.now() - WT.seenAt > 20000) { if (WT.on) wtFreeze(false); return }
    if (!WT.on && !over && !ended) wtFreeze(true, o.name, false);
  } else if (WT.on) wtFreeze(false);
}
setInterval(() => { if (scr === "game") wtSync(peersNow()) }, 400);

/* ============================ SISI KORBAN ============================ */
/* kunci ketik sementara: pakai mesin kunci milik skill akar (dipakai es & jaring) */
function wtLockMe(ms, id, ic, n) {
  const i = SK.length;
  SK.push({ id: id || "roots", ic: ic || "🪨", n: n || "TANAH MENJEPIT", lk: ms / 1000 });
  try { lockMe(i) } finally { SK.pop() }
}
function wtIncoming(a) {
  wtT(() => {
    if (over || ended) return;
    if (me.dg > Date.now()) { lgDgBlock(); return }
    if (me.sh) { push({ sh: 0 }); if (ST.txr) popup("🛡️ SERANGAN DITANGKIS!"); return }
    lgChip(K_WT, WT_TOT / 1000, "DISIHIR ");
    wtDrain.am = 0;
    WT_SP.forEach(sp => wtT(() => wtVictim(sp), sp.at + sp.hit));
  }, IMP[a.k] + 40);
}

function wtVictim(sp) {
  if (over || ended) return;
  if (me.dg > Date.now()) return;
  if (sp.dmg) wtDrain(sp.dmg, sp.id);
  if (sp.dz) { dz = { k: K_WT, n: sp.dz }; drawWord(); if (ST.txr) popup("☠️ KERACUNAN! 3 kata menghilang") }
  if (typeof wtVictimX === "function") wtVictimX(sp);
}

function wtDrain(n, el) {
  if (me.dg > Date.now()) return;
  if (!fc) { if (ST.txr && !wtDrain.am) { wtDrain.am = 1; popup("AMAN! Lantai masih kosong") } return }
  fc = Math.max(0, fc - (n || WT_DMG));
  SFX.hurt(); push({ floors: fc }); stat(); drawWord(); sync();
  const col = { fire: "#c8561a", water: "#1a6fd0", bolt: "#b59a10", poison: "#3a8a14", ice: "#3a9ad0", shadow: "#3a2a6a", curse: "#8a3ac8", web: "#9aa0b8", sand: "#b8903a", sleep: "#4a5ab8" }[el] || "#3a8a14";
  $("fl").animate([{ transform: "scale(1.3)", background: col }, { transform: "none" }], { duration: 600, easing: "ease-out" });
}

/* bot sebagai korban */
function wtBot(a, b) {
  setTimeout(() => {
    if (ended || b.dg > Date.now()) return;
    if (b.sh) { b.sh = 0; pubBots(); return }
    WT_SP.forEach(sp => {
      const key = b.id + "w" + a.s + sp.id;
      const go = () => {
        if (ended || !botsOn) return;
        if (wtHold()) { botTm[key] = setTimeout(go, 300); return }
        if (b.dg > Date.now()) return;
        if (sp.ms) b.fz = Math.max(b.fz || 0, Date.now() + sp.ms);
        if (sp.dmg && b.floors > 0) { b.floors = Math.max(0, b.floors - sp.dmg); pubBots() }
        if (sp.dz) b.dis = sp.dz;
        if (sp.dk || sp.rev || sp.sn) b.dis = 3;
        if (sp.slp) b.fz = Math.max(b.fz || 0, Date.now() + 1200);
      };
      botTm[key] = setTimeout(go, sp.at + sp.hit);
    });
  }, IMP[a.k] + 40);
}

/* ============================ DIPANGGIL play() UNTUK SEMUA ORANG ============================ */
function wtPlay(att, a, ps) {
  const t = tws[a.to], mine = att.id === me.id, v = ps.find(p => p.id === a.to);
  if (t) t.sk = { k: a.k, at: performance.now(), by: mine, dur: IMP[a.k] + WT_TOT + 1700 };
  const o = { sc: $("scene"), M: tws, att: att.id, attName: att.name, vic: a.to, vicName: v ? v.name : "lawan", mine, blk: !!a.b, demo: false };
  if (WT.on && !WT.own && WT.ov) { const h = WT.ov.querySelector(".wtt2"); if (h) h.textContent = esc(att.name) + " sudah memilih target…" }
  try { SFX.skill("witch", { I: IMP[a.k], demo: false, mine, far: wtQ(o), pan: 0, blk: o.blk }) } catch (x) {}
  if (!o.blk) WT_SP.forEach(sp => wtT(() => { try { SFX.wtSp(sp.id, { mine, far: wtQ(o), vic: a.to === me.id }) } catch (x) {} }, IMP[a.k] + sp.at));
  if (mine ? ST.txu : ST.txr) lgTitle({ k: K_WT }, o, mine ? "10 sihir menyerang " + esc(o.vicName) + "!" : (a.to === me.id ? esc(att.name) + " menyihirmu!" : esc(att.name) + " menyihir " + esc(o.vicName) + "!"));
  wtFx(o);
}

/* ============================ ANIMASI ============================ */
/* ---- mesin partikel canvas: api, asap, percikan, air, batu, petir ---- */
const WT_SPR = {};
const wtSpr = (r, g, b) => {
  r = (r >> 3) << 3; g = (g >> 3) << 3; b = (b >> 3) << 3;
  const k = r + "," + g + "," + b;
  if (!WT_SPR[k]) {
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(" + k + ",1)"); gr.addColorStop(.35, "rgba(" + k + ",.55)"); gr.addColorStop(.7, "rgba(" + k + ",.12)"); gr.addColorStop(1, "rgba(" + k + ",0)");
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); WT_SPR[k] = c;
  }
  return WT_SPR[k];
};
const wtLerp = (a, b, k) => a + (b - a) * k;
function wtEngine(sc, lo) {
  const W = sc.clientWidth || 600, H = sc.clientHeight || 400, dpr = Math.min(window.devicePixelRatio || 1, lo ? 1 : 1.5);
  const cv = document.createElement("canvas"); cv.className = "wt-cv"; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px"; sc.appendChild(cv);
  const cx = cv.getContext("2d"), E = { cv, W, H, P: [], bolts: [], em: [], hooks: [], dead: 0, max: lo ? 150 : 520, last: performance.now(), t0: performance.now() };
  E.p = o => {
    if (E.P.length >= E.max) return null;
    const p = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 0, l: 0, m: 1, s0: 10, s1: 10, c0: [255, 255, 255], c1: null, a0: 1, a1: 0, t: "glow", rot: 0, vr: 0, env: 0 }, o);
    if (!p.c1) p.c1 = p.c0;
    if (p.t === "rock") { p.poly = []; const n = 6; for (let i = 0; i < n; i++) p.poly.push([Math.cos(i / n * 6.283) * rnd(.6, 1), Math.sin(i / n * 6.283) * rnd(.6, 1)]) }
    E.P.push(p); return p;
  };
  E.emit = (ms, f) => E.em.push({ f, until: performance.now() + ms, t0: performance.now() });
  E.hook = (ms, f) => E.hooks.push({ f, until: performance.now() + ms, t0: performance.now() });
  E.bolt = (x0, y0, x1, y1, o) => {
    o = o || {};
    const gen = (ax, ay, bx, by, disp, it) => { let pts = [[ax, ay], [bx, by]]; for (let i = 0; i < it; i++) { const n = [pts[0]]; for (let j = 1; j < pts.length; j++) { const a = pts[j - 1], b = pts[j], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, off = rnd(-disp, disp); n.push([mx - dy / L * off, my + dx / L * off], b) } pts = n; disp *= .55 } return pts };
    const main = gen(x0, y0, x1, y1, Math.hypot(x1 - x0, y1 - y0) * .22, 6), br = [];
    if (!lo) for (let i = 0; i < 4; i++) { const k = 6 + (Math.random() * (main.length - 14) | 0), p = main[k]; if (!p) continue; const a = Math.atan2(y1 - y0, x1 - x0) + rnd(-.9, .9), L = rnd(40, 110); br.push(gen(p[0], p[1], p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L, L * .25, 4)) }
    E.bolts.push({ main, br, t0: performance.now(), dur: o.dur || 420, w: o.w || 1, col: o.col || [190, 210, 255] });
  };
  const drawP = p => {
    const k = Math.min(1, p.l / p.m), s = wtLerp(p.s0, p.s1, k);
    let a = wtLerp(p.a0, p.a1, k); if (p.env) a *= Math.min(1, k * 5, (1 - k) * 5);
    if (a <= .01 || s <= .1) return;
    const r = wtLerp(p.c0[0], p.c1[0], k), g = wtLerp(p.c0[1], p.c1[1], k), b = wtLerp(p.c0[2], p.c1[2], k);
    if (p.t === "glow" || p.t === "smoke") { cx.globalAlpha = Math.min(1, a); cx.drawImage(wtSpr(r, g, b), p.x - s, p.y - s, s * 2, s * 2) }
    else if (p.t === "spark" || p.t === "drop") { cx.globalAlpha = Math.min(1, a); cx.strokeStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")"; cx.lineWidth = s; cx.lineCap = "round"; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .035, p.y - p.vy * .035); cx.stroke() }
    else if (p.t === "bubble") { cx.globalAlpha = Math.min(1, a); cx.strokeStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")"; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(p.x, p.y, s, 0, 6.283); cx.stroke(); cx.fillStyle = "rgba(255,255,255,.7)"; cx.beginPath(); cx.arc(p.x - s * .35, p.y - s * .35, Math.max(.8, s * .22), 0, 6.283); cx.fill() }
    else if (p.t === "rock") { cx.save(); cx.globalAlpha = Math.min(1, a); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")"; cx.strokeStyle = "rgba(30,20,12,.8)"; cx.lineWidth = 1.2; cx.beginPath(); p.poly.forEach((q, i) => i ? cx.lineTo(q[0] * s, q[1] * s) : cx.moveTo(q[0] * s, q[1] * s)); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = "rgba(255,255,255,.2)"; cx.beginPath(); p.poly.forEach((q, i) => { const X = q[0] * s * .6 - s * .18, Y = q[1] * s * .6 - s * .2; i ? cx.lineTo(X, Y) : cx.moveTo(X, Y) }); cx.closePath(); cx.fill(); cx.fillStyle = "rgba(0,0,0,.22)"; cx.beginPath(); cx.moveTo(p.poly[2][0] * s, p.poly[2][1] * s); cx.lineTo(p.poly[3][0] * s, p.poly[3][1] * s); cx.lineTo(p.poly[4][0] * s, p.poly[4][1] * s); cx.lineTo(0, 0); cx.closePath(); cx.fill(); cx.restore() }
  };
  const loop = now => {
    if (E.dead) return;
    const dt = Math.min(.05, (now - E.last) / 1000); E.last = now;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1;
    E.em = E.em.filter(e => { if (now > e.until) return false; try { e.f(dt, now - e.t0, now) } catch (x) {} return true });
    E.hooks = E.hooks.filter(h => { if (now > h.until) return false; cx.save(); try { h.f(cx, now - h.t0, now) } catch (x) {} cx.restore(); return true });
    for (const p of E.P) { p.l += dt; p.vx *= 1 - Math.min(1, p.drag * dt); p.vy *= 1 - Math.min(1, p.drag * dt); p.vx += p.ax * dt; p.vy += p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt }
    for (const p of E.P) if (p.floor && p.y > p.floor && p.vy > 0) { p.y = p.floor; p.vy *= -.28; p.vx *= .6; p.vr *= .5 }
    E.P = E.P.filter(p => p.l < p.m);
    cx.globalCompositeOperation = "source-over";
    for (const p of E.P) if (p.t === "smoke" || p.t === "rock" || p.t === "drop" || p.t === "bubble") drawP(p);
    cx.globalCompositeOperation = "lighter";
    for (const p of E.P) if (p.t === "glow" || p.t === "spark") drawP(p);
    E.bolts = E.bolts.filter(b => now - b.t0 < b.dur);
    for (const b of E.bolts) {
      const age = now - b.t0, k = age / b.dur, fl = k < .12 ? 1 : (Math.sin(age * .09) > -.2 ? .85 : .25), a = (1 - k * k) * fl, path = pts => { cx.beginPath(); pts.forEach((q, i) => i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])) }, c = b.col.join(",");
      cx.lineJoin = "round"; cx.lineCap = "round";
      [[16, .14], [8, .3], [4, .6]].forEach(([w, al]) => { cx.strokeStyle = "rgba(" + c + "," + (al * a) + ")"; cx.lineWidth = w * b.w; path(b.main); cx.stroke(); b.br.forEach(p => { cx.lineWidth = w * b.w * .5; path(p); cx.stroke() }) });
      cx.strokeStyle = "rgba(255,255,255," + a + ")"; cx.lineWidth = 2 * b.w; path(b.main); cx.stroke(); cx.lineWidth = 1.2; b.br.forEach(p => { path(p); cx.stroke() });
    }
    cx.globalAlpha = 1; cx.globalCompositeOperation = "source-over";
    E.raf = requestAnimationFrame(loop);
  };
  E.raf = requestAnimationFrame(loop);
  E.kill = () => { E.dead = 1; cancelAnimationFrame(E.raf); cv.remove() };
  return E;
}

const wtBoltPts = (x0, y0, x1, y1, n, j) => { let s = x0 + "," + y0; for (let i = 1; i < n; i++) { const k = i / n; s += " " + (x0 + (x1 - x0) * k + rnd(-j, j)).toFixed(1) + "," + (y0 + (y1 - y0) * k).toFixed(1) } return s + " " + x1 + "," + y1 };

function wtFx(o) {
  const sc = o.sc, t = o.M[o.vic];
  if (!t || !t.el.isConnected) return;
  const I = IMP[K_WT], lo = wtLo(o), q = wtQ(o), mineV = o.vic === me.id && !o.demo, W = sc.clientWidth || 600, H = sc.clientHeight || 400, TK = WT_TOT;
  const E = wtEngine(sc, lo), N = n => lo ? Math.ceil(n / 2) : n;
  const A = {
    dead: false, tm: [], iv: [], nodes: [],
    at(ms, f) { const id = setTimeout(() => { if (!A.dead) f() }, ms); A.tm.push(id); return id },
    ev(ms, f) { const id = setInterval(() => { if (A.dead) return; if (!t.el.isConnected) { A.end(); return } f() }, ms); A.iv.push(id); return id },
    add(e) { A.nodes.push(e); return e },
    end() { if (A.dead) return; A.dead = true; A.tm.forEach(clearTimeout); A.iv.forEach(clearInterval); A.nodes.forEach(n => { try { n.remove() } catch (x) {} }); E.kill(); if (WT.E === E) WT.E = null; t.el.classList.remove("wt-poi"); if (t.sk) delete t.sk.el; WT.act.delete(A) }
  };
  WT.act.add(A); WT.E = E;
  const gm = () => { const p = lgPos(sc, t.el), g = stackGeo(t); return { cx: p.x + g.x + g.w / 2, top: p.y + g.y, bot: p.y + g.y + g.h, w: Math.max(34, g.w), h: Math.max(30, g.h), ex: g.x + g.w / 2, ey: g.y, gy: p.y + t.el.clientHeight - 6 } };
  const fromR = gm().cx < W / 2, sx = fromR ? W + 150 : -150, sgn = fromR ? 1 : -1;
  const eff = id => { if (t.sk) t.sk.el = id };

  /* ---- bahan efek berulang ---- */
  const sparks = (x, y, n, v, c0, c1) => { for (let i = 0; i < N(n); i++) { const a = rnd(0, 6.283), s = rnd(v * .3, v); E.p({ t: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - v * .3, ay: 520, drag: 1.2, m: rnd(.4, .9), s0: rnd(1.4, 2.8), s1: .4, c0: c0 || [255, 235, 160], c1: c1 || [255, 110, 20], a0: 1 }) } };
  const dust = (x, y, n, sp, col, big) => { for (let i = 0; i < N(n); i++) { const s = rnd(14, big || 30); E.p({ t: "smoke", x: x + rnd(-sp, sp), y: y + rnd(-4, 4), vx: rnd(-50, 50), vy: -rnd(8, 60), drag: 1.4, m: rnd(.9, 1.7), s0: s * .5, s1: s * 1.9, c0: col || [170, 140, 104], c1: [110, 90, 68], a0: .5, a1: 0 }) } };
  const explode = (x, y, sz) => {
    E.p({ x, y, m: .3, s0: sz * .4, s1: sz * 1.7, c0: [255, 250, 220], c1: [255, 170, 60], a0: .95 });
    for (let i = 0; i < N(16); i++) { const a = rnd(0, 6.283), s = rnd(50, 210); E.p({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, drag: 3, m: rnd(.45, .95), s0: rnd(12, 26), s1: rnd(30, 54), c0: [255, 210, 90], c1: [200, 40, 0], a0: .9 }) }
    for (let i = 0; i < N(8); i++) E.p({ t: "smoke", x: x + rnd(-14, 14), y: y + rnd(-10, 10), vx: rnd(-30, 30), vy: -rnd(20, 60), drag: .8, m: rnd(1.1, 1.8), s0: 14, s1: rnd(40, 66), c0: [70, 56, 52], c1: [30, 26, 26], a0: .5, a1: 0 });
    sparks(x, y, 18, 380);
  };
  const stackFx = (kf, d) => { try { t.stack.animate(kf, { duration: d }) } catch (x) {} };
  const vig = cls => { if (mineV && !q) { const v = A.add(mk(sc, "lg-vig " + cls)); v.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 2200, fill: "forwards" }).onfinish = () => v.remove() } };

  /* --- penyihir --- */
  const wi = A.add(mk(sc, "wt-w" + (fromR ? " l" : ""), "left:" + sx + "px;top:-80px", WT_SVG));
  wi.style.transition = "none";
  let mode = "enter", col = [157, 255, 90], t0m = performance.now(), leaving = 0, ready = 0, px = 0;
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] };
  const tgt = () => {
    const g = gm(), now = performance.now();
    switch (mode) {
      case "low": return { x: g.cx + sgn * (g.w * .55 + 54), y: Math.min(g.gy - 36, g.bot - 20), ms: 520 };
      case "orbit": { const a = (now - t0m) / 330; return { x: g.cx + Math.cos(a) * (g.w * .55 + 92), y: Math.max(60, g.top - 88) + Math.sin(a) * 36, ms: 110 } }
      case "wave": return { x: g.cx + sgn * Math.min(W * .34, 230), y: Math.max(64, g.top - 40), ms: 700 };
      case "sky": return { x: g.cx + sgn * (g.w * .4 + 40), y: Math.max(54, g.top - 150), ms: 520 };
      default: return { x: g.cx + sgn * (g.w * .55 + 40), y: Math.max(60, g.top - Math.max(76, g.h * .12 + 66)), ms: 520 };
    }
  };
  const h0 = tgt();
  const fl = wi.animate([{ left: sx + "px", top: (h0.y - 90) + "px", transform: "rotate(" + (fromR ? -12 : 12) + "deg) scale(.8)" }, { left: h0.x + "px", top: h0.y + "px", transform: "rotate(0deg) scale(1)" }], { duration: 1100, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" });
  fl.onfinish = () => { if (A.dead) return; const h = tgt(); wi.style.left = h.x + "px"; wi.style.top = h.y + "px"; fl.cancel(); requestAnimationFrame(() => { ready = 1; mode = "hover" }) };
  const setMode = (m, c) => { mode = m; t0m = performance.now(); if (c) { col = hex(c); wi.style.setProperty("--wc", c) } };
  A.ev(100, () => {
    if (!ready || leaving) return;
    const h = tgt(), g = gm();
    wi.style.transition = "left " + h.ms + "ms linear,top " + h.ms + "ms linear";
    wi.style.left = h.x + "px"; wi.style.top = h.y + "px";
    wi.classList.toggle("l", h.x > g.cx);
    wi.style.rotate = Math.max(-10, Math.min(10, (h.x - px) * .12)) + "deg"; px = h.x;
  });
  const wand = () => { const e = wi.querySelector(".wnd"); if (!e) return { x: 0, y: 0 }; const r = lgPos(sc, e); return { x: r.x + r.w / 2, y: r.y + r.h / 2 } };
  const cast = () => {
    const a = wi.querySelector(".arm"); if (a) a.animate([{ transform: "rotate(0)" }, { transform: "rotate(-24deg)", offset: .3 }, { transform: "rotate(14deg)", offset: .6 }, { transform: "rotate(0)" }], { duration: 520, easing: "ease-out" });
    const w = wand(); E.p({ x: w.x, y: w.y, m: .5, s0: 8, s1: 70, c0: [255, 255, 255], c1: col, a0: .9 });
    for (let i = 0; i < N(14); i++) { const a = rnd(0, 6.283), s = rnd(40, 160); E.p({ t: "spark", x: w.x, y: w.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2.5, m: rnd(.4, .8), s0: 2.2, s1: .4, c0: [255, 255, 255], c1: col }) }
  };
  const say = (txt, d) => { const s = mk(wi, "wt-say", "", txt); s.animate([{ opacity: 0, transform: "translateX(-50%) scale(.4)" }, { opacity: 1, transform: "translateX(-50%) scale(1.1)", offset: .15 }, { opacity: 1, transform: "translateX(-50%) scale(1)", offset: .8 }, { opacity: 0, transform: "translateX(-50%) translateY(-10px)" }], { duration: d || 1500 }).onfinish = () => s.remove() };
  /* jejak sihir: dari ujung tongkat dan ekor sapu */
  E.emit(TK + I + 2000, dt => {
    if (leaving > 1) return;
    const w = wand(), r = lgPos(sc, wi), left = wi.classList.contains("l"), cc = ready ? col : [190, 150, 255];
    if (!ready || mode !== "enter") { E.p({ x: w.x + rnd(-2, 2), y: w.y + rnd(-2, 2), vx: rnd(-20, 20), vy: rnd(-10, 30), m: rnd(.35, .7), s0: rnd(5, 10), s1: 1, c0: cc, c1: cc, a0: .85 }) }
    else E.p({ x: w.x, y: w.y, m: .4, s0: 7, s1: 1, c0: cc, a0: .8 });
    const tx = r.x + r.w * (left ? .93 : .06), ty = r.y + r.h * .72;
    E.p({ x: tx, y: ty, vx: (left ? 1 : -1) * rnd(10, 50), vy: rnd(-12, 24), m: rnd(.5, 1), s0: rnd(4, 9), s1: 1, c0: [255, 230, 150], c1: cc, a0: .6 });
    if (!lo && Math.random() < .5) E.p({ t: "spark", x: tx, y: ty, vx: (left ? 1 : -1) * rnd(20, 90), vy: rnd(-30, 40), ay: 120, m: rnd(.4, .8), s0: 1.8, s1: .4, c0: [255, 255, 255], c1: cc });
  });

  const leave = () => {
    if (leaving) return; leaving = 1;
    const r = lgPos(sc, wi);
    wi.style.transition = "none"; wi.style.rotate = "0deg";
    wi.animate([{ left: r.x + "px", top: r.y + "px", transform: "rotate(0deg)" }, { left: (fromR ? W + 160 : -160) + "px", top: (r.y - 100) + "px", transform: "rotate(" + (fromR ? 14 : -14) + "deg)" }], { duration: 1000, easing: "ease-in", fill: "forwards" }).onfinish = () => { wi.remove(); leaving = 2 };
    say("Dadaaah~", 900);
  };
  A.at(900, () => say("Hihihihi!", 1200));

  /* ======== KENA PELINDUNG ======== */
  if (o.blk) {
    A.at(I - 900, () => {
      setMode("hover", "#ff7a1a"); cast();
      const w = wand(), g = gm(), st = performance.now(), x1 = g.cx, y1 = g.top + g.h * .3;
      E.emit(880, () => { const k = Math.min(1, (performance.now() - st) / 880), e = k * k, x = w.x + (x1 - w.x) * e, y = w.y + (y1 - w.y) * e; E.p({ x, y, m: .08, s0: 22, s1: 24, c0: [255, 240, 190], a0: .95 }); for (let i = 0; i < 2; i++) E.p({ x: x + rnd(-5, 5), y: y + rnd(-5, 5), vx: rnd(-20, 20), vy: rnd(-20, 40), m: rnd(.3, .6), s0: rnd(10, 18), s1: 3, c0: [255, 190, 70], c1: [200, 40, 0], a0: .8 }) });
    });
    A.at(I, () => { const g = gm(); shieldHit(t, g.ex, g.ey + g.h * .3); sparks(g.cx, g.top + g.h * .3, 20, 300, [190, 230, 255], [90, 160, 255]); say("Hah?! Ditangkis!", 1300); A.at(600, leave); A.at(1700, () => A.end()) });
    return;
  }

  /* ======== 2. BADAI API ======== */
  const fire = () => {
    setMode("orbit", "#ff7a1a"); say(SP.fire.say, 1400); eff("fire");
    const sp = SP.fire, dur = sp.hit + 1500;
    A.at(250, () => { cast(); vig("fvg") });
    /* pusaran api: ramp naik lalu turun */
    A.at(500, () => E.emit(dur - 500, (dt, el) => {
      const g = gm(), ramp = Math.min(1, el / 600) * Math.min(1, (dur - 500 - el) / 500), R = Math.max(g.w * .85, 54), n = Math.round(N(3) * ramp);
      for (let i = 0; i < n; i++) {
        const a = rnd(0, 6.283), y = rnd(g.top + g.h * .2, g.bot + 6), r = R * rnd(.55, 1.05);
        E.p({ x: g.cx + Math.cos(a) * r, y, vx: -Math.sin(a) * rnd(90, 170), vy: -rnd(90, 230), ax: (g.cx - (g.cx + Math.cos(a) * r)) * 3, drag: .6, m: rnd(.5, .95), s0: rnd(10, 18), s1: rnd(26, 42), c0: [255, 190, 90], c1: [190, 30, 0], a0: .5 });
      }
      for (let i = 0; i < Math.round(N(2) * ramp); i++) E.p({ t: "smoke", x: g.cx + rnd(-R, R), y: g.top - rnd(0, 24), vx: rnd(-30, 30), vy: -rnd(50, 110), m: rnd(1, 1.7), s0: 14, s1: rnd(36, 62), c0: [58, 48, 46], c1: [24, 22, 22], a0: .42 });
      if (Math.random() < .6) E.p({ t: "spark", x: g.cx + rnd(-R, R), y: rnd(g.top, g.bot), vx: rnd(-60, 60), vy: -rnd(120, 260), ay: -20, m: rnd(.7, 1.3), s0: 2, s1: .5, c0: [255, 220, 120], c1: [255, 80, 10] });
    }));
    /* hujan meteor dengan ekor api */
    const nM = lo ? 3 : 6;
    for (let k = 0; k < nM; k++) A.at(sp.hit - 700 + k * 260, () => {
      const g = gm(), x0 = g.cx + sgn * rnd(170, 300) + rnd(-30, 30), y0 = -40, x1 = g.cx + rnd(-g.w * .4, g.w * .4), y1 = g.top + rnd(0, g.h * .75), T = 560, st = performance.now();
      E.emit(T + 20, () => {
        const kk = Math.min(1, (performance.now() - st) / T), e = kk * kk, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e;
        E.p({ x, y, m: .07, s0: 24, s1: 26, c0: [255, 250, 220], a0: 1 }); E.p({ x, y, m: .09, s0: 38, s1: 40, c0: [255, 150, 40], a0: .5 });
        for (let i = 0; i < 3; i++) E.p({ x: x + rnd(-6, 6) + (x0 - x1) * .02 * i, y: y + rnd(-6, 6) - 8 * i, vx: rnd(-30, 30), vy: rnd(-30, 30), m: rnd(.3, .6), s0: rnd(14, 24), s1: 4, c0: [255, 190, 70], c1: [190, 30, 0], a0: .75 });
        if (Math.random() < .4) E.p({ t: "smoke", x, y, vx: rnd(-20, 20), vy: rnd(-20, 20), m: .8, s0: 8, s1: 26, c0: [60, 50, 46], a0: .3 });
      });
      A.at(T, () => {
        const g2 = gm(); explode(x1, y1, 66);
        ringAt(t.el, g2.ex + (x1 - g.cx), y1 - g2.top + g2.ey, "wtf", 3.6, 600);
        if (k % 2 === 0) { if (!q) lgFlash(sc, "rgba(255,120,30,.6)", .45); if (mineV && !q) shake(8, 6, 380, sc) }
        stackFx([{ filter: "brightness(2.2) sepia(1) saturate(4) hue-rotate(-20deg)" }, { filter: "none" }], 460);
      });
    });
    /* bara menempel di atap setelah hantaman */
    A.at(sp.hit + 200, () => E.emit(1200, (dt, el) => { const g = gm(); for (let i = 0; i < N(2); i++) E.p({ x: g.cx + rnd(-g.w * .45, g.w * .45), y: g.top + rnd(-4, 10), vx: rnd(-14, 14), vy: -rnd(40, 100), m: rnd(.4, .8), s0: rnd(10, 18), s1: 3, c0: [255, 200, 80], c1: [200, 40, 0], a0: .75 * (1 - el / 1200) }) }));
  };

  /* ======== 3. GELOMBANG AIR ======== */
  const water = () => {
    setMode("wave", "#3fa9ff"); say(SP.water.say, 1400); eff("water");
    const sp = SP.water;
    A.at(300, () => { cast(); vig("wvg") });
    A.at(500, () => {
      const g = gm(), h = Math.max(120, Math.min(g.h * .85 + 50, 220)), L = h * 2.3, dir = -sgn, yb = g.gy + 8, tt = sp.hit - 500;
      const xs = dir > 0 ? -L * .3 : W + L * .3, v = (g.cx - xs) / (tt / 1000);
      const total = Math.abs((dir > 0 ? W + L * 1.2 : -L * 1.2) - xs) / Math.abs(v) * 1000;
      let hit = 0;
      /* kumpulan percikan dan buih di puncak ombak */
      E.hook(total + 200, (c, el) => {
        const fx = xs + v * el / 1000, tm = el / 1000, a = Math.min(1, el / 300) * Math.min(1, (total - el) / 400 + .2);
        c.globalAlpha = a;
        const d = dir, P = (u, hh) => [fx - d * L * (1 - u), yb - h * hh];
        const wave = (hh, shift, stops) => {
          const f2 = fx - d * shift;
          c.beginPath(); c.moveTo(f2 - d * L, yb);
          for (let i = 0; i <= 28; i++) { const u = i / 28 * .86, pr = Math.pow(Math.min(1, u / .86), 1.5), ws = 1 + .07 * Math.sin(tm * 7 + u * 16) + .04 * Math.sin(tm * 11 + u * 31); c.lineTo(f2 - d * L * (1 - u), yb - h * hh * pr * ws) }
          const cr = [f2 - d * L * .14, yb - h * hh];
          c.quadraticCurveTo(cr[0], cr[1] - h * .02, f2 + d * L * .02, yb - h * hh * 1.02);
          c.quadraticCurveTo(f2 + d * L * .1, yb - h * hh * .96, f2 + d * L * .09, yb - h * hh * .72);
          c.quadraticCurveTo(f2 + d * L * .07, yb - h * hh * .52, f2 + d * L * .0, yb - h * hh * .46);
          c.quadraticCurveTo(f2 - d * L * .03, yb - h * hh * .2, f2 + d * L * .05, yb);
          c.closePath();
          const gr = c.createLinearGradient(0, yb - h * hh, 0, yb); stops.forEach(s => gr.addColorStop(s[0], s[1])); c.fillStyle = gr; c.fill();
          return f2;
        };
        wave(.9, L * .06, [[0, "rgba(20,90,180,.85)"], [1, "rgba(8,40,100,.95)"]]);
        const f2 = wave(1, 0, [[0, "rgba(190,235,255,.92)"], [.18, "rgba(80,175,255,.9)"], [.6, "rgba(30,110,215,.92)"], [1, "rgba(10,60,150,.96)"]]);
        /* garis arus di badan ombak */
        c.strokeStyle = "rgba(210,240,255,.35)"; c.lineWidth = 2;
        for (let i = 0; i < 4; i++) { c.beginPath(); for (let j = 0; j <= 14; j++) { const u = j / 14 * .8, yy = yb - h * (.2 + i * .17) * Math.pow(u / .86 + .15, 1.2) - 4 * Math.sin(tm * 5 + j + i); j ? c.lineTo(f2 - d * L * (1 - u), yy) : c.moveTo(f2 - d * L * (1 - u), yy) } c.stroke() }
        /* buih tebal di bibir ombak */
        c.fillStyle = "rgba(255,255,255,.95)";
        for (let i = 0; i < 16; i++) { const u = .5 + i / 16 * .5, pr = Math.pow(u / .86, 1.5), x = f2 - d * L * (1 - u * .86 - .0) , yy = yb - h * Math.min(1.02, pr) + Math.sin(tm * 9 + i) * 3; c.beginPath(); c.arc(x + d * 2, yy + 2, 3 + (i % 4) * 1.6, 0, 6.283); c.fill() }
        /* cipratan dari puncak */
        for (let i = 0; i < N(4); i++) { const u = rnd(.6, .98); E.p({ t: "drop", x: fx - d * L * (1 - u * .9), y: yb - h * rnd(.85, 1.05), vx: d * rnd(40, 150), vy: -rnd(80, 260), ay: 700, m: rnd(.5, .9), s0: rnd(1.6, 3.2), s1: 1, c0: [225, 245, 255], c1: [150, 205, 255], a0: .9 }) }
        for (let i = 0; i < N(2); i++) E.p({ t: "smoke", x: fx + d * L * .04 + rnd(-10, 10), y: yb - h * rnd(.8, 1.05), vx: d * rnd(20, 80), vy: -rnd(20, 60), m: rnd(.6, 1.1), s0: 10, s1: rnd(28, 44), c0: [235, 247, 255], a0: .4 });
        /* benturan */
        if (!hit && ((d > 0 && fx >= gm().cx - L * .02) || (d < 0 && fx <= gm().cx + L * .02))) {
          hit = 1; const g2 = gm();
          ringAt(t.el, g2.ex, g2.ey + g2.h * .7, "wtb", 5, 800); ringAt(t.el, g2.ex, g2.ey + g2.h * .4, "wtb", 3, 600, 120);
          if (!q) lgFlash(sc, "rgba(60,150,255,.5)", .45);
          if (mineV && !q) shake(12, 7, 700, sc);
          for (let i = 0; i < N(70); i++) { const a = rnd(-Math.PI * .95, -Math.PI * .05), s = rnd(120, 460); E.p({ t: "drop", x: g2.cx + rnd(-g2.w * .5, g2.w * .5), y: g2.top + rnd(0, g2.h), vx: Math.cos(a) * s + d * 80, vy: Math.sin(a) * s, ay: 800, m: rnd(.7, 1.3), s0: rnd(1.8, 3.6), s1: 1, c0: [230, 247, 255], c1: [130, 195, 255], a0: .95 }) }
          for (let i = 0; i < N(14); i++) E.p({ t: "smoke", x: g2.cx + rnd(-g2.w * .6, g2.w * .6), y: g2.top + rnd(0, g2.h), vx: d * rnd(20, 110), vy: -rnd(20, 90), m: rnd(.9, 1.5), s0: 14, s1: rnd(40, 70), c0: [235, 247, 255], a0: .5 });
          stackFx([{ transform: "none", filter: "brightness(1.3) hue-rotate(160deg) saturate(1.6)" }, { transform: "translateX(" + d * 16 + "px) rotate(" + d * 5 + "deg)", offset: .3 }, { transform: "translateX(" + -d * 6 + "px) rotate(" + -d * 2 + "deg)", offset: .6 }, { transform: "none", filter: "none" }], 1100);
          const pd = A.add(mk(sc, "wt-pud", "left:" + (g2.cx - g2.w * 1.2) + "px;top:" + (g2.gy - 4) + "px;width:" + (g2.w * 2.4) + "px"));
          pd.animate([{ opacity: 0, transform: "scaleX(.2)" }, { opacity: 1, transform: "scaleX(1)", offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 2000, fill: "forwards" });
          /* air menetes dari badan menara */
          E.emit(1400, () => { if (Math.random() < .7) { const g3 = gm(); E.p({ t: "drop", x: g3.cx + rnd(-g3.w * .5, g3.w * .5), y: g3.top + rnd(0, g3.h * .5), vx: 0, vy: rnd(40, 120), ay: 600, m: .5, s0: 2, s1: 1.4, c0: [200, 232, 255], a0: .8 }) } });
        }
      });
    });
  };

  /* ======== 4. BADAI PETIR ======== */
  const bolt = () => {
    setMode("sky", "#fff36a"); say(SP.bolt.say, 1300); eff("bolt");
    const sp = SP.bolt, dur = 2300;
    A.at(200, () => {
      cast();
      const dk = A.add(mk(sc, "wt-dark")); dk.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: dur, fill: "forwards" });
      const g = gm(), cw = Math.max(g.w * 3.4, 220), cy = Math.max(26, g.top - 118);
      /* awan badai: gumpalan asap gelap */
      for (let i = 0; i < N(34); i++) { const u = rnd(-.5, .5), s = rnd(34, 62); E.p({ t: "smoke", x: g.cx + u * cw, y: cy + rnd(-18, 22) + Math.abs(u) * 14, vx: rnd(-6, 6), vy: rnd(-3, 3), m: dur / 1000, s0: s, s1: s * 1.12, c0: [46, 48, 78], c1: [30, 30, 54], a0: .9, a1: .9, env: 1 }) }
      /* hujan */
      E.emit(dur - 300, () => { const g2 = gm(); for (let i = 0; i < N(7); i++) E.p({ t: "drop", x: g2.cx + rnd(-cw * .6, cw * .6), y: cy + rnd(10, 40), vx: -70, vy: rnd(620, 900), m: rnd(.3, .5), s0: 1, s1: 1, c0: [170, 195, 255], a0: .4 }) });
    });
    const strike = k => {
      const g = gm(), cy = Math.max(26, g.top - 118) + 20, x0 = g.cx + rnd(-30, 30), x1 = g.cx + rnd(-g.w * .3, g.w * .3), y1 = g.top + rnd(2, g.h * .4);
      E.bolt(x0, cy, x1, y1, { dur: 430 }); if (k !== 1) E.bolt(x0 + rnd(-90, 90), cy, g.cx + rnd(-120, 120), g.gy, { dur: 300, w: .6 });
      E.p({ x: g.cx, y: cy, m: .35, s0: 60, s1: 150, c0: [255, 245, 170], a0: .55 });
      E.p({ x: x1, y: y1, m: .4, s0: 24, s1: 90, c0: [255, 255, 230], c1: [200, 225, 255], a0: .95 });
      sparks(x1, y1, 22, 420, [255, 255, 225], [140, 190, 255]);
      lgFlash(sc, "rgba(255,255,235,.9)", q ? .3 : .7);
      if (mineV && !q) shake(12, 9, 420, sc);
      ringAt(t.el, g.ex + (x1 - g.cx), y1 - g.top + g.ey, "wty", 3.6, 520);
      stackFx([{ filter: "brightness(5) contrast(1.6)" }, { filter: "brightness(.35)", offset: .25 }, { filter: "brightness(2.4)", offset: .45 }, { filter: "none" }], 560);
      /* listrik merambat di sisi menara */
      [-1, 1].forEach(s => E.bolt(g.cx + s * g.w * .5, g.top, g.cx + s * g.w * .5 + s * 6, g.bot, { dur: 260, w: .5, col: [180, 240, 255] }));
    };
    A.at(sp.hit, () => strike(0)); A.at(sp.hit + 450, () => strike(1)); A.at(sp.hit + 900, () => strike(2));
    A.at(500, () => { const w = wand(), g = gm(); E.bolt(w.x, w.y, g.cx, Math.max(26, g.top - 100), { dur: 650, w: .6, col: [255, 243, 120] }) });
  };

  /* ======== 5. RACUN ======== */
  const poison = () => {
    setMode("hover", "#7dff4a"); say(SP.poison.say, 1400); eff("poison");
    const sp = SP.poison, dur = sp.len;
    A.at(100, () => {
      const g = gm(), d = Math.max(g.w * 1.9, 96), r = A.add(mk(sc, "wt-ru", "left:" + (g.cx - d / 2) + "px;top:" + (g.gy - d * .16) + "px;width:" + d + "px;height:" + d + "px", "<i></i>"));
      r.animate([{ opacity: 0, transform: "scaleY(.32) scale(.3)" }, { opacity: 1, transform: "scaleY(.32) scale(1)", offset: .2 }, { opacity: 1, transform: "scaleY(.32) scale(1)", offset: .85 }, { opacity: 0, transform: "scaleY(.32) scale(1)" }], { duration: dur, fill: "forwards", easing: "ease-out" });
    });
    /* botol ramuan melengkung dari tongkat ke menara */
    A.at(350, () => {
      cast();
      const w = wand(), g = gm(), x1 = g.cx, y1 = g.top + Math.min(g.h * .2, 20), T = 900, st = performance.now();
      E.hook(T + 40, (c, el) => {
        const k = Math.min(1, el / T), e = k * k * .7 + k * .3, x = w.x + (x1 - w.x) * e, y = w.y + (y1 - w.y) * e - Math.sin(k * Math.PI) * 54, rot = k * 9;
        c.translate(x, y); c.rotate(rot);
        c.fillStyle = "rgba(190,230,180,.9)"; c.strokeStyle = "#2a5a20"; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(-3, -11); c.lineTo(3, -11); c.lineTo(3, -5); c.quadraticCurveTo(10, 0, 9, 7); c.quadraticCurveTo(8, 12, 0, 12); c.quadraticCurveTo(-8, 12, -9, 7); c.quadraticCurveTo(-10, 0, -3, -5); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = "#6bd62e"; c.beginPath(); c.moveTo(-8, 3); c.quadraticCurveTo(0, 0, 8, 3); c.quadraticCurveTo(8, 11, 0, 11); c.quadraticCurveTo(-8, 11, -8, 3); c.fill();
        c.fillStyle = "#8a5a2b"; c.fillRect(-3.5, -14, 7, 4);
        E.p({ x, y, vx: rnd(-20, 20), vy: rnd(10, 50), m: rnd(.4, .7), s0: rnd(6, 12), s1: 2, c0: [150, 255, 80], c1: [40, 150, 20], a0: .7 });
      });
    });
    A.at(sp.hit - 80, () => {
      const g = gm();
      ringAt(t.el, g.ex, g.ey + 4, "wtg", 5, 800); ringAt(t.el, g.ex, g.ey + 4, "wtg", 3, 600, 120);
      if (!q) lgFlash(sc, "rgba(120,255,60,.7)", .5);
      if (mineV && !q) shake(8, 5, 520, sc);
      /* botol pecah: cipratan hijau kental */
      E.p({ x: g.cx, y: g.top + 6, m: .35, s0: 14, s1: 100, c0: [200, 255, 150], c1: [60, 190, 30], a0: .85 });
      for (let i = 0; i < N(46); i++) { const a = rnd(-Math.PI, 0), s = rnd(80, 340); E.p({ t: "drop", x: g.cx, y: g.top + 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 700, m: rnd(.7, 1.3), s0: rnd(2, 4.2), s1: 1.4, c0: [170, 255, 110], c1: [60, 170, 30], a0: .95 }) }
      for (let i = 0; i < N(18); i++) E.p({ t: "smoke", x: g.cx + rnd(-10, 10), y: g.top + rnd(0, 20), vx: rnd(-110, 110), vy: -rnd(10, 90), drag: 1.3, m: rnd(1, 1.6), s0: 14, s1: rnd(40, 70), c0: [110, 220, 60], c1: [40, 120, 25], a0: .55 });
      t.el.classList.add("wt-poi");
      vig("wch");
      /* kabut racun bergulung menyelimuti menara */
      const fogEnd = dur - sp.hit - 500;
      E.emit(fogEnd, (dt, el) => {
        const g2 = gm(), a = Math.min(1, el / 400) * Math.min(1, (fogEnd - el) / 600);
        for (let i = 0; i < Math.round(N(3) * a + (Math.random() < a * .5 ? 1 : 0)); i++) E.p({ t: "smoke", x: g2.cx + rnd(-g2.w * .8, g2.w * .8), y: g2.top + rnd(-8, g2.h * .9), vx: rnd(-26, 26), vy: -rnd(8, 40), m: rnd(1.1, 1.9), s0: rnd(18, 30), s1: rnd(50, 84), c0: [100, 205, 50], c1: [30, 100, 20], a0: .5 * a, a1: 0 });
        if (Math.random() < .6 * a) E.p({ x: g2.cx + rnd(-g2.w * .6, g2.w * .6), y: g2.top + rnd(0, g2.h), m: rnd(.7, 1.2), s0: rnd(16, 30), s1: 4, c0: [190, 255, 120], a0: .22 });
        if (Math.random() < .55 * a) E.p({ t: "bubble", x: g2.cx + rnd(-g2.w * .6, g2.w * .6), y: g2.top + rnd(0, g2.h), vx: rnd(-14, 14), vy: -rnd(40, 100), m: rnd(.8, 1.4), s0: rnd(2.5, 6), s1: rnd(3, 8), c0: [190, 255, 140], a0: .9 });
        if (Math.random() < .45 * a) E.p({ t: "drop", x: g2.cx + rnd(-g2.w * .5, g2.w * .5), y: g2.top + rnd(0, g2.h * .4), vx: 0, vy: rnd(30, 90), ay: 520, m: .9, s0: rnd(2, 3.4), s1: 1.4, c0: [150, 255, 90], c1: [60, 170, 30], a0: .9 });
      });
    });
  };

  /* ======== jadwal ======== */
  const fns = { fire, water, bolt, poison };
  /* konteks untuk sihir tambahan (witch2.js: WT_X[id](X, sp)) */
  const X = { A, E, t, sc, W, H, lo, q, mineV, sgn, fromR, N, gm, setMode, say, cast, wand, eff, sparks, dust, explode, stackFx, vig, wi, I, TK, hex, col: () => col };
  WT_SP.forEach((sp, i) => A.at(I + sp.at, fns[sp.id] || (() => { try { if (typeof WT_X !== "undefined" && WT_X[sp.id]) WT_X[sp.id](X, sp) } catch (x) {} })));
  /* di sela jeda 2 detik, penyihir melayang diam menunggu */
  WT_SP.forEach((sp, i) => { if (i < WT_SP.length - 1) A.at(I + sp.at + sp.len, () => setMode("hover")) });
  A.at(TK + I - 900, leave);
  A.at(TK + I + 1100, () => A.end());
}

/* lantai hancur sesuai unsur sihir yang sedang menyerang (dipanggil debris() di script.js) */
function wtMelt(t, e, c, r, i, dir, cx, cy, gy) {
  const lo = !!ST.lite || (!!ST.far && !t.mine && !(t.sk && t.sk.by)), dl = i * 150, el = (t.sk && t.sk.el) || "poison", E = WT.E;
  c.style.zIndex = 7;
  const fin = kf => c.animate(kf, { duration: 1250, delay: dl, easing: "ease-in", fill: "both" }).onfinish = () => c.remove();
  /* titik tengah lantai di koordinat adegan (kanvas efek) */
  let bx = 0, by = 0, sc = null;
  if (E) { sc = $("scene"); try { const p = lgPos(sc, t.el); bx = p.x + r.x; by = p.y + r.y } catch (x) { sc = null } }
  const later = (ms, f) => setTimeout(() => { if (E && !E.dead) f() }, ms);
  if (el === "fire") {
    fin([
      { transform: "none", opacity: 1, filter: "none" },
      { transform: "scale(1.02)", filter: "sepia(1) saturate(5) hue-rotate(-25deg) brightness(1.5)", opacity: 1, offset: .2 },
      { transform: "scale(1.04,.95)", filter: "brightness(.25) sepia(.8)", opacity: 1, offset: .5 },
      { transform: "translate(" + dir * 14 + "px," + Math.min(gy * .5, 80) + "px) scale(.7,.2) rotate(" + dir * 12 + "deg)", filter: "brightness(.15)", opacity: .7, offset: .85 },
      { transform: "translate(" + dir * 20 + "px," + Math.min(gy * .55, 90) + "px) scale(.4,.02)", opacity: 0 }
    ]);
    if (E && sc) later(dl, () => E.emit(900, () => { for (let j = 0; j < (lo ? 1 : 3); j++) { E.p({ x: bx + rnd(0, r.w), y: by + rnd(0, r.h), vx: rnd(-20, 20), vy: -rnd(50, 140), m: rnd(.4, .8), s0: rnd(10, 20), s1: 3, c0: [255, 210, 90], c1: [200, 40, 0], a0: .8 }); if (Math.random() < .5) E.p({ t: "smoke", x: bx + rnd(0, r.w), y: by, vx: rnd(-20, 20), vy: -rnd(30, 70), m: 1.1, s0: 8, s1: 30, c0: [50, 42, 40], a0: .4 }) } }));
    return;
  }
  if (el === "water") {
    fin([
      { transform: "none", opacity: 1, filter: "none" },
      { transform: "translateX(" + dir * 20 + "px) rotate(" + dir * 4 + "deg)", filter: "hue-rotate(160deg) saturate(1.8) brightness(1.2)", opacity: 1, offset: .2 },
      { transform: "translate(" + dir * 120 + "px," + Math.min(gy * .2, 30) + "px) rotate(" + dir * 28 + "deg)", filter: "hue-rotate(170deg) saturate(2)", opacity: .9, offset: .65 },
      { transform: "translate(" + dir * 240 + "px," + Math.min(gy * .5, 80) + "px) rotate(" + dir * 80 + "deg) scale(.6)", filter: "hue-rotate(170deg) saturate(2)", opacity: 0 }
    ]);
    if (E && sc) later(dl, () => { for (let j = 0; j < (lo ? 8 : 22); j++) E.p({ t: "drop", x: bx + rnd(0, r.w), y: by + rnd(0, r.h), vx: dir * rnd(40, 200), vy: -rnd(40, 200), ay: 700, m: rnd(.6, 1), s0: rnd(1.6, 3), s1: 1, c0: [225, 245, 255], c1: [140, 200, 255], a0: .9 }) });
    return;
  }
  if (el === "bolt") {
    fin([
      { transform: "none", opacity: 1, filter: "brightness(4) contrast(1.4)" },
      { transform: "translate(" + dir * 3 + "px,0)", filter: "brightness(.2)", opacity: 1, offset: .12 },
      { transform: "translate(" + -dir * 4 + "px,0)", filter: "brightness(2.4)", opacity: 1, offset: .22 },
      { transform: "translate(" + dir * 30 + "px,-20px) rotate(" + dir * 14 + "deg)", filter: "brightness(.25) sepia(.6)", opacity: 1, offset: .5 },
      { transform: "translate(" + dir * 70 + "px," + Math.min(gy * .6, 100) + "px) rotate(" + dir * 90 + "deg) scale(.5)", filter: "brightness(.2)", opacity: 0 }
    ]);
    if (E && sc) later(dl, () => { for (let j = 0; j < (lo ? 6 : 16); j++) { const a = rnd(0, 6.283), s = rnd(80, 320); E.p({ t: "spark", x: bx + rnd(0, r.w), y: by + rnd(0, r.h), vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 500, drag: 1.2, m: rnd(.3, .7), s0: 2.2, s1: .4, c0: [255, 255, 225], c1: [140, 190, 255] }) } E.bolt(bx + r.w / 2, by - 20, bx + r.w / 2 + rnd(-10, 10), by + r.h, { dur: 220, w: .5 }) });
    return;
  }
  if (typeof wtMeltX === "function" && wtMeltX({ el, t, e, c, r, i, dir, cx, cy, gy, dl, lo, E, bx, by, sc, fin, later })) return;
  /* racun: meleleh hijau */
  const hue = "hue-rotate(85deg) saturate(";
  c.animate([
    { transform: "none", opacity: 1, filter: "none" },
    { transform: "scale(1.02,.98)", filter: hue + "2.4) brightness(.95)", opacity: 1, offset: .18 },
    { transform: "scale(1.04,.7) translateY(" + r.h * .18 + "px)", filter: hue + "2.6) brightness(.8)", opacity: .95, offset: .55 },
    { transform: "scale(1.18,.12) translateY(" + Math.min(gy * .4, 60) + "px)", filter: hue + "2.8) brightness(.7)", opacity: .8, offset: .88 },
    { transform: "scale(1.3,.02) translateY(" + Math.min(gy * .45, 70) + "px)", filter: hue + "2.8) brightness(.6)", opacity: 0 }
  ], { duration: 1250, delay: dl, easing: "ease-in", fill: "both" }).onfinish = () => c.remove();
  if (E && sc) later(dl + 150, () => E.emit(1000, () => { for (let j = 0; j < (lo ? 1 : 2); j++) { E.p({ t: "drop", x: bx + rnd(0, r.w), y: by + r.h * .6, vx: 0, vy: rnd(20, 90), ay: 600, m: rnd(.7, 1.1), s0: rnd(2.2, 4), s1: 1.4, c0: [160, 255, 100], c1: [60, 170, 30], a0: .95 }); if (Math.random() < .4) E.p({ t: "bubble", x: bx + rnd(0, r.w), y: by + r.h * .5, vy: -rnd(30, 70), m: 1, s0: rnd(2, 5), s1: rnd(3, 7), c0: [190, 255, 140], a0: .9 }) } }));
}

/* ============================ PRATINJAU (Cara Main) ============================ */
function wtDemo(att, vic, d, SC) {
  const t = dws[vic.id]; if (!t) return;
  const dm = mk(SC, "wtdm", "", '<div class="wtst"><div class="wtrn"><i></i><i></i><i></i></div><div class="wtcl">' + WT_CLOCK + '</div><div class="wtwz">' + WT_SVG + "</div></div>");
  SC.classList.add("wtgs");
  const wz = dm.querySelector(".wtwz"); if (wz) wz.style.setProperty("--wc", "#c9a4ff");
  wtClockAnim(dm);
  dm.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: 2700 }).onfinish = () => { dm.remove(); SC.classList.remove("wtgs") };
  try { SFX.wtStop() } catch (x) {}
  wtT(() => {
    const tt = dws[vic.id]; if (!tt) return;
    tt.sk = { k: K_WT, at: performance.now(), dur: IMP[K_WT] + WT_TOT + 1700 };
    try { SFX.skill("witch", { I: IMP[K_WT], demo: true, mine: false, far: false, pan: 0 }) } catch (x) {}
    WT_SP.forEach(sp => wtT(() => { try { SFX.wtSp(sp.id, { demo: true }) } catch (x) {} }, IMP[K_WT] + sp.at));
    wtFx({ sc: SC, M: dws, vic: vic.id, att: att.id, attName: att.name, vicName: vic.name, mine: false, blk: false, demo: true });
    WT_SP.forEach(sp => { if (sp.dmg) wtT(() => { const x = dws[vic.id]; vic.floors = Math.max(0, Math.min(vic.floors, x ? x.n : vic.floors) - sp.dmg); tower(vic, dws, d) }, IMP[K_WT] + sp.at + sp.hit) });
  }, 2200);
}

/* dipanggil lgStop(): reset game, game selesai, atau pratinjau ditutup */
function wtStop(q) {
  WT.tm.forEach(clearTimeout); WT.tm.clear();
  WT.iv.forEach(clearInterval); WT.iv.clear();
  clearTimeout(WT.rel); const had = WT.rel; WT.rel = 0;
  [...WT.act].forEach(a => a.end());
  if (WT.on) wtFreeze(false, 0, 0, true);
  if (had && me.wts) push({ wts: 0 });
  if (typeof wtXStop === "function") wtXStop();
  const pn = document.getElementById("pnl"); if (pn) pn.classList.remove("wt-stonep");
  document.querySelectorAll(".wtov,.wtdm").forEach(x => x.remove());
  document.querySelectorAll(".wtgs").forEach(x => x.classList.remove("wtgs"));
}