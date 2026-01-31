import React from 'react';

export default function NextPiece({ pieceType }) {
  const { PIECES } = require('../game-engine/tetris-pieces.js');
  
  if (!pieceType || !PIECES[pieceType]) {
    return <div className="next-piece-box" />;
  }
  
  const piece = PIECES[pieceType];
  const rotationData = piece.rotations[0];

  return (
    <div className="next-piece-box">
      <div className="next-piece-label">NEXT</div>
      <div className="next-piece-grid">
        {Array(4).fill(null).map((_, r) => (
          <div key={r} className="next-piece-row">
            {Array(4).fill(null).map((_, c) => (
              <div
                key={`${r}-${c}`}
                className="next-piece-cell"
                style={{
                  backgroundColor: rotationData[r] && rotationData[r][c] ? piece.color : 'transparent',
                  borderColor: rotationData[r] && rotationData[r][c] ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
