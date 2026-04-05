const express = require('express');
const { query, withTransaction } = require('../db/pool');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

router.post('/profile', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || '').trim();
    const phone = String(req.body?.phone || '').trim() || null;
    const firebaseUid = String(req.body?.firebaseUid || '').trim() || null;
    const schoolName = String(req.body?.schoolName || '').trim();
    const academicYear = String(req.body?.academicYear || '').trim() || null;
    const timezone = String(req.body?.timezone || '').trim() || 'America/Santo_Domingo';
    const role = String(req.body?.role || '').trim() || 'teacher';

    if (!email) throw badRequest('El correo es obligatorio.');
    if (!displayName) throw badRequest('El nombre es obligatorio.');
    if (!schoolName) throw badRequest('La institución es obligatoria.');

    const result = await withTransaction(async (client) => {
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

      const school = schoolResult.rows[0];

      const userLookup = firebaseUid
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
