/* ============================================================
   GRUNDEN: uppläsning, ljudeffekter, sparade framsteg och små
   hjälpfunktioner som alla spellägen använder.
   ============================================================ */

/* ---------- Uppläsning (Web Speech API, svensk röst) ---------- */
const Tal = (() => {
  const kan = "speechSynthesis" in window;
  let rost = null;
  let senaste = null;
  let ljudEl = null;
  let pratar = false;
  const lyssnare = new Set();

  function valjRost() {
    if (!kan) return;
    const roster = speechSynthesis.getVoices();
    const sv = roster.filter((r) => /^sv([-_]|$)/i.test(r.lang));
    rost = sv.find((r) => /alva|klara|google|siri|premium|enhanced/i.test(r.name)) || sv[0] || null;
  }
  if (kan) {
    valjRost();
    speechSynthesis.addEventListener?.("voiceschanged", valjRost);
  }

  function meddela(p) {
    pratar = p;
    lyssnare.forEach((f) => f(p));
  }
  function stoppa() {
    if (kan) speechSynthesis.cancel();
    if (ljudEl) { ljudEl.onended = ljudEl.onerror = null; ljudEl.pause(); ljudEl = null; }
  }

  // Läser upp en text. Om 'ljud' (en ljudfil) finns spelas den i stället.
  function saga(text, opt = {}) {
    if (!text) return Promise.resolve();
    senaste = { text, ljud: opt.ljud };
    stoppa();
    return new Promise((klar) => {
      let slut = false;
      const avsluta = () => { if (slut) return; slut = true; meddela(false); klar(); };
      meddela(true);
      if (opt.ljud) {
        const a = new Audio(opt.ljud);
        ljudEl = a;
        a.onended = avsluta;
        a.onerror = () => { ljudEl = null; syntes(text, avsluta); };
        a.play().catch(() => syntes(text, avsluta));
        setTimeout(avsluta, 8000);
        return;
      }
      syntes(text, avsluta);
    });
  }
  function syntes(text, avsluta) {
    if (!kan) { setTimeout(avsluta, 400 + text.length * 50); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    if (rost) u.voice = rost;
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onend = avsluta;
    u.onerror = avsluta;
    speechSynthesis.speak(u);
    if (speechSynthesis.paused) speechSynthesis.resume();
    setTimeout(avsluta, 2000 + text.length * 110); // säkerhetsnät om onend aldrig kommer
  }
  const namn = (plats) => saga(plats.namn, { ljud: plats.ljud });
  const upprepa = () => senaste && saga(senaste.text, { ljud: senaste.ljud });

  return { saga, namn, upprepa, stoppa, nar: (f) => lyssnare.add(f), get pratar() { return pratar; } };
})();

/* ---------- Ljudeffekter (Web Audio, inga ljudfiler) ---------- */
const Ljud = (() => {
  let ctx = null;
  let pa = true;
  try { pa = localStorage.getItem("spelhorna-ljud") !== "av"; } catch (e) {}
  function lasUpp() {
    if (!ctx) try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    if (ctx && ctx.state === "suspended") ctx.resume();
  }
  addEventListener("pointerdown", lasUpp);
  addEventListener("keydown", lasUpp);

  function ton(frekvens, start, langd, { typ = "sine", volym = 0.12, till } = {}) {
    if (!pa || !ctx) return;
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(frekvens, t);
    if (till) o.frequency.exponentialRampToValueAtTime(till, t + langd);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volym, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + langd);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + langd + 0.05);
  }
  return {
    lasUpp,
    klick: () => ton(600, 0, 0.08, { till: 900, volym: 0.06 }),
    ratt: () => { ton(523, 0, 0.16); ton(659, 0.1, 0.16); ton(784, 0.2, 0.28); },
    fel: () => { ton(330, 0, 0.18, { typ: "triangle", volym: 0.09, till: 280 }); ton(280, 0.16, 0.22, { typ: "triangle", volym: 0.08, till: 250 }); },
    stampel: () => { ton(140, 0, 0.18, { typ: "triangle", volym: 0.25, till: 70 }); ton(880, 0.12, 0.2, { volym: 0.06 }); ton(1175, 0.22, 0.3, { volym: 0.06 }); },
    plopp: () => ton(400, 0, 0.1, { till: 1100, volym: 0.08 }),
    fanfar: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => ton(f, i * 0.13, 0.22, { volym: 0.1 })); },
    tick: () => ton(1200, 0, 0.04, { volym: 0.03 }),
  };
})();

