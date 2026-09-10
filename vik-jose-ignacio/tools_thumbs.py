"""Derivatives for the VIK site.
Source photography is 2000–2560px. The hover-follow card renders at
~340px and the gallery cards at ~700px, so we ship right-sized files:
  -w480  hover on small screens
  -w900  hover on large screens / gallery on small
  -w1600 gallery + cards on large
Originals stay untouched for heroes and full-bleed bands.
Authored by Nicolás Castillo · @donhkoland
"""
import os, sys
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(BASE, "assets", "img")
OUT  = os.path.join(SRC, "t")
SIZES = (480, 900, 1600)

def slug(rel):
    return rel.replace("\\", "/").replace("/", "__").rsplit(".", 1)[0]

def build(rel):
    src = os.path.join(SRC, rel)
    if not os.path.exists(src):
        print("MISSING", rel); return 0
    made = 0
    try:
        im = Image.open(src)
        im = ImageOps.exif_transpose(im).convert("RGB")
    except Exception as e:
        print("ERR", rel, e); return 0
    for w in SIZES:
        dst = os.path.join(OUT, f"{slug(rel)}-w{w}.jpg")
        if os.path.exists(dst): continue
        if im.width <= w and w != SIZES[0]:
            out = im.copy()
        else:
            out = im.copy()
            out.thumbnail((w, w * 3), Image.LANCZOS)
        out.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
        made += 1
    return made

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    rels = [l.strip() for l in open(os.path.join(BASE, "tools_thumbs.txt"), encoding="utf-8") if l.strip() and not l.startswith("#")]
    total = 0
    for r in rels: total += build(r)
    print(f"{len(rels)} sources · {total} derivatives written to assets/img/t/")
