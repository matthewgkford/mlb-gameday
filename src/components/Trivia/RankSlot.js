import React from 'react';

export default function RankSlot({ rank, leader, revealed, statLabel = 'HR' }) {
  const filled = !!leader;

  let bg, border, textOpacity;
  if (filled) {
    bg = 'rgba(0,45,114,0.4)';
    border = '0.5px solid #FF5910';
    textOpacity = 1;
  } else if (revealed) {
    bg = 'rgba(255,255,255,0.06)';
    border = '0.5px solid rgba(255,255,255,0.12)';
    textOpacity = 0.45;
  } else {
    bg = 'rgba(255,255,255,0.04)';
    border = '0.5px dashed rgba(255,255,255,0.15)';
    textOpacity = 1;
  }

  return (
    <div
      className={filled ? 'fade-in' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: bg,
        border,
        marginBottom: 6,
        minHeight: 52,
      }}
    >
      <div style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: filled ? '#FF5910' : revealed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        color: filled ? '#fff' : 'rgba(255,255,255,0.3)',
        flexShrink: 0,
      }}>
        {rank}
      </div>

      <div style={{ flex: 1 }}>
        {filled || revealed ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: `rgba(255,255,255,${textOpacity})`, marginBottom: 2 }}>
              {leader.name}
            </div>
            <div style={{ fontSize: 11, color: `rgba(255,255,255,${textOpacity * 0.5})` }}>
              {leader.value} {statLabel} · {leader.years}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.18)', letterSpacing: 4, fontFamily: 'monospace' }}>
            _ _ _ _ _
          </div>
        )}
      </div>

      {(filled || revealed) && (
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: filled ? '#FF5910' : 'rgba(255,255,255,0.25)',
          flexShrink: 0,
        }}>
          {leader.value}
        </div>
      )}
    </div>
  );
}
