import React, { useState, useEffect } from 'react';
import { TeamLogo, TrendArrow, rateBABIP, rateISO, rateOPS, rateWHIP, calcBABIP, calcISO } from './SharedUI';
import { getHeadToHead } from '../utils/mlbApi';

// Tap-to-show tooltip for mobile
function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <span
        onClick={e => { e.stopPropagation(); setVisible(v => !v); }}
        style={{ cursor:'pointer' }}
      >
        {children}
      </span>
      {visible && (
        <>
          <span
            onClick={() => setVisible(false)}
            style={{ position:'fixed', inset:0, zIndex:100 }}
          />
          <span style={{
            position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
            background:'#1e293b', border:'0.5px solid rgba(255,255,255,0.2)', borderRadius:8,
            padding:'6px 10px', fontSize:11, color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap',
            zIndex:101, pointerEvents:'none', maxWidth:200, whiteSpace:'normal', textAlign:'center',
            lineHeight:1.4,
          }}>
            {text}
          </span>
        </>
      )}
    </span>
  );
}

function MetricCard({ label, val, tip, rating }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'11px 10px' }}>
      <div style={{ fontSize:18, fontWeight:600, color:'#fff', marginBottom:5 }}>{val}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
          {label}
          <Tooltip text={tip}>
            <span style={{ width:14, height:14, borderRadius:'50%', border:'0.5px solid rgba(255,255,255,0.25)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'rgba(255,255,255,0.4)', cursor:'pointer', flexShrink:0 }}>?</span>
          </Tooltip>
        </div>
        <TrendArrow rating={rating} size={13} />
      </div>
    </div>
  );
}

