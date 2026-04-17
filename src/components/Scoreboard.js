import React, { useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { TeamLogo } from './SharedUI';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

function WeatherIcon({ condition }) {
  const c = (condition||'').toLowerCase();
  if (c.includes('sun')||c.includes('clear')) return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.5" fill="#EF9F27"/>
      <line x1="8" y1="0.5" x2="8" y2="2.5" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="13.5" x2="8" y2="15.5" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="0.5" y1="8" x2="2.5" y2="8" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13.5" y1="8" x2="15.5" y2="8" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2.4" y1="2.4" x2="3.8" y2="3.8" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.2" y1="12.2" x2="13.6" y2="13.6" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13.6" y1="2.4" x2="12.2" y2="3.8" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.8" y1="12.2" x2="2.4" y2="13.6" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (c.includes('rain')||c.includes('shower')) return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="7" rx="5.5" ry="3.5" fill="#94a3b8"/>
      <ellipse cx="6" cy="5.5" rx="3" ry="2.5" fill="#94a3b8"/>
      <line x1="5" y1="11" x2="4" y2="14" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="11" x2="7" y2="14" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="11" x2="10" y2="14" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="10" rx="5.5" ry="3.5" fill="#94a3b8"/>
      <ellipse cx="6.5" cy="8" rx="3" ry="3" fill="#94a3b8"/>
      <ellipse cx="9.5" cy="7.5" rx="3.5" ry="3.5" fill="#94a3b8"/>
    </svg>
  );
}

function Base({ occupied }) {
  return <div style={{ width:11, height:11, borderRadius:2, background:occupied?'#fbbf24':'rgba(255,255,255,0.12)', transform:'rotate(45deg)', border:occupied?'none':'1px solid rgba(255,255,255,0.18)' }}></div>;
}

function BaseDiamond({ onFirst, onSecond, onThird }) {
  return (
    <div style={{ position:'relative', width:40, height:40, flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:'50%', transform:'translateX(-50%)' }}><Base occupied={onSecond} /></div>
      <div style={{ position:'absolute', top:'50%', right:2, transform:'translateY(-50%)' }}><Base occupied={onFirst} /></div>
      <div style={{ position:'absolute', top:'50%', left:2, transform:'translateY(-50%)' }}><Base occupied={onThird} /></div>
      <div style={{ position:'absolute', bottom:2, left:'50%', width:11, height:11, borderRadius:2, background:'rgba(255,255,255,0.06)', transform:'translateX(-50%) rotate(45deg)' }}></div>
    </div>
  );
}

// Team primary colours for win probability chart — chosen to be visible on dark backgrounds
// If two teams have similar hues, the away team will get a lighter variant
const TEAM_COLOURS = {
  NYM:'#006EFF', NYY:'#C4CED4', BOS:'#BD3039', TOR:'#134A8E', BAL:'#DF4601',
  TB:'#8FBCE6',  MIL:'#FFC52F', CHC:'#0E3386', CWS:'#C4CED4', MIN:'#D31145',
  DET:'#FA4616', CLE:'#E31937', KC:'#004687',  HOU:'#EB6E1F', LAA:'#BA0021',
  OAK:'#003831', ATH:'#003831', SEA:'#005C5C',
  LAD:'#005A9C', SF:'#FD5A1E',  SD:'#FFC425',  COL:'#333366', AZ:'#A71930',
  ATL:'#CE1141', MIA:'#00A3E0', PHI:'#E81828', WSH:'#AB0003',
  STL:'#C41E3A', PIT:'#FDB827', CIN:'#C6011F', CHC2:'#0E3386',
  TEX:'#003278', OAK2:'#EFB21E',
};
// Fallback palette for unknowns or clashes
const FALLBACK_PAIRS = [['#60a5fa','#f97316'],['#a78bfa','#34d399'],['#e879f9','#fbbf24']];

