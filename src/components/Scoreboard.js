import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { espnLogoUrl } from '../utils/mlbApi';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

function TeamLogo({ abbr, size = 56 }) {
  const [err, setErr] = React.useState(false);
  if (err) return <div style={{ width:size,height:size,borderRadius:'50%',background:'#1e293b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.25,fontWeight:700,color:'#fff' }}>{abbr?.slice(0,2)}</div>;
  return <img src={espnLogoUrl(abbr)} alt={abbr} width={size} height={size} style={{ objectFit:'contain' }} onError={()=>setErr(true)} />;
}

function Base({ occupied }) {
  return <div style={{ width:12,height:12,borderRadius:2,background: occupied ? '#fbbf24' : 'rgba(255,255,255,0.15)',transform:'rotate(45deg)',border: occupied ? 'none' : '1px solid rgba(255,255,255,0.2)' }}></div>;
}

function BaseDiamond({ onFirst, onSecond, onThird }) {
  return (
    <div style={{ position:'relative', width:44, height:44, flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:'50%', transform:'translateX(-50%)' }}><Base occupied={onSecond} /></div>
      <div style={{ position:'absolute', top:'50%', right:2, transform:'translateY(-50%)' }}><Base occupied={onFirst} /></div>
      <div style={{ position:'absolute', top:'50%', left:2, transform:'translateY(-50%)' }}><Base occupied={onThird} /></div>
      <div style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:12,height:12,borderRadius:2,background:'rgba(255,255,255,0.08)',transform:'translateX(-50%) rotate(45deg)' }}></div>
    </div>
  );
}

function WinProbChart({ winProb, awayAbbr, homeAbbr }) {
  if (!winProb || winProb.vals.length < 3) return null;
  const data = {
    labels: winProb.labels,
    datasets: [
      { label: awayAbbr, data: winProb.vals, borderColor:'#C6002C', backgroundColor:'rgba(198,0,44,0.07)', fill:true, tension:0.35, pointRadius:2, pointBackgroundColor:'#C6002C', borderWidth:2 },
      { label: homeAbbr, data: winProb.vals.map(v=>100-v), borderColor:'#004687', backgroundColor:'rgba(0,70,135,0.05)', fill:true, tension:0.35, pointRadius:2, pointBackgroundColor:'#004687', borderWidth:2 },
    ],
  };
  const opts = {
    responsive:true, maintainAspectRatio:false,
    scales:{
      y:{ min:0,max:100, ticks:{ callback:v=>v+'%', font:{size:9}, color:'rgba(255,255,255,0.3)' }, grid:{ color:'rgba(255,255,255,0.05)' }, border:{display:false} },
      x:{ ticks:{ font:{size:9}, color:'rgba(255,255,255,0.3)', maxRotation:0, autoSkip:true, maxTicksLimit:10 }, grid:{display:false}, border:{display:false} },
    },
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>`${ctx.dataset.label}: ${ctx.raw}%` } } },
  };
  return (
    <div style={{ marginTop:14, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
        <span>Win probability</span>
        <span style={{ display:'flex', gap:12 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10,height:2,background:'#C6002C',display:'inline-block',borderRadius:1 }}></span>{awayAbbr}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10,height:2,background:'#004687',display:'inline-block',borderRadius:1 }}></span>{homeAbbr}</span>
        </span>
      </div>
      <div style={{ height:120 }}><Line data={data} options={opts} /></div>
    </div>
  );
}

