/* Only the visual library owns these interactions. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tag = $('#nav .nav-tag');
  if (tag) tag.textContent = 'Module Library';
  const logo = $('footer.sg-footer .footer-mark img');
  if (logo) logo.src = '../vik-jose-ignacio/assets/logo/wordmark-dark-blue.svg';
  const signature = $('footer.sg-footer .footer-copy');
  if (signature) signature.textContent = 'VIK Retreats, José Ignacio Uruguay';

  const search = $('#sg-search'), category = $('#sg-category');
  const entries = $$('.sg-toc a');
  function enableJump(link) {
    link.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); link.click(); }
    });
    link.addEventListener('click', event => {
      const target = $(link.getAttribute('href'));
      if (!target || event.ctrlKey || event.metaKey) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const inset = $('#nav').getBoundingClientRect().height + 12;
      // Long review pages should jump directly, without crossing every demo.
      if (window.VIKLibraryScroll) window.VIKLibraryScroll.scrollTo(target, {offset:-inset,immediate:true});
      else window.scrollTo({top:target.getBoundingClientRect().top + scrollY - inset,behavior:'instant'});
    }, true);
  }
  entries.forEach(enableJump);
  $$('#nav .nav-book').forEach(enableJump);
  function filter() {
    const value = search.value.trim().toLowerCase();
    entries.forEach(a => { a.hidden = !(a.textContent.toLowerCase().includes(value) && (category.value === 'All modules' || a.dataset.category === category.value)); });
    const count = entries.filter(a => !a.hidden).length;
    $('.sg-results').textContent = count ? `${count} modules to explore` : 'No matches. Try another name or category.';
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  filter();

  // The live chrome markup, with independent IDs inside the inline preview.
  const demo = $('.sg-nav-demo');
  function clone(source) {
    if (!source) return null;
    const copy = source.cloneNode(true);
    [copy, ...$$('*', copy)].forEach(el => {
      ['id', 'for', 'aria-controls', 'aria-labelledby'].forEach(attr => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, el.getAttribute(attr).split(' ').map(id => `sg-demo-${id}`).join(' '));
      });
      el.removeAttribute('data-booking');
    });
    return copy;
  }
  const nav = clone($('#nav')), book = clone($('#bookbar'));
  if (nav) demo.append(nav);
  $$('.nav-book', demo).forEach(enableJump);
  const menu = document.createElement('div');
  menu.className = 'sg-demo-menu'; menu.id = 'sg-demo-menu'; menu.hidden = true;
  $$('#menu .menu-list a').forEach(a => menu.append(a.cloneNode(true)));
  $$('a', menu).forEach(a => a.addEventListener('click', event => {
    event.preventDefault(); location.assign(a.href);
  }));
  demo.append(menu);
  if (book) {
    demo.append(book);
    const arrival = $('input[name="checkin"]', book), departure = $('input[name="checkout"]', book);
    function paintDates() {
      if (arrival.value) {
        const next = new Date(`${arrival.value}T12:00:00Z`);
        next.setUTCDate(next.getUTCDate()+1);
        departure.min = next.toISOString().slice(0,10);
        if (departure.value <= arrival.value) departure.value = departure.min;
      }
      $$('input[type="date"]', book).forEach(input => {
        const face = $('.date-face', input.parentElement);
        if (face && input.value) {
          const date = new Date(`${input.value}T12:00:00`);
          face.textContent = `${date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}, ${date.toLocaleDateString('en-GB',{weekday:'short'})}`;
        }
      });
    }
    book.addEventListener('change', paintDates);
    paintDates();
    book.addEventListener('submit', event => {
      event.preventDefault();
      const form = $('#book [data-booking]') || $('#book form');
      if (!form) return;
      $$('input,select', book).forEach(field => {
        const target = $$('input,select', form).find(x => x.name === field.name);
        if (target) { target.value = field.value; target.dispatchEvent(new Event('change', {bubbles:true})); }
      });
      if (window.VIKLibraryScroll) window.VIKLibraryScroll.scrollTo(form, {offset:-100,immediate:true});
      else form.scrollIntoView({behavior:'instant', block:'center'});
    });
  }
  const toggle = $('.menu-toggle', demo);
  if (toggle) toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  });
  demo.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      menu.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.focus();
    }
  });

  const dialog = $('.sg-lightbox'), mediaBox = $('.sg-lightbox-media');
  let returnTo, previousOverflow;
  function enlarge(a) {
    returnTo = a; mediaBox.replaceChildren();
    const video = a.dataset.sgMedia === 'video';
    const media = document.createElement(video ? 'video' : 'img');
    media.src = a.href;
    const caption = $('figcaption', a.closest('figure')).textContent;
    if (video) { media.controls = true; media.muted = true; media.loop = true; media.playsInline = true; }
    else media.alt = caption;
    mediaBox.append(media); $('.sg-lightbox-caption').textContent = caption;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal(); $('.sg-lightbox-close').focus();
    if (video) media.play().catch(() => {});
  }
  $('.sg-lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    $('video', mediaBox)?.pause(); mediaBox.replaceChildren();
    document.body.style.overflow = previousOverflow || '';
    returnTo?.focus({preventScroll:true});
  });

  const videoObserver = new IntersectionObserver(records => records.forEach(({target:video,isIntersecting}) => {
    if (isIntersecting && !reduced.matches && !navigator.connection?.saveData) {
      if (!video.src) video.src = video.dataset.sgSrc;
      video.play().catch(() => {});
    } else video.pause();
  }), {threshold:.1});
  function observeVideos(root) { $$('video[data-sg-src]', root).forEach(video => videoObserver.observe(video)); }

  $$('.sg-carousel').forEach(carousel => {
    const track = $('.sg-track', carousel), original = $('.sg-set', track);
    // Three equal sets allow recentering at the same visual position.
    const before = original.cloneNode(true), after = original.cloneNode(true);
    [before, after].forEach(copy => {
      copy.setAttribute('aria-hidden', 'true');
      $$('a', copy).forEach(a => a.tabIndex = -1);
    });
    track.prepend(before); track.append(after);
    let period = 0, offset = 0, rendered = 0, active = false, paused = reduced.matches;
    let pointer = null, startX = 0, lastX = 0, moved = false, lastTime = 0, hovered = false;
    function resize() {
      const old = period;
      period = original.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      offset = old ? (offset / old) * period : 0;
      track.scrollLeft = period + offset;
      rendered = track.scrollLeft;
    }
    new ResizeObserver(resize).observe(original);
    function move(delta) {
      if (!period) return;
      // Keep subpixel progress: scrollLeft is rounded in some browsers.
      if (Math.abs(track.scrollLeft - rendered) > 1) offset = track.scrollLeft - period;
      offset = ((offset + delta) % period + period) % period;
      track.scrollLeft = period + offset;
      rendered = track.scrollLeft;
    }
    const pause = $('[data-sg-pause]', carousel);
    function pauseLabel() { pause.textContent = paused ? 'Play motion' : 'Pause motion'; pause.setAttribute('aria-pressed', String(paused)); }
    pauseLabel();
    pause.addEventListener('click', () => { paused = !paused; pauseLabel(); });
    $('[data-sg-prev]', carousel).addEventListener('click', () => move(-$('.sg-slide', original).getBoundingClientRect().width - 20));
    $('[data-sg-next]', carousel).addEventListener('click', () => move($('.sg-slide', original).getBoundingClientRect().width + 20));
    track.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      pointer = event.pointerId; startX = lastX = event.clientX; moved = false;
    });
    track.addEventListener('pointermove', event => {
      if (pointer !== event.pointerId) return;
      if (Math.abs(event.clientX - startX) > 5) { moved = true; track.setPointerCapture(pointer); track.classList.add('is-dragging'); }
      if (moved) { move(lastX - event.clientX); event.preventDefault(); }
      lastX = event.clientX;
    });
    function release(event) {
      if (event.pointerId !== pointer) return;
      if (track.hasPointerCapture(pointer)) track.releasePointerCapture(pointer);
      pointer = null; track.classList.remove('is-dragging');
    }
    track.addEventListener('pointerup', release); track.addEventListener('pointercancel', release);
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('click', event => {
      const a = event.target.closest('[data-sg-media]');
      if (!a) return;
      event.preventDefault(); if (!moved) enlarge(a);
      moved = false;
    });
    track.addEventListener('keydown', event => {
      const mediaLink = event.target.closest('[data-sg-media]');
      if (event.key === 'Enter' && mediaLink) { event.preventDefault(); enlarge(mediaLink); return; }
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault(); move((event.key === 'ArrowLeft' ? -1 : 1) * 280);
    });
    track.addEventListener('mouseenter', () => hovered = true);
    track.addEventListener('mouseleave', () => { hovered = false; });
    new IntersectionObserver(records => { active = records[0].isIntersecting; }, {threshold:0}).observe(carousel);
    function tick(time) {
      if (active && !paused && !hovered && pointer === null && !dialog.open && !track.contains(document.activeElement) && !document.hidden) move(Math.min(time-lastTime,50)*.018);
      lastTime = time; requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    reduced.addEventListener('change', () => { paused = reduced.matches; pauseLabel(); });
  });
  observeVideos(document);
});
