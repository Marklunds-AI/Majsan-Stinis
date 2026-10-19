// ============================================================
//  HÄR LÄGGER DU TILL NYA SPEL
// ============================================================
//
//  1. Lägg spelets .html-fil i mappen "spel".
//     Använd ett enkelt filnamn: små bokstäver, inga mellanslag,
//     inga å/ä/ö. Exempel: rymdkatten.html
//
//  2. Kopiera ett av blocken nedan (från { till },) och klistra in
//     det sist i listan. Ändra texterna.
//
//     namn         – spelets namn
//     fil          – filnamnet i mappen "spel"
//     ikon         – en emoji som syns på kortet när det inte finns en bild
//     bild         – (valfritt) en bild på spelet, t.ex. "bilder/rymdkatten.png"
//                    Lägg bilden i mappen "bilder". Utan bild visas ikonen.
//     farg         – kortets färg: gul, gron, bla, rosa, lila, orange eller turkos
//     skapare      – vem som gjort spelet: "majsan", "stini" eller "tillsammans"
//     beskrivning  – en kort, kul mening om spelet
//     styrning     – kort instruktion om hur man styr, t.ex. "👆 Tryck och dra"
//
//  Tips: glöm inte kommatecknet efter } om fler spel följer.
// ============================================================

const SIDANS_NAMN = "Majsan och Stinis spelhörna";
const SIDANS_UNDERRUBRIK = "Välj ett spel och sätt igång!";

const SPEL = [
  {
    namn: "Hunddagiset",
    fil: "hunddagiset.html",
    ikon: "🐶",
    farg: "gul",
    skapare: "majsan",
    beskrivning: "Driv ditt eget hunddagis! Ta hand om vovvarna, lär dem trix och bygg ut dagiset.",
    styrning: "👆 Tryck och dra",
  },
  {
    namn: "Djurpolisen",
    fil: "djurpolisen.html",
    ikon: "🚓",
    farg: "gron",
    skapare: "tillsammans",
    beskrivning: "Tuta och kör! Fånga tjuvarna – men akta de söta djuren på vägen.",
    styrning: "⌨️ Piltangenter eller ◀ ▶",
  },
  {
    namn: "Raketen",
    fil: "raketen.html",
    ikon: "🚀",
    farg: "lila",
    skapare: "majsan",
    beskrivning: "Susa mellan planeter och lös mattegåtor. Från förskoleklass till åk 6.",
    styrning: "👆 Styr med fingret",
  },
  {
    namn: "Bokstavsjakten",
    fil: "bokstavsjakten.html",
    ikon: "🔤",
    farg: "turkos",
    skapare: "stini",
    beskrivning: "Spring, hoppa och fånga bubblan med rätt bokstav – eller stava hela ord!",
    styrning: "⌨️ Pilar & mellanslag eller 👆",
  },
  {
    namn: "Hundvakten",
    fil: "hundvakten.html",
    ikon: "🐕",
    farg: "rosa",
    skapare: "stini",
    beskrivning: "Mata, bada och gå på promenad med din hund. Lär den nya trix!",
    styrning: "👆 Tryck och dra",
  },
];
