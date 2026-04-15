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

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

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
    token: signToken(user)
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

  return {
    message: 'Login successful',
    user: sanitizeUser(user),
    token: signToken(user)
  };
};

module.exports = {
  signup,
  login
};
