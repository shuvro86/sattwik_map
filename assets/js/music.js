'use strict';

// Locally bundled recordings by Kevin MacLeod, CC BY 4.0. Credits are in the app.
const AdventureAudio=(()=>{
 const tracks=[
  {name:'Carefree',file:'carefree.mp3'},
  {name:'Frost Waltz',file:'frost-waltz.mp3'},
  {name:'Dream Culture',file:'dream-culture.mp3'},
  {name:'Daily Beetle',file:'daily-beetle.mp3'},
  {name:'Windswept',file:'windswept.mp3'},
  {name:'Crinoline Dreams',file:'crinoline-dreams.mp3'},
  {name:'Wholesome',file:'wholesome.mp3'},
  {name:'Porch Swing Days',file:'porch-swing-days-slower.mp3'},
  {name:'Almost Bliss',file:'almost-bliss.mp3'}
 ];
 let player,enabled=true,playing=false,volume=.35,track=-1,bag=[],duckUntil=0,duckTimer,speaking=false,tickContext;
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function setup(){
  if(player)return true;
  if(typeof Audio!=='function')return false;
  player=new Audio();player.preload='none';
  player.addEventListener('ended',()=>{if(playing&&enabled){select();resume()}});
  return true;
 }
 function setVolume(){if(player)player.volume=playing&&enabled?volume*(speaking||performance.now()<duckUntil?.16:1):0}
 function refillBag(){bag=shuffle(tracks.map((_,i)=>i).filter(i=>i!==track))}
 function select(){
  if(!bag.length)refillBag();
  track=bag.pop();
  if(player){player.pause();player.src=`assets/audio/${tracks[track].file}`;player.currentTime=0;setVolume()}
  const label=document.getElementById('track-name');if(label)label.textContent=tracks[track].name;
 }
 function resume(){
  playing=true;if(!setup())return;
  if(track<0)select();setVolume();
  if(enabled&&player.paused)player.play().catch(()=>{});
 }
 function pause(){playing=false;if(player){player.pause();setVolume()}}
 function success(){pause()}
 function tick(){
  if(!enabled||!playing||!volume)return;
  try{
   if(!tickContext){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;tickContext=new AudioContext()}
   if(tickContext.state==='suspended')tickContext.resume().catch(()=>{});
   const oscillator=tickContext.createOscillator(),gain=tickContext.createGain(),time=tickContext.currentTime;
   oscillator.type='sine';oscillator.frequency.value=880;
   gain.gain.setValueAtTime(Math.min(.12,volume*.25),time);
   gain.gain.exponentialRampToValueAtTime(.001,time+.07);
   oscillator.connect(gain);gain.connect(tickContext.destination);oscillator.start(time);oscillator.stop(time+.07);
  }catch{}
 }
 function duck(ms=5000){
  duckUntil=performance.now()+ms;clearTimeout(duckTimer);setVolume();
  duckTimer=setTimeout(()=>setVolume(),ms);
 }
 return {
  get enabled(){return enabled},
  async unlock(){const ready=setup();try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext){tickContext??=new AudioContext();if(tickContext.state==='suspended')await tickContext.resume()}}catch{}return ready},
  newQuestion(){if(!setup())return;select();resume()},
  pause,resume,success,
  toggle(){enabled=!enabled;if(!enabled&&player)player.pause();else if(playing)resume();setVolume();return enabled},
  volume(value){volume=Math.max(0,Math.min(1,value));setVolume()},
  speech(active){speaking=active;setVolume()},
  duck,tick,
  skip(){if(!setup())return;select();if(playing&&enabled)resume()},
  get tracks(){return tracks.map(t=>t.name)}
 };
})();
