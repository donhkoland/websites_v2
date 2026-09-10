/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · BOOKING

   The brief keeps the existing Bookassist integration (and PayPal
   for the José Ignacio properties). This file is the single seam
   between the site and that engine: the form collects intent, and
   `open()` hands it over. To repoint at the live engine, edit
   ENGINE below — nothing else in the site needs to change.

   Every property has its own Bookassist property id, so the
   selector routes to the right one. "Not sure yet" routes to the
   destination-level search, which is exactly the behaviour the
   brief asks for: help the guest choose, do not block them.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

  /* ── Bookassist ─────────────────────────────────────────────
     Bookassist's booking engine reads its search from the query
     string of the property's own secure URL:

       https://book.bookassist.com/{locale}/{hotelPath}
         ?arrival=YYYY-MM-DD&departure=YYYY-MM-DD
         &adults=N&children=N&rooms=N&promocode=CODE

     Three things it needs that a generic link does not give it:
       · ISO dates, never a localised string
       · one hotel id per property — the engine has no concept of
         "the destination", so "help me choose" has to land on the
         destination page here rather than on the engine
       · the locale segment, which is what makes the engine render
         in the guest's language and currency

     Fill in `hotel` for each property from the Bookassist account,
     set `base`, and the whole site is connected. Nothing else in
     the codebase knows the engine exists.                         */
  const ENGINE = {
    base:   "https://book.bookassist.com",
    locale: { en: "en", es: "es", pt: "pt" },
    properties: {
      any:      { hotel: null,           label: "All three retreats", fallback: "stay.html#choose" },
      estancia: { hotel: "estancia-vik", label: "Estancia VIK" },
      playa:    { hotel: "playa-vik",    label: "Playa VIK" },
      bahia:    { hotel: "bahia-vik",    label: "Bahía VIK" }
    },
    /* Bookassist hands payment to PayPal for the José Ignacio
       properties; nothing extra is needed on our side, but the
       flag is here so the UI can say so. */
    paypal: true,
    enquiry: "mailto:guestexperience@vikretreats.com"
  };

  window.VIK = window.VIK || {};

  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* Sensible defaults so the field is never empty: tomorrow, three nights. */
  const defaults = () => {
    const inD = new Date(); inD.setDate(inD.getDate() + 1);
    const outD = new Date(inD); outD.setDate(outD.getDate() + 3);
    return { in: iso(inD), out: iso(outD) };
  };

  const buildURL = data => {
    const prop = ENGINE.properties[data.property] || ENGINE.properties.any;
    const lang = document.documentElement.lang || "en";

    /* No hotel id means the guest has not chosen a retreat yet. The
       engine cannot search three properties at once, so send them to
       the comparison instead of into an empty result. */
    if (!prop.hotel) return prop.fallback || "stay.html#choose";

    const q = new URLSearchParams({
      arrival:   data.in,
      departure: data.out,
      adults:    data.adults || 2,
      children:  data.children || 0,
      rooms:     data.rooms || 1
    });
    if (data.promo) q.set("promocode", data.promo);
    const locale = ENGINE.locale[lang] || "en";
    return `${ENGINE.base}/${locale}/${prop.hotel}?${q}`;
  };

  const read = form => ({
    property: ($("[name=property]", form) || {}).value || "any",
    in:       ($("[name=checkin]", form)  || {}).value,
    out:      ($("[name=checkout]", form) || {}).value,
    adults:   ($("[name=adults]", form)   || {}).value || 2,
    children: ($("[name=children]", form) || {}).value || 0,
    rooms:    ($("[name=rooms]", form)    || {}).value || 1,
    promo:    ($("[name=promo]", form)    || {}).value || ""
  });

  const open = data => {
    const url = buildURL(data);
    /* If a checkout lightbox is on the page it takes the booking and
       calls preventDefault; otherwise we hand off the old way. */
    const ev = new CustomEvent("vik:book", { detail: { data, url }, cancelable: true });
    const handled = !document.dispatchEvent(ev) || !!(window.VIK && window.VIK.checkout);
    if (handled) return;
    if (url.indexOf("http") !== 0) { window.location.href = url; return; }
    window.open(url, "_blank", "noopener");
  };

  const setupForm = form => {
    const d = defaults();
    const ci = $("[name=checkin]", form), co = $("[name=checkout]", form);
    if (ci && !ci.value) { ci.value = d.in;  ci.min = iso(new Date()); }
    if (co && !co.value) { co.value = d.out; co.min = d.in; }

    /* Check-out can never precede check-in. */
    ci && ci.addEventListener("change", () => {
      if (!co) return;
      co.min = ci.value;
      if (co.value <= ci.value) {
        const next = new Date(ci.value);
        next.setDate(next.getDate() + 1);
        co.value = iso(next);
      }
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      open(read(form));
    });
  };

  const boot = () => {
    $$("form[data-booking]").forEach(setupForm);
    $$("[data-book]").forEach(el => el.addEventListener("click", e => {
      e.preventDefault();
      const d = defaults();
      open({ property: el.dataset.book || "any", in: d.in, out: d.out, adults: 2, children: 0 });
    }));
  };

  window.VIK.booking = { open, buildURL, engine: ENGINE };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
