/* Only the visual library owns these interactions. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tag = $('#nav .nav-tag');
  if (tag) tag.textContent = 'Style Guide';
  const logo = $('footer.sg-footer .footer-mark img');
  if (logo) logo.src = 'assets/vik-retreats-white.png';
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
  $$('.sg-inclusion').forEach(enableJump);
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
    let velocity = 0, lastPointerTime = 0;
    const portrait = carousel.classList.contains('sg-portrait');
    const slides = $$('.sg-slide', track);
    function resize() {
      const old = period;
      period = original.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
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
    track.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      pointer = event.pointerId; startX = lastX = event.clientX; moved = false;
      velocity = 0; lastPointerTime = performance.now();
    });
    track.addEventListener('pointermove', event => {
      if (pointer !== event.pointerId) return;
      if (Math.abs(event.clientX - startX) > 5) { moved = true; track.setPointerCapture(pointer); track.classList.add('is-dragging'); }
      if (moved) {
        const now = performance.now(), dt = now-lastPointerTime;
        // Same release velocity and .93 decay as vik-v2.js dragScroll.
        if (dt > 0) velocity = Math.max(-60,Math.min(60,(lastX-event.clientX)*(16/dt)));
        move(lastX - event.clientX); event.preventDefault(); lastPointerTime = now;
      }
      lastX = event.clientX;
    });
    function release(event) {
      if (event.pointerId !== pointer) return;
      if (track.hasPointerCapture(pointer)) track.releasePointerCapture(pointer);
      if (event.type === 'pointercancel' || performance.now()-lastPointerTime > 100 || reduced.matches) velocity = 0;
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
      if (event.code === 'Space') { event.preventDefault(); paused = !paused; velocity = 0; return; }
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault(); move((event.key === 'ArrowLeft' ? -1 : 1) * 280);
    });
    track.addEventListener('mouseenter', () => hovered = true);
    track.addEventListener('mouseleave', () => { hovered = false; });
    new IntersectionObserver(records => { active = records[0].isIntersecting; }, {threshold:0}).observe(carousel);
    function tick(time) {
      const dt = Math.min(time-lastTime,50);
      if (active && !dialog.open && !document.hidden) {
        if (pointer === null && Math.abs(velocity) >= .4) {
          move(velocity*dt/16); velocity *= Math.pow(.93,dt/16);
        } else if (!paused && !hovered && pointer === null && !track.contains(document.activeElement)) move(dt*.018);
        if (portrait && !reduced.matches) {
          const width = track.clientWidth;
          slides.forEach(slide => {
            const position = slide.offsetLeft-track.scrollLeft;
            if (position > -slide.offsetWidth && position < width) {
              const depth = Math.max(-1,Math.min(1,(position+slide.offsetWidth/2-width/2)/width));
              $('img,video',slide).style.transform = `translateX(${depth*6}px) scale(1.035)`;
            }
          });
        }
      }
      lastTime = time; requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    reduced.addEventListener('change', () => {
      paused = reduced.matches; velocity = 0;
      if (reduced.matches) slides.forEach(slide => $('img,video',slide).style.transform = '');
    });
  });
  observeVideos(document);

  // Local review only: validate the guest step, without sending or storing data.
  const guest = $('#r01 form'), next = $('[data-review-next]'), confirm = $('[data-review-confirm]');
  const guestName = $('#sg-ckName'), guestEmail = $('#sg-ckMail');
  const methodButtons = $$('[data-review-method]');
  let method = 'card';
  function validGuest() { return guestName.value.trim().length > 1 && guestEmail.validity.valid && !!guestEmail.value.trim(); }
  function updateBooking() {
    const valid = validGuest(); next.disabled = !valid; confirm.disabled = !valid;
    $('span',confirm).textContent = method === 'paypal' ? 'Continue to PayPal' : method === 'hold' ? 'Confirm hold' : 'Confirm booking';
    if (!valid) $('#r02 .sg-review-status').textContent = 'Complete your name and email above to continue.';
    else $('#r02 .sg-review-status').textContent = 'Your stay is a little closer.';
  }
  guest.addEventListener('input',updateBooking);
  function jumpTo(id) {
    const target = $(id);
    if (window.VIKLibraryScroll) window.VIKLibraryScroll.scrollTo(target,{offset:-100,immediate:true});
    else target.scrollIntoView({block:'start'});
  }
  next.addEventListener('click',()=>{ if(validGuest()) { jumpTo('#r02'); methodButtons[0].focus({preventScroll:true}); } });
  $$('[data-review-back]').forEach(button=>button.addEventListener('click',()=>jumpTo(button.closest('#r02')?'#r01':'#book')));
  methodButtons.forEach(button=>button.addEventListener('click',()=>{
    method = button.dataset.reviewMethod;
    methodButtons.forEach(b=>{const selected=b===button;b.classList.toggle('is-on',selected);b.setAttribute('aria-pressed',String(selected));});
    $$('[data-review-panel]').forEach(panel=>panel.hidden=panel.dataset.reviewPanel!==method);
    updateBooking();
  }));
  confirm.addEventListener('click',()=>{
    if(validGuest()) $('#r02 .sg-review-status').textContent = 'Ready for secure booking. No reservation is made in this preview.';
  });
  updateBooking();
  const enquiry = $('#r03 form'), send = $('[data-review-send]');
  enquiry.addEventListener('input',()=>{
    send.disabled = !enquiry.checkValidity() || $('#review-eqn').value.trim().length < 2;
    $('#r03 .sg-review-status').textContent = '';
  });
  enquiry.addEventListener('submit',event=>{
    event.preventDefault();
    if (!send.disabled) $('#r03 .sg-review-status').textContent = 'Your enquiry is ready. Nothing is sent from this preview.';
  });
});
