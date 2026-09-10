/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · MOTION + BEHAVIOUR
   Lenis + GSAP/ScrollTrigger. Same stack as the Brand Landing
   and Guest Journey. Everything degrades without the CDNs.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { lenis: null };

  window.VIK = window.VIK || {};

  /* ── Viewport width without the scrollbar ───────────────────
     Full-bleed modules use var(--vw). Using raw 100vw includes the
     scrollbar and pushes the page 8–17px wide on Windows.        */
  const syncVW = () => {
    const el = document.documentElement;
    const set = () => el.style.setProperty("--vw", el.clientWidth + "px");
    set();
    window.addEventListener("resize", set);
    window.addEventListener("orientationchange", set);
    window.addEventListener("load", set);
    /* A resize event is not guaranteed — device emulation, a late web
       font, a scrollbar appearing. Watching the element itself catches
       every case, and a stale --vw breaks every full-bleed module. */
    if (window.ResizeObserver) new ResizeObserver(set).observe(el);
    /* Last line of defence. Some environments change the viewport
       without firing resize or resizing the root box at all — device
       emulation, in-app webviews, a zoomed page. Two comparisons a
       second cost nothing and a stale --vw breaks every full-bleed
       module, which is far more expensive. */
    setInterval(() => {
      if (el.style.getPropertyValue("--vw") !== el.clientWidth + "px") set();
    }, 500);
  };

  /* ── Loader ─────────────────────────────────────────────── */
  const setupLoader = () => {
    const l = $(".loader");
    if (!l) return;
    window.addEventListener("load", () => setTimeout(() => l.classList.add("is-hidden"), 350));
    setTimeout(() => l.classList.add("is-hidden"), 2600);
  };

  /* ── Cursor ─────────────────────────────────────────────── */
  const setupCursor = () => {
    const cd = $("#cd"), cr = $("#cr"), ring = $("#cring");
    if (!cd || !cr || window.matchMedia("(hover:none)").matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      cd.style.left = mx + "px"; cd.style.top = my + "px";
    });
    const lerp = () => {
      rx += (mx - rx) * .12; ry += (my - ry) * .12;
      cr.style.left = rx + "px"; cr.style.top = ry + "px";
      requestAnimationFrame(lerp);
    };
    lerp();
    document.addEventListener("mouseover", e => {
      if (e.target.closest("a,button")) ring?.classList.add("grow");
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest("a,button")) ring?.classList.remove("grow");
    });
  };

  /* ── Smooth scroll + nav state ──────────────────────────── */
  const setupScroll = () => {
    const nav = $("#mainNav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (reduced || !window.Lenis) return;
    state.lenis = new Lenis({
      duration: 1.18,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true, wheelMultiplier: .92, touchMultiplier: 1.4
    });
    const raf = t => { state.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.VIK.lenis = state.lenis;
  };

  const scrollTo = target => {
    if (target === "#top" || target === "#") {
      state.lenis ? state.lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    const node = $(target);
    if (!node) return false;
    state.lenis ? state.lenis.scrollTo(node, { offset: -60 }) : node.scrollIntoView({ behavior: "smooth" });
    return true;
  };

  /* ── Quick menu ─────────────────────────────────────────── */
  const setupMenu = () => {
    const toggle = $("#menuToggle"), menu = $("#quickMenu");
    if (!toggle || !menu) return;
    const close = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked", "menu-open");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("is-locked", open);
      document.body.classList.toggle("menu-open", open);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    $$("a[href^='#']").forEach(link => {
      link.addEventListener("click", e => {
        const t = link.getAttribute("href");
        if (!t || t === "#") return;
        e.preventDefault();
        close();
        scrollTo(t);
      });
    });
  };

  /* ── Reveal + parallax ──────────────────────────────────── */
  const setupReveal = () => {
    const items = $$(".r, .reveal");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
      items.forEach(el => io.observe(el));
    }
  };

  const setupParallax = () => {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const p = $("#progress");
    if (p) gsap.to(p, { scaleX: 1, ease: "none", scrollTrigger: { scrub: .1, start: 0, end: "max" } });
    $$("[data-parallax]").forEach(node => {
      const pct = Number(node.dataset.parallax || 14);
      if (!pct) return;
      gsap.to(node, {
        yPercent: pct, ease: "none",
        scrollTrigger: { trigger: node.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  };

  /* ── Rails: transform-driven marquee + drag ─────────────────
     scrollLeft only accepts whole pixels, so a slow drift lands on
     the same pixel for several frames and the eye reads it as a
     smear. Everything moves on a transformed track instead: GPU
     compositing, true sub-pixel positions, no repaint per frame.
     Speed is per-rail: data-rail-speed="0.5" (px per 60fps frame). */
  const initRail = rail => {
    const auto = rail.dataset.rail === "auto";
    const speed = Number(rail.dataset.railSpeed || .5);

    /* wrap the children once, then duplicate the set for the loop */
    let track = $(":scope > .rail-track", rail);
    if (!track) {
      track = document.createElement("div");
      track.className = "rail-track";
      while (rail.firstChild) track.appendChild(rail.firstChild);
      rail.appendChild(track);
      if (auto) {
        const set = [...track.children];
        set.forEach(n => track.appendChild(n.cloneNode(true)));
      }
    }
    rail.classList.add("is-track");

    let half = 0, span = 0;
    const measure = () => {
      span = track.scrollWidth;
      half = auto ? span / 2 : Math.max(0, span - rail.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);
    $$("img", track).forEach(im => im.addEventListener("load", measure, { once: true }));

    let x = 0, down = false, startX = 0, startPos = 0, moved = false, paused = false, glide = 0;

    const clamp = v => auto ? ((v % half) + half) % half : Math.max(0, Math.min(half, v));
    const start = px => { down = true; moved = false; startX = px; startPos = x; glide = 0; rail.classList.add("is-dragging"); };
    const move  = px => {
      if (!down) return;
      const d = startX - px;
      if (Math.abs(d) > 3) moved = true;
      const nx = clamp(startPos + d);
      glide = nx - x;
      x = nx;
    };
    const end = () => { down = false; rail.classList.remove("is-dragging"); };

    rail.addEventListener("mousedown", e => { e.preventDefault(); start(e.pageX); });
    window.addEventListener("mousemove", e => move(e.pageX));
    window.addEventListener("mouseup", end);
    rail.addEventListener("touchstart", e => { paused = true; start(e.touches[0].pageX); }, { passive: true });
    rail.addEventListener("touchmove",  e => move(e.touches[0].pageX), { passive: true });
    rail.addEventListener("touchend", () => { end(); setTimeout(() => paused = false, 2400); });
    rail.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener("mouseenter", () => paused = true);
    rail.addEventListener("mouseleave", () => { paused = false; end(); });

    rail.__rail = {
      nudge: dir => { const step = (track.firstElementChild || {}).getBoundingClientRect
                        ? track.firstElementChild.getBoundingClientRect().width : 480;
                      x = clamp(x + dir * step); }
    };

    if (reduced) { track.style.transform = "none"; return; }

    let last = performance.now();
    const tick = now => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      if (!down) {
        if (Math.abs(glide) > .05) { x = clamp(x + glide * dt); glide *= .92; }  /* inertia */
        else if (auto && !paused) x = clamp(x + speed * dt);
      }
      track.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const setupRails = () => {
    $$(".gallery-rail, .prop-rail, .logo-rail, .reel-wide").forEach(initRail);
    $$("[data-rail-prev],[data-rail-next]").forEach(btn => {
      btn.addEventListener("click", () => {
        const rail = $(btn.dataset.railPrev || btn.dataset.railNext);
        rail && rail.__rail && rail.__rail.nudge(btn.dataset.railPrev ? -1 : 1);
      });
    });
  };

  /* ── Responsive image derivatives ───────────────────────────
     tools_thumbs.py writes assets/img/t/<folder>__<file>-w{N}.jpg.
     `data-hover-img="estancia/Photo.jpg"` resolves to the smallest
     derivative that still covers the rendered box at this DPR, and
     falls back to the original if the derivative is missing.      */
  const SIZES = [480, 900, 1600];
  const derivative = (rel, cssPx) => {
    if (!rel) return null;
    if (rel.startsWith("assets/") || rel.startsWith("http")) return { src: rel, fallback: rel };
    const need = cssPx * Math.min(window.devicePixelRatio || 1, 2);
    const w = SIZES.find(s => s >= need) || SIZES[SIZES.length - 1];
    const slug = rel.replace(/\//g, "__").replace(/\.[^.]+$/, "");
    return { src: `assets/img/t/${slug}-w${w}.jpg`, fallback: `assets/img/${rel}` };
  };

  /* ── Drag scrollers ───────────────────────────────────────
     A horizontal scroller that reads as draggable on a phone but is
     still a native snap scroller — used by the press notes, where a
     looping rail would be wrong for three finite citations.       */
  const setupDragScroll = () => {
    $$("[data-drag-scroll], .press-quotes").forEach(el => {
      if (el.__drag) return;
      el.__drag = true;
      let down = false, startX = 0, startScroll = 0, moved = false;
      el.addEventListener("mousedown", e => {
        if (getComputedStyle(el).overflowX !== "auto") return;
        down = true; moved = false; startX = e.pageX; startScroll = el.scrollLeft;
        el.classList.add("is-dragging"); e.preventDefault();
      });
      window.addEventListener("mousemove", e => {
        if (!down) return;
        if (Math.abs(startX - e.pageX) > 3) moved = true;
        el.scrollLeft = startScroll + (startX - e.pageX);
      });
      window.addEventListener("mouseup", () => { down = false; el.classList.remove("is-dragging"); });
      el.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
  };

  /* ── Hover-follow image ─────────────────────────────────────
     Trails the cursor with two different lerp rates plus a skew
     driven by pointer velocity, so it feels like weight rather
     than a sprite pinned to the mouse. Reference: Codrops
     RapidImageHoverMenu.                                          */
  const setupHoverMedia = () => {
    const rows = $$("[data-hover-img]");
    if (!rows.length || reduced) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(max-width:900px)").matches) return;

    const box = document.createElement("div");
    box.className = "hover-media";
    box.setAttribute("aria-hidden", "true");
    const inner = document.createElement("div");
    inner.className = "hover-media-inner";
    box.appendChild(inner);
    document.body.appendChild(box);

    const boxW = () => box.getBoundingClientRect().width || 300;
    const cache = new Map();

    const imgFor = rel => {
      if (cache.has(rel)) return cache.get(rel);
      const d = derivative(rel, boxW());
      const im = new Image();
      im.alt = "";
      im.decoding = "async";
      im.addEventListener("error", () => {
        if (im.src.indexOf("/t/") > -1) im.src = d.fallback;   // derivative absent
      }, { once: true });
      im.src = d.src;
      inner.appendChild(im);
      cache.set(rel, im);
      return im;
    };

    /* Warm the cache when the browser is idle, not on first hover. */
    const warm = () => rows.forEach(r => imgFor(r.getAttribute("data-hover-img")));
    "requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 2500 }) : setTimeout(warm, 1200);

    let tx = 0, ty = 0, cx = 0, cy = 0, px = 0, py = 0, skew = 0, on = false, raf = null, live = false;

    const loop = () => {
      cx += (tx - cx) * .16;
      cy += (ty - cy) * .13;                 /* y lags x — reads as drag */
      const vx = cx - px, vy = cy - py;
      px = cx; py = cy;
      /* The sweep is deliberately slight — enough to read as weight,
         never enough to distort the photograph out of its frame. */
      const target = Math.max(-4, Math.min(4, vx * .16));
      skew += (target - skew) * .1;
      const scale = on ? 1 : .94;
      box.style.transform =
        `translate3d(${cx}px, ${cy}px, 0) translate(-50%,-50%) scale(${scale})`;
      /* Skewing the frame changes its shape. Skew the image inside a
         fixed frame instead, so every card stays the same 4:5. */
      inner.style.transform =
        `skewX(${skew.toFixed(2)}deg) translateY(${(vy * .22).toFixed(2)}px)`;
      if (!on && Math.abs(vx) < .05 && Math.abs(vy) < .05 && Math.abs(skew) < .05) {
        raf = null; live = false; return;    /* idle out — no wasted frames */
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!live) { live = true; raf = requestAnimationFrame(loop); } };

    rows.forEach(row => {
      const rel = row.getAttribute("data-hover-img");
      if (!rel) return;
      row.addEventListener("mouseenter", () => {
        const im = imgFor(rel);
        cache.forEach(o => { if (o !== im) o.classList.remove("is-on"); });
        box.classList.toggle("is-loading", !im.complete);
        if (im.complete) im.classList.add("is-on");
        else im.addEventListener("load", () => {
          im.classList.add("is-on");
          box.classList.remove("is-loading");
        }, { once: true });
        on = true;
        box.classList.add("is-on");
        cx = cx || tx; cy = cy || ty;
        start();
      });
      row.addEventListener("mouseleave", () => {
        on = false;
        box.classList.remove("is-on", "is-loading");
      });
    });

    document.addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (on) start();
    }, { passive: true });

    /* Re-pick derivatives when the box changes size (resize / zoom). */
    let rw = boxW();
    window.addEventListener("resize", () => {
      const nw = boxW();
      if (Math.abs(nw - rw) < 40) return;
      rw = nw;
      cache.forEach((im, rel) => { im.src = derivative(rel, nw).src; });
    });
  };

  /* ── Index thumbnails (mobile cards) ────────────────────────
     Below 700px the index rows become square photographic cards.
     The photograph is the one the row already declares for its
     hover state, so the CMS only supplies it once.               */
  const setupIndexThumbs = () => {
    if (!window.matchMedia("(max-width:700px)").matches) return;
    $$(".index-row[data-hover-img]").forEach(row => {
      if ($(".index-thumb", row)) return;
      const rel = row.getAttribute("data-hover-img");
      const im = document.createElement("img");
      im.className = "index-thumb";
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      im.addEventListener("error", () => {
        if (im.src.indexOf("/t/") > -1) im.src = "assets/img/" + rel;
      }, { once: true });
      im.src = derivative(rel, Math.round(window.innerWidth * .8)).src;
      row.prepend(im);
    });
  };

  window.VIK = window.VIK || {};
  window.VIK.derivative = derivative;

  /* ── Accordion ──────────────────────────────────────────── */
  const setupAccordion = () => {
    $$(".acc-head").forEach(head => {
      head.addEventListener("click", () => {
        const item = head.closest(".acc-item");
        const body = $(".acc-body", item);
        const open = item.classList.toggle("open");
        head.setAttribute("aria-expanded", String(open));
        body.style.maxHeight = open ? body.scrollHeight + "px" : 0;
      });
    });
  };

  /* ── Tabs (agenda / calendar) ───────────────────────────── */
  const setupTabs = () => {
    $$("[data-tab]").forEach(tab => {
      tab.addEventListener("click", () => {
        const group = tab.closest("[data-tabs]") || document;
        $$("[data-tab]", group).forEach(t => t.classList.remove("active"));
        $$("[data-panel]", group).forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = $(`[data-panel="${tab.dataset.tab}"]`, group);
        panel && panel.classList.add("active");
      });
    });
  };

  /* ── Sticky sub-nav scroll spy ──────────────────────────── */
  const setupSpy = () => {
    const links = $$(".subnav a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    const map = new Map();
    links.forEach(l => { const s = $(l.getAttribute("href")); if (s) map.set(s, l); });
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.remove("active"));
        map.get(en.target)?.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  };

  /* ── Persistent booking bar ─────────────────────────────── */
  const setupBookBar = () => {
    const bar = $("#bookbar");
    if (!bar) return;
    const onScroll = () => bar.classList.toggle("is-visible", window.scrollY > window.innerHeight * .6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  /* ── Lazy video ─────────────────────────────────────────── */
  const setupLazyVideo = () => {
    const vids = $$("video[data-src]");
    if (!vids.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const v = en.target;
        v.src = v.dataset.src;
        v.load();
        v.play().catch(() => {});
        io.unobserve(v);
      });
    }, { rootMargin: "300px" });
    vids.forEach(v => io.observe(v));
  };

  /* ── Hero carousel ──────────────────────────────────────────
     Image, film, image. Cross-dissolve with a slow scale so the cut
     is never felt. A film slide holds until it has played, stills
     hold for a fixed beat. Pauses when the tab is hidden.        */
  const setupHeroSlides = () => {
    $$(".hp-slides").forEach(wrap => {
      const slides = $$(".hp-slide", wrap);
      if (slides.length < 2) return;
      const dots = $$(".hp-dot", wrap.parentElement.parentElement);
      const STILL = Number(wrap.dataset.hold || 6200);
      let i = 0, timer = null;

      const show = n => {
        slides.forEach((s, k) => {
          const on = k === n;
          s.classList.toggle("is-on", on);
          const v = $("video", s);
          if (!v) return;
          if (on) {
            /* a slide only fetches its film when it is about to run */
            if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
            v.currentTime = 0;
            v.play().catch(() => {});
          } else v.pause();
        });
        dots.forEach((d, k) => d.classList.toggle("is-on", k === n));
      };

      const next = () => {
        i = (i + 1) % slides.length;
        show(i);
        queue();
      };

      const queue = () => {
        clearTimeout(timer);
        if (reduced || document.hidden) return;
        const v = $("video", slides[i]);
        const hold = v && v.duration ? Math.min(v.duration * 1000, 11000) : STILL;
        timer = setTimeout(next, hold);
      };

      dots.forEach((d, k) => d.addEventListener("click", () => { i = k; show(i); queue(); }));
      document.addEventListener("visibilitychange", () => document.hidden ? clearTimeout(timer) : queue());

      show(0);
      queue();
    });
  };

  /* ── Boot ───────────────────────────────────────────────── */
  const boot = () => {
    syncVW();
    setupLoader();
    setupCursor();
    setupScroll();
    setupMenu();
    setupReveal();
    setupParallax();
    setupRails();
    setupHoverMedia();
    setupDragScroll();
    setupIndexThumbs();
    window.addEventListener("resize", setupIndexThumbs);
    setupAccordion();
    setupTabs();
    setupSpy();
    setupBookBar();
    setupLazyVideo();
    setupHeroSlides();
  };

  window.VIK.scrollTo = scrollTo;
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
