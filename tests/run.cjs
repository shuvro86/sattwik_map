process.chdir(require('path').resolve(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class El{constructor(){this.textContent='';this.value='';this.children=[];this.style={setProperty(){}};this.attrs={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.open=false;this.handlers={}}set innerHTML(s){this.children=s.includes('<span>')?Array.from({length:5},()=>new El):s.includes('<ol>')?[new El]:[]}get firstChild(){return this.children[0]}setAttribute(k,v){this.attrs[k]=v}append(e){this.children.push(e)}replaceChildren(...e){this.children=e}addEventListener(e,cb){this.handlers[e]=cb}getBoundingClientRect(){}closest(){return new El}focus(){}select(){}scrollIntoView(){}getContext(){return new Proxy({},{get:()=>()=>{}})}showModal(){this.open=true}close(){this.open=false;this.handlers.close?.()}}
const els={},saved={};const doc={hidden:false,body:{classList:{remove(){}}},getElementById:id=>els[id]??=new El,querySelector:()=>new El,querySelectorAll:()=>[],createElement:()=>new El,addEventListener(){}};let now=0,tick,scheduled,speechDucked=false,ticks=0;const ctx=vm.createContext({document:doc,window:{},localStorage:{setItem:(k,v)=>saved[k]=v,getItem:k=>saved[k]||null},performance:{now:()=>now},setInterval:f=>tick=f,setTimeout:(fn,ms)=>{if(ms!==60000)scheduled=fn;return 0},clearTimeout(){},matchMedia:q=>({matches:q.includes('reduced-motion')}),Math,Set,Globes:{draw(){},reset(){},reveal(){}},AdventureAudio:{resume(){},pause(){},success(){},speech:active=>speechDucked=active,tick:()=>ticks++,newQuestion(){},unlock:()=>Promise.resolve(true),toggle:()=>false,volume(){},skip(){}},CountryGallery:{render(){}}});
vm.runInContext(fs.readFileSync('assets/js/data.js','utf8')+'\n'+fs.readFileSync('assets/js/app.js','utf8'),ctx);
const state=()=>vm.runInContext('({index,clueCount,remaining,resolved,stars:discovered.size,totalScore,wrongCount})',ctx);const reveal=()=>{assert.equal(typeof scheduled,'function');scheduled()};function advance(ms){now+=ms;tick()}
assert.equal(vm.runInContext("validBirthYear('2020')",ctx),true);assert.equal(vm.runInContext("validBirthYear('20')",ctx),false);assert.equal(vm.runInContext("validBirthYear('2999')",ctx),false);
assert.equal(els['explorer-birth-year'].children.length,121);
const entryHtml=fs.readFileSync('index.html','utf8');assert.match(entryHtml,/<select id="voice-choice"[^>]*><option value="gentle">Gentle<\/option><option value="clear">Clear<\/option><\/select>/);assert.match(entryHtml,/<select id="bangla-voice-choice"[^>]*><option value="gentle">Gentle<\/option><option value="clear">Clear<\/option><\/select>/);assert.match(entryHtml,/id="bangla-voice-status"/);assert.match(entryHtml,/id="bangla-voice-sample"/);assert.ok(entryHtml.indexOf('id="profile-settings"')<entryHtml.indexOf('Start exploring ➜'));assert.match(entryHtml,/<input id="explorer-name"[^>]*maxlength="15"[^>]*required/);assert.match(entryHtml,/<select id="explorer-birth-year"[^>]*required/);assert.match(entryHtml,/<button[^>]*id="profile-settings"[^>]*>⚙ Adjust Settings<\/button>/);
assert.match(entryHtml,/<section id="marking-rules"[\s\S]*?8 − \(3 × 3\) = −1[\s\S]*?<\/section>/);
assert.match(entryHtml,/3 points for every wrong answer/);
assert.match(entryHtml,/An automatic reveal starts at <strong>0 points<\/strong>; wrong-answer deductions still apply/);
assert.doesNotMatch(entryHtml,/Wrong guesses do not reduce points/);
els['profile-settings'].onclick();assert.equal(els.settings.open,true);els.settings.close();
els['explorer-name'].value='SixteenLettersAB';els['explorer-birth-year'].value='2020';els['profile-form'].handlers.submit({preventDefault(){}});assert.match(els['profile-error'].textContent,/15 characters/);assert.equal(vm.runInContext('explorerName',ctx),'');
els['explorer-name'].value='  Maya  ';els['explorer-birth-year'].value='2020';els['profile-form'].handlers.submit({preventDefault(){}});
assert.equal(vm.runInContext('explorerName',ctx),'Maya');assert.equal(saved.worldExplorerName,'Maya');assert.equal(els['profile-error'].textContent,'');
assert.equal(vm.runInContext("possessive('James')",ctx),'James’');
assert.equal(vm.runInContext('level',ctx),null);advance(60000);assert.equal(state().clueCount,0);
vm.runInContext("chooseLevel('easy')",ctx);assert.equal(els.choices.children.length,4);assert.equal(vm.runInContext('queue.length',ctx),195);
advance(14999);assert.equal(state().clueCount,0);advance(1);assert.equal(state().clueCount,1);for(let i=2;i<=5;i++){advance(15000);assert.equal(state().clueCount,i);assert.equal(state().resolved,false)}advance(14999);assert.equal(state().resolved,false);advance(1);assert.equal(state().resolved,true);assert.equal(state().stars,1);assert.equal(state().totalScore,0);reveal();assert.equal(els['score-earned'].textContent,0);assert.match(els['question-score'].attrs['aria-label'],/0 points this question/);advance(15000);assert.equal(state().clueCount,5);
els.next.onclick();assert.equal(state().clueCount,0);els.pause.onclick();advance(60000);assert.equal(state().remaining,15000);els.pause.onclick();doc.hidden=true;advance(60000);assert.equal(state().remaining,15000);doc.hidden=false;els.parents.onclick();advance(60000);assert.equal(state().remaining,15000);els.settings.close();
vm.runInContext("chooseLevel('medium')",ctx);assert.equal(els.choices.children.length,4);assert.equal(vm.runInContext('new Set(queue).size===queue.length',ctx),true);assert.equal(vm.runInContext('queue.some(i=>discovered.has(i))',ctx),false);
vm.runInContext("chooseLevel('high')",ctx);assert.equal(els.choices.children.length,4);els.answer.value='wrong';els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().resolved,false);assert.equal(state().wrongCount,1);assert.match(els.feedback.textContent,/−3 points/);els.answer.value=vm.runInContext('COUNTRIES[index].name.toUpperCase()+"!"',ctx);els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().resolved,true);assert.equal(state().stars,2);assert.equal(state().totalScore,7);reveal();assert.equal(els['score-earned'].textContent,7);assert.match(els['question-score'].attrs['aria-label'],/7 points this question/);assert.match(els['score-context'].textContent,/1 wrong × −3 = −3/);
vm.runInContext("showLevels()",ctx);const old=state().remaining;advance(60000);assert.equal(state().remaining,old);assert.equal(state().stars,2);assert.equal(state().totalScore,7);
// Three wrong choices after the first clue deduct 9 from this question and carry into the total.
vm.runInContext("chooseLevel('easy')",ctx);const beforePenalty=state().totalScore;
advance(15000);assert.equal(state().clueCount,1);
const wrongChoices=els.choices.children.filter(b=>Number(b.dataset.country)!==state().index);
for(const b of wrongChoices)b.onclick();assert.equal(state().wrongCount,3);
wrongChoices[0].onclick();assert.equal(state().wrongCount,3);
els.choices.children.find(b=>Number(b.dataset.country)===state().index).onclick();
assert.equal(state().totalScore,beforePenalty-1);reveal();assert.equal(els['score-earned'].textContent,-1);assert.match(els['score-context'].textContent,/3 wrong × −3 = −9/);assert.equal(els['score-round-total'].textContent,beforePenalty-1);
// Before a clue, wrong selections still cost 3 points; each choice can cost points only once.
vm.runInContext("chooseLevel('easy')",ctx);const totalBeforeEarlyWrong=state().totalScore;
const earlyWrong=els.choices.children.filter(b=>Number(b.dataset.country)!==state().index);
for(const b of earlyWrong)b.onclick();earlyWrong[0].onclick();assert.equal(state().wrongCount,3);
els.choices.children.find(b=>Number(b.dataset.country)===state().index).onclick();
assert.equal(state().totalScore,totalBeforeEarlyWrong+1);reveal();assert.equal(els['score-earned'].textContent,1);
// A later question starts with zero wrong answers. An automatic reveal has zero base points,
// but keeps deductions already earned in that same question.
vm.runInContext("chooseLevel('medium')",ctx);assert.equal(state().wrongCount,0);
els.choices.children.find(b=>Number(b.dataset.country)!==state().index).onclick();
for(let n=0;n<6;n++)advance(15000);
assert.equal(state().resolved,true);assert.equal(state().totalScore,totalBeforeEarlyWrong-2);reveal();
assert.equal(els['score-earned'].textContent,-3);assert.match(els['score-context'].textContent,/1 wrong × −3 = −3/);
// High mode counts each nonblank wrong typed answer and combines mistakes across clue timing.
vm.runInContext("chooseLevel('high')",ctx);const beforeTyped=state().totalScore;
els.answer.value=' ';els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().wrongCount,0);
els.answer.value='incorrect';els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().wrongCount,1);
advance(15000);assert.equal(state().clueCount,1);
els.answer.value='still incorrect';els['answer-form'].handlers.submit({preventDefault(){}});
els.answer.value='third wrong';els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().wrongCount,3);
els.answer.value=vm.runInContext('COUNTRIES[index].name',ctx);els['answer-form'].handlers.submit({preventDefault(){}});
assert.equal(state().totalScore,beforeTyped-1);reveal();assert.equal(els['score-earned'].textContent,-1);
// The final five active seconds of each 15-second wait produce one click per second.
vm.runInContext("chooseLevel('medium')",ctx);const ticksBefore=ticks;
advance(10000);assert.equal(ticks,ticksBefore+1);for(let i=0;i<4;i++)advance(1000);assert.equal(ticks,ticksBefore+5);advance(1000);assert.equal(state().clueCount,1);
const nextTicks=ticks;advance(10000);assert.equal(ticks,nextTicks+1);
vm.runInContext(`if(COUNTRIES.length!==195)throw Error('coverage');for(const c of COUNTRIES){if(c.clues.length!==5||!c.path.startsWith('M')||!c.capital||!c.region||!c.aliases.includes(c.name)||!Number.isFinite(c.lat))throw Error(c.name);for(const mode of ['easy','medium','high']){level=mode;const clues=makeClues(c);if(clues.length!==5)throw Error('clue count');if(clues.some(text=>/flag/i.test(text)||text.includes(c.flag)))throw Error('flag clue '+c.name);if((mode==='easy'||mode==='medium')&&!clues[0].includes(c.clues[0])&&!clues[0].includes(c.neighbors[0]||'no land-border neighbors'))throw Error('missing discovery fact '+c.name)}}`,ctx);

