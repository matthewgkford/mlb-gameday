import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TeamLogo, PlayerPhoto, TrendArrow, rateBAT, rateOBP, rateSLG, rateOPS } from './SharedUI';
import PlayerPage from './PlayerPage';

function TrajectoryArc({ launchAngle, color }) {
  const W = 240, H = 44, floor = H - 6, sx = 12, ex = W - 12;
  const angleRad = (launchAngle * Math.PI) / 180;
  const isGroundBall = launchAngle <= 5;
  const midX = (sx + ex) / 2;

  let path, fill;
  if (isGroundBall) {
    path = null;
  } else {
    const rawPeak = Math.sin(2 * angleRad) * 1.3;
    const peakH = Math.min(floor - 4, (floor - 4) * rawPeak);
    const cy = floor - peakH;
    path = `M ${sx} ${floor} Q ${midX} ${cy} ${ex} ${floor}`;
    fill = 'none';
  }

  return (
    <svg
      width="100%" height={H} viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display:'block', marginTop:6 }}
    >
      {/* ground baseline */}
      <line x1={sx} y1={floor} x2={ex} y2={floor} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      {isGroundBall ? (
        <line x1={sx} y1={floor} x2={ex} y2={floor} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
      ) : (
        <path d={path} stroke={color} strokeWidth={1.5} fill={fill} opacity={0.7} />
      )}
      {/* home plate dot */}
      <circle cx={sx} cy={floor} r={2.5} fill={color} opacity={0.8} />
      {/* landing dot */}
      <circle cx={ex} cy={floor} r={2.5} fill={color} opacity={0.8} />
    </svg>
  );
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function outcomeStyle(event) {
  if (!event) return { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.08)' };
  if (event === 'Home Run') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  if (['Single','Double','Triple','Walk','Intentional Walk','Hit By Pitch'].includes(event))
    return { color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
  if (event.includes('Strikeout'))
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  return { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.08)' };
}

function ABRecap({ batterName, batterId, allPlays }) {
  const abs = (allPlays ?? []).filter(p =>
    p.about?.isComplete && p.matchup?.batter?.id === batterId
  );

  if (!abs.length) {
    return (
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'14px 0' }}>
        No at-bats yet
      </div>
    );
  }

  const namePattern = new RegExp('^' + batterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight:320, overflowY:'auto' }}>
      {abs.map((play, i) => {
        const event   = play.result?.event;
        const style   = outcomeStyle(event);
        const rawDesc = play.result?.description || '';
        const desc    = rawDesc.replace(namePattern, '');
        const trimmed = desc.charAt(0).toUpperCase() + desc.slice(1);
        const half    = play.about?.halfInning === 'top' ? '▲' : '▼';
        const inning  = ordinal(play.about?.inning ?? 0);
        const pitcher = play.matchup?.pitcher?.fullName || '';
        const rbi     = play.result?.rbi || 0;
        const isHit      = ['Single','Double','Triple','Home Run'].includes(event);
        const inPlayEvt  = isHit ? play.playEvents?.find(e => e.hitData) : null;
        const ev      = inPlayEvt?.hitData?.launchSpeed   ?? null;
        const la      = inPlayEvt?.hitData?.launchAngle   ?? null;
        const dist    = inPlayEvt?.hitData?.totalDistance ?? null;
        const hasChips = ev != null || la != null || dist != null;
        // Chips share the outcome colour so they feel part of the same visual unit
        const chipColor = style.color;
        const chipBg    = style.bg;

        return (
          <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'9px 11px' }}>
            {/* Top line: inning · pitcher · outcome badge · RBI badge */}
            <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', marginBottom: trimmed ? 4 : 0 }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', flexShrink:0 }}>{half}{inning}</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>·</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                vs {pitcher}
              </span>
              <span style={{ fontSize:10, fontWeight:700, color:style.color, background:style.bg, borderRadius:5, padding:'2px 6px', flexShrink:0 }}>
                {event || '?'}
              </span>
              {rbi > 0 && (
                <span style={{ fontSize:10, fontWeight:700, color:'#f59e0b', background:'rgba(245,158,11,0.12)', borderRadius:5, padding:'2px 6px', flexShrink:0 }}>
                  {rbi} RBI
                </span>
              )}
            </div>
            {/* Description */}
            {trimmed && (
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.45, marginBottom: hasChips ? 6 : 0 }}>
                {trimmed}
              </div>
            )}
            {/* Statcast chips — hits only, coloured to match outcome badge */}
            {hasChips && (
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {ev   != null && <span style={{ fontSize:10, fontFamily:'monospace', color:chipColor, background:chipBg, borderRadius:4, padding:'2px 6px' }}>EV {ev} mph</span>}
                {la   != null && <span style={{ fontSize:10, fontFamily:'monospace', color:chipColor, background:chipBg, borderRadius:4, padding:'2px 6px' }}>LA {la}°</span>}
                {dist != null && <span style={{ fontSize:10, fontFamily:'monospace', color:chipColor, background:chipBg, borderRadius:4, padding:'2px 6px' }}>{dist} ft</span>}
              </div>
            )}
            {/* Trajectory arc — only when launch angle is available */}
            {la != null && <TrajectoryArc launchAngle={la} color={chipColor} />}
          </div>
        );
      })}
    </div>
  );
}

