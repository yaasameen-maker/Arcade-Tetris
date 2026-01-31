const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL required for Railway
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper functions for database operations
const dbQuery = (text, params) => pool.query(text, params);

const dbRun = (text, params = []) => {
  return dbQuery(text, params);
};

const dbGet = async (text, params = []) => {
  const result = await dbQuery(text, params);
  return result.rows[0];
};

const dbAll = async (text, params = []) => {
  const result = await dbQuery(text, params);
  return result.rows;
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('Initializing PostgreSQL database...');

    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create scores table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        lines INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 0,
        game_duration INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for performance
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at);
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    `).catch(() => {
      // Indexes might already exist, that's ok
    });

    // Create anonymous_scores table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS anonymous_scores (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        lines INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 0,
        game_duration INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for anonymous scores
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_anon_scores_created_at ON anonymous_scores(created_at);
      CREATE INDEX IF NOT EXISTS idx_anon_scores_score ON anonymous_scores(score DESC);
    `).catch(() => {
      // Indexes might already exist, that's ok
    });

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await dbQuery('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  dbQuery,
  dbRun,
  dbGet,
  dbAll,
  initializeDatabase,
  testConnection
};
