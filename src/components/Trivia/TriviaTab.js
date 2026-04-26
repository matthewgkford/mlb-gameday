import React from 'react';
import LeaderboardGame from './LeaderboardGame';
import leaders from '../../data/metsAllTimeLeaders.json';

export default function TriviaTab() {
  return (
    <div className="tab-panel">
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
      }}>
        <LeaderboardGame category={leaders.career_hr} />
      </div>
    </div>
  );
}
