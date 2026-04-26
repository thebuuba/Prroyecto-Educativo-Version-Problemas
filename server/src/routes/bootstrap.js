const express = require('express');
const { query, withTransaction } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function resolveSchoolForUser(client, input = {}, userId) {
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

  const explicitSchoolId = String(input.schoolId || '').trim();
  if (explicitSchoolId) {
    const schoolById = await client.query(
      `SELECT id, name, academic_year, timezone
       FROM schools
       WHERE id = $1
       LIMIT 1`,
      [explicitSchoolId]
    );
    if (schoolById.rows[0]) return schoolById.rows[0];
  }

  const schoolName = String(input.schoolName || '').trim();
  if (!schoolName) throw badRequest('La institución es obligatoria.');

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

router.post('/profile', requireAuth, async (req, res, next) => {
  try {
    const email = String(req.auth?.user?.email || req.body?.email || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || req.auth?.user?.display_name || '').trim();
    const phone = String(req.body?.phone || '').trim() || null;
    const firebaseUid = String(req.body?.firebaseUid || '').trim() || null;
    const role = String(req.body?.role || '').trim() || 'teacher';

    if (!email) throw badRequest('El correo es obligatorio.');
    if (!displayName) throw badRequest('El nombre es obligatorio.');

    const result = await withTransaction(async (client) => {
      const userLookup = req.auth?.userId
        ? { rows: [{ id: req.auth.userId }] }
        : firebaseUid
        ? await client.query(
            `SELECT id FROM users WHERE firebase_uid = $1 OR email = $2 LIMIT 1`,
            [firebaseUid, email]
          )
        : await client.query(
            `SELECT id FROM users WHERE email = $1 LIMIT 1`,
            [email]
          );

      let user;
      if (userLookup.rows[0]?.id) {
        const updated = await client.query(
          `UPDATE users
           SET email = $1,
               display_name = $2,
               phone = $3,
               firebase_uid = COALESCE($4, firebase_uid),
               updated_at = NOW()
           WHERE id = $5
           RETURNING id, email, display_name, phone, firebase_uid, status`,
          [email, displayName, phone, firebaseUid, userLookup.rows[0].id]
        );
        user = updated.rows[0];
      } else {
        const inserted = await client.query(
          `INSERT INTO users (email, display_name, phone, firebase_uid)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, display_name, phone, firebase_uid, status`,
          [email, displayName, phone, firebaseUid]
        );
        user = inserted.rows[0];
      }

      const school = await resolveSchoolForUser(client, req.body || {}, user.id);

      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, institution_name, teacher_role, academic_year, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             institution_name = COALESCE(EXCLUDED.institution_name, user_profiles.institution_name),
             teacher_role = EXCLUDED.teacher_role,
             academic_year = COALESCE(EXCLUDED.academic_year, user_profiles.academic_year),
             phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
             updated_at = NOW()`,
        [user.id, displayName, school.name, role, String(req.body?.academicYear || '').trim() || null, phone]
      );
      await client.query(
        `INSERT INTO user_settings (user_id, timezone)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE
         SET timezone = EXCLUDED.timezone,
             updated_at = NOW()`,
        [user.id, String(req.body?.timezone || '').trim() || 'America/Santo_Domingo']
      );

      await client.query(
        `INSERT INTO school_memberships (school_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (school_id, user_id) DO UPDATE
         SET role = EXCLUDED.role,
             status = 'active'`,
        [school.id, user.id, role]
      );

      return { user, school };
    });

    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/catalog', async (_req, res, next) => {
  try {
    const schools = await query(
      `SELECT id, name, academic_year, timezone
       FROM schools
       ORDER BY name ASC`
    );
    res.json({
      ok: true,
      schools: schools.rows,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
