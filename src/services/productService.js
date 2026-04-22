const pool = require('../database/pool');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const productSelectFields = `
  p.id,
  p.name,
  p.price,
  p.created_at,
  p.updated_at,
  p.created_by,
  CASE
    WHEN u.id IS NULL THEN NULL
    ELSE json_build_object(
      'id', u.id,
      'name', u.name
    )
  END AS creator
`;

const getProducts = async () => {
  const query = `
    SELECT ${productSelectFields}
    FROM products p
    LEFT JOIN users u ON u.id = p.created_by
    ORDER BY p.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getProductById = async (id) => {
  const query = `
    SELECT ${productSelectFields}
    FROM products p
    LEFT JOIN users u ON u.id = p.created_by
    WHERE p.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  const product = rows[0];

  if (!product) {
    throw createError(404, 'Product not found');
  }

  return product;
};

const createProduct = async ({ name, price }, createdBy) => {
  const query = `
    WITH inserted_product AS (
      INSERT INTO products (name, price, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, name, price, created_at, updated_at, created_by
    )
    SELECT ${productSelectFields}
    FROM inserted_product p
    LEFT JOIN users u ON u.id = p.created_by
  `;
  const values = [name.trim(), price, createdBy];
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
    RETURNING id, name, price, created_at, updated_at, created_by
  `;
  const { rows } = await pool.query(query, values);
  const updatedProduct = rows[0];

  if (!updatedProduct) {
    throw createError(404, 'Product not found');
  }

  return getProductById(updatedProduct.id);
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
