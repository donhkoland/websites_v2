# -*- coding: utf-8 -*-
"""Generates the three retreat pages.

Authored by Nicolás Castillo · @donhkoland

All three share one structure — hero, sticky sub-nav, about, location,
accommodations, restaurant, experience, contact — so it is written once
here and the pages differ only in their data. Re-run after editing DATA.
"""
import os

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1E1E1E">
<meta name="author" content="Nicolás Castillo">
<meta name="designer" content="Nicolás Castillo · @donhkoland">
<meta name="developer" content="Nicolás Castillo · @donhkoland">
<meta name="copyright" content="VIK Retreats">
<title>{name} · VIK José Ignacio</title>
<meta name="description" content="{meta}">
<link rel="stylesheet" href="assets/css/leaflet.css">
<link rel="stylesheet" href="core/vik-core.css?v=22">
<link rel="stylesheet" href="core/vik-modules.css?v=50">
</head>
<body>

<div data-vik-chrome data-page="stay" data-tag="{name}" data-logo="{key}"></div>

<main id="top" class="site-shell">

  <section class="hero-page">
    <div class="hp-media">
      <div class="hp-slides" data-hold="5600">
        <div class="hp-slide is-on"><img src="assets/img/t/{hero1}-w1600.jpg" alt="{name}"></div>
        <div class="hp-slide"><video muted loop playsinline preload="none" poster="assets/video/{video}-poster.jpg" data-src="assets/video/{video}.mp4"></video></div>
        <div class="hp-slide"><img src="assets/img/t/{hero2}-w1600.jpg" alt="{name}"></div>
      </div>
      <div class="hp-dots"><button class="hp-dot is-on" aria-label="1"></button><button class="hp-dot" aria-label="2"></button><button class="hp-dot" aria-label="3"></button></div>
    </div>
    <div class="hp-inner left">
      <div>
        <h1 class="sr-only">{name} · {eyebrow}</h1>
        <p class="hp-desc">{standfirst}</p>
        <div class="hf-actions" style="margin-top:1.75rem">
          <a class="btn-solid" href="#book"><span>Book Your Stay</span><span class="arw">→</span></a>
          <a class="btn-line" href="stay.html"><span>See the three retreats</span><span class="arw">→</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="fact-ribbon" data-live-ribbon style="--ribbon:{ribbon}">
    <div class="fact"><span class="k"><span class="live-dot"></span>Local time</span><span class="v" data-live="time">—</span><span class="s" data-live-sub="time">José Ignacio, Uruguay</span></div>
    <div class="fact"><span class="k">Weather</span><span class="v" data-live="weather">—</span><span class="s" data-live-sub="weather">Loading conditions…</span></div>
    <div class="fact"><span class="k">Wind</span><span class="v" data-live="wind">—</span><span class="s" data-live-sub="wind">Loading…</span></div>
    <div class="fact"><span class="k">Ocean</span><span class="v" data-live="sea">—</span><span class="s" data-live-sub="sea">Playa Brava</span></div>
    <div class="fact"><span class="k">Season</span><span class="v" data-live="season">—</span><span class="s" data-live-sub="season">—</span></div>
  </section>

  <div class="subnav">
    <div class="subnav-inner">
      <span class="sn-name lw">{name}</span>
      <a href="#about">About</a>
      <a href="#location">Location</a>
      <a href="#accommodations">Accommodations</a>
      <a href="#dining">{restaurant}</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </div>
  </div>

  <section class="section canvas" id="about">
    <div class="section-head aligned r" style="color:var(--ink)">
      <div><span class="section-eyebrow ui-label">About</span></div>
      <div><h2 class="section-title">{about_title}</h2></div>
    </div>
    <div class="intro r d1" style="color:var(--ink)">
      <h2 class="intro-h">{about_kicker}</h2>
      <div class="intro-body">
{about_body}
      </div>
    </div>
  </section>

  <section class="section bone gallery">
    <div class="section-head r" style="color:var(--ink)">
      <div><span class="section-eyebrow ui-label">The house</span></div>
      <div><h2 class="section-title">{spaces_title}</h2></div>
    </div>
    <div class="gallery-rail" data-rail="auto" data-rail-speed="0.5">
{gallery}
    </div>
  </section>

  <section class="section map-section" id="location">
    <div class="section-head r">
      <div><span class="section-eyebrow ui-label">Location</span></div>
      <div><h2 class="section-title">{location_title}</h2><p class="section-lead">{location_lead}</p></div>
    </div>
    <div class="map-full r">
      <div id="leafMap" class="leaf-map" aria-label="Map of José Ignacio"></div>
      <div class="map-view" role="tablist" aria-label="Map view">
        <button type="button" data-view="map">Map</button>
        <button type="button" class="active" data-view="sat">Satellite</button>
      </div>
      <div class="map-bar"><ul id="mapLegend" class="mb-list"></ul></div>
    </div>
    <div class="split-facts" style="max-width:var(--max);margin:3rem auto 0">
      <div><span>Address</span><span>{address}</span></div>
      <div><span>From Punta del Este · PDP</span><span>{from_pdp}</span></div>
      <div><span>From Montevideo · MVD</span><span>{from_mvd}</span></div>
      <div><span>Transfers</span><span>Arranged by your Journey Designer</span></div>
    </div>
  </section>

  <section class="section" id="accommodations" style="padding-bottom:0">
    <div class="section-head r">
      <div><span class="section-eyebrow ui-label">Accommodations</span></div>
      <div><h2 class="section-title">{rooms_title}</h2><p class="section-lead">{rooms_lead}</p></div>
    </div>
    <div class="wall" data-wall>
      <span class="wall-hint">Scroll · drag · click a room</span>
{tiles}
    </div>
  </section>

  <section class="section canvas" id="dining">
    <div class="split r" style="color:var(--ink)">
      <div class="split-media"><img src="assets/img/t/{dining_img}-w900.jpg" alt="{restaurant}"></div>
      <div class="split-body">
        <span class="ui-label text-vik">Dining · {name}</span>
        <h2>{restaurant}</h2>
{dining_body}
        <div class="split-facts">
          <div><span>Cuisine</span><span>{dining_cuisine}</span></div>
          <div><span>Location</span><span>{name}</span></div>
          <div><span>Hours</span><span>{dining_hours}</span></div>
          <div><span>Open to</span><span>Guests of all three retreats</span></div>
        </div>
        <div style="display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:.5rem">
          <a class="btn-line" href="dining.html#{dining_anchor}"><span>Reserve a table</span><span class="arw">→</span></a>
          <a class="btn-line" href="dining.html"><span>All dining</span><span class="arw">→</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="experience">
    <div class="section-head r">
      <div><span class="section-eyebrow ui-label">Experience</span></div>
      <div><h2 class="section-title">{exp_title}</h2><p class="section-lead">{exp_lead}</p></div>
    </div>
    <div class="card-grid alt r d1">
{cards}
    </div>
  </section>

  <section class="booking" id="book">
    <div class="booking-bg"><img src="assets/img/t/{hero1}-w1600.jpg" alt=""></div>
    <div class="booking-inner">
      <div class="booking-head">
        <div>
          <span class="ui-label text-vik">Book your stay</span>
          <h2 class="booking-title">{book_title}</h2>
        </div>
        <p class="booking-note">Bookassist · PayPal accepted<br>Best rate, booked direct<br>guestexperience@vikretreats.com</p>
      </div>
      <form class="booking-form" data-booking>
        <div class="bk-field">
          <label for="bkProp">Retreat</label>
          <select id="bkProp" name="property">
            <option value="{key}" selected>{name}</option>
            <option value="estancia">Estancia VIK</option>
            <option value="playa">Playa VIK</option>
            <option value="bahia">Bahía VIK</option>
          </select>
        </div>
        <div class="bk-field"><label for="bkIn">Arrive</label><input id="bkIn" name="checkin" type="date"></div>
        <div class="bk-field"><label for="bkOut">Depart</label><input id="bkOut" name="checkout" type="date"></div>
        <div class="bk-field">
          <label for="bkAd">Guests</label>
          <select id="bkAd" name="adults">
            <option value="1">1 guest</option><option value="2" selected>2 guests</option>
            <option value="3">3 guests</option><option value="4">4 guests</option>
            <option value="6">6 guests</option><option value="8">Group · 8+</option>
          </select>
        </div>
        <button class="bk-submit" type="submit"><span>Check availability</span><span class="arw">→</span></button>
      </form>
      <div class="booking-foot">
        <div class="booking-alts">
          <a class="btn-line" href="stay.html#choose"><span>Help Me Choose</span><span class="arw">→</span></a>
          <a class="btn-line" href="#contact"><span>Contact {shortname}</span><span class="arw">→</span></a>
        </div>
        <div class="booking-trust"><span>Direct rate</span><span>Free cancellation*</span><span>Journey Designer included</span></div>
      </div>
    </div>
  </section>

  <section class="section canvas" id="contact">
    <div class="section-head aligned r" style="color:var(--ink)">
      <div><span class="section-eyebrow ui-label">Contact</span></div>
      <div><h2 class="section-title">Talk to the house.</h2><p class="section-lead">When the booking engine cannot answer the question, reaching the team should take one message.</p></div>
    </div>

    <div class="enquiry r d1" style="color:var(--ink)">

      <div class="enq-side">
        <p class="enq-statement">Tell us who is coming and what the trip is for. A Journey Designer answers, <em>not a form</em>.</p>
        <div class="enq-lines">
          <div class="enq-line">
            <span class="k">Email</span>
            <a class="v" href="mailto:guestexperience@vikretreats.com">guestexperience@vikretreats.com</a>
          </div>
          <div class="enq-line">
            <span class="k">{name}</span>
            <span class="v">{address}</span>
          </div>
          <div class="enq-line">
            <span class="k">Reservations</span>
            <span class="v">Direct booking · Bookassist · PayPal</span>
          </div>
          <div class="enq-line">
            <span class="k">Answered</span>
            <span class="v">Within 24 hours, every day</span>
          </div>
        </div>
      </div>

      <form class="enq-form" onsubmit="return false">
        <div class="enq-field">
          <span class="n">01</span>
          <label for="f1">Your name</label>
          <input id="f1" type="text" placeholder="Who we are writing back to">
        </div>
        <div class="enq-field">
          <span class="n">02</span>
          <label for="f2">Email</label>
          <input id="f2" type="email" placeholder="you@email.com">
        </div>
        <div class="enq-pair">
          <div class="enq-field">
            <span class="n">03</span>
            <label for="f3">When</label>
            <input id="f3" type="text" placeholder="January, roughly">
          </div>
          <div class="enq-field">
            <span class="n">04</span>
            <label for="f4">Who</label>
            <input id="f4" type="text" placeholder="Two adults">
          </div>
        </div>
        <div class="enq-field">
          <span class="n">05</span>
          <label for="f5">What the trip is for</label>
          <textarea id="f5" rows="3" placeholder="A week off, a birthday, riding, the wine — anything that helps us plan it."></textarea>
        </div>
        <div class="enq-foot">
          <button class="bk-submit standalone" type="submit"><span>Send enquiry</span><span class="arw">→</span></button>
          <p class="enq-note">No account, no newsletter. Your note goes straight to the {shortname} team.</p>
        </div>
      </form>

    </div>
  </section>

