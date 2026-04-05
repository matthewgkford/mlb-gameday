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
    if (ids.includes(awayId) && ids.includes(homeId) && g.status?.abstractGameState === 'Final') games.push(g);
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

// Pitch arsenal - season data, clearly labelled
export const KNOWN_ARSENALS = {
  'Taj Bradley':      [{name:'Four-seam FB',pct:38,type:'4seam'},{name:'Sweeper',pct:27,type:'sweep'},{name:'Changeup',pct:20,type:'change'},{name:'Sinker',pct:15,type:'sink'}],
  'Cole Ragans':      [{name:'Slider',pct:42,type:'slider'},{name:'Four-seam FB',pct:30,type:'4seam'},{name:'Changeup',pct:18,type:'change'},{name:'Curveball',pct:10,type:'curve'}],
  'Gerrit Cole':      [{name:'Four-seam FB',pct:36,type:'4seam'},{name:'Sweeper',pct:28,type:'sweep'},{name:'Splitter',pct:22,type:'change'},{name:'Curveball',pct:14,type:'curve'}],
  'Spencer Strider':  [{name:'Four-seam FB',pct:55,type:'4seam'},{name:'Slider',pct:35,type:'slider'},{name:'Changeup',pct:10,type:'change'}],
  'Zack Wheeler':     [{name:'Four-seam FB',pct:32,type:'4seam'},{name:'Sinker',pct:20,type:'sink'},{name:'Slider',pct:24,type:'slider'},{name:'Curveball',pct:14,type:'curve'},{name:'Changeup',pct:10,type:'change'}],
  'Luis Castillo':    [{name:'Sinker',pct:38,type:'sink'},{name:'Changeup',pct:28,type:'change'},{name:'Slider',pct:20,type:'slider'},{name:'Four-seam FB',pct:14,type:'4seam'}],
  'Sean Manaea':      [{name:'Four-seam FB',pct:35,type:'4seam'},{name:'Slider',pct:30,type:'slider'},{name:'Changeup',pct:25,type:'change'},{name:'Curveball',pct:10,type:'curve'}],
  'Kodai Senga':      [{name:'Four-seam FB',pct:30,type:'4seam'},{name:'Ghost Fork',pct:35,type:'change'},{name:'Slider',pct:20,type:'slider'},{name:'Curveball',pct:15,type:'curve'}],
  'Sandy Alcantara':  [{name:'Sinker',pct:40,type:'sink'},{name:'Slider',pct:25,type:'slider'},{name:'Changeup',pct:20,type:'change'},{name:'Four-seam FB',pct:15,type:'4seam'}],
  'Logan Webb':       [{name:'Sinker',pct:42,type:'sink'},{name:'Changeup',pct:28,type:'change'},{name:'Slider',pct:18,type:'slider'},{name:'Four-seam FB',pct:12,type:'4seam'}],
  'David Peterson':   [{name:'Four-seam FB',pct:32,type:'4seam'},{name:'Changeup',pct:28,type:'change'},{name:'Slider',pct:25,type:'slider'},{name:'Curveball',pct:15,type:'curve'}],
  'Tylor Megill':     [{name:'Four-seam FB',pct:45,type:'4seam'},{name:'Slider',pct:30,type:'slider'},{name:'Changeup',pct:15,type:'change'},{name:'Curveball',pct:10,type:'curve'}],
  'Marcus Stroman':   [{name:'Sinker',pct:45,type:'sink'},{name:'Four-seam FB',pct:20,type:'4seam'},{name:'Slider',pct:20,type:'slider'},{name:'Changeup',pct:15,type:'change'}],
  'Blake Snell':      [{name:'Four-seam FB',pct:30,type:'4seam'},{name:'Slider',pct:35,type:'slider'},{name:'Curveball',pct:20,type:'curve'},{name:'Changeup',pct:15,type:'change'}],
  'Yu Darvish':       [{name:'Slider',pct:28,type:'slider'},{name:'Four-seam FB',pct:22,type:'4seam'},{name:'Sinker',pct:18,type:'sink'},{name:'Curveball',pct:16,type:'curve'},{name:'Changeup',pct:16,type:'change'}],
  'Dylan Cease':      [{name:'Slider',pct:40,type:'slider'},{name:'Four-seam FB',pct:38,type:'4seam'},{name:'Changeup',pct:22,type:'change'}],
  'Michael King':     [{name:'Slider',pct:38,type:'slider'},{name:'Four-seam FB',pct:32,type:'4seam'},{name:'Changeup',pct:18,type:'change'},{name:'Curveball',pct:12,type:'curve'}],
  'Joe Musgrove':     [{name:'Slider',pct:30,type:'slider'},{name:'Sinker',pct:25,type:'sink'},{name:'Four-seam FB',pct:22,type:'4seam'},{name:'Curveball',pct:13,type:'curve'},{name:'Changeup',pct:10,type:'change'}],
};

