/* ============================================================
   RESAN
   fordon "flyg": flyg över allt och landa på rätt plats.
   fordon "bat":  båten åker bara på vatten. Globi frågar under
                  färden vilket hav man seglar på.
   Styrning: tryck/dra på kartan dit fordonet ska, eller piltangenter.
   ============================================================ */
const FORDON_SVG = {
  flyg: `
    <path d="M-4 0L-9-15h4L5-2Z" fill="#e8eef9" stroke="#24325a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-4 0L-9 15h4L5 2Z" fill="#e8eef9" stroke="#24325a" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-12 0l-5-6h2.6L-9-1ZM-12 0l-5 6h2.6L-9 1Z" fill="#ff6b5b" stroke="#24325a" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M15 0c0-2.6-4-3.2-9-3.2L-14-2c-2 1-2 3 0 4L6 3.2c5 0 9-.6 9-3.2Z" fill="#fff" stroke="#24325a" stroke-width="1.6"/>
    <path d="M10-1.6l3 .8v1.6l-3 .8Z" fill="#4fa8e8"/>
    <rect x="-9" y="-.8" width="13" height="1.6" fill="#ff6b5b"/>`,
  bat: `
    <path d="M-18 11q4-3 8 0t8 0 8 0 8 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M-16 2h32l-5 8h-23Z" fill="#ff6b5b" stroke="#24325a" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="-12" y="4.5" width="24" height="1.8" fill="#fff"/>
    <path d="M0 2v-22" stroke="#24325a" stroke-width="1.8"/>
    <path d="M1.5-19L14-1H1.5Z" fill="#fff" stroke="#24325a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-1.5-15L-11-1h9.5Z" fill="#ffd23f" stroke="#24325a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M0-20l7 2-7 2Z" fill="#4fa8e8"/>`,
};

