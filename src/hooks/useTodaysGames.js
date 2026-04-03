import { useState, useEffect } from 'react';
import { getGamesForDate, mapGame, todayString } from '../utils/mlbApi';

export function useGamesForDate(dateStr) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dateStr) return;
    setLoading(true);
    setError(null);
    getGamesForDate(dateStr)
      .then(raw => setGames(raw.map(mapGame)))
      .catch(() => setError('Could not load schedule. Please try again.'))
      .finally(() => setLoading(false));
  }, [dateStr]);

  return { games, loading, error };
}
