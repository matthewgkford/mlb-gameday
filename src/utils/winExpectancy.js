import WE from '../data/winExpectancy.json';

/**
 * Returns the home team's win expectancy as an integer percentage (0-100),
 * or null if the game hasn't started or is final.
 *
 * Reads the pre-computed Tango Tiger / Retrosheet lookup table keyed by
 * "{inning}_{half}_{outs}_{baseState}_{runDiff}".
 */
export function getWinExpectancy({ inning, inningHalf, outs, onFirst, onSecond, onThird, homeScore, awayScore, status }) {
  if (!inning || !inningHalf || status === 'Final' || status === 'Preview') return null;

  const inn  = Math.min(9, inning);
  const half = inningHalf === 'Bottom' ? 'bottom' : 'top';
  const o    = outs ?? 0;
  const base = `${onFirst ? 1 : 0}${onSecond ? 1 : 0}${onThird ? 1 : 0}`;
  const diff = Math.max(-6, Math.min(6, (homeScore ?? 0) - (awayScore ?? 0)));

  const key = `${inn}_${half}_${o}_${base}_${diff}`;
  const we  = WE[key];
  return we != null ? Math.round(we * 100) : null;
}
