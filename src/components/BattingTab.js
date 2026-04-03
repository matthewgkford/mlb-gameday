import React from 'react';
import { espnLogoUrl } from '../utils/mlbApi';

function TeamHeaderLogo({ abbr }) {
  const [err, setErr] = React.useState(false);
  if (err) return <div style={{ width:24, height:24, borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff' }}>{abbr?.slice(0,2)}</div>;
  return <img src={espnLogoUrl(abbr)} alt={abbr} width={24} height={24} style={{ objectFit:'contain' }} onError={()=>setErr(true)} />;
}

function statDot(val, avg, good, elite) {
  if (isNaN(val)) return '#555566';
  if (val >= elite) return '#4ade80';
  if (val >= good) return '#60a5fa';
  if (val >= avg) return '#71717a';
  return '#f87171';
}

function SlashLine({ stats }) {
  const avg=parseFloat(stats.avg)||0, obp=parseFloat(stats.obp)||0, slg=parseFloat(stats.slg)||0, ops=parseFloat(stats.ops)||0;
  const items = [
    { label:'AVG', val:stats.avg||'.---', dot:statDot(avg,0.23,0.26,0.300), tip:'Batting Average: hits ÷ at-bats. MLB avg ~.250.' },
    { label:'OBP', val:stats.obp||'.---', dot:statDot(obp,0.30,0.33,0.370), tip:'On-Base Percentage. MLB avg ~.320.' },
    { label:'SLG', val:stats.slg||'.---', dot:statDot(slg,0.37,0.44,0.500), tip:'Slugging Percentage. MLB avg ~.400.' },
    { label:'OPS', val:stats.ops||'.---', dot:statDot(ops,0.70,0.80,0.900), tip:'On-Base + Slugging. Above .900 is elite.' },
  ];
  return (
    <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:10, paddingTop:10, borderTop:'0.5px solid rgba(255,255,255,0.08)' }}>
      {items.map(({ label, val, dot, tip }) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }} title={tip}>
          <span style={{ color:'rgba(255,255,255,0.35)', borderBottom:'1px dotted rgba(255,255,255,0.2)', cursor:'default' }}>{label}</span>
          <span style={{ fontWeight:500, color:'#fff' }}>{val}</span>
          <span style={{ width:8, height:8, borderRadius:'50%', background:dot, display:'inline-block', flexShrink:0 }}></span>
        </div>
      ))}
    </div>
  );
}

function TeamTable({ batters, teamStats }) {
  return (
    <>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>Batter</th>
              {['AB','H','HR','RBI','BB','R','K'].map(h=><th key={h} style={{ textAlign:'right', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {batters.map(b=>(
              <tr key={b.id}>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'left' }}>
                  <span style={{ fontWeight:500, color:'#fff' }}>{b.name}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginLeft:5 }}>{b.position}</span>
                </td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.ab}</td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.h>0?'#60a5fa':'rgba(255,255,255,0.4)', fontWeight:b.h>0?600:400 }}>{b.h}</td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right' }}>
                  {b.hr>0?<span style={{ color:'#60a5fa', fontWeight:600 }}>{b.hr}<span style={{ background:'rgba(96,165,250,0.15)', color:'#93c5fd', borderRadius:4, padding:'1px 4px', fontSize:10, marginLeft:3 }}>HR</span></span>:<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}
                </td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.rbi||<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}</td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.bb||<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}</td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.r>0?'#60a5fa':'rgba(255,255,255,0.3)' }}>{b.r||'–'}</td>
                <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.k>0?'#f87171':'rgba(255,255,255,0.3)' }}>{b.k||'–'}</td>
              </tr>
            ))}
            {batters.length>0&&(
              <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                <td style={{ padding:'7px 8px', fontWeight:600, color:'rgba(255,255,255,0.4)', fontSize:11 }}>Totals</td>
                {['ab','h','hr','rbi','bb','r','k'].map(f=>(
                  <td key={f} style={{ padding:'7px 8px', textAlign:'right', color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{batters.reduce((a,b)=>a+(b[f]||0),0)}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <SlashLine stats={teamStats} />
    </>
  );
}

export default function BattingTab({ data }) {
  const { awayTeam, homeTeam, awayBatters, homeBatters, awayTeamStats, homeTeamStats } = data;
  return (
    <>
      {[['away',awayTeam,awayBatters,awayTeamStats],['home',homeTeam,homeBatters,homeTeamStats]].map(([side,team,batters,stats])=>(
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamHeaderLogo abbr={team.abbr} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          <TeamTable batters={batters} teamStats={stats} />
        </div>
      ))}
    </>
  );
}
