import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
ChartJS.register(ArcElement, Tooltip);

const PIE_COLORS = ['#3B82F6','#06D6A0','#A78BFA','#F472B6','#FB923C','#FACC15'];

function PitchPie({ pitches }) {
  if (!pitches?.length) return null;
  const data = {
    labels: pitches.map(p=>p.name),
    datasets: [{ data: pitches.map(p=>p.pct), backgroundColor: PIE_COLORS.slice(0,pitches.length), borderWidth:3, borderColor:'transparent', hoverOffset:4 }],
  };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:10 }}>
      <div style={{ width:110, height:110, flexShrink:0 }}>
        <Doughnut data={data} options={{ cutout:'55%', plugins:{ legend:{display:false}, tooltip:{enabled:false} }, responsive:true, maintainAspectRatio:true }} />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {pitches.map((p,i) => (
          <div key={p.name} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }}></div>
            <span style={{ color:'rgba(255,255,255,0.7)' }}>{p.name}</span>
            <span style={{ marginLeft:'auto', fontWeight:600, color:'rgba(255,255,255,0.4)', paddingLeft:10 }}>{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBlock({ label, val, good }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:16, fontWeight:600, color: good ? '#4ade80' : val > 0 && label==='ER' ? '#f87171' : '#fff' }}>{val}</div>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{label}</div>
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p => parseFloat(p.ip) >= 1 || p.pitchCount > 20);
    const sp2 = homePitchers.find(p => parseFloat(p.ip) >= 1 || p.pitchCount > 20);
    if (!sp1 && !sp2) { setText('No starting pitcher data available yet.'); setLoading(false); return; }

    const prompt = `You are a sharp baseball analyst giving a between-innings breakdown.
${sp1 ? `${sp1.name} (${awayTeam.abbr}): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.h} H, ${sp1.pitchCount} pitches.` : ''}
${sp2 ? `${sp2.name} (${homeTeam.abbr}): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.h} H, ${sp2.pitchCount} pitches.` : ''}
Write 3 punchy sentences analysing the pitching so far. Note command, efficiency, and anything interesting. Sound like a confident TV colour commentator.`;

    fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:300, messages:[{ role:'user', content:prompt }] }),
    })
      .then(r=>r.json())
      .then(d=>{ setText(d?.content?.find(b=>b.type==='text')?.text || fallback(sp1, sp2)); })
      .catch(()=>{ setText(fallback(sp1, sp2)); })
      .finally(()=>setLoading(false));
  }, []);

  function fallback(sp1, sp2) {
    if (!sp1 && !sp2) return 'No pitching data available.';
    const parts = [];
    if (sp1) parts.push(`${sp1.name} has thrown ${sp1.pitchCount} pitches over ${sp1.ip} innings, allowing ${sp1.er} earned run${sp1.er!==1?'s':''} with ${sp1.k} strikeout${sp1.k!==1?'s':''}.`);
    if (sp2) parts.push(`${sp2.name} has gone ${sp2.ip} innings, giving up ${sp2.er} earned run${sp2.er!==1?'s':''} on ${sp2.h} hit${sp2.h!==1?'s':''} with ${sp2.k} strikeout${sp2.k!==1?'s':''}.`);
    return parts.join(' ');
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:12, marginTop:12 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:6 }}>AI analysis</div>
      <div style={{ fontSize:13, lineHeight:1.65, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', fontStyle: loading ? 'italic' : 'normal' }}>
        {loading ? 'Generating analysis...' : text}
      </div>
    </div>
  );
}

const KNOWN_ARSENALS = {
  'Taj Bradley': [{name:'Four-seam FB',pct:38},{name:'Sweeper',pct:27},{name:'Changeup',pct:20},{name:'Sinker',pct:15}],
  'Cole Ragans': [{name:'Slider',pct:42},{name:'Four-seam FB',pct:30},{name:'Changeup',pct:18},{name:'Curveball',pct:10}],
  'Gerrit Cole': [{name:'Four-seam FB',pct:36},{name:'Sweeper',pct:28},{name:'Splitter',pct:22},{name:'Curveball',pct:14}],
  'Spencer Strider': [{name:'Four-seam FB',pct:55},{name:'Slider',pct:35},{name:'Changeup',pct:10}],
  'Zack Wheeler': [{name:'Four-seam FB',pct:32},{name:'Sinker',pct:20},{name:'Slider',pct:24},{name:'Curveball',pct:14},{name:'Changeup',pct:10}],
  'Luis Castillo': [{name:'Sinker',pct:38},{name:'Changeup',pct:28},{name:'Slider',pct:20},{name:'Four-seam FB',pct:14}],
};

function PitcherCard({ pitcher, isWinner, isLoser }) {
  const arsenal = KNOWN_ARSENALS[pitcher.name];
  const isStarter = parseFloat(pitcher.ip) >= 3 || pitcher.pitchCount > 40;
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {pitcher.name}
            {isWinner && <span style={{ fontSize:10, background:'rgba(74,222,128,0.15)', color:'#4ade80', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>W</span>}
            {isLoser && <span style={{ fontSize:10, background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>L</span>}
            {pitcher.note==='Current' && <span style={{ fontSize:10, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:8, padding:'2px 7px', fontWeight:600 }}>Pitching now</span>}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{isStarter?'Starting Pitcher':'Relief Pitcher'} · {pitcher.pitchCount} pitches</div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <StatBlock label="IP" val={pitcher.ip} />
          <StatBlock label="K" val={pitcher.k} />
          <StatBlock label="BB" val={pitcher.bb} />
          <StatBlock label="H" val={pitcher.h} />
          <StatBlock label="ER" val={pitcher.er} good={pitcher.er===0} />
        </div>
      </div>
      {arsenal && <PitchPie pitches={arsenal} />}
    </div>
  );
}

export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions } = data;
  const winnerName = decisions?.winner?.fullName || '';
  const loserName = decisions?.loser?.fullName || '';

  return (
    <>
      {[['away',awayTeam,awayPitchers],['home',homeTeam,homePitchers]].map(([side,team,pitchers])=>(
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:side==='away'?'#60a5fa':'#f472b6' }}></div>
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p=>(
            <PitcherCard key={p.id} pitcher={p}
              isWinner={winnerName && p.name === winnerName}
              isLoser={loserName && p.name === loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} />
      </div>
    </>
  );
}
