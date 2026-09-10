# -*- coding: utf-8 -*-
"""
Arma la biblioteca de modulos de la v2.

Dos origenes, un solo formato de ficha:

  M · el sistema en produccion. Cada demo se recorta en vivo de
      vik-jose-ignacio/index.html, que es donde el modulo trabaja.
      Asi la guia no puede desincronizarse: si el modulo cambia
      alli, se vuelve a correr esto y ya.

  L · la biblioteca heredada. Modulos que la v1 tenia y la v2
      todavia no usa en ninguna pagina — modales, habitaciones,
      consulta, ficha tecnica. Su marcado vive en _lib-demos.html
      y su hoja en _core/vik-v2-lib.css, aparte del sistema
      aprobado para no pisarlo.

Las notas de cada modulo van al HTML como comentario, no a la
pantalla: quien lee la guia mira el modulo; quien necesita la
razon abre el codigo, que es donde vive el resto del sistema.

    python _build-sg.py
"""
import io, os, re
from html import escape

RAIZ   = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(RAIZ, "..", "vik-jose-ignacio", "index.html")
DEMOS  = os.path.join(RAIZ, "_lib-demos.html")

src = io.open(FUENTE, encoding="utf-8").read()

# Los assets viven en la carpeta del sitio, no en la de la guia.
def rutas(t):
    t = t.replace('"assets/', '"../vik-jose-ignacio/assets/')
    t = t.replace("('assets/", "('../vik-jose-ignacio/assets/")
    t = t.replace("(assets/",  "(../vik-jose-ignacio/assets/")
    return t

def recorta(marca):
    cierre = "</div>" if marca.startswith("<div") else "</section>"
    i = src.index(marca)
    return rutas(src[i:src.index(cierre, i) + len(cierre)])

# Los demos de la biblioteca, partidos por su marca.
lib = {}
crudo = io.open(DEMOS, encoding="utf-8").read()
for bloque in re.split(r"##(L\d+)##", crudo)[1:]:
    if re.fullmatch(r"L\d+", bloque):
        clave = bloque
    else:
        lib[clave] = bloque.strip()


