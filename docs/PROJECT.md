# Sattwik’s World — Project documentation

**Last updated:** 25 September 2026  
**Version:** 2.3.2, responsive explorer edition
**Owner’s project directory:** `/Users/shusovonroy/Applications/ChatGPT-Project/sattwik_map/`

## Purpose and audience

A colorful geography game for four-year-old Sattwik, played independently by tapping choices or together with a grown-up who can read/type. The experience rewards exploration without penalties. The child sees an animated country outline, guesses the country, receives gentle help, and sees where that country belongs on a real globe.

## Running the project

This is a dependency-free static frontend: HTML, CSS, JavaScript, SVG paths, Canvas 2D, and Web Audio. No bundler, framework, backend, database, sign-in, tracking, analytics, or API key is needed.

Open `index.html` directly, or run in the project folder:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
# alternatively:
npm start
```

Open `http://localhost:5173`. The server binds only to the local machine. The owner-approved production site is https://sattwik-map.vercel.app, hosted on Vercel (project `hlw2/sattwik-map`). A photo page can be opened directly as `gallery.html?country=BGD`, using a country’s three-letter code. Gallery images require internet. Maps, facts, game logic, and synthesized music are local. Browser speech support and whether voices require connectivity depend on the platform.

### Vercel hosting

Deploy with `vercel deploy --prod` from this directory using an authorized Vercel account. `vercel.json` serves the static project directly without a build step. `.vercelignore` excludes local environment files, caches, Git metadata, maintenance scripts, tests, and internal documentation from deployment; `.vercel/` is ignored by Git. No environment variables are required.

The initial production deployment on 25 September 2026 succeeded through the CLI. Vercel could not connect the GitHub repository automatically, so Git-triggered deployments are not configured. The homepage and gallery returned HTTP 200, and `/.env` returned HTTP 404. `npm test` passed before deployment.

## Coverage and educational data

The game and explorer include **195 countries**: the 193 UN member states, plus Vatican City and Palestine. Dependent territories are not individual quiz entries. This explicit scope avoids presenting a territory count as a country count.

Every country has a real simplified map outline, globe geometry, flag emoji, accepted answer names, world region, subregion, capital(s), languages, area, currencies, neighboring countries, coastline status, population value, population year, and source URL. The bundled galleries contain 2,301 photographs across all 195 countries (10–12 per country), with distinct source URLs and per-image author/license credits.

World regions distinguish North and South America. France’s flat quiz map shows metropolitan France and Corsica; the globe geometry can include source territories. Small country shapes are enlarged to be visible. Flat country maps are independently fitted, so their apparent sizes must not be used to compare actual area. Pacific longitudes are unwrapped to keep countries across the date line together. Map boundaries follow the source dataset and are simplified educational illustrations.

## Screens and flow

### Landing page

The first screen asks Sattwik to choose **Easy**, **Medium**, or **High** before any question or countdown starts. It contains a gently rotating Canvas globe, compact branding, three colorful level cards, and a link to the searchable explorer.

### Difficulty

All levels cover all 195 countries and display **exactly four distinct answer options**, including exactly one correct answer. The correct button’s position is shuffled.

| Level | Help and challenge |
| --- | --- |
| Easy | Four country names with flag emojis. First clue shares an animal, landmark, shape, or border fact; later clues introduce region, capital, and name hints. |
| Medium | Four country names without flag assistance. Clues introduce an animal, landmark, shape, or border fact, followed by region, capital, and name hints. |
| High | Four names, preferring distractors in the same subregion, then the same region. An optional answer box remains available for a grown-up. |

Fisher–Yates shuffles the country deck at level selection. There is no fixed first country. When changing levels, already discovered countries are excluded; a still-unanswered country will not be the immediate first question again when another country is available. Each deck visits every remaining country exactly once. Returning to a level starts a newly shuffled deck. Finishing the world returns to the picker; starting another complete adventure resets the session’s discoveries.

### Question and answers

The country outline enters with an animation. Four large colored buttons let the child answer. Wrong selections gently disable that one option; they do not subtract stars, advance the question, or restart the clock. High mode also accepts case-insensitive/punctuation-insensitive typed answers and known aliases. Blank input receives guidance. Correct answers lock all choices, start the country-to-globe sequence, award one discovery star, and reveal the answer, facts, and next button on the animation’s landing beat.

