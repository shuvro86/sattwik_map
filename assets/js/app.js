'use strict';
const CLUE_INTERVAL_MS=15000;
const $=id=>document.getElementById(id);
const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
const aliases={'United Kingdom':['uk','britain','greatbritain','theunitedkingdom'],'Bangladesh':['banglades','bangla'],'United States of America':['usa','us']};
const EXPLORER_NAME_KEY='worldExplorerName';
let explorerName='';
function possessive(name){return /[sS]$/.test(name)?`${name}’`:`${name}’s`}
function setExplorerName(name){
 explorerName=name;
 document.querySelectorAll('[data-explorer-name]').forEach(el=>el.textContent=name);
 document.querySelectorAll('[data-explorer-possessive]').forEach(el=>el.textContent=possessive(name));
 document.title=`${possessive(name)} World • Little explorer, big adventures`;
 try{localStorage.setItem(EXPLORER_NAME_KEY,name)}catch{}
}
function validBirthYear(value){const year=Number(value),current=new Date().getFullYear();return /^\d{4}$/.test(value)&&year>=current-120&&year<=current}
function enterAdventure(event){
 event.preventDefault();
 const name=$('explorer-name').value.trim().replace(/\s+/g,' '),birthYear=$('explorer-birth-year').value;
 if(!name||name.length>40){$('profile-error').textContent='Please enter a name with 40 characters or fewer.';$('explorer-name').focus();return}
 if(!validBirthYear(birthYear)){$('profile-error').textContent='Please choose your birth year.';$('explorer-birth-year').focus();return}
 $('profile-error').textContent='';setExplorerName(name);document.body.classList.remove('profile-pending');$('profile-screen').classList.add('hidden');$('level-title').focus();
}
let index=0,clueCount=0,remaining=CLUE_INTERVAL_MS,last=performance.now(),resolved=false,paused=false,voiceMode='off',discovered=new Set();
let level=null,queue=[],position=0,activeClues=[],activeBanglaClues=[],atlasIndex=0,viewedClue=-1,revealTimer=0,voiceRound=-1;
function syncAudio(){if(level&&!resolved&&!isPaused())AdventureAudio.resume();else AdventureAudio.pause()}
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function availableVoices(){return 'speechSynthesis' in window?window.speechSynthesis.getVoices():[]}
function preferredVoice(){
 const voices=availableVoices().filter(v=>/^en[-_]/i.test(v.lang)),selected=$('voice-choice').value;
 if(selected){const voice=voices.find(v=>`${v.name}|${v.lang}`===selected);if(voice)return voice}
 const names=['samantha','grandma','junior','daniel','ava','karen','moira','jenny','aria','victoria','fiona','google us english'];
 const gentle=names.map(name=>voices.find(v=>v.name.toLowerCase().includes(name))).filter(Boolean);
 return gentle.length?gentle[Math.max(0,voiceRound)%gentle.length]:voices.find(v=>/^en[-_]US/i.test(v.lang))||voices[0];
}
function refreshVoices(){
 for(const [id,pattern,label] of [['voice-choice',/^en[-_]/i,'Gentle English mix (automatic)'],['bangla-voice-choice',/^bn(?:[-_]|$)/i,'Bangla voice (automatic)']]){
  const select=$(id),previous=select.value;select.replaceChildren();const automatic=document.createElement('option');automatic.value='';automatic.textContent=label;select.append(automatic);
  for(const v of availableVoices().filter(v=>pattern.test(v.lang))){const option=document.createElement('option');option.value=`${v.name}|${v.lang}`;option.textContent=`${v.name} (${v.lang})`;select.append(option)}select.value=previous;
 }
 $('bangla-voice-help').textContent=availableVoices().some(v=>/^bn(?:[-_]|$)/i.test(v.lang))?'Bangla speech uses the selected device voice. Its sound depends on your browser and device.':'No Bangla voice is listed on this device. The browser may still speak Bangla using its own fallback voice; a grown-up can read the Bangla text below each clue.';
}
function speak(english,bangla='',force=false){
 if(!('speechSynthesis' in window)||(voiceMode==='off'&&!force))return;
 const mode=voiceMode==='off'?'bn':voiceMode,parts=mode==='bn'?[['bn',bangla||english]]:[['en',english]];
 AdventureAudio.duck(Math.max(4000,parts.reduce((sum,[,value])=>sum+Math.max(2000,value.length*95),0)));
 window.speechSynthesis.cancel();
 for(const [lang,value] of parts){const utterance=new SpeechSynthesisUtterance(value);const voices=availableVoices();const chosen=lang==='en'?preferredVoice():voices.find(v=>`${v.name}|${v.lang}`===$('bangla-voice-choice').value)||voices.find(v=>/^bn[-_]BD/i.test(v.lang))||voices.find(v=>/^bn(?:[-_]|$)/i.test(v.lang));if(chosen){utterance.voice=chosen;utterance.lang=chosen.lang}else utterance.lang=lang==='bn'?'bn-BD':'en-US';utterance.rate=lang==='bn'?.9:.96;utterance.pitch=1;utterance.volume=.9;window.speechSynthesis.speak(utterance)}
}
function stopSpeech(){if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function isPaused(){return !level||paused||document.hidden||$('settings').open||$('credit-dialog').open||$('atlas-dialog').open}
function globe(){Globes.draw($('globe'),COUNTRIES[index].lon,COUNTRIES[index].lat)}
function animateMap(){const svg=$('country');svg.classList.remove('arrive');void svg.getBoundingClientRect();svg.classList.add('arrive')}
function updateTrail(){
 $('stars').textContent=discovered.size;
 $('trail-count').textContent=`${discovered.size} / ${COUNTRIES.length} countries discovered`;
 const recent=[...discovered].slice(-10);
 $('trail').replaceChildren(...recent.map(i=>{const c=COUNTRIES[i],el=document.createElement('span');el.textContent=c.flag;el.className='found';el.title=c.name;return el}));
 if(!recent.length){const p=document.createElement('p');p.textContent='Your discoveries will appear here ✨';$('trail').append(p)}
}
function makeFacts(c){
 const box=document.createElement('div');box.className='country-facts';
 const flag=document.createElement('div');flag.className='big-flag';flag.textContent=c.flag;flag.setAttribute('role','img');flag.setAttribute('aria-label',`Flag of ${c.name}`);box.append(flag);
 const h=document.createElement('h3');h.textContent=c.name;box.append(h);
 const dl=document.createElement('dl');dl.className='fact-grid';
 const fields=[['🌍 World region',c.region],['🏙 Capital / capitals',c.capital],['👨‍👩‍👧‍👦 Population',`${c.population.toLocaleString()} people (${c.populationYear})`],['💬 Languages',c.languages.join(', ')||'Not listed'],['📐 Size',`${c.area.toLocaleString()} km²`],['🪙 Money',c.currencies.join(', ')||'Not listed'],['🏖 Coast',c.landlocked?'No ocean coast':'Beside the sea'],['🤝 Neighbors',c.neighbors.join(', ')||'No land-border neighbors']];
 for(const [label,value] of fields){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;group.append(dt,dd);dl.append(group)}box.append(dl);
 const source=document.createElement('a');source.className='fact-source';source.href=c.populationSource;source.target='_blank';source.rel='noopener noreferrer';source.textContent=`Population estimate: ${c.populationPublisher}, ${c.populationYear} ↗`;box.append(source);
 if(c.note){const note=document.createElement('p');note.className='map-note';note.textContent=c.note;box.append(note)}return box;
}
function makeClues(c){
 const region=`This country is in ${c.region}. Can you point there on the globe?`;
 const city=c.capital==='No official capital'?'This country has no official capital city.':`A capital city to discover: ${c.capital}.`;
 const first=`Its name starts with the letter ${c.name[0]}.`;
 const prefix=`Its name begins with “${c.name.slice(0,3)}”.`;
 const familiar=!c.clues[0].startsWith('Look on the globe:');
 const discovery=familiar?c.clues[0]:c.neighbors.length?`Imagine a trip across its border! You could visit ${c.neighbors[0]}, one of its ${c.neighbors.length===1?'land neighbors':c.neighbors.length+' land neighbors'}.`:`The sea separates this country from other countries. It has no land-border neighbors!`;
 if(level==='easy'||level==='medium')return [discovery,region,city,first,prefix];
 return [region,c.landlocked?'It has no ocean coast. Other countries surround it.':'It has a coast beside the sea.',city,first,prefix];
}
const banglaFacts={BGD:'এখানে ডোরাকাটা রয়েল বেঙ্গল টাইগার থাকে।',AUS:'এখানে ক্যাঙ্গারুরা লাফিয়ে বেড়ায়!',BRA:'এখানকার বৃষ্টিবনে রঙিন টিয়া পাখি উড়ে বেড়ায়।',CAN:'এখানকার নদীতে বিভাররা ছোট ঘর বানায়।',CHN:'এখানে পান্ডারা বাঁশ খায়।',EGY:'এখানে বিশাল পাথরের পিরামিড দেখা যায়।',FRA:'এ দেশের রাজধানীতে একটি খুব উঁচু টাওয়ার আছে।',IND:'এখানে হাতি থাকে। তুমি কি হাতির ডাক দিতে পারো?',ITA:'এ দেশটির মানচিত্র দেখতে বড় একটি বুট জুতার মতো!',JPN:'এখানে গোলাপি চেরি ফুল দেখা যায়।',ZAF:'এখানে সিংহ আর হাতি থাকে।',GBR:'এ দেশের রাজধানীতে লাল দোতলা বাস চলে।'};
const banglaRegions={Africa:'আফ্রিকা',Asia:'এশিয়া',Europe:'ইউরোপ',Oceania:'ওশেনিয়া','North America':'উত্তর আমেরিকা','South America':'দক্ষিণ আমেরিকা'};
const banglaNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['bn'],{type:'region'}):null;
function banglaCountry(c){return c.code2&&banglaNames?banglaNames.of(c.code2)||c.name:c.name}
function makeBanglaClues(c){
 const region=`এ দেশটি ${banglaRegions[c.region]||c.region} মহাদেশে আছে। তুমি কি গ্লোবে দেখাতে পারো?`;
 const city=c.capital==='No official capital'?'এ দেশের কোনো সরকারি রাজধানী নেই।':`এ দেশের একটি রাজধানী ${c.capital}।`;
 const first=`দেশটির ইংরেজি নামের প্রথম অক্ষর ${c.name[0]}।`;
 const prefix=`দেশটির ইংরেজি নামের প্রথম তিনটি অক্ষর ${c.name.slice(0,3)}।`;
 const discovery=banglaFacts[c.id]|| (c.neighbors.length?`স্থলপথে এ দেশের পাশের দেশ ${banglaCountry(COUNTRIES.find(other=>other.name===c.neighbors[0])||{name:c.neighbors[0]})}।`:'এ দেশটির কোনো স্থলসীমান্তের প্রতিবেশী নেই। চারদিকে সমুদ্র!');
 return level==='high'?[region,c.landlocked?'এ দেশের সমুদ্র উপকূল নেই। চারদিকে অন্য দেশ।':'এ দেশের সমুদ্র উপকূল আছে।',city,first,prefix]:[discovery,region,city,first,prefix];
}
function makeChoices(){
 $('choices').replaceChildren();
 const pool=COUNTRIES.map((c,i)=>i).filter(i=>i!==index);
 const nearby=shuffle(pool.filter(i=>COUNTRIES[i].subregion===COUNTRIES[index].subregion));
 const regional=shuffle(pool.filter(i=>COUNTRIES[i].region===COUNTRIES[index].region&&!nearby.includes(i)));
 const distractors=level==='high'?[...nearby,...regional,...shuffle(pool.filter(i=>!nearby.includes(i)&&!regional.includes(i)))]:shuffle(pool);
 const options=shuffle([index,...distractors.slice(0,3)]);
 for(const i of options){const c=COUNTRIES[i],button=document.createElement('button');button.type='button';button.className='choice';button.dataset.country=String(i);button.style.setProperty('--i',options.indexOf(i));
 if(level==='easy'){const flag=document.createElement('span');flag.className='flag';flag.textContent=c.flag;flag.setAttribute('aria-hidden','true');button.append(flag)}
 const name=document.createElement('span');name.textContent=c.name;button.append(name);
 button.onclick=()=>{if(resolved||isPaused())return;if(i===index){button.classList.add('correct');finish(true)}else{button.disabled=true;button.classList.add('try-again');$('feedback').textContent='Good try! Let’s look at the other countries.';speak('Good try! Have another guess.','ভালো চেষ্টা! আরেকবার চেষ্টা করো।')}};$('choices').append(button)}
}
function showLevels(){clearTimeout(revealTimer);stopSpeech();AdventureAudio.pause();Globes.reset();level=null;paused=false;last=performance.now();$('play-screen').classList.add('hidden');$('level-screen').classList.remove('hidden');$('pause').disabled=true;$('pause').setAttribute('aria-pressed','false');$('pause').setAttribute('aria-label','Pause adventure');$('pause').innerHTML='Ⅱ <span>Pause</span>';$('level-title').setAttribute('tabindex','-1');$('level-title').focus()}
function chooseLevel(chosen){
 AdventureAudio.unlock().then(syncAudio);level=chosen;paused=false;position=0;
 const unseen=COUNTRIES.map((c,i)=>i).filter(i=>!discovered.has(i));
 if(!unseen.length){discovered.clear();unseen.push(...COUNTRIES.map((c,i)=>i))}
 queue=shuffle(unseen);
 if(queue.length>1&&queue[0]===index){const swap=1+Math.floor(Math.random()*(queue.length-1));[queue[0],queue[swap]]=[queue[swap],queue[0]]}
 index=queue[0];$('level-screen').classList.add('hidden');$('play-screen').classList.remove('hidden');$('pause').disabled=false;$('pause').setAttribute('aria-pressed','false');$('pause').setAttribute('aria-label','Pause adventure');$('pause').innerHTML='Ⅱ <span>Pause</span>';$('level-badge').textContent=`${level[0].toUpperCase()+level.slice(1)} adventure`;
 start();$('map-title').setAttribute('tabindex','-1');$('map-title').focus();
}
function showAtlasCountry(i){
 atlasIndex=i;const c=COUNTRIES[i],detail=$('atlas-detail');detail.scrollTop=0;detail.replaceChildren();
 const tabs=document.createElement('div');tabs.className='atlas-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',`${c.name} explorer sections`);
 const facts=document.createElement('section');facts.id='atlas-facts-panel';facts.setAttribute('role','tabpanel');facts.setAttribute('aria-labelledby','atlas-facts-tab');
 const photos=document.createElement('section');photos.id='atlas-photos-panel';photos.setAttribute('role','tabpanel');photos.setAttribute('aria-labelledby','atlas-photos-tab');photos.className='hidden';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 520 420');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Map of ${c.name}`);const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',c.path);path.setAttribute('fill',c.color);svg.append(path);facts.append(svg,makeFacts(c));
 let galleryBuilt=false;const panels=[facts,photos];const buttons=[];
 for(const [n,label] of ['🌍 Map & facts','📷 Picture adventure'].entries()){
  const button=document.createElement('button');button.id=n?'atlas-photos-tab':'atlas-facts-tab';button.setAttribute('role','tab');button.setAttribute('aria-controls',panels[n].id);button.setAttribute('aria-selected',n===0);button.tabIndex=n===0?0:-1;button.textContent=label;
  button.onclick=()=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',j===n);b.tabIndex=j===n?0:-1;panels[j].classList.toggle('hidden',j!==n)});if(n&&!galleryBuilt){CountryGallery.render(photos,c);const link=document.createElement('a');link.className='secondary gallery-link';link.href=`gallery.html?country=${c.id}`;link.target='_blank';link.rel='noopener';link.textContent=`Open ${c.name} photos in a new tab ↗`;photos.prepend(link);galleryBuilt=true}};
  button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?1:1-n;buttons[target].click();buttons[target].focus()}};buttons.push(button);tabs.append(button)}
 detail.append(tabs,facts,photos);for(const b of $('atlas-list').children)b.setAttribute('aria-pressed',Number(b.dataset.index)===i);
}
function filterAtlas(){const query=normalize($('country-search').value);const matches=COUNTRIES.map((c,i)=>({c,i})).filter(({c})=>c.aliases.some(a=>normalize(a).includes(query)));$('atlas-count').textContent=`${matches.length} of ${COUNTRIES.length} countries`;$('atlas-list').scrollTop=0;$('atlas-list').replaceChildren();for(const {c,i} of matches){const b=document.createElement('button');b.textContent=`${c.flag} ${c.name}`;b.dataset.index=i;b.setAttribute('aria-pressed',i===atlasIndex);b.onclick=()=>showAtlasCountry(i);$('atlas-list').append(b)}if(!matches.length){$('atlas-detail').replaceChildren();const p=document.createElement('p');p.textContent='No countries found. Try another name.';$('atlas-detail').append(p)}else showAtlasCountry(matches.some(x=>x.i===atlasIndex)?atlasIndex:matches[0].i)}
function updateTimer(){syncAudio();$('timer').textContent=resolved?'✓':isPaused()?'Paused':`${Math.ceil(remaining/1000)}s`;$('progress-fill').style.width=`${remaining/CLUE_INTERVAL_MS*100}%`;document.querySelector('.progress').setAttribute('aria-valuenow',Math.ceil(remaining/1000));$('timer-label').textContent=resolved?'Country discovered':clueCount===5?'Answer reveal in':'Next clue in'}
function start(){clearTimeout(revealTimer);stopSpeech();Globes.reset();AdventureAudio.newQuestion();voiceRound++;viewedClue=-1;clueCount=0;remaining=CLUE_INTERVAL_MS;resolved=false;last=performance.now();const c=COUNTRIES[index];activeClues=makeClues(c);activeBanglaClues=makeBanglaClues(c);$('round').textContent=`${position+1} / ${queue.length}`;$('country-facts').classList.add('hidden');$('country-facts').replaceChildren();$('answer-help').textContent=level==='high'?'Pick one of four countries, or let a grown-up type your guess.':'Say the name, then tap your country below.';makeChoices();$('country-path').setAttribute('d',c.path);$('country-path').setAttribute('fill',c.color);$('country').setAttribute('aria-label','Outline of the mystery country');$('map-title').textContent='Which country could this be?';$('map-caption').textContent='Look closely. You might know this one!';$('answer').value='';$('answer').disabled=false;$('check').disabled=false;$('answer-form').classList.toggle('hidden',level!=='high');$('next').classList.add('hidden');$('feedback').textContent='There’s no rush. Exploring is the fun part.';$('clue-count').textContent='Your first clue is on its way';$('clues').innerHTML='<p class="waiting">Even great explorers need a clue sometimes!</p>';$('dots').replaceChildren(...Array.from({length:5},(_,n)=>{const b=document.createElement('button');b.textContent='🎁';b.disabled=true;b.setAttribute('aria-label',`Clue treasure ${n+1}, locked`);b.onclick=()=>showClue(n,true);return b}));$('clue-character').textContent='🦜';$('clue-cheer').textContent='Pip the parrot is finding a clue!';$('early-clue').disabled=false;$('early-clue').textContent='✨ Help me, Pip!';$('dots').setAttribute('aria-label','0 of 5 clues shared');globe();animateMap();updateTrail();updateTimer();speak(`Where in the world, ${explorerName}? Which country is this?`,`পৃথিবীর কোন দেশ এটি, ${explorerName}?`)}
function showClue(n,read=false){
 if(n<0||n>=clueCount)return;viewedClue=n;const icons=['🔎','🧭','🏙','🔤','✨'];
 const card=document.createElement('div');card.className='treasure-clue';const icon=document.createElement('span');icon.className='clue-picture';icon.textContent=icons[n];const copy=document.createElement('div');const badge=document.createElement('strong');badge.textContent=`Treasure ${n+1} unlocked!`;const text=document.createElement('p');text.textContent=activeClues[n];const bangla=document.createElement('p');bangla.lang='bn';bangla.className='bangla-clue';bangla.textContent=activeBanglaClues[n];copy.append(badge,text,bangla);card.append(icon,copy);$('clues').replaceChildren(card);
 for(const [i,b] of [...$('dots').children].entries()){b.setAttribute('aria-pressed',i===n);if(i<clueCount){b.disabled=false;b.classList.add('active');b.textContent=icons[i];b.setAttribute('aria-label',`Replay clue ${i+1}`)}}
 if(read)speak(activeClues[n],activeBanglaClues[n],true);
}
function clue(){
 if(resolved||isPaused())return;if(clueCount>=5){finish(false);return}
 clueCount++;showClue(clueCount-1);$('clue-count').textContent=`${clueCount} of 5 treasures found`;$('clue-character').textContent=['🦜','🦋','🐬','🦁','🦄'][clueCount-1];$('clue-cheer').textContent=['Aha! Pip found a little secret!','Your adventure is getting warmer!','Let’s discover this place together!','You’re a wonderful explorer!','One last little sparkle of help!'][clueCount-1];$('dots').setAttribute('aria-label',`${clueCount} of 5 clues shared`);remaining=CLUE_INTERVAL_MS;if(clueCount===5){$('early-clue').disabled=true;$('early-clue').textContent='All five treasures opened ✨'}speak(activeClues[clueCount-1],activeBanglaClues[clueCount-1]);updateTimer();
}
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const colors=['#7543c8','#ebbc48','#4bb99a','#ed7fa1'];$('confetti').replaceChildren();for(let i=0;i<45;i++){const p=document.createElement('i');p.className='confetti';p.style.left=`${Math.random()*100}%`;p.style.background=colors[i%4];p.style.animationDelay=`${Math.random()*.5}s`;$('confetti').append(p)}setTimeout(()=>$('confetti').replaceChildren(),3500)}
function finish(correct){
 if(resolved)return;resolved=true;const c=COUNTRIES[index];AdventureAudio.success();Globes.reveal(c);$('early-clue').disabled=true;$('clue-character').textContent='🌍';$('clue-cheer').textContent='Watch closely — the map is flying home!';for(const b of $('choices').children){b.disabled=true;if(Number(b.dataset.country)===index)b.classList.add('correct')}
 $('country-facts').replaceChildren(makeFacts(c));$('country-facts').classList.add('hidden');discovered.add(index);$('country').setAttribute('aria-label',`Map of ${c.name}`);$('map-title').textContent='Finding its home on our world…';$('map-caption').textContent='Follow the glowing flight to the globe!';$('feedback').textContent='Destination locked. Here we go!';$('answer').disabled=true;$('check').disabled=true;$('answer-form').classList.add('hidden');$('next').classList.add('hidden');$('clue-count').textContent='A world location is appearing…';updateTrail();updateTimer();
 const announce=()=>{$('country-facts').classList.remove('hidden');$('map-title').textContent=`${c.flag} It’s ${c.name}!`;$('map-caption').textContent=correct?'You found it, little explorer!':'A new country to say hello to!';$('feedback').textContent=correct?`Wonderful exploring, ${explorerName}! It’s ${c.name}.`:`${explorerName}, this is ${c.name}. Let’s say it together!`;$('next').classList.remove('hidden');$('next').textContent=discovered.size===COUNTRIES.length?'Explore the world again ➜':'Next adventure ➜';$('clue-character').textContent='🎉';$('clue-cheer').textContent='We found its real home on Earth!';$('clue-count').textContent='Another wonderful discovery!';celebrate();speak($('feedback').textContent,correct?`দারুণ খুঁজেছ, ${explorerName}! এটি ${banglaCountry(c)}।`:`${explorerName}, এটি ${banglaCountry(c)}। চলো একসঙ্গে বলি!`);$('next').focus({preventScroll:true})};
 revealTimer=setTimeout(announce,matchMedia('(prefers-reduced-motion: reduce)').matches?0:3300);if(matchMedia('(max-width: 720px)').matches)$('country').closest('.map-card').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})
}
$('answer-form').addEventListener('submit',e=>{e.preventDefault();if(resolved||isPaused())return;const guess=normalize($('answer').value),c=COUNTRIES[index];if(!guess){$('feedback').textContent='Ask your grown-up to type your guess here.';return}if(guess===normalize(c.name)||c.aliases.some(a=>normalize(a)===guess)||(aliases[c.name]||[]).includes(guess)){finish(true)}else{$('feedback').textContent='Good try! Look at the shape and have another guess.';speak('Good try! Let’s keep exploring.','ভালো চেষ্টা! মানচিত্রটি দেখে আবার চেষ্টা করো।');$('answer').select()}});
$('next').onclick=()=>{if(position+1>=queue.length){showLevels();return}index=queue[++position];start()};
$('replay').onclick=()=>resolved?Globes.reveal(COUNTRIES[index]):animateMap;
$('zoom-in').onclick=()=>Globes.zoom(1.4);$('zoom-out').onclick=()=>Globes.zoom(1/1.4);
$('reveal-globe').addEventListener('wheel',e=>{if(!resolved)return;e.preventDefault();Globes.zoom(e.deltaY<0?1.2:1/1.2)},{passive:false});
refreshVoices();if('speechSynthesis' in window)window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);
function updateVoiceButton(){const button=$('sound');button.dataset.mode=voiceMode;button.setAttribute('aria-pressed',voiceMode!=='off');button.setAttribute('aria-label',voiceMode==='off'?'Voice off; tap for Bangla':`Voice ${voiceMode==='bn'?'Bangla':'English'}; tap for ${voiceMode==='bn'?'English':'off'}`);button.innerHTML=`♬ <span>${voiceMode==='bn'?'Bangla':voiceMode==='en'?'English':'Off'}</span>`}
updateVoiceButton();
$('sound').onclick=()=>{if(!('speechSynthesis' in window)){$('feedback').textContent='This browser has no reading voice. A grown-up can read the clues.';return}stopSpeech();voiceMode=voiceMode==='off'?'bn':voiceMode==='bn'?'en':'off';updateVoiceButton();if(voiceMode!=='off')speak(`Hello, ${explorerName}! Let’s explore the world!`,`হ্যালো ${explorerName}! চলো পৃথিবী ঘুরে দেখি!`)};
$('read').onclick=()=>speak(resolved?`This is ${COUNTRIES[index].name}.`:clueCount?activeClues[Math.max(0,viewedClue)]:'Look at the map. Your first clue is on its way.',resolved?`এটি ${banglaCountry(COUNTRIES[index])}।`:clueCount?activeBanglaClues[Math.max(0,viewedClue)]:'মানচিত্রটি দেখো। প্রথম সূত্রটি আসছে।',true);

 $('pause').onclick=()=>{paused=!paused;last=performance.now();$('pause').setAttribute('aria-pressed',paused);$('pause').setAttribute('aria-label',paused?'Resume adventure':'Pause adventure');$('pause').innerHTML=paused?'▶ <span>Resume</span>':'Ⅱ <span>Pause</span>';for(const b of $('choices').children){if(paused){b.dataset.wasDisabled=String(b.disabled);b.disabled=true}else b.disabled=resolved||b.dataset.wasDisabled==='true'}$('answer').disabled=paused||resolved;$('check').disabled=paused||resolved;if(paused)stopSpeech();updateTimer()};
