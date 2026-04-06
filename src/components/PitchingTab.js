import React, { useState, useEffect } from 'react';
import { TeamLogo, PlayerPhoto, TrendArrow, rateERA, rateWHIP } from './SharedUI';

function PitcherCard({ pitcher, isWinner, isLoser, isFinal }) {
  const roleLabel = pitcher.isStarter ? 'Starting Pitcher' : 'Relief Pitcher';
  const showPitching = pitcher.isCurrentPitcher && !isFinal;

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
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
            {(pitcher.seasonEra || pitcher.seasonWhip) && (
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
    </div>
  );
}

function AIAnalysis({ awayPitchers, homePitchers, awayTeam, homeTeam, awayScore, homeScore, awayBatters, homeBatters, keyPlays, isFinal, inning, inningHalf }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sp1 = awayPitchers.find(p => p.isStarter);
    const sp2 = homePitchers.find(p => p.isStarter);
    const rel1 = awayPitchers.filter(p => !p.isStarter);
    const rel2 = homePitchers.filter(p => !p.isStarter);
    const hrs = keyPlays.filter(p => p.event === 'home_run');
    const topHitters = [...awayBatters, ...homeBatters]
      .filter(b => b.h > 1 || b.hr > 0)
      .map(b => `${b.name} (${b.h}H${b.hr > 0 ? ' ' + b.hr + 'HR' : ''})`)
      .join(', ');

    if (!sp1 && !sp2) { setText('No pitching data available yet.'); setLoading(false); return; }

    const lines = [];
    if (sp1) lines.push(`${sp1.name} (${awayTeam.abbr}): ${sp1.ip} IP, ${sp1.er} ER, ${sp1.k} K, ${sp1.bb} BB, ${sp1.pitchCount} pitches.${sp1.seasonEra ? ' Season ERA: ' + sp1.seasonEra + '.' : ''}`);
    if (rel1.length) lines.push(`${awayTeam.abbr} bullpen: ${rel1.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (sp2) lines.push(`${sp2.name} (${homeTeam.abbr}): ${sp2.ip} IP, ${sp2.er} ER, ${sp2.k} K, ${sp2.bb} BB, ${sp2.pitchCount} pitches.${sp2.seasonEra ? ' Season ERA: ' + sp2.seasonEra + '.' : ''}`);
    if (rel2.length) lines.push(`${homeTeam.abbr} bullpen: ${rel2.map(p => `${p.name} ${p.ip}IP ${p.er}ER ${p.k}K`).join(', ')}.`);
    if (hrs.length) lines.push(`Home runs: ${hrs.map(h => h.batter).join(', ')}.`);
    if (topHitters) lines.push(`Standout hitters: ${topHitters}.`);

    const gameContext = isFinal
      ? `GAME STATUS: FINAL. Score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}.`
      : `GAME STATUS: IN PROGRESS. Current score: ${awayTeam.abbr} ${awayScore}, ${homeTeam.abbr} ${homeScore}. Now: ${inningHalf || ''} ${inning || ''}.`;

    const tenseGuide = isFinal
      ? `The game has finished. Write entirely in PAST TENSE. Give a definitive verdict on why the game was won or lost. Use phrases like "threw", "allowed", "struggled", "dominated", "was the difference".`
      : `The game is still in progress. Write entirely in PRESENT/PRESENT PERFECT TENSE. Focus on what has happened so far and what to watch going forward. Use phrases like "has thrown", "is working", "looks sharp", "will need to", "to watch in the later innings".`;

    const prompt = `You are an expert baseball analyst. ${gameContext}

${tenseGuide}

Pitching data:
${lines.join('\n')}

Give 3-4 sentences of genuine analytical insight — not a stat recap. Focus on:
- Pitch efficiency: pitches per out = total pitches divided by (innings pitched × 3). A good starter averages 3.5-4.5 pitches per out. Above 5 is laboring.
- Command — BB rate, any control issues?
- Whether any starter's line contradicts the scoreline
- Bullpen impact if relevant
- One standout hitter if notable

IMPORTANT: Never show infinity or division symbols. If no walks, say "no walks allowed". Be direct and specific like a veteran analyst.`;

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
    })
      .then(r => r.json())
      .then(d => { setText(d?.content?.find(b => b.type === 'text')?.text || buildFallback(sp1, sp2, isFinal)); })
      .catch(() => { setText(buildFallback(sp1, sp2, isFinal)); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFallback(sp1, sp2, finished) {
    const parts = [];
    if (sp1) {
      const outs = parseFloat(sp1.ip) * 3;
      const ppo = outs > 0 ? (sp1.pitchCount / outs).toFixed(1) : '?';
      const kbb = sp1.bb > 0 ? (sp1.k / sp1.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp1.name} ${finished?'threw':'has thrown'} ${sp1.pitchCount} pitches over ${sp1.ip} innings — ${ppo} pitches per out — K/BB ${kbb}.`);
    }
    if (sp2) {
      const kbb = sp2.bb > 0 ? (sp2.k / sp2.bb).toFixed(1) : 'no walks allowed';
      parts.push(`${sp2.name} ${finished?'went':'has gone'} ${sp2.ip} innings, K/BB ${kbb}, ${finished?'allowing':'having allowed'} ${sp2.er} earned run${sp2.er !== 1 ? 's' : ''}.`);
    }
    return parts.join(' ') || 'Analysis unavailable.';
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14 }}>
      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.3)', fontWeight:600, marginBottom:8 }}>AI analysis</div>
      <div style={{ fontSize:13, lineHeight:1.7, color: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', fontStyle: loading ? 'italic' : 'normal' }}>
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
      {[['away', awayTeam, awayPitchers], ['home', homeTeam, homePitchers]].map(([side, team, pitchers]) => (
        <div key={side} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <TeamLogo abbr={team.abbr} size={24} />
            <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
          </div>
          {pitchers.map(p => (
            <PitcherCard key={p.id} pitcher={p} isFinal={isFinal}
              isWinner={winnerName && p.name === winnerName}
              isLoser={loserName && p.name === loserName}
            />
          ))}
          {!pitchers.length && <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'20px 0' }}>No pitching data yet</div>}
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <AIAnalysis awayPitchers={awayPitchers} homePitchers={homePitchers} awayTeam={awayTeam} homeTeam={homeTeam} awayScore={awayScore} homeScore={homeScore} awayBatters={awayBatters || []} homeBatters={homeBatters || []} keyPlays={keyPlays || []} isFinal={isFinal} inning={inning} inningHalf={inningHalf} />
      </div>
    </div>
  );
}
