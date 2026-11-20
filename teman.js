/* teman.js: sistem pertemanan Typing Tower.
   - Tambah teman lewat nama login, terima/tolak permintaan, hapus teman.
   - Lihat status teman (Offline / Online / Di lobi / Sedang main), Ikuti ke lobi teman tanpa kode.
   - Undang teman dari lobi (atau dari menu: room dibuat otomatis), teman dapat notifikasi Gabung/Tolak.
   - Ketuk pemain di lobi untuk melihat profilnya dan menambah sebagai teman.
   Butuh Firebase aktif (firebase-config.js) dan akun online. Data lewat Realtime Database (REST), aturan ada di firebase-rules.json.
   Memakai dari script.js: me, room, solo, scr, code, enter, leave, peersNow, COL, ab, esc, SFX. Dimuat setelah akun.js. */
(function () {
  const T = window.ttAcc;
  if (!T || !T.on) return;

  const g = id => document.getElementById(id), DB = T.db, ROOM = /^[A-Z]{4}$/;
  const enc = l => String(l).toLowerCase().replace(/\./g, ",");
  const U = () => { const a = T.a(); return (a && a.uid) || "" };

  let started = false, FL = [], F = {}, FT = {}, pres = {}, reqs = {}, invs = {}, sent = {}, shown = {};
  let pend = [], view = "list", cur = "", lastSig = "", lastW = 0, timer = 0;

  /* ---------- server ---------- */
  async function api(path, method, body) {
    const t = await T.tok();
    const r = await fetch(DB + "/" + path + ".json?auth=" + encodeURIComponent(t), {
      method: method || "GET",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!r.ok) throw new Error("E" + r.status);
    return r.json();
  }

  /* ---------- status saya (presence) ---------- */
  function mine() {
    let s = "m", r = "", n = 0;
    try {
      if (room && !solo) {
        r = code; n = peersNow().length;
        s = scr === "lobby" ? "l" : (scr === "game" || scr === "res") ? "g" : "m";
      }
    } catch (e) {}
    return { s, r: s === "m" ? "" : r, n, o: Date.now() };
  }
  async function beat(force) {
    const u = U(); if (!u) return;
    const m = mine(), sig = m.s + m.r + m.n;
    if (!force && sig === lastSig && Date.now() - lastW < 15000) return;
    lastSig = sig; lastW = Date.now();
    try { await api("presence/" + u, "PUT", m) } catch (e) {}
  }
  addEventListener("pagehide", () => {
    const u = U(), t = T.cur();
    if (!u || !t) return;
    try { fetch(DB + "/presence/" + u + ".json?auth=" + encodeURIComponent(t), { method: "PUT", keepalive: true, body: JSON.stringify({ s: "m", r: "", n: 0, o: 0 }) }) } catch (e) {}
  });

  /* status teman */
  function FST(f) {
    const p = pres[f];
    if (!p || Date.now() - (+p.o || 0) > 50000) return { k: "off", t: "Offline" };
    if (p.s === "l" && ROOM.test(p.r || "")) return { k: "lob", t: "Di lobi · " + p.r, r: p.r, full: (p.n | 0) >= 6 };
    if (p.s === "g") return { k: "gm", t: "Sedang main" };
    return { k: "on", t: "Online" };
  }
  const ORD = { lob: 0, on: 1, gm: 2, off: 3 };
  const inLobby = () => { try { return !!room && !solo && scr === "lobby" } catch (e) { return false } };
  const inMyRoom = f => { try { if (!room || solo) return false; const t = FST(f); if (t.r && t.r === code) return true; return peersNow().some(p => p.uid === f) } catch (e) { return false } };
  const canInv = () => { try { return scr === "menu" || inLobby() } catch (e) { return false } };
  const isOpen = () => { const d = g("frDock"); return !!(d && d.classList.contains("open") && d.offsetWidth > 0) };

  /* ---------- aksi pertemanan ---------- */
  async function accept(f) {
    const u = U();
    await api("friends/" + u + "/" + f, "PUT", true);
    await api("friends/" + f + "/" + u, "PUT", true);
    await api("freq/" + u + "/" + f, "DELETE");
    delete reqs[f]; if (!FL.includes(f)) FL.push(f);
    try { SFX.ready(true) } catch (e) {}
  }
  async function decline(f) { await api("freq/" + U() + "/" + f, "DELETE"); delete reqs[f] }
  async function unfriend(f) {
    const u = U();
    await api("friends/" + u + "/" + f, "DELETE");
    try { await api("friends/" + f + "/" + u, "DELETE") } catch (e) {}
    FL = FL.filter(x => x !== f); delete pres[f];
  }
  async function sendReq(f) {
    const a = T.a(), u = U();
    if (f === u) throw "Itu akunmu sendiri 😄";
    if (FL.includes(f)) throw "Kalian sudah berteman.";
    if (reqs[f]) { await accept(f); return "ok" }
    await api("freq/" + f + "/" + u, "PUT", { u: a.u, t: Date.now() });
    sent[f] = 1; return "sent";
  }
  async function invite(f, c) {
    const a = T.a();
    await api("inv/" + f + "/" + U(), "PUT", { n: a.u, c, t: Date.now() });
  }
  function flush() {
    const now = Date.now(), list = pend.filter(x => now - x.t < 30000);
    pend = [];
    if (!ROOM.test(code || "")) return;
    list.forEach(x => invite(x.f, code).catch(() => {}));
  }

  /* gabung ke room: dari menu langsung, selain itu muat ulang lalu otomatis masuk */
  function joinCode(c) {
    if (!ROOM.test(c)) return;
    try { window.closeModal && closeModal() } catch (e) {}
    if (innerWidth < 1400) setDock(false);
    let free = false;
    try { free = !room && scr === "menu" } catch (e) {}
    if (free) { enter(c, false, false); return }
    try { sessionStorage.setItem("ttJoin", c) } catch (e) {}
    leave();
  }

  /* ---------- poll ---------- */
  async function loadOne(k) { try { F[k] = await api("users/" + k); FT[k] = Date.now() } catch (e) {} }
  async function poll() {
    const u = U(); if (!u || document.hidden) return;
    const open = isOpen();
    try {
      const [rq, iv, fl] = await Promise.all([api("freq/" + u), api("inv/" + u), api("friends/" + u)]);
      reqs = rq || {}; invs = iv || {}; FL = Object.keys(fl || {}).filter(k => fl[k] === true);
      if (open) {
        const ids = [...new Set(FL.concat(Object.keys(reqs)).concat(cur ? [cur] : []))];
        await Promise.all(ids.filter(k => !F[k] || Date.now() - (FT[k] || 0) > 30000).map(loadOne));
        await Promise.all(FL.map(async k => { try { pres[k] = await api("presence/" + k) } catch (e) { pres[k] = null } }));
      }
    } catch (e) {}
    notify(); badge();
    if (open) render();
  }
  function loop() { poll().finally(() => { timer = setTimeout(loop, isOpen() ? 3000 : 6000) }) }
  /* streaming Firebase: undangan, permintaan, dan daftar teman masuk seketika */
  let ES = [], stT = 0, pt = 0, rsig = "";
  async function stream() {
    ES.forEach(x => { try { x.close() } catch (e) {} }); ES = []; clearTimeout(stT);
    const u = U(); if (!u || !window.EventSource) return;
    let t; try { t = await T.tok() } catch (e) { stT = setTimeout(stream, 5000); return }
    ["inv", "freq", "friends"].forEach(p => {
      const es = new EventSource(DB + "/" + p + "/" + u + ".json?auth=" + encodeURIComponent(t));
      const ping = () => { clearTimeout(pt); pt = setTimeout(poll, 100) };
      es.addEventListener("put", ping); es.addEventListener("patch", ping);
      es.addEventListener("auth_revoked", () => stream());
      es.onerror = () => { if (es.readyState === 2) { clearTimeout(stT); stT = setTimeout(stream, 3000) } };
      ES.push(es);
    });
  }
  /* daftar teman ikut berubah saat ada yang masuk/keluar lobimu */
  function roomWatch() {
    if (!room || !isOpen()) return;
    let k = ""; try { k = peersNow().map(p => p.uid || p.id).join(",") + code } catch (e) {}
    if (k !== rsig) { rsig = k; render() }
  }
  function kick() { clearTimeout(timer); loop() }

  /* ---------- notifikasi ---------- */
  function toast(html, btns, ms) {
    const box = g("ttToast"); if (!box) return;
    const d = document.createElement("div");
    d.className = "ttT"; d.innerHTML = '<div class="tx">' + html + '</div><div class="tr"></div>';
    btns.forEach(([l, cls, fn]) => {
      const b = document.createElement("button");
      b.className = "tfb " + cls; b.textContent = l;
      b.onclick = () => { d.remove(); fn() };
      d.lastChild.appendChild(b);
    });
    box.appendChild(d);
    try { SFX.join() } catch (e) {}
    if (ms) setTimeout(() => d.remove(), ms);
  }
  function notify() {
    const u = U(), now = Date.now();
    Object.keys(invs).forEach(f => {
      const v = invs[f];
      if (!v || !ROOM.test(v.c || "") || now - (+v.t || 0) > 300000) { api("inv/" + u + "/" + f, "DELETE").catch(() => {}); delete invs[f]; return }
      const k = "i" + f + v.t; if (shown[k]) return; shown[k] = 1;
      toast("<b>" + esc(v.n || "Temanmu") + "</b> mengajakmu main! Room <b>" + esc(v.c) + "</b>", [
        ["Tolak", "", () => { api("inv/" + u + "/" + f, "DELETE").catch(() => {}) }],
        ["Gabung", "go", () => { api("inv/" + u + "/" + f, "DELETE").catch(() => {}); joinCode(v.c) }]
      ], 60000);
    });
    Object.keys(reqs).forEach(f => {
      const v = reqs[f], k = "r" + f + (v && v.t); if (!v || shown[k]) return; shown[k] = 1;
      toast("<b>" + esc(v.u || "Seseorang") + "</b> ingin berteman denganmu", [
        ["Abaikan", "", () => { decline(f).then(badge).catch(() => {}) }],
        ["Terima", "go", () => { accept(f).then(() => { badge(); render() }).catch(() => {}) }]
      ], 60000);
    });
  }
  function badge() {
    const n = Object.keys(reqs).length, b = document.querySelector("#frTab .frb");
    if (!b) return; b.textContent = n; b.style.display = n ? "" : "none";
  }

  /* ---------- tampilan: dock teman di sisi kanan ---------- */
  let dockOpen = innerWidth >= 1400, resUid = "";
  const msg = (t, k) => { const m = g("frMsg"); m.textContent = t || ""; m.className = "frm" + (t ? " " + (k || "bad") : "") };
  const kfor = f => FST(f).k;
  function tw(c) { let h = ""; for (let i = 0; i < 6; i++) h += "<i></i>"; return '<div class="frtw" style="--c:' + c + '">' + h + '<u></u></div>' }

  function setDock(v) {
    dockOpen = !!v;
    const d = g("frDock"); if (!d) return;
    d.classList.toggle("open", dockOpen);
    document.body.classList.toggle("frOpen", dockOpen);
    if (dockOpen) { render(); kick() }
  }

  function rowF(f) {
    const p = F[f] || { u: "…", a: 0 }, s = FST(f), here = inMyRoom(f);
    let b = "";
    if (here) b = '<span class="frhere">✓ Di lobi</span>';
    else if (s.k === "lob") b = '<button class="frgo" data-a="go" title="Ikuti ke lobi"' + (s.full ? " disabled" : "") + ">" + (s.full ? "Penuh" : "Ikuti") + "</button>";
    else if (s.k === "on" && canInv()) b = '<button class="frpl" data-a="inv" title="Undang">＋</button>';
    return '<div class="frr ' + s.k + '" data-f="' + esc(f) + '"><div class="fra">' + ab({ name: p.u, av: p.a | 0 }, 40) + '<u class="tfd ' + s.k + '"></u></div>' +
      '<div class="fri"><b>' + esc(p.u) + "</b><span>" + (here ? "Sudah ada di lobimu" : esc(s.t)) + "</span></div>" + b + "</div>";
  }
  function rowR(f) {
    const v = reqs[f] || {}, p = F[f] || { u: v.u || "…", a: 0 };
    return '<div class="frr" data-f="' + esc(f) + '"><div class="fra">' + ab({ name: p.u, av: p.a | 0 }, 40) + "</div>" +
      '<div class="fri"><b>' + esc(p.u) + "</b><span>Ingin berteman</span></div>" +
      '<button class="frpl" data-a="ok" title="Terima">✓</button><button class="frno" data-a="no" title="Tolak">✕</button></div>';
  }

  function render() {
    const D = g("frDock"); if (!D) return;
    const on = !!U(), body = g("frBody");
    g("frOnl").textContent = on ? FL.filter(f => kfor(f) !== "off").length + " online" : "";
    g("frAddB").style.display = on ? "" : "none";
    if (!on) { body.innerHTML = '<p class="frE">Fitur teman butuh akun online. Buka Profil, lalu pilih <b>Amankan akun</b>.</p>'; return }
    if (view === "prof") { drawProf(); return }
    const rq = Object.keys(reqs);
    const fl = FL.slice().sort((a, b) => ORD[kfor(a)] - ORD[kfor(b)] || String(F[a] && F[a].u).localeCompare(String(F[b] && F[b].u)));
    let h = "";
    if (rq.length) h += '<h4 class="frH">Permintaan (' + rq.length + ")</h4>" + rq.map(rowR).join("");
    h += fl.length ? fl.map(rowF).join("") : '<p class="frE">Belum ada teman.<br>Ketuk <b>＋</b> di atas untuk menambahkan lewat nama login.</p>';
    body.innerHTML = h;
  }

  function drawProf() {
    const f = cur, p = F[f], box = g("frBody");
    if (!p) { box.innerHTML = '<button class="frbk" data-a="bk">‹ Kembali</button><p class="frE">Memuat profil…</p>'; return }
    const isF = FL.includes(f), mine_ = f === U(), s = isF ? FST(f) : null, c = COL[(p.a | 0) % 6];
    const here = !!(s && inMyRoom(f));
    let d = ""; try { d = new Date(p.t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) } catch (e) {}
    let act = "";
    if (mine_) act = '<p class="frE">Ini profilmu.</p>';
    else if (isF) {
      if (s.k === "lob" && !here) act += '<button class="frB g" data-a="go"' + (s.full ? " disabled" : "") + ">" + (s.full ? "Lobi penuh" : inLobby() ? "Pindah ke lobi " + esc(s.r) : "Ikuti ke lobi " + esc(s.r)) + "</button>";
      if (here) act += '<p class="frE ok">✓ Sudah ada di lobimu</p>';
      else if (s.k === "on" && canInv()) act += '<button class="frB b" data-a="inv">＋ Undang ke room</button>';
      act += '<button class="frdel" data-a="del" data-sure="">Hapus dari teman</button>';
    } else if (reqs[f]) act = '<button class="frB g" data-a="ok">Terima permintaan</button>';
    else if (sent[f]) act = '<p class="frE">Permintaan pertemanan terkirim ✓</p>';
    else act = '<button class="frB g" data-a="add">Tambah teman</button>';
    box.innerHTML = '<button class="frbk" data-a="bk">‹ Kembali</button><div class="frp">' + tw(c) +
      '<div class="frpa">' + ab({ name: p.u, av: p.a | 0 }, 64) + "</div><b class=\"frpn\">" + esc(p.u) + "</b>" +
      (s ? '<span class="frps"><u class="tfd ' + s.k + '"></u> ' + esc(here ? "Sudah ada di lobimu" : s.t) + "</span>" : "") +
      "<small>" + (d ? "Bergabung " + d : "") + "</small>" +
      '<div class="frst"><div><b>' + (p.g | 0) + "</b><small>Main</small></div><div><b>" + (p.w | 0) + "</b><small>Menang</small></div><div><b>" + (p.b | 0) + "</b><small>WPM terbaik</small></div></div>" +
      '<div class="fract">' + act + '</div><p class="frm" id="frPm"></p></div>';
  }

  function showProfile(f) {
    if (!f) return;
    cur = f; view = "prof"; setDock(true); render(); loadOne(f).then(render);
  }

  /* ---------- pasang ---------- */
  function build() {
    if (!g("frDock")) {
      const d = document.createElement("aside");
      d.id = "frDock"; d.setAttribute("aria-label", "Teman");
      d.innerHTML =
        '<button id="frTab" type="button" aria-label="Buka atau tutup teman"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13c-3.3 0-7 1.7-7 4.5V20h14v-2.5C16 14.7 12.3 13 9 13zm8 0c-.6 0-1.2.1-1.8.2 1.7 1.1 2.8 2.7 2.8 4.8V20h5v-2.5c0-2.4-3.2-4.5-6-4.5z"/></svg><em class="frb" style="display:none">0</em></button>' +
        '<header class="frhd"><b>Teman</b><span id="frOnl"></span><button class="frib" id="frAddB" type="button" aria-label="Cari teman">＋</button></header>' +
        '<div class="fradd frh" id="frAddRow"><input id="frNm" maxlength="12" placeholder="Nama login teman" autocomplete="off" autocapitalize="none" spellcheck="false"><button id="frAdd" type="button">Cari</button></div>' +
        '<div id="frRes"></div><p class="frm" id="frMsg"></p><div class="frbody" id="frBody"></div>';
      document.body.appendChild(d);

      g("frTab").onclick = () => setDock(!dockOpen);
      g("frAddB").onclick = () => {
        const r = g("frAddRow"); r.classList.toggle("frh");
        const o = !r.classList.contains("frh");
        g("frAddB").classList.toggle("on", o);
        if (o) { view = "list"; render(); g("frNm").focus() } else { g("frNm").value = ""; msg(""); resUid = ""; g("frRes").innerHTML = "" }
      };
      g("frAdd").onclick = addByName;
      g("frNm").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); addByName() } };
      g("frNm").addEventListener("input", () => { msg(""); resUid = ""; g("frRes").innerHTML = "" });

      d.addEventListener("click", async e => {
        const b = e.target.closest("[data-a]"), w = e.target.closest(".frr");
        const f = (w && w.dataset.f) || cur;
        if (!b) { if (w && w.dataset.f) { cur = w.dataset.f; view = "prof"; render(); loadOne(cur).then(render) } return }
        const a = b.dataset.a;
        try {
          if (a === "bk") { view = "list"; render() }
          else if (a === "go") { const st = FST(f); if (st.r) joinCode(st.r) }
          else if (a === "inv") {
            if (inLobby()) { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); await invite(f, code) }
            else { pend = [{ f, t: Date.now() }]; if (innerWidth < 1400) setDock(false); g("bMk").click() }
          }
          else if (a === "ok") { await accept(f); badge(); render() }
          else if (a === "no") { await decline(f); badge(); render() }
          else if (a === "add") { await sendReq(f); badge(); render() }
          else if (a === "radd") { b.disabled = true; b.textContent = "Mengirim…"; await sendReq(resUid); badge(); drawRes(); render(); kick() }
          else if (a === "rok") { b.disabled = true; await accept(resUid); badge(); drawRes(); render() }
          else if (a === "del") {
            if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Yakin? Ketuk lagi untuk menghapus"; return }
            await unfriend(f); view = "list"; render();
          }
        } catch (x) {
          const t = typeof x === "string" ? x : "Gagal, coba lagi sebentar lagi.";
          if (g("frPm")) { g("frPm").textContent = t; g("frPm").className = "frm bad" } else msg(t);
        }
      });
    }
    if (!g("ttToast")) { const t = document.createElement("div"); t.id = "ttToast"; document.body.appendChild(t) }
    /* ketuk pemain di lobi = lihat profil */
    const sl = g("slots");
    if (sl) sl.addEventListener("click", e => {
      const s = e.target.closest(".slot.hasu");
      if (!s || e.target.closest(".bx")) return;
      showProfile(s.dataset.uid);
    });
    setDock(dockOpen);
  }

  function drawRes() {
    const box = g("frRes"), f = resUid, p = F[f];
    if (!f || !p) { box.innerHTML = ""; return }
    const me_ = f === U(), isF = FL.includes(f);
    let act;
    if (me_) act = '<span class="frtag">Ini kamu</span>';
    else if (isF) act = '<span class="frtag ok">✓ Sudah berteman</span>';
    else if (reqs[f]) act = '<button class="frB g" data-a="rok">Terima permintaan</button>';
    else if (sent[f]) act = '<span class="frtag ok">✓ Permintaan terkirim</span>';
    else act = '<button class="frB g" data-a="radd">＋ Tambah teman</button>';
    box.innerHTML = '<div class="frres"><div class="frrt">' + ab({ name: p.u, av: p.a | 0 }, 48) +
      '<div class="fri"><b>' + esc(p.u) + "</b><span>@" + esc(p.l || "") + " · " + (p.w | 0) + " menang · " + (p.b | 0) + " WPM</span></div></div>" + act + "</div>";
  }

  async function addByName() {
    const n = g("frNm").value.trim(), btn = g("frAdd"), a = T.a();
    resUid = ""; g("frRes").innerHTML = "";
    if (!/^[A-Za-z0-9_.]{2,12}$/.test(n)) { msg("Nama login: 2 sampai 12 karakter, huruf/angka/_/titik."); return }
    btn.disabled = true; btn.textContent = "Mencari…"; msg("");
    try {
      const f = await api("names/" + enc(n));
      if (!f) { msg("Tidak ada pemain dengan nama login “" + n + "”. Cek ejaannya."); return }
      await loadOne(f);
      if (!F[f]) { msg("Profil pemain gagal dimuat. Coba lagi."); return }
      resUid = f; drawRes();
    } catch (x) { msg("Gagal terhubung. Coba lagi.") }
    finally { btn.disabled = false; btn.textContent = "Cari" }
  }

  /* dipanggil dari enter() di script.js setelah masuk lobi */
  window.ttFr = {
    lobby(isSolo) {
      if (isSolo || !U()) return;
      beat(true); flush();
    }
  };

  /* mulai setelah akun online siap */
  function start() {
    if (started || !U()) return;
    started = true;
    try { me.uid = U() } catch (e) {}
    api("names/" + enc(T.a().l), "PUT", U()).catch(() => {});
    beat(true);
    setInterval(() => beat(false), 4000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { beat(true); kick(); stream() } });
    stream(); setInterval(stream, 40 * 60000); setInterval(roomWatch, 1000);
    kick();
    let j = ""; try { j = sessionStorage.getItem("ttJoin") || ""; sessionStorage.removeItem("ttJoin") } catch (e) {}
    if (ROOM.test(j)) setTimeout(() => { try { if (!room && scr === "menu") enter(j, false, false) } catch (e) {} }, 500);
  }

  build();
  start();
  const wait = setInterval(() => { if (started) clearInterval(wait); else start() }, 500);
})();