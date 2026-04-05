const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getEnv(name, fallback = '') {
  const value = process.env[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

const env = {
  port: Number(getEnv('PORT', '4000')),
  databaseUrl: getEnv('DATABASE_URL', 'postgresql://aulabase:aulabase_dev@localhost:5432/aulabase'),
  databaseSsl: getEnv('DATABASE_SSL', 'false').toLowerCase() === 'true',
};

module.exports = { env };
