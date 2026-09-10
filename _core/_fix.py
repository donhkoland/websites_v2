# -*- coding: utf-8 -*-
"""
Arregla dos cosas de una vez.

1 · EL CONVERTIDOR. Tres sustituciones usaban una retro-referencia
    escrita como texto (\\1). Al pasar por la consola se convirtio
    en un caracter de control, asi que re.sub no reponia el grupo:
    borraba la etiqueta de apertura y dejaba el cierre huerfano.
    Se cambian por lambdas, que no dependen de como se escriba el
    reemplazo.

2 · EL DANO. En vik-wellness se perdieron nueve <article> y cuatro
    <div>. Se reponen leyendo el cierre que quedo suelto.
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── 1 · el convertidor ─────────────────────────────────────────
p = os.path.join(RAIZ, "_core", "_convertir2.py")
s = io.open(p, encoding="utf-8").read()

nueva = '''def piezas(t):
    # El pie de una lamina: sitio arriba, nombre abajo.
    t = re.sub(r'(<span class="card-body">\\s*)<span class="n">',
               lambda m: m.group(1) + '<span class="card-loc">', t)
    t = re.sub(r'(<figcaption class="card-body">\\s*)<span class="n">',
               lambda m: m.group(1) + '<span class="card-loc">', t)
    t = t.replace('<span class="m">', '<span class="card-name lw">')
    # El folio de una ficha del mosaico.
    t = re.sub(r'(<article class="vcard"[^>]*>)<span class="i">',
               lambda m: m.group(1) + '<span class="vcard-when">', t)
    # La franja horaria de un paso del calendario.
    t = re.sub(r'(<div class="season-row"[^>]*>)<span class="t">',
               lambda m: m.group(1) + '<span class="w">', t)
    return t
'''
i = s.index("def piezas(t):")
j = s.index("def rieles(t):")
s = s[:i] + nueva + "\n\n" + s[j:]
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("convertidor: retro-referencias -> lambdas")


# ── 2 · el dano en vik-wellness ────────────────────────────────
p = os.path.join(RAIZ, "vik-wellness", "index.html")
t = io.open(p, encoding="utf-8").read()

# Las fichas del mosaico: el folio quedo a la intemperie.
n = len(re.findall(r'^(\s*)<span class="vcard-when">', t, re.M))
t = re.sub(r'^(\s*)<span class="vcard-when">',
           lambda m: m.group(1) + '<article class="vcard"><span class="vcard-when">',
           t, flags=re.M)

# Los pasos del calendario: igual, sin su fila.
d = len(re.findall(r'^(\s*)<span class="w">', t, re.M))
t = re.sub(r'^(\s*)<span class="w">',
           lambda m: m.group(1) + '<div class="season-row"><span class="w">',
           t, flags=re.M)

io.open(p, "w", encoding="utf-8", newline="").write(t)
print(f"vik-wellness: {n} <article> y {d} <div> repuestos")

for x in ("div", "article", "section", "span"):
    a = len(re.findall(r"<" + x + r"\b", t))
    b = len(re.findall(r"</" + x + r">", t))
    print(f"  {x:8s} {a:4d} / {b:4d}  {'ok' if a == b else '<<< DESBALANCE'}")
