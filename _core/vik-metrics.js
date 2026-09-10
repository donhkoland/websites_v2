/* ══════════════════════════════════════════════════════════════
   VIK RETREATS · METRICS
   The measurement layer for index.html. It collects, it does
   not decide: nothing is sent anywhere until a destination is
   configured, and nothing is collected at all until consent is
   granted. Drop in a GA4 id, a GTM container, an endpoint of your
   own, or all three — the collection code never changes.

   Wire it up in the page, after the script tag:

     VIKMetrics.config({
       consent : "granted",          // "granted" | "denied" (default)
       ga4     : "G-XXXXXXXXXX",     // fans out through gtag()
       gtm     : true,               // fans out through dataLayer
       endpoint: "/collect",         // your own sink, sendBeacon
       debug   : false               // mirrors every event to console
     });

   Everything else is automatic. Four families are captured:

     SOURCE   where they came from — referrer, channel, utm_*, click
              ids, landing path, first touch vs this touch
     FORMAT   what they came in — viewport, device class, pointer,
              dpr, connection, language, timezone, reduced motion
     TIME     seconds — engaged (visible and not idle) vs elapsed,
              time to first action, dwell per section
     JOURNEY  how far they travelled — scroll depth, scroll distance
              in screens, sections in order, the panels they swept
              past and the ones they actually chose, and on the map:
              pan distance in km and the zooms they used

   Anything can be tagged by hand without touching this file:
     <a data-track="book" data-track-label="hero">…</a>

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const CFG = {
    consent: "denied", ga4: null, gtm: false, endpoint: null,
    debug: false, site: "vikretreats.com", idleAfter: 30000, flushEvery: 15000
  };

  const now  = () => Date.now();
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const qs   = new URLSearchParams(location.search);

  /* ── Identity ─────────────────────────────────────────────
     A session id in sessionStorage, a first-touch record in
     localStorage. No cookies, no fingerprinting, no cross-site
     identifier — this is enough to answer "how many visits, how
     deep, from where", which is the whole question. */
  const store = (area, key, make) => {
    try {
      const s = window[area];
      let v = s.getItem(key);
      if (!v) { v = JSON.stringify(make()); s.setItem(key, v); }
      return JSON.parse(v);
    } catch (e) { return make(); }
  };
  const rid = () => (Math.random().toString(36).slice(2) + now().toString(36)).slice(0, 18);

  const session = store("sessionStorage", "vik.session", () => ({ id: rid(), start: now() }));
  const first   = store("localStorage",   "vik.first",   () => ({
    id: rid(), at: now(), ref: document.referrer || "", path: location.pathname + location.search
  }));

  /* ── Source · where they came from ────────────────────────
     The channel is derived here rather than left to the analytics
     tool, so the same answer arrives at every destination. */
  const host = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const refHost = host(document.referrer);

  const SEARCH = /google|bing|yahoo|duckduckgo|ecosia|baidu|yandex|brave/;
  const SOCIAL = /instagram|facebook|fb\.|twitter|x\.com|t\.co|linkedin|pinterest|tiktok|youtube|reddit|whatsapp/;

  const channel = () => {
    if (qs.get("utm_medium")) return qs.get("utm_medium").toLowerCase();
    if (qs.get("gclid") || qs.get("msclkid") || qs.get("fbclid")) return "paid";
    if (!document.referrer) return "direct";
    if (refHost === location.hostname.replace(/^www\./, "")) return "internal";
    if (SEARCH.test(refHost)) return "organic";
    if (SOCIAL.test(refHost)) return "social";
    return "referral";
  };

  const source = {
    channel:    channel(),
    referrer:   document.referrer || "(none)",
    referrer_host: refHost || "(direct)",
    landing:    location.pathname,
    query:      location.search || "",
    utm_source: qs.get("utm_source") || null,
    utm_medium: qs.get("utm_medium") || null,
    utm_campaign: qs.get("utm_campaign") || null,
    utm_content: qs.get("utm_content") || null,
    utm_term:   qs.get("utm_term") || null,
    click_id:   qs.get("gclid") || qs.get("fbclid") || qs.get("msclkid") || null,
    first_touch_at: first.at,
    first_touch_ref: first.ref || "(direct)",
    returning:  first.at < session.start - 1000
  };

  /* ── Format · what they came in ───────────────────────────
     Read fresh on every send: a phone that rotates mid-visit is a
     different format, and a stale value would say otherwise. */
  const deviceClass = w => w < 700 ? "phone" : w < 1100 ? "tablet" : w < 1700 ? "desktop" : "wide";
  const format = () => {
    const c = navigator.connection || {};
    return {
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      device:     deviceClass(window.innerWidth),
      orientation: window.innerWidth >= window.innerHeight ? "landscape" : "portrait",
      dpr:        round(window.devicePixelRatio || 1, 2),
      screen_w:   screen.width,
      screen_h:   screen.height,
      pointer:    matchMedia("(pointer:coarse)").matches ? "coarse" : "fine",
      touch:      navigator.maxTouchPoints || 0,
      language:   navigator.language,
      timezone:   Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: c.effectiveType || null,
      downlink:   c.downlink != null ? c.downlink : null,
      save_data:  !!c.saveData,
      reduced_motion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      colour_scheme:  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      platform:   (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || null
    };
  };

  /* ── Time · engaged seconds, not open-tab seconds ─────────
     A tab left open behind another window is not attention. The
     engaged clock only runs while the page is visible and the guest
     has done something in the last idleAfter ms. */
  const T = { start: now(), engaged: 0, lastTick: now(), lastAct: now(), firstAction: null, active: true };

  const tick = () => {
    const t = now();
    const visible = document.visibilityState === "visible";
    const awake   = t - T.lastAct < CFG.idleAfter;
    if (visible && awake) T.engaged += t - T.lastTick;
    T.lastTick = t;
    T.active = visible && awake;
  };
  setInterval(tick, 1000);

  const wake = () => {
    T.lastAct = now();
    if (T.firstAction == null) T.firstAction = round((T.lastAct - T.start) / 1000, 1);
  };
  ["pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(
    e => addEventListener(e, wake, { passive: true }));
  addEventListener("visibilitychange", () => { tick(); if (document.visibilityState === "visible") wake(); });

  const timing = () => ({
    elapsed_s: round((now() - T.start) / 1000, 1),
    engaged_s: round(T.engaged / 1000, 1),
    first_action_s: T.firstAction,
    session_s: round((now() - session.start) / 1000, 1)
  });

  /* ── Journey · how far they travelled ─────────────────────
     Depth is the furthest they reached. Distance is how much
     scrolling that actually took, expressed in screens — the two
     differ wildly between a reader and someone hunting for a price. */
  const J = {
    depth: 0, distance: 0, lastY: 0, screens: 0,
    sections: [], dwell: {}, panels: 0, opened: [], passed: 0, path: [],
    map_pan_km: 0, map_zooms: [], map_moves: 0, actions: 0
  };

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    J.distance += Math.abs(y - J.lastY);
    J.lastY = y;
    J.depth = Math.max(J.depth, Math.min(100, Math.round((y / h) * 100)));
    J.screens = round(J.distance / Math.max(1, window.innerHeight), 2);
  };
  addEventListener("scroll", onScroll, { passive: true });

  const journey = () => ({
    scroll_depth_pct: J.depth,
    scroll_distance_px: Math.round(J.distance),
    scroll_screens: J.screens,
    sections_seen: J.sections.length,
    section_order: J.sections.join(" > "),
    section_dwell_s: J.dwell,
    panels_opened: J.panels,
    panel_order: J.opened.join(" > "),
    panels_passed: J.passed,
    panel_path: J.path.join(" > "),
    actions: J.actions,
    map_moves: J.map_moves,
    map_pan_km: round(J.map_pan_km, 1),
    map_zooms: J.map_zooms.join(",")
  });

  /* ── Sending ──────────────────────────────────────────────
     One shape goes to every destination, so a report built on the
     endpoint and a report built in GA4 cannot disagree. */
  let seq = 0;
  const queue = [];

  const envelope = (name, params) => {
    tick();
    return Object.assign({
      event: name, seq: ++seq, ts: now(),
      site: CFG.site, page: location.pathname, title: document.title,
      session_id: session.id, visitor_id: first.id
    }, params, { source, format: format(), timing: timing(), journey: journey() });
  };

  const fanOut = payload => {
    if (CFG.debug) console.log("[vik:metric]", payload.event, payload);

    /* 1 · anything on the page can listen, no tool required */
    dispatchEvent(new CustomEvent("vik:metric", { detail: payload }));

    /* 2 · Google Tag Manager */
    if (CFG.gtm) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(payload); }

    /* 3 · GA4 through gtag — flattened, since GA4 takes no objects */
    if (CFG.ga4 && typeof window.gtag === "function") {
      const flat = {};
      Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v == null || typeof v === "function") return;
        if (typeof v === "object") Object.keys(v).forEach(k2 => {
          const v2 = v[k2];
          if (v2 != null && typeof v2 !== "object") flat[k + "_" + k2] = v2;
        });
        else flat[k] = v;
      });
      window.gtag("event", payload.event, flat);
    }

    /* 4 · your own sink. Batched, and flushed with sendBeacon so the
           last event of a visit survives the page being closed. */
    if (CFG.endpoint) queue.push(payload);
  };

  const flush = (final = false) => {
    if (!CFG.endpoint || !queue.length) return;
    const body = JSON.stringify({ batch: queue.splice(0, queue.length), final });
    if (final && navigator.sendBeacon) {
      navigator.sendBeacon(CFG.endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(CFG.endpoint, { method: "POST", body, keepalive: true,
        headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  };
  setInterval(() => flush(false), CFG.flushEvery);
  addEventListener("pagehide", () => { track("session_end"); flush(true); });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { track("page_hidden"); flush(true); }
  });

  /* Passive events describe the visit; they are not things the guest
     did, so they stay out of the action count. */
  const PASSIVE = ["session_end", "page_hidden", "page_view", "section_view", "panel_focus"];

  const track = (name, params = {}) => {
    if (CFG.consent !== "granted") return;
    if (!PASSIVE.includes(name)) J.actions++;
    fanOut(envelope(name, params));
  };

  /* ── Automatic instrumentation ────────────────────────────
     Sections and outbound links need no markup beyond what a page
     already has. Everything else is opted into with data-track. */
  const observeSections = () => {
    const nodes = [...document.querySelectorAll("[data-track-section]")];
    if (!nodes.length || !("IntersectionObserver" in window)) return;
    const enteredAt = new Map();

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const key = en.target.dataset.trackSection;
        if (en.isIntersecting) {
          enteredAt.set(key, now());
          if (!J.sections.includes(key)) { J.sections.push(key); track("section_view", { section: key }); }
        } else if (enteredAt.has(key)) {
          const secs = (now() - enteredAt.get(key)) / 1000;
          enteredAt.delete(key);
          J.dwell[key] = round((J.dwell[key] || 0) + secs, 1);
        }
      });
    }, { threshold: .5 });
    nodes.forEach(n => io.observe(n));

    /* close the open section when the visit ends, or its dwell is lost */
    addEventListener("pagehide", () => enteredAt.forEach((t, key) => {
      J.dwell[key] = round((J.dwell[key] || 0) + (now() - t) / 1000, 1);
    }));
  };

  const observeClicks = () => {
    document.addEventListener("click", e => {
      const tagged = e.target.closest("[data-track]");
      if (tagged) {
        track(tagged.dataset.track, {
          label: tagged.dataset.trackLabel || tagged.textContent.trim().slice(0, 60),
          property: tagged.dataset.key || tagged.dataset.trackProperty || null,
          href: tagged.getAttribute("href") || null
        });
        return;
      }
      const a = e.target.closest("a[href]");
      if (!a) return;
      const h = a.getAttribute("href");
      if (/^mailto:/.test(h))  return track("email_click",  { href: h });
      if (/^tel:/.test(h))     return track("phone_click",  { href: h });
      if (/^https?:/.test(h) && host(h) !== location.hostname.replace(/^www\./, ""))
        track("outbound", { href: h, domain: host(h) });
    }, true);
  };

  /* ── Public surface ───────────────────────────────────────
     vik-world.js reports panels and map movement through these. */
  const api = {
    config(opts = {}) {
      Object.assign(CFG, opts);
      if (CFG.consent === "granted" && !api._booted) api.boot();
      return api;
    },
    consent(state) { return api.config({ consent: state }); },
    boot() {
      if (api._booted) return api;
      api._booted = true;
      observeSections();
      observeClicks();
      track("page_view");
      return api;
    },
    track,
    /* A chooser panel. Two different questions live here and they
       must not share a number: sweeping the cursor across eight
       panels is the shape of the journey, choosing one is an action.
       Hover and scroll report panel_focus and never touch the action
       count; a click reports panel_open and does. */
    panel(key, how) {
      const chose = how === "click";
      if (chose) { J.panels++; J.opened.push(key); }
      else if (J.path[J.path.length - 1] !== key) { J.passed++; J.path.push(key); }
      track(chose ? "panel_open" : "panel_focus", {
        property: key, method: how || "click",
        panel_index: chose ? J.panels : J.passed
      });
    },
    /* map movement, in kilometres of pan and the zoom levels used */
    mapMove(fromLatLng, toLatLng, zoom) {
      J.map_moves++;
      if (zoom != null && !J.map_zooms.includes(zoom)) J.map_zooms.push(zoom);
      if (fromLatLng && toLatLng) {
        const R = 6371, rad = d => d * Math.PI / 180;
        const dLat = rad(toLatLng[0] - fromLatLng[0]), dLng = rad(toLatLng[1] - fromLatLng[1]);
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(rad(fromLatLng[0])) * Math.cos(rad(toLatLng[0])) * Math.sin(dLng / 2) ** 2;
        J.map_pan_km += 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
      }
    },
    snapshot: () => envelope("snapshot", {}),
    flush
  };

  window.VIKMetrics = api;
})();
