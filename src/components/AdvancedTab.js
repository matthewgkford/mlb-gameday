import React from 'react';

function MetricCard({ label, val, tip, rating }) {
  const dotColors = { elite:'#90d4a8', good:'#90c4e8', avg:'#b8b8d0', poor:'#e8a0a0' };
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'11px 13px', position:'relative' }} title={tip}>
      <div style={{ fontSize:20, fontWeight:600, color:'#fff', marginBottom:4 }}>{val}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
          {label}
          <span style={{ width:13, height:13, borderRadius:'50%', border:'0.5px solid rgba(255,255,255,0.2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'rgba(255,255,255,0.3)', cursor:'default' }}>?</span>
        </div>
        <div style={{ width:10, height:10, borderRadius:'50%', background:dotColors[rating]||'#b8b8d0', flexShrink:0 }}></div>
      </div>
    </div>
  );
}

function rateBABIP(v) { const n=parseFloat(v)||0; return n>=.340?'elite':n>=.295?'good':n>=.270?'avg':'poor'; }
function rateISO(v) { const n=parseFloat(v)||0; return n>=.220?'elite':n>=.160?'good':n>=.120?'avg':'poor'; }
function rateOPS(v) { const n=parseFloat(v)||0; return n>=.900?'elite':n>=.800?'good':n>=.700?'avg':'poor'; }
function rateWHIP(v) { const n=parseFloat(v)||0; if(!n) return 'avg'; return n<=1.00?'elite':n<=1.20?'good':n<=1.35?'avg':'poor'; }

function calcBABIP(stats) {
  const h=parseInt(stats.hits)||0, hr=parseInt(stats.homeRuns)||0, ab=parseInt(stats.atBats)||0, k=parseInt(stats.strikeOuts)||0, sf=parseInt(stats.sacFlies)||0;
  const denom=ab-k-hr+sf;
  if(!denom) return '.---';
  return '.'+String(Math.round((h-hr)/denom*1000)).padStart(3,'0');
}

function calcISO(stats) {
  const slg=parseFloat(stats.slg)||0, avg=parseFloat(stats.avg)||0;
  const iso=slg-avg;
  if(!slg) return '.---';
  return '.'+String(Math.round(iso*1000)).padStart(3,'0');
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
        <div style={{ fontWeight:500, color:'#fff' }}>{play.batter} — {play.event?.replace('_',' ')}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{play.desc?.slice(0,80)}{play.desc?.length>80?'...':''}</div>
      </div>
      <div style={{ fontSize:11, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'2px 8px', whiteSpace:'nowrap', color:'rgba(255,255,255,0.6)' }}>
        {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft
      </div>
    </div>
  );
}

export default function AdvancedTab({ data }) {
  const { awayTeam, homeTeam, awayTeamStats, homeTeamStats, awayTeamPitching, homeTeamPitching, keyPlays } = data;

  const statcastPlays = keyPlays.filter(p => p.exitVelocity).sort((a,b) => (b.exitVelocity||0)-(a.exitVelocity||0)).slice(0,5);

  const riscpAway = keyPlays.filter(p=>p.half==='top'&&p.rbi>0).reduce((a,p)=>a+p.rbi,0);
  const riscpHome = keyPlays.filter(p=>p.half==='bottom'&&p.rbi>0).reduce((a,p)=>a+p.rbi,0);

  const teams = [
    { team:awayTeam, batting:awayTeamStats, pitching:awayTeamPitching },
    { team:homeTeam, batting:homeTeamStats, pitching:homeTeamPitching },
  ];

  return (
    <>
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>Team comparison</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {teams.map(({ team, batting, pitching }) => {
            const babip = calcBABIP(batting);
            const iso = calcISO(batting);
            const ops = batting.ops || '.---';
            const whip = pitching.whip || '-';
            return (
              <div key={team.abbr}>
                <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>{team.city} {team.name}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <MetricCard label="BABIP" val={babip} rating={rateBABIP(babip)} tip="Batting Avg on Balls In Play. Reflects luck and defence. League avg ~.300." />
                  <MetricCard label="ISO" val={iso} rating={rateISO(iso)} tip="Isolated Power (SLG − AVG). Raw power. League avg ~.150; above .200 is elite." />
                  <MetricCard label="OPS" val={ops} rating={rateOPS(ops)} tip="On-Base Plus Slugging. Above .900 is elite." />
                  <MetricCard label="WHIP" val={whip==='-'?'-':parseFloat(whip).toFixed(2)} rating={rateWHIP(whip)} tip="Walks + Hits per Inning Pitched. Below 1.00 is excellent." />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {statcastPlays.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Statcast highlights</div>
          {statcastPlays.map((p,i)=><StatcastRow key={i} play={p} />)}
        </div>
      )}

      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>RISP runs scored</div>
        <div style={{ display:'flex', gap:20 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:700, color:'#fff' }}>{riscpAway}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{awayTeam.abbr} RBI w/ RISP</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:700, color:'#fff' }}>{riscpHome}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{homeTeam.abbr} RBI w/ RISP</div>
          </div>
        </div>
      </div>
    </>
  );
}
