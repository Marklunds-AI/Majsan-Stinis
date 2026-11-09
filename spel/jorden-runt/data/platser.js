// ============================================================
//  PLATSER OCH NIVÅER – allt innehåll i "Jorden runt med Globi"
// ============================================================
//
//  Alla spellägen läser härifrån. En ny nivå kräver alltså bara
//  nya rader här (och ibland nya former i karta.js) – ingen ny spelkod.
//  Se README.md för en steg-för-steg-guide.
//
//  Tips: varje rad slutar med kommatecken, varje block med },
// ============================================================

// Små inställningar för hela spelet
const SPELINSTALLNINGAR = {
  fragorPerRunda: 6,        // hur många frågor en runda har (Hitta!, Vem bor var?)
  rattIRadForStampel: 3,    // så många rätt i rad (första försöket) ger en stämpel
  blixtSekunder: 60,        // Blixtrundans längd
  blixtFragorUtanTid: 15,   // antal frågor i Blixtrundan när tidtagning är avstängd
  resorPerRunda: 3,         // hur många resor en runda av Resan har
  memoryPar: 6,             // max antal par i Memory
};

// ------------------------------------------------------------
//  NIVÅER
//    id        – kort namn utan å/ä/ö och mellanslag
//    nummer    – visas som "Nivå 1", "Nivå 2" …
//    namn      – visas och läses upp
//    ikon      – emoji på nivåknappen
//    karta     – vilken karta i karta.js som används
//    fraga     – vad Globi säger i Hitta! ({namn} byts mot platsens namn)
//    resan     – hur Resan fungerar:
//                  fordon: "flyg" (flyger över allt) eller "bat" (bara på vatten)
//                  verb:   "Flyg" / "Segla" – används i uppdragen
//                  fraga:  (valfri) fråga under resan om var man är
//                  uppdrag:(valfri) lista med resor { fran, till, text }.
//                          Utan lista hittar spelet på resor mellan nivåns platser.
// ------------------------------------------------------------
const NIVAER = [
  {
    id: "varldsdelar",
    nummer: 1,
    namn: "Världsdelar",
    ikon: "🌍",
    karta: "varlden",
    fraga: "Var ligger {namn}?",
    resan: { fordon: "flyg", verb: "Flyg" },
  },
  {
    id: "varldshav",
    nummer: 2,
    namn: "Världshav",
    ikon: "🌊",
    karta: "varlden",
    fraga: "Var ligger {namn}?",
    resan: {
      fordon: "bat",
      verb: "Segla",
      fraga: "Vilket hav seglar du på nu?",
      uppdrag: [
        { fran: "afrika", till: "oceanien" },
        { fran: "europa", till: "nordamerika" },
        { fran: "asien", till: "sydamerika" },
        { fran: "europa", till: "norra-ishavet", text: "Segla till Norra ishavet!" },
        { fran: "sydamerika", till: "sodra-ishavet", text: "Segla till Södra ishavet!" },
        { fran: "nordamerika", till: "afrika" },
        { fran: "oceanien", till: "afrika" },
      ],
    },
  },
];

