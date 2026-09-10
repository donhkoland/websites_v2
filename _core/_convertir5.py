# -*- coding: utf-8 -*-
"""
Quinta pasada: las habitaciones.

Dos piezas que la v1 nombraba de una forma que en la v2 significa
otra cosa:

  1 · LA FICHA DE HABITACION. La v1 la llamaba .wall-tile aunque
      su contenido fuera .rr-body / .rr-name / .rr-meta. En la v2
      .wall-tile es un cuadro del muro de fotografias y .rr es la
      ficha de la tira. El nombre se corrige solo dentro de la
      tira, que es donde significa eso.

  2 · EL VISOR. La v1 tenia su propio modal —.room-view— con su
      cierre, su cabecera y su cuerpo. En la v2 todos los modales
      comparten chasis: .ovl. Se reescribe con ese, conservando
      los id que el motor de habitaciones espera encontrar.

    python _core/_convertir5.py bahia-vik playa-vik estancia-vik
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fichas(t):
    """.wall-tile pasa a .rr, pero solo dentro de la tira."""
    m = re.search(r'<div class="roomreel-track">(.*?)\n  </div>', t, re.S)
    if not m:
        return t
    tira = m.group(1).replace('class="wall-tile"', 'class="rr"')
    return t[:m.start(1)] + tira + t[m.end(1):]


def visor(t, casa):
    """El modal de la v1 pasa al chasis de la v2."""
    m = re.search(r'<div class="room-view" id="roomView".*?\n</div>', t, re.S)
    if not m:
        return t
    viejo = m.group(0)
    specs = re.search(r'<div class="specbar"[^>]*>(.*?)</div>\s*</div>', viejo, re.S)
    filas = ""
    if specs:
        for k, v in re.findall(r'<div><span>(.*?)</span><span>(.*?)</span></div>', specs.group(1)):
            filas += f'\n        <div><span class="k">{k}</span><span class="v">{v}</span></div>'

    nuevo = f'''<div class="ovl" id="roomView" role="dialog" aria-modal="true" aria-labelledby="roomName">
  <div class="ovl-panel">
    <div class="ovl-bar">
      <span class="ovl-tag" id="roomMeta"></span>
      <button class="ovl-close" type="button" data-room-close>Close</button>
    </div>

    <div class="ovl-media" id="roomShots"></div>

    <div class="ovl-body">
      <h2 class="ovl-mark" id="roomName"></h2>
      <p class="ovl-lede ed-read" id="roomCopy"></p>

      <div class="ovl-facts">{filas}
      </div>

      <div class="ovl-actions">
        <a class="pill solid" href="#book"><span>Book this room</span><span class="arw">&#8594;</span></a>
        <a class="link" href="#contact"><span>Ask a Journey Designer</span><span class="arw">&#8594;</span></a>
      </div>

      <!-- Las otras tomas de la habitacion. El motor las rellena;
           el muro ya sabe como colocarlas. -->
      <div class="wall" id="roomThumbs" style="margin-top:2.4rem"></div>

      <p class="ed-cap">Every room at {casa} was commissioned, not decorated &mdash; the artist, the material and the position of the bed were decided together.</p>
    </div>
  </div>
</div>'''
    return t.replace(viejo, nuevo)


CASAS = {"bahia-vik": "Bahía VIK",
         "playa-vik": "Playa VIK",
         "estancia-vik": "Estancia VIK"}

if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        p = os.path.join(RAIZ, sitio, "index.html")
        t = io.open(p, encoding="utf-8").read()
        t = fichas(t)
        t = visor(t, CASAS.get(sitio, "VIK"))
        io.open(p, "w", encoding="utf-8", newline="").write(t)
        print(f"  {sitio}")
