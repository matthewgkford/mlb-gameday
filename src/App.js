import React, { useState, useEffect, useRef } from 'react';
import GamePicker from './components/GamePicker';
import GameView from './components/GameView';

const SOUND_KEY = 'between_innings_startup_played';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const played = useRef(false);

  useEffect(() => {
    // Only ever play once — if already played before, skip
    if (localStorage.getItem(SOUND_KEY)) return;

    function playSound() {
      if (played.current) return;
      played.current = true;
      const audio = new Audio('/startup.mp3');
      audio.volume = 0.6;
      audio.play()
        .then(() => localStorage.setItem(SOUND_KEY, '1'))
        .catch(() => {});
      document.removeEventListener('touchstart', playSound);
      document.removeEventListener('click', playSound);
    }

    // Try immediate autoplay first (works on desktop/Chrome)
    const audio = new Audio('/startup.mp3');
    audio.volume = 0.6;
    audio.play()
      .then(() => {
        played.current = true;
        localStorage.setItem(SOUND_KEY, '1');
      })
      .catch(() => {
        // Autoplay blocked (iPad/Safari) — play on first tap instead
        document.addEventListener('touchstart', playSound, { once: true });
        document.addEventListener('click', playSound, { once: true });
      });

    return () => {
      document.removeEventListener('touchstart', playSound);
      document.removeEventListener('click', playSound);
    };
  }, []);

  return selectedGame
    ? <GameView game={selectedGame} onBack={() => setSelectedGame(null)} />
    : <GamePicker onSelectGame={setSelectedGame} />;
}
