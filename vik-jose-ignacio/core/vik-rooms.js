/* ══════════════════════════════════════════════════════════════
   VIK · ROOM REEL  (M26d)

   Every room in the destination, full height, one at a time, with a
   bar across the top to narrow it down — Master Suites, Suites,
   Casas, Bungalows. Forty rooms is too many to scroll past hoping to
   recognise one; the bar is what turns a gallery into a chooser.

   The slides are .wall-tile elements carrying exactly the attributes
   the room view already reads, so clicking one opens the same M26b
   overlay the wall and the stage open. There is one room view in the
   system and this is a third way into it, not a second copy of it.

   Markup:
     <div class="roomreel" data-rooms>
       <div class="roomreel-bar"></div>          ← built here
       <div class="roomreel-track">
         <a class="wall-tile" data-cat="bungalow"
            data-img="rooms/bahia/bungalow-adobe-01.jpg"
            data-name="Bungalow Adobe" data-meta="Bahía VIK · Bungalow"
            data-gallery="rooms/…-02.jpg | rooms/…-03.jpg"
            data-copy="…"></a>
       </div>
     </div>

   Photographs come from assets/img/rooms/<house>/<room>-01..03.jpg.
   Those names are fixed — see tools_rooms.py and ROOMS.md. Replacing
   a photograph is dropping a file over one of them; nothing here
   needs to change.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

  window.VIK = window.VIK || {};

  /* The bar's order and wording. A category with no rooms in a given
     reel is simply not drawn, so one file serves every page. */
  const CATS = [
    ["all",      "All rooms"],
    ["master",   "Master Suites"],
    ["suite",    "Suites"],
    ["room",     "Rooms"],
    ["casa",     "Casas"],
    ["bungalow", "Bungalows"]
  ];

  const build = reel => {
    const track = $(".roomreel-track", reel);
    const bar   = $(".roomreel-bar", reel);
    if (!track || !bar) return;

    const slides = $$(".wall-tile", track);
    if (!slides.length) return;

    /* -- The bar ---------------------------------------------
       Counts are read off the slides, so adding a room to the markup
       updates the bar by itself. */
    const present = CATS.filter(([key]) =>
      key === "all" || slides.some(s => s.dataset.cat === key));

    bar.innerHTML = present.map(([key, label], i) => {
      const n = key === "all" ? slides.length
                              : slides.filter(s => s.dataset.cat === key).length;
      return `<button type="button" class="rr-cat${i === 0 ? " is-on" : ""}" data-cat="${key}">
                <span class="l">${label}</span><span class="n">${n}</span>
              </button>`;
    }).join("");

    const counter = document.createElement("span");
    counter.className = "rr-count";
    bar.appendChild(counter);

    slides.forEach(s => {
      const img = s.querySelector("img");
      if (img) { img.decoding = "async"; img.draggable = false; }
    });

    /* -- The rail --------------------------------------------
       A transformed track, not a scroller: scrollLeft only accepts
       whole pixels, so a sub-pixel step sits on one integer for four
       frames and then jumps.

       The frame itself does no measuring. Widths, gaps and the loop
       length are taken once and again only when something can have
       changed them - a filter, a resize, a photograph arriving.
       Reading offsetWidth inside the loop makes the browser lay the
       strip out forty times a frame, which is the other half of the
       stutter and the more expensive half. */
    let showing = slides.slice();
    let x = 0, paused = 0, down = false, startX = 0, startPos = 0, moved = false;
    let gapPx = 0, halfW = 0, frameW = 0, offsets = [], widths = [];
    let vel = 0, lastMoveT = 0, lastMoveX = 0;
    let raf = 0, live = true, lastCount = 0;

    /* the drift is continuous, so nothing waits: paused is kept only
       as a readout of when the rail was last touched */
    const RESUME = 2400;

    const measure = () => {
      const cs = getComputedStyle(track);
      gapPx = parseFloat(cs.columnGap === "normal" ? cs.gap : cs.columnGap) || 0;
      /* the frame, not the strip: the track is as wide as all eighty
         rooms laid end to end, so its own width says nothing about
         what you can see */
      frameW = reel.clientWidth;
      let w = 0;
      offsets = []; widths = [];
      showing.forEach(n => {
        const ow = n.offsetWidth;
        offsets.push(w); widths.push(ow);
        w += ow + gapPx;
      });
      halfW = w;
    };

    const draw = () => { track.style.transform = `translate3d(${x}px,0,0)`; };
    const hold = () => { paused = Date.now() + RESUME; };

    const wrap = () => {
      if (!halfW) return;
      while (-x >= halfW) x += halfW;
      while (x > 0) x -= halfW;
    };

    /* the visible set is cloned once so the loop never ends */
    const relayout = () => {
      $$("[data-clone]", track).forEach(c => c.remove());
      const frag = document.createDocumentFragment();
      showing.forEach(s => {
        const c = s.cloneNode(true);
        c.setAttribute("data-clone", "");
        c.setAttribute("aria-hidden", "true");
        c.setAttribute("tabindex", "-1");
        frag.appendChild(c);
      });
      track.appendChild(frag);
      measure();
    };

    /* which room is under the middle of the frame, from the cached
       offsets, so keeping the counter current costs nothing */
    const current = () => {
      const mid = -x + frameW / 2;
      let at = 0, best = Infinity;
      for (let k = 0; k < offsets.length; k++) {
        const d = Math.abs(offsets[k] + widths[k] / 2 - mid);
        if (d < best) { best = d; at = k; }
      }
      return at;
    };

    const setCount = () => {
      counter.textContent = showing.length
        ? String(current() + 1).padStart(2, "0") + " / " +
          String(showing.length).padStart(2, "0") : "";
    };

    /* -- Filtering -------------------------------------------
       The rail fades out, swaps, and fades back. A hard cut on a
       moving strip reads as a glitch. */
    let fresh = 0;
    const filter = key => {
      reel.classList.add("is-swapping");
      setTimeout(() => {
        showing = key === "all" ? slides.slice()
                                : slides.filter(s => s.dataset.cat === key);
        slides.forEach(s => { s.style.display = showing.includes(s) ? "" : "none"; });
        $$(".rr-cat", bar).forEach(b => b.classList.toggle("is-on", b.dataset.cat === key));
        relayout();
        x = 0; v = 0; vel = 0;
        draw(); setCount();
        reel.classList.remove("is-swapping");
        /* the visible rooms rise back in, then the class comes off so
           the animation cannot re-fire on the drift */
        reel.classList.add("is-fresh");
        clearTimeout(fresh);
        fresh = setTimeout(() => reel.classList.remove("is-fresh"), 1400);
      }, 260);
    };

    bar.addEventListener("click", e => {
      const b = e.target.closest(".rr-cat");
      if (b) { hold(); filter(b.dataset.cat); }
    });

    /* -- The motion ------------------------------------------
       One number describes everything the strip is doing: v, its
       speed in pixels per second. The drift is a floor under it, a
       wheel notch or a swipe adds to it, and it falls back to the
       floor on its own. The frame integrates v and writes the
       transform once - there is no other writer, so nothing can
       arrive between two frames and put the strip somewhere the eye
       was not expecting it. */
    const SPEED = 66;      /* the drift, px per second */
    const EASE  = 3.4;     /* how fast a push decays, per second */
    let v = 0;             /* the push, on top of the drift */
    let last = 0;

    const step = t => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.0167);
      last = t;

      if (!live || document.hidden) { v = 0; return; }
      if (down) return;                     /* the drag writes its own */

      /* the push decays exponentially, framerate-independent */
      if (v) {
        v *= Math.exp(-EASE * dt);
        if (Math.abs(v) < 1) v = 0;
      }

      /* the drift is always underneath: a push decays into it rather
         than stopping dead and having it switch back on, which is a
         step from nothing to 66 px/s and reads as a nudge */
      const speed = (showing.length > 1 ? SPEED : 0) + v;
      if (!speed) return;

      x -= speed * dt;
      wrap(); draw();
      if (t - lastCount > 240) { setCount(); lastCount = t; }
    };

    /* -- The gesture -----------------------------------------
       A swipe hands its speed over rather than stopping dead. */
    track.addEventListener("pointerdown", e => {
      /* primary button, primary pointer, and a button actually down:
         anything else latches the rail into a drag it never leaves */
      if (!e.isPrimary || e.button !== 0) return;
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      down = true; moved = false; v = 0;
      startX = e.clientX; startPos = e.clientX;
      lastMoveX = e.clientX; lastMoveT = e.timeStamp;
      if (track.setPointerCapture) { try { track.setPointerCapture(e.pointerId); } catch (_) {} }
      track.classList.add("is-dragging");
    });
    track.addEventListener("pointermove", e => {
      if (!down) return;
      /* a pointerup that never arrived - a release outside the window,
         a context menu - would otherwise latch the rail for good */
      if (!e.buttons) { release(); return; }

      /* the distance since the last move, never since the gesture
         began: wrap() moves x by a whole strip length at the seam, and
         a position measured from the start would throw that away and
         snap the rail back */
      const stepX = e.clientX - lastMoveX;
      startPos += stepX;                      /* total, for the click guard */
      if (Math.abs(startPos - startX) > 3) moved = true;

      const dtm = e.timeStamp - lastMoveT;
      if (dtm > 0) {
        const px = stepX / dtm * 1000;        /* px per second */
        vel = vel * 0.7 + px * 0.3;
      }
      lastMoveX = e.clientX; lastMoveT = e.timeStamp;

      x += stepX; wrap(); draw();
    });
    function release() {
      if (!down) return;
      down = false; hold();
      /* the frame subtracts speed from x, so a swipe to the right -
         a positive velocity - has to arrive as a negative one, or the
         rail comes back the way it was pushed */
      v = Math.max(-2600, Math.min(2600, -vel));
      if (Math.abs(v) < 40) v = 0;
      vel = 0;
      track.classList.remove("is-dragging");
      setCount();
    }
    track.addEventListener("pointerup", release);
    track.addEventListener("pointercancel", release);
    window.addEventListener("pointerup", release);
    window.addEventListener("blur", release);

    /* -- The wheel -------------------------------------------
       The reel is a full-height block, so while you scroll past it
       the pointer is over it nearly the whole time. Taking the
       vertical wheel there means the page stops and the rail lurches
       sideways instead - which is not a carousel, it is a trap. The
       wheel belongs to the page and is left alone.

       A sideways gesture is unambiguous: a trackpad two-finger swipe
       across, or a tilt wheel. That one moves the rail, and it adds
       to its speed rather than to its position, so a notch reads as a
       push that runs out rather than a jump. */
    track.addEventListener("wheel", e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   /* the page's */
      const d = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
      e.preventDefault(); hold();
      v += d * 7;                             /* right is forward */
      v = Math.max(-2600, Math.min(2600, v));
    }, { passive: false });

    /* -- Opening a room --------------------------------------
       A tap opens the same room view the wall opens: one room view in
       the system, three ways into it. A drag is not a tap, so the
       gesture has to have moved less than three pixels.

       data-rooms-inert turns that off. The library uses it: a
       specimen is looked at, not operated. The href stays real either
       way, so the markup still means something without script. */
    const inert = reel.hasAttribute("data-rooms-inert");
    track.addEventListener("click", e => {
      const tile = e.target.closest(".wall-tile");
      if (!tile) return;
      e.preventDefault();
      if (inert || moved) { moved = false; return; }
      if (window.VIK.wall && window.VIK.wall.expand) window.VIK.wall.expand(tile);
    });

    reel.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault(); hold();
      v += (e.key === "ArrowRight" ? 1 : -1) * 1800;
    });

    /* widths change with the viewport, and again when a photograph
       finally lands */
    let rz = 0;
    const remeasure = () => {
      clearTimeout(rz);
      rz = setTimeout(() => { measure(); wrap(); draw(); setCount(); }, 140);
    };
    window.addEventListener("resize", remeasure);
    window.addEventListener("orientationchange", remeasure);
    window.addEventListener("load", remeasure);

    /* nothing runs while the reel is off screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { live = es[0].isIntersecting; },
        { rootMargin: "200px" }).observe(reel);
    }

    relayout(); draw(); setCount();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      raf = requestAnimationFrame(step);

    window.VIK.rooms = { filter, count: () => showing.length, touched: hold,
      state: () => ({ x, v, down, live, halfW, frameW,
                      paused: Math.max(0, paused - Date.now()),
                      showing: showing.length }) };
  };

  const boot = () => $$("[data-rooms]").forEach(build);

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
