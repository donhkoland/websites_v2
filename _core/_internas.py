# -*- coding: utf-8 -*-
"""
Genera la ficha interna de cada habitacion.

Una por cuarto, con la estructura de Galleria VIK escrita en la
lengua de la v2. Se generan y no se escriben a mano por la misma
razon que la guia de modulos se recorta en vivo: veinticuatro
paginas mantenidas a mano son veinticuatro paginas que se
desincronizan.

Todo el contenido sale de _cuartos.py y del marcado de la casa, que
es donde ya vive. Aqui solo se compone.

    python _core/_internas.py
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _cuartos import CUARTOS, clave          # noqa: E402

CASA   = os.path.join(RAIZ, "bahia-vik")
DESTINO = os.path.join(CASA, "cuartos")
os.makedirs(DESTINO, exist_ok=True)

# Las tomas viven aplanadas y con su ancho — pero no todas existen
# en los tres anchos: hay cuartos con una sola version. Se pide el
# que se quiere y se baja al que haya, para no escribir en la
# pagina una ruta que va a dar 404.
T = os.path.join(RAIZ, "_assets", "img", "t")

def foto(ruta, ancho):
    base = ruta.replace("/", "__").replace(".jpg", "")
    for a in [ancho] + [x for x in (1600, 900, 480) if x != ancho]:
        if os.path.isfile(os.path.join(T, f"{base}-w{a}.jpg")):
            return f"../../_assets/img/t/{base}-w{a}.jpg"
    return ""


def existe(ruta):
    base = ruta.replace("/", "__").replace(".jpg", "")
    return any(os.path.isfile(os.path.join(T, f"{base}-w{a}.jpg"))
               for a in (1600, 900, 480))

# Que hay en la casa, igual para las veinticuatro.
DOTACION = [
 ("Bed",        "King, or two singles on request. Linen changed daily."),
 ("Bath",       "Walk-in shower, VIK amenities, robes and slippers."),
 ("Air",        "Individually controlled heating and cooling."),
 ("Terrace",    "Private, furnished, facing the bay or the dune."),
 ("Connection", "Wi-Fi throughout, and it works in the dunes too."),
 ("Minibar",    "Stocked with Uruguayan wine, water and fruit. Included."),
 ("Service",    "Turndown at dusk, and a Journey Designer for the stay."),
]

# El disco decide cuantas tomas tiene cada cuarto. Se piden las
# tres y se quedan las que estan: escribir un hueco en la pagina
# para que el navegador lo descubra es peor que no escribirlo.
def tomas(ruta):
    hay = [ruta.replace("-01.jpg", f"-0{n}.jpg") for n in (1, 2, 3)]
    hay = [r for r in hay if existe(r)]
    # La portada nunca queda vacia: si solo hay una, se repite.
    while len(hay) < 3:
        hay.append(hay[0] if hay else ruta)
    return hay


def cuantas(ruta):
    return len({r for r in [ruta.replace("-01.jpg", f"-0{n}.jpg") for n in (1, 2, 3)]
                if existe(r)})


def vecinas(nombre, cat):
    """Tres del mismo tipo, empezando por la siguiente."""
    mismas = [k for k, v in CUARTOS.items() if CATS[k] == cat]
    i = mismas.index(nombre)
    return [mismas[(i + n) % len(mismas)] for n in (1, 2, 3)]


# El tipo de cada cuarto se lee del marcado de la casa, que es la
# fuente: si manana una suite pasa a bungalow, se cambia alli.
fuente = io.open(os.path.join(CASA, "index.html"), encoding="utf-8").read()
CATS, IMGS = {}, {}
for m in re.finditer(r'<a class="rr"[^>]*?data-cat="([^"]*)"[^>]*?'
                     r'data-img="([^"]*)"[^>]*?data-name="([^"]*)"', fuente, re.S):
    CATS[m.group(3)] = m.group(1)
    IMGS[m.group(3)] = m.group(2)


PLANTILLA = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#F8F8F0">
<meta name="author" content="Nicolás Castillo">
<meta name="designer" content="Nicolás Castillo · @donhkoland">
<meta name="copyright" content="VIK Retreats">
<title>{nombre} · Bahía VIK</title>
<meta name="description" content="{breve}">
<meta property="og:type" content="website">
<meta property="og:title" content="{nombre} · Bahía VIK">
<meta property="og:image" content="{og}">
<link rel="stylesheet" href="../../_core/leaflet.min.css">
<link rel="stylesheet" href="../../_core/vik-v2.min.css?v=1">
<link rel="stylesheet" href="../../_core/vik-v2-lib.min.css?v=2">
</head>

<!--
  ══════════════════════════════════════════════════════════════
  BAHIA VIK · {mayus}
  Generada por _core/_internas.py desde el marcado de la casa. No
  se edita a mano: se edita _cuartos.py y se vuelve a generar.
  ══════════════════════════════════════════════════════════════
-->

<body>

<div data-vik-chrome data-page="stay" data-tag="Bahía VIK" data-logo="bahia"></div>

<main id="top">

  <!-- ══ LA PORTADA DE LA FICHA ═══════════════════════════════
       Una grande y las otras al lado. Debajo, el recuento en mono
       con su filete: decir cuantas hay es informacion; una
       capsula flotando sobre la foto es adorno.               -->
  <section class="sec" style="padding-top:calc(var(--nav-h) + clamp(2rem,4vw,3.5rem))">
    <nav class="crumb r" aria-label="Breadcrumb">
      <a href="../../vik-retreats/">VIK Retreats</a><span class="sep">/</span>
      <a href="../../vik-jose-ignacio/">José Ignacio</a><span class="sep">/</span>
      <a href="../">Bahía VIK</a><span class="sep">/</span>
      <span aria-current="page">{nombre}</span>
    </nav>

    <div class="r d1" style="margin-top:clamp(1.6rem,3vw,2.4rem)">
      <div class="ghero">
        <a class="ghero__main" href="{g1}" data-ampliar><img src="{g1}" alt="{nombre}"></a>
        <div class="ghero__strip">
          <a class="ghero__thumb" href="{g2}" data-ampliar><img src="{t2}" alt="" loading="lazy"></a>
          <a class="ghero__thumb" href="{g3}" data-ampliar><img src="{t3}" alt="" loading="lazy"></a>
          <a class="ghero__thumb" href="{g1}" data-ampliar><img src="{t1}" alt="" loading="lazy"></a>
        </div>
      </div>
      <div class="ghero-foot">
        <span>{vistas} &middot; {nombre} &middot; Bahía VIK</span>
        <span class="rule"></span>
        <a class="link" href="../#rooms"><span>All twenty-five rooms</span><span class="arw">&#8594;</span></a>
      </div>
    </div>
  </section>


  <!-- ══ LA FICHA ═════════════════════════════════════════════ -->
  <section class="sec" style="padding-top:0">
    <div class="roomdoc r d1">

      <div class="roomdoc-main">
        <header class="room-head">
          <span class="room-cat">{cat} &middot; Bahía VIK</span>
          <h1 class="room-t">{nombre}</h1>
          <p class="room-lede">{largo}</p>
        </header>

        <div class="specbar" style="margin-top:clamp(1.6rem,3vw,2.4rem)">
          <div><span class="specbar__l">Size</span><span class="specbar__v">{m2} m²</span><span class="specbar__i">Plus terrace</span></div>
          <div><span class="specbar__l">Sleeps</span><span class="specbar__v">{duerme}</span><span class="specbar__i">Extra bed on request</span></div>
          <div><span class="specbar__l">Type</span><span class="specbar__v">{cat}</span><span class="specbar__i">{sitio}</span></div>
          <div><span class="specbar__l">Outlook</span><span class="specbar__v">{vista}</span><span class="specbar__i">Playa Mansa</span></div>
          <div><span class="specbar__l">Dining</span><span class="specbar__v">Zodiaco</span><span class="specbar__i">Steps away, all day</span></div>
          <div><span class="specbar__l">Booking</span><span class="specbar__v">Direct</span><span class="specbar__i">Bookassist &middot; best rate</span></div>
        </div>

        <div class="room-sec">
          <span class="kicker">What is in it</span>
          <div class="incl" style="border-top:0">
{dotacion}
          </div>
        </div>

        <div class="room-sec">
          <span class="kicker">Children</span>
          <p class="ed-read" style="margin-top:1.2rem;font-size:.95rem;line-height:1.8;font-weight:300;color:var(--i-55)">Children of every age are welcome at Bahía. Cots are free and set up before you arrive; an extra bed for a child under twelve is charged at half the adult rate. The pools are unfenced and shallow at one end, and the bay stays flat until midday.</p>
        </div>
      </div>

      <!-- El mostrador se queda mientras se lee: es lo que
           convierte una ficha en algo que se puede cerrar. -->
      <aside class="roomdoc-aside">
        <p class="ask">Check {nombre} <em>for your dates</em>.</p>
        <form class="roomdoc-form" data-booking>
          <div class="f"><label for="rIn">Arrival</label><input id="rIn" name="checkin" type="date"></div>
          <div class="f"><label for="rOut">Departure</label><input id="rOut" name="checkout" type="date"></div>
          <div class="f"><label for="rAd">Guests</label>
            <select id="rAd" name="adults">
              <option value="1">1 Adult</option>
              <option value="2" selected>2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </div>
          <input type="hidden" name="property" value="bahia">
          <button class="pill solid" type="submit"><span>Check availability</span><span class="arw">&#8594;</span></button>
        </form>
        <p class="roomdoc-note">Direct rate &middot; free cancellation*<br>Journey Designer included<br>guestexperience@vikretreats.com</p>
      </aside>

    </div>
  </section>


  <!-- ══ LAS VECINAS ══════════════════════════════════════════ -->
  <section class="sec paper tight">
    <div class="rail-head r">
      <div>
        <span class="kicker">Also at Bahía</span>
        <h2 class="h2 lines" style="margin-top:1.5rem">Other <em>{plural}</em>.</h2>
      </div>
      <span class="rail-hint">Drag to explore</span>
    </div>
    <div class="rail" data-rail="auto" data-rail-speed="0.28">
{vecinas}
    </div>
  </section>

</main>

<!-- La ampliacion. Mismo chasis que el visor de la casa. -->
<div class="ovl" id="lightbox" role="dialog" aria-modal="true" aria-label="Photograph">
  <div class="ovl-panel" data-ground="dark">
    <div class="ovl-bar">
      <span class="ovl-tag">{nombre} &middot; Bahía VIK</span>
      <button class="ovl-close" type="button" data-ovl-close>Close</button>
    </div>
    <div class="ovl-media" id="lightboxShot"></div>
  </div>
</div>

<div data-vik-footer></div>

<script>window.VIK_BASE = "../../_assets/"; window.VIK_V2_BASE = "../../assets/";</script>
<script src="../../_core/lenis.min.js"></script>
<script src="../../_core/vik-chrome-v2.js?v=1"></script>
<script src="../../_core/vik-v2.min.js?v=1"></script>
<script src="../../_core/vik-v2-lib.min.js?v=1"></script>
</body>
</html>
"""

