import React from 'react';

export default function TetrisBoard({ board, currentPiece }) {
  const renderCell = (rowIndex, colIndex) => {
    const cellColor = board[rowIndex][colIndex];
    
    // Check if current piece occupies this cell
    if (currentPiece) {
      const { type, rotation, position } = currentPiece;
      const { PIECES } = require('../game-engine/tetris-pieces.js');
      const rotationData = PIECES[type].rotations[rotation];
      const [pieceRow, pieceCol] = position;
      
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (rotationData[r][c]) {
            const boardRow = pieceRow + r;
            const boardCol = pieceCol + c;
            if (boardRow === rowIndex && boardCol === colIndex) {
              return PIECES[type].color;
            }
          }
        }
      }
    }
    
    return cellColor;
  };

  return (
    <div className="tetris-board">
      {board.map((row, rowIndex) => (
        rowIndex < 20 && (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => {
              const cellColor = renderCell(rowIndex, colIndex);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="board-cell"
                  style={{
                    backgroundColor: cellColor || 'rgba(0, 255, 255, 0.1)',
                    borderColor: cellColor ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.3)'
                  }}
                />
              );
            })}
          </div>
        )
      ))}
    </div>
  );
}
