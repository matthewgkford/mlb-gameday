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
  const res = await fetch(`${BASE}/game/${gamePk}/boxscore?hydrate=person`);
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
  // Batting stats — specify playerPool=Qualified to only get actual hitters
  const battingCats = ['homeRuns','battingAverage','onBasePercentage','sluggingPercentage','onBasePlusSlugging','stolenBases','rbi'];
  // Pitching stats — these naturally return pitchers
  const pitchingCats = ['earnedRunAverage','strikeouts','wins','saves','whip'];

  const [battingResults, pitchingResults] = await Promise.all([
    Promise.all(battingCats.map(cat =>
      fetch(`${BASE}/stats/leaders?leaderCategories=${cat}&season=${year}&limit=5&sportId=1&playerPool=Qualified&statGroup=hitting`)
        .then(r => r.json())
        .then(d => ({ cat, leaders: d.leagueLeaders?.[0]?.leaders || [] }))
        .catch(() => ({ cat, leaders: [] }))
    )),
    Promise.all(pitchingCats.map(cat =>
      fetch(`${BASE}/stats/leaders?leaderCategories=${cat}&season=${year}&limit=5&sportId=1&statGroup=pitching`)
        .then(r => r.json())
        .then(d => ({ cat, leaders: d.leagueLeaders?.[0]?.leaders || [] }))
        .catch(() => ({ cat, leaders: [] }))
    )),
  ]);

  return [...battingResults, ...pitchingResults];
}

export async function getUpcomingMetsGames() {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const future = new Date(today);
  future.setDate(today.getDate() + 14);
  const to = future.toISOString().split('T')[0];
  const res = await fetch(
    `${BASE}/schedule?sportId=1&teamId=121&startDate=${from}&endDate=${to}&hydrate=probablePitcher,linescore,team&gameType=R`
  );
  const data = await res.json();
  const games = [];
  (data.dates || []).forEach(d => {
    (d.games || []).forEach(g => {
      if (g.status?.abstractGameState === 'Final') return; // skip finished
      games.push(g);
    });
  });
  // Return next 5 upcoming (not yet started or in progress)
  return games.slice(0, 5);
}

