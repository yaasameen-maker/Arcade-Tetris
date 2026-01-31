import React from 'react';

export default function LevelSelect({ onSelectLevel, selectedLevel, onStartGame }) {
  return (
    <div className="level-select-container">
      <h1 className="title">80'S ARCADE TETRIS</h1>
      
      <div className="level-select-box">
        <div className="level-label">SELECT START LEVEL</div>
        
        <div className="level-buttons">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              className={`level-button ${selectedLevel === i ? 'active' : ''}`}
              onClick={() => onSelectLevel(i)}
            >
              {i}
            </button>
          ))}
        </div>
        
        <div className="level-info">
          <p>Starting Level: <span className="level-display">{selectedLevel}</span></p>
        </div>
        
        <button className="start-button" onClick={onStartGame}>
          START GAME
        </button>
        
        <div className="controls-info">
          <p>← → : Move | ↓ : Soft Drop</p>
          <p>↑ or X : Rotate | SPACE : Hard Drop</p>
          <p>P or ESC : Pause</p>
        </div>
      </div>
    </div>
  );
}
