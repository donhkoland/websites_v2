/* ══════════════════════════════════════════════════════════════
   VIK · BIBLIOTECA HEREDADA, MOTOR
   ──────────────────────────────────────────────────────────────
   Lo que hace falta para que los modulos de vik-v2-lib.css
   funcionen de verdad. No duplica nada de vik-v2.js: se carga
   despues y solo toca piezas que aquel no conoce.

     · el visor de habitaciones — abrir, llenar, navegar, cerrar
     · el filtro de la tira
     · el arrastre con raton de la tira
     · el pase de laminas de la portada interior

   Nicolas Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const grueso = matchMedia("(pointer:coarse)").matches;


  /* ── De donde sale cada fotografia ────────────────────────────
     La ficha guarda la ruta como la escribio quien cargo el
     contenido —rooms/bahia/burgos-01.jpg— y en disco vive
     aplanada y con su ancho: rooms_bahia_burgos-01-w900.jpg.
     La traduccion vive aqui y en un solo sitio, porque si un dia
     cambia el criterio de nombres cambia una linea. */
  const foto = (ruta, ancho) =>
    "../_assets/img/t/" +
    ruta.replace(/\//g, "_").replace(/\.jpe?g$/i, "") + "-w" + ancho + ".jpg";

  /* Las tres tomas de una habitacion son la misma ruta con el
     sufijo cambiado. Si alguna no existe, la imagen no carga y se
     retira sola: mejor dos tomas que un hueco. */
  const tomas = ruta => ["01", "02", "03"].map(n => ruta.replace(/-\d\d(?=\.jpe?g$)/, "-" + n));


  /* ══ EL VISOR ══════════════════════════════════════════════
     Un solo pliego para las veinticuatro habitaciones: se le
     cambia el contenido, no se crea uno por ficha. */
  const visor = () => {
    const capa = $("#roomView");
    const tira = $(".roomreel");
    if (!capa || !tira) return;

    const fichas = $$(".rr", tira);
    if (!fichas.length) return;

    const elNombre = $("#roomName", capa);
    const elMeta   = $("#roomMeta", capa);
    const elCopy   = $("#roomCopy", capa);
    const elShots  = $("#roomShots", capa);
    const elMuro   = $("#roomThumbs", capa);
    const elCuenta = $(".rn-count", capa);
    let i = 0;

    const pintar = n => {
      const f = fichas[n];
      if (!f) return;
      i = n;
      const d = f.dataset;

      if (elNombre) elNombre.textContent = d.name || "";
      if (elMeta)   elMeta.textContent   = d.meta || "";
      if (elCopy)   elCopy.textContent   = d.copy ||
        "Commissioned, not decorated. The artist, the material and the position of the bed were decided together, which is why no two rooms in the house argue the same thing.";

      /* La toma de apertura, a sangre dentro del pliego. */
      if (elShots && d.img) {
        elShots.innerHTML =
          '<img src="' + foto(d.img, 1600) + '" alt="' + (d.name || "") + '">';
      }

      /* Las otras dos, en el muro. Se piden las tres y las que no
         existan se quitan al fallar: el marcado no sabe cuantas
         fotografias tiene cada habitacion, el disco si. */
      if (elMuro && d.img) {
        elMuro.innerHTML = tomas(d.img).map((r, k) =>
          '<span class="wall-tile"><span class="n">' + String(k + 1).padStart(2, "0") +
          '</span><img src="' + foto(r, 900) + '" alt="" loading="lazy"></span>').join("");
        /* Las que no existen se retiran solas al fallar, y el dato
           de cuantas hay se escribe recien entonces: el marcado no
           sabe cuantas tomas tiene cada habitacion, el disco si. */
        const contar = () => {
          const q = $("[data-room-shots]", capa);
          if (q) {
            const n2 = elMuro.children.length;
            q.textContent = n2 === 1 ? "One view" : n2 + " views";
          }
        };
        $$("img", elMuro).forEach(im => {
          im.addEventListener("error", () => { im.parentElement.remove(); contar(); }, { once: true });
          im.addEventListener("load", contar, { once: true });
        });
        contar();
      }

      if (elCuenta) {
        elCuenta.textContent =
          String(n + 1).padStart(2, "0") + " / " + String(fichas.length).padStart(2, "0");
      }

      /* Los dos datos que cambian con la habitacion. El resto de
         la ficha es de la casa y ya esta escrito en el marcado:
         no tiene sentido que el motor lo repita veinticuatro
         veces. */
      const tipo = $("[data-room-type]", capa);
      if (tipo) tipo.textContent = d.cat
        ? d.cat.charAt(0).toUpperCase() + d.cat.slice(1)
        : (d.meta || "").split("·").pop().trim() || "Room";
    };

    const abrir = n => {
      pintar(n);
      capa.classList.add("is-on");
      document.body.style.overflow = "hidden";
      const cerrar = $(".ovl-close", capa);
      if (cerrar) cerrar.focus();
    };
    const cerrar = () => {
      capa.classList.remove("is-on");
      document.body.style.overflow = "";
    };
    const mover = paso => pintar((i + paso + fichas.length) % fichas.length);

    fichas.forEach((f, n) => f.addEventListener("click", e => {
      /* El arrastre ya cancela su propio clic; esto solo evita que
         el enlace navegue cuando si fue un clic. */
      e.preventDefault();
      abrir(n);
    }));

    $$("[data-room-close]", capa).forEach(b => b.addEventListener("click", cerrar));
    const prev = $("[data-room-prev]", capa), next = $("[data-room-next]", capa);
    if (prev) prev.addEventListener("click", () => mover(-1));
    if (next) next.addEventListener("click", () => mover(1));

    /* Fuera del pliego se cierra. Dentro no: un clic en la
       fotografia no es un clic en el velo. */
    capa.addEventListener("click", e => { if (e.target === capa) cerrar(); });
    document.addEventListener("keydown", e => {
      if (!capa.classList.contains("is-on")) return;
      if (e.key === "Escape")     cerrar();
      if (e.key === "ArrowLeft")  mover(-1);
      if (e.key === "ArrowRight") mover(1);
    });
  };


  /* ══ EL FILTRO ═════════════════════════════════════════════
     Esconder, no reordenar. Una tira que reordena hace saltar la
     que se estaba mirando; escondiendo, lo que queda se queda
     donde estaba y el ojo no pierde el sitio. */
  const filtro = () => {
    $$(".roomreel").forEach(tira => {
      const botones = $$(".roomreel-bar button", tira);
      const fichas  = $$(".rr", tira);
      const cuenta  = $(".count", tira);
      if (!botones.length || !fichas.length) return;

      const aplicar = cat => {
        let n = 0;
        fichas.forEach(f => {
          const dentro = !cat || f.dataset.cat === cat;
          f.classList.toggle("is-out", !dentro);
          if (dentro) n++;
        });
        /* El folio se renumera con lo que queda: si al filtrar
           quedan seis y los numeros van del 01 al 24, el numero
           deja de decir nada. */
        let k = 0;
        fichas.forEach(f => {
          if (f.classList.contains("is-out")) return;
          const folio = $(".rr-i", f);
          if (folio) folio.textContent = String(++k).padStart(2, "0");
        });
        if (cuenta) cuenta.textContent = n === 1 ? "1 room" : n + " rooms";
        tira.scrollTo({ left: 0, behavior: "smooth" });
      };

      botones.forEach(b => b.addEventListener("click", () => {
        botones.forEach(o => o.classList.toggle("is-on", o === b));
        aplicar(b.dataset.cat || "");
      }));
    });
  };


  /* ══ LA DERIVA ═════════════════════════════════════════════
     La tira se mueve sola, despacio, y se detiene cuando alguien
     la mira de cerca: al pasar el raton por encima, al agarrarla,
     al enfocar con teclado y cuando la pagina no esta a la vista.

     Sobre scrollLeft y no sobre transform, porque esta tira se
     filtra: una que clona sus hijos para derivar sin fin no puede
     esconder la mitad sin que el clon la delate.

     El paso es fraccionario y se acumula aparte — scrollLeft
     redondea a entero, asi que sumarle .35 cada fotograma no mueve
     nada nunca. */
  const deriva = () => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    $$(".roomreel").forEach(el => {
      let x = el.scrollLeft, quieta = false, visible = true;

      const parar  = () => quieta = true;
      const seguir = () => { quieta = false; x = el.scrollLeft; };
      el.addEventListener("mouseenter", parar);
      el.addEventListener("mouseleave", seguir);
      el.addEventListener("focusin",  parar);
      el.addEventListener("focusout", seguir);
      el.addEventListener("mousedown", parar);
      el.addEventListener("touchstart", parar, { passive: true });
      /* Fuera de pantalla no se anima: es un rAF corriendo para
         nadie y el navegador ya no lo pinta igual. */
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(e => { visible = e[0].isIntersecting; })
          .observe(el);
      }
      document.addEventListener("visibilitychange", () => { x = el.scrollLeft; });

      /* El paso va por tiempo y no por fotograma: a .35 fijos, una
         pantalla de 120Hz mueve la tira al doble de velocidad que
         una de 60. Veintiun pixeles por segundo en las dos. */
      let previo = performance.now();
      const paso = ahora => {
        const dt = Math.min((ahora - previo) / 1000, .1);
        previo = ahora;
        if (!quieta && visible && !document.hidden) {
          const tope = el.scrollWidth - el.clientWidth;
          if (tope > 4) {
            x += 21 * dt;
            if (x >= tope) x = 0;
            el.scrollLeft = x;
          }
        }
        requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  };


  /* ══ EL ARRASTRE ═══════════════════════════════════════════
     Con el dedo el scroll es nativo. Con raton, una tira que solo
     se mueve con una barra que ademas esta oculta no se mueve. */
  const arrastre = () => {
    if (grueso) return;
    $$(".roomreel").forEach(el => {
      let baja = false, x0 = 0, l0 = 0, corrido = 0;
      el.addEventListener("mousedown", e => {
        if (e.button) return;
        e.preventDefault();
        baja = true; corrido = 0;
        x0 = e.pageX; l0 = el.scrollLeft;
        el.classList.add("is-dragging");
      });
      window.addEventListener("mousemove", e => {
        if (!baja) return;
        corrido = Math.max(corrido, Math.abs(e.pageX - x0));
        el.scrollLeft = l0 - (e.pageX - x0);
      }, { passive: true });
      window.addEventListener("mouseup", () => {
        baja = false; el.classList.remove("is-dragging");
      });
      /* Un arrastre no es un clic: sin esto, soltar sobre una
         ficha abre su pliego y el gesto termina en un modal. */
      el.addEventListener("click", e => {
        if (corrido > 6) { e.preventDefault(); e.stopPropagation(); }
      }, true);
      el.addEventListener("dragstart", e => e.preventDefault());
    });
  };


  /* ══ LA AMPLIACION ═════════════════════════════════════════
     Cualquier fotografia con data-ampliar abre en el mismo pliego
     que el visor de habitaciones. Un modal por tipo de contenido
     son cuatro modales que se desincronizan; este es el chasis y
     lo unico que cambia es lo que se le mete. */
  const ampliar = () => {
    const capa = $("#lightbox");
    if (!capa) return;
    const hueco = $("#lightboxShot", capa);
    const fotos = $$("[data-ampliar]");
    if (!fotos.length || !hueco) return;

    let i = 0;
    const pintar = n => {
      i = (n + fotos.length) % fotos.length;
      const a = fotos[i];
      hueco.innerHTML = '<img src="' + a.getAttribute("href") + '" alt="' +
        (($("img", a) || {}).alt || "") + '">';
    };
    const cerrar = () => {
      capa.classList.remove("is-on");
      document.body.style.overflow = "";
    };

    fotos.forEach((a, n) => a.addEventListener("click", e => {
      e.preventDefault();
      pintar(n);
      capa.classList.add("is-on");
      document.body.style.overflow = "hidden";
      const b = $(".ovl-close", capa); if (b) b.focus();
    }));
    $$("[data-ovl-close]", capa).forEach(b => b.addEventListener("click", cerrar));
    capa.addEventListener("click", e => { if (e.target === capa) cerrar(); });
    document.addEventListener("keydown", e => {
      if (!capa.classList.contains("is-on")) return;
      if (e.key === "Escape")     cerrar();
      if (e.key === "ArrowLeft")  pintar(i - 1);
      if (e.key === "ArrowRight") pintar(i + 1);
    });
  };


  /* ══ LA MESA ═══════════════════════════════════════════════
     "Reserve a table" abria una pestana nueva contra el motor de
     Meitre. Una pestana que se abre sola es una pagina perdida:
     el lector se va y no vuelve.

     Abre el mismo pliego, con la eleccion de mesa adentro y el
     enlace al motor como ultimo paso — cuando ya decidio. */
  const mesa = () => {
    const capa = $("#tableView");
    if (!capa) return;
    const cerrar = () => {
      capa.classList.remove("is-on");
      document.body.style.overflow = "";
    };
    $$("[data-mesa]").forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      capa.classList.add("is-on");
      document.body.style.overflow = "hidden";
      const b = $(".ovl-close", capa); if (b) b.focus();
    }));
    $$("[data-ovl-close]", capa).forEach(b => b.addEventListener("click", cerrar));
    capa.addEventListener("click", e => { if (e.target === capa) cerrar(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && capa.classList.contains("is-on")) cerrar();
    });
  };


  /* ══ EL PASE DE LA PORTADA ═════════════════════════════════ */
  const portada = () => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    $$(".hero-page,.statement").forEach(hero => {
      const laminas = $$(".hp-media > *, .statement-media > *", hero);
      const cuenta  = $(".hp-count b", hero);
      if (laminas.length < 2) return;
      let n = 0;
      setInterval(() => {
        laminas[n].classList.remove("is-on");
        n = (n + 1) % laminas.length;
        laminas[n].classList.add("is-on");
        if (cuenta) cuenta.textContent = String(n + 1).padStart(2, "0");
      }, 5600);
    });
  };


  /* ══ LA RESERVA EN LA CABECERA ═════════════════════════════
     La portada guarda la capsula hasta dejar el cine porque arriba
     ya hay un mostrador. Una interior no lo tiene: si la capsula
     espera al scroll, la unica accion de la casa no existe durante
     la primera pantalla. */
  const reserva = () => {
    const nav = $(".nav");
    if (nav && !$(".hero") && ($(".hero-page") || $(".statement#opening")))
      nav.classList.add("nav-siempre");
  };


  /* ══ LA ENTRADA DE LA TIRA ═════════════════════════════════
     Las fichas entran escalonadas cuando la tira asoma, y cada
     fotografia se funde cuando termina de bajar. Un bloque que
     aparece entero de golpe se lee como una carga; una tira que se
     despliega se lee como una tira. */
  const entrada = () => {
    $$(".roomreel").forEach(tira => {
      const fichas = $$(".rr", tira);
      if (!fichas.length) return;

      const lista = im => {
        if (im.complete && im.naturalWidth) im.classList.add("is-ready");
        else im.addEventListener("load", () => im.classList.add("is-ready"), { once: true });
      };
      $$("img", tira).forEach(im => {
        /* Las primeras seis pesan de entrada; el resto espera a que
           haga falta. Veinticuatro fotografias a la vez es lo que
           hacia sentir lenta la carga. */
        lista(im);
      });
      fichas.forEach((f, n) => {
        const im = $("img", f);
        if (im && n >= 6) { im.loading = "lazy"; im.decoding = "async"; }
      });

      if (!("IntersectionObserver" in window)) {
        fichas.forEach(f => f.classList.add("is-in"));
        return;
      }
      const ojo = new IntersectionObserver(e => {
        e.forEach(x => {
          if (!x.isIntersecting) return;
          const n = fichas.indexOf(x.target);
          setTimeout(() => x.target.classList.add("is-in"), Math.min(n, 8) * 45);
          ojo.unobserve(x.target);
        });
      }, { rootMargin: "160px" });
      fichas.forEach(f => ojo.observe(f));
    });
  };


  const arrancar = () => {
    reserva(); visor(); filtro(); arrastre(); entrada(); deriva();
    ampliar(); mesa(); portada();
  };
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", arrancar)
    : arrancar();
})();
