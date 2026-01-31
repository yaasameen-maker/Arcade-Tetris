import { PIECES, PIECE_TYPES } from './tetris-pieces.js';

// Board operations
export function createEmptyBoard() {
  return Array(22)
    .fill(null)
    .map(() => Array(10).fill(null));
}

export function checkCollision(board, piece, position) {
  const { rotation, type } = piece;
  const rotationData = PIECES[type].rotations[rotation];
  const [row, col] = position;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (rotationData[r][c]) {
        const boardRow = row + r;
        const boardCol = col + c;

        if (boardRow < 0) continue; // Allow pieces above board
        if (boardRow >= 22 || boardCol < 0 || boardCol >= 10) return true;
        if (board[boardRow][boardCol] !== null) return true;
      }
    }
  }
  return false;
}

export function lockPiece(board, piece, position) {
  const newBoard = board.map(row => [...row]);
  const { rotation, type } = piece;
  const rotationData = PIECES[type].rotations[rotation];
  const [row, col] = position;
  const color = PIECES[type].color;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (rotationData[r][c]) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (boardRow >= 0 && boardRow < 22 && boardCol >= 0 && boardCol < 10) {
          newBoard[boardRow][boardCol] = color;
        }
      }
    }
  }
  return newBoard;
}

export function clearLines(board) {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = 22 - newBoard.length;

  while (newBoard.length < 22) {
    newBoard.unshift(Array(10).fill(null));
  }

  return { newBoard, linesCleared };
}

// Piece operations
export function spawnPiece(type) {
  return {
    type,
    rotation: 0,
    position: [0, 3] // Spawn at top center
  };
}

export function movePiece(piece, direction) {
  const [row, col] = piece.position;
  let newCol = col;

  if (direction === 'left') newCol = col - 1;
  if (direction === 'right') newCol = col + 1;

  return { ...piece, position: [row, newCol] };
}

export function rotatePiece(piece, board, direction) {
  const rotations = PIECES[piece.type].rotations.length;
  let newRotation = piece.rotation;

  if (direction === 'clockwise') {
    newRotation = (newRotation + 1) % rotations;
  } else if (direction === 'counterclockwise') {
    newRotation = (newRotation - 1 + rotations) % rotations;
  }

  const newPiece = { ...piece, rotation: newRotation };

  // Basic wall kick: try left/right if collision
  if (!checkCollision(board, newPiece, newPiece.position)) {
    return newPiece;
  }

  // Try wall kicks
  for (let offset = -2; offset <= 2; offset++) {
    const kickPos = [newPiece.position[0], newPiece.position[1] + offset];
    if (!checkCollision(board, newPiece, kickPos)) {
      return { ...newPiece, position: kickPos };
    }
  }

  // Rotation blocked
  return piece;
}

export function hardDrop(piece, board) {
  let position = [...piece.position];
  while (!checkCollision(board, piece, [position[0] + 1, position[1]])) {
    position[0]++;
  }
  return { ...piece, position };
}

export function softDrop(piece, board) {
  const newPosition = [piece.position[0] + 1, piece.position[1]];
  if (!checkCollision(board, piece, newPosition)) {
    return { ...piece, position: newPosition };
  }
  return piece; // Can't drop further
}

// Game state
export function isGameOver(board) {
  // Check if spawn area (top 2 rows) has any locked pieces
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 10; c++) {
      if (board[r][c] !== null) return true;
    }
  }
  return false;
}

// 7-bag randomizer for fair distribution
let bagPieces = [];

export function getRandomPiece() {
  if (bagPieces.length === 0) {
    // Refill bag with all piece types
    bagPieces = [...PIECE_TYPES].sort(() => Math.random() - 0.5);
  }
  return bagPieces.pop();
}

export function resetRandomBag() {
  bagPieces = [];
}
