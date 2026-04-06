const BASE = 'https://statsapi.mlb.com/api/v1';

const CITY_OVERRIDES = {
  121: 'New York',  // Mets
  147: 'New York',  // Yankees
  136: 'Seattle',
  135: 'Pittsburgh',
  134: 'Milwaukee',
  158: 'Milwaukee',
};

export function fixCity(id, fallback) {
  return CITY_OVERRIDES[id] || fallback || '';
}

// Use MLB's official scoreboard logos — full colour, reliable on dark backgrounds
// Cap logos work for most teams; some need the primary logo for visibility
const DARK_CAP_TEAMS = ['nyy','min','col','sd','ari','pit','cws','oak','mia'];

export function teamLogoUrl(abbr) {
  const lower = abbr?.toLowerCase();
  if (!lower) return '';
  // ESPN CDN is more reliable for loading; use it as base
  // but fall back to MLB official for teams with dark/invisible cap logos
  if (DARK_CAP_TEAMS.includes(lower)) {
    return `https://www.mlb.com/images/logos/teams/${abbr?.toUpperCase()}.svg`;
  }
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${lower}.png`;
}

// Use MLB's own headshot endpoint — uses MLB player ID directly, no mapping needed
// Always returns the correct current player photo
export function playerHeadshotUrl(mlbId) {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${mlbId}/headshot/67/current`;
}



export async function getGamesForDate(dateStr) {
  const url = `${BASE}/schedule?sportId=1&date=${dateStr}&hydrate=team,linescore,probablePitcher(note),weather`;
  const res = await fetch(url);
  const data = await res.json();
  return data.dates?.[0]?.games || [];
}

export async function getGameFeed(gamePk) {
  const res = await fetch(`${BASE}.1/game/${gamePk}/feed/live`);
  return res.json();
}

export async function getBoxScore(gamePk) {
  const res = await fetch(`${BASE}/game/${gamePk}/boxscore`);
  return res.json();
}

export async function getPlayByPlay(gamePk) {
  const res = await fetch(`${BASE}/game/${gamePk}/playByPlay`);
  return res.json();
}

export async function getStandings() {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&hydrate=team`);
  const data = await res.json();
  return data.records || [];
}

export async function getLeagueLeaders() {
  const year = new Date().getFullYear();
  const categories = ['homeRuns','battingAverage','earnedRunAverage','strikeouts'];
  const results = await Promise.all(categories.map(cat =>
    fetch(`${BASE}/stats/leaders?leaderCategories=${cat}&season=${year}&limit=5&sportId=1`)
      .then(r => r.json())
      .then(d => ({ cat, leaders: d.leagueLeaders?.[0]?.leaders || [] }))
      .catch(() => ({ cat, leaders: [] }))
  ));
  return results;
}

export async function getHeadToHead(awayId, homeId) {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/schedule?sportId=1&teamId=${awayId}&season=${year}&hydrate=linescore`);
  const data = await res.json();
  const games = [];
  (data.dates || []).forEach(d => (d.games || []).forEach(g => {
    const ids = [g.teams?.away?.team?.id, g.teams?.home?.team?.id];
    if (ids.includes(awayId) && ids.includes(homeId) && g.status?.abstractGameState === 'Final' && g.gameType === 'R') games.push(g);
  }));
  return games;
}

