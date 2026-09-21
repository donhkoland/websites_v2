/* Local, lazy-loaded maps. Coordinates are reused from v2 or sourced from OSM. */
window.GuideMaps=(()=>{
 let observer,maps=[],generation=0,loading;
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function library(){return loading||(loading=new Promise((resolve,reject)=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='assets/map/leaflet.min.css';document.head.append(css);
  const js=document.createElement('script');js.src='assets/map/leaflet.js';js.onload=resolve;js.onerror=()=>{loading=null;reject(Error('Map unavailable'));};document.head.append(js);
 }));}
 function destroy(){generation++;observer?.disconnect();maps.forEach(m=>m.remove());maps=[];}
 function observe(zones){
  const current=generation;
  if(typeof window.IntersectionObserver!=='function'){document.querySelectorAll('[data-guide-map]').forEach(el=>init(el,zones,current));return;}
  observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){observer.unobserve(e.target);init(e.target,zones,current);}}),{rootMargin:'250px'});
  document.querySelectorAll('[data-guide-map]').forEach(el=>observer.observe(el));
 }
 async function init(el,zones,current){
  const kind=el.dataset.guideMap,data=window.GUIDE_MAP_DATA;
  const groups=kind==='destination'?[['All places',data.destination]]:zones.map(([label,names])=>[label,names.map(n=>({n,...data.taste[n],group:label}))]);
  const select=el.querySelector('select'),info=el.querySelector('.map-place-info'),node=el.querySelector('.guide-map'),buttons=el.querySelector('.map-categories'),legend=el.querySelector('.guide-map-legend');
  let map,layer,active=[],markers=[];
  const groupImages={
   'Oceanfront Favorites':'assets/img/map-taste-la-huella.webp','Favorites in Town':'assets/img/map-taste-marismo.webp',
   'Coffee & Casual':'assets/img/map-taste-santa-teresita.webp','Countryside':'assets/img/map-taste-bodega-garzon.webp',
   'Punta del Este':'assets/img/map-taste-lo-de-tere.webp','Manantiales & La Barra':'assets/img/map-taste-la-linda.webp',
   'Uruguayan Wineries':'assets/img/map-taste-vina-eden.webp'
  };
  const imageFor=p=>p.img||groupImages[p.group]||'assets/video/pillar-dining-poster.webp';
  function popup(p){const dest=p.lat?p.lat+','+p.lng:p.n+' Uruguay';return `<div class="guide-popup"><img src="${escape(imageFor(p))}" alt="" width="1000" height="800"><div class="guide-popup-body"><b>${escape(p.n)}</b>${p.d?`<span>${escape(p.d)}</span>`:''}${p.meta||p.group?`<small>${escape(p.meta||p.group)}</small>`:''}<a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}">Directions ↗</a></div></div>`;}
  function details(p){
   const q=encodeURIComponent(p.n+' Uruguay');const dest=p.lat?p.lat+','+p.lng:p.n+' Uruguay';
   info.innerHTML=`<div class="map-place-media"><img src="${escape(imageFor(p))}" alt="" width="1000" height="800" loading="lazy" decoding="async"></div><div class="map-place-body"><h3>${escape(p.n)}</h3>${p.d?`<p>${escape(p.d)}</p>`:''}${p.meta||p.group?`<p class="muted">${escape(p.meta||p.group)}</p>`:''}${!p.lat?'<p class="muted">Find this venue in Maps.</p>':''}<div class="map-actions"><a class="text-link" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}">Directions ↗</a><a class="text-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}">View in Maps ↗</a></div></div>`;
  }
  function setSelected(i){select.value=String(i);legend?.querySelectorAll('li').forEach((item,j)=>item.classList.toggle('is-active',i===j));}
  function pick(i){const p=active[i];if(!p)return;setSelected(i);details(p);if(map&&p.lat){map.flyTo([p.lat,p.lng],14,{duration:.7});markers[i]?.openPopup();}}
  function group(i){
   active=groups[i][1];buttons.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
   select.innerHTML=active.map((p,j)=>`<option value="${j}">${escape(p.n)}</option>`).join('');
   if(legend)legend.innerHTML=active.map((p,j)=>`<li${j===0?' class="is-active"':''}><button type="button" data-map-place="${j}"><span class="guide-map-dot"></span><span>${escape(p.n)}</span></button></li>`).join('');
   layer?.clearLayers();markers=[];
   if(map){active.forEach((p,j)=>{if(!p.lat)return;const compact=matchMedia('(max-width:699px)').matches;const marker=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'guide-pin',html:`<span>${j+1}</span>`,iconSize:[30,30],iconAnchor:[15,30]}),title:p.n}).addTo(layer).bindPopup(popup(p),{maxWidth:compact?220:280,minWidth:compact?0:240,autoPanPadding:[18,18],keepInView:true});marker.on('click',()=>{setSelected(j);details(p);});markers[j]=marker;});const points=active.filter(p=>p.lat).map(p=>[p.lat,p.lng]);if(points.length)map.fitBounds(points,{padding:matchMedia('(max-width:699px)').matches?[22,22]:[38,38],maxZoom:14,animate:false});}
   setSelected(0);details(active[0]);
  }
  buttons.hidden=groups.length===1;buttons.innerHTML=groups.length>1?groups.map(([label],i)=>`<button class="filter" data-map-category="${i}" aria-pressed="${i===0}">${escape(label)}</button>`).join(''):'';
  buttons.addEventListener('click',e=>{const b=e.target.closest('button');if(b)group(Number(b.dataset.mapCategory));});
  legend?.addEventListener('click',e=>{const item=e.target.closest('[data-map-place]');if(item)pick(Number(item.dataset.mapPlace));});
  select.addEventListener('change',()=>pick(Number(select.value)));group(0);
  try{await library();if(current!==generation||!el.isConnected)return;
   map=L.map(node,{scrollWheelZoom:false,zoomControl:false,attributionControl:false}).setView([-34.82,-54.68],11);maps.push(map);layer=L.layerGroup().addTo(map);
   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Imagery &copy; Esri',maxZoom:19}).addTo(map);group(0);
  }catch{node.innerHTML='<p class="map-fallback">The map could not load. Choose a place above to open directions.</p>';}
 }
 return {observe,destroy};
})();
