'use strict';

// Orthographic globes. Longitude/latitude remain geographic throughout the reveal.
const Globes=(()=>{
 const radians=Math.PI/180;
 const unit=([lon,lat])=>{const p=lat*radians,l=lon*radians;return [Math.cos(p)*Math.cos(l),Math.sin(p),Math.cos(p)*Math.sin(l)]};
 const land=WORLD.map(r=>r.map(unit));
 const countryLand=new Map();
 let revealStart=0,revealCountry=null,lastFrame=0,spin=0,revealDone=false,homeDrawn=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
 const easeInOut=n=>n<.5?4*n*n*n:1-(-2*n+2)**3/2;

 function draw(canvas,longitude,latitude,country=null,options={}){
  if(!canvas)return null;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const size=canvas.width,mid=size/2,r=size*(options.radius||.472),lon=longitude*radians,lat=latitude*radians;
  const sl=Math.sin(lon),cl=Math.cos(lon),sp=Math.sin(lat),cp=Math.cos(lat);
  const project=p=>{const facing=cl*p[0]+sl*p[2];return [mid+r*(-sl*p[0]+cl*p[2]),mid-r*(cp*p[1]-sp*facing),sp*p[1]+cp*facing]};
  ctx.clearRect(0,0,size,size);
  if(options.halo){const glow=ctx.createRadialGradient(mid,mid,r*.72,mid,mid,r*1.12);glow.addColorStop(0,'#64d7ff00');glow.addColorStop(.72,'#64d7ff12');glow.addColorStop(1,'#7658dc00');ctx.fillStyle=glow;ctx.fillRect(0,0,size,size)}
  const ocean=ctx.createRadialGradient(mid-r*.38,mid-r*.43,r*.08,mid,mid,r);ocean.addColorStop(0,'#87edfa');ocean.addColorStop(.48,'#38bde6');ocean.addColorStop(.83,'#237fcb');ocean.addColorStop(1,'#124d91');
  ctx.beginPath();ctx.arc(mid,mid,r,0,Math.PI*2);ctx.fillStyle=ocean;ctx.fill();ctx.save();ctx.clip();
  function polygons(rings,fill,stroke,lineWidth=size/850){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;for(const ring of rings){ctx.beginPath();let visible=false;for(const p of ring){const [x,y,z]=project(p);if(z<0){visible=false;continue}if(!visible){ctx.moveTo(x,y);visible=true}else ctx.lineTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke()}}
  polygons(land,'#a7df82','#69ba88');
  ctx.strokeStyle='#ffffff24';ctx.lineWidth=Math.max(1,size/900);
  for(let phi=-60;phi<=60;phi+=30){ctx.beginPath();let active=false;for(let l=-180;l<=180;l+=3){const [x,y,z]=project(unit([l,phi]));if(z<0){active=false;continue}if(!active){ctx.moveTo(x,y);active=true}else ctx.lineTo(x,y)}ctx.stroke()}
  let marker=null;
  if(country&&options.highlight!==false){
   if(!countryLand.has(country.id))countryLand.set(country.id,GEOMETRY[country.id].map(ring=>ring.map(unit)));
   polygons(countryLand.get(country.id),'#ffd958','#fff7bd',Math.max(2,size/320));
   const [x,y,z]=project(unit([country.lon,country.lat]));marker={x,y,z};
   if(z>=0){const pulse=options.pulse||0,core=size*.014;ctx.beginPath();ctx.arc(x,y,core*(2.6+pulse*1.5),0,Math.PI*2);ctx.fillStyle=`rgba(255,84,133,${.13+.16*(1-pulse)})`;ctx.fill();ctx.beginPath();ctx.arc(x,y,core,0,Math.PI*2);ctx.fillStyle='#ff5485';ctx.fill();ctx.lineWidth=Math.max(2,size*.004);ctx.strokeStyle='white';ctx.stroke();ctx.beginPath();ctx.arc(x,y,core*(3.6+pulse*2.4),0,Math.PI*2);ctx.strokeStyle=`rgba(255,255,255,${.72*(1-pulse)})`;ctx.lineWidth=Math.max(2,size*.003);ctx.stroke()}
  }
  const shade=ctx.createRadialGradient(mid-r*.38,mid-r*.42,r*.16,mid,mid,r);shade.addColorStop(0,'#ffffff12');shade.addColorStop(.68,'#08346c00');shade.addColorStop(1,'#062e675e');ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);ctx.restore();ctx.beginPath();ctx.arc(mid,mid,r+2,0,Math.PI*2);ctx.strokeStyle='#e5fbff';ctx.lineWidth=Math.max(3,size/220);ctx.stroke();ctx.beginPath();ctx.arc(mid-r*.25,mid-r*.32,r*.62,-2.55,-.72);ctx.strokeStyle='#ffffff45';ctx.lineWidth=Math.max(2,size/300);ctx.stroke();
  return marker;
 }
 function setPhase(phase){const stage=document.querySelector('.map-stage');if(stage)stage.dataset.revealPhase=phase}
 function animate(time){
  requestAnimationFrame(animate);if(document.hidden||document.querySelector('dialog[open]')||time-lastFrame<33)return;lastFrame=time;
  const home=document.getElementById('level-screen');if(home&&!home.classList.contains('hidden')&&(!reduced()||!homeDrawn)){if(!reduced())spin+=.27;draw(document.getElementById('landing-globe'),spin,12,null,{radius:.475,halo:true});homeDrawn=true}
  if(!revealCountry||revealDone)return;
  const duration=3800,t=reduced()?1:clamp((time-revealStart)/duration),turn=easeInOut(clamp((t-.15)/.63));
  const longitude=revealCountry.lon-145*(1-turn),latitude=-8+(revealCountry.lat*.82+8)*turn;
  const highlight=t>.66?revealCountry:null,pulse=t>.72?((Math.sin((t-.72)*Math.PI*7)+1)/2)*clamp((1-t)/.28):0;
  const marker=draw(document.getElementById('reveal-globe'),longitude,latitude,highlight,{radius:.472,halo:true,pulse});
  if(marker&&marker.z>=0){const canvas=document.getElementById('reveal-globe'),stage=document.querySelector('.map-stage'),box=canvas.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();stage.style.setProperty('--landing-x',`${box.left-stageBox.left+marker.x/canvas.width*box.width}px`);stage.style.setProperty('--landing-y',`${box.top-stageBox.top+marker.y/canvas.height*box.height}px`)}
  setPhase(t<.18?'lock':t<.48?'lift':t<.7?'orbit':t<.9?'locate':'landed');if(t===1){revealDone=true;setPhase('landed')}
 }
 requestAnimationFrame(animate);
 return {
  draw,
  reset(){revealCountry=null;revealDone=false;const stage=document.querySelector('.map-stage');if(stage){stage.classList.remove('revealing');delete stage.dataset.revealPhase;stage.style.removeProperty('--landing-x');stage.style.removeProperty('--landing-y')}const label=document.getElementById('location-label');if(label)label.classList.add('hidden')},
  reveal(c){revealDone=false;revealCountry=c;revealStart=performance.now();const stage=document.querySelector('.map-stage');stage.classList.remove('revealing');delete stage.dataset.revealPhase;void stage.offsetWidth;stage.classList.add('revealing');setPhase('lock');const label=document.getElementById('location-label');label.replaceChildren();const eyebrow=document.createElement('span');eyebrow.textContent='FOUND ON OUR WORLD';const name=document.createElement('strong');name.textContent=`${c.flag} ${c.name}`;const region=document.createElement('small');region.textContent=c.region;label.append(eyebrow,name,region);label.classList.remove('hidden');document.getElementById('reveal-globe').setAttribute('aria-label',`${c.name} highlighted at its real location on Earth`);if(reduced()){draw(document.getElementById('reveal-globe'),c.lon,c.lat*.82,c,{radius:.472,halo:true});revealDone=true;setPhase('landed')}}
 };
})();
