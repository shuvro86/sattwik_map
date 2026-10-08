# World Adventure — Project documentation

**Last updated:** 8 October 2026<br>
**Version:** 2.6.2, welcome settings label and responsive verification
**Owner’s project directory:** `/Users/shusovonroy/Applications/ChatGPT-Project/global_map/`

## Purpose and audience

A colorful geography game first made for four-year-old Sattwik and now welcoming all enthusiastic children, played independently by tapping choices or together with a grown-up who can read/type. The experience rewards exploration without penalties. The child sees an animated country outline, guesses the country, receives gentle help, and sees where that country belongs on a real globe.

## Running the project

This is a dependency-free static frontend: HTML, CSS, JavaScript, SVG paths, Canvas 2D, and HTML audio. No bundler, framework, backend, database, sign-in, tracking, analytics, or API key is needed.

Open `index.html` directly, or run in the project folder:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
# alternatively:
npm start
```

Open `http://localhost:5173`. The server binds only to the local machine. The owner-approved production site is https://sattwik-map.vercel.app, hosted on Vercel (project `hlw2/sattwik-map`). A photo page can be opened directly as `gallery.html?country=BGD`, using a country’s three-letter code. The picture page title and brand use the saved explorer name when available. Gallery images require internet. Maps, facts, game logic, and bundled music recordings are local. Browser speech support and whether voices require connectivity depend on the platform.

### Vercel hosting

Deploy with `vercel deploy --prod` from this directory using an authorized Vercel account. `vercel.json` serves the static project directly without a build step. `.vercelignore` excludes local environment files, caches, Git metadata, maintenance scripts, tests, and internal documentation from deployment; `.vercel/` is ignored by Git. No environment variables are required.

The initial production deployment on 25 September 2026 succeeded through the CLI. Vercel could not connect the GitHub repository automatically, so Git-triggered deployments are not configured. The homepage and gallery returned HTTP 200, and `/.env` returned HTTP 404. `npm test` passed before deployment.

## Coverage and educational data

The game and explorer include **195 countries**: the 193 UN member states, plus Vatican City and Palestine. Dependent territories are not individual quiz entries. This explicit scope avoids presenting a territory count as a country count.

Every country has a real simplified map outline, globe geometry, flag emoji, accepted answer names, world region, subregion, capital(s), languages, area, currencies, neighboring countries, coastline status, population value, population year, and source URL. The bundled galleries contain 2,301 photographs across all 195 countries (10–12 per country), with distinct source URLs and per-image author/license credits.

World regions distinguish North and South America. France’s flat quiz map shows metropolitan France and Corsica; the globe geometry can include source territories. Small country shapes are enlarged to be visible. Flat country maps are independently fitted, so their apparent sizes must not be used to compare actual area. Pacific longitudes are unwrapped to keep countries across the date line together. Map boundaries follow the source dataset and are simplified educational illustrations.

## Screens and flow

### Explorer welcome and landing page

On every main-page load, a welcome screen asks for the child’s name and birth year before the level picker is available. Both fields are required. The year is chosen from a dropdown covering the current year and the preceding 120 years, validated, and discarded. The trimmed name (up to 40 characters) personalizes the header, page title, landing and game headings, footer, settings heading, spoken question, voice greeting, and discovery announcement. The name alone is stored in this device’s localStorage so a separately opened country picture page can use the same name in its header and title. A direct gallery visit without a saved name uses “Our World.” Reloading the main page asks again and updates the saved name; no profile, account, or server submission is created. An **Adjust Settings** button immediately before **Start exploring** opens the grown-up settings dialog before play. A second Make Settings button in the active game toolbar keeps voice and music-volume settings available during play; the old header Grown-ups button is removed.

After the welcome, the level picker asks the explorer to choose **Easy**, **Medium**, or **High** before any question or countdown starts. It uses a bright layered gradient backdrop, animated sparkles, and a gently floating Canvas globe to create an energetic welcome. Easy, Medium, and High each have their own vivid gradient card, large text, and clear tap target; narrow phone screens stack the cards vertically. Reduced-motion preferences stop the decorative motion. The screen also links to the searchable explorer.

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

