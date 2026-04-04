import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { TeamLogo, PlayerPhoto, TrendArrow, rateERA, rateWHIP } from './SharedUI';
import { KNOWN_ARSENALS } from '../utils/mlbApi';
ChartJS.register(ArcElement, Tooltip);

const PIE_COLORS = ['#3B82F6','#06D6A0','#A78BFA','#F472B6','#FB923C','#FACC15'];

// Generic relief pitcher arsenals by handedness/type
const GENERIC_ARSENALS = {
  rp_slider:   [{name:'Slider',pct:50,type:'slider'},{name:'Four-seam FB',pct:35,type:'4seam'},{name:'Changeup',pct:15,type:'change'}],
  rp_fastball: [{name:'Four-seam FB',pct:55,type:'4seam'},{name:'Slider',pct:30,type:'slider'},{name:'Changeup',pct:15,type:'change'}],
  rp_sinker:   [{name:'Sinker',pct:50,type:'sink'},{name:'Slider',pct:30,type:'slider'},{name:'Changeup',pct:20,type:'change'}],
  sp_generic:  [{name:'Four-seam FB',pct:40,type:'4seam'},{name:'Slider',pct:25,type:'slider'},{name:'Changeup',pct:20,type:'change'},{name:'Curveball',pct:15,type:'curve'}],
};

function getArsenal(pitcher) {
  if (KNOWN_ARSENALS[pitcher.name]) return { pitches: KNOWN_ARSENALS[pitcher.name], isKnown: true };
  // For unknown pitchers, pick a sensible generic based on role
  const generic = pitcher.isStarter ? GENERIC_ARSENALS.sp_generic : GENERIC_ARSENALS.rp_fastball;
  return { pitches: generic, isKnown: false };
}

