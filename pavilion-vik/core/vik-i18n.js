/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · I18N
   Native language: EN. ES / PT scaffolded, not yet translated.
   Mechanism copied from the VIK Guest Journey page.

   Markup:  <h1 data-i18n="home.hero.title">Fallback copy</h1>
            <img data-i18n-attr="alt:home.hero.alt" …>
   Dicts:   content/en.js → window.VIK_I18N.en = { "home.hero.title": "…" }

   Any key missing from a dictionary falls back to EN, and any key
   missing from EN falls back to the copy already in the HTML.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const LANGS   = ["en", "es", "pt"];
  const DEFAULT = "en";
  const STORE   = "vik.lang";

  window.VIK_I18N = window.VIK_I18N || {};
  window.VIK = window.VIK || {};

  const $$ = s => [...document.querySelectorAll(s)];

  /* Snapshot the authored EN copy so nothing can ever go blank. */
  const fallback = new Map();
  const snapshot = () => {
    $$("[data-i18n]").forEach(el => {
      if (!fallback.has(el)) fallback.set(el, el.innerHTML);
    });
  };

  const loadDict = lang => new Promise(resolve => {
    if (window.VIK_I18N[lang]) return resolve(window.VIK_I18N[lang]);
    const s = document.createElement("script");
    s.src = (window.VIK_CONTENT_PATH || "content/") + lang + ".js";
    s.onload  = () => resolve(window.VIK_I18N[lang] || null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });

  const apply = dict => {
    const en = window.VIK_I18N[DEFAULT] || {};
    $$("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const v = (dict && dict[k] != null) ? dict[k]
              : (en[k] != null ? en[k] : fallback.get(el));
      if (v != null) el.innerHTML = v;
    });
    $$("[data-i18n-attr]").forEach(el => {
      el.getAttribute("data-i18n-attr").split(",").forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const v = (dict && dict[key] != null) ? dict[key] : en[key];
        if (attr && v != null) el.setAttribute(attr, v);
      });
    });
  };

  const setLang = async lang => {
    if (!LANGS.includes(lang)) lang = DEFAULT;
    const dict = await loadDict(lang);
    apply(dict);
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    document.querySelectorAll(".lang-menu button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === lang));
    const cur = document.getElementById("langCurrent");
    if (cur) cur.textContent = lang.toUpperCase();
    document.dispatchEvent(new CustomEvent("vik:lang", { detail: { lang } }));
  };

  const setupSwitcher = () => {
    const wrap = document.getElementById("lang");
    const btn  = document.getElementById("langBtn");
    if (wrap && btn) {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
      document.addEventListener("click", () => wrap.classList.remove("open"));
    }
    $$(".lang-menu button").forEach(b =>
      b.addEventListener("click", () => {
        setLang(b.dataset.lang);
        wrap && wrap.classList.remove("open");
      }));
  };

  const boot = () => {
    snapshot();
    setupSwitcher();
    let saved = DEFAULT;
    try { saved = localStorage.getItem(STORE) || DEFAULT; } catch (e) {}
    const url = new URLSearchParams(location.search).get("lang");
    setLang(url || saved);
  };

  window.VIK.setLang = setLang;
  window.VIK.langs = LANGS;

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
