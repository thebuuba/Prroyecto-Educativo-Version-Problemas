const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { env } = require('../config/env');
const { query } = require('../db/pool');

let supabaseAuthClient = null;

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

function getSupabaseAuthClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) return null;
  if (!supabaseAuthClient) {
    supabaseAuthClient = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAuthClient;
}

function normalizeSupabaseDisplayName(user) {
  const metadata = user?.user_metadata || {};
  return String(metadata.full_name || metadata.name || user?.email?.split('@')?.[0] || 'Usuario AulaBase').trim();
}

async function resolveSupabaseUser(accessToken) {
  const supabase = getSupabaseAuthClient();
  if (!supabase || !accessToken) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user?.id) return null;

  const supabaseUser = data.user;
  const email = String(supabaseUser.email || '').trim().toLowerCase();
  if (!email) return null;

  const displayName = normalizeSupabaseDisplayName(supabaseUser);
  const result = await query(
    `INSERT INTO users (email, display_name, auth_provider_uid, last_login_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email) DO UPDATE
     SET display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), users.display_name),
         auth_provider_uid = COALESCE(EXCLUDED.auth_provider_uid, users.auth_provider_uid),
         last_login_at = NOW(),
         updated_at = NOW()
     RETURNING id, email, display_name, phone, status, auth_provider_uid`,
    [email, displayName, supabaseUser.id]
  );

  const user = result.rows[0];
  if (!user || user.status !== 'active') return null;
  return user;
}

async function resolveCookieSession(token) {
  const decoded = jwt.verify(token, getJwtSecret());
  const sessionId = String(decoded?.sid || '').trim();
  const userId = String(decoded?.sub || '').trim();
  if (!sessionId || !userId) return null;

  const result = await query(
    `SELECT s.id AS session_id,
            u.id, u.email, u.display_name, u.phone, u.status, u.auth_provider_uid
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
  if (!user) return null;
  return { user, sessionId: user.session_id };
}

async function requireAuth(req, _res, next) {
  try {
    const cookieToken = req.cookies?.[env.cookieName] || '';
    const bearerToken = readBearerToken(req);
    if (!cookieToken && !bearerToken) {
      const error = new Error('Sesión requerida.');
      error.statusCode = 401;
      throw error;
    }

    if (cookieToken) {
      const cookieSession = await resolveCookieSession(cookieToken);
      if (cookieSession?.user) {
        req.auth = {
          sessionId: cookieSession.sessionId,
          userId: cookieSession.user.id,
          user: cookieSession.user,
          provider: 'local',
        };
        next();
        return;
      }
    }

    if (bearerToken) {
      const supabaseUser = await resolveSupabaseUser(bearerToken);
      if (supabaseUser) {
        req.auth = {
          sessionId: null,
          userId: supabaseUser.id,
          user: supabaseUser,
          provider: 'supabase',
        };
        next();
        return;
      }
    }

    const error = new Error('Sesión expirada o revocada.');
    error.statusCode = 401;
    throw error;
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