// Pitch zone tendency data per pitcher type — unique patterns per pitch profile
export function getPitcherZoneData(arsenal) {
  if (!arsenal || !arsenal.length) return getDefaultZone();
  const primaryPitch = arsenal[0];
  const secondaryPitch = arsenal[1];

  const zones = [];

  // Primary pitch locations
  if (primaryPitch.type === 'slider' || primaryPitch.type === 'sweep') {
    // Slider: low and away to right-handers (high usage cluster bottom right)
    zones.push(
      {type:primaryPitch.type,x:.78,y:.70,swing:false},
      {type:primaryPitch.type,x:.82,y:.75,swing:true,k:true},
      {type:primaryPitch.type,x:.75,y:.73,swing:true,k:true},
      {type:primaryPitch.type,x:.85,y:.80,swing:false},
      {type:primaryPitch.type,x:.80,y:.65,swing:true,k:true},
      {type:primaryPitch.type,x:.88,y:.77,swing:true},
    );
  } else if (primaryPitch.type === '4seam') {
    // Four-seamer: up in the zone
    zones.push(
      {type:'4seam',x:.50,y:.28,swing:true},
      {type:'4seam',x:.42,y:.24,swing:false},
      {type:'4seam',x:.58,y:.30,swing:true},
      {type:'4seam',x:.55,y:.22,swing:false},
      {type:'4seam',x:.38,y:.32,swing:true},
      {type:'4seam',x:.62,y:.25,swing:true},
    );
  } else if (primaryPitch.type === 'sink') {
    // Sinker: down and in to right-handers
    zones.push(
      {type:'sink',x:.32,y:.72,swing:true},
      {type:'sink',x:.28,y:.78,swing:false},
      {type:'sink',x:.38,y:.80,swing:true},
      {type:'sink',x:.25,y:.68,swing:false},
      {type:'sink',x:.42,y:.75,swing:true},
    );
  } else if (primaryPitch.type === 'curve') {
    // Curveball: below zone, both sides
    zones.push(
      {type:'curve',x:.22,y:.85,swing:false},
      {type:'curve',x:.50,y:.88,swing:true,k:true},
      {type:'curve',x:.78,y:.85,swing:false},
      {type:'curve',x:.35,y:.82,swing:true,k:true},
    );
  }

  // Secondary pitch — fewer dots, different location
  if (secondaryPitch) {
    if (secondaryPitch.type === 'change') {
      zones.push(
        {type:'change',x:.52,y:.72,swing:true},
        {type:'change',x:.58,y:.78,swing:false},
        {type:'change',x:.46,y:.68,swing:true,k:true},
      );
    } else if (secondaryPitch.type === '4seam' && primaryPitch.type !== '4seam') {
      zones.push(
        {type:'4seam',x:.48,y:.27,swing:true},
        {type:'4seam',x:.55,y:.24,swing:false},
        {type:'4seam',x:.40,y:.30,swing:true},
      );
    } else if (secondaryPitch.type === 'slider' && primaryPitch.type !== 'slider') {
      zones.push(
        {type:'slider',x:.75,y:.68,swing:true,k:true},
        {type:'slider',x:.82,y:.74,swing:false},
        {type:'slider',x:.79,y:.72,swing:true},
      );
    } else if (secondaryPitch.type === 'curve') {
      zones.push(
        {type:'curve',x:.30,y:.84,swing:false},
        {type:'curve',x:.50,y:.87,swing:true,k:true},
      );
    }
  }

  return zones.length > 0 ? zones : getDefaultZone();
}

function getDefaultZone() {
  return [
    {type:'4seam',x:.50,y:.28,swing:true},{type:'4seam',x:.42,y:.25,swing:false},
    {type:'4seam',x:.58,y:.30,swing:true},{type:'change',x:.52,y:.72,swing:true},
    {type:'change',x:.46,y:.78,swing:false},{type:'slider',x:.76,y:.70,swing:true,k:true},
  ];
}
