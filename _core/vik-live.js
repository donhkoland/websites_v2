/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · LIVE DATA + MAP

   1 · Fact ribbon — real conditions for José Ignacio, Uruguay.
       Source: Open-Meteo. Free, keyless, CORS-enabled, no quota
       for this volume, no attribution obligation on the page.
         api.open-meteo.com        → air, wind, sunrise/sunset
         marine-api.open-meteo.com → sea temperature, wave height
       Local time is computed from the IANA zone, not the browser,
       so it is correct for Uruguay wherever the guest is reading.
       Every value degrades to the copy already in the HTML.

   2 · Map — Leaflet, CARTO dark / Esri satellite, VIK markers.
       Same implementation as the VIK Guest Journey page.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* Donde viven los assets. La pagina lo dice con
     window.VIK_BASE; sin eso, al lado, como siempre. */
  const A = p => (window.VIK_BASE || "") + String(p).replace(/^assets\//, "");


  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

  /* José Ignacio, Uruguay */
  const GEO  = { lat: -34.8447, lng: -54.6389, tz: "America/Montevideo" };
  const SEA  = { lat: -34.86,   lng: -54.63 };

  window.VIK = window.VIK || {};

  /* ── 1 · Fact ribbon ───────────────────────────────────── */

  /* WMO weather codes → house wording. */
  const WMO = {
    0:"Clear", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast",
    45:"Fog", 48:"Freezing fog", 51:"Light drizzle", 53:"Drizzle", 55:"Heavy drizzle",
    56:"Freezing drizzle", 57:"Freezing drizzle", 61:"Light rain", 63:"Rain", 65:"Heavy rain",
    66:"Freezing rain", 67:"Freezing rain", 71:"Light snow", 73:"Snow", 75:"Heavy snow",
    77:"Snow grains", 80:"Showers", 81:"Showers", 82:"Heavy showers",
    85:"Snow showers", 86:"Snow showers", 95:"Thunderstorm", 96:"Thunderstorm", 99:"Thunderstorm"
  };

  const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const bearing = deg => COMPASS[Math.round(deg / 22.5) % 16];

  /* Beaufort-ish reading of the wind, in guest language. */
  const windRead = kmh =>
    kmh < 6  ? "Still · glass on the water" :
    kmh < 12 ? "Light air · calm sea"       :
    kmh < 20 ? "Light breeze · easy sea"    :
    kmh < 29 ? "Breeze · small waves"       :
    kmh < 39 ? "Fresh breeze · choppy"      :
    kmh < 50 ? "Strong breeze · white caps" :
               "Strong wind · big sea";

  /* Southern-hemisphere season, then the VIK reading of it. */
  const seasonOf = d => {
    const m = d.getMonth() + 1, day = d.getDate();
    if ((m === 12 && day >= 20) || m === 1)
      return ["Peak", "Dec 20 – Jan 31", "Vibrant, social, events every night"];
    if (m === 2)
      return ["Full summer", "February", "Long days on the water"];
    if (m === 3 || (m === 4 && day <= 15))
      return ["Shoulder", "March – mid April", "Quieter, intimate, restorative"];
    if (m === 4 || m === 5)
      return ["Autumn", "mid April – May", "Low light, long rides, the fires lit"];
    if (m >= 6 && m <= 8)
      return ["Winter", "June – August", "Horses, fire and empty landscape"];
    return ["Spring", "September – December", "The coast reopening, slowly"];
  };

  const partsIn = (date, opts) =>
    new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: GEO.tz }, opts)).format(date);

  const setFact = (key, value, sub) => {
    $$(`[data-live="${key}"]`).forEach(el => { if (value != null) el.innerHTML = value; });
    if (sub != null) $$(`[data-live-sub="${key}"]`).forEach(el => { el.textContent = sub; });
  };

  const startClock = () => {
    const tick = () => {
      const now = new Date();
      setFact("time", partsIn(now, { hour: "2-digit", minute: "2-digit", hour12: false }),
        partsIn(now, { weekday: "long", day: "numeric", month: "long" }));
      const [name, window_, note] = seasonOf(
        new Date(partsIn(now, { year: "numeric", month: "2-digit", day: "2-digit" })
          .split("/").reverse().join("-") + "T12:00:00"));
      setFact("season", `${name} <small>${window_}</small>`, note);
    };
    tick();
    setInterval(tick, 30000);
  };

  const loadWeather = async () => {
    const ribbons = $$(".fact-ribbon[data-live-ribbon]");
    if (!ribbons.length) return;
    ribbons.forEach(r => r.classList.add("is-loading"));

    const air = `https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lng}`
      + `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code`
      + `&daily=sunrise,sunset&timezone=${encodeURIComponent(GEO.tz)}&forecast_days=1`;
    const sea = `https://marine-api.open-meteo.com/v1/marine?latitude=${SEA.lat}&longitude=${SEA.lng}`
      + `&current=sea_surface_temperature,wave_height&timezone=${encodeURIComponent(GEO.tz)}`;

    const grab = url => fetch(url, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null);
    const [a, s] = await Promise.all([grab(air), grab(sea)]);

    if (a && a.current) {
      const c = a.current;
      setFact("weather",
        `${Math.round(c.temperature_2m)}° <small>${WMO[c.weather_code] || "—"}</small>`,
        `Feels ${Math.round(c.apparent_temperature)}° · Humidity ${Math.round(c.relative_humidity_2m)}%`);
      setFact("wind",
        `${Math.round(c.wind_speed_10m)} <small>km/h ${bearing(c.wind_direction_10m)}</small>`,
        windRead(c.wind_speed_10m));
    }
    if (a && a.daily && a.daily.sunset) {
      const sunset = a.daily.sunset[0].slice(11, 16);
      const sunrise = a.daily.sunrise[0].slice(11, 16);
      setFact("sunset", sunset, `Sunrise ${sunrise} · best light from La Susana`);
    }
    if (s && s.current && s.current.sea_surface_temperature != null) {
      const t = s.current.sea_surface_temperature;
      const w = s.current.wave_height;
      setFact("sea", `${Math.round(t)}° <small>water</small>`,
        w != null ? `Waves ${w.toFixed(1)} m · Playa Brava` : "Playa Brava");
    }
    ribbons.forEach(r => r.classList.remove("is-loading"));
  };

  /* ── 2 · Map ───────────────────────────────────────────── */

  /* Los puntos de siempre son los del ecosistema. Una pagina que
     habla de otra cosa — cuatro mesas, por ejemplo — pone los suyos
     antes de cargar este archivo:  window.VIK_PTS = [ ... ]
     Mismos campos, y uno mas: video, para el globo que se mueve. */
  const PTS = (Array.isArray(window.VIK_PTS) && window.VIK_PTS.length)
    ? window.VIK_PTS
    : [
    { key:"bahia",    lat:-34.838119, lng:-54.648421, home:true, img:A("assets/img/bahia/1_bv-0439-scaled.jpg"),
      n:"Bahía VIK",   d:"Within the dunes on Playa Mansa",        tag:"Retreat 03", meta:"Design · social · wellness" },
    { key:"playa",    lat:-34.841981, lng:-54.640792, img:A("assets/img/playa/80c9a60ef2cc735699a0e504cbfa54955f3113fe.jpeg"),
      n:"Playa VIK",   d:"Above the point, facing the Atlantic",   tag:"Retreat 02", meta:"Architecture · art · privacy" },
    { key:"estancia", lat:-34.784209, lng:-54.697643, img:A("assets/img/estancia/estancia-img_7582-min-1.jpg"),
      n:"Estancia VIK",d:"Open countryside, horses and fire",      tag:"Retreat 01", meta:"40 min inland" },
    { key:"pavilion", lat:-34.838067, lng:-54.647965, img:A("assets/img/bahia/cp-bahiavik-0549-scaled.jpg"),
      n:"Pavilion VIK",d:"Oceanfront events and culture",          tag:"Venue",      meta:"Weddings · gatherings" },
    { key:"susana",   lat:-34.838267, lng:-54.647591, img:A("assets/img/bahia/vik_food08.jpg"),
      n:"La Susana",   d:"Beach dining, music and sunset",         tag:"Dining",     meta:"Playa Mansa" },
    { key:"faro",     lat:-34.84627, lng:-54.632782, img:A("assets/img/map/faro.jpg"),
      n:"José Ignacio Lighthouse", d:"The village landmark",       tag:"Landmark",   meta:"10 min · the village" },
    { key:"laguna",   lat:-34.802362, lng:-54.572086, img:A("assets/img/map/garzon.jpg"),
      n:"Laguna Garzón", d:"Nature and the ring bridge",           tag:"Nature",     meta:"30 min · the lagoon" },
    { key:"airport",  lat:-34.8551, lng:-55.0944, img:A("assets/img/map/airport.jpg"),
      n:"Punta del Este (PDP)", d:"Capitán Curbelo airport",       tag:"Arrival",    meta:"40–50 min by road" }
  ];

