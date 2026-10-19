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
//     ikon         – en emoji som syns på kortet
//     farg         – kortets färg (välj bland: gul, gron, bla, rosa, lila, orange)
//     beskrivning  – en kort mening om spelet
//     styrning     – "touch" (fungerar på surfplatta/mobil och dator)
//                    eller "tangentbord" (kräver dator med tangentbord)
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
    beskrivning: "Ta hand om hundarna, lär dem trix och gör ditt dagis finare.",
    styrning: "touch",
  },
  {
    namn: "Djurpolisen",
    fil: "djurpolisen.html",
    ikon: "🚓",
    farg: "gron",
    beskrivning: "Kör polisbilen, fånga tjuvarna – men akta djuren på vägen!",
    styrning: "touch",
  },
  {
    namn: "Raketen",
    fil: "raketen.html",
    ikon: "🚀",
    farg: "lila",
    beskrivning: "Flyg mellan planeter och lös mattegåtor. Från förskoleklass till åk 6.",
    styrning: "touch",
  },
  {
    namn: "Bokstavsjakten",
    fil: "bokstavsjakten.html",
    ikon: "🔤",
    farg: "bla",
    beskrivning: "Spring, hoppa och fånga bubblan med rätt bokstav – eller stava ord.",
    styrning: "touch",
  },
  {
    namn: "Hundvakten",
    fil: "hundvakten.html",
    ikon: "🐕",
    farg: "rosa",
    beskrivning: "Mata, bada och gå på promenad med din hund. Lär den nya trix!",
    styrning: "touch",
  },
];
