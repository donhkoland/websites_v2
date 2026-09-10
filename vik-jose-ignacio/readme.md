# VIK José Ignacio · Design System V2

Landing autónoma. Prueba de un nuevo *look & feel* editorial sobre la
misma página, con los mismos assets.

```
DesignSystem_V2/
├─ index.html            la página entera
├─ css/vik-v2.css        el sistema: tokens, tipografía, 30 bloques
├─ js/vik-v2.js          el motor: reveals, railes, reserva, datos vivos
├─ js/                   lenis · gsap · ScrollTrigger · leaflet
└─ assets/
   ├─ fonts/             las 5 familias VIK
   ├─ logo/              wordmark + isotipo
   ├─ img/               14 fotos, en 900 y 1600
   ├─ video/             47 clips + sus pósters
   └─ press/             9 logotipos de prensa
```

**No apunta a nada fuera de esta carpeta.** Se puede mover, comprimir y
subir a cualquier servidor estático tal cual está. 50 MB en disco.

Dos cosas sí piden red, y ninguna es un asset: el clima de la tira viva
(Open-Meteo) y la cartografía del mapa (OpenStreetMap, libre y sin
clave). Sin conexión la tira se
queda con guiones y el mapa con el papel y su índice — nada más se rompe.

## Para verla

Hace falta un servidor: abriéndola con doble clic (`file://`) el
navegador bloquea las fuentes por CORS y se ve en Georgia.

```bash
cd "D:\Escritorio\VIK\--- Websites\_samples\designsystem_v2" && python -m http.server 8787
```

Y abrir **http://127.0.0.1:8787**

---

## Qué cambia respecto de V1

V1 era una publicación nocturna: fondo tinta, fotografía a sangre, texto
en hueso. **V2 es una publicación impresa**: papel claro, mucho blanco,
láminas apoyadas sobre el papel, y el negro reservado a tres momentos —
la portada, una banda de cine y el pie. El mismo material, leído a
plena luz.

| | V1 | V2 |
|---|---|---|
| Suelo | `--ink` por defecto | `--bone` / `--canvas`, fichas en blanco |
| Cajas | tabla de 1px, todo pegado | hueco entre piezas, hairline por borde |
| Esquina | recta | recta — el radio es del experimento, no del canon |
| Ritmo | `8rem` fijo | `clamp(5.5rem, 9vw, 9.5rem)` |
| Portada | titular + bajada + scroll hint | solo el mostrador, centrado |
| Reserva | al final de la página | mostrador de vidrio en el primer pantallazo |
| Composición | rejilla simétrica | retículas asimétricas, imágenes que se pisan |

## Qué no se toca

- **Los colores.** Los seis del manual: `#EEF3DC` `#002FA7` `#1E1E1E`
  `#F8F8F0` `#070850` `#5B0318`. Ninguno nuevo.
- **Las tipografías.** Los cinco roles con sus usos de siempre: Old
  Standard titula, Highway Gothic firma y etiqueta, Selva Script
  acentúa, Apercu Mono da el dato, DM Sans lee.
- **Las reglas de la marca.** Nada en negrita; `9.3px / .22em` para toda
  etiqueta; una propiedad se firma siempre igual.
- **La esquina viva.** Nada se redondea y nada flota: una superficie se
  separa de otra con una hairline. Los tokens `--r-*` y `--lift` siguen
  existiendo, en cero y en `none`, para que probar otra cosa sea cambiar
  una línea y no cuarenta reglas. El círculo sobrevive donde es una
  forma y no una esquina: el punto que late en la tira viva, el pin del
  mapa y el anillo del cursor.

## Los bloques

1. **Portada** — `hero.mp4` a sangre y una sola cosa encima: el mostrador de
   reserva en vidrio, centrado en los dos ejes. Sin titular, sin bajada,
   sin indicador de scroll. La película habla y el huésped hace lo único
   que vino a hacer.
2. **Tira viva** — hora, clima, viento, mar, puesta de sol y estación.
   Datos reales de Open-Meteo, sin clave ni cookies.
3. **Índice pegajoso** — la segunda fila de barra de la referencia.
4. **Collage de propiedades** — tres fotografías, tres tamaños, tres
   enlaces: cada imagen es una casa y la foto entera es el enlace. El
   nombre corre por el canto izquierdo, en vertical. Debajo hay una
   reja de doce columnas: lo que la hace parecer suelta es que los
   bloques no arrancan en la misma columna y que la segunda foto baja
   respecto de la primera.
5. **Seis puertas** — rail con deriva y arrastre, fichas blancas.
6. **Manifiesto** — el titular que estaba en la portada, con video de
   fondo y el contenido centrado vertical y horizontalmente. Es el
   único bloque simétrico de una página hecha de asimetrías, y llega
   cuando la frase ya tiene a qué referirse.
