import React, { useState } from 'react';

const EVENT_META = {
  home_run:         { label:'HR',  color:'#60a5fa', bg:'rgba(96,165,250,0.12)' },
  strikeout:        { label:'K',   color:'#f87171', bg:'rgba(248,113,113,0.12)' },
  walk:             { label:'BB',  color:'#4ade80', bg:'rgba(74,222,128,0.12)' },
  intentional_walk: { label:'IBB', color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
  double:           { label:'2B',  color:'#a78bfa', bg:'rgba(167,139,250,0.12)' },
  triple:           { label:'3B',  color:'#fb923c', bg:'rgba(251,146,60,0.12)' },
  single:           { label:'1B',  color:'rgba(255,255,255,0.6)', bg:'rgba(255,255,255,0.07)' },
  sac_fly:          { label:'SF',  color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
  field_error:      { label:'E',   color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
  hit_by_pitch:     { label:'HBP', color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
  double_play:      { label:'DP',  color:'rgba(255,255,255,0.4)', bg:'rgba(255,255,255,0.06)' },
  stolen_base:      { label:'SB',  color:'#06D6A0', bg:'rgba(6,214,160,0.1)' },
  caught_stealing:  { label:'CS',  color:'#f87171', bg:'rgba(248,113,113,0.1)' },
  wild_pitch:       { label:'WP',  color:'#fbbf24', bg:'rgba(251,191,36,0.08)' },
  passed_ball:      { label:'PB',  color:'#fbbf24', bg:'rgba(251,191,36,0.08)' },
};

function levColor(lev) {
  if (lev >= 2.0) return '#9333EA';
  if (lev >= 1.5) return '#6366F1';
  if (lev >= 1.0) return '#3B82F6';
  return '#06D6A0';
}

function estimateLev(play) {
  const inn = play.inning || 0;
  const diff = Math.abs((play.awayScore||0) - (play.homeScore||0));
  if (inn >= 9 && diff <= 1) return 2.1;
  if (inn >= 8 && diff <= 1) return 1.6;
  if (inn >= 7 && diff <= 2) return 1.3;
  if (inn >= 6 && diff <= 2) return 1.1;
  if (play.rbi > 0 || play.event === 'home_run') return 1.0;
  return 0.6;
}

function PlayCard({ play, delay }) {
  const meta = EVENT_META[play.event] || { label:play.event?.replace(/_/g,' ')||'?', color:'#94a3b8', bg:'rgba(148,163,184,0.1)' };
  const isTop = play.half === 'top';
  const lev = estimateLev(play);
  const levPct = Math.min(100, lev/2.5*100);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'start', padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)', animation:`fadeIn 0.3s ease forwards`, animationDelay:`${delay}ms`, opacity:0 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:38 }}>
        <span style={{ fontSize:11, fontWeight:600, background:isTop?'rgba(251,191,36,0.12)':'rgba(167,139,250,0.12)', color:isTop?'#fbbf24':'#a78bfa', borderRadius:7, padding:'2px 6px', whiteSpace:'nowrap' }}>{play.inning}</span>
        <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{isTop?'Top':'Bot'}</span>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:2, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          {play.batter}
          {play.rbi > 0 && <span style={{ fontSize:10, background:'rgba(96,165,250,0.15)', color:'#93c5fd', borderRadius:6, padding:'1px 5px', fontWeight:500 }}>{play.rbi} RBI</span>}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.5, marginBottom:3 }}>{play.desc}</div>
        {play.exitVelocity && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:3 }}>{play.exitVelocity?.toFixed(1)} mph · {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft</div>}
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>Score: {play.awayScore}–{play.homeScore}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>Pressure LI {lev.toFixed(1)}</span>
          <div style={{ width:50, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
            <div className="lev-bar-fill" style={{ '--target-width':`${levPct}%`, height:'100%', background:levColor(lev), borderRadius:2, width:`${levPct}%` }} />
          </div>
          <span style={{ fontSize:9, color:levColor(lev), fontWeight:600 }}>{lev>=2?'Critical':lev>=1.5?'High':lev>=1?'Moderate':'Low'}</span>
        </div>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:meta.color, background:meta.bg, borderRadius:8, padding:'3px 8px', whiteSpace:'nowrap', alignSelf:'start', marginTop:1 }}>{meta.label}</span>
    </div>
  );
}

export default function TimelineTab({ data }) {
  const { keyPlays, awayTeam, homeTeam } = data;
  const [filter, setFilter] = useState('key');

  const filters = [
    { id:'key',      label:'Key moments' },
    { id:'away',     label:awayTeam.abbr },
    { id:'home',     label:homeTeam.abbr },
    { id:'home_run', label:'Home runs' },
    { id:'scoring',  label:'Scoring plays' },
    { id:'high_lev', label:'High pressure' },
    { id:'all',      label:'All captured' },
  ];

  const filtered = keyPlays.filter(p => {
    if (filter === 'all')      return true;
    if (filter === 'key')      return p.event === 'home_run' || p.rbi > 0 || estimateLev(p) >= 1.0 || ['double','triple','stolen_base'].includes(p.event);
    if (filter === 'home_run') return p.event === 'home_run';
    if (filter === 'away')     return p.half === 'top';
    if (filter === 'home')     return p.half === 'bottom';
    if (filter === 'scoring')  return p.rbi > 0 || p.event === 'home_run';
    if (filter === 'high_lev') return estimateLev(p) >= 1.5;
    return true;
  });

  return (
    <div className="tab-panel">
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:12, lineHeight:1.7 }}>
          <strong style={{ color:'rgba(255,255,255,0.5)' }}>Pressure (LI):</strong> how much this at-bat could swing the outcome — average is 1.0<br/>
          <strong style={{ color:'rgba(255,255,255,0.4)' }}>Note:</strong> Shows notable plays only. Full pitch-by-pitch requires a Statcast subscription.
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding:'5px 12px', fontSize:12, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background:filter===f.id?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.06)', color:filter===f.id?'#fff':'rgba(255,255,255,0.5)', fontWeight:filter===f.id?600:400 }}>
              {f.label}
            </button>
          ))}
        </div>
        {!filtered.length && <div style={{ textAlign:'center', padding:'30px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No plays to show</div>}
        {filtered.map((p, i) => <PlayCard key={i} play={p} delay={i * 25} />)}
      </div>
    </div>
  );
}