Globe drawing uses an orthographic projection of actual longitude/latitude coordinates, cached unit vectors, hemisphere visibility checks, a layered ocean, atmospheric halo, land outlines, and latitude lines. The reveal globe scales against its map canvas up to 590 CSS pixels on wide screens, uses a larger high-resolution Canvas backing store, and steps down at tablet, phone, and narrow-phone breakpoints. The map card keeps its own intrinsic height in the desktop grid, so the facts column cannot enlarge the globe canvas when the final answer appears. The landing globe is also larger and slowly rotates. After the globe lands, accessible + and − buttons zoom its geography in and out (1×–3.2×); desktop mouse-wheel zoom works over the globe. Nearby country names appear once zoomed in, with the found country labeled first. Zoom resets for each new question or replay. On phones, the reveal scrolls the map into view. Reduced-motion users see the final location without the travel animation.

### Music and voice

Three locally bundled instrumental recordings by Kevin MacLeod play during questions: Carefree (gentle ukulele and marimba), Frost Waltz (a soft orchestral and bell melody), and Dream Culture (dreamy piano). A shuffle bag changes the recording for each question without an immediate repeat; a skip button lets a grown-up choose another. Music is enabled by default and starts after level selection, respecting browser autoplay rules. The music mute and grown-up volume controls remain, with a 30% maximum app volume. Playback pauses for revealed answers, the picker, pause, hidden tabs, and dialogs, and becomes quieter while speech plays. Playback reaches the end of a recording before advancing to another. The former procedural playlist and synthetic discovery cadence have been removed.

Voice remains opt-in and uses browser speech synthesis. The header’s visible ♬ button cycles **Off → Bangla → English → Off**; it announces the chosen language when switched on. Prompts, clues, encouragement, and country reveals speak in the selected language. The question greeting and discovery announcement address the entered explorer name in both modes; Bangla pronunciation of a name entered in another script depends on the device voice. Each clue card also shows Bangla text. All 195 countries have five Bangla clue slots; the twelve special animal/landmark/shape facts have matching translations, while other clues are assembled from bundled country facts. Country names use the browser’s Bengali region names when available. English initial and three-letter name hints remain English spelling hints in the Bangla script. Automatic English narration rotates among available gentle English voices each question; a grown-up may select an English voice and a separate installed Bangla voice in settings. A Bangla voice may be absent on a device, in which case the browser may use a fallback voice and pronunciation can suffer. Speech uses a near-natural rate, neutral pitch, and reduced volume. **These are synthesized device voices, not human recordings**. The clue read-aloud button still works while automatic voice is Off, reading Bangla in that state. Browsers without speech playback still have both written clue languages.

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
- **Music:** locally bundled Carefree, Frost Waltz, and Dream Culture by Kevin MacLeod (incompetech.com), each [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Carefree](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037), [Frost Waltz](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100516), [Dream Culture](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046). Credits and license links also appear in the application.

Country map colors use flag-inspired hues for the original twelve countries and a consistent world-region palette for the expanded set. Flag emojis depend on platform rendering.

## File map

| File | Responsibility |
| --- | --- |
| `index.html` | Main landing/game UI, settings, source credits, and explorer dialog. |
| `assets/css/style.css` | Responsive layout, colors, animations, globe transitions, gallery and reduced-motion rules. |
| `assets/js/app.js` | Game state, levels, shuffle, choices, answers, timing, clues, facts, explorer tabs, and audio coordination. |
| `assets/js/data.js` | Bundled `COUNTRIES`, `WORLD`, and `GEOMETRY` data. |
| `assets/js/globes.js` | Orthographic globe rendering, landing rotation, highlight animation, landed zoom, and country labels. |
| `assets/js/music.js` | Bundled recording playlist and playback controls. |
| `assets/audio/` | Three locally bundled CC BY 4.0 MP3 recordings. |
| `assets/js/photos.js` | Country-keyed photograph metadata and credits. |
| `assets/js/gallery.js` | Shared photo-card renderer and standalone gallery initialization. |
| `assets/licenses/` | Third-party data license text retained with the distributed application. |
| `gallery.html` | A particular country’s photo page, selected by its ISO alpha-3 query parameter. |
| `scripts/refresh-photos.py` | Cached, rate-limited Commons metadata refresh using Python stdlib and curl. |
| `scripts/refresh-population.py` | World Bank population refresh; preserves separately sourced Vatican figure. |
| `tests/run.cjs` | Welcome validation and name checks, game lifecycle, randomized choices, timers, answer handling, completion, and Bangla/English speech and clue checks. |
| `tests/data.cjs` | All-country geometry/fact/population/gallery completeness and source checks. |
| `tests/audio.cjs` | Recording count, shuffle, playback, speech ducking, pause, mute, and volume checks. |
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
- The name/birth-year entry gate and welcome settings access, five timed clue boundaries, final reveal, early-clue cap, hidden tabs/dialog pauses, answer normalization, and all-country Bangla clue coverage.
- Three bundled recordings, shuffle-bag selection, playback, speech ducking, mute, pause, volume, and Off/Bangla/English voice routing and button state.
- At least ten unique photo records per country, each with a supported Wikimedia source URL, author and license.

