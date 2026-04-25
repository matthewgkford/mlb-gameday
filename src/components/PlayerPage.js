import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PlayerPhoto, TrendArrow, rateBAT, rateOBP, rateSLG, rateOPS, rateERA, rateWHIP, TeamLogo } from './SharedUI';

const BASE = 'https://statsapi.mlb.com/api/v1';

// Map MLB API country names to ISO 3166-1 alpha-2 codes for flag emoji rendering
const COUNTRY_TO_ISO = {
  'USA':'US','Dominican Republic':'DO','Venezuela':'VE','Cuba':'CU','Panama':'PA',
  'Puerto Rico':'PR','Japan':'JP','South Korea':'KR','Mexico':'MX','Canada':'CA',
  'Colombia':'CO','Nicaragua':'NI','Curacao':'CW','Australia':'AU','Brazil':'BR',
  'Netherlands':'NL','Germany':'DE','Bahamas':'BS','Taiwan':'TW','Aruba':'AW',
  'Jamaica':'JM','Honduras':'HN','Costa Rica':'CR','Spain':'ES','Italy':'IT',
  'South Africa':'ZA','China':'CN','Sweden':'SE','Finland':'FI','France':'FR',
  'United Kingdom':'GB','England':'GB','Scotland':'GB','Ireland':'IE',
};

// Convert ISO 2-letter code to flag emoji via regional indicator symbols
function countryFlag(countryName) {
  const iso = COUNTRY_TO_ISO[countryName];
  if (!iso) return null;
  return iso.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)));
}

// Map team names to abbreviations for cases where API returns inconsistent abbrs
const TEAM_NAME_TO_ABBR = {
  'New York Mets':'NYM','New York Yankees':'NYY','Boston Red Sox':'BOS',
  'Toronto Blue Jays':'TOR','Baltimore Orioles':'BAL','Tampa Bay Rays':'TB',
  'Milwaukee Brewers':'MIL','Chicago Cubs':'CHC','Chicago White Sox':'CWS',
  'Minnesota Twins':'MIN','Detroit Tigers':'DET','Cleveland Guardians':'CLE',
  'Cleveland Indians':'CLE','Kansas City Royals':'KC','Houston Astros':'HOU',
  'Los Angeles Angels':'LAA','Oakland Athletics':'ATH','Athletics':'ATH',
  'Seattle Mariners':'SEA','Texas Rangers':'TEX','Los Angeles Dodgers':'LAD',
  'San Francisco Giants':'SF','San Diego Padres':'SD','Colorado Rockies':'COL',
  'Arizona Diamondbacks':'AZ','Atlanta Braves':'ATL','Miami Marlins':'MIA',
  'Florida Marlins':'MIA','Philadelphia Phillies':'PHI','Washington Nationals':'WSH',
  'Montreal Expos':'MON','St. Louis Cardinals':'STL','Pittsburgh Pirates':'PIT',
  'Cincinnati Reds':'CIN','Anaheim Angels':'LAA','California Angels':'LAA',
};

