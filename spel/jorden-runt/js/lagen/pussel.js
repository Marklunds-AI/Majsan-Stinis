/* ============================================================
   KARTPUSSLET
   Land (t.ex. världsdelar): dra formerna till rätt plats.
   Hav: dra namnskyltar till rätt hav.
   Vilket som används avgörs av kartområdets typ i karta.js.
   ============================================================ */
LAGEN.pussel = {
  namn: "Kartpusslet",
  ikon: "🧩",
  beskrivning: (niva) =>
    PLATSER.some((p) => p.niva === niva.id && KARTOR[niva.karta].omraden[p.kartomrade]?.typ === "hav")
      ? "Dra namnskyltarna till rätt hav."
      : "Dra bitarna till rätt plats på kartan.",

  starta(ctx) {
    const { K, platser } = ctx;
    const skyltar = platser.every((p) => K.omraden[p.kartomrade].typ === "hav");
    const ram = UI.el("div", { class: "kartram" });
    const bricka = UI.el("div", { class: "bricka", role: "list" });
    ctx.yta.append(ram, bricka);
    const R = ctx.karta(ram, { klass: skyltar ? "visa-hav" : "" });

    // Bitarna som ska läggas syns som streckade "spöken" på kartan
    if (!skyltar) platser.forEach((p) => R.klass(p.kartomrade, "spoke"));

    const forsta = {};
    let kvar = platser.length;
    let ratt = 0;
    const prickar = ctx.prickar(platser.length);
    let prickIndex = 0;

    for (const plats of UI.blanda(platser)) {
      forsta[plats.id] = true;
      const bit = UI.el("button", { class: "bit" + (skyltar ? " skylt-bit" : ""), type: "button", role: "listitem", "aria-label": plats.namn });
      if (skyltar) bit.textContent = plats.namn;
      else {
        bit.innerHTML = bitSvg(K, plats);
        // Breda, platta former (t.ex. Antarktis) får en bredare bit så att de syns
        const r = Karta.ramFor(Karta.huvudformer(K, K.omraden[plats.kartomrade]));
        const kvot = (r.x1 - r.x0) / Math.max(1, r.y1 - r.y0);
        if (kvot > 2.2) bit.style.width = "calc(var(--bitb, 118px) * " + Math.min(1.8, kvot / 1.6).toFixed(2) + ")";
      }
      bit.style.animationDelay = Math.random() * 300 + "ms";
      ctx.pa(bit, "pointerdown", (e) => dra(e, plats, bit));
      // Tangentbord: Enter läser upp namnet
      ctx.pa(bit, "click", (e) => { if (e.detail === 0) Tal.namn(plats); });
      bricka.append(bit);
    }

    ctx.prata(skyltar
      ? "Dra varje namnskylt till rätt hav. Tryck på en skylt för att höra namnet."
      : "Dra bitarna till rätt plats på kartan. Tryck på en bit för att höra namnet.");

    // Liten SVG av en form, beskuren runt formen
    function bitSvg(K, plats, stroke = 6) {
      const o = K.omraden[plats.kartomrade];
      const former = Karta.huvudformer(K, o);
      const r = Karta.ramFor(former);
      const pad = 6;
      return `<svg viewBox="${r.x0 - pad} ${r.y0 - pad} ${r.x1 - r.x0 + pad * 2} ${r.y1 - r.y0 + pad * 2}" preserveAspectRatio="xMidYMid meet">` +
        `<path d="${Karta.pathD(K, former, true)}" fill="${plats.farg}" stroke="#fff" stroke-width="${stroke}" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    }

    function dra(e, plats, bit) {
      if (bit.classList.contains("dras")) return;
      e.preventDefault();
      Tal.namn(plats);
      Ljud.plopp();
      const s = R.skala();
      const o = K.omraden[plats.kartomrade];
      let flyt, offX, offY;
      if (skyltar) {
        flyt = UI.el("div", { class: "dras-flyt skylt-flyt" }, plats.namn);
        document.body.append(flyt);
        offX = flyt.offsetWidth / 2;
        offY = flyt.offsetHeight / 2;
      } else {
        // Formen i samma storlek som på kartan, med "mitten" under fingret
        const former = Karta.huvudformer(K, o);
        const r = Karta.ramFor(former);
        const pad = 4;
        const w = (r.x1 - r.x0 + pad * 2) * s, h = (r.y1 - r.y0 + pad * 2) * s;
        flyt = UI.el("div", { class: "dras-flyt", html: bitSvg(K, plats, 3) });
        flyt.style.width = w + "px";
        flyt.style.height = h + "px";
        flyt.firstChild.setAttribute("viewBox", `${r.x0 - pad} ${r.y0 - pad} ${r.x1 - r.x0 + pad * 2} ${r.y1 - r.y0 + pad * 2}`);
        flyt.firstChild.style.width = "100%";
        flyt.firstChild.style.height = "100%";
        document.body.append(flyt);
        offX = (o.mitt[0] - r.x0 + pad) * s;
        offY = (o.mitt[1] - r.y0 + pad) * s;
      }
      const flytta = (ev) => { flyt.style.left = ev.clientX - offX + "px"; flyt.style.top = ev.clientY - offY + "px"; };
      flytta(e);
      bit.classList.add("dras");
      try { bit.setPointerCapture(e.pointerId); } catch (err) {}

      const flyttaH = (ev) => flytta(ev);
      const slapp = (ev) => {
        bit.removeEventListener("pointermove", flyttaH);
        bit.removeEventListener("pointerup", slapp);
        bit.removeEventListener("pointercancel", avbryt);
        if (!ctx.aktiv) { flyt.remove(); return; }
        bedom(ev, plats, bit, flyt, offX, offY);
      };
      const avbryt = () => {
        bit.removeEventListener("pointermove", flyttaH);
        bit.removeEventListener("pointerup", slapp);
        bit.removeEventListener("pointercancel", avbryt);
        tillbaka(bit, flyt);
      };
      bit.addEventListener("pointermove", flyttaH);
      bit.addEventListener("pointerup", slapp);
      bit.addEventListener("pointercancel", avbryt);
    }

    function tillbaka(bit, flyt) {
      const b = bit.getBoundingClientRect();
      flyt.classList.add("tillbaka");
      flyt.style.left = b.left + "px";
      flyt.style.top = b.top + "px";
      setTimeout(() => { flyt.remove(); bit.classList.remove("dras"); }, 360);
    }

    function bedom(ev, plats, bit, flyt, offX, offY) {
      const o = K.omraden[plats.kartomrade];
      const p = R.tillKarta(ev);
      const flyttat = Math.hypot(ev.clientX - (bit.getBoundingClientRect().left + bit.offsetWidth / 2), ev.clientY - (bit.getBoundingClientRect().top + bit.offsetHeight / 2)) > 30;
      // Bara ett tryck på biten, eller släppt utanför kartan: lägg tillbaka utan fel
      if (!flyttat || !R.innanfor(ev)) { tillbaka(bit, flyt); return; }

      let ratt_ = false;
      if (skyltar) {
        if (Karta.landVid(K, p.x, p.y)) {
          ctx.prata("Det där är land. Släpp skylten i havet!");
          tillbaka(bit, flyt);
          return;
        }
        const hav = Karta.havVid(K, p.x, p.y);
        ratt_ = !!hav && hav.id === o.id;
      } else {
        ratt_ = Math.hypot(Karta.dx(K, p.x, o.mitt[0]), p.y - o.mitt[1]) < 60 || Karta.iOmrade(o, Karta.norm(K, p.x), p.y);
      }

      if (ratt_) {
        // Snäpp på plats
        const mal = R.tillSkarm(o.mitt[0], o.mitt[1]);
        flyt.classList.add("snappa");
        flyt.style.left = mal.x - offX + "px";
        flyt.style.top = mal.y - offY + "px";
        setTimeout(() => flyt.remove(), 260);
        R.klass(o.id, "spoke", false);
        R.farga(o.id, plats.farg);
        R.etikett(o.id, plats.namn, skyltar ? "skylt" : "");
        bit.remove();
        Ljud.ratt();
        ctx.registrera(plats, forsta[plats.id]);
        if (forsta[plats.id]) ratt++;
        prickar.satt(prickIndex++, forsta[plats.id] ? "ratt" : "klar");
        kvar--;
        if (kvar === 0) {
          ctx.prata(`${beromt()} Där ligger ${plats.namn}! Hela kartan är klar!`);
          ctx.efter(2200, () => ctx.avsluta({
            rubrik: "Kartan är klar!",
            text: `Du lade alla ${platser.length} bitar. ${ratt} hamnade rätt direkt!`,
          }));
        } else {
          ctx.prata(`${beromt()} Där ligger ${plats.namn}!`);
        }
      } else {
        if (forsta[plats.id]) ctx.registrera(plats, false);
        forsta[plats.id] = false;
        Ljud.fel();
        tillbaka(bit, flyt);
        R.blinka(o.id, plats.farg);
        const dar = skyltar ? Karta.havVid(K, p.x, p.y) : Karta.vid(K, p.x, p.y);
        const darPlats = dar && ctx.platsFor(dar.id);
        ctx.prata(darPlats && darPlats.id !== plats.id
          ? `Där ligger ${darPlats.namn}. ${plats.namn} ska vara där det blinkar!`
          : `Nästan! ${plats.namn} ska vara där det blinkar. Försök igen!`);
      }
    }
  },
};
