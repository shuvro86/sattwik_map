"""Fetch country-specific Commons photo references and credits, without downloading images.
Usage: python3 scripts/refresh-photos.py [cache-directory]
Uses identified, bounded requests (at most two concurrently), curl Retry-After support, and cached results.
"""
import concurrent.futures,html,json,re,subprocess,sys,time,unicodedata
from pathlib import Path
from urllib.parse import urlencode
root=Path(__file__).resolve().parents[1];cache=Path(sys.argv[1]) if len(sys.argv)>1 else root/'.cache/photos';cache.mkdir(parents=True,exist_ok=True)
cs=json.loads((root/'assets/js/data.js').read_text().split('const COUNTRIES=')[1].split(';\nconst WORLD=')[0])
reject=re.compile(r'nud(e|ity)|naked|sexual|porn|corpse|dead |death|killed|\bwar\b|warfare|battle|bomb|military|weapon|blood|protest|riot|refugee|cemetery|grave|anatomy|\bmap\b|\bflag\b|coat of arms|logo|diagram|chart|painting|drawing|engraving|stamp|banknote|\bcoin\b|portrait|statue|sculpture|skeleton|postcard|turpentine|atlas|cook|recipe|anatom|artwork|oil on|watercolou?r|lithograph|canvas|satellite|copernicus|independence day|earth from space|\bmodis\b|conference|ceremony|military|\bMET \w|museum m',re.I)
def clean(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
def norm(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.lower()) if not unicodedata.combining(c))
names={'ATG':['Antigua','Barbuda'],'BIH':['Bosnia','Herzegovina'],'CPV':['Cape Verde','Cabo Verde'],'COD':['Democratic Republic of the Congo','DR Congo','Kinshasa'],'COG':['Republic of the Congo','Brazzaville'],'CIV':['Ivory Coast',"Côte d’Ivoire",'Cote d\'Ivoire'],'CZE':['Czechia','Czech Republic'],'SWZ':['Eswatini','Swaziland'],'FSM':['Pohnpei','Kosrae','Chuuk','Yap Island'],'GBR':['United Kingdom','Scotland','Wales','England'],'KNA':['Saint Kitts','St Kitts','Nevis'],'LCA':['Saint Lucia','St Lucia'],'VCT':['Saint Vincent','St Vincent','Grenadines'],'MMR':['Myanmar','Burma'],'STP':['Sao Tome','São Tomé','Principe','Príncipe'],'TLS':['Timor-Leste','East Timor'],'TUR':['Turkey','Türkiye'],'USA':['United States','USA'],'VAT':['Vatican'],'PSE':['Palestine','Jericho','West Bank'],'GNQ':['Equatorial Guinea','Malabo'],'GEO':['Tbilisi','Kazbegi','Batumi','Svaneti'],'GMB':['Gambia','Banjul'],'GAB':['Gabon','Libreville','Loango'],'GNB':['Guinea-Bissau','Bissau','Bissagos','Bijagos'],'COM':['Comoros','Moroni','Grande Comore','Anjouan','Moheli']}
def relevant(c,p):
 text=norm(p['title']+' '+p.get('description',''));artist=p.get('artist','')
 if reject.search(text+' '+artist+' '+p.get('categories','')):return False
 if c['id']=='ATG' and 'guatemala' in text:return False
 if c['id']=='GEO' and ('atlanta' in text or 'united states' in text):return False
 if c['id']=='GIN' and any(x in text for x in ['equatorial guinea','papua','guinea-bissau']):return False
 if c['id']=='DMA' and 'dominican republic' in text:return False
 if c['id']=='NER' and 'nigeria' in text:return False
 return any(re.search(r'(?<![a-z])'+re.escape(norm(n))+r'(?![a-z])',text) for n in names.get(c['id'],[c['name']]))
ua='SattwikWorld/1.0 (http://localhost:5173/docs/PROJECT.md; local educational country explorer)'
allphotos={}
def collect(c):
 path=cache/(c['id']+'.json');existing=json.loads(path.read_text()) if path.exists() else [];photos=[p for p in existing if relevant(c,p)];seen={p['source'] for p in photos}
 if len(photos)<10:
  searchNames=names.get(c['id'],[c['name']]);queries=[f'intitle:"{searchNames[0]}" landscape',f'intitle:"{searchNames[0]}"']
  queries += [f'intitle:"{n}"' for n in searchNames[1:]]
  for query in queries:
   if len(photos)>=12:break
   time.sleep(1.2)
   params=dict(action='query',generator='search',gsrsearch=query+' filetype:bitmap',gsrnamespace=6,gsrlimit=20,prop='imageinfo',iiprop='url|extmetadata|size|mime',iiurlwidth=640,iiextmetadatafilter='ImageDescription|Artist|LicenseShortName|LicenseUrl|Categories',format='json')
   url='https://commons.wikimedia.org/w/api.php?'+urlencode(params)
   try:
    raw=subprocess.check_output(['curl','-sS','--fail','--max-time','35','--retry','3','--retry-delay','10','-A',ua,'--url',url],stderr=subprocess.DEVNULL)
    data=json.loads(raw);pages=data.get('query',{}).get('pages',{})
    if data.get('error'):print('API error',data['error'].get('code'),flush=True)
   except Exception as e:print(c['id'],'request failed, backing off',flush=True);time.sleep(60);continue
   for page in sorted(pages.values(),key=lambda p:p.get('index',999)):
    info=(page.get('imageinfo')or[{}])[0];meta=info.get('extmetadata',{});title=page['title'].removeprefix('File:')
    if info.get('mime')not in ['image/jpeg','image/png','image/webp']or min(info.get('width',0),info.get('height',0))<400:continue
    p=dict(title=title,url=info.get('thumburl')or info['url'],source=info['descriptionurl'],artist=clean(meta.get('Artist',{}).get('value','')),license=clean(meta.get('LicenseShortName',{}).get('value','')),licenseUrl=meta.get('LicenseUrl',{}).get('value',''),description=clean(meta.get('ImageDescription',{}).get('value',''))[:1000],categories=clean(meta.get('Categories',{}).get('value','')))
    if not p['artist']or not p['license']or p['source']in seen or not relevant(c,p):continue
    photos.append(p);seen.add(p['source'])
    if len(photos)>=12:break
 temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(photos,ensure_ascii=False));temporary.replace(path);return c['id'],photos
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for number,(key,photos) in enumerate(pool.map(collect,cs),1):
  allphotos[key]=photos
  if number%10==0 or len(photos)<10:print(f'{number}/195 {key}: {len(photos)} checked photos',flush=True)
  # Atomic publication avoids a partially written script during local browsing.
  current={p.stem:json.loads(p.read_text()) for p in cache.glob('*.json')}
  target=root/'assets/js/photos.js';temp=root/'assets/js/photos.js.tmp';temp.write_text('const PHOTOS='+json.dumps(current,ensure_ascii=False,separators=(',',':'))+';');temp.replace(target)
missing={k:len(v)for k,v in allphotos.items()if len(v)<10};print('FINISHED',sum(map(len,allphotos.values())),'photos; missing:',missing,flush=True)
if missing:sys.exit(1)
