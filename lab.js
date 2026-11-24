/* ===== MODE COBA SKILL (lab.js) =====
   File terpisah, script.js tidak diubah. Muat PALING AKHIR di index.html (setelah perf.js).

   Cara kerja: Latihan Solo + satu "Bot Latihan" yang diam (tidak mengetik dan tidak memakai skill sendiri).
   - Aku serang   : skill dilepas lewat use(k) asli game, jadi animasi, suara, dan perisai sama persis seperti saat main.
   - Musuh serang : bot melepas skill lewat jalur yang sama dengan bot sungguhan (atk -> hits -> play/hit),
                    jadi kamu merasakan sudut pandang korban.
   Tidak ada kartu pilih skill dan tidak ada pemenang: semua skill ada di panel LAB SKILL. */
(function () {
  const LAB = { on: false, dir: "me", auto: true, seq: 0, iv: 0 };
  const BOT_FL = 10, ME_FL = 12;
  const held = () => (typeof wtHold === "function" && wtHold()) || (typeof zsHold === "function" && zsHold());
  const labBot = () => ({ id: "botlab", name: "Bot Latihan", av: 3, lv: 1, ready: true, floors: BOT_FL, fin: 0, lastAt: 0, atk: null, sh: 0, bf: 0, cb: 0, i: 0, jt: Date.now() + 1 });
  const HINT = {
    me: "Kamu melepas skill. Serangan mengenai Bot Latihan, skill bantu aktif di menaramu.",
    foe: "Bot Latihan melepas skill. Serangan mengenai kamu (sudut pandang korban), skill bantu aktif di menara bot."
  };

  /* ---------- masuk dari menu ---------- */
  $("bLab").onclick = async () => {
    if (!(me.name || "").trim()) { $("err").textContent = "Buat akun dulu ya."; return }
    LAB.on = true; document.body.classList.add("lab");
    await enter(mkCode(), true, true);
    if (scr !== "lobby") { LAB.on = false; document.body.classList.remove("lab"); return }
    labPrep();
  };

  function labPrep() {
    BOTS.length = 0; BOTS.push(labBot());
    push({ cfg: { ...DEF, m: "time", t: 3600, d: 1, s: 0, bl: 1, mp: (me.cfg && me.cfg.mp) | 0 }, bots: botCopy() });
    /* di lobi hanya Map yang relevan */
    document.querySelectorAll(".cfg .cr").forEach(r => {
      const sg = r.querySelector(".seg"), k = sg && sg.dataset.k;
      r.classList.toggle("labhide", ["m", "d", "s", "t", "bl"].includes(k));
    });
    lastSig = ""; sync(); labTxt();
  }
  function labTxt() { $("lmsg").textContent = "Coba Skill: pilih map, lalu MULAI. Di dalam game buka panel LAB SKILL untuk menembak skill atau jadi korbannya." }

  /* ---------- bungkus fungsi game (hanya aktif saat LAB.on) ---------- */
  const _dl = drawLobby;
  drawLobby = function (ps) { _dl.apply(this, arguments); if (LAB.on) labTxt() };

  const _launch = launch;
  launch = function () { _launch.apply(this, arguments); if (LAB.on) { G.sk = false; $("skm").classList.add("hide"); labBuild() } };

  /* bot latihan diam: tidak ada botGo, tapi botsOn tetap true supaya skill area (Lubang Hitam, Akar) tetap menguras lantainya */
  const _sb = startBots;
  startBots = function () {
    if (!LAB.on) return _sb.apply(this, arguments);
    botsOn = true;
    BOTS.forEach(b => Object.assign(b, { i: 0, cb: 0, fz: 0, tb: 0, lk: 0, dg: 0, bt: 0, btn: 0, sh: 0, bf: 0, dis: 0, atk: null, floors: BOT_FL }));
    pubBots();
  };

  const _begin = begin;
  begin = function () { _begin.apply(this, arguments); if (LAB.on) labBegin() };

  function labBegin() {
    labOpen(innerWidth >= 900);
    clearInterval(LAB.iv);
    /* isi ulang lantai otomatis supaya efek serangan selalu terlihat */
    LAB.iv = setInterval(() => {
      if (!LAB.on || !LAB.auto || !started || over || ended) return;
      if (fc < 3) { fc = ME_FL; push({ floors: fc }); stat(); drawWord() }
      const b = BOTS[0]; if (b && b.floors < 3) { b.floors = BOT_FL; pubBots() }
    }, 1500);
    popup("Buka panel LAB SKILL");
  }

  /* ---------- panel ---------- */
  function labBuild() {
    if ($("labP")) return;
    const g = $("s-game");
    const rows = t => SK.map((s, k) => ({ s, k })).filter(o => (o.s.t === "a") === (t === "a"))
      .sort((a, b) => b.s.r - a.s.r || a.k - b.k)
      .map(({ s, k }) => `<button class="labt r${s.r}" data-k="${k}" type="button" title="${esc(s.ds)}"><i style="--i:${k}">${s.ic}</i><span><b>${esc(s.n)}</b><small>${esc(s.ds)}</small></span><u>${SK_RAR[s.r]}</u></button>`).join("");
    const fab = document.createElement("button");
    fab.id = "labFab"; fab.className = "labfab hide"; fab.type = "button"; fab.innerHTML = "<i>🧪</i><b>LAB SKILL</b>";
    const p = document.createElement("aside");
    p.id = "labP"; p.className = "labp hide"; p.setAttribute("aria-label", "Lab Skill");
    p.innerHTML =
      '<header><b>LAB SKILL</b><button type="button" class="labx" id="labX" aria-label="Tutup panel">✕</button></header>' +
      '<div class="labdir" id="labDir"><button type="button" data-d="me" class="on">Aku serang</button><button type="button" data-d="foe">Musuh serang aku</button></div>' +
      '<p class="labh" id="labH">' + HINT.me + "</p>" +
      '<div class="labg" id="labG"><h5>Serangan</h5>' + rows("a") + "<h5>Bantu</h5>" + rows("s") + "</div>" +
      '<footer><button type="button" id="labFill">Isi lantai</button><button type="button" id="labClr">Bersihkan efek</button><button type="button" class="labsw on" id="labAuto" role="switch" aria-checked="true">Isi otomatis</button></footer>';
    g.appendChild(fab); g.appendChild(p);

    fab.onclick = () => labOpen(true);
    $("labX").onclick = () => labOpen(false);
    p.addEventListener("mousedown", e => { if (e.target.closest("button")) e.preventDefault() }); /* jaga fokus ke kotak ketik */
    $("labDir").onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      LAB.dir = b.dataset.d;
      document.querySelectorAll("#labDir button").forEach(x => x.classList.toggle("on", x === b));
      $("labH").textContent = HINT[LAB.dir];
      p.classList.toggle("foe", LAB.dir === "foe");
    };
    $("labG").onclick = e => {
      const b = e.target.closest(".labt"); if (!b) return;
      b.classList.remove("fire"); void b.offsetWidth; b.classList.add("fire");
      labFire(+b.dataset.k);
      if (started && !over) $("typ").focus();
    };
    $("labFill").onclick = () => { labFill(); if (started && !over) $("typ").focus() };
    $("labClr").onclick = () => { labClear(); if (started && !over) $("typ").focus() };
    $("labAuto").onclick = e => { LAB.auto = !LAB.auto; e.currentTarget.classList.toggle("on", LAB.auto); e.currentTarget.setAttribute("aria-checked", LAB.auto) };
  }
  function labOpen(on) { const p = $("labP"), f = $("labFab"); if (!p) return; p.classList.toggle("hide", !on); f.classList.toggle("hide", on) }

  /* ---------- tembak skill ---------- */
  function labFire(k) {
    if (!started || over || ended) { popup("Tunggu game mulai dulu"); return }
    if (held() && !(typeof WT !== "undefined" && WT.own)) { popup("Tunggu efek yang sedang berjalan"); return }
    if (LAB.dir === "me") labMine(k); else labFoe(k);
  }

  /* kamu yang memakai skill: jalur asli game */
  function labMine(k) {
    const s = SK[k], b = BOTS[0];
    if (s.t === "a" && b && b.floors < 3) { b.floors = BOT_FL; pubBots() }
    SFX.choose(); use(k);
  }

  /* bot yang memakai skill, meniru botSkill() supaya kamu jadi korbannya */
  function labFoe(k) {
    const b = BOTS[0], s = SK[k], now = Date.now(); if (!b) return;
    if (s.t === "a" && fc < 3) { fc = ME_FL; push({ floors: fc }); stat(); drawWord() }
    const id = b.id + now + "." + (++LAB.seq); let at;
    if (s.zs) { labZeusFoe(b, k, now, id); return }
    if (s.t === "a") {
      at = { s: id, k, to: s.ar ? "*" : me.id, n: s.d, b: (me.sh || me.dg > now) ? 1 : 0 };
    } else {
      at = { s: id, k, to: b.id, n: 0 };
      if (s.id === "shield") b.sh = 1;
      else if (k === K_TB) b.tb = now + TB_MS;
      else if (k === K_LK) b.lk = LK_N;
      else if (k === K_BET) { b.bt = 1; b.btn = 0 }
      else if (k === K_DRG) { b.dg = now + DRG_MS; b.fz = 0; b.dis = 0 }
      else b.bf = BUF;
    }
    b.atk = at;
    try { pubBots() } catch (e) { console.warn("[lab] skill musuh gagal:", s.id, e); popup("Skill ini belum bisa diuji dari sisi musuh") }
    /* Last Bet milik bot biasanya selesai saat bot mengetik; di lab diselesaikan otomatis (menang) */
    if (k === K_BET) setTimeout(() => {
      if (!LAB.on || ended || !b.bt) return;
      b.bt = 0; b.btn = 0; b.floors += BET_UP; lgBotBet(b, 1);
    }, 3800);
  }

  /* Zeus milik bot: panggilan asli (z.o="call"), lalu bot menembakkan Thunderbolt dan Thunderstorm ke menaramu */
  function labZeusFoe(b, k, now, id) {
    if (typeof zsBusy === "function" && zsBusy()) { popup("Zeus masih turun, tunggu selesai"); return }
    if (fc < 6) { fc = ME_FL; push({ floors: fc }); stat(); drawWord() }
    b.dg = now + 25000; b.zp = { x: .5, f: 1 };
    b.atk = { s: id, k, to: "*", n: 0, b: 0, z: { o: "call", t: now } };
    try { pubBots() } catch (e) { console.warn("[lab] Zeus musuh gagal:", e); popup("Zeus musuh gagal, cek console"); return }
    const cast = (ms, c) => setTimeout(() => {
      if (!LAB.on || ended || !(typeof zsBusy === "function" && zsBusy())) return;
      const t = tws[me.id], sc = $("scene"); if (!t || !sc) return;
      const r = t.el.getBoundingClientRect(), s0 = sc.getBoundingClientRect(), t2 = Date.now();
      const z = c === "b"
        ? { o: "cast", c, ax: (r.left + r.width / 2 - s0.left) / s0.width, ay: (r.top - s0.top) / s0.height, tg: me.id, t: t2, h: [[me.id, 3, 520, 0]], hs: null, ar: 0 }
        : { o: "cast", c, ax: (r.left + r.width / 2 - s0.left) / s0.width, ay: (r.top - s0.top) / s0.height, tg: me.id, t: t2, h: [0, 1, 2, 3, 4, 5].map(i => [me.id, 2, 760 + i * 190, i]), hs: null, ar: .26 };
      b.atk = { s: b.id + t2 + c, k, to: "*", n: 0, b: 0, z };
      try { pubBots() } catch (e) { console.warn("[lab] cast Zeus gagal:", e) }
    }, ms);
    cast(5200, "b"); cast(8200, "a"); cast(14500, "b");
  }

  /* ---------- alat bantu ---------- */
  function labFill() {
    fc = Math.max(fc, ME_FL); push({ floors: fc }); stat(); drawWord();
    const b = BOTS[0]; if (b) { b.floors = Math.max(b.floors, BOT_FL); pubBots() }
    sync();
  }
  function labClear() {
    try { frzEnd(true) } catch (e) { }
    dz = null; lkC = 0; tbEnd = 0; ck = 0; try { tbcRm() } catch (e) { }
    try { lgStop(true) } catch (e) { }
    for (const k in tws) { const t = tws[k]; try { lkEnd(t, true); tbStop(t, true); if (t.shd) shieldBreak(t, true) } catch (e) { } }
    push({ sh: 0, bf: 0, lk: 0, dg: 0, bt: 0, btn: 0, atk: null });
    BOTS.forEach(b => Object.assign(b, { sh: 0, bf: 0, fz: 0, dis: 0, tb: 0, lk: 0, dg: 0, bt: 0, btn: 0, atk: null }));
    pubBots(); stat(); drawWord();
  }
})();