import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import players from '../../data/metsAllTimePlayers.json';

const fuse = new Fuse(players, {
  keys: ['name', 'nicknames'],
  threshold: 0.4,
  includeScore: true,
});

export default function PlayerSearch({ onGuess, disabled }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length >= 2) {
      setSuggestions(fuse.search(query).slice(0, 5).map(r => r.item.name));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  function confirm(name) {
    onGuess(name);
    setQuery('');
    setSuggestions([]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      confirm(suggestions[0]);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a Mets player name…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 14px',
          fontSize: 16,
          background: 'rgba(255,255,255,0.07)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          color: '#fff',
          outline: 'none',
          opacity: disabled ? 0.4 : 1,
        }}
      />
      {suggestions.length > 0 && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#1e293b',
          border: '0.5px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {suggestions.map((name, i) => (
            <div
              key={name}
              onMouseDown={e => { e.preventDefault(); confirm(name); }}
              onTouchEnd={e => { e.preventDefault(); confirm(name); }}
              style={{
                padding: '11px 14px',
                fontSize: 14,
                color: 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
