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
    const sectionId = String(req.query?.sectionId || '').trim();
    const params = [];
    const where = [];

    if (schoolId) {
      params.push(schoolId);
      where.push(`school_id = $${params.length}`);
    }
    if (sectionId) {
      params.push(sectionId);
      where.push(`section_id = $${params.length}`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, school_id, grade_id, section_id, enrollment_code, first_name, last_name, middle_name, birth_date, status, created_at, updated_at
       FROM students
       ${clause}
       ORDER BY last_name ASC, first_name ASC`,
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
    const sectionId = String(req.body?.sectionId || '').trim();
    const enrollmentCode = String(req.body?.enrollmentCode || '').trim() || null;
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const middleName = String(req.body?.middleName || '').trim() || null;
    const birthDate = String(req.body?.birthDate || '').trim() || null;

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!gradeId) throw badRequest('gradeId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!firstName) throw badRequest('El nombre del estudiante es obligatorio.');
    if (!lastName) throw badRequest('El apellido del estudiante es obligatorio.');

    const result = await query(
      `INSERT INTO students (school_id, grade_id, section_id, enrollment_code, first_name, last_name, middle_name, birth_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, school_id, grade_id, section_id, enrollment_code, first_name, last_name, middle_name, birth_date, status, created_at, updated_at`,
      [schoolId, gradeId, sectionId, enrollmentCode, firstName, lastName, middleName, birthDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const studentId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || '').trim();
    const gradeId = String(req.body?.gradeId || '').trim();
    const sectionId = String(req.body?.sectionId || '').trim();
    const enrollmentCode = String(req.body?.enrollmentCode || '').trim() || null;
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const middleName = String(req.body?.middleName || '').trim() || null;
    const birthDate = String(req.body?.birthDate || '').trim() || null;
    const status = String(req.body?.status || 'active').trim() || 'active';

    if (!studentId) throw badRequest('El id del estudiante es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!gradeId) throw badRequest('gradeId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!firstName) throw badRequest('El nombre del estudiante es obligatorio.');
    if (!lastName) throw badRequest('El apellido del estudiante es obligatorio.');

    const result = await query(
      `UPDATE students
       SET grade_id = $1,
           section_id = $2,
           enrollment_code = $3,
           first_name = $4,
           last_name = $5,
           middle_name = $6,
           birth_date = $7,
           status = $8,
           updated_at = NOW()
       WHERE id = $9 AND school_id = $10
       RETURNING id, school_id, grade_id, section_id, enrollment_code, first_name, last_name, middle_name, birth_date, status, created_at, updated_at`,
      [gradeId, sectionId, enrollmentCode, firstName, lastName, middleName, birthDate, status, studentId, schoolId]
    );

    if (!result.rows[0]) throw badRequest('No se encontró el estudiante a actualizar.');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const studentId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();

    if (!studentId) throw badRequest('El id del estudiante es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');

    const deleted = await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM attendance_records
         WHERE student_id = $1 AND school_id = $2`,
        [studentId, schoolId]
      );
      await client.query(
        `DELETE FROM evaluations
         WHERE student_id = $1 AND school_id = $2`,
        [studentId, schoolId]
      );
      const result = await client.query(
        `DELETE FROM students
         WHERE id = $1 AND school_id = $2
         RETURNING id, school_id, grade_id, section_id, enrollment_code, first_name, last_name, middle_name, birth_date, status, created_at, updated_at`,
        [studentId, schoolId]
      );
      return result.rows[0] || null;
    });

    if (!deleted) throw badRequest('No se encontró el estudiante a eliminar.');
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