function SeasonStatsModal({ batter, allPlays, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <div
        className="scale-in"
        onClick={e => e.stopPropagation()}
        style={{ background:'#1a1f2e', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:20, padding:20, width:'100%', maxWidth:340 }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <PlayerPhoto playerId={batter.id} name={batter.name} size={48} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:600, color:'#fff' }}>{batter.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{batter.position}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'4px 10px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>✕</button>
        </div>

        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>At-bats this game</div>
        <div style={{ marginBottom:14 }}>
          <ABRecap batterName={batter.name} batterId={batter.id} allPlays={allPlays} />
        </div>

        <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>2025 season</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6 }}>
          {[['AVG',batter.seasonAvg||'–'],['OPS',batter.seasonOps||'–'],['HR',batter.seasonHr??'–'],['RBI',batter.seasonRbi??'–']].map(([label,val])=>(
            <div key={label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:16, fontWeight:600, color:'#fff' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:12, textAlign:'center' }}>Tap outside to close</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

function TopPerformers({ batters, onPlayerTap }) {
  const performers = batters
    .filter(b => b.h > 0 || b.hr > 0 || b.rbi > 1)
    .sort((a, b) => (b.hr * 3 + b.rbi * 2 + b.h) - (a.hr * 3 + a.rbi * 2 + a.h))
    .slice(0, 3);

  if (!performers.length) return null;

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Top performers</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {performers.map(b => (
          <div key={b.id} onClick={() => onPlayerTap(b)} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 12px', flex:'1 1 auto', minWidth:130, cursor:'pointer' }}>
            <PlayerPhoto playerId={b.id} name={b.name} size={32} />
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#60a5fa', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.4)' }}>
                {(() => { const parts = b.name.split(' '); const last = parts[parts.length - 1]; return (last === 'Jr.' || last === 'Jr' || last === 'Sr.' || last === 'Sr' || last === 'II' || last === 'III') ? parts[parts.length - 2] : last; })()}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:1 }}>
                {b.h}H{b.hr > 0 ? ` · ${b.hr}HR` : ''}{b.rbi > 0 ? ` · ${b.rbi}RBI` : ''}
              </div>
            </div>
          </div>
        ))}
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

function BatterRow({ b, onRowClick, onNameClick, delay, idx }) {
  return (
    <tr onClick={() => onRowClick(b)} style={{ cursor:'pointer', animation:`fadeIn 0.3s ease forwards`, animationDelay:`${delay}ms`, opacity:0, background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <PlayerPhoto playerId={b.id} name={b.name} size={26} />
          <div>
            <div>
              <span
                onClick={e => { e.stopPropagation(); onNameClick(b); }}
                style={{ fontWeight:600, color:'#60a5fa', fontSize:13, textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.5)', cursor:'pointer' }}
              >{b.name}</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:1 }}>
              {b.position}{b.batSide ? <span style={{ color:'rgba(255,255,255,0.2)' }}> · {b.batSide}</span> : ''}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.ab}</td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.h>0?'#60a5fa':'rgba(255,255,255,0.4)', fontWeight:b.h>0?600:400 }}>{b.h}</td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right' }}>
        {b.hr>0?<span style={{ color:'#60a5fa', fontWeight:600 }}>{b.hr}</span>:<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}
      </td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.rbi||<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}</td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:'rgba(255,255,255,0.8)' }}>{b.bb||<span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>}</td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.r>0?'#60a5fa':'rgba(255,255,255,0.3)' }}>{b.r||'–'}</td>
      <td style={{ padding:'7px 8px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', textAlign:'right', color:b.k>0?'#f87171':'rgba(255,255,255,0.3)' }}>{b.k||'–'}</td>
    </tr>
  );
}

