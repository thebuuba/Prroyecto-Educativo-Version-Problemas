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
    const gradeId = String(req.query?.gradeId || '').trim();
    const params = [];
    const where = [];

    if (schoolId) {
      params.push(schoolId);
      where.push(`school_id = $${params.length}`);
    }
    if (gradeId) {
      params.push(gradeId);
      where.push(`grade_id = $${params.length}`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, school_id, grade_id, name, subject_area, subject_name, teacher_user_id, created_at, updated_at
       FROM sections
       ${clause}
       ORDER BY created_at DESC`,
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
    const gradeId = String(req.body?.gradeId || '').trim();
    const name = String(req.body?.name || '').trim();
    const subjectArea = String(req.body?.subjectArea || '').trim() || null;
    const subjectName = String(req.body?.subjectName || '').trim() || null;
    const teacherUserId = String(req.body?.teacherUserId || '').trim() || null;

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!gradeId) throw badRequest('gradeId es obligatorio.');
    if (!name) throw badRequest('El nombre de la seccion es obligatorio.');

    const result = await query(
      `INSERT INTO sections (school_id, grade_id, name, subject_area, subject_name, teacher_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, school_id, grade_id, name, subject_area, subject_name, teacher_user_id, created_at, updated_at`,
      [schoolId, gradeId, name, subjectArea, subjectName, teacherUserId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const sectionId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || '').trim();
    const gradeId = String(req.body?.gradeId || '').trim();
    const name = String(req.body?.name || '').trim();
    const subjectArea = String(req.body?.subjectArea || '').trim() || null;
    const subjectName = String(req.body?.subjectName || '').trim() || null;
    const teacherUserId = String(req.body?.teacherUserId || '').trim() || null;

    if (!sectionId) throw badRequest('El id de la seccion es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!gradeId) throw badRequest('gradeId es obligatorio.');
    if (!name) throw badRequest('El nombre de la seccion es obligatorio.');

    const result = await query(
      `UPDATE sections
       SET grade_id = $1,
           name = $2,
           subject_area = $3,
           subject_name = $4,
           teacher_user_id = $5,
           updated_at = NOW()
       WHERE id = $6 AND school_id = $7
       RETURNING id, school_id, grade_id, name, subject_area, subject_name, teacher_user_id, created_at, updated_at`,
      [gradeId, name, subjectArea, subjectName, teacherUserId, sectionId, schoolId]
    );

    if (!result.rows[0]) throw badRequest('No se encontró la sección a actualizar.');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const sectionId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();

    if (!sectionId) throw badRequest('El id de la seccion es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');

    const deleted = await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM students
         WHERE section_id = $1 AND school_id = $2`,
        [sectionId, schoolId]
      );
      const result = await client.query(
        `DELETE FROM sections
         WHERE id = $1 AND school_id = $2
         RETURNING id, school_id, grade_id, name, subject_area, subject_name, teacher_user_id, created_at, updated_at`,
        [sectionId, schoolId]
      );
      return result.rows[0] || null;
    });

    if (!deleted) throw badRequest('No se encontró la sección a eliminar.');
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
