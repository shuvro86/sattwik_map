'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(require('node:path').resolve(__dirname,'..'));
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('assets/js/data.js','utf8')+fs.readFileSync('assets/js/photos.js','utf8'),ctx);
const {countries,geometry,photos}=vm.runInContext('({countries:COUNTRIES,geometry:GEOMETRY,photos:PHOTOS})',ctx);
assert.equal(countries.length,195);assert.equal(new Set(countries.map(c=>c.id)).size,195);
let count=0;
for(const c of countries){
 assert.ok(c.population>0,`${c.name}: population`);assert.match(c.populationYear,/^20\d\d$/);assert.ok(c.capital&&c.region&&c.currencies&&c.neighbors);
 assert.ok(c.path&&!/NaN|Infinity|undefined/.test(c.path),`${c.name}: invalid outline`);
 for(const ring of geometry[c.id])for(const [lon,lat]of ring){assert.ok(lon>=-180&&lon<=180&&lat>=-90&&lat<=90)}
 const ps=photos[c.id]||[];assert.ok(ps.length>=10,`${c.name}: ${ps.length} photos, expected at least 10`);assert.equal(new Set(ps.map(p=>p.source)).size,ps.length,`${c.name}: duplicate photos`);
 for(const p of ps){assert.ok(p.artist&&p.license&&p.title);assert.match(p.url,/^https:\/\/(upload|thumb)\.wikimedia\.org\//);assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.ok(!/<script/i.test(p.artist+p.title))}count+=ps.length;
}
console.log(`PASS: 195 maps, geographic geometry, dated populations, complete facts, and ${count} distinct attributed photo references (10+ per country).`);
