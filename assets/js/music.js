'use strict';

// Twelve gentle, original procedural arrangements. No recordings, streams, or third-party audio.
const AdventureAudio=(()=>{
 const tracks=[
  {name:'Cloud Castle',bpm:84,voice:'triangle',swing:0,melody:[67,72,76,null,74,72,67,null,69,72,76,null,74,72,69,null,67,71,74,null,72,71,67,null,69,74,77,null,76,74,72,null],chords:[[60,64,67],[57,60,64],[55,59,62],[53,57,60]]},
  {name:'Firefly Forest',bpm:92,voice:'sine',swing:.06,melody:[64,null,67,69,72,null,69,null,65,null,69,72,74,null,72,null,67,null,71,74,76,null,74,null,65,69,72,null,69,67,64,null],chords:[[60,64,67],[65,69,72],[67,71,74],[60,64,67]]},
  {name:'Coral Moon',bpm:78,voice:'sine',swing:0,melody:[69,72,null,76,74,72,null,69,67,69,null,72,76,74,null,72,65,69,null,72,74,72,null,69,67,72,71,69,67,64,null,null],chords:[[65,69,72],[60,64,67],[62,65,69],[60,64,67]]},
  {name:'Little Airship',bpm:104,voice:'triangle',swing:.04,melody:[67,71,74,71,67,null,69,null,72,76,79,76,72,null,71,null,69,72,76,72,69,null,67,null,71,74,79,74,71,69,67,null],chords:[[67,71,74],[72,76,79],[69,72,76],[67,71,74]]},
  {name:'Lantern River',bpm:86,voice:'sine',swing:0,melody:[69,null,72,76,74,null,72,null,67,null,71,74,72,null,71,null,65,null,69,72,74,72,69,null,67,69,72,null,71,69,67,null],chords:[[69,72,76],[67,71,74],[65,69,72],[67,71,74]]},
  {name:'Starry Caravan',bpm:96,voice:'triangle',swing:.08,melody:[62,65,69,null,68,65,62,null,65,68,72,null,69,68,65,null,60,64,67,null,69,67,64,null,62,65,68,69,68,65,62,null],chords:[[62,65,69],[65,68,72],[60,64,67],[62,65,69]]},
  {name:'Aurora Lullaby',bpm:74,voice:'sine',swing:0,melody:[72,null,76,null,79,76,null,null,71,null,74,null,78,74,null,null,69,null,72,76,74,72,null,null,67,71,74,72,71,69,null,null],chords:[[60,64,67],[59,62,67],[57,60,64],[55,59,62]]},
  {name:'Island Picnic',bpm:108,voice:'triangle',swing:.1,melody:[67,69,72,null,74,72,69,null,64,67,71,null,72,71,67,null,65,69,72,null,74,72,69,null,67,71,74,72,71,69,67,null],chords:[[60,64,67],[64,67,71],[65,69,72],[67,71,74]]},
  {name:'Savanna Morning',bpm:100,voice:'triangle',swing:.05,melody:[64,67,71,null,72,71,67,null,62,66,69,null,71,69,66,null,64,69,72,null,71,69,67,null,62,67,71,74,71,69,67,null],chords:[[64,67,71],[62,66,69],[65,69,72],[67,71,74]]},
  {name:'Snowglobe Waltz',bpm:82,voice:'sine',swing:0,melody:[67,null,71,74,null,71,69,null,72,null,76,79,null,76,74,null,69,null,72,76,null,72,71,null,67,71,74,79,74,71,67,null],chords:[[67,71,74],[72,76,79],[69,72,76],[67,71,74]]},
  {name:'Rainbow Railway',bpm:112,voice:'triangle',swing:.08,melody:[60,64,67,null,69,67,64,null,62,65,69,null,72,69,65,null,64,67,71,null,72,71,67,null,65,69,72,74,72,69,67,null],chords:[[60,64,67],[62,65,69],[64,67,71],[65,69,72]]},
  {name:'Compass Dreams',bpm:90,voice:'sine',swing:.03,melody:[60,null,67,64,69,null,67,null,65,null,72,69,74,null,72,null,67,71,74,null,76,74,71,null,69,72,76,74,72,69,67,null],chords:[[60,64,67],[65,69,72],[67,71,74],[60,64,67]]}
 ];
 let context,master,enabled=true,playing=false,volume=.13,track=-1,step=0,nextTime=0,duckUntil=0,bag=[];
 const hz=n=>440*2**((n-69)/12);
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function setup(){if(context)return true;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);return true}
 function note(n,t,duration,gain,type='sine',attack=.025){if(n==null)return;const osc=context.createOscillator(),env=context.createGain();osc.type=type;osc.frequency.value=hz(n);env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(gain,t+attack);env.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(env);env.connect(master);osc.start(t);osc.stop(t+duration+.04);osc.onended=()=>{osc.disconnect();env.disconnect()}}
 function softPulse(t){const osc=context.createOscillator(),env=context.createGain();osc.type='sine';osc.frequency.setValueAtTime(78,t);osc.frequency.exponentialRampToValueAtTime(52,t+.22);env.gain.setValueAtTime(.028,t);env.gain.exponentialRampToValueAtTime(.0001,t+.26);osc.connect(env);env.connect(master);osc.start(t);osc.stop(t+.28);osc.onended=()=>{osc.disconnect();env.disconnect()}}
 function bell(t,n,gain=.022){note(n,t,.72,gain,'sine',.018);note(n+12,t+.025,.5,gain*.38,'sine',.02)}
 function refillBag(){bag=shuffle(tracks.map((_,i)=>i).filter(i=>i!==track))}
 function select(){if(!bag.length)refillBag();track=bag.pop();step=0;if(context)nextTime=context.currentTime+.05;const el=document.getElementById('track-name');if(el)el.textContent=tracks[track].name}
 function setGain(){if(context)master.gain.setTargetAtTime(playing&&enabled?volume*(performance.now()<duckUntil?.18:1):0,context.currentTime,.14)}
 function scheduleStep(){
  const tr=tracks[track],beat=60/tr.bpm,half=beat/2,phraseStep=step%32,chordIndex=Math.floor(phraseStep/8),beatInChord=phraseStep%8,swing=beatInChord%2?half*tr.swing:0,t=nextTime+swing,chord=tr.chords[chordIndex],lead=tr.melody[phraseStep];
  note(lead,t,half*.82,.052,tr.voice,.035);
  if(beatInChord===0){softPulse(t);note(chord[0]-24,t,beat*3.7,.047,'sine',.06);for(const n of chord)note(n,t,beat*3.55,.0075,'sine',.22)}
  if(beatInChord%2===0)note(chord[(beatInChord/2)%3]+12,t,half*.72,.014,'triangle',.025);
  if(phraseStep===30&&lead!=null)bell(t,lead+12);
  nextTime+=half;if(++step===128)select();
 }
 setInterval(()=>{if(!context||!enabled||!playing)return;setGain();if(context.state!=='running')return;if(nextTime<context.currentTime)nextTime=context.currentTime+.05;while(nextTime<context.currentTime+.18)scheduleStep()},70);
 function success(){playing=false;if(!context||!enabled)return;const t=context.currentTime+.05;master.gain.setTargetAtTime(volume*.72,t,.03);[67,72,76,79].forEach((n,i)=>bell(t+i*.2,n,.038-i*.004));master.gain.setTargetAtTime(0,t+1.45,.24)}
 return {get enabled(){return enabled},async unlock(){if(!setup())return false;try{await context.resume();return true}catch{return false}},newQuestion(){select();playing=true;setGain()},pause(){playing=false;setGain()},resume(){if(track<0)select();playing=true;setGain()},success,toggle(){enabled=!enabled;setGain();return enabled},volume(v){volume=Math.max(0,Math.min(.3,v));setGain()},duck(ms=5000){duckUntil=performance.now()+ms;setGain()},skip(){select()},get tracks(){return tracks.map(t=>t.name)}};
})();
