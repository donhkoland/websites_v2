# -*- coding: utf-8 -*-
"""
Traduce una pagina de la v1 al vocabulario de la v2.

No es un buscar-y-reemplazar: los bloques que cambian de forma —
la portada, la tira viva, la cabecera de seccion, el mostrador —
se rearman, porque en la v2 su marcado es otro.

Lo mecanico se hace aqui para que las dieciocho salgan iguales.
Lo que cada pagina tiene de propio se ajusta despues a mano.

    python _core/_convertir.py bahia-vik playa-vik ...
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ── 1 · LA PORTADA ─────────────────────────────────────────────
# La v1 apilaba .hp-slides > .hp-slide > img y botones .hp-dot.
# La v2 pone las laminas sueltas dentro de .hp-media y cambia los
# puntos por un contador mono: un punto no dice cuantas hay.
def portada(t):
    def arma(m):
        bloque = m.group(0)
        laminas = re.findall(r'<div class="hp-slide[^"]*">(.*?)</div>', bloque, re.S)
        medios = []
        for i, l in enumerate(laminas):
            l = l.strip()
            if i == 0:
                l = re.sub(r'<(img|video)\b', r'<\1 class="is-on"', l, count=1)
            medios.append("      " + l)
        n = len(laminas) or 1
        return ('<div class="hp-media">\n' + "\n".join(medios) + "\n    </div>\n"
                f'    <span class="hp-count"><b>01</b> / {n:02d}</span>')
    t = re.sub(r'<div class="hp-media">.*?</div>\s*</div>\s*(?=<div class="hp-inner)',
               arma, t, flags=re.S)

    # El texto de la portada pasa a la reja: rotulo colgando en el
    # margen, titular y bajada en la columna larga.
    t = t.replace('<div class="hp-inner left">\n      <div>',
                  '<div class="hp-inner ed">\n      <div class="ed-main">')
    t = t.replace('<div class="hp-inner left">', '<div class="hp-inner ed">')
    t = t.replace('class="hf-actions"', 'class="hp-actions"')
    return t


# ── 2 · LA TIRA VIVA ───────────────────────────────────────────
# Mismo contenido, otro nombre: en la v2 la tira es .strip y sus
# celdas .fact, que es lo que el motor de clima ya busca.
def tira(t):
    t = re.sub(r'<section class="fact-ribbon"([^>]*)>',
               r'<section class="strip"\1>', t)
    return t


# ── 3 · LA CABECERA DE SECCION ─────────────────────────────────
# La v1 usaba dos divs sin nombre dentro de .section-head. La v2
# los nombra —.h-label y .h-main— porque la reja los coloca por
# nombre y no por posicion.
def cabeceras(t):
    def arma(m):
        cuerpo = m.group(2)
        partes = re.findall(r'<div>(.*?)</div>\s*(?=<div>|$)', cuerpo, re.S)
        if len(partes) != 2:
            return m.group(0)
        return (f'<div class="head{m.group(1)}">\n'
                f'      <div class="h-label">{partes[0].strip()}</div>\n'
                f'      <div class="h-main">{partes[1].strip()}</div>\n'
                f'    </div>')
    t = re.sub(r'<div class="section-head([^"]*)"[^>]*>(.*?)</div>\s*</div>',
               arma, t, flags=re.S)
    return t


# ── 4 · EL INTRO EDITORIAL ─────────────────────────────────────
# .intro / .intro-h / .intro-body es la misma particion que .head,
# escrita antes de que .head existiera. Se unifica: una sola
# cabecera en toda la publicacion.
def intro(t):
    def arma(m):
        return (f'<div class="head{m.group(1)}">\n'
                f'      <div class="h-label">{m.group(2).strip()}</div>\n'
                f'      <div class="h-main">{m.group(3).strip()}</div>\n'
                f'    </div>')
    t = re.sub(r'<div class="intro([^"]*)"[^>]*>\s*'
               r'<h2 class="intro-h">(.*?)</h2>\s*'
               r'<div class="intro-body">(.*?)</div>\s*</div>',
               lambda m: ('<div class="head' + m.group(1) + '">\n'
                          '      <div class="h-label"><h2 class="h2 lines">'
                          + m.group(2).strip() + '</h2></div>\n'
                          '      <div class="h-main">' + m.group(3).strip() + '</div>\n'
                          '    </div>'),
               t, flags=re.S)
    return t


# ── 5 · LOS NOMBRES ────────────────────────────────────────────
# Lo que solo cambia de nombre. El orden importa: las clases mas
# largas primero, para que .section-head no se coma .section.
NOMBRES = [
    ('class="section-eyebrow ui-label"', 'class="kicker"'),
    ('class="section-eyebrow"',          'class="kicker"'),
    ('class="section-title"',            'class="h2 lines"'),
    ('class="section-lead"',             'class="lead"'),
    ('class="section canvas"',           'class="sec canvas"'),
    ('class="section bone gallery"',     'class="sec paper tight"'),
    ('class="section bone"',             'class="sec paper"'),
    ('class="section vik"',              'class="sec" data-ground="dark"'),
    ('class="section map-section"',      'class="sec map-section"'),
    ('class="section"',                  'class="sec"'),
    ('class="btn-solid"',                'class="pill solid"'),
    ('class="btn-outline"',              'class="pill light"'),
    ('class="btn-line"',                 'class="link"'),
    ('class="gallery-rail"',             'class="rail" data-rail="auto" data-rail-speed="0.32"'),
    ('class="gallery-card"',             'class="card"'),
    ('class="card-grid alt"',            'class="mosaic"'),
    ('class="card-grid"',                'class="mosaic"'),
    ('class="index-list"',               'class="index"'),
    ('class="split-facts"',              'class="specbar"'),
    ('class="closing-lines"',            'class="close-lines"'),
    ('class="closing-title"',            'class="h2 close-t lines"'),
    ('class="closing-actions"',          'class="close-actions"'),
    ('class="closing-note"',             'class="close-note"'),
    ('class="closing"',                  'class="close"'),
    ('class="pillars c3"',               'class="mosaic"'),
    ('class="pillar"',                   'class="vcard"'),
    ('<main id="top" class="site-shell">', '<main id="top">'),
    ('class="ui-label"',                 'class="kicker"'),
    ('class="text-vik"',                 'class="lw"'),
]


def convertir(ruta):
    t = io.open(ruta, encoding="utf-8").read()
    antes = len(t)
    t = portada(t)
    t = tira(t)
    t = cabeceras(t)
    t = intro(t)
    for a, b in NOMBRES:
        t = t.replace(a, b)
    # Restos de la v1 que ya no significan nada.
    t = t.replace(' style="color:var(--ink)"', '')
    t = re.sub(r'\s*class="site-shell"', '', t)
    t = re.sub(r'<div data-vik-checkout></div>\s*', '', t)
    io.open(ruta, "w", encoding="utf-8", newline="").write(t)
    return antes, len(t)


if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        p = os.path.join(RAIZ, sitio, "index.html")
        a, b = convertir(p)
        print(f"  {sitio:16s} {a//1024:3d} KB -> {b//1024:3d} KB")
