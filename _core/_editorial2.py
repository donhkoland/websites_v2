# -*- coding: utf-8 -*-
"""
Segunda pasada de composicion. Cuatro cosas que se ven rotas.

  1 · ATRIBUTOS DUPLICADOS. La primera pasada agregaba data-rail al
      renombrar .gallery-rail, sin mirar que esa tira ya lo traia.
      Dos data-rail en la misma etiqueta: el navegador se queda con
      el primero y la velocidad que se escribio se pierde.

  2 · PIES SIN NOMBRE. Las laminas de la galeria llevaban el pie
      como un <span> suelto. Sin .card-body no hay relleno, sin
      .card-loc no hay letra: el nombre queda flotando debajo de la
      fotografia en cuerpo de parrafo.

  3 · LA BARRA DE FILTROS VACIA. La llenaba vik-rooms.js, que ya no
      se carga. Una barra sin botones es un renglon de aire con un
      filete: se escribe con las categorias que la propia tira
      tiene, leidas del marcado.

  4 · ESTILO A MANO EN LA TIRA DE DATOS. .specbar ya se centra y ya
      mide: el style solo repetia lo que la hoja hace.

    python _core/_editorial2.py bahia-vik [sitio ...]
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rieles(t):
    """Un solo data-rail por tira."""
    def uno(m):
        etiqueta = m.group(0)
        pares = re.findall(r'\s(data-rail(?:-speed)?)="([^"]*)"', etiqueta)
        vistos, limpio = set(), etiqueta
        for k, v in pares:
            limpio = limpio.replace(f' {k}="{v}"', "", 1)
        for k, v in pares:
            if k not in vistos:
                vistos.add(k)
                limpio = limpio[:-1] + f' {k}="{v}">'
        return limpio
    return re.sub(r'<div class="rail[^>]*>', uno, t)


def pies(t):
    """El pie de una lamina de galeria, con sus nombres."""
    return re.sub(
        r'(<figure class="card"><img[^>]*alt="([^"]*)"[^>]*>)<span>([^<]*)</span>',
        lambda m: (m.group(1) + '<span class="card-body">'
                   '<span class="card-name lw">' + m.group(3) + '</span></span>'),
        t)


def filtros(t):
    """La barra de la tira de habitaciones, escrita con lo que hay."""
    m = re.search(r'<div class="roomreel-bar"[^>]*></div>', t)
    if not m:
        return t
    cats = []
    for c in re.findall(r'data-cat="([^"]*)"', t):
        if c not in cats:
            cats.append(c)
    n = len(re.findall(r'<a class="rr"', t))
    botones = '<button type="button" class="is-on" data-cat="">All</button>'
    for c in cats:
        botones += f'\n      <button type="button" data-cat="{c}">{c.capitalize()}s</button>'
    return t[:m.start()] + (
        '<div class="roomreel-bar" role="tablist" aria-label="Filter rooms">\n'
        f'      {botones}\n'
        f'      <span class="count">{n} rooms</span>\n'
        '    </div>') + t[m.end():]


def limpio(t):
    t = t.replace('<div class="specbar" style="max-width:var(--max);margin:3rem auto 0">',
                  '<div class="specbar r" style="margin-top:clamp(2.5rem,5vw,4rem)">')
    return t


if __name__ == "__main__":
    for sitio in sys.argv[1:]:
        p = os.path.join(RAIZ, sitio, "index.html")
        t = io.open(p, encoding="utf-8").read()
        t = rieles(t); t = pies(t); t = filtros(t); t = limpio(t)
        io.open(p, "w", encoding="utf-8", newline="").write(t)
        print(f"  {sitio}")
