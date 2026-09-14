/* Documented cases for the Digital Style Guide; no production booking side effects. */
document.addEventListener('DOMContentLoaded',()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const brandAssets={
    'vik retreats':'vik-retreats','estancia vik':'estancia-vik','playa vik':'playa-vik',
    'bahía vik':'bahia-vik','vik chile':'vik-chile','la susana':'la-susana','pavilion vik':'pavilion-vik'
  };
  const headerBrand=$('#nav .nav-left>a');
  if(headerBrand){
    const img=document.createElement('img');img.src='assets/vik-retreats-black.png';img.alt='VIK Retreats';img.className='sg-main-logo';
    headerBrand.replaceChildren(img);headerBrand.href='../vik-retreats/';headerBrand.setAttribute('aria-label','VIK Retreats');
  }
  // Navigation references use the same supplied marks; surrounding prose stays readable text.
  $$('#menu .menu-sub a,.footer-links a,.crumb a').forEach(a=>{
    const name=a.textContent.trim(),asset=brandAssets[name.toLowerCase()];if(!asset)return;
    const img=document.createElement('img');img.src=`assets/${asset}-${a.closest('footer,#menu')?'white':'black'}.png`;img.alt=name;img.className='sg-reference-logo';a.replaceChildren(img);
  });
  // Measure the natural menu width, even in compact mode. Never squeeze its typography.
  $$('.sg-header-demo').forEach(demo=>{
    const header=$('.sg-case-header',demo),menu=$('.sg-case-menu',demo),toggle=$('.sg-case-toggle',demo),nav=$('.sg-case-nav',demo);
    function fit(){
      const needed=$('.sg-case-brands',demo).offsetWidth+$('.sg-case-actions',demo).offsetWidth+nav.scrollWidth+96;
      const compact=demo.dataset.navMode!=='fluid'||needed>header.clientWidth;
      demo.classList.toggle('is-compact',compact);
      if(!compact){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
    }
    new ResizeObserver(fit).observe(header);document.fonts.ready.then(fit);fit();
    toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
    demo.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  });
  // Five isolated booking examples share validation, dates and the same handoff.
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  $$('.sg-book-strip').forEach(form=>{
    const arrival=$('[name=arrival]',form),departure=$('[name=departure]',form),status=$('.sg-book-feedback',form),state=Number(form.dataset.bookState);
    const today=new Date();arrival.min=iso(today);
    if(state>1){const date=new Date(today.getFullYear()+1,0,10+(state===5?1:0));arrival.value=iso(date);date.setDate(date.getDate()+(state===4?5:3));departure.value=iso(date);}
    function validate(){
      if(arrival.value){const date=new Date(arrival.value+'T12:00:00');date.setDate(date.getDate()+1);departure.min=iso(date);if(departure.value&&departure.value<=arrival.value)departure.value=departure.min;}
      $('button',form).disabled=!arrival.value||!departure.value||!form.checkValidity();
    }
    form.addEventListener('change',()=>{validate();status.textContent='';});validate();
    form.addEventListener('submit',e=>{
      e.preventDefault();if(!form.checkValidity())return;
      if(state===3||state===4){status.textContent='Try another arrival date. This is an availability example.';arrival.focus();return;}
      status.textContent='Dates selected for this preview.';
      const target=$('#r01');if(window.VIKLibraryScroll)window.VIKLibraryScroll.scrollTo(target,{offset:-100,immediate:true});else target.scrollIntoView();
      $('#sg-ckName').focus({preventScroll:true});
    });
  });
  // A single visible story. Overlapping grid cells keep the module height stable.
  $$('.sg-stories').forEach(module=>{
    const states=$$('[data-story-state]',module),buttons=$$('[data-story-select]',module);
    let current=0,visible=false,timer;
    const auto=()=>!reduced.matches&&!navigator.connection?.saveData;
    function schedule(){clearTimeout(timer);if(visible&&auto()&&!document.hidden)timer=setTimeout(()=>show((current+1)%states.length),9000);}
    function play(){const video=$('video',states[current]);if(!auto()||!visible||document.hidden){video.pause();return;}if(!video.src)video.src=video.dataset.storySrc;video.play().catch(()=>{});}
    function show(index){
      current=index;
      states.forEach((state,i)=>{const on=i===index;state.classList.toggle('is-active',on);state.setAttribute('aria-hidden',String(!on));state.inert=!on;if(!on)$('video',state).pause();buttons[i].setAttribute('aria-pressed',String(on));});
      play();schedule();
    }
    buttons.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){play();schedule();}else{clearTimeout(timer);states.forEach(s=>$('video',s).pause());}},{threshold:.15}).observe(module);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);states.forEach(s=>$('video',s).pause());}else{play();schedule();}});
    reduced.addEventListener('change',()=>show(current));
  });
  // Fisher–Yates sampling without replacement; never alter the source quotations.
  const quotes=[...(window.VIKStyleQuotes||[])];
  for(let i=quotes.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[quotes[i],quotes[j]]=[quotes[j],quotes[i]];}
  const grid=$('.sg-recognition-grid');
  if(grid&&quotes.length>=3){
    grid.replaceChildren(...quotes.slice(0,3).map(item=>{
      const card=document.createElement('article');card.className='sg-recognition';
      const quote=document.createElement('q');quote.textContent=item.text;
      const cite=document.createElement('cite');cite.textContent=item.publication;
      const credit=document.createElement('span');credit.className='d';credit.textContent=[item.author,item.property].filter(Boolean).join(' · ');
      const link=document.createElement('a');link.className='link sg-story-cta';link.href=item.url;link.target='_blank';link.rel='noopener';link.textContent='Read story →';
      card.append(quote,cite,credit,link);return card;
    }));
  }
  // Retain the native browser behavior for real destinations despite the old prototype guard.
  // Hash demos, media previews and custom controls continue to use their own handlers.
  window.addEventListener('click',event=>{
    const a=event.target.closest?.('a');if(!a)return;
    const href=a.getAttribute('href');if(!href)return;
    if(a.hasAttribute('data-sg-media'))return;
    if(!href.startsWith('#'))event.stopPropagation();
    else if(href.length>1&&!a.closest('.sg-toc')){
      const target=document.getElementById(href.slice(1));if(!target)return;
      event.preventDefault();event.stopPropagation();
      if(window.VIKLibraryScroll)window.VIKLibraryScroll.scrollTo(target,{offset:-100,immediate:true});else target.scrollIntoView();
    }
  },true);
  window.addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;const a=event.target.closest?.('a[href]');
    if(a&&!a.getAttribute('href').startsWith('#')&&!a.hasAttribute('data-sg-media'))event.stopPropagation();
  },true);
  // Make every valid local anchor work, including dynamically generated demo menus.
  $$('.sg-case-menu a[href^="#"],.sg-case-actions a[href^="#"],.footer-links a[href^="#"],.club-actions a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{
    const target=$(a.getAttribute('href'));if(!target)return;event.preventDefault();
    if(window.VIKLibraryScroll)window.VIKLibraryScroll.scrollTo(target,{offset:-100,immediate:true});else target.scrollIntoView();
  }));
});
