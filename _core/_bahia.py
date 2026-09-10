# -*- coding: utf-8 -*-
"""
Los seis puntos de Bahia VIK.

    python _core/_bahia.py
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(RAIZ, "bahia-vik", "index.html")
t = io.open(P, encoding="utf-8").read()


# ── 5 · FUERA LA SEGUNDA BARRA ─────────────────────────────────
# No esta en el sistema aprobado. La casa ya se nombra en la barra
# principal, y dos barras pegadas una encima de otra dejan la
# primera pantalla con ochenta pixeles de navegacion.
t = re.sub(r'\s*<div class="subnav">.*?</div>\s*</div>\s*', "\n\n", t, flags=re.S)


# ── 1 · COMO SE LLEGA ──────────────────────────────────────────
# Era texto pegado sobre la pagina: cuatro pares de lineas del
# mismo cuerpo. Es una ficha de viaje y se lee como una — la
# direccion manda y ocupa el ancho, las distancias van debajo en
# columnas con filete, que es la reja de la tira viva.
viejo = re.search(r'<div class="specbar r"[^>]*>.*?</div>\s*</div>', t, re.S)
if viejo:
    t = t[:viejo.start()] + '''<div class="getting r">
      <div class="getting-top">
        <span class="ed-n">Getting here</span>
        <p class="getting-addr">Ruta&nbsp;10, km&nbsp;185 &middot; 20402 Faro de José Ignacio,<br>Maldonado, Uruguay</p>
        <a class="link getting-map" href="#location"><span>Open the map</span><span class="arw">&#8594;</span></a>
      </div>
      <div class="getting-legs">
        <div><span class="k">Punta del Este &middot; PDP</span><span class="v">40 min</span><span class="s">By road, along Ruta 10</span></div>
        <div><span class="k">Montevideo &middot; MVD</span><span class="v">2 h 10</span><span class="s">By road, or 25 min by air</span></div>
        <div><span class="k">Transfers</span><span class="v">Arranged</span><span class="s">By your Journey Designer, either way</span></div>
      </div>
    </div>''' + t[viejo.end():]


# ── 6 · LA PREVIA DE LA CASA ───────────────────────────────────
# El modulo de Destinations de la v2: laminas rectangulares de
# tamanos distintos —nunca dos iguales— y la copia de la que se
# esta mirando debajo, cambiando por fundido y no por carga.
# Primero Rooms, despues Suites & Bungalows.
cabecera = re.search(
    r'<section class="sec" id="accommodations">.*?</div>\s*</div>\s*</section>', t, re.S)
if cabecera:
    t = t[:cabecera.start()] + '''<section class="sec" id="accommodations">
    <div class="head r">
      <div class="h-label"><span class="kicker">Accommodations</span></div>
      <div class="h-main">
        <h2 class="h2 lines">Ten suites, <em>fifteen bungalows</em>.</h2>
        <p class="lead">Ten suites in the main building, each one given to an artist before it was given to a guest. Fifteen bungalows in the dunes around it, no two built from the same material.</p>
      </div>
    </div>

    <!-- La previa. Dos laminas de proporcion distinta y la copia
         de la que se mira debajo: las dos viven en el marcado, asi
         que el cambio es un fundido y no una carga. -->
    <div class="collage r d1">
      <div class="collage-figs">

        <a class="prop-fig f-a" data-prop="rooms" href="#rooms" aria-label="Rooms">
          <span class="frame clip"><img src="../_assets/img/t/bahia_cp-bahiavik-0552-scaled-w1600.jpg" alt="A suite at Bahía VIK"></span>
          <span class="vcap">Rooms &middot; Ten suites, main building</span>
        </a>

        <a class="prop-fig f-b" data-prop="bungalows" href="#rooms" aria-label="Suites and bungalows">
          <span class="frame clip"><img src="../_assets/img/t/bahia_cp-bahiavik-0562-scaled-w1600.jpg" alt="A bungalow in the dunes"></span>
          <span class="vcap">Suites &amp; Bungalows &middot; In the dunes</span>
        </a>

      </div>

      <div class="collage-copy" data-collage-copy>
        <div class="cc is-on" data-prop="rooms" data-cta="See the rooms" data-href="#rooms">
          <span class="name">Rooms</span>
          <p class="note">Ten suites on two floors of the main building, above the bay. Each was handed to a Uruguayan artist who worked in the room before anyone slept in it — the headboard, the tiles and the light are the work, not a decoration hung on it afterwards.</p>
        </div>
        <div class="cc" data-prop="bungalows" data-cta="See the bungalows" data-href="#rooms">
          <span class="name">Suites &amp; Bungalows</span>
          <p class="note">Fifteen bungalows set into the dunes around the house, each built from a different material — adobe, corten, zinc, glass, thatch, timber. Beach grass grows between them, so each keeps its own privacy while sharing the same stretch of Playa Mansa.</p>
        </div>
        <a class="link" href="#book"><span>Check availability</span></a>
      </div>

      <a class="collage-link link" href="#rooms"><span>See all twenty-five</span></a>
    </div>
  </section>''' + t[cabecera.end():]


# ── 2 · LA TIRA, SIN NUMEROS ───────────────────────────────────
# El folio sobraba: la tira se filtra y se reordena, asi que un
# numero fijo sobre la fotografia dejaba de significar nada en
# cuanto se tocaba un filtro.
t = re.sub(r'\s*<span class="rr-i">\d+</span>', "", t)
t = t.replace('<div class="roomreel" data-rooms',
              '<div class="roomreel" id="rooms" data-rooms')

io.open(P, "w", encoding="utf-8", newline="").write(t)
print("bahia-vik ·", len(t) // 1024, "KB")
for k, v in [("subnav", t.count('class="subnav"')),
             ("getting", t.count('class="getting r"')),
             ("collage", t.count('class="collage r d1"')),
             ("folios rr-i", t.count('rr-i')),
             ("prop-fig", t.count('class="prop-fig'))]:
    print(f"  {k:12s} {v}")
