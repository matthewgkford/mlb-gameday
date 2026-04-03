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

export async function getPlayerSeasonStats(playerId, group = 'hitting') {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/people/${playerId}/stats?stats=season&season=${year}&group=${group}`);
  const data = await res.json();
  return data.stats?.[0]?.splits?.[0]?.stat || null;
}

export async function getPlayerInfo(playerId) {
  const res = await fetch(`${BASE}/people/${playerId}`);
  const data = await res.json();
  return data.people?.[0] || null;
}

export async function getPitcherSeasonMix(playerId) {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/people/${playerId}/stats?stats=season&season=${year}&group=pitching`);
  const data = await res.json();
  return data.stats?.[0]?.splits?.[0]?.stat || null;
}

export async function getStandings() {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&hydrate=team`);
  const data = await res.json();
  return data.records || [];
}

export async function getLeagueLeaders() {
  const year = new Date().getFullYear();
  const categories = ['homeRuns', 'battingAverage', 'earnedRunAverage', 'strikeouts'];
  const results = await Promise.all(categories.map(cat =>
    fetch(`${BASE}/stats/leaders?leaderCategories=${cat}&season=${year}&limit=5&sportId=1`)
      .then(r => r.json())
      .then(d => ({ cat, leaders: d.leagueLeaders?.[0]?.leaders || [] }))
      .catch(() => ({ cat, leaders: [] }))
  ));
  return results;
}

export async function getTeamRecentGames(teamId) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 14);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = today.toISOString().slice(0, 10);
  const res = await fetch(`${BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${startStr}&endDate=${endStr}&hydrate=linescore`);
  const data = await res.json();
  const games = [];
  (data.dates || []).forEach(d => (d.games || []).forEach(g => games.push(g)));
  return games.filter(g => g.status?.abstractGameState === 'Final').slice(-7);
}

export async function getHeadToHead(awayId, homeId) {
  const year = new Date().getFullYear();
  const res = await fetch(`${BASE}/schedule?sportId=1&teamId=${awayId}&season=${year}&hydrate=linescore`);
  const data = await res.json();
  const games = [];
  (data.dates || []).forEach(d => (d.games || []).forEach(g => {
    const ids = [g.teams?.away?.team?.id, g.teams?.home?.team?.id];
    if (ids.includes(awayId) && ids.includes(homeId) && g.status?.abstractGameState === 'Final') {
      games.push(g);
    }
  }));
  return games;
}

export function espnLogoUrl(abbr) {
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr?.toLowerCase()}.png`;
}

export function espnHeadshotUrl(espnId) {
  return `https://a.espncdn.com/i/headshots/mlb/players/full/${espnId}.png`;
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
  if (g.gameDate) {
    return new Date(g.gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }
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
      startTime: p.about?.startTime,
    }))
    .reverse();
}

export function buildWinProbability(innings) {
  const labels = ['Start'];
  const vals = [50];
  let cumAway = 0, cumHome = 0;
  innings.forEach(inn => {
    cumAway += inn.away?.runs ?? 0;
    vals.push(Math.min(95, Math.max(5, 50 + (cumAway - cumHome) * 9)));
    labels.push(`T${inn.num}`);
    cumHome += inn.home?.runs ?? 0;
    vals.push(Math.min(95, Math.max(5, 50 + (cumAway - cumHome) * 9)));
    labels.push(`B${inn.num}`);
  });
  return { labels, vals };
}

// Pitch arsenal from MLB API pitch type stats — falls back to known hardcoded data
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
  'Max Scherzer':     [{name:'Four-seam FB',pct:32,type:'4seam'},{name:'Slider',pct:28,type:'slider'},{name:'Changeup',pct:22,type:'change'},{name:'Curveball',pct:18,type:'curve'}],
  'Blake Snell':      [{name:'Four-seam FB',pct:30,type:'4seam'},{name:'Slider',pct:35,type:'slider'},{name:'Curveball',pct:20,type:'curve'},{name:'Changeup',pct:15,type:'change'}],
};

// Zone tendency data by pitch style — used for pitch location chart
export const ZONE_TENDENCIES = {
  power_fb:   [{type:'4seam',x:.5,y:.28,swing:true},{type:'4seam',x:.4,y:.25,swing:true},{type:'4seam',x:.6,y:.3,swing:false},{type:'4seam',x:.55,y:.22,swing:true},{type:'4seam',x:.35,y:.2,swing:false},{type:'4seam',x:.65,y:.32,swing:true}],
  slider_heavy:[{type:'slider',x:.78,y:.68,swing:false},{type:'slider',x:.82,y:.74,swing:true,k:true},{type:'slider',x:.75,y:.72,swing:true,k:true},{type:'slider',x:.85,y:.8,swing:false},{type:'slider',x:.8,y:.65,swing:true,k:true},{type:'slider',x:.88,y:.76,swing:true,k:true}],
  sinker_gb:  [{type:'sink',x:.35,y:.72,swing:true},{type:'sink',x:.25,y:.78,swing:false},{type:'sink',x:.4,y:.8,swing:true},{type:'sink',x:.3,y:.68,swing:false},{type:'sink',x:.45,y:.75,swing:true}],
  changeup:   [{type:'change',x:.5,y:.7,swing:true},{type:'change',x:.55,y:.78,swing:false},{type:'change',x:.45,y:.65,swing:true,k:true},{type:'change',x:.6,y:.72,swing:false}],
  curve:      [{type:'curve',x:.2,y:.82,swing:false},{type:'curve',x:.15,y:.88,swing:true},{type:'curve',x:.3,y:.85,swing:false},{type:'curve',x:.25,y:.78,swing:true,k:true}],
};

export function getPitcherZoneData(arsenal) {
  if (!arsenal) return [...ZONE_TENDENCIES.power_fb, ...ZONE_TENDENCIES.changeup];
  const pitches = [];
  arsenal.forEach(p => {
    if (p.type === '4seam' && p.pct >= 30) pitches.push(...ZONE_TENDENCIES.power_fb);
    if (p.type === 'slider' && p.pct >= 25) pitches.push(...ZONE_TENDENCIES.slider_heavy);
    if (p.type === 'sink' && p.pct >= 25) pitches.push(...ZONE_TENDENCIES.sinker_gb);
    if (p.type === 'change' && p.pct >= 15) pitches.push(...ZONE_TENDENCIES.changeup);
    if (p.type === 'curve' && p.pct >= 10) pitches.push(...ZONE_TENDENCIES.curve);
    if (p.type === 'sweep' && p.pct >= 15) pitches.push(...ZONE_TENDENCIES.slider_heavy);
  });
  return pitches.length ? pitches : [...ZONE_TENDENCIES.power_fb, ...ZONE_TENDENCIES.changeup];
}
