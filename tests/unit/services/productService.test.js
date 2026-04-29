jest.mock('../../../src/database/pool', () => ({
  query: jest.fn()
}));

const pool = require('../../../src/database/pool');
const productService = require('../../../src/services/productService');

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getProducts devuelve un arreglo plano cuando no se envian parametros de paginacion', async () => {
    const products = [{ id: 'product-1', name: 'Lamp' }];
    pool.query.mockResolvedValueOnce({ rows: products });

    const result = await productService.getProducts();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(products);
  });

  test('getProducts devuelve datos paginados cuando hay query params', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'product-1' }, { id: 'product-2' }] });

    const result = await productService.getProducts({
      page: '2',
      limit: '2',
      created_by: 'user-1'
    });

    expect(result).toEqual({
      data: [{ id: 'product-1' }, { id: 'product-2' }],
      pagination: {
        page: 2,
        limit: 2,
        total: 2
      }
    });
  });

  test('getProductById lanza 404 cuando el producto no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await expect(productService.getProductById('missing-product')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Product not found'
    });
  });

  test('deleteProduct lanza 404 cuando no se elimina ningun registro', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    await expect(productService.deleteProduct('missing-product')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Product not found'
    });
  });
});
