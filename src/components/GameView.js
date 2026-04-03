import React, { useState } from 'react';
import { useGameData } from '../hooks/useGameData';
import Scoreboard from './Scoreboard';
import BattingTab from './BattingTab';
import PitchingTab from './PitchingTab';
import AdvancedTab from './AdvancedTab';
import TimelineTab from './TimelineTab';

const TABS = ['Batting','Pitching','Advanced','Timeline'];

export default function GameView({ game, onBack }) {
  const isLive = game.status === 'Live';
  const { data, loading, error, lastUpdated, refresh } = useGameData(game.gamePk, isLive);
  const [activeTab, setActiveTab] = useState('Batting');

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
        <div style={{ fontSize:14, marginBottom:8 }}>Loading...</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>{game.awayTeam.abbr} vs {game.homeTeam.abbr}</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:14, color:'#f87171', marginBottom:12 }}>{error}</div>
        <button onClick={refresh} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'8px 16px', color:'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit', marginBottom:12 }}>Try again</button><br/>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>← Back to games</button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', padding:'12px 12px 60px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <Scoreboard data={data} lastUpdated={lastUpdated} onBack={onBack} isLive={isLive} />
      <div style={{ display:'flex', gap:4, marginBottom:12, background:'rgba(255,255,255,0.05)', padding:4, borderRadius:12 }}>
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{ flex:1, padding:'8px 4px', textAlign:'center', fontSize:12, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background:activeTab===tab?'rgba(255,255,255,0.12)':'transparent', color:activeTab===tab?'#fff':'rgba(255,255,255,0.4)', fontWeight:activeTab===tab?600:400, transition:'all 0.15s' }}>
            {tab}
          </button>
        ))}
        {isLive && (
          <button onClick={refresh} style={{ padding:'8px 10px', fontSize:14, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background:'transparent', color:'rgba(255,255,255,0.3)' }} title="Refresh now">↻</button>
        )}
      </div>
      {activeTab==='Batting'   && <BattingTab data={data} />}
      {activeTab==='Pitching'  && <PitchingTab data={data} />}
      {activeTab==='Advanced'  && <AdvancedTab data={data} />}
      {activeTab==='Timeline'  && <TimelineTab data={data} />}
    </div>
  );
}