function BullpenSection({ pitchers, teamAbbr, isFinal }) {
  const relievers = pitchers.filter(p => !p.isStarter);
  if (!relievers.length) return (
    <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'12px 0' }}>No relief appearances yet</div>
  );
  return (
    <div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:10 }}>
        Today's usage only · pitch counts from this game
      </div>
      {relievers.map(p => {
        const outs = Math.round(parseFloat(p.ip || 0) * 3);
        const ppo = outs > 0 ? (p.pitchCount / outs).toFixed(1) : '—';
        return (
          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{p.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                {p.ip} IP · {p.pitchCount} pitches · {ppo} per out
              </div>
            </div>
            <div style={{ display:'flex', gap:10, textAlign:'center' }}>
              {[['K',p.k,'#60a5fa'],['BB',p.bb,'rgba(255,255,255,0.6)'],['ER',p.er,p.er>0?'#f87171':'#4ade80']].map(([label,val,color])=>(
                <div key={label}>
                  <div style={{ fontSize:15, fontWeight:600, color }}>{val}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatcastRow({ play }) {
  if (!play.exitVelocity) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ minWidth:52 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#60a5fa' }}>{play.exitVelocity?.toFixed(1)}</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>mph EV</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:500, color:'#fff', fontSize:13 }}>{play.batter} — {play.event?.replace(/_/g,' ')}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{play.desc?.slice(0,90)}{play.desc?.length>90?'...':''}</div>
      </div>
      <div style={{ fontSize:11, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'2px 8px', whiteSpace:'nowrap', color:'rgba(255,255,255,0.6)' }}>
        {play.launchAngle?.toFixed(0)}° · {play.distance?.toFixed(0)} ft
      </div>
    </div>
  );
}

function HeadToHead({ awayTeam, homeTeam }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!awayTeam.id || !homeTeam.id) { setLoading(false); return; }
    getHeadToHead(awayTeam.id, homeTeam.id)
      .then(setGames).catch(() => {}).finally(() => setLoading(false));
  }, [awayTeam.id, homeTeam.id]);

  if (loading) return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>Loading series history...</div>;
  if (!games.length) return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>No previous meetings this season</div>;

  const awayWins = games.filter(g => {
    const aS = g.teams?.away?.score??0, hS = g.teams?.home?.score??0;
    const isAway = g.teams?.away?.team?.id === awayTeam.id;
    return isAway ? aS > hS : hS > aS;
  }).length;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <TeamLogo abbr={awayTeam.abbr} size={22} />
          <span style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{awayWins}</span>
        </div>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:16 }}>–</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{games.length - awayWins}</span>
          <TeamLogo abbr={homeTeam.abbr} size={22} />
        </div>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginLeft:4 }}>season series ({games.length} game{games.length!==1?'s':''})</span>
      </div>
      {games.slice(-5).reverse().map((g, i) => {
        const aScore = g.teams?.away?.score??0, hScore = g.teams?.home?.score??0;
        const isAway = g.teams?.away?.team?.id === awayTeam.id;
        const awayActual = isAway ? aScore : hScore, homeActual = isAway ? hScore : aScore;
        const awayWon = awayActual > homeActual;
        const date = new Date(g.gameDate).toLocaleDateString('en-US', { month:'short', day:'numeric' });
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:12 }}>
            <span style={{ color:'rgba(255,255,255,0.3)', minWidth:48 }}>{date}</span>
            <TeamLogo abbr={awayTeam.abbr} size={16} />
            <span style={{ fontWeight:awayWon?600:400, color:awayWon?'#60a5fa':'rgba(255,255,255,0.7)' }}>{awayActual}</span>
            <span style={{ color:'rgba(255,255,255,0.25)' }}>–</span>
            <span style={{ fontWeight:!awayWon?600:400, color:!awayWon?'#60a5fa':'rgba(255,255,255,0.7)' }}>{homeActual}</span>
            <TeamLogo abbr={homeTeam.abbr} size={16} />
            <span style={{ marginLeft:'auto', fontSize:11, color:awayWon?'#4ade80':'#f87171', fontWeight:500 }}>{awayWon ? awayTeam.abbr+' W' : homeTeam.abbr+' W'}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdvancedTab({ data }) {
  const { awayTeam, homeTeam, awayTeamStats, homeTeamStats, awayTeamPitching, homeTeamPitching, keyPlays, awayPitchers, homePitchers, isFinal } = data;
  const statcastPlays = [...keyPlays].filter(p=>p.exitVelocity).sort((a,b)=>(b.exitVelocity||0)-(a.exitVelocity||0)).slice(0,5);

  const teams = [
    { team:awayTeam, batting:awayTeamStats, pitching:awayTeamPitching, pitchers:awayPitchers },
    { team:homeTeam, batting:homeTeamStats, pitching:homeTeamPitching, pitchers:homePitchers },
  ];

  return (
    <div className="tab-panel">
      {/* Team comparison — 2x2 grid per team */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>Team comparison</div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {teams.map(({ team, batting, pitching }) => {
            const babip=calcBABIP(batting), iso=calcISO(batting), ops=batting.ops||'.---', whip=pitching.whip||'-';
            return (
              <div key={team.abbr}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <TeamLogo abbr={team.abbr} size={22} />
                  <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{team.city} {team.name}</span>
                </div>
                {/* 2x2 grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <MetricCard label="BABIP" val={babip} rating={rateBABIP(babip)} tip="Batting Avg on Balls In Play. Reflects luck and defence. League avg ~.300." />
                  <MetricCard label="ISO" val={iso} rating={rateISO(iso)} tip="Isolated Power (SLG − AVG). Measures raw power. Above .200 is excellent." />
                  <MetricCard label="OPS" val={ops} rating={rateOPS(ops)} tip="On-Base Plus Slugging. Above .900 is elite, above .800 is good." />
                  <MetricCard label="WHIP" val={whip==='-'?'-':parseFloat(whip).toFixed(2)} rating={rateWHIP(whip)} tip="Walks + Hits per Inning Pitched. Below 1.00 is excellent, below 1.20 is good." />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', gap:12, marginTop:14, paddingTop:12, borderTop:'0.5px solid rgba(255,255,255,0.08)', flexWrap:'wrap', fontSize:11, color:'rgba(255,255,255,0.3)' }}>
          {[['elite','↑↑ Well above avg'],['good','↑ Above avg'],['avg','→ Average'],['poor','↓ Below avg']].map(([r,lbl])=>(
            <span key={r} style={{ display:'flex', alignItems:'center', gap:5 }}><TrendArrow rating={r} size={12} />{lbl}</span>
          ))}
        </div>
      </div>

      {/* Bullpen status */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>Bullpen — today's usage</div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {teams.map(({ team, pitchers }) => (
            <div key={team.abbr}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <TeamLogo abbr={team.abbr} size={20} />
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>{team.name}</span>
              </div>
              <BullpenSection pitchers={pitchers} teamAbbr={team.abbr} isFinal={isFinal} />
            </div>
          ))}
        </div>
      </div>

      {/* Statcast highlights */}
      {statcastPlays.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Statcast highlights</div>
          {statcastPlays.map((p,i) => <StatcastRow key={i} play={p} />)}
        </div>
      )}

      {/* Season series */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>Season series</div>
        <HeadToHead awayTeam={awayTeam} homeTeam={homeTeam} />
      </div>
    </div>
  );
}
