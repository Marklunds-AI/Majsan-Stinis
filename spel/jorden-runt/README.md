# 🌍 Jorden runt med Globi

Ett spel för lågstadiet (6–9 år) om världsdelar och världshav. Eleven reser med
Globi, samlar stämplar i ett pass och ser kartan lysa upp. All text läses upp, så
spelet går att spela utan att kunna läsa.

## Mappar och filer

| Fil / mapp | Vad är det? | Ändra? |
|---|---|---|
| `index.html` | Själva sidan | Sällan |
| `stil.css` | Utseendet | Sällan |
| `data/platser.js` | **Nivåer, platser, färger, ledtrådar, båtresor** | **Ja – här byggs spelet ut** |
| `data/karta.js` | Kartans former (land och hav) | Bara för nya kartor/områden |
| `js/karta.js` | Kartmotorn (ritar, "vad ligger här?", sjövägar) | Nej |
| `js/grund.js` | Uppläsning, ljud, sparade framsteg | Nej |
| `js/app.js` | Startsida, menyer, passet, lärarläget | Nej |
| `js/lagen/` | Ett spelläge per fil | Nej |

Spellägen: **Hitta!**, **Kartpusslet**, **Resan**, **Vem bor var?**, **Memory**, **Blixtrundan**.
Alla läser från samma lista i `data/platser.js` – inget spelläge känner till
"Afrika" eller "Atlanten" i sin kod.

## Lägg till en ny nivå på världskartan

Exempel: en nivå 3 med några stora berg eller öknar som redan finns som områden?
Oftast vill man ha **nya områden**, se nästa avsnitt. Men om områdena redan finns
räcker två steg:

1. Lägg till nivån i listan `NIVAER` i `data/platser.js`:

   ```js
     {
       id: "min-niva",
       nummer: 3,
       namn: "Min nivå",
       ikon: "⭐",
       karta: "varlden",
       fraga: "Var ligger {namn}?",
       resan: { fordon: "flyg", verb: "Flyg" },
     },
   ```

2. Lägg till platserna i listan `PLATSER`, med `niva: "min-niva"`:

   ```js
     {
       id: "sahara", namn: "Sahara", kategori: "oken", niva: "min-niva",
       kartomrade: "sahara", farg: "#f2cd4f", ikon: "🐪",
       ledtradar: ["Världens största varma öken.", "Här bor kameler."],
     },
   ```

Klart! Nivån syns på startsidan, i passet, i lärarläget och i alla spellägen.

## Lägg till nya områden (former) på kartan

Öppna `data/karta.js` och lägg till ett område under `omraden`:

```js
      sahara: {
        typ: "land",              // "land" eller "hav"
        mitt: [10, 23],           // där namnet står: [longitud, latitud]
        former: [
          [[-15,20],[0,30],[30,30],[32,20],[10,15]],   // punkter runt formen
        ],
      },
```

Punkterna är `[longitud, latitud]` i grader – slå upp dem på t.ex. Google Maps
(högerklicka på kartan). Håll formerna enkla: 5–30 punkter räcker.
**Obs:** ett nytt landområde ritas ovanpå världsdelarna, så det "tar" trycket där.

## En helt ny karta (t.ex. Norden)

1. Kopiera blocket `varlden` i `data/karta.js`, döp om det till `norden`.
2. Ändra `projektion` så att bara Norden syns, t.ex.
   `{ vanster: 0, hoger: 35, topp: 72, botten: 54, bredd: 1000, hojd: 900 }`
   och sätt `runt: false`.
3. Rita länderna (och haven runt) som områden.
4. Skapa en nivå med `karta: "norden"` och platser som pekar på områdena.

## Bra att veta

- **Båtresor** (`resan.uppdrag`) använder platsernas `hamnar` – punkter i vattnet där
  båten startar. Båten hittar själv vägen runt land.
- **Ljudfiler:** lägg t.ex. `ljud/afrika.mp3` i spelmappen och skriv
  `ljud: "ljud/afrika.mp3"` på platsen. Då spelas inspelningen i stället för
  datorrösten när namnet sägs.
- **Stämplar:** en plats får sin stämpel efter 3 rätt i rad på första försöket
  (ändra `rattIRadForStampel` överst i `platser.js`).
- **Lärarläge:** kugghjulet ⚙️ på startsidan. Välj nivåer och spellägen, stäng av
  klockan i Blixtrundan och nollställ passet.
- **Inget skickas någonstans.** Passet och rekorden sparas bara i webbläsaren
  (localStorage) på den enhet man spelar på.
- Färgerna på världsdelarna följer kartan i läxboken.