7. **La decisión** — tres láminas; la que está bajo el cursor se abre y
   estrena su película.
8. **La papelería de la casa** — una carta, una invitación y una
   señalización. El gesto gráfico de las referencias, sin disfrazarlo
   de componente.
9. **Ideario** — seis láminas blancas sobre canvas.
10. **La estación** — banda de cine contenida, con tabla de hairlines.
11. **La mesa** — índice de restaurantes con miniatura que sigue al ratón.
12. **El mapa** — las tres casas con sus coordenadas reales. Cartografía
   clara, pines azules e índice a la derecha: al pulsar una fila el mapa
   vuela hasta ella. Los tiles se piden cuando el bloque entra en
   pantalla, no al cargar, y la rueda **no** hace zoom — un mapa que
   secuestra el scroll a mitad de una página larga es una trampa.
13. **Mosaico** — experiencias, ritmo dos-uno / uno-dos.
14. **Prensa** — rail de logotipos + tres citas en Selva Script.
15. **Reserva** — el mismo mostrador, en papel blanco.
16. **Cierre** — azul VIK a sangre.

## Movimiento

Tres primitivas, ninguna pasa de 1,2 s:

- `.r` — el bloque sube y aparece.
- `.clip` — la imagen se destapa de abajo hacia arriba soltando una
  escala de 1.06 a 1.
- `.lines` — el titular sube **por líneas reales**: las palabras se
  miden y se agrupan por su `offsetTop`, así cada línea recibe su propia
  máscara y el escalonado sale del orden de lectura, no de un delay
  inventado. Se recalcula si cambia el ancho.

Más: parallax en la banda de cine, deriva de los railes, y el anillo
del cursor que pasa de tinta a hueso según la superficie que pisa.

Todo respeta `prefers-reduced-motion`.

Los reveals **no** usan `IntersectionObserver`: un solo vigía comparando
rectángulos, disparado por el scroll. Es menos elegante, pero cuando el
observer no dispara — un visor incrustado, una pestaña en segundo plano,
un contexto sin fotogramas — deja el contenido invisible, y ese es el
peor final posible para una portada.

## La reserva

`js/vik-v2.js` → `ENGINE`. Es el único punto de contacto con Bookassist:
compone `arrival / departure / adults / rooms` sobre la URL de cada
propiedad. *Help me choose* no va al motor — el motor no tiene concepto
de "el destino" — y se queda en la página abriendo el comparador.

Los campos de fecha siguen siendo `<input type=date>`: validan, abren el
calendario del sistema y son lo que lee el motor. Encima se dibuja la
fecha en serif (`28 Aug, Fri`) y el campo real queda transparente sobre
ella. Sin JavaScript se ve la fecha del navegador y todo funciona igual.

---

Diseño y sistema: Nicolás Castillo · @donhkoland

---

## Qué se sube al servidor

**48,8 MB · 134 archivos.** Todo menos cinco archivos y una carpeta.

```
index.html
assets/            (video, img, fonts, press, logo)
css/vik-v2.min.css
css/leaflet.min.css
js/vik-v2.min.js
js/leaflet.js
js/lenis.min.js
```

## Qué se queda acá

Cinco archivos, 209 KB. No los pide el navegador y en el servidor
solo son superficie de más.

| | |
|---|---|
| `css/vik-v2.css` · `js/vik-v2.js` | los fuentes. **Acá se edita.** Llevan los comentarios que explican cada decisión y son el documento de diseño tanto como el código |
| `css/leaflet.css` | fuente del vendor, solo hace falta para regenerar su minificado |
| `_build.sh` | regenera los `.min` desde los fuentes |
| `README.md` | esto |
| `borrar/` | media que ya no pide nadie. Se comprueba con el audito de referencias, no a ojo: el motor arma nombres solos (`-m.mp4` y `-poster.webp` de los siete clips de la portada) y borrar por lo que se ve en el marcado deja la portada sin fotograma en móvil |

## El ciclo

1. Editar `css/vik-v2.css` o `js/vik-v2.js`.
2. `bash _build.sh`
3. Subir el `?v=` de `index.html`. Sin eso el navegador sirve la
   copia vieja y parece que el cambio no entró.
4. Subir.

## Dos trampas que ya costaron caro

**Los nombres que no están escritos.** El motor arma dos familias
de rutas en tiempo de ejecución: el póster de una película
(`x.mp4` → `x-poster.webp`) y su versión de teléfono (`x-m.mp4`).
No aparecen en ningún archivo. Un barrido ingenuo de huérfanos los
marca para borrar y deja la portada sin video en móvil.

**El sello de versión.** Va en todas las rutas de `assets/`, no
solo en la hoja y el motor. Al reemplazar un clip conservando el
nombre, sin sello el navegador sigue sirviendo el anterior.
