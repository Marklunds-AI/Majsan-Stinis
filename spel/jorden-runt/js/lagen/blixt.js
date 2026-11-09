/* ============================================================
   BLIXTRUNDAN  – så många Hitta!-frågor som möjligt på 60 sekunder.
   Personbästa sparas per nivå. Med tidtagning avstängd (lärarläget)
   blir det ett bestämt antal frågor utan klocka.
   ============================================================ */
LAGEN.blixt = {
  namn: "Blixtrundan",
  ikon: "⚡",
  beskrivning: () => (Framsteg.inst.tid
    ? `Hitta så många du kan på ${SPELINSTALLNINGAR.blixtSekunder} sekunder!`
    : `${SPELINSTALLNINGAR.blixtFragorUtanTid} snabba Hitta!-frågor i rad.`),

  starta(ctx) {
    const medTid = Framsteg.inst.tid;
    const sek = SPELINSTALLNINGAR.blixtSekunder;
    let igang = false, kvar = sek;

    const poang = UI.el("span", { class: "poang" }, "⭐ 0");
    ctx.status.append(poang);
    let linje = null, linjeText = null;
    if (medTid) {
      linjeText = UI.el("span", {}, sek + " s");
      linje = UI.el("div", { class: "tidlinje" }, UI.el("i"), linjeText);
      ctx.status.prepend(linje);
    }

    const m = hittaMotor(ctx, {
      blixt: true,
      antal: medTid ? 0 : SPELINSTALLNINGAR.blixtFragorUtanTid,
      pausad: () => !igang,
      vidRatt: () => { poang.textContent = "⭐ " + m.ratt; UI.animera(poang, "pop", 400); },
      klar: (ratt, antal) => avsluta(ratt, antal),
    });

    function avsluta(ratt, antal) {
      igang = false;
      if (!medTid) {
        return ctx.avsluta({ rubrik: "Blixtsnabbt!", text: `Du hittade alla ${antal}! ${ratt} klarade du direkt.` });
      }
      const rekord = Framsteg.sattBasta(ctx.niva.id, ratt);
      ctx.avsluta({
        rubrik: rekord && ratt > 0 ? "🏆 Nytt rekord!" : "Tiden är ute!",
        text: `Du hittade ${ratt} ${ratt === 1 ? "plats" : "platser"} på ${sek} sekunder.` +
          (rekord && ratt > 0 ? "" : ` Ditt bästa är ${Framsteg.basta(ctx.niva.id)}.`),
        rekord,
      });
    }

    // Startknapp, så att eleven hinner bli redo
    const lager = UI.el("div", { class: "overlagg" },
      UI.el("button", { class: "stor-knapp gron jattestor", type: "button" }, "⚡ Kör!"));
    ctx.yta.querySelector(".kartram").append(lager);
    ctx.pa(lager.firstChild, "click", () => {
      lager.remove();
      igang = true;
      m.starta();
      if (!medTid) return;
      const slut = performance.now() + sek * 1000;
      let forra = sek;
      ctx.loop(() => {
        if (!igang) return;
        kvar = Math.max(0, (slut - performance.now()) / 1000);
        linje.firstChild.style.transform = `scaleX(${kvar / sek})`;
        const hel = Math.ceil(kvar);
        if (hel !== forra) { forra = hel; linjeText.textContent = hel + " s"; if (hel <= 5 && hel > 0) Ljud.tick(); }
        if (kvar <= 0) avsluta(m.ratt, 0);
      });
    });
    const best = Framsteg.basta(ctx.niva.id);
    ctx.prata(medTid
      ? `Hitta så många du kan på ${sek} sekunder!` + (best ? ` Ditt rekord är ${best}.` : "") + " Tryck på Kör när du är redo!"
      : "Svara på så många frågor du kan. Tryck på Kör när du är redo!");
  },
};