Automatic reveals also earn a discovery star: this is a learning game, not a scoring test. Discoveries are unique. The trail shows the ten most recent discoveries to avoid rendering 195 badges across the page. Progress stays in memory, survives level switches, and resets on refresh or a deliberate fresh start.

### Clue treasure chest

Pip the parrot introduces five treasure clues. By default, clues unlock after 15, 30, 45, 60, and 75 **active** seconds. After another 15 seconds with the fifth clue, the answer reveals at 90 active seconds.

Easy and Medium open with the bundled animal/landmark/shape fact where available (12 countries); other countries introduce a named land neighbor or their lack of land borders. High opens with its world region. No level uses a flag-matching clue. Facts come from the existing bundled country records; no new dataset is introduced.

Each clue is a colorful card with a changing animal and encouragement and an illustrated treasure button. Unlocked treasure buttons replay previous clues. The read-aloud button reads the currently selected clue. “Help me, Pip!” requests the next clue early, consumes one of the same five slots, and restarts the 15-second wait. It cannot create a sixth clue or reveal the answer early after the fifth clue. The automatic reveal still gives the fifth clue 15 seconds to try.

Pause, a hidden browser tab, the level picker, and open dialogs stop the countdown. Returning resumes the remaining time without subtracting the hidden/dialog interval. Resolved questions never keep counting down. Wrong answers do not change clue timing.

### Animated globe reveal

On a correct answer or automatic reveal, the map locks with a glow, lifts through an expanding portal, and compresses into a large globe. The globe rotates across the world before settling on the selected country. The country’s real polygon appears in gold, a pulsing geographic beacon marks its position, and the country/region card arrives on the final beat. The reveal uses distinct lock, lift, orbit, locate, and landed stages. Tiny island nations remain discoverable through the beacon. The final answer, facts, celebration, and spoken announcement wait for the landing instead of appearing over the animation. The replay control repeats the location animation after an answer and repeats the map entrance before it.

Globe drawing uses an orthographic projection of actual longitude/latitude coordinates, cached unit vectors, hemisphere visibility checks, a layered ocean, atmospheric halo, land outlines, and latitude lines. The reveal globe scales against its map canvas up to 590 CSS pixels on wide screens, uses a larger high-resolution Canvas backing store, and steps down at tablet, phone, and narrow-phone breakpoints. The map card keeps its own intrinsic height in the desktop grid, so the facts column cannot enlarge the globe canvas when the final answer appears. The landing globe is also larger and slowly rotates. On phones, the reveal scrolls the map into view. Reduced-motion users see the final location without the travel animation.

### Music and voice

Twelve original, procedurally composed instrumental tracks run locally through Web Audio: Cloud Castle, Firefly Forest, Coral Moon, Little Airship, Lantern River, Starry Caravan, Aurora Lullaby, Island Picnic, Savanna Morning, Snowglobe Waltz, Rainbow Railway, and Compass Dreams. Tempos stay between 74 and 112 BPM for a calmer child-friendly background.

They use soft sine and triangle melody voices, slow chord pads, quiet arpeggios, warm bass, sparse low pulses, musical rests, and gentle bells. Harmonic changes now follow each eight-step phrase so melodies remain aligned with their chords. The earlier bright square-wave lead and frequent drum pattern have been removed. A shuffle bag prevents an immediate repeat and rotates the track after a longer phrase cycle. A skip button changes the tune. A softer four-note discovery cadence accompanies the final globe landing. Music is enabled by default and starts after the level-selection gesture, as required by browser autoplay rules. There is a dedicated mute button and a grown-up volume slider. Default gain is lower, and the slider is capped at 30% of the app’s gain scale.

Music stops for revealed answers, the picker, pause, hidden tabs, and dialogs. Music ducks during spoken clues so they remain understandable. Voice is a separate opt-in control using the browser’s speech synthesis. Playing an individual clue explicitly can read it even with automatic voice off. Browser/device volume still controls overall loudness. Browsers without Web Audio or speech support retain the visual game.

### Country explorer and photos

