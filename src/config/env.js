const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'DB_PORT',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
  dbPort: Number(process.env.DB_PORT),
  dbSsl: process.env.DB_SSL === 'true',
  dbSslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  nodeEnv: process.env.NODE_ENV || 'development'
};