</main>

<div class="room-view" id="roomView" role="dialog" aria-modal="true" aria-labelledby="roomName">
  <button class="room-close" type="button" data-room-close aria-label="Close">✕</button>
  <div class="room-hero">
    <div class="room-shots"></div>
    <div class="room-cap">
      <span class="ui-label" id="roomMeta" style="opacity:.7"></span>
      <div class="room-head">
        <h2 id="roomName"></h2>
        <div class="room-thumbs" id="roomThumbs"></div>
      </div>
      <div class="room-actions">
        <a class="btn-solid" href="#book"><span>Book this room</span><span class="arw">→</span></a>
        <a class="btn-line" href="#contact"><span>Ask a Journey Designer</span><span class="arw">→</span></a>
      </div>
    </div>
  </div>
  <div class="room-body">
    <div>
      <p id="roomCopy"></p>
    </div>
    <div>
      <p class="mono-copy muted-light">Every room at VIK José Ignacio was commissioned, not decorated. The artist, the material and the position on the site are the room — which is why choosing between them matters more here than the number of square metres.</p>
      <div class="split-facts" style="margin-top:2rem">
        <div><span>Retreat</span><span>{name}</span></div>
        <div><span>Dining</span><span>{restaurant}</span></div>
        <div><span>Booking</span><span>Direct · Bookassist</span></div>
      </div>
    </div>
  </div>
