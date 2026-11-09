/* ============================================================
   MEMORY  – para ihop en liten karta med rätt namn.
   ============================================================ */
LAGEN.memory = {
  namn: "Memory",
  ikon: "🃏",
  beskrivning: "Vänd två kort. Hitta kartan och namnet som hör ihop.",
  starta(ctx) {
    const { K, platser } = ctx;
    const valda = UI.blanda(platser).slice(0, SPELINSTALLNINGAR.memoryPar);
    const kortData = UI.blanda(valda.flatMap((p) => [{ p, typ: "karta" }, { p, typ: "namn" }]));
    const grid = UI.el("div", { class: "memorygrid" });
    ctx.yta.append(grid);
    const poang = UI.el("span", { class: "poang" }, `0 / ${valda.length}`);
    ctx.status.append(poang);

    let uppe = [], last = false, par = 0, drag = 0;

    kortData.forEach((d, i) => {
      const fram = d.typ === "karta"
        ? Karta.mini(K, d.p.kartomrade, d.p.farg)
        : `<span class="mk-ikon">${d.p.ikon || "📍"}</span><span class="mk-namn">${d.p.namn}</span>`;
      const k = UI.el("button", { class: "mkort", type: "button", "aria-label": "Kort " + (i + 1),
        html: `<span class="mkort-inner"><span class="mkort-sida mkort-bak">🌍</span><span class="mkort-sida mkort-fram">${fram}</span></span>` });
      k.style.animation = `pop-in .4s ${i * 40}ms backwards`;
      setTimeout(() => (k.style.animation = ""), 1200);
      d.el = k;
      ctx.pa(k, "click", () => vand(d));
      grid.append(k);
    });

    // Räkna ut hur många kolumner som får plats bäst
    function anpassa() {
      const b = grid.clientWidth, h = grid.clientHeight, n = kortData.length;
      if (!b || !h) return;
      let bast = 2, bastStorlek = 0;
      for (let kol = 2; kol <= n; kol++) {
        const rader = Math.ceil(n / kol);
        const bredd = Math.min((b - (kol - 1) * 10) / kol, ((h - (rader - 1) * 10) / rader) * (4 / 3));
        if (bredd > bastStorlek) { bastStorlek = bredd; bast = kol; }
      }
      grid.style.gridTemplateColumns = `repeat(${bast}, ${Math.floor(bastStorlek)}px)`;
    }
    const ro = new ResizeObserver(anpassa);
    ro.observe(grid);
    ctx.vidSlut(() => ro.disconnect());

    function vand(d) {
      if (last || d.klar || uppe.includes(d)) return;
      Ljud.plopp();
      d.el.classList.add("vand");
      uppe.push(d);
      if (d.typ === "namn") Tal.namn(d.p);
      if (uppe.length < 2) return;
      drag++;
      const [a, b] = uppe;
      if (a.p === b.p) {
        a.klar = b.klar = true;
        uppe = [];
        par++;
        poang.textContent = `${par} / ${valda.length}`;
        ctx.efter(350, () => {
          a.el.classList.add("par"); b.el.classList.add("par");
          Ljud.ratt();
          ctx.prata(`${beromt()} Det är ${a.p.namn}!`);
          if (par === valda.length) {
            ctx.efter(2000, () => ctx.avsluta({ rubrik: "Alla par hittade!", text: `Du hittade ${par} par på ${drag} försök.` }));
          }
        });
      } else {
        last = true;
        ctx.efter(1300, () => {
          a.el.classList.remove("vand"); b.el.classList.remove("vand");
          uppe = [];
          last = false;
        });
      }
    }

    ctx.prata("Vänd två kort i taget. Hitta kartan och namnet som hör ihop!");
  },
};
