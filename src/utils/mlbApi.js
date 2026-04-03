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
  const url = `${BASE}/schedule?sportId=1&date=${dateStr}&hydrate=team,linescore,probablePitcher,weather`;
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

export function espnLogoUrl(abbr) {
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr?.toLowerCase()}.png`;
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
    };
  }).filter(Boolean);
}

export function parsePitcherStats(boxscore, teamKey) {
  const team = boxscore?.teams?.[teamKey];
  if (!team) return [];
  return (team.pitchers || []).map(id => {
    const p = team.players?.[`ID${id}`];
    if (!p) return null;
    const s = p.stats?.pitching || {};
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
      note: p.gameStatus?.isCurrentPitcher ? 'Current' : '',
      hr: s.homeRuns ?? 0,
    };
  }).filter(Boolean);
}

export function parseKeyPlays(playByPlay) {
  const allPlays = playByPlay?.allPlays || [];
  return allPlays
    .filter(p => ['home_run','strikeout','walk','double','triple','single','sac_fly','field_error'].includes(p.result?.eventType))
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
    }));
}

export function buildWinProbability(innings) {
  const labels = ['Start'];
  const vals = [50];
  let cumAway = 0, cumHome = 0;
  innings.forEach(inn => {
    cumAway += inn.away?.runs ?? 0;
    const diff = cumAway - cumHome;
    vals.push(Math.min(95, Math.max(5, 50 + diff * 9)));
    labels.push(`T${inn.num}`);
    cumHome += inn.home?.runs ?? 0;
    const diff2 = cumAway - cumHome;
    vals.push(Math.min(95, Math.max(5, 50 + diff2 * 9)));
    labels.push(`B${inn.num}`);
  });
  return { labels, vals };
}
