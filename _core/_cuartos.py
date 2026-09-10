# -*- coding: utf-8 -*-
"""
Las veinticuatro habitaciones de Bahia: descripcion y ficha propia.

Dos cosas de una fuente:

  · la frase breve que aparece al pasar por encima de la tarjeta —
    hasta ahora, para saber cual era cual habia que abrir las
    veinticuatro;

  · la pagina interna de cada una, con la estructura de la ficha de
    Galleria VIK: portada con tira de tomas, miga, cabecera, tira
    de datos, descripcion, dotacion, mostrador pegado al costado y
    las habitaciones vecinas al pie.

El texto sale de lo que la casa es de verdad: las suites llevan
nombre de artista uruguayo y los bungalows llevan el nombre de su
material, que es literalmente de que estan hechos.

    python _core/_cuartos.py
"""
import io, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASA = os.path.join(RAIZ, "bahia-vik")

# nombre · metros · duerme · frase breve · lo que la distingue
CUARTOS = {
 "Burgos":      (58, 2, "Ana Burgos worked the headboard in ceramic before the room had a bed.",
                 "Ceramic headboard, fired on site. First floor, bay side, with the terrace over the water."),
 "Escardo":     (56, 2, "Line drawings straight onto the lime plaster, left unframed.",
                 "Drawn directly onto the wall, unframed and unvarnished, so the plaster still breathes."),
 "Eva":         (62, 2, "The largest of the suites, with the corner window over Playa Mansa.",
                 "Corner glazing on two walls. The room the light reaches first in the morning."),
 "Guerra":      (54, 2, "Oil on the ceiling rather than the wall — you read it lying down.",
                 "The work is overhead. Nothing hangs at eye level, which was the point."),
 "Juan Manuel": (56, 2, "Wood, rope and iron, all of it made within forty kilometres.",
                 "Every fitting was made by hand in Maldonado. Nothing in it was bought finished."),
 "Lopez Lage":  (60, 2, "Heavy pigment and a bed set low, facing the dunes rather than the water.",
                 "Turned away from the bay on purpose: the dune moves more than the sea does."),
 "Patrone":     (54, 2, "Photographs of the dune printed on the wall it looks out at.",
                 "The image and the view are the same dune, ten years apart."),
 "Pemper":      (56, 2, "Mirrors set into the plaster, so the bay arrives twice.",
                 "Glass worked into the wall itself. The room reads wider than it measures."),
 "Rita":        (52, 2, "The smallest and the quietest, at the end of the upper corridor.",
                 "Furthest from the terrace, and the one guests ask for a second time."),

 "Adobe":       (55, 2, "Earth walls, half a metre thick, cool at three in the afternoon.",
                 "Built from the ground it stands on. The walls hold the night temperature until dusk."),
 "Azulejos":    (52, 2, "Hand-painted tile across the whole of one wall and into the bath.",
                 "Every tile painted and fired for this bungalow. No two repeat."),
 "Chapa Azul":  (50, 2, "Blue sheet metal, and rain you can hear properly.",
                 "The roof is the point. A storm here is the reason people ask for it in March."),
 "Comporta":    (58, 3, "Thatch and lime, borrowed from the Portuguese coast.",
                 "Low, white and open on two sides. The most Atlantic of the fifteen."),
 "Corten":      (54, 2, "Weathered steel that keeps changing colour with the salt.",
                 "The skin is still oxidising. It has not looked the same in any two seasons."),
 "Duna":        (56, 2, "Set deepest into the sand, with the dune above the window line.",
                 "You look up at the dune from inside it. Nothing was flattened to place it."),
 "Greek":       (52, 2, "Whitewash and shade, and a courtyard that does the cooling.",
                 "The courtyard is the air conditioning. It was designed before the roof was."),
 "Madera":      (55, 2, "Uruguayan timber, unpainted, left to grey in the salt.",
                 "Nothing sealed. The wood is on its second colour and heading for a third."),
 "Piedra":      (58, 3, "Local stone laid dry, with the largest terrace of the fifteen.",
                 "Stacked without mortar, the way the field walls inland are built."),
 "Quincha":     (50, 2, "Reed and cane over timber — the oldest way of roofing here.",
                 "Built the way the fishing huts on this beach were, and still are."),
 "Ryokan":      (54, 2, "Timber, paper and a bath you sit in rather than lie in.",
                 "A Japanese plan on a Uruguayan dune, and it works better than it should."),
 "Titanio":     (56, 2, "Titanium, the same skin as the roof at Playa VIK.",
                 "The material that ties this house to the one on the point."),
 "Vidrio":      (52, 2, "Glass on three sides, and blinds you will not use.",
                 "The dune grass is the privacy. It grows back every September."),
 "Zinc Marrón": (50, 2, "Brown zinc, warm at sunset and the colour of the sand behind it.",
                 "It disappears into the dune from the beach and reappears from the road."),
 "Zinc Negro":  (50, 2, "Black zinc, the darkest of the fifteen and the coolest inside.",
                 "Built for the height of summer. In January it is the one people do not leave."),
}


def clave(nombre):
    return (nombre.lower().replace("á", "a").replace("é", "e").replace("í", "i")
            .replace("ó", "o").replace("ú", "u").replace(" ", "-"))


# Solo al correrlo a mano: importarlo es para leer CUARTOS, no
# para reescribir la casa.
if __name__ == "__main__":
    # ── 1 · LA FRASE EN LA TARJETA ─────────────────────────────────
    p = os.path.join(CASA, "index.html")
    t = io.open(p, encoding="utf-8").read()
    puestas = 0

    def enriquecer(m):
        global puestas
        bloque = m.group(0)
        n = re.search(r'data-name="([^"]*)"', bloque)
        if not n or n.group(1) not in CUARTOS:
            return bloque
        m2, duerme, breve, largo = CUARTOS[n.group(1)]
        k = clave(n.group(1))
        puestas += 1
        # El dato que la interna necesita, y la frase del over.
        bloque = bloque.replace('<a class="rr"',
            f'<a class="rr" data-m2="{m2}" data-sleeps="{duerme}" '
            f'data-copy="{largo}" href="cuartos/{k}.html"', 1)
        bloque = re.sub(r'(<span class="rr-meta">[^<]*</span>)',
                        lambda x: x.group(1) +
                        f'\n          <span class="rr-note"><span>{breve}</span></span>',
                        bloque, count=1)
        return bloque

    t = re.sub(r'<a class="rr".*?</a>', enriquecer, t, flags=re.S)
    # El href viejo queda duplicado: se quita el segundo.
    t = re.sub(r'(<a class="rr"[^>]*?)\s+href="#accommodations"', r"\1", t)
    io.open(p, "w", encoding="utf-8", newline="").write(t)
    print(f"tarjetas enriquecidas: {puestas}")
