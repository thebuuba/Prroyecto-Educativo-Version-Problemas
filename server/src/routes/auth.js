const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { query, withTransaction } = require('../db/pool');
const { cookieOptions, hashToken, requireAuth, signSessionToken } = require('../middleware/auth');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.id,
    email: row.email || '',
    name: row.display_name || row.full_name || '',
    displayName: row.display_name || row.full_name || '',
    phone: row.phone || '',
    status: row.status || 'active',
    profile: {
      fullName: row.full_name || row.display_name || '',
      institutionName: row.institution_name || '',
      teacherRole: row.teacher_role || 'teacher',
      educationLevel: row.education_level || '',
      academicYear: row.academic_year || '',
      metadata: row.metadata || {},
    },
    settings: {
      locale: row.locale || 'es-DO',
      timezone: row.timezone || 'America/Santo_Domingo',
      theme: row.theme || 'system',
      preferences: row.preferences || {},
    },
  };
}

async function createSession(client, req, res, userId) {
  const sessionResult = await client.query(
    `INSERT INTO user_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, 'pending', $2, NULLIF($3, '')::inet, NOW() + INTERVAL '7 days')
     RETURNING id, expires_at`,
    [userId, String(req.headers['user-agent'] || '').slice(0, 500), String(req.ip || '').replace('::ffff:', '')]
  );
  const session = sessionResult.rows[0];
  const token = signSessionToken(userId, session.id);
  await client.query(
    `UPDATE user_sessions
     SET token_hash = $1
     WHERE id = $2`,
    [hashToken(token), session.id]
  );
  res.cookie(env.cookieName, token, cookieOptions({ expires: new Date(session.expires_at) }));
  return session;
}

async function loadUserBundle(client, userId) {
  const result = await client.query(
    `SELECT u.id, u.email, u.display_name, u.phone, u.status,
            p.full_name, p.institution_name, p.teacher_role, p.education_level, p.academic_year, p.metadata,
            s.locale, s.timezone, s.theme, s.preferences
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     LEFT JOIN user_settings s ON s.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
}

router.post('/register', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const displayName = String(req.body?.name || req.body?.displayName || '').trim();

    if (!email || !email.includes('@')) throw badRequest('El correo no es válido.');
    if (password.length < 8) throw badRequest('La contraseña debe tener al menos 8 caracteres.');
    if (!displayName) throw badRequest('El nombre es obligatorio.');

    const result = await withTransaction(async (client) => {
      const existing = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
      if (existing.rows[0]) {
        const error = new Error('Ese correo ya está registrado.');
        error.statusCode = 409;
        throw error;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const inserted = await client.query(
        `INSERT INTO users (email, display_name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [email, displayName, passwordHash]
      );
      const userId = inserted.rows[0].id;

      await client.query(
        `INSERT INTO user_profiles (user_id, full_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             updated_at = NOW()`,
        [userId, displayName]
      );
      await client.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
      await createSession(client, req, res, userId);
      return loadUserBundle(client, userId);
    });

    res.status(201).json({ ok: true, user: publicUser(result), isNewUser: true });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) throw badRequest('Completa correo y contraseña.');

    const result = await withTransaction(async (client) => {
      const userResult = await client.query(
        `SELECT id, password_hash, status
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email]
      );
      const user = userResult.rows[0];
      const valid = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
      if (!user || !valid || user.status !== 'active') {
        const error = new Error('Credenciales incorrectas.');
        error.statusCode = 401;
        throw error;
      }

      await client.query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);
      await createSession(client, req, res, user.id);
      return loadUserBundle(client, user.id);
    });

    res.json({ ok: true, user: publicUser(result), isNewUser: false });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await query(
      `UPDATE user_sessions
       SET revoked_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [req.auth.sessionId, req.auth.userId]
    );
    res.clearCookie(env.cookieName, cookieOptions());
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/session', requireAuth, async (req, res, next) => {
  try {
    const result = await loadUserBundle({ query }, req.auth.userId);
    res.json({ ok: true, user: publicUser(result) });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) throw badRequest('El correo es obligatorio.');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    await query(
      `UPDATE users
       SET password_reset_token_hash = $1,
           password_reset_expires_at = NOW() + INTERVAL '30 minutes',
           updated_at = NOW()
       WHERE email = $2`,
      [tokenHash, email]
    );

    res.json({
      ok: true,
      message: 'Si el correo existe, se generó una solicitud de recuperación.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const token = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');
    if (!token) throw badRequest('El token es obligatorio.');
    if (password.length < 8) throw badRequest('La contraseña debe tener al menos 8 caracteres.');

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL,
           updated_at = NOW()
       WHERE password_reset_token_hash = $2
         AND password_reset_expires_at > NOW()
       RETURNING id`,
      [passwordHash, hashToken(token)]
    );
    if (!result.rows[0]) throw badRequest('Token inválido o expirado.');
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
