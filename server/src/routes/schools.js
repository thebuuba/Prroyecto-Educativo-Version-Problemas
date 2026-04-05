const express = require('express');
const { query } = require('../db/pool');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, code, academic_year, timezone, created_at, updated_at
       FROM schools
       ORDER BY created_at DESC`
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
       RETURNING id, name, code, academic_year, timezone, created_at, updated_at`,
      [name, code, academicYear, timezone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
