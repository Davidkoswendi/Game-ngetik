/* perf.js: pilihan KUALITAS GRAFIK (Very Low, Low, Medium, High, Ultra) di Pengaturan,
   penurunan kualitas otomatis kalau FPS rendah, dan jeda animasi saat tab tidak terlihat.
   Memakai: ST dari script.js, tombol #gq di index.html. Gaya per level ada di perf.css (body.gq0 ... body.gq4). */
(function () {
  if (typeof ST === "undefined") return;
  const B = document.body, g = id => document.getElementById(id);
  const NM = ["Very Low", "Low", "Medium", "High", "Ultra"];
  const HT = [
    "Animasi latar dimatikan, paling ringan",
    "Efek dikurangi, cocok untuk HP dan laptop lama",
    "Seimbang: tanpa blur, efek sedang",
    "Standar: semua efek menyala",
    "Partikel lebih banyak, gambar lebih tajam, langit lebih ramai"
  ];

  document.addEventListener("visibilitychange", () => B.classList.toggle("pz", document.hidden));

  function save() {
    try {
      const o = JSON.parse(localStorage.getItem("mnP") || "{}");
      o.gq = ST.gq; o.lite = ST.lite; if (ST.gqm) o.gqm = 1;
      localStorage.setItem("mnP", JSON.stringify(o));
    } catch (e) {}
  }

  /* tambahan khusus Ultra: awan dan bintang ekstra */
  function ultra(on) {
    const old = document.querySelectorAll(".cl.ux,.wst i.ux");
    if (!on) { old.forEach(e => e.remove()); return }
    if (old.length) return;
    ["sky", "scene"].forEach(id => {
      const s = g(id); if (!s) return;
      const h = s.querySelector(".hills");
      [[8, 48, -12, .55], [26, 62, -30, .8], [38, 74, -44, .62]].forEach(([t, d, dl, sc]) => {
        const c = document.createElement("div");
        c.className = "cl ux";
        c.style.cssText = "top:" + t + "%;animation-duration:" + d + "s;animation-delay:" + dl + "s;transform:scale(" + sc + ")";
        s.insertBefore(c, h || null);
      });
    });
    document.querySelectorAll(".wst").forEach(w => {
      for (let i = 0; i < 35; i++) {
        const e = document.createElement("i");
        e.className = "ux";
        e.style.cssText = "left:" + (Math.random() * 100) + "%;top:" + (Math.random() * 50) + "%;animation-delay:-" + (Math.random() * 2) + "s";
        w.appendChild(e);
      }
    });
  }

  function ui() {
    const bs = document.querySelectorAll("#gq button");
    bs.forEach(b => b.classList.toggle("on", +b.dataset.q === ST.gq));
    const s = g("gqS");
    if (s) s.textContent = HT[ST.gq] + ". Efek peta berlaku mulai ronde berikutnya.";
  }

  function apply(n, manual) {
    n = Math.max(0, Math.min(4, n | 0));
    ST.gq = n; ST.vl = n === 0 ? 1 : 0; ST.mq = n === 2 ? 1 : 0; ST.hq = n === 4 ? 1 : 0;
    ST.lite = n <= 1 ? 1 : 0;
    if (manual) ST.gqm = 1;
    for (let i = 0; i < 5; i++) B.classList.toggle("gq" + i, i === n);
    B.classList.toggle("lite", !!ST.lite);
    ultra(n === 4);
    try { SFX.q(n === 0 ? 2 : n === 1 ? 1 : 0) } catch (e) {}
    ui(); save();
  }

  const box = g("gq");
  if (box) box.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    apply(+b.dataset.q, true);
    try { SFX.choose() } catch (x) {}
  };

  /* level awal: pilihan tersimpan, kalau belum ada ikuti deteksi perangkat (Low atau High) */
  apply(ST.gq == null ? (ST.lite ? 1 : 3) : ST.gq, false);

  /* ---------- turun otomatis kalau FPS rendah (berhenti setelah pemain memilih sendiri) ---------- */
  function toast(t) {
    const d = document.createElement("div");
    d.textContent = t;
    d.style.cssText = "position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:90vw;z-index:99999;padding:10px 16px;border-radius:14px;background:rgba(30,18,90,.96);color:#fff;font-size:14px;text-align:center;pointer-events:none;transition:opacity .6s";
    document.body.appendChild(d);
    setTimeout(() => { d.style.opacity = 0 }, 3800);
    setTimeout(() => d.remove(), 4500);
  }

  let last = 0, acc = 0, n = 0, bad = 0, warm = performance.now() + 4000;
  function frame(now) {
    if (ST.gqm || ST.gq <= 0) return;
    if (document.hidden || g("intro") || now < warm) { last = 0; acc = n = 0; requestAnimationFrame(frame); return }
    if (last) {
      const dt = now - last;
      if (dt < 400) { acc += dt; n++ }
      if (acc >= 2000) {
        bad = n / (acc / 1000) < 40 ? bad + 1 : 0;
        acc = n = 0;
        if (bad >= 3) {
          bad = 0; apply(ST.gq - 1, false); warm = now + 5000; last = 0;
          toast("Grafik diturunkan otomatis ke " + NM[ST.gq] + ". Ubah di Pengaturan.");
        }
      }
    }
    last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  new MutationObserver(() => { warm = performance.now() + 1500; acc = n = 0; last = 0 }).observe(B, { attributes: true, attributeFilter: ["class"] });
})();