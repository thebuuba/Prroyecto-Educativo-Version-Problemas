const express = require('express');
const { query } = require('../db/pool');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.code, s.academic_year, s.timezone, s.created_at, s.updated_at
       FROM schools s
       INNER JOIN school_memberships sm ON sm.school_id = s.id
       WHERE sm.user_id = $1
         AND sm.status = 'active'
       ORDER BY s.created_at DESC`,
      [req.auth.userId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const code = String(req.body?.code || '').trim() || null;
    const academicYear = String(req.body?.academicYear || '').trim() || null;
    const timezone = String(req.body?.timezone || '').trim() || 'America/Santo_Domingo';

    if (!name) throw badRequest('El nombre del centro es obligatorio.');

    const result = await query(
      `INSERT INTO schools (name, code, academic_year, timezone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE
       SET academic_year = COALESCE(EXCLUDED.academic_year, schools.academic_year),
           timezone = EXCLUDED.timezone,
           updated_at = NOW()
       RETURNING id, name, code, academic_year, timezone, created_at, updated_at`,
      [name, code, academicYear, timezone]
    );

    await query(
      `INSERT INTO school_memberships (school_id, user_id, role)
       VALUES ($1, $2, 'teacher')
       ON CONFLICT (school_id, user_id) DO UPDATE
       SET status = 'active'`,
      [result.rows[0].id, req.auth.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