assert.equal(vm.runInContext('SCORE_BY_CLUE.join(",")',ctx),'10,8,6,4,2,1');assert.equal(vm.runInContext('WRONG_ANSWER_PENALTY',ctx),3);for(let n=0;n<=5;n++){assert.equal(vm.runInContext(`questionScore(true,${n})`,ctx),[10,8,6,4,2,1][n]);assert.equal(vm.runInContext(`questionScore(false,${n})`,ctx),0);assert.equal(vm.runInContext(`questionScore(true,${n},3)`,ctx),[10,8,6,4,2,1][n]-9)}
// Every level must produce four distinct choices, with exactly one correct choice.
vm.runInContext(`for(const mode of ['easy','medium','high']){level=mode;for(let i=0;i<COUNTRIES.length;i++){index=i;makeChoices();const options=[...$('choices').children].map(b=>Number(b.dataset.country));if(options.length!==4||new Set(options).size!==4||!options.includes(index))throw Error('choices '+mode+' '+i)}}`,ctx);
vm.runInContext(`discovered.clear();const first=new Set();for(let i=0;i<30;i++){chooseLevel('easy');first.add(index);if(new Set(queue).size!==195)throw Error('queue duplicates')}if(first.size<10)throw Error('insufficient shuffle variation')`,ctx);
// All 195 countries can be completed without a repeated question.
vm.runInContext(`discovered.clear();chooseLevel('high');const seen=new Set();for(let n=0;n<195;n++){if(seen.has(index))throw Error('repeated country');seen.add(index);finish(true);$('next').onclick()}if(level!==null||discovered.size!==195)throw Error('completion gate')`,ctx);
// Manual hints count toward the same five-clue limit and cannot reveal while paused.
vm.runInContext(`chooseLevel('medium');paused=true;clue();if(clueCount)throw Error('paused clue');paused=false;for(let n=0;n<5;n++)$('early-clue').onclick();if(clueCount!==5||resolved)throw Error('manual hint cap');$('early-clue').onclick();if(clueCount!==5||resolved)throw Error('extra manual clue')`,ctx);
advance(14999);assert.equal(state().resolved,false);advance(1);assert.equal(state().resolved,true);
// Fixed reading-style lists remain the same across devices; underlying voices vary.
const spoken=[];let cancelled=0;ctx.window.speechSynthesis={getVoices:()=>[{name:'Albert',lang:'en-US'},{name:'Samantha',lang:'en-US'},{name:'Grandma',lang:'en-US'},{name:'Junior',lang:'en-US'},{name:'Piya',lang:'bn-IN'}],cancel(){cancelled++},speak:u=>spoken.push(u)};
ctx.SpeechSynthesisUtterance=function(text){this.text=text};
assert.equal(vm.runInContext('voiceMode',ctx),'en');
vm.runInContext("setExplorerName('Maya');voiceMode='en';chooseLevel('easy')",ctx);assert.match(spoken.at(-1).text,/Maya/);assert.doesNotMatch(spoken.at(-1).text,/Sattwik/);
vm.runInContext("voiceMode='bn';chooseLevel('medium')",ctx);assert.match(spoken.at(-1).text,/Maya/);assert.equal(spoken.at(-1).lang,'bn-IN');
vm.runInContext("setExplorerName('Sattwik');voiceMode='bn';chooseLevel('easy')",ctx);assert.match(spoken.at(-1).text,/সাত্ত্বিক/);assert.doesNotMatch(spoken.at(-1).text,/Sattwik/);
vm.runInContext("setExplorerName('Maya')",ctx);
vm.runInContext("voiceMode='en';speak('Hello, Sattwik!')",ctx);
assert.equal(spoken.at(-1).voice.name,'Samantha');assert.equal(spoken.at(-1).rate,.96);assert.equal(spoken.at(-1).pitch,1);assert.equal(spoken.at(-1).volume,1);assert.equal(speechDucked,true);
spoken.at(-1).onend();assert.equal(speechDucked,false);
const cancellationsBefore=cancelled;vm.runInContext("speak('Another country!')",ctx);assert.equal(cancelled,cancellationsBefore);assert.equal(spoken.at(-1).voice.name,'Samantha');
const interrupted=spoken.at(-1);vm.runInContext("speak('One more country!')",ctx);assert.equal(cancelled,cancellationsBefore+1);interrupted.onend();assert.equal(speechDucked,true);spoken.at(-1).onerror();assert.equal(speechDucked,false);
els['voice-choice'].value='clear';vm.runInContext("speak('Let’s explore!')",ctx);assert.equal(spoken.at(-1).rate,1);assert.equal(spoken.at(-1).pitch,1.06);els['voice-choice'].value='gentle';
// Every question has five matching Bangla clue slots, including the twelve special facts.
vm.runInContext(`for(const mode of ['easy','medium','high']){level=mode;for(const c of COUNTRIES){const clues=makeBanglaClues(c);if(clues.length!==5||clues.some(text=>!/[\u0980-\u09ff]/.test(text)))throw Error('Bangla clue '+mode+' '+c.id);if(mode!=='high'&&banglaFacts[c.id]&&clues[0]!==banglaFacts[c.id])throw Error('special Bangla fact '+c.id)}}`,ctx);
ctx.window.speechSynthesis.getVoices=()=>[{name:'Albert',lang:'en-US'},{name:'Samantha',lang:'en-US'},{name:'Maya',lang:'bn-BD'}];
els['bangla-voice-choice'].value='gentle';
vm.runInContext("voiceMode='bn';speak('Hello!','হ্যালো!')",ctx);
assert.equal(spoken.at(-1).text,'হ্যালো!');assert.equal(spoken.at(-1).lang,'bn-BD');assert.equal(spoken.at(-1).voice.name,'Maya');
ctx.window.speechSynthesis.getVoices=()=>[{name:'Maya',lang:'bn-BD'},{name:'Piya',lang:'bn-IN'}];
vm.runInContext("speak('','আবার বলি',true,'bn')",ctx);assert.equal(spoken.at(-1).voice.name,'Piya');assert.equal(spoken.at(-1).rate,.96);
els['bangla-voice-sample'].onclick();assert.equal(spoken.at(-1).voice.name,'Piya');assert.match(spoken.at(-1).text,/দেশগুলো/);
vm.runInContext('updateBanglaVoiceStatus()',ctx);assert.match(els['bangla-voice-status'].textContent,/Piya/);
ctx.window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-US'}];const missingVoiceCount=spoken.length;
vm.runInContext("speak('','হ্যালো',true,'bn')",ctx);assert.equal(spoken.length,missingVoiceCount);assert.match(els['bangla-voice-status'].textContent,/No Bangla voice/);
ctx.window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-US'},{name:'Maya',lang:'bn-BD'}];
vm.runInContext("voiceMode='en';speak('Hello!','হ্যালো!')",ctx);assert.equal(spoken.at(-1).text,'Hello!');assert.equal(spoken.at(-1).voice.name,'Samantha');
vm.runInContext("voiceMode='off'",ctx);const before=spoken.length;vm.runInContext("speak('Automatic','স্বয়ংক্রিয়')",ctx);assert.equal(spoken.length,before);
vm.runInContext("speak('Replay','আবার শোনো',true)",ctx);assert.equal(spoken.at(-1).text,'আবার শোনো');
// The header control visibly cycles English → Bangla → Off → English.
vm.runInContext("voiceMode='en';updateVoiceButton()",ctx);
els.sound.onclick();assert.equal(els.sound.dataset.mode,'bn');assert.equal(els.sound.attrs['aria-pressed'],true);assert.equal(spoken.at(-1).lang,'bn-BD');
els.sound.onclick();assert.equal(els.sound.dataset.mode,'off');assert.equal(els.sound.attrs['aria-pressed'],false);assert.match(els.sound.attrs['aria-label'],/off/i);
els.sound.onclick();assert.equal(els.sound.dataset.mode,'en');assert.equal(spoken.at(-1).lang,'en-US');
console.log('PASS: fixed reading styles, consistent voice and speech lifecycle; six scoring tiers, cumulative three-point wrong-answer deductions and reveal; 195 complete records; level gate; 4 choices for all 585 country/level combinations; randomized decks; complete 195-country journey; five 15-second clues, five-second click warnings and reveal; pause/hidden/dialog; answer normalization; retained progress; manual clue cap; English/Bangla/Off voice button and clues.');