/* ---------- Framsteg (sparas bara i webbläsaren) ---------- */
const Framsteg = (() => {
  const NYCKEL = "jorden-runt-med-globi";
  const tom = () => ({
    platser: {},  // { platsId: { rad: 2, stampel: "2026-11-09" } }
    basta: {},    // personbästa i Blixtrundan per nivå
    firat: {},    // nivåer som redan firats
    inst: { doldaNivaer: [], doldaLagen: [], tid: true },
  });
  let d = tom();
  try {
    const s = JSON.parse(localStorage.getItem(NYCKEL) || "null");
    if (s) d = { ...tom(), ...s, inst: { ...tom().inst, ...(s.inst || {}) } };
  } catch (e) {}
  const spara = () => { try { localStorage.setItem(NYCKEL, JSON.stringify(d)); } catch (e) {} };

  return {
    get inst() { return d.inst; },
    sparaInst() { spara(); },
    harStampel: (id) => !!(d.platser[id] && d.platser[id].stampel),
    stampelDatum: (id) => d.platser[id] && d.platser[id].stampel,
    // Returnerar true om platsen nyss fick sin stämpel
    registrera(id, ratt) {
      const p = (d.platser[id] ||= { rad: 0 });
      let ny = false;
      if (ratt) {
        p.rad++;
        if (!p.stampel && p.rad >= SPELINSTALLNINGAR.rattIRadForStampel) {
          p.stampel = new Date().toISOString().slice(0, 10);
          ny = true;
        }
      } else p.rad = 0;
      spara();
      return ny;
    },
    basta: (nivaId) => d.basta[nivaId] || 0,
    sattBasta(nivaId, poang) {
      if (poang > (d.basta[nivaId] || 0)) { d.basta[nivaId] = poang; spara(); return true; }
      return false;
    },
    arFirad: (nivaId) => !!d.firat[nivaId],
    fira(nivaId) { d.firat[nivaId] = true; spara(); },
    nollstall() { const inst = d.inst; d = tom(); d.inst = inst; spara(); },
  };
})();

