# Sattwik’s World

A playful country-map adventure for Sattwik and a grown-up. Includes 195 countries, three difficulty levels with four choices each, randomized questions, five clue treasures, real globe reveals, original adventure music, and country facts/photo galleries.

## Run

Open `index.html` in a modern browser, or use a local web server:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Then open http://localhost:5173. `npm start` runs the same server. No npm dependencies, build, account, or API key is required. Country photos need internet; game maps, facts, and generated music run locally. Text-to-speech depends on browser/device voices.

## Verify

```sh
npm test
```

Requires Node.js; no install step. Tests exercise gameplay, all country/level choices, randomization, clue timing, pause/resume, audio controls, country data, and gallery completeness.

## Project structure

```text
.
├── index.html                 Main game entry page
├── gallery.html               Standalone country gallery
├── assets/
│   ├── css/style.css          Application styles and responsive rules
│   ├── js/                    Game modules and bundled country/photo data
│   └── licenses/              Third-party dataset license text
├── docs/PROJECT.md            Living product and technical documentation
├── scripts/                   Dataset maintenance utilities
├── tests/                     Dependency-free Node.js checks
├── AGENTS.md                  Project maintenance requirements
└── package.json               Local server and test commands
```

The entry pages remain at the project root so static hosting and `python3 -m http.server` continue to work without a build step.

## Documentation

See [docs/PROJECT.md](docs/PROJECT.md) for behavior, data sources, file layout, controls, testing, limitations, and maintenance instructions. Update that file whenever the project changes, as required by [AGENTS.md](AGENTS.md).
# sattwik_map
