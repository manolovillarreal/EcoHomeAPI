const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPass,
  database: env.dbName,
  port: env.dbPort,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.dbSsl
    ? { rejectUnauthorized: env.dbSslRejectUnauthorized }
    : env.nodeEnv === 'production'
      ? { rejectUnauthorized: false }
      : false
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

module.exports = pool;
