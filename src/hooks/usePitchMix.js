import { useState, useEffect } from 'react';

const cache = {};

export function usePitchMix(pitcherId) {
  const [pitches, setPitches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (!pitcherId) { setLoading(false); return; }

    if (cache[pitcherId]) {
      setPitches(cache[pitcherId].pitches);
      setSource(cache[pitcherId].source);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Timeout after 5 seconds so we don't hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`/api/pitchmix?pitcherId=${pitcherId}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.json(); })
      .then(data => {
        if (data.pitches && data.pitches.length > 0) {
          cache[pitcherId] = { pitches: data.pitches, source: 'statcast' };
          setPitches(data.pitches);
          setSource('statcast');
        } else {
          // API returned but no data — mark as fallback
          cache[pitcherId] = { pitches: null, source: 'fallback' };
          setPitches(null);
          setSource('fallback');
        }
      })
      .catch(() => {
        // Network error or timeout — will fall back to KNOWN_ARSENALS in component
        setPitches(null);
        setSource('fallback');
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [pitcherId]);

  return { pitches, loading, source };
}
