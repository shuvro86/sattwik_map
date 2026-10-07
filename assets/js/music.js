'use strict';

// Locally bundled recordings by Kevin MacLeod, CC BY 4.0. Credits are in the app.
const AdventureAudio=(()=>{
 const tracks=[
  {name:'Carefree',file:'carefree.mp3'},
  {name:'Frost Waltz',file:'frost-waltz.mp3'},
  {name:'Dream Culture',file:'dream-culture.mp3'}
 ];
 let player,enabled=true,playing=false,volume=.16,track=-1,bag=[],duckUntil=0,duckTimer;
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function setup(){
  if(player)return true;
  if(typeof Audio!=='function')return false;
  player=new Audio();player.preload='none';
  player.addEventListener('ended',()=>{if(playing&&enabled){select();resume()}});
  return true;
 }
 function setVolume(){if(player)player.volume=playing&&enabled?volume*(performance.now()<duckUntil?.22:1):0}
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
 function duck(ms=5000){
  duckUntil=performance.now()+ms;clearTimeout(duckTimer);setVolume();
  duckTimer=setTimeout(()=>setVolume(),ms);
 }
 return {
  get enabled(){return enabled},
  async unlock(){return setup()},
  newQuestion(){if(!setup())return;select();resume()},
  pause,resume,success,
  toggle(){enabled=!enabled;if(!enabled&&player)player.pause();else if(playing)resume();setVolume();return enabled},
  volume(value){volume=Math.max(0,Math.min(.3,value));setVolume()},
  duck,
  skip(){if(!setup())return;select();if(playing&&enabled)resume()},
  get tracks(){return tracks.map(t=>t.name)}
 };
})();
