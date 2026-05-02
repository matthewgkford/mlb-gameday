import React, { useState, useEffect, useRef } from 'react';
import PlayerSearch from './PlayerSearch';
import RankSlot from './RankSlot';

let toastCounter = 0;

export default function LeaderboardGame({ category }) {
  const [found, setFound] = useState(new Set());
  const [guessed, setGuessed] = useState(new Set());
  const [status, setStatus] = useState('playing');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setFound(new Set());
    setGuessed(new Set());
    setStatus('playing');
    setToast(null);
  }, [category]);

  function showToast(msg) {
    clearTimeout(toastTimer.current);
    toastCounter += 1;
    setToast({ msg, id: toastCounter });
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function handleGuess(playerName) {
    if (status !== 'playing') return;

    const normInput = playerName.trim().toLowerCase();
    const normGuessed = new Set([...guessed].map(n => n.toLowerCase()));

    if (normGuessed.has(normInput)) {
      showToast('Already tried that!');
      return;
    }

    const matches = category.leaders.filter(l => l.name.toLowerCase() === normInput);

    if (matches.length > 0) {
      const unrevealed = matches.filter(m => !found.has(m.rank));
      const newFound = new Set(found);
      matches.forEach(m => newFound.add(m.rank));
      const newGuessed = new Set(guessed);
      newGuessed.add(playerName);
      setFound(newFound);
      setGuessed(newGuessed);
      if (unrevealed.length === 0) {
        showToast('Already found all their entries!');
      } else if (matches.length > 1) {
        showToast(`+${unrevealed.length} entries for ${matches[0].name}`);
      }
      if (newFound.size === category.leaders.length) {
        setStatus('complete');
      }
    } else {
      const newGuessed = new Set(guessed);
      newGuessed.add(playerName);
      setGuessed(newGuessed);
      showToast('Not in the top 10');
    }
  }

  function giveUp() {
    setStatus('gaveup');
  }

  function playAgain() {
    setFound(new Set());
    setGuessed(new Set());
    setStatus('playing');
    setToast(null);
  }

  const isPlaying = status === 'playing';
  const isComplete = status === 'complete';
  const isGaveUp = status === 'gaveup';

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          {category.label}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Name all 10 players — {found.size} / {category.leaders.length} found
        </div>
      </div>

      {/* Completion banner */}
      {isComplete && (
        <div className="fade-in" style={{
          background: 'rgba(0,45,114,0.5)',
          border: '0.5px solid #FF5910',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 14,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
        }}>
          🎉 Perfect! You got all 10!
        </div>
      )}

      {/* Search */}
      {isPlaying && (
        <PlayerSearch onGuess={handleGuess} disabled={false} />
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 14 }}>
        {isPlaying && (
          <button
            onClick={giveUp}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 10,
              border: '0.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Give Up
          </button>
        )}
        {(isComplete || isGaveUp) && (
          <button
            onClick={playAgain}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 10,
              border: 'none',
              background: '#FF5910',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        )}
      </div>

      {/* Slots */}
      <div>
        {category.leaders.map(leader => (
          <RankSlot
            key={leader.rank}
            rank={leader.rank}
            leader={found.has(leader.rank) || isGaveUp ? leader : null}
            revealed={isGaveUp && !found.has(leader.rank)}
            statLabel={category.statLabel}
          />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            border: '0.5px solid rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: '9px 18px',
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