# ── EN PRODUCCION ──────────────────────────────────────────────
# id · nombre · origen · por que existe · marca de recorte
SISTEMA = [
 ("M01", "Bar, menu and booking strip", "vik-chrome-v2.js · injected into all eighteen",
  "One file draws the top of every site in the system. The bar goes solid once it leaves the cover; the index drops out the moment there is no width for it and the burger appears at the same breakpoint, so no window is ever left without a way to navigate. The booking strip retires itself when the reservation block or the footer come into view — asking the same question twice in one screen is one time too many.", None),

 ("M02", "Cover with the counter", '.hero',
  "Full-bleed film and one box on top of it. Underneath the clip sits a photograph that never goes out: between one film and the next what you see is the still of the destination you picked, never the empty element. That gap was the grey box, and this is what closes it.", '<section class="hero"'),

 ("M03", "Live ribbon", '.strip[data-live]',
  "Six figures divided by hairlines. Real weather from Open-Meteo, no key. Six numbers in two columns would be three rows and a block of table; in a ribbon they read as what they are — a bulletin, running left to right.", '<section class="strip"'),

 ("M04", "The collage", '.collage · Destination',
  "Three plates at deliberately different sizes with the copy between them. On a narrow screen it stops being a collage and becomes a sequence you scroll sideways: stacked, it was twelve hundred pixels of scrolling for three photographs.", '<section class="sec" id="destination"'),

 ("M05", "Ecosystem rail", '.rail[data-rail="auto"] + .card',
  "Seven cards with no gap between them. Separated they read as seven loose objects; touching, as a contact strip — which is what they are, one destination in seven frames. It drifts on its own, takes the mouse and takes the finger, and since V2 a vertical gesture passes straight through instead of smearing it sideways.", '<section class="sec paper tight" id="retreats"'),

 ("M06", "The statement", '.statement',
  "The only block on the page centred on both axes, and that symmetry is what turns it into a declaration. It arrives after the reader has seen the doors, so the line has something to refer back to.", '<section class="statement"'),

 ("M07", "The chooser", '.chooser + .ch',
  "Three full-bleed plates, touching, with no rule between them. The decision is one image cut in three, not three separate cards. On a phone it becomes a strip with gentle snapping — proximity, never mandatory, so a thumb that hesitates is not trapped.", '<div class="chooser'),

 ("M08", "Filtered mosaic", '.mosaic + .vcard + [data-mosaic-filter]',
  "Four slots, always. With no filter, four experiences; with one, three and the way out. The two wide slots are the ends of the row and they are the ones that carry film — four moving cards in a block of four is not a live module, it is noise.", '<section class="sec canvas" id="experiences"'),

 ("M09", "The manifesto index", '.gallery + .gx + .gallery-stage',
  "Six entries and one sticky plate that follows whichever is being read. Below 900 the plate is not drawn at all and each entry carries its own image underneath — otherwise the engine kept loading film for an element the CSS had hidden.", '<section class="sec" id="pillars"'),

 ("M10", "Full-bleed band with calendar", '.film + .season[data-season-table]',
  "Film across the full width with the year on top of it. The engine marks the season you are actually in and counts the days to the next one, which is the question the module exists to answer.", '<section class="sec canvas" id="seasons"'),

 ("M11", "The index", '.index + .index-row',
  "Rows with a number, a name and a fact. With a mouse a thumbnail trails the cursor across the page; in strip form the photograph moves inside the card and the booking link rests on its base.", '<section class="sec" id="dining"'),

 ("M12", "The week", '.agenda + .ev',
  "Seven days in a black strip with no seam. The day names and dates are written by the destination's own clock, and the card nearest the current hour is marked. It refreshes itself every half hour.", '<section class="agenda"'),

 ("M13", "Live map", '.map-section + .map-full',
  "Map and satellite, with the legend as a bottom bar. Leaflet anchors its credit to the foot of the map, so the map is stretched below the crop and the signature falls outside the frame — it is never hidden, it lives in the page footer instead.", '<section class="sec map-section"'),

 ("M14", "Press", '.logo-rail + .quotes',
  "A row of marks that drifts on its own. On a phone the three quotes go and the row stays: a seal reads at a glance, three long paragraphs between the map and the booking form are a stop.", '<section class="sec" id="press"'),

 ("M15", "The reservation", '.reserve-grid + .counter',
  "The same engine as the counter on the cover and the strip at the foot: same fields, same names, one piece of booking logic rather than three.", '<section class="sec canvas" id="book"'),

 ("M16", "The closing", '.club + .club-in',
  "The last door on the page, with its own footage. It is the only one that leads outside the hotel, which is why it goes at the end rather than repeating the question the booking strip already asked.", '<section class="sec club-sec"'),
]


