# -*- coding: utf-8 -*-
"""
Tercera pasada: lo editorial, que es lo que ninguna regla generica
puede hacer sola.

Tres cosas:

  1 · LA PORTADA RECUPERA SU TITULAR.
      La v1 apoyaba la portada en un logotipo y dejaba el <h1> en
      sr-only. Sin logotipo eso es una fotografia con un parrafo
      encima: la pagina no dice donde estas. Aqui el titular vuelve
      a ser visible, en la columna larga, con el rotulo colgando
      en el margen — que es la regla 1 de la biblioteca.

  2 · LA TIRA VIVA VUELVE A LATIR.
      La v1 la marcaba con data-live-ribbon; el motor de la v2
      busca .strip[data-live]. Sin esto la tira se queda con los
      guiones puestos para siempre.

  3 · LA SUB-BARRA GANA SU FILETE.
      El nombre de la casa se separa del indice con un filete que
      ocupa el hueco sobrante. Es lo que la hace cabecera de
      publicacion en vez de pestanas.

    python _core/_convertir3.py
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# sitio · rotulo del margen · titular · pie de la lamina
CASAS = {
 "bahia-vik": (
   "Bahía VIK<br>Retreat 03",
   "Fifteen bungalows,<br>set <em>into the dunes</em>.",
   "The bungalows from the dune path, Playa Mansa"),
 "playa-vik": (
   "Playa VIK<br>Retreat 02",
   "Carlos Ott cut it<br><em>into the rock</em>.",
   "The house on the point, from the east"),
 "estancia-vik": (
   "Estancia VIK<br>Retreat 01",
   "Four thousand acres,<br>and <em>nobody on them</em>.",
   "Open country at six in the morning"),
}


def portada(t, rotulo, titular, pie):
    # El rotulo cuelga en el margen; el titular abre la columna.
    t = t.replace(
      '<div class="hp-inner ed">\n      <div class="ed-main">',
      '<div class="hp-inner ed">\n'
      f'      <div class="ed-folio"><span class="hp-kicker">{rotulo}</span></div>\n'
      '      <div class="ed-main">')

    # El titular vuelve a verse. El h1 que estaba en sr-only pasa a
    # ser el titular de verdad: una portada sin titular visible no
    # es una portada, es un fondo.
    t = re.sub(r'<h1 class="sr-only">.*?</h1>',
               f'<h1 class="hp-title">{titular}</h1>', t, flags=re.S)

    # El contador, con su pie, despues del texto y contra el canto.
    t = re.sub(r'<span class="hp-count">.*?</span>(?=<div class="hp-inner)', "", t, flags=re.S)
    t = t.replace('</div>\n  </section>\n\n  <section class="strip"',
                  '</div>\n'
                  f'    <span class="hp-count"><b>01</b> / 03 &middot; {pie}</span>\n'
                  '  </section>\n\n  <section class="strip"')
    return t


def arreglar(sitio, rotulo, titular, pie):
    p = os.path.join(RAIZ, sitio, "index.html")
    t = io.open(p, encoding="utf-8").read()

    t = portada(t, rotulo, titular, pie)

    # La tira viva: el motor busca .strip[data-live].
    t = t.replace('<section class="strip" data-live-ribbon style="--ribbon:#1E1E1E">',
                  '<section class="strip" data-live aria-label="Conditions">')
    t = t.replace('data-live-ribbon', 'data-live')

    # La sub-barra, con su filete.
    t = re.sub(r'(<span class="sn-name lw">[^<]*</span>)',
               r'\1\n      <span class="sn-rule"></span>', t)

    # Espaciados sueltos de la v1: la hoja ya los pone.
    t = t.replace(' style="margin-top:1.75rem"', "")
    t = t.replace(' style="margin-top:.75rem"', "")
    t = re.sub(r' style="padding-bottom:0"', "", t)

    io.open(p, "w", encoding="utf-8", newline="").write(t)
    print(f"  {sitio}")


if __name__ == "__main__":
    for sitio, (r, ti, pie) in CASAS.items():
        arreglar(sitio, r, ti, pie)