const AWARD_DEFS = [
  { ids: ['ALMVP','NLMVP'],   label: 'MVP',           color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { ids: ['ALGG','NLGG'],     label: 'Gold Glove',    color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  { ids: ['ALSS','NLSS'],     label: 'Silver Slugger',color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { ids: ['ALAS','NLAS'],     label: 'All-Star',      color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
];

async function fetchPlayerData(playerId) {
  const year = new Date().getFullYear();
  const [infoRes, statsRes, awardsRes] = await Promise.all([
    fetch(`${BASE}/people/${playerId}?hydrate=currentTeam`),
    fetch(`${BASE}/people/${playerId}/stats?stats=season,career,yearByYear&group=hitting,pitching&season=${year}`),
    fetch(`${BASE}/people/${playerId}/awards`),
  ]);
  const [info, stats, awardsData] = await Promise.all([infoRes.json(), statsRes.json(), awardsRes.json()]);
  const rawAwards = awardsData.awards || [];
  const awards = AWARD_DEFS.map(def => {
    const years = rawAwards
      .filter(a => def.ids.includes(a.id))
      .map(a => parseInt(a.season))
      .filter((y, i, arr) => arr.indexOf(y) === i)
      .sort((a, b) => a - b);
    return years.length ? { ...def, years } : null;
  }).filter(Boolean);
  return { info: info.people?.[0], stats: stats.stats || [], awards };
}

function StatBox({ label, val, rating }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
        {val}
        {rating && <TrendArrow rating={rating} size={13} />}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10, paddingBottom:6, borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>{title}</div>
      {children}
    </div>
  );
}

export default function PlayerPage({ playerId, playerName, teamAbbr, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    fetchPlayerData(playerId)
      .then(setData)
      .catch(() => setError('Could not load player data'))
      .finally(() => setLoading(false));
  }, [playerId]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const person = data?.info;
  const allStats = data?.stats || [];
  const awards = data?.awards || [];

  // Find season hitting and pitching
  const seasonHitting = allStats.find(s => s.type?.displayName === 'season' && s.group?.displayName === 'hitting')?.splits?.[0]?.stat;
  const seasonPitching = allStats.find(s => s.type?.displayName === 'season' && s.group?.displayName === 'pitching')?.splits?.[0]?.stat;
  const careerHitting = allStats.find(s => s.type?.displayName === 'career' && s.group?.displayName === 'hitting')?.splits?.[0]?.stat;
  const careerPitching = allStats.find(s => s.type?.displayName === 'career' && s.group?.displayName === 'pitching')?.splits?.[0]?.stat;

  // Build previous teams list from yearByYear splits — merge all groups (hitting + pitching)
  // so pitchers don't lose seasons that only appear in the pitching group
  const yearByYear = allStats
    .filter(s => s.type?.displayName === 'yearByYear')
    .flatMap(s => s.splits || []);
  const teamHistory = [];
  const seen = new Set();
  yearByYear.forEach(split => {
    const teamName = split.team?.name;
    const season = split.season;
    if (!teamName || !season) return;
    const key = `${season}-${teamName}`;
    if (!seen.has(key)) {
      seen.add(key);
      teamHistory.push({
        teamName,
        teamAbbr: TEAM_NAME_TO_ABBR[teamName] || split.team?.abbreviation || split.team?.teamCode?.toUpperCase(),
        season: parseInt(season)
      });
    }
  });
  // Sort by season descending, group consecutive years with same team
  teamHistory.sort((a, b) => b.season - a.season);
  // Collapse into unique teams with year ranges
  const teamSummary = [];
  teamHistory.forEach(({ teamName, teamAbbr, season }) => {
    const last = teamSummary[teamSummary.length - 1];
    if (last && last.teamName === teamName) {
      last.from = Math.min(last.from, season);
    } else {
      teamSummary.push({ teamName, teamAbbr, from: season, to: season });
    }
  });
  // yearByYear reflects where stats were earned, not current team. If the player has
  // since moved teams, prepend their actual current team so the "Current" badge is correct.
  const currentYear = new Date().getFullYear();
  if (person?.currentTeam?.name && teamSummary[0]?.teamName !== person.currentTeam.name) {
    const abbr = TEAM_NAME_TO_ABBR[person.currentTeam.name] || person.currentTeam.abbreviation || person.currentTeam.teamCode?.toUpperCase();
    teamSummary.unshift({ teamName: person.currentTeam.name, teamAbbr: abbr, from: currentYear, to: currentYear });
  }

  const isPitcher = person?.primaryPosition?.abbreviation === 'P' || person?.primaryPosition?.abbreviation === 'SP' || person?.primaryPosition?.abbreviation === 'RP';

  const modal = (
    <div
      onClick={onClose}
      style={{ position:'fixed', top:0, left:0, right:0, bottom:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.92)', zIndex:99999, overflowY:'auto', WebkitOverflowScrolling:'touch' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#0f1117', minHeight:'100vh', padding:'0 0 60px' }}
      >
        {/* Header */}
        <div style={{ background:'rgba(255,255,255,0.04)', borderBottom:'0.5px solid rgba(255,255,255,0.08)', padding:'16px 16px 20px' }}>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'6px 12px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13, fontFamily:'inherit', marginBottom:16 }}>← Back</button>

          {loading ? (
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
              <div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff' }}>{playerName}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Loading...</div>
              </div>
            </div>
          ) : error ? (
            <div style={{ color:'#f87171', fontSize:14 }}>{error}</div>
          ) : person && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <PlayerPhoto playerId={playerId} name={playerName} size={72} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>{person.fullName}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:3 }}>
                  {person.primaryPosition?.name} · {person.currentTeam?.name}
                </div>
                <div style={{ display:'flex', gap:16, marginTop:8, flexWrap:'wrap' }}>
                  {person.primaryNumber && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>#{person.primaryNumber}</span>}
                  {person.batSide?.description && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Bats {person.batSide.description}</span>}
                  {person.pitchHand?.description && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Throws {person.pitchHand.description}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && !error && person && (
          <div style={{ padding:'20px 16px 0' }}>

            {/* Bio */}
            <Section title="Profile">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {person.birthDate && (
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:3 }}>Date of birth</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>
                      {new Date(person.birthDate).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Age {person.currentAge}</div>
                  </div>
                )}
                {(person.birthCity || person.birthCountry) && (
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:3 }}>Born</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
                      {countryFlag(person.birthCountry) && (
                        <span style={{ fontSize:18, lineHeight:1 }}>{countryFlag(person.birthCountry)}</span>
                      )}
                      {[person.birthCity, person.birthStateProvince, person.birthCountry].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
                {person.height && (
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:3 }}>Height / Weight</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{person.height} · {person.weight} lbs</div>
                  </div>
                )}
                {person.mlbDebutDate && (
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:3 }}>MLB debut</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>
                      {new Date(person.mlbDebutDate).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Season hitting stats */}
            {seasonHitting && !isPitcher && (
              <Section title={`${new Date().getFullYear()} season — batting`}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:8 }}>
                  <StatBox label="AVG" val={seasonHitting.avg || '.---'} rating={rateBAT(seasonHitting.avg)} />
                  <StatBox label="OBP" val={seasonHitting.obp || '.---'} rating={rateOBP(seasonHitting.obp)} />
                  <StatBox label="SLG" val={seasonHitting.slg || '.---'} rating={rateSLG(seasonHitting.slg)} />
                  <StatBox label="OPS" val={seasonHitting.ops || '.---'} rating={rateOPS(seasonHitting.ops)} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:6 }}>
                  <StatBox label="G" val={seasonHitting.gamesPlayed ?? '—'} />
                  <StatBox label="AB" val={seasonHitting.atBats ?? '—'} />
                  <StatBox label="H" val={seasonHitting.hits ?? '—'} />
                  <StatBox label="HR" val={seasonHitting.homeRuns ?? '—'} />
                  <StatBox label="RBI" val={seasonHitting.rbi ?? '—'} />
                  <StatBox label="SB" val={seasonHitting.stolenBases ?? '—'} />
                </div>
              </Section>
            )}

            {/* Season pitching stats */}
            {seasonPitching && isPitcher && (
              <Section title={`${new Date().getFullYear()} season — pitching`}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:8 }}>
                  <StatBox label="ERA" val={seasonPitching.era || '—'} rating={rateERA(seasonPitching.era)} />
                  <StatBox label="WHIP" val={seasonPitching.whip ? parseFloat(seasonPitching.whip).toFixed(2) : '—'} rating={rateWHIP(seasonPitching.whip)} />
                  <StatBox label="W" val={seasonPitching.wins ?? '—'} />
                  <StatBox label="L" val={seasonPitching.losses ?? '—'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:6 }}>
                  <StatBox label="G" val={seasonPitching.gamesPitched ?? '—'} />
                  <StatBox label="GS" val={seasonPitching.gamesStarted ?? '—'} />
                  <StatBox label="IP" val={seasonPitching.inningsPitched || '—'} />
                  <StatBox label="K" val={seasonPitching.strikeOuts ?? '—'} />
                  <StatBox label="BB" val={seasonPitching.baseOnBalls ?? '—'} />
                  <StatBox label="SV" val={seasonPitching.saves ?? '—'} />
                </div>
              </Section>
            )}

            {/* Previous teams */}
            {teamSummary.length > 0 && (
              <Section title="Teams">
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {teamSummary.map((t, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 12px' }}>
                      <TeamLogo abbr={t.teamAbbr} size={24} />
                      <div style={{ flex:1, fontSize:13, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: i === 0 ? 500 : 400 }}>{t.teamName}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                        {i === 0 ? `${t.from}–present` : t.from === t.to ? t.from : `${t.from}–${t.to}`}
                      </div>
                      {i === 0 && <span style={{ fontSize:10, background:'rgba(96,165,250,0.15)', color:'#60a5fa', borderRadius:6, padding:'2px 7px', fontWeight:600 }}>Current</span>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <Section title="Awards">
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {awards.map(award => (
                    <div key={award.label} style={{ background: award.bg, border:`0.5px solid ${award.color}22`, borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color: award.color, flex:1 }}>{award.label}</span>
                        <span style={{ fontSize:12, color: award.color, opacity:0.8, fontWeight:600 }}>
                          {award.years.length}×
                        </span>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {award.years.map(y => (
                          <span key={y} style={{ fontSize:11, color: award.color, background:`${award.color}18`, borderRadius:5, padding:'2px 7px', fontWeight:500 }}>{y}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Career hitting */}
            {careerHitting && !isPitcher && (
              <Section title="Career — batting">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:8 }}>
                  <StatBox label="AVG" val={careerHitting.avg || '.---'} />
                  <StatBox label="OBP" val={careerHitting.obp || '.---'} />
                  <StatBox label="SLG" val={careerHitting.slg || '.---'} />
                  <StatBox label="OPS" val={careerHitting.ops || '.---'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:6 }}>
                  <StatBox label="G" val={careerHitting.gamesPlayed ?? '—'} />
                  <StatBox label="H" val={careerHitting.hits ?? '—'} />
                  <StatBox label="HR" val={careerHitting.homeRuns ?? '—'} />
                  <StatBox label="RBI" val={careerHitting.rbi ?? '—'} />
                  <StatBox label="SB" val={careerHitting.stolenBases ?? '—'} />
                  <StatBox label="BB" val={careerHitting.baseOnBalls ?? '—'} />
                </div>
              </Section>
            )}

            {/* Career pitching */}
            {careerPitching && isPitcher && (
              <Section title="Career — pitching">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:8 }}>
                  <StatBox label="ERA" val={careerPitching.era || '—'} />
                  <StatBox label="WHIP" val={careerPitching.whip ? parseFloat(careerPitching.whip).toFixed(2) : '—'} />
                  <StatBox label="W" val={careerPitching.wins ?? '—'} />
                  <StatBox label="L" val={careerPitching.losses ?? '—'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:6 }}>
                  <StatBox label="G" val={careerPitching.gamesPitched ?? '—'} />
                  <StatBox label="GS" val={careerPitching.gamesStarted ?? '—'} />
                  <StatBox label="IP" val={careerPitching.inningsPitched || '—'} />
                  <StatBox label="K" val={careerPitching.strikeOuts ?? '—'} />
                  <StatBox label="BB" val={careerPitching.baseOnBalls ?? '—'} />
                  <StatBox label="SV" val={careerPitching.saves ?? '—'} />
                </div>
              </Section>
            )}

            <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:8 }}>
              MLB Stats API · {new Date().getFullYear()} season to date
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
