# -*- coding: utf-8 -*-
"""Writes media.md — every photograph and film on every page.

Listed with the page and the section it sits in, so swapping an image
is: find the line here, copy the path, Ctrl+F it in the page, replace.

This used to be injected into the top of each page as a comment. It
is documentation, and documentation does not belong in the shipped
markup — view-source is not a README.

Regenerate after any markup change:  python tools_media_index.py

Authored by Nicolás Castillo · @donhkoland
"""
import io, os, re

SITE = os.path.dirname(os.path.abspath(__file__))
PAGES = ["jignacio.html", "stay.html", "estancia.html", "playa.html",
         "bahia.html", "styleguide.html", "index.html"]

SECTION_RE = re.compile(
    r'<(?:section|div)[^>]*(?:id="([a-z0-9\-]+)"|class="([^"]*)")[^>]*>', re.I)


def section_at(html, pos):
    """The nearest section id or module class above this point."""
    best = ""
    for m in SECTION_RE.finditer(html, 0, pos):
        ident = m.group(1)
        cls = (m.group(2) or "")
        if ident:
            best = ident
        elif cls:
            for k in ("chooser", "plb-panel", "wall", "gallery-rail", "prop-rail",
                      "reel-wide", "logo-rail", "booking", "hero-page", "hero-film",
                      "band", "split", "card-grid", "compare"):
                if k in cls.split():
                    best = k
    return best or "page"


def collect(html):
    """(section, kind, path) for every media reference, in page order."""
    out = []
    pat = re.compile(
        r'(?:<img[^>]+src="([^"]+)")'
        r'|(?:data-src="([^"]+\.mp4)")'
        r'|(?:poster="([^"]+)")'
        r'|(?:data-(?:hover-)?img="([^"]+)")'
        r"|(?:url\('([^']+)'\))", re.I)
    for m in pat.finditer(html):
        path = next(g for g in m.groups() if g)
        if path.startswith("data:") or "/brand/" in path or "/press/" in path:
            continue
        kind = "film" if path.endswith(".mp4") else "still"
        if m.group(3):
            kind = "poster"
        if m.group(4) and not path.startswith("assets/"):
            path = "assets/img/" + path
        out.append((section_at(html, m.start()), kind, path))
    return out


def block(page, items):
    seen, groups = set(), []
    for sec, kind, path in items:
        key = (sec, path)
        if key in seen:
            continue
        seen.add(key)
        if not groups or groups[-1][0] != sec:
            groups.append((sec, []))
        groups[-1][1].append((kind, path))

    lines = [u"## %s" % page, u""]
    total = 0
    for sec, media in groups:
        lines.append(u"**%s**" % sec.upper())
        lines.append(u"")
        for kind, path in media:
            lines.append(u"- `%s` %s" % (kind, path))
            total += 1
        lines.append(u"")
    lines.append(u"_%d media references_" % total)
    lines.append(u"")
    return lines


def strip_old(html):
    i = html.find(START)
    if i < 0:
        return html
    j = html.find(END, i)
    return html[:i] + html[j + len(END):].lstrip("\n")


if __name__ == "__main__":
    doc = [u"# Media index",
           u"",
           u"Every photograph and film on the site, by page and by section.",
           u"To swap one: copy its path, Ctrl+F it in that page, replace.",
           u"Stills live in `assets/img/`, films in `assets/video/`.",
           u"Derivatives (`-w480` / `-w900` / `-w1600`) come from `tools_thumbs.py` —",
           u"add the new source to `tools_thumbs.txt` and re-run it.",
           u"",
           u"Room photography has its own manifest: see `ROOMS.md`.",
           u"",
           u"Regenerate: `python tools_media_index.py`",
           u""]
    grand = 0
    for page in PAGES:
        p = os.path.join(SITE, page)
        if not os.path.exists(p):
            print("skip", page)
            continue
        html = io.open(p, encoding="utf-8").read()
        items = collect(html)
        doc += block(page, items)
        n = len(set(x[2] for x in items))
        grand += n
        print("%-18s %3d media references" % (page, n))
    io.open(os.path.join(SITE, "media.md"), "w", encoding="utf-8").write(
        "\n".join(doc).rstrip() + "\n")
    print("wrote media.md · %d references" % grand)
