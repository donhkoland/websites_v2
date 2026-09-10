/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · CHOOSER + PROPERTY LIGHTBOX  (M27 / M27b)

   The Chooser is the decision. Clicking a panel used to leave the
   page; now it opens the case for that retreat in a lightbox, so the
   guest can read all three without losing their place — and step
   between them without closing.

   Film is handled here rather than in the markup: a panel carries a
   still and a <video data-src>, and the film only downloads and fades
   up when that panel is the one being looked at. Three autoplaying
   videos side by side is a lot of bandwidth for a decision that only
   needs one.

   Markup:
     <div class="chooser">
       <a class="ch-panel" data-key="playa" href="playa.html">
         <img …><video data-src=A("assets/video/landscape.mp4") …></video>
         …
       </a>
     </div>
     <div class="plb" id="propLightbox">
       <div class="plb-panel" data-plb="playa"> … </div>
     </div>

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* Donde viven los assets. La pagina lo dice con
     window.VIK_BASE; sin eso, al lado, como siempre. */
  const A = p => (window.VIK_BASE || "") + String(p).replace(/^assets\//, "");


  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse  = window.matchMedia("(pointer:coarse)").matches;

  window.VIK = window.VIK || {};

  /* ── Film on the panels ──────────────────────────────────── */
  const play = v => {
    if (!v) return;
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
    const go = () => { v.classList.add("is-playing"); };
    v.play().then(go).catch(() => {
      /* autoplay refused — the still stays, which is a fine outcome */
    });
  };
  const stop = v => { if (!v) return; v.pause(); v.classList.remove("is-playing"); };

  const setupPanelFilm = () => {
    const panels = $$(".ch-panel");
    if (!panels.length || reduced) return;

    if (coarse) {
      /* No cursor to follow, so the panel nearest the middle plays. */
      if (!("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          const v = $("video", en.target);
          en.intersectionRatio > .6 ? play(v) : stop(v);
        });
      }, { threshold: [0, .6, 1] });
      panels.forEach(p => io.observe(p));
      return;
    }

    panels.forEach(p => {
      const v = $("video", p);
      p.addEventListener("mouseenter", () => play(v));
      p.addEventListener("mouseleave", () => stop(v));
    });
  };

  /* ── The lightbox ────────────────────────────────────────── */
  const setupLightbox = () => {
    const box = $("#propLightbox");
    if (!box) return;
    const panels = $$(".plb-panel", box);
    if (!panels.length) return;

    const keys = panels.map(p => p.dataset.plb);
    const counter = $(".plb-nav .c", box);
    let index = -1, lastFocus = null;

    const show = i => {
      index = (i + panels.length) % panels.length;
      panels.forEach((p, k) => {
        const on = k === index;
        p.classList.toggle("is-on", on);
        const v = $("video", p);
        on ? play(v) : stop(v);
      });
      if (counter) {
        const name = panels[index].dataset.name || "";
        counter.textContent = String(index + 1).padStart(2, "0") + " / " +
          String(panels.length).padStart(2, "0") + (name ? " · " + name : "");
      }
    };

    const open = key => {
      const i = keys.indexOf(key);
      if (i < 0) return;
      lastFocus = document.activeElement;
      show(i);
      document.body.classList.add("plb-open");
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      window.VIK.lenis && window.VIK.lenis.stop();
      const close = $(".plb-close", box);
      close && close.focus({ preventScroll: true });
    };

    const close = () => {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("plb-open");
      panels.forEach(p => stop($("video", p)));
      window.VIK.lenis && window.VIK.lenis.start();
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    };

    /* the Chooser panels open it rather than navigating */
    $$(".ch-panel[data-key]").forEach(p => {
      p.addEventListener("click", e => {
        if (!keys.includes(p.dataset.key)) return;   /* no panel, let the link work */
        e.preventDefault();
        open(p.dataset.key);
      });
    });

    /* THERE IS NO STAY PAGE. "Stay" in the bar, "Stay" in the footer,
       "Help Me Choose" and every panel of the chooser all ask the
       same question, so they all answer it here rather than sending
       the guest to a page that would only ask it again.

       Delegated, so it covers chrome mounted after this ran; and the
       href is left real, so without JavaScript the link still works.
       A modified click (new tab, download) is left alone. */
    document.addEventListener("click", e => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const a = e.target.closest('a[href^="stay.html"], [data-stay]');
      if (!a) return;
      const key = a.dataset.stay && keys.includes(a.dataset.stay) ? a.dataset.stay : keys[0];
      e.preventDefault();
      open(key);
    });

    $$("[data-plb-close]", box).forEach(b => b.addEventListener("click", close));
    $(".plb-backdrop", box) && $(".plb-backdrop", box).addEventListener("click", close);
    $$("[data-plb-prev]", box).forEach(b => b.addEventListener("click", () => show(index - 1)));
    $$("[data-plb-next]", box).forEach(b => b.addEventListener("click", () => show(index + 1)));

    document.addEventListener("keydown", e => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape")     close();
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft")  show(index - 1);
    });

    window.VIK.chooser = { open, close, show };
  };

  const boot = () => { setupPanelFilm(); setupLightbox(); };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
