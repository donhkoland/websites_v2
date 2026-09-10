/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · DESIGN SYSTEM V2 · MOTOR

   Archivo unico. Solo depende de lo que hay en esta carpeta:
   Lenis (scroll suave). Si
   alguno de los tres no carga, la pagina sigue funcionando — todo
   lo que hace este archivo esta detras de una comprobacion.

     01 · Cargador
     02 · Cursor (y el suelo que pisa)
     03 · Scroll suave, barra y progreso
     04 · Menu
     05 · Reveals: .r · .lines · .clip
     06 · Parallax
     07 · Railes: deriva + arrastre + inercia
     08 · Comparador: cine bajo el cursor
     09 · Video perezoso
     10 · Miniatura que sigue al raton
     11 · Indice pegajoso
     12 · Datos en vivo (Open-Meteo, sin clave)
     13 · Reserva (Bookassist)
     14 · La fecha, dicha

   Sistema original: Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse  = window.matchMedia("(pointer:coarse)").matches;

  /* ── Cuanto cine se sirve ───────────────────────────────
     Diecinueve clips recorren esta pagina. En un escritorio con
     fibra es la pagina que se diseno; en un telefono con datos son
     ciento y pico de megas que el lector paga y espera.

     Asi que en pantalla tactil corre la portada y nada mas. Los
     demas bloques se quedan en su fotograma — que no es un
     sustituto de emergencia, es el primer cuadro del propio clip:
     la composicion se lee igual. Y si el sistema pide ahorro de
     datos, tampoco corre la portada.

     Una constante, no quince condiciones repartidas: si manana se
     decide que el movil tambien lleva cine, se cambia aqui.        */
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const FILM = saveData ? "ninguno" : coarse ? "solo-portada" : "todo";

  /* Y la que corre, en su talle. Servir un plano de 1912 px a una
     pantalla de 375 es mandar cuatro veces los pixeles que caben.
     Las ocho peliculas de la portada tienen su gemela de 1280 con
     el sufijo -m; el sufijo va antes del sello de version, igual
     que el del poster. */
  /* Solo las peliculas de la portada tienen gemela: son las unicas
     que corren en telefono. Pedir el sufijo para cualquier otra
     devuelve un 404 y la ficha se queda en su fotograma sin que
     nadie sepa por que — que es exactamente lo que pasaba con el
     mosaico.

     Por eso el talle se pide, no se asume: quien sabe que existe la
     variante la pide, y el resto se sirve entero. */
  const talle = (src, hayGemela) => (coarse && hayGemela)
    ? src.replace(/\.mp4(\?[^#]*)?$/, (_, q) => "-m.mp4" + (q || ""))
    : src;
  const state = {};

  /* El ancho real de la ventana, sin la barra de scroll. Los
     modulos a sangre lo usan para no provocar scroll horizontal. */
  const syncVW = () => document.documentElement.style
    .setProperty("--vw", document.documentElement.clientWidth + "px");


  /* ── 01 · Cargador ───────────────────────────────────────── */
  const setupLoader = () => {
    const l = $(".loader");
    if (!l) return;
    const hide = () => setTimeout(() => l.classList.add("is-hidden"), 620);
    document.readyState === "complete" ? hide() : window.addEventListener("load", hide);
  };


  /* ── 02 · Cursor ──────────────────────────────────────────────
     Dos capas, una mas lenta que la otra. Y un detalle que decide
     todo: la pagina alterna papel y tinta, y un anillo de un solo
     color desaparece en una de las dos. En vez de adivinar por
     scroll se mira lo que hay exactamente bajo el puntero, una vez
     por fotograma como maximo.                                    */
  const setupCursor = () => {
    if (coarse) return;
    const dot = $("#cd"), ring = $("#cr");
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, dark = false, queued = false;

    const ground = () => {
      queued = false;
      const el = document.elementFromPoint(mx, my);
      const isDark = !!(el && el.closest("[data-ground='dark']"));
      if (isDark === dark) return;
      dark = isDark;
      document.body.classList.toggle("on-dark", dark);
    };

    window.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!queued) { queued = true; requestAnimationFrame(ground); }
    }, { passive: true });

    const loop = () => {
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const r = $("#cring");
    $$("a,button,.ch,.card,.tile,.sheet,input,select").forEach(el => {
      el.addEventListener("mouseenter", () => r.classList.add("grow"));
      el.addEventListener("mouseleave", () => r.classList.remove("grow"));
    });
  };


  /* ── 03 · Scroll, barra, progreso ─────────────────────────── */
  const setupScroll = () => {
    const nav = $("#nav");
    const hero = $(".hero");
    const bar = $("#progress");
    /* La barra de progreso, con la misma escucha que ya vigila la
       portada. Un scaleX sobre un elemento fijo no repinta nada: lo
       resuelve el compositor. Antes esto costaba GSAP mas
       ScrollTrigger — ciento trece kilobytes bloqueando el dibujado
       para animar una propiedad. */
    const onScroll = () => {
      if (bar) {
        const alto = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (alto > 0 ? window.scrollY / alto : 0) + ")";
      }
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 60);
      /* La reserva entra cuando la portada ya paso: se mide contra
         el alto real del bloque, no contra un numero. */
      const past = hero ? window.scrollY > hero.offsetHeight * .75
                        : window.scrollY > window.innerHeight * .75;
      nav.classList.toggle("past-hero", past);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* El alto real de la barra, publicado: el menu y los anclajes
       lo necesitan y cambia con el ancho. */
    const nh = () => nav && document.documentElement.style
      .setProperty("--nav-h", Math.round(nav.getBoundingClientRect().height) + "px");
    nh(); window.addEventListener("resize", nh, { passive: true });

    if (reduced || !window.Lenis) return;
    state.lenis = new Lenis({
      duration: 1.18,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true, wheelMultiplier: .92, touchMultiplier: 1.4
    });
    const raf = t => { state.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };

  const scrollTo = target => {
    if (target === "#top" || target === "#") {
      state.lenis ? state.lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    const node = $(target);
    if (!node) return false;
    /* El hueco es el alto real de la barra mas un respiro, no un
       setenta escrito a mano: la barra mide 88 en escritorio y 80
       mas abajo, asi que con un numero fijo el titular del modulo
       quedaba medio tapado justo en las medidas donde la barra
       crece. */
    const barra = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--nav-h")) || 88;
    const hueco = barra + 16;
    state.lenis ? state.lenis.scrollTo(node, { offset: -hueco })
                : window.scrollTo({
                    top: node.getBoundingClientRect().top + window.scrollY - hueco,
                    behavior: "smooth" });
    return true;
  };


  /* ── 04 · Menu ────────────────────────────────────────────── */
  const setupMenu = () => {
    const toggle = $("#menuToggle"), menu = $("#menu");
    if (!toggle || !menu) return;
    const close = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked", "menu-open");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("is-locked", open);
      document.body.classList.toggle("menu-open", open);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    /* El anclaje propio: se cancela el salto seco del navegador y se
       reemplaza por un desplazamiento suave.

       Mientras los enlaces esten en pausa, el menu se cierra igual
       pero la pagina no se mueve. Cancelar el clic desde fuera no
       alcanzaba: esto es un manejador propio, y preventDefault no
       impide que corra — solo apaga lo que hubiera hecho el
       navegador por su cuenta. */
    /* El indice si navega. Es el unico enlace de la pagina cuyo
       destino existe — son anclas a modulos de este mismo
       documento — y sin el, la barra y el menu son decoracion.

       El resto sigue en pausa: los enlaces de ficha apuntan a
       paginas que todavia no estan. */
    $$("a[href^='#']").forEach(link => {
      link.addEventListener("click", e => {
        const t = link.getAttribute("href");
        if (!t || t === "#") return;
        e.preventDefault();
        close();
        if (ENLACES_VIVOS || link.closest(".nav-mid, .menu")) scrollTo(t);
      });
    });
  };


  /* ── 05 · Reveals ─────────────────────────────────────────────
     Tres cosas entran solas: los bloques (.r), las imagenes que se
     destapan (.clip) y los titulares partidos en lineas (.lines).

     Un solo vigia para las tres, movido por el scroll.
     El IntersectionObserver es mas elegante, pero cuando no
     dispara — un contexto sin fotogramas, una pestana en segundo
     plano, un visor incrustado — deja el contenido invisible, que
     es el peor final posible para una portada. Esto son veinte
     rectangulos comparados contra el alto de la ventana, una vez
     por fotograma y solo mientras quede alguno por entrar.        */
  const watchers = [];
  let queuedPump = false;

  const pump = () => {
    queuedPump = false;
    if (!watchers.length) return;
    const h = window.innerHeight;
    for (let i = watchers.length - 1; i >= 0; i--) {
      const w = watchers[i];
      const r = w.el.getBoundingClientRect();
      if (r.top < h * (1 - w.margin) && r.bottom > 0) {
        w.hit(w.el);
        watchers.splice(i, 1);
      }
    }
  };

  /* Un fotograma por rafaga de scroll, no uno por rectangulo: leer
     veinte cajas en cada evento de scroll es lo que convierte un
     reveal en un tiron. */
  const schedule = () => {
    if (queuedPump) return;
    queuedPump = true;
    requestAnimationFrame(pump);
  };

  const watch = (nodes, hit, margin = .1) => {
    nodes.forEach(el => watchers.push({ el, hit, margin }));
    schedule();
  };

  /* El vigia de arriba es de una sola vez: dispara y se borra de la
     lista. Sirve para un reveal, que ocurre una vez y ya esta.

     Una pelicula no. Una pelicula necesita saber tambien cuando
     dejo de verse, porque un video que sigue corriendo fuera de
     pantalla gasta un decodificador igual que uno visible — y los
     decodificadores se acaban. Con veintidos corriendo a la vez,
     Chrome empieza a soltarlos: los clips se traban, dejan de dar
     la vuelta y se quedan congelados en un fotograma.

     Este otro se queda mirando y avisa en los dos sentidos.        */
  const seen = [];
  let queuedSeen = false;

  /* Avisa en cada pasada, no solo cuando algo cambia. Con deteccion
     de cambio, el primer barrido fijaba "visible" antes de que el
     video tuviera fuente, la orden se perdia y el estado ya no
     volvia a cambiar nunca: el clip quedaba en pausa para siempre.

     Quien escucha se encarga de no hacer nada si ya esta como debe.
     Sale mas barato que llevar la cuenta de quien esta listo.      */
  const sweep = () => {
    queuedSeen = false;
    const h = window.innerHeight;
    for (const w of seen) {
      const r = w.el.getBoundingClientRect();
      w.cb(w.el, r.top < h + h * w.margin && r.bottom > -h * w.margin);
    }
  };

  const scheduleSeen = () => {
    if (queuedSeen) return;
    queuedSeen = true;
    requestAnimationFrame(sweep);
  };

  const observe = (nodes, cb, margin = .15) => {
    nodes.forEach(el => seen.push({ el, cb, margin }));
    scheduleSeen();
  };

  const tick = () => { schedule(); scheduleSeen(); };
  setInterval(scheduleSeen, 900);
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick, { passive: true });
  window.addEventListener("load", schedule);
  /* Dos pasadas tardias: las fuentes y las imagenes cambian alturas
     despues del primer fotograma, y lo que estaba fuera de pantalla
     puede haber entrado sin que nadie haya tocado la rueda. */
  setTimeout(schedule, 300);
  setTimeout(schedule, 1200);

  const reveal = el => el.classList.add("in");

  const setupReveal = () => {
    const nodes = [...$$(".r"), ...$$(".clip")];
    if (reduced) { nodes.forEach(reveal); return; }
    watch(nodes, reveal, .08);
  };

  const splitLines = el => {
    const raw = el.dataset.raw || (el.dataset.raw = el.innerHTML);
    el.innerHTML = raw;

    /* Medir donde parte el navegador es lo correcto para un titular
       que fluye. Para uno cuyos cortes estan escritos con <br> es lo
       contrario: la medicion ocurre antes de que terminen de cargar
       las fuentes, mide con las metricas de reserva y parte donde no
       debe. Con data-lines="br" no se mide nada — se corta por donde
       dice el marcado y punto. */
    if(el.dataset.lines === "br"){
      const out = document.createDocumentFragment();
      raw.split(/<br\s*\/?>/i).forEach(part => {
        if(!part.trim()) return;
        const ln = document.createElement("span");
        ln.className = "ln";
        const inner = document.createElement("span");
        inner.innerHTML = part.trim();
        ln.appendChild(inner);
        out.appendChild(ln);
      });
      el.innerHTML = "";
      el.appendChild(out);
      return;
    }

    /* cada palabra en su propio span, para poder medirla */
    const wrap = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part.trim()) return frag.appendChild(document.createTextNode(part));
            const w = document.createElement("span");
            w.className = "w";
            w.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          wrap(child);
        }
      });
    };
    wrap(el);

    const words = $$(".w", el);
    if (!words.length) { el.classList.add("in"); return; }

    const lines = [];
    let top = null;
    words.forEach(w => {
      const t = Math.round(w.offsetTop);
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });

    const out = document.createDocumentFragment();
    lines.forEach(group => {
      const ln = document.createElement("span");
      ln.className = "ln";
      const inner = document.createElement("span");
      group.forEach((w, i) => {
        /* El espacio se repone entre palabras, pero no delante de un
           signo que cierra: "come ." no es una linea, es un error. */
        if (i && !/^[.,;:!?)’”]/.test(w.textContent))
          inner.appendChild(document.createTextNode(" "));
        /* si la palabra venia dentro de un <em>, conserva su marca */
        const host = w.parentElement;
        if (host && host !== el && host.tagName === "EM") {
          const em = document.createElement("em");
          em.textContent = w.textContent;
          inner.appendChild(em);
        } else {
          inner.appendChild(document.createTextNode(w.textContent));
        }
      });
      ln.appendChild(inner);
      out.appendChild(ln);
    });
    el.innerHTML = "";
    el.appendChild(out);
  };

  const setupLines = () => {
    const heads = $$(".lines");
    if (!heads.length) return;
    if (reduced) { heads.forEach(h => h.classList.add("in")); return; }

    heads.forEach(splitLines);
    watch(heads, reveal, .12);

    /* Un solo recalculo por rafaga de resize, y solo si el ancho
       cambio: en un telefono la barra del navegador que aparece y
       desaparece dispara resize sin mover una sola linea. */
    let w = window.innerWidth, t;
    window.addEventListener("resize", () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => heads.forEach(h => {
        const seen = h.classList.contains("in");
        splitLines(h);
        if (seen) h.classList.add("in");
      }), 220);
    }, { passive: true });
  };


  /* ── 07 · Railes ──────────────────────────────────────────────
     scrollLeft solo acepta pixeles enteros, y una deriva lenta se
     queda varios fotogramas en el mismo pixel: el ojo lo lee como
     un temblor. Todo se mueve sobre una pista transformada —
     compositado en GPU, posiciones fraccionarias reales, ningun
     repintado por fotograma.                                      */
  const initRail = rail => {
    const auto  = rail.dataset.rail === "auto";
    const speed = Number(rail.dataset.railSpeed || .4);

    let track = $(":scope > .rail-track", rail);
    if (!track) {
      track = document.createElement("div");
      track.className = "rail-track";
      while (rail.firstChild) track.appendChild(rail.firstChild);
      rail.appendChild(track);
      if (auto) [...track.children].forEach(n => track.appendChild(n.cloneNode(true)));
    }

    let x = 0, half = 0, paused = false, dragging = false;
    let startX = 0, startPos = 0, last = 0, glide = 0, prev = performance.now();
    /* El eje del gesto. Con raton siempre es horizontal: apretar el
       boton sobre una tira ya dice que se la quiere arrastrar. Con
       el dedo no se sabe hasta que se mueve — y hay que averiguarlo
       antes de tocar nada. */
    let startY = 0, eje = null;

    const measure = () => { half = track.scrollWidth / (auto ? 2 : 1); };
    measure();
    window.addEventListener("resize", measure, { passive: true });

    const clamp = v => {
      if (auto) return v >= half ? v - half : (v < 0 ? v + half : v);
      const max = Math.max(0, track.scrollWidth - rail.clientWidth);
      return Math.min(Math.max(v, 0), max);
    };

    rail.addEventListener("mouseenter", () => paused = true);
    rail.addEventListener("mouseleave", () => paused = false);

    /* El arrastre nativo del navegador se lleva la imagen y el
       enlace: al empujar la tira, el puntero salia con una foto
       fantasma pegada y el rail se quedaba quieto. Se cancela el
       dragstart y se evita el arrastre nativo desde el mousedown. */
    rail.addEventListener("dragstart", e => e.preventDefault());
    $$("img, a", rail).forEach(n => { n.draggable = false; });

    let moved = 0;

    const down = e => {
      /* preventDefault en el mousedown es lo que apaga el arrastre
         nativo de imagenes y enlaces sin tocar el touch. */
      if (!e.touches) e.preventDefault();
      dragging = true; glide = 0; moved = 0;
      startX = (e.touches ? e.touches[0].pageX : e.pageX);
      startY = (e.touches ? e.touches[0].pageY : 0);
      eje = e.touches ? null : "x";
      last = startX; startPos = x;
      rail.classList.add("is-dragging");
    };

    /* EL DEDO QUE SOLO QUERIA BAJAR.
       touchmove llegaba sin preguntar en que direccion iba el
       gesto, asi que cualquier scroll vertical que empezara sobre
       una tira la barria de lado: la pagina bajaba y las fichas se
       corrian solas. Tres tiras de la pagina, y las tres ocupan el
       ancho entero — era dificil bajar sin cruzar ninguna.

       Ahora el primer tramo del gesto decide. Hasta que uno de los
       dos ejes gana por seis pixeles no se mueve nada; si gana el
       vertical, la tira se aparta y deja pasar el scroll hasta que
       el dedo se levante. */
    const move = e => {
      if (!dragging) return;
      const t  = e.touches && e.touches[0];
      const px = (t ? t.pageX : e.pageX);

      if (eje === null) {
        const dx = Math.abs(px - startX), dy = Math.abs(t.pageY - startY);
        if (dx < 6 && dy < 6) return;
        eje = dx > dy ? "x" : "y";
        if (eje === "y") rail.classList.remove("is-dragging");
        /* El origen se rehace en el punto donde se decidio: si no,
           la tira pega un salto de los seis pixeles que costo
           averiguarlo. */
        startX = px; startPos = x; last = px;
      }
      if (eje === "y") return;

      moved = Math.max(moved, Math.abs(px - startX));
      x = clamp(startPos - (px - startX));
      glide = last - px;
      last = px;
    };
    const up = () => {
      dragging = false; eje = null;
      rail.classList.remove("is-dragging");
    };

    /* Un arrastre no es un clic. Sin esto, soltar sobre una ficha
       abria su enlace y el gesto terminaba navegando. */
    rail.addEventListener("click", e => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    rail.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseup", up);
    rail.addEventListener("touchstart", down, { passive: true });
    rail.addEventListener("touchmove", move, { passive: true });
    rail.addEventListener("touchend", up);

    const tick = now => {
      const dt = Math.min((now - prev) / 16.67, 3);
      prev = now;
      if (!dragging) {
        if (Math.abs(glide) > .05) { x = clamp(x + glide * dt); glide *= .92; }
        else if (auto && !paused && !reduced) x = clamp(x + speed * dt);
      }
      track.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const setupRails = () => $$("[data-rail]").forEach(initRail);


  /* ── 08 · El comparador ───────────────────────────────────────
     La lamina que se abre estrena su cine; las otras dos ni lo
     descargan. Tres videos reproduciendose a la vez es mucho ancho
     de banda para una decision que solo necesita uno.              */
  const setupChooser = () => {
    const panels = $$(".ch");
    if (!panels.length || reduced || FILM !== "todo") return;

    const play = v => {
      if (!v) return;
      if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
      v.play().then(() => v.classList.add("is-playing")).catch(() => {});
    };
    const stop = v => { if (!v) return; v.pause(); v.classList.remove("is-playing"); };

    if (coarse) {
      /* Sin cursor, la lamina que pasa por el centro es la que juega. */
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


  /* ── 09 · Video perezoso ──────────────────────────────────── */
  const setupLazyVideo = () => {
    if (FILM === "ninguno") return;
    /* La portada tambien se sirve por aqui, asi que el filtro tactil
       la deja pasar: es el unico clip que sigue corriendo. */
    let vids = $$("video[data-src]").filter(v => !v.closest(".ch"));
    if (FILM === "solo-portada") vids = vids.filter(v => v.closest("#heroMedia"));
    if (!vids.length) return;
    /* El mismo vigia que los reveals, con margen negativo: el video
       empieza a bajar un poco antes de entrar en pantalla. */
    /* Baja el archivo la primera vez que asoma. */
    watch(vids, v => {
      v.src = talle(v.dataset.src, !!v.closest("#heroMedia"));
      /* autoplay vuelve a lanzar el video cada vez que se pausa por
         estar fuera de pantalla. A partir de aqui manda el vigia. */
      v.removeAttribute("autoplay");
      v.autoplay = false;
      v.load();
      /* El fundido lo dispara el propio video al empezar a correr,
         no la orden de reproducir: entre las dos hay medio segundo
         de decodificacion, y encender ahi deja un cuadro negro
         donde tendria que seguir la fotografia. */
      v.addEventListener("playing", () => v.classList.add("is-playing"), { once: true });
      const go = () => v.play().catch(() => {});
      go();
      v.addEventListener("canplay", go, { once: true });
    }, -.35);

    /* Y a partir de ahi corre solo mientras se ve. Al salir se pausa
       en el sitio; al volver, sigue donde estaba — no se rebobina,
       porque un plano que arranca de cero cada vez que pasas por el
       delata el truco. */
    observe(vids, (v, dentro) => {
      if (!v.src) return;
      if (dentro) { if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  };


  /* ── 06b · La copia del collage ───────────────────────────────
     Tres casas y un solo bloque de texto. Con raton manda el
     puntero: la casa que se esta mirando es la que cuenta.

     Cuando la composicion se vuelve tira no hay puntero que valga,
     asi que manda el recorrido: la foto que cruza el centro del
     campo es la que habla. Es el mismo criterio que usa la galeria
     del ideario — leer donde esta el ojo, no donde estuvo el
     ultimo clic.                                                  */
  const setupCollageCopy = () => {
    const zona  = $("[data-collage-copy]");
    const tira  = $(".collage-figs");
    if (!zona || !tira) return;

    const fotos  = $$(".prop-fig[data-prop]", tira);
    const copias = $$(".cc[data-prop]", zona);
    if (!fotos.length || !copias.length) return;

    /* El segundo enlace tambien pertenece a la casa: en Estancia son
       habitaciones, en Bahia bungalows y en Playa casas. Un rotulo
       generico para las tres desperdicia la unica linea que podia
       decir que se va a ver. */
    const cta = $(".collage-link");
    let actual = null;
    const poner = key => {
      if (!key || key === actual) return;
      actual = key;
      let viva = null;
      copias.forEach(c => {
        const on = c.dataset.prop === key;
        c.classList.toggle("is-on", on);
        if (on) viva = c;
      });
      if (cta && viva && viva.dataset.cta) {
        const t = $("span", cta) || cta;
        t.textContent = viva.dataset.cta;
        if (viva.dataset.href) cta.setAttribute("href", viva.dataset.href);
      }
    };

    /* Con raton. */
    fotos.forEach(f => f.addEventListener("mouseenter", () => poner(f.dataset.prop)));

    /* Con el dedo, o con el raton arrastrando la tira. */
    let pedido = false;
    const mirar = () => {
      pedido = false;
      /* Solo cuando de verdad hay recorrido: en escritorio la tira
         no se desplaza y aqui no hay nada que decidir. */
      if (tira.scrollWidth <= tira.clientWidth + 4) return;
      /* Por el recorrido, no por la posicion de una foto.

         Probe con el centro del campo y con el canto de entrada, y
         los dos fallan por el mismo motivo: cuando en la ventana
         caben dos fichas, la ultima no puede llegar ni al centro ni
         al margen — el scroll se acaba antes. Con el canto, Playa no
         se activaba nunca; con el centro, Bahia se saltaba.

         El recorrido no tiene ese problema. Al principio, la
         primera; al final, la ultima; y el reparto en el medio. Tres
         fotos, tres copias, un solo gesto de lado a lado.          */
      const largo = tira.scrollWidth - tira.clientWidth;
      const i = largo > 0
        ? Math.round((tira.scrollLeft / largo) * (fotos.length - 1))
        : 0;
      const foto = fotos[Math.max(0, Math.min(fotos.length - 1, i))];
      if (foto) poner(foto.dataset.prop);
    };
    const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(mirar); } };

    tira.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir, { passive: true });
    pedir();
  };


  /* ── 06c · La semana ──────────────────────────────────────────
     Siete fichas, siete dias. El marcado dice que pasa cada dia y
     a que hora; las fechas las pone el reloj, porque una fecha
     escrita a mano caduca el lunes siguiente.

     La semana empieza el domingo a las 23:30 en Jose Ignacio. Ese
     es el momento en que la programacion se renueva, asi que a
     partir de ese minuto la barra ya muestra los siete dias
     nuevos: no espera al lunes por la manana para dejar de mostrar
     una semana que termino.

     El punto azul marca la ficha mas cercana a este momento. No la
     de hoy: la mas cercana. Un domingo a medianoche lo que viene
     esta mas cerca que lo que ya paso, y eso es lo que hay que
     senalar.                                                      */
  const setupWeek = () => {
    const zona = $("#now");
    if (!zona) return;
    const fichas = $$("[data-day]", zona);
    if (!fichas.length) return;
    if (!fichas.length) return;

    const DIAS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const MES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    /* Ahora, en hora del destino. */
    const stamp = new Intl.DateTimeFormat("en-CA", {
      timeZone: GEO.tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
    const ahora = new Date(+stamp.year, +stamp.month - 1, +stamp.day,
                           +stamp.hour, +stamp.minute);

    /* El domingo 23:30 mas reciente. Desde ahi corren siete dias:
       lunes es el primero. */
    const corte = new Date(ahora);
    corte.setHours(23, 30, 0, 0);
    const dow = ahora.getDay();                       // 0 = domingo
    let atras = (dow + 7) % 7;                        // dias hasta el domingo
    if (dow === 0 && ahora < corte) atras = 7;        // domingo antes de las 23:30
    corte.setDate(corte.getDate() - atras);

    const lunes = new Date(corte);
    lunes.setDate(lunes.getDate() + 1);
    lunes.setHours(0, 0, 0, 0);

    /* La lamina clara no es un dia de la semana: es hoy. Lleva la
       fecha del momento en que se abre la pagina, no la del hueco
       que ocupa en la tira. */
    $$("[data-today]", zona).forEach(f => {
      const n = $("[data-today-num]", f), m = $("[data-today-month]", f);
      if (n) n.textContent = pad(ahora.getDate());
      if (m) m.textContent = MES[ahora.getMonth()];
    });

    let cerca = null, dist = Infinity;
    fichas.forEach(f => {
      const i = Number(f.dataset.day || 0);
      const [h, m] = String(f.dataset.at || "00:00").split(":").map(Number);
      const cuando = new Date(lunes);
      cuando.setDate(cuando.getDate() + i);
      cuando.setHours(h, m, 0, 0);

      const nom = $("[data-day-name]", f);
      const num = $("[data-day-num]", f);
      const mes = $("[data-day-month]", f);
      if (nom) nom.textContent = DIAS[cuando.getDay()].slice(0, 3) + " " + pad(cuando.getDate());
      if (num) num.textContent = pad(cuando.getDate());
      if (mes) mes.textContent = MES[cuando.getMonth()];

      const d = Math.abs(cuando - ahora);
      if (d < dist) { dist = d; cerca = f; }
      f.classList.remove("is-now");
    });
    if (cerca) cerca.classList.add("is-now");

    /* Esto corre antes de que el rail clone la tira, asi que las
       copias nacen con la fecha ya escrita y el punto donde
       corresponde. Al revisar mas tarde, las copias tambien estan
       en la consulta y se actualizan solas.

       Cada media hora: una pagina abierta toda la tarde tiene que
       mover el punto sin que nadie recargue. */
    if (!zona.dataset.reloj) {
      zona.dataset.reloj = "1";
      setInterval(setupWeek, 1800000);
    }
  };


  /* ── 06d · El filtro de experiencias ──────────────────────────
     Doce experiencias en el marcado, cuatro plazas en pantalla.

     Una reja de doce fichas es un catalogo, y un catalogo se hojea
     sin mirar nada. Cuatro se miran. Asi que el modulo muestra
     tres experiencias y una salida: el filtro no revela mas
     contenido, cambia cual de los doce ocupa las tres plazas.

     Y una de las tres siempre se mueve. Con las cuatro quietas, el
     bloque se lee como una pagina de revista; con una en
     movimiento, se lee como un destino que esta pasando ahora. Una
     sola, no tres: tres videos juntos compiten entre ellos y
     ninguno se mira.

     Los nombres del filtro salen de las propias fichas. Escribir
     la lista a mano garantiza que algun dia haya un boton que no
     filtra nada, o una experiencia que ningun boton alcanza.      */
  const setupMosaicFilter = () => {
    const barra = $("[data-mosaic-filter]");
    const grid  = $(".mosaic");
    if (!barra || !grid) return;
    const fichas = $$(".vcard[data-tags]", grid);
    const cta    = $("[data-mosaic-cta]", grid);
    if (!fichas.length) return;

    /* Cuatro plazas siempre. Sin filtro las cuatro son
       experiencias; con filtro, tres y la salida. */
    const TOTAL = 4;
    let PLAZAS = TOTAL;
    const nombres = [];
    fichas.forEach(f => f.dataset.tags.split(/\s+/).forEach(t => {
      if (t && !nombres.includes(t)) nombres.push(t);
    }));

    const titulo = t => t.charAt(0).toUpperCase() + t.slice(1);
    const hacer = (valor, texto) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mo-tab"; b.dataset.tag = valor;
      b.setAttribute("role", "tab"); b.textContent = texto;
      barra.appendChild(b);
      return b;
    };
    const botones = [hacer("", "All")].concat(nombres.map(t => hacer(t, titulo(t))));

    /* El video se crea al entrar en plaza y se destruye al salir.
       Dejarlos vivos escondidos es tener once decodificadores
       corriendo para una imagen que nadie ve. */
    const encender = f => {
      if (!f.dataset.film || $("video", f)) return;
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true;
      v.preload = "none"; v.setAttribute("aria-hidden", "true");
      v.src = f.dataset.film;
      f.insertBefore(v, f.firstChild);
      v.load();
      const go = () => v.play().catch(() => {});
      go();
      v.addEventListener("canplay", go, { once: true });
    };
    const apagar = f => {
      const v = $("video", f);
      if (v) { v.pause(); v.remove(); }
    };

    /* Arranca en un punto distinto en cada carga. El modulo no es
       una vitrina fija: doce experiencias detras de tres plazas
       tienen que turnarse, o nueve de ellas no las ve nadie. */
    let girando = Math.floor(Math.random() * 12);
    const repartir = tag => {
      PLAZAS = tag ? TOTAL - 1 : TOTAL;
      const cabe = fichas.filter(f => !tag || f.dataset.tags.split(/\s+/).includes(tag));

      /* La que se mueve va primero, y va rotando: dos visitas al
         mismo filtro no muestran la misma terna. */
      /* Dos con pelicula, porque dos son las plazas anchas y son
         las que mandan en la composicion: una lamina a doble ancho
         quieta al lado de una chica que se mueve invierte el peso
         del bloque. La tercera se queda en fotografia — tres
         videos juntos compiten y ninguno se mira. */
      const conFilm = cabe.filter(f => f.dataset.film);
      const elegidas = [];
      for (let k = 0; k < 2 && k < conFilm.length; k++)
        elegidas.push(conFilm[(girando + k) % conFilm.length]);
      cabe.forEach(f => {
        if (elegidas.length < PLAZAS && !elegidas.includes(f)) elegidas.push(f);
      });

      /* Las etiquetas estan repartidas para que ningun filtro baje
         de tres, pero eso es una promesa del contenido y el
         contenido cambia. Si algun dia una categoria se queda
         corta, se completa con las mas cercanas antes de dejar la
         reja coja: cuatro plazas siempre, pase lo que pase. */
      if (elegidas.length < PLAZAS) {
        fichas.forEach(f => {
          if (elegidas.length < PLAZAS && !elegidas.includes(f)) elegidas.push(f);
        });
      }

      fichas.forEach(f => {
        const dentro = elegidas.includes(f);
        f.classList.toggle("is-out", !dentro);
        if (!dentro) apagar(f);
      });

      /* La reja respira en dos-uno / uno-dos: ancha, angosta,
         angosta, ancha. Y el ancho se reparte por el orden en que
         la reja las dibuja, que es el del marcado — no por el orden
         en que el motor las eligio. Repartido por seleccion, la
         ancha caia en la segunda o la tercera y la fila no cerraba:
         cuatro piezas ocupaban tres filas en vez de dos. */
      /* La reja respira ancha-angosta-angosta-ancha, y el ancho se
         reparte por el orden en que se dibuja — el del marcado — no
         por el orden en que el motor eligio.

         La salida nunca ocupa una plaza ancha: es la unica sin
         fotografia, y a doble ancho se convierte en un cartel. Al
         quedarse con una de las chicas, se intercala entre las
         fotos en vez de presidirlas. */
      /* La salida se mete entre las fotos, no al final. Cerrando la
         fila se lee como el pie del modulo; intercalada, es una
         pausa dentro de la serie — que es lo que es.

         Va en la segunda o la tercera plaza, nunca en las puntas:
         esas son las anchas, y a doble ancho una ficha sin
         fotografia se convierte en un cartel. */
      /* Sin filtro puesto, las cuatro plazas son experiencias. La
         salida aparece recien cuando el lector eligio un tema: es
         entonces cuando "ver todo lo de Ocean" quiere decir algo.
         De entrada seria una plaza gastada en una pregunta que
         nadie se hizo todavia.

         El hueco se cuenta sobre el orden del marcado, que es el
         que la reja dibuja — no sobre el orden en que el motor
         eligio. Contado sobre la seleccion, la salida caia a veces
         en la primera plaza, que es ancha. */
      /* El orden se escribe, no se hereda. La reja dibuja en el
         orden del marcado, y ese orden era el de la lista original:
         la ficha con pelicula caia donde caia, a veces en una plaza
         angosta, y el video quedaba en la esquina chica mientras
         las dos grandes se veian quietas.

         Asi que las dos con pelicula se colocan en las puntas —que
         son las anchas— y la que no tiene, en el medio. Despues se
         mete la salida entre ellas. */
      const conVideo = elegidas.filter(f => f.dataset.film);
      const sinVideo = elegidas.filter(f => !f.dataset.film);
      const orden = [];
      if (conVideo[0]) orden.push(conVideo[0]);
      sinVideo.forEach(f => orden.push(f));
      conVideo.slice(1).forEach(f => orden.push(f));

      if (cta) {
        cta.classList.toggle("is-out", !tag);
        if (tag) orden.splice(1 + (girando % 2), 0, cta);
      }
      orden.forEach(f => grid.appendChild(f));

      const enPantalla = [...grid.children].filter(f => !f.classList.contains("is-out"));
      enPantalla.forEach((f, i) =>
        f.classList.toggle("is-wide", i === 0 || i === enPantalla.length - 1));

      /* La pelicula va donde se ve: en las dos plazas anchas y solo
         ahi. Las angostas se quedan en su fotograma — cuatro videos
         en un bloque de cuatro no es un modulo vivo, es ruido, y
         cada uno cuesta un decodificador.

         Se decide despues de repartir el ancho, no antes: quien es
         ancha depende del orden en que la reja dibuja, y eso no se
         sabe hasta que estan colocadas. */
      enPantalla.forEach(f => {
        if (f.classList.contains("is-wide") && f.dataset.film && FILM === "todo")
          encender(f);
        else apagar(f);
      });

      if (cta) {
        const t = $("[data-cta-title]", cta), c = $("[data-cta-count]", cta);
        if (t) t.textContent = tag ? titulo(tag) : "All experiences";
        if (c) c.textContent = cabe.length + (cabe.length === 1 ? " experience" : " experiences");
        cta.setAttribute("href", tag ? "experiences.html#" + tag : "experiences.html");
      }
      girando++;
    };

    const filtrar = tag => {
      botones.forEach(b => {
        const on = b.dataset.tag === tag;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", String(on));
      });
      /* Se apaga, se cambia, se enciende. Cambiar en caliente hace
         que las fichas salten de sitio a la vista. */
      grid.classList.add("is-swapping");
      setTimeout(() => {
        repartir(tag);
        if (grid.scrollTo) grid.scrollTo({ left: 0, behavior: "auto" });
        requestAnimationFrame(() => grid.classList.remove("is-swapping"));
      }, 220);
    };

    botones.forEach(b => b.addEventListener("click", () => filtrar(b.dataset.tag)));
    repartir("");
    botones[0].classList.add("is-on");
    botones[0].setAttribute("aria-selected", "true");
  };


  /* ── 07a · Los enlaces, en pausa ──────────────────────────────
     Esto es una maqueta de diseno: los destinos todavia no existen
     y los anclajes mueven la pagina en mitad de una revision. Con
     esto puesto, todo se ve y se toca, y nada lleva a ningun lado.

     Se cancela en captura, antes de que el enlace haga nada, pero
     se deja correr el resto del clic: los desplegables dibujados,
     las tiras y los cajones del pie siguen respondiendo porque son
     botones, no enlaces.

     Una constante. Para devolverles la vida se pone en false y no
     hay nada mas que tocar.                                       */
  const ENLACES_VIVOS = false;

  const setupDeadLinks = () => {
    if (ENLACES_VIVOS) return;
    /* El indice queda fuera de la pausa: su manejador propio hace
       el desplazamiento y no necesita que el navegador haga nada,
       pero cancelarlo aqui tampoco estorba. Se lo deja pasar para
       que el foco y el historial se comporten como corresponde. */
    const vivo = a => a.closest(".nav-mid, .menu");
    document.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || vivo(a)) return;
      e.preventDefault();
    }, true);
    /* El teclado llega al mismo sitio por otro camino. */
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (a && !vivo(a)) e.preventDefault();
    }, true);
  };


  /* ── 07c · Los cajones del pie ────────────────────────────────
     El marcado los trae abiertos, que es como tienen que quedarse
     en escritorio y como quedan si esto no corre. Aqui solo se
     pliegan cuando el ancho ya no da para cuatro columnas, y se
     vuelven a abrir al ensanchar: nadie deberia estirar la ventana
     y encontrarse el pie a medio cerrar.                          */
  const setupFooterAcc = () => {
    const cajones = $$(".foot-acc");
    if (!cajones.length) return;
    const ancho = window.matchMedia("(min-width:1251px)");
    const sync = () => cajones.forEach(d => { d.open = ancho.matches; });
    sync();
    ancho.addEventListener ? ancho.addEventListener("change", sync)
                           : ancho.addListener(sync);
  };


  /* ── 07b · Arrastrar las tiras ────────────────────────────────
     Las tiras de movil son scroll nativo: con el dedo se empujan
     solas y no hacen falta veinte lineas de codigo. Pero la maqueta
     de tira llega hasta 1250, y ahi arriba hay ventanas angostas de
     escritorio con raton — donde el scroll horizontal nativo pide
     rueda con shift o un trackpad, dos gestos que nadie descubre.
     La tira se veia y no se movia.

     Asi que el raton empuja como el dedo. El tacto no se toca: ya
     funciona y meterle mano solo puede empeorarlo.

     Con inercia, porque una tira que frena en seco donde soltaste
     se siente como una tabla y no como un pliego.                 */
  const dragScroll = el => {
    let down = false, sx = 0, sl = 0, moved = 0, lastX = 0, lastT = 0, vel = 0, raf = 0;

    const glide = () => {
      raf = 0;
      if (down || Math.abs(vel) < .4) { el.style.scrollSnapType = ""; return; }
      el.scrollLeft += vel;
      vel *= .93;
      raf = requestAnimationFrame(glide);
    };

    el.addEventListener("dragstart", e => e.preventDefault());

    el.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      /* Sin esto el puntero se va con una foto fantasma pegada y la
         tira se queda quieta. */
      e.preventDefault();
      down = true; moved = 0; vel = 0;
      sx = e.pageX; lastX = e.pageX; lastT = performance.now();
      sl = el.scrollLeft;
      /* El encaje pelea con el arrastre: mientras se empuja, fuera. */
      el.style.scrollSnapType = "none";
      el.classList.add("is-dragging");
      if (raf) cancelAnimationFrame(raf), raf = 0;
    });

    window.addEventListener("mousemove", e => {
      if (!down) return;
      const dx = e.pageX - sx;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = sl - dx;
      const now = performance.now(), dt = now - lastT;
      if (dt > 0) vel = (lastX - e.pageX) * (16 / dt);
      lastX = e.pageX; lastT = now;
    }, { passive: true });

    window.addEventListener("mouseup", () => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      if (!raf) raf = requestAnimationFrame(glide);
    });

    /* Un arrastre no es un clic: sin esto, soltar sobre una ficha
       termina navegando a su enlace. */
    el.addEventListener("click", e => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  };

  const setupDragScroll = () => {
    if (coarse) return;
    $$(".strip,.collage-figs,.gallery-list,.mosaic,.index,.season,.chooser")
      .forEach(dragScroll);
  };


  /* ── 10b · La mesa en tactil ──────────────────────────────────
     Sin cursor no hay miniatura que seguir, asi que la fotografia
     que en escritorio aparece al pasar por encima entra dentro de
     la ficha. El dato ya estaba en el marcado — data-hover-img es
     el mismo de las dos lecturas, y ninguna se escribe dos veces.

     Se pone siempre y la decide el CSS por ancho: atarla al puntero
     dejaba sin foto a una ventana angosta de escritorio, que es
     donde la ficha ya es ficha. Como es lazy, fuera de la tira no
     se descarga aunque el elemento exista.                        */
  const setupIndexFigs = () => {
    $$(".index-row[data-hover-img]").forEach(row => {
      if ($(".index-fig", row)) return;
      const fig = document.createElement("span");
      fig.className = "index-fig";
      const img = document.createElement("img");
      img.src = row.dataset.hoverImg;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);
      row.appendChild(fig);
    });
  };


  /* ── 10 · La miniatura que sigue al raton ─────────────────────
     Solo con puntero fino. Se precarga al primer hover de la lista
     para que la segunda fila no parpadee.                         */
  const setupHoverImg = () => {
    if (coarse) return;
    const rows = $$("[data-hover-img]");
    if (!rows.length) return;

    const box = document.createElement("div");
    box.className = "hover-img";
    const img = document.createElement("img");
    /* Una sola miniatura para las cuatro filas, y un solo video
       dentro: se le cambia la fuente al pasar de una a otra en vez
       de crear uno por fila. Cuatro elementos de video vivos para
       una caja que muestra uno son tres reproductores de mas. */
    const vid = document.createElement("video");
    vid.muted = true; vid.loop = true; vid.playsInline = true;
    vid.preload = "none"; vid.setAttribute("playsinline", "");
    box.appendChild(img);
    box.appendChild(vid);
    document.body.appendChild(box);

    let x = 0, y = 0, cx = 0, cy = 0, on = false;

    /* Una fila sin pelicula apaga la que hubiera: si no, la anterior
       se queda corriendo debajo del fotograma nuevo. */
    const stop = () => { vid.classList.remove("is-playing"); vid.pause(); };

    rows.forEach(row => {
      row.addEventListener("mouseenter", () => {
        img.src = row.dataset.hoverImg;
        const film = row.dataset.hoverFilm;
        stop();
        if (film) {
          if (vid.dataset.src !== film) { vid.dataset.src = film; vid.src = film; vid.load(); }
          const go = () => vid.play().catch(() => {});
          go();
          vid.addEventListener("canplay", go, { once: true });
          vid.addEventListener("playing", () => vid.classList.add("is-playing"), { once: true });
        }
        on = true; box.classList.add("on");
      });
      row.addEventListener("mouseleave", () => { on = false; box.classList.remove("on"); stop(); });
    });

    window.addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * .12;
      cy += (y - cy) * .12;
      if (on) box.style.left = cx + "px", box.style.top = cy + "px";
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };


  /* ── 11 · Indice pegajoso ─────────────────────────────────── */
  const setupSpy = () => {
    const links = $$(".nav-mid a[href^='#']");
    if (!links.length) return;
    const pairs = [];
    links.forEach(l => {
      const sec = $(l.getAttribute("href"));
      if (sec) pairs.push({ l, sec });
    });
    if (!pairs.length) return;

    /* La seccion activa es la que cruza el medio de la ventana. Se
       recalcula en el scroll, con un fotograma de por medio. */
    let queued = false;
    const mark = () => {
      queued = false;
      const mid = window.innerHeight / 2;
      let hit = null;
      pairs.forEach(p => {
        const r = p.sec.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) hit = p.l;
      });
      links.forEach(l => l.classList.toggle("active", l === hit));
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(mark);
    }, { passive: true });
    mark();
  };


  /* ── 11b · El mapa ────────────────────────────────────────────
     El del styleguide: a sangre, satelital por defecto, con los
     puntos de la casa y una barra de leyenda al pie.

     Dos capas de teselas. Esri World Imagery para el satelite y
     OpenStreetMap para el plano — las dos libres y sin clave. El
     oscuro de CARTO que usa el styleguide pide registro y estampa
     una marca de agua, asi que aqui el plano es OSM y el gris se lo
     pone un filtro.

     La rueda no hace zoom: un mapa que secuestra el scroll a mitad
     de una pagina larga es una trampa.                            */
  /* Los ocho puntos de Jose Ignacio, los mismos del styleguide.
     Cada uno con su foto, su etiqueta y su nota — el globo se arma
     con esto y la barra del pie tambien. Para sumar un punto se
     agrega una linea; no hay nada mas que tocar.                 */
  const PLACES = [
    { key:"bahia", n:"Bahía VIK", tag:"Retreat 03", home:true,
      lat:-34.838119, lng:-54.648421, img:"assets/img/bahia-water-900.webp",
      d:"Within the dunes on Playa Mansa", meta:"Design · social · wellness", href:"#ch-bahia" },
    { key:"playa", n:"Playa VIK", tag:"Retreat 02", home:true,
      lat:-34.841981, lng:-54.640792, img:"assets/img/playa-point-900.webp",
      d:"Above the point, facing the Atlantic", meta:"Architecture · art · privacy", href:"#ch-playa" },
    { key:"estancia", n:"Estancia VIK", tag:"Retreat 01", home:true,
      lat:-34.784209, lng:-54.697643, img:"assets/img/estancia-open-900.webp",
      d:"Open countryside, horses and fire", meta:"40 min inland", href:"#ch-estancia" },
    { key:"pavilion", n:"Pavilion VIK", tag:"Venue",
      lat:-34.838067, lng:-54.647965, img:"assets/img/pavilion-900.webp",
      d:"Oceanfront events and culture", meta:"Weddings · gatherings", href:"#retreats" },
    { key:"susana", n:"La Susana", tag:"Dining",
      lat:-34.838267, lng:-54.647591, img:"assets/img/susana-900.webp",
      d:"Beach dining, music and sunset", meta:"Playa Mansa", href:"#dining" },
    { key:"faro", solo:"mapa", n:"José Ignacio Lighthouse", tag:"Landmark",
      lat:-34.84627, lng:-54.632782, img:"assets/img/map-faro.webp",
      d:"The village landmark", meta:"10 min · the village", href:"#destination" },
    { key:"laguna", solo:"mapa", n:"Laguna Garzón", tag:"Nature",
      lat:-34.802362, lng:-54.572086, img:"assets/img/map-garzon.webp",
      d:"Nature and the ring bridge", meta:"30 min · the lagoon", href:"#experiences" },
    { key:"airport", solo:"mapa", n:"Punta del Este (PDP)", tag:"Arrival",
      lat:-34.8551, lng:-55.0944, img:"assets/img/map-airport.webp",
      d:"Capitán Curbelo airport", meta:"40–50 min by road", href:"#book" }
  ];

  const setupMap = () => {
    const node = $("#leafMap");
    if (!node || !window.L) return;

    let built = false;
    const build = () => {
      if (built) return;
      built = true;

      const map = L.map(node, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
      L.control.zoom({ position: "topright" }).addTo(map);

      const plain = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, attribution: "© OpenStreetMap" });
      const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Imagery © Esri" }).addTo(map);

      $$(".map-view button").forEach(b => b.addEventListener("click", () => {
        $$(".map-view button").forEach(x => x.classList.toggle("active", x === b));
        if (b.dataset.view === "sat") { map.removeLayer(plain); sat.addTo(map); }
        else { map.removeLayer(sat); plain.addTo(map); }
        node.classList.toggle("is-plain", b.dataset.view !== "sat");
      }));

      const markers = {};
      PLACES.forEach(p => {
        markers[p.key] = L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            className: p.home ? "poi poi-home" : "poi",
            iconSize: [12, 12], iconAnchor: [6, 6],
            html: `<span class="poi-dot"></span><span class="poi-label">${p.n}</span>`
          })
        }).addTo(map).bindPopup(
          /* Sin etiqueta sobre la foto: leia un campo que no existe
             y escribia "undefined" en los ocho globos. El dato que
             decia ya esta en la ficha, bajo el nombre.

             El boton lleva el nombre de la casa y nada mas. "Open
             Bahia VIK" gasta dos palabras en explicar lo que un
             boton dentro de un globo ya explica por estar ahi.

             Y los tres puntos que no son casa VIK — el faro, la
             laguna y el aeropuerto — se quedan solo con las
             indicaciones: no hay seccion a la que llevar, y un
             boton que va al indice general es una promesa falsa. */
          `<div class="pop-media" style="background-image:url('${p.img}')"></div>
           <div class="pop-body"><b>${p.n}</b><span class="pop-detail">${p.d}</span>
             ${p.meta ? `<div class="pop-metaline"><span><i>◍</i>${p.meta}</span></div>` : ""}
             <div class="pop-actions">
               ${p.solo ? "" : `<a href="${p.href}">${p.n}</a>`}
               <a class="alt" target="_blank" rel="noopener"
                  href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}">Directions</a>
             </div></div>`, { maxWidth: 260, minWidth: 256 });
      });

      /* La barra del pie se escribe desde los mismos datos que los
         puntos: una sola lista, dos representaciones. */
      const ul = $("#mapLegend");
      if (ul) {
        ul.innerHTML = PLACES.map(p =>
          `<li class="${p.home ? "home" : ""}" data-key="${p.key}"><span class="d"></span><span class="n">${p.n}</span></li>`).join("");
        $$("li", ul).forEach(li => li.addEventListener("click", () => {
          const p = PLACES.find(x => x.key === li.dataset.key);
          if (!p) return;
          map.flyTo([p.lat, p.lng], 14, { duration: 1.1 });
          markers[p.key].openPopup();
        }));
      }

      const box = PLACES.map(p => [p.lat, p.lng]);
      /* El encuadre de apertura no centra los puntos: los sube. Con
         relleno asimetrico — poco arriba, mucho abajo — los ocho
         quedan en el tercio superior y el resto del cuadro es
         oceano. Media tierra y medio mar, que es como se lee esta
         costa desde el aire: la ciudad arriba y, abajo, mar
         abierto con las islas.

         Y como el relleno se mide en pixeles, el encuadre sigue
         funcionando igual a cualquier ancho: no hay centro ni zoom
         escritos a mano que corregir. */
      const frame = () => {
        map.invalidateSize();
        map.fitBounds(box, {
          paddingTopLeft:     [80, 60],
          paddingBottomRight: [80, Math.max(340, node.clientHeight * 0.66)],
          maxZoom: 11,
          animate: false
        });
      };
      frame(); setTimeout(frame, 260);
      window.addEventListener("resize", frame, { passive: true });
    };

    /* Las teselas se piden cuando el bloque se acerca, no al cargar. */
    watch([node], build, -.2);
  };


  /* ── 11c · La pelicula de la portada ──────────────────────────
     Un solo sitio que cambia el clip de fondo, y dos cosas que lo
     piden: elegir un retiro y elegir una estacion. Gana lo ultimo
     que se toco.

     Las rutas no viven aqui: se declaran en el HTML, en
     data-film-* sobre .hero-media. Para cambiar un clip se cambia
     la ruta y no se toca esta funcion.                            */
  const SEASONS = {
    summer: ["Summer", "Dec – Feb", "Vibrant, social, every table full"],
    autumn: ["Autumn", "Mar – May", "The countryside at its best"],
    winter: ["Winter", "Jun – Aug", "Fire, horses, empty landscape"],
    spring: ["Spring", "Sep – Nov", "The coast waking up"]
  };

  /* Hemisferio sur. Un solo sitio donde vive el reparto de meses:
     lo usan el reloj de la barra y la fecha de llegada. */
  const seasonOf = m => (m === 12 || m <= 2) ? "summer"
                      : (m <= 5)             ? "autumn"
                      : (m <= 8)             ? "winter"
                                             : "spring";

  let seasonPinned = false;

  const setupHeroFilm = () => {
    const host = $("#heroMedia");
    const video = host && $("video", host);
    if (!host || !video) return;
    if (FILM === "ninguno") { video.removeAttribute("autoplay"); return; }
    /* Y el fotograma de apertura se pide con prioridad: es la
       primera imagen de la pagina y no puede ir en la cola detras
       de doce posters de mosaico. */
    if (video.poster) {
      const l = document.createElement("link");
      l.rel = "preload"; l.as = "image"; l.href = video.poster;
      l.fetchPriority = "high";
      document.head.appendChild(l);
    }

    const film = key => host.dataset[key ? "film" + key[0].toUpperCase() + key.slice(1) : "film"]
                     || host.dataset.film;

    /* El poster acompana al clip por convencion de nombre: si no
       existe, el video simplemente arranca sin el. */
    /* El sello de version viaja al final de la ruta, asi que el
       nombre del poster se arma antes de el y se lo vuelve a pegar:
       de otro modo la sustitucion no encuentra la extension y el
       clip nuevo estrena con el fotograma del viejo. */
    const posterOf = src =>
      src.replace(/\.mp4(\?[^#]*)?$/, (_, q) => "-poster.webp" + (q || ""));

    /* Los ocho fotogramas de la portada se bajan al arrancar, en
       cuanto el navegador tiene un rato libre. Son ocho webp de
       cincuenta kilos: menos que una sola foto de las de antes.

       Es lo que hace que el cambio sea instantaneo. Sin esto, al
       elegir un hotel o una estacion el navegador empezaba a
       descargar el poster en ese momento y hasta que llegaba no
       habia nada que pintar — la caja gris. */
    const guardados = [];
    const precargar = () => {
      Object.keys(host.dataset)
        .filter(k => k.startsWith("film"))
        .forEach(k => {
          const im = new Image();
          im.decoding = "async";
          im.src = posterOf(host.dataset[k]);
          guardados.push(im);
        });
    };
    if ("requestIdleCallback" in window) requestIdleCallback(precargar, { timeout: 2500 });
    else setTimeout(precargar, 1200);

    /* La fotografia de abajo. Es la que garantiza que la portada
       nunca se quede sin nada que pintar. */
    const fija = $("img", host);

    /* El clip se declara vivo cuando el propio elemento avisa que
       esta pintando, no cuando se le pide que reproduzca: entre las
       dos ordenes hay medio segundo de decodificacion, y ese medio
       segundo es exactamente el hueco que hay que tapar.

       No lleva {once:true} como los demas videos de la pagina: este
       cambia de pelicula, y en cada cambio hay que volver a esperar
       a que el nuevo arranque. */
    const vivo = () => video.classList.add("is-live");
    video.addEventListener("playing", vivo);
    video.addEventListener("timeupdate", vivo);

    const swap = key => {
      const src = film(key);
      if (!src || video.dataset.src === src) return;
      const cartel = posterOf(src);

      /* Nada se toca hasta que el fotograma nuevo esta decodificado
         y listo para pintar. Antes se cambiaba el poster y se
         confiaba en que el navegador lo tuviera a mano; cuando no
         lo tenia, el video se quedaba sin fuente y sin fotograma —
         y eso es la caja gris.

         Los ocho fotogramas ya se bajaron al arrancar, asi que esta
         espera dura lo que tarda un decode de cache: nada. Pero si
         algun dia tarda, lo que se ve mientras tanto es la portada
         anterior, que sigue ahi. */
      const im = new Image();
      im.src = cartel;
      const listo = im.decode ? im.decode().catch(() => {}) : Promise.resolve();

      listo.then(() => {
        /* El clip se desvanece y debajo aparece la fotografia nueva,
           ya pintada. Recien entonces se cambia la fuente del video:
           mientras se apaga, lo que hay detras es una imagen, no un
           hueco. */
        video.classList.remove("is-live");
        if (fija) fija.src = cartel;
        video.dataset.src = src;
        video.poster = cartel;
        video.removeAttribute("src");
        video.src = talle(src, true);
        video.load();
        video.play().catch(() => {});
      });
    };

    /* El retiro elegido manda la pelicula de esa casa. */
    $$("select[name=property]").forEach(sel => sel.addEventListener("change", () => {
      swap(sel.value === "any" ? null : sel.value);
    }));

    /* Y la estacion, la suya. */
    const pick = $("#seasonPick");
    if (pick) pick.addEventListener("change", () => {
      const k = pick.value;
      seasonPinned = !!k;
      if (k && SEASONS[k]){
        const [name, window_, note] = SEASONS[k];
        setFact("season", `${name} <small>${window_}</small>`, note);
      }
      swap(k || null);
      if (!k) paintSeasonNow();
    });

    /* Elegir la llegada es elegir una estacion sin decirlo. La
       fecha no cambia el clip por su cuenta: mueve el selector de
       estacion y deja que este responda. Asi el rotulo de la barra,
       la lista desplegada y la pelicula no pueden discrepar — hay
       un solo camino hacia el cambio.

       Sin selector en la pagina, cambia el clip y ya esta. */
    $$("[name=checkin]").forEach(input => input.addEventListener("change", () => {
      if (!input.value) return;
      /* mediodia: ninguna zona horaria corre el dia */
      const d = new Date(input.value + "T12:00:00");
      if (isNaN(d)) return;
      const k = seasonOf(d.getMonth() + 1);
      if (pick) {
        if (pick.value === k) return;
        pick.value = k;
        pick.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        seasonPinned = true;
        swap(k);
      }
    }));
  };


  /* ── 11d · La barra de reserva ────────────────────────────────
     Aparece al dejar la portada y se retira cuando el bloque de
     reserva entra en pantalla. Nada mas: los campos son los mismos
     que el mostrador y el motor ya los conoce.                   */
  const setupBookbar = () => {
    const bar = $("#bookbar");
    const book = $("#book");
    const pie  = $(".footer");
    if (!bar) return;
    let on = null, queued = false;

    const measure = () => {
      queued = false;
      const past = window.scrollY > window.innerHeight * .6;
      /* Si el bloque de reserva ya se ve, la barra sobra.

         El pie cuenta igual. La barra vuelve a asomar en cuanto la
         reserva se va por arriba, y a partir de ahi se queda fija
         sobre los ultimos renglones del pie — los legales y el
         credito, que en telefono son justo los que caen debajo. Un
         pie es el final de la publicacion: no hay nada que la barra
         tenga que ofrecer ahi. */
      const tapa = el => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * .9 && r.bottom > 0;
      };
      const clash = tapa(book) || tapa(pie);
      const show = past && !clash;
      if (show === on) return;
      on = show;
      bar.classList.toggle("is-on", show);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    measure();
  };


  /* ── 11e · La galeria del ideario ─────────────────────────────
     Manda la entrada que cruza el centro de la ventana, y la
     manda el raton si hay raton encima. La fotografia solo
     obedece: nunca decide cual esta activa.                     */
  const setupGallery = () => {
    /* Por debajo de 900 la lamina no se dibuja: cada entrada lleva su
       imagen debajo. Sin esta puerta el motor seguia estrenando la
       pelicula de la figura activa — quince megas bajados para un
       elemento que el CSS tiene en display:none. */
    const stage = $(".gallery-stage");
    if (stage && getComputedStyle(stage).display === "none") return;
    const list = $(".gallery-list");
    if (!list) return;
    const rows = $$(".gx", list);
    const figs = $$(".gs");
    if (!rows.length) return;

    /* Una figura con data-film estrena su pelicula al encenderse.
       Solo la activa se descarga y solo la activa corre: seis
       videos a la vez en una galeria es mucho ancho de banda para
       una imagen que nadie esta mirando. */
    const film = fig => {
      if (fig.dataset.film && !$("video", fig)) {
        const v = document.createElement("video");
        v.muted = true; v.loop = true; v.playsInline = true;
        v.preload = "none"; v.setAttribute("aria-hidden", "true");
        const img = $("img", fig);
        if (img) v.poster = img.getAttribute("src");
        /* Detras del epigrafe pero delante del fotograma: si se
           inserta antes de la imagen, la imagen lo tapa. */
        fig.appendChild(v);
        const cap = $("figcaption", fig);
        if (cap) fig.appendChild(cap);
        /* El primer play() se pide antes de que el medio este
           listo y el navegador lo rechaza; se vuelve a pedir en
           cuanto puede. Y la clase la pone el evento playing, no la
           promesa: es lo unico que confirma que hay imagen. */
        v.addEventListener("canplay", () => v.play().catch(() => {}));
        v.addEventListener("playing", () => v.classList.add("is-playing"));
      }
      return $("video", fig);
    };

    let at = -1;
    const light = i => {
      if (i === at || i < 0) return;
      at = i;
      rows.forEach((r, k) => r.classList.toggle("is-on", k === i));
      figs.forEach((f, k) => {
        const on = k === i;
        f.classList.toggle("is-on", on);
        /* El elemento solo se crea para la que se enciende: crearlos
           todos era descargar cuatro posters de golpe. */
        const v = on ? (f.dataset.film ? film(f) : null) : $("video", f);
        if (!v) return;
        if (on) {
          if (!v.src) { v.src = f.dataset.film; v.load(); }
          v.play().catch(() => {});
        } else {
          v.pause();
          v.classList.remove("is-playing");
        }
      });
    };

    /* Mientras el raton esta sobre el indice, manda el raton. El
       recorrido decide cuando nadie senala nada.

       Sin esto, el hover no llegaba a verse: Lenis anima el scroll
       por su cuenta y sigue disparando eventos despues de que la
       pagina parece quieta, asi que nearest() reimponia la fila del
       centro un fotograma despues de cada mouseenter. La entrada se
       encendia y se apagaba sola. */
    let sobre = false;
    list.addEventListener("mouseenter", () => { sobre = true; });
    list.addEventListener("mouseleave", () => { sobre = false; schedule(); });

    let queued = false;
    const nearest = () => {
      queued = false;
      if (sobre) return;
      const mid = window.innerHeight / 2;
      let best = Infinity, hit = -1;
      rows.forEach((r, k) => {
        const b = r.getBoundingClientRect();
        const dist = Math.abs(b.top + b.height / 2 - mid);
        if (dist < best) { best = dist; hit = k; }
      });
      light(hit);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(nearest);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    rows.forEach((r, k) => r.addEventListener("mouseenter", () => light(k)));
    light(0);
    schedule();
  };


  /* ── 12 · Datos en vivo ───────────────────────────────────────
     Open-Meteo: gratis, sin clave, sin cookies. Si la red falla,
     la tira se queda con los guiones y no pasa nada mas.          */
  const GEO = { lat: -34.8386, lng: -54.6371, tz: "America/Montevideo" };
  const SEA = { lat: -34.90,   lng: -54.60 };
  const WMO = {
    0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",
    51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",
    71:"Light snow",73:"Snow",75:"Heavy snow",80:"Showers",81:"Showers",82:"Heavy showers",
    95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"
  };
  const BEAR = ["N","NE","E","SE","S","SW","W","NW"];

  const setFact = (key, value, sub) => {
    $$(`[data-live="${key}"]`).forEach(el => { if (value != null) el.innerHTML = value; });
    $$(`[data-live-sub="${key}"]`).forEach(el => { if (sub != null) el.textContent = sub; });
  };

  /* La estacion de hoy, calculada para el hemisferio sur. Vive
     fuera del reloj porque el selector tambien la usa. */
  const paintSeasonNow = () => {
    const m = Number(new Intl.DateTimeFormat("en-GB",
      { month: "numeric", timeZone: GEO.tz }).format(new Date()));
    const key = seasonOf(m);
    const [name, window_, note] = SEASONS[key];
    setFact("season", `${name} <small>${window_}</small>`, note);
  };

  const setupLive = () => {
    const strip = $(".strip[data-live]");
    if (!strip) return;

    /* La hora, cada treinta segundos, y la estacion que le
       corresponde al hemisferio sur. */
    const tick = () => {
      const now = new Date();
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: GEO.tz
      }).format(now);
      const date = new Intl.DateTimeFormat("en-GB", {
        weekday: "short", day: "2-digit", month: "short", timeZone: GEO.tz
      }).format(now);
      setFact("time", time, date + " · José Ignacio, Uruguay");

      if (!seasonPinned) paintSeasonNow();
    };
    tick();
    setInterval(tick, 30000);

    /* ── El aire y el mar ──────────────────────────────────────
       Son dos servicios distintos y se piden por separado a
       proposito: el de aire se satura a ratos y devuelve 503, y
       cuando eso pasa el marino sigue contestando. Pedidos juntos,
       una caida se llevaba por delante el dato del otro.

       Y se reintenta. Una llamada caida dejaba la tira con guiones
       para siempre; ahora vuelve a probar con espera creciente y,
       si el servicio se recupera mientras alguien esta leyendo, el
       dato aparece solo. Lo que no se hace nunca es inventar un
       numero: si no hay dato, la celda lo dice.                 */
    const air = `https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lng}`
      + `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code`
      + `&daily=sunrise,sunset&timezone=${encodeURIComponent(GEO.tz)}&forecast_days=1`;
    const sea = `https://marine-api.open-meteo.com/v1/marine?latitude=${SEA.lat}&longitude=${SEA.lng}`
      + `&current=sea_surface_temperature,wave_height&timezone=${encodeURIComponent(GEO.tz)}`;

    /* Con tiempo limite. Un servicio saturado no siempre contesta
       rapido que esta saturado: tardaba diez segundos en devolver el
       error, y eso estiraba la escalera de reintentos hasta un
       minuto largo. Cuatro segundos y se corta. */
    const grab = u => {
      const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const kill = ctl && setTimeout(() => ctl.abort(), 4000);
      return fetch(u, { cache: "no-store", signal: ctl ? ctl.signal : undefined })
        .then(r => { if(kill) clearTimeout(kill); return r.ok ? r.json() : null; })
        .catch(() => { if(kill) clearTimeout(kill); return null; });
    };

    /* Tres intentos y se admite la derrota, ~18 s en el peor caso
       contando el tiempo limite de cada uno. Mas que eso con
       "Loading" en pantalla es peor que decir que no hay dato. Despues sigue probando en segundo plano cada tres
       minutos, asi que si el servicio vuelve mientras alguien lee,
       el dato entra solo y sin recargar. */
    const WAITS = [1500, 4000];
    const SLOW  = 180000;
    let pending = 2;
    const done = () => { if(--pending <= 0) strip.classList.remove("is-loading"); };

    const attempt = (url, apply, keys, n = 0, gaveUp = false) => {
      grab(url).then(data => {
        if(data && apply(data)){ if(!gaveUp) done(); return; }
        if(n < WAITS.length){
          setTimeout(() => attempt(url, apply, keys, n + 1, gaveUp), WAITS[n]);
          return;
        }
        if(!gaveUp){
          keys.forEach(k => setFact(k, null, "Live data unavailable"));
          done();
        }
        /* A partir de aqui ya no molesta a nadie: reintenta lento y
           en silencio, sin volver a tocar el estado de carga. */
        setTimeout(() => attempt(url, apply, keys, WAITS.length, true), SLOW);
      });
    };

    strip.classList.add("is-loading");

    attempt(air, a => {
      if(!(a && a.current)) return false;
      const c = a.current;
      setFact("weather",
        `${Math.round(c.temperature_2m)}° <small>${WMO[c.weather_code] || "—"}</small>`,
        `Feels ${Math.round(c.apparent_temperature)}° · Humidity ${Math.round(c.relative_humidity_2m)}%`);
      setFact("wind",
        `${Math.round(c.wind_speed_10m)} <small>km/h ${BEAR[Math.round(c.wind_direction_10m / 45) % 8]}</small>`,
        c.wind_speed_10m > 25 ? "Kite weather on the lagoon" : "Calm on the bay");
      if(a.daily && a.daily.sunset){
        setFact("sunset", a.daily.sunset[0].slice(11, 16),
          `Sunrise ${a.daily.sunrise[0].slice(11, 16)} · best light from La Susana`);
      }
      return true;
    }, ["weather", "wind", "sunset"]);

    attempt(sea, s => {
      if(!(s && s.current && s.current.sea_surface_temperature != null)) return false;
      const w = s.current.wave_height;
      setFact("sea", `${Math.round(s.current.sea_surface_temperature)}° <small>water</small>`,
        w != null ? `Waves ${w.toFixed(1)} m · Playa Brava` : "Playa Brava");
      return true;
    }, ["sea"]);
  };



  /* ── 13 · La reserva ──────────────────────────────────────────
     El unico punto de contacto con el motor. Bookassist lee la
     busqueda del query string de la URL segura de cada propiedad,
     y no tiene concepto de "el destino": por eso "help me choose"
     no va al motor — se queda en la pagina y abre el comparador.
     Para apuntar al motor real se edita ENGINE y nada mas.        */
  const ENGINE = {
    base: "https://book.bookassist.com",
    properties: {
      any:      { hotel: null,           fallback: "#choose" },
      estancia: { hotel: "estancia-vik" },
      playa:    { hotel: "playa-vik" },
      bahia:    { hotel: "bahia-vik" }
    }
  };

  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const defaults = () => {
    const a = new Date(); a.setDate(a.getDate() + 1);
    const b = new Date(a); b.setDate(b.getDate() + 3);
    return { in: iso(a), out: iso(b) };
  };

  const buildURL = d => {
    const prop = ENGINE.properties[d.property] || ENGINE.properties.any;
    if (!prop.hotel) return prop.fallback;
    const q = new URLSearchParams({
      arrival: d.in, departure: d.out,
      adults: d.adults || 2, children: 0, rooms: 1
    });
    const lang = document.documentElement.lang || "en";
    return `${ENGINE.base}/${lang}/${prop.hotel}?${q}`;
  };

  /* La cara del desplegable de retiro sigue a lo elegido: firma de
     propiedad cuando hay una casa, serif cuando la respuesta es una
     pregunta. */
  /* ── El desplegable dibujado ──────────────────────────────────
     Chrome no aplica letter-spacing dentro de un <option>, asi que
     cualquier lista que tenga que respetar la tipografia de marca
     hay que dibujarla. El <select> real sigue en el DOM, invisible
     pero vivo: es el que valida, el que lee el motor de reserva y
     lo que queda si el JS no corre.

     Una sola pieza sirve a los dos sitios que la necesitan — el
     retiro y la estacion — y cada uno le pone su piel.           */
  const makePick = (sel, skin, onPaint) => {
    if (!sel || sel.dataset.picked) return null;
    sel.dataset.picked = "1";

    const pick = document.createElement("div");
    pick.className = "pick " + skin;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    const list = document.createElement("div");
    list.className = "pick-list";
    list.setAttribute("role", "listbox");

    /* Una lista desplegada tiene que pasar por encima de lo que
       venga despues, y lo que la tapaba no era el vecino sino el
       bloque entero: un z-index dentro de una seccion no sale de su
       seccion. Asi que se levanta la seccion mientras esta abierta,
       y se baja al cerrar — nunca queda una capa alta permanente
       compitiendo con la barra pegajosa. */
    /* Se pregunta desde el <select>, no desde el .pick: el .pick
       todavia no esta en el documento cuando se llega aqui, y
       closest() sobre un nodo suelto devuelve null. */
    const host = sel.closest("section, .bookbar, .counter");
    const raise = on => host && host.classList.toggle("pick-raise", on);

    const close = () => {
      pick.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      raise(false);
    };

    [...sel.options].forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt.dataset.short || opt.textContent;
      b.setAttribute("role", "option");
      if (opt.hasAttribute("data-prop")) b.setAttribute("data-prop", "");
      b.addEventListener("click", () => {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        close();
      });
      list.appendChild(b);
    });

    const paint = () => {
      const opt = sel.options[sel.selectedIndex];
      btn.textContent = opt ? (opt.dataset.label || opt.dataset.short || opt.textContent) : "";
      [...list.children].forEach((b, i) =>
        b.setAttribute("aria-selected", String(i === sel.selectedIndex)));
      if (onPaint) onPaint(btn, sel);
    };

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const open = pick.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      raise(open);
    });
    document.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    sel.addEventListener("change", paint);

    pick.appendChild(btn);
    pick.appendChild(list);
    sel.parentNode.appendChild(pick);
    paint();
    return pick;
  };

  const setupPropertyFace = () => {
    $$("select[name=property]").forEach(sel => {
      const field = sel.closest(".f");
      if (!field) return;
      field.classList.add("has-pick");
      makePick(sel, "pick-retreat", (btn, s) =>
        btn.classList.toggle("is-property", s.value !== "any"));
    });

    /* La estacion ocupa el sitio de la etiqueta: donde decia
       "Season" ahora esta el propio selector. */
    const season = $("#seasonPick");
    if (season) {
      const cell = season.closest(".season-cell");
      cell && cell.classList.add("has-pick");
      makePick(season, "pick-season");
    }

    /* El idioma. Cambia el atributo lang del documento y lo
       recuerda; los diccionarios todavia no existen en este sample,
       asi que por ahora no traduce nada — el control esta puesto y
       cableado para cuando entren. */
    const lang = $("#langPick");
    if (lang) {
      try {
        const saved = localStorage.getItem("vik.lang");
        if (saved && [...lang.options].some(o => o.value === saved)) lang.value = saved;
      } catch (e) {}
      document.documentElement.lang = lang.value;
      lang.addEventListener("change", () => {
        document.documentElement.lang = lang.value;
        try { localStorage.setItem("vik.lang", lang.value); } catch (e) {}
      });
      makePick(lang, "pick-lang");
    }
  };

  const setupBooking = () => {
    $$("form[data-booking]").forEach(form => {
      const d = defaults();
      const ci = $("[name=checkin]", form), co = $("[name=checkout]", form);
      if (ci && !ci.value) { ci.value = d.in;  ci.min = iso(new Date()); }
      if (co && !co.value) { co.value = d.out; co.min = d.in; }

      /* La salida nunca puede ser anterior a la entrada. */
      ci && ci.addEventListener("change", () => {
        if (!co) return;
        co.min = ci.value;
        if (co.value <= ci.value) {
          const next = new Date(ci.value);
          next.setDate(next.getDate() + 1);
          co.value = iso(next);
          co.dispatchEvent(new Event("change"));
        }
      });

      form.addEventListener("submit", e => {
        e.preventDefault();
        const url = buildURL({
          property: (($("[name=property]", form) || {}).value) || "any",
          in:  (ci || {}).value,
          out: (co || {}).value,
          adults: (($("[name=adults]", form) || {}).value) || 2
        });
        /* Mientras los enlaces esten en pausa, la reserva tampoco
           lleva a ningun lado: ni salta al bloque de abajo ni abre
           el motor en otra pestana. Es un clic mas. */
        if (!ENLACES_VIVOS) return;
        if (url.startsWith("#")) { scrollTo(url); return; }
        window.open(url, "_blank", "noopener");
      });
    });
  };


  /* ── 14 · La fecha, dicha ─────────────────────────────────────
     El input pinta 08/12/2026 y la direccion pide "08 Dec, Mon".
     El input se queda — es el que valida, el que abre el calendario
     nativo y el que lee la reserva. Lo que se hace es dibujar la
     fecha encima, en serif, y dejar el campo transparente sobre
     ella. Sin JS se ve la del navegador y todo funciona igual.    */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  /* ── La temporada de hoy ───────────────────────────────
     La tabla dice como es cada epoca; esto dice en cual estamos y
     cuanto falta para la siguiente. Sin eso, cuatro filas iguales
     obligan a que el lector busque el mes en el calendario.

     Los meses salen del marcado, no de una copia aqui: si algun dia
     Marzo deja de ser temporada media, se cambia la fila y esto lo
     sigue. Y la fecha se lee en la hora del destino — en enero, un
     lector en Madrid y uno en Montevideo no estan en el mismo dia.  */
  const setupSeasonTable = () => {
    const table = $("[data-season-table]");
    if (!table) return;
    const rows = $$(".season-row[data-months]", table);
    if (!rows.length) return;

    const months = r => new Set(r.dataset.months.split(",").map(Number));

    /* Medianoche en Jose Ignacio, no en el navegador. */
    const stamp = new Intl.DateTimeFormat("en-CA", {
      timeZone: GEO.tz, year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date());
    const today = new Date(stamp + "T00:00:00");
    const m = today.getMonth() + 1;

    const here = rows.find(r => months(r).has(m));
    if (!here) return;

    /* El cambio es el primer dia de un mes que ya no pertenece a
       esta temporada. Se busca avanzando, asi que Dic–Ene cruza el
       ano sin ningun caso especial. */
    const mine = months(here);
    let next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    while (mine.has(next.getMonth() + 1))
      next = new Date(next.getFullYear(), next.getMonth() + 1, 1);

    const days = Math.round((next - today) / 86400000);
    const after = rows.find(r => months(r).has(next.getMonth() + 1));
    const name  = after && $(".n", after) ? $(".n", after).textContent.trim() : "";

    const mark = document.createElement("span");
    mark.className = "season-mark";
    mark.textContent = days === 0
      ? "Now · changing today"
      : `Now · ${days} ${days === 1 ? "day" : "days"} to ${name || "the next season"}`;

    here.classList.add("is-now");
    here.appendChild(mark);
  };


  const setupDates = () => {
    $$(".f input[type=date]").forEach(input => {
      const field = input.closest(".f");
      if (!field || $(".date-face", field)) return;

      const face = document.createElement("span");
      face.className = "date-face";
      face.setAttribute("aria-hidden", "true");
      input.parentNode.insertBefore(face, input);
      field.classList.add("has-face");

      const paint = () => {
        if (!input.value) { face.textContent = "—"; return; }
        /* mediodia, para que ninguna zona horaria mueva el dia */
        const d = new Date(input.value + "T12:00:00");
        face.textContent = isNaN(d) ? "—"
          : `${pad(d.getDate())} ${MONTHS[d.getMonth()]}, ${DAYS[d.getDay()]}`;
      };
      paint();
      input.addEventListener("change", paint);
      input.addEventListener("input", paint);

      /* Con el campo transparente el clic llega al input pero no al
         icono del calendario, que es lo que abre el selector en
         Chrome. showPicker lo abre a mano; donde no existe, el foco
         y el teclado siguen funcionando igual. */
      field.addEventListener("click", () => {
        input.focus();
        try { input.showPicker && input.showPicker(); } catch (_) {}
      });
    });
  };


  /* ── Boot ─────────────────────────────────────────────────── */
  const boot = () => {
    syncVW();
    /* El ancho se vigila, no se espera. Los bloques a sangre se
       dibujan contra --vw, y atado solo al evento resize se queda
       viejo cada vez que el ancho cambia por otro motivo: una barra
       de scroll que aparece al terminar de cargar, la barra dinamica
       del navegador movil, una vuelta desde bfcache. Con el ancho
       viejo, un bloque a sangre mide de mas y la pagina entera se
       corre de lado — en un telefono, eso es toda la maqueta rota.

       ResizeObserver lo ve pase lo que pase. El evento queda de
       respaldo para donde no exista. */
    if ("ResizeObserver" in window)
      new ResizeObserver(syncVW).observe(document.documentElement);
    window.addEventListener("resize", syncVW, { passive: true });
    window.addEventListener("orientationchange", syncVW, { passive: true });
    window.addEventListener("pageshow", syncVW);
    setupLoader();
    setupCursor();
    setupScroll();
    setupMenu();
    setupReveal();
    setupLines();
    setupWeek();
    setupRails();
    setupChooser();
    setupLazyVideo();
    setupHoverImg();
    setupSpy();
    setupMap();
    setupLive();
    setupBooking();
    setupPropertyFace();
    setupHeroFilm();
    setupBookbar();
    setupGallery();
    setupDates();
    setupSeasonTable();
    setupIndexFigs();
    setupDragScroll();
    setupFooterAcc();
    setupDeadLinks();
    setupCollageCopy();
    setupMosaicFilter();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
