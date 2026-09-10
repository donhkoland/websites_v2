# -*- coding: utf-8 -*-
"""
Sexta pasada: la navegacion del visor.

La v1 dejaba prev/next en una barra flotante suelta, fuera del
modal. Al pasar el modal al chasis de la v2 esa barra quedo
huerfana: navegaba algo que ya no la contenia.

Va donde tiene que ir — dentro de la cabecera del pliego, al lado
del rotulo — y cambia los iconos por flechas de texto y un contador
mono. En una publicacion que no usa iconos en ningun otro sitio,
dos SVG de chevron son las dos unicas piezas de interfaz.

    python _core/_convertir6.py bahia-vik playa-vik estancia-vik
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAV = '''<span class="ovl-nav">
        <button type="button" data-room-prev aria-label="Previous room">&#8592;</button>
        <span class="rn-count">01 / 01</span>
        <button type="button" data-room-next aria-label="Next room">&#8594;</button>
      </span>
      '''

for sitio in sys.argv[1:]:
    p = os.path.join(RAIZ, sitio, "index.html")
    t = io.open(p, encoding="utf-8").read()

    # Fuera la barra suelta.
    t = re.sub(r'\s*<div class="room-nav".*?</div>\s*(?=<div data-vik-footer)',
               "\n\n", t, flags=re.S)

    # Dentro de la cabecera del pliego, antes del cierre.
    t = t.replace('<button class="ovl-close" type="button" data-room-close>Close</button>',
                  NAV + '<button class="ovl-close" type="button" data-room-close>Close</button>')

    t = re.sub(r"\n{3,}", "\n\n", t)
    io.open(p, "w", encoding="utf-8", newline="").write(t)
    print(f"  {sitio}")
