const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (userId, username) => {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Create user
const createUser = async (username, password) => {
  try {
    const passwordHash = await hashPassword(password);
    const result = await dbRun(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Username already exists');
    }
    throw error;
  }
};

// Authenticate user
const authenticateUser = async (username, password) => {
  const user = await dbGet(
    'SELECT id, username, password_hash FROM users WHERE username = $1',
    [username]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Invalid password');
  }

  return { id: user.id, username: user.username };
};

// Get user by ID
const getUserById = async (userId) => {
  return dbGet(
    'SELECT id, username, created_at FROM users WHERE id = $1',
    [userId]
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  createUser,
  authenticateUser,
  getUserById,
  JWT_SECRET
};
