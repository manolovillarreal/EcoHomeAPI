jest.mock('../../src/database/pool', () => ({
  query: jest.fn()
}));

const request = require('supertest');
const pool = require('../../src/database/pool');
const app = require('../../src/app');
const { createAccessToken } = require('../helpers/tokens');

describe('rutas de usuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /users/me/stats permite usuarios admin', async () => {
    const token = createAccessToken({
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: 'admin'
    });
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Admin User',
          productCount: 4
        }
      ]
    });

    const response = await request(app)
      .get('/users/me/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Admin User',
      productCount: 4
    });
  });

  test('GET /users/me/stats rechaza usuarios client', async () => {
    const token = createAccessToken({ role: 'client' });

    const response = await request(app)
      .get('/users/me/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden: insufficient permissions' });
  });

  test('GET /users/me/stats devuelve 401 para tokens invalidos', async () => {
    const response = await request(app)
      .get('/users/me/stats')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid or expired token' });
  });
});