export default function Scoreboard({ data, lastUpdated, onBack, isLive }) {
  if (!data) return null;
  const { awayTeam, homeTeam, awayScore, homeScore, innings, awayHits, homeHits, awayErrors, homeErrors, status, inning, inningHalf, outs, balls, strikes, onFirst, onSecond, onThird, currentBatter, currentPitcher, decisions, weather, venue, winProb } = data;
  const isFinal = status === 'Final';
  const awayWins = isFinal && awayScore > homeScore;
  const homeWins = isFinal && homeScore > awayScore;

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'18px 18px 14px', marginBottom:12 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'4px 10px', fontSize:12, color:'rgba(255,255,255,0.6)', cursor:'pointer', marginBottom:5, fontFamily:'inherit' }}>← Games</button>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>{venue}</div>
        </div>
        {weather?.temp && (
          <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'4px 10px', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
            <span>{weather.temp}°F / {Math.round((weather.temp-32)*5/9)}°C</span>
            <span>· {weather.condition}</span>
          </div>
        )}
      </div>

      {/* Score */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginBottom:14 }}>
        <div style={{ textAlign:'center', minWidth:100, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <TeamLogo abbr={awayTeam.abbr} size={52} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{awayTeam.name}</div>
        </div>
        <div style={{ fontSize:50, fontWeight:700, color: awayWins?'#60a5fa':'#fff', padding:'0 14px', lineHeight:1 }}>{awayScore}</div>
        <div style={{ fontSize:22, color:'rgba(255,255,255,0.2)' }}>–</div>
        <div style={{ fontSize:50, fontWeight:700, color: homeWins?'#60a5fa':'#fff', padding:'0 14px', lineHeight:1 }}>{homeScore}</div>
        <div style={{ textAlign:'center', minWidth:100, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <TeamLogo abbr={homeTeam.abbr} size={52} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{homeTeam.name}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{ textAlign:'center', marginBottom:12 }}>
        {isFinal ? (
          <div>
            <span style={{ background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'3px 14px', fontSize:12, color:'rgba(255,255,255,0.4)' }}>Final</span>
            {decisions.winner && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>W: {decisions.winner.fullName} · L: {decisions.loser?.fullName}{decisions.save ? ` · SV: ${decisions.save.fullName}` : ''}</div>}
          </div>
        ) : isLive ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ background:'#dc2626', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700, color:'#fff', letterSpacing:0.5 }}>
              <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#fff', marginRight:4, animation:'pulse 1.5s infinite' }}></span>
              LIVE
            </span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>{inningHalf} {inning}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <BaseDiamond onFirst={onFirst} onSecond={onSecond} onThird={onThird} />
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>
                <div>{outs} out{outs!==1?'s':''}</div>
                <div>{balls}–{strikes}</div>
              </div>
            </div>
          </div>
        ) : (
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>Scheduled</span>
        )}
      </div>

      {/* Linescore */}
      {innings.length > 0 && (
        <div style={{ overflowX:'auto', marginBottom:4 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:360 }}>
            <thead>
              <tr>
                <td style={{ padding:'3px 6px', color:'rgba(255,255,255,0.25)', width:44 }}></td>
                {innings.map(i=><td key={i.num} style={{ padding:'3px 3px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>{i.num}</td>)}
                <td style={{ padding:'3px 6px', textAlign:'center', color:'rgba(255,255,255,0.5)', fontWeight:600, borderLeft:'0.5px solid rgba(255,255,255,0.08)' }}>R</td>
                <td style={{ padding:'3px 3px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>H</td>
                <td style={{ padding:'3px 3px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>E</td>
              </tr>
            </thead>
            <tbody>
              {[['away',awayTeam.abbr,awayScore,awayHits,awayErrors],['home',homeTeam.abbr,homeScore,homeHits,homeErrors]].map(([side,abbr,r,h,e])=>(
                <tr key={side} style={{ borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding:'5px 6px', fontWeight:600, color:'#fff', fontSize:12 }}>{abbr}</td>
                  {innings.map(inn=>{
                    const half=inn[side]||{};
                    const val=half.runs;
                    return <td key={inn.num} style={{ padding:'5px 3px', textAlign:'center', color:val>0?'#fff':'rgba(255,255,255,0.25)', fontWeight:val>0?600:400 }}>{val!==undefined?val:'–'}</td>;
                  })}
                  <td style={{ padding:'5px 6px', textAlign:'center', fontWeight:700, color:'#60a5fa', borderLeft:'0.5px solid rgba(255,255,255,0.08)' }}>{r}</td>
                  <td style={{ padding:'5px 3px', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>{h}</td>
                  <td style={{ padding:'5px 3px', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {winProb && winProb.vals.length > 2 && (
        <WinProbChart winProb={winProb} awayAbbr={awayTeam.abbr} homeAbbr={homeTeam.abbr} />
      )}

      {isLive && lastUpdated && (
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'right', marginTop:8 }}>Updated {lastUpdated.toLocaleTimeString()}</div>
      )}
    </div>
  );
}
