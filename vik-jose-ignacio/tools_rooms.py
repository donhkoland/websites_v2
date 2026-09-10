# -*- coding: utf-8 -*-
"""ROOMS · one folder per house, one predictable name per photograph.

Until now every room photograph lived under whatever filename the
source site happened to use — adobe-0098.jpg, img_1624-lopezlaje3.jpg,
80c9a60ef2cc735699a0e504cbfa54955f3113fe.jpeg. That is fine for a
scrape and useless for a handover: nobody can tell which file is which
room, so nobody can replace one.

This gives every room three slots with names that say what they are:

    assets/img/rooms/<house>/<room-slug>-01.jpg    the room itself
    assets/img/rooms/<house>/<room-slug>-02.jpg    second view
    assets/img/rooms/<house>/<room-slug>-03.jpg    third view

Drop a new file over any of those and the site picks it up — no code
change, no rebuild, no renaming. -01 is the one that appears in the
carousel and behind the room name; -02 and -03 are the thumbnails.

The catalogue is read from the three property pages, which are the
system's source of truth for what a room is called, which house it
belongs to and what is written about it. So this never drifts from
the site: change a room there, re-run this, and the names follow.

It also writes two manifests. rooms.csv is for whoever is collecting
the photography; rooms.md is the readable version, marking which
slots hold a genuine photograph of that room and which currently hold
a stand-in from the same house.

    python tools_rooms.py            copy and write the manifests
    python tools_rooms.py --dry      list what it would do

Optimisation and thumbnails come later, once the real photography is
in — at that point add assets/img/rooms to tools_thumbs.txt and the
existing derivative pipeline handles the rest.

Authored by Nicolás Castillo · @donhkoland
"""
import io, os, re, csv, sys, json, shutil, unicodedata

SITE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(SITE, "assets", "img")
OUT = os.path.join(IMG, "rooms")

PAGES = [("estancia", "estancia.html"),
         ("playa",    "playa.html"),
         ("bahia",    "bahia.html")]

HOUSE = {"estancia": "Estancia VIK", "playa": "Playa VIK", "bahia": "Bahía VIK"}

DRY = "--dry" in sys.argv


# ── Categories ─────────────────────────────────────────────────────
# The bar in M26d is built from these, in this order. A room falls in
# the first bucket whose test passes, so the order below is the rule.
CATEGORIES = [
    ("master",   "Master Suites", lambda n, h: "master suite" in n.lower()),
    ("casa",     "Casas",         lambda n, h: "casa" in n.lower() or n.lower() == "garden view living"),
    ("bungalow", "Bungalows",     lambda n, h: "bungalow" in n.lower()),
    ("suite",    "Suites",        lambda n, h: True),
]


def category(name, house):
    for key, label, test in CATEGORIES:
        if test(name, house):
            return key
    return "suite"


def slug(name):
    """Room name → filename. Accents folded, everything lowercased,
    anything that is not a letter or a digit becomes a hyphen."""
    n = unicodedata.normalize("NFKD", name)
    n = "".join(c for c in n if not unicodedata.combining(c))
    n = re.sub(r"[^a-zA-Z0-9]+", "-", n).strip("-").lower()
    return n


# ── Read the catalogue out of the property pages ───────────────────
ATTR = re.compile(r'(\w[\w-]*)="([^"]*)"')
TILE = re.compile(r'<a class="wall-tile"([^>]*)></a>')


def read_tiles(path):
    with io.open(path, encoding="utf-8") as f:
        html = f.read()
    out = []
    for m in TILE.finditer(html):
        d = dict(ATTR.findall(m.group(1)))
        if not d.get("data-img"):
            continue
        out.append(d)
    return out


