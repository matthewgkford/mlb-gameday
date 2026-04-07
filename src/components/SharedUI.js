import React from 'react';
import { playerHeadshotUrl } from '../utils/mlbApi';

// Trend arrows: double arrow for elite/poor, single for good/below avg, flat for average
export function TrendArrow({ rating, size = 13 }) {
  const green = '#4ade80';
  const ltgreen = '#86efac'; // lighter green for single arrow vs double
  const grey  = '#71717a';
  const red   = '#f87171';

  const Arrow = ({ color, direction, style = {} }) => (
    <svg width={size} height={size} viewBox="2 3 12 12" fill="none"
      style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}>
      {direction === 'up' && (
        <polyline points="3,13 8,4 13,13" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {direction === 'down' && (
        <polyline points="3,4 8,13 13,4" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {direction === 'flat' && (
        <line x1="3" y1="8.5" x2="13" y2="8.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );

  if (rating === 'elite') return (
    <span style={{ display:'inline-flex', flexDirection:'column', gap:0, alignItems:'center', verticalAlign:'middle' }}>
      <Arrow color={green} direction="up" style={{ marginBottom:-3 }} />
      <Arrow color={green} direction="up" />
    </span>
  );
  if (rating === 'good') return <Arrow color={ltgreen} direction="up" />;
  if (rating === 'avg')  return <Arrow color={grey} direction="flat" />;
  if (rating === 'poor') return <Arrow color={red} direction="down" />;
  // below average (very poor) — if ever needed, default poor to single down
  return <Arrow color={grey} direction="flat" />;
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

// All 30 MLB teams with their primary colours for inline SVG badges
const TEAM_STYLES = {
  ARI: { bg:'#A71930', text:'#E3D4AD', label:'ARI' },
  ATL: { bg:'#CE1141', text:'#EAAA00', label:'ATL' },
  BAL: { bg:'#DF4601', text:'#000000', label:'BAL' },
  BOS: { bg:'#BD3039', text:'#0C2340', label:'BOS' },
  CHC: { bg:'#0E3386', text:'#CC3433', label:'CHC' },
  CWS: { bg:'#27251F', text:'#C4CED4', label:'CWS' },
  CIN: { bg:'#C6011F', text:'#FFFFFF', label:'CIN' },
  CLE: { bg:'#00385D', text:'#E31937', label:'CLE' },
  COL: { bg:'#33006F', text:'#C4CED4', label:'COL' },
  DET: { bg:'#0C2340', text:'#FA4616', label:'DET' },
  HOU: { bg:'#002D62', text:'#EB6E1F', label:'HOU' },
  KC:  { bg:'#004687', text:'#C09A5B', label:'KC'  },
  LAA: { bg:'#BA0021', text:'#003263', label:'LAA' },
  LAD: { bg:'#005A9C', text:'#EF3E42', label:'LAD' },
  MIA: { bg:'#00A3E0', text:'#EF3340', label:'MIA' },
  MIL: { bg:'#12284B', text:'#FFC52F', label:'MIL' },
  MIN: { bg:'#002B5C', text:'#D31145', label:'MIN' },
  NYM: { bg:'#002D72', text:'#FF5910', label:'NYM' },
  NYY: { bg:'#003087', text:'#C4CED4', label:'NYY' },
  OAK: { bg:'#003831', text:'#EFB21E', label:'OAK' },
  PHI: { bg:'#E81828', text:'#002D62', label:'PHI' },
  PIT: { bg:'#FDB827', text:'#27251F', label:'PIT' },
  SD:  { bg:'#2F241D', text:'#FFC425', label:'SD'  },
  SF:  { bg:'#FD5A1E', text:'#27251F', label:'SF'  },
  SEA: { bg:'#0C2C56', text:'#005C5C', label:'SEA' },
  STL: { bg:'#C41E3A', text:'#FEDB00', label:'STL' },
  TB:  { bg:'#092C5C', text:'#8FBCE6', label:'TB'  },
  TEX: { bg:'#003278', text:'#C0111F', label:'TEX' },
  TOR: { bg:'#134A8E', text:'#E8291C', label:'TOR' },
  WSH: { bg:'#AB0003', text:'#14225A', label:'WSH' },
};

// Teams that use local logo files in /public/logos/ instead of ESPN CDN
// SVG for most, PNG for SD and COL
const LOCAL_LOGOS = {
  NYY: '/logos/nyy.svg',
  MIN: '/logos/min.svg',
  CWS: '/logos/cws.svg',
  MIA: '/logos/mia.svg',
  PIT: '/logos/pit.svg',
  ARI: '/logos/ari.svg',
  AZ:  '/logos/ari.svg',
  SD:  '/logos/sd.png',
  COL: '/logos/col.png',
  KC:  '/logos/kc.svg',
};

export function TeamLogo({ abbr, size = 24 }) {
  const [err, setErr] = React.useState(false);
  const style = TEAM_STYLES[abbr] || { bg:'#1e293b', text:'#ffffff', label:abbr?.slice(0,3)||'?' };
  const fontSize = size < 30 ? size * 0.32 : size * 0.28;
  const src = LOCAL_LOGOS[abbr] || `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr?.toLowerCase()}.png`;

  if (err) {
    return (
      <div style={{ width:size, height:size, borderRadius:size*0.22, background:style.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontSize, fontWeight:800, color:style.text, fontFamily:'Arial,sans-serif', letterSpacing:-0.5, userSelect:'none' }}>{style.label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
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
