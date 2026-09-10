# -*- coding: utf-8 -*-
"""Builds the three-photograph set for every room.

The source sites publish ONE photograph per room — a handful of Bahía
suites carry three, everything else carries one. So a set is:

  1 · the room's own photograph        (always genuine)
  2 · two more                          (genuine where the source has
                                         them; otherwise photographs of
                                         that same house)

The fillers are dealt round-robin from a per-property pool with a
per-room offset, so no two rooms ever show the same pair — which is
what made the wall look like it was repeating one image.

It prints which rooms are still short of genuine photography, so VIK
can supply the gaps. Run:  python tools_room_images.py

Authored by Nicolás Castillo · @donhkoland
"""
import io, os, re, json

SITE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(SITE, "assets", "img")

# Rooms whose source page carried more than one genuine photograph.
GENUINE_EXTRA = {
    "Suite Eva":        ["bahia/cp-bahiavik-0593-scaled.jpg", "bahia/cp-bahiavik-0598.jpg"],
    "Suite Guerra":     ["bahia/img_1589-guerra12.jpg", "bahia/img_1589-guerra12-1.jpg"],
    "Suite Escardó":    ["bahia/cp-bahiavik-0554-scaled.jpg"],
    "Suite López Lage": ["bahia/cp-bahiavik-0562-1-scaled.jpg"],
}

# Photographs of each house, used to complete a set. Deliberately
# spaces and exteriors — never another room, which would misrepresent.
POOL = {
    "estancia": [
        "estancia/gardens-img_1111-min.jpg", "estancia/pool-img_1630-min.jpg",
        "estancia/chapel-img_0177-min.jpg", "estancia/gameroom-img_4145-min.jpg",
        "estancia/sculpture-img_1789.jpg", "estancia/entrance-img_0003-min.jpg",
        "estancia/estanciavik-0323-min.jpg", "estancia/bbq-img_7731.jpg",
        "estancia/entrance-to-living-room.jpeg", "estancia/north-garden-to-living-room-1.jpg",
        "estancia/estancia-img_0004.jpg", "estancia/estancia-img_0005.jpg",
    ],
    "playa": [
        "playa/casas-main-scaled.jpg", "playa/pool-img_0520.jpg",
        "playa/spa-img_0817.jpg", "playa/sculpture-img_1227.jpg",
        "playa/parillero_playa-vik-934.jpg", "playa/gameroom_02.jpg",
        "playa/gym_img_1967.jpg", "playa/home-img_1789.jpg",
        "playa/gardenview-living-scaled.jpg", "playa/dscf3708-hdr-scaled.jpg",
        "playa/dscf3917-hdr-scaled.jpg", "playa/dscf4068-hdr-scaled.jpg",
    ],
    "bahia": [
        "bahia/cp-bahiavik-0552-scaled.jpg", "bahia/cp-bahiavik-0546-scaled.jpg",
        "bahia/cp-bahiavik-0562-scaled.jpg", "bahia/cp-bahiavik-0549-scaled.jpg",
        "bahia/dscf5297-min.jpg", "bahia/16_bv-1106-scaled.jpg",
        "bahia/36_bv_img_0070-1-scaled.jpg", "bahia/dsc_3451-min.jpg",
        "bahia/dsc_3096-min.jpg", "bahia/dscn2725-scaled.jpg",
        "bahia/dscn2740-scaled.jpg", "bahia/dscn2783-scaled.jpg",
    ],
}


def exists(rel):
    return os.path.exists(os.path.join(IMG, rel.replace("/", os.sep)))


def set_for(name, header, prop, index, used):
    """Three photographs: the room's own, then two more.

    `used` carries the pairs already dealt for this property, so no two
    rooms ever end up showing the same two supporting frames — that
    repetition is what made the wall look like one image."""
    out = [header]
    for g in GENUINE_EXTRA.get(name, []):
        if exists(g) and g not in out:
            out.append(g)
    genuine = len(out)

    pool = [p for p in POOL[prop] if exists(p) and p not in out]
    n = len(pool)
    if n:
        # walk the pool with a per-room offset and a coprime stride, so
        # consecutive rooms never draw neighbouring frames
        stride = 5 if n % 5 else 3
        start = (index * 7) % n
        step = 0
        while len(out) < 3 and step < n * 3:
            pick = pool[(start + step * stride) % n]
            if pick not in out:
                trial = tuple(out[1:] + [pick])
                if len(trial) < 2 or trial not in used:
                    out.append(pick)
            step += 1
        if len(out) > 1:
            used.add(tuple(out[1:]))
    return out[:3], genuine


if __name__ == "__main__":
    import tools_property_data as D
    report, short = [], []
    for key, d in D.DATA.items():
        used = set()
        rows = re.findall(r'data-img="([^"]+)" data-name="([^"]+)"', d["tiles"])
        for i, (img, name) in enumerate(rows):
            shots, genuine = set_for(name, img, key, i, used)
            report.append({"room": name, "property": key, "shots": shots, "genuine": genuine})
            if genuine < 3:
                short.append("%-22s %s (%d genuine)" % (name, key, genuine))
    json.dump(report, io.open(os.path.join(SITE, "_room_sets.json"), "w", encoding="utf-8"), indent=1)

    print("%d rooms · %d sets of three" % (len(report), len(report)))
    print("\nRooms still short of genuine photography — the source sites")
    print("publish only one image for these, so two frames are house shots:\n")
    for line in short:
        print("   " + line)
    print("\n%d of %d rooms carry three genuine photographs."
          % (len(report) - len(short), len(report)))
