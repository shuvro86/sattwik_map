'use strict';
const CountryGallery={
 render(container,c){
  container.replaceChildren();const photos=typeof PHOTOS==='undefined'?[]:PHOTOS[c.id]||[];
  const intro=document.createElement('p');intro.className='gallery-intro';intro.textContent=`A picture adventure through ${c.name} · ${photos.length} photographs`;container.append(intro);
  const grid=document.createElement('div');grid.className='photo-grid';container.append(grid);
  for(const [i,p] of photos.entries()){
   const card=document.createElement('figure');card.className='photo-card';card.style.setProperty('--i',i);
   const img=document.createElement('img');img.src=p.url;img.alt=p.title.replace(/\.(jpe?g|png|webp)$/i,'').replace(/_/g,' ');img.loading=i<2?'eager':'lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.width=640;img.height=430;
   const caption=document.createElement('figcaption');const name=document.createElement('strong');name.textContent=img.alt;caption.append(name);
   const credit=document.createElement('span');credit.className='photo-credit';credit.textContent=`Photo: ${p.artist} · ${p.license}`;caption.append(credit);
   const source=document.createElement('a');source.href=p.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Photo & credits ↗';caption.append(source);
   if(p.licenseUrl&&/^https?:\/\//.test(p.licenseUrl)){const license=document.createElement('a');license.href=p.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';license.textContent='License ↗';caption.append(license)}
   const error=document.createElement('div');error.className='photo-error hidden';error.textContent='This photo couldn’t load. Check your connection.';
   const retry=document.createElement('button');retry.textContent='Try this photo again';retry.onclick=()=>{error.classList.add('hidden');img.classList.remove('hidden');img.src=p.url};error.append(retry);
   img.onerror=()=>{img.classList.add('hidden');error.classList.remove('hidden')};card.append(img,error,caption);grid.append(card);
  }
  if(!photos.length){const p=document.createElement('p');p.textContent='This gallery is not available yet.';container.append(p)}
 }
};
if(document.body.dataset.page==='gallery'){
 const code=new URLSearchParams(location.search).get('country');const c=COUNTRIES.find(c=>c.id===code);
 if(c){document.title=`${c.name} · Sattwik’s Picture Adventure`;document.getElementById('gallery-title').textContent=`Hello, ${c.name}!`;document.getElementById('gallery-flag').textContent=c.flag;document.getElementById('gallery-subtitle').textContent=`${c.region} · ${c.population.toLocaleString()} people (${c.populationYear})`;CountryGallery.render(document.getElementById('standalone-gallery'),c)}
 else{document.getElementById('gallery-title').textContent='Choose a country in the explorer first.'}
}