Browser QA includes the compact landing view, all difficulty controls, interactive clues, a correct-answer globe reveal, explorer search, large flag/population facts, gallery tabs, a separate photo page, responsive phone/desktop layouts, and independent explorer list/detail scrolling. Automated audio tests confirm playback/control behavior; audible quality depends on the user’s playback hardware. Metadata completeness is distinct from external thumbnail availability.

### Verification snapshot — 25 September 2026

- All game lifecycle tests passed, including 585 country/level option combinations and a full 195-country run.
- All data checks passed: 195 maps, 195 dated population records, and 2,301 attributed photo records with a minimum of ten per country.
- Historical release: all twelve-track audio-control and scheduling tests passed.
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
- Session discoveries are not stored across browser refreshes. The name is stored on this device for gallery personalization; the birth year is not stored.
- The 195-country convention excludes dependencies and other entities outside the chosen scope.
- Maps are simplified, may reflect disputed boundaries, and do not compare countries to a shared flat-map scale.
- Population counts are dated estimates, not a live counter. Administrative facts reflect the bundled sources.
- Photos need internet and may become unavailable upstream. Retry/source links are available; the map game remains usable offline.
- Emoji flags, browser voices, autoplay policies, and audio output vary by device. Some devices have no Bangla voice; browser fallback pronunciation may be poor. City names and spelling hints in Bangla clues include English words or letters.
- All continuous motion respects `prefers-reduced-motion`; most visual animation stops in a hidden tab, and the game clock and music pause.

## Change log

### 8 October 2026 — Version 2.6.2

Renamed the welcome-screen settings button to **Adjust Settings** while retaining the active-game **Make Settings** control. Responsive testing found that a 40-character explorer name could widen a narrow phone page; branding and headings now wrap while keeping the full name visible. Updated the entry assertion, stylesheet cache version, and package version. `npm test` passed, including all 195 countries and 2,301 distinct photo records; modified JavaScript syntax checks and `git diff --check` passed. Local browser checks covered 320, 360, 390, 430, 560, 720, 768, 1024, 1280, and 1600 px widths across the welcome, level picker, game, and gallery. The 320×568 settings and explorer dialogs remained usable; the full-length name no longer caused horizontal overflow. Deployed to the existing Vercel production alias at https://sattwik-map.vercel.app (deployment `dpl_8Gj7hvPqL1B6J3Xntqw9vp2RG78b`, ready). A live browser check confirmed the renamed button, stylesheet version, and twelve credited Bangladesh photo records.

### 8 October 2026 — Version 2.6.1

Replaced the birth-date input with a required birth-year dropdown to avoid day/month typing mistakes. The selected year is validated and discarded. Moved the grown-up settings entry to the welcome form as **Make Settings**, directly before **Start exploring**, and kept a Make Settings control in the active game toolbar so voice and volume settings remain reachable during a question. Removed the former header button and hid the reset action before play begins. Updated regression checks, asset cache versions, package version, and this guide. `npm test` and modified-JavaScript syntax checks passed, including all 195 country records and 2,301 photo records. Local browser checks confirmed the settings dialog opens before starting, the year picker works, four choices remain, and no horizontal overflow occurs at 390 px phone and 1280 px desktop widths. No deployment was made.

### 8 October 2026 — Version 2.6.0

