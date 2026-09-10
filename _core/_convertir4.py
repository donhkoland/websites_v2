# -*- coding: utf-8 -*-
"""
Cuarta pasada: el terreno.

En la v2 un bloque declara sobre que fondo vive —data-ground— y de
eso dependen el color del texto, el filete y la intensidad del
grano. La v1 lo resolvia con una clase de color por seccion, asi
que al traducir los bloques a sangre quedaron sin declarar: texto
en tinta sobre cine, que es ilegible.

Tambien limpia lo que el renombrado deja atras: divs sin clase que
existian solo para llevar una, y acciones con el nombre de la
portada dentro de un manifiesto.

    python _core/_convertir4.py sitio [sitio ...]
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Los bloques que van sobre cine o sobre tinta. Sin esto el texto
# se pinta en tinta encima del video.
OSCUROS = ["statement", "film", "hero-page", "agenda", "club", "close-sec"]


def terreno(t):
    for cls in OSCUROS:
        t = re.sub(
            r'(<section class="[^"]*\b' + cls + r'\b[^"]*"(?![^>]*data-ground)[^>]*)>',
            r'\1 data-ground="dark">', t)
        t = re.sub(
            r'(<div class="[^"]*\b' + cls + r'\b[^"]*"(?![^>]*data-ground)[^>]*)>',
            r'\1 data-ground="dark">', t)
    # El mapa tambien: su banda es negra.
    t = re.sub(r'(<section class="[^"]*\bmap-section\b[^"]*"(?![^>]*data-ground)[^>]*)>',
               r'\1 data-ground="dark">', t)
    return t


def limpiar(t):
    # Divs que solo existian para llevar una clase que ya no existe.
    t = re.sub(r'<div\s*></div>\s*', "", t)
    t = re.sub(r'<div\s+></div>\s*', "", t)
    # Las acciones de una portada dentro de un manifiesto se llaman
    # como el manifiesto: son la misma fila, en otro bloque.
    def dentro(m):
        return m.group(0).replace('class="hp-actions"', 'class="statement-actions"')
    t = re.sub(r'<div class="statement-in">.*?</section>', dentro, t, flags=re.S)
    # Restos de la v1 que ya no lee nadie.
    t = re.sub(r'\s+data-track-section="[^"]*"', "", t)
    t = re.sub(r'\s+data-parallax="[^"]*"', "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t


def convertir(ruta):
    t = io.open(ruta, encoding="utf-8").read()
    t = terreno(t)
    t = limpiar(t)
    io.open(ruta, "w", encoding="utf-8", newline="").write(t)


if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        convertir(os.path.join(RAIZ, sitio, "index.html"))
        print(f"  {sitio}")