A search box finds names and aliases. Selecting a country shows a map, a large flag, and a colorful fact grid with dated population, region, capitals, languages, area, currencies, coastline, and neighboring countries. A source link sits beside the population information.

The explorer opens in a viewport-fitted dialog. Its search and title remain in place while the country list and detail pane scroll independently; on phones, the country list becomes a compact two-column picker above the detail pane. Selecting a country or reopening the explorer resets its scroll position. The explorer has keyboard-accessible **Map & facts** and **Picture adventure** tabs. A dedicated link opens that country’s gallery in a separate browser tab. Galleries show at least ten distinct country-specific photo records, with descriptive captions, author attribution, individual licenses, and source links. Images load lazily, with fixed aspect ratios, and offer retry/source links when the network or upstream host fails. No account, third-party scripts, or live arbitrary image search is used at play time.

Photographs are sourced from Wikimedia Commons. The refresh script checks country-name/location relevance and filters potentially unsuitable or non-photographic metadata. This is metadata-based selection, not a guarantee that every image has received human visual review. External image availability and content can change; adults can review or replace individual records in `assets/js/photos.js`.

## Sources, licenses, and freshness

- **Outlines and globe polygons:** public-domain [Natural Earth](https://www.naturalearthdata.com/) data via [datasets/geo-countries](https://github.com/datasets/geo-countries). Simplified locally for display; no runtime geographic API.
- **Country metadata and flag characters:** [mledoze/countries](https://github.com/mledoze/countries), downloaded 25 September 2026. The derived country database retains ODbL terms; see `assets/licenses/COUNTRY-DATA-LICENSE.txt`. Some administrative facts may age and should be verified before a future refresh.
- **Population:** [World Bank SP.POP.TOTL](https://data.worldbank.org/indicator/SP.POP.TOTL), latest available observation fetched 25 September 2026. The app displays each record’s year (currently primarily 2025), not an unlabeled “live” count. [CC BY 4.0](https://datacatalog.worldbank.org/public-licenses).
- **Vatican City population:** 882 residents, 31 December 2024, from the [official Vatican City State population page](https://www.vaticanstate.va/en/state-and-government/general-informations/population.html). Kept separately because the World Bank dataset omits this record.
- **Photos:** [Wikimedia Commons](https://commons.wikimedia.org/). Each `assets/js/photos.js` record preserves its returned thumbnail URL, description page, author, license label, license URL when supplied, and description. Individual photograph licenses apply; attribution is visible with every photo. Do not remove it or replace factual photographs with invented images.
- **Music:** original synthesized compositions in `assets/js/music.js`; no external audio assets.

Country map colors use flag-inspired hues for the original twelve countries and a consistent world-region palette for the expanded set. Flag emojis depend on platform rendering.

## File map

| File | Responsibility |
| --- | --- |
| `index.html` | Main landing/game UI, settings, source credits, and explorer dialog. |
| `assets/css/style.css` | Responsive layout, colors, animations, globe transitions, gallery and reduced-motion rules. |
| `assets/js/app.js` | Game state, levels, shuffle, choices, answers, timing, clues, facts, explorer tabs, and audio coordination. |
| `assets/js/data.js` | Bundled `COUNTRIES`, `WORLD`, and `GEOMETRY` data. |
| `assets/js/globes.js` | Orthographic globe rendering, landing rotation, highlight animation. |
| `assets/js/music.js` | Original Web Audio playlist and audio lifecycle. |
| `assets/js/photos.js` | Country-keyed photograph metadata and credits. |
| `assets/js/gallery.js` | Shared photo-card renderer and standalone gallery initialization. |
| `assets/licenses/` | Third-party data license text retained with the distributed application. |
| `gallery.html` | A particular country’s photo page, selected by its ISO alpha-3 query parameter. |
| `scripts/refresh-photos.py` | Cached, rate-limited Commons metadata refresh using Python stdlib and curl. |
| `scripts/refresh-population.py` | World Bank population refresh; preserves separately sourced Vatican figure. |
| `tests/run.cjs` | Game lifecycle, randomized choices, timers, answer handling, and completion checks. |
| `tests/data.cjs` | All-country geometry/fact/population/gallery completeness and source checks. |
| `tests/audio.cjs` | Track count, random selection, scheduling, pause, mute, and volume checks. |
| `vercel.json` | Static Vercel hosting configuration without a build step. |
| `.vercelignore` | Excludes local configuration and maintenance files from deployment. |
| `package.json` | Convenience start and test scripts; no dependencies. |
| `AGENTS.md` | Project instructions, including mandatory documentation maintenance. |
| `docs/PROJECT.md` | This living project reference. |

## Validation and QA

Run `npm test`, with Node.js installed. No package installation is necessary. For a quick syntax check, run `node --check` on each edited JavaScript file.

Automated tests cover:

- 195 country records and real geographic geometry, finite paths, populations with dates/sources.
- All 585 country/level combinations: exactly four distinct choices and one correct choice.
- A fresh randomized deck, no repeated questions, no forced first country, complete 195-country journey, and progress across level changes.
- The pre-game gate, five timed clue boundaries, final reveal, early-clue cap, hidden tabs/dialog pauses, and answer normalization.
- Twelve original tracks, shuffle-bag selection, audio scheduling, discovery cadence, mute, pause, and volume.
- At least ten unique photo records per country, each with a supported Wikimedia source URL, author and license.

Browser QA includes the compact landing view, all difficulty controls, interactive clues, a correct-answer globe reveal, explorer search, large flag/population facts, gallery tabs, a separate photo page, responsive phone/desktop layouts, and independent explorer list/detail scrolling. Automated audio tests confirm scheduling/control behavior; audible quality depends on the user’s playback hardware. Metadata completeness is distinct from external thumbnail availability.

### Verification snapshot — 25 September 2026

- All game lifecycle tests passed, including 585 country/level option combinations and a full 195-country run.
- All data checks passed: 195 maps, 195 dated population records, and 2,301 attributed photo records with a minimum of ten per country.
- All twelve-track audio-control and scheduling tests passed.
- Browser checks passed at phone and desktop sizes. The responsive globe sizes, five-stage country landing, delayed final announcement, replay control, and question controls were inspected without horizontal overflow or runtime errors.
- Every JavaScript file passed syntax checking. Photo coverage checks validate metadata completeness, not permanent upstream availability.

## Maintenance rules

**Update this file after every project change**, including future requests. This is an explicit owner requirement, also recorded in `AGENTS.md`. Keep the feature descriptions, file list, data-source dates, commands, test outcomes, limitations, and change log synchronized with the implementation.

For a population refresh:

```sh
python3 scripts/refresh-population.py
npm test
```

Verify the updated years/sources and update this document. For photo metadata:

```sh
python3 scripts/refresh-photos.py
npm test
```

The script uses `.cache/photos/` by default, filters irrelevant/unsuitable metadata, and exits unsuccessfully if any country has fewer than ten records. A refresh can take time because Commons rate limits apply. Respect Retry-After, preserve the cache, and rerun only incomplete or changed entries. Visually inspect replacement photos; do not fill a gallery with duplicates or images of another country.

When changing cached browser assets, increment their `?v=` references in both HTML files. This prevents an existing local tab from combining new markup with old game logic/styles. Keep source metadata separate from DOM HTML: use text nodes, not untrusted HTML from API responses. Only known HTTPS Wikimedia image/source URLs are stored in the galleries.

## Known limits

- This is a static application available locally and on Vercel, not an installable mobile app.
- Session discoveries are not stored across browser refreshes.
- The 195-country convention excludes dependencies and other entities outside the chosen scope.
- Maps are simplified, may reflect disputed boundaries, and do not compare countries to a shared flat-map scale.
- Population counts are dated estimates, not a live counter. Administrative facts reflect the bundled sources.
- Photos need internet and may become unavailable upstream. Retry/source links are available; the map game remains usable offline.
- Emoji flags, browser voices, autoplay policies, and audio output vary by device.
- All continuous motion respects `prefers-reduced-motion`; most visual animation stops in a hidden tab, and the game clock and music pause.

## Change log

### 25 September 2026 — Version 2.3.2

Reworked the Country Explorer dialog to fit within the available desktop or phone viewport. Kept its search controls visible and gave the country list and country details separate, contained scrolling areas; on phones, the picker uses a compact two-column grid above the details. Added scroll resets when changing selection or reopening the explorer, keyboard-focusable and touch-sized selection/reading panes, and cache-version updates. Automated tests passed. A fresh visual check could not be completed because Chrome UI control was repeatedly redirected by concurrent browser activity.

### 25 September 2026 — Version 2.3.1

Replaced Easy’s opening flag-matching clue with a discovery fact and used the same fact-first sequence for Medium. Retained High’s geography-first sequence and the four choices in every level. Changed all clue waits and the final answer wait to 15 active seconds (five clues by 75 seconds; automatic reveal at 90 seconds). Updated visible timer text, progress accessibility values, settings, clue icon, cache versions, and project maintenance instructions. Added regression checks for flag-free clues across all countries/levels and the final wait after manual clues. `npm test` and syntax checks for both modified JavaScript files passed. Desktop Chrome confirmed the new discovery clue, 15-second countdown, four choices, and pause control. Phone-view verification for this release could not be completed because concurrent browser activity repeatedly interrupted UI automation; the earlier responsive QA snapshot remains historical.

### 25 September 2026 — Vercel production deployment

With owner approval, deployed the application to https://sattwik-map.vercel.app. Added static hosting configuration and upload exclusions, and ignored local Vercel project metadata. All automated tests passed; live homepage/gallery returned HTTP 200 and local environment configuration was not served. GitHub automatic deployment linking failed; CLI deployment remains available.

### 25 September 2026 — GitHub repository maintenance

Excluded the local `.env` file from version control and removed it from the unpublished project commit before pushing to GitHub. Local configuration remains on disk. Ran `npm test`: game, all 195 country records, 2,301 photo references, and audio checks passed. No application behavior changed.

### 25 September 2026 — Version 2.3.0

Organized the dependency-free project into a conventional static-site structure. Kept `index.html` and `gallery.html` as root entry points; moved CSS to `assets/css/`, JavaScript and bundled datasets to `assets/js/`, and the dataset license to `assets/licenses/`. Updated HTML asset URLs, tests, data-refresh scripts, source references, cache versions, README structure guidance, and this documentation. The server and test commands remain unchanged.

### 25 September 2026 — Version 2.2.0

Replaced the soundtrack compositions and scheduling engine after the prior music proved too bright and repetitive. The new twelve-track set uses calmer tempos, softer sine/triangle voices, proper phrase-level chord changes, longer musical ideas, quieter bass, gentle arpeggios, rests, sparse percussion, and a softer success cadence. Lowered the default and maximum music gain while retaining random non-repeating playback, skip, mute, ducking, and grown-up volume controls.

### 25 September 2026 — Version 2.1.1

Fixed the reveal canvas growing at the final answer. The desktop grid now aligns both columns to their own content height, which keeps the map stage and globe dimensions identical before, during, and after the country landing even when the facts card expands.

### 25 September 2026 — Version 2.1.0

Enlarged the landing, preview, and reveal globes and made their sizes respond to the actual map canvas across wide desktop, tablet, phone, and narrow-phone layouts. Rebuilt the answer reveal as a five-stage cinematic landing with a portal, rotating globe, real-position beacon, timed location card, and final result announced on arrival. Expanded the procedural playlist from five to twelve varied arrangements, added a non-repeating shuffle bag, lengthened song cycles, and added a discovery cadence. Retested the game, audio, data, syntax, and responsive browser layouts.

### 25 September 2026 — Version 2.0.0

Expanded the original twelve-country game to 195 countries and a pre-question Easy/Medium/High picker. Then incorporated the owner’s adventure-edition requirements: compact header, rotating landing globe, animated country-to-world reveal, five original random music tracks, exactly four choices at every level, interactive clue treasures, expanded facts with dated population, larger flags, country photo tabs and separate photo pages, randomized country decks in every level, richer colors/transitions, automated/browser verification, and this living project document with a future-update rule.

### 25 September 2026 — Initial version

Twelve-country map game, animated outlines, typed answers, five 30-second clues, gentle automatic reveal, speech support, stars, discovery trail, pause, mobile layout, and source credits.