# ── BIBLIOTECA HEREDADA ────────────────────────────────────────
# Modulos de la v1 traidos al vocabulario nuevo. Hoja aparte.
BIBLIOTECA = [
 ("L01", "Interior page cover", '.hero-page · vik-v2-lib.css',
  "The home cover carries the counter; an inner page does not. Here the place takes the screen and one left-hand column sits on it. Left-aligned rather than centred, because an interior page is a chapter and a chapter starts at the margin. The slide sequence is optional — with one image the module behaves identically and the dots are not drawn."),

 ("L02", "Principles", '.principles + .principle',
  "Rows of large type divided by hairlines. Each one can carry data-hover-img and the system thumbnail trails it — the same mechanism as the index rather than a second component doing the same job."),

 ("L03", "The overlay", '.ovl · every modal in the house',
  "One chassis for every overlay: the case for a retreat, a room view, checkout, the gallery. What goes inside changes; this does not. No radius and no shadow — a modal with rounded corners and a long shadow is an application window, and this is a sheet laid over the page, which is why it comes up from the bottom and takes the full width."),

 ("L04", "Room reel", '.roomreel + .rr',
  "Every room at full height, side by side, with its filter bar above. Drag it; release on one and the overlay opens on that room. The cards touch like the ecosystem rail because they are the same house in different frames, not a product catalogue."),

 ("L05", "The wall", '.wall + .wall-tile',
  "The photograph grid for one room, with no gaps. One large piece and the rest around it: if they all measured the same it would be a contact sheet, and this is a report."),

 ("L06", "The accordion", '.accordion + .acc-item',
  "Questions, policies and menus. A hairline above each row and nothing else — no box, no fill, no rotating chevron. The sign is a cross that becomes a dash, which is what the row itself does."),

 ("L07", "Enquiry", '.enquiry + .enq-form',
  "A statement and the direct lines on the left; the questions on the right as ruled lines rather than boxes. A form made of boxes looks like paperwork; made of rules it looks like a letter, which is what it is."),

 ("L08", "Split", '.split · reversible with .rev',
  "One photograph and one argument, fifty-fifty. The simplest module in the system and the most used: About, Location, the introduction to a restaurant. It reverses with a class and no change to the markup."),

 ("L09", "Pull quote", '.pull-quote',
  "One line in Selva, centred, with air on all four sides. No quotation marks — the typeface already says it is a voice."),

 ("L10", "Sub-navigation", '.subnav',
  "On a long property page, the index of that page. It sticks under the main bar and marks where you are. The position marker is a one-pixel rule under the name rather than a pill: in a bar built of hairlines, a pill shouts."),

 ("L11", "Gallery cover", '.ghero',
  "One large and three beside it. The fourth carries the count and opens the overlay with everything: saying “+24” is more honest than letting four photographs imply the set is four."),

 ("L12", "Specification bar", '.specbar',
  "Six facts with the label above the value. It is the live ribbon without the live data — same grid, same hairline, same type roles, so a room page and the cover speak with one voice."),

 ("L13", "What is included", '.incl',
  "Rows, not bullets. Each line is a name on the left and the detail on the right with the rule joining them, so it reads like an account — which is exactly what the reader is doing at that point in the page."),

 ("L14", "Artist cards", '.artists + .artist-card',
  "The work leads: a 4:5 frame with the name and the discipline underneath. The name in serif, the discipline in mono, because the discipline is a fact and not a title."),

 ("L15", "Breadcrumb", '.crumb',
  "Three levels with the separator in mono. It marks the depth of the system, which is exactly what a visitor who arrived through a single room has no other way of knowing."),

 ("L16", "Services", '.svc-grid + .svc',
  "A grid of what the house does, with no photographs. Label, name, one line. When the list is long, a picture per row turns it into a catalogue; without them it reads straight through."),
]


fichas, toc = [], []

def ficha(mid, nombre, fuente, nota, demo):
    # Fila de indice: folio, nombre, guia y origen. La guia es la
    # linea que corre de un extremo al otro — sin ella el ojo
    # pierde el renglon entre el nombre y su fuente.
    toc.append(f'<a href="#{mid.lower()}">'
               f'<span class="n">{mid}</span>'
               f'<span class="l">{escape(nombre)}</span>'
               f'<span class="g"></span>'
               f'<span class="s">{escape(fuente)}</span></a>')
    razon = re.sub(r"--", "––", nota)      # nunca cerrar el comentario
    fichas.append(f'''
  <div class="sg-spec" id="{mid.lower()}">
    <span class="id">{mid}</span>
    <span class="nm">{escape(nombre)}</span>
    <span class="src">{escape(fuente)}</span>
  </div>
  <!-- {mid} · {escape(nombre)}
       {razon} -->
{demo}
''')

for mid, nombre, fuente, nota, marca in SISTEMA:
    demo = (recorta(marca) if marca else
            '<p class="sg-empty">Injected by <code>vik-chrome-v2.js</code>. '
            'It is the top and the foot of this very page, which is the proof '
            'that it works.</p>')
    ficha(mid, nombre, fuente, nota, demo)

for mid, nombre, fuente, nota in BIBLIOTECA:
    ficha(mid, nombre, fuente, nota, lib.get(mid,
          '<p class="sg-empty">No demo found in <code>_lib-demos.html</code>.</p>'))

io.open(os.path.join(RAIZ, "_modulos.html"), "w", encoding="utf-8", newline="").write(
    '<!-- INDICE -->\n<nav class="sg-toc">\n' + "\n".join(toc) + "\n</nav>\n"
    '<!-- FICHAS -->\n' + "\n".join(fichas))

print(f"{len(SISTEMA)} en produccion + {len(BIBLIOTECA)} de biblioteca = "
      f"{len(SISTEMA)+len(BIBLIOTECA)} modulos · "
      f"{sum(len(f) for f in fichas)//1024} KB")
