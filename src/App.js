import React, { useState } from 'react';
import GamePicker from './components/GamePicker';
import GameView from './components/GameView';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  return selectedGame
    ? <GameView game={selectedGame} onBack={() => setSelectedGame(null)} />
    : <GamePicker onSelectGame={setSelectedGame} />;
}
