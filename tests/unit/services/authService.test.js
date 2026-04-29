jest.mock('../../../src/database/pool', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../../../src/database/pool');
const authService = require('../../../src/services/authService');
const { createRefreshToken } = require('../../helpers/tokens');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signup crea un usuario client y devuelve un token', async () => {
    bcrypt.hash.mockResolvedValue('hashed-password');
    pool.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            name: 'Alice',
            email: 'alice@example.com',
            role: 'client',
            created_at: '2026-04-28T00:00:00.000Z'
          }
        ]
      });

    const result = await authService.signup({
      name: 'Alice',
      email: 'ALICE@example.com',
      password: 'secret123'
    });

    expect(pool.query).toHaveBeenNthCalledWith(1, 'SELECT id FROM users WHERE email = $1', ['alice@example.com']);
    expect(result.user.role).toBe('client');
    expect(result.token).toEqual(expect.any(String));
  });

  test('login devuelve access y refresh tokens y guarda el refresh token', async () => {
    bcrypt.compare.mockResolvedValue(true);
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            name: 'Admin User',
            email: 'admin@example.com',
            password_hash: 'hashed-password',
            role: 'admin',
            created_at: '2026-04-28T00:00:00.000Z'
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    const result = await authService.login({
      email: 'admin@example.com',
      password: 'secret123'
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.token).toBe(result.accessToken);
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO refresh_tokens'),
      ['user-1', result.refreshToken]
    );
  });

  test('login falla con credenciales invalidas', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await expect(
      authService.login({
        email: 'missing@example.com',
        password: 'secret123'
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  });

  test('refreshAccessToken devuelve un nuevo access token para un refresh token valido guardado', async () => {
    const refreshToken = createRefreshToken({ id: 'user-42' });

    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-42' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-42',
            name: 'Staff User',
            email: 'staff@example.com',
            role: 'staff',
            created_at: '2026-04-28T00:00:00.000Z'
          }
        ]
      });

    const result = await authService.refreshAccessToken(refreshToken);

    expect(result).toEqual({
      accessToken: expect.any(String)
    });
  });

  test('refreshAccessToken elimina de almacenamiento los tokens expirados', async () => {
    const expiredToken = 'expired-refresh-token';

    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-1' }] })
      .mockResolvedValueOnce({ rows: [] });

    jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    await expect(authService.refreshAccessToken(expiredToken)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid refresh token'
    });

    expect(pool.query).toHaveBeenNthCalledWith(2, 'DELETE FROM refresh_tokens WHERE token = $1', [expiredToken]);
  });
});