Added a required name and birth-date welcome screen before level selection. Validated and discarded the birth date; stored only the explorer name locally for picture-page branding. Replaced current Sattwik-specific interface text, titles, and English/Bangla question and discovery speech with the entered name, while retaining the existing game flow and credits. Added welcome and spoken-name checks, refreshed changed asset cache versions, and updated the package metadata. `npm test` and modified-JavaScript syntax checks passed, including all 195 countries and 2,301 distinct photo records. Local browser checks covered the welcome screen, personalized landing and game, four choices, and picture-page title/header at 390 px phone and 1280 px desktop widths with no horizontal overflow. Browser audio quality remains device-dependent. No deployment was made.

### 7 October 2026 — Version 2.5.1

Changed the header voice control to the requested three visible states: Off, Bangla, and English. One tap from Off starts Bangla; the next selects English; the next turns automatic speech Off. The button keeps its current state visible on phone and desktop widths, while grown-up settings retain separate English and Bangla device voice selection. Removed the settings language dropdown and bilingual playback so the button is the single language control. Updated tests, cache versions, package version, and this guide. `npm test` and syntax checks passed, including all 195 country and 2,301 photo record checks. Deployed to the existing Vercel production alias at https://sattwik-map.vercel.app (deployment `dpl_BH7UrwFdYSaPXusaU8S2RizsUACg`, ready). Live browser checks confirmed all three button states and labels, the Bangla clue text and country reveal, separate English and Bangla voice selectors (including an available Bengali device voice), and no horizontal overflow at 390 px phone and 1280 px desktop widths. Audible pronunciation still depends on the playback device.

### 7 October 2026 — Version 2.5.0

Added Bangla narration beside English for question prompts, all five clue slots, retry encouragement, and discovered country names. Grown-up settings now choose bilingual (Bangla first), Bangla only, or English only, with separate English and Bangla device voice selectors. Clue cards show the Bangla text; the twelve special country facts have corresponding Bangla lines, and the remaining clues are built from existing country facts. Kept opt-in voice, manual read-aloud, music ducking, pause and visibility behavior. Updated the game asset cache version, package version, tests, and this guide. `npm test` passed, including all 195 countries and 2,301 distinct photo records; modified JavaScript passed syntax checks. Browser visual QA was blocked by the local browser security policy, which disallowed opening the project’s `file:` URL; no visual or acoustic quality claim is made for this revision.

### 7 October 2026 — Version 2.4.0

Replaced the procedural soundtrack with three locally bundled, credited CC BY 4.0 instrumental recordings. Retained non-repeating shuffle, skip, mute, capped volume, speech ducking, and all pause/visibility behavior. Automatic narration now varies among the installed gentle English voices by question, with a neutral pitch and near-natural rate; the grown-up voice selector remains. The settings explain that device voices are synthesized and that genuine human narration still requires recordings. Updated asset cache versions and audio tests. `npm test` passed, including all 195 country and 2,301 photo record checks; modified JavaScript passed syntax checks. Safari browser QA verified the desktop game, a narrow enlarged view with four choices, the settings controls, and a local MP3 request. Acoustic quality was not judged by automated tests. Pushed the final revision to GitHub and deployed the same file contents to the existing Vercel production site; the homepage and all three MP3 files returned HTTP 200.


### 26 September 2026 — Version 2.3.5

Restyled the level picker with a colorful gradient backdrop, distinct warm/cool/berry gradients for the three large level cards, star accents, and gentle globe/sparkle motion. At narrow phone widths the cards stack for comfortable reading and tapping. Added reduced-motion overrides, refreshed the stylesheet cache version, and updated this project reference. `npm test` passed; Chrome desktop and 400 px phone views were checked.

### 26 September 2026 — Version 2.3.4

Added separate active-state colors to Music, Voice, and Pause/Resume controls, with ON/OFF and Pause/Resume labels visible on phones. Updated accessible labels with state changes and reset the pause control when returning to the level picker. Updated asset cache versions and this project reference.

### 26 September 2026 — Version 2.3.3

Preferred a warmer installed English speech voice and adjusted speech rate and pitch. Added a grown-up voice selector while preserving opt-in narration and read-aloud clues. Added +/− controls and desktop wheel zoom to the final globe; country names appear when zoomed in, and zoom resets between questions and replays. Updated HTML cache versions, regression tests, and this documentation. `npm test` and JavaScript syntax checks passed; desktop Chrome confirmed country labels and zoom controls, and a 400 px phone emulation confirmed that the zoomed globe and controls fit. Audio quality still depends on installed system voices and speakers.

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
