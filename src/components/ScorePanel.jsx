import React from 'react';

export default function ScorePanel({ score, lines, level }) {
  const formatScore = (num) => String(num).padStart(6, '0');

  return (
    <div className="score-panel">
      <div className="score-item">
        <div className="score-label">SCORE</div>
        <div className="score-value">{formatScore(score)}</div>
      </div>
      
      <div className="score-item">
        <div className="score-label">LINES</div>
        <div className="score-value">{formatScore(lines)}</div>
      </div>
      
      <div className="score-item">
        <div className="score-label">LEVEL</div>
        <div className="score-value">{formatScore(level)}</div>
      </div>
    </div>
  );
}
