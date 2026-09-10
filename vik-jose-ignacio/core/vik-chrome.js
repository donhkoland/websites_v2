/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · CHROME
   Single source for loader, grain, cursor, progress, nav,
   quick menu, booking bar and footer. Every page mounts the
   same markup — never hand-write these blocks in a page.

   Page usage:
     <div data-vik-chrome data-page="stay"></div>   → top chrome
     <div data-vik-footer></div>                    → footer
   Must load BEFORE vik-i18n.js and vik-motion.js.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const NAV = [
    { id: "destination", href: "destination.html", label: "Destination" },
    { id: "stay",        href: "stay.html",        label: "Stay" },
    { id: "dining",      href: "dining.html",      label: "Dining" },
    { id: "experiences", href: "experiences.html", label: "Experiences" },
    { id: "wellness",    href: "wellness.html",    label: "Wellness" },
    { id: "celebrate",   href: "celebrate.html",   label: "Celebrate" },
    { id: "journal",     href: "journal.html",     label: "Journal & Calendar" },
    { id: "contact",     href: "contact.html",     label: "Contact & FAQ" }
  ];

  /* The second row of the menu is the whole VIK world, group first.
     A guest who arrived at one destination should be one tap from
     every other place the group runs, including the group itself. */
  const SUB = [
    { href: "index.html",   label: "VIK Retreats" },
    { href: "estancia.html",      label: "Estancia VIK" },
    { href: "playa.html",         label: "Playa VIK" },
    { href: "bahia.html",         label: "Bahía VIK" },
    { href: "https://vikchile.com/",       label: "VIK Chile",    ext: true },
    { href: "https://www.vikwine.com/",    label: "VIK Wines",    ext: true },
    { href: "../../la-susana/index.html",   label: "La Susana",    ext: true },
    { href: "../pavilion-vik/index.html", label: "Pavilion VIK" }
  ];

  const FOOTER = [
    { title: "Retreats", links: [
      { href: "estancia.html", label: "Estancia VIK" },
      { href: "playa.html",    label: "Playa VIK" },
      { href: "bahia.html",    label: "Bahía VIK" },
      { href: "stay.html", label: "Help Me Choose" }
    ]},
    { title: "Explore", links: [
      { href: "destination.html",  label: "Destination" },
      { href: "dining.html",       label: "Dining" },
      { href: "experiences.html",  label: "Experiences" },
      { href: "wellness.html",     label: "Wellness" },
      { href: "celebrate.html",    label: "Celebrate" },
      { href: "journal.html",      label: "Journal & Calendar" }
    ]},
    { title: "Plan", links: [
      { href: "contact.html",             label: "Contact & FAQ" },
      { href: "contact.html#journey",     label: "Journey Designers" },
      { href: "contact.html#getting-here",label: "Getting Here" },
      { href: "#book",                    label: "Book Your Stay" }
    ]},
    { title: "VIK World", links: [
      { href: "https://www.vikwine.com/",   label: "VIK Wines", ext: true },
      { href: "../../la-susana/index.html",  label: "La Susana", ext: true },
      { href: "../pavilion-vik/index.html", label: "Pavilion VIK" },
      { href: "wellness.html#shack",        label: "The Shack" },
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
    { id: "estancia", href: "estancia.html",               label: "Estancia VIK" },
    { id: "playa",    href: "playa.html",                  label: "Playa VIK" },
    { id: "bahia",    href: "bahia.html",                  label: "Bahía VIK" },
    { id: "milano",   href: "https://www.galleriavikmilano.com/", label: "Galleria VIK", ext: true },
    { id: "chile",    href: "https://vikchile.com/",       label: "VIK Chile",    ext: true },
    { id: "wines",    href: "https://www.vikwine.com/",    label: "VIK Wines",    ext: true }
  ];

  const W_SUB = [
    { href: "jignacio.html", label: "VIK José Ignacio" },
    { href: "../pavilion-vik/index.html", label: "Pavilion VIK" },
    { href: "../../la-susana/index.html",   label: "La Susana",    ext: true },
    { href: "wellness.html", label: "The Shack" },
    { href: "#world-map",    label: "The Map" },
    { href: "mailto:guestexperience@vikretreats.com", label: "Contact" }
  ];

  const W_FOOTER = [
    { title: "Uruguay", links: [
      { href: "estancia.html", label: "Estancia VIK" },
      { href: "playa.html",    label: "Playa VIK" },
      { href: "bahia.html",    label: "Bahía VIK" },
      { href: "jignacio.html", label: "VIK José Ignacio" }
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
      { href: "../../la-susana/index.html",   label: "La Susana",    ext: true },
      { href: "wellness.html",               label: "The Shack" },
      { href: "mailto:guestexperience@vikretreats.com", label: "Contact" }
    ]}
  ];

  const LOGO = "assets/img/brand/vik_retreats_wordmark_dark_blue.svg";

  /* The top bar always reads: the place, then VIK Retreats small
     beside it. On a retreat page the place is that property; on every
     other page it is the destination. Set it in the page:
       <div data-vik-chrome data-logo="playa">

     Where the manual has a Location Wordmark we use the file. There is
     no "VIK José Ignacio" wordmark in the manual — the nearest is VIK
     Uruguay — so the destination is set in Highway Gothic Expanded
     under the same ID rule the wordmarks are drawn from. */
  const LOCATION_MARKS = {
    estancia: "assets/img/brand/lw-estancia-vik-white.svg",
    playa:    "assets/img/brand/lw-playa-vik-white.svg",
    bahia:    "assets/img/brand/lw-bahia-vik-white.svg",
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
    { id: "home",     label: "La Susana",   href: "index.html" },
    { id: "menu",     label: "The Menu",    href: "menu.html" },
    { id: "location", label: "Location",    href: "index.html#location" },
    { id: "contact",  label: "Reserve",     href: "index.html#contact" }
  ];
  const S_SUB = [
    { label: "Book a table", href: "https://lasusana.meitre.com/", ext: true },
    { label: "Pavilion VIK", href: "../pavilion-vik/index.html" },
    { label: "VIK José Ignacio", href: "../vik-jose-ignacio/jignacio.html" },
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
    { id: "home",     label: "Pavilion VIK",  href: "index.html" },
    { id: "menu",     label: "Formats",       href: "menu.html" },
    { id: "location", label: "Location",      href: "index.html#location" },
    { id: "contact",  label: "Enquire",       href: "index.html#contact" }
  ];
  const P_SUB = [
    { label: "events@vikretreats.com", href: "mailto:events@vikretreats.com" },
    { label: "La Susana", href: "../la-susana/index.html" },
    { label: "VIK José Ignacio", href: "../vik-jose-ignacio/jignacio.html" },
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
      home: "index.html", loader: "La Susana",
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
      home: "index.html", loader: "Pavilion VIK",
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
      home: "jignacio.html", loader: DESTINATION,
      mark: null, tag: null, bookbar: true,
      brand: "VIK Retreats · José Ignacio · Uruguay",
      tagline: "Created through art. Rooted in nature and culture. Yours to experience.",
      copy: "© VIK Retreats · José Ignacio, Uruguay"
    },
    world: {
      nav: W_NAV, sub: W_SUB, footer: W_FOOTER,
      home: "index.html", loader: "VIK Retreats",
      /* The group signs with the group wordmark and carries the place
         small beside it — the same rule a retreat page follows, with
         the place being two countries instead of one village. */
      mark: LOGO, tag: "Uruguay · Italy · Chile", bookbar: false,
      brand: "VIK Retreats · Uruguay · Italy · Chile",
      tagline: "Created through art. Rooted in nature and culture. Yours to experience.",
      copy: "© VIK Retreats · Uruguay, Italy and Chile"
    }
  };

  const link = l =>
    `<a href="${l.href}"${l.ext ? ' target="_blank" rel="noopener"' : ""}>${l.label}</a>`;

  /* ── Top chrome ─────────────────────────────────────────── */
  const chrome = (page, tag, mark, S) => `
  <div class="grain" aria-hidden="true"></div>
  <div class="loader" aria-hidden="true"><span class="ll">${S.loader}</span><span class="lb"></span></div>
  <div class="cursor" id="cd" aria-hidden="true"><div class="cdot"></div></div>
  <div class="cursor" id="cr" aria-hidden="true"><div class="cring" id="cring"></div></div>
  <div class="progress gpu" id="progress" aria-hidden="true"></div>

  <aside class="quick-menu" id="quickMenu" role="dialog" aria-modal="true" aria-hidden="true">
    <ul class="menu-list">
      ${S.nav.map(n => `<li><a class="menu-link${n.id === page ? " is-current" : ""}" href="${n.href}"${n.ext ? ' target="_blank" rel="noopener"' : ""} data-i18n="nav.${n.id}">${n.label}</a></li>`).join("\n      ")}
    </ul>
    <div class="menu-sub">
      ${S.sub.map(link).join("\n      ")}
    </div>
    <span class="menu-brand">${S.brand}</span>
  </aside>

  <nav class="nav" id="mainNav" aria-label="Primary">
    <div class="nav-left">
      <a href="${S.home}" aria-label="${mark ? tag : DESTINATION}">${mark
        ? `<img class="nav-logo is-location" src="${mark}" alt="${tag}">`
        : `<span class="nav-mark lw">${S.place || DESTINATION}</span>`}</a>
      ${mark === LOGO
        ? `<span class="nav-tag">${tag || "System"}</span>`
        : `<a class="nav-tag" href="index.html" aria-label="VIK Retreats · the group">VIK Retreats</a>`}
    </div>
    <div class="nav-end">
      <a class="nav-link nav-book" href="${S.bookHref || BOOK}"${S.bookHref ? "" : ' target="_blank" rel="noopener"'} data-i18n="cta.book">${S.bookLabel || "Book Your Stay"}</a>
      <div class="lang" id="lang">
        <button class="lang-btn" id="langBtn" type="button" aria-haspopup="true" aria-expanded="false"><span id="langCurrent">EN</span><span class="chev">▾</span></button>
        <div class="lang-menu" role="menu">
          <button type="button" data-lang="en" class="active">English<span>EN</span></button>
          <button type="button" data-lang="es">Español<span>ES</span></button>
          <button type="button" data-lang="pt">Português<span>PT</span></button>
        </div>
      </div>
      <button class="menu-toggle" type="button" id="menuToggle" aria-label="Menu" aria-expanded="false" aria-controls="quickMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  ${!S.bookbar ? "" : `
  <form class="bookbar" id="bookbar" data-booking>
    <div class="bookbar-copy">
      <span class="t" data-i18n="bookbar.title">One destination. Three retreats.</span>
      <span class="s" data-i18n="bookbar.sub">Estancia VIK · Playa VIK · Bahía VIK</span>
    </div>
    <div class="bookbar-fields">
      <div class="bookbar-field">
        <label for="bbIn" data-i18n="book.in">Arrive</label>
        <input id="bbIn" name="checkin" type="date">
      </div>
      <div class="bookbar-field">
        <label for="bbOut" data-i18n="book.out">Depart</label>
        <input id="bbOut" name="checkout" type="date">
      </div>
      <div class="bookbar-field">
        <label for="bbProp" data-i18n="book.retreat">Retreat</label>
        <select id="bbProp" name="property">
          <option value="any" data-i18n="book.any">Help me choose</option>
          <option value="estancia">Estancia VIK</option>
          <option value="playa">Playa VIK</option>
          <option value="bahia">Bahía VIK</option>
        </select>
      </div>
    </div>
    <div class="bookbar-actions">
      <a class="btn-line" href="contact.html" data-i18n="cta.journey">Contact a Journey Designer</a>
      <button class="btn-solid" type="submit"><span data-i18n="cta.check">Check Availability</span><span class="arw">→</span></button>
    </div>
  </form>`}`;

  /* ── Footer ─────────────────────────────────────────────── */
  /* Three bands, each with its own grid, so nothing has to share a
     column count. 4 → 2 → 1 without crowding at any width. */
  const footer = S => `
  <footer class="system-footer">
    <div class="footer-top">
      <div>
        <div class="footer-mark"><img src="${LOGO}" alt="VIK Retreats"></div>
        <p class="footer-tagline" data-i18n="footer.tagline">${S.tagline}</p>
      </div>
      <div class="footer-news">
        <p class="footer-col-title" data-i18n="footer.newsTitle">The VIK letter</p>
        <form onsubmit="return false">
          <input type="email" placeholder="you@email.com" aria-label="Email">
          <button class="btn-line" type="submit"><span data-i18n="footer.newsCta">Subscribe</span><span class="arw">→</span></button>
        </form>
        <div class="footer-social">
          <a class="btn-line" href="https://www.instagram.com/vikretreats/" target="_blank" rel="noopener"><span>Instagram</span></a>
          <a class="btn-line" href="mailto:guestexperience@vikretreats.com"><span>Email</span></a>
        </div>
      </div>
    </div>

    <div class="footer-grid">
      ${S.footer.map(c => `<nav aria-label="${c.title}">
        <p class="footer-col-title">${c.title}</p>
        <div class="footer-links">${c.links.map(link).join("")}</div>
      </nav>`).join("\n      ")}
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">${S.copy}</p>
      <nav class="footer-legal" aria-label="Legal">
        <a href="#legal-privacy" data-legal="privacy">Privacy</a><a href="#legal-terms" data-legal="terms">Terms</a><a href="#legal-accessibility" data-legal="accessibility">Accessibility</a><a href="#legal-cookies" data-legal="cookies">Cookies</a>
      </nav>
    </div>
  </footer>`;

  /* A page names its site once; nothing below asks again. */
  /* La pagina dice de que sitio es, en el body. El div del cromo
     puede decirlo tambien, pero no tiene por que. */
  const siteOf = el => SITES[(el && el.dataset.site) ||
    document.body.dataset.site || "destination"] || SITES.destination;


  /* ── The legal panel ────────────────────────────────────────
     Four links that went to '#'. One panel, four sections, mounted
     on every page like the footer.

     The cartography sits inside the terms rather than under the
     copyright line. It is a licence condition of the tiles the maps
     are drawn with, and a condition read once properly is worth more
     than a grey line nobody finishes. Each source is named with what
     it actually provides. */
  const LEGAL = [
    { key: "terms", title: "Terms of use", eyebrow: "The agreement",
      body: [
        `Rates are quoted in United States dollars and confirmed at the
         moment of booking. A reservation is held against a valid card
         and is subject to the cancellation terms shown at checkout,
         which vary by season and by rate.`,
        `Photography on this site records the retreats as they are.
         Rooms are individual: each was conceived around a commissioned
         work, and no two are identical. The room shown is the room
         type reserved, not the individual room, unless a specific room
         is named on the confirmation.`,
        `VIK Retreats reserves the right to correct errors in published
         rates or availability, including after a booking is made,
         and will offer a full refund where a correction cannot be
         accepted.`
      ],
      credit: true },
    { key: "privacy", title: "Privacy", eyebrow: "What is collected",
      body: [
        `Enquiries and bookings are handled by VIK Retreats and by the
         reservation system that confirms them. Names, contact details
         and stay dates are held for as long as the reservation and the
         accounting behind it require, and are not sold.`,
        `Measurement on this site is off until it is agreed to. Nothing
         is loaded, and nothing is sent, before that. The choice is
         kept on the device and can be withdrawn at any time from the
         cookies section.`
      ] },
    { key: "accessibility", title: "Accessibility", eyebrow: "How this site is built",
      body: [
        `Every control here is reachable by keyboard and carries a name
         a screen reader can announce. Colour is never the only carrier
         of meaning, and text holds a contrast ratio of at least 4.5:1
         against what sits behind it.`,
        `Motion respects the system setting: with reduced motion on,
         the reels stop drifting, the reveals resolve immediately and
         nothing moves that was not asked to move.`,
        `Where something here falls short of that, it is a fault and we
         would like to know. Write to guestexperience@vikretreats.com.`
      ] },
    { key: "cookies", title: "Cookies", eyebrow: "What is stored",
      body: [
        `Two things are kept on the device and neither identifies
         anyone: the chosen language, and whether measurement has been
         agreed to. Both are read only by this site.`,
        `Agreeing to measurement adds analytics cookies set by the
         measurement provider. Declining leaves them unloaded — not
         loaded and ignored, but never requested.`
      ] }
  ];

  const CARTOGRAPHY = [
    ["OpenStreetMap", "The map itself — roads, coastline, the lagoon.",
     "openstreetmap.org/copyright", "ODbL"],
    ["CARTO", "The dark cartography the markers sit on.",
     "carto.com/attributions", "CC BY 3.0"],
    ["Esri", "The satellite imagery behind the terrain view.",
     "esri.com", "Esri World Imagery"]
  ];

  const legalMarkup = `
  <div class="legal" id="legalPanel" role="dialog" aria-modal="true" aria-hidden="true"
       aria-label="Legal">
    <div class="legal-backdrop" data-legal-close></div>
    <div class="legal-sheet" role="document">
      <button class="legal-close" type="button" data-legal-close aria-label="Close">
        <span class="x">×</span>
      </button>
      <nav class="legal-tabs" role="tablist">
        ${LEGAL.map((l, i) => `<button type="button" role="tab" class="legal-tab${i ? "" : " is-on"}"
          data-legal-go="${l.key}">${l.title}</button>`).join("")}
      </nav>
      <div class="legal-scroll">
        ${LEGAL.map((l, i) => `
        <section class="legal-part${i ? "" : " is-on"}" data-legal-part="${l.key}" id="legal-${l.key}">
          <span class="legal-eyebrow ui-label">${l.eyebrow}</span>
          <h2 class="legal-title">${l.title}</h2>
          ${l.body.map(t => `<p class="legal-copy">${t}</p>`).join("")}
          ${l.credit ? `
          <div class="legal-credit">
            <span class="legal-eyebrow ui-label">Cartography</span>
            <p class="legal-credit-lede">The maps on this site are drawn from three
              sources. Each is named here as its licence requires.</p>
            <ul class="legal-sources">
              ${CARTOGRAPHY.map(([name, what, href, lic]) => `
              <li>
                <span class="src-name">${name}</span>
                <span class="src-what">${what}</span>
                <a class="src-link" href="https://${href}" target="_blank" rel="noopener">${href}</a>
                <span class="src-lic">${lic}</span>
              </li>`).join("")}
            </ul>
          </div>` : ""}
        </section>`).join("")}
      </div>
    </div>
  </div>`;

  const mountLegal = () => {
    if (document.getElementById("legalPanel")) return;
    document.body.insertAdjacentHTML("beforeend", legalMarkup);
    const panel = document.getElementById("legalPanel");
    const parts = [...panel.querySelectorAll("[data-legal-part]")];
    const tabs  = [...panel.querySelectorAll("[data-legal-go]")];

    const show = key => {
      parts.forEach(p => p.classList.toggle("is-on", p.dataset.legalPart === key));
      tabs.forEach(t => t.classList.toggle("is-on", t.dataset.legalGo === key));
      const sc = panel.querySelector(".legal-scroll");
      if (sc) sc.scrollTop = 0;
    };
    const open = key => {
      show(key || "terms");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("legal-open");
    };
    const close = () => {
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("legal-open");
    };

    document.addEventListener("click", e => {
      const a = e.target.closest("[data-legal]");
      if (a) { e.preventDefault(); open(a.dataset.legal); return; }
      if (e.target.closest("[data-legal-close]")) close();
      const t = e.target.closest("[data-legal-go]");
      if (t) show(t.dataset.legalGo);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && panel.getAttribute("aria-hidden") === "false") close();
    });

    window.VIK.legal = { open, close };
  };

  /* ── The retreat lightbox (M27b) ────────────────────────────
     There is no Stay page. "Stay", "Help Me Choose" and every panel
     of the chooser all ask the same question — which of the three
     is my trip — and they all answer it here, in place, without
     taking the guest anywhere. So the overlay is chrome: mounted on
     every page, exactly like the footer, and vik-chooser.js opens it
     from whatever was clicked.

     The hrefs stay real. Without JavaScript "Stay" still goes to
     stay.html and the guest still gets the three retreats; with it,
     the link never fires. */
  const RETREATS = [
    { key: "estancia", name: "Estancia VIK", href: "estancia.html",
      place: "Countryside · 20 min inland",
      img: "assets/img/t/estancia_estancia-img_7582-min-1-w1600.jpg",
      film: "assets/video/countryside.mp4",
      lede: "Four thousand acres, horses and fire. The Uruguay that existed long before the coast was discovered.",
      facts: [["Best for", "Families, riders, space"],
              ["Architecture", "Marcelo Daglio · white adobe"],
              ["Dining", "El Asador · open fire"],
              ["Rooms", "12 suites, 12 artists"],
              ["Season", "All year · strongest off-season"]] },
    { key: "playa", name: "Playa VIK", href: "playa.html",
      place: "Oceanfront · on the point",
      img: "assets/img/t/playa_80c9a60ef2cc735699a0e504cbfa54955f3113fe-w1600.jpg",
      film: "assets/video/landscape.mp4",
      lede: "Carlos Ott architecture and contemporary art, with the Atlantic on three sides and almost no one else.",
      facts: [["Best for", "Couples, art, privacy"],
              ["Architecture", "Carlos Ott · titanium"],
              ["Dining", "CieloMar · fish BBQ"],
              ["Rooms", "Suites and six casas"],
              ["Season", "December – March"]] },
    { key: "bahia", name: "Bahía VIK", href: "bahia.html",
      place: "Playa Mansa · in the dunes",
      img: "assets/img/t/bahia_1_bv-0439-scaled-w1600.jpg",
      film: "assets/video/hero-brand.mp4",
      lede: "Design bungalows in the beach dunes on the calm side. The most social of the three, the easiest with children.",
      facts: [["Best for", "Families, groups, beach"],
              ["Architecture", "15 bungalows, 15 materials"],
              ["Dining", "Zodiaco · bay-side"],
              ["Rooms", "10 suites, 15 bungalows"],
              ["Season", "December – March"]] }
  ];

  const retreats = () => {
    /* a property page books itself; everywhere else books at home */
    const book = document.querySelector("#book") ? "#book" : "jignacio.html#book";
    return `
  <div class="plb" id="propLightbox" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="plb-backdrop"></div>
    ${RETREATS.map((r, i) => `
    <div class="plb-panel" data-plb="${r.key}" data-name="${r.name}">
      <div class="plb-media">
        <img src="${r.img}" alt="${r.name}">
        ${r.film ? `<video muted loop playsinline preload="none" data-src="${r.film}"></video>` : ""}
        <span class="plb-index">${String(i + 1).padStart(2, "0")} / ${String(RETREATS.length).padStart(2, "0")}</span>
      </div>
      <div class="plb-body">
        <span class="plb-place">${r.place}</span>
        <span class="lw plb-mark">${r.name}</span>
        <p class="plb-lede">${r.lede}</p>
        <div class="plb-facts">
          ${r.facts.map(f => `<div><span>${f[0]}</span><span>${f[1]}</span></div>`).join("\n          ")}
        </div>
        <div class="plb-actions">
          <a class="btn-solid" href="${r.href}"><span>Explore ${r.name}</span><span class="arw">→</span></a>
          <a class="btn-line" href="${book}"><span>Check availability</span><span class="arw">→</span></a>
        </div>
      </div>
    </div>`).join("")}
    <button class="plb-close" type="button" data-plb-close aria-label="Close">✕</button>
    <div class="plb-nav" aria-label="Retreats">
      <button type="button" data-plb-prev aria-label="Previous retreat"><svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.2"/></svg></button>
      <span class="c">01 / ${String(RETREATS.length).padStart(2, "0")}</span>
      <button type="button" data-plb-next aria-label="Next retreat"><svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.2"/></svg></button>
    </div>
  </div>`;
  };


  /* ── WhatsApp ───────────────────────────────────────────────
     En Jose Ignacio una mesa se reserva por WhatsApp y un evento se
     pregunta por WhatsApp. Un boton fijo en la esquina hace el trabajo
     que hacia la barra de reserva, ocupando una cuarta parte de la
     pantalla menos. Solo aparece donde la ficha del sitio da un
     numero. */
  const whatsapp = S => !S.whatsapp ? "" : `
  <a class="wa" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(S.wamsg || "")}"
     target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4C5.8 20 5.3 18 5.3 16 5.3 10.1 10.1 5.3 16 5.3S26.7 10.1 26.7 16 21.9 26.6 16 26.6zm6-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3s0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.6c-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>
    <span>WhatsApp</span>
  </a>`;


  /* ── El lightbox de reserva ─────────────────────────────────
     El motor de reservas se abre dentro de la pagina en vez de mandar
     al visitante a otro dominio. Quien reserva una mesa esta a dos
     clics de terminar; sacarlo del sitio para eso es perder la mitad.

     Se monta solo donde la ficha del sitio da una direccion http. El
     iframe carga la primera vez que se abre, no en la carga de la
     pagina: son cientos de kilobytes que la mayoria no va a pedir. */
  const bookLightbox = S => {
    const url = S.bookHref || "";
    if (!/^https?:/i.test(url) || document.getElementById("bookLb")) return;

    const host = (url.match(/^https?:\/\/([^/]+)/i) || [])[1] || "";
    document.body.insertAdjacentHTML("beforeend", `
  <div class="rlb" id="bookLb" role="dialog" aria-modal="true"
       aria-label="${S.bookLabel || "Book"}" aria-hidden="true">
    <div class="rlb__panel">
      <div class="rlb__hd">
        <span class="rlb__t">${S.bookLabel || "Book"}</span>
        <button class="rlb__x" type="button" id="bookLbX" aria-label="Close">&#10005;</button>
      </div>
      <iframe class="rlb__frame" id="bookLbFrame" src="about:blank"
              title="${S.loader} · reservations" allow="payment"></iframe>
      <div class="rlb__fb">
        <p>The reservation system could not open here.</p>
        <a class="btn-solid" href="${url}" target="_blank" rel="noopener"><span>Open in a new tab</span><span class="arw">→</span></a>
      </div>
    </div>
  </div>`);

    const lb = document.getElementById("bookLb");
    const frame = document.getElementById("bookLbFrame");
    let loaded = false, last = null;

    const open = () => {
      last = document.activeElement;
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.getElementById("bookLbX").focus();
      if (loaded) return;
      loaded = true;
      frame.src = url;
      frame.addEventListener("error", () => lb.classList.add("is-blocked"));
    };
    const close = () => {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (last) last.focus();
    };

    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || a.closest(".rlb")) return;
      if (host && a.getAttribute("href").indexOf(host) < 0) return;
      e.preventDefault();
      open();
    });
    document.getElementById("bookLbX").addEventListener("click", close);
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    });

    window.VIK.book = { open, close };
  };

  /* ── El alto de la barra ─────────────────────────────────────
     El menu se abre por debajo de la barra, no detras. Ese alto no es
     uno: cambia con el ancho — 93 arriba de 1024, 108 en tablet, 85 en
     telefono — y vuelve a cambiar si el idioma alarga el rotulo de
     reserva o si el lockup se apila. Escrito a mano en el CSS quedaba
     corto justo donde mas se nota, con el primer nombre debajo del
     logo. Se mide el elemento y se publica; el CSS lo lee.          */
  const mountNavHeight = () => {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--nav-h",
      Math.round(nav.getBoundingClientRect().height) + "px");
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(nav);
    else window.addEventListener("resize", set);
    /* La barra se encoge al bajar; el menu se abre sobre la altura
       completa, asi que el valor se refresca al abrirlo. */
    const t = document.getElementById("menuToggle");
    t && t.addEventListener("click", () => requestAnimationFrame(set));
  };

  const mount = () => {
    const c = document.querySelector("[data-vik-chrome]");
    if (c) {
      const S = siteOf(c);
      c.outerHTML = chrome(
        c.dataset.page || "",
        c.dataset.tag  || S.tag  || "",
        LOCATION_MARKS[c.dataset.logo] || S.mark || "",
        S);
    }
    const f = document.querySelector("[data-vik-footer]");
    if (f) f.outerHTML = footer(siteOf(f));

    /* One overlay per page, mounted last so it sits over everything.
       A page that already carries its own (the styleguide's flat
       demo has no id, so it does not count) is left alone. */
    if (!document.getElementById("propLightbox"))
      document.body.insertAdjacentHTML("beforeend", retreats());

    const S2 = siteOf(document.querySelector("[data-vik-footer]") ||
                      document.querySelector("[data-vik-chrome]") || document.body);
    if (S2.whatsapp && !document.querySelector(".wa"))
      document.body.insertAdjacentHTML("beforeend", whatsapp(S2));

    bookLightbox(S2);
    mountNavHeight();

    mountLegal();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", mount)
    : mount();
})();
