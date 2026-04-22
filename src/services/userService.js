const pool = require('../database/pool');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getCurrentUserStats = async (userId) => {
  const query = `
    SELECT
      u.id AS "userId",
      u.name,
      COUNT(p.id)::INT AS "productCount"
    FROM users u
    LEFT JOIN products p ON p.created_by = u.id
    WHERE u.id = $1
    GROUP BY u.id, u.name
  `;
  const { rows } = await pool.query(query, [userId]);

  if (!rows[0]) {
    throw createError(404, 'User not found');
  }

  return rows[0];
};

module.exports = {
  getCurrentUserStats
};
