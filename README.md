# 80's Arcade Tetris - MVP

An authentic NES/Game Boy style Tetris game with 80's arcade aesthetics, local high score tracking, and classic gameplay mechanics.

## Features

✅ Fully playable Tetris game  
✅ Authentic NES Tetris mechanics (rotation, scoring, levels)  
✅ 80's retro visual design (neon colors, pixel fonts)  
✅ Local high score leaderboard (localStorage)  
✅ Starting level selection (0-9)  
✅ Keyboard controls  
✅ Game over screen with score summary  
✅ Pause functionality  

## Controls

| Key | Action |
|-----|--------|
| ← → | Move left/right |
| ↓ | Soft drop (accelerate) |
| ↑ or X | Rotate clockwise |
| Z | Rotate counter-clockwise |
| Space | Hard drop (instant) |
| P or Esc | Pause/Resume |
| Enter | Start game / Restart |

## Scoring System

| Action | Points |
|--------|--------|
| Single (1 line) | 40 × (level + 1) |
| Double (2 lines) | 100 × (level + 1) |
| Triple (3 lines) | 300 × (level + 1) |
| Tetris (4 lines) | 1200 × (level + 1) |
| Soft drop | 1 point per cell |
| Hard drop | 2 points per cell |

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS3 (no frameworks)
- **Storage**: Browser localStorage
- **Language**: JavaScript (ES6+)

## Project Structure

```
src/
├── components/          # React components
│   ├── TetrisGame.jsx      # Main game container
│   ├── TetrisBoard.jsx     # Game board (10x20 grid)
│   ├── NextPiece.jsx       # Next piece preview
│   ├── ScorePanel.jsx      # Score, level, lines display
│   ├── LevelSelect.jsx     # Starting level picker
│   ├── GameOver.jsx        # Game over modal
│   ├── Leaderboard.jsx     # High scores display
│   └── PauseMenu.jsx       # Pause overlay
├── game-engine/         # Core game logic
│   ├── tetris-logic.js     # Game mechanics & collision
│   ├── tetris-pieces.js    # Tetromino definitions
│   ├── tetris-scoring.js   # NES scoring system
│   └── tetris-levels.js    # Speed/level progression
├── services/            # Utilities
│   └── storageService.js   # localStorage operations
├── styles/              # CSS
│   ├── arcade-theme.css    # 80's aesthetic colors & fonts
│   ├── tetris.css          # Game-specific styles
│   └── animations.css      # Line clear & animations
├── App.jsx              # Root component
└── main.jsx             # Entry point
```

## Getting Started

### Installation

```bash
# Install dependencies (already set up)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Running Locally

1. The dev server runs at `http://localhost:5173/`
2. Open in your browser
3. Select starting level (0-9)
4. Click "START GAME"
5. Use keyboard controls to play

## Game Mechanics

### Board
- 10 columns × 20 visible rows
- 2 additional spawn rows at the top
- 30px × 30px cells (responsive)

### Pieces (7 Tetrominoes)
- I (Cyan) - Line piece
- O (Yellow) - Square piece
- T (Purple) - T-piece
- S (Green) - S-piece
- Z (Red) - Z-piece
- J (Blue) - J-piece
- L (Orange) - L-piece

### Level Progression
- Levels increase every 10 lines cleared
- Starting level affects initial speed (0-9)
- Speed increases with each level using NES timing

### Speed Table (Levels 0-9+)
| Level | Frames | ~Seconds/Row |
|-------|--------|--------------|
| 0 | 48 | 0.80s |
| 1 | 43 | 0.72s |
| 2 | 38 | 0.63s |
| 3 | 33 | 0.55s |
| 4 | 28 | 0.47s |
| 5 | 23 | 0.38s |
| 6 | 18 | 0.30s |
| 7 | 13 | 0.22s |
| 8 | 8 | 0.13s |
| 9+ | 6+ | 0.10s+ |

## High Scores

Scores are saved locally in browser storage (`localStorage`). Top 10 scores are displayed on the menu screen with:
- Rank
- Score
- Lines cleared
- Final level
- Date played

## Visual Design

### Color Palette
- **Dark background**: #0a0a0a
- **Neon cyan**: #00ffff (primary accent)
- **Neon pink**: #ff00ff (secondary accent)
- **Neon yellow**: #ffff00 (score highlights)
- **Neon green**: #00ff00 (level highlights)

### Style Features
- Pixel font (Press Start 2P)
- Neon glow effects
- CRT scanline overlay
- Smooth animations
- Responsive layout

## Browser Support

Works best on modern browsers supporting:
- ES6+ JavaScript
- CSS3 (Grid, Flexbox, Animations)
- localStorage API

## Future Enhancements

Post-MVP features to consider:
1. Ghost piece preview
2. Hold/Save piece functionality
3. Touch controls for mobile
4. Sound effects & music
5. Backend integration for global leaderboards
6. Additional game modes

## Author

Yaasameen  
Status: MVP Complete  
Last Updated: January 31, 2026
