const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { requireAuth } = require('../middleware');
const router = express.Router();

// POST /api/scores - Submit a score
router.post('/', async (req, res) => {
  try {
    const { score, lines, level, gameDuration } = req.body;
    const userId = req.user?.userId || null;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    if (userId) {
      // Authenticated user
      const result = await dbRun(
        'INSERT INTO scores (user_id, score, lines, level, game_duration) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, score, lines, level, game_duration, created_at',
        [userId, score, lines || 0, level || 0, gameDuration || 0]
      );
      return res.status(201).json(result.rows[0]);
    } else {
      // Anonymous user - use session ID
      const sessionId = req.body.sessionId || `anon-${Date.now()}`;
      const result = await dbRun(
        'INSERT INTO anonymous_scores (session_id, score, lines, level, game_duration) VALUES ($1, $2, $3, $4, $5) RETURNING id, session_id, score, lines, level, game_duration, created_at',
        [sessionId, score, lines || 0, level || 0, gameDuration || 0]
      );
      return res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// GET /api/scores - Get leaderboard
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;

    // Get user scores
    const userScores = await dbAll(
      `SELECT 
        s.id, 
        s.user_id, 
        s.score, 
        s.lines, 
        s.level, 
        s.game_duration, 
        s.created_at,
        u.username,
        'user' as type
      FROM scores s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.score DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get anonymous scores
    const anonScores = await dbAll(
      `SELECT 
        id, 
        session_id, 
        score, 
        lines, 
        level, 
        game_duration, 
        created_at,
        'anonymous' as type
      FROM anonymous_scores
      ORDER BY score DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Combine and sort by score
    const allScores = [...userScores, ...anonScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    res.json({
      scores: allScores,
      limit,
      offset
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/scores/user/history - Get user's score history
router.get('/user/history', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const scores = await dbAll(
      `SELECT 
        id, 
        user_id, 
        score, 
        lines, 
        level, 
        game_duration, 
        created_at
      FROM scores
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [req.user.userId, limit, offset]
    );

    res.json({
      scores,
      limit,
      offset
    });
  } catch (error) {
    console.error('User history error:', error);
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

// GET /api/scores/stats - Get global statistics
router.get('/stats', async (req, res) => {
  try {
    const userStatsResult = await dbGet(
      `SELECT 
        COUNT(*) as total_scores,
        SUM(score) as total_score,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        COUNT(DISTINCT user_id) as total_users
      FROM scores`
    );

    const anonStatsResult = await dbGet(
      `SELECT 
        COUNT(*) as total_scores,
        SUM(score) as total_score,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        COUNT(DISTINCT session_id) as total_sessions
      FROM anonymous_scores`
    );

    res.json({
      authenticated: userStatsResult,
      anonymous: anonStatsResult,
      combined: {
        total_scores: (parseInt(userStatsResult.total_scores) || 0) + (parseInt(anonStatsResult.total_scores) || 0),
        total_players: (parseInt(userStatsResult.total_users) || 0) + (parseInt(anonStatsResult.total_sessions) || 0)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
