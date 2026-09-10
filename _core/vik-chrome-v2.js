/* ══════════════════════════════════════════════════════════════
   VIK · CHROME V2
   Fuente unica de la barra, el menu, la barra de reserva y el pie
   para los dieciocho sitios. Ninguna pagina escribe estos bloques
   a mano: pone dos divs y este archivo los rellena.

     <div data-vik-chrome data-page="stay" data-tag="Playa VIK"></div>
     <div data-vik-footer></div>

   Que cambia respecto de la v1: solo el dibujo. Las listas de
   enlaces son las mismas — mismo mapa del sitio, mismos cinco
   perfiles (destino, mesa, susana, pavilion, grupo) — y lo que se
   reescribio es el marcado, que ahora habla el vocabulario de la
   v2 de Jose Ignacio: .nav / .menu / .bookbar / .footer, con sus
   clases y sus estados.

   Se carga ANTES de vik-v2.js y sin defer: inyecta de forma
   sincrona, y el motor arranca en DOMContentLoaded esperando
   encontrarlo todo puesto.

   Nicolas Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* Los assets compartidos cuelgan de la raiz del sistema, un piso
     por encima de cada sitio. */
  const A = p => (window.VIK_BASE || "../assets/") + String(p).replace(/^assets\//, "");

  const NAV = [
    { id: "destination", href: "../destination/", label: "Destination" },
    { id: "stay",        href: "../stay/",        label: "Stay" },
    { id: "dining",      href: "../dining/",      label: "Dining" },
    { id: "experiences", href: "../experiences/", label: "Experiences" },
    { id: "wellness",    href: "../vik-wellness/",    label: "Wellness" },
    { id: "celebrate",   href: "../celebrate/",   label: "Celebrate" },
    { id: "journal",     href: "../guest-journey/",     label: "Journal & Calendar" },
    { id: "contact",     href: "../contact/",     label: "Contact & FAQ" }
  ];

  /* The second row of the menu is the whole VIK world, group first.
     A guest who arrived at one destination should be one tap from
     every other place the group runs, including the group itself. */
  const SUB = [
    { href: "../vik-retreats/",   label: "VIK Retreats" },
    { href: "../estancia-vik/",      label: "Estancia VIK" },
    { href: "../playa-vik/",         label: "Playa VIK" },
    { href: "../bahia-vik/",         label: "Bahía VIK" },
    { href: "https://vikchile.com/",       label: "VIK Chile",    ext: true },
    { href: "https://www.vikwine.com/",    label: "VIK Wines",    ext: true },
    { href: "../la-susana/index.html",   label: "La Susana",    ext: true },
    { href: "../pavilion-vik/index.html", label: "Pavilion VIK" }
  ];

  const FOOTER = [
    { title: "Retreats", links: [
      { href: "../estancia-vik/", label: "Estancia VIK" },
      { href: "../playa-vik/",    label: "Playa VIK" },
      { href: "../bahia-vik/",    label: "Bahía VIK" },
      { href: "../stay/", label: "Help Me Choose", stay: true }
    ]},
    { title: "Explore", links: [
      { href: "../destination/",  label: "Destination" },
      { href: "../dining/",       label: "Dining" },
      { href: "../experiences/",  label: "Experiences" },
      { href: "../vik-wellness/", label: "Wellness" },
      { href: "../celebrate/",    label: "Celebrate" },
      { href: "../guest-journey/",      label: "Journal & Calendar" }
    ]},
    { title: "Plan", links: [
      { href: "../contact/",              label: "Contact & FAQ" },
      { href: "../contact/#journey",      label: "Journey Designers" },
      { href: "../contact/#getting-here", label: "Getting Here" },
      { href: "#book",                    label: "Book Your Stay" }
    ]},
    { title: "VIK World", links: [
      { href: "https://www.vikwine.com/",   label: "VIK Wines", ext: true },
      { href: "../la-susana/index.html",  label: "La Susana", ext: true },
      { href: "../pavilion-vik/index.html", label: "Pavilion VIK" },
      { href: "../vik-wellness/",           label: "The Shack" },
      { href: "https://vikchile.com/",      label: "VIK Chile", ext: true }
    ]}
  ];

  /* ── The group ──────────────────────────────────────────────
     vikretreats.com is the group; vikjoseignacio.com is one
     destination inside it. They are not two design systems — the
     bar, the menu, the wordmark, the language switcher and the
     footer are the same components with a different set of links
     behind them. Same three lists, same shapes.

     On the group home page the primary navigation is the properties
     themselves; there is no other question a group home answers. */
  const W_NAV = [
    { id: "estancia", href: "../estancia-vik/",               label: "Estancia VIK" },
    { id: "playa",    href: "../playa-vik/",                  label: "Playa VIK" },
    { id: "bahia",    href: "../bahia-vik/",                  label: "Bahía VIK" },
    { id: "milano",   href: "https://www.galleriavikmilano.com/", label: "Galleria VIK", ext: true },
    { id: "chile",    href: "https://vikchile.com/",       label: "VIK Chile",    ext: true },
    { id: "wines",    href: "https://www.vikwine.com/",    label: "VIK Wines",    ext: true }
  ];

  const W_SUB = [
    { href: "../vik-jose-ignacio/", label: "VIK José Ignacio" },
    { href: "../pavilion-vik/index.html", label: "Pavilion VIK" },
    { href: "../la-susana/index.html",   label: "La Susana",    ext: true },
    { href: "../vik-wellness/", label: "The Shack" },
    { href: "#world-map",    label: "The Map" },
    { href: "mailto:guestexperience@vikretreats.com", label: "Contact" }
  ];

  const W_FOOTER = [
    { title: "Uruguay", links: [
      { href: "../estancia-vik/", label: "Estancia VIK" },
      { href: "../playa-vik/",    label: "Playa VIK" },
      { href: "../bahia-vik/",    label: "Bahía VIK" },
      { href: "../vik-jose-ignacio/", label: "VIK José Ignacio" }
    ]},
    { title: "Italy", links: [
      { href: "https://www.galleriavikmilano.com/", label: "Galleria VIK", ext: true }
    ]},
    { title: "Chile", links: [
      { href: "https://vikchile.com/",    label: "VIK Chile", ext: true },
      { href: "https://www.vikwine.com/", label: "VIK Wines", ext: true }
    ]},
    { title: "José Ignacio", links: [
      { href: "../pavilion-vik/index.html", label: "Pavilion VIK" },
      { href: "../la-susana/index.html",   label: "La Susana",    ext: true },
      { href: "../vik-wellness/",               label: "The Shack" },
      { href: "mailto:guestexperience@vikretreats.com", label: "Contact" }
    ]}
  ];

  const LOGO = A("assets/img/brand/vik_retreats_wordmark_dark_blue.svg");

  /* The top bar always reads: the place, then VIK Retreats small
     beside it. On a retreat page the place is that property; on every
     other page it is the destination. Set it in the page:
       <div data-vik-chrome data-logo="playa">

     Where the manual has a Location Wordmark we use the file. There is
     no "VIK José Ignacio" wordmark in the manual — the nearest is VIK
     Uruguay — so the destination is set in Highway Gothic Expanded
     under the same ID rule the wordmarks are drawn from. */
  const LOCATION_MARKS = {
    estancia: A("assets/img/brand/lw-estancia-vik-white.svg"),
    playa:    A("assets/img/brand/lw-playa-vik-white.svg"),
    bahia:    A("assets/img/brand/lw-bahia-vik-white.svg"),
    /* System documents belong to the group, not to the destination —
       they sign with the VIK Retreats wordmark. */
    retreats: LOGO
  };
  const DESTINATION = "VIK José Ignacio";
  const BOOK = "https://vikjoseignacio.bookassist.com/";

  /* Everything that differs between the two sites, in one object.
     Nothing below this line asks which site it is building. */

  /* ── Las dos direcciones del ecosistema ───────────────────
     La Susana y Pavilion VIK son parte de VIK Jose Ignacio, no sitios
     sueltos: su navegacion lleva de vuelta a las tres casas y a la
     otra direccion. Una pagina cada uno; el menu no finge tener mas
     de lo que hay. */
  const S_NAV = [
    { id: "home",     label: "La Susana",   href: "../vik-retreats/" },
    { id: "menu",     label: "The Menu",    href: "menu.html" },
    { id: "location", label: "Location",    href: "index.html#location" },
    { id: "contact",  label: "Reserve",     href: "index.html#contact" }
  ];
  const S_SUB = [
    { label: "Book a table", href: "https://lasusana.meitre.com/", ext: true },
    { label: "Pavilion VIK", href: "../pavilion-vik/index.html" },
    { label: "VIK José Ignacio", href: "../vik-jose-ignacio/" },
    { label: "Instagram", href: "http://instagram.com/lasusanajoseignacio", ext: true }
  ];
  const S_FOOTER = [
    { title: "La Susana", links: [
      { label: "The restaurant", href: "index.html#about" },
      { label: "The menu", href: "menu.html" },
      { label: "The place", href: "index.html#gallery" },
      { label: "Location", href: "index.html#location" }] },
    { title: "Reserve", links: [
      { label: "Book a table", href: "https://lasusana.meitre.com/", ext: true },
      { label: "info@lasusana.com", href: "mailto:info@lasusana.com" },
      { label: "+598 095 192 555", href: "tel:+59895192555" }] },
    { title: "José Ignacio", links: [
      { label: "Estancia VIK", href: "../vik-jose-ignacio/estancia.html" },
      { label: "Playa VIK", href: "../vik-jose-ignacio/playa.html" },
      { label: "Bahía VIK", href: "../vik-jose-ignacio/bahia.html" },
      { label: "Pavilion VIK", href: "../pavilion-vik/index.html" }] },
    { title: "VIK World", links: [
      { label: "VIK Retreats", href: "https://www.vikretreats.com/", ext: true },
      { label: "Galleria VIK", href: "../galleria-vik-milano/index.html" },
      { label: "VIK Chile", href: "https://www.vikchile.com/", ext: true },
      { label: "VIK Wines", href: "https://www.vikwine.com/", ext: true }] }
  ];

  const P_NAV = [
    { id: "home",     label: "Pavilion VIK",  href: "../vik-retreats/" },
    { id: "menu",     label: "Formats",       href: "menu.html" },
    { id: "location", label: "Location",      href: "index.html#location" },
    { id: "contact",  label: "Enquire",       href: "index.html#contact" }
  ];
  const P_SUB = [
    { label: "events@vikretreats.com", href: "mailto:events@vikretreats.com" },
    { label: "La Susana", href: "../la-susana/index.html" },
    { label: "VIK José Ignacio", href: "../vik-jose-ignacio/" },
    { label: "Instagram", href: "http://instagram.com/vikretreats", ext: true }
  ];
  const P_FOOTER = [
    { title: "Pavilion VIK", links: [
      { label: "The building", href: "index.html#about" },
      { label: "Formats and catering", href: "menu.html" },
      { label: "The space", href: "index.html#gallery" },
      { label: "Location", href: "index.html#location" }] },
    { title: "Enquire", links: [
      { label: "events@vikretreats.com", href: "mailto:events@vikretreats.com" },
      { label: "+598 95 844 445", href: "tel:+59895844445" }] },
    { title: "Stay nearby", links: [
      { label: "Estancia VIK", href: "../vik-jose-ignacio/estancia.html" },
      { label: "Playa VIK", href: "../vik-jose-ignacio/playa.html" },
      { label: "Bahía VIK", href: "../vik-jose-ignacio/bahia.html" },
      { label: "La Susana", href: "../la-susana/index.html" }] },
    { title: "VIK World", links: [
      { label: "VIK Retreats", href: "https://www.vikretreats.com/", ext: true },
      { label: "Galleria VIK", href: "../galleria-vik-milano/index.html" },
      { label: "VIK Chile", href: "https://www.vikchile.com/", ext: true },
      { label: "VIK Wines", href: "https://www.vikwine.com/", ext: true }] }
  ];

  const SITES = {
    susana: {
      nav: S_NAV, sub: S_SUB, footer: S_FOOTER,
      home: "../vik-retreats/", loader: "La Susana",
      mark: null, place: "LA SUSANA", tag: null, bookbar: false,
      bookLabel: "Book Your Table",
      bookHref: "https://lasusana.meitre.com/",
      whatsapp: "59895192555",
      wamsg: "Hello — I would like to book a table at La Susana.",
      brand: "La Susana · José Ignacio · Uruguay",
      tagline: "Feet in the sand. Lunch, sunset, dinner, and the fire.",
      copy: "© La Susana · José Ignacio, Uruguay"
    },
    pavilion: {
      nav: P_NAV, sub: P_SUB, footer: P_FOOTER,
      home: "../vik-retreats/", loader: "Pavilion VIK",
      mark: null, place: "PAVILION VIK", tag: null, bookbar: false,
      bookLabel: "Enquire",
      bookHref: "mailto:events@vikretreats.com",
      whatsapp: "59895844445",
      wamsg: "Hello — I would like to enquire about Pavilion VIK.",
      brand: "Pavilion VIK · José Ignacio · Uruguay",
      tagline: "A dome on the waterfront, with hundreds of skylights in the form of stars.",
      copy: "© Pavilion VIK · José Ignacio, Uruguay"
    },
    destination: {
      nav: NAV, sub: SUB, footer: FOOTER,
      home: "../vik-jose-ignacio/", loader: DESTINATION,
      mark: null, tag: null, bookbar: true,
      brand: "VIK Retreats · José Ignacio · Uruguay",
      tagline: "Created through art. Rooted in nature and culture. Yours to experience.",
      copy: "© VIK Retreats · José Ignacio, Uruguay"
    },
    /* ── La mesa ────────────────────────────────────────────
       Dining es la misma direccion con otra reserva: el mismo menu,
       el mismo pie y la misma barra superior, con el boton llevando a
       Meitre en vez de al motor de habitaciones. Nada mas cambia.

       bookHost afloja la coincidencia a todo el dominio, porque aqui
       no hay una mesa sino cuatro, cada una con su propia direccion
       dentro de Meitre. */
    dining: {
      nav: NAV, sub: SUB, footer: FOOTER,
      home: "../vik-jose-ignacio/", loader: DESTINATION,
      mark: null, tag: null, bookbar: false,
      bookLabel: "Book a Table",
      bookHref: "https://lasusana.meitre.com/",
      bookHost: "meitre.com",
      brand: "VIK Retreats · José Ignacio · Uruguay",
      tagline: "Created through art. Rooted in nature and culture. Yours to experience.",
      copy: "© VIK Retreats · José Ignacio, Uruguay"
    },
    world: {
      nav: W_NAV, sub: W_SUB, footer: W_FOOTER,
      home: "../vik-retreats/", loader: "VIK Retreats",
      /* The group signs with the group wordmark and carries the place
         small beside it — the same rule a retreat page follows, with
         the place being two countries instead of one village. */
      mark: LOGO, tag: "Uruguay · Italy · Chile", bookbar: false,
      brand: "VIK Retreats · Uruguay · Italy · Chile",
      tagline: "Created through art. Rooted in nature and culture. Yours to experience.",
      copy: "© VIK Retreats · Uruguay, Italy and Chile"
    }
  };

  /* El wordmark del grupo. Ruta propia de la v2, no la de A(): las
     paginas heredadas fijan window.VIK_BASE apuntando al arbol de
     assets viejo, y el logotipo de la v2 no vive ahi. Una pagina a
     otra profundidad lo corrige con window.VIK_V2_BASE. */
  /* Los assets de la v2 viven en su propio arbol. Las paginas
     heredadas fijan window.VIK_BASE apuntando al arbol viejo, asi
     que A() no sirve para esto: el logotipo de la v2 no esta ahi. */
  const V2 = window.VIK_V2_BASE || "../assets/";
  /* El pie es tinta, asi que firma con la version blanca ya
     rasterizada. Antes iba el SVG azul con un filtro encima —
     misma capa de composicion, mismos cantos serruchados. */
  const MARCA = V2 + "logo/lw-vik-retreats-white.png";

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const ext = l => l.ext || /^https?:/.test(l.href)
    ? ' target="_blank" rel="noopener"' : "";

  const siteOf = el => SITES[(el && el.dataset.site) ||
    document.body.dataset.site || "destination"] || SITES.destination;


  /* ── LA BARRA ─────────────────────────────────────────────────
     Marca a la izquierda, indice al medio, reserva y hamburguesa a
     la derecha. El indice se cae solo por CSS en cuanto no hay
     sitio; la hamburguesa aparece en el mismo corte, asi que nunca
     hay una ventana sin forma de navegar.

     data-page marca cual de los nombres esta encendido. */
  /* LA FIRMA DE LA BARRA.
     Manda la casa, no el grupo: quien esta leyendo Bahia ve el
     logotipo de Bahía VIK, y "VIK Retreats" chico al lado. El
     grupo es el apellido, no el nombre.

     Se usa el logotipo de verdad, no el nombre compuesto con la
     tipografia: el lockup lleva su propio interletrado y su propia
     relacion entre las dos palabras, y eso no se reproduce con
     letter-spacing.

     Donde no existe lockup —Jose Ignacio no tiene uno dibujado— se
     firma con texto, que es como lo hace la portada del destino. */
  /* En PNG y no en SVG. Un filter sobre un SVG lo manda a una capa
     de composicion propia y el navegador lo rasteriza a la
     resolucion de esa capa, no a la de la pantalla: eso es lo que
     se veia serruchado en los cantos de las letras.

     Ademas van dos archivos por casa, negro y blanco, y se cambia
     de uno a otro por opacidad. Asi no hay ni un filtro sobre el
     logotipo: lo que se ve es el archivo, tal cual. */
  const LOCKUP = {
    bahia:    "lw-bahia-vik",
    playa:    "lw-playa-vik",
    estancia: "lw-estancia-vik",
    galleria: "lw-galleria-vik",
    chile:    "lw-vik-chile",
    uruguay:  "lw-vik-uruguay",
    retreats: "lw-vik-retreats"
  };

  const barra = (S, cfg) => {
    const casa = cfg.tag || S.loader;
    const svg  = LOCKUP[cfg.logo];
    const marca = svg
      ? `<span class="nav-lw">` +
        `<img class="lw-w" src="${esc(V2 + "logo/" + svg)}-white.png" alt="${esc(casa)}">` +
        `<img class="lw-b" src="${esc(V2 + "logo/" + svg)}-black.png" alt="" aria-hidden="true">` +
        `</span>`
      : `<span class="nav-mark">${esc(casa)}</span>`;

    const indice = S.nav.map(n =>
      `<a href="${esc(n.href)}"${ext(n)}${n.id === cfg.page ? ' class="is-on" aria-current="page"' : ""}>${esc(n.label)}</a>`
    ).join("\n      ");

    return `
<nav class="nav" id="nav" aria-label="Primary">
  <div class="nav-left">
    <a href="${esc(S.home)}" aria-label="${esc(casa)}">${marca}</a>
    <span class="nav-tag">${esc(S.tag || "VIK Retreats")}</span>
  </div>
  <div class="nav-mid" id="navMid">
      ${indice}
    <span class="nav-lang">
      <label class="sr-only" for="langPick">Language</label>
      <select id="langPick">
        <option value="en" data-label="EN">English</option>
        <option value="es" data-label="ES">Espa&ntilde;ol</option>
        <option value="pt" data-label="PT">Portugu&ecirc;s</option>
      </select>
    </span>
  </div>
  <div class="nav-end">
    <a class="nav-book" href="${esc(S.bookHref || "#book")}"${S.bookHref ? ' target="_blank" rel="noopener"' : ""}>${esc(S.bookLabel || "Book")}</a>
    <button class="menu-toggle" type="button" id="menuToggle" aria-label="Menu" aria-expanded="false" aria-controls="menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;
  };


  /* ── EL MENU ──────────────────────────────────────────────────
     Dos filas: el indice del sitio en cuerpo grande y, debajo, el
     mundo VIK entero. Quien llego a un destino queda a un toque de
     todos los demas, y del grupo. */
  const menu = S => `
<aside class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
  <ul class="menu-list">
    ${S.nav.map(n => `<li><a class="menu-link" href="${esc(n.href)}"${ext(n)}>${esc(n.label)}</a></li>`).join("\n    ")}
  </ul>
  <nav class="menu-sub" aria-label="The VIK world">
    ${S.sub.map(l => `<a href="${esc(l.href)}"${ext(l)}>${esc(l.label)}</a>`).join("\n    ")}
  </nav>
  <span class="menu-brand">${esc(S.brand)}</span>
</aside>`;


  /* ── LA BARRA DE RESERVA ──────────────────────────────────────
     Solo donde hay motor de habitaciones. La mesa, el evento y el
     grupo no reservan noches, asi que no la llevan: una barra
     pegada al pie que pregunta lo que la pagina no puede responder
     es ruido. */
  const bookbar = S => !S.bookbar ? "" : `
<form class="bookbar" id="bookbar" data-booking aria-label="Check availability">
  <span class="bookbar-t">Check availability</span>
  <div class="bookbar-row">
    <div class="f">
      <label for="bbIn">Arrival</label>
      <input id="bbIn" name="checkin" type="date">
    </div>
    <div class="f">
      <label for="bbOut">Departure</label>
      <input id="bbOut" name="checkout" type="date">
    </div>
    <div class="f">
      <label for="bbAd">Guests</label>
      <select id="bbAd" name="adults">
        <option value="1">1 Adult</option>
        <option value="2" selected>2 Adults</option>
        <option value="3">3 Adults</option>
        <option value="4">4 Adults</option>
        <option value="6">6 Adults</option>
        <option value="8">Group &middot; 8+</option>
      </select>
    </div>
    <button class="pill solid" type="submit"><span>Book</span><span class="arw">&#8594;</span></button>
  </div>
</form>`;


  /* ── EL PIE ───────────────────────────────────────────────────
     Cuatro columnas que en telefono se pliegan solas: cada una es
     un <details> y el CSS decide si nacen abiertas. */
  const pie = S => `
<div class="footer-top">
  <div>
    <div class="footer-mark"><img src="${esc(MARCA)}" alt="VIK Retreats"></div>
    <p class="footer-tagline">${esc(S.tagline)}</p>
  </div>
  <div class="footer-news">
    <p class="footer-col-title">The VIK letter</p>
    <form onsubmit="return false">
      <input type="email" placeholder="you@email.com" aria-label="Email">
      <button class="link" type="submit"><span>Subscribe</span><span class="arw">&#8594;</span></button>
    </form>
    <div class="footer-social">
      <a class="link" href="https://www.instagram.com/vikretreats/" target="_blank" rel="noopener"><span>Instagram</span></a>
      <a class="link" href="mailto:guestexperience@vikretreats.com"><span>Email</span></a>
    </div>
  </div>
</div>

<div class="footer-grid">
  ${S.footer.map(col => `<details class="foot-acc" open>
    <summary class="footer-col-title">${esc(col.title)}</summary>
    <nav class="footer-links" aria-label="${esc(col.title)}">
      ${col.links.map(l => `<a href="${esc(l.href)}"${ext(l)}>${esc(l.label)}</a>`).join("\n      ")}
    </nav>
  </details>`).join("\n  ")}
</div>

<div class="footer-bottom">
  <p class="footer-copy">${esc(S.copy).replace(" &middot; ", "<br>").replace(/ · /, "<br>")}</p>
  <nav class="footer-legal" aria-label="Legal">
    <a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Accessibility</a><a href="#top">Cookies</a>
  </nav>
</div>`;


  /* ── EL MONTAJE ───────────────────────────────────────────────
     Las capas de siempre — grano, cargador, cursor y progreso —
     salen de aqui tambien: son las mismas en las dieciocho y
     escribirlas a mano es como se desincronizan. */
  const capas = S => `
<div class="grain" aria-hidden="true"></div>
<div class="loader" aria-hidden="true"><span class="ll">${esc(S.loader)}</span><span class="lb"></span></div>
<div class="cursor" id="cd" aria-hidden="true"><div class="cdot"></div></div>
<div class="cursor" id="cr" aria-hidden="true"><div class="cring" id="cring"></div></div>
<div class="progress" id="progress" aria-hidden="true"></div>`;

  const montar = () => {
    const c = document.querySelector("[data-vik-chrome]");
    if (c) {
      const S = siteOf(c);
      c.outerHTML = capas(S) + menu(S) +
        barra(S, { page: c.dataset.page || "", tag: c.dataset.tag, logo: c.dataset.logo }) +
        bookbar(S);
    }
    const f = document.querySelector("[data-vik-footer]");
    if (f) {
      const S = siteOf(f);
      f.className = "footer";
      f.setAttribute("data-ground", "dark");
      f.innerHTML = pie(S);
    }
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", montar)
    : montar();
})();
