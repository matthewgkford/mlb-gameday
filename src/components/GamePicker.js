import React, { useState } from 'react';
import { useGamesForDate } from '../hooks/useTodaysGames';
import { espnLogoUrl, todayString, formatDateLabel } from '../utils/mlbApi';

const FAV_TEAM_ID = 121; // New York Mets

function getPastDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function TeamLogo({ abbr, size = 36 }) {
  const [err, setErr] = React.useState(false);
  const COLORS = { MIN:'#002B5C',KC:'#004687',NYY:'#1c2841',NYM:'#002D72',BOS:'#bd3039',LAD:'#005a9c',SF:'#fd5a1e',CHC:'#0e3386',ATL:'#ce1141',HOU:'#002d62',TOR:'#134a8e',PHI:'#E81828',STL:'#C41E3A',CLE:'#00385D',CWS:'#27251F',DET:'#0C2340',MIL:'#FFC52F',MIN2:'#002B5C',OAK:'#003831',SEA:'#0C2C56',TB:'#092C5C',TEX:'#003278',LAA:'#BA0021',BAL:'#DF4601',MIA:'#00A3E0',WSH:'#AB0003',COL:'#33006F',ARI:'#A71930',SD:'#2F241D',CIN:'#C6011F',PIT:'#27251F' };
  const bg = COLORS[abbr] || '#1e293b';
  if (err) return <div style={{ width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.25,fontWeight:700,color:'#fff' }}>{abbr?.slice(0,2)}</div>;
  return <img src={espnLogoUrl(abbr)} alt={abbr} width={size} height={size} style={{ objectFit:'contain' }} onError={()=>setErr(true)} />;
}

function GameCard({ game, onClick }) {
  const isLive = game.status === 'Live';
  const isFinal = game.status === 'Final';
  const isFav = game.awayTeam.id === FAV_TEAM_ID || game.homeTeam.id === FAV_TEAM_ID;

  return (
    <button onClick={() => onClick(game)} style={{
      display:'block', width:'100%', textAlign:'left', cursor:'pointer', border:'none',
      background: isFav ? 'rgba(0,45,114,0.25)' : isLive ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.04)',
      borderRadius:16, padding:'14px 16px', marginBottom:10,
      outline: isFav ? '1px solid rgba(0,45,114,0.6)' : isLive ? '0.5px solid rgba(220,38,38,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
      transition:'background 0.15s',
    }}>
      {isFav && <div style={{ fontSize:10, color:'#60a5fa', fontWeight:600, letterSpacing:0.5, marginBottom:6, textTransform:'uppercase' }}>⭐ Your team</div>}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
          <TeamLogo abbr={game.awayTeam.abbr} />
          <div>
            <div style={{ fontSize:15, fontWeight:600, color: isFinal && game.awayTeam.isWinner ? '#60a5fa' : '#fff' }}>{game.awayTeam.abbr}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{game.awayTeam.name}</div>
          </div>
        </div>

        <div style={{ textAlign:'center', padding:'0 10px' }}>
          {(isLive || isFinal) ? (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:26, fontWeight:700, color: isFinal && game.awayTeam.isWinner ? '#60a5fa' : '#fff' }}>{game.awayTeam.score}</span>
              <span style={{ fontSize:16, color:'rgba(255,255,255,0.2)' }}>–</span>
              <span style={{ fontSize:26, fontWeight:700, color: isFinal && game.homeTeam.isWinner ? '#60a5fa' : '#fff' }}>{game.homeTeam.score}</span>
            </div>
          ) : (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{game.statusLabel}</div>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, flexDirection:'row-reverse' }}>
          <TeamLogo abbr={game.homeTeam.abbr} />
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:15, fontWeight:600, color: isFinal && game.homeTeam.isWinner ? '#60a5fa' : '#fff' }}>{game.homeTeam.abbr}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{game.homeTeam.name}</div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
        {isLive && <span style={{ fontSize:10, fontWeight:700, background:'#dc2626', color:'#fff', borderRadius:6, padding:'2px 8px', letterSpacing:0.5 }}>● LIVE {game.statusLabel}</span>}
        {isFinal && <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Final</span>}
        {!isLive && !isFinal && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{game.statusLabel}</span>}
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

  const live = games.filter(g => g.status === 'Live');
  const upcoming = games.filter(g => !['Live','Final'].includes(g.status));
  const final = games.filter(g => g.status === 'Final');

  const favGame = games.find(g => g.awayTeam.id === FAV_TEAM_ID || g.homeTeam.id === FAV_TEAM_ID);
  const otherLive = live.filter(g => g !== favGame);
  const otherUpcoming = upcoming.filter(g => g !== favGame);
  const otherFinal = final.filter(g => g !== favGame);

  return (
    <div>
      {favGame && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Your team</div>
          <GameCard game={favGame} onClick={onSelectGame} />
        </>
      )}
      {live.length > 0 && otherLive.length > 0 && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8, marginTop:12 }}>Live now</div>
          {otherLive.map(g => <GameCard key={g.gamePk} game={g} onClick={onSelectGame} />)}
        </>
      )}
      {live.length > 0 && otherLive.length === 0 && !favGame && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Live now</div>
          {live.map(g => <GameCard key={g.gamePk} game={g} onClick={onSelectGame} />)}
        </>
      )}
      {otherUpcoming.length > 0 && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8, marginTop:12 }}>Upcoming</div>
          {otherUpcoming.map(g => <GameCard key={g.gamePk} game={g} onClick={onSelectGame} />)}
        </>
      )}
      {otherFinal.length > 0 && (
        <>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:1, textTransform:'uppercase', marginBottom:8, marginTop:12 }}>Final</div>
          {otherFinal.map(g => <GameCard key={g.gamePk} game={g} onClick={onSelectGame} />)}
        </>
      )}
    </div>
  );
}

export default function GamePicker({ onSelectGame }) {
  const days = getPastDays(7);
  const [selectedDate, setSelectedDate] = useState(todayString());

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', paddingBottom:40 }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>MLB Gameday</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:3 }}>New York Mets fan</div>
      </div>

      {/* Date tabs */}
      <div style={{ overflowX:'auto', padding:'14px 0', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', gap:6, padding:'0 20px', width:'max-content' }}>
          {days.map(d => (
            <button key={d} onClick={() => setSelectedDate(d)} style={{
              padding:'7px 14px', fontSize:13, borderRadius:20, border:'none', cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
              background: selectedDate === d ? '#fff' : 'rgba(255,255,255,0.07)',
              color: selectedDate === d ? '#0f1117' : 'rgba(255,255,255,0.5)',
              fontWeight: selectedDate === d ? 600 : 400,
            }}>
              {formatDateLabel(d)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <DayView dateStr={selectedDate} onSelectGame={onSelectGame} />
      </div>
    </div>
  );
}
