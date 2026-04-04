import React, { useState, useEffect } from 'react';
import { useGamesForDate } from '../hooks/useTodaysGames';
import { todayString, formatDateLabel, getStandings, getLeagueLeaders } from '../utils/mlbApi';
import { TeamLogo } from './SharedUI';

const FAV_TEAM_ID = 121; // Mets

function getPastDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function GameCard({ game, onClick }) {
  const isLive = game.status === 'Live';
  const isFinal = game.status === 'Final';
  const isFav = game.awayTeam.id === FAV_TEAM_ID || game.homeTeam.id === FAV_TEAM_ID;

  return (
    <button onClick={() => onClick(game)} style={{
      display:'block', width:'100%', textAlign:'left', cursor:'pointer', border:'none',
      background: isFav?'rgba(0,45,114,0.25)':isLive?'rgba(220,38,38,0.08)':'rgba(255,255,255,0.04)',
      borderRadius:16, padding:'14px 16px', marginBottom:10,
      outline: isFav?'1px solid rgba(0,45,114,0.5)':isLive?'0.5px solid rgba(220,38,38,0.3)':'0.5px solid rgba(255,255,255,0.08)',
      transition:'background 0.15s',
    }}>
      {isFav && <div style={{ fontSize:10, color:'#60a5fa', fontWeight:600, letterSpacing:0.5, marginBottom:6, textTransform:'uppercase' }}>⭐ Your team</div>}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
          <TeamLogo abbr={game.awayTeam.abbr} size={36} />
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:isFinal&&game.awayTeam.isWinner?'#60a5fa':'#fff' }}>{game.awayTeam.abbr}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{game.awayTeam.name}</div>
          </div>
        </div>
        <div style={{ textAlign:'center', padding:'0 10px' }}>
          {(isLive||isFinal) ? (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:26, fontWeight:700, color:isFinal&&game.awayTeam.isWinner?'#60a5fa':'#fff' }}>{game.awayTeam.score}</span>
              <span style={{ fontSize:16, color:'rgba(255,255,255,0.2)' }}>–</span>
              <span style={{ fontSize:26, fontWeight:700, color:isFinal&&game.homeTeam.isWinner?'#60a5fa':'#fff' }}>{game.homeTeam.score}</span>
            </div>
          ) : (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{game.statusLabel}</div>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexDirection:'row-reverse' }}>
          <TeamLogo abbr={game.homeTeam.abbr} size={36} />
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:15, fontWeight:600, color:isFinal&&game.homeTeam.isWinner?'#60a5fa':'#fff' }}>{game.homeTeam.abbr}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{game.homeTeam.name}</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
        {isLive && <span style={{ fontSize:10, fontWeight:700, background:'#dc2626', color:'#fff', borderRadius:6, padding:'2px 8px' }}>● LIVE {game.statusLabel}</span>}
        {isFinal && <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Final</span>}
        {!isLive&&!isFinal && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{game.statusLabel}</span>}
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{game.venue}</span>
      </div>
      {game.probableAwayPitcher && !isLive && !isFinal && (
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8, borderTop:'0.5px solid rgba(255,255,255,0.06)', paddingTop:8 }}>
          {game.probableAwayPitcher} vs {game.probableHomePitcher}
        </div>
      )}
    </button>
  );
}

function DayView({ dateStr, onSelectGame }) {
  const { games, loading, error } = useGamesForDate(dateStr);
  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading...</div>;
  if (error) return <div style={{ textAlign:'center', padding:'40px 0', color:'#f87171', fontSize:13 }}>{error}</div>;
  if (!games.length) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No games scheduled</div>;

  const favGame = games.find(g => g.awayTeam.id===FAV_TEAM_ID || g.homeTeam.id===FAV_TEAM_ID);
  const live = games.filter(g => g.status==='Live' && g!==favGame);
  const upcoming = games.filter(g => !['Live','Final'].includes(g.status) && g!==favGame);
  const final = games.filter(g => g.status==='Final' && g!==favGame);

  const Section = ({ title, games: gs }) => !gs.length ? null : (
    <>
      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8, marginTop:14 }}>{title}</div>
      {gs.map(g => <GameCard key={g.gamePk} game={g} onClick={onSelectGame} />)}
    </>
  );

  return (
    <div className="fade-in">
      {favGame && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Your team</div>
          <GameCard game={favGame} onClick={onSelectGame} />
        </>
      )}
      <Section title="Live now" games={live} />
      <Section title="Upcoming" games={upcoming} />
      <Section title="Final" games={final} />
    </div>
  );
}

