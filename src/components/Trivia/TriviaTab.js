import React, { useState, useMemo } from 'react';
import LeaderboardGame from './LeaderboardGame';
import leaders from '../../data/metsAllTimeLeaders.json';

const STORAGE_KEY = 'metsTrivia_lastCategory';

export default function TriviaTab() {
  const categoryKeys = useMemo(() => Object.keys(leaders), []);

  const [activeKey, setActiveKey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && leaders[saved]) return saved;
    } catch {}
    return categoryKeys[0];
  });

  function selectCategory(key) {
    setActiveKey(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }

  const activeCategory = leaders[activeKey];

  return (
    <div className="tab-panel">
      {/* Category selector */}
      <div style={{ overflowX: 'auto', marginBottom: 12, marginLeft: -16, marginRight: -16, padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
          {categoryKeys.map(key => {
            const cat = leaders[key];
            const isActive = key === activeKey;
            return (
              <button
                key={key}
                onClick={() => selectCategory(key)}
                style={{
                  padding: '7px 14px',
                  fontSize: 13,
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.07)',
                  color: isActive ? '#0f1117' : 'rgba(255,255,255,0.5)',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {cat.shortLabel || cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
      }}>
        <LeaderboardGame category={activeCategory} />
      </div>
    </div>
  );
}
