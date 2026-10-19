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
//     skapare      – vem som gjort spelet: "majsan", "stinis" eller "tillsammans"
//     beskrivning  – en kort, kul mening om spelet
//     styrning     – kort instruktion om hur man styr, t.ex. "👆 Tryck och dra"
//     alder        – vilken ålder spelet passar, t.ex. "4–7 år" eller "Alla åldrar"
//     tillagd      – (valfritt) dagen spelet kom in, t.ex. "2026-11-02".
//                    Då får kortet ett "✨ Nytt!"-märke i 30 dagar.
//
//  Tips: glöm inte kommatecknet efter } om fler spel följer.
// ============================================================

const SIDANS_NAMN = "Majsan och Stinis spelhörna";
const SIDANS_UNDERRUBRIK = "Välj ett spel och sätt igång!";

const SPEL = [
  {
    namn: "Hunddagiset",
    fil: "hunddagiset.html",
    bild: "bilder/hunddagiset.jpg",
    ikon: "🐶",
    farg: "gul",
    skapare: "majsan",
    beskrivning: "Driv ditt eget hunddagis! Ta hand om vovvarna, lär dem trix och bygg ut dagiset.",
    styrning: "👆 Tryck och dra",
    alder: "Alla åldrar",
  },
  {
    namn: "Djurpolisen",
    fil: "djurpolisen.html",
    bild: "bilder/djurpolisen.jpg",
    ikon: "🚓",
    farg: "gron",
    skapare: "tillsammans",
    beskrivning: "Tuta och kör! Fånga tjuvarna – men akta de söta djuren på vägen.",
    styrning: "⌨️ Piltangenter eller ◀ ▶",
    alder: "4–7 år",
  },
  {
    namn: "Raketen",
    fil: "raketen.html",
    bild: "bilder/raketen.jpg",
    ikon: "🚀",
    farg: "lila",
    skapare: "majsan",
    beskrivning: "Susa mellan planeter och lös mattegåtor. Från förskoleklass till åk 6.",
    styrning: "👆 Styr med fingret",
    alder: "6–12 år",
  },
  {
    namn: "Bokstavsjakten",
    fil: "bokstavsjakten.html",
    bild: "bilder/bokstavsjakten.jpg",
    ikon: "✏️",
    farg: "turkos",
    skapare: "stinis",
    beskrivning: "Spring, hoppa och fånga bubblan med rätt bokstav – eller stava hela ord!",
    styrning: "⌨️ Pilar & mellanslag eller 👆",
    alder: "4–7 år",
  },
  {
    namn: "Hundvakten",
    fil: "hundvakten.html",
    bild: "bilder/hundvakten.jpg",
    ikon: "🐕",
    farg: "rosa",
    skapare: "stinis",
    beskrivning: "Mata, bada och gå på promenad med din hund. Lär den nya trix!",
    styrning: "👆 Tryck och dra",
    alder: "4–7 år",
  },
];