function StandingsView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('AL');

  useEffect(() => {
    getStandings().then(setRecords).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading standings...</div>;

  const leagues = { AL:[], NL:[] };
  records.forEach(div => {
    const lg = div.league?.name?.includes('American') ? 'AL' : 'NL';
    leagues[lg].push(div);
  });

  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {['AL','NL'].map(lg => (
          <button key={lg} onClick={()=>setActiveLeague(lg)} style={{ padding:'6px 16px', fontSize:13, borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', background:activeLeague===lg?'#fff':'rgba(255,255,255,0.07)', color:activeLeague===lg?'#0f1117':'rgba(255,255,255,0.5)', fontWeight:activeLeague===lg?600:400 }}>{lg}</button>
        ))}
      </div>
      {(leagues[activeLeague]||[]).map(div => (
        <div key={div.division?.id} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>{div.division?.name}</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:'3px 6px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>Team</th>
                {['W','L','PCT','GB','L10'].map(h=><th key={h} style={{ textAlign:'right', padding:'3px 6px', color:'rgba(255,255,255,0.3)', fontWeight:400, fontSize:11, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(div.teamRecords||[]).map((tr,i) => {
                const isFav = tr.team?.id === FAV_TEAM_ID;
                const l10 = tr.records?.splitRecords?.find(s=>s.type==='lastTen');
                return (
                  <tr key={tr.team?.id} style={{ background:isFav?'rgba(0,45,114,0.2)':'transparent' }}>
                    <td style={{ padding:'7px 6px', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <TeamLogo abbr={tr.team?.abbreviation} size={20} />
                        <span style={{ fontWeight:isFav?600:400, color:isFav?'#60a5fa':'#fff', fontSize:13 }}>{tr.team?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'7px 6px', textAlign:'right', borderBottom:'0.5px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.8)' }}>{tr.wins}</td>
                    <td style={{ padding:'7px 6px', textAlign:'right', borderBottom:'0.5px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.8)' }}>{tr.losses}</td>
                    <td style={{ padding:'7px 6px', textAlign:'right', borderBottom:'0.5px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)' }}>{tr.winningPercentage}</td>
                    <td style={{ padding:'7px 6px', textAlign:'right', borderBottom:'0.5px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)' }}>{tr.gamesBack==='0'?'–':tr.gamesBack}</td>
                    <td style={{ padding:'7px 6px', textAlign:'right', borderBottom:'0.5px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', fontSize:11 }}>{l10?.wins||0}-{l10?.losses||0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function LeadersView() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeagueLeaders().then(setLeaders).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading leaders...</div>;

  const catLabels = { homeRuns:'Home runs', battingAverage:'Batting avg', earnedRunAverage:'ERA leaders', strikeouts:'Strikeouts' };

  return (
    <div className="fade-in">
      {leaders.map(({ cat, leaders: ls }) => (
        <div key={cat} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>{catLabels[cat]||cat}</div>
          {ls.slice(0,5).map((l,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<4?'0.5px solid rgba(255,255,255,0.06)':'none' }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', minWidth:16, textAlign:'center' }}>{l.rank}</span>
              <TeamLogo abbr={l.team?.abbreviation} size={22} />
              <span style={{ flex:1, fontSize:13, fontWeight:500, color:'#fff' }}>{l.person?.fullName}</span>
              <span style={{ fontSize:15, fontWeight:700, color:'#60a5fa' }}>{l.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GamePicker({ onSelectGame }) {
  const days = getPastDays(7);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [mainTab, setMainTab] = useState('games');

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img
            src="https://mlb-gameday.vercel.app/icon.png"
            alt="Between Innings"
            width={36}
            height={36}
            style={{ borderRadius:8, objectFit:'cover' }}
          />
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>Between Innings</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Mets fan · MLB gameday</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div style={{ display:'flex', gap:4, padding:'14px 16px 0' }}>
        {[['games','Games'],['standings','Standings'],['leaders','Leaders']].map(([id,label])=>(
          <button key={id} onClick={()=>setMainTab(id)} style={{ padding:'7px 16px', fontSize:13, borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', background:mainTab===id?'#fff':'rgba(255,255,255,0.07)', color:mainTab===id?'#0f1117':'rgba(255,255,255,0.5)', fontWeight:mainTab===id?600:400, transition:'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {mainTab === 'games' && (
        <>
          <div style={{ overflowX:'auto', padding:'14px 0', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', gap:6, padding:'0 16px', width:'max-content' }}>
              {days.map(d=>(
                <button key={d} onClick={()=>setSelectedDate(d)} style={{ padding:'7px 14px', fontSize:13, borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', background:selectedDate===d?'#fff':'rgba(255,255,255,0.07)', color:selectedDate===d?'#0f1117':'rgba(255,255,255,0.5)', fontWeight:selectedDate===d?600:400, transition:'all 0.15s' }}>
                  {formatDateLabel(d)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:'16px 16px 0' }}>
            <DayView dateStr={selectedDate} onSelectGame={onSelectGame} />
          </div>
        </>
      )}
      {mainTab === 'standings' && <div style={{ padding:'16px 16px 0' }}><StandingsView /></div>}
      {mainTab === 'leaders' && <div style={{ padding:'16px 16px 0' }}><LeadersView /></div>}
    </div>
  );
}
