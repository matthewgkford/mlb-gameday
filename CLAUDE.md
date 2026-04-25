# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git discipline

Commit to GitHub regularly after each meaningful change. Write clear, descriptive commit messages that explain what changed and why, so the history can always be used to identify and revert to any previous state.

## Commands

```bash
npm start          # Dev server at http://localhost:3000 (hot reload)
npm run build      # Production build (ESLint disabled via DISABLE_ESLINT_PLUGIN=true)
npm test           # Jest test runner
```

There is no linting step in the normal dev flow — ESLint is intentionally disabled for builds.

## Architecture

This is a Create React App (no TypeScript) built as a mobile-first MLB scoreboard PWA, targeted at the Mets fan. No routing library — navigation is a single `selectedGame` state in `App.js` that switches between `GamePicker` and `GameView`.

### Data flow

All MLB data comes from the public MLB Stats API (`https://statsapi.mlb.com/api/v1`). There is no backend — all fetches happen client-side.

**`src/utils/mlbApi.js`** is the single data layer. Key functions:
- `getGamesForDate(dateStr)` — schedule for a given date, hydrated with team/linescore/probablePitcher/weather
- `mapGame(g)` — transforms raw schedule API response into the shape used by `GameCard` and throughout the app; includes derived fields like `statusLabel`, `venueTimeZone` (looked up from `TEAM_VENUE_TIMEZONE` by home team ID)
- `getGameFeed / getBoxScore / getPlayByPlay` — three parallel calls made by `useGameData` when entering a game
- `parseBatterStats / parsePitcherStats / parseKeyPlays / buildWinProbability` — transform raw boxscore/pbp data into component-ready shapes
- `getMetsBullpenStatus` — aggregates last 5 days of pitch counts for Mets relievers; uses hardcoded `METS_STARTERS` set to exclude rotation

**`src/hooks/useGameData.js`** — fetches all three game endpoints in parallel, assembles the unified `data` object consumed by all tab components. Auto-refreshes every 45s when `isLive`.

**`src/hooks/useTodaysGames.js`** — thin wrapper around `getGamesForDate` + `mapGame` for the game picker.

### Component tree

```
App
├── GamePicker          — tabbed nav (Today/Schedule/Standings/Leaders/Bullpen)
│   ├── GameCard        — individual game tile; shows venue local time via TEAM_VENUE_TIMEZONE
│   ├── DayView         — date-scrollable list of GameCards
│   ├── ScheduleView    — upcoming Mets games (next 14 days)
│   ├── StandingsView   — AL/NL standings
│   ├── LeadersView     — batting/pitching stat leaders
│   └── BullpenView     — Mets bullpen pitch count tracker
└── GameView            — game detail (entered when a game is selected)
    ├── Scoreboard      — linescore, win probability chart (Chart.js), live indicators
    └── [tabs]
        ├── BattingTab
        ├── PitchingTab
        ├── AdvancedTab
        └── TimelineTab
```

### Team identity / logos

`SharedUI.js` handles all team branding. Logo resolution in `TeamLogo` works in priority order:

1. **Local files** (`public/logos/`) — used for teams whose ESPN CDN logos either didn't load reliably or looked poor on the dark theme. These were manually sourced and optimised for dark backgrounds. Current local logos: NYY, MIN, CWS, MIA, PIT, ARI (also aliased as AZ), SD, COL, KC. SD and COL are PNG; the rest are SVG. **Do not replace these with CDN URLs** — they exist because the CDN versions were inadequate.
2. **ESPN CDN** (`a.espncdn.com/i/teamlogos/mlb/500/{abbr}.png`) — used for all other teams. Some abbreviations differ between the MLB API and ESPN CDN; `ESPN_ABBR` in `SharedUI.js` maps the exceptions (e.g. `ATH` → `oak`).
3. **Coloured abbreviation badge** — SVG fallback rendered inline if the image errors, using team primary colours from `TEAM_STYLES`.

The Athletics are stored as both `OAK` and `ATH` across lookup tables to handle the ongoing abbreviation transition.

### Favourite team

Hard-coded to the Mets (`FAV_TEAM_ID = 121`) in `GamePicker.js`. Mets games get blue highlight treatment and appear first in the game list.

### Timezone handling

Game start times are displayed in two places on each `GameCard`:
- **Centre (large):** `game.statusLabel` — viewer's local time, computed in `gameStatusLabel()` using `toLocaleTimeString` with no `timeZone` override
- **Bottom-left (small):** venue local time, computed inline from `game.venueTimeZone` (an IANA timezone string from the `TEAM_VENUE_TIMEZONE` lookup in `mlbApi.js`)

### Startup sound

`App.js` plays `public/startup.mp3` once on first ever load (gated by `localStorage`). On Safari/iPad where autoplay is blocked, it defers to the first tap/click.
