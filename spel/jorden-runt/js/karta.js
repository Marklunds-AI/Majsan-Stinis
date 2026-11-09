/* ============================================================
   KARTMOTORN
   Gör om formerna i data/karta.js till en SVG-karta, svarar på
   "vad ligger här?" och räknar ut sjövägar åt båten.
   Allt är generiskt – den vet ingenting om världsdelar eller hav.
   ============================================================ */
const Karta = (() => {
  const SVGNS = "http://www.w3.org/2000/svg";
  const cache = {};
  let unik = 0;

  /* ---------- Ladda och projicera en karta ---------- */
  function ladda(kartaId) {
    if (cache[kartaId]) return cache[kartaId];
    const k = KARTOR[kartaId];
    if (!k) throw new Error("Kartan finns inte i karta.js: " + kartaId);
    const p = k.projektion;
    const W = p.bredd, H = p.hojd;
    const proj = ([lon, lat]) => [
      Math.round(((lon - p.vanster) / (p.hoger - p.vanster)) * W * 10) / 10,
      Math.round(((p.topp - lat) / (p.topp - p.botten)) * H * 10) / 10,
    ];
    const K = { id: kartaId, W, H, runt: !!k.runt, omraden: {}, proj, landLista: [], havLista: [] };
    for (const [id, o] of Object.entries(k.omraden)) {
      const former = o.former.map((f) => f.map(proj));
      const omr = { id, typ: o.typ, former, mitt: proj(o.mitt), ram: ramFor(former) };
      omr.d = pathD(K, former, o.typ === "land");
      K.omraden[id] = omr;
      (o.typ === "land" ? K.landLista : K.havLista).push(omr);
    }
    cache[kartaId] = K;
    return K;
  }

  function ramFor(former) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const f of former) for (const [x, y] of f) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { x0, y0, x1, y1 };
  }

  // Mjuka, rundade kanter på land (barnvänligt). Punkter på kartans kant hålls raka.
  function pathD(K, former, mjuk) {
    const kant = ([x, y]) => x <= 0.5 || x >= K.W - 0.5 || y <= 0.5 || y >= K.H - 0.5;
    const r = (v) => Math.round(v * 10) / 10;
    const mid = (a, b) => [r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)];
    return former.map((f) => {
      if (!mjuk || f.length < 4) return "M" + f.map((p) => p.join(",")).join("L") + "Z";
      const n = f.length;
      let d = "M" + (kant(f[0]) ? f[0] : mid(f[n - 1], f[0])).join(",");
      for (let i = 0; i < n; i++) {
        const p = f[i], q = f[(i + 1) % n];
        if (kant(p)) d += "L" + p.join(",") + "L" + mid(p, q).join(",");
        else d += "Q" + p.join(",") + " " + mid(p, q).join(",");
      }
      return d + "Z";
    }).join("");
  }

  /* ---------- Vad ligger var? ---------- */
  const norm = (K, x) => (K.runt ? ((x % K.W) + K.W) % K.W : x);
  // Kortaste skillnad i x (tar hänsyn till att jorden är rund)
  const dx = (K, a, b) => {
    let d = b - a;
    if (K.runt) { if (d > K.W / 2) d -= K.W; else if (d < -K.W / 2) d += K.W; }
    return d;
  };

  function iForm(x, y, f) {
    let inne = false;
    for (let i = 0, j = f.length - 1; i < f.length; j = i++) {
      const xi = f[i][0], yi = f[i][1], xj = f[j][0], yj = f[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inne = !inne;
    }
    return inne;
  }
  function iOmrade(o, x, y) {
    const r = o.ram;
    if (x < r.x0 || x > r.x1 || y < r.y0 || y > r.y1) return false;
    return o.former.some((f) => iForm(x, y, f));
  }
  function landVid(K, x, y) {
    x = norm(K, x);
    return K.landLista.find((o) => iOmrade(o, x, y)) || null;
  }
  function havVid(K, x, y) {
    x = norm(K, x);
    return K.havLista.find((o) => iOmrade(o, x, y)) || null;
  }
  // Det som syns överst: land före hav
  const vid = (K, x, y) => landVid(K, x, y) || havVid(K, x, y);
  // Är punkten inom 'radie' från området?
  function nara(K, o, x, y, radie) {
    if (iOmrade(o, norm(K, x), y)) return true;
    for (let i = 0; i < 12; i++) {
      const v = (i / 12) * Math.PI * 2;
      if (iOmrade(o, norm(K, x + Math.cos(v) * radie), y + Math.sin(v) * radie)) return true;
    }
    return false;
  }

  /* ---------- Rita kartan i en ruta ---------- */
  function montera(behallare, K, opt = {}) {
    const id = "k" + ++unik;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${K.W} ${K.H}`);
    svg.setAttribute("class", "karta" + (opt.klass ? " " + opt.klass : ""));
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Världskarta");
    svg.innerHTML =
      `<defs><clipPath id="${id}-klipp"><rect width="${K.W}" height="${K.H}" rx="22"/></clipPath></defs>` +
      `<g clip-path="url(#${id}-klipp)">` +
      `<rect class="kart-vatten" width="${K.W}" height="${K.H}"/>` +
      `<g class="lager-hav"></g><g class="lager-land"></g><g class="lager-spar"></g>` +
      `<g class="lager-etikett"></g><g class="lager-topp"></g></g>`;
    const lager = {};
    for (const n of ["hav", "land", "spar", "etikett", "topp"]) lager[n] = svg.querySelector(".lager-" + n);
    const el = {};
    for (const o of [...K.havLista, ...K.landLista]) {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", o.d);
      p.setAttribute("class", "omr " + o.typ);
      p.dataset.id = o.id;
      (o.typ === "hav" ? lager.hav : lager.land).append(p);
      el[o.id] = p;
    }
    behallare.append(svg);

    const etiketter = {};
    const R = {
      svg, el, lager, K,
      // Skärmens punkt -> kartans koordinater
      tillKarta(e) {
        const m = svg.getScreenCTM();
        if (!m) return { x: -1, y: -1 };
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const r = pt.matrixTransform(m.inverse());
        return { x: r.x, y: r.y };
      },
      tillSkarm(x, y) {
        const pt = svg.createSVGPoint();
        pt.x = x; pt.y = y;
        const r = pt.matrixTransform(svg.getScreenCTM());
        return { x: r.x, y: r.y };
      },
      // Pixlar per kartenhet
      skala() {
        const m = svg.getScreenCTM();
        return m ? m.a : 1;
      },
      innanfor(e) {
        const p = R.tillKarta(e);
        return p.x >= 0 && p.y >= 0 && p.x <= K.W && p.y <= K.H;
      },
      farga(oid, farg) {
        const p = el[oid];
        if (!p) return;
        p.style.fill = farg;
        p.classList.add("fargad");
      },
      ofarga(oid) {
        const p = el[oid];
        if (!p) return;
        p.style.fill = "";
        p.classList.remove("fargad");
      },
      klass(oid, k, pa = true) { el[oid] && el[oid].classList.toggle(k, pa); },
      blinka(oid, farg) {
        const p = el[oid];
        if (!p) return;
        p.style.setProperty("--blink", farg || "#ffd23f");
        p.classList.remove("blinka");
        void p.getBoundingClientRect();
        p.classList.add("blinka");
        // Lägg området överst i sitt lager så att hela blinket syns
        p.parentNode.append(p);
        clearTimeout(p._bt);
        p._bt = setTimeout(() => p.classList.remove("blinka"), 2700);
      },
      skaka(oid) {
        const p = el[oid];
        if (!p) return;
        p.classList.remove("skaka");
        void p.getBoundingClientRect();
        p.classList.add("skaka");
        setTimeout(() => p.classList.remove("skaka"), 600);
      },
      etikett(oid, text, klass = "", punkt) {
        R.taBortEtikett(oid);
        const o = K.omraden[oid];
        const [x, y] = punkt || o.mitt;
        const t = document.createElementNS(SVGNS, "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("class", "etikett " + klass);
        t.textContent = text;
        lager.etikett.append(t);
        etiketter[oid] = t;
        return t;
      },
      taBortEtikett(oid) {
        if (etiketter[oid]) { etiketter[oid].remove(); delete etiketter[oid]; }
      },
      rensa() {
        for (const p of Object.values(el)) { p.style.fill = ""; p.classList.remove("fargad", "blinka", "skaka"); }
        for (const k of Object.keys(etiketter)) R.taBortEtikett(k);
      },
      // Uppdaterar textstorlek så att namnen syns lika bra på telefon som på surfplatta
      anpassa() {
        const b = svg.clientWidth, h = svg.clientHeight;
        if (!b || !h) return;
        const s = Math.min(b / K.W, h / K.H);
        svg.style.setProperty("--fs", Math.max(13, Math.min(34, 17 / s)));
        svg.style.setProperty("--px", 1 / s); // en skärmpixel i kartenheter
        if (opt.vidAnpassa) opt.vidAnpassa(s);
      },
    };
    R.ro = new ResizeObserver(() => R.anpassa());
    R.ro.observe(svg);
    R.anpassa();
    return R;
  }

  /* ---------- Liten karta (till svarskort och memory) ---------- */
  function mini(K, oid, farg) {
    const o = K.omraden[oid];
    let s = `<svg viewBox="0 0 ${K.W} ${K.H}" class="mini" aria-hidden="true" preserveAspectRatio="xMidYMid meet">`;
    s += `<rect class="m-vatten" width="${K.W}" height="${K.H}" rx="30"/>`;
    if (o && o.typ === "hav") s += `<path d="${o.d}" fill="${farg}"/>`;
    for (const l of K.landLista) {
      s += l.id === oid ? `<path d="${l.d}" fill="${farg}" class="m-mark"/>` : `<path d="${l.d}" class="m-land"/>`;
    }
    return s + "</svg>";
  }

  // Formen för ett område, utan bitar som hamnat på andra sidan kartan (t.ex. Tjukotka)
  function huvudformer(K, o) {
    if (!K.runt) return o.former;
    return o.former.filter((f) => {
      const r = ramFor([f]);
      return Math.abs((r.x0 + r.x1) / 2 - o.mitt[0]) < K.W * 0.45;
    });
  }

  /* ---------- Sjökort och sjövägar (båten) ---------- */
  function sjokort(K) {
    if (K.sjo) return K.sjo;
    const cell = 5;
    const cols = Math.ceil(K.W / cell), rows = Math.ceil(K.H / cell);
    const vatten = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        vatten[r * cols + c] = landVid(K, (c + 0.5) * cell, (r + 0.5) * cell) ? 0 : 1;
      }
    }
    K.sjo = { cell, cols, rows, vatten };
    return K.sjo;
  }
  function cellFor(K, S, x, y) {
    const c = Math.max(0, Math.min(S.cols - 1, Math.floor(norm(K, x) / S.cell)));
    const r = Math.max(0, Math.min(S.rows - 1, Math.floor(y / S.cell)));
    return r * S.cols + c;
  }
  const cellMitt = (S, i) => ({ x: ((i % S.cols) + 0.5) * S.cell, y: (Math.floor(i / S.cols) + 0.5) * S.cell });

  function narmasteVatten(K, S, start) {
    if (S.vatten[start]) return start;
    const sedd = new Uint8Array(S.cols * S.rows);
    let ko = [start];
    sedd[start] = 1;
    for (let varv = 0; varv < 60 && ko.length; varv++) {
      const nasta = [];
      for (const i of ko) {
        for (const j of grannar(K, S, i, false)) {
          if (sedd[j]) continue;
          if (S.vatten[j]) return j;
          sedd[j] = 1;
          nasta.push(j);
        }
      }
      ko = nasta;
    }
    return -1;
  }
  function grannar(K, S, i, baraVatten = true) {
    const c = i % S.cols, r = Math.floor(i / S.cols);
    const ut = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      let nc = c + dc;
      const nr = r + dr;
      if (nr < 0 || nr >= S.rows) continue;
      if (nc < 0 || nc >= S.cols) { if (!K.runt) continue; nc = (nc + S.cols) % S.cols; }
      const j = nr * S.cols + nc;
      if (baraVatten) {
        if (!S.vatten[j]) continue;
        if (dr && dc) { // inga genvägar över hörn av land
          const a = r * S.cols + nc, b = nr * S.cols + c;
          if (!S.vatten[a] || !S.vatten[b]) continue;
        }
      }
      ut.push(j);
    }
    return ut;
  }
  function vattenPunkt(K, x, y) {
    const S = sjokort(K);
    const i = narmasteVatten(K, S, cellFor(K, S, x, y));
    if (i < 0) return { x, y };
    if (S.vatten[cellFor(K, S, x, y)] && !landVid(K, x, y)) return { x, y };
    return cellMitt(S, i);
  }

  // A*: kortaste vägen på vatten. Returnerar lista med punkter.
  function sjovag(K, fran, till) {
    const S = sjokort(K);
    const start = narmasteVatten(K, S, cellFor(K, S, fran.x, fran.y));
    const mal = narmasteVatten(K, S, cellFor(K, S, till.x, till.y));
    if (start < 0 || mal < 0) return null;
    if (start === mal) return [cellMitt(S, mal)];
    const N = S.cols * S.rows;
    const g = new Float32Array(N).fill(Infinity);
    const forra = new Int32Array(N).fill(-1);
    const stangd = new Uint8Array(N);
    const mc = mal % S.cols, mr = Math.floor(mal / S.cols);
    const h = (i) => {
      let ddx = Math.abs((i % S.cols) - mc);
      if (K.runt) ddx = Math.min(ddx, S.cols - ddx);
      const ddy = Math.abs(Math.floor(i / S.cols) - mr);
      return Math.max(ddx, ddy) + 0.414 * Math.min(ddx, ddy);
    };
    // Enkel binär hög
    const hog = [];
    const push = (i, f) => {
      hog.push([f, i]);
      let k = hog.length - 1;
      while (k > 0) { const p = (k - 1) >> 1; if (hog[p][0] <= hog[k][0]) break; [hog[p], hog[k]] = [hog[k], hog[p]]; k = p; }
    };
    const pop = () => {
      const top = hog[0], sista = hog.pop();
      if (hog.length) {
        hog[0] = sista;
        let k = 0;
        for (;;) {
          const a = 2 * k + 1, b = a + 1;
          let m = k;
          if (a < hog.length && hog[a][0] < hog[m][0]) m = a;
          if (b < hog.length && hog[b][0] < hog[m][0]) m = b;
          if (m === k) break;
          [hog[m], hog[k]] = [hog[k], hog[m]]; k = m;
        }
      }
      return top;
    };
    g[start] = 0;
    push(start, h(start));
    while (hog.length) {
      const [, i] = pop();
      if (stangd[i]) continue;
      if (i === mal) break;
      stangd[i] = 1;
      const c = i % S.cols, r = Math.floor(i / S.cols);
      for (const j of grannar(K, S, i)) {
        const diag = (j % S.cols) !== c && Math.floor(j / S.cols) !== r;
        const ng = g[i] + (diag ? 1.414 : 1);
        if (ng < g[j]) { g[j] = ng; forra[j] = i; push(j, ng + h(j)); }
      }
    }
    if (forra[mal] < 0) return null;
    const vag = [];
    for (let i = mal; i !== -1 && i !== start; i = forra[i]) vag.push(cellMitt(S, i));
    vag.reverse();
    return vag;
  }

  // Fri sikt på vatten mellan två punkter? (för att räta ut båtens väg)
  function friSikt(K, a, b) {
    const S = sjokort(K);
    const ddx = dx(K, a.x, b.x), ddy = b.y - a.y;
    const steg = Math.ceil(Math.hypot(ddx, ddy) / 2.5);
    for (let s = 1; s <= steg; s++) {
      const t = s / steg;
      if (!S.vatten[cellFor(K, S, a.x + ddx * t, a.y + ddy * t)]) return false;
    }
    return true;
  }
  const arVatten = (K, x, y) => { const S = sjokort(K); return !!S.vatten[cellFor(K, S, x, y)] && !landVid(K, x, y); };

  return { ladda, montera, mini, vid, pathD, landVid, havVid, iOmrade, nara, norm, dx, huvudformer, ramFor,
    sjokort, sjovag, friSikt, vattenPunkt, arVatten, SVGNS };
})();