function TeamSection({ side, team, batters, stats, allPlays }) {
  const [modal, setModal] = useState(null);
  const [playerPage, setPlayerPage] = useState(null);
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      {modal && <SeasonStatsModal batter={modal} allPlays={allPlays} onClose={() => setModal(null)} />}
      {playerPage && <PlayerPage playerId={playerPage.id} playerName={playerPage.name} teamAbbr={team.abbr} onClose={() => setPlayerPage(null)} />}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:10, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        <TeamLogo abbr={team.abbr} size={24} />
        <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{team.city} {team.name}</span>
      </div>
      <TopPerformers batters={batters} onPlayerTap={setPlayerPage} />
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:8 }}>Tap a player's name for their full profile · tap a row for this game's stats</div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>Batter</th>
              {['AB','H','HR','RBI','BB','R','K'].map(h=>(
                <th key={h} style={{ textAlign:'right', padding:'4px 8px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batters.map((b, i) => <BatterRow key={b.id} b={b} onRowClick={setModal} onNameClick={setPlayerPage} delay={i * 30} idx={i} />)}
            {batters.length > 0 && (
              <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                <td style={{ padding:'7px 8px', fontWeight:600, color:'rgba(255,255,255,0.4)', fontSize:11 }}>Totals</td>
                {['ab','h','hr','rbi','bb','r','k'].map(f=>(
                  <td key={f} style={{ padding:'7px 8px', textAlign:'right', color:'rgba(255,255,255,0.6)', fontWeight:500 }}>
                    {batters.reduce((a,b)=>a+(b[f]||0),0)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <SlashLine stats={stats} />
    </div>
  );
}

function TeamComparisonBar({ awayTeam, homeTeam, awayStats, homeStats, awayBatters, homeBatters, awayErrors, homeErrors }) {
  const sum = (batters, field) => batters.reduce((a, b) => a + (b[field] || 0), 0);

  const awayXBH = sum(awayBatters, 'doubles') + sum(awayBatters, 'triples') + sum(awayBatters, 'hr');
  const homeXBH = sum(homeBatters, 'doubles') + sum(homeBatters, 'triples') + sum(homeBatters, 'hr');
  const awayTB = sum(awayBatters, 'h') + sum(awayBatters, 'doubles') + sum(awayBatters, 'triples') * 2 + sum(awayBatters, 'hr') * 3;
  const homeTB = sum(homeBatters, 'h') + sum(homeBatters, 'doubles') + sum(homeBatters, 'triples') * 2 + sum(homeBatters, 'hr') * 3;

  const rows = [
    { label: 'Hits',            a: awayStats.hits          ?? sum(awayBatters, 'h'),  h: homeStats.hits          ?? sum(homeBatters, 'h') },
    { label: 'Home Runs',       a: awayStats.homeRuns      ?? sum(awayBatters, 'hr'), h: homeStats.homeRuns      ?? sum(homeBatters, 'hr') },
    { label: 'Extra Base Hits', a: awayStats.extraBaseHits ?? awayXBH,               h: homeStats.extraBaseHits ?? homeXBH },
    { label: 'Total Bases',     a: awayStats.totalBases    ?? awayTB,                h: homeStats.totalBases    ?? homeTB },
    { label: 'Strikeouts',      a: awayStats.strikeOuts    ?? sum(awayBatters, 'k'), h: homeStats.strikeOuts    ?? sum(homeBatters, 'k') },
    { label: 'Walks',           a: awayStats.baseOnBalls   ?? sum(awayBatters, 'bb'),h: homeStats.baseOnBalls   ?? sum(homeBatters, 'bb') },
    { label: 'Stolen Bases',    a: awayStats.stolenBases   ?? 0,                     h: homeStats.stolenBases   ?? 0 },
    { label: 'Double Plays',    a: awayStats.groundIntoDoublePlay ?? 0,              h: homeStats.groundIntoDoublePlay ?? 0 },
    { label: 'Errors',          a: awayErrors ?? 0,                                  h: homeErrors ?? 0 },
  ];

  const AWAY_COLOR = 'rgba(96,165,250,0.7)';
  const HOME_COLOR = 'rgba(251,146,60,0.6)';
  const EMPTY_COLOR = 'rgba(255,255,255,0.07)';

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <TeamLogo abbr={awayTeam.abbr} size={20} />
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>{awayTeam.abbr}</span>
        </div>
        <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.5, color:'rgba(255,255,255,0.25)' }}>Team stats</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>{homeTeam.abbr}</span>
          <TeamLogo abbr={homeTeam.abbr} size={20} />
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {rows.map(({ label, a, h }) => {
          const av = a ?? 0;
          const hv = h ?? 0;
          const total = av + hv;
          const awayPct = total === 0 ? 50 : (av / total) * 100;
          return (
            <div key={label}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:16, fontWeight:400, color: av > hv ? '#fff' : 'rgba(255,255,255,0.6)' }}>{av}</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', letterSpacing:0.2 }}>{label}</span>
                <span style={{ fontSize:16, fontWeight:400, color: hv > av ? '#fff' : 'rgba(255,255,255,0.6)' }}>{hv}</span>
              </div>
              <div style={{ height:5, borderRadius:3, overflow:'hidden', display:'flex' }}>
                <div style={{ width:`${awayPct}%`, background: total === 0 ? EMPTY_COLOR : AWAY_COLOR, transition:'width 0.4s ease' }} />
                <div style={{ flex:1, background: total === 0 ? EMPTY_COLOR : HOME_COLOR }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BattingTab({ data }) {
  const { awayTeam, homeTeam, awayBatters, homeBatters, awayTeamStats, homeTeamStats, awayErrors, homeErrors, allPlays } = data;
  const totalPitches = [...(data.awayPitchers || []), ...(data.homePitchers || [])].reduce((s, p) => s + (p.pitchCount || 0), 0);
  return (
    <div className="tab-panel">
      {totalPitches >= 20 && (
        <TeamComparisonBar
          awayTeam={awayTeam} homeTeam={homeTeam}
          awayStats={awayTeamStats} homeStats={homeTeamStats}
          awayBatters={awayBatters} homeBatters={homeBatters}
          awayErrors={awayErrors} homeErrors={homeErrors}
        />
      )}
      <TeamSection side="away" team={awayTeam} batters={awayBatters} stats={awayTeamStats} allPlays={allPlays} />
      <TeamSection side="home" team={homeTeam} batters={homeBatters} stats={homeTeamStats} allPlays={allPlays} />
    </div>
  );
}