// ------------------------------------------------------------
//  PLATSER
//    id          – kort namn utan å/ä/ö och mellanslag
//    namn        – visas och läses upp
//    kategori    – "varldsdel" eller "hav" (eller en ny, t.ex. "land")
//    niva        – vilken nivå platsen hör till (id från listan ovan)
//    kartomrade  – vilket område i karta.js som är platsen
//    farg        – färgen när platsen lyser på kartan
//    ikon        – emoji på stämpeln i passet
//    ledtradar   – korta ledtrådar till "Vem bor var?"
//    ljud        – (valfritt) inspelning av namnet, t.ex. "ljud/afrika.mp3".
//                  Spelas i stället för datorrösten när namnet sägs.
//    hamnar      – (valfritt) var båten startar, [longitud, latitud] i vattnet
// ------------------------------------------------------------
const PLATSER = [
  // ---------- Nivå 1: Världsdelar ----------
  {
    id: "europa", namn: "Europa", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "europa", farg: "#f2cd4f", ikon: "🏰",
    ledtradar: [
      "Här ligger Sverige!",
      "Här står Eiffeltornet i Paris.",
      "Här finns Alperna, där många åker skidor.",
      "Här byggdes riddarborgar för länge sedan.",
    ],
    hamnar: [[-13, 46]],
  },
  {
    id: "asien", namn: "Asien", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "asien", farg: "#c968b6", ikon: "🐼",
    ledtradar: [
      "Det här är den största världsdelen.",
      "Här bor pandan.",
      "Här ligger världens högsta berg, Mount Everest.",
      "Här finns Kinesiska muren.",
    ],
    hamnar: [[88, 15], [126, 29]],
  },
  {
    id: "afrika", namn: "Afrika", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "afrika", farg: "#9fd3ae", ikon: "🦁",
    ledtradar: [
      "Här bor lejonet, giraffen och zebran.",
      "Här ligger Sahara, en jättestor öken.",
      "Här finns pyramiderna i Egypten.",
      "Här flyter Nilen, en av världens längsta floder.",
    ],
    hamnar: [[-22, 11], [45, -8]],
  },
  {
    id: "nordamerika", namn: "Nordamerika", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "nordamerika", farg: "#f0873a", ikon: "🦬",
    ledtradar: [
      "Här ligger USA och Kanada.",
      "Här står Frihetsgudinnan i New York.",
      "Här bor bävern och grizzlybjörnen.",
      "Den stora ön Grönland hör till den här världsdelen.",
    ],
    hamnar: [[-66, 36], [-130, 42]],
  },
  {
    id: "sydamerika", namn: "Sydamerika", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "sydamerika", farg: "#f2a3d6", ikon: "🦜",
    ledtradar: [
      "Här finns Amazonas, den största regnskogen.",
      "Här bor lamor och tukaner.",
      "Här ligger Brasilien, där många älskar fotboll.",
      "Här finns Anderna, en jättelång bergskedja.",
    ],
    hamnar: [[-31, -12], [-85, -18]],
  },
  {
    id: "oceanien", namn: "Oceanien", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "oceanien", farg: "#4fae7c", ikon: "🦘",
    ledtradar: [
      "Här bor kängurun och koalan.",
      "Här ligger Australien och Nya Zeeland.",
      "Den minsta världsdelen, med massor av öar.",
      "Här finns Stora barriärrevet med färgglada fiskar.",
    ],
    hamnar: [[106, -28], [160, -28]],
  },
  {
    id: "antarktis", namn: "Antarktis", kategori: "varldsdel", niva: "varldsdelar",
    kartomrade: "antarktis", farg: "#ad9c91", ikon: "🐧",
    ledtradar: [
      "Här bor pingviner.",
      "Den kallaste platsen på jorden.",
      "Här är det is nästan överallt.",
      "Här bor bara forskare, och inga barn.",
    ],
    hamnar: [[-20, -64]],
  },

  // ---------- Nivå 2: Världshav ----------
  {
    id: "stilla-havet", namn: "Stilla havet", kategori: "hav", niva: "varldshav",
    kartomrade: "stilla-havet", farg: "#4a8fe0", ikon: "🐋",
    ledtradar: [
      "Det största havet på jorden.",
      "Havet mellan Asien och Amerika.",
      "Här finns de allra djupaste ställena i havet.",
      "Mitt i det här havet ligger öarna Hawaii.",
    ],
  },
  {
    id: "atlanten", namn: "Atlanten", kategori: "hav", niva: "varldshav",
    kartomrade: "atlanten", farg: "#22b3bf", ikon: "🐬",
    ledtradar: [
      "Havet mellan Europa och Nordamerika.",
      "Havet mellan Afrika och Sydamerika.",
      "Christofer Columbus seglade över det här havet.",
      "Det näst största havet på jorden.",
    ],
  },
  {
    id: "indiska-oceanen", namn: "Indiska oceanen", kategori: "hav", niva: "varldshav",
    kartomrade: "indiska-oceanen", farg: "#6a72e0", ikon: "🐢",
    ledtradar: [
      "Havet mellan Afrika och Australien.",
      "Söder om Indien ligger det här havet.",
      "Här ligger den stora ön Madagaskar.",
      "Ett varmt hav där havssköldpaddor simmar.",
    ],
  },
  {
    id: "norra-ishavet", namn: "Norra ishavet", kategori: "hav", niva: "varldshav",
    kartomrade: "norra-ishavet", farg: "#7fcdf5", ikon: "🐻‍❄️",
    ledtradar: [
      "Havet runt Nordpolen.",
      "Här simmar isbjörnar mellan isflaken.",
      "Det minsta havet, högst upp på jordgloben.",
      "Havet norr om Sverige, Ryssland och Kanada.",
    ],
  },
  {
    id: "sodra-ishavet", namn: "Södra ishavet", kategori: "hav", niva: "varldshav",
    kartomrade: "sodra-ishavet", farg: "#3d7bb0", ikon: "🦭",
    ledtradar: [
      "Havet runt Antarktis.",
      "Här simmar pingviner och sälar.",
      "Det kalla havet längst ner på jordgloben.",
      "Här flyter stora isberg.",
    ],
  },
];
