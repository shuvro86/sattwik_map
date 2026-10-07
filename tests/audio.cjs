'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(require('node:path').resolve(__dirname,'..'));
let now=0,timeout,player;
class Audio{
 constructor(){this.paused=true;this.volume=0;this.currentTime=0;this.events={};player=this}
 addEventListener(name,handler){this.events[name]=handler}
 play(){this.paused=false;return Promise.resolve()}
 pause(){this.paused=true}
}
const label={textContent:''};
const ctx=vm.createContext({Audio,window:{},document:{getElementById:()=>label},performance:{now:()=>now},setTimeout:(fn)=>{timeout=fn;return 1},clearTimeout(){},Math});
vm.runInContext(fs.readFileSync('assets/js/music.js','utf8'),ctx);
(async()=>{
 assert.equal(await vm.runInContext('AdventureAudio.unlock()',ctx),true);
 vm.runInContext('AdventureAudio.newQuestion()',ctx);
 assert.ok(label.textContent&&player.src.startsWith('assets/audio/'));
 assert.equal(player.paused,false);assert.ok(player.volume>0);
 const first=player.src;
 vm.runInContext('AdventureAudio.skip()',ctx);assert.notEqual(player.src,first);
 vm.runInContext('AdventureAudio.duck(5000)',ctx);assert.ok(player.volume<.05);
 now+=5000;timeout();assert.ok(player.volume>.05);
 vm.runInContext('AdventureAudio.success()',ctx);assert.equal(player.paused,true);
 vm.runInContext('AdventureAudio.resume();AdventureAudio.toggle()',ctx);assert.equal(player.paused,true);
 vm.runInContext('AdventureAudio.toggle();AdventureAudio.volume(0)',ctx);assert.equal(player.volume,0);
 assert.equal(vm.runInContext('AdventureAudio.tracks.length',ctx),3);
 for(const file of ['carefree.mp3','frost-waltz.mp3','dream-culture.mp3'])assert.ok(fs.statSync(`assets/audio/${file}`).size>100000);
 console.log('PASS: three licensed local recordings, non-repeating selection, playback, ducking, pause, mute, and volume.');
})().catch(e=>{console.error(e);process.exitCode=1});
