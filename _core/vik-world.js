/* ══════════════════════════════════════════════════════════════
   VIK RETREATS · WORLD
   Behaviour for the group home page: the fullscreen chooser, the
   world menu, the world map, and the consent gate in front of the
   metrics layer.

   THE PLACES live in one list below. Add a property there and it
   appears in the chooser, in the menu and on the map at once — the
   three are never edited separately.

   THE MAP has a provider seam. It draws with Leaflet by default
   because Leaflet is already self-hosted here and needs no key. To
   move it to Google Maps, set a key in the page:

     VIKWorld.map({ provider:"google", key:"AIza…", mapId:"…" });

   Nothing else changes: the same places, the same legend, the same
   events into vik-metrics. Every pan, zoom and marker open is
   reported either way.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* Donde viven los assets. La pagina lo dice con
     window.VIK_BASE; sin eso, al lado, como siempre. */
  const A = p => (window.VIK_BASE || "") + String(p).replace(/^assets\//, "");


  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse  = matchMedia("(pointer:coarse)").matches;
  const M = () => window.VIKMetrics;

  /* ── The places ───────────────────────────────────────────
     Coordinates for José Ignacio are the ones the destination site
     already uses. The two Chilean points are approximate to the
     Millahue valley and want confirming against VIK Chile before
     this goes live — they are close enough to frame the map, not
     close enough to drive to. */
  const PLACES = [
    { key:"estancia", n:"Estancia VIK", kind:"Retreat 01", country:"Uruguay",
      place:"José Ignacio · countryside", lat:-34.784209, lng:-54.697643,
      href:"estancia.html",
      img:A("assets/img/t/estancia_estancia-img_7582-min-1-w1600.jpg"),
      film:A("assets/video/estancia.mp4"),
      lede:"Four thousand acres, horses and open fire. The <em>Uruguay</em> that existed before the coast was found.",
      tags:["Riders","Families","All year"] },

    { key:"playa", n:"Playa VIK", kind:"Retreat 02", country:"Uruguay",
      place:"José Ignacio · the point", lat:-34.841981, lng:-54.640792,
      href:"playa.html",
      img:A("assets/img/t/playa_80c9a60ef2cc735699a0e504cbfa54955f3113fe-w1600.jpg"),
      film:A("assets/video/playa.mp4"),
      lede:"Carlos Ott architecture and a serious art collection, with the Atlantic on <em>three sides</em>.",
      tags:["Couples","Art","Privacy"] },

    { key:"bahia", n:"Bahía VIK", kind:"Retreat 03", country:"Uruguay",
      place:"José Ignacio · Playa Mansa", lat:-34.838119, lng:-54.648421,
      href:"bahia.html",
      img:A("assets/img/t/bahia_1_bv-0439-scaled-w1600.jpg"),
      film:A("assets/video/bahia.mp4"),
      lede:"Design bungalows set into the dunes on the calm side. The most <em>social</em> of the three.",
      tags:["Families","Groups","Beach"] },

    { key:"milano", n:"Galleria VIK", kind:"Retreat 04", country:"Italy",
      place:"Milano · Galleria Vittorio Emanuele II", lat:45.4659, lng:9.1899,
      href:"https://www.galleriavikmilano.com/", ext:true,
      img:A("assets/img/t/milano_galleria-w1600.jpg"),
      film:A("assets/video/milano.mp4"),
      lede:"An art hotel inside the <em>Galleria Vittorio Emanuele II</em>. Eighty-nine rooms, sixty-two artists, one arcade.",
      tags:["Art","City","Design"] },

    { key:"chile", n:"VIK Chile", kind:"Retreat 05", country:"Chile",
      place:"Millahue · Cachapoal", lat:-34.538753, lng:-71.234712,
      href:"https://vikchile.com/", ext:true,
      img:A("assets/img/t/bahia_bg-vina-vik-w1600.jpg"),
      film:A("assets/video/chile.mp4"),
      lede:"Eleven thousand acres in the valley of Millahue. A titanium roof over a vineyard, and <em>seven million</em> vines below it.",
      tags:["Wine","Design","Andes"] },

    { key:"wines", n:"VIK Wines", kind:"Winery", country:"Chile",
      place:"Millahue · Cachapoal", lat:-34.540861, lng:-71.225613,
      href:"https://www.vikwine.com/", ext:true,
      img:A("assets/img/t/bahia_bg-vina-vik-w1600.jpg"),
      film:A("assets/video/wines.mp4"),
      lede:"The wine that carries the group's name, poured on every VIK list from <em>Millahue</em> to José Ignacio.",
      tags:["Terroir","Cellar","Tastings"] }
  ];

  window.VIKWorld = { places: PLACES };

  /* ── Film on the panels ───────────────────────────────────
     One film at a time. Eight autoplaying videos side by side is a
     lot of bandwidth for a decision that only needs the one being
     looked at. */
  const play = v => {
    if (!v) return;
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
    v.play().then(() => v.classList.add("is-playing")).catch(() => {});
  };
  const stop = v => { if (!v) return; v.pause(); v.classList.remove("is-playing"); };

  const setupPanels = () => {
    const panels = $$(".wp");
    if (!panels.length) return;

    if (!reduced && !coarse) {
      panels.forEach(p => {
        const v = $("video", p);
        p.addEventListener("mouseenter", () => {
          play(v);
          /* the sweep, not the choice — see VIKMetrics.panel() */
          M() && M().panel(p.dataset.key, "hover");
        });
        p.addEventListener("mouseleave", () => stop(v));
      });
    } else if (!reduced && "IntersectionObserver" in window) {
      /* On touch the reel decides: whatever is centred is open. */
      const io = new IntersectionObserver(es => es.forEach(en => {
        const v = $("video", en.target);
        if (en.intersectionRatio > .6) {
          play(v); en.target.classList.add("is-open");
          M() && M().panel(en.target.dataset.key, "scroll");
        } else { stop(v); en.target.classList.remove("is-open"); }
      }), { threshold: [0, .6, 1] });
      panels.forEach(p => io.observe(p));
    }

    /* The choice itself. Reported separately from the sweep above,
       and before the browser leaves — the metrics layer queues it
       and flushes on pagehide with sendBeacon. */
    panels.forEach(p => p.addEventListener("click", () =>
      M() && M().panel(p.dataset.key, "click")));

    /* Keyboard is a first-class way through this — arrows step, and
       the focused panel opens exactly as a hovered one does. */
    panels.forEach((p, i) => {
      p.addEventListener("focusin", () => { panels.forEach(x => x.classList.remove("is-open")); p.classList.add("is-open"); });
      p.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const n = panels[(i + (e.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length];
        n.focus();
      });
    });
  };

  /* The menu is the chrome's quick menu, built from W_NAV in
     vik-chrome.js — the same component, the same motion and the same
     language switcher the destination site opens. There is no second
     menu on this page and no second place to edit one.            */

  /* ── The map ──────────────────────────────────────────────
     Provider seam. Leaflet draws it today; Google draws it the
     moment a key is supplied. Both report the same events. */
  const MAPCFG = { provider: "leaflet", key: null, mapId: null };
  let mapAPI = null;

  const bounds = () => {
    const lats = PLACES.map(p => p.lat), lngs = PLACES.map(p => p.lng);
    return { s: Math.min(...lats), n: Math.max(...lats), w: Math.min(...lngs), e: Math.max(...lngs) };
  };

  const legend = onPick => {
    const ul = $("#worldLegend");
    if (!ul) return;
    ul.innerHTML = PLACES.map(p =>
      `<li data-key="${p.key}"${/^Retreat/.test(p.kind) ? ' class="home"' : ""}>
         <span class="d"></span><span class="n">${p.n}</span></li>`).join("");
    $$("li", ul).forEach(li => li.addEventListener("click", () => {
      $$("li", ul).forEach(x => x.classList.toggle("is-on", x === li));
      onPick(PLACES.find(p => p.key === li.dataset.key));
      M() && M().track("map_legend", { property: li.dataset.key });
    }));

    /* On a phone the legend shows one place at a time and the map
       follows whichever one is centred — the same behaviour the
       destination map has, so the two read as one system. Scroll is
       the whole interface; the CSS does the snapping. */
    const bar = ul.closest(".map-bar");
    if (!bar || $(".map-steps", bar)) return;
    const dots = document.createElement("div");
    dots.className = "map-steps";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = PLACES.map(() => "<i></i>").join("");
    bar.appendChild(dots);

    const marks = [...dots.children];
    let at = -1, timer = null;
    const settle = () => {
      if (!matchMedia("(max-width:768px)").matches) return;
      const mid = ul.scrollLeft + ul.clientWidth / 2;
      let i = 0, best = Infinity;
      [...ul.children].forEach((li, k) => {
        const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
        if (d < best) { best = d; i = k; }
      });
      marks.forEach((m, k) => m.classList.toggle("is-on", k === i));
      [...ul.children].forEach((li, k) => li.classList.toggle("is-on", k === i));
      if (i === at) return;
      at = i;
      onPick(PLACES[i]);
      M() && M().track("map_legend", { property: PLACES[i].key, method: "reel" });
    };
    ul.addEventListener("scroll", () => {
      clearTimeout(timer); timer = setTimeout(settle, 110);
    }, { passive: true });
    requestAnimationFrame(settle);
    addEventListener("resize", () => { at = -1; settle(); });
  };

  const initLeaflet = () => {
    const node = $("#worldMap");
    if (!node || !window.L) return;

    const map = L.map(node, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
    L.control.zoom({ position: "topright" }).addTo(map);

    const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · © CARTO" });
    /* Satellite is the default here, as it is on the destination map.
       This one opens at zoom 4 to hold two countries in one frame, and
       CARTO's retina tiles are patchy at that range — the imagery is
       both more reliable and more useful at continental scale. */
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Imagery © Esri" }).addTo(map);

    $$(".map-view button").forEach(b => b.addEventListener("click", () => {
      $$(".map-view button").forEach(x => x.classList.toggle("active", x === b));
      if (b.dataset.view === "sat") { map.removeLayer(dark); sat.addTo(map); }
      else { map.removeLayer(sat); dark.addTo(map); }
      M() && M().track("map_view", { label: b.dataset.view });
    }));

    const markers = {};
    PLACES.forEach(p => {
      markers[p.key] = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          /* the house POI, so a marker here and a marker on the
             destination map are the same object */
          className: /^Retreat/.test(p.kind) ? "poi poi-home" : "poi",
          iconSize: [12, 12], iconAnchor: [6, 6],
          html: `<span class="poi-dot"></span><span class="poi-label">${p.n}</span>`
        })
      }).addTo(map).bindPopup(
        `<div class="pop-media" style="background-image:url('${p.img}')"><span class="pop-tag">${p.kind}</span></div>
         <div class="pop-body"><b>${p.n}</b><span class="pop-detail">${p.place}</span>
           <div class="pop-actions">
             <a href="${p.href}"${p.ext ? ' target="_blank" rel="noopener"' : ""}
                data-track="map_open" data-track-label="${p.n}">Open ${p.n}</a>
             <a class="alt" target="_blank" rel="noopener"
                href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}">Directions</a>
           </div></div>`, { maxWidth: 260, minWidth: 256 });
      markers[p.key].on("popupopen", () => M() && M().track("map_marker", { property: p.key }));
    });

    /* every movement is measured — pan in kilometres, zooms used */
    let last = null;
    map.on("moveend zoomend", () => {
      const c = map.getCenter(), to = [c.lat, c.lng];
      M() && M().mapMove(last, to, map.getZoom());
      last = to;
    });

    const b = bounds();
    const frame = () => {
      map.invalidateSize();
      map.fitBounds([[b.s, b.w], [b.n, b.e]], { padding: [70, 90], animate: false });
      last = [map.getCenter().lat, map.getCenter().lng];
    };
    frame(); setTimeout(frame, 260);
    addEventListener("resize", () => map.invalidateSize());

    legend(p => { map.flyTo([p.lat, p.lng], 14, { duration: 1.1 }); markers[p.key].openPopup(); });
    mapAPI = { map, markers, frame };
  };

  const initGoogle = () => {
    const node = $("#worldMap");
    if (!node || !MAPCFG.key) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(MAPCFG.key)
          + "&libraries=marker&callback=__vikGoogleMap";
    window.__vikGoogleMap = () => {
      const g = window.google.maps;
      const map = new g.Map(node, {
        mapId: MAPCFG.mapId || undefined, disableDefaultUI: true, zoomControl: true,
        scrollwheel: false, backgroundColor: "#0e0e0c"
      });
      const box = new g.LatLngBounds();
      const markers = {};
      PLACES.forEach(p => {
        const m = new g.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.n });
        m.addListener("click", () => M() && M().track("map_marker", { property: p.key }));
        markers[p.key] = m;
        box.extend({ lat: p.lat, lng: p.lng });
      });
      map.fitBounds(box, 80);
      let last = null;
      map.addListener("idle", () => {
        const c = map.getCenter(), to = [c.lat(), c.lng()];
        M() && M().mapMove(last, to, map.getZoom());
        last = to;
      });
      legend(p => { map.panTo({ lat: p.lat, lng: p.lng }); map.setZoom(14); });
      mapAPI = { map, markers };
    };
    document.head.appendChild(s);
  };

  window.VIKWorld.map = (opts = {}) => {
    Object.assign(MAPCFG, opts);
    MAPCFG.provider === "google" && MAPCFG.key ? initGoogle() : initLeaflet();
    return mapAPI;
  };

  /* ── Consent ──────────────────────────────────────────────
     The metrics layer is loaded but silent. This is what turns it
     on, and the answer is remembered. */
  const setupConsent = () => {
    const box = $("#worldConsent");
    if (!box || !window.VIKMetrics) return;
    let saved = null;
    try { saved = localStorage.getItem("vik.consent"); } catch (e) {}

    const answer = state => {
      try { localStorage.setItem("vik.consent", state); } catch (e) {}
      window.VIKMetrics.consent(state);
      box.classList.remove("is-in");
      setTimeout(() => box.classList.remove("is-shown"), 500);
    };

    if (saved) { window.VIKMetrics.consent(saved); return; }
    box.classList.add("is-shown");
    requestAnimationFrame(() => box.classList.add("is-in"));
    $("[data-consent='granted']", box).addEventListener("click", () => answer("granted"));
    $("[data-consent='denied']",  box).addEventListener("click", () => answer("denied"));
  };

  const boot = () => {
    setupPanels(); setupConsent();
    window.VIKWorld.map();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