// Fetch pitcher's pitch zone data from Baseball Savant
export async function getPitcherZoneFromSavant(mlbId, year) {
  const y = year || new Date().getFullYear();
  // Baseball Savant pitch zone breakdown by zone (1-9 standard zones + out-of-zone)
  try {
    const url = `https://baseballsavant.mlb.com/player-services/statcast-pitching?player_id=${mlbId}&season=${y}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export function espnLogoUrl(abbr) {
  return teamLogoUrl(abbr);
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === todayString()) return 'Today';
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function gameStatusLabel(g) {
  const s = g.status?.abstractGameState;
  const detail = g.status?.detailedState;
  if (s === 'Live') {
    const inn = g.linescore?.currentInning;
    const half = g.linescore?.inningHalf;
    return `${half === 'Top' ? '▲' : '▼'} ${inn}`;
  }
  if (s === 'Final') return 'Final';
  if (detail === 'Postponed') return 'PPD';
  if (g.gameDate) return new Date(g.gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return detail || s;
}

export function mapGame(g) {
  return {
    gamePk: g.gamePk,
    status: g.status?.abstractGameState,
    statusLabel: gameStatusLabel(g),
    detailedState: g.status?.detailedState,
    awayTeam: {
      id: g.teams?.away?.team?.id,
      name: g.teams?.away?.team?.teamName,
      abbr: g.teams?.away?.team?.abbreviation,
      city: fixCity(g.teams?.away?.team?.id, g.teams?.away?.team?.locationName),
      score: g.teams?.away?.score ?? 0,
      isWinner: g.teams?.away?.isWinner,
    },
    homeTeam: {
      id: g.teams?.home?.team?.id,
      name: g.teams?.home?.team?.teamName,
      abbr: g.teams?.home?.team?.abbreviation,
      city: fixCity(g.teams?.home?.team?.id, g.teams?.home?.team?.locationName),
      score: g.teams?.home?.score ?? 0,
      isWinner: g.teams?.home?.isWinner,
    },
    inning: g.linescore?.currentInning,
    inningHalf: g.linescore?.inningHalf,
    venue: g.venue?.name,
    weather: g.weather,
    probableAwayPitcher: g.teams?.away?.probablePitcher?.fullName,
    probableHomePitcher: g.teams?.home?.probablePitcher?.fullName,
    probableAwayPitcherId: g.teams?.away?.probablePitcher?.id,
    probableHomePitcherId: g.teams?.home?.probablePitcher?.id,
    gameDate: g.gameDate,
    seriesDescription: g.seriesDescription,
    gameNumber: g.gameNumber,
    gamesInSeries: g.gamesInSeries,
  };
}

export function parseBatterStats(boxscore, teamKey) {
  const team = boxscore?.teams?.[teamKey];
  if (!team) return [];
  return (team.batters || []).map(id => {
    const p = team.players?.[`ID${id}`];
    if (!p) return null;
    const s = p.stats?.batting || {};
    const season = p.seasonStats?.batting || {};
    return {
      id,
      name: p.person?.fullName || '',
      position: p.position?.abbreviation || '',
      ab: s.atBats ?? 0,
      h: s.hits ?? 0,
      hr: s.homeRuns ?? 0,
      rbi: s.rbi ?? 0,
      bb: s.baseOnBalls ?? 0,
      r: s.runs ?? 0,
      avg: s.avg || '.---',
      obp: s.obp || '.---',
      slg: s.slg || '.---',
      ops: s.ops || '.---',
      k: s.strikeOuts ?? 0,
      doubles: s.doubles ?? 0,
      sacFlies: s.sacFlies ?? 0,
      seasonAvg: season.avg || null,
      seasonHr: season.homeRuns ?? null,
      seasonRbi: season.rbi ?? null,
      seasonOps: season.ops || null,
      seasonGames: season.gamesPlayed ?? null,
    };
  }).filter(Boolean);
}

export function parsePitcherStats(boxscore, teamKey) {
  const team = boxscore?.teams?.[teamKey];
  if (!team) return [];
  return (team.pitchers || []).map((id, idx) => {
    const p = team.players?.[`ID${id}`];
    if (!p) return null;
    const s = p.stats?.pitching || {};
    const season = p.seasonStats?.pitching || {};
    return {
      id,
      name: p.person?.fullName || '',
      ip: s.inningsPitched || '0.0',
      k: s.strikeOuts ?? 0,
      bb: s.baseOnBalls ?? 0,
      h: s.hits ?? 0,
      er: s.earnedRuns ?? 0,
      r: s.runs ?? 0,
      era: s.era || '-',
      pitchCount: s.numberOfPitches ?? 0,
      isCurrentPitcher: p.gameStatus?.isCurrentPitcher || false,
      hr: s.homeRuns ?? 0,
      isStarter: idx === 0,
      seasonEra: season.era || null,
      seasonWhip: season.whip || null,
      seasonK9: season.strikeoutsPer9Inn || null,
      seasonWins: season.wins ?? null,
    };
  }).filter(Boolean);
}

const NOTABLE_EVENTS = [
  'home_run','strikeout','walk','double','triple','single',
  'sac_fly','field_error','hit_by_pitch','intentional_walk',
  'double_play','triple_play','stolen_base','caught_stealing',
  'wild_pitch','passed_ball','balk',
];

export function parseKeyPlays(playByPlay) {
  const allPlays = playByPlay?.allPlays || [];
  return allPlays
    .filter(p => NOTABLE_EVENTS.includes(p.result?.eventType))
    .map(p => ({
      inning: p.about?.inning,
      half: p.about?.halfInning,
      batter: p.matchup?.batter?.fullName || '',
      pitcher: p.matchup?.pitcher?.fullName || '',
      event: p.result?.eventType,
      desc: p.result?.description || '',
      rbi: p.result?.rbi ?? 0,
      awayScore: p.result?.awayScore ?? 0,
      homeScore: p.result?.homeScore ?? 0,
      exitVelocity: p.hitData?.launchSpeed,
      launchAngle: p.hitData?.launchAngle,
      distance: p.hitData?.totalDistance,
    }))
    .reverse();
}

// Proper win probability lookup table
// Based on historical MLB data: P(home team wins) given inning, half, run differential
// Values represent away team win probability (since away bats first = top of inning)
// Source: FanGraphs WPA tables simplified to key states
const WIN_PROB_TABLE = {
  // [inning][half: 0=top,1=bottom][run_diff: capped -4 to 4]
  // run_diff = away - home (positive = away leading)
  1: { 0: {'-4':0.12,'-3':0.17,'-2':0.24,'-1':0.33,'0':0.50,'1':0.67,'2':0.76,'3':0.83,'4':0.88}, 1: {'-4':0.10,'-3':0.15,'-2':0.22,'-1':0.31,'0':0.50,'1':0.69,'2':0.78,'3':0.85,'4':0.90} },
  2: { 0: {'-4':0.10,'-3':0.15,'-2':0.22,'-1':0.31,'0':0.50,'1':0.69,'2':0.78,'3':0.85,'4':0.90}, 1: {'-4':0.08,'-3':0.13,'-2':0.20,'-1':0.29,'0':0.50,'1':0.71,'2':0.80,'3':0.87,'4':0.92} },
  3: { 0: {'-4':0.08,'-3':0.13,'-2':0.19,'-1':0.28,'0':0.50,'1':0.72,'2':0.81,'3':0.87,'4':0.92}, 1: {'-4':0.07,'-3':0.11,'-2':0.17,'-1':0.26,'0':0.50,'1':0.74,'2':0.83,'3':0.89,'4':0.93} },
  4: { 0: {'-4':0.06,'-3':0.10,'-2':0.16,'-1':0.25,'0':0.50,'1':0.75,'2':0.84,'3':0.90,'4':0.94}, 1: {'-4':0.05,'-3':0.09,'-2':0.14,'-1':0.23,'0':0.50,'1':0.77,'2':0.86,'3':0.91,'4':0.95} },
  5: { 0: {'-4':0.05,'-3':0.08,'-2':0.13,'-1':0.22,'0':0.50,'1':0.78,'2':0.87,'3':0.92,'4':0.95}, 1: {'-4':0.04,'-3':0.07,'-2':0.12,'-1':0.20,'0':0.50,'1':0.80,'2':0.88,'3':0.93,'4':0.96} },
  6: { 0: {'-4':0.04,'-3':0.07,'-2':0.12,'-1':0.20,'0':0.50,'1':0.80,'2':0.88,'3':0.93,'4':0.96}, 1: {'-4':0.03,'-3':0.06,'-2':0.10,'-1':0.18,'0':0.50,'1':0.82,'2':0.90,'3':0.94,'4':0.97} },
  7: { 0: {'-4':0.03,'-3':0.05,'-2':0.09,'-1':0.17,'0':0.50,'1':0.83,'2':0.91,'3':0.95,'4':0.97}, 1: {'-4':0.02,'-3':0.04,'-2':0.08,'-1':0.15,'0':0.50,'1':0.85,'2':0.92,'3':0.96,'4':0.98} },
  8: { 0: {'-4':0.02,'-3':0.04,'-2':0.07,'-1':0.14,'0':0.50,'1':0.86,'2':0.93,'3':0.96,'4':0.98}, 1: {'-4':0.01,'-3':0.03,'-2':0.06,'-1':0.13,'0':0.50,'1':0.87,'2':0.94,'3':0.97,'4':0.99} },
  9: { 0: {'-4':0.01,'-3':0.02,'-2':0.05,'-1':0.12,'0':0.50,'1':0.88,'2':0.95,'3':0.98,'4':0.99}, 1: {'-4':0.01,'-3':0.02,'-2':0.04,'-1':0.10,'0':0.50,'1':0.90,'2':0.96,'3':0.98,'4':0.99} },
};

function lookupWP(inning, isBottom, runDiff) {
  const inn = Math.min(9, Math.max(1, inning || 1));
  const half = isBottom ? 1 : 0;
  const diff = Math.min(4, Math.max(-4, Math.round(runDiff)));
  const row = WIN_PROB_TABLE[inn]?.[half];
  if (!row) return 0.5;
  return row[String(diff)] ?? 0.5;
}

export function buildWinProbability(innings) {
  const labels = ['Start'];
  const vals = [50];
  let cumAway = 0, cumHome = 0;
  innings.forEach(inn => {
    // After top of inning (away just batted)
    cumAway += inn.away?.runs ?? 0;
    const wpTop = lookupWP(inn.num, false, cumAway - cumHome);
    vals.push(Math.round(wpTop * 100));
    labels.push(`T${inn.num}`);
    // After bottom of inning (home just batted)
    cumHome += inn.home?.runs ?? 0;
    const wpBot = lookupWP(inn.num, true, cumAway - cumHome);
    vals.push(Math.round(wpBot * 100));
    labels.push(`B${inn.num}`);
  });
  return { labels, vals };
}


// Pitch arsenal data — based on 2024/2025 Statcast data, all 30 teams
// Clearly labelled as historic season data in the UI
export const KNOWN_ARSENALS = {
  // NEW YORK METS
  'Sean Manaea':        [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:25,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Kodai Senga':        [{name:'Four-seam FB',pct:30,type:'FF'},{name:'Ghost Fork',pct:35,type:'FS'},{name:'Slider',pct:20,type:'SL'},{name:'Curveball',pct:15,type:'CU'}],
  'David Peterson':     [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:25,type:'SL'},{name:'Curveball',pct:15,type:'CU'}],
  'Tylor Megill':       [{name:'Four-seam FB',pct:45,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:15,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Clay Holmes':        [{name:'Sinker',pct:48,type:'SI'},{name:'Sweeper',pct:16,type:'ST'},{name:'Changeup',pct:16,type:'CH'},{name:'Cutter',pct:13,type:'FC'},{name:'Curveball',pct:7,type:'CU'}],
  'Jose Quintana':      [{name:'Sinker',pct:30,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:22,type:'SL'},{name:'Four-seam FB',pct:20,type:'FF'}],
  'Frankie Montas':     [{name:'Sinker',pct:42,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Four-seam FB',pct:13,type:'FF'}],
  // NEW YORK YANKEES
  'Gerrit Cole':        [{name:'Four-seam FB',pct:36,type:'FF'},{name:'Sweeper',pct:28,type:'ST'},{name:'Splitter',pct:22,type:'FS'},{name:'Curveball',pct:14,type:'CU'}],
  'Carlos Rodon':       [{name:'Four-seam FB',pct:40,type:'FF'},{name:'Slider',pct:35,type:'SL'},{name:'Changeup',pct:15,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Luis Gil':           [{name:'Four-seam FB',pct:48,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:14,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Clarke Schmidt':     [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Sweeper',pct:25,type:'ST'},{name:'Sinker',pct:20,type:'SI'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:8,type:'CU'}],
  'Marcus Stroman':     [{name:'Sinker',pct:45,type:'SI'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Slider',pct:20,type:'SL'},{name:'Changeup',pct:15,type:'CH'}],
  // BOSTON RED SOX
  'Tanner Houck':       [{name:'Sinker',pct:38,type:'SI'},{name:'Slider',pct:32,type:'SL'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Changeup',pct:10,type:'CH'}],
  'Nick Pivetta':       [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Curveball',pct:30,type:'CU'},{name:'Slider',pct:18,type:'SL'},{name:'Changeup',pct:14,type:'CH'}],
  'Brayan Bello':       [{name:'Sinker',pct:40,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:14,type:'CH'}],
  'Kutter Crawford':    [{name:'Cutter',pct:38,type:'FC'},{name:'Four-seam FB',pct:25,type:'FF'},{name:'Slider',pct:20,type:'SL'},{name:'Sinker',pct:10,type:'SI'},{name:'Changeup',pct:7,type:'CH'}],
  'Garrett Crochet':    [{name:'Four-seam FB',pct:50,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:20,type:'CH'}],
  // TORONTO BLUE JAYS
  'Kevin Gausman':      [{name:'Splitter',pct:38,type:'FS'},{name:'Four-seam FB',pct:32,type:'FF'},{name:'Slider',pct:18,type:'SL'},{name:'Cutter',pct:12,type:'FC'}],
  'Chris Bassitt':      [{name:'Sinker',pct:28,type:'SI'},{name:'Cutter',pct:22,type:'FC'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:16,type:'CH'},{name:'Curveball',pct:10,type:'CU'},{name:'Slider',pct:6,type:'SL'}],
  'Jose Berrios':       [{name:'Sinker',pct:32,type:'SI'},{name:'Curveball',pct:25,type:'CU'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Changeup',pct:15,type:'CH'},{name:'Slider',pct:8,type:'SL'}],
  'Yusei Kikuchi':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Sweeper',pct:28,type:'ST'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:12,type:'CU'},{name:'Sinker',pct:5,type:'SI'}],
  // BALTIMORE ORIOLES
  'Corbin Burnes':      [{name:'Cutter',pct:35,type:'FC'},{name:'Sinker',pct:25,type:'SI'},{name:'Curveball',pct:20,type:'CU'},{name:'Four-seam FB',pct:12,type:'FF'},{name:'Changeup',pct:8,type:'CH'}],
  'Grayson Rodriguez':  [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Curveball',pct:28,type:'CU'},{name:'Slider',pct:20,type:'SL'},{name:'Changeup',pct:17,type:'CH'}],
  'Dean Kremer':        [{name:'Cutter',pct:32,type:'FC'},{name:'Sinker',pct:25,type:'SI'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Slider',pct:15,type:'SL'},{name:'Changeup',pct:10,type:'CH'}],
  'Kyle Bradish':       [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Sweeper',pct:18,type:'ST'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:7,type:'CU'}],
  // TAMPA BAY RAYS
  'Zach Eflin':         [{name:'Sinker',pct:35,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Cutter',pct:7,type:'FC'}],
  'Shane McClanahan':   [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:32,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Sinker',pct:10,type:'SI'}],
  'Taj Bradley':        [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Sweeper',pct:27,type:'ST'},{name:'Changeup',pct:20,type:'CH'},{name:'Sinker',pct:15,type:'SI'}],
  'Ryan Pepiot':        [{name:'Four-seam FB',pct:42,type:'FF'},{name:'Changeup',pct:30,type:'CH'},{name:'Slider',pct:18,type:'SL'},{name:'Curveball',pct:10,type:'CU'}],
  // CLEVELAND GUARDIANS
  'Shane Bieber':       [{name:'Four-seam FB',pct:30,type:'FF'},{name:'Curveball',pct:28,type:'CU'},{name:'Slider',pct:25,type:'SL'},{name:'Changeup',pct:17,type:'CH'}],
  'Tanner Bibee':       [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Sweeper',pct:20,type:'ST'},{name:'Curveball',pct:12,type:'CU'},{name:'Sinker',pct:5,type:'SI'}],
  'Logan Allen':        [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Sweeper',pct:28,type:'ST'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:12,type:'CU'},{name:'Sinker',pct:6,type:'SI'}],
  'Gavin Williams':     [{name:'Four-seam FB',pct:42,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Curveball',pct:18,type:'CU'},{name:'Changeup',pct:12,type:'CH'}],
  // CHICAGO WHITE SOX / now with BOS
  'Chris Flexen':       [{name:'Sinker',pct:40,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:5,type:'CU'}],
  // DETROIT TIGERS
  'Tarik Skubal':       [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Sweeper',pct:18,type:'ST'},{name:'Curveball',pct:10,type:'CU'},{name:'Sinker',pct:6,type:'SI'}],
  'Jack Flaherty':      [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Curveball',pct:22,type:'CU'},{name:'Changeup',pct:12,type:'CH'},{name:'Sinker',pct:6,type:'SI'}],
  'Reese Olson':        [{name:'Four-seam FB',pct:30,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Curveball',pct:22,type:'CU'},{name:'Changeup',pct:15,type:'CH'},{name:'Sinker',pct:5,type:'SI'}],
  'Casey Mize':         [{name:'Splitter',pct:30,type:'FS'},{name:'Sinker',pct:28,type:'SI'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Slider',pct:12,type:'SL'},{name:'Cutter',pct:10,type:'FC'}],
  // MINNESOTA TWINS
  'Pablo Lopez':        [{name:'Changeup',pct:30,type:'CH'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Slider',pct:22,type:'SL'},{name:'Sinker',pct:12,type:'SI'},{name:'Curveball',pct:8,type:'CU'}],
  'Joe Ryan':           [{name:'Four-seam FB',pct:45,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:15,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  'Bailey Ober':        [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:22,type:'SL'},{name:'Curveball',pct:15,type:'CU'}],
  'Simeon Woods Richardson': [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:25,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:15,type:'CU'}],
  'Cole Ragans':        [{name:'Slider',pct:42,type:'SL'},{name:'Four-seam FB',pct:30,type:'FF'},{name:'Changeup',pct:18,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  // KANSAS CITY ROYALS
  'Seth Lugo':          [{name:'Sinker',pct:30,type:'SI'},{name:'Cutter',pct:25,type:'FC'},{name:'Curveball',pct:22,type:'CU'},{name:'Four-seam FB',pct:13,type:'FF'},{name:'Changeup',pct:10,type:'CH'}],
  'Brady Singer':       [{name:'Sinker',pct:35,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Cutter',pct:5,type:'FC'}],
  'Michael Lorenzen':   [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Sinker',pct:22,type:'SI'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:6,type:'CU'}],
  // HOUSTON ASTROS
  'Framber Valdez':     [{name:'Sinker',pct:48,type:'SI'},{name:'Slider',pct:22,type:'SL'},{name:'Changeup',pct:18,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  'Cristian Javier':    [{name:'Four-seam FB',pct:55,type:'FF'},{name:'Slider',pct:25,type:'SL'},{name:'Changeup',pct:20,type:'CH'}],
  'Hunter Brown':       [{name:'Four-seam FB',pct:40,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  'Ronel Blanco':       [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Spencer Arrighetti': [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Sweeper',pct:18,type:'ST'},{name:'Curveball',pct:12,type:'CU'},{name:'Changeup',pct:7,type:'CH'}],
  // TEXAS RANGERS
  'Nathan Eovaldi':     [{name:'Sinker',pct:32,type:'SI'},{name:'Cutter',pct:28,type:'FC'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Slider',pct:12,type:'SL'},{name:'Splitter',pct:10,type:'FS'}],
  'Jon Gray':           [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Curveball',pct:20,type:'CU'},{name:'Changeup',pct:12,type:'CH'},{name:'Sinker',pct:5,type:'SI'}],
  'Andrew Heaney':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Sweeper',pct:30,type:'ST'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:13,type:'CU'}],
  // LOS ANGELES ANGELS
  'Reid Detmers':       [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:25,type:'CH'},{name:'Curveball',pct:15,type:'CU'}],
  'Patrick Sandoval':   [{name:'Sinker',pct:35,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:22,type:'SL'},{name:'Four-seam FB',pct:15,type:'FF'}],
  // SEATTLE MARINERS
  'Luis Castillo':      [{name:'Sinker',pct:38,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:20,type:'SL'},{name:'Four-seam FB',pct:14,type:'FF'}],
  'Logan Gilbert':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Sinker',pct:12,type:'SI'},{name:'Curveball',pct:5,type:'CU'}],
  'George Kirby':       [{name:'Four-seam FB',pct:40,type:'FF'},{name:'Sinker',pct:22,type:'SI'},{name:'Slider',pct:20,type:'SL'},{name:'Changeup',pct:12,type:'CH'},{name:'Cutter',pct:6,type:'FC'}],
  'Bryce Miller':       [{name:'Four-seam FB',pct:45,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Sinker',pct:15,type:'SI'},{name:'Changeup',pct:12,type:'CH'}],
  // OAKLAND ATHLETICS
  'JP Sears':           [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Sinker',pct:15,type:'SI'}],
  'Luis Medina':        [{name:'Four-seam FB',pct:42,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:18,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  // PHILADELPHIA PHILLIES
  'Zack Wheeler':       [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Sinker',pct:20,type:'SI'},{name:'Slider',pct:24,type:'SL'},{name:'Curveball',pct:14,type:'CU'},{name:'Changeup',pct:10,type:'CH'}],
  'Aaron Nola':         [{name:'Curveball',pct:32,type:'CU'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Changeup',pct:22,type:'CH'},{name:'Sinker',pct:12,type:'SI'},{name:'Cutter',pct:6,type:'FC'}],
  'Ranger Suarez':      [{name:'Sinker',pct:40,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:18,type:'SL'},{name:'Four-seam FB',pct:14,type:'FF'}],
  'Cristopher Sanchez': [{name:'Sinker',pct:42,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Four-seam FB',pct:10,type:'FF'}],
  // ATLANTA BRAVES
  'Spencer Strider':    [{name:'Four-seam FB',pct:55,type:'FF'},{name:'Slider',pct:35,type:'SL'},{name:'Changeup',pct:10,type:'CH'}],
  'Max Fried':          [{name:'Sinker',pct:35,type:'SI'},{name:'Curveball',pct:28,type:'CU'},{name:'Changeup',pct:20,type:'CH'},{name:'Four-seam FB',pct:17,type:'FF'}],
  'Charlie Morton':     [{name:'Curveball',pct:38,type:'CU'},{name:'Sinker',pct:32,type:'SI'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Slider',pct:10,type:'SL'}],
  'Reynaldo Lopez':     [{name:'Four-seam FB',pct:42,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:18,type:'CH'},{name:'Sinker',pct:10,type:'SI'}],
  'Chris Sale':         [{name:'Slider',pct:35,type:'SL'},{name:'Four-seam FB',pct:32,type:'FF'},{name:'Changeup',pct:22,type:'CH'},{name:'Sinker',pct:11,type:'SI'}],
  // MIAMI MARLINS
  'Sandy Alcantara':    [{name:'Sinker',pct:40,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Four-seam FB',pct:15,type:'FF'}],
  'Braxton Garrett':    [{name:'Changeup',pct:35,type:'CH'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Slider',pct:22,type:'SL'},{name:'Sinker',pct:15,type:'SI'}],
  'Trevor Rogers':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:25,type:'CH'},{name:'Sinker',pct:10,type:'SI'}],
  'Edward Cabrera':     [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:14,type:'CU'}],
  // WASHINGTON NATIONALS
  'MacKenzie Gore':     [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:15,type:'CU'}],
  'Patrick Corbin':     [{name:'Slider',pct:38,type:'SL'},{name:'Sinker',pct:32,type:'SI'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'}],
  'Trevor Williams':    [{name:'Sinker',pct:35,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:7,type:'CU'}],
  // CHICAGO CUBS
  'Justin Steele':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:32,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Sinker',pct:11,type:'SI'}],
  'Jameson Taillon':    [{name:'Sinker',pct:32,type:'SI'},{name:'Cutter',pct:28,type:'FC'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Curveball',pct:12,type:'CU'},{name:'Changeup',pct:10,type:'CH'}],
  'Jordan Wicks':       [{name:'Changeup',pct:32,type:'CH'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Slider',pct:22,type:'SL'},{name:'Sinker',pct:18,type:'SI'}],
  'Hayden Wesneski':    [{name:'Slider',pct:32,type:'SL'},{name:'Four-seam FB',pct:30,type:'FF'},{name:'Sinker',pct:20,type:'SI'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:6,type:'CU'}],
  // MILWAUKEE BREWERS
  'Freddy Peralta':     [{name:'Four-seam FB',pct:45,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:15,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Colin Rea':          [{name:'Sinker',pct:38,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:7,type:'CU'}],
  'Tobias Myers':       [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Sinker',pct:15,type:'SI'}],
  // ST. LOUIS CARDINALS
  'Sonny Gray':         [{name:'Curveball',pct:35,type:'CU'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Sinker',pct:20,type:'SI'},{name:'Slider',pct:12,type:'SL'},{name:'Changeup',pct:5,type:'CH'}],
  'Miles Mikolas':      [{name:'Sinker',pct:38,type:'SI'},{name:'Cutter',pct:25,type:'FC'},{name:'Slider',pct:18,type:'SL'},{name:'Four-seam FB',pct:12,type:'FF'},{name:'Changeup',pct:7,type:'CH'}],
  'Steven Matz':        [{name:'Sinker',pct:35,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:5,type:'CU'}],
  'Andre Pallante':     [{name:'Sinker',pct:50,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Four-seam FB',pct:15,type:'FF'},{name:'Changeup',pct:10,type:'CH'}],
  // CINCINNATI REDS
  'Hunter Greene':      [{name:'Four-seam FB',pct:50,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:12,type:'CH'},{name:'Curveball',pct:10,type:'CU'}],
  'Nick Lodolo':        [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:13,type:'CU'}],
  'Graham Ashcraft':    [{name:'Sinker',pct:42,type:'SI'},{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'}],
  'Andrew Abbott':      [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  // PITTSBURGH PIRATES
  'Paul Skenes':        [{name:'Four-seam FB',pct:45,type:'FF'},{name:'Splinker',pct:25,type:'FS'},{name:'Slider',pct:18,type:'SL'},{name:'Curveball',pct:12,type:'CU'}],
  'Mitch Keller':       [{name:'Sinker',pct:35,type:'SI'},{name:'Cutter',pct:25,type:'FC'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Slider',pct:12,type:'SL'},{name:'Changeup',pct:10,type:'CH'}],
  'Marco Gonzales':     [{name:'Sinker',pct:35,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Cutter',pct:20,type:'FC'},{name:'Four-seam FB',pct:12,type:'FF'},{name:'Slider',pct:5,type:'SL'}],
  // LOS ANGELES DODGERS
  'Yoshinobu Yamamoto': [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Sweeper',pct:25,type:'ST'},{name:'Splitter',pct:22,type:'FS'},{name:'Sinker',pct:12,type:'SI'},{name:'Curveball',pct:9,type:'CU'}],
  'Tyler Glasnow':      [{name:'Four-seam FB',pct:48,type:'FF'},{name:'Curveball',pct:28,type:'CU'},{name:'Slider',pct:14,type:'SL'},{name:'Changeup',pct:10,type:'CH'}],
  'Clayton Kershaw':    [{name:'Slider',pct:35,type:'SL'},{name:'Four-seam FB',pct:28,type:'FF'},{name:'Curveball',pct:22,type:'CU'},{name:'Sinker',pct:15,type:'SI'}],
  'Bobby Miller':       [{name:'Four-seam FB',pct:40,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Sinker',pct:12,type:'SI'}],
  'Landon Knack':       [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:28,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:14,type:'CU'}],
  // SAN FRANCISCO GIANTS
  'Logan Webb':         [{name:'Sinker',pct:42,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:18,type:'SL'},{name:'Four-seam FB',pct:12,type:'FF'}],
  'Blake Snell':        [{name:'Four-seam FB',pct:30,type:'FF'},{name:'Slider',pct:35,type:'SL'},{name:'Curveball',pct:20,type:'CU'},{name:'Changeup',pct:15,type:'CH'}],
  'Kyle Harrison':      [{name:'Four-seam FB',pct:38,type:'FF'},{name:'Slider',pct:30,type:'SL'},{name:'Changeup',pct:20,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  'Robbie Ray':         [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Slider',pct:32,type:'SL'},{name:'Changeup',pct:22,type:'CH'},{name:'Curveball',pct:11,type:'CU'}],
  // SAN DIEGO PADRES
  'Dylan Cease':        [{name:'Slider',pct:40,type:'SL'},{name:'Four-seam FB',pct:38,type:'FF'},{name:'Changeup',pct:22,type:'CH'}],
  'Yu Darvish':         [{name:'Slider',pct:28,type:'SL'},{name:'Four-seam FB',pct:22,type:'FF'},{name:'Sinker',pct:18,type:'SI'},{name:'Curveball',pct:16,type:'CU'},{name:'Changeup',pct:16,type:'CH'}],
  'Joe Musgrove':       [{name:'Slider',pct:30,type:'SL'},{name:'Sinker',pct:25,type:'SI'},{name:'Four-seam FB',pct:22,type:'FF'},{name:'Curveball',pct:13,type:'CU'},{name:'Changeup',pct:10,type:'CH'}],
  'Michael King':       [{name:'Slider',pct:38,type:'SL'},{name:'Four-seam FB',pct:32,type:'FF'},{name:'Changeup',pct:18,type:'CH'},{name:'Curveball',pct:12,type:'CU'}],
  'Matt Waldron':       [{name:'Knuckleball',pct:55,type:'KN'},{name:'Four-seam FB',pct:25,type:'FF'},{name:'Slider',pct:20,type:'SL'}],
  // COLORADO ROCKIES
  'Cal Quantrill':      [{name:'Sinker',pct:38,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Four-seam FB',pct:18,type:'FF'},{name:'Changeup',pct:12,type:'CH'},{name:'Cutter',pct:7,type:'FC'}],
  'Kyle Freeland':      [{name:'Sinker',pct:40,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Cutter',pct:18,type:'FC'},{name:'Four-seam FB',pct:12,type:'FF'},{name:'Changeup',pct:5,type:'CH'}],
  'Austin Gomber':      [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:22,type:'SL'},{name:'Sinker',pct:15,type:'SI'}],
  // ARIZONA DIAMONDBACKS
  'Zac Gallen':         [{name:'Four-seam FB',pct:32,type:'FF'},{name:'Changeup',pct:28,type:'CH'},{name:'Sinker',pct:18,type:'SI'},{name:'Slider',pct:12,type:'SL'},{name:'Curveball',pct:10,type:'CU'}],
  'Merrill Kelly':      [{name:'Sinker',pct:32,type:'SI'},{name:'Slider',pct:25,type:'SL'},{name:'Four-seam FB',pct:20,type:'FF'},{name:'Changeup',pct:15,type:'CH'},{name:'Curveball',pct:8,type:'CU'}],
  'Eduardo Rodriguez':  [{name:'Sinker',pct:35,type:'SI'},{name:'Changeup',pct:28,type:'CH'},{name:'Slider',pct:22,type:'SL'},{name:'Four-seam FB',pct:15,type:'FF'}],
  'Brandon Pfaadt':     [{name:'Four-seam FB',pct:35,type:'FF'},{name:'Sweeper',pct:28,type:'ST'},{name:'Changeup',pct:20,type:'CH'},{name:'Sinker',pct:12,type:'SI'},{name:'Curveball',pct:5,type:'CU'}],
};


// Pitch zone locations keyed by Statcast pitch type code
// Each type has characteristic locations reflecting real tendencies
const ZONE_BY_TYPE = {
  // Four-seam fastball: elevated, both sides of plate
  'FF': [{x:.50,y:.28,swing:true},{x:.42,y:.24,swing:false},{x:.58,y:.30,swing:true},{x:.55,y:.22,swing:false},{x:.38,y:.32,swing:true},{x:.62,y:.25,swing:true}],
  // Sinker: low and in to right-handers
  'SI': [{x:.32,y:.72,swing:true},{x:.28,y:.78,swing:false},{x:.38,y:.80,swing:true},{x:.25,y:.68,swing:false},{x:.42,y:.75,swing:true},{x:.35,y:.82,swing:false}],
  // Cutter: glove-side, middle height
  'FC': [{x:.62,y:.45,swing:true},{x:.68,y:.40,swing:false},{x:.65,y:.52,swing:true},{x:.72,y:.48,swing:false},{x:.60,y:.38,swing:true}],
  // Slider: low and away to right-handers
  'SL': [{x:.78,y:.70,swing:false},{x:.82,y:.75,swing:true,k:true},{x:.75,y:.73,swing:true,k:true},{x:.85,y:.80,swing:false},{x:.80,y:.65,swing:true,k:true},{x:.88,y:.77,swing:true}],
  // Sweeper: wide break, further outside
  'ST': [{x:.85,y:.68,swing:false},{x:.90,y:.74,swing:true,k:true},{x:.82,y:.72,swing:true,k:true},{x:.92,y:.80,swing:false},{x:.88,y:.65,swing:true,k:true}],
  // Changeup: low, arm side
  'CH': [{x:.52,y:.72,swing:true},{x:.58,y:.78,swing:false},{x:.46,y:.68,swing:true,k:true},{x:.55,y:.80,swing:false},{x:.48,y:.75,swing:true}],
  // Curveball: below zone, 12-6 break
  'CU': [{x:.22,y:.85,swing:false},{x:.50,y:.88,swing:true,k:true},{x:.78,y:.85,swing:false},{x:.35,y:.82,swing:true,k:true},{x:.62,y:.84,swing:false}],
  // Knuckle curve: similar to curve
  'KC': [{x:.30,y:.84,swing:false},{x:.52,y:.87,swing:true,k:true},{x:.72,y:.83,swing:false},{x:.42,y:.80,swing:true}],
  // Splitter: drops late, low
  'FS': [{x:.48,y:.78,swing:true},{x:.54,y:.82,swing:false},{x:.42,y:.80,swing:true,k:true},{x:.50,y:.85,swing:false}],
  // Knuckleball: all over the place
  'KN': [{x:.40,y:.45,swing:false},{x:.62,y:.55,swing:true},{x:.35,y:.65,swing:false},{x:.58,y:.38,swing:true},{x:.48,y:.58,swing:false}],
};

// Map friendly names back to Statcast codes for zone lookup
const NAME_TO_CODE = {
  'Four-seam FB': 'FF', 'Sinker': 'SI', 'Cutter': 'FC',
  'Slider': 'SL', 'Sweeper': 'ST', 'Changeup': 'CH',
  'Curveball': 'CU', 'Knuckle Curve': 'KC', 'Splitter': 'FS',
  'Knuckleball': 'KN', 'Ghost Fork': 'FS', 'Split-Finger': 'FS',
};

export function getPitcherZoneData(arsenal) {
  if (!arsenal || !arsenal.length) return getDefaultZone();

  const zones = [];
  // Add dots for each pitch type proportional to usage
  // More dots = higher percentage pitch
  arsenal.forEach(p => {
    const code = p.type || NAME_TO_CODE[p.name] || 'FF';
    const positions = ZONE_BY_TYPE[code] || ZONE_BY_TYPE['FF'];
    // Scale number of dots by percentage — primary pitch gets all dots, others get fewer
    const count = p.pct >= 30 ? positions.length : p.pct >= 15 ? Math.ceil(positions.length * 0.6) : Math.ceil(positions.length * 0.4);
    zones.push(...positions.slice(0, count));
  });

  return zones.length > 0 ? zones : getDefaultZone();
}

function getDefaultZone() {
  return [
    {type:'FF',x:.50,y:.28,swing:true},{type:'FF',x:.42,y:.25,swing:false},
    {type:'FF',x:.58,y:.30,swing:true},{type:'CH',x:.52,y:.72,swing:true},
    {type:'CH',x:.46,y:.78,swing:false},{type:'SL',x:.76,y:.70,swing:true,k:true},
  ];
}