LAGEN.resan = {
  namn: "Resan",
  ikon: (niva) => (niva.resan?.fordon === "bat" ? "⛵" : "✈️"),
  beskrivning: (niva) => (niva.resan?.fordon === "bat"
    ? "Segla båten över haven. Båten kan bara åka på vatten."
    : "Flyg planet från en plats till en annan och landa rätt."),

  starta(ctx) {
    const { K, niva } = ctx;
    const NS = Karta.SVGNS;
    const cfg = niva.resan || { fordon: "flyg", verb: "Flyg" };
    const bat = cfg.fordon === "bat";
    const verb = cfg.verb || (bat ? "Segla" : "Flyg");
    const platsMedId = (id) => PLATSER.find((p) => p.id === id);
    const fart = bat ? 68 : 85; // kartenheter per sekund – lugnt

    /* ----- Uppdragen ----- */
    let lista = [];
    if (cfg.uppdrag && cfg.uppdrag.length) {
      lista = UI.blanda(cfg.uppdrag)
        .map((u) => ({ fran: platsMedId(u.fran), till: platsMedId(u.till), text: u.text }))
        .filter((u) => u.fran && u.till);
    } else {
      const p = ctx.platser;
      for (let i = 0; i < 40 && lista.length < SPELINSTALLNINGAR.resorPerRunda; i++) {
        const fran = UI.slumpa(p), till = UI.slumpa(p, fran);
        if (!lista.some((u) => u.fran === fran && u.till === till) && !lista.some((u) => u.till === till)) lista.push({ fran, till });
      }
    }
    lista = lista.slice(0, SPELINSTALLNINGAR.resorPerRunda);

    /* ----- Kartan och fordonet ----- */
    let fskala = 1;
    const ram = UI.el("div", { class: "kartram" });
    const tips = UI.el("p", { class: "resa-tips" }, "👆 Tryck på kartan dit du vill åka  ·  ⌨️ Piltangenter");
    ctx.yta.append(ram, tips);
    const R = ctx.karta(ram, { klass: bat ? "visa-hav" : "", vidAnpassa: (s) => (fskala = Math.max(0.9, Math.min(3.2, 44 / (30 * s)))) });

    const spar = document.createElementNS(NS, "path");
    spar.setAttribute("class", "spar");
    R.lager.spar.append(spar);
    const flagga = document.createElementNS(NS, "g");
    flagga.setAttribute("class", "flagga");
    flagga.innerHTML = `<path d="M0 0v-22" stroke="#24325a" stroke-width="2"/><path d="M0-22l14 4-14 5Z" fill="#34c77b" stroke="#24325a" stroke-width="1.2"/><circle r="3" fill="#24325a"/>`;
    const malmarkor = document.createElementNS(NS, "circle");
    malmarkor.setAttribute("class", "malmarkor");
    malmarkor.setAttribute("r", 10);
    malmarkor.style.display = "none";
    const fordon = document.createElementNS(NS, "g");
    fordon.setAttribute("class", "fordon");
    fordon.innerHTML = `<g class="fordon-inre">${FORDON_SVG[bat ? "bat" : "flyg"]}</g>`;
    const inre = fordon.firstChild;
    const overText = document.createElementNS(NS, "text");
    overText.setAttribute("class", "reselabel");
    overText.style.opacity = 0;
    R.lager.topp.append(flagga, malmarkor, fordon, overText);

    /* ----- Tillstånd ----- */
    let ui = -1, u = null;
    let pos = { x: 0, y: 0 }, vinkel = 0, vand = 1;
    let mal = null, vag = null, tryckt = false, senastVag = 0;
    const tangenter = new Set();
    let pausad = true, framme = false, tid = 0, nastaTips = 16;
    let hjalp = false, fardat = 0, sparPunkter = [];
    let senasteHav = null, havTid = 0, fragade = new Set(), antalFragor = 0;
    let senasteOmr = null, overTimer = 0, sagtRunt = false, klara = 0, senastSagt = 0;

    function startpunkt(u) {
      const fo = K.omraden[u.fran.kartomrade];
      if (!bat) return { x: fo.mitt[0], y: fo.mitt[1] };
      const mo = K.omraden[u.till.kartomrade];
      let hamnar = fo.typ === "hav" ? [fo.mitt] : (u.fran.hamnar || []).map(K.proj);
      if (!hamnar.length) hamnar = [fo.mitt];
      const kandidater = hamnar.map(([x, y]) => Karta.vattenPunkt(K, x, y))
        .filter((h) => !(mo.typ === "hav" && Karta.havVid(K, h.x, h.y)?.id === mo.id));
      if (!kandidater.length) return Karta.vattenPunkt(K, hamnar[0][0], hamnar[0][1]);
      // Välj den hamn som har kortast sjöväg till målet
      let bast = kandidater[0], kortast = Infinity;
      for (const h of kandidater) {
        const v = Karta.sjovag(K, h, { x: mo.mitt[0], y: mo.mitt[1] });
        const l = v ? v.length : 9999;
        if (l < kortast) { kortast = l; bast = h; }
      }
      return bast;
    }

    function startaUppdrag() {
      ui++;
      if (ui >= lista.length) return slut();
      u = lista[ui];
      pos = startpunkt(u);
      mal = null; vag = null; tangenter.clear();
      framme = false; tid = 0; nastaTips = 16; hjalp = false; fardat = 0;
      sparPunkter = []; spar.setAttribute("d", "");
      senasteHav = null; havTid = 0; fragade = new Set(); antalFragor = 0;
      senasteOmr = (bat ? Karta.havVid : Karta.vid)(K, pos.x, pos.y)?.id || null;
      malmarkor.style.display = "none";
      fordon.style.opacity = 1;
      flagga.setAttribute("transform", `translate(${pos.x},${pos.y}) scale(${fskala})`);
      R.rensa();
      // På båtnivån står världsdelarnas namn på kartan, så man vet vart man ska
      if (bat) for (const o of K.landLista) { const pl = ctx.platsFor(o.id); if (pl) R.etikett(o.id, pl.namn, "land-namn"); }
      R.blinka(u.fran.kartomrade, u.fran.farg);
      const text = u.text || `${verb} från ${u.fran.namn} till ${u.till.namn}!`;
      const extra = ui === 0 ? " Tryck på kartan dit du vill åka." : "";
      ctx.prata(text + extra);
      pausad = false;
      rita(0);
    }

    function slut() {
      pausad = true;
      ctx.avsluta({
        rubrik: bat ? "Vilken seglats!" : "Vilken flygtur!",
        text: `Du klarade ${klara} ${klara === 1 ? "resa" : "resor"} jorden runt!`,
      });
    }

    /* ----- Styrning ----- */
    function sattMal(e) {
      const p = R.tillKarta(e);
      if (p.x < 0 || p.y < 0 || p.x > K.W || p.y > K.H) return;
      mal = p;
      malmarkor.setAttribute("cx", p.x);
      malmarkor.setAttribute("cy", p.y);
      malmarkor.setAttribute("r", 10 * fskala);
      malmarkor.style.display = "";
      if (bat) {
        const nu = performance.now();
        if (nu - senastVag > 120 || !vag) { vag = Karta.sjovag(K, pos, p); senastVag = nu; }
      }
    }
    ctx.pa(R.svg, "pointerdown", (e) => {
      if (pausad) return;
      tryckt = true;
      try { R.svg.setPointerCapture(e.pointerId); } catch (err) {}
      tangenter.clear();
      vag = null;
      sattMal(e);
    });
    ctx.pa(R.svg, "pointermove", (e) => { if (tryckt && !pausad) sattMal(e); });
    const slapp = () => { tryckt = false; };
    ctx.pa(R.svg, "pointerup", slapp);
    ctx.pa(R.svg, "pointercancel", slapp);

    const PILAR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    ctx.pa(window, "keydown", (e) => {
      if (!PILAR[e.key]) return;
      e.preventDefault();
      tangenter.add(e.key);
      mal = null; vag = null;
      malmarkor.style.display = "none";
    });
    ctx.pa(window, "keyup", (e) => tangenter.delete(e.key));
    ctx.pa(window, "blur", () => tangenter.clear());

    /* ----- Varje bildruta ----- */
    ctx.loop((dt) => {
      if (pausad || framme || !u) { rita(dt); return; }
      tid += dt;
      let vx = 0, vy = 0;

      if (tangenter.size) {
        for (const k of tangenter) { vx += PILAR[k][0]; vy += PILAR[k][1]; }
      } else if (mal) {
        let punkt = mal;
        if (bat) {
          if (vag && vag.length) {
            // Räta ut vägen: hoppa till den punkt längst fram som syns över vatten
            for (let j = Math.min(vag.length - 1, 14); j > 0; j--) {
              if (Karta.friSikt(K, pos, vag[j])) { vag.splice(0, j); break; }
            }
            punkt = vag[0];
          } else punkt = null;
        }
        if (punkt) {
          const ddx = bat ? Karta.dx(K, pos.x, punkt.x) : punkt.x - pos.x;
          const ddy = punkt.y - pos.y;
          const d = Math.hypot(ddx, ddy);
          if (d < 2.5) {
            if (bat && vag && vag.length) { vag.shift(); if (!vag.length) { mal = null; malmarkor.style.display = "none"; } }
            else { mal = null; malmarkor.style.display = "none"; }
          } else { vx = ddx / d; vy = ddy / d; if (d < 12) { vx *= d / 12 + 0.3; vy *= d / 12 + 0.3; } }
        } else { mal = null; malmarkor.style.display = "none"; }
      }

      const len = Math.hypot(vx, vy);
      if (len > 0) {
        if (len > 1) { vx /= len; vy /= len; }
        let nx = pos.x + vx * fart * dt;
        let ny = Math.max(4, Math.min(K.H - 4, pos.y + vy * fart * dt));
        if (bat && tangenter.size && !Karta.arVatten(K, nx, ny)) {
          // Mjukt stopp vid land: glid längs kusten om det går
          if (Karta.arVatten(K, nx, pos.y)) ny = pos.y;
          else if (Karta.arVatten(K, pos.x, ny)) nx = pos.x;
          else { nx = pos.x; ny = pos.y; }
        }
        if (K.runt) {
          if ((nx < 0 || nx >= K.W) && !sagtRunt) {
            sagtRunt = true;
            ctx.prata("Jorden är rund! Du kom ut på andra sidan kartan.");
          }
          nx = Karta.norm(K, nx);
        } else nx = Math.max(0, Math.min(K.W, nx));
        const steg = Math.hypot(Karta.dx(K, pos.x, nx), ny - pos.y);
        fardat += steg;
        if (steg > 0.01) {
          const mv = Math.atan2(ny - pos.y, Karta.dx(K, pos.x, nx)) * 180 / Math.PI;
          let diff = ((mv - vinkel + 540) % 360) - 180;
          vinkel += diff * Math.min(1, dt * 8);
          if (Math.abs(vx) > 0.15) vand = vx < 0 ? -1 : 1;
        }
        // Spår efter fordonet
        const sista = sparPunkter[sparPunkter.length - 1];
        if (!sista || Math.hypot(sista.x - nx, sista.y - ny) > 6) {
          sparPunkter.push({ x: nx, y: ny, ny: sista && Math.abs(sista.x - nx) > K.W / 2 });
          if (sparPunkter.length > 90) sparPunkter.shift();
          spar.setAttribute("d", sparPunkter.map((p, i) => (i === 0 || p.ny ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(""));
        }
        pos = { x: nx, y: ny };
        if (bat) havTid += dt;
      }

      kontrollera(dt);
      rita(dt);
    });

    function rita(dt) {
      const gung = bat ? Math.sin(performance.now() / 300) * 0.8 : 0;
      fordon.setAttribute("transform", `translate(${pos.x.toFixed(1)},${(pos.y + gung).toFixed(1)}) scale(${fskala.toFixed(2)})`);
      inre.setAttribute("transform", bat ? `scale(${vand},1)` : `rotate(${vinkel.toFixed(1)})${framme ? " scale(.75)" : ""}`);
      overText.setAttribute("x", pos.x);
      overText.setAttribute("y", pos.y - 26 * fskala);
      if (overTimer > 0) { overTimer -= dt; if (overTimer <= 0) overText.style.opacity = 0; }
    }

    let kollTid = 0;
    function kontrollera(dt) {
      kollTid += dt;
      if (kollTid < 0.12) return;
      kollTid = 0;
      const mo = K.omraden[u.till.kartomrade];

      // Framme?
      let ar = false;
      if (mo.typ === "hav") ar = Karta.havVid(K, pos.x, pos.y)?.id === mo.id && !Karta.landVid(K, pos.x, pos.y);
      else ar = bat ? Karta.nara(K, mo, pos.x, pos.y, 14) : Karta.iOmrade(mo, Karta.norm(K, pos.x), pos.y);
      if (ar) return framKommen();

      // Planet: berätta vad man flyger över
      if (!bat) {
        const o = Karta.vid(K, pos.x, pos.y);
        const id = o ? o.id : null;
        if (id !== senasteOmr) {
          senasteOmr = id;
          const pl = id && ctx.platsFor(id);
          if (pl) {
            overText.textContent = pl.namn;
            overText.style.opacity = 1;
            overTimer = 1.8;
            const nu = performance.now();
            if (!Tal.pratar && nu - senastSagt > 2500) { senastSagt = nu; Tal.saga(pl.namn, { ljud: pl.ljud }); }
          }
        }
      }

      // Båten: Globi frågar vilket hav man är på
      if (bat && cfg.fraga) {
        const h = Karta.havVid(K, pos.x, pos.y);
        const id = h ? h.id : null;
        if (id !== senasteHav) { senasteHav = id; havTid = 0; }
        const pl = id && ctx.platsFor(id);
        if (pl && pl.niva === niva.id && havTid > 1.2 && fardat > 80 && antalFragor < 2 &&
            !fragade.has(id) && id !== u.till.kartomrade && !Tal.pratar) {
          fragade.add(id);
          antalFragor++;
          stallFraga(pl);
          return;
        }
      }

      // Tips om det tar lång tid
      if (tid > nastaTips) {
        nastaTips = tid + 18;
        hjalp = true;
        R.blinka(u.till.kartomrade, u.till.farg);
        ctx.prata(`${u.till.namn} blinkar. ${verb} dit!`);
      }
    }

    function framKommen() {
      framme = true;
      pausad = true;
      mal = null; vag = null; tangenter.clear();
      malmarkor.style.display = "none";
      klara++;
      Ljud.ratt();
      UI.konfetti(30);
      R.farga(u.till.kartomrade, u.till.farg);
      R.etikett(u.till.kartomrade, u.till.namn);
      if (u.till.niva === niva.id) ctx.registrera(u.till, !hjalp);
      ctx.prata(bat ? `Framme! Du seglade till ${u.till.namn}!` : `Du landade i ${u.till.namn}! ${beromt()}`);
      ctx.efter(2800, startaUppdrag);
    }

    /* ----- Frågan under seglatsen ----- */
    function stallFraga(ratt) {
      pausad = true;
      tangenter.clear(); // båten fortsätter mot samma mål efter frågan
      const andra = UI.blanda(ctx.platser.filter((p) => p !== ratt)).slice(0, 2);
      const alt = UI.blanda([ratt, ...andra]);
      let forsta = true;
      const panel = UI.el("div", { class: "fragepanel" }, UI.el("h3", {}, "⛵ " + cfg.fraga));
      const grid = UI.el("div", { class: "svarsgrid" });
      const lager = UI.el("div", { class: "overlagg nere" }, panel);
      const kort = alt.map((p) => UI.svarskort(p, K, (valt, k) => {
        if (valt === ratt) {
          k.classList.add("ratt");
          Ljud.ratt();
          ctx.registrera(ratt, forsta);
          ctx.prata(`${beromt()} Du seglar på ${ratt.namn}.`);
          ctx.efter(1600, () => { lager.remove(); pausad = false; });
        } else {
          if (forsta) ctx.registrera(ratt, false);
          forsta = false;
          Ljud.fel();
          UI.animera(k, "fel", 600);
          const rk = kort[alt.indexOf(ratt)];
          UI.animera(rk, "blinka", 2500);
          ctx.prata(`Det där är ${valt.namn}. Kortet som blinkar är rätt – tryck på det!`);
        }
      }));
      kort.forEach((k) => grid.append(k));
      panel.append(grid);
      ram.append(lager);
      Ljud.plopp();
      ctx.prata(cfg.fraga);
    }

    startaUppdrag();
  },
};
