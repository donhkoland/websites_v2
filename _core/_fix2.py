# -*- coding: utf-8 -*-
"""
El caracter de control marca exactamente donde falta la etiqueta.

Cuando la retro-referencia se escribio mal, re.sub puso \\x01 en
lugar del grupo capturado. Eso es una suerte: el byte quedo justo
donde tendria que estar la apertura, asi que se sabe cual reponer
por lo que viene detras.
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CTRL = chr(1)

# lo que sigue al hueco  ->  lo que iba antes
REPONER = [
    ('<span class="vcard-when">', '<article class="vcard">'),
    ('<span class="w">',          '<div class="season-row">'),
    ('<span class="card-loc">',   '<span class="card-body">'),
]

for sitio in os.listdir(RAIZ):
    p = os.path.join(RAIZ, sitio, "index.html")
    if not os.path.isfile(p):
        continue
    t = io.open(p, encoding="utf-8").read()
    if CTRL not in t:
        continue
    n = t.count(CTRL)
    for sigue, abre in REPONER:
        t = t.replace(CTRL + sigue, abre + sigue)
    t = t.replace(CTRL, "")          # por si quedara alguno suelto
    io.open(p, "w", encoding="utf-8", newline="").write(t)

    print(f"{sitio}: {n} etiquetas repuestas")
    for x in ("div", "article", "section", "span", "figure"):
        a = len(re.findall(r"<" + x + r"\b", t))
        b = len(re.findall(r"</" + x + r">", t))
        print(f"  {x:8s} {a:4d} / {b:4d}  {'ok' if a == b else '<<< DESBALANCE'}")
