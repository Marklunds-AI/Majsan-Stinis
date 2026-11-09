/* ============================================================
   VEM BOR VAR?  – en ledtråd läses upp, eleven väljer rätt plats
   bland 3–4 kort. Korten visar en liten karta, så det går att
   spela utan att kunna läsa.
   ============================================================ */
LAGEN.vembor = {
  namn: "Vem bor var?",
  ikon: "🔎",
  beskrivning: "Lyssna på ledtråden och välj rätt plats.",
  starta(ctx) {
    const { K, platser } = ctx;
    const medLedtrad = platser.filter((p) => p.ledtradar && p.ledtradar.length);
    const fragor = UI.runda(medLedtrad, SPELINSTALLNINGAR.fragorPerRunda);
    const antalAlt = platser.length >= 6 ? 4 : 3;
    const prickar = ctx.prickar(fragor.length);
    const anvanda = new Set();

    const lyssna = UI.el("button", { class: "lyssna", type: "button", "aria-label": "Lyssna på ledtråden", html: "🔊" });
    const text = UI.el("p");
    const kort = UI.el("div", { class: "ledtrad" }, UI.el("span", { class: "lt-ikon", "aria-hidden": "true" }, "🕵️"), text, lyssna);
    const grid = UI.el("div", { class: "svarsgrid" });
    ctx.yta.append(kort, grid);
    ctx.pa(lyssna, "click", () => Tal.saga(text.textContent));

    let index = 0, ratt = 0;

    function nasta() {
      if (index >= fragor.length) {
        return ctx.avsluta({ rubrik: "Bra spanat!", text: `Du löste ${fragor.length} ledtrådar. ${ratt} klarade du direkt!` });
      }
      const mal = fragor[index];
      prickar.nu(index);
      // Välj en ledtråd som inte använts i den här rundan
      const val = mal.ledtradar.filter((l) => !anvanda.has(l));
      const ledtrad = (val.length ? val : mal.ledtradar)[Math.floor(Math.random() * (val.length || mal.ledtradar.length))];
      anvanda.add(ledtrad);
      text.textContent = ledtrad;
      UI.animera(kort, "ny", 400);
      ctx.prata("Vem bor var? Lyssna!", { tyst: true });
      Tal.saga(ledtrad);

      const alt = UI.blanda([mal, ...UI.blanda(platser.filter((p) => p !== mal)).slice(0, antalAlt - 1)]);
      let forsta = true, last = false;
      grid.innerHTML = "";
      grid.style.gridTemplateColumns = innerWidth > 640 ? `repeat(${alt.length}, minmax(0, 1fr))` : "";
      const korten = alt.map((p) => UI.svarskort(p, K, (valt, k) => {
        if (last) return;
        if (valt === mal) {
          last = true;
          k.classList.add("ratt");
          Ljud.ratt();
          ctx.registrera(mal, forsta);
          if (forsta) ratt++;
          prickar.satt(index, forsta ? "ratt" : "klar");
          index++;
          ctx.prata(`${beromt()} Det är ${mal.namn}.`);
          ctx.efter(2000, nasta);
        } else {
          if (forsta) ctx.registrera(mal, false);
          forsta = false;
          Ljud.fel();
          UI.animera(k, "fel", 600);
          UI.animera(korten[alt.indexOf(mal)], "blinka", 2500);
          ctx.prata(`Det där är ${valt.namn}. Titta på kortet som blinkar och försök igen!`);
        }
      }));
      korten.forEach((k) => grid.append(k));
    }
    nasta();
  },
};
