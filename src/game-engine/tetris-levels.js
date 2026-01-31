export function getDropInterval(level) {
  // Frame table from NES Tetris
  const frameTable = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2];
  
  let frames;
  if (level < 20) {
    frames = frameTable[level];
  } else if (level < 29) {
    frames = 2;
  } else {
    frames = 1;
  }
  
  // Convert frames to milliseconds (60 FPS)
  return frames * (1000 / 60);
}

export function getLevelFromLines(startingLevel, totalLines) {
  return startingLevel + Math.floor(totalLines / 10);
}
