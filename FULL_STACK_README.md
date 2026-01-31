# 80's Arcade Tetris - Full Stack

Complete Tetris game with optional backend for global leaderboards and user accounts.

## 🎮 Features

### Core Game
- ✅ Fully playable Tetris game with NES mechanics
- ✅ 80's retro visual design (neon colors, pixel fonts)
- ✅ 7 Tetrominoes with rotation and collision detection
- ✅ Level selection (0-9) with speed progression
- ✅ Authentic scoring system
- ✅ Pause functionality
- ✅ Game over screen with stats

### Offline-First
- ✅ Play completely offline without internet
- ✅ Local high scores (localStorage)
- ✅ Works in all browsers

### Optional Backend
- ✅ Global leaderboards
- ✅ User registration and login
- ✅ Automatic score syncing
- ✅ User score history
- ✅ Global statistics
- ✅ Anonymous score submission
- ✅ Works even if backend is down

## 📦 Project Structure

```
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── game-engine/     # Core Tetris logic
│   │   ├── services/        # API & storage
│   │   └── styles/          # CSS styling
│   ├── package.json
│   └── .env.local          # API URL config
│
└── Backend (Node.js + Express) [OPTIONAL]
    ├── server/
    │   ├── src/
    │   │   ├── database.js   # SQLite
    │   │   ├── auth.js       # JWT authentication
    │   │   └── routes/       # API endpoints
    │   ├── server.js
    │   ├── package.json
    │   └── .env            # Server config
```

## 🚀 Quick Start

### Play Offline (No Backend)
```bash
# Install & run
npm install
npm run dev

# Open http://localhost:5173
```

That's it! The game is fully playable offline with local score tracking.

### Full Stack Setup (With Backend)

**Terminal 1 - Frontend**:
```bash
npm install
npm run dev
# http://localhost:5173
```

**Terminal 2 - Backend**:
```bash
cd server
npm install
cp .env.example .env
npm run dev
# http://localhost:3001
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| ← → | Move left/right |
| ↓ | Soft drop |
| ↑ or X | Rotate CW |
| Z | Rotate CCW |
| Space | Hard drop |
| P / Esc | Pause |
| Enter | Start/Restart |

## 📊 Scoring

| Action | Points |
|--------|--------|
| 1 Line | 40 × (level + 1) |
| 2 Lines | 100 × (level + 1) |
| 3 Lines | 300 × (level + 1) |
| 4 Lines | 1200 × (level + 1) |
| Soft Drop | 1 per cell |
| Hard Drop | 2 per cell |

## 🏗️ Architecture

### Offline-First
The frontend is designed to work completely standalone:
1. Scores saved to browser `localStorage`
2. Game plays with zero latency
3. Works on airplane mode, poor connections, etc.

### Backend Integration
When backend is available:
1. Scores automatically sync when online
2. Global leaderboards available
3. User accounts optional
4. Pending scores queue locally
5. Automatic retry when connection restored

### Technology

| Layer | Frontend | Backend |
|-------|----------|---------|
| UI | React 18+ | - |
| Build | Vite | - |
| Runtime | Browser | Node.js |
| Server | - | Express.js |
| Database | localStorage | SQLite |
| Auth | JWT Token | JWT + bcrypt |

## 📚 API Documentation

See [server/README.md](server/README.md) for full API docs.

### Key Endpoints
```
GET    /api/health                  # Server status
POST   /api/auth/register           # Create account
POST   /api/auth/login              # Login
GET    /api/auth/me                 # Current user
POST   /api/scores                  # Submit score
GET    /api/scores                  # Global leaderboard
GET    /api/scores/user/history     # User's scores
GET    /api/scores/stats            # Global stats
```

## 🔧 Configuration

### Frontend (`/.env.local`)
```env
VITE_API_URL=http://localhost:3001/api
```

Set to empty string to disable backend features.

### Backend (`/server/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
```

## 🌐 Deployment

### Frontend Only (Static)

**Vercel**:
```bash
vercel
```

**Netlify**: 
Drag `dist/` folder to Netlify

**GitHub Pages**:
```bash
npm run build
# Deploy `dist/` folder
```

### Full Stack

**Recommended**: Vercel (frontend) + Railway/Render (backend)

See [server/README.md](server/README.md) for backend deployment options.

## 🏆 High Scores

### Local Storage
- Top 10 scores saved automatically
- Survives browser refresh
- No backend required
- Works offline

### Global Leaderboard (With Backend)
- Submit scores to server
- View all-time top scores
- Anonymous or with account
- Automatic syncing

## 🛠️ Development

### Offline Mode Testing
In DevTools:
1. Network tab
2. Throttling → Offline
3. Game continues working

### Database Reset
```bash
rm server/tetris.db
npm run dev
```

### Clear Local Scores
DevTools console:
```javascript
localStorage.clear()
location.reload()
```

## 📱 Browser Support

Modern browsers with:
- ES6+ JavaScript
- CSS3 (Grid, Flexbox, Animations)
- localStorage API
- Fetch API

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🎯 Performance

- **Load Time**: < 1 second
- **Game Loop**: 60 FPS
- **Bundle Size**: ~150KB (ungzipped)
- **Offline**: 0ms latency

## 🚨 Troubleshooting

### Game Won't Load
```bash
# Clear cache & reload
Ctrl+Shift+Delete  # Clear cache
Ctrl+Shift+R       # Hard reload
```

### Scores Not Syncing
- Check backend is running: `npm run dev` in `server/`
- Verify `VITE_API_URL` matches backend
- Check browser console (F12) for errors
- Offline status shows in header

### Backend Connection Failed
- Ensure `http://localhost:3001` is accessible
- Check `FRONTEND_URL` in `server/.env`
- Restart both frontend and backend
- Game continues offline automatically

## 🚀 Next Steps

### Add More Features
1. Sound effects
2. Ghost piece preview
3. Hold piece
4. Achievements
5. Touch controls

### Scale Backend
1. Move to PostgreSQL
2. Add user profiles
3. Implement friends system
4. Add WebSocket for real-time updates
5. Anti-cheat validation

## 📖 Documentation

- [Frontend Setup](#quick-start)
- [Backend Setup](server/README.md)
- [API Reference](server/README.md#api-documentation)
- [Game Mechanics](#game-mechanics)

## 📄 License

MIT

## 👤 Author

Yaasameen

**Status**: MVP Complete ✅  
**Last Updated**: January 31, 2026

---

**Questions?** Check the README files in each directory or open an issue!