/* Selecting a property lands twice as close as it used to.
   Leaflet doubles the scale with every level, so 2x is +1. */
  let map = null;
  const markers = {};

  const popupHTML = p => {
    const g = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    const w = `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
    const coarse = window.matchMedia("(pointer:coarse)").matches;
    const acts = coarse
      ? `<a href="${g}" target="_blank" rel="noopener">Google Maps</a><a class="alt" href="${w}" target="_blank" rel="noopener">Waze</a>`
      : `<a href="${g}" target="_blank" rel="noopener">Open in Maps</a>`;
    const tag = p.tag ? `<span class="pop-tag">${p.tag}</span>` : "";
    /* Un punto puede llevar pelicula en vez de fotografia. La imagen
       sigue haciendo falta: es el primer fotograma mientras carga, y
       lo unico que queda si el video no arranca. */
    const media = p.video
      ? `<div class="pop-media pop-film">`
        + `<video autoplay muted loop playsinline preload="none"`
        + (p.img ? ` poster="${p.img}"` : "")
        + `><source src="${p.video}" type="video/mp4"></video>${tag}</div>`
      : `<div class="pop-media" style="background-image:url('${p.img}')">${tag}</div>`;
    return media
      + `<div class="pop-body"><b>${p.n}</b><span class="pop-detail">${p.d}</span>`
      + (p.meta ? `<div class="pop-metaline"><span><i>◍</i>${p.meta}</span></div>` : "")
      + `<div class="pop-actions">${acts}</div></div>`;
  };

  const initMap = () => {
    const node = $("#leafMap");
    if (!node || !window.L) return;

    /* La propiedad de casa la nombra la pagina, no este archivo:
       <body data-home="susana">. Sin atributo queda la de siempre. */
    const homeKey = document.body.dataset.home;
    if (homeKey) PTS.forEach(p => { p.home = (p.key === homeKey); });

    map = L.map(node, { zoomControl: false, scrollWheelZoom: false, attributionControl: true })
           .setView([GEO.lat, GEO.lng], 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · © CARTO" });
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Imagery © Esri" }).addTo(map);

    $$(".map-view button").forEach(b => b.addEventListener("click", () => {
      $$(".map-view button").forEach(x => x.classList.toggle("active", x === b));
      if (b.dataset.view === "sat") { map.removeLayer(dark); sat.addTo(map); }
      else { map.removeLayer(sat); dark.addTo(map); }
    }));

    PTS.forEach(p => {
      markers[p.key] = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: p.home ? "poi poi-home" : "poi",
          html: `<span class="poi-dot"></span><span class="poi-label">${p.n}</span>`,
          iconSize: [12, 12], iconAnchor: [6, 6]
        }),
        zIndexOffset: p.home ? 1000 : 0
      }).addTo(map).bindPopup(popupHTML(p), { maxWidth: 260, minWidth: 256 });
    });

    const bounds = L.latLngBounds(PTS.map(p => [p.lat, p.lng]));
    const homePt = PTS.find(p => p.home && homeKey);
    const frame = () => {
      map.invalidateSize();
      /* Con una casa nombrada, el mapa abre sobre ella y de cerca: a la
         escala del ecosistema entero no se distingue una playa de otra,
         y eso es exactamente lo que hay que ver aqui. */
      if (homePt) { map.setView([homePt.lat, homePt.lng], 16, { animate: false }); return; }
      const z = map.getBoundsZoom(bounds, false, L.point(110, 165));
      map.setView(bounds.getCenter(), Math.max(z - 1, 3), { animate: false });
    };
    frame();
    setTimeout(frame, 260);
    window.addEventListener("resize", () => map && map.invalidateSize());

    const ul = $("#mapLegend");
    if (ul) {
      ul.innerHTML = "";
      PTS.forEach(p => {
        const li = document.createElement("li");
        if (p.home) li.className = "home";
        li.innerHTML = `<span class="d"></span><span class="n">${p.n}</span>`;
        li.addEventListener("click", () => {
          map.flyTo([p.lat, p.lng], 15, { duration: .9 });
          markers[p.key] && markers[p.key].openPopup();
        });
        ul.appendChild(li);
      });
      setupLegendReel(ul, map, markers);
    }
  };

  /* ── The legend on a phone ─────────────────────────────────
     Below 768px the legend stops being a list you scan across and
     becomes one place at a time: the CSS snaps it, this watches
     which one landed and flies the map there. Scroll is the only
     input — there are no arrows to hunt for, and the gesture is
     the platform's own, so it keeps its momentum and rubber band.

     Everything here is inert above 768px, where the legend is
     still a row and clicking a name is the faster action. */
  const setupLegendReel = (ul, map, markers) => {
    const bar = ul.closest(".map-bar");
    if (!bar) return;

    const dots = document.createElement("div");
    dots.className = "map-steps";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = PTS.map(() => "<i></i>").join("");
    bar.appendChild(dots);

    const phone = () => window.matchMedia("(max-width:768px)").matches;
    const marks = [...dots.children];
    let at = -1, timer = null;

    const settle = () => {
      if (!phone()) return;
      /* whichever item owns the middle of the bar is the one chosen */
      const mid = ul.scrollLeft + ul.clientWidth / 2;
      let i = 0, best = Infinity;
      [...ul.children].forEach((li, k) => {
        const c = li.offsetLeft + li.offsetWidth / 2;
        if (Math.abs(c - mid) < best) { best = Math.abs(c - mid); i = k; }
      });
      marks.forEach((m, k) => m.classList.toggle("is-on", k === i));
      [...ul.children].forEach((li, k) => li.classList.toggle("is-on", k === i));
      if (i === at) return;
      at = i;
      const p = PTS[i];
      map.flyTo([p.lat, p.lng], 15, { duration: 1 });
      markers[p.key] && markers[p.key].openPopup();
    };

    ul.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 110);          /* after the snap lands */
    }, { passive: true });

    /* start on the home property rather than wherever the list begins */
    const home = Math.max(0, PTS.findIndex(p => p.home));
    requestAnimationFrame(() => {
      if (!phone()) return;
      ul.scrollLeft = ul.children[home].offsetLeft;
      settle();
    });
    window.addEventListener("resize", () => { at = -1; settle(); });
  };

  /* ── Boot ──────────────────────────────────────────────── */
  const boot = () => {
    startClock();
    loadWeather();
    initMap();
  };

  window.VIK.live = { reload: loadWeather, points: PTS, map: () => map };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