const openSettings=()=>{$('settings').showModal();stopSpeech();updateTimer()};
$('parents').onclick=openSettings;$('profile-settings').onclick=openSettings;$('credits').onclick=()=>{$('credit-dialog').showModal();stopSpeech();updateTimer()};document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{last=performance.now();updateTimer()}));
 $('restart').onclick=()=>{discovered.clear();index=0;paused=false;$('pause').setAttribute('aria-pressed','false');$('pause').setAttribute('aria-label','Pause adventure');$('pause').innerHTML='Ⅱ <span>Pause</span>';$('settings').close();updateTrail();showLevels()};
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden)stopSpeech();updateTimer()});
setInterval(()=>{const now=performance.now(),dt=now-last;last=now;if(!resolved&&!isPaused()){remaining=Math.max(0,remaining-dt);if(remaining<=0)clue()}updateTimer()},200);
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>chooseLevel(b.dataset.level));
$('change-level').onclick=showLevels;
document.querySelectorAll('.atlas-open').forEach(b=>b.onclick=()=>{stopSpeech();$('atlas-dialog').showModal();$('atlas-detail').scrollTop=0;$('country-search').value='';filterAtlas();updateTimer()});
$('country-search').addEventListener('input',filterAtlas);
$('early-clue').onclick=()=>{if(clueCount<5)clue()};
 $('music').onclick=()=>{AdventureAudio.unlock().then(syncAudio);const enabled=AdventureAudio.toggle();$('music').setAttribute('aria-pressed',enabled);$('music').setAttribute('aria-label',`Adventure music ${enabled?'on':'off'}`);$('music').innerHTML=`♫ <span>${enabled?'ON':'OFF'}</span>`;syncAudio()};
$('music-volume').oninput=e=>AdventureAudio.volume(Number(e.target.value)/100);
$('skip-track').onclick=()=>AdventureAudio.skip();
$('profile-form').addEventListener('submit',enterAdventure);
const currentYear=new Date().getFullYear();for(let year=currentYear;year>=currentYear-120;year--){const option=document.createElement('option');option.value=String(year);option.textContent=String(year);$('explorer-birth-year').append(option)}
showLevels();$('explorer-name').focus();
