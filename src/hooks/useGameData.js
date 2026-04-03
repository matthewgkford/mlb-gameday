import { useState, useEffect, useCallback } from 'react';
import { getGameFeed, getBoxScore, getPlayByPlay, parseBatterStats, parsePitcherStats, parseKeyPlays, buildWinProbability, fixCity } from '../utils/mlbApi';

const REFRESH_MS = 45000;

export function useGameData(gamePk, isLive) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!gamePk) return;
    try {
      const [feed, boxscore, pbp] = await Promise.all([
        getGameFeed(gamePk),
        getBoxScore(gamePk),
        getPlayByPlay(gamePk),
      ]);

      const live = feed.liveData || {};
      const gd = feed.gameData || {};
      const innings = live.linescore?.innings || [];
      const isFinal = gd.status?.abstractGameState === 'Final';

      setData({
        gamePk,
        status: gd.status?.abstractGameState,
        detailedStatus: gd.status?.detailedState,
        isFinal,
        inning: live.linescore?.currentInning,
        inningHalf: live.linescore?.inningHalf,
        outs: live.linescore?.outs,
        balls: live.linescore?.balls,
        strikes: live.linescore?.strikes,
        onFirst: !!live.linescore?.offense?.first,
        onSecond: !!live.linescore?.offense?.second,
        onThird: !!live.linescore?.offense?.third,

        awayTeam: {
          id: gd.teams?.away?.id,
          name: gd.teams?.away?.teamName,
          abbr: gd.teams?.away?.abbreviation,
          city: fixCity(gd.teams?.away?.id, gd.teams?.away?.locationName),
        },
        homeTeam: {
          id: gd.teams?.home?.id,
          name: gd.teams?.home?.teamName,
          abbr: gd.teams?.home?.abbreviation,
          city: fixCity(gd.teams?.home?.id, gd.teams?.home?.locationName),
        },

        awayScore: live.linescore?.teams?.away?.runs ?? 0,
        homeScore: live.linescore?.teams?.home?.runs ?? 0,
        awayHits: live.linescore?.teams?.away?.hits ?? 0,
        homeHits: live.linescore?.teams?.home?.hits ?? 0,
        awayErrors: live.linescore?.teams?.away?.errors ?? 0,
        homeErrors: live.linescore?.teams?.home?.errors ?? 0,

        innings,
        winProb: buildWinProbability(innings),
        decisions: live.decisions || {},

        awayBatters: parseBatterStats(boxscore, 'away'),
        homeBatters: parseBatterStats(boxscore, 'home'),
        awayPitchers: parsePitcherStats(boxscore, 'away'),
        homePitchers: parsePitcherStats(boxscore, 'home'),

        awayTeamStats: boxscore?.teams?.away?.teamStats?.batting || {},
        homeTeamStats: boxscore?.teams?.home?.teamStats?.batting || {},
        awayTeamPitching: boxscore?.teams?.away?.teamStats?.pitching || {},
        homeTeamPitching: boxscore?.teams?.home?.teamStats?.pitching || {},

        keyPlays: parseKeyPlays(pbp),
        weather: gd.weather || null,
        venue: gd.venue?.name || '',
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('Unable to load game data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [gamePk]);

  useEffect(() => { setLoading(true); setData(null); fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(id);
  }, [isLive, fetchData]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
}
