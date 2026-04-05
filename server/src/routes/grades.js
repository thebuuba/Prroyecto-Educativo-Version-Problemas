const express = require('express');
const { query, withTransaction } = require('../db/pool');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

router.get('/', async (req, res, next) => {
  try {
    const schoolId = String(req.query?.schoolId || '').trim();
    const params = [];
    let where = '';

    if (schoolId) {
      params.push(schoolId);
      where = 'WHERE school_id = $1';
    }

    const result = await query(
      `SELECT id, school_id, education_level, name, ordinal, created_at, updated_at
       FROM grades
       ${where}
       ORDER BY education_level ASC, ordinal ASC NULLS LAST, name ASC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const schoolId = String(req.body?.schoolId || '').trim();
    const educationLevel = String(req.body?.educationLevel || '').trim();
    const name = String(req.body?.name || '').trim();
    const ordinal = Number.isFinite(Number(req.body?.ordinal)) ? Number(req.body.ordinal) : null;

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!educationLevel) throw badRequest('educationLevel es obligatorio.');
    if (!name) throw badRequest('El nombre del grado es obligatorio.');

    const result = await query(
      `INSERT INTO grades (school_id, education_level, name, ordinal)
       VALUES ($1, $2, $3, $4)
       RETURNING id, school_id, education_level, name, ordinal, created_at, updated_at`,
      [schoolId, educationLevel, name, ordinal]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const gradeId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || '').trim();
    const educationLevel = String(req.body?.educationLevel || '').trim();
    const name = String(req.body?.name || '').trim();
    const ordinal = Number.isFinite(Number(req.body?.ordinal)) ? Number(req.body.ordinal) : null;

    if (!gradeId) throw badRequest('El id del grado es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!educationLevel) throw badRequest('educationLevel es obligatorio.');
    if (!name) throw badRequest('El nombre del grado es obligatorio.');

    const result = await query(
      `UPDATE grades
       SET education_level = $1,
           name = $2,
           ordinal = $3,
           updated_at = NOW()
       WHERE id = $4 AND school_id = $5
       RETURNING id, school_id, education_level, name, ordinal, created_at, updated_at`,
      [educationLevel, name, ordinal, gradeId, schoolId]
    );

    if (!result.rows[0]) throw badRequest('No se encontró el grado a actualizar.');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const gradeId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();

    if (!gradeId) throw badRequest('El id del grado es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');

    const deleted = await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM students
         WHERE grade_id = $1 AND school_id = $2`,
        [gradeId, schoolId]
      );
      const result = await client.query(
        `DELETE FROM grades
         WHERE id = $1 AND school_id = $2
         RETURNING id, school_id, education_level, name, ordinal, created_at, updated_at`,
        [gradeId, schoolId]
      );
      return result.rows[0] || null;
    });

    if (!deleted) throw badRequest('No se encontró el grado a eliminar.');
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
