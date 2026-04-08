require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const pool = require('./database/pool');

const startServer = async () => {
  try {
    await pool.query('SELECT 1');

    app.listen(env.port, () => {
      console.log(`EcoHome Store API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
