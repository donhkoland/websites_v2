/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · INFINITE WALL  (M26)

   Built to the Codrops InfiniteScrollGSAPGallery model: one vertical
   cascade that loops for ever, where every slide has its own width
   and its own horizontal stagger, so the eye follows a diagonal
   instead of a grid. Wheel and drag push it, inertia carries it,
   and it settles back to a slow constant drift.

   Two details from the reference that make it read as one piece:
   the image inside each frame is oversized and counter-moves as the
   slide crosses the viewport (parallax), and the whole cascade
   skews slightly with velocity.

   Clicking a slide expands that photograph into the hero position
   of the room view — the same transition the real room page uses on
   arrival, so the image the guest chose is the image that greets
   them.

   Markup: a flat list, the rhythm is generated.
     <div class="wall" data-wall>
       <a class="wall-tile" data-img="estancia/Photo.jpg"
          data-name="…" data-meta="…" data-copy="…" href="…"></a>
     </div>

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.VIK = window.VIK || {};

  const src = (rel, px) =>
    (window.VIK.derivative ? window.VIK.derivative(rel, px).src : "assets/img/" + rel);
  const full = rel =>
    (rel.startsWith("assets/") || rel.startsWith("http")) ? rel : "assets/img/" + rel;

  /* The reference hand-tunes every slide. Doing that by hand for a
     CMS-driven room list is not an option, so the rhythm is a fixed
     repeating pattern — irregular enough to read as composed, short
     enough to stay coherent as the list grows. */
  const RHYTHM = [
    { w: 620, x: -18, r: "3/2"   }, { w: 470, x:  13, r: "4/3"  },
    { w: 830, x: -13, r: "16/9"  }, { w: 540, x:  19, r: "5/4"  },
    { w: 700, x: -21, r: "3/2"   }, { w: 440, x:  24, r: "1/1"  },
    { w: 780, x: -15, r: "16/10" }, { w: 560, x:   6, r: "4/3"  },
    { w: 660, x: -10, r: "3/2"   }, { w: 480, x:  16, r: "5/4"  },
    { w: 860, x: -19, r: "21/9"  }, { w: 500, x:  22, r: "1/1"  },
    { w: 720, x: -14, r: "16/9"  }, { w: 580, x:  20, r: "4/3"  },
    { w: 640, x: -23, r: "3/2"   }, { w: 460, x:  15, r: "5/4"  },
    { w: 800, x:  -8, r: "16/10" }
  ];

  /* Phones cannot carry a ±28vw stagger — the cascade would leave
     the screen. Narrow the swing and cap the widths instead. */
  const scaleFor = () => {
    const w = window.innerWidth;
    if (w < 600)  return { x: .30, w: .40 };
    if (w < 900)  return { x: .50, w: .56 };
    if (w < 1300) return { x: .78, w: .74 };
    if (w < 1700) return { x: .92, w: .92 };
    return { x: 1, w: 1 };
  };

  /* ── Build · grid mode ────────────────────────────────────
     The earlier treatment, kept as an option while the cascade is
     being tuned: even columns looping at different speeds. Choose
     with data-wall-mode="grid" on the container.                  */
  const buildGrid = wall => {
    const tiles = wall.__tiles || (wall.__tiles = $$(".wall-tile", wall).map(t => t.cloneNode(true)));
    const w = window.innerWidth;
    const cols = w < 600 ? 2 : w < 1024 ? 3 : w < 1400 ? 4 : 5;

    const track = document.createElement("div");
    track.className = "wall-grid";
    track.style.gridTemplateColumns = `repeat(${cols},1fr)`;

    const buckets = Array.from({ length: cols }, () => []);
    tiles.forEach((t, i) => buckets[i % cols].push(t));

    const inners = buckets.map(items => {
      const col = document.createElement("div");
      col.className = "wall-gcol";
      const inner = document.createElement("div");
      inner.className = "wall-gcol-inner";
      const dressed = items.map(n => dressGrid(n.cloneNode(true)));
      dressed.forEach(n => inner.appendChild(n));
      dressed.forEach(n => inner.appendChild(n.cloneNode(true)));
      col.appendChild(inner);
      track.appendChild(col);
      return inner;
    });

    const hint = $(".wall-hint", wall);
    wall.innerHTML = "";
    wall.appendChild(track);
    if (hint) wall.appendChild(hint);
    loadShots(wall);
    return { track, inners };
  };

  const dressGrid = tile => {
    const name = tile.dataset.name || "";
    const meta = tile.dataset.meta || "";
    tile.style.removeProperty("--w");
    tile.style.removeProperty("--x");
    tile.innerHTML =
      `<span class="wall-shot"><img alt="${name}"></span>` +
      `<span class="wall-cap over"><span class="n">${name}</span><span class="m">${meta}</span></span>`;
    return tile;
  };

  const loadShots = wall => requestAnimationFrame(() => {
    $$(".wall-tile", wall).forEach(t => {
      const rel = t.dataset.img;
      const im = $("img", t);
      if (!rel || !im || im.getAttribute("src")) return;
      const px = Math.round(t.getBoundingClientRect().width) || 320;
      im.decoding = "async";
      im.addEventListener("error", () => {
        if (im.src.indexOf("/t/") > -1) im.src = full(rel);
      }, { once: true });
      im.src = src(rel, px);
    });
  });

  const animateGrid = (wall, inners) => {
    wall.__gen = (wall.__gen || 0) + 1;
    const gen = wall.__gen;
    const st = wall.__input;
    const state = inners.map((el, i) => ({
      el, y: 0, half: 0, speed: 0.34 * (0.8 + (i % 3) * 0.22) * (i % 2 ? -1 : 1)
    }));
    const measure = () => state.forEach(s => {
      s.half = s.el.scrollHeight / 2;
      if (s.half) s.y = ((s.y % s.half) + s.half) % s.half;
    });
    measure();
    inners.forEach(c => $$("img", c).forEach(im => im.addEventListener("load", measure, { once: true })));
    if (window.ResizeObserver) new ResizeObserver(measure).observe(inners[0]);
    if (reduced) return;

    let last = performance.now(), vel = 0;
    const tick = now => {
      if (wall.__gen !== gen) return;
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      vel += (st.push - vel) * 0.11;
      if (!st.down) st.push *= 0.905;
      if (Math.abs(st.push) < 0.05) st.push = 0;
      state.forEach(s => {
        if (!s.half) return;
        const dir = s.speed > 0 ? 1 : -1;
        s.y += s.speed * dt + vel * 0.07 * dt * dir;
        s.y = ((s.y % s.half) + s.half) % s.half;
        s.el.style.transform = `translate3d(0, ${-s.y.toFixed(2)}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ── Build · reel mode (phones) ───────────────────────────
     A vertical cascade on a phone is a column of postage stamps.
     Below 700px the same rooms become one continuous horizontal
     reel: infinite, drag-and-flick, with a position bar. Nothing
     about the markup changes — only the arrangement.             */
  const isPhone = () => window.matchMedia("(max-width:700px)").matches;

  const buildReel = wall => {
    const tiles = wall.__tiles || (wall.__tiles = $$(".wall-tile", wall).map(t => t.cloneNode(true)));
    const reel = document.createElement("div");
    reel.className = "wall-reel";
    const set = tiles.map(t => dressGrid(t.cloneNode(true)));
    set.forEach(n => reel.appendChild(n));
    set.forEach(n => reel.appendChild(n.cloneNode(true)));   /* the loop */

    const bar = document.createElement("div");
    bar.className = "wall-reel-bar";
    bar.innerHTML = '<span class="lab">Swipe</span><span class="track"><i></i></span>' +
                    '<span class="lab">' + tiles.length + ' rooms</span>';

    wall.innerHTML = "";
    wall.classList.add("is-reel");
    wall.appendChild(reel);
    wall.appendChild(bar);
    loadShots(wall);
    return reel;
  };

  const animateReel = (wall, reel) => {
    wall.__gen = (wall.__gen || 0) + 1;
    const gen = wall.__gen;
    const st = wall.__input;
    const fill = $(".wall-reel-bar i", wall);

    let half = 0, x = 0;
    const measure = () => {
      half = reel.scrollWidth / 2;
      if (half) x = ((x % half) + half) % half;
    };
    measure();
    $$("img", reel).forEach(im => im.addEventListener("load", measure, { once: true }));
    if (window.ResizeObserver) new ResizeObserver(measure).observe(reel);

    if (reduced) { reel.style.transform = "none"; return; }

    let last = performance.now(), vel = 0;
    const tick = now => {
      if (wall.__gen !== gen) return;
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      vel += (st.push - vel) * 0.12;
      if (!st.down) st.push *= 0.90;
      if (Math.abs(st.push) < 0.05) st.push = 0;
      if (half) {
        x += 0.55 * dt + vel * 0.1 * dt;
        x = ((x % half) + half) % half;
        reel.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
        if (fill) fill.style.transform = `translateX(${(x / half * 355).toFixed(1)}%)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ── Build · stage mode ───────────────────────────────────
     Rooms in landscape, one at a time: a horizontal run of large
     frames with the next just showing. Drag and flick, no loop —
     a finite list of rooms should have a beginning and an end.
     Choose with data-wall-mode="stage".                          */
  const buildStage = wall => {
    const tiles = wall.__tiles || (wall.__tiles = $$(".wall-tile", wall).map(t => t.cloneNode(true)));
    /* Four proportions in rotation — 1:1, 4:5, 16:9, 9:12 — sized so
       the run rises and falls rather than stepping evenly. */
    const STAGE = [
      { w: 330, r: "1/1"  }, { w: 380, r: "4/5"  },
      { w: 600, r: "16/9" }, { w: 410, r: "9/12" }
    ];
    const k = window.innerWidth < 900 ? .58 : window.innerWidth < 1400 ? .8 : 1;

    /* Three photographs per room: the room itself and the first two of
       its companion frames. They cross-fade in place. */
    const dressStage = (tile, i) => {
      const r = STAGE[i % STAGE.length];
      tile.style.setProperty("--sw", Math.round(r.w * k) + "px");
      tile.style.setProperty("--sr", r.r);
      const px = Math.round(r.w * k) || 340;
      const name = tile.dataset.name || "";
      /* One photograph, loaded eagerly. The other two belong to the
         room view — a wall that keeps swapping its own images is
         impossible to read while it is also moving. */
      tile.innerHTML =
        `<span class="wall-shot"><img alt="${name}" decoding="async" ` +
        `src="${src(tile.dataset.img, px)}"></span>` +
        `<span class="wall-cap"><span class="n">${name}</span>` +
        `<span class="m">${tile.dataset.meta || ""}</span></span>`;
      return tile;
    };

    const track = document.createElement("div");
    track.className = "wall-stage";
    const set = tiles.map((t, i) => dressStage(t.cloneNode(true), i));
    set.forEach(n => track.appendChild(n));
    /* duplicated once so the drag can run for ever */
    set.forEach((n, i) => track.appendChild(dressStage(n.cloneNode(true), i)));

    const bar = document.createElement("div");
    bar.className = "wall-stage-bar";
    bar.innerHTML = '<span class="lab">Drag</span><span class="track"><i></i></span>' +
                    '<span class="lab">' + tiles.length + ' rooms</span>';

    wall.innerHTML = "";
    wall.classList.add("is-stage");
    wall.appendChild(track);
    wall.appendChild(bar);
    loadShots(wall);
    return track;
  };

  const animateStage = (wall, track) => {
    wall.__gen = (wall.__gen || 0) + 1;
    const gen = wall.__gen;
    const st = wall.__input;
    const fill = $(".wall-stage-bar i", wall);
    const cards = $$(".wall-tile", track);

    /* Each card fades in when its own first frame has decoded, on a
       stagger — so the run assembles rather than snapping in. */
    cards.forEach((c, i) => {
      c.style.setProperty("--in", (i % 12) * 80 + "ms");
      const first = $("img", c);
      const show = () => requestAnimationFrame(() => c.classList.add("is-in"));
      if (!first || first.complete) show();
      else {
        first.addEventListener("load", show, { once: true });
        first.addEventListener("error", show, { once: true });
      }
    });

    let half = 0, x = 0;
    const measure = () => {
      half = track.scrollWidth / 2;
      if (half) x = ((x % half) + half) % half;
    };
    measure();
    $$("img", track).forEach(im => im.addEventListener("load", measure, { once: true }));
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);

    if (reduced) { track.style.transform = "none"; return; }

    let last = performance.now(), vel = 0, lean = 0;
    const tick = now => {
      if (wall.__gen !== gen) return;
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      vel += (st.push - vel) * 0.13;
      if (!st.down) st.push *= 0.9;
      if (Math.abs(st.push) < 0.05) st.push = 0;

      if (half) {
        const prev = x;
        x += 0.18 * dt + vel * 0.085 * dt;      /* a slow drift underneath */
        x = ((x % half) + half) % half;

        /* The lean rides on the track, not on every card. Writing 56
           transforms a frame is what made the run drag and shiver;
           one composited write does the same thing for free. */
        let v = x - prev;
        if (Math.abs(v) > half / 2) v = 0;      /* ignore the wrap jump */
        lean += (Math.max(-1.6, Math.min(1.6, v * -0.11)) - lean) * 0.07;
        track.style.transform =
          `translate3d(${-x.toFixed(2)}px,0,0) rotateY(${lean.toFixed(2)}deg)`;
        if (fill) fill.style.transform = `translateX(${(x / half * 400).toFixed(1)}%)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ── Build · cascade mode (default) ──────────────────────── */
  const build = wall => {
    const tiles = wall.__tiles || (wall.__tiles = $$(".wall-tile", wall).map(t => t.cloneNode(true)));
    const k = scaleFor();

    const dress = (tile, i) => {
      const r = RHYTHM[i % RHYTHM.length];
      tile.style.setProperty("--w", Math.round(r.w * k.w) + "px");
      tile.style.setProperty("--x", (r.x * k.x).toFixed(2) + "vw");
      tile.style.setProperty("--r", r.r);
      /* rebuild the inner markup so authors only write the anchor */
      if (!$(".wall-shot", tile)) {
        const name = tile.dataset.name || "";
        const meta = tile.dataset.meta || "";
        tile.innerHTML =
          `<span class="wall-shot"><img alt="${name}"></span>` +
          `<span class="wall-cap"><span class="n">${name}</span><span class="m">${meta}</span></span>`;
      }
      return tile;
    };

    const track = document.createElement("div");
    track.className = "wall-track";
    const set = tiles.map((t, i) => dress(t.cloneNode(true), i));
    set.forEach(n => track.appendChild(n));
    set.forEach(n => track.appendChild(n.cloneNode(true)));  /* clone, not move */

    const hint = $(".wall-hint", wall);
    wall.innerHTML = "";
    wall.appendChild(track);
    if (hint) wall.appendChild(hint);
    wall.__meter = buildMeter(wall, tiles);
    wall.__unique = tiles.length;

    requestAnimationFrame(() => {
      $$(".wall-tile", wall).forEach(t => {
        const rel = t.dataset.img;
        const im = $("img", t);
        if (!rel || !im) return;
        const px = Math.round(t.getBoundingClientRect().width) || 320;
        im.decoding = "async";
        /* No lazy loading here: the track is transformed and absolutely
           positioned, so the browser's viewport test never fires for the
           tiles below. The derivatives are ~40KB each — cheaper than a
           wall of empty frames. */
        im.addEventListener("error", () => {
          if (im.src.indexOf("/t/") > -1) im.src = full(rel);
        }, { once: true });
        im.src = src(rel, px);
      });
    });

    return track;
  };

  /* ── Collection meter ─────────────────────────────────────
     Quiet by design: which slide is centred, out of how many, and
     which category it belongs to. Categories and totals are read
     from the tiles themselves — the last word of data-meta, so the
     CMS never has to declare them twice.                          */
  const groupOf = tile => {
    const m = (tile.dataset.group || tile.dataset.meta || "").trim();
    if (tile.dataset.group) return tile.dataset.group;
    const last = m.split("·").pop().trim().split(/\s+/).pop();
    if (!last) return "Rooms";
    const w = last.toLowerCase().replace(/s$/, "");
    return w.charAt(0).toUpperCase() + w.slice(1) + "s";
  };

  const buildMeter = (wall, tiles) => {
    const counts = new Map();
    tiles.forEach(t => {
      const g = groupOf(t);
      counts.set(g, (counts.get(g) || 0) + 1);
    });
    const meter = document.createElement("div");
    meter.className = "wall-meter";
    meter.innerHTML =
      `<span class="pos"><em class="cur">01</em><b> / ${String(tiles.length).padStart(2, "0")}</b></span>` +
      `<span class="groups">` +
      [...counts].map(([g, n]) =>
        `<span class="g" data-g="${g}">${g} ${String(n).padStart(2, "0")}</span>`).join("") +
      `</span>`;
    wall.appendChild(meter);
    requestAnimationFrame(() => meter.classList.add("is-on"));
    return meter;
  };

  /* Which slide is nearest the middle of the frame right now. */
  const trackMeter = (wall, meter, tiles, unique) => {
    if (!meter) return () => {};
    const cur = $(".cur", meter);
    const groups = $$(".g", meter);
    let lastIdx = -1;
    return () => {
      const r = wall.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      let best = -1, bestD = Infinity;
      for (let i = 0; i < tiles.length; i++) {
        const b = tiles[i].getBoundingClientRect();
        if (b.bottom < r.top || b.top > r.bottom) continue;
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best < 0 || best === lastIdx) return;
      lastIdx = best;
      const n = (best % unique) + 1;
      cur.textContent = String(n).padStart(2, "0");
      const g = groupOf(tiles[best]);
      groups.forEach(el => el.classList.toggle("is-on", el.dataset.g === g));
    };
  };

  /* ── Input ───────────────────────────────────────────────── */
  const bindInput = wall => {
    if (wall.__input) return;
    wall.__input = { push: 0, down: false };
    const st = wall.__input;
    let startY = 0, startPush = 0, moved = false;

    /* The wheel is borrowed, not captured — the page keeps scrolling. */
    /* the cascade is driven on Y, the reel on X — one accumulator,
       read from whichever axis the current mode uses */
    const horizontal = () => wall.classList.contains("is-reel") || wall.classList.contains("is-stage");
    const axis = e => horizontal() ? e.pageX : e.pageY;
    const touchAxis = t => horizontal() ? t.pageX : t.pageY;

    wall.addEventListener("wheel", e => {
      st.push += (horizontal() ? (e.deltaX || e.deltaY) : e.deltaY) * 0.6;
      wall.classList.add("is-active");
    }, { passive: true });

    const start = y => { st.down = true; moved = false; startY = y; startPush = st.push; wall.classList.add("is-dragging", "is-active"); };
    const move  = y => { if (!st.down) return; if (Math.abs(startY - y) > 3) moved = true; st.push = startPush + (startY - y) * 1.6; };
    const end   = () => { st.down = false; wall.classList.remove("is-dragging"); };

    wall.addEventListener("mousedown", e => { e.preventDefault(); start(axis(e)); });
    window.addEventListener("mousemove", e => move(axis(e)));
    window.addEventListener("mouseup", end);
    wall.addEventListener("touchstart", e => start(touchAxis(e.touches[0])), { passive: true });
    wall.addEventListener("touchmove",  e => move(touchAxis(e.touches[0])),  { passive: true });
    wall.addEventListener("touchend", end);
    wall.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  };

  /* ── Motion ──────────────────────────────────────────────── */
  const animate = (wall, track) => {
    wall.__gen = (wall.__gen || 0) + 1;
    const gen = wall.__gen;
    const st = wall.__input;
    const tiles = $$(".wall-tile", track);
    const shots = tiles.map(t => $("img", t));
    const readMeter = trackMeter(wall, wall.__meter, tiles, wall.__unique || tiles.length);

    let half = 0, y = 0;
    const measure = () => {
      const h = track.scrollHeight;
      half = h / 2;
      if (half) y = ((y % half) + half) % half;
    };
    measure();
    $$("img", track).forEach(im => im.addEventListener("load", measure, { once: true }));
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);

    if (reduced) { track.style.transform = "none"; return; }

    const drift = 0.32;
    let last = performance.now(), vel = 0, skew = 0;

    const tick = now => {
      if (wall.__gen !== gen) return;
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;

      vel += (st.push - vel) * 0.11;
      if (!st.down) st.push *= 0.905;
      if (Math.abs(st.push) < 0.05) st.push = 0;

      if (half) {
        y += drift * dt + vel * 0.075 * dt;
        y = ((y % half) + half) % half;
        /* A flag, not a shear: barely a degree of skew, eased in
           slowly, so the cascade ripples instead of leaning. */
        const target = Math.max(-1.1, Math.min(1.1, vel * -0.012));
        skew += (target - skew) * 0.045;
        track.style.transform =
          `translate3d(0, ${-y.toFixed(2)}px, 0) skewY(${skew.toFixed(3)}deg)`;
      }

      /* Parallax: the oversized image counter-moves as its slide
         crosses the viewport, exactly as in the reference. */
      const vh = wall.clientHeight || window.innerHeight;
      const wallTop = wall.getBoundingClientRect().top;
      for (let i = 0; i < tiles.length; i++) {
        const im = shots[i];
        if (!im) continue;
        const r = tiles[i].getBoundingClientRect();
        const mid = r.top - wallTop + r.height / 2;
        if (mid < -r.height || mid > vh + r.height) continue;  /* offscreen */
        const p = (mid / vh - .5) * 2;                          /* -1 … 1 */
        im.style.transform = `translate3d(0, ${(p * -6).toFixed(2)}%, 0)`;
      }

      readMeter();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ── The expanded room ────────────────────────────────────
     The panel is its own scroll container with its own smooth
     scroller, and the page scroller is stopped while it is open.
     Native scrolling inside a fixed overlay fought with Lenis and
     looked exactly as rough as it sounds.

     Also handled here: the FLIP measurement, the staged reveal of
     the content once the photograph lands, stepping between rooms
     without leaving the view, ESC, and focus return.               */
  const view = () => $("#roomView");
  let roomLenis = null, roomList = [], roomIndex = -1, lastFocus = null;

  const scroller = v => {
    /* wrap the panel contents once so there is something to scroll */
    let sc = $(".room-scroll", v);
    if (!sc) {
      sc = document.createElement("div");
      sc.className = "room-scroll";
      /* the chrome stays put; only the content scrolls */
      [...v.children]
        .filter(n => !n.matches("[data-room-close], .room-nav, .room-progress"))
        .forEach(n => sc.appendChild(n));
      v.appendChild(sc);
      const bar = document.createElement("div");
      bar.className = "room-progress";
      v.appendChild(bar);
    }
    return sc;
  };

  const mountScroller = v => {
    const sc = scroller(v);
    const bar = $(".room-progress", v);
    sc.scrollTop = 0;
    if (reduced || !window.Lenis) {
      sc.addEventListener("scroll", () => {
        if (bar) bar.style.transform = `scaleX(${sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight)})`;
      }, { passive: true });
      return null;
    }
    const l = new Lenis({
      wrapper: sc, content: sc.firstElementChild,
      duration: 1.05, smoothWheel: true, wheelMultiplier: .95, touchMultiplier: 1.5,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    l.on("scroll", ({ scroll, limit }) => {
      if (bar) bar.style.transform = `scaleX(${limit ? scroll / limit : 0})`;
    });
    const raf = t => { if (!l.__dead) { l.raf(t); requestAnimationFrame(raf); } };
    requestAnimationFrame(raf);
    return l;
  };

  const fill = (v, tile) => {
    $("#roomName", v).textContent = tile.dataset.name || "";
    $("#roomMeta", v).textContent = tile.dataset.meta || "";
    $("#roomCopy", v).innerHTML   = tile.dataset.copy || "";

    /* Three photographs in the hero itself, switched from very small
       thumbnails beside the name. One large frame beats four small. */
    const heroBox = $(".room-shots", v) || $(".room-hero", v);
    const list = [tile.dataset.img]
      .concat((tile.dataset.gallery || "").split("|").map(x => x.trim()).filter(Boolean))
      .slice(0, 3);
    const name = tile.dataset.name || "";
    heroBox.innerHTML = list.map((rel, n) =>
      `<img${n ? "" : ' class="is-on"'} alt="${name}" decoding="async" src="${src(rel, Math.round(window.innerWidth))}">`
    ).join("");

    const thumbs = $(".room-thumbs", v);
    if (thumbs) {
      thumbs.hidden = list.length < 2;
      thumbs.innerHTML = list.map((rel, n) =>
        `<button class="room-thumb${n ? "" : " is-on"}" type="button" data-shot="${n}" aria-label="Photograph ${n + 1}">` +
        `<img alt="" src="${src(rel, 240)}"></button>`).join("");
      $$(".room-thumb", thumbs).forEach(b => b.addEventListener("click", () => {
        const n = Number(b.dataset.shot);
        $$("img", heroBox).forEach((im, k) => im.classList.toggle("is-on", k === n));
        $$(".room-thumb", thumbs).forEach((t, k) => t.classList.toggle("is-on", k === n));
      }));
    }

    const counter = $(".rn-count");
    if (counter && roomList.length)
      counter.textContent = String(roomIndex + 1).padStart(2, "0") + " / " +
        String(roomList.length).padStart(2, "0");
  };

  const expand = tile => {
    const v = view();
    if (!v) return;
    lastFocus = document.activeElement;

    /* the unique rooms, in source order — the loop clones are skipped */
    /* The room reel (M26d) is a third way in, alongside the wall and
       the stage. Its slides carry the same attributes, so prev/next
       should step through its list too. */
    const wall = tile.closest("[data-wall], [data-rooms]");
    if (wall) {
      const seen = new Set();
      roomList = $$(".wall-tile", wall).filter(t => {
        const k = t.dataset.img;
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
      roomIndex = roomList.findIndex(t => t.dataset.img === tile.dataset.img);
    }

    fill(v, tile);
    $(".room-hero", v).classList.remove("is-ready");
    v.classList.remove("is-ready");

    const shot = $(".wall-shot", tile) || tile;
    const from = shot.getBoundingClientRect();

    /* FIRST — a clone pinned exactly where the slide is */
    const flip = document.createElement("div");
    flip.className = "wall-flip";
    flip.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
    const im = document.createElement("img");
    im.src = ($("img", tile) || {}).src || src(tile.dataset.img, 900);
    im.alt = "";
    flip.appendChild(im);
    document.body.appendChild(flip);

    /* LAST — where the hero will sit. The page scroller stops first so
       the measurement is taken against a settled layout. */
    window.VIK.lenis && window.VIK.lenis.stop();
    document.body.classList.add("room-open");
    v.classList.add("is-open");
    if (!roomLenis) roomLenis = mountScroller(v);
    else { const sc = $(".room-scroll", v); sc.scrollTop = 0; roomLenis.scrollTo(0, { immediate: true }); }

    const to = $(".room-hero", v).getBoundingClientRect();
    $$("[data-room-close], .room-nav").forEach(el => el.classList.add("is-on"));

    /* PLAY */
    const anim = flip.animate(
      [
        { left: from.left + "px", top: from.top + "px", width: from.width + "px", height: from.height + "px" },
        { left: to.left + "px",   top: to.top + "px",   width: to.width + "px",   height: to.height + "px" }
      ],
      { duration: reduced ? 0 : 780, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
    );
    anim.onfinish = () => {
      $(".room-hero", v).classList.add("is-ready");
      v.classList.add("is-ready");
      setTimeout(() => flip.remove(), 140);
      const close = $("[data-room-close]");
      close && close.focus({ preventScroll: true });
    };
  };

  /* stepping between rooms — cross-fade the hero, no FLIP */
  const step = dir => {
    const v = view();
    if (!v || !roomList.length) return;
    roomIndex = (roomIndex + dir + roomList.length) % roomList.length;
    const tile = roomList[roomIndex];
    const hero = $(".room-hero", v);
    hero.classList.remove("is-ready");
    v.classList.remove("is-ready");
    setTimeout(() => {
      fill(v, tile);
      const im = $("img", hero);
      const show = () => { hero.classList.add("is-ready"); v.classList.add("is-ready"); };
      im && im.complete ? show() : im ? im.addEventListener("load", show, { once: true }) : show();
      roomLenis ? roomLenis.scrollTo(0, { immediate: true }) : ($(".room-scroll", v).scrollTop = 0);
    }, 220);
  };

  const collapse = () => {
    const v = view();
    if (!v) return;
    v.classList.remove("is-open", "is-ready");
    document.body.classList.remove("room-open");
    $$("[data-room-close], .room-nav").forEach(el => el.classList.remove("is-on"));
    window.VIK.lenis && window.VIK.lenis.start();
    if (roomLenis) roomLenis.scrollTo(0, { immediate: true });
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  };

  /* ── Boot ────────────────────────────────────────────────── */
  const boot = () => {
    $$("[data-wall]").forEach(wall => {
      const mode = wall.dataset.wallMode || "";
      const grid = mode === "grid";
      bindInput(wall);

      const mount = () => {
        wall.classList.remove("is-reel", "is-stage");
        if (isPhone())        return animateReel(wall, buildReel(wall));
        if (mode === "stage") return animateStage(wall, buildStage(wall));
        if (grid)             return animateGrid(wall, buildGrid(wall).inners);
        animate(wall, build(wall));
      };
      mount();

      /* rebuild only when the size band actually changes */
      const bandOf = () => isPhone() ? "reel"
        : mode === "stage" ? "stage"
        : grid ? String(window.innerWidth < 1024 ? 3 : window.innerWidth < 1400 ? 4 : 5)
        : JSON.stringify(scaleFor());
      let band = bandOf();
      let t = null;
      window.addEventListener("resize", () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const next = bandOf();
          if (next === band) return;
          band = next;
          mount();
        }, 180);
      });

      wall.addEventListener("click", e => {
        const tile = e.target.closest(".wall-tile");
        if (!tile) return;
        e.preventDefault();
        expand(tile);
      });
    });

    $$("[data-room-close]").forEach(b => b.addEventListener("click", collapse));
    $$("[data-room-prev]").forEach(b => b.addEventListener("click", () => step(-1)));
    $$("[data-room-next]").forEach(b => b.addEventListener("click", () => step(1)));
    document.addEventListener("keydown", e => {
      if (!document.body.classList.contains("room-open")) return;
      if (e.key === "Escape")     collapse();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft")  step(-1);
    });
  };

  window.VIK.wall = { expand, collapse, step };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
