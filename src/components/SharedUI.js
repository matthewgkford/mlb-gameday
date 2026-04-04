import React from 'react';
import { teamLogoUrl, playerHeadshotUrl } from '../utils/mlbApi';

// Fixed trend arrow - no box bleed, clean SVG paths
export function TrendArrow({ rating, size = 13 }) {
  const configs = {
    elite: { color: '#4ade80', d: 'M3,13 L8,5 L13,13', arrow: 'M8,5 L13,5 L13,11' },
    good:  { color: '#60a5fa', d: 'M3,12 L8,5 L13,12', arrow: null },
    avg:   { color: '#71717a', d: 'M3,8 L13,8',         arrow: null },
    poor:  { color: '#f87171', d: 'M3,5 L8,13 L13,5',  arrow: null },
  };
  const c = configs[rating] || configs.avg;
  const isUp = rating === 'elite' || rating === 'good';
  const isDown = rating === 'poor';
  const isFlat = rating === 'avg';

  return (
    <svg
      width={size} height={size}
      viewBox="2 3 12 12"
      fill="none"
      style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0 }}
    >
      {isUp && (
        <polyline
          points="3,13 8,4 13,13"
          stroke={c.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {isDown && (
        <polyline
          points="3,4 8,13 13,4"
          stroke={c.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {isFlat && (
        <line x1="3" y1="8.5" x2="13" y2="8.5" stroke={c.color} strokeWidth="2" strokeLinecap="round"/>
      )}
    </svg>
  );
}

export function rateBAT(avg)  { const n=parseFloat(avg)||0;  return n>=.300?'elite':n>=.270?'good':n>=.240?'avg':'poor'; }
export function rateOBP(obp)  { const n=parseFloat(obp)||0;  return n>=.370?'elite':n>=.330?'good':n>=.300?'avg':'poor'; }
export function rateSLG(slg)  { const n=parseFloat(slg)||0;  return n>=.500?'elite':n>=.440?'good':n>=.380?'avg':'poor'; }
export function rateOPS(ops)  { const n=parseFloat(ops)||0;  return n>=.900?'elite':n>=.800?'good':n>=.700?'avg':'poor'; }
export function rateBABIP(v)  { const n=parseFloat(v)||0;    return n>=.340?'elite':n>=.295?'good':n>=.260?'avg':'poor'; }
export function rateISO(v)    { const n=parseFloat(v)||0;    return n>=.220?'elite':n>=.160?'good':n>=.120?'avg':'poor'; }
export function rateERA(v)    { const n=parseFloat(v)||0; if(!n)return'avg'; return n<=2.50?'elite':n<=3.50?'good':n<=4.50?'avg':'poor'; }
export function rateWHIP(v)   { const n=parseFloat(v)||0; if(!n)return'avg'; return n<=1.00?'elite':n<=1.20?'good':n<=1.35?'avg':'poor'; }

export function calcBABIP(stats) {
  const h=parseInt(stats.hits)||0, hr=parseInt(stats.homeRuns)||0, ab=parseInt(stats.atBats)||0, k=parseInt(stats.strikeOuts)||0, sf=parseInt(stats.sacFlies)||0;
  const denom=ab-k-hr+sf;
  if(!denom)return'.---';
  return'.'+String(Math.round((h-hr)/denom*1000)).padStart(3,'0');
}

export function calcISO(stats) {
  const slg=parseFloat(stats.slg)||0, avg=parseFloat(stats.avg)||0;
  if(!slg)return'.---';
  return'.'+String(Math.round((slg-avg)*1000)).padStart(3,'0');
}

export function TeamLogo({ abbr, size = 24 }) {
  const [err, setErr] = React.useState(false);
  const COLORS = { MIN:'#002B5C',KC:'#004687',NYM:'#002D72',NYY:'#1c2841',BOS:'#bd3039',LAD:'#005a9c',SF:'#fd5a1e',CHC:'#0e3386',ATL:'#ce1141',HOU:'#002d62',TOR:'#134a8e',PHI:'#E81828',STL:'#C41E3A',CLE:'#00385D',MIL:'#FFC52F',OAK:'#003831',SEA:'#0C2C56',TB:'#092C5C',TEX:'#003278',LAA:'#BA0021',BAL:'#DF4601',MIA:'#00A3E0',WSH:'#AB0003',COL:'#33006F',ARI:'#A71930',SD:'#2F241D',CIN:'#C6011F',PIT:'#27251F',DET:'#0C2340',CWS:'#27251F' };
  const bg = COLORS[abbr] || '#1e293b';
  if (err) return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.28, fontWeight:700, color:'#fff', flexShrink:0 }}>
      {abbr?.slice(0,2)}
    </div>
  );
  return (
    <img
      src={teamLogoUrl(abbr)}
      alt={abbr}
      width={size}
      height={size}
      style={{ objectFit:'contain', flexShrink:0 }}
      onError={() => setErr(true)}
    />
  );
}

export function PlayerPhoto({ playerId, name, size = 40 }) {
  const [err, setErr] = React.useState(false);
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#1e3a5f','#1e5f3a','#3a1e5f','#5f1e3a','#1e4a5f','#3a3a1e'];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];

  if (err || !playerId) {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.32, fontWeight:600, color:'rgba(255,255,255,0.8)', flexShrink:0 }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={playerHeadshotUrl(playerId)}
      alt={name}
      width={size}
      height={size}
      style={{ objectFit:'cover', borderRadius:'50%', flexShrink:0 }}
      onError={() => setErr(true)}
    />
  );
}
