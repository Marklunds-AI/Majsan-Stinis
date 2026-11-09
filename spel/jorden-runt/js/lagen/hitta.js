/* ============================================================
   HITTA!  – Globi säger ett namn, eleven trycker på kartan.
   Motorn används också av Blixtrundan (blixt.js).
   ============================================================ */
const BEROM = ["Ja!", "Rätt!", "Snyggt!", "Toppen!", "Bra!", "Precis!"];
const beromt = () => BEROM[Math.floor(Math.random() * BEROM.length)];

// Visa havsgränser om nivån handlar om hav
const harHav = (ctx) => ctx.platser.some((p) => ctx.K.omraden[p.kartomrade]?.typ === "hav");

function hittaMotor(ctx, opt = {}) {
  const { K, platser } = ctx;
  const blixt = !!opt.blixt;
  const ram = UI.el("div", { class: "kartram" });
  ctx.yta.append(ram);
  const R = ctx.karta(ram, { klass: harHav(ctx) ? "visa-hav" : "" });

  const fragor = opt.antal ? UI.runda(platser, opt.antal) : null;
  const prickar = fragor && !blixt ? ctx.prickar(fragor.length) : null;
  let index = 0, mal = null, forsta = true, last = true, ratt = 0;

  function nasta() {
    if (fragor && index >= fragor.length) return opt.klar(ratt, index);
    mal = fragor ? fragor[index] : UI.slumpa(platser, mal);
    forsta = true;
    last = false;
    R.rensa();
    prickar?.nu(index);
    ctx.prata(ctx.fraga(mal), { tyst: opt.tyst });
    if (opt.tyst) Tal.saga(ctx.fraga(mal));
  }

  ctx.pa(R.svg, "pointerdown", (e) => {
    if (!mal || last || opt.pausad?.()) return;
    const p = R.tillKarta(e);
    const o = Karta.vid(K, p.x, p.y);
    if (!o) return;
    const plats = ctx.platsFor(o.id);
    if (plats && plats.id === mal.id) {
      last = true;
      R.farga(o.id, mal.farg);
      R.etikett(o.id, mal.namn);
      Ljud.ratt();
      ctx.registrera(mal, forsta);
      if (forsta) ratt++;
      prickar?.satt(index, forsta ? "ratt" : "klar");
      opt.vidRatt?.(forsta);
      index++;
      ctx.prata(`${beromt()} Där ligger ${mal.namn}!`);
      ctx.efter(blixt ? 900 : 1800, nasta);
    } else {
      if (forsta) ctx.registrera(mal, false);
      forsta = false;
      Ljud.fel();
      R.skaka(o.id);
      if (plats) {
        R.etikett(o.id, plats.namn, "tillfallig", p.x != null ? [p.x, p.y] : null);
        ctx.efter(1600, () => R.taBortEtikett(o.id));
      }
      R.blinka(mal.kartomrade, mal.farg);
      ctx.prata(plats ? `Där ligger ${plats.namn}. ${mal.namn} blinkar – tryck där!` : `${mal.namn} blinkar – tryck där!`);
    }
  });

  return { starta: nasta, R, get ratt() { return ratt; } };
}

LAGEN.hitta = {
  namn: "Hitta!",
  ikon: "👆",
  beskrivning: "Globi säger ett namn. Tryck på rätt ställe på kartan.",
  starta(ctx) {
    const m = hittaMotor(ctx, {
      antal: SPELINSTALLNINGAR.fragorPerRunda,
      klar: (ratt, antal) => ctx.avsluta({
        rubrik: "Bra hittat!",
        text: `Du hittade alla ${antal}! ${ratt} av dem klarade du på första försöket.`,
      }),
    });
    ctx.prata("Lyssna på vad jag säger och tryck på kartan!").then(() => ctx.efter(150, m.starta));
  },
};
