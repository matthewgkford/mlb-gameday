import React, { useEffect, useRef, useState } from 'react';
import { TeamLogo, TrendArrow, rateBABIP, rateISO, rateOPS, rateWHIP, calcBABIP, calcISO } from './SharedUI';
import { KNOWN_ARSENALS, getPitcherZoneData, getHeadToHead } from '../utils/mlbApi';

const PITCH_COLORS = { '4seam':'#3B82F6','sweep':'#06D6A0','change':'#A78BFA','sink':'#F472B6','slider':'#06D6A0','curve':'#F472B6' };

function PitchZoneCanvas({ pitches, size=180 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext('2d');
    const W=size, H=Math.round(size*1.15), pad=26;
    const zW=W-pad*2, zH=H-pad*2;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(pad+i*zW/4,pad);ctx.lineTo(pad+i*zW/4,pad+zH);ctx.stroke();}
    for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(pad,pad+i*zH/4);ctx.lineTo(pad+zW,pad+i*zH/4);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=1.5; ctx.strokeRect(pad,pad,zW,zH);
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2; ctx.strokeRect(pad+zW*0.2,pad+zH*0.2,zW*0.6,zH*0.6);
    pitches.forEach(p=>{
      const px=pad+p.x*zW, py=pad+p.y*zH;
      const col=PITCH_COLORS[p.type]||'#888';
      ctx.beginPath(); ctx.arc(px,py,4.5,0,Math.PI*2);
      if(p.swing){ctx.fillStyle=col;ctx.fill();}
      else{ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.stroke();}
      if(p.k){ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.strokeStyle='#f87171';ctx.lineWidth=1.5;ctx.stroke();}
    });
  },[pitches,size]);
  return <canvas ref={ref} width={size} height={Math.round(size*1.15)} style={{ display:'block' }} />;
}

function MetricCard({ label, val, tip, rating }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'11px 13px' }} title={tip}>
      <div style={{ fontSize:20, fontWeight:600, color:'#fff', marginBottom:4 }}>{val}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
          {label}
          <span style={{ width:13,height:13,borderRadius:'50%',border:'0.5px solid rgba(255,255,255,0.2)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'rgba(255,255,255,0.3)',cursor:'default' }}>?</span>
        </div>
        <TrendArrow rating={rating} size={13} />
      </div>
    </div>
  );
}

function StatcastRow({ play }) {
  if(!play.exitVelocity) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ minWidth:52 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#60a5fa' }}>{play.exitVelocity?.toFixed(1)}</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>mph EV</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:500, color:'#fff', fontSize:13 }}>{play.batter} — {play.event?.replace(/_/g,' ')}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{play.desc?.slice(0,90)}{play.desc?.length>90?'...':''}</div>
      </div>
      <div style={{ fontSize:11, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'2px 8px', whiteSpace:'nowrap', color:'rgba(255,255,255,0.6)' }}>
        {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft
      </div>
    </div>
  );
}

function HeadToHead({ awayTeam, homeTeam }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!awayTeam.id||!homeTeam.id){setLoading(false);return;}
    getHeadToHead(awayTeam.id, homeTeam.id)
      .then(setGames).catch(()=>{}).finally(()=>setLoading(false));
  },[awayTeam.id,homeTeam.id]);

  if(loading) return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>Loading series history...</div>;
  if(!games.length) return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>No previous meetings this season</div>;

  const awayWins = games.filter(g=>{
    const awayS=g.teams?.away?.score??0, homeS=g.teams?.home?.score??0;
    const isAway=g.teams?.away?.team?.id===awayTeam.id;
    return isAway?awayS>homeS:homeS>awayS;
  }).length;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <TeamLogo abbr={awayTeam.abbr} size={22} />
          <span style={{ fontSize:20, fontWeight:700, color:'#fff' }}>{awayWins}</span>
        </div>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>–</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:20, fontWeight:700, color:'#fff' }}>{games.length-awayWins}</span>
          <TeamLogo abbr={homeTeam.abbr} size={22} />
        </div>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginLeft:4 }}>season series</span>
      </div>
      {games.slice(-5).reverse().map((g,i)=>{
        const aScore=g.teams?.away?.score??0, hScore=g.teams?.home?.score??0;
        const isAway=g.teams?.away?.team?.id===awayTeam.id;
        const awayActual=isAway?aScore:hScore, homeActual=isAway?hScore:aScore;
        const awayWon=awayActual>homeActual;
        const date=new Date(g.gameDate).toLocaleDateString('en-US',{month:'short',day:'numeric'});
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:12 }}>
            <span style={{ color:'rgba(255,255,255,0.3)', minWidth:50 }}>{date}</span>
            <TeamLogo abbr={awayTeam.abbr} size={16} />
            <span style={{ fontWeight:awayWon?600:400, color:awayWon?'#60a5fa':'rgba(255,255,255,0.7)' }}>{awayActual}</span>
            <span style={{ color:'rgba(255,255,255,0.25)' }}>–</span>
            <span style={{ fontWeight:!awayWon?600:400, color:!awayWon?'#60a5fa':'rgba(255,255,255,0.7)' }}>{homeActual}</span>
            <TeamLogo abbr={homeTeam.abbr} size={16} />
            <span style={{ marginLeft:'auto', fontSize:11, color:awayWon?'#4ade80':'#f87171', fontWeight:500 }}>{awayWon?awayTeam.abbr+' W':homeTeam.abbr+' W'}</span>
          </div>
        );
      })}
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
                  <TeamLogo abbr={team.abbr} size={22} />
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
        <div style={{ display:'flex', gap:14, marginTop:14, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.08)', flexWrap:'wrap', fontSize:11, color:'rgba(255,255,255,0.3)' }}>
          {[['elite','↑↑ Well above avg'],['good','↑ Above avg'],['avg','→ League avg'],['poor','↓ Below avg']].map(([r,lbl])=>(
            <span key={r} style={{ display:'flex', alignItems:'center', gap:4 }}><TrendArrow rating={r} size={12} />{lbl}</span>
          ))}
        </div>
      </div>

      {/* Pitch zone */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Pitch zone — starting pitchers</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:12 }}>Representative zones based on season tendencies. Filled = swing; outline = no swing; red ring = strikeout. Historic data.</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12, fontSize:11 }}>
          {[['#3B82F6','Four-seam FB'],['#06D6A0','Slider/Sweeper'],['#A78BFA','Changeup'],['#F472B6','Sinker/Curve']].map(([col,lbl])=>(
            <span key={lbl} style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.45)' }}><span style={{ width:9,height:9,borderRadius:'50%',background:col,display:'inline-block' }}></span>{lbl}</span>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[[awaySP,awayTeam],[homeSP,homeTeam]].map(([sp,team],i)=>sp&&(
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>{sp.name}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{team.abbr} · {sp.pitchCount} pitches today</div>
              <PitchZoneCanvas pitches={getPitcherZoneData(KNOWN_ARSENALS[sp.name])} size={155} />
            </div>
          ))}
        </div>
      </div>

      {/* Statcast */}
      {statcastPlays.length>0 && (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Statcast highlights</div>
          {statcastPlays.map((p,i)=><StatcastRow key={i} play={p} />)}
        </div>
      )}

      {/* Head to head */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>Season series</div>
        <HeadToHead awayTeam={awayTeam} homeTeam={homeTeam} />
      </div>
    </>
  );
}
