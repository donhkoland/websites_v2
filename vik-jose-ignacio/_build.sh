#!/usr/bin/env bash
#
# Regenera lo que sirve el navegador desde lo que se edita.
#
#   css/vik-v2.css  ->  css/vik-v2.min.css
#   js/vik-v2.js    ->  js/vik-v2.min.js
#
# Se edita SIEMPRE el fuente. Los .min son producto: llevan los
# mismos bytes sin los comentarios, y se pisan en cada corrida.
#
# Los comentarios del fuente no son adorno — explican por que cada
# regla es como es, y son la mitad del valor de este archivo. Por
# eso viven en el fuente y no viajan al navegador.
#
#   bash _build.sh
#
# Despues de correrlo, subir el ?v= del index.html: si no, el
# navegador sigue sirviendo la copia vieja.

set -e
cd "$(dirname "$0")"

E="npx --yes esbuild@0.24.0"

$E js/vik-v2.js  --minify --target=es2019 --outfile=js/vik-v2.min.js   --log-level=warning
$E css/vik-v2.css --minify                --outfile=css/vik-v2.min.css --log-level=warning

# Leaflet ya viene minificado de origen; solo su hoja no lo estaba.
[ -f css/leaflet.min.css ] || $E css/leaflet.css --minify --legal-comments=inline \
  --outfile=css/leaflet.min.css --log-level=warning

node --check js/vik-v2.min.js
echo "listo · acordate de subir el ?v= en index.html"
