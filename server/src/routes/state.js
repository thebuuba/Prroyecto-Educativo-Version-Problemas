const express = require('express');
const { withTransaction } = require('../db/pool');

const router = express.Router();
const VALID_BLOCKS = new Set(['academics', 'assessment', 'planner']);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function resolveSchoolForUser(client, input = {}, userId) {
  const explicitSchoolId = String(input.schoolId || '').trim();
  const schoolName = String(input.schoolName || '').trim();
  if (explicitSchoolId && !schoolName) {
    const schoolById = await client.query(
      `SELECT id, name, academic_year, timezone
       FROM schools
       WHERE id = $1
       LIMIT 1`,
      [explicitSchoolId]
    );
    if (schoolById.rows[0]) return schoolById.rows[0];
  }

  if (schoolName) {
    const academicYear = String(input.academicYear || '').trim() || null;
    const timezone = String(input.timezone || '').trim() || 'America/Santo_Domingo';
    const schoolResult = await client.query(
      `INSERT INTO schools (name, academic_year, timezone)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE
       SET academic_year = COALESCE(EXCLUDED.academic_year, schools.academic_year),
           timezone = COALESCE(EXCLUDED.timezone, schools.timezone),
           updated_at = NOW()
       RETURNING id, name, academic_year, timezone`,
      [schoolName, academicYear, timezone]
    );

    return schoolResult.rows[0];
  }

  if (userId) {
    const membershipResult = await client.query(
      `SELECT s.id, s.name, s.academic_year, s.timezone
       FROM school_memberships sm
       INNER JOIN schools s ON s.id = sm.school_id
       WHERE sm.user_id = $1
         AND sm.status = 'active'
       ORDER BY sm.created_at ASC
       LIMIT 1`,
      [userId]
    );
    if (membershipResult.rows[0]) return membershipResult.rows[0];
  }

  throw badRequest('La institución es obligatoria.');
}

async function ensureWorkspaceContext(client, input = {}) {
  const email = String(input.email || '').trim().toLowerCase();
  const authProviderUid = String(input.authProviderUid || '').trim() || null;
  const displayNameInput = String(input.displayName || '').trim();
  const displayName = displayNameInput || email.split('@')[0] || 'Usuario AulaBase';
  const phoneInput = String(input.phone || '').trim();
  const phone = phoneInput || null;
  const role = String(input.role || '').trim() || 'teacher';

  if (!email) throw badRequest('El correo es obligatorio.');

  const userLookup = input.authUserId
    ? { rows: [{ id: input.authUserId }] }
    : authProviderUid
    ? await client.query(
        `SELECT id
         FROM users
         WHERE auth_provider_uid = $1 OR email = $2
         LIMIT 1`,
        [authProviderUid, email]
      )
    : await client.query(
        `SELECT id
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email]
      );

  let user;
  if (userLookup.rows[0]?.id) {
    const updated = await client.query(
      `UPDATE users
       SET email = $1,
           display_name = COALESCE(NULLIF($2, ''), display_name),
           phone = COALESCE($3, phone),
           auth_provider_uid = COALESCE($4, auth_provider_uid),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, display_name, phone, auth_provider_uid, status`,
      [email, displayNameInput, phone, authProviderUid, userLookup.rows[0].id]
    );
    user = updated.rows[0];
  } else {
    const inserted = await client.query(
      `INSERT INTO users (email, display_name, phone, auth_provider_uid)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, display_name, phone, auth_provider_uid, status`,
      [email, displayName, phone, authProviderUid]
    );
    user = inserted.rows[0];
  }

  const school = await resolveSchoolForUser(client, input, user.id);

  await client.query(
    `INSERT INTO school_memberships (school_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (school_id, user_id) DO UPDATE
     SET role = EXCLUDED.role,
         status = 'active'`,
    [school.id, user.id, role]
  );

  return { user, school };
}

router.get('/:blockKey', async (req, res, next) => {
  try {
    const blockKey = String(req.params?.blockKey || '').trim();
    if (!VALID_BLOCKS.has(blockKey)) throw badRequest('Bloque de estado inválido.');

    const context = await withTransaction((client) => ensureWorkspaceContext(client, {
      ...(req.query || {}),
      authUserId: req.auth.userId,
      email: req.auth.user.email,
      displayName: req.auth.user.display_name,
    }));
    const result = await withTransaction(async (client) => {
      const rowResult = await client.query(
        `SELECT payload, payload_hash, updated_at
         FROM workspace_state_blocks
         WHERE school_id = $1
           AND user_id = $2
           AND block_key = $3
         LIMIT 1`,
        [context.school.id, context.user.id, blockKey]
      );
      return rowResult.rows[0] || null;
    });

    res.json({
      ok: true,
      blockKey,
      payload: result?.payload || null,
      payloadHash: result?.payload_hash || null,
      updatedAt: result?.updated_at || null,
      school: context.school,
      user: context.user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:blockKey', async (req, res, next) => {
  try {
    const blockKey = String(req.params?.blockKey || '').trim();
    if (!VALID_BLOCKS.has(blockKey)) throw badRequest('Bloque de estado inválido.');

    const payload = req.body?.payload;
    const payloadHash = String(req.body?.payloadHash || '').trim() || null;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw badRequest('El payload del bloque es obligatorio.');
    }

    const result = await withTransaction(async (client) => {
      const context = await ensureWorkspaceContext(client, {
        ...(req.body || {}),
        authUserId: req.auth.userId,
        email: req.auth.user.email,
        displayName: req.auth.user.display_name,
      });
      const rowResult = await client.query(
        `INSERT INTO workspace_state_blocks (school_id, user_id, block_key, payload, payload_hash)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         ON CONFLICT (school_id, user_id, block_key) DO UPDATE
         SET payload = EXCLUDED.payload,
             payload_hash = EXCLUDED.payload_hash,
             updated_at = NOW()
         RETURNING id, block_key, updated_at`,
        [context.school.id, context.user.id, blockKey, JSON.stringify(payload), payloadHash]
      );

      return {
        school: context.school,
        user: context.user,
        stateBlock: rowResult.rows[0],
      };
    });

    res.json({
      ok: true,
      blockKey,
      updatedAt: result.stateBlock.updated_at,
      school: result.school,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
