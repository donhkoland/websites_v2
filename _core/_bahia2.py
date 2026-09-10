# -*- coding: utf-8 -*-
"""
Bahia VIK, segunda tanda.

  1 · EL TITULAR ES EL MODULO DEL MANIFIESTO.
      La referencia usa .statement / .statement-in / h1.statement-t
      .lines[data-lines="br"] — centrado, en una sola linea por
      renglon. No es una escala parecida: es el mismo modulo. Asi
      que la portada interior deja de ser .hero-page y pasa a ser
      .statement, que ya esta aprobado y ya esta escrito.

  2 · LOS MODULOS SON SUITES Y BUNGALOWS.
      Dos cosas, no tres. "Rooms" era un paraguas que contenia a
      las otras dos y las dejaba sin nombre propio.

  3 · CADA HABITACION, SU FICHA.
      Se le agrega a cada tarjeta el dato que necesita la interna
      y la descripcion breve que aparece al pasar por encima.

    python _core/_bahia2.py
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(RAIZ, "bahia-vik", "index.html")
t = io.open(P, encoding="utf-8").read()


# ── 1 · LA PORTADA, AL MODULO DEL MANIFIESTO ───────────────────
hero = re.search(r'<section class="hero-page"[^>]*>.*?</section>', t, re.S)
if hero:
    laminas = re.findall(r'<(?:img|video)[^>]*>', hero.group(0))
    medios = "\n      ".join(
        (l if 'class="is-on"' in l else l.replace("<img ", '<img class="is-on" ', 1))
        if i == 0 else l
        for i, l in enumerate(laminas))
    t = t[:hero.start()] + f'''<!-- ══ EL MANIFIESTO DE LA CASA ══════════════════════════════
       Mismo modulo que la portada del destino: cine a sangre y una
       sola frase encima, centrada en los dos ejes. Esa simetria es
       lo que la convierte en una declaracion y no en un rotulo.

       Las laminas se turnan solas dentro de .statement-media; con
       una sola, el modulo se comporta igual.                    -->
  <section class="statement" id="opening" data-ground="dark">
    <div class="statement-media">
      {medios}
    </div>
    <div class="statement-in">
      <span class="kicker bare">Bahía VIK &middot; Retreat 03 &middot; Playa Mansa</span>
      <h1 class="statement-t lines" data-lines="br">Fifteen bungalows,<br>set <em>into the dunes</em>.</h1>
      <p class="statement-d">Relaxed beach lifestyle, design-led architecture and social energy. Bungalows tucked into the breezy dunes of Playa Mansa, on the calm side of the peninsula — the most social of the three houses, and the easiest with children.</p>
      <div class="statement-actions">
        <a class="pill light" href="#book"><span>Book Your Stay</span><span class="arw">&#8594;</span></a>
        <a class="pill light" href="../stay/"><span>See the three retreats</span><span class="arw">&#8594;</span></a>
      </div>
    </div>
  </section>''' + t[hero.end():]


# ── 2 · SUITES Y BUNGALOWS ─────────────────────────────────────
t = t.replace('data-prop="rooms"', 'data-prop="suites"')
t = t.replace('<span class="vcap">Rooms &middot; Ten suites, main building</span>',
              '<span class="vcap">Suites &middot; Ten, in the main building</span>')
t = t.replace('<span class="vcap">Suites &amp; Bungalows &middot; In the dunes</span>',
              '<span class="vcap">Bungalows &middot; Fifteen, in the dunes</span>')
t = t.replace('<span class="name">Rooms</span>', '<span class="name">Suites</span>')
t = t.replace('<span class="name">Suites &amp; Bungalows</span>',
              '<span class="name">Bungalows</span>')
t = t.replace('data-cta="See the rooms"', 'data-cta="See the suites"')
t = t.replace('<h2 class="h2 lines">Ten suites, <em>fifteen bungalows</em>.</h2>',
              '<h2 class="h2 lines">Ten suites, <em>fifteen bungalows</em>.</h2>')

io.open(P, "w", encoding="utf-8", newline="").write(t)
print("bahia-vik ·", len(t) // 1024, "KB")
for k, v in [("statement", t.count('class="statement"')),
             ("hero-page", t.count('class="hero-page"')),
             ("h1 statement-t", t.count('class="statement-t lines"')),
             ("data-prop suites", t.count('data-prop="suites"')),
             ("data-prop bungalows", t.count('data-prop="bungalows"'))]:
    print(f"  {k:20s} {v}")