function colourDistance(hex1, hex2) {
  const parse = h => { const n=parseInt(h.replace('#',''),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const [r1,g1,b1]=parse(hex1), [r2,g2,b2]=parse(hex2);
  return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2);
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
}

function getTeamColours(homeAbbr, awayAbbr) {
  let hc = TEAM_COLOURS[homeAbbr] || '#60a5fa';
  let ac = TEAM_COLOURS[awayAbbr] || '#f97316';
  // If colours are too similar or either is too dark on our background, use fallback
  const dist = colourDistance(hc, ac);
  if (dist < 120) {
    // Pick from fallback pairs
    const pair = FALLBACK_PAIRS[0];
    hc = pair[0]; ac = pair[1];
  }
  return { homeColour: hc, awayColour: ac };
}

function WinProbChart({ winProb, awayAbbr, homeAbbr }) {
  if (!winProb || winProb.vals.length < 2) return null;
  const { homeColour, awayColour } = getTeamColours(homeAbbr, awayAbbr);
  const chartRef = useRef(null);

  const handleTouch = useCallback((e) => {
    e.preventDefault();
    const chart = chartRef.current;
    if (!chart) return;
    const touch = e.touches[0];
    const rect = chart.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    // Find nearest data index
    const datasetMeta = chart.getDatasetMeta(0);
    if (!datasetMeta.data.length) return;
    let nearest = 0, minDist = Infinity;
    datasetMeta.data.forEach((pt, i) => {
      const dist = Math.abs(pt.x - x);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    chart.tooltip.setActiveElements(
      [{ datasetIndex:0, index:nearest }, { datasetIndex:1, index:nearest }],
      { x, y: touch.clientY - rect.top }
    );
    chart.update('none');
  }, []);

  const handleTouchEnd = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.tooltip.setActiveElements([], {});
    chart.update('none');
  }, []);

  const chartData = {
    labels: winProb.labels,
    datasets: [
      { label:homeAbbr, data:winProb.vals, borderColor:homeColour, backgroundColor:hexToRgba(homeColour, 0.07), fill:true, tension:0.35, pointRadius:2, pointBackgroundColor:homeColour, borderWidth:2 },
      { label:awayAbbr, data:winProb.vals.map(v=>100-v), borderColor:awayColour, backgroundColor:hexToRgba(awayColour, 0.05), fill:true, tension:0.35, pointRadius:2, pointBackgroundColor:awayColour, borderWidth:2 },
    ],
  };

  const options = {
    responsive:true, maintainAspectRatio:false,
    interaction: { mode:'index', intersect:false },
    scales:{
      y:{ min:0,max:100,ticks:{callback:v=>v+'%',font:{size:9},color:'rgba(255,255,255,0.3)'},grid:{color:'rgba(255,255,255,0.05)'},border:{display:false} },
      x:{ ticks:{font:{size:9},color:'rgba(255,255,255,0.3)',maxRotation:0,autoSkip:true,maxTicksLimit:10},grid:{display:false},border:{display:false} }
    },
    plugins:{
      legend:{display:false},
      tooltip:{
        mode:'index', intersect:false,
        callbacks:{ label:ctx=>`${ctx.dataset.label}: ${ctx.raw}%` }
      }
    }
  };

  return (
    <div style={{ marginTop:14, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span>Win probability · Tango Tiger</span>
        <span style={{ display:'flex', gap:12 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10,height:2,background:homeColour,display:'inline-block',borderRadius:1 }}></span>{homeAbbr}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10,height:2,background:awayColour,display:'inline-block',borderRadius:1 }}></span>{awayAbbr}</span>
        </span>
      </div>
      <div
        style={{ height:120 }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
      >
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

    </div>
  );
}

export default function Scoreboard({ data, lastUpdated, onBack, isLive }) {
  if (!data) return null;
  const { awayTeam, homeTeam, awayScore, homeScore, innings, awayHits, homeHits, awayErrors, homeErrors, status, inning, inningHalf, outs, balls, strikes, onFirst, onSecond, onThird, decisions, weather, venue, winProb } = data;
  const isFinal = status === 'Final';
  const awayWins = isFinal && awayScore > homeScore;
  const homeWins = isFinal && homeScore > awayScore;

  return (
    <div className="fade-in" style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'18px 18px 14px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'4px 10px', fontSize:12, color:'rgba(255,255,255,0.6)', cursor:'pointer', marginBottom:5, fontFamily:'inherit' }}>← Games</button>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{venue}</div>
        </div>
        {weather?.temp && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'5px 12px', fontSize:12, color:'rgba(255,255,255,0.55)' }}>
            <WeatherIcon condition={weather.condition} />
            <span>{weather.temp}°F / {Math.round((weather.temp-32)*5/9)}°C · {weather.condition}</span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginBottom:14 }}>
        <div style={{ textAlign:'center', minWidth:100, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <TeamLogo abbr={awayTeam.abbr} size={52} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{awayTeam.name}</div>
        </div>
        <div style={{ fontSize:50, fontWeight:700, color:awayWins?'#60a5fa':'#fff', padding:'0 14px', lineHeight:1, transition:'color 0.3s' }}>{awayScore}</div>
        <div style={{ fontSize:22, color:'rgba(255,255,255,0.2)' }}>–</div>
        <div style={{ fontSize:50, fontWeight:700, color:homeWins?'#60a5fa':'#fff', padding:'0 14px', lineHeight:1, transition:'color 0.3s' }}>{homeScore}</div>
        <div style={{ textAlign:'center', minWidth:100, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
          <TeamLogo abbr={homeTeam.abbr} size={52} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{homeTeam.name}</div>
        </div>
      </div>

      <div style={{ textAlign:'center', marginBottom:12 }}>
        {isFinal ? (
          <div>
            <span style={{ background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'3px 14px', fontSize:12, color:'rgba(255,255,255,0.4)' }}>Final</span>
            {decisions.winner && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>W: {decisions.winner.fullName} · L: {decisions.loser?.fullName}{decisions.save?` · SV: ${decisions.save.fullName}`:''}</div>}
          </div>
        ) : isLive ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ background:'#dc2626', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700, color:'#fff', letterSpacing:0.5 }}>
              <span style={{ display:'inline-block', width:6,height:6,borderRadius:'50%',background:'#fff',marginRight:4,animation:'pulse 1.5s infinite' }}></span>LIVE
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
        ) : <span style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>Scheduled</span>}
      </div>

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
                  {innings.map(inn=>{ const v=inn[side]?.runs; return <td key={inn.num} style={{ padding:'5px 3px', textAlign:'center', color:v>0?'#fff':'rgba(255,255,255,0.25)', fontWeight:v>0?600:400, transition:'color 0.3s' }}>{v!==undefined?v:'–'}</td>; })}
                  <td style={{ padding:'5px 6px', textAlign:'center', fontWeight:700, color:'#60a5fa', borderLeft:'0.5px solid rgba(255,255,255,0.08)' }}>{r}</td>
                  <td style={{ padding:'5px 3px', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>{h}</td>
                  <td style={{ padding:'5px 3px', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {winProb && winProb.vals.length > 2 && <WinProbChart winProb={winProb} awayAbbr={awayTeam.abbr} homeAbbr={homeTeam.abbr} />}
      {isLive && lastUpdated && <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'right', marginTop:8 }}>Updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 45s</div>}
    </div>
  );
}
