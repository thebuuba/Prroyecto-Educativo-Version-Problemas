const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getEnv(name, fallback = '') {
  const value = process.env[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

const isProduction = process.env.NODE_ENV === 'production';

function requireProductionEnv(names = []) {
  if (!isProduction) return;
  const missing = names.filter((name) => !getEnv(name));
  if (!missing.length) return;
  throw new Error(`Faltan variables obligatorias en produccion: ${missing.join(', ')}`);
}

requireProductionEnv([
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'JWT_SECRET',
  'CORS_ORIGIN',
]);

const env = {
  isProduction,
  port: Number(getEnv('PORT', '4000')),
  databaseUrl: getEnv('DATABASE_URL', isProduction ? '' : 'postgresql://aulabase:aulabase_dev@localhost:5432/aulabase'),
  databaseSsl: getEnv('DATABASE_SSL', 'false').toLowerCase() === 'true',
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173,http://127.0.0.1:5173'),
  supabaseUrl: getEnv('SUPABASE_URL', ''),
  supabasePublishableKey: getEnv('SUPABASE_PUBLISHABLE_KEY', ''),
  jwtSecret: getEnv('JWT_SECRET', ''),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  cookieName: getEnv('AUTH_COOKIE_NAME', 'aulabase_session'),
  cookieSecure: getEnv('AUTH_COOKIE_SECURE', 'false').toLowerCase() === 'true',
  cookieSameSite: getEnv('AUTH_COOKIE_SAMESITE', 'lax'),
};

module.exports = { env };
