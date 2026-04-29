const jwt = require('jsonwebtoken');

const createAccessToken = (overrides = {}) =>
  jwt.sign(
    {
      id: 'user-1',
      role: 'admin',
      name: 'Test User',
      email: 'test@example.com',
      tokenType: 'access',
      ...overrides
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

const createRefreshToken = (overrides = {}) =>
  jwt.sign(
    {
      id: 'user-1',
      tokenType: 'refresh',
      ...overrides
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );

module.exports = {
  createAccessToken,
  createRefreshToken
};
