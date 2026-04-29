const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const pool = require('../database/pool');

const createError = (statusCode, message, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at
});

const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      tokenType: 'access'
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      tokenType: 'refresh'
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );

const storeRefreshToken = async (userId, refreshToken) => {
  await pool.query(
    `
      INSERT INTO refresh_tokens (user_id, token)
      VALUES ($1, $2)
    `,
    [userId, refreshToken]
  );
};

const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

  if (existingUser.rowCount > 0) {
    throw createError(400, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const values = [name.trim(), normalizedEmail, passwordHash, 'client'];
  const { rows } = await pool.query(query, values);
  const user = rows[0];

  return {
    message: 'User created successfully',
    user: sanitizeUser(user),
    token: signAccessToken(user)
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const query = `
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
  `;
  const { rows } = await pool.query(query, [normalizedEmail]);
  const user = rows[0];

  if (!user) {
    throw createError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw createError(401, 'Invalid credentials');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await storeRefreshToken(user.id, refreshToken);

  return {
    message: 'Login successful',
    user: sanitizeUser(user),
    token: accessToken,
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw createError(401, 'Invalid refresh token');
  }

  const storedTokenResult = await pool.query(
    `
      SELECT user_id
      FROM refresh_tokens
      WHERE token = $1
    `,
    [refreshToken]
  );
  const storedToken = storedTokenResult.rows[0];

  if (!storedToken) {
    throw createError(401, 'Invalid refresh token');
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.refreshTokenSecret);
  } catch (error) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    throw createError(401, 'Invalid refresh token');
  }

  if (decoded.tokenType !== 'refresh' || decoded.id !== storedToken.user_id) {
    throw createError(401, 'Invalid refresh token');
  }

  const { rows } = await pool.query(
    `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1
    `,
    [storedToken.user_id]
  );
  const user = rows[0];

  if (!user) {
    throw createError(401, 'Invalid refresh token');
  }

  return {
    accessToken: signAccessToken(user)
  };
};

module.exports = {
  signup,
  login,
  refreshAccessToken
};