def main():
    rooms, seen = [], set()

    for house, page in PAGES:
        p = os.path.join(SITE, page)
        if not os.path.exists(p):
            print("  ! missing %s — run tools_property_data.py first" % page)
            continue
        for d in read_tiles(p):
            name = d.get("data-name", "").strip()
            key = (house, name)
            if not name or key in seen:
                continue
            seen.add(key)

            shots = [d["data-img"]] + [s.strip() for s in
                     d.get("data-gallery", "").split("|") if s.strip()]
            shots = (shots + shots[:1] * 3)[:3]      # never fewer than three

            rooms.append({
                "house": house,
                "houseName": HOUSE[house],
                "name": name,
                "slug": slug(name),
                "category": category(name, house),
                "meta": d.get("data-meta", ""),
                "copy": d.get("data-copy", ""),
                "sources": shots,
            })

    if not rooms:
        print("no rooms found")
        return

    # ── Copy into the canonical names ──────────────────────────────
    copied, missing, standins = 0, [], 0
    for r in rooms:
        dest_dir = os.path.join(OUT, r["house"])
        if not DRY:
            os.makedirs(dest_dir, exist_ok=True)
        r["files"] = []
        for i, rel in enumerate(r["sources"], 1):
            src = os.path.join(IMG, rel.replace("/", os.sep))
            ext = os.path.splitext(src)[1].lower() or ".jpg"
            fn = "%s-%02d%s" % (r["slug"], i, ".jpg" if ext == ".jpeg" else ext)
            rel_out = "rooms/%s/%s" % (r["house"], fn)
            r["files"].append(rel_out)

            # A slot is genuine when its source sits under this room's
            # own name; otherwise it is a photograph of the house
            # standing in until the real one arrives.
            own = r["slug"].split("-")[-1]
            genuine = i == 1 or own in slug(os.path.basename(rel))
            if not genuine:
                standins += 1
            r.setdefault("genuine", []).append(bool(genuine))

            if not os.path.exists(src):
                missing.append(rel)
                continue
            if not DRY:
                shutil.copyfile(src, os.path.join(dest_dir, fn))
            copied += 1

    # ── Manifests ──────────────────────────────────────────────────
    if not DRY:
        with io.open(os.path.join(SITE, "rooms.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(["house", "category", "room", "slot", "file", "status"])
            for r in rooms:
                for i, fn in enumerate(r["files"]):
                    w.writerow([r["houseName"], dict((k, l) for k, l, _ in CATEGORIES)[r["category"]],
                                r["name"], "%02d" % (i + 1), "assets/img/" + fn,
                                "genuine" if r["genuine"][i] else "STAND-IN — needs the real photograph"])

        labels = dict((k, l) for k, l, _ in CATEGORIES)
        md = [u"# VIK José Ignacio · Room photography",
              u"",
              u"Three slots per room. Drop a replacement over any filename below and",
              u"the site picks it up — no code change and no renaming.",
              u"",
              u"* `-01` the room itself. Used in the carousel and behind the room name.",
              u"* `-02` `-03` second and third views. Used as the thumbnails.",
              u"",
              u"**STAND-IN** means that slot currently holds a photograph of the house",
              u"rather than of the room, because the source site publishes only one",
              u"image for it. Those are the ones worth shooting first.",
              u""]
        for house, page in PAGES:
            hr = [r for r in rooms if r["house"] == house]
            if not hr:
                continue
            md.append(u"## %s · %d rooms" % (HOUSE[house], len(hr)))
            md.append(u"")
            for cat, label, _ in CATEGORIES:
                cr = [r for r in hr if r["category"] == cat]
                if not cr:
                    continue
                md.append(u"### %s" % label)
                md.append(u"")
                for r in cr:
                    md.append(u"**%s**" % r["name"])
                    for i, fn in enumerate(r["files"]):
                        md.append(u"- `assets/img/%s`%s" % (
                            fn, u"" if r["genuine"][i] else u"  ← STAND-IN"))
                    md.append(u"")
        with io.open(os.path.join(SITE, "rooms.md"), "w", encoding="utf-8") as f:
            f.write(u"\n".join(md))

        with io.open(os.path.join(SITE, "_rooms.json"), "w", encoding="utf-8") as f:
            json.dump(rooms, f, ensure_ascii=False, indent=1)

    # ── Report ─────────────────────────────────────────────────────
    print("%s%d rooms · %d files · %d stand-in slots still to shoot"
          % ("[dry] " if DRY else "", len(rooms), copied, standins))
    for cat, label, _ in CATEGORIES:
        n = len([r for r in rooms if r["category"] == cat])
        if n:
            print("   %-14s %2d" % (label, n))
    if missing:
        print("   ! %d source files not found:" % len(missing))
        for m in missing[:10]:
            print("     ", m)
    if not DRY:
        print("   wrote rooms.csv, rooms.md, _rooms.json")


if __name__ == "__main__":
    main()