hechas = 0
for nombre, (m2, duerme, breve, largo) in CUARTOS.items():
    cat = CATS.get(nombre, "suite")
    img = IMGS.get(nombre, "rooms/bahia/burgos-01.jpg")
    tres = tomas(img)
    n = cuantas(img)
    vistas = {1: "One view", 2: "Two views", 3: "Three views"}.get(n, f"{n} views")

    veci = ""
    for v in vecinas(nombre, cat):
        vm2, vdu, vbreve, _ = CUARTOS[v]
        veci += f"""      <a class="card" href="{clave(v)}.html">
        <span class="card-fig"><img src="{foto(IMGS[v], 900)}" alt="{v}" loading="lazy"></span>
        <span class="card-body">
          <span class="card-loc">{cat.capitalize()} &middot; {vm2} m² &middot; sleeps {vdu}</span>
          <span class="card-name lw">{v}</span>
          <p>{vbreve}</p>
        </span>
      </a>\n"""

    dot = ""
    for k, v in DOTACION:
        dot += (f'            <div class="incl__row ed"><span class="ed-n"></span>'
                f'<span class="n">{k}</span><span class="d">{v}</span></div>\n')

    io.open(os.path.join(DESTINO, clave(nombre) + ".html"), "w",
            encoding="utf-8", newline="").write(PLANTILLA.format(
        nombre=nombre, mayus=nombre.upper(), breve=breve, largo=largo, vistas=vistas,
        cat=cat.capitalize(), m2=m2, duerme="Two" if duerme == 2 else "Three",
        sitio="Main building" if cat == "suite" else "In the dunes",
        vista="The bay" if cat == "suite" else "The dune",
        plural="suites" if cat == "suite" else "bungalows",
        og=foto(img, 1600).replace("../../", "../../"),
        g1=foto(tres[0], 1600), g2=foto(tres[1], 1600), g3=foto(tres[2], 1600),
        t1=foto(tres[0], 480), t2=foto(tres[1], 480), t3=foto(tres[2], 480),
        dotacion=dot.rstrip(), vecinas=veci.rstrip()))
    hechas += 1

print(f"{hechas} fichas en bahia-vik/cuartos/")
