# 🎮 Majsan och Stinis spelhörna – guide

Det här är en liten webbplats som samlar dina spel på en startsida.
Den här guiden visas också på GitHub, så du kan alltid gå tillbaka hit.

## Vad finns i mappen?

| Fil / mapp | Vad är det? | Behöver du ändra? |
|---|---|---|
| `index.html` | Startsidan med alla spelkort | Nej |
| `spel.js` | **Listan med spel** (namn, ikon, beskrivning) | **Ja – när du lägger till spel** |
| `spel/` | Mappen där själva spelfilerna ligger | Ja – lägg nya spel här |
| `bilder/` | Bilderna på spelkorten | Ja – om nya spel ska ha bild |
| `tillbaka.js` | Hem-knappen 🏠 som finns i alla spel | Nej |
| `ikoner/`, `manifest.json` | App-ikonen när sidan läggs på hemskärmen | Nej |
| `recept.html` | Sidan med Majsans recept | Nej |
| `recept.js` | **Listan med recept** och Majsans betyg | **Ja – när ni lägger till recept** |
| `recept/` | Receptbilderna | Ja – lägg nya receptbilder här |
| `README.md` | Den här guiden | Nej |

---

## Del 1: Lägg upp sidan på GitHub (görs en gång)

### 1. Skapa ett konto
Gå till <https://github.com> och skapa ett gratis konto om du inte har ett.
Ditt användarnamn blir en del av adressen till sidan, så välj något du gillar.

### 2. Skapa ett "repository" (en projektmapp på GitHub)
1. Klicka på **+** uppe till höger → **New repository**.
2. **Repository name:** t.ex. `spelhornan` (små bokstäver, inga mellanslag, inga å/ä/ö).
3. Välj **Public**.
4. Kryssa i **Add a README file** behöver du *inte* göra.
5. Klicka **Create repository**.

### 3. Ladda upp filerna
1. På sidan som visas, klicka på länken **uploading an existing file**.
2. Öppna mappen `spelhornan` på din dator. Markera **allt som ligger i den**
   (`index.html`, `spel.js`, `README.md` och mappen `spel`) och dra in det i webbläsarfönstret.
   *Dra in innehållet – inte själva mappen `spelhornan`.*
3. Klicka den gröna knappen **Commit changes** längst ner.

### 4. Slå på GitHub Pages (gör filerna till en webbsida)
1. Klicka på **Settings** (kugghjulet i menyn överst i ditt repository).
2. Välj **Pages** i menyn till vänster.
3. Under **Branch**: välj `main` och mappen `/ (root)`. Klicka **Save**.
4. Vänta 1–2 minuter och ladda om sidan. Överst står nu adressen, ungefär:

   `https://marklunds-ai.github.io/Majsan-Stinis/`

Det är den länken du delar. 🎉

---

## Del 2: Lägg till ett nytt spel

1. **Ge spelfilen ett enkelt namn** på din dator, t.ex. `rymdkatten.html`
   (små bokstäver, inga mellanslag, inga å/ä/ö).
2. **Lägg till hem-knappen 🏠** (valfritt men bra): öppna spelfilen och klistra in den här
   raden precis före `</body>` längst ner:

   ```html
   <script src="../tillbaka.js" data-pos="bottom-left"></script>
   ```

   `data-pos` väljer hörn: `bottom-left`, `bottom-right`, `top-left`, `top-right`
   eller `bottom-center`. Välj ett hörn där knappen inte skymmer spelet.
   Det enklaste är att be Claude göra det.
3. **Ladda upp spelet:** gå till ditt repository på GitHub → klicka på mappen **spel**
   → **Add file** → **Upload files** → dra in filen → **Commit changes**.
4. **Lägg till spelet i listan:** gå tillbaka till startsidan av ditt repository →
   klicka på **spel.js** → klicka på pennan ✏️ (Edit) uppe till höger.
