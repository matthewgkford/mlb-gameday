// api/pitchmix.js
// Vercel serverless function — proxies Baseball Savant statcast data
// Called from the app as /api/pitchmix?pitcherId=123456&year=2025

export default async function handler(req, res) {
  // CORS headers so the browser can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // cache 1hr

  const { pitcherId, year } = req.query;

  if (!pitcherId) {
    return res.status(400).json({ error: 'pitcherId required' });
  }

  const season = year || new Date().getFullYear();

  try {
    // Baseball Savant statcast search — returns CSV with pitch-level data
    const url = `https://baseballsavant.mlb.com/statcast_search/csv?player_type=pitcher&pitcherid=${pitcherId}&season=${season}&type=details&min_pitches=10`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; baseball-app/1.0)',
        'Accept': 'text/csv,application/csv,text/plain',
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Baseball Savant unavailable' });
    }

    const csv = await response.text();

    if (!csv || csv.length < 100) {
      return res.status(404).json({ error: 'No data found for pitcher' });
    }

    // Parse CSV — first line is headers
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      return res.status(404).json({ error: 'Insufficient data' });
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const pitchTypeIdx = headers.indexOf('pitch_type');
    const pitchNameIdx = headers.indexOf('pitch_name');

    if (pitchTypeIdx === -1) {
      return res.status(500).json({ error: 'Unexpected CSV format' });
    }

    // Count pitch types across all rows
    const counts = {};
    const names = {};
    let total = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
      const type = cols[pitchTypeIdx];
      const name = pitchNameIdx >= 0 ? cols[pitchNameIdx] : type;

      if (!type || type === 'null' || type === '' || type === 'IN' || type === 'PO') continue;

      counts[type] = (counts[type] || 0) + 1;
      names[type] = name || type;
      total++;
    }

    if (total === 0) {
      return res.status(404).json({ error: 'No pitch data found' });
    }

    // Convert to percentage array, sorted by usage
    const pitches = Object.entries(counts)
      .map(([type, count]) => ({
        type,
        name: friendlyName(names[type] || type),
        pct: Math.round((count / total) * 100),
        count,
      }))
      .filter(p => p.pct >= 1)
      .sort((a, b) => b.pct - a.pct);

    // Normalise percentages to sum to exactly 100
    const sum = pitches.reduce((a, p) => a + p.pct, 0);
    if (sum !== 100 && pitches.length > 0) {
      pitches[0].pct += (100 - sum);
    }

    return res.status(200).json({ pitches, total, season });

  } catch (err) {
    console.error('pitchmix error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Map Statcast pitch type codes to friendly display names
function friendlyName(raw) {
  const map = {
    'FF': 'Four-seam FB',
    'Four-Seamer': 'Four-seam FB',
    'SI': 'Sinker',
    'Sinker': 'Sinker',
    'FC': 'Cutter',
    'Cutter': 'Cutter',
    'SL': 'Slider',
    'Slider': 'Slider',
    'ST': 'Sweeper',
    'Sweeper': 'Sweeper',
    'CH': 'Changeup',
    'Changeup': 'Changeup',
    'CU': 'Curveball',
    'Curveball': 'Curveball',
    'KC': 'Knuckle Curve',
    'Knuckle Curve': 'Knuckle Curve',
    'FS': 'Splitter',
    'Split-Finger': 'Splitter',
    'KN': 'Knuckleball',
    'Knuckleball': 'Knuckleball',
    'CS': 'Slow Curve',
    'EP': 'Eephus',
    'SV': 'Slurve',
    'FA': 'Fastball',
  };
  return map[raw] || raw;
}
