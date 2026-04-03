import React, { useState } from 'react';
import { TeamLogo, TrendArrow, rateBAT, rateOBP, rateSLG, rateOPS } from './SharedUI';

function SeasonStatsModal({ batter, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={onClose}>
      <div style={{ background:'#1a1f2e', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:20, padding:20, width:'100%', maxWidth:340 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:600, color:'#fff' }}>{batter.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{batter.position} · 2025 season stats</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'4px 10px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'This game AVG', val:batter.avg },
            { label:'Season AVG', val:batter.seasonAvg||'–' },
            { label:'This game OPS', val:batter.ops },
            { label:'Season OPS', val:batter.seasonOps||'–' },
            { label:'HR this game', val:batter.hr },
            { label:'Season HR', val:batter.seasonHr??'–' },
            { label:'RBI this game', val:batter.rbi },
            { label:'Season RBI', val:batter.seasonRbi??'–' },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:18, fontWeight:600, color:'#fff' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:12, textAlign:'center' }}>Season stats from MLB Stats API · 2025 season to date</div>
      </div>
    </div>
  );
}

function SlashLine({ stats }) {
  const items = [
    { label:'AVG', val:stats.avg||'.---', rating:rateBAT(stats.avg), tip:'Batting Average. MLB avg ~.250.' },
    { label:'OBP', val:stats.obp||'.---', rating:rateOBP(stats.obp), tip:'On-Base Percentage. MLB avg ~.320.' },
    { label:'SLG', val:stats.slg||'.---', rating:rateSLG(stats.slg), tip:'Slugging Percentage. MLB avg ~.400.' },
    { label:'OPS', val:stats.ops||'.---', rating:rateOPS(stats.ops), tip:'On-Base + Slugging. Above .900 is elite.' },
  ];
  return (
    <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:10, paddingTop:10, borderTop:'0.5px solid rgba(255,255,255,0.08)' }}>
      {items.map(({ label, val, rating, tip }) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }} title={tip}>
          <span style={{ color:'rgba(255,255,255,0.35)', borderBottom:'1px dotted rgba(255,255,255,0.2)', cursor:'default' }}>{label}</span>
          <span style={{ fontWeight:500, color:'#fff' }}>{val}</span>
          <TrendArrow rating={rating} size={13} />
        </div>
      ))}
    </div>
  );
}

function BatterRow({ b, onClick }) {
  return (
    <tr onClick={() => onClick(b)} style={{ cursor:'pointer' }}>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'left' }}>
        <span style={{ fontWeight:500, color:'#60a5fa', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.4)' }}>{b.name}</span>
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
  );
}

function TeamTable({ batters, teamStats, color }) {
  const [modal, setModal] = useState(null);
  return (
    <>
      {modal && <SeasonStatsModal batter={modal} onClose={()=>setModal(null)} />}
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:8 }}>Tap a batter's name to see season stats</div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>Batter</th>
              {['AB','H','HR','RBI','BB','R','K'].map(h=><th key={h} style={{ textAlign:'right', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {batters.map(b=><BatterRow key={b.id} b={b} onClick={setModal} />)}
            {batters.length>0 && (
              <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                <td style={{ padding:'7px 8px', fontWeight:600, color:'rgba(255,255,255,0.4)', fontSize:11 }}>Totals</td>
                {['ab','h','hr','rbi','bb','r','k'].map(f=><td key={f} style={{ padding:'7px 8px', textAlign:'right', color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{batters.reduce((a,b)=>a+(b[f]||0),0)}</td>)}
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
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          <TeamTable batters={batters} teamStats={stats} />
        </div>
      ))}
    </>
  );
}
