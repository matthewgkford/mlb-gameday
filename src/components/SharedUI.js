import React from 'react';

// Trending arrow icon replaces dots everywhere
export function TrendArrow({ rating, size = 12 }) {
  const map = {
    elite: { color: '#4ade80', path: 'M6 10 L10 4 L14 10', label: 'elite' },
    good:  { color: '#60a5fa', path: 'M6 9 L10 4 L14 9',  label: 'good' },
    avg:   { color: '#71717a', path: 'M6 8 L14 8',         label: 'avg' },
    poor:  { color: '#f87171', path: 'M6 6 L10 11 L14 6', label: 'poor' },
  };
  const m = map[rating] || map.avg;
  const isUp = rating === 'elite' || rating === 'good';
  const isDown = rating === 'poor';
  const isFlat = rating === 'avg';

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, display:'inline-block' }} title={m.label}>
      {isUp && (
        <>
          <polyline points="4,14 10,6 16,14" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <polyline points="10,6 16,6 16,14" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
        </>
      )}
      {isDown && (
        <>
          <polyline points="4,6 10,14 16,6" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <polyline points="10,14 16,14 16,6" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
        </>
      )}
      {isFlat && (
        <line x1="3" y1="10" x2="17" y2="10" stroke={m.color} strokeWidth="2.5" strokeLinecap="round"/>
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
  if (err) return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:'#1e293b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.3,fontWeight:700,color:'#fff',flexShrink:0 }}>
      {abbr?.slice(0,2)}
    </div>
  );
  return (
    <img
      src={`https://a.espncdn.com/i/teamlogos/mlb/500/${abbr?.toLowerCase()}.png`}
      alt={abbr} width={size} height={size}
      style={{ objectFit:'contain', flexShrink:0 }}
      onError={()=>setErr(true)}
    />
  );
}
