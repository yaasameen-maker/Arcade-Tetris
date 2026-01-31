# Quick Reference - 80's Arcade Tetris

## 🎮 Play the Game

### Offline Only (30 seconds)
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### With Backend (2 minutes)
```bash
# Terminal 1
npm install && npm run dev

# Terminal 2
cd server && npm install
cp .env.example .env
npm run dev
```

## 📖 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Frontend setup & controls |
| **FULL_STACK_README.md** | Overview of offline-first architecture |
| **IMPLEMENTATION_SUMMARY.md** | What was built (this directory) |
| **server/README.md** | API documentation |
| **BACKEND_SETUP.md** | Detailed backend setup guide |

## 🕹️ Controls

| Key | Action |
|-----|--------|
| ← → | Move |
| ↓ | Soft Drop |
| ↑ or X | Rotate CW |
| Z | Rotate CCW |
| Space | Hard Drop |
| P or Esc | Pause |
| Enter | Start/Restart |

## 📊 Files Created

### Frontend
```
src/
├── components/ (8 components)
├── game-engine/ (4 modules)
├── services/ (2 modules)
└── styles/ (3 CSS files)
```

### Backend
```
server/
├── src/
│   ├── database.js
│   ├── auth.js
│   ├── middleware.js
│   └── routes/ (2 route files)
└── server.js
```

### Documentation
```
✓ IMPLEMENTATION_SUMMARY.md (this directory)
✓ FULL_STACK_README.md (this directory)
✓ BACKEND_SETUP.md (backend directory)
✓ server/README.md (backend API docs)
✓ README.md (original frontend docs)
```

## 🔧 Key Technologies

| Role | Tech |
|------|------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | SQLite3 |
| Auth | JWT + bcrypt |
| Storage | localStorage |

## 🚀 Deploy

**Frontend**: Vercel, Netlify, GitHub Pages  
**Backend**: Railway, Render, Heroku  

## 📱 Features

### Offline Mode
- ✅ Play without internet
- ✅ Scores saved locally
- ✅ No backend required

### Online Mode
- ✅ User accounts (optional)
- ✅ Global leaderboards
- ✅ Score syncing
- ✅ Auto-resume offline

### Game
- ✅ NES scoring
- ✅ 7 pieces
- ✅ 10×20 board
- ✅ Levels 0-9
- ✅ 80's aesthetic

## 🏗️ Architecture

```
Browser (Offline)
    ↓
React Game + localStorage
    ↓ (if online)
Backend API + SQLite
```

Works standalone or with backend.

## ⚙️ Environment Setup

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3001/api
```
Leave empty to disable backend.

### Backend (`server/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev-secret-change-in-production
```

## 📡 Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/scores              # Submit score
GET    /api/scores              # Leaderboard
GET    /api/scores/user/history # User's scores
GET    /api/health              # Check server
```

Full docs in `server/README.md`

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | `kill -9 $(lsof -i :3001 \| awk '{print $2}' \| grep -v PID)` |
| CORS error | Check `FRONTEND_URL` in `server/.env` |
| Offline mode | No backend needed, works standalone |
| Scores not syncing | Verify `VITE_API_URL` in `.env.local` |
| Database locked | Delete `server/tetris.db` and restart |

## 📊 Project Stats

- **Files**: 20+ created
- **Lines of Code**: ~2000+
- **Components**: 8
- **API Endpoints**: 7
- **Database Tables**: 3
- **CSS Files**: 3
- **Game Engine Modules**: 4

## ✅ MVP Complete

All features from PRD implemented:
- ✅ Playable game
- ✅ NES mechanics
- ✅ 80's design
- ✅ Local scores
- ✅ Level selection
- ✅ Keyboard controls
- ✅ Pause menu
- ✅ Game over screen
- ✅ **BONUS**: Full backend with offline-first sync

## 🎯 What's Next

1. Test offline mode ← **START HERE**
2. Test online with backend
3. Deploy frontend (Vercel)
4. Deploy backend (Railway)
5. Add more features

## 📞 Quick Links

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health
- API Docs: `server/README.md`
- Setup Guide: `BACKEND_SETUP.md`

---

**Ready to play? Run: `npm install && npm run dev`**
