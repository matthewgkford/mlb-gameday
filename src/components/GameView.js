import React, { useState, useCallback } from 'react';
import { useGameData } from '../hooks/useGameData';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import Scoreboard from './Scoreboard';
import BattingTab from './BattingTab';
import PitchingTab from './PitchingTab';
import AdvancedTab from './AdvancedTab';
import TimelineTab from './TimelineTab';

const TABS = ['Batting','Pitching','Advanced','Timeline'];

function PullIndicator({ pullDistance, pulling }) {
  if (!pulling && pullDistance < 5) return null;
  const pct = Math.min(pullDistance / 80, 1);
  const ready = pullDistance >= 80;
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', justifyContent:'center', pointerEvents:'none' }}>
      <div style={{ marginTop: Math.max(0, pullDistance - 10), background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:20, padding:'6px 14px', display:'flex', alignItems:'center', gap:8, fontSize:12, color: ready ? '#4ade80' : 'rgba(255,255,255,0.5)', transition:'color 0.2s' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: ready ? 'rotate(180deg)' : `rotate(${pct * 180}deg)`, transition:'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {ready ? 'Release to refresh' : 'Pull to refresh'}
      </div>
    </div>
  );
}

export default function GameView({ game, onBack }) {
  const isLive = game.status === 'Live';
  const { data, loading, error, lastUpdated, refresh } = useGameData(game.gamePk, isLive);
  const [activeTab, setActiveTab] = useState('Batting');

  const handleRefresh = useCallback(() => { refresh(); }, [refresh]);
  const { pulling, pullDistance } = usePullToRefresh(handleRefresh, true);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
        <div style={{ fontSize:14, marginBottom:8 }}>Loading game data...</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>{game.awayTeam.abbr} vs {game.homeTeam.abbr}</div>
        <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:8, width:260, alignItems:'center' }}>
          {[100,80,90,70].map((w,i) => <div key={i} className="skeleton" style={{ height:12, width:`${w}%` }} />)}
        </div>
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
      <PullIndicator pullDistance={pullDistance} pulling={pulling} />
      <Scoreboard data={data} lastUpdated={lastUpdated} onBack={onBack} isLive={isLive} />
      <div style={{ display:'flex', gap:4, marginBottom:12, background:'rgba(255,255,255,0.05)', padding:4, borderRadius:12 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex:1, padding:'8px 4px', textAlign:'center', fontSize:12, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background:activeTab===tab?'rgba(255,255,255,0.12)':'transparent', color:activeTab===tab?'#fff':'rgba(255,255,255,0.4)', fontWeight:activeTab===tab?600:400, transition:'background 0.2s, color 0.2s' }}>
            {tab}
          </button>
        ))}
        {isLive && (
          <button onClick={refresh} title="Refresh now" style={{ padding:'8px 10px', fontSize:14, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', background:'transparent', color:'rgba(255,255,255,0.3)' }}>↻</button>
        )}
      </div>
      {activeTab === 'Batting'   && <BattingTab  data={data} />}
      {activeTab === 'Pitching'  && <PitchingTab data={data} />}
      {activeTab === 'Advanced'  && <AdvancedTab data={data} />}
      {activeTab === 'Timeline'  && <TimelineTab data={data} />}
    </div>
  );
}
