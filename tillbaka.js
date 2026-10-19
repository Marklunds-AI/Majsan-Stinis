// ============================================================
//  HEM-KNAPPEN 🏠
//  Visar en liten rund knapp i spelen som leder tillbaka till
//  startsidan. Första trycket visar "Tryck igen för att gå hem",
//  så att man inte råkar lämna spelet av misstag.
//
//  Lägg till i ett spel, precis före </body>:
//    <script src="../tillbaka.js" data-pos="bottom-left"></script>
//
//  data-pos väljer hörn: top-left, top-right, bottom-left,
//  bottom-right, top-center eller bottom-center.
//  data-x och data-y (valfritt) flyttar knappen längre in från kanten,
//  t.ex. data-x="84px" om spelet redan har en knapp i hörnet.
// ============================================================
(function () {
  const skript = document.currentScript;
  const pos = (skript && skript.dataset.pos) || "bottom-left";
  const [lodrat, vagrat] = pos.split("-");

  // Stil för knappen
  const stil = document.createElement("style");
  stil.textContent = `
    .hem-knapp{
      position:fixed; z-index:2147483000; box-sizing:border-box;
      display:flex; align-items:center; justify-content:center; gap:8px;
      height:48px; min-width:48px; padding:0 12px;
      border-radius:999px; text-decoration:none;
      font:600 16px 'Fredoka',ui-rounded,'Segoe UI',system-ui,sans-serif;
      color:#2a2150; background:rgba(255,255,255,.88);
      box-shadow:0 4px 14px rgba(0,0,0,.22);
      -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
      -webkit-tap-highlight-color:transparent; user-select:none; -webkit-user-select:none;
      opacity:.8; transition:opacity .2s, transform .15s, background .2s;
    }
    .hem-knapp:hover,.hem-knapp.fragar{opacity:1}
    .hem-knapp:active{transform:scale(.94)}
    .hem-knapp .hem-ikon{font-size:22px; line-height:1}
    .hem-knapp .hem-text{display:none; white-space:nowrap}
    .hem-knapp.fragar{background:#ffc23d}
    .hem-knapp.fragar .hem-text{display:inline}
    .hem-knapp:focus-visible{outline:4px solid #8b5cf6; outline-offset:2px}
  `;
  document.head.appendChild(stil);

  const knapp = document.createElement("a");
  knapp.className = "hem-knapp";
  knapp.href = "../";
  knapp.setAttribute("aria-label", "Till spelhörnan");
  knapp.innerHTML = '<span class="hem-ikon" aria-hidden="true">🏠</span><span class="hem-text">Tryck igen för att gå hem</span>';

  // Placering, med hänsyn till iPadens/telefonens skärmkanter
  const x = (skript && skript.dataset.x) || "12px";
  const y = (skript && skript.dataset.y) || "12px";
  if (lodrat === "top") knapp.style.top = `calc(${y} + env(safe-area-inset-top, 0px))`;
  else knapp.style.bottom = `calc(${y} + env(safe-area-inset-bottom, 0px))`;
  if (vagrat === "left") knapp.style.left = `calc(${x} + env(safe-area-inset-left, 0px))`;
  else if (vagrat === "right") knapp.style.right = `calc(${x} + env(safe-area-inset-right, 0px))`;
  else { knapp.style.left = "0"; knapp.style.right = "0"; knapp.style.margin = "0 auto"; knapp.style.width = "fit-content"; }

  // Två tryck: första frågar, andra går hem
  let timer = null;
  knapp.addEventListener("click", (e) => {
    if (knapp.classList.contains("fragar")) return; // andra trycket – länken följs
    e.preventDefault();
    knapp.classList.add("fragar");
    clearTimeout(timer);
    timer = setTimeout(() => knapp.classList.remove("fragar"), 3000);
  });
  // Hindra att trycket även påverkar spelet under knappen
  ["pointerdown", "touchstart", "mousedown"].forEach((t) =>
    knapp.addEventListener(t, (e) => e.stopPropagation(), { passive: true })
  );

  document.body.appendChild(knapp);
})();
