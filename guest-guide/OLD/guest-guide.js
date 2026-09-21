/* The approved two-tap journey, rendered with the local VIK visual system. */
(() => {
  'use strict';
  const D=GUIDE_DATA, main=document.getElementById('main');
  const media='../vik-jose-ignacio/assets/video/';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=s=>encodeURIComponent(s).replace(/['()!*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
  const names={home:'Your stay',info:'Guest Information',dining:'Dining',experiences:'Experiences',wellness:'Wellness',explore:'Explore VIK'};
  const pictures={bahia:'dest-bahia',playa:'dest-playa',estancia:'dest-estancia',info:'pillar-shaped',dining:'pillar-dining',experiences:'wk-ride',wellness:'wk-yoga',explore:'pillar-art'};
  const categoryImages={horses:'wk-ride',country:'dest-estancia',water:'dest-playa',sport:'pillar-shaped',art:'pillar-art',tour:'dest-bahia'};
  const restaurantImages={'Zodiaco':'dining-zodiaco','CieloMar':'dining-cielomar','Beach Grill':'dining-cielomar','El Asador':'dining-asador','La Susana':'dining-susana'};
  const venueImages=['dest-estancia','dest-playa','dest-bahia','card-shack','dining-susana','card-pavilion'];
  const filters=[['all','All'],['water','Water'],['horses','Horses'],['country','Countryside'],['art','Art & Culture'],['sport','Sport'],['tour','Day Tours']];
  const query=new URLSearchParams(location.search).get('property');
  const fromQR=Object.hasOwn(D.properties,query)||Object.hasOwn(D.properties,location.hash.replace(/^#\/?/,'').split('/')[0]);
  let state={property:null,view:'home',filter:'all'}, pendingItem=null, observer=null, railObserver=null;
  let usedMedia=new Set(), homeMotionPaused=false;
  const prop=()=>D.properties[state.property];
  const arrow='<span class="arrow" aria-hidden="true">↗</span>';
  const plus='<span class="plus" aria-hidden="true">+</span>';
  const logo=(name='vik-retreats',color='black',cls='brand-logo')=>`<img class="${cls}" src="../assets/logo/lw-${name}-${color}.png" alt="${escape(name.replace(/-/g,' ').replace(/vik/g,'VIK'))}" width="180" height="30">`;
  const img=(file,alt='',cls='',priority=false)=>`<img class="${cls}" src="${media}${file}-poster.webp" alt="${escape(alt)}" width="900" height="508" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}>`;
  const route=(view='home',property=state.property)=>`#/${property}${view==='home'?'':'/'+view}`;
  const resolve=x=>x.ref?D.experiences.find(e=>e.n===x.ref):x;
  function whatsapp(item='',type='generic',number='59895444451') {
    const base=prop()?`Hi, I'm staying at ${prop().name}. `:'Hi, ';
    const message=type==='restaurant'?`${base}I'd like to book a table at ${item}. Date, time and number of guests: `
      :type==='book'?`${base}I'd like to book: ${item}. Preferred date and time: `
      :`${base}I'd like to ask about ${item?item+'. ':''}`;
    return `https://wa.me/${number}?text=${safe(message)}`;
  }
  function book(item,type='book',channel='journeyDesigner') {
    if(channel==='shack'&&!D.shackWhatsApp)return `<div class="pending"><p>Direct contact for The Shack is not yet available.</p></div><a class="book" href="${whatsapp(item,'generic')}" target="_blank" rel="noopener">Ask your Journey Designer ${arrow}</a>`;
    return `<a class="book" href="${whatsapp(item,type,channel==='shack'?D.shackWhatsApp:'59895444451')}" target="_blank" rel="noopener">${type==='restaurant'?'Reserve a table':'Book via WhatsApp'} ${arrow}</a>`;
  }
  const pending=text=>text?`<div class="pending"><p>${escape(text)}</p></div>`:'';
  const hours=rows=>rows.map(([k,v])=>`<div class="hours-row"><span>${escape(k)}</span><span class="value">${escape(v)}</span></div>`).join('');
  const groupTitle=(number,title,count='')=>`<div class="group-title"><span class="section-number">${number}</span><h2>${escape(title)}</h2>${count?`<span class="count">${count}</span>`:''}</div>`;
  function wifi(details=false) {
    const p=prop();
    return `<div class="${details?'info-wifi':'quick-details'}"><h2>Stay connected</h2><div class="wifi-row"><span class="k">Network</span><code>${escape(p.wifi.net)}</code></div><div class="wifi-row"><span class="k">Password</span><div class="wifi-value"><code>${escape(p.wifi.pw)}</code><button class="copy" data-copy="${escape(p.wifi.pw)}" aria-label="Copy Wi-Fi password">Copy</button></div></div><p class="copy-message" aria-live="polite"></p>${details?`<div class="desk-line"><div>Front Desk<br><span>${p.desk}</span></div><a class="text-link" href="${whatsapp('','generic',p.deskNum)}" target="_blank" rel="noopener">WhatsApp ${arrow}</a></div>`:''}</div>`;
  }
  function essentials(){return `<div class="essentials"><div class="essentials-top"><button class="essential-link" data-wifi aria-expanded="false" aria-controls="home-wifi"><span>Wi-Fi details</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 8a16 16 0 0120 0M5 12a11 11 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="20" r=".7"/></svg></button><a class="essential-link" href="${whatsapp('','generic',prop().deskNum)}" target="_blank" rel="noopener"><span>Front Desk</span>${arrow}</a></div><div id="home-wifi" hidden>${wifi()}</div></div>`;}
  function cinema(file,poster,label,title,view,cta,extra='') {
    return `<section class="cinema ${extra}" aria-label="${escape(label)}">${img(poster)}<video data-film="${media}${file}.mp4" poster="${media}${poster}-poster.webp" preload="none" muted loop playsinline aria-hidden="true" tabindex="-1"></video><span class="film-note">${escape(label)}</span><div class="cinema-copy"><h2 class="editorial">${title}</h2><a class="text-link" href="${route(view)}">${escape(cta)} ${arrow}</a></div></section>`;
  }
  function closing(){return `<section class="closing wrap"><h2>A person.<br>A little local knowledge.</h2><div><p>${escape(D.services[0][1])}</p><a class="text-link" href="${whatsapp()}" target="_blank" rel="noopener">Contact your Journey Designer ${arrow}</a></div><div class="closing-foot"><span>VIK RETREATS · JOSÉ IGNACIO</span><a href="${route('info')}">YOUR STAY ↗</a></div></section>`;}
  function header(){
    document.getElementById('masthead').innerHTML=state.view==='home'||!prop()?`<a class="brand-link" href="${prop()?route():'#/'}" aria-label="Guest Guide home">${logo()}</a><span class="header-label">Guest Guide<br>José Ignacio</span>`:`<a class="home-link" href="${route()}" aria-label="Back to home"><span class="arrow" aria-hidden="true">←</span> Your stay</a><a class="brand-link" href="${route()}" aria-label="${escape(prop().name)} home">${logo(state.property+'-vik','black','property-logo')}</a>`;
    document.getElementById('contact-bar').innerHTML=`${prop()?`<span class="contact-context">${escape(prop().name)}</span>`:''}<a href="${whatsapp()}" target="_blank" rel="noopener"><span>Contact your Journey Designer</span>${arrow}</a>`;
  }
  function selector(){if(!desktopHomeLayout.matches)return `<div class="home-guide home-film-guide home-film-selector">${mobileWelcome()}<div class="home-content"><p class="home-selector-intro">A little local knowledge, wherever you stay. Choose your property to open your guest guide.</p>${mobileProperties()}<footer class="home-signature"><span>VIK Retreats · José Ignacio</span><span>Your stay, connected.</span></footer></div></div>`;return `<div class="selector wrap"><p class="eyebrow">VIK Retreats · José Ignacio</p><h1 class="editorial">Your stay.<br><em>Your VIK.</em></h1><p class="intro-body">Everything you need during your stay.<br>Choose the place you call home.</p><div class="property-choices">${['playa','bahia','estancia'].map((p,i)=>`<a class="property-choice" href="${route('home',p)}" aria-label="Stay at ${escape(D.properties[p].name)}">${img(pictures[p],D.properties[p].name,'',i===0)}<span>${logo(p+'-vik','white','choice-logo')}${arrow}</span></a>`).join('')}</div><div class="selector-footer">Playa VIK · Bahía VIK · Estancia VIK</div></div>`;}
  const desktopHomeLayout=matchMedia("(min-width:700px)");
  function desktopHome(){
    const p=prop();
    return `<div class="home-layout wrap"><div class="home-lead"><section class="welcome"><p class="eyebrow">Your stay · José Ignacio</p><h1 class="editorial">Welcome to<br><em>${escape(p.name)}</em></h1><p class="sub">Everything you need during your stay</p>${!fromQR?`<div class="context"><label for="property">Staying at</label><select id="property" aria-label="Your property">${Object.entries(D.properties).map(([k,v])=>`<option value="${k}"${k===state.property?' selected':''}>${escape(v.name)}</option>`).join('')}</select></div>`:''}</section>${essentials()}</div><nav class="section-index" aria-label="Guest Guide sections"><div class="section-intro"><span class="eyebrow">Make the most of your stay</span><span class="mono">01—05</span></div>${D.sections.map((s,i)=>`<a class="section-tile" href="${route(s.k)}"><span class="section-number">0${i+1}</span><div class="tile-copy"><h2>${escape(s.n)}</h2><p>${escape(s.d)}</p><span class="arrow" aria-hidden="true">↗</span></div>${img(pictures[s.k])}</a>`).join('')}</nav></div>${cinema('dest-'+state.property,pictures[state.property],'The VIK collection','A little closer.<br><em>A world away.</em>','explore','Explore VIK')}${discovery()}${closing()}`;
  }
  function mobileWelcome(p){
    return `<section class="home-welcome home-film-welcome"><video data-film="${media}joseignacio.mp4" poster="${media}joseignacio-poster.webp" preload="none" muted loop playsinline aria-hidden="true" tabindex="-1"></video><button class="home-motion" data-motion aria-label="${homeMotionPaused?'Play background videos':'Pause background videos'}">${homeMotionPaused?'Play films':'Pause films'}</button><div class="home-welcome-copy"><p class="eyebrow">VIK Retreats · Uruguay</p><h1 class="editorial">Welcome to<br><em>José Ignacio.</em></h1><p>Three places to stay. A world to explore.</p>${p?`<span class="home-stay-label">Your stay · ${escape(p.name)}</span>`:''}</div></section>`;
  }
  function mobileProperties(){
    const captions={playa:'Art meets the Atlantic.',bahia:'Barefoot by the ocean.',estancia:'A different rhythm, in the countryside.'};
    return `<section class="home-properties"><div class="home-module-label"><h2>Find your VIK</h2><span>03 places · Swipe →</span></div><div class="film-rail home-property-rail" tabindex="0" role="region" aria-label="VIK properties — swipe or use arrow keys">${['playa','bahia','estancia'].map(k=>`<a class="home-property-card" href="${route('home',k)}" ${state.property===k?'aria-current="true"':''}>${portrait(D.properties[k].name,['dest-'+k,'dest-'+k])}<span class="home-property-copy"><span class="eyebrow">${state.property===k?'Your stay':'Explore your stay'}</span><span class="home-property-name">${escape(D.properties[k].name)}</span><span class="home-property-description">${captions[k]}</span><span class="home-card-action">Open guest guide ${arrow}</span></span></a>`).join('')}</div><div class="rail-progress" aria-hidden="true"><span></span></div></section>`;
  }
  function home(){
    if(desktopHomeLayout.matches)return desktopHome();
    const p=prop();
    const films={info:['pillar-hospitality','pillar-hospitality'],dining:['dining-cielomar','dining-cielomar'],experiences:['ridegauchos','@exp-gauchos'],wellness:['shack','@exp-rest'],explore:['pillar-art','pillar-art']};
    return `<div class="home-guide home-film-guide">${mobileWelcome(p)}<div class="home-content">${essentials()}<div class="home-module-label"><h2>Your stay, at a glance</h2><span>01—05</span></div><nav class="home-sections" aria-label="Guest Guide sections">${D.sections.map((s,i)=>`<a class="home-section" href="${route(s.k)}"><div class="home-section-band">${portrait(s.n,films[s.k])}<span class="home-card-number">0${i+1}</span><div class="home-section-title"><div><h2>${escape(s.n)}</h2><p class="home-section-description">${escape(s.d)}</p></div>${arrow}</div></div></a>`).join('')}</nav>${mobileProperties()}<footer class="home-signature"><span>VIK Retreats · José Ignacio</span><span>Your stay, connected.</span></footer></div></div>`;
  }

  function discovery(){
    const picks=['Horseback Riding','Art Exploration','Kayaking'];
    const item=D.experiences.find(x=>x.n===picks[new Date().getDate()%picks.length]);
    return `<section class="wrap content"><div class="section-intro"><span class="eyebrow">Something to discover</span><span class="mono">JOSÉ IGNACIO</span></div><a class="section-tile" href="${route('experiences')}" data-open="${escape(item.n)}"><span class="section-number">↗</span><div class="tile-copy"><h2>${escape(item.n)}</h2><p>${escape(item.du)} · ${escape(item.pr)}</p><span class="text-link">Explore the experience</span></div><img src="../vik-jose-ignacio/assets/img/${item.c==='art'?'exp-collection':item.c==='horses'?'exp-gauchos':'exp-kayak'}.webp" alt="" loading="lazy" width="82" height="100"></a></section>`;
  }
  function sectionHero(view){return `<header class="section-hero">${img(pictures[view],'','',true)}<div class="section-hero-inner"><p class="eyebrow">${escape(prop().name)} · Guest Guide</p><h1 class="editorial">${names[view]}</h1></div></header>`;}
  function blocks(items){return items.map(([title,text,included])=>`<div class="info-block"><h3>${escape(title)} ${included?'<span class="included">Included</span>':''}</h3><p>${escape(text)}</p></div>`).join('');}
  function accordion(title,html){return `<details class="acc"><summary>${escape(title)}${plus}</summary><div class="inner">${html}</div></details>`;}
  function info(){
    const p=prop();return `<header class="info-heading wrap"><p class="eyebrow">${escape(p.name)} · The essentials</p><h1 class="editorial">Guest<br><em>Information.</em></h1></header><div class="wrap info-layout">${wifi(true)}<div>${accordion('Dining Hours',hours(p.dining)+pending(p.notes.filter(x=>!x.includes('Wi-Fi')).join(' '))+'<div class="info-block"><h3>Special Dining Experiences</h3><p>Private dining, signature dinners and exclusive culinary experiences are available upon request.</p></div>'+`<a class="text-link" href="${route('dining')}">Explore Dining ${arrow}</a>`)}${accordion('Services',blocks(D.services))}${accordion('Facilities',blocks(p.facilities))}${accordion('Before You Leave',blocks(D.leaving))}${accordion('Good to Know',blocks(D.know))}${state.property==='bahia'?pending(p.notes.join(' ')):''}</div></div><figure class="media-break wrap">${img(pictures[state.property],p.name)}<figcaption>${escape(p.name)} · José Ignacio, Uruguay</figcaption></figure>${closing()}`;
  }
  const itemFilms={
    'Horseback Riding':['ridegauchos','@exp-gauchos'],'Swimming with Horses':['estancia-m','@exp-swim'],'Polo Lesson':['club-polo','club-polo'],'Polo Exhibition':['campo-polo','@exp-polo'],
    'Kayaking':['exp-kayak','@exp-kayak'],'Surfing':['playa-m','playa'],'Paddle Boarding':['dest-bahia','dest-bahia'],'VIK Safari':['landscape','landscape'],
    'Biking':['pillar-shaped','pillar-shaped'],'Bird Watching':['spring-m','spring'],'Uruguayan Nights':['dining-fogon','dining-fogon'],'Full Moon Edition':[null,'wk-bonfire'],
    'Farm-to-Table Cooking Class':['pillar-dining','@exp-garden'],'Garzón Bike Tour & Bodega':[null,'@map-garzon'],"VIK Experience — Bodega Oceánica O'33":['pillar-terroir','pillar-terroir'],'Art Exploration':['collection','@exp-collection'],
    'Fish BBQ':['fishbbq','@exp-table'],'Gran Asado Uruguayo':['dining-fogon','dining-fogon'],'Wine Tasting':['pillar-terroir','wk-tasting'],
    'Shack Harmony':['pillar-wellness','pillar-wellness'],'Shack Flow':['card-shack','card-shack'],'Shack Reset':['shack','@exp-rest'],'Private Yoga or Pilates':[null,'@exp-deck'],
    'Gym':['pillar-hospitality','pillar-hospitality'],'Massages & Healing Arts':[null,'room-bahia'],'Thermal Journey':['room-playa','room-playa'],
    'Rest & Restore':['winter-m','winter'],'Welcome Ritual':['card-bahia','card-bahia'],'Recharge Day':['bahia-vik-m','bahia-vik'],
    'Private Sunset Ritual':['autumn-m','autumn'],'Jet Lag Recovery Ritual':[null,'@bahia-water-900'],'Signature Retreat Day':['dest-bahia','dest-bahia'],
    'Sound Bath Ceremony':['room-estancia','room-estancia'],'Meditation':['dest-playa','dest-playa'],'Artist Encounters':['pillar-art','pillar-art'],
    'Mindful Horseback Journey':['ridegauchos','@exp-gauchos'],'Healing with Horses':[null,'@exp-stables'],'Recommended Nature Walks':['spring-m','spring'],
    'La Mansa Sunset Picnic':[null,'@exp-sunset'],'Evening Wind Down':['playa-m','playa'],'Sleep Ritual':['estancia-m','estancia']
  };
  const posterPath=p=>p.startsWith('@')?'../vik-jose-ignacio/assets/img/'+p.slice(1)+'.webp':media+p+'-poster.webp';
  function portrait(name,asset){
    if(!asset||usedMedia.has(asset[1]))return '<span class="type-landscape" aria-hidden="true">VIK<br><i>José<br>Ignacio.</i></span>';
    usedMedia.add(asset[1]);const [film,poster]=asset;
    return film?`<video data-film="${media+film}.mp4" data-poster="${posterPath(poster)}" preload="none" muted loop playsinline aria-hidden="true" tabindex="-1"></video>`:`<img src="${posterPath(poster)}" alt="" loading="lazy" decoding="async" width="600" height="800">`;
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
    const restaurantFilms={'Zodiaco':['dining-zodiaco','dining-zodiaco'],'CieloMar':['dining-cielomar','dining-cielomar'],'Beach Grill':['dining-azur','dining-azur'],'El Asador':['dining-asador','dining-asador'],'La Susana':['card-susana','card-susana']};
    return `${sectionHero('dining')}<div class="wrap content modular-content"><p class="lede">Five restaurants across the collection, signature culinary evenings, and the places we send our own guests to in José Ignacio.</p>${jump([['restaurants','Restaurants'],['culinary','Culinary'],['around','Around José Ignacio']])}${moduleBlock('restaurants','01','VIK Restaurants',rail('VIK Restaurants',D.restaurants.map((r,i)=>filmCard(r,i,'journeyDesigner',restaurantFilms[r.n],'restaurant')).join('')))}${moduleBlock('culinary','02','Culinary Experiences',rail('Culinary Experiences',D.culinary.map((o,i)=>filmCard(o,i)).join('')))}${moduleBlock('around','03','Around José Ignacio',D.zones.map(([zone,places])=>`<section class="zone"><h3>${escape(zone)}</h3><div class="place-list">${places.map(place=>`<a href="https://www.google.com/maps/search/?api=1&query=${safe(place+' '+zone+' Uruguay')}" target="_blank" rel="noopener">${escape(place)}${arrow}</a>`).join('')}</div></section>`).join(''))}</div>${closing()}`;
  }
  function experiences(){
    return `${sectionHero('experiences')}<div class="wrap content modular-content"><p class="lede">From the polo field to the lagoon, the ocean and the vineyards beyond.</p><div class="jump-nav sticky-categories" role="group" aria-label="Filter experiences">${filters.map(([key,name])=>`<button class="filter" data-filter="${key}" aria-pressed="${state.filter===key}">${name}</button>`).join('')}</div><div id="experience-list">${filters.slice(1).map(([key,title],i)=>moduleBlock('experience-'+key,'0'+(i+1),title,rail(title,D.experiences.filter(x=>x.c===key).map((o,j)=>filmCard(o,j)).join('')),'',key)).join('')}</div></div>${closing()}`;
  }
  function wellness(){
    return `${sectionHero('wellness')}<div class="wrap content modular-content"><p class="eyebrow muted">Feel Good at VIK</p><p class="lede" style="margin-top:15px">At VIK, wellness is not a treatment, a class, or a place. It is a way of experiencing your stay.</p><details class="philosophy"><summary>Wellness, the VIK way ${plus}</summary><p class="intro-body">Rooted in nature, art, movement, restoration, connection and mindful living, our wellness philosophy invites you to slow down, reconnect with yourself, others and the natural rhythms of José Ignacio.</p><p class="intro-body">We invite you to explore wellness in your own way, at your own pace.</p></details>${jump(D.pillars.map(p=>[p.k,p.n]))}${D.pillars.map((p,i)=>moduleBlock(p.k,'0'+(i+1),p.n,rail(p.n,p.items.map((o,j)=>filmCard(o,j,p.shack||['Sound Bath Ceremony','Breathwork','Meditation'].includes(resolve(o).n)?'shack':'journeyDesigner')).join(''))+(p.k==='nourish'?pending('Seasonal menus, plant-based options and recovery meals — coming soon.'):'')+(p.k==='sleep'?pending('Breathwork audio, herbal teas, soundscapes, sleep meditation and our pillow menu — coming soon.'):''),p.s)).join('')}</div>${closing()}`;
  }
  function explore(){
    const films=['card-estancia','dest-playa','dest-bahia','card-shack','card-susana','card-pavilion'];
    return `${sectionHero('explore')}<div class="wrap content modular-content"><p class="eyebrow muted">Our VIK World</p><p class="lede" style="margin-top:16px">Hospitality · Wine · Gastronomy · Wellness · Art · Culture · Lifestyle · Polo</p><p class="intro-body">VIK Retreats is a collection of award-winning luxury destinations founded by Alex and Carrie Vik, bringing together exceptional architecture, contemporary art, immersive experiences, gastronomy, wellness, and a deep connection to place.</p><p class="intro-body">Spanning destinations across Uruguay, Chile and Italy, with future expansion planned in Brazil.</p>${moduleBlock('collection','01','The VIK Collection at José Ignacio',rail('The VIK collection',D.venues.map((v,i)=>`<details class="film-card has-media"><summary><div class="portrait">${portrait(v.n,[films[i],films[i]])}<span class="film-index">0${i+1}</span><div class="portrait-caption"><span class="portrait-name">${escape(v.n)}</span><span class="portrait-action">Discover ${plus}</span></div></div></summary><div class="film-details"><p>${escape(v.d)}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${safe(v.n+' José Ignacio Uruguay')}" target="_blank" rel="noopener">Search on map ${arrow}</a></div></details>`).join('')))}</div>${closing()}`;
  }

  const views={home,info,dining,experiences,wellness,explore};
  function readRoute(){const parts=location.hash.replace(/^#\/?/,'').split('/');const key=parts[0];state.property=Object.hasOwn(D.properties,key)?key:Object.hasOwn(D.properties,query)?query:null;state.view=Object.hasOwn(views,parts[1])?parts[1]:'home';}
  function pauseFilms(){main.querySelectorAll('video').forEach(v=>v.pause());observer?.disconnect();railObserver?.disconnect();}
  function observeFilms(){
    const eligible=()=>!homeMotionPaused&&!reduce.matches&&!navigator.connection?.saveData&&!document.hidden;
    observer=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting,intersectionRatio})=>{
      if(isIntersecting&&v.dataset.poster&&!v.poster)v.poster=v.dataset.poster;
      isIntersecting=isIntersecting&&intersectionRatio>=.2;
      v.dataset.visible=String(isIntersecting);
      if(isIntersecting&&eligible()){
        if(!v.getAttribute('src'))v.src=v.dataset.film;
        v.play().then(()=>v.classList.add('is-playing')).catch(()=>v.classList.remove('is-playing'));
      }else v.pause();
    }),{threshold:.2});
    main.querySelectorAll('video[data-film]').forEach(v=>observer.observe(v));
  }
  function setupRails(){
    const update=rail=>{const bar=rail.nextElementSibling?.querySelector('span');if(bar)bar.style.transform='scaleX('+Math.min(1,(rail.scrollLeft+rail.clientWidth)/rail.scrollWidth)+')';};
    railObserver=new ResizeObserver(entries=>entries.forEach(e=>update(e.target)));
    main.querySelectorAll('.film-rail').forEach(rail=>{rail.addEventListener('scroll',()=>update(rail),{passive:true});rail.addEventListener('dragstart',e=>e.preventDefault());railObserver.observe(rail);update(rail);});
  }
  function syncMotion(){main.querySelectorAll('video').forEach(v=>{if(homeMotionPaused||document.hidden||reduce.matches||navigator.connection?.saveData)v.pause();else if(v.dataset.visible==='true'){if(!v.getAttribute('src'))v.src=v.dataset.film;v.play().then(()=>v.classList.add('is-playing')).catch(()=>{});}});}
  function render(focus=true){
    pauseFilms();readRoute();header();
    usedMedia=new Set();main.innerHTML=prop()?views[state.view]():selector();
    main.classList.remove('view-enter');void main.offsetWidth;main.classList.add('view-enter');
    document.title=`${prop()?names[state.view]+' · '+prop().name:'Your stay'} · VIK Retreats`;
    window.scrollTo({top:0,behavior:'instant'});if(focus)main.focus({preventScroll:true});observeFilms();setupRails();
    if(pendingItem){const target=[...main.querySelectorAll('[data-item]')].find(x=>x.dataset.item===pendingItem);if(target){target.closest('.module-group').open=true;target.open=true;target.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});}pendingItem=null;}
  }
  document.addEventListener('click',async e=>{
    if(e.target.closest('.skip')){e.preventDefault();main.focus();return;}
    const motion=e.target.closest('[data-motion]');if(motion){homeMotionPaused=!homeMotionPaused;motion.textContent=homeMotionPaused?'Play films':'Pause films';motion.setAttribute('aria-label',homeMotionPaused?'Play background videos':'Pause background videos');syncMotion();}
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
  document.addEventListener('keydown',e=>{const rail=e.target.closest('.film-rail');if(rail&&e.target===rail&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*rail.clientWidth*.8,behavior:reduce.matches?'instant':'smooth'});}});
  document.addEventListener('pointerdown',e=>{const rail=e.target.closest('.film-rail');if(!rail||e.pointerType!=='mouse'||e.button!==0)return;const start=e.clientX,origin=rail.scrollLeft;let moved=false;
    const move=ev=>{if(Math.abs(ev.clientX-start)>6){moved=true;rail.classList.add('is-dragging');rail.scrollLeft=origin-(ev.clientX-start);}};
    const up=()=>{window.removeEventListener('pointermove',move);rail.classList.remove('is-dragging');if(moved)rail.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();},{capture:true,once:true});};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
  });
  document.addEventListener('change',e=>{if(e.target.id==='property')location.hash=route('home',e.target.value);});
  document.addEventListener('visibilitychange',syncMotion);reduce.addEventListener('change',syncMotion);navigator.connection?.addEventListener?.('change',syncMotion);
  window.addEventListener('hashchange',()=>{state.filter='all';render();});
  desktopHomeLayout.addEventListener("change",()=>{if(state.view==='home')render(false);});
  render(false);
})();
