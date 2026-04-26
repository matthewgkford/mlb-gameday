import React, { useState, useEffect, useCallback } from 'react';
import { useGamesForDate } from '../hooks/useTodaysGames';
import { todayString, formatDateLabel, getStandings, getLeagueLeaders, fetchCurrentTeams, playerHeadshotUrl, getUpcomingMetsGames, getMetsBullpenStatus } from '../utils/mlbApi';
import { TeamLogo, PlayerPhoto } from './SharedUI';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import MetsGrid from './MetsGrid';
import TriviaTab from './Trivia/TriviaTab';
import PlayerPage from './PlayerPage';

function LeaderPhoto({ playerId, name }) {
  const [err, setErr] = React.useState(false);
  const initials = (name||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if (err || !playerId) return (
    <div style={{ width:36,height:36,borderRadius:'50%',background:'#1e3a5f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.7)',flexShrink:0 }}>{initials}</div>
  );
  return (
    <img src={playerHeadshotUrl(playerId)} alt={name} width={36} height={36} style={{ borderRadius:'50%',objectFit:'cover',flexShrink:0 }} onError={()=>setErr(true)} />
  );
}

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
  const isPostponed = game.detailedState === 'Postponed';
  const isLive = game.status === 'Live' && !isPostponed;
  const isFinal = game.status === 'Final' && !isPostponed;
  const isFav = game.awayTeam.id === FAV_TEAM_ID || game.homeTeam.id === FAV_TEAM_ID;
  const venueTimeLabel = game.gameDate && game.venueTimeZone && !isLive && !isFinal && !isPostponed
    ? new Date(game.gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: game.venueTimeZone, timeZoneName: 'short' })
    : null;

  // Close game: live, 7th inning or later, margin 1 run or tied
  const inningNum = parseInt(game.inning) || 0;
  const margin = Math.abs((game.awayTeam.score||0) - (game.homeTeam.score||0));
  const isCloseGame = isLive && inningNum >= 7 && margin <= 1;

  return (
    <button onClick={() => onClick(game)} style={{
      display:'block', width:'100%', textAlign:'left', cursor:'pointer', border:'none',
      background: isFav?'rgba(0,45,114,0.25)':isLive?'rgba(220,38,38,0.08)':'rgba(255,255,255,0.04)',
      borderRadius:16, padding:'14px 16px', marginBottom:10,
      outline: isCloseGame?'1px solid rgba(251,191,36,0.5)':isFav?'1px solid rgba(0,45,114,0.5)':isLive?'0.5px solid rgba(220,38,38,0.3)':'0.5px solid rgba(255,255,255,0.08)',
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
          {isPostponed ? (
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1 }}>PPD</div>
          ) : (isLive||isFinal) ? (
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
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8, flexWrap:'wrap', gap:4 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          {isLive && <span style={{ fontSize:10, fontWeight:700, background:'#dc2626', color:'#fff', borderRadius:6, padding:'2px 8px' }}>● LIVE {game.statusLabel}</span>}
          {isCloseGame && <span style={{ fontSize:10, fontWeight:700, background:'rgba(251,191,36,0.15)', color:'#fbbf24', borderRadius:6, padding:'2px 8px', border:'0.5px solid rgba(251,191,36,0.3)' }}>🔥 Close game</span>}
          {isFinal && <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Final</span>}
          {isPostponed && <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Postponed</span>}
          {venueTimeLabel && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{venueTimeLabel}</span>}
        </div>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{game.venue}</span>
      </div>
      {(game.probableAwayPitcher || game.probableHomePitcher) && !isLive && !isFinal && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, borderTop:'0.5px solid rgba(255,255,255,0.06)', paddingTop:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
            <PlayerPhoto playerId={game.probableAwayPitcherId} name={game.probableAwayPitcher||'TBD'} size={22} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{game.probableAwayPitcher||'TBD'}</span>
          </div>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', padding:'0 6px' }}>vs</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, flexDirection:'row-reverse' }}>
            <PlayerPhoto playerId={game.probableHomePitcherId} name={game.probableHomePitcher||'TBD'} size={22} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textAlign:'right' }}>{game.probableHomePitcher||'TBD'}</span>
          </div>
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
  const [activeLeague, setActiveLeague] = useState('NL');

  useEffect(() => {
    getStandings().then(setRecords).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading standings...</div>;

  const leagues = { AL:[], NL:[] };
  records.forEach(div => {
    const lg = div.league?.id === 103 || div.league?.name?.includes('American') ? 'AL' : 'NL';
    leagues[lg].push(div);
  });

  // Sort divisions: East first, then Central, then West
  const divOrder = ['East','Central','West'];
  Object.keys(leagues).forEach(lg => {
    leagues[lg].sort((a, b) => {
      const ai = divOrder.findIndex(d => a.division?.name?.includes(d));
      const bi = divOrder.findIndex(d => b.division?.name?.includes(d));
      return ai - bi;
    });
  });

  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {['NL','AL'].map(lg => (
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

const BASE_URL = 'https://statsapi.mlb.com/api/v1';
const METS_ID = 121;
const YEAR = new Date().getFullYear();

async function getMetsLeaders() {
  const battingCats = ['homeRuns','battingAverage','onBasePercentage','sluggingPercentage','onBasePlusSlugging','stolenBases','rbi'];
  const pitchingCats = ['earnedRunAverage','strikeouts','wins','saves','whip'];

  const [battingResults, pitchingResults] = await Promise.all([
    Promise.all(battingCats.map(cat =>
      fetch(`${BASE_URL}/stats/leaders?leaderCategories=${cat}&season=${YEAR}&teamId=${METS_ID}&limit=1&sportId=1&statGroup=hitting`)
        .then(r => r.json())
        .then(d => ({ cat, leader: d.leagueLeaders?.[0]?.leaders?.[0] || null }))
        .catch(() => ({ cat, leader: null }))
    )),
    Promise.all(pitchingCats.map(cat =>
      fetch(`${BASE_URL}/stats/leaders?leaderCategories=${cat}&season=${YEAR}&teamId=${METS_ID}&limit=1&sportId=1&statGroup=pitching`)
        .then(r => r.json())
        .then(d => ({ cat, leader: d.leagueLeaders?.[0]?.leaders?.[0] || null }))
        .catch(() => ({ cat, leader: null }))
    )),
  ]);

  const allResults = [...battingResults, ...pitchingResults];

  // Correct stale team affiliations using currentTeam
  const playerIds = [...new Set(allResults.map(r => r.leader?.person?.id).filter(Boolean))];
  const currentTeamMap = await fetchCurrentTeams(playerIds);
  allResults.forEach(r => {
    if (!r.leader) return;
    const t = currentTeamMap[r.leader.person?.id];
    if (t) r.leader.team = t;
  });

  return allResults;
}

function LeadersView() {
  const [leaders, setLeaders] = useState([]);
  const [metsLeaders, setMetsLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderTab, setLeaderTab] = useState('batting');
  const [playerPage, setPlayerPage] = useState(null);

  useEffect(() => {
    Promise.all([
      getLeagueLeaders(),
      getMetsLeaders(),
    ]).then(([lg, mets]) => {
      setLeaders(lg);
      setMetsLeaders(mets);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading leaders...</div>;

  const leagueBatting = leaders.filter(l => ['homeRuns','battingAverage','onBasePercentage','sluggingPercentage','onBasePlusSlugging','stolenBases','rbi'].includes(l.cat));
  const leaguePitching = leaders.filter(l => ['earnedRunAverage','strikeouts','wins','saves','whip'].includes(l.cat));

  const catLabels = {
    homeRuns:'Home runs', battingAverage:'Batting avg',
    earnedRunAverage:'ERA', strikeouts:'Strikeouts',
    onBasePercentage:'On-base %', sluggingPercentage:'Slugging %',
    onBasePlusSlugging:'OPS',
    stolenBases:'Stolen bases', runs:'Runs', rbi:'RBI',
    wins:'Wins', saves:'Saves', whip:'WHIP',
  };

  const metsBattingCats = ['homeRuns','battingAverage','onBasePercentage','sluggingPercentage','onBasePlusSlugging','stolenBases','rbi'];
  const metsPitchingCats = ['earnedRunAverage','strikeouts','wins','saves','whip'];

  function LeaderRow({ l, i, total }) {
    const teamAbbr = l.team?.abbreviation || l.team?.teamCode?.toUpperCase() || l.team?.clubName?.slice(0,3).toUpperCase();
    return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<total-1?'0.5px solid rgba(255,255,255,0.06)':'none' }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', minWidth:16, textAlign:'center', fontWeight:600 }}>{l.rank||1}</span>
        <LeaderPhoto playerId={l.person?.id} name={l.person?.fullName} />
        <div style={{ flex:1 }}>
          <div onClick={() => l.person?.id && setPlayerPage({ id: l.person.id, name: l.person.fullName })}
            style={{ fontSize:13, fontWeight:500, color:'#60a5fa', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.4)', display:'inline' }}
          >{l.person?.fullName}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            {teamAbbr && <TeamLogo abbr={teamAbbr} size={18} />}
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{l.team?.name || teamAbbr}</span>
          </div>
        </div>
        <span style={{ fontSize:18, fontWeight:700, color:'#60a5fa' }}>{l.value}</span>
      </div>
    );
  }

  function LeagueSection({ items }) {
    return items.map(({ cat, leaders: ls }) => (
      <div key={cat} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>{catLabels[cat]||cat}</div>
        {ls.slice(0,5).map((l,i) => <LeaderRow key={i} l={l} i={i} total={Math.min(5, ls.length)} />)}
      </div>
    ));
  }

  function MetsSection({ cats }) {
    const relevantLeaders = metsLeaders.filter(l => cats.includes(l.cat) && l.leader);
    if (!relevantLeaders.length) return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>No data available</div>;
    return (
      <div style={{ background:'rgba(0,45,114,0.2)', border:'0.5px solid rgba(0,45,114,0.5)', borderRadius:14, padding:14, marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <TeamLogo abbr="NYM" size={20} />
          <span style={{ fontSize:12, fontWeight:600, color:'#60a5fa', textTransform:'uppercase', letterSpacing:0.5 }}>Mets leaders</span>
        </div>
        {relevantLeaders.map(({ cat, leader }, i) => (
          <div key={cat} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<relevantLeaders.length-1?'0.5px solid rgba(255,255,255,0.06)':'none' }}>
            <span style={{ minWidth:16 }} />{/* spacer to align with rank in league rows */}
            <LeaderPhoto playerId={leader.person?.id} name={leader.person?.fullName} />
            <div style={{ flex:1 }}>
              <div onClick={() => leader.person?.id && setPlayerPage({ id: leader.person.id, name: leader.person.fullName })}
                style={{ fontSize:13, fontWeight:500, color:'#60a5fa', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:'rgba(96,165,250,0.4)', display:'inline' }}
              >{leader.person?.fullName}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{catLabels[cat]||cat}</div>
            </div>
            <span style={{ fontSize:18, fontWeight:700, color:'#60a5fa' }}>{leader.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {playerPage && <PlayerPage playerId={playerPage.id} playerName={playerPage.name} onClose={() => setPlayerPage(null)} />}
      {/* Sub tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {[['batting','Batting'],['pitching','Pitching']].map(([id,label])=>(
          <button key={id} onClick={()=>setLeaderTab(id)} style={{ padding:'6px 16px', fontSize:13, borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', background:leaderTab===id?'#fff':'rgba(255,255,255,0.07)', color:leaderTab===id?'#0f1117':'rgba(255,255,255,0.5)', fontWeight:leaderTab===id?600:400, transition:'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {leaderTab === 'batting' && (
        <>
          <MetsSection cats={metsBattingCats} />
          <LeagueSection items={leagueBatting} />
        </>
      )}
      {leaderTab === 'pitching' && (
        <>
          <MetsSection cats={metsPitchingCats} />
          <LeagueSection items={leaguePitching} />
        </>
      )}
    </div>
  );
}

function ScheduleView() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerPage, setPlayerPage] = useState(null);

  useEffect(() => {
    getUpcomingMetsGames()
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading schedule...</div>;
  if (!games.length) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No upcoming games found</div>;

  return (
    <div className="fade-in">
      {playerPage && <PlayerPage playerId={playerPage.id} playerName={playerPage.name} onClose={() => setPlayerPage(null)} />}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <TeamLogo abbr="NYM" size={22} />
        <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>Mets — upcoming games</span>
      </div>
      {games.map((g, i) => {
        const isMetsHome = g.teams?.home?.team?.id === 121;
        const metsTeam = isMetsHome ? g.teams?.home : g.teams?.away;
        const oppTeam  = isMetsHome ? g.teams?.away : g.teams?.home;
        const oppAbbr  = oppTeam?.team?.abbreviation || '???';
        const oppName  = oppTeam?.team?.name || '';
        const metsPitcher = metsTeam?.probablePitcher?.fullName;
        const oppPitcher  = oppTeam?.probablePitcher?.fullName;
        const metsPitcherId = metsTeam?.probablePitcher?.id;
        const oppPitcherId  = oppTeam?.probablePitcher?.id;
        const gameDate = new Date(g.gameDate);
        const dateLabel = gameDate.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
        const timeLabel = gameDate.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', timeZoneName:'short' });
        const isLive = g.status?.abstractGameState === 'Live';
        const venue = g.venue?.name;

        return (
          <div key={g.gamePk || i} style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>{dateLabel}</span>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {isLive && <span style={{ fontSize:10, fontWeight:700, background:'#dc2626', color:'#fff', borderRadius:6, padding:'2px 8px' }}>● LIVE</span>}
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{timeLabel}</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <TeamLogo abbr="NYM" size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>
                  {isMetsHome ? `vs ${oppName}` : `@ ${oppName}`}
                </div>
                {venue && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{venue}</div>}
              </div>
              <TeamLogo abbr={oppAbbr} size={36} />
            </div>
            {(metsPitcher || oppPitcher) && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Probable starters</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <PlayerPhoto playerId={metsPitcherId} name={metsPitcher || 'TBD'} size={32} />
                    <div>
                      <div
                        onClick={() => metsPitcherId && setPlayerPage({ id: metsPitcherId, name: metsPitcher })}
                        style={{ fontSize:12, fontWeight:500, color: metsPitcherId ? '#60a5fa' : 'rgba(255,255,255,0.25)', cursor: metsPitcherId ? 'pointer' : 'default', textDecoration: metsPitcherId ? 'underline' : 'none', textDecorationStyle:'dotted' }}
                      >{metsPitcher || 'TBD'}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>NYM</div>
                    </div>
                  </div>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>vs</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexDirection:'row-reverse' }}>
                    <PlayerPhoto playerId={oppPitcherId} name={oppPitcher || 'TBD'} size={32} />
                    <div style={{ textAlign:'right' }}>
                      <div
                        onClick={() => oppPitcherId && setPlayerPage({ id: oppPitcherId, name: oppPitcher })}
                        style={{ fontSize:12, fontWeight:500, color: oppPitcherId ? '#60a5fa' : 'rgba(255,255,255,0.25)', cursor: oppPitcherId ? 'pointer' : 'default', textDecoration: oppPitcherId ? 'underline' : 'none', textDecorationStyle:'dotted' }}
                      >{oppPitcher || 'TBD'}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{oppAbbr}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:4 }}>
        MLB Stats API · probable pitchers subject to change
      </div>
    </div>
  );
}

function BullpenView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetsBullpenStatus()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Loading bullpen data...</div>;
  if (!data) return <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:13 }}>Could not load bullpen data</div>;

  const { pitchers, dates, pitchCounts } = data;

  function pitchColor(count) {
    if (!count) return 'transparent';
    if (count < 20) return 'rgba(74,222,128,0.2)';
    if (count < 30) return 'rgba(251,191,36,0.2)';
    return 'rgba(248,113,113,0.2)';
  }
  function pitchTextColor(count) {
    if (!count) return 'rgba(255,255,255,0.15)';
    if (count < 20) return '#4ade80';
    if (count < 30) return '#fbbf24';
    return '#f87171';
  }

  // Day labels — Mon, Tue etc
  const dayLabels = dates.map(d => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { weekday:'short' });
  });

  // Only show pitchers who appear on the roster
  // Sort: most recently used at top, hasn't pitched recently at bottom
  // Within same day: higher pitch count = more used = higher in list
  const activePitchers = pitchers.filter(p => p.id).sort((a, b) => {
    const lastDateA = dates.find(d => pitchCounts[a.id]?.[d]);
    const lastDateB = dates.find(d => pitchCounts[b.id]?.[d]);
    // Pitchers who haven't thrown recently go to the bottom
    if (!lastDateA && !lastDateB) return 0;
    if (!lastDateA) return 1;
    if (!lastDateB) return -1;
    // dates[0] is most recent — lower index = more recent = top
    const idxA = dates.indexOf(lastDateA);
    const idxB = dates.indexOf(lastDateB);
    if (idxA !== idxB) return idxA - idxB;
    // Same day — more pitches = higher up
    return (pitchCounts[b.id]?.[lastDateB] || 0) - (pitchCounts[a.id]?.[lastDateA] || 0);
  });

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <TeamLogo abbr="NYM" size={22} />
        <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>Mets bullpen — last 5 days</span>
      </div>

      <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, overflow:'hidden', marginBottom:10 }}>
        {/* Header row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto auto auto', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding:'8px 12px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5 }}>Pitcher</div>
          {dayLabels.map((d, i) => (
            <div key={i} style={{ padding:'8px 10px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textAlign:'center', minWidth:36 }}>{d}</div>
          ))}
        </div>

        {activePitchers.length === 0 && (
          <div style={{ padding:16, fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>No bullpen data available</div>
        )}

        {activePitchers.map((pitcher, idx) => (
          <div key={pitcher.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto auto auto', borderBottom: idx < activePitchers.length-1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none', alignItems:'center' }}>
            <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
              <PlayerPhoto playerId={pitcher.id} name={pitcher.name} size={28} />
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'#fff' }}>{pitcher.name}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
                  {pitcher.hand === 'L' ? 'LHP' : pitcher.hand === 'R' ? 'RHP' : '—'}
                </div>
              </div>
            </div>
            {dates.map((date, i) => {
              const count = pitchCounts[pitcher.id]?.[date];
              return (
                <div key={i} style={{ padding:'10px 6px', textAlign:'center', minWidth:36, background:pitchColor(count), borderLeft:'0.5px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize:12, fontWeight:count ? 600 : 400, color:pitchTextColor(count) }}>
                    {count || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:10, background:'rgba(74,222,128,0.3)', borderRadius:3, display:'inline-block' }}></span>Under 20</span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:10, background:'rgba(251,191,36,0.3)', borderRadius:3, display:'inline-block' }}></span>20–29</span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:10, background:'rgba(248,113,113,0.3)', borderRadius:3, display:'inline-block' }}></span>30+</span>
      </div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>
        Pitch counts from this season's games · MLB Stats API
      </div>
    </div>
  );
}

export default function GamePicker({ onSelectGame }) {
  const days = getPastDays(7);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [mainTab, setMainTab] = useState('games');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const { pulling, pullDistance } = usePullToRefresh(handleRefresh, true);

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', paddingBottom:40 }}>
      {/* Pull indicator */}
      {pulling && (
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', justifyContent:'center', pointerEvents:'none' }}>
          <div style={{ marginTop: Math.max(0, pullDistance - 10), background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:20, padding:'6px 14px', fontSize:12, color: pullDistance >= 80 ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
            {pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
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
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div style={{ display:'flex', gap:4, padding:'14px 16px 0', flexWrap:'wrap' }}>
        {[['games','Games'],['schedule','Schedule'],['standings','Standings'],['leaders','Leaders'],['bullpen','Bullpen'],['grid','Mets Grid'],['trivia','Trivia']].map(([id,label])=>(
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
            <DayView key={refreshKey} dateStr={selectedDate} onSelectGame={onSelectGame} />
          </div>
        </>
      )}
      {mainTab === 'standings' && <div style={{ padding:'16px 16px 0' }}><StandingsView /></div>}
      {mainTab === 'leaders' && <div style={{ padding:'16px 16px 0' }}><LeadersView /></div>}
      {mainTab === 'schedule' && <div style={{ padding:'16px 16px 0' }}><ScheduleView /></div>}
      {mainTab === 'bullpen' && <div style={{ padding:'16px 16px 0' }}><BullpenView /></div>}
      {mainTab === 'grid' && <MetsGrid />}
      {mainTab === 'trivia' && <div style={{ padding:'16px 16px 0' }}><TriviaTab /></div>}
    </div>
  );
}
