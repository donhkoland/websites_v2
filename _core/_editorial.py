# -*- coding: utf-8 -*-
"""
La pasada de composicion.

Las anteriores tradujeron el vocabulario; esta arregla como estan
puestas las cosas en la pagina, que es lo que se ve roto.

  1 · DOS CABECERAS POR SECCION. La v1 abria con un rotulo y un
      titulo, y despues metia otro titulo grande dentro de la
      columna estrecha del margen. Dos titulos compiten y el
      segundo, en dos columnas, se parte en cuatro renglones. Se
      funden en una: rotulo en el margen, titulo y bajada en la
      columna larga, cuerpo debajo sobre su medida.

  2 · .vcard.film. En la v1 "film" queria decir "esta ficha lleva
      video". En la v2 .film es la banda a sangre — otra cosa
      completamente. La ficha heredaba posicion y alto de un
      modulo que no es, y salia rota. El nombre correcto ya existe:
      .film-card.

  3 · EL MOSAICO DE CUATRO. Sin .is-wide, cuatro fichas en una reja
      de tres dejan una huerfana colgando sola en la segunda fila.
      La primera y la ultima van a doble ancho: la reja cierra en
      dos filas y recupera el ritmo dos-uno / uno-dos.

  4 · .specbar DENTRO DE UNA COLUMNA. La tira de seis datos
      necesita el ancho de la pagina. Metida en una columna de
      cuatro se aplasta. Ahi va .factlist, que dice lo mismo en
      renglones.

    python _core/_editorial.py bahia-vik [sitio ...]
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cabeceras(t):
    """Dos .head seguidas dentro de una seccion se funden en una."""
    patron = re.compile(
        r'<div class="head r">\s*'
        r'<div class="h-label">(<span class="kicker">.*?</span>)</div>\s*'
        r'<div class="h-main">(<h2[^>]*>.*?</h2>)(.*?)</div>\s*</div>\s*'
        r'<div class="head r d1">\s*'
        r'<div class="h-label">(<h2[^>]*>.*?</h2>)</div>\s*'
        r'<div class="h-main">(.*?)</div>\s*</div>', re.S)

    def fundir(m):
        rotulo, t1, resto1, t2, cuerpo = m.groups()
        # El titulo largo manda; el corto baja a bajada si no habia.
        cuerpo = cuerpo.strip()
        primer = re.match(r'\s*(<p class="lead">.*?</p>)(.*)', cuerpo, re.S)
        lead, sigue = (primer.group(1), primer.group(2)) if primer else ("", cuerpo)
        return (f'<div class="head r">\n'
                f'      <div class="h-label">{rotulo}</div>\n'
                f'      <div class="h-main">\n'
                f'        {t2}\n'
                f'        {lead}\n'
                f'      </div>\n'
                f'    </div>\n\n'
                f'    <div class="ed r d1">\n'
                f'      <div class="ed-main ed-read">{sigue.strip()}</div>\n'
                f'    </div>')
    return patron.sub(fundir, t)


def fichas(t):
    # "film" en la v1 era "lleva video"; en la v2 es la banda.
    t = t.replace('class="vcard film"', 'class="vcard film-card"')
    t = t.replace('class="vcard film ', 'class="vcard film-card ')

    # Cuatro en una reja de tres: la primera y la ultima, anchas.
    def ancho(m):
        bloque = m.group(0)
        tarjetas = re.findall(r'<article class="vcard[^"]*"', bloque)
        if len(tarjetas) != 4 or "is-wide" in bloque:
            return bloque
        i = bloque.index(tarjetas[0])
        bloque = bloque[:i] + tarjetas[0].replace('class="vcard', 'class="vcard is-wide') + bloque[i + len(tarjetas[0]):]
        j = bloque.rindex(tarjetas[3])
        return bloque[:j] + tarjetas[3].replace('class="vcard', 'class="vcard is-wide') + bloque[j + len(tarjetas[3]):]
    return re.sub(r'<div class="mosaic[^"]*">.*?\n    </div>', ancho, t, flags=re.S)


def datos(t):
    """.specbar dentro de una columna pasa a .factlist."""
    def dentro(m):
        bloque = m.group(0)
        bloque = bloque.replace('<div class="specbar">', '<div class="factlist">')
        bloque = re.sub(r'<div><span>(.*?)</span><span>(.*?)</span></div>',
                        lambda x: f'<div><span class="k">{x.group(1)}</span>'
                                  f'<span class="v">{x.group(2)}</span></div>', bloque)
        return bloque
    return re.sub(r'<div class="split-body">.*?\n      </div>', dentro, t, flags=re.S)


def sueltos(t):
    """Filas de enlaces escritas con estilo a mano."""
    t = re.sub(r'<div style="display:flex;gap:1\.5rem;flex-wrap:wrap;margin-top:[^"]*">',
               '<div class="split-actions">', t)
    return t


if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        p = os.path.join(RAIZ, sitio, "index.html")
        t = io.open(p, encoding="utf-8").read()
        t = cabeceras(t)
        t = fichas(t)
        t = datos(t)
        t = sueltos(t)
        io.open(p, "w", encoding="utf-8", newline="").write(t)
        print(f"  {sitio}")
