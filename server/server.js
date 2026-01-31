const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, testConnection } = require('./src/database');
const { authMiddleware } = require('./src/middleware');

const authRoutes = require('./src/routes/auth');
const scoresRoutes = require('./src/routes/scores');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(authMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database schema
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`
✅ Server running on http://localhost:${PORT}
📊 API Base: http://localhost:${PORT}/api
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
🗄️  Database: PostgreSQL (Railway)
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