export async function getHeadToHead(awayId, homeId) {
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
  // Build pitcher ID set — convert all to strings to avoid number/string mismatch
  const pitcherIds = new Set((team.pitchers || []).map(id => String(id)));
  const PITCHER_POSITIONS = new Set(['P','SP','RP','CP','TWP']);
  return (team.batters || []).map(id => {
    const p = team.players?.[`ID${id}`];
    if (!p) return null;
    const pos = p.position?.abbreviation || '';
    // Exclude if they're in the pitchers list OR have a pitching position code
    if (pitcherIds.has(String(id)) || PITCHER_POSITIONS.has(pos)) return null;
    const s = p.stats?.batting || {};
    const season = p.seasonStats?.batting || {};
    return {
      id,
      name: p.person?.fullName || '',
      position: pos,
      batSide: p.person?.batSide?.code || null,
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
      triples: s.triples ?? 0,
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

// Win expectancy table — Tango Tiger, 2010-2015 MLB data
// Values = home team win probability
// Keyed by inning, half (T=top, B=bottom), outs, runner state
// Run diff array: index 0=-5, index 5=Tie, index 10=+5 (from home team perspective, positive = home leading)
// For the chart we use Empty/0-outs rows (start of each half-inning)
// Source: tangotiger.com win expectancy tables

const WE = {
  // Format: [inn][T|B][outs][runners] = [rd-5, rd-4, rd-3, rd-2, rd-1, tie, rd+1, rd+2, rd+3, rd+4, rd+5]
  // Top of inning: home team perspective, away is batting (negative rd = away leading = bad for home)
  // Bottom of inning: home team batting
  1:{
    T:{
      0:{
        Empty:[0.112,0.162,0.226,0.306,0.399,0.5,null,null,null,null,null],
        '1B':[0.101,0.146,0.205,0.28,0.367,0.464,null,null,null,null,null],
        '2B':[0.091,0.134,0.189,0.26,0.345,0.44,null,null,null,null,null],
        '12':[0.084,0.124,0.176,0.242,0.321,0.412,null,null,null,null,null],
        '3B':[0.081,0.12,0.172,0.238,0.32,0.413,null,null,null,null,null],
        '13':[0.072,0.107,0.154,0.215,0.29,0.378,null,null,null,null,null],
        '23':[0.067,0.1,0.144,0.203,0.275,0.36,null,null,null,null,null],
        '123':[0.062,0.092,0.134,0.188,0.256,0.337,null,null,null,null,null],
      },
    },
    B:{
      0:{
        Empty:[0.128,0.184,0.255,0.342,0.442,0.547,0.649,0.739,0.814,0.871,0.914],
        '1B':[0.153,0.214,0.291,0.381,0.48,0.583,0.679,0.764,0.832,0.885,0.923],
        '2B':[0.166,0.231,0.311,0.404,0.506,0.607,0.702,0.782,0.846,0.895,0.931],
        '12':[0.193,0.263,0.345,0.438,0.537,0.634,0.723,0.798,0.858,0.903,0.936],
        '3B':[0.178,0.248,0.332,0.429,0.533,0.635,0.726,0.802,0.862,0.907,0.939],
        '13':[0.213,0.288,0.375,0.472,0.572,0.668,0.753,0.823,0.877,0.918,0.946],
        '23':[0.226,0.303,0.394,0.492,0.592,0.686,0.767,0.834,0.885,0.923,0.95],
        '123':[0.256,0.336,0.427,0.523,0.618,0.707,0.784,0.846,0.894,0.929,0.954],
      },
    },
  },
  2:{
    T:{
      0:{
        Empty:[0.099,0.147,0.212,0.294,0.392,0.5,0.608,0.706,0.788,0.853,0.901],
        '1B':[0.089,0.132,0.191,0.267,0.359,0.462,0.568,0.667,0.754,0.824,0.879],
        '2B':[0.08,0.12,0.175,0.247,0.335,0.436,0.542,0.644,0.735,0.809,0.867],
        '12':[0.074,0.111,0.162,0.229,0.311,0.407,0.508,0.609,0.7,0.778,0.842],
        '3B':[0.07,0.107,0.158,0.225,0.309,0.407,0.514,0.62,0.715,0.795,0.857],
        '13':[0.062,0.095,0.141,0.201,0.278,0.37,0.472,0.575,0.672,0.756,0.824],
        '23':[0.058,0.088,0.131,0.189,0.263,0.352,0.452,0.555,0.654,0.741,0.813],
        '123':[0.053,0.082,0.121,0.175,0.244,0.328,0.422,0.522,0.619,0.708,0.784],
      },
    },
    B:{
      0:{
        Empty:[0.114,0.169,0.241,0.331,0.437,0.55,0.66,0.754,0.83,0.886,0.926],
        '1B':[0.139,0.2,0.278,0.372,0.478,0.588,0.691,0.778,0.847,0.898,0.935],
        '2B':[0.152,0.217,0.299,0.397,0.505,0.615,0.714,0.797,0.861,0.909,0.941],
        '12':[0.18,0.25,0.336,0.434,0.538,0.642,0.735,0.812,0.872,0.916,0.946],
        '3B':[0.163,0.233,0.321,0.423,0.535,0.644,0.74,0.818,0.877,0.92,0.949],
        '13':[0.2,0.275,0.367,0.469,0.577,0.679,0.767,0.838,0.891,0.929,0.955],
        '23':[0.212,0.292,0.386,0.491,0.597,0.697,0.781,0.849,0.899,0.934,0.959],
        '123':[0.244,0.327,0.422,0.523,0.625,0.718,0.797,0.86,0.906,0.939,0.962],
      },
    },
  },
  3:{
    T:{
      0:{
        Empty:[0.088,0.133,0.196,0.279,0.38,0.492,0.604,0.706,0.791,0.857,0.905],
        '1B':[0.079,0.12,0.178,0.255,0.351,0.458,0.569,0.672,0.762,0.835,0.888],
        '2B':[0.071,0.108,0.161,0.233,0.324,0.428,0.538,0.644,0.737,0.815,0.873],
        '12':[0.065,0.099,0.149,0.215,0.3,0.399,0.504,0.608,0.703,0.783,0.847],
        '3B':[0.061,0.093,0.14,0.204,0.287,0.384,0.491,0.6,0.698,0.781,0.847],
        '13':[0.055,0.084,0.127,0.185,0.263,0.356,0.457,0.562,0.661,0.748,0.819],
        '23':[0.051,0.078,0.118,0.173,0.247,0.337,0.435,0.538,0.638,0.727,0.802],
        '123':[0.047,0.072,0.109,0.16,0.229,0.314,0.408,0.507,0.605,0.695,0.773],
      },
    },
    B:{
      0:{
        Empty:[0.1,0.151,0.22,0.308,0.415,0.531,0.644,0.743,0.823,0.882,0.923],
        '1B':[0.122,0.179,0.254,0.348,0.456,0.569,0.675,0.768,0.842,0.896,0.933],
        '2B':[0.134,0.194,0.273,0.37,0.479,0.592,0.695,0.782,0.852,0.903,0.938],
        '12':[0.16,0.225,0.309,0.408,0.515,0.622,0.718,0.799,0.863,0.911,0.944],
        '3B':[0.143,0.208,0.293,0.395,0.508,0.622,0.725,0.808,0.872,0.917,0.948],
        '13':[0.175,0.245,0.334,0.437,0.547,0.654,0.746,0.822,0.879,0.921,0.95],
        '23':[0.187,0.261,0.354,0.458,0.567,0.671,0.76,0.832,0.886,0.925,0.952],
        '123':[0.217,0.295,0.39,0.493,0.599,0.698,0.782,0.849,0.898,0.932,0.957],
      },
    },
  },
  4:{
    T:{
      0:{
        Empty:[0.077,0.119,0.179,0.261,0.364,0.48,0.596,0.703,0.793,0.862,0.911],
        '1B':[0.069,0.107,0.162,0.238,0.335,0.445,0.558,0.665,0.759,0.836,0.89],
        '2B':[0.062,0.097,0.148,0.218,0.309,0.415,0.527,0.636,0.733,0.814,0.873],
        '12':[0.057,0.089,0.136,0.201,0.286,0.386,0.494,0.6,0.697,0.78,0.844],
        '3B':[0.053,0.083,0.127,0.189,0.271,0.37,0.477,0.586,0.686,0.772,0.84],
        '13':[0.048,0.075,0.115,0.172,0.248,0.343,0.447,0.554,0.655,0.744,0.817],
        '23':[0.044,0.069,0.107,0.16,0.232,0.323,0.424,0.531,0.633,0.724,0.8],
        '123':[0.041,0.064,0.099,0.149,0.216,0.302,0.399,0.501,0.6,0.692,0.771],
      },
    },
    B:{
      0:{
        Empty:[0.088,0.135,0.2,0.285,0.391,0.508,0.624,0.727,0.813,0.877,0.921],
        '1B':[0.107,0.16,0.231,0.323,0.431,0.546,0.657,0.754,0.833,0.891,0.931],
        '2B':[0.118,0.175,0.251,0.346,0.456,0.572,0.677,0.769,0.844,0.899,0.936],
        '12':[0.14,0.203,0.283,0.381,0.489,0.601,0.700,0.786,0.855,0.906,0.941],
        '3B':[0.126,0.186,0.268,0.369,0.484,0.601,0.707,0.795,0.863,0.913,0.946],
        '13':[0.154,0.219,0.305,0.408,0.521,0.632,0.73,0.812,0.874,0.919,0.949],
        '23':[0.165,0.234,0.323,0.428,0.54,0.649,0.744,0.821,0.88,0.922,0.951],
        '123':[0.193,0.267,0.361,0.464,0.571,0.674,0.763,0.836,0.891,0.929,0.956],
      },
    },
  },
  5:{
    T:{
      0:{
        Empty:[0.066,0.104,0.161,0.24,0.344,0.463,0.582,0.695,0.791,0.865,0.916],
        '1B':[0.059,0.094,0.146,0.219,0.317,0.43,0.547,0.658,0.757,0.838,0.895],
        '2B':[0.053,0.085,0.133,0.2,0.292,0.4,0.515,0.627,0.728,0.815,0.877],
        '12':[0.049,0.078,0.122,0.184,0.27,0.373,0.484,0.595,0.697,0.785,0.854],
        '3B':[0.045,0.072,0.113,0.171,0.252,0.352,0.462,0.575,0.68,0.771,0.844],
        '13':[0.041,0.066,0.103,0.157,0.232,0.327,0.432,0.542,0.649,0.743,0.82],
        '23':[0.038,0.061,0.096,0.146,0.217,0.309,0.412,0.52,0.628,0.724,0.804],
        '123':[0.035,0.056,0.088,0.135,0.201,0.287,0.386,0.489,0.593,0.689,0.772],
      },
    },
    B:{
      0:{
        Empty:[0.076,0.119,0.18,0.263,0.369,0.487,0.605,0.713,0.804,0.874,0.921],
        '1B':[0.093,0.142,0.21,0.299,0.407,0.524,0.638,0.741,0.825,0.888,0.931],
        '2B':[0.102,0.155,0.227,0.32,0.430,0.549,0.661,0.758,0.837,0.896,0.936],
        '12':[0.121,0.179,0.257,0.354,0.461,0.576,0.681,0.773,0.847,0.902,0.939],
        '3B':[0.11,0.165,0.242,0.341,0.455,0.576,0.688,0.783,0.856,0.909,0.944],
        '13':[0.133,0.194,0.275,0.376,0.487,0.602,0.707,0.797,0.866,0.915,0.948],
        '23':[0.143,0.207,0.292,0.396,0.507,0.619,0.720,0.806,0.872,0.919,0.951],
        '123':[0.167,0.237,0.327,0.431,0.540,0.648,0.742,0.822,0.882,0.925,0.954],
      },
    },
  },
  6:{
    T:{
      0:{
        Empty:[0.054,0.088,0.141,0.217,0.322,0.444,0.566,0.683,0.784,0.863,0.917],
        '1B':[0.048,0.079,0.127,0.197,0.295,0.41,0.53,0.646,0.75,0.836,0.897],
        '2B':[0.043,0.071,0.115,0.178,0.269,0.379,0.496,0.613,0.72,0.812,0.877],
        '12':[0.039,0.065,0.105,0.164,0.248,0.353,0.466,0.581,0.688,0.781,0.854],
        '3B':[0.036,0.059,0.096,0.152,0.232,0.334,0.447,0.563,0.671,0.767,0.843],
        '13':[0.033,0.054,0.088,0.139,0.213,0.31,0.419,0.533,0.643,0.741,0.82],
        '23':[0.03,0.05,0.081,0.129,0.198,0.291,0.397,0.511,0.622,0.723,0.806],
        '123':[0.028,0.046,0.075,0.119,0.183,0.271,0.373,0.482,0.59,0.69,0.776],
      },
    },
    B:{
      0:{
        Empty:[0.062,0.1,0.157,0.235,0.34,0.458,0.578,0.692,0.789,0.864,0.917],
        '1B':[0.077,0.12,0.184,0.271,0.38,0.499,0.615,0.723,0.811,0.879,0.927],
        '2B':[0.085,0.132,0.199,0.29,0.401,0.522,0.637,0.740,0.824,0.888,0.932],
        '12':[0.101,0.153,0.224,0.32,0.433,0.551,0.661,0.758,0.836,0.895,0.936],
        '3B':[0.091,0.141,0.212,0.309,0.428,0.553,0.669,0.770,0.848,0.904,0.941],
        '13':[0.11,0.166,0.241,0.342,0.457,0.577,0.687,0.781,0.856,0.909,0.944],
        '23':[0.119,0.178,0.257,0.360,0.477,0.594,0.700,0.790,0.862,0.913,0.947],
        '123':[0.14,0.205,0.289,0.394,0.509,0.621,0.720,0.806,0.872,0.919,0.950],
      },
    },
  },
  7:{
    T:{
      0:{
        Empty:[0.039,0.067,0.112,0.183,0.289,0.42,0.551,0.672,0.775,0.857,0.914],
        '1B':[0.034,0.059,0.099,0.163,0.261,0.385,0.514,0.637,0.745,0.833,0.897],
        '2B':[0.03,0.052,0.087,0.144,0.233,0.350,0.475,0.599,0.711,0.806,0.876],
        '12':[0.026,0.046,0.078,0.13,0.211,0.321,0.442,0.564,0.677,0.774,0.851],
        '3B':[0.023,0.04,0.068,0.114,0.186,0.289,0.41,0.537,0.657,0.758,0.839],
        '13':[0.021,0.036,0.062,0.104,0.17,0.267,0.382,0.505,0.624,0.729,0.814],
        '23':[0.019,0.033,0.057,0.095,0.157,0.248,0.359,0.48,0.601,0.709,0.798],
        '123':[0.017,0.03,0.052,0.087,0.144,0.23,0.336,0.452,0.569,0.677,0.770],
      },
    },
    B:{
      0:{
        Empty:[0.046,0.077,0.126,0.199,0.303,0.425,0.551,0.671,0.773,0.853,0.910],
        '1B':[0.057,0.094,0.151,0.233,0.345,0.470,0.593,0.705,0.798,0.871,0.922],
        '2B':[0.063,0.103,0.164,0.252,0.368,0.496,0.618,0.725,0.813,0.880,0.929],
        '12':[0.076,0.120,0.187,0.280,0.398,0.524,0.642,0.743,0.826,0.888,0.933],
        '3B':[0.068,0.110,0.175,0.268,0.392,0.527,0.652,0.759,0.842,0.901,0.940],
        '13':[0.083,0.129,0.200,0.298,0.423,0.552,0.670,0.772,0.851,0.907,0.943],
        '23':[0.090,0.140,0.214,0.316,0.443,0.570,0.685,0.782,0.857,0.910,0.946],
        '123':[0.107,0.162,0.241,0.347,0.472,0.597,0.706,0.797,0.867,0.917,0.949],
      },
    },
  },
  8:{
    T:{
      0:{
        Empty:[0.015,0.032,0.065,0.13,0.247,0.5,0.753,0.87,0.935,0.968,0.985],
        '1B':[0.013,0.027,0.056,0.112,0.214,0.432,0.665,0.804,0.894,0.946,0.973],
        '2B':[0.011,0.023,0.048,0.095,0.184,0.366,0.604,0.78,0.882,0.939,0.969],
        '12':[0.01,0.021,0.044,0.087,0.169,0.338,0.544,0.702,0.821,0.902,0.948],
        '3B':[0.009,0.018,0.038,0.077,0.15,0.293,0.536,0.757,0.872,0.935,0.968],
        '13':[0.007,0.016,0.033,0.066,0.129,0.254,0.462,0.664,0.798,0.888,0.94],
        '23':[0.007,0.014,0.029,0.06,0.117,0.231,0.41,0.615,0.779,0.877,0.935],
        '123':[0.006,0.013,0.027,0.055,0.108,0.213,0.378,0.557,0.706,0.821,0.901],
      },
    },
    B:{
      0:{
        Empty:[0.018,0.039,0.079,0.156,0.297,0.605,0.871,0.942,0.975,0.989,0.996],
        '1B':[0.033,0.066,0.127,0.234,0.395,0.669,0.89,0.951,0.979,0.991,0.996],
        '2B':[0.037,0.074,0.142,0.263,0.471,0.739,0.909,0.959,0.983,0.993,0.997],
        '12':[0.062,0.118,0.213,0.35,0.526,0.754,0.916,0.963,0.984,0.993,0.997],
        '3B':[0.039,0.078,0.155,0.291,0.557,0.819,0.929,0.969,0.987,0.995,0.998],
        '13':[0.072,0.134,0.24,0.394,0.627,0.844,0.94,0.974,0.989,0.995,0.998],
        '23':[0.078,0.147,0.263,0.455,0.682,0.857,0.946,0.976,0.99,0.996,0.998],
        '123':[0.119,0.213,0.345,0.51,0.704,0.868,0.95,0.978,0.991,0.996,0.998],
      },
    },
  },
  9:{
    T:{
      0:{
        Empty:[0.005,0.013,0.031,0.071,0.158,0.5,0.842,0.929,0.969,0.987,0.995],
        '1B':[0.005,0.011,0.026,0.06,0.135,0.418,0.727,0.855,0.933,0.971,0.988],
        '2B':[0.004,0.009,0.022,0.05,0.112,0.328,0.643,0.842,0.927,0.968,0.985],
        '12':[0.003,0.008,0.02,0.046,0.103,0.309,0.573,0.739,0.858,0.934,0.97],
        '3B':[0.003,0.007,0.016,0.038,0.087,0.225,0.55,0.832,0.926,0.969,0.987],
        '13':[0.002,0.006,0.014,0.033,0.074,0.194,0.462,0.713,0.842,0.924,0.964],
        '23':[0.002,0.005,0.012,0.029,0.067,0.179,0.391,0.646,0.832,0.918,0.963],
        '123':[0.002,0.005,0.012,0.027,0.061,0.165,0.365,0.577,0.737,0.855,0.932],
      },
    },
    B:{
      0:{
        Empty:[0.007,0.016,0.038,0.087,0.194,0.634,null,null,null,null,null],
        '1B':[0.015,0.036,0.083,0.177,0.328,0.708,null,null,null,null,null],
        '2B':[0.018,0.04,0.089,0.193,0.438,0.807,null,null,null,null,null],
        '12':[0.037,0.081,0.173,0.312,0.5,0.805,null,null,null,null,null],
        '3B':[0.016,0.039,0.092,0.206,0.563,0.921,null,null,null,null,null],
        '13':[0.044,0.092,0.192,0.343,0.643,0.93,null,null,null,null,null],
        '23':[0.046,0.101,0.205,0.431,0.721,0.926,null,null,null,null,null],
        '123':[0.083,0.176,0.314,0.494,0.731,0.931,null,null,null,null,null],
      },
    },
  },
};

// Look up home team win probability from Tango table
// inn: 1-9, half: 'T' or 'B', outs: 0-2, runners: runner key, runDiff: home - away (capped ±5)
function lookupWP(inn, half, outs, runners, homeMinusAway) {
  const i = Math.min(9, Math.max(1, inn || 1));
  const h = half === 'B' ? 'B' : 'T';
  const o = Math.min(2, Math.max(0, outs || 0));
  const rd = Math.min(5, Math.max(-5, Math.round(homeMinusAway)));
  const idx = rd + 5; // -5=0, 0=5, +5=10

  // Get row — try exact outs, fall back to 0 outs
  const row = WE[i]?.[h]?.[o]?.[runners] || WE[i]?.[h]?.[0]?.['Empty'];
  if (!row) return 0.5;
  const val = row[idx];
  return (val !== null && val !== undefined) ? val : 0.5;
}

// Build win probability series from completed innings linescore
// Returns home team win probability at each half-inning boundary
export function buildWinProbability(innings) {
  if (!innings || !innings.length) return { labels: [], vals: [] };
  const labels = [];
  const vals = [];
  let cumAway = 0, cumHome = 0;

  innings.forEach(inn => {
    // After top of inning: away has just batted, home about to bat
    cumAway += inn.away?.runs ?? 0;
    const diff = cumHome - cumAway;
    const wpBot = lookupWP(inn.num, 'B', 0, 'Empty', diff);
    vals.push(Math.round(wpBot * 100));
    labels.push(`B${inn.num}`);

    // After bottom of inning: home has just batted, top of next inning
    cumHome += inn.home?.runs ?? 0;
    const diff2 = cumHome - cumAway;
    const nextInn = Math.min(9, inn.num + 1);
    const wpTop = lookupWP(nextInn, 'T', 0, 'Empty', diff2);
    vals.push(Math.round(wpTop * 100));
    labels.push(`T${nextInn}`);
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
