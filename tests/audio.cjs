'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(require('node:path').resolve(__dirname,'..'));
let now=0,timeout,player,clicks=0;
class AudioContext{constructor(){this.state='running';this.currentTime=0;this.destination={}}createOscillator(){return {type:'',frequency:{value:0},connect(){},start(){clicks++},stop(){}}}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}}
class Audio{
 constructor(){this.paused=true;this.volume=0;this.currentTime=0;this.events={};player=this}
 addEventListener(name,handler){this.events[name]=handler}
 play(){this.paused=false;return Promise.resolve()}
 pause(){this.paused=true}
}
const label={textContent:''};
const ctx=vm.createContext({Audio,window:{AudioContext},document:{getElementById:()=>label},performance:{now:()=>now},setTimeout:(fn)=>{timeout=fn;return 1},clearTimeout(){},Math});
vm.runInContext(fs.readFileSync('assets/js/music.js','utf8'),ctx);
(async()=>{
 assert.equal(await vm.runInContext('AdventureAudio.unlock()',ctx),true);
 vm.runInContext('AdventureAudio.newQuestion()',ctx);
 assert.ok(label.textContent&&player.src.startsWith('assets/audio/'));
 assert.equal(player.paused,false);assert.equal(player.volume,.35);vm.runInContext('AdventureAudio.tick()',ctx);assert.equal(clicks,1);
 const first=player.src;
 vm.runInContext('AdventureAudio.skip()',ctx);assert.notEqual(player.src,first);
 vm.runInContext('AdventureAudio.duck(5000)',ctx);assert.ok(player.volume<.1);
 now+=5000;timeout();assert.equal(player.volume,.35);
 vm.runInContext('AdventureAudio.speech(true)',ctx);assert.ok(player.volume<.06);
 now+=60000;assert.ok(player.volume<.06);
 vm.runInContext('AdventureAudio.speech(false)',ctx);assert.equal(player.volume,.35);
 vm.runInContext('AdventureAudio.success();AdventureAudio.tick()',ctx);assert.equal(player.paused,true);assert.equal(clicks,1);
 vm.runInContext('AdventureAudio.resume();AdventureAudio.toggle();AdventureAudio.tick()',ctx);assert.equal(player.paused,true);assert.equal(clicks,1);
 vm.runInContext('AdventureAudio.toggle();AdventureAudio.volume(0);AdventureAudio.tick()',ctx);assert.equal(player.volume,0);assert.equal(clicks,1);
 assert.equal(vm.runInContext('AdventureAudio.tracks.length',ctx),9);
 for(const file of ['carefree.mp3','frost-waltz.mp3','dream-culture.mp3','daily-beetle.mp3','windswept.mp3','crinoline-dreams.mp3','wholesome.mp3','porch-swing-days-slower.mp3','almost-bliss.mp3'])assert.ok(fs.statSync(`assets/audio/${file}`).size>100000);
 console.log('PASS: nine licensed local recordings, non-repeating selection, playback, ducking, pause, mute, and volume.');
})().catch(e=>{console.error(e);process.exitCode=1});
