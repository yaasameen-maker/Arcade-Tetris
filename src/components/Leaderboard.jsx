import React from 'react';

export default function Leaderboard({ scores, onClose, title = 'HIGH SCORES' }) {
  const formatScore = (num) => String(num).padStart(6, '0');
  const hasUsernames = scores.some(s => s.username);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-box">
        <h2 className="leaderboard-title">{title}</h2>

        <div className="leaderboard-content">
          {scores.length === 0 ? (
            <p className="no-scores">No scores yet. Be the first!</p>
          ) : (
            <table className="scores-table">
              <thead>
                <tr>
                  <th>#</th>
                  {hasUsernames && <th>PLAYER</th>}
                  <th>SCORE</th>
                  <th>LINES</th>
                  <th>LVL</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, idx) => (
                  <tr key={entry.id ?? idx} className={`score-row ${idx < 3 ? 'top-rank' : ''}`}>
                    <td className="rank">{idx + 1}</td>
                    {hasUsernames && (
                      <td className="player">{entry.username ?? '---'}</td>
                    )}
                    <td className="score">{formatScore(entry.score)}</td>
                    <td className="lines">{entry.lines}</td>
                    <td className="level">{entry.level}</td>
                    <td className="date">
                      {new Date(entry.date).toLocaleDateString()}
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
