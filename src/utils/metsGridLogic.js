import METS_PLAYERS from '../data/metsPlayers';
import PUZZLES from '../data/metsGridPuzzles';

// ── Category definitions ───────────────────────────────────────────────────

export const CATEGORIES = {
  // Positions
  pos_C:   { label: 'Catcher',          color: '#6366f1', type: 'position' },
  pos_1B:  { label: 'First Baseman',    color: '#6366f1', type: 'position' },
  pos_2B:  { label: 'Second Baseman',   color: '#6366f1', type: 'position' },
  pos_SS:  { label: 'Shortstop',        color: '#6366f1', type: 'position' },
  pos_3B:  { label: 'Third Baseman',    color: '#6366f1', type: 'position' },
  pos_OF:  { label: 'Outfielder',       color: '#6366f1', type: 'position' },
  pos_SP:  { label: 'Starting Pitcher', color: '#6366f1', type: 'position' },
  pos_RP:  { label: 'Relief Pitcher',   color: '#6366f1', type: 'position' },

  // Era
  era_1986: { label: '1986 World Series champs', color: '#f59e0b', type: 'era' },
  era_2015: { label: '2015 NL pennant run',      color: '#f59e0b', type: 'era' },
  era_2000: { label: '2000 World Series',         color: '#f59e0b', type: 'era' },

  // Decade
  dec_1980s: { label: 'Met during the 1980s', color: '#8b5cf6', type: 'decade' },
  dec_1990s: { label: 'Met during the 1990s', color: '#8b5cf6', type: 'decade' },
  dec_2000s: { label: 'Met during the 2000s', color: '#8b5cf6', type: 'decade' },
  dec_2010s: { label: 'Met during the 2010s', color: '#8b5cf6', type: 'decade' },
  dec_2020s: { label: 'Met during the 2020s', color: '#8b5cf6', type: 'decade' },

  // Other teams
  team_Yankees:   { label: 'Also played for the Yankees',   color: '#10b981', type: 'team' },
  team_Dodgers:   { label: 'Also played for the Dodgers',   color: '#10b981', type: 'team' },
  team_RedSox:    { label: 'Also played for the Red Sox',   color: '#10b981', type: 'team' },
  team_Cubs:      { label: 'Also played for the Cubs',      color: '#10b981', type: 'team' },
  team_Braves:    { label: 'Also played for the Braves',    color: '#10b981', type: 'team' },
  team_Cardinals: { label: 'Also played for the Cardinals', color: '#10b981', type: 'team' },
  team_Phillies:  { label: 'Also played for the Phillies',  color: '#10b981', type: 'team' },
  team_Astros:    { label: 'Also played for the Astros',    color: '#10b981', type: 'team' },

  // Awards
  award_CyYoung:  { label: 'Cy Young winner',       color: '#FF5910', type: 'award' },
  award_MVP:      { label: 'MLB MVP winner',         color: '#FF5910', type: 'award' },
  award_GoldGlove:{ label: 'Gold Glove winner',      color: '#FF5910', type: 'award' },
  award_AllStar:  { label: 'All-Star as a Met',      color: '#FF5910', type: 'award' },
  award_SilverSlugger: { label: 'Silver Slugger as a Met', color: '#FF5910', type: 'award' },
  award_ROY:      { label: 'Rookie of the Year',     color: '#FF5910', type: 'award' },

  // Milestones as a Met
  ms_30HR:  { label: '30+ HR season as a Met',   color: '#60a5fa', type: 'milestone' },
  ms_200K:  { label: '200+ K season as a Met',   color: '#60a5fa', type: 'milestone' },
  ms_100RBI:{ label: '100+ RBI season as a Met', color: '#60a5fa', type: 'milestone' },
  ms_300avg:{ label: '.300 avg season as a Met', color: '#60a5fa', type: 'milestone' },

  // Handedness
  hand_LHP:    { label: 'Left-handed pitcher', color: '#64748b', type: 'hand' },
  hand_switch: { label: 'Switch hitter',       color: '#64748b', type: 'hand' },

  // Nationality
  nat_DR: { label: 'Born in the Dominican Republic', color: '#14b8a6', type: 'nationality' },
  nat_PR: { label: 'Born in Puerto Rico',            color: '#14b8a6', type: 'nationality' },
  nat_VE: { label: 'Born in Venezuela',              color: '#14b8a6', type: 'nationality' },

  // Hall of Fame
  award_HOF: { label: 'Hall of Fame inductee', color: '#eab308', type: 'award' },
};

// ── Validator ──────────────────────────────────────────────────────────────

