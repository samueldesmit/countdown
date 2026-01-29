import { useState, useEffect } from 'react';
import AppClassic from './AppClassic';
import AppEpic from './AppEpic';
import './App.css';

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('grave-countdown-mode') || 'classic');

  useEffect(() => {
    localStorage.setItem('grave-countdown-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'classic' ? 'epic' : 'classic');
  };

  return (
    <div className="app-wrapper">
      <button
        className="mode-toggle"
        onClick={toggleMode}
        title={mode === 'classic' ? 'Switch to Epic Mode' : 'Switch to Classic Mode'}
      >
        {mode === 'classic' ? '🚀 EPIC MODE' : '📅 CLASSIC'}
      </button>

      {mode === 'classic' ? <AppClassic /> : <AppEpic />}
    </div>
  );
}

export default App;
