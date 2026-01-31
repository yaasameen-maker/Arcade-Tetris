import React from 'react';

export default function Leaderboard({ scores, onClose }) {
  const formatScore = (num) => String(num).padStart(6, '0');

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-box">
        <h2 className="leaderboard-title">HIGH SCORES</h2>
        
        <div className="leaderboard-content">
          {scores.length === 0 ? (
            <p className="no-scores">No scores yet. Be the first!</p>
          ) : (
            <table className="scores-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>SCORE</th>
                  <th>LINES</th>
                  <th>LEVEL</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, idx) => (
                  <tr key={idx} className="score-row">
                    <td className="rank">{idx + 1}</td>
                    <td className="score">{formatScore(score.score)}</td>
                    <td className="lines">{formatScore(score.lines)}</td>
                    <td className="level">{formatScore(score.level)}</td>
                    <td className="date">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {onClose && (
          <button className="close-button" onClick={onClose}>
            CLOSE
          </button>
        )}
      </div>
    </div>
  );
}
