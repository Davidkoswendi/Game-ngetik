/* akun.js: akun pemain + halaman Profil.
   - Daftar dan Masuk memakai Firebase (Auth + Realtime Database) lewat REST, jadi akun bisa dipakai di perangkat lain.
   - Konfigurasi ada di firebase-config.js. Kalau kosong, akun hanya disimpan di perangkat ini (mode lama).
   Memakai: me, COL, show() dari script.js. Dimuat setelah script.js. */
(function () {
  const g = id => document.getElementById(id), KEY = "mnAcc";
  const FB = window.TT_FB || {}, DB = (FB.db || "").replace(/\/+$/, ""), ON = !!(FB.key && DB);
  const AUTH = "https://identitytoolkit.googleapis.com/v1/accounts:";
  let A = null, IT = "", EX = 0, mode = "reg", busy = false, pre = 0, pt = 0;

  const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "null"); if (a && a.u) return a } catch (e) {} return null };
  const ini = n => ((n || "").trim()[0] || "?").toUpperCase();
  const col = i => COL[(i | 0) % 6];
  const okName = n => n.length >= 2 && n.length <= 12;
  const okLogin = n => /^[A-Za-z0-9_.]{2,12}$/.test(n);
  const mail = n => n.toLowerCase() + "@typingtower.app";

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(A)) } catch (e) {}
    if (ON && A && A.uid) { clearTimeout(pt); pt = setTimeout(() => push().catch(() => {}), 700) }
  }
  function setAv(el, name, a) { el.textContent = ini(name); el.style.setProperty("--c", col(a)) }

  /* ---------- server ---------- */
  async function post(url, body, form) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": form ? "application/x-www-form-urlencoded" : "application/json" }, body: form ? body : JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && (j.error.message || j.error)) || "NET");
    return j;
  }
  function setTok(idToken, ex) { IT = idToken; EX = Date.now() + (+ex || 3600) * 1000 }
  async function tok() {
    if (IT && EX > Date.now() + 60000) return IT;
    const j = await post("https://securetoken.googleapis.com/v1/token?key=" + FB.key, "grant_type=refresh_token&refresh_token=" + encodeURIComponent(A.rt), true);
    A.rt = j.refresh_token; setTok(j.id_token, j.expires_in);
    try { localStorage.setItem(KEY, JSON.stringify(A)) } catch (e) {}
    return IT;
  }
  const row = () => ({ u: A.u, l: A.l, a: A.a | 0, g: A.g | 0, w: A.w | 0, b: A.b | 0, t: A.t });
  async function push() {
    const t = await tok();
    const r = await fetch(DB + "/users/" + A.uid + ".json?auth=" + encodeURIComponent(t), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row()) });
    if (!r.ok) throw new Error("DB");
  }
  async function pull(uid, t) {
    const r = await fetch(DB + "/users/" + uid + ".json?auth=" + encodeURIComponent(t));
    if (!r.ok) throw new Error("DB");
    return r.json();
  }
  function errText(e) {
    const m = String(e && e.message || e);
    if (/EMAIL_EXISTS/.test(m)) return "Nama pengguna ini sudah dipakai, coba nama lain.";
    if (/WEAK_PASSWORD/.test(m)) return "Kata sandi minimal 6 karakter.";
    if (/INVALID_LOGIN|INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_EMAIL/.test(m)) return "Nama pengguna atau kata sandi salah.";
    if (/TOO_MANY/.test(m)) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    if (/DB|Permission/.test(m)) return "Data akun gagal disimpan. Cek aturan Realtime Database.";
    return "Gagal terhubung ke server. Cek internetmu lalu coba lagi.";
  }

  /* sinkron pelan-pelan di latar saat game dibuka */
  async function sync() {
    if (!ON || !A || !A.uid) return;
    try {
      const t = await tok(), d = await pull(A.uid, t);
      if (d) {
        A.u = d.u || A.u; A.a = d.a | 0;
        A.g = Math.max(A.g | 0, d.g | 0); A.w = Math.max(A.w | 0, d.w | 0); A.b = Math.max(A.b | 0, d.b | 0);
        apply();
        try { localStorage.setItem(KEY, JSON.stringify(A)) } catch (e) {}
      }
      push().catch(() => {});
    } catch (e) {}
  }

  /* ---------- tampilan ---------- */
  function card() { setAv(g("pcAv"), A.u, A.a); g("pcN").textContent = A.u }
  function apply() { me.name = A.u; me.av = A.a | 0; card() }

  function view() {
    setAv(g("pfAv"), A.u, A.a);
    g("pfN").textContent = A.u;
    let d = ""; try { d = new Date(A.t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) } catch (e) {}
    g("pfD").textContent = (d ? "Bergabung " + d : "") + (A.uid && A.l ? (d ? " · " : "") + "Login: " + A.l : "");
    g("sG").textContent = A.g | 0; g("sW").textContent = A.w | 0; g("sB").textContent = A.b | 0;
    g("pfNm").value = A.u; g("pfMsg").textContent = ""; g("pfMsg").className = "pfm"; nmState();
    swatch();
    g("pfUp").style.display = ON && !A.uid ? "" : "none";
    g("pfPw").value = ""; g("pfUpM").textContent = ""; g("pfUpM").className = "pfm";
    const o = g("pfOut"); o.textContent = A.uid ? "Keluar dari akun" : "Keluar & hapus akun"; o.dataset.sure = "";
  }
  function nmState() {
    const v = g("pfNm").value.trim();
    g("pfCn").textContent = g("pfNm").value.length + "/12";
    g("pfNmB").disabled = !(okName(v) && v !== A.u);
  }
  function swatch() {
    g("pfSw").querySelectorAll("button").forEach((b, k) => b.classList.toggle("on", k === (A.a | 0)));
    g("pfTw").style.setProperty("--c", col(A.a));
  }

  /* ---------- layar daftar / masuk ---------- */
  const prev = () => setAv(g("accPv"), g("accNm").value, pre);
  function setMode(m) {
    mode = m;
    const reg = m === "reg";
    g("accTabs").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.m === m));
    g("accH").textContent = reg ? "Buat Akunmu" : "Masuk ke Akunmu";
    g("accT").textContent = reg ? "Satu akun pemain untuk semua permainanmu" : "Lanjutkan permainan dari perangkat mana pun";
    g("accPv").style.display = reg ? "" : "none";
    g("accPw").autocomplete = reg ? "new-password" : "current-password";
    g("accPw").placeholder = reg ? "Minimal 6 karakter" : "Kata sandimu";
    g("accHint").textContent = reg ? "Nama: 2 sampai 12 karakter, huruf, angka, _ atau titik. Dipakai untuk masuk di perangkat lain." : "";
    g("accGo").textContent = reg ? "Daftar & Mulai" : "Masuk";
    g("accFoot").textContent = ON ? (reg ? "Sudah punya akun? Pilih tab Masuk." : "Belum punya akun? Pilih tab Daftar.") : "Akun disimpan di perangkat ini.";
    g("accErr").textContent = "";
  }
  function accScreen() {
    document.querySelectorAll(".scr").forEach(s => s.classList.toggle("on", s.id === "s-acc"));
    let n = "";
    try { const o = JSON.parse(localStorage.getItem("mn") || "{}"); if (o.n) n = String(o.n).slice(0, 12).replace(/[^A-Za-z0-9_.]/g, ""); pre = (o.a | 0) % 6 } catch (e) {}
    if (!n) pre = Math.random() * 6 | 0;
    g("accNm").value = n; g("accPw").value = ""; setMode("reg"); prev();
    g("accTabs").style.display = ON ? "" : "none";
    g("accPw").parentNode.querySelector('label[for="accPw"]').style.display = g("accPw").style.display = ON ? "" : "none";
  }
  function busyUI(b, label) {
    busy = b; g("accGo").disabled = b;
    g("accGo").textContent = b ? "Memproses…" : label;
  }
  function enter() {
    apply(); g("accErr").textContent = "";
    try { SFX.choose() } catch (x) {}
    show("s-menu");
    sync();
  }

  async function submit() {
    if (busy) return;
    const n = g("accNm").value.trim(), p = g("accPw").value, e = g("accErr");
    const label = mode === "reg" ? "Daftar & Mulai" : "Masuk";
    /* mode lama: tanpa server */
    if (!ON) {
      if (!okName(n)) { e.textContent = n.length < 2 ? "Nama minimal 2 karakter ya." : "Nama maksimal 12 karakter."; g("accNm").focus(); return }
      A = { u: n, a: pre, g: 0, w: 0, b: 0, t: Date.now() }; save(); enter(); return;
    }
    if (mode === "reg" ? !okLogin(n) : !n) { e.textContent = n.length < 2 ? "Nama minimal 2 karakter." : "Pakai huruf, angka, _ atau titik saja (maks. 12)."; g("accNm").focus(); return }
    if (p.length < 6) { e.textContent = "Kata sandi minimal 6 karakter."; g("accPw").focus(); return }
    e.textContent = ""; busyUI(true, label);
    try {
      if (mode === "reg") {
        const j = await post(AUTH + "signUp?key=" + FB.key, { email: mail(n), password: p, returnSecureToken: true });
        setTok(j.idToken, j.expiresIn);
        A = { u: n, l: n.toLowerCase(), a: pre, g: 0, w: 0, b: 0, t: Date.now(), uid: j.localId, rt: j.refreshToken };
        await push();
      } else {
        const j = await post(AUTH + "signInWithPassword?key=" + FB.key, { email: mail(n), password: p, returnSecureToken: true });
        setTok(j.idToken, j.expiresIn);
        const d = await pull(j.localId, j.idToken);
        A = Object.assign({ u: n, a: 0, g: 0, w: 0, b: 0, t: Date.now() }, d || {}, { l: n.toLowerCase(), uid: j.localId, rt: j.refreshToken });
        if (!d) await push();
      }
      save(); busyUI(false, label); g("accPw").value = ""; enter();
    } catch (x) {
      busyUI(false, label); e.textContent = errText(x);
      if (mode === "reg" && A && !A.uid) A = null;
    }
  }

  /* akun lama (hanya di perangkat) dijadikan akun cloud */
  async function upgrade() {
    const p = g("pfPw").value, m = g("pfUpM"), b = g("pfUpB");
    m.className = "pfm bad";
    if (!okLogin(A.u)) { m.textContent = "Untuk akun online, nama harus huruf/angka/_/titik. Ganti nama dulu di atas."; return }
    if (p.length < 6) { m.textContent = "Kata sandi minimal 6 karakter."; return }
    b.disabled = true; m.textContent = "";
    try {
      const j = await post(AUTH + "signUp?key=" + FB.key, { email: mail(A.u), password: p, returnSecureToken: true });
      setTok(j.idToken, j.expiresIn);
      A.l = A.u.toLowerCase(); A.uid = j.localId; A.rt = j.refreshToken;
      await push(); save(); view();
      g("pfUpM").textContent = ""; try { SFX.ready(true) } catch (x) {}
      g("pfD").textContent += " ✓ akun online";
    } catch (x) { m.textContent = errText(x) } finally { b.disabled = false }
  }

  /* ---------- profil ---------- */
  function rename() {
    const n = g("pfNm").value.trim(), m = g("pfMsg");
    if (!okName(n)) { m.textContent = n.length < 2 ? "Nama minimal 2 karakter." : "Nama maksimal 12 karakter."; m.className = "pfm bad"; return }
    A.u = n; save(); apply();
    setAv(g("pfAv"), A.u, A.a); g("pfN").textContent = A.u;
    m.textContent = A.uid ? "Nama tampil diganti. Nama untuk login tetap " + A.l + "." : "Nama berhasil diganti."; m.className = "pfm ok"; nmState();
    try { SFX.ready(true) } catch (x) {}
  }
  function logout() {
    const o = g("pfOut");
    if (!o.dataset.sure) { o.dataset.sure = "1"; o.textContent = A.uid ? "Yakin? Ketuk lagi untuk keluar" : "Yakin? Ketuk lagi untuk hapus"; return }
    clearTimeout(pt);
    try { localStorage.removeItem(KEY); localStorage.removeItem("mn") } catch (e) {}
    location.reload();
  }

  /* dipanggil dari result() di script.js */
  window.accStat = (win, wpm) => {
    if (!A) return;
    A.g = (A.g | 0) + 1; if (win) A.w = (A.w | 0) + 1;
    if ((wpm | 0) > (A.b | 0)) A.b = wpm | 0;
    save();
  };

  /* ---------- pasang ---------- */
  let h = ""; COL.forEach((c, i) => h += '<button type="button" data-i="' + i + '" style="--c:' + c + '" aria-label="Warna ' + (i + 1) + '"></button>');
  g("pfSw").innerHTML = h;
  let tb = ""; for (let i = 0; i < 6; i++) tb += "<i></i>"; g("pfTw").innerHTML = tb + '<u class="rf"></u>';

  g("pfSw").onclick = e => {
    const b = e.target.closest("button"); if (!b || !A) return;
    A.a = +b.dataset.i; save(); apply(); swatch(); setAv(g("pfAv"), A.u, A.a);
    try { SFX.choose() } catch (x) {}
  };
  g("pfNmB").onclick = rename;
  g("pfNm").addEventListener("input", () => { g("pfMsg").textContent = ""; nmState() });
  g("pfNm").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); if (!g("pfNmB").disabled) rename() } };
  g("pfOut").onclick = logout;
  g("pfUpB").onclick = upgrade;
  g("pfPw").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); upgrade() } };
  g("bProf").onclick = () => { if (!A) return; view(); window.openProfile() };
  g("accTabs").onclick = e => { const b = e.target.closest("button"); if (b && !busy) { setMode(b.dataset.m); g("accNm").focus() } };
  g("accNm").addEventListener("input", () => { g("accErr").textContent = ""; prev() });
  g("accPw").addEventListener("input", () => { g("accErr").textContent = "" });
  g("accNm").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); ON ? g("accPw").focus() : submit() } };
  g("accPw").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); submit() } };
  g("accGo").onclick = submit;

  A = load();
  if (A) { apply(); sync() } else accScreen();
})();