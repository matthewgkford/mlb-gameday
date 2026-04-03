import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { espnLogoUrl } from '../utils/mlbApi';
ChartJS.register(ArcElement, Tooltip);

const PIE_COLORS = ['#3B82F6','#06D6A0','#A78BFA','#F472B6','#FB923C','#FACC15'];

function TeamHeaderLogo({ abbr }) {
  const [err, setErr] = React.useState(false);
  if (err) return <div style={{ width:24, height:24, borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff' }}>{abbr?.slice(0,2)}</div>;
  return <img src={espnLogoUrl(abbr)} alt={abbr} width={24} height={24} style={{ objectFit:'contain' }} onError={()=>setErr(true)} />;
}

function PitchPie({ pitches }) {
  if (!pitches?.length) return null;
  const data = {
    labels: pitches.map(p=>p.name),
    datasets: [{ data:pitches.map(p=>p.pct), backgroundColor:PIE_COLORS.slice(0,pitches.length), borderWidth:3, borderColor:'transparent', hoverOffset:4 }],
  };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:12, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
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
  );
}

// Known pitcher arsenals — expanded list
const ARSENALS = {
  'Taj Bradley':      [{name:'Four-seam FB',pct:38},{name:'Sweeper',pct:27},{name:'Changeup',pct:20},{name:'Sinker',pct:15}],
  'Cole Ragans':      [{name:'Slider',pct:42},{name:'Four-seam FB',pct:30},{name:'Changeup',pct:18},{name:'Curveball',pct:10}],
  'Gerrit Cole':      [{name:'Four-seam FB',pct:36},{name:'Sweeper',pct:28},{name:'Splitter',pct:22},{name:'Curveball',pct:14}],
  'Spencer Strider':  [{name:'Four-seam FB',pct:55},{name:'Slider',pct:35},{name:'Changeup',pct:10}],
  'Zack Wheeler':     [{name:'Four-seam FB',pct:32},{name:'Sinker',pct:20},{name:'Slider',pct:24},{name:'Curveball',pct:14},{name:'Changeup',pct:10}],
  'Luis Castillo':    [{name:'Sinker',pct:38},{name:'Changeup',pct:28},{name:'Slider',pct:20},{name:'Four-seam FB',pct:14}],
  'Sean Manaea':      [{name:'Four-seam FB',pct:35},{name:'Slider',pct:30},{name:'Changeup',pct:25},{name:'Curveball',pct:10}],
  'Kodai Senga':      [{name:'Four-seam FB',pct:30},{name:'Ghost Fork',pct:35},{name:'Slider',pct:20},{name:'Curveball',pct:15}],
  'Max Scherzer':     [{name:'Four-seam FB',pct:32},{name:'Slider',pct:28},{name:'Changeup',pct:22},{name:'Curveball',pct:18}],
  'Justin Verlander': [{name:'Four-seam FB',pct:40},{name:'Slider',pct:25},{name:'Curveball',pct:20},{name:'Changeup',pct:15}],
  'Sandy Alcantara':  [{name:'Sinker',pct:40},{name:'Slider',pct:25},{name:'Changeup',pct:20},{name:'Four-seam FB',pct:15}],
  'Blake Snell':      [{name:'Four-seam FB',pct:30},{name:'Slider',pct:35},{name:'Curveball',pct:20},{name:'Changeup',pct:15}],
  'Logan Webb':       [{name:'Sinker',pct:42},{name:'Changeup',pct:28},{name:'Slider',pct:18},{name:'Four-seam FB',pct:12}],
  'Marcus Stroman':   [{name:'Sinker',pct:45},{name:'Four-seam FB',pct:20},{name:'Slider',pct:20},{name:'Changeup',pct:15}],
  'David Peterson':   [{name:'Four-seam FB',pct:32},{name:'Changeup',pct:28},{name:'Slider',pct:25},{name:'Curveball',pct:15}],
  'Tylor Megill':     [{name:'Four-seam FB',pct:45},{name:'Slider',pct:30},{name:'Changeup',pct:15},{name:'Curveball',pct:10}],
};

function PitcherCard({ pitcher, isWinner, isLoser }) {
  const arsenal = ARSENALS[pitcher.name];
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';

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
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{roleLabel} · {pitcher.pitchCount} pitches</div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[['IP',pitcher.ip,false],['K',pitcher.k,false],['BB',pitcher.bb,false],['H',pitcher.h,false],['ER',pitcher.er,pitcher.er===0]].map(([label,val,good])=>(
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:600, color: good?'#4ade80': label==='ER'&&val>0?'#f87171':'#fff' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      {arsenal && <PitchPie pitches={arsenal} />}
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const rel1 = awayPitchers.filter(p => !p.isStarter);
    const rel2 = homePitchers.filter(p => !p.isStarter);

    const lines = [];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}, starter): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.h} H, ${sp1.pitchCount} pitches.`);
    if (rel1.length) lines.push(`${awayTeam.abbr} relievers: ${rel1.map(p=>`${p.name} (${p.ip} IP, ${p.er} ER, ${p.k} K)`).join('; ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}, starter): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.h} H, ${sp2.pitchCount} pitches.`);
    if (rel2.length) lines.push(`${homeTeam.abbr} relievers: ${rel2.map(p=>`${p.name} (${p.ip} IP, ${p.er} ER, ${p.k} K)`).join('; ')}.`);
    lines.push(`Current score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`);

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const prompt = `You are an expert baseball analyst. Here is the pitching data for today's game:

${lines.join('\n')}

Give me 3-4 sentences of genuine analytical insight — not just a recap of the numbers. Focus on: pitch efficiency (quality of innings vs pitch count), command issues (BB rate), whether the starter's performance matches the scoreline, any bullpen concerns, and what these pitching lines suggest about how the game was won or lost. Be direct and specific, like a veteran scout or analyst, not a sports broadcaster reading stats aloud.`;

    fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:400, messages:[{ role:'user', content:prompt }] }),
    })
      .then(r=>r.json())
      .then(d=>{ setText(d?.content?.find(b=>b.type==='text')?.text || buildFallback(sp1,sp2,awayTeam,homeTeam)); })
      .catch(()=>{ setText(buildFallback(sp1,sp2,awayTeam,homeTeam)); })
      .finally(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1, sp2, away, home) {
    const parts = [];
    if (sp1) {
      const eff = sp1.pitchCount > 0 ? (parseFloat(sp1.ip) * 3 / sp1.pitchCount * 100).toFixed(0) : 0;
      parts.push(`${sp1.name} threw ${sp1.pitchCount} pitches over ${sp1.ip} innings — roughly ${eff} pitches per out. ${sp1.er === 0 ? 'Kept the scoreboard clean.' : `Allowed ${sp1.er} earned run${sp1.er!==1?'s':''}.`}`);
    }
    if (sp2) {
      parts.push(`${sp2.name} went ${sp2.ip} innings with ${sp2.k} strikeout${sp2.k!==1?'s':''} and ${sp2.bb} walk${sp2.bb!==1?'s':''} — a K/BB ratio of ${sp2.bb>0?(sp2.k/sp2.bb).toFixed(1):'∞'}.`);
    }
    return parts.join(' ');
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14, marginTop:4 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI pitch analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color: loading?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.75)', fontStyle:loading?'italic':'normal' }}>
        {loading ? 'Generating analysis...' : text}
      </div>
    </div>
  );
}

export default function PitchingTab({ data }) {
  const { awayTeam, homeTeam, awayPitchers, homePitchers, decisions, awayScore, homeScore } = data;
  const winnerName = decisions?.winner?.fullName || '';
  const loserName = decisions?.loser?.fullName || '';

  return (
    <>
      {[['away',awayTeam,awayPitchers],['home',homeTeam,homePitchers]].map(([side,team,pitchers])=>(
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamHeaderLogo abbr={team.abbr} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p=>(
            <PitcherCard key={p.id} pitcher={p}
              isWinner={winnerName && p.name===winnerName}
              isLoser={loserName && p.name===loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} />
      </div>
    </>
  );
}
