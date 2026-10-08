process.chdir(require('path').resolve(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class El{constructor(){this.textContent='';this.value='';this.children=[];this.style={setProperty(){}};this.attrs={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.open=false;this.handlers={}}set innerHTML(s){this.children=s.includes('<span>')?Array.from({length:5},()=>new El):s.includes('<ol>')?[new El]:[]}get firstChild(){return this.children[0]}setAttribute(k,v){this.attrs[k]=v}append(e){this.children.push(e)}replaceChildren(...e){this.children=e}addEventListener(e,cb){this.handlers[e]=cb}getBoundingClientRect(){}focus(){}select(){}getContext(){return new Proxy({},{get:()=>()=>{}})}showModal(){this.open=true}close(){this.open=false;this.handlers.close?.()}}
const els={},saved={};const doc={hidden:false,body:{classList:{remove(){}}},getElementById:id=>els[id]??=new El,querySelector:()=>new El,querySelectorAll:()=>[],createElement:()=>new El,addEventListener(){}};let now=0,tick;const ctx=vm.createContext({document:doc,window:{},localStorage:{setItem:(k,v)=>saved[k]=v,getItem:k=>saved[k]||null},performance:{now:()=>now},setInterval:f=>tick=f,setTimeout:()=>0,clearTimeout(){},matchMedia:q=>({matches:q.includes('reduced-motion')}),Math,Set,Globes:{draw(){},reset(){},reveal(){}},AdventureAudio:{resume(){},pause(){},success(){},duck(){},newQuestion(){},unlock:()=>Promise.resolve(true),toggle:()=>false,volume(){},skip(){}},CountryGallery:{render(){}}});
vm.runInContext(fs.readFileSync('assets/js/data.js','utf8')+'\n'+fs.readFileSync('assets/js/app.js','utf8'),ctx);
const state=()=>vm.runInContext('({index,clueCount,remaining,resolved,stars:discovered.size})',ctx);function advance(ms){now+=ms;tick()}
assert.equal(vm.runInContext("validBirthYear('2020')",ctx),true);assert.equal(vm.runInContext("validBirthYear('20')",ctx),false);assert.equal(vm.runInContext("validBirthYear('2999')",ctx),false);
assert.equal(els['explorer-birth-year'].children.length,121);
const entryHtml=fs.readFileSync('index.html','utf8');assert.ok(entryHtml.indexOf('id="profile-settings"')<entryHtml.indexOf('Start exploring ➜'));assert.match(entryHtml,/<select id="explorer-birth-year"[^>]*required/);assert.match(entryHtml,/<button[^>]*id="profile-settings"[^>]*>⚙ Adjust Settings<\/button>/);
els['profile-settings'].onclick();assert.equal(els.settings.open,true);els.settings.close();
els['explorer-name'].value='  Maya  ';els['explorer-birth-year'].value='2020';els['profile-form'].handlers.submit({preventDefault(){}});
assert.equal(vm.runInContext('explorerName',ctx),'Maya');assert.equal(saved.worldExplorerName,'Maya');assert.equal(els['profile-error'].textContent,'');
assert.equal(vm.runInContext("possessive('James')",ctx),'James’');
assert.equal(vm.runInContext('level',ctx),null);advance(60000);assert.equal(state().clueCount,0);
vm.runInContext("chooseLevel('easy')",ctx);assert.equal(els.choices.children.length,4);assert.equal(vm.runInContext('queue.length',ctx),195);
advance(14999);assert.equal(state().clueCount,0);advance(1);assert.equal(state().clueCount,1);for(let i=2;i<=5;i++){advance(15000);assert.equal(state().clueCount,i);assert.equal(state().resolved,false)}advance(14999);assert.equal(state().resolved,false);advance(1);assert.equal(state().resolved,true);assert.equal(state().stars,1);advance(15000);assert.equal(state().clueCount,5);
els.next.onclick();assert.equal(state().clueCount,0);els.pause.onclick();advance(60000);assert.equal(state().remaining,15000);els.pause.onclick();doc.hidden=true;advance(60000);assert.equal(state().remaining,15000);doc.hidden=false;els.parents.onclick();advance(60000);assert.equal(state().remaining,15000);els.settings.close();
vm.runInContext("chooseLevel('medium')",ctx);assert.equal(els.choices.children.length,4);assert.equal(vm.runInContext('new Set(queue).size===queue.length',ctx),true);assert.equal(vm.runInContext('queue.some(i=>discovered.has(i))',ctx),false);
vm.runInContext("chooseLevel('high')",ctx);assert.equal(els.choices.children.length,4);els.answer.value='wrong';els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().resolved,false);els.answer.value=vm.runInContext('COUNTRIES[index].name.toUpperCase()+"!"',ctx);els['answer-form'].handlers.submit({preventDefault(){}});assert.equal(state().resolved,true);assert.equal(state().stars,2);
vm.runInContext("showLevels()",ctx);const old=state().remaining;advance(60000);assert.equal(state().remaining,old);assert.equal(state().stars,2);
vm.runInContext(`if(COUNTRIES.length!==195)throw Error('coverage');for(const c of COUNTRIES){if(c.clues.length!==5||!c.path.startsWith('M')||!c.capital||!c.region||!c.aliases.includes(c.name)||!Number.isFinite(c.lat))throw Error(c.name);for(const mode of ['easy','medium','high']){level=mode;const clues=makeClues(c);if(clues.length!==5)throw Error('clue count');if(clues.some(text=>/flag/i.test(text)||text.includes(c.flag)))throw Error('flag clue '+c.name);if((mode==='easy'||mode==='medium')&&!clues[0].includes(c.clues[0])&&!clues[0].includes(c.neighbors[0]||'no land-border neighbors'))throw Error('missing discovery fact '+c.name)}}`,ctx);

// Every level must produce four distinct choices, with exactly one correct choice.
vm.runInContext(`for(const mode of ['easy','medium','high']){level=mode;for(let i=0;i<COUNTRIES.length;i++){index=i;makeChoices();const options=[...$('choices').children].map(b=>Number(b.dataset.country));if(options.length!==4||new Set(options).size!==4||!options.includes(index))throw Error('choices '+mode+' '+i)}}`,ctx);
vm.runInContext(`discovered.clear();const first=new Set();for(let i=0;i<30;i++){chooseLevel('easy');first.add(index);if(new Set(queue).size!==195)throw Error('queue duplicates')}if(first.size<10)throw Error('insufficient shuffle variation')`,ctx);
// All 195 countries can be completed without a repeated question.
vm.runInContext(`discovered.clear();chooseLevel('high');const seen=new Set();for(let n=0;n<195;n++){if(seen.has(index))throw Error('repeated country');seen.add(index);finish(true);$('next').onclick()}if(level!==null||discovered.size!==195)throw Error('completion gate')`,ctx);
// Manual hints count toward the same five-clue limit and cannot reveal while paused.
vm.runInContext(`chooseLevel('medium');paused=true;clue();if(clueCount)throw Error('paused clue');paused=false;for(let n=0;n<5;n++)$('early-clue').onclick();if(clueCount!==5||resolved)throw Error('manual hint cap');$('early-clue').onclick();if(clueCount!==5||resolved)throw Error('extra manual clue')`,ctx);
advance(14999);assert.equal(state().resolved,false);advance(1);assert.equal(state().resolved,true);
// Prefer a gentle installed English voice, while allowing a grown-up to choose another.
const spoken=[];ctx.window.speechSynthesis={getVoices:()=>[{name:'Albert',lang:'en-US'},{name:'Samantha',lang:'en-US'},{name:'Grandma',lang:'en-US'},{name:'Junior',lang:'en-US'}],cancel(){},speak:u=>spoken.push(u)};
ctx.SpeechSynthesisUtterance=function(text){this.text=text};
vm.runInContext("setExplorerName('Maya');voiceMode='en';chooseLevel('easy')",ctx);assert.match(spoken.at(-1).text,/Maya/);assert.doesNotMatch(spoken.at(-1).text,/Sattwik/);
vm.runInContext("voiceMode='bn';chooseLevel('medium')",ctx);assert.match(spoken.at(-1).text,/Maya/);assert.equal(spoken.at(-1).lang,'bn-BD');
vm.runInContext("voiceMode='en';voiceRound=0;speak('Hello, Sattwik!')",ctx);
assert.equal(spoken.at(-1).voice.name,'Samantha');assert.equal(spoken.at(-1).rate,.96);assert.equal(spoken.at(-1).pitch,1);assert.equal(spoken.at(-1).volume,.9);
vm.runInContext("voiceRound=1;speak('Another country!')",ctx);assert.equal(spoken.at(-1).voice.name,'Grandma');
vm.runInContext("voiceRound=2;speak('One more country!')",ctx);assert.equal(spoken.at(-1).voice.name,'Junior');
els['voice-choice'].value='Albert|en-US';vm.runInContext("speak('Let’s explore!')",ctx);assert.equal(spoken.at(-1).voice.name,'Albert');
// Every question has five matching Bangla clue slots, including the twelve special facts.
vm.runInContext(`for(const mode of ['easy','medium','high']){level=mode;for(const c of COUNTRIES){const clues=makeBanglaClues(c);if(clues.length!==5||clues.some(text=>!/[\u0980-\u09ff]/.test(text)))throw Error('Bangla clue '+mode+' '+c.id);if(mode!=='high'&&banglaFacts[c.id]&&clues[0]!==banglaFacts[c.id])throw Error('special Bangla fact '+c.id)}}`,ctx);
ctx.window.speechSynthesis.getVoices=()=>[{name:'Albert',lang:'en-US'},{name:'Samantha',lang:'en-US'},{name:'Maya',lang:'bn-BD'}];
vm.runInContext('refreshVoices()',ctx);
els['bangla-voice-choice'].value='Maya|bn-BD';
vm.runInContext("voiceMode='bn';speak('Hello!','হ্যালো!')",ctx);
assert.equal(spoken.at(-1).text,'হ্যালো!');assert.equal(spoken.at(-1).lang,'bn-BD');assert.equal(spoken.at(-1).voice.name,'Maya');
vm.runInContext("voiceMode='en';speak('Hello!','হ্যালো!')",ctx);assert.equal(spoken.at(-1).text,'Hello!');assert.equal(spoken.at(-1).voice.name,'Albert');
vm.runInContext("voiceMode='off'",ctx);const before=spoken.length;vm.runInContext("speak('Automatic','স্বয়ংক্রিয়')",ctx);assert.equal(spoken.length,before);
vm.runInContext("speak('Replay','আবার শোনো',true)",ctx);assert.equal(spoken.at(-1).text,'আবার শোনো');
// The header control visibly cycles Off → Bangla → English → Off.
els.sound.onclick();assert.equal(els.sound.dataset.mode,'bn');assert.equal(els.sound.attrs['aria-pressed'],true);assert.equal(spoken.at(-1).lang,'bn-BD');
els.sound.onclick();assert.equal(els.sound.dataset.mode,'en');assert.equal(spoken.at(-1).lang,'en-US');
els.sound.onclick();assert.equal(els.sound.dataset.mode,'off');assert.equal(els.sound.attrs['aria-pressed'],false);assert.match(els.sound.attrs['aria-label'],/off/i);
console.log('PASS: 195 complete records; level gate; 4 choices for all 585 country/level combinations; randomized decks; complete 195-country journey; five 15-second clues and reveal; pause/hidden/dialog; answer normalization; retained progress; manual clue cap; Off/Bangla/English voice button and clues.');
