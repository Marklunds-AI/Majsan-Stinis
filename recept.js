// ============================================================
//  HÄR LÄGGER DU TILL NYA RECEPT 🧁
// ============================================================
//
//  1. Lägg receptbilden i mappen "recept".
//     Använd ett enkelt filnamn: små bokstäver, inga mellanslag,
//     inga å/ä/ö. Exempel: kladdkaka.jpg
//
//  2. Kopiera blocket nedan (från { till },) och klistra in det
//     ÖVERST i listan, så att det nyaste receptet syns först.
//
//     namn         – receptets namn
//     bild         – receptbilden, t.ex. "recept/kladdkaka.jpg"
//     antal        – (valfritt) hur mycket det blir, t.ex. "ca 20 kakor"
//     smarrighet   – Majsans betyg för hur gott det är, 0–5 bakslevar
//                    (halva går bra, t.ex. 3.5 – använd punkt, inte komma).
//                    Ta bort raden om Majsan inte har bakat receptet än –
//                    då står det "Inte provsmakat än" på kortet.
//     kommentar    – (valfritt) vad Majsan tycker, t.ex. "Bäst med mycket sylt!"
//     tillagd      – (valfritt) dagen receptet kom in, t.ex. "2026-11-02".
//                    Då får kortet ett "✨ Nytt!"-märke i 30 dagar.
//
//  Tips: glöm inte kommatecknet efter } om fler recept följer.
// ============================================================

const RECEPT = [
  {
    namn: "Supergoda chokladbollar",
    bild: "recept/chokladbollar.jpg",
    antal: "ca 20 st",
    tillagd: "2026-10-21",
  },
  {
    namn: "Supergoda hallongrottor",
    bild: "recept/hallongrottor.jpg",
    antal: "ca 20 kakor",
    smarrighet: 3.5,
    tillagd: "2026-10-21",
  },
];
