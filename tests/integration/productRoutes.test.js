jest.mock('../../src/database/pool', () => ({
  query: jest.fn()
}));

const request = require('supertest');
const pool = require('../../src/database/pool');
const app = require('../../src/app');
const { createAccessToken } = require('../helpers/tokens');

describe('rutas de productos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /products devuelve el arreglo legado cuando no se envian query params', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'product-1', name: 'Lamp', price: '89.90' }]
    });

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'product-1', name: 'Lamp', price: '89.90' }]);
  });

  test('GET /products devuelve datos paginados cuando hay parametros de paginacion', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: 3 }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'product-1', name: 'Lamp', price: '89.90' }]
      });

    const response = await request(app).get('/products?page=1&limit=1&created_by=550e8400-e29b-41d4-a716-446655440000');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [{ id: 'product-1', name: 'Lamp', price: '89.90' }],
      pagination: {
        page: 1,
        limit: 1,
        total: 3
      }
    });
  });

  test('POST /products permite usuarios staff', async () => {
    const token = createAccessToken({
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: 'staff'
    });
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 'product-1',
          name: 'Desk',
          price: '199.99',
          created_by: '550e8400-e29b-41d4-a716-446655440000',
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Staff User'
          }
        }
      ]
    });

    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Desk',
        price: 199.99
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Desk');
    expect(response.body.created_by).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('POST /products devuelve 401 sin autenticacion', async () => {
    const response = await request(app).post('/products').send({
      name: 'Desk',
      price: 199.99
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing or invalid authorization header' });
  });

  test('DELETE /products/:id rechaza usuarios staff', async () => {
    const token = createAccessToken({ role: 'staff' });

    const response = await request(app)
      .delete('/products/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden: insufficient permissions' });
  });

  test('PUT /products/:id permite usuarios admin', async () => {
    const token = createAccessToken({ role: 'admin' });
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Updated Chair',
            price: '99.99',
            created_at: '2026-04-28T00:00:00.000Z',
            updated_at: '2026-04-28T00:00:00.000Z',
            created_by: '550e8400-e29b-41d4-a716-446655440000'
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Updated Chair',
            price: '99.99',
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            creator: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Admin User'
            }
          }
        ]
      });

    const response = await request(app)
      .put('/products/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Chair'
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Chair');
  });

  test('DELETE /products/:id permite usuarios admin', async () => {
    const token = createAccessToken({ role: 'admin' });
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const response = await request(app)
      .delete('/products/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Product deleted successfully' });
  });

  test('GET /products valida los parametros de paginacion', async () => {
    const response = await request(app).get('/products?page=0&limit=500');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});
