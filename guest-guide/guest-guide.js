/* The approved two-tap journey, rendered with the local Vik visual system. */
(() => {
  'use strict';
  const D=GUIDE_DATA, main=document.getElementById('main');
  const media='assets/video/';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const listenMedia=(query,handler)=>query.addEventListener?query.addEventListener('change',handler):query.addListener?.(handler);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=s=>encodeURIComponent(s).replace(/['()!*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
  const owns=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const names={...Object.fromEntries(D.sections.map(s=>[s.k,s.n])),home:'Your stay',info:'Guest Information',dining:'Dining',experiences:'Experiences',wellness:'Wellness',explore:'Explore Vik'};
  const pictures={destinations:'landscape',retreats:'dest-bahia',stay:'pillar-hospitality',taste:'pillar-dining',wellbeing:'wk-yoga',gather:'card-pavilion','art-design':'pillar-art',wine:'pillar-terroir','our-story':'pillar-shaped',bahia:'dest-bahia',playa:'dest-playa',estancia:'dest-estancia',info:'pillar-shaped',dining:'pillar-dining',experiences:'wk-ride',wellness:'wk-yoga',explore:'pillar-art'};
  const heroFilms={wellbeing:'pillar-wellness',wellness:'pillar-wellness',experiences:'dest-estancia'};
  const categoryImages={horses:'wk-ride',country:'dest-estancia',water:'dest-playa',sport:'pillar-shaped',art:'pillar-art',tour:'dest-bahia'};
  const restaurantImages={'Zodiaco':'dining-zodiaco','CieloMar':'dining-cielomar','Azur':'dining-cielomar','El Asador':'dining-asador','La Susana':'dining-susana'};
  const venueImages=['dest-estancia','dest-playa','dest-bahia','card-shack','dining-susana','card-pavilion'];
  const filters=[['all','All'],['water','Water'],['horses','Horses'],['country','Countryside'],['art','Art & Culture'],['sport','Sport'],['tour','Day Tours']];
  const query=new URLSearchParams(location.search).get('property');
  const fromQR=owns(D.properties,query)||owns(D.properties,location.hash.replace(/^#\/?/,'').split('/')[0]);
  let state={property:null,view:'home',filter:'all'}, pendingItem=null, observer=null, railObserver=null, revealObserver=null, autoRailFrame=null;
  let usedMedia=new Set();
  const prop=()=>D.properties[state.property];
  const arrow='<svg class="arrow arrow-ne" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 12 12 4M5 4h7v7"/></svg>';
  const backArrow='<svg class="arrow arrow-back" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4 3 8l4 4"/></svg>';
  const plus='<span class="plus" aria-hidden="true">+</span>';
  const logo=(name='vik-retreats',color='black',cls='brand-logo')=>`<img class="${cls}" src="assets/logo/lw-${name}-${color}.png" alt="${escape(name.replace(/-/g,' ').replace(/vik/g,'Vik'))}" width="180" height="30">`;
  const img=(file,alt='',cls='',priority=false)=>`<img class="${cls}" src="${media}${file}-poster.webp" alt="${escape(alt)}" width="900" height="508" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}>`;
  const route=(view='home',property=state.property)=>`#/${property}${view==='home'?'':'/'+view}`;
  const resolve=x=>x.ref?D.experiences.find(e=>e.n===x.ref):x;
  function whatsapp(item='',type='generic',number=null) {
    const base=prop()?`Hi, I'm staying at ${prop().name}. `:'Hi, ';
    const message=type==='restaurant'?`${base}I'd like to book a table at ${item}. Date, time and number of guests: `
      :type==='book'?`${base}I'd like to book: ${item}. Preferred date and time: `
      :`${base}I'd like to ask about ${item?item+'. ':''}`;
    const target=String(number||prop()?.deskNum||'59895444451').replace(/\D/g,'');
    return `https://wa.me/${target}?text=${safe(message)}`;
  }
  function book(item,type='book',channel='journeyDesigner') {
    if(channel==='shack'&&!D.shackWhatsApp)return `<div class="pending"><p>Direct contact for The Shack is not yet available.</p></div><a class="book" href="${whatsapp(item,'generic')}" target="_blank" rel="noopener">Ask your Experience Concierge ${arrow}</a>`;
    return `<a class="book" href="${whatsapp(item,type,channel==='shack'?D.shackWhatsApp:prop()?.deskNum)}" target="_blank" rel="noopener">${type==='restaurant'?'Reserve a table':'Book via WhatsApp'} ${arrow}</a>`;
  }
  const pending=text=>text?`<div class="pending"><p>${escape(text)}</p></div>`:'';
  const hours=rows=>rows.map(([k,v])=>`<div class="hours-row"><span>${escape(k)}</span><span class="value">${escape(v)}</span></div>`).join('');
  const groupTitle=(number,title,count='')=>`<div class="group-title"><span class="section-number">${number}</span><h2>${escape(title)}</h2>${count?`<span class="count">${count}</span>`:''}</div>`;
  function wifi(details=false) {
    const p=prop();
    return `<div class="${details?'info-wifi':'quick-details'}"><h2>Stay connected</h2><div class="wifi-row"><span class="k">Network</span><code>${escape(p.wifi.net)}</code></div><div class="wifi-row"><span class="k">Password</span><div class="wifi-value"><code>${escape(p.wifi.pw)}</code><button class="copy" data-copy="${escape(p.wifi.pw)}" aria-label="Copy Wi-Fi password">Copy</button></div></div><p class="copy-message" aria-live="polite"></p>${details?`<div class="desk-line"><div>Front Desk<br><span>${p.desk}</span></div><a class="text-link" href="${whatsapp('','generic',p.deskNum)}" target="_blank" rel="noopener">WhatsApp ${arrow}</a></div>`:''}</div>`;
  }
  function essentials(){return `<div class="essentials"><a class="essential-info-cta" href="${route('info')}"><span>Guest Information · Services & Practical</span>${arrow}</a><div class="essentials-top"><button class="essential-link" data-wifi aria-expanded="false" aria-controls="home-wifi"><span>Wi-Fi details</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 8a16 16 0 0120 0M5 12a11 11 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="20" r=".7"/></svg></button><a class="essential-link" href="${whatsapp('','generic',prop().deskNum)}" target="_blank" rel="noopener"><span>Front Desk</span>${arrow}</a></div><div id="home-wifi" hidden>${wifi()}</div></div>`;}
  function cinema(file,poster,label,title,view,cta,extra='') {
    return `<section class="cinema ${extra}" aria-label="${escape(label)}">${img(poster)}<video data-film="${media}${file}.mp4" poster="${media}${poster}-poster.webp" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video><span class="film-note">${escape(label)}</span><div class="cinema-copy"><h2 class="editorial">${title}</h2><a class="text-link" href="${route(view)}">${escape(cta)} ${arrow}</a></div></section>`;
  }
  function closing(){return `<section class="closing wrap"><h2>A person.<br><em>A little local</em> knowledge.</h2><div><p>${escape(D.services[0][1])}</p><a class="text-link" href="${whatsapp()}" target="_blank" rel="noopener">Contact your Experience Concierge ${arrow}</a></div><div class="closing-foot"><span>Vik Retreats · José Ignacio</span><a href="${route('info')}">YOUR STAY ↗</a></div></section>`;}
  function header(){
    document.body.classList.toggle('selector-entry',!prop());
    document.body.classList.toggle('film-entry',Boolean(prop())&&state.view==='home');
    document.getElementById('masthead').innerHTML=prop()?`<a class="home-link" href="${state.view==='home'?'#/':route()}" aria-label="${state.view==='home'?'Choose your retreat':'Back to home'}">${backArrow}</a><a class="brand-link" href="${route()}" aria-label="${escape(prop().name)} home">${logo(state.property+'-vik','black','property-logo')}</a><span class="header-label">Guest Guide</span>`:`<a class="brand-link" href="#/" aria-label="Guest Guide home">${logo()}</a><span class="header-label">Guest Guide · José Ignacio</span>`;
    document.getElementById('contact-bar').innerHTML=`${prop()?`<span class="contact-context">${escape(prop().name)}</span>`:''}<a href="${whatsapp()}" target="_blank" rel="noopener"><span>Contact your Experience Concierge</span>${arrow}</a>`;
  }
  function selector(){const captions={playa:'Art, architecture and the Atlantic.',bahia:'Barefoot living beside the ocean.',estancia:'Countryside rhythms, horses and open skies.'};return `<div class="selector wrap"><p class="eyebrow">Vik Retreats · José Ignacio</p><h1 class="editorial">Your stay.<span class="desktop-title-space"> </span><br class="mobile-title-break"><em>Your Vik.</em></h1><p class="intro-body">Everything you need during your stay.<br>Choose the place you call home.</p><div class="property-choices selector-property-rail" tabindex="0" role="region" aria-label="Choose a Vik property — swipe or use arrow keys">${['playa','bahia','estancia'].map((p,i)=>`<a class="property-choice" href="${route('home',p)}" aria-label="Stay at ${escape(D.properties[p].name)}"><img class="property-poster" src="${media+'dest-'+p+'-poster.webp'}" alt="" width="900" height="1125" loading="eager" decoding="async" fetchpriority="${i===0?'high':'auto'}"><video data-film="${media+'dest-'+p}.mp4" poster="${media+'dest-'+p}-poster.webp" data-poster="${media+'dest-'+p}-poster.webp" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video><span class="selector-card-copy"><span class="selector-card-head">${logo(p+'-vik','white','choice-logo')}${arrow}</span><span class="selector-card-description">${escape(captions[p])}</span></span></a>`).join('')}</div><div class="rail-progress selector-scroll-progress" aria-hidden="true"><span></span></div><a class="selector-contact" href="${whatsapp()}" target="_blank" rel="noopener"><span>Contact your Experience Concierge</span>${arrow}</a></div>`;}
  const desktopHomeLayout=matchMedia("(min-width:700px)");
  function desktopHome(){
    const p=prop();
    return `<div class="home-layout wrap"><div class="home-lead"><section class="welcome"><p class="eyebrow">Your stay · José Ignacio</p><h1 class="editorial">Welcome to<br><em>${escape(p.name)}</em></h1><p class="sub">Everything you need during your stay</p>${!fromQR?`<div class="context"><label for="property">Staying at</label><select id="property" aria-label="Your property">${Object.entries(D.properties).map(([k,v])=>`<option value="${k}"${k===state.property?' selected':''}>${escape(v.name)}</option>`).join('')}</select></div>`:''}</section>${essentials()}</div><nav class="section-index" aria-label="Guest Guide sections"><div class="section-intro"><span class="eyebrow">Make the most of your stay</span><span class="mono">01—05</span></div>${D.sections.map((s,i)=>`<a class="section-tile" href="${route(s.k)}"><span class="section-number">${String(i+1).padStart(2,'0')}</span><div class="tile-copy"><h2>${escape(s.n)}</h2><p>${escape(s.d)}</p>${arrow}</div>${img(pictures[s.k])}</a>`).join('')}</nav></div>${cinema('dest-'+state.property,pictures[state.property],'The Vik collection','A little closer.<br><em>A world away.</em>','explore','Explore Vik')}${discovery()}${closing()}`;
  }
  function mobileWelcome(p){
    return `<section class="home-welcome home-film-welcome"><video data-film="${media}joseignacio.mp4" poster="${media}joseignacio-poster.webp" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video><div class="home-welcome-copy"><p class="eyebrow">Vik Retreats · Uruguay</p><h1 class="editorial">Welcome to<br><em>José Ignacio.</em></h1><p>Three places to stay. A world to explore.</p>${p?`<span class="home-stay-label">Your stay · ${escape(p.name)}</span>`:''}</div></section>`;
  }
  function mobileProperties(){
    const captions={playa:'Art meets the Atlantic.',bahia:'Barefoot by the ocean.',estancia:'A different rhythm, in the countryside.'};
    return `<section class="home-properties"><div class="home-module-label"><h2>Find your Vik</h2><span>03 places · Swipe →</span></div><div class="film-rail home-property-rail" tabindex="0" role="region" aria-label="Vik properties — swipe or use arrow keys">${['playa','bahia','estancia'].map(k=>`<a class="home-property-card" href="${route('home',k)}" ${state.property===k?'aria-current="true"':''}><img src="${media+'dest-'+k+'-poster.webp'}" alt="" width="900" height="1125" loading="lazy" decoding="async"><video data-film="${media+'dest-'+k}.mp4" poster="${media+'dest-'+k}-poster.webp" data-poster="${media+'dest-'+k}-poster.webp" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video><span class="home-property-copy"><span class="eyebrow">${state.property===k?'Your stay':'Explore your stay'}</span><span class="home-property-name">${escape(D.properties[k].name)}</span><span class="home-property-description">${captions[k]}</span><span class="home-card-action">Open guest guide ${arrow}</span></span></a>`).join('')}</div><div class="rail-progress" aria-hidden="true"><span></span></div></section>`;
  }
  function home(){
    if(desktopHomeLayout.matches)return desktopHome();
    const p=prop();
    const films={info:['pillar-hospitality','pillar-hospitality'],dining:['dining-cielomar','dining-cielomar'],experiences:['ridegauchos','@exp-gauchos'],wellness:['shack','@exp-rest'],explore:['pillar-art','pillar-art']};
    return `<div class="home-guide home-film-guide">${mobileWelcome(p)}<div class="home-content">${essentials()}<div class="home-module-label"><h2>Your stay, at a glance</h2><span>01—05</span></div><nav class="home-sections" aria-label="Guest Guide sections">${D.sections.map((s,i)=>`<a class="home-section" href="${route(s.k)}"><div class="home-section-band">${portrait(s.n,films[s.k]||[pictures[s.k],pictures[s.k]])}<span class="home-card-number">${String(i+1).padStart(2,'0')}</span><div class="home-section-title"><div><h2>${escape(s.n)}</h2><p class="home-section-description">${escape(s.d)}</p></div>${arrow}</div></div></a>`).join('')}</nav>${mobileProperties()}<footer class="home-signature"><span>Vik Retreats · José Ignacio</span><span>Your stay, connected.</span></footer></div></div>`;
  }

  function discovery(){
    const picks=['Horseback Riding','Art Exploration'];
    const item=D.experiences.find(x=>x.n===picks[new Date().getDate()%picks.length]);
    return `<section class="wrap content"><div class="section-intro"><span class="eyebrow">Something to discover</span><span class="mono">JOSÉ IGNACIO</span></div><a class="section-tile" href="${route('experiences')}" data-open="${escape(item.n)}"><span class="section-number">↗</span><div class="tile-copy"><h2>${escape(item.n)}</h2><p>${escape(item.du)} · ${escape(item.pr)}</p><span class="text-link">Explore the experience</span></div><img src="assets/img/${item.c==='art'?'exp-collection':item.c==='horses'?'exp-gauchos':'exp-kayak'}.webp" alt="" loading="lazy" width="82" height="100"></a></section>`;
  }
  function sectionHero(view){const film=heroFilms[view]||pictures[view];return `<header class="section-hero">${img(film,'','',true)}<video data-film="${media+film}.mp4" poster="${media+film}-poster.webp" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video><div class="section-hero-inner"><p class="eyebrow">${escape(prop().name)} · Guest Guide</p><h1 class="editorial">${names[view]}</h1></div></header>`;}
  function blocks(items){return items.map(([title,text,included])=>`<div class="info-block"><h3>${escape(title)} ${included?'<span class="included">Included</span>':''}</h3><p>${escape(text)}</p></div>`).join('');}
  function serviceBlocks(items){return items.map(([title,text])=>`<div class="info-block service-block"><h3>${escape(title)}</h3><p>${escape(text)}</p><a class="book service-request" href="${whatsapp(title)}" target="_blank" rel="noopener">Ask your Experience Concierge ${arrow}</a></div>`).join('');}
  function accordion(title,html){return `<details class="acc"><summary>${escape(title)}${plus}</summary><div class="inner">${html}</div></details>`;}
  function info(){
    const p=prop(),film='dest-'+state.property,poster=media+film+'-poster.webp';return `<header class="info-heading wrap"><p class="eyebrow">${escape(p.name)} · The essentials</p><h1 class="editorial">Guest<br><em>Information.</em></h1></header><div class="wrap info-layout">${wifi(true)}<div>${accordion('Dining Hours',hours(p.dining)+pending(p.notes.filter(x=>!x.includes('Wi-Fi')).join(' '))+'<div class="info-block"><h3>Special Dining Experiences</h3><p>Private dining, signature dinners and exclusive culinary experiences are available upon request.</p></div>'+`<a class="text-link" href="${route('dining')}">Explore Taste ${arrow}</a>`)}${accordion('Services',serviceBlocks(D.services))}${accordion('Facilities',blocks(p.facilities))}${accordion('Before You Leave',blocks(D.leaving))}${accordion('Good to Know',blocks(D.know))}${state.property==='bahia'?pending(p.notes.join(' ')):''}</div></div><figure class="media-break wrap"><div class="media-break-stage">${img(film,p.name)}<video data-film="${media+film}.mp4" poster="${poster}" data-poster="${poster}" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video></div><figcaption>${escape(p.name)} · José Ignacio, Uruguay</figcaption></figure>${closing()}`;
  }
  const itemFilms={
    'Horseback Riding':['ridegauchos','@exp-gauchos'],'Swimming with Horses':['estancia-m','@exp-swim'],'Polo Lesson':['campo-polo','@exp-polo'],'Polo Exhibition':['club-polo','club-polo'],
    'Kayaking':[null,'@verified-exp-kayak'],'Surfing':[null,'@exp-surfing.webp'],'Kite Surfing':[null,'@exp-kitesurf.webp'],'Paddle Boarding':[null,'@exp-paddle.webp'],'Fishing':[null,'@exp-fishing.webp'],'Vik Safari':['landscape','landscape'],
    'Biking':['pillar-shaped','pillar-shaped'],'Bird Watching':[null,'@exp-birds.webp'],'Padel':[null,'@exp-padel.webp'],'Tennis':[null,'@exp-tennis.webp'],'Golf':[null,'@exp-golf.webp'],'Polo':[null,'@exp-polo-sport.webp'],'Uruguayan Nights':['dining-fogon','dining-fogon'],'Full Moon Edition':[null,'wk-bonfire'],
    'Farm-to-Table Cooking Class':['pillar-dining','@exp-garden'],'Garzón Bike Tour & Bodega':[null,'@map-garzon'],"Vik Experience — Bodega Oceánica O'33":[null,'@exp-o33.webp'],'Art Exploration':['collection','@exp-collection'],'Cabo Polonio':[null,'@tour-cabo-polonio.webp'],'Punta del Este & Punta Ballena':[null,'@tour-punta-del-este.webp'],
    'Fish BBQ':['fishbbq','@exp-table'],'Gran Asado Uruguayo':['dining-fogon','dining-fogon'],'Wine Tasting':['pillar-terroir','wk-tasting'],
    'Shack Harmony':['pillar-wellness','pillar-wellness'],'Shack Flow':['card-shack','card-shack'],'Shack Reset':['shack','@exp-rest'],'Private Yoga or Pilates':[null,'@exp-deck'],
    'Shack Stability & Flow':[null,'@wellness-stability.webp'],'Breathwork & Meditation':[null,'@wellness-breath-meditation.webp'],'Private Yoga':[null,'@wellness-private-yoga.webp'],
    'Strength Training · Control':[null,'@wellness-strength-control.webp'],'Strength Training · Dynamic':[null,'@wellness-strength-dynamic.webp'],'Strength Training · Load':[null,'@wellness-strength-load.webp'],
    'Gym':['pillar-hospitality','pillar-hospitality'],'Massages & Healing Arts':[null,'room-bahia'],'Thermal Journey':['room-playa','room-playa'],
    'Rest & Restore':['winter-m','winter'],'Welcome Ritual':['card-bahia','card-bahia'],'Recharge Day':['bahia-vik-m','bahia-vik'],
    'Private Sunset Ritual':['autumn-m','autumn'],'Jet Lag Recovery Ritual':[null,'@wellness-jet-lag.webp'],'Signature Retreat Day':[null,'@wellness-signature-retreat.webp'],
    'Sound Bath Ceremony':[null,'@wellness-sound-bath.webp'],'Breathwork':[null,'@wellness-breathwork.webp'],'Meditation':[null,'@wellness-meditation.webp'],'Artist Encounters':['pillar-art','pillar-art'],'Clay & Wine Atelier':[null,'@wellness-clay-wine.webp'],
    'Mindful Horseback Journey':['ridegauchos','@exp-gauchos'],'Healing with Horses':[null,'@exp-stables'],'Recommended Nature Walks':['spring-m','spring'],
    'Stargazing Experience':[null,'@wellness-stargazing.webp'],'La Mansa Sunset Picnic':[null,'@exp-sunset'],'La Brava Full Moonrise Picnic':[null,'@wellness-full-moon.webp'],'Evening Wind Down':['playa-m','playa'],'Sleep Ritual':['estancia-m','estancia']
  };
  const posterPath=p=>p.startsWith('@')?'assets/img/'+p.slice(1)+(p.slice(1).includes('.')?'':'.webp'):media+p+'-poster.webp';
  function portrait(name,asset){
    if(!asset||usedMedia.has(asset[1]))return '<span class="type-landscape" aria-hidden="true">Vik<br><i>José<br>Ignacio.</i></span>';
    usedMedia.add(asset[1]);const [film,poster]=asset;
    return film?`<video data-film="${media+film}.mp4" poster="${posterPath(poster)}" data-poster="${posterPath(poster)}" preload="none" muted loop playsinline webkit-playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video>`:`<img src="${posterPath(poster)}" alt="" loading="lazy" decoding="async" width="600" height="800">`;
  }
  function filmCard(raw,index,channel='journeyDesigner',asset,kind='experience'){
    const o=resolve(raw),record=asset||itemFilms[o.n];
    const visual=record&&!usedMedia.has(record[1]);
    return `<details class="film-card ${visual?'has-media':'type-card'}" data-item="${escape(o.n)}"><summary><div class="portrait">${portrait(o.n,record)}<span class="film-index">${String(index+1).padStart(2,'0')} ${o.inc?'· INCLUDED':''}</span><div class="portrait-caption"><span class="portrait-name">${escape(o.n)}</span>${o.t?`<span class="portrait-tagline">${escape(o.t)}</span>`:''}<span class="portrait-meta">${escape(o.du||o.w||o.p||'')}${o.pr?' · '+escape(o.pr):''}</span>${o.seasonal?'<span class="portrait-season">Seasonal · December–February</span>':''}<span class="portrait-action">Explore ${plus}</span></div></div></summary><div class="film-details"><p>${escape(o.d)}</p>${o.h?hours(o.h):''}${pending(o.note)}${book(o.n,kind==='restaurant'?'restaurant':'book',channel)}</div></details>`;
  }
  function rail(label,cards){return `<div class="rail-instruction"><span>Drag to explore</span><span>Open a story +</span></div><div class="film-rail" tabindex="0" role="region" aria-label="${escape(label)} — swipe or use arrow keys">${cards}</div><div class="rail-progress" aria-hidden="true"><span></span></div>`;}
  function moduleBlock(id,number,title,body,caption='',category=''){
    return `<details class="module-group group" id="${id}"${category?` data-category-module="${category}"`:''} open><summary class="module-heading"><span class="section-number">${number}</span><h2>${escape(title)}</h2>${plus}</summary>${caption?`<p class="group-caption">${escape(caption)}</p>`:''}${body}</details>`;
  }
  const jump=items=>`<nav class="jump-nav sticky-categories" aria-label="Categories">${items.map(([id,title],i)=>`<button class="filter" data-jump="${id}" aria-pressed="${i===0}">${escape(title)}</button>`).join('')}</nav>`;
  function dining(){
    const restaurantFilms={'Zodiaco':['dining-zodiaco','dining-zodiaco'],'CieloMar':['dining-cielomar','dining-cielomar'],'Azur':['dining-azur','dining-azur'],'El Asador':['dining-asador','dining-asador'],'La Susana':['card-susana','card-susana']};
    return `${sectionHero('dining')}<div class="wrap content modular-content"><p class="lede">Local ingredients, seasonal flavours and the pleasure of sharing. Discover five restaurants, open-fire dinners and the coastal and countryside traditions of José Ignacio.</p>${jump([['restaurants','Restaurants'],['culinary','Culinary'],['around','Around José Ignacio']])}${moduleBlock('restaurants','01','Vik Restaurants',rail('Vik Restaurants',D.restaurants.map((r,i)=>filmCard(r,i,'journeyDesigner',restaurantFilms[r.n],'restaurant')).join('')))}${moduleBlock('culinary','02','Culinary Experiences',rail('Culinary Experiences',D.culinary.map((o,i)=>filmCard(o,i)).join('')))}${moduleBlock('around','03','Around José Ignacio',mapBlock('taste'))}</div>${closing()}`;
  }
  function experiences(){
    return `${sectionHero('experiences')}<div class="wrap content modular-content"><p class="lede">Ride across the pampas, explore the lagoon or encounter local art. Find an experience for your pace, then ask your Experience Concierge to arrange the details.</p><div class="jump-nav sticky-categories" role="group" aria-label="Filter experiences">${filters.map(([key,name])=>`<button class="filter" data-filter="${key}" aria-pressed="${state.filter===key}">${name}</button>`).join('')}</div><div id="experience-list">${filters.slice(1).map(([key,title],i)=>moduleBlock('experience-'+key,'0'+(i+1),title,rail(title,D.experiences.filter(x=>x.c===key).map((o,j)=>filmCard(o,j)).join('')),'',key)).join('')}</div></div>${closing()}`;
  }
  function wellness(){
    return `${sectionHero('wellness')}<div class="wrap content modular-content"><p class="eyebrow muted">Feel Good at Vik</p><p class="lede" style="margin-top:15px">Move, recover, align, connect and nourish. Make time for yourself through nature, seasonal food and the movement, treatments and recovery experiences at The Shack Wellness.</p><details class="philosophy"><summary>Wellness, the Vik way ${plus}</summary><p class="intro-body">Rooted in nature, art, movement, restoration, connection and mindful living, our wellness philosophy invites you to slow down, reconnect with yourself, others and the natural rhythms of José Ignacio.</p><p class="intro-body">We invite you to explore wellness in your own way, at your own pace.</p></details>${jump(D.pillars.map(p=>[p.k,p.n]))}${D.pillars.map((p,i)=>moduleBlock(p.k,'0'+(i+1),p.n,rail(p.n,p.items.map((o,j)=>filmCard(o,j,p.shack||['Sound Bath Ceremony','Breathwork','Meditation'].includes(resolve(o).n)?'shack':'journeyDesigner')).join(''))+(p.k==='nourish'?pending('Seasonal menus, plant-based options and recovery meals — coming soon.'):'')+(p.k==='sleep'?pending('Breathwork audio, herbal teas, soundscapes, sleep meditation and our pillow menu — coming soon.'):''),p.s)).join('')}</div>${closing()}`;
  }
  function explore(){
    const films=['card-estancia','dest-playa','dest-bahia','card-shack','card-susana','card-pavilion'];
    return `${sectionHero('explore')}<div class="wrap content modular-content"><p class="eyebrow muted">Our Vik World</p><p class="lede" style="margin-top:16px">Hospitality · Wine · Gastronomy · Wellness · Art · Culture · Lifestyle · Polo</p><p class="intro-body">Vik Retreats is a collection of award-winning luxury destinations founded by Alex and Carrie Vik, bringing together exceptional architecture, contemporary art, immersive experiences, gastronomy, wellness, and a deep connection to place.</p><p class="intro-body">Spanning destinations across Uruguay, Chile and Italy, with future expansion planned in Brazil.</p>${moduleBlock('collection','01','The Vik Collection at José Ignacio',rail('The Vik collection',D.venues.map((v,i)=>`<details class="film-card has-media"><summary><div class="portrait">${portrait(v.n,[films[i],films[i]])}<span class="film-index">${String(i+1).padStart(2,'0')}</span><div class="portrait-caption"><span class="portrait-name">${escape(v.n)}</span><span class="portrait-action">Discover ${plus}</span></div></div></summary><div class="film-details"><p>${escape(v.d)}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${safe(v.n+' José Ignacio Uruguay')}" target="_blank" rel="noopener">Search on map ${arrow}</a></div></details>`).join('')))}</div>${closing()}`;
  }


  function editorial(view){
    const page=D.editorial[view];
    const assets={destinations:['dest-playa','dest-estancia','landscape','pillar-hospitality'],retreats:['dest-bahia','dest-playa','dest-estancia'],gather:['card-pavilion','card-susana','dest-estancia','pillar-hospitality'],'art-design':['dest-playa','dest-estancia','dest-bahia'],wine:['pillar-terroir','dining-fogon','wk-tasting'],'our-story':['dest-estancia','landscape','pillar-art','pillar-hospitality']}[view];
    const cards=page.blocks.map(([title,text],i)=>`<details class="film-card has-media"><summary><div class="portrait">${portrait(title,[null,assets[i]])}<span class="film-index">${String(i+1).padStart(2,'0')}</span><div class="portrait-caption"><span class="portrait-name">${escape(title.split(' · ')[0])}</span>${title.includes(' · ')?`<span class="portrait-tagline">${escape(title.split(' · ')[1])}</span>`:''}<span class="portrait-action">Discover ${plus}</span></div></div></summary><div class="film-details"><p>${escape(text)}</p><a class="text-link" href="${whatsapp(title)}" target="_blank" rel="noopener">${view==='gather'?'Plan your gathering':'Ask your Experience Concierge'} ${arrow}</a></div></details>`).join('');
    let extra='';
    if(view==='art-design')extra=moduleBlock('art-exploration','02','Explore with a guide',rail('Art Exploration',filmCard(D.experiences.find(x=>x.n==='Art Exploration'),0)));
    if(view==='wine')extra=moduleBlock('wine-tasting','02','Wine Tasting',rail('Wine Tasting',filmCard(D.culinary.find(x=>x.n==='Wine Tasting'),0)));
    return `${sectionHero(view)}<div class="wrap content modular-content"><p class="lede">${escape(page.intro)}</p>${rail(names[view],cards)}${extra}${view==='destinations'?mapBlock('destination'):''}</div>${closing()}`;
  }
  function stay(){
    const cards=prop().facilities.map(([n,d,inc],i)=>{
      const asset=/Wellness/.test(n)?['card-shack','card-shack']:/Pool/.test(n)?[null,state.property==='playa'?'@stay-v2-playa-pool.jpg':state.property==='estancia'?'@stay-v2-estancia-pool.jpg':'card-bahia']:/Beach/.test(n)?[null,'@bahia-water-900']:/Playroom/.test(n)?[null,state.property==='estancia'?'@stay-v2-estancia-playroom.jpg':'@stay-v2-playa-playroom.jpg']:[null,'pillar-hospitality'];
      return filmCard({n,d,inc,du:inc?'Included in your stay':'On request'},i,'journeyDesigner',asset);
    }).join('');
    return `${sectionHero('stay')}<div class="wrap content modular-content"><p class="lede">Make yourself at home at ${escape(prop().name)}. Your daily essentials and everything included in your stay.</p>${rail('Included in your stay',cards)}${essentials()}${accordion('Services',serviceBlocks(D.services))}${accordion('Dining Hours',hours(prop().dining))}<a class="book info-full-cta" href="${route('info')}">Guest Information · Services & practical details ${arrow}</a></div>${closing()}`;
  }
  function mapBlock(kind){const properties=kind==='destination';return `<section class="guide-map-section" data-guide-map="${kind}"><div class="group-title"><h2>${kind==='taste'?'Find your table':'Explore José Ignacio'}</h2></div><div class="map-categories" role="group" aria-label="Map categories"></div><div class="guide-map-frame${properties?' has-place-bar':''}"><div class="guide-map" aria-label="${kind==='taste'?'Restaurant':'Destination'} map"></div><div class="guide-map-view" aria-hidden="true">Satellite</div>${properties?'<div class="guide-map-bar"><ol class="guide-map-legend" aria-label="Properties and places"></ol></div>':''}</div><label class="map-select-label${properties?' map-select-properties':''}">Choose a place<select class="map-place-select" aria-label="Choose a place on the map"></select></label><div class="map-place-info" aria-live="polite"></div></section>`;}
  const views={home,info,dining,experiences,wellness,explore,taste:dining,wellbeing:wellness};
  function readRoute(){const parts=location.hash.replace(/^#\/?/,'').split('/');const key=parts[0];state.property=owns(D.properties,key)?key:owns(D.properties,query)?query:null;state.view=owns(views,parts[1])?parts[1]:'home';}
  function pauseFilms(){main.querySelectorAll('video').forEach(v=>v.pause());observer?.disconnect();railObserver?.disconnect();revealObserver?.disconnect();if(autoRailFrame)cancelAnimationFrame(autoRailFrame);autoRailFrame=null;}
  function observeFilms(){
    const eligible=()=>!reduce.matches&&!navigator.connection?.saveData&&!document.hidden;
    if(typeof window.IntersectionObserver!=='function'){main.querySelectorAll('video[data-film]').forEach(v=>{if(!v.getAttribute('src'))v.src=v.dataset.film;if(eligible())v.play().then(()=>v.classList.add('is-playing')).catch(()=>{});});return;}
    observer=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting,intersectionRatio})=>{
      if(isIntersecting&&v.dataset.poster&&!v.poster)v.poster=v.dataset.poster;
      const ratioNeeded=v.closest('.home-film-welcome,.destination-film')?.2:.6;
      isIntersecting=isIntersecting&&intersectionRatio>=ratioNeeded;
      v.dataset.visible=String(isIntersecting);
      if(isIntersecting&&eligible()){
        if(!v.getAttribute('src'))v.src=v.dataset.film;
        v.play().then(()=>{if(!v.paused)v.classList.add('is-playing');}).catch(()=>v.classList.remove('is-playing'));
      }else v.pause();
    }),{threshold:[.2,.6]});
    main.querySelectorAll('video[data-film]').forEach(v=>{v.addEventListener('error',()=>v.classList.remove('is-playing'));observer.observe(v);});
  }
  function setupRails(){
    const update=rail=>{const bar=rail.nextElementSibling?.querySelector('span');if(bar)bar.style.transform='scaleX('+Math.min(1,(rail.scrollLeft+rail.clientWidth)/rail.scrollWidth)+')';};
    if(typeof window.ResizeObserver==='function')railObserver=new ResizeObserver(entries=>entries.forEach(e=>update(e.target)));
    main.querySelectorAll('.film-rail,.selector-property-rail').forEach(rail=>{rail.addEventListener('scroll',()=>update(rail),{passive:true});rail.addEventListener('dragstart',e=>e.preventDefault());railObserver?.observe(rail);update(rail);});
  }
  function observeReveals(){
    const items=[...main.querySelectorAll('.home-section,.home-properties,.module-group,.film-card,.guide-map-section,.media-break,.closing,.venue')];
    if(reduce.matches||typeof window.IntersectionObserver!=='function'){items.forEach(item=>item.classList.add('is-revealed'));return;}
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}}),{threshold:.1,rootMargin:'0px 0px -5%'});
    items.forEach((item,index)=>{item.classList.add('reveal-on-scroll');item.style.setProperty('--reveal-delay',`${(index%4)*45}ms`);revealObserver.observe(item);});
  }
  function setupSelectorAutoMotion(){
    const rail=main.querySelector('.selector-property-rail');
    if(!rail||desktopHomeLayout.matches||reduce.matches||navigator.connection?.saveData)return;
    let last=performance.now(),direction=1,pauseUntil=last+700,position=rail.scrollLeft;
    const pause=()=>{pauseUntil=performance.now()+3500;position=rail.scrollLeft;rail.classList.remove('is-auto-moving');};
    ['pointerdown','touchstart','wheel','focusin'].forEach(event=>rail.addEventListener(event,pause,{passive:true}));
    const move=now=>{
      if(!document.body.contains(rail))return;
      const elapsed=Math.min(32,now-last);last=now;
      if(!document.hidden&&now>pauseUntil){rail.classList.add('is-auto-moving');const max=rail.scrollWidth-rail.clientWidth;if(position>=max-1)direction=-1;else if(position<=1)direction=1;position=Math.max(0,Math.min(max,position+direction*elapsed*.012));rail.scrollLeft=position;}
      autoRailFrame=requestAnimationFrame(move);
    };
    autoRailFrame=requestAnimationFrame(move);
  }
  function syncMotion(){main.querySelectorAll('video').forEach(v=>{if(document.hidden||reduce.matches||navigator.connection?.saveData)v.pause();else if(v.dataset.visible==='true'){if(!v.getAttribute('src'))v.src=v.dataset.film;v.play().then(()=>{if(!v.paused)v.classList.add('is-playing');}).catch(()=>{});}});}
  function render(focus=true){
    window.GuideMaps?.destroy();pauseFilms();readRoute();header();
    usedMedia=new Set();main.innerHTML=prop()?views[state.view]():selector();main.classList.remove('view-enter');void main.offsetWidth;main.classList.add('view-enter');
    
    document.title=`${prop()?names[state.view]+' · '+prop().name:'Your stay'} · Vik Retreats`;
    window.scrollTo(0,0);if(focus){try{main.focus({preventScroll:true});}catch{main.focus();}}observeFilms();setupRails();setupSelectorAutoMotion();observeReveals();window.GuideMaps?.observe(D.zones);
    if(pendingItem){const target=[...main.querySelectorAll('[data-item]')].find(x=>x.dataset.item===pendingItem);if(target){target.closest('.module-group').open=true;target.open=true;target.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});}pendingItem=null;}
  }
  document.addEventListener('click',async e=>{
    if(e.target.closest('.skip')){e.preventDefault();main.focus();return;}
    const open=e.target.closest('[data-open]');if(open)pendingItem=open.dataset.open;
    const wifiButton=e.target.closest('[data-wifi]');if(wifiButton){const panel=document.getElementById('home-wifi');panel.hidden=!panel.hidden;wifiButton.setAttribute('aria-expanded',String(!panel.hidden));}
    const copy=e.target.closest('[data-copy]');if(copy){
      const result=copy.closest('.info-wifi,.quick-details').querySelector('.copy-message');
      try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(copy.dataset.copy);copy.textContent='Copied';result.textContent='Password copied.';}catch{result.textContent='Touch and hold the password to copy it.';}
      document.getElementById('announcement').textContent=result.textContent;
    }
    const filter=e.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;main.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));main.querySelectorAll('[data-category-module]').forEach(group=>{group.hidden=state.filter!=='all'&&group.dataset.categoryModule!==state.filter;});}
    const jumpButton=e.target.closest('[data-jump]');if(jumpButton){const section=document.getElementById(jumpButton.dataset.jump);if(section){section.open=true;section.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});main.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-pressed',String(b===jumpButton)));}}
  });
  document.addEventListener('keydown',e=>{const rail=e.target.closest('.film-rail,.selector-property-rail');if(rail&&e.target===rail&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*rail.clientWidth*.8,behavior:reduce.matches?'auto':'smooth'});}});
  document.addEventListener('pointerdown',e=>{const rail=e.target.closest('.film-rail,.selector-property-rail');if(!rail||e.pointerType!=='mouse'||e.button!==0)return;const start=e.clientX,origin=rail.scrollLeft;let moved=false;
    const move=ev=>{if(Math.abs(ev.clientX-start)>6){moved=true;rail.classList.add('is-dragging');rail.scrollLeft=origin-(ev.clientX-start);}};
    const up=()=>{window.removeEventListener('pointermove',move);rail.classList.remove('is-dragging');if(moved)rail.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();},{capture:true,once:true});};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
  });
  document.addEventListener('change',e=>{if(e.target.id==='property')location.hash=route('home',e.target.value);});
  document.addEventListener('visibilitychange',syncMotion);listenMedia(reduce,syncMotion);navigator.connection?.addEventListener?.('change',syncMotion);
  window.addEventListener('hashchange',()=>{state.filter='all';render();});
  listenMedia(desktopHomeLayout,()=>{if(state.view==='home')render(false);});
  window.addEventListener('scroll',()=>document.body.classList.toggle('has-scrolled',scrollY>24),{passive:true});
  render(false);
})();
