export function calculateScore(linesCleared, level) {
  const basePoints = {
    1: 40,
    2: 100,
    3: 300,
    4: 1200
  };
  return (basePoints[linesCleared] || 0) * (level + 1);
}

export function calculateLevel(startingLevel, totalLines) {
  return startingLevel + Math.floor(totalLines / 10);
}

export function calculateSoftDropScore(cellsDropped) {
  return cellsDropped;
}

export function calculateHardDropScore(cellsDropped) {
  return cellsDropped * 2;
}
