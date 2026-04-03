import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { TeamLogo, TrendArrow, rateERA, rateWHIP } from './SharedUI';
import { KNOWN_ARSENALS } from '../utils/mlbApi';
ChartJS.register(ArcElement, Tooltip);

const PIE_COLORS = ['#3B82F6','#06D6A0','#A78BFA','#F472B6','#FB923C','#FACC15'];

function PitchPie({ pitches }) {
  if (!pitches?.length) return null;
  const data = {
    labels: pitches.map(p=>p.name),
    datasets: [{ data:pitches.map(p=>p.pct), backgroundColor:PIE_COLORS.slice(0,pitches.length), borderWidth:3, borderColor:'transparent', hoverOffset:4 }],
  };
  return (
    <div style={{ marginTop:12, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Season pitch mix — historic data</div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:110, height:110, flexShrink:0 }}>
          <Doughnut data={data} options={{ cutout:'55%', plugins:{ legend:{display:false}, tooltip:{enabled:false} }, responsive:true, maintainAspectRatio:true }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {pitches.map((p,i)=>(
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }}></div>
              <span style={{ color:'rgba(255,255,255,0.75)' }}>{p.name}</span>
              <span style={{ marginLeft:'auto', fontWeight:600, color:'rgba(255,255,255,0.4)', paddingLeft:12 }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PitcherCard({ pitcher, isWinner, isLoser, isFinal }) {
  const arsenal = KNOWN_ARSENALS[pitcher.name];
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';
  // Only show "Pitching now" badge for live games — never for finished games
  const showPitching = pitcher.isCurrentPitcher && !isFinal;

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {pitcher.name}
            {isWinner && <span style={{ fontSize:10, background:'rgba(74,222,128,0.15)', color:'#4ade80', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>W</span>}
            {isLoser && <span style={{ fontSize:10, background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>L</span>}
            {showPitching && <span style={{ fontSize:10, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>Pitching now</span>}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{roleLabel} · {pitcher.pitchCount} pitches</div>
          {(pitcher.seasonEra||pitcher.seasonWhip) && (
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3, display:'flex', gap:10 }}>
              {pitcher.seasonEra && <span style={{ display:'flex', alignItems:'center', gap:4 }}>Season ERA {pitcher.seasonEra} <TrendArrow rating={rateERA(pitcher.seasonEra)} size={11} /></span>}
              {pitcher.seasonWhip && <span style={{ display:'flex', alignItems:'center', gap:4 }}>WHIP {pitcher.seasonWhip} <TrendArrow rating={rateWHIP(pitcher.seasonWhip)} size={11} /></span>}
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[['IP',pitcher.ip,false],['K',pitcher.k,false],['BB',pitcher.bb,false],['H',pitcher.h,false],['ER',pitcher.er,pitcher.er===0]].map(([label,val,good])=>(
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:600, color:good?'#4ade80':label==='ER'&&val>0?'#f87171':'#fff' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      {arsenal && <PitchPie pitches={arsenal} />}
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p=>p.isStarter);
    const sp2 = homePitchers.find(p=>p.isStarter);
    const rel1 = awayPitchers.filter(p=>!p.isStarter);
    const rel2 = homePitchers.filter(p=>!p.isStarter);
    const hrs = keyPlays.filter(p=>p.event==='home_run');
    const topHitters = [...awayBatters,...homeBatters].filter(b=>b.h>1||b.hr>0).map(b=>`${b.name}: ${b.h}H ${b.hr>0?b.hr+'HR ':''}`).join(', ');

    const lines = [];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}, starter): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.h} H, ${sp1.pitchCount} pitches.${sp1.seasonEra?` Season ERA: ${sp1.seasonEra}.`:''}`);
    if (rel1.length) lines.push(`${awayTeam.abbr} bullpen: ${rel1.map(p=>`${p.name} ${p.ip}IP/${p.er}ER/${p.k}K`).join(', ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}, starter): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.h} H, ${sp2.pitchCount} pitches.${sp2.seasonEra?` Season ERA: ${sp2.seasonEra}.`:''}`);
    if (rel2.length) lines.push(`${homeTeam.abbr} bullpen: ${rel2.map(p=>`${p.name} ${p.ip}IP/${p.er}ER/${p.k}K`).join(', ')}.`);
    lines.push(`Final score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`);
    if (hrs.length) lines.push(`Home runs: ${hrs.map(h=>`${h.batter} (${h.half==='top'?awayTeam.abbr:homeTeam.abbr})`).join(', ')}.`);
    if (topHitters) lines.push(`Notable hitters: ${topHitters}.`);

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const prompt = `You are an expert baseball analyst reviewing this game's data:

${lines.join('\n')}

Identify the 2-3 most analytically interesting or surprising things about this game. Focus on:
- Pitch efficiency (quality of start vs pitch count — did the starter go deep or labour?)  
- Command issues — were BB rates concerning?
- Whether any starter's line seems to contradict the scoreline
- Bullpen performance and whether it changed the game
- Any hitter who particularly stood out or underperformed

Be specific and analytical. Avoid just restating the numbers — explain what they mean. Write in a direct, informed style like a baseball scout or analyst would. 3-4 sentences maximum.`;

    fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:400, messages:[{ role:'user', content:prompt }] }),
    })
      .then(r=>r.json())
      .then(d=>{ setText(d?.content?.find(b=>b.type==='text')?.text || buildFallback(sp1,sp2,rel1,rel2,awayTeam,homeTeam)); })
      .catch(()=>{ setText(buildFallback(sp1,sp2,rel1,rel2,awayTeam,homeTeam)); })
      .finally(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1,sp2,rel1,rel2,away,home) {
    const parts=[];
    if(sp1){const ppo=sp1.pitchCount>0?(parseFloat(sp1.ip)*3/sp1.pitchCount*100).toFixed(0):0;parts.push(`${sp1.name} averaged ${ppo} pitches per out — ${ppo>70?'efficient':'laboured'} for ${sp1.ip} innings.`);}
    if(sp2){const kbb=sp2.bb>0?(sp2.k/sp2.bb).toFixed(1):'∞';parts.push(`${sp2.name} posted a ${kbb} K/BB ratio with ${sp2.k} strikeouts.`);}
    if(rel1.length&&rel1.some(p=>p.er>0))parts.push(`${away.abbr} bullpen allowed ${rel1.reduce((a,p)=>a+p.er,0)} earned runs.`);
    if(rel2.length&&rel2.some(p=>p.er>0))parts.push(`${home.abbr} bullpen allowed ${rel2.reduce((a,p)=>a+p.er,0)} earned runs.`);
    return parts.join(' ')||'Game analysis unavailable.';
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI pitch analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color:loading?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.75)', fontStyle:loading?'italic':'normal' }}>
        {loading?'Generating analysis...':text}
      </div>
    </div>
  );
}

export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal } = data;
  const winnerName = decisions?.winner?.fullName||'';
  const loserName = decisions?.loser?.fullName||'';

  return (
    <>
      {[['away',awayTeam,awayPitchers],['home',homeTeam,homePitchers]].map(([side,team,pitchers])=>(
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p=>(
            <PitcherCard key={p.id} pitcher={p} isFinal={isFinal}
              isWinner={winnerName&&p.name===winnerName}
              isLoser={loserName&&p.name===loserName}
            />
          ))}
          {!pitchers.length&&<div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} awayBatters={awayBatters} homeBatters={homeBatters} keyPlays={keyPlays||[]} isFinal={isFinal} />
      </div>
    </>
  );
}