/* ---------- Små hjälpare ---------- */
const UI = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  function el(tag, attr = {}, ...barn) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attr)) {
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const b of barn.flat()) if (b != null) e.append(b);
    return e;
  }
  const blanda = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  // En runda: alla platser en gång (blandat), fyll på upp till 'antal' utan att samma kommer två gånger i rad
  function runda(platser, antal) {
    let ut = blanda(platser).slice(0, antal);
    while (ut.length < antal && platser.length > 1) {
      const p = platser[Math.floor(Math.random() * platser.length)];
      if (p !== ut[ut.length - 1]) ut.push(p);
    }
    return ut;
  }
  const slumpa = (lista, inte) => {
    const val = lista.filter((x) => x !== inte);
    return val[Math.floor(Math.random() * val.length)] || lista[0];
  };

  /* Globi – vår resekamrat (en egen ritad jordglob) */
  const GLOBI_SVG = `
  <svg viewBox="0 0 120 124" aria-hidden="true">
    <ellipse cx="60" cy="118" rx="30" ry="5" fill="rgba(0,0,0,.13)"/>
    <g class="g-kropp">
      <circle cx="60" cy="66" r="42" fill="#4fa8e8" stroke="#2a74c0" stroke-width="3"/>
      <g fill="#7cd389" stroke="#4fae63" stroke-width="1.5">
        <path d="M27 44c8-9 21-9 25-1 3 7-6 9-6 15 0 6-9 9-13 3-3-5-11-7-6-17z"/>
        <path d="M76 31c10-1 20 6 22 14-5 4-11 1-14 4-4 4-11 1-11-6 0-5-2-11 3-12z"/>
        <path d="M71 92c8-5 17-2 19 4-2 8-9 12-16 10-6-3-8-10-3-14z"/>
        <path d="M24 78c4-2 8 0 8 4s-4 6-7 5c-3-2-4-6-1-9z"/>
      </g>
      <ellipse cx="47" cy="62" rx="9" ry="11" fill="#fff"/>
      <ellipse cx="74" cy="62" rx="9" ry="11" fill="#fff"/>
      <g class="g-ogon">
        <circle cx="49" cy="64" r="5" fill="#24325a"/><circle cx="76" cy="64" r="5" fill="#24325a"/>
        <circle cx="50.5" cy="62" r="1.8" fill="#fff"/><circle cx="77.5" cy="62" r="1.8" fill="#fff"/>
      </g>
      <circle cx="36" cy="79" r="6" fill="#ff8fb8" opacity=".75"/>
      <circle cx="85" cy="79" r="6" fill="#ff8fb8" opacity=".75"/>
      <path class="g-mun" d="M50 80q10 11 21 0q-10 4-21 0z" fill="#b8325a" stroke="#24325a" stroke-width="3" stroke-linejoin="round"/>
      <g class="g-hatt">
        <path d="M33 33c4-20 50-20 55 0z" fill="#ff6b5b" stroke="#d94a3c" stroke-width="2"/>
        <rect x="26" y="29" width="68" height="8" rx="4" fill="#d94a3c"/>
        <path d="M40 27c6-4 12-5 16-5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>
        <circle cx="61" cy="12" r="5.5" fill="#ffd23f" stroke="#e0a800" stroke-width="1.5"/>
      </g>
    </g>
  </svg>`;
  const globi = (klass = "") => `<span class="globi ${klass}">${GLOBI_SVG}</span>`;

  // Globis mun rör sig när han pratar
  Tal.nar((p) => document.querySelectorAll(".globi").forEach((g) => g.classList.toggle("pratar", p)));

  let aktiv = "start";
  function visa(id) {
    document.querySelectorAll(".skarm").forEach((s) => (s.hidden = s.id !== "skarm-" + id));
    aktiv = id;
    window.scrollTo(0, 0);
  }
  // Globi säger något: texten visas i pratbubblan och läses upp
  function prata(text, opt = {}) {
    const sk = document.getElementById("skarm-" + aktiv);
    if (sk) sk.querySelectorAll(".globi-text").forEach((p) => {
      p.textContent = text;
      p.classList.remove("ny"); void p.offsetWidth; p.classList.add("ny");
    });
    if (opt.tyst) return Promise.resolve();
    return Tal.saga(text, opt);
  }

  // Svarskort: liten karta + namn. Även den som inte kan läsa ser var platsen ligger.
  function svarskort(plats, K, vidVal) {
    const kort = el("div", { class: "svarskort" });
    const knapp = el("button", { class: "svar-huvud", type: "button", "aria-label": plats.namn,
      html: Karta.mini(K, plats.kartomrade, plats.farg) + `<span class="svar-namn">${plats.namn}</span>` });
    const lyssna = el("button", { class: "svar-lyssna", type: "button", "aria-label": "Lyssna: " + plats.namn, html: "🔊" });
    knapp.addEventListener("click", () => vidVal(plats, kort));
    lyssna.addEventListener("click", (e) => { e.stopPropagation(); Tal.namn(plats); });
    kort.append(knapp, lyssna);
    return kort;
  }

  function animera(e, klass, ms = 700) {
    e.classList.remove(klass);
    void e.offsetWidth;
    e.classList.add(klass);
    setTimeout(() => e.classList.remove(klass), ms);
  }

  // Konfetti
  function konfetti(antal = 90) {
    const fx = $("#fx");
    const farger = ["#ff5fa2", "#ffc23d", "#1fcfc1", "#8b5cf6", "#4f8cff", "#34c77b", "#ff8a3d"];
    for (let i = 0; i < antal; i++) {
      const b = el("i", { class: "konfetti" });
      b.style.left = Math.random() * 100 + "vw";
      b.style.background = farger[i % farger.length];
      b.style.animationDelay = Math.random() * 0.6 + "s";
      b.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
      b.style.setProperty("--x", (Math.random() - 0.5) * 200 + "px");
      b.style.setProperty("--r", Math.random() * 720 + "deg");
      fx.append(b);
      setTimeout(() => b.remove(), 4600);
    }
  }

  // Stämpel-HTML (passet, aviseringar)
  function stampel(plats, tom = false) {
    const nr = [...plats.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const vrid = (nr % 17) - 8;
    if (tom) return `<span class="stampel tom" style="--v:${vrid}deg"><span class="st-ikon">?</span></span>`;
    return `<span class="stampel" style="--c:${plats.farg};--v:${vrid}deg"><span class="st-ikon">${plats.ikon || "⭐"}</span><span class="st-namn">${plats.namn}</span></span>`;
  }

  // Liten avisering när en stämpel delas ut
  function stampelAvisering(plats) {
    const yta = $("#avisering");
    const ruta = el("div", { class: "avisering", role: "status",
      html: stampel(plats) + `<div><b>Ny stämpel!</b><br>${plats.namn}</div>` });
    yta.append(ruta);
    Ljud.stampel();
    setTimeout(() => ruta.classList.add("bort"), 3200);
    setTimeout(() => ruta.remove(), 3800);
  }

  return { $, el, blanda, runda, slumpa, globi, visa, prata, svarskort, animera, konfetti, stampel, stampelAvisering,
    get aktiv() { return aktiv; } };
})();

// Registret där spellägena anmäler sig (se js/lagen/)
const LAGEN = {};
