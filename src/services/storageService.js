const STORAGE_KEY = 'tetris_high_scores';
const MAX_SCORES = 10;

export const storageService = {
  getScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading scores:', e);
      return [];
    }
  },

  saveScore(scoreData) {
    try {
      const scores = this.getScores();
      const newScore = {
        ...scoreData,
        date: new Date().toISOString()
      };

      scores.push(newScore);

      // Sort by score descending, keep top 10
      scores.sort((a, b) => b.score - a.score);
      const topScores = scores.slice(0, MAX_SCORES);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));

      // Return rank (1-indexed) or null if not in top 10
      const rank = topScores.findIndex(
        s => s.score === newScore.score && s.date === newScore.date
      );
      return rank !== -1 ? rank + 1 : null;
    } catch (e) {
      console.error('Error saving score:', e);
      return null;
    }
  },

  isHighScore(score) {
    const scores = this.getScores();
    return scores.length < MAX_SCORES || score > (scores[scores.length - 1]?.score || 0);
  },

  clearScores() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing scores:', e);
    }
  }
};
