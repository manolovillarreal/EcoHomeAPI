jest.mock('../../src/database/pool', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const pool = require('../../src/database/pool');
const app = require('../../src/app');
const { createRefreshToken } = require('../helpers/tokens');

describe('rutas de autenticacion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /auth/signup crea un usuario con rol client', async () => {
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

    const response = await request(app).post('/auth/signup').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123'
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user.role).toBe('client');
    expect(response.body.token).toEqual(expect.any(String));
  });

  test('POST /auth/signup devuelve 400 cuando el email ya existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'user-1' }] });

    const response = await request(app).post('/auth/signup').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email is already registered' });
  });

  test('POST /auth/login devuelve access y refresh tokens', async () => {
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

    const response = await request(app).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'secret123'
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.token).toBe(response.body.accessToken);
  });

  test('POST /auth/login devuelve 401 con credenciales invalidas', async () => {
    pool.query.mockResolvedValueOnce({
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
    });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'wrong-password'
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });

  test('POST /auth/refresh emite un nuevo access token para un refresh token valido guardado', async () => {
    const refreshToken = createRefreshToken({ id: 'user-7' });
    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-7' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-7',
            name: 'Staff User',
            email: 'staff@example.com',
            role: 'staff',
            created_at: '2026-04-28T00:00:00.000Z'
          }
        ]
      });

    const response = await request(app).post('/auth/refresh').send({
      refreshToken
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String)
    });
  });

  test('POST /auth/refresh devuelve 401 para un refresh token desconocido', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).post('/auth/refresh').send({
      refreshToken: 'unknown-token'
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid refresh token' });
  });

  test('POST /auth/refresh valida el cuerpo de la solicitud', async () => {
    const response = await request(app).post('/auth/refresh').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});