</div>

  <div class="room-nav" aria-label="Rooms">
    <button type="button" data-room-prev aria-label="Previous room"><svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.2"/></svg></button>
    <span class="rn-count">01 / 01</span>
    <button type="button" data-room-next aria-label="Next room"><svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.2"/></svg></button>
  </div>

<div data-vik-checkout></div>

<div data-vik-footer></div>

<script src="core/vik-chrome.js?v=12"></script>
<script src="core/vik-i18n.js"></script>
<script src="assets/js/lenis.min.js"></script>
<script src="assets/js/gsap.min.js"></script>
<script src="assets/js/scrolltrigger.min.js"></script>
<script src="assets/js/leaflet.js"></script>
<script src="core/vik-motion.js?v=11"></script>
<script src="core/vik-live.js?v=4"></script>
<script src="core/vik-wall.js?v=20"></script>
<script src="core/vik-chooser.js?v=2"></script>
<script src="core/vik-checkout.js?v=1"></script>
<script src="core/vik-booking.js?v=4"></script>
</body>
</html>
'''

def slug(img):
    return img.replace('/', '__').rsplit('.', 1)[0]

def tile(img, name, meta, copy, group="", gallery=()):
    g = ' data-group="%s"' % group if group else ""
    gal = ' data-gallery="%s"' % " | ".join(gallery) if gallery else ""
    return ('      <a class="wall-tile" href="#accommodations" data-img="%s" data-name="%s" '
            'data-meta="%s"%s%s data-copy="%s"></a>' % (img, name, meta, g, gal, copy))

def slide(img, cap):
    return ('      <figure class="gallery-card"><img src="assets/img/t/%s-w900.jpg" alt="%s">'
            '<span>%s</span></figure>' % (slug(img), cap, cap))

def card(img, when, status, title, body, cta, href):
    return ('''      <article class="vcard media" style="background-image:linear-gradient(180deg,rgba(10,9,7,.15),rgba(10,9,7,.84)),url('assets/img/t/%s-w900.jpg')">
        <div class="vcard-top"><span class="vcard-when">%s</span><span class="vcard-status">%s</span></div>
        <h3>%s</h3>
        <p>%s</p>
        <div class="vcard-actions"><a class="btn-line" href="%s"><span>%s</span><span class="arw">→</span></a></div>
      </article>''' % (slug(img), when, status, title, body, href, cta))

def film_card(video, when, status, title, body, cta, href):
    return ('''      <article class="vcard film">
        <video autoplay muted loop playsinline preload="none" poster="assets/video/%s-poster.jpg" data-src="assets/video/%s.mp4"></video>
        <div class="vcard-top"><span class="vcard-when">%s</span><span class="vcard-status">%s</span></div>
        <h3>%s</h3>
        <p>%s</p>
        <div class="vcard-actions"><a class="btn-line" href="%s"><span>%s</span><span class="arw">→</span></a></div>
      </article>''' % (video, video, when, status, title, body, href, cta))

def paras(items, lead=True):
    out = []
    for i, t in enumerate(items):
        c = ' class="lead"' if (lead and i == 0) else ''
        out.append('        <p%s>%s</p>' % (c, t))
    return '\n'.join(out)
