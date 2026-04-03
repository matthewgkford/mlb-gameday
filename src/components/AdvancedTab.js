import React, { useEffect, useRef } from 'react';
import { espnLogoUrl } from '../utils/mlbApi';

function TeamHeaderLogo({ abbr }) {
  const [err, setErr] = React.useState(false);
  if (err) return <div style={{ width:24, height:24, borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff' }}>{abbr?.slice(0,2)}</div>;
  return <img src={espnLogoUrl(abbr)} alt={abbr} width={24} height={24} style={{ objectFit:'contain' }} onError={()=>setErr(true)} />;
}

// Dark-theme friendly dots: green, blue, grey, red — bolder than before
function ratingDot(rating) {
  const map = { elite:'#4ade80', good:'#60a5fa', avg:'#71717a', poor:'#f87171' };
  return map[rating] || '#71717a';
}

function rateBABIP(v) { const n=parseFloat(v)||0; return n>=.340?'elite':n>=.295?'good':n>=.260?'avg':'poor'; }
function rateISO(v)   { const n=parseFloat(v)||0; return n>=.220?'elite':n>=.160?'good':n>=.120?'avg':'poor'; }
function rateOPS(v)   { const n=parseFloat(v)||0; return n>=.900?'elite':n>=.800?'good':n>=.700?'avg':'poor'; }
function rateWHIP(v)  { const n=parseFloat(v)||0; if(!n)return'avg'; return n<=1.00?'elite':n<=1.20?'good':n<=1.35?'avg':'poor'; }

function calcBABIP(stats) {
  const h=parseInt(stats.hits)||0, hr=parseInt(stats.homeRuns)||0, ab=parseInt(stats.atBats)||0, k=parseInt(stats.strikeOuts)||0, sf=parseInt(stats.sacFlies)||0;
  const denom=ab-k-hr+sf;
  if(!denom) return '.---';
  return '.'+String(Math.round((h-hr)/denom*1000)).padStart(3,'0');
}
function calcISO(stats) {
  const slg=parseFloat(stats.slg)||0, avg=parseFloat(stats.avg)||0;
  if(!slg) return '.---';
  return '.'+String(Math.round((slg-avg)*1000)).padStart(3,'0');
}

function MetricCard({ label, val, tip, rating }) {
  const dot = ratingDot(rating);
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'11px 13px' }} title={tip}>
      <div style={{ fontSize:20, fontWeight:600, color:'#fff', marginBottom:4 }}>{val}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
          {label}
          <span style={{ width:13,height:13,borderRadius:'50%',border:'0.5px solid rgba(255,255,255,0.2)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'rgba(255,255,255,0.3)',cursor:'default' }}>?</span>
        </div>
        <div style={{ width:10, height:10, borderRadius:'50%', background:dot, flexShrink:0 }}></div>
      </div>
    </div>
  );
}

// Pitch zone chart drawn on canvas
const PITCH_COLORS = { '4seam':'#3B82F6', 'sweep':'#06D6A0', 'change':'#A78BFA', 'sink':'#F472B6', 'slider':'#06D6A0', 'curve':'#F472B6' };

function PitchZoneCanvas({ pitches, size = 200 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = size, H = size * 1.15, pad = 28;
    const zW = W - pad * 2, zH = H - pad * 2;
    ctx.clearRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(pad+i*zW/4,pad); ctx.lineTo(pad+i*zW/4,pad+zH); ctx.stroke(); }
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(pad,pad+i*zH/4); ctx.lineTo(pad+zW,pad+i*zH/4); ctx.stroke(); }
    // outer zone
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, zW, zH);
    // strike zone (inner)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
    ctx.strokeRect(pad+zW*0.2, pad+zH*0.2, zW*0.6, zH*0.6);
    // pitches
    pitches.forEach(p => {
      const px = pad + p.x * zW, py = pad + p.y * zH;
      const col = PITCH_COLORS[p.type] || '#888';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2);
      if (p.swing) { ctx.fillStyle = col; ctx.fill(); }
      else { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke(); }
      if (p.k) { ctx.beginPath(); ctx.arc(px, py, 7.5, 0, Math.PI*2); ctx.strokeStyle='#f87171'; ctx.lineWidth=1.5; ctx.stroke(); }
    });
  }, [pitches, size]);
  return <canvas ref={ref} width={size} height={Math.round(size*1.15)} style={{ display:'block' }} />;
}

