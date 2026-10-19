# 🎮 Majsan och Stinis spelhörna – guide

Det här är en liten webbplats som samlar dina spel på en startsida.
Den här guiden visas också på GitHub, så du kan alltid gå tillbaka hit.

## Vad finns i mappen?

| Fil / mapp | Vad är det? | Behöver du ändra? |
|---|---|---|
| `index.html` | Startsidan med alla spelkort | Nej |
| `spel.js` | **Listan med spel** (namn, ikon, beskrivning) | **Ja – när du lägger till spel** |
| `spel/` | Mappen där själva spelfilerna ligger | Ja – lägg nya spel här |
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
2. **Ladda upp spelet:** gå till ditt repository på GitHub → klicka på mappen **spel**
   → **Add file** → **Upload files** → dra in filen → **Commit changes**.
3. **Lägg till spelet i listan:** gå tillbaka till startsidan av ditt repository →
   klicka på **spel.js** → klicka på pennan ✏️ (Edit) uppe till höger.
4. Kopiera ett av de befintliga blocken och klistra in det sist i listan, före `];`. Exempel:

   ```js
     {
       namn: "Rymdkatten",
       fil: "rymdkatten.html",
       ikon: "🐱",
       farg: "lila",
       beskrivning: "Styr katten genom rymden och samla stjärnor.",
       styrning: "touch",
     },
   ```

   - `farg` kan vara: `gul`, `gron`, `bla`, `rosa`, `lila`, `orange`
   - `styrning` är `touch` om spelet går att spela på surfplatta,
     eller `tangentbord` om det kräver piltangenter.
5. Klicka **Commit changes**. Efter en minut syns spelet på sidan.

> **Om sidan blir tom efter en ändring** har det oftast blivit fel med ett
> kommatecken eller ett citattecken i `spel.js`. Jämför med blocken ovanför –
> varje rad slutar med `,` och varje block slutar med `},`.

Vill du byta namn på hela sidan? Ändra `SIDANS_NAMN` högst upp i `spel.js`.

---

## Bra att veta om vem som kan se sidan

- Sidan är **inte lösenordsskyddad**. Den som har länken kan öppna den,
  och den kan skickas vidare.
- Sidan är inställd så att **Google och andra sökmotorer inte ska lista den**,
  så folk hittar den i praktiken bara via din länk.
- Själva koden i ditt repository går också att se för den som letar upp ditt
  GitHub-konto. Lägg därför aldrig in personuppgifter, namn på elever eller
  liknande i spelen.

## Bra att veta om sparade spel
Hunddagiset sparar spelarens framsteg i webbläsaren. Det betyder att
framstegen finns kvar på samma dator/surfplatta och i samma webbläsare,
men följer inte med till en annan enhet.
