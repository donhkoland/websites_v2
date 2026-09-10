# -*- coding: utf-8 -*-
"""
Segunda pasada: lo que la primera no podia hacer con nombres.

La primera cambiaba atributos enteros —class="section"— y por eso
se le escapaba todo lo que venia acompanado: class="card-grid r d1"
no es class="card-grid". Aqui se sustituye TOKEN a TOKEN dentro de
cada atributo, que es como hay que hacerlo.

Y se rearman los dos bloques que cambian de forma y no solo de
nombre: la cabecera de seccion y el mostrador de reserva.

    python _core/_convertir2.py bahia-vik playa-vik ...
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Los nombres, token a token ─────────────────────────────────
TOKEN = {
    "section":        "sec",
    "section-head":   "head",
    "section-eyebrow":"kicker",
    "section-title":  "h2 lines",
    "section-lead":   "lead",
    "ui-label":       "kicker",
    "text-vik":       "lw",
    "btn-solid":      "pill solid",
    "btn-outline":    "pill light",
    "btn-line":       "link",
    "gallery-card":   "card",
    "card-grid":      "mosaic",
    "index-list":     "index",
    "split-facts":    "specbar",
    "pillars":        "mosaic",
    "pillar":         "vcard",
    "closing":        "close",
    "closing-lines":  "close-lines",
    "closing-title":  "h2 close-t lines",
    "closing-actions":"close-actions",
    "closing-note":   "close-note",
    "bk-field":       "f",
    "bk-submit":      "pill solid",
    "enq-side":       "r-main",
    "enq-pair":       "counter-row",
    "hf-actions":     "hp-actions",
    # La portada a sangre de la v1 es el manifiesto de la v2: mismo
    # papel —cine detras, una frase encima— y ya existe en el
    # sistema, asi que no hace falta una segunda pieza igual.
    "hero-film":      "statement",
    "hf-media":       "statement-media",
    "hf-grid":        "statement-in",
    "hf-eyebrow":     "kicker bare",
    "hf-title":       "statement-t lines",
    "hf-desc":        "statement-d",
    # La banda a sangre con pasos encima es .film + .season: el
    # calendario del sistema, que ademas marca solo donde estamos.
    "band":           "film",
    "band-bg":        "film-bg",
    "band-inner":     "film-in",
    "band-title":     "film-t lines",
    "band-desc":      "film-d",
    "band-steps":     "season",
    "band-step":      "season-row",
    "band-ov":        "",
    "band-head":      "",
    # Las tiras. La v1 tenia tres nombres para la misma pieza.
    "reel-wide":      "rail",
    "reel-card":      "card",
    "reel-cap":       "card-body",
    "prop-rail":      "rail",
    "prop-rail-head": "rail-head",
    "prop-rail-hint": "rail-hint",
    "prop":           "card",
    "prop-body":      "card-body",
    "prop-loc":       "card-loc",
    "prop-name":      "card-name lw",
    "prop-desc":      "",
    "prop-tags":      "tags",
    "tag":            "",
    "r-fade": "", "c4": "", "c5": "", "flush": "",
    # Restos que ya no significan nada en la v2.
    "site-shell": "", "aligned": "", "standalone": "", "left": "",
    "bone": "paper", "c3": "", "alt": "", "media": "", "vik": "",
}

def nombres(t):
    def uno(m):
        vistos, salida = set(), []
        for tk in m.group(1).split():
            nuevo = TOKEN.get(tk, tk)
            for p in nuevo.split():
                if p and p not in vistos:
                    vistos.add(p); salida.append(p)
        return f'class="{" ".join(salida)}"' if salida else ""
    return re.sub(r'class="([^"]*)"', uno, t)


# ── La cabecera de seccion ─────────────────────────────────────
# Dos divs sin nombre pasan a llamarse: la reja de la v2 los coloca
# por nombre, no por posicion.
def cabecera(t):
    return re.sub(
        r'<div class="head([^"]*)"[^>]*>\s*<div>(.*?)</div>\s*<div>(.*?)</div>\s*</div>',
        lambda m: (f'<div class="head{m.group(1)}">\n'
                   f'      <div class="h-label">{m.group(2).strip()}</div>\n'
                   f'      <div class="h-main">{m.group(3).strip()}</div>\n'
                   f'    </div>'),
        t, flags=re.S)


# ── El mostrador ───────────────────────────────────────────────
# La v1 tenia su propia seccion de reserva con fondo fotografico.
# La v2 usa el mismo mostrador en las tres apariciones —portada,
# barra del pie y bloque de reserva— asi que aqui se reemplaza por
# ese, con los campos que la pagina ya traia.
def mostrador(t):
    m = re.search(r'<section class="booking"([^>]*)>(.*?)</section>', t, re.S)
    if not m:
        return t
    cuerpo = m.group(2)
    titulo = re.search(r'<h2 class="booking-title">(.*?)</h2>', cuerpo, re.S)
    nota   = re.search(r'<p class="booking-note">(.*?)</p>', cuerpo, re.S)
    prop   = re.search(r'<select id="bkProp"[^>]*>(.*?)</select>', cuerpo, re.S)
    alts   = re.findall(r'<a class="link"[^>]*href="([^"]*)"[^>]*>\s*<span>(.*?)</span>', cuerpo, re.S)

    opciones = prop.group(1).strip() if prop else ""
    enlaces = "\n      ".join(
        f'<a class="pill" href="{h}"><span>{txt}</span><span class="arw">&#8594;</span></a>'
        for h, txt in alts) or ""

    nuevo = f'''<section class="sec canvas" id="book">
    <div class="reserve-grid r">
      <div class="r-main">
        <span class="kicker">Book your stay</span>
        <h2 class="h2 reserve-t lines">{titulo.group(1).strip() if titulo else "Your stay."}</h2>
      </div>
      <p class="r-note spec">{nota.group(1).strip() if nota else ""}</p>
    </div>

    <form class="counter paper r d1" data-booking>
      <span class="counter-t">The search</span>
      <div class="counter-row">
        <div class="f">
          <label for="bkIn">Arrival</label>
          <input id="bkIn" name="checkin" type="date">
        </div>
        <span class="f-arw" aria-hidden="true">&#8594;</span>
        <div class="f">
          <label for="bkOut">Departure</label>
          <input id="bkOut" name="checkout" type="date">
        </div>
        <span class="f-sep" aria-hidden="true"></span>
        <div class="f">
          <label for="bkProp">Retreat</label>
          <select id="bkProp" name="property">
            {opciones}
          </select>
        </div>
        <span class="f-sep" aria-hidden="true"></span>
        <div class="f">
          <label for="bkAd">Guests</label>
          <select id="bkAd" name="adults">
            <option value="1">1 Adult</option>
            <option value="2" selected>2 Adults</option>
            <option value="3">3 Adults</option>
            <option value="4">4 Adults</option>
            <option value="6">6 Adults</option>
            <option value="8">Group &middot; 8+</option>
          </select>
        </div>
        <button class="pill solid" type="submit"><span>Check availability</span><span class="arw">&#8594;</span></button>
      </div>
      <div class="counter-note">
        <span>Direct rate</span>
        <span>Free cancellation*</span>
        <span>Journey Designer included</span>
      </div>
    </form>

    <div class="reserve-alts r d2">
      {enlaces}
    </div>
  </section>'''
    return t[:m.start()] + nuevo + t[m.end():]


# ── Las piezas chicas ──────────────────────────────────────────
# La v1 nombraba con una letra dentro de cada bloque: .i el folio
# de un pilar, .n y .m las dos lineas de un pie, .t la franja de un
# paso. La v2 las nombra por lo que son, y cada una depende del
# bloque que la contiene — por eso no entran en el mapa de tokens.
def piezas(t):
    # El pie de una lamina: sitio arriba, nombre abajo.
    t = re.sub(r'(<span class="card-body">\s*)<span class="n">',
               lambda m: m.group(1) + '<span class="card-loc">', t)
    t = re.sub(r'(<figcaption class="card-body">\s*)<span class="n">',
               lambda m: m.group(1) + '<span class="card-loc">', t)
    t = t.replace('<span class="m">', '<span class="card-name lw">')
    # El folio de una ficha del mosaico.
    t = re.sub(r'(<article class="vcard"[^>]*>)<span class="i">',
               lambda m: m.group(1) + '<span class="vcard-when">', t)
    # La franja horaria de un paso del calendario.
    t = re.sub(r'(<div class="season-row"[^>]*>)<span class="t">',
               lambda m: m.group(1) + '<span class="w">', t)
    return t


def rieles(t):
    """Una tira sin data-rail no deriva: el motor la busca por ese
    atributo. En la v1 el movimiento vivia en la hoja."""
    def uno(m):
        return '<div class="rail' + m.group(1) + '" data-rail="auto" data-rail-speed="0.32"'
    return re.sub(r'<div class="rail([^"]*)"(?![^>]*data-rail)', uno, t)


def convertir(ruta):
    t = io.open(ruta, encoding="utf-8").read()
    t = mostrador(t)      # antes de renombrar: busca los nombres viejos
    t = nombres(t)
    t = cabecera(t)
    t = rieles(t)
    t = piezas(t)
    t = re.sub(r'\s+class=""', "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    io.open(ruta, "w", encoding="utf-8", newline="").write(t)


if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        convertir(os.path.join(RAIZ, sitio, "index.html"))
        print(f"  {sitio}")