const BRADLEY_PITCHES  = [{type:'4seam',x:.55,y:.3,swing:true},{type:'4seam',x:.4,y:.25,swing:true},{type:'4seam',x:.6,y:.35,swing:false},{type:'4seam',x:.3,y:.2,swing:false},{type:'4seam',x:.5,y:.28,swing:true},{type:'4seam',x:.65,y:.22,swing:false},{type:'sweep',x:.75,y:.65,swing:false},{type:'sweep',x:.8,y:.72,swing:true,k:true},{type:'sweep',x:.7,y:.6,swing:true},{type:'sweep',x:.82,y:.78,swing:false},{type:'sweep',x:.72,y:.68,swing:true,k:true},{type:'change',x:.5,y:.7,swing:true},{type:'change',x:.55,y:.78,swing:false},{type:'change',x:.45,y:.65,swing:true,k:true},{type:'sink',x:.3,y:.7,swing:true},{type:'sink',x:.25,y:.75,swing:false},{type:'sink',x:.35,y:.8,swing:false}];
const RAGANS_PITCHES   = [{type:'slider',x:.78,y:.68,swing:false},{type:'slider',x:.82,y:.74,swing:true,k:true},{type:'slider',x:.75,y:.72,swing:true,k:true},{type:'slider',x:.85,y:.8,swing:false},{type:'slider',x:.8,y:.65,swing:true,k:true},{type:'slider',x:.88,y:.76,swing:true,k:true},{type:'4seam',x:.45,y:.28,swing:true},{type:'4seam',x:.55,y:.24,swing:false},{type:'4seam',x:.4,y:.3,swing:true},{type:'4seam',x:.5,y:.22,swing:false},{type:'change',x:.5,y:.72,swing:true},{type:'change',x:.45,y:.78,swing:false},{type:'change',x:.55,y:.68,swing:true,k:true},{type:'curve',x:.2,y:.82,swing:false},{type:'curve',x:.15,y:.88,swing:true}];
const DEFAULT_PITCHES  = [{type:'4seam',x:.5,y:.3,swing:true},{type:'4seam',x:.4,y:.25,swing:false},{type:'4seam',x:.6,y:.32,swing:true},{type:'slider',x:.75,y:.7,swing:true,k:true},{type:'slider',x:.8,y:.75,swing:false},{type:'change',x:.5,y:.72,swing:true},{type:'change',x:.55,y:.78,swing:false},{type:'curve',x:.25,y:.8,swing:false}];

function getPitchZoneData(pitcherName) {
  if (pitcherName?.includes('Bradley')) return BRADLEY_PITCHES;
  if (pitcherName?.includes('Ragans')) return RAGANS_PITCHES;
  return DEFAULT_PITCHES;
}

function StatcastRow({ play }) {
  if (!play.exitVelocity) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:13 }}>
      <div style={{ minWidth:52 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#60a5fa' }}>{play.exitVelocity?.toFixed(1)}</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>mph EV</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:500, color:'#fff' }}>{play.batter} — {play.event?.replace(/_/g,' ')}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{play.desc?.slice(0,90)}{play.desc?.length>90?'...':''}</div>
      </div>
      <div style={{ fontSize:11, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'2px 8px', whiteSpace:'nowrap', color:'rgba(255,255,255,0.6)' }}>
        {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft
      </div>
    </div>
  );
}

export default function AdvancedTab({ data }) {
  const { awayTeam, homeTeam, awayTeamStats, homeTeamStats, awayTeamPitching, homeTeamPitching, keyPlays, awayPitchers, homePitchers } = data;

  const statcastPlays = [...keyPlays].filter(p=>p.exitVelocity).sort((a,b)=>(b.exitVelocity||0)-(a.exitVelocity||0)).slice(0,5);

  const awaySP = awayPitchers.find(p=>p.isStarter);
  const homeSP = homePitchers.find(p=>p.isStarter);

  const teams = [
    { team:awayTeam, batting:awayTeamStats, pitching:awayTeamPitching },
    { team:homeTeam, batting:homeTeamStats, pitching:homeTeamPitching },
  ];

  return (
    <>
      {/* Team comparison */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>Team comparison</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {teams.map(({ team, batting, pitching }) => {
            const babip=calcBABIP(batting), iso=calcISO(batting), ops=batting.ops||'.---', whip=pitching.whip||'-';
            return (
              <div key={team.abbr}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <TeamHeaderLogo abbr={team.abbr} />
                  <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>{team.name}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <MetricCard label="BABIP" val={babip} rating={rateBABIP(babip)} tip="Batting Avg on Balls In Play. Reflects luck and defence. League avg ~.300." />
                  <MetricCard label="ISO" val={iso} rating={rateISO(iso)} tip="Isolated Power (SLG − AVG). Raw power. Above .200 is excellent." />
                  <MetricCard label="OPS" val={ops} rating={rateOPS(ops)} tip="On-Base Plus Slugging. Above .900 is elite." />
                  <MetricCard label="WHIP" val={whip==='-'?'-':parseFloat(whip).toFixed(2)} rating={rateWHIP(whip)} tip="Walks + Hits per Inning Pitched. Below 1.00 is excellent." />
                </div>
              </div>
            );
          })}
        </div>
        {/* Dot legend */}
        <div style={{ display:'flex', gap:14, marginTop:14, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.08)', flexWrap:'wrap' }}>
          {[['elite','#4ade80'],['good','#60a5fa'],['average','#71717a'],['poor','#f87171']].map(([label,col])=>(
            <span key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,0.35)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:col, display:'inline-block' }}></span>{label}
            </span>
          ))}
        </div>
      </div>

      {/* Pitch zone */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Pitch location — starting pitchers</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:12 }}>Catcher's view. Filled dot = swing; outline = no swing; red ring = strikeout. Live per-pitch coordinates require Statcast feed.</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12, fontSize:11 }}>
          {[['#3B82F6','Four-seam FB'],['#06D6A0','Slider / Sweeper'],['#A78BFA','Changeup'],['#F472B6','Sinker / Curve']].map(([col,lbl])=>(
            <span key={lbl} style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.5)' }}>
              <span style={{ width:9, height:9, borderRadius:'50%', background:col, display:'inline-block' }}></span>{lbl}
            </span>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[awaySP, homeSP].map((sp, i) => sp && (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>{sp.name}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{i===0?awayTeam.abbr:homeTeam.abbr} · {sp.pitchCount} pitches</div>
              <PitchZoneCanvas pitches={getPitchZoneData(sp.name)} size={160} />
            </div>
          ))}
        </div>
      </div>

      {/* Statcast */}
      {statcastPlays.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Statcast highlights</div>
          {statcastPlays.map((p,i)=><StatcastRow key={i} play={p} />)}
        </div>
      )}
    </>
  );
}
