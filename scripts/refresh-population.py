"""Refresh the World Bank population snapshot. Requires internet and curl."""
import json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1];path=root/'assets/js/data.js';text=path.read_text();country_text,rest=text.split(';\nconst WORLD=',1);countries=json.loads(country_text.removeprefix('const COUNTRIES='))
url='https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&mrv=1&per_page=400'
raw=subprocess.check_output(['curl','--fail','--silent','--show-error','--max-time','60',url]);records={r['countryiso3code']:r for r in json.loads(raw)[1]}
for c in countries:
 if c['id']=='VAT':continue # Official 882 residents, 31 December 2024; update only against the official source.
 r=records.get(c['id']);assert r and r['value']is not None,c['name'];c['population']=r['value'];c['populationYear']=r['date']
path.write_text('const COUNTRIES='+json.dumps(countries,ensure_ascii=False,separators=(',',':'))+';\nconst WORLD='+rest)
print('Updated 194 World Bank population records; kept separately sourced Vatican City count. Update docs/PROJECT.md and rerun tests.')
