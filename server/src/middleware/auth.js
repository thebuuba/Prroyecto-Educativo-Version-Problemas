const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { query } = require('../db/pool');

function getJwtSecret() {
  if (env.jwtSecret) return env.jwtSecret;
  if (process.env.NODE_ENV === 'production') {
    throw Object.assign(new Error('JWT_SECRET es obligatorio en producción.'), { statusCode: 500 });
  }
  return 'aulabase-dev-only-change-me';
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function cookieOptions(extra = {}) {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/',
    ...extra,
  };
}

function signSessionToken(userId, sessionId) {
  return jwt.sign({ sub: userId, sid: sessionId }, getJwtSecret(), {
    expiresIn: env.jwtExpiresIn,
  });
}

async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies?.[env.cookieName] || readBearerToken(req);
    if (!token) {
      const error = new Error('Sesión requerida.');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const sessionId = String(decoded?.sid || '').trim();
    const userId = String(decoded?.sub || '').trim();
    if (!sessionId || !userId) {
      const error = new Error('Sesión inválida.');
      error.statusCode = 401;
      throw error;
    }

    const result = await query(
      `SELECT s.id AS session_id,
              u.id, u.email, u.display_name, u.phone, u.status, u.firebase_uid
       FROM user_sessions s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.id = $1
         AND s.user_id = $2
         AND s.token_hash = $3
         AND s.revoked_at IS NULL
         AND s.expires_at > NOW()
         AND u.status = 'active'
       LIMIT 1`,
      [sessionId, userId, hashToken(token)]
    );

    const user = result.rows[0];
    if (!user) {
      const error = new Error('Sesión expirada o revocada.');
      error.statusCode = 401;
      throw error;
    }

    req.auth = {
      sessionId: user.session_id,
      userId: user.id,
      user,
    };
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    next(error);
  }
}

async function requireSchoolAccess(req, schoolId) {
  const cleanSchoolId = String(schoolId || '').trim();
  if (!cleanSchoolId) {
    const error = new Error('schoolId es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  const result = await query(
    `SELECT role
     FROM school_memberships
     WHERE school_id = $1
       AND user_id = $2
       AND status = 'active'
     LIMIT 1`,
    [cleanSchoolId, req.auth?.userId]
  );

  if (!result.rows[0]) {
    const error = new Error('No tienes acceso a los datos de esta institución.');
    error.statusCode = 403;
    throw error;
  }

  return cleanSchoolId;
}

function readBearerToken(req) {
  const header = String(req.headers?.authorization || '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

module.exports = {
  cookieOptions,
  hashToken,
  requireAuth,
  requireSchoolAccess,
  signSessionToken,
};
