import React, { useState, useEffect } from 'react';
import { TeamLogo, TrendArrow, rateBABIP, rateISO, rateOPS, rateWHIP, rateOBP, rateERA, rateKpct, rateBBpct, rateKper9, rateKBB, calcBABIP, calcISO, calcKpct, calcBBpct, calcKper9, calcKBB } from './SharedUI';
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
            position:'fixed', top:'28%', left:'50%', transform:'translateX(-50%)',
            background:'#1e293b', border:'0.5px solid rgba(255,255,255,0.2)', borderRadius:10,
            padding:'10px 14px', fontSize:12, color:'rgba(255,255,255,0.85)', whiteSpace:'normal',
            zIndex:101, pointerEvents:'none', width:'calc(100vw - 48px)', maxWidth:320, textAlign:'center',
            lineHeight:1.5,
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
    { team:awayTeam, batting:awayTeamStats, pitching:awayTeamPitching },
    { team:homeTeam, batting:homeTeamStats, pitching:homeTeamPitching },
  ];

  return (
    <div className="tab-panel">
      {/* Season stats — batting + pitching per team */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:16, marginBottom:10 }}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5 }}>Season stats</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:2 }}>Season-to-date team averages</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {teams.map(({ team, batting, pitching }) => {
            const babip=calcBABIP(batting), iso=calcISO(batting), ops=batting.ops||'.---';
            const obp=batting.obp||'.---', kpct=calcKpct(batting), bbpct=calcBBpct(batting);
            const era=pitching.era||'-', whip=pitching.whip||'-', kper9=calcKper9(pitching), kbb=calcKBB(pitching);
            return (
              <div key={team.abbr}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <TeamLogo abbr={team.abbr} size={22} />
                  <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{team.city} {team.name}</span>
                </div>
                {/* Batting */}
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Batting</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                  <MetricCard label="OPS" val={ops} rating={rateOPS(ops)} tip="On-Base + Slugging combined. The go-to offensive rate stat. Below .700 = poor · .700–.800 = avg · .800–.900 = good · .900+ = elite" />
                  <MetricCard label="OBP" val={obp} rating={rateOBP(obp)} tip="How often a batter reaches base via hit, walk or HBP. Below .300 = poor · .300–.330 = avg · .330–.370 = good · .370+ = elite" />
                  <MetricCard label="BABIP" val={babip} rating={rateBABIP(babip)} tip="Batting avg on balls put in play (excludes HRs and Ks). High = lucky or fast; low = unlucky or weak contact. Below .260 = poor · .260–.295 = avg · .295–.340 = good · .340+ = elite" />
                  <MetricCard label="ISO" val={iso} rating={rateISO(iso)} tip="Isolated Power = SLG − AVG. Measures extra-base ability stripped of singles. Below .120 = poor · .120–.160 = avg · .160–.220 = good · .220+ = elite" />
                  <MetricCard label="K%" val={kpct} rating={rateKpct(kpct)} tip="Strikeout rate. Lower is better — high K% means weak contact. Below 14% = elite · 14–18% = good · 18–24% = avg · 24%+ = poor" />
                  <MetricCard label="BB%" val={bbpct} rating={rateBBpct(bbpct)} tip="Walk rate. Higher is better — reflects plate discipline and pitch recognition. Below 6% = poor · 6–9% = avg · 9–12% = good · 12%+ = elite" />
                </div>
                {/* Pitching */}
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Pitching</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <MetricCard label="ERA" val={era==='-'?'-':parseFloat(era).toFixed(2)} rating={rateERA(era)} tip="Earned runs allowed per 9 innings. The primary pitching rate stat. Below 2.50 = elite · 2.50–3.50 = good · 3.50–4.50 = avg · 4.50+ = poor" />
                  <MetricCard label="WHIP" val={whip==='-'?'-':parseFloat(whip).toFixed(2)} rating={rateWHIP(whip)} tip="Walks + hits allowed per inning pitched. Measures base-runner prevention. Below 1.00 = elite · 1.00–1.20 = good · 1.20–1.35 = avg · 1.35+ = poor" />
                  <MetricCard label="K/9" val={kper9} rating={rateKper9(kper9)} tip="Strikeouts per 9 innings. Measures a staff's swing-and-miss ability. Below 7 = poor · 7–8.5 = avg · 8.5–10 = good · 10+ = elite" />
                  <MetricCard label="K/BB" val={kbb} rating={rateKBB(kbb)} tip="Strikeout-to-walk ratio. High Ks and low BBs = true command. Below 2.0 = poor · 2.0–3.0 = avg · 3.0–4.0 = good · 4.0+ = elite" />
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
