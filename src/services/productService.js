const pool = require('../database/pool');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getProducts = async () => {
  const query = `
    SELECT id, name, price, created_at, updated_at
    FROM products
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getProductById = async (id) => {
  const query = `
    SELECT id, name, price, created_at, updated_at
    FROM products
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  const product = rows[0];

  if (!product) {
    throw createError(404, 'Product not found');
  }

  return product;
};

const createProduct = async ({ name, price }) => {
  const query = `
    INSERT INTO products (name, price)
    VALUES ($1, $2)
    RETURNING id, name, price, created_at, updated_at
  `;
  const values = [name.trim(), price];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateProduct = async (id, { name, price }) => {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    values.push(name.trim());
    fields.push(`name = $${values.length}`);
  }

  if (price !== undefined) {
    values.push(price);
    fields.push(`price = $${values.length}`);
  }

  values.push(id);

  const query = `
    UPDATE products
    SET ${fields.join(', ')}
    WHERE id = $${values.length}
    RETURNING id, name, price, created_at, updated_at
  `;
  const { rows } = await pool.query(query, values);
  const product = rows[0];

  if (!product) {
    throw createError(404, 'Product not found');
  }

  return product;
};

const deleteProduct = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);

  if (rowCount === 0) {
    throw createError(404, 'Product not found');
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