function PitchPie({ pitches, isKnown }) {
  const data = {
    labels: pitches.map(p=>p.name),
    datasets: [{ data:pitches.map(p=>p.pct), backgroundColor:PIE_COLORS.slice(0,pitches.length), borderWidth:3, borderColor:'transparent', hoverOffset:4 }],
  };
  return (
    <div style={{ marginTop:12, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>
        {isKnown ? 'Season pitch mix — historic data' : 'Typical relief mix — representative'}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:100, height:100, flexShrink:0 }}>
          <Doughnut data={data} options={{ cutout:'55%', plugins:{ legend:{display:false}, tooltip:{enabled:false} }, responsive:true, maintainAspectRatio:true }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {pitches.map((p,i)=>(
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12 }}>
              <div style={{ width:9, height:9, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }}></div>
              <span style={{ color:'rgba(255,255,255,0.7)' }}>{p.name}</span>
              <span style={{ marginLeft:'auto', fontWeight:600, color:'rgba(255,255,255,0.4)', paddingLeft:10 }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PitcherCard({ pitcher, isWinner, isLoser, isFinal, delay }) {
  const { pitches, isKnown } = getArsenal(pitcher);
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';
  const showPitching = pitcher.isCurrentPitcher && !isFinal;

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8, animation:`fadeIn 0.3s ease forwards`, animationDelay:`${delay}ms`, opacity:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <PlayerPhoto playerId={pitcher.id} name={pitcher.name} size={36} />
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              {pitcher.name}
              {isWinner && <span style={{ fontSize:10, background:'rgba(74,222,128,0.15)', color:'#4ade80', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>W</span>}
              {isLoser && <span style={{ fontSize:10, background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>L</span>}
              {showPitching && <span style={{ fontSize:10, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>Pitching now</span>}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{roleLabel} · {pitcher.pitchCount} pitches</div>
            {(pitcher.seasonEra||pitcher.seasonWhip) && (
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:3, display:'flex', gap:10, flexWrap:'wrap' }}>
                {pitcher.seasonEra && <span style={{ display:'flex', alignItems:'center', gap:4 }}>ERA {pitcher.seasonEra} <TrendArrow rating={rateERA(pitcher.seasonEra)} size={11} /></span>}
                {pitcher.seasonWhip && <span style={{ display:'flex', alignItems:'center', gap:4 }}>WHIP {pitcher.seasonWhip} <TrendArrow rating={rateWHIP(pitcher.seasonWhip)} size={11} /></span>}
              </div>
            )}
          </div>
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
      <PitchPie pitches={pitches} isKnown={isKnown} />
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p=>p.isStarter);
    const sp2 = homePitchers.find(p=>p.isStarter);
    const rel1 = awayPitchers.filter(p=>!p.isStarter);
    const rel2 = homePitchers.filter(p=>!p.isStarter);
    const hrs = keyPlays.filter(p=>p.event==='home_run');
    const topHitters = [...awayBatters,...homeBatters]
      .filter(b=>b.h>1||b.hr>0)
      .map(b=>`${b.name} (${b.h}H${b.hr>0?' '+b.hr+'HR':''})`)
      .join(', ');

    const gameState = isFinal
      ? `Final score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`
      : `Current score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}. ${inningHalf||''} ${inning||''}.`;

    const lines = [gameState];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.pitchCount} pitches.${sp1.seasonEra?' Season ERA: '+sp1.seasonEra+'.':''}`);
    if (rel1.length) lines.push(`${awayTeam.abbr} relievers: ${rel1.map(p=>`${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.pitchCount} pitches.${sp2.seasonEra?' Season ERA: '+sp2.seasonEra+'.':''}`);
    if (rel2.length) lines.push(`${homeTeam.abbr} relievers: ${rel2.map(p=>`${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (hrs.length) lines.push(`Home runs: ${hrs.map(h=>`${h.batter}`).join(', ')}.`);
    if (topHitters) lines.push(`Standout hitters: ${topHitters}.`);

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const tenseInstruction = isFinal
      ? 'The game is finished — write in past tense and give a definitive assessment.'
      : `The game is in progress (${inningHalf} ${inning}) — write in present tense, focus on what has happened so far and what to watch.`;

    const prompt = `You are an expert baseball analyst. ${tenseInstruction}

Game data:
${lines.join('\n')}

Identify the 2-3 most analytically interesting things. Focus on:
- Pitch efficiency (pitches per out, did the starter go deep?)
- Command — were BB rates a concern?
- Whether any starter's line contradicts the scoreline
- Bullpen impact — did they change the game?
- Any standout hitter performance

Be specific and analytical, not a stat recap. Use present tense for live games, past tense for finished. 3-4 sentences. If K/BB ratio is infinite (no walks), say "no walks allowed" rather than showing a number.`;

    fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:400, messages:[{role:'user',content:prompt}] }),
    })
      .then(r=>r.json())
      .then(d=>{ setText(d?.content?.find(b=>b.type==='text')?.text || buildFallback(sp1,sp2)); })
      .catch(()=>{ setText(buildFallback(sp1,sp2)); })
      .finally(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1, sp2) {
    const parts = [];
    if (sp1) {
      const ppo = sp1.pitchCount > 0 ? (parseFloat(sp1.ip)*3/sp1.pitchCount*100).toFixed(0) : 0;
      const kbb = sp1.bb > 0 ? (sp1.k/sp1.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp1.name} threw ${sp1.pitchCount} pitches over ${sp1.ip} innings — ${ppo} pitches per out — with a K/BB of ${kbb}.`);
    }
    if (sp2) {
      const kbb = sp2.bb > 0 ? (sp2.k/sp2.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp2.name} went ${sp2.ip} innings, K/BB ${kbb}, allowing ${sp2.er} earned run${sp2.er!==1?'s':''}.`);
    }
    return parts.join(' ') || 'Analysis unavailable.';
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color:loading?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.75)', fontStyle:loading?'italic':'normal' }}>
        {loading ? 'Generating analysis...' : text}
      </div>
    </div>
  );
}

export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf } = data;
  const winnerName = decisions?.winner?.fullName || '';
  const loserName = decisions?.loser?.fullName || '';

  return (
    <div className="tab-panel">
      {[['away',awayTeam,awayPitchers],['home',homeTeam,homePitchers]].map(([side,team,pitchers])=>(
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map((p, i) => (
            <PitcherCard key={p.id} pitcher={p} isFinal={isFinal} delay={i * 60}
              isWinner={winnerName && p.name === winnerName}
              isLoser={loserName && p.name === loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} awayBatters={awayBatters||[]} homeBatters={homeBatters||[]} keyPlays={keyPlays||[]} isFinal={isFinal} inning={inning} inningHalf={inningHalf} />
      </div>
    </div>
  );
}