5. Kopiera ett av de befintliga blocken och klistra in det sist i listan, före `];`. Exempel:

   ```js
     {
       namn: "Rymdkatten",
       fil: "rymdkatten.html",
       ikon: "🐱",
       farg: "lila",
       skapare: "stinis",
       beskrivning: "Styr katten genom rymden och samla stjärnor.",
       styrning: "👆 Tryck och dra",
       alder: "6–10 år",
       tillagd: "2026-11-02",
     },
   ```

   - `farg` kan vara: `gul`, `gron`, `bla`, `rosa`, `lila`, `orange`, `turkos`
   - `skapare` kan vara: `majsan`, `stinis` eller `tillsammans`.
     Den syns som en etikett i hörnet av kortet.
   - `styrning` är en kort text om hur man styr, t.ex. `⌨️ Piltangenter`.
   - `alder` är vilken ålder spelet passar, t.ex. `4–7 år` eller `Alla åldrar`.
   - `tillagd` är dagens datum (år-månad-dag). Då får kortet ett **✨ Nytt!**-märke
     som försvinner av sig självt efter 30 dagar.
   - Vill du ha en **bild på kortet** i stället för emojin? Lägg bilden i en mapp
     som heter `bilder` och lägg till raden `bild: "bilder/rymdkatten.png",`.
6. Klicka **Commit changes**. Efter en minut syns spelet på sidan.

När spelen har olika skapare dyker det automatiskt upp knappar under sökfältet,
så att man kan visa bara Majsans eller bara Stinis spel.

> **Om sidan blir tom efter en ändring** har det oftast blivit fel med ett
> kommatecken eller ett citattecken i `spel.js`. Jämför med blocken ovanför –
> varje rad slutar med `,` och varje block slutar med `},`.

Vill du byta namn på hela sidan? Ändra `SIDANS_NAMN` högst upp i `spel.js`.

---

## Del 3: Lägg till ett nytt recept 🧁

1. **Ge receptbilden ett enkelt namn**, t.ex. `kladdkaka.jpg`
   (små bokstäver, inga mellanslag, inga å/ä/ö).
2. **Ladda upp bilden:** gå till ditt repository på GitHub → klicka på mappen **recept**
   → **Add file** → **Upload files** → dra in bilden → **Commit changes**.
3. **Lägg till receptet i listan:** klicka på **recept.js** → pennan ✏️ (Edit).
4. Kopiera blocket och klistra in det **överst** i listan, direkt efter `const RECEPT = [`:

   ```js
     {
       namn: "Kladdkaka",
       bild: "recept/kladdkaka.jpg",
       antal: "8 bitar",
       svarighet: 2,
       smarrighet: 5,
       kommentar: "Godast med grädde!",
       tillagd: "2026-11-02",
     },
   ```

   - `svarighet` och `smarrighet` är Majsans betyg, 0–5 bakslevar.
     Halva går bra – skriv med **punkt**: `3.5`, inte `3,5`.
   - `kommentar` är valfri. Den visas som ett citat från Majsan.
   - `tillagd` ger receptet ett **✨ Nytt!**-märke i 30 dagar.
5. Klicka **Commit changes**. Efter en minut syns receptet.

Det enklaste är förstås att skicka bilden och betygen till Claude. 😊

---

## Bra att veta om vem som kan se sidan

- Sidan är **inte lösenordsskyddad**. Den som har länken kan öppna den,
  och den kan skickas vidare.
- Sidan är inställd så att **Google och andra sökmotorer inte ska lista den**,
  så folk hittar den i praktiken bara via din länk.
- Själva koden i ditt repository går också att se för den som letar upp ditt
  GitHub-konto. Lägg därför aldrig in personuppgifter, namn på elever eller
  liknande i spelen.

## Lägg spelhörnan som en app på iPad 📱

1. Öppna <https://marklunds-ai.github.io/Majsan-Stinis/> i **Safari** på iPaden.
2. Tryck på **dela-knappen** (fyrkanten med en pil uppåt ⬆️). Den sitter uppe till höger
   eller i adressfältet.
3. Bläddra ner och tryck **Lägg till på hemskärmen**.
4. Tryck **Lägg till** uppe till höger.

Nu finns en 🎮-ikon som heter **Spelhörnan** bland apparna. Den öppnas i helskärm,
utan adressfält. I spelen kommer man tillbaka till startsidan med 🏠-knappen.

> **Obs!** Appen på hemskärmen och Safari sparar spelen var för sig. Framsteg
> man gjort i Safari syns alltså inte i appen (och tvärtom). Välj ett sätt att
> spela på och håll er till det.

## Bra att veta om sparade spel
Flera av spelen sparar framstegen i webbläsaren. Det betyder att
framstegen finns kvar på samma dator/surfplatta och i samma webbläsare,
men följer inte med till en annan enhet.