export function validatePlayer(player, categoryKey) {
  switch (categoryKey) {
    case 'pos_C':   return player.positions.includes('C');
    case 'pos_1B':  return player.positions.includes('1B');
    case 'pos_2B':  return player.positions.includes('2B');
    case 'pos_SS':  return player.positions.includes('SS');
    case 'pos_3B':  return player.positions.includes('3B');
    case 'pos_OF':  return player.positions.includes('OF');
    case 'pos_SP':  return player.positions.includes('SP');
    case 'pos_RP':  return player.positions.includes('RP');

    case 'era_1986': return player.era.includes('1986 champs');
    case 'era_2015': return player.era.includes('2015 pennant');
    case 'era_2000': return player.era.includes('2000 WS');

    case 'dec_1980s': return player.metsYears.some(y => y >= 1980 && y <= 1989);
    case 'dec_1990s': return player.metsYears.some(y => y >= 1990 && y <= 1999);
    case 'dec_2000s': return player.metsYears.some(y => y >= 2000 && y <= 2009);
    case 'dec_2010s': return player.metsYears.some(y => y >= 2010 && y <= 2019);
    case 'dec_2020s': return player.metsYears.some(y => y >= 2020 && y <= 2029);

    case 'team_Yankees':   return player.otherTeams.includes('Yankees');
    case 'team_Dodgers':   return player.otherTeams.includes('Dodgers');
    case 'team_RedSox':    return player.otherTeams.includes('Red Sox');
    case 'team_Cubs':      return player.otherTeams.includes('Cubs');
    case 'team_Braves':    return player.otherTeams.includes('Braves');
    case 'team_Cardinals': return player.otherTeams.includes('Cardinals');
    case 'team_Phillies':  return player.otherTeams.includes('Phillies');
    case 'team_Astros':    return player.otherTeams.includes('Astros');

    case 'award_CyYoung':       return player.awards.includes('Cy Young');
    case 'award_MVP':           return player.awards.includes('MVP');
    case 'award_GoldGlove':     return player.awards.includes('Gold Glove');
    case 'award_AllStar':       return player.awards.includes('All-Star');
    case 'award_SilverSlugger': return player.awards.includes('Silver Slugger');
    case 'award_ROY':           return player.awards.includes('Rookie of the Year');

    case 'ms_30HR':   return player.metsMilestones.includes('30+ HR');
    case 'ms_200K':   return player.metsMilestones.includes('200+ K');
    case 'ms_100RBI': return player.metsMilestones.includes('100+ RBI');
    case 'ms_300avg': return player.metsMilestones.includes('.300 avg');

    case 'hand_LHP':    return player.positions.some(p => ['SP','RP'].includes(p)) && player.throws === 'L';
    case 'hand_switch': return player.bats === 'S';

    case 'nat_DR': return player.nationality === 'Dominican Republic';
    case 'nat_PR': return player.nationality === 'Puerto Rico';
    case 'nat_VE': return player.nationality === 'Venezuela';

    case 'award_HOF': return player.hallOfFame === true;

    default: return false;
  }
}

// Returns all valid players for a cell (row category + col category)
export function getValidPlayers(rowCat, colCat) {
  return METS_PLAYERS.filter(p => validatePlayer(p, rowCat) && validatePlayer(p, colCat));
}

// ── Puzzle selection ───────────────────────────────────────────────────────

const START_DATE = new Date('2025-04-17');

// Filter to puzzles where every cell has at least 1 valid answer
const VALID_PUZZLES = PUZZLES.filter(puzzle => {
  for (let ri = 0; ri < 3; ri++) {
    for (let ci = 0; ci < 3; ci++) {
      if (getValidPlayers(puzzle.rows[ri], puzzle.cols[ci]).length === 0) return false;
    }
  }
  return true;
});

export function getPuzzleIndex() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(START_DATE);
  start.setHours(0, 0, 0, 0);
  const days = Math.floor((today - start) / 86400000);
  return ((days % VALID_PUZZLES.length) + VALID_PUZZLES.length) % VALID_PUZZLES.length;
}

export function getTodaysPuzzle() {
  return VALID_PUZZLES[getPuzzleIndex()];
}

export function getTodayKey() {
  const d = new Date();
  return `metsGrid_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

// ── localStorage helpers ───────────────────────────────────────────────────

const STATS_KEY = 'metsGrid_stats';

export function loadTodayState() {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveTodayState(state) {
  try {
    localStorage.setItem(getTodayKey(), JSON.stringify(state));
  } catch {}
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { played: 0, completed: 0, streak: 0, bestStreak: 0, lastDate: null };
  } catch {
    return { played: 0, completed: 0, streak: 0, bestStreak: 0, lastDate: null };
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function updateStats(won) {
  const stats = loadStats();
  const todayStr = getTodayKey();
  if (stats.lastDate === todayStr) return stats; // already recorded today
  stats.played += 1;
  if (won) {
    stats.completed += 1;
    stats.streak += 1;
    if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
  } else {
    stats.streak = 0;
  }
  stats.lastDate = todayStr;
  saveStats(stats);
  return stats;
}

export function searchPlayers(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return METS_PLAYERS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
}
