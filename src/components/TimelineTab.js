import React, { useState } from 'react';

const EVENT_META = {
  home_run: { label:'HR', color:'#60a5fa', bg:'rgba(96,165,250,0.12)' },
  strikeout: { label:'K', color:'#f87171', bg:'rgba(248,113,113,0.12)' },
  walk: { label:'BB', color:'#4ade80', bg:'rgba(74,222,128,0.12)' },
  double: { label:'2B', color:'#a78bfa', bg:'rgba(167,139,250,0.12)' },
  triple: { label:'3B', color:'#fb923c', bg:'rgba(251,146,60,0.12)' },
  single: { label:'1B', color:'rgba(255,255,255,0.6)', bg:'rgba(255,255,255,0.07)' },
  sac_fly: { label:'SF', color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
  field_error: { label:'E', color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
};

function levColor(lev) {
  if (lev >= 2.0) return '#9333EA';
  if (lev >= 1.5) return '#6366F1';
  if (lev >= 1.0) return '#3B82F6';
  return '#06D6A0';
}

function PlayCard({ play }) {
  const meta = EVENT_META[play.event] || { label: play.event, color:'#94a3b8', bg:'rgba(148,163,184,0.1)' };
  const isTop = play.half === 'top';
  const isScoring = play.rbi > 0 || play.event === 'home_run';
  const lev = play.lev || 0;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'start', padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:38 }}>
        <span style={{ fontSize:11, fontWeight:600, background: isTop?'rgba(251,191,36,0.12)':'rgba(167,139,250,0.12)', color: isTop?'#fbbf24':'#a78bfa', borderRadius:7, padding:'2px 6px', whiteSpace:'nowrap' }}>{play.inning}</span>
        <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{isTop?'Top':'Bot'}</span>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:2, display:'flex', alignItems:'center', gap:6 }}>
          {play.batter}
          {isScoring && <span style={{ fontSize:10, background:'rgba(96,165,250,0.15)', color:'#93c5fd', borderRadius:6, padding:'1px 5px', fontWeight:500 }}>{play.rbi} RBI</span>}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:3 }}>{play.desc}</div>
        {play.exitVelocity && (
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:3 }}>
            {play.exitVelocity?.toFixed(1)} mph EV · {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft
          </div>
        )}
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Score: {play.awayScore}–{play.homeScore}</div>
        {lev > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Pressure LI {lev.toFixed(1)}</span>
            <div style={{ width:50, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
              <div style={{ width:`${Math.min(100,lev/2.5*100)}%`, height:'100%', background:levColor(lev), borderRadius:2 }}></div>
            </div>
          </div>
        )}
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:meta.color, background:meta.bg, borderRadius:8, padding:'3px 8px', whiteSpace:'nowrap', alignSelf:'start', marginTop:1 }}>{meta.label}</span>
    </div>
  );
}

export default function TimelineTab({ data }) {
  const { keyPlays, awayTeam, homeTeam } = data;
  const [filter, setFilter] = useState('all');

  const filters = [
    { id:'all', label:'All' },
    { id:'away', label:awayTeam.abbr },
    { id:'home', label:homeTeam.abbr },
    { id:'home_run', label:'Home runs' },
    { id:'scoring', label:'Scoring plays' },
  ];

  const filtered = keyPlays.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'home_run') return p.event === 'home_run';
    if (filter === 'away') return p.half === 'top';
    if (filter === 'home') return p.half === 'bottom';
    if (filter === 'scoring') return p.rbi > 0 || p.event === 'home_run';
    return true;
  });

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:12, lineHeight:1.6 }}>
        <strong style={{ color:'rgba(255,255,255,0.5)' }}>Inning:</strong> "Top" = away team batting · "Bot" = home team batting.<br/>
        <strong style={{ color:'rgba(255,255,255,0.5)' }}>Pressure (LI):</strong> how much this at-bat could swing the game. Average = 1.0.
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {filters.map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{ padding:'5px 12px', fontSize:12, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background: filter===f.id?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.06)', color: filter===f.id?'#fff':'rgba(255,255,255,0.5)', fontWeight: filter===f.id?600:400 }}>
            {f.label}
          </button>
        ))}
      </div>
      {!filtered.length && <div style={{ textAlign:'center', padding:'30px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No plays yet</div>}
      {filtered.map((p,i) => <PlayCard key={i} play={p} />)}
    </div>
  );
}
