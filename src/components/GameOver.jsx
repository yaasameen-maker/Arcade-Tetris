import React from 'react';

export default function GameOver({ score, lines, level, onRestart, isHighScore, rank }) {
  const formatScore = (num) => String(num).padStart(6, '0');

  return (
    <div className="gameover-overlay">
      <div className="gameover-menu">
        <h1>GAME OVER</h1>
        
        {isHighScore && (
          <div className="high-score-alert">
            🎉 NEW HIGH SCORE! 🎉
            {rank && <p>RANK #{rank}</p>}
          </div>
        )}
        
        <div className="gameover-stats">
          <div className="stat-item">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-value">{formatScore(score)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">LINES CLEARED</span>
            <span className="stat-value">{formatScore(lines)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">FINAL LEVEL</span>
            <span className="stat-value">{formatScore(level)}</span>
          </div>
        </div>
        
        <button className="restart-button" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
