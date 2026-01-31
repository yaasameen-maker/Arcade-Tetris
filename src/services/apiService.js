const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Track online/offline status
let isOnline = navigator.onLine;
window.addEventListener('online', () => {
  isOnline = true;
  console.log('🌐 Back online - syncing scores...');
  syncPendingScores();
});
window.addEventListener('offline', () => {
  isOnline = false;
  console.log('📴 Offline mode - scores will sync when online');
});

// User authentication
let currentUser = null;

const apiService = {
  // Authentication
  async register(username, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return response.json();
  },

  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error((await response.json()).error);
    const data = await response.json();
    currentUser = data;
    localStorage.setItem('tetris_user_token', data.token);
    return data;
  },

  async logout() {
    currentUser = null;
    localStorage.removeItem('tetris_user_token');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('tetris_user_token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        currentUser = await response.json();
        return currentUser;
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
    return null;
  },

  // Scores
  async submitScore(score, lines, level, gameDuration) {
    const token = localStorage.getItem('tetris_user_token');
    const sessionId = this.getSessionId();

    // Always save to localStorage first
    this.savePendingScore({ score, lines, level, gameDuration, sessionId, timestamp: Date.now() });

    // Try to sync if online
    if (isOnline && API_URL) {
      try {
        const response = await fetch(`${API_URL}/scores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ score, lines, level, gameDuration, sessionId })
        });

        if (response.ok) {
          // Remove from pending if successfully synced
          this.removePendingScore(sessionId);
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to sync score online, saved locally:', error);
      }
    }

    return { id: null, synced: false, message: 'Score saved locally' };
  },

  async getLeaderboard(limit = 50, offset = 0) {
    if (!API_URL) return { scores: [], count: 0 };
    
    try {
      const response = await fetch(`${API_URL}/scores?limit=${limit}&offset=${offset}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
    return { scores: [], count: 0 };
  },

  async getUserScores(limit = 50, offset = 0) {
    const token = localStorage.getItem('tetris_user_token');
    if (!token || !API_URL) return { scores: [] };

    try {
      const response = await fetch(`${API_URL}/scores/user/history?limit=${limit}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user scores:', error);
    }
    return { scores: [] };
  },

  async getStats() {
    if (!API_URL) return {};
    
    try {
      const response = await fetch(`${API_URL}/scores/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    return {};
  },

  // Pending scores (for offline mode)
  savePendingScore(scoreData) {
    const pending = JSON.parse(localStorage.getItem('tetris_pending_scores') || '[]');
    pending.push(scoreData);
    localStorage.setItem('tetris_pending_scores', JSON.stringify(pending));
  },

  removePendingScore(sessionId) {
    const pending = JSON.parse(localStorage.getItem('tetris_pending_scores') || '[]');
    const filtered = pending.filter(s => s.sessionId !== sessionId);
    localStorage.setItem('tetris_pending_scores', JSON.stringify(filtered));
  },

  getPendingScores() {
    return JSON.parse(localStorage.getItem('tetris_pending_scores') || '[]');
  },

  getSessionId() {
    let sessionId = localStorage.getItem('tetris_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tetris_session_id', sessionId);
    }
    return sessionId;
  },

  isOnline() {
    return isOnline;
  }
};

// Sync pending scores when coming online
async function syncPendingScores() {
  if (!API_URL) return;
  
  const pending = apiService.getPendingScores();
  if (pending.length === 0) return;

  console.log(`Syncing ${pending.length} pending scores...`);
  for (const scoreData of pending) {
    try {
      const token = localStorage.getItem('tetris_user_token');
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          score: scoreData.score,
          lines: scoreData.lines,
          level: scoreData.level,
          gameDuration: scoreData.gameDuration,
          sessionId: scoreData.sessionId
        })
      });

      if (response.ok) {
        apiService.removePendingScore(scoreData.sessionId);
        console.log('✅ Score synced');
      }
    } catch (error) {
      console.error('Failed to sync pending score:', error);
    }
  }
}

export { apiService };
