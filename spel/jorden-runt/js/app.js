/* ============================================================
   APPEN: startsida, menyer, passet, lärarläget och "ramen"
   runt varje spelläge.
   ============================================================ */
const App = (() => {
  const { $, el } = UI;
  const ORDNING = ["hitta", "pussel", "resan", "vembor", "memory", "blixt"];
  let valdNiva = null;
  let spel = null; // det spel som pågår just nu

  const nivaFor = (plats) => NIVAER.find((n) => n.id === plats.niva);
  const platserI = (niva) => PLATSER.filter((p) => p.niva === niva.id);
  const synligaNivaer = () => NIVAER.filter((n) => !Framsteg.inst.doldaNivaer.includes(n.id));
  const synligaLagen = () => ORDNING.filter((id) => LAGEN[id] && !Framsteg.inst.doldaLagen.includes(id));
  const lageIkon = (id, niva) => (typeof LAGEN[id].ikon === "function" ? LAGEN[id].ikon(niva) : LAGEN[id].ikon);
  const lageNamn = (id, niva) => (typeof LAGEN[id].namn === "function" ? LAGEN[id].namn(niva) : LAGEN[id].namn);
  const lageBeskr = (id, niva) => (typeof LAGEN[id].beskrivning === "function" ? LAGEN[id].beskrivning(niva) : LAGEN[id].beskrivning);

  /* ============ STARTSIDAN ============ */
  let startKarta = null;
  function visaStart(saga = true) {
    stoppaSpel();
    UI.visa("start");
    // Rita startkartan: klarade platser lyser i sin färg
    const ram = $("#startkarta");
    if (!startKarta) {
      const K = Karta.ladda(NIVAER[0].karta);
      startKarta = Karta.montera(ram, K, { klass: "startkarta-svg" });
      startKarta.svg.addEventListener("pointerdown", (e) => {
        const p = startKarta.tillKarta(e);
        const o = Karta.vid(K, p.x, p.y);
        const plats = o && PLATSER.find((pl) => pl.kartomrade === o.id && nivaFor(pl).karta === K.id);
        if (!plats) return;
        Ljud.plopp();
        startKarta.blinka(o.id, plats.farg);
        UI.prata(Framsteg.harStampel(plats.id) ? `${plats.namn}! Där har du redan en stämpel.` : `${plats.namn}!`, { ljud: null });
      });
    }
    startKarta.rensa();
    for (const plats of PLATSER) {
      if (nivaFor(plats).karta !== startKarta.K.id) continue;
      if (Framsteg.harStampel(plats.id)) {
        startKarta.farga(plats.kartomrade, plats.farg);
        startKarta.etikett(plats.kartomrade, plats.ikon || "⭐", "ikon-etikett");
      }
    }
    // Nivåknappar
    const val = $("#nivaval");
    val.innerHTML = "";
    for (const niva of synligaNivaer()) {
      const platser = platserI(niva);
      const antal = platser.filter((p) => Framsteg.harStampel(p.id)).length;
      const knapp = el("button", { class: "nivakort", type: "button" },
        el("span", { class: "niva-ikon", "aria-hidden": "true" }, niva.ikon || "🌐"),
        el("span", { class: "niva-text" },
          el("small", {}, "Nivå " + niva.nummer),
          el("b", {}, niva.namn),
          el("span", { class: "niva-stamplar" }, `🏅 ${antal} av ${platser.length} stämplar`)),
        el("span", { class: "niva-pil", "aria-hidden": "true" }, "▶"));
      knapp.addEventListener("click", () => { Ljud.klick(); visaLagen(niva); });
      val.append(knapp);
    }
    if (saga) UI.prata("Hej! Jag heter Globi. Följ med mig jorden runt! Välj en nivå.");
    kollaFirande();
  }

  /* ============ VÄLJ SPELLÄGE ============ */
  function visaLagen(niva) {
    stoppaSpel();
    valdNiva = niva;
    UI.visa("lagen");
    $("#lagen-rubrik").textContent = `Nivå ${niva.nummer} · ${niva.namn}`;
    const grid = $("#lagesgrid");
    grid.innerHTML = "";
    const lista = synligaLagen();
    lista.forEach((id, i) => {
      const kort = el("div", { class: "lageskort", style: `--i:${i}` });
      const knapp = el("button", { class: "lage-huvud", type: "button" },
        el("span", { class: "lage-ikon", "aria-hidden": "true" }, lageIkon(id, niva)),
        el("b", {}, lageNamn(id, niva)),
        el("span", { class: "lage-beskr" }, lageBeskr(id, niva)));
      if (id === "blixt" && Framsteg.inst.tid && Framsteg.basta(niva.id))
        knapp.append(el("span", { class: "lage-basta" }, "🏆 Bästa: " + Framsteg.basta(niva.id)));
      knapp.addEventListener("click", () => { Ljud.klick(); startaLage(id, niva); });
      const lyssna = el("button", { class: "svar-lyssna", type: "button", "aria-label": "Lyssna: " + lageNamn(id, niva), html: "🔊" });
      lyssna.addEventListener("click", () => UI.prata(lageNamn(id, niva) + ". " + lageBeskr(id, niva)));
      kort.append(knapp, lyssna);
      grid.append(kort);
    });
    if (!lista.length) grid.append(el("p", { class: "tomt" }, "Inga spel är valda. Be en vuxen öppna kugghjulet ⚙️ på startsidan."));
    UI.prata(`${niva.namn}! Välj ett spel.`);
  }

  /* ============ STARTA ETT SPELLÄGE ============ */
  function startaLage(lageId, niva) {
    stoppaSpel();
    const K = Karta.ladda(niva.karta);
    const yta = $("#spelyta");
    yta.innerHTML = "";
    yta.className = "spelyta lage-" + lageId;
    const status = $("#spel-status");
    status.innerHTML = "";
    const stada = [];
    const ctx = {
      niva, K, yta, status, lageId,
      platser: platserI(niva),
      aktiv: true,
      nyaStamplar: [],
      prata: (t, o) => (ctx.aktiv ? UI.prata(t, o) : Promise.resolve()),
      efter(ms, fn) { const t = setTimeout(() => ctx.aktiv && fn(), ms); stada.push(() => clearTimeout(t)); return t; },
      pa(mal, typ, fn, o) { mal.addEventListener(typ, fn, o); stada.push(() => mal.removeEventListener(typ, fn, o)); },
      vidSlut(fn) { stada.push(fn); },
      loop(fn) {
        let forra = performance.now(), id = 0;
        const steg = (nu) => { if (!ctx.aktiv) return; fn(Math.min(0.05, (nu - forra) / 1000)); forra = nu; id = requestAnimationFrame(steg); };
        id = requestAnimationFrame(steg);
        stada.push(() => cancelAnimationFrame(id));
      },
      // Vilken plats hör ett kartområde till? (alla nivåer på samma karta)
      platsFor: (oid) => PLATSER.find((p) => p.kartomrade === oid && nivaFor(p).karta === K.id) || null,
      karta(behallare, opt) { const R = Karta.montera(behallare, K, opt); stada.push(() => R.ro.disconnect()); return R; },
      registrera: (plats, ratt) => registrera(ctx, plats, ratt),
      prickar(antal) {
        const rad = el("div", { class: "prickar", "aria-hidden": "true" });
        const p = [];
        for (let i = 0; i < antal; i++) { const e = el("i"); p.push(e); rad.append(e); }
        status.append(rad);
        return { satt(i, k) { if (p[i]) p[i].className = k; }, nu(i) { p.forEach((e, j) => e.classList.toggle("nu", j === i)); } };
      },
      avsluta: (res) => slut(ctx, res),
      fraga: (plats) => (niva.fraga || "Var ligger {namn}?").replace("{namn}", plats.namn),
    };
    spel = { ctx, stada, lageId, niva };
    UI.visa("spel");
    $("#spel-text").textContent = "";
    LAGEN[lageId].starta(ctx);
  }

  function stoppaSpel() {
    if (!spel) return;
    spel.ctx.aktiv = false;
    spel.stada.forEach((f) => { try { f(); } catch (e) {} });
    document.querySelectorAll(".dras-flyt").forEach((e) => e.remove());
    spel = null;
    Tal.stoppa();
  }

  function registrera(ctx, plats, ratt) {
    const ny = Framsteg.registrera(plats.id, ratt);
    if (ny) {
      ctx.nyaStamplar.push(plats);
      UI.stampelAvisering(plats);
    }
    return ny;
  }

  // Firande när alla platser i en nivå har stämplar
  function kollaFirande() {
    for (const niva of NIVAER) {
      const p = platserI(niva);
      if (p.length && !Framsteg.arFirad(niva.id) && p.every((x) => Framsteg.harStampel(x.id))) {
        Framsteg.fira(niva.id);
        visaFirande(niva);
        return true;
      }
    }
    return false;
  }
  function visaFirande(niva) {
    const d = $("#firande");
    $("#firande-text").textContent = `Hurra! Du har stämplar för alla ${niva.namn.toLowerCase()}!`;
    d.hidden = false;
    Ljud.fanfar();
    UI.konfetti(140);
    setTimeout(() => UI.konfetti(80), 1200);
    Tal.saga(`Hurra! Du har klarat alla ${niva.namn.toLowerCase()}! Du är en riktig världsresenär!`);
  }

  /* ============ SLUTSKÄRMEN ============ */
  function slut(ctx, res = {}) {
    const { niva, lageId, nyaStamplar } = ctx;
    stoppaSpel();
    UI.visa("slut");
    $("#slut-rubrik").textContent = res.rubrik || "Bra jobbat!";
    $("#slut-text").textContent = res.text || "";
    const st = $("#slut-stamplar");
    st.innerHTML = "";
    if (nyaStamplar.length) {
      st.append(el("p", { class: "slut-ny" }, "Nya stämplar i passet:"));
      const rad = el("div", { class: "stampelrad" });
      nyaStamplar.forEach((p) => rad.append(el("span", { html: UI.stampel(p) })));
      st.append(rad);
    }
    $("#slut-igen").onclick = () => { Ljud.klick(); startaLage(lageId, niva); };
    $("#slut-lagen").onclick = () => { Ljud.klick(); visaLagen(niva); };
    UI.konfetti(res.rekord ? 120 : 60);
    Ljud.fanfar();
    UI.prata(res.tal || [res.rubrik || "Bra jobbat!", res.text].filter(Boolean).join(" "));
    $("#slut-text").textContent = res.text || ""; // rubriken står redan ovanför
    setTimeout(kollaFirande, 900);
  }

  /* ============ PASSET ============ */
  function visaPass() {
    stoppaSpel();
    UI.visa("pass");
    const sidor = $("#pass-sidor");
    sidor.innerHTML = "";
    let totalt = 0, har = 0;
    for (const niva of synligaNivaer()) {
      const platser = platserI(niva);
      const sida = el("section", { class: "pass-sida" },
        el("h3", {}, `${niva.ikon || ""} Nivå ${niva.nummer} · ${niva.namn}`));
      const grid = el("div", { class: "pass-grid" });
      for (const p of platser) {
        totalt++;
        const ok = Framsteg.harStampel(p.id);
        if (ok) har++;
        const b = el("button", { class: "pass-plats" + (ok ? "" : " saknas"), type: "button", "aria-label": p.namn,
          html: UI.stampel(p, !ok) + `<span class="pass-namn">${ok ? p.namn : "?"}</span>` +
            (ok ? `<span class="pass-datum">${Framsteg.stampelDatum(p.id)}</span>` : "") });
        b.addEventListener("click", () => {
          UI.prata(ok ? `${p.namn}. Den stämpeln har du!` : `Den här stämpeln saknas. Svara rätt tre gånger i rad för att få den!`);
        });
        grid.append(b);
      }
      sida.append(grid);
      sidor.append(sida);
    }
    UI.prata(har ? `Ditt pass! Du har ${har} av ${totalt} stämplar.` : "Ditt pass är tomt än så länge. Spela för att samla stämplar!");
  }

  /* ============ LÄRARLÄGET ============ */
  function visaInstallningar() {
    const d = $("#installningar");
    const nv = $("#inst-nivaer"), lg = $("#inst-lagen");
    nv.innerHTML = ""; lg.innerHTML = "";
    const inst = Framsteg.inst;
    for (const n of NIVAER) {
      nv.append(el("label", { class: "inst-rad" },
        el("input", { type: "checkbox", "data-niva": n.id, checked: !inst.doldaNivaer.includes(n.id) }),
        ` Nivå ${n.nummer} · ${n.namn}`));
    }
    for (const id of ORDNING) {
      if (!LAGEN[id]) continue;
      lg.append(el("label", { class: "inst-rad" },
        el("input", { type: "checkbox", "data-lage": id, checked: !inst.doldaLagen.includes(id) }),
        ` ${typeof LAGEN[id].ikon === "function" ? LAGEN[id].ikon(NIVAER[0]) : LAGEN[id].ikon} ${lageNamn(id, NIVAER[0])}`));
    }
    $("#inst-tid").checked = inst.tid;
    $("#inst-info").textContent = "";
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function sparaInstallningar() {
    const inst = Framsteg.inst;
    inst.doldaNivaer = [...document.querySelectorAll("#inst-nivaer input")].filter((i) => !i.checked).map((i) => i.dataset.niva);
    inst.doldaLagen = [...document.querySelectorAll("#inst-lagen input")].filter((i) => !i.checked).map((i) => i.dataset.lage);
    inst.tid = $("#inst-tid").checked;
    Framsteg.sparaInst();
  }

  /* ============ KOPPLA IHOP ============ */
  function init() {
    // Globi på alla skärmar
    document.querySelectorAll("[data-globi]").forEach((e) => (e.innerHTML = UI.globi(e.dataset.globi)));
    // Lyssna-knappar upprepar det senaste Globi sa
    document.querySelectorAll(".lyssna").forEach((b) => b.addEventListener("click", () => { Ljud.klick(); Tal.upprepa(); }));

    $("#starta").addEventListener("click", () => {
      Ljud.lasUpp();
      $("#startlager").hidden = true;
      visaStart(true);
    });
    $("#till-pass").addEventListener("click", () => { Ljud.klick(); visaPass(); });
    $("#pass-tillbaka").addEventListener("click", () => { Ljud.klick(); visaStart(false); UI.prata("Välj en nivå!"); });
    $("#lagen-tillbaka").addEventListener("click", () => { Ljud.klick(); visaStart(false); UI.prata("Välj en nivå!"); });
    $("#spel-tillbaka").addEventListener("click", () => { Ljud.klick(); visaLagen(spel ? spel.niva : valdNiva); });
    $("#slut-start").addEventListener("click", () => { Ljud.klick(); visaStart(false); UI.prata("Välj en nivå!"); });
    $("#firande-ok").addEventListener("click", () => { $("#firande").hidden = true; Tal.stoppa(); });

    // Lärarläget
    $("#kugg").addEventListener("click", visaInstallningar);
    $("#installningar").addEventListener("change", (e) => { if (e.target.matches("input")) sparaInstallningar(); });
    $("#inst-stang").addEventListener("click", () => {
      sparaInstallningar();
      $("#installningar").close ? $("#installningar").close() : $("#installningar").removeAttribute("open");
      visaStart(false);
    });
    $("#inst-nollstall").addEventListener("click", () => {
      if (confirm("Vill du nollställa alla stämplar och rekord? Det går inte att ångra.")) {
        Framsteg.nollstall();
        $("#inst-info").textContent = "Klart! Passet och rekorden är nollställda.";
      }
    });

    // Snabbtangent: Escape = tillbaka
    addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || $("#installningar").open) return;
      if (UI.aktiv === "spel") visaLagen(spel ? spel.niva : valdNiva);
      else if (UI.aktiv === "lagen" || UI.aktiv === "pass") visaStart(false);
    });

    visaStart(false);
  }

  return { init, visaStart, visaLagen, startaLage, platserI, nivaFor };
})();

addEventListener("DOMContentLoaded", App.init);
