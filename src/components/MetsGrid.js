import React, { useState, useEffect, useRef } from 'react';
import {
  CATEGORIES, validatePlayer, getValidPlayers,
  getTodaysPuzzle, getTodayKey, loadTodayState, saveTodayState,
  loadStats, updateStats, searchPlayers,
} from '../utils/metsGridLogic';

const TOTAL_GUESSES = 9;

// Local headshot overrides — used when MLB's CDN has no photo for a player.
// Drop images into public/headshots/ and add an entry here.
const LOCAL_HEADSHOTS = {
  'Mookie Wilson': '/headshots/mookie-wilson.jpg',
};
const METS_BLUE   = '#002D72';
const METS_ORANGE = '#FF5910';

// ── Helpers ────────────────────────────────────────────────────────────────

function getSuggestedAnswer(rowCat, colCat, excludeNames = new Set()) {
  const valid = getValidPlayers(rowCat, colCat).filter(p => !excludeNames.has(p.name));
  if (!valid.length) return null;
  return valid.sort((a, b) => {
    const score = p => p.awards.length * 2 + p.metsMilestones.length + p.metsYears.length;
    return score(b) - score(a);
  })[0];
}

function buildShareText(puzzle, cells, guessesLeft) {
  const puzzleIndex = /* computed outside */ 0;
  const rows = ['r0','r1','r2'];
  const cols = ['c0','c1','c2'];
  let grid = '';
  rows.forEach(r => {
    cols.forEach(c => {
      const key = `${r}${c}`;
      grid += cells[key]?.player ? '🟦' : '⬜';
    });
    grid += '\n';
  });
  const filled = Object.values(cells).filter(v => v?.player).length;
  return `Mets Grid\n${grid}\n${filled}/9 correct · ${TOTAL_GUESSES - guessesLeft} guesses used`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CategoryTag({ catKey, height = 44 }) {
  const cat = CATEGORIES[catKey];
  if (!cat) return null;
  return (
    <div style={{
      background: `${cat.color}22`,
      border: `0.5px solid ${cat.color}55`,
      borderRadius: 8,
      padding: '0 8px',
      fontSize: 10,
      fontWeight: 600,
      color: cat.color,
      textAlign: 'center',
      lineHeight: 1.3,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {cat.label}
    </div>
  );
}

function GuessTracker({ total, used }) {
  return (
    <div style={{ display:'flex', gap:5, justifyContent:'center', margin:'10px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: i < used ? METS_ORANGE : 'rgba(255,255,255,0.15)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
}

function InfoModal({ onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div style={{ background:'#1a1f2e', border:`1px solid ${METS_BLUE}`, borderRadius:20, padding:24, maxWidth:360, width:'100%' }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:16 }}>How to play</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>
          Fill all <b style={{color:'#fff'}}>9 cells</b> of the grid. Each answer must be a Mets player who satisfies <b style={{color:'#fff'}}>both</b> the row and column categories.
        </div>
        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            ['🟦', 'Correct guess'],
            ['⬜', 'Cell not yet filled'],
            [<span style={{color:METS_ORANGE}}>●</span>, 'Guess used (wrong or right)'],
          ].map(([icon, label], i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,0.7)' }}>
              <span style={{ fontSize:16, minWidth:22, textAlign:'center' }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          You have <b style={{color:'#fff'}}>9 guesses total</b> across all cells. Wrong guesses still cost a guess. A player can only be used once per puzzle.
        </div>
        <div style={{ marginTop:16, display:'flex', gap:10 }}>
          {[
            { label:'Position', color:'#6366f1' },
            { label:'Era',      color:'#f59e0b' },
            { label:'Decade',   color:'#8b5cf6' },
            { label:'Team',     color:'#10b981' },
            { label:'Award',    color:METS_ORANGE },
            { label:'Stat',     color:'#60a5fa' },
          ].map(({label,color}) => (
            <div key={label} style={{ background:`${color}22`, border:`0.5px solid ${color}55`, borderRadius:6, padding:'2px 7px', fontSize:10, color, fontWeight:600 }}>{label}</div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:20, width:'100%', padding:'10px', background:METS_BLUE, border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Got it
        </button>
      </div>
    </div>
  );
}

function ResultsModal({ cells, guessesUsed, won, onClose, stats, rowCats, colCats }) {
  const [copied, setCopied] = useState(false);
  const rows = ['r0','r1','r2'], cols = ['c0','c1','c2'];
  let grid = '';
  rows.forEach(r => { cols.forEach(c => { grid += cells[`${r}${c}`]?.player ? '🟦' : '🟥'; }); grid += '\n'; });
  const filled = Object.values(cells).filter(v=>v?.player).length;
  const shareText = `Mets Grid\n${grid}\n${filled}/9 · ${guessesUsed} guess${guessesUsed!==1?'es':''} used`;

  // Collect unsolved cells with suggestions, excluding players already placed
  const usedNames = new Set(Object.values(cells).map(v => v?.player?.name).filter(Boolean));
  const unsolvedSuggestions = [];
  const suggestedSoFar = new Set(usedNames);
  [0,1,2].forEach(ri => {
    [0,1,2].forEach(ci => {
      const key = `r${ri}c${ci}`;
      if (!cells[key]?.player) {
        const suggestion = getSuggestedAnswer(rowCats[ri], colCats[ci], suggestedSoFar);
        if (suggestion) {
          suggestedSoFar.add(suggestion.name);
          unsolvedSuggestions.push({ key, ri, ci, suggestion });
        }
      }
    });
  });

  function copy() {
    navigator.clipboard.writeText(shareText).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflowY:'auto' }}>
      <div style={{ background:'#1a1f2e', border:`1px solid ${won ? METS_BLUE : '#444'}`, borderRadius:20, padding:24, maxWidth:340, width:'100%', margin:'auto' }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:4, textAlign:'center' }}>
          {won ? '🟦 Solved!' : 'Out of guesses'}
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:16 }}>
          {filled}/9 cells filled · {guessesUsed} guess{guessesUsed!==1?'es':''} used
        </div>
        <div style={{ fontFamily:'monospace', fontSize:24, textAlign:'center', letterSpacing:4, marginBottom:16, lineHeight:1.5 }}>
          {grid.trim().split('\n').map((row,i) => <div key={i}>{row}</div>)}
        </div>
        {stats && (
          <div style={{ display:'flex', justifyContent:'space-around', marginBottom:16 }}>
            {[['Played',stats.played],['Won',stats.completed],['Streak',stats.streak],['Best',stats.bestStreak]].map(([l,v])=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{v}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
        {unsolvedSuggestions.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>
              Unsolved cells
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {unsolvedSuggestions.map(({ key, ri, ci, suggestion }) => (
                <div key={key} style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 12px' }}>
                  <div style={{ display:'flex', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:9, background:`${CATEGORIES[rowCats[ri]].color}22`, border:`0.5px solid ${CATEGORIES[rowCats[ri]].color}55`, borderRadius:5, padding:'2px 5px', color:CATEGORIES[rowCats[ri]].color, fontWeight:600 }}>
                      {CATEGORIES[rowCats[ri]].label}
                    </span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', alignSelf:'center' }}>×</span>
                    <span style={{ fontSize:9, background:`${CATEGORIES[colCats[ci]].color}22`, border:`0.5px solid ${CATEGORIES[colCats[ci]].color}55`, borderRadius:5, padding:'2px 5px', color:CATEGORIES[colCats[ci]].color, fontWeight:600 }}>
                      {CATEGORIES[colCats[ci]].label}
                    </span>
                  </div>
                  <div style={{ fontSize:13, color:'#fff', fontWeight:600 }}>{suggestion.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={copy} style={{ width:'100%', padding:'11px', background: copied ? '#10b981' : METS_ORANGE, border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', transition:'background 0.2s' }}>
          {copied ? 'Copied!' : 'Share results'}
        </button>
        <button onClick={onClose} style={{ width:'100%', marginTop:8, padding:'11px', background:'rgba(255,255,255,0.07)', border:'none', borderRadius:12, color:'rgba(255,255,255,0.6)', fontSize:14, cursor:'pointer' }}>
          View grid
        </button>
      </div>
    </div>
  );
}

function PlayerSearch({ rowCat, colCat, usedNames, onConfirm, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);
  const sheetRef = useRef(null);

  // Lock body scroll while sheet is open; focus input after keyboard settles.
  // Save scrollY before locking so we can restore it on close — otherwise iOS
  // snaps the page back to the top when position:fixed is removed.
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Keep the sheet above the keyboard on iOS — visualViewport shrinks when
  // the keyboard appears, but position:fixed stays anchored to the layout
  // viewport. Translate the sheet up by however many px the keyboard occupies.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    function reposition() {
      if (!sheetRef.current) return;
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheetRef.current.style.transform = `translateY(-${offset}px)`;
    }
    reposition();
    vv.addEventListener('resize', reposition);
    vv.addEventListener('scroll', reposition);
    return () => {
      vv.removeEventListener('resize', reposition);
      vv.removeEventListener('scroll', reposition);
    };
  }, []);

  useEffect(() => {
    const matches = searchPlayers(query).filter(p => !usedNames.has(p.name));
    setResults(matches);
    setSelected(null);
  }, [query, usedNames]);

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
  }

  const validAnswers = getValidPlayers(rowCat, colCat);

  return (
    <div
      style={{ position:'fixed', top:0, right:0, bottom:0, left:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        style={{ background:'#1a1f2e', borderRadius:'20px 20px 0 0', padding:'16px 16px 0', width:'100%', maxWidth:480, paddingBottom:'env(safe-area-inset-bottom, 16px)', display:'flex', flexDirection:'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)', margin:'0 auto 14px' }} />

        {/* Category tags */}
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={{ flex:1 }}><CategoryTag catKey={rowCat} /></div>
          <div style={{ color:'rgba(255,255,255,0.3)', alignSelf:'center', fontSize:12 }}>×</div>
          <div style={{ flex:1 }}><CategoryTag catKey={colCat} /></div>
        </div>

        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:10, textAlign:'center' }}>
          {validAnswers.length} valid answer{validAnswers.length !== 1 ? 's' : ''} for this cell
        </div>

        {/* Input — 16px prevents iOS auto-zoom */}
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Mets players…"
          style={{ width:'100%', boxSizing:'border-box', padding:'11px 14px', borderRadius:12, border:`1px solid ${METS_BLUE}`, background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:16, outline:'none', fontFamily:'inherit', WebkitAppearance:'none' }}
        />

        {/* Results */}
        <div style={{ overflowY:'auto', WebkitOverflowScrolling:'touch', maxHeight:190, marginTop:8 }}>
          {results.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {results.map(p => {
                const isSelected = selected?.name === p.name;
                return (
                  <div
                    key={p.name}
                    onPointerDown={e => { e.preventDefault(); setSelected(isSelected ? null : p); }}
                    style={{ padding:'11px 12px', borderRadius:10, background: isSelected ? `${METS_BLUE}aa` : 'rgba(255,255,255,0.05)', border: isSelected ? `1px solid ${METS_BLUE}` : '1px solid transparent', cursor:'pointer', touchAction:'manipulation' }}
                  >
                    <span style={{ fontSize:15, color:'#fff', fontWeight: isSelected ? 600 : 400 }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'12px 0' }}>No players found</div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', gap:8, marginTop:12, paddingBottom:16 }}>
          <button onPointerDown={e => { e.preventDefault(); onClose(); }} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.07)', border:'none', borderRadius:12, color:'rgba(255,255,255,0.6)', fontSize:15, cursor:'pointer', touchAction:'manipulation', fontFamily:'inherit' }}>
            Cancel
          </button>
          <button
            onPointerDown={e => { e.preventDefault(); handleConfirm(); }}
            disabled={!selected}
            style={{ flex:2, padding:'13px', background: selected ? METS_ORANGE : 'rgba(255,255,255,0.08)', border:'none', borderRadius:12, color: selected ? '#fff' : 'rgba(255,255,255,0.3)', fontSize:15, fontWeight:600, cursor: selected ? 'pointer' : 'default', touchAction:'manipulation', fontFamily:'inherit', transition:'background 0.15s' }}
          >
            Confirm guess
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MetsGrid() {
  const puzzle = getTodaysPuzzle();
  const { rows: rowCats, cols: colCats } = puzzle;

  const initState = () => {
    const saved = loadTodayState();
    if (saved) return saved;
    return {
      cells: {},        // { r0c0: { player, correct } }
      guessesLeft: TOTAL_GUESSES,
      done: false,
      won: false,
    };
  };

  const [state, setState] = useState(initState);
  const [activeCell, setActiveCell] = useState(null); // 'r0c0' etc
  const [flashCell, setFlashCell] = useState(null);   // { key, ok }
  const [showInfo, setShowInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState(null);

  const { cells, guessesLeft, done, won } = state;

  useEffect(() => {
    if (Object.keys(state.cells).length > 0 || state.done) saveTodayState(state);
  }, [state]);

  const usedNames = new Set(Object.values(cells).map(v => v?.player?.name).filter(Boolean));

  function handleCellTap(cellKey) {
    if (done || cells[cellKey]?.correct) return;
    setActiveCell(cellKey);
  }

  function handleGuess(player) {
    const cellKey = activeCell;
    setActiveCell(null);
    const ri = parseInt(cellKey[1]);
    const ci = parseInt(cellKey[3]);
    const correct = validatePlayer(player, rowCats[ri]) && validatePlayer(player, colCats[ci]);
    const newGuessesLeft = guessesLeft - 1;

    setFlashCell({ key: cellKey, ok: correct });
    setTimeout(() => setFlashCell(null), 700);

    const newCells = { ...cells };
    if (correct) {
      newCells[cellKey] = { player, correct: true };
    }

    const filledCount = Object.values(newCells).filter(v => v?.correct).length;
    const newWon  = filledCount === 9;
    const newDone = newWon || newGuessesLeft === 0;

    const newState = { cells: newCells, guessesLeft: newGuessesLeft, done: newDone, won: newWon };
    setState(newState);

    if (newDone) {
      const updated = updateStats(newWon);
      setStats(updated);
      setTimeout(() => setShowResults(true), 800);
    }
  }

  // 32px horizontal padding, 64px row-header col, 3 × 5px gaps → portrait cells (1.3× width)
  const cellWidth = Math.floor((Math.min(window.innerWidth, 480) - 32 - 64 - 15) / 3);
  const CELL_SIZE = Math.min(Math.round(cellWidth * 1.5), 140);

  return (
    <div style={{ padding:'16px 16px 40px', maxWidth:480, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.3 }}>Mets Grid</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Daily Mets puzzle</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button
            onClick={() => {
              localStorage.removeItem(getTodayKey());
              setState({ cells: {}, guessesLeft: TOTAL_GUESSES, done: false, won: false });
              setShowResults(false);
            }}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', fontSize:11, cursor:'pointer', fontFamily:'inherit', padding:'4px 8px' }}
          >
            Reset
          </button>
          <button
            onClick={() => setShowInfo(true)}
            style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:20, padding:'6px 14px', color:'rgba(255,255,255,0.6)', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
          >
            How to play
          </button>
        </div>
      </div>

      <GuessTracker total={TOTAL_GUESSES} used={TOTAL_GUESSES - guessesLeft} />

      {/* Grid */}
      <div style={{ marginTop:8 }}>
        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:`64px repeat(3, 1fr)`, gap:5, marginBottom:5 }}>
          <div />
          {colCats.map(cat => (
            <div key={cat} style={{ display:'flex', alignItems:'stretch' }}>
              <CategoryTag catKey={cat} />
            </div>
          ))}
        </div>

        {/* Rows */}
        {rowCats.map((rowCat, ri) => (
          <div key={rowCat} style={{ display:'grid', gridTemplateColumns:`64px repeat(3, 1fr)`, gap:5, marginBottom:5 }}>
            {/* Row header */}
            <div style={{ display:'flex', alignItems:'stretch' }}>
              <CategoryTag catKey={rowCat} height={CELL_SIZE} />
            </div>

            {/* Cells */}
            {colCats.map((colCat, ci) => {
              const key = `r${ri}c${ci}`;
              const cell = cells[key];
              const isFlash = flashCell?.key === key;
              const isActive = activeCell === key;
              const correct = cell?.correct;
              const failed  = isFlash && !flashCell.ok;

              let bg = 'rgba(255,255,255,0.04)';
              let border = '1px solid rgba(255,255,255,0.1)';
              if (correct) { bg = `${METS_BLUE}cc`; border = `1px solid ${METS_BLUE}`; }
              if (failed)  { bg = 'rgba(239,68,68,0.3)'; border = '1px solid rgba(239,68,68,0.6)'; }
              if (isActive) border = `1px solid ${METS_ORANGE}`;

              return (
                <div
                  key={key}
                  onClick={() => handleCellTap(key)}
                  style={{
                    height: CELL_SIZE,
                    borderRadius: 12,
                    background: bg,
                    border,
                    cursor: correct || done ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: correct ? 0 : '4px 5px',
                    overflow: 'hidden',
                    textAlign: 'center',
                    transition: 'background 0.2s, border 0.2s',
                    transform: correct && isFlash ? 'scale(1.05)' : 'scale(1)',
                    transitionProperty: 'background, border, transform',
                    transitionDuration: '0.2s',
                  }}
                >
                  {correct ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={LOCAL_HEADSHOTS[cell.player.name] || `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${cell.player.mlbId}/headshot/67/current`}
                        alt={cell.player.name}
                        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize:22, color:'rgba(255,255,255,0.12)' }}>+</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {done && !showResults && (
        <div style={{ textAlign:'center', marginTop:16 }}>
          <button
            onClick={() => setShowResults(true)}
            style={{ padding:'10px 24px', background:METS_ORANGE, border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}
          >
            See results
          </button>
        </div>
      )}

      {/* Modals */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {showResults && (
        <ResultsModal
          cells={cells}
          guessesUsed={TOTAL_GUESSES - guessesLeft}
          won={won}
          onClose={() => setShowResults(false)}
          stats={stats || loadStats()}
          rowCats={rowCats}
          colCats={colCats}
        />
      )}

      {activeCell && !done && (
        <PlayerSearch
          rowCat={rowCats[parseInt(activeCell[1])]}
          colCat={colCats[parseInt(activeCell[3])]}
          usedNames={usedNames}
          onConfirm={handleGuess}
          onClose={() => setActiveCell(null)}
        />
      )}
    </div>
  );
}
