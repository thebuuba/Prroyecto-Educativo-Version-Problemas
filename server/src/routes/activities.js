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
    const periodId = String(req.query?.periodId || '').trim();
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
    if (periodId) {
      params.push(periodId);
      where.push(`period_id = $${params.length}`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, school_id, section_id, teacher_user_id, period_id, block_key, name, description, points, activity_type, scheduled_date, created_at, updated_at
       FROM activities
       ${clause}
       ORDER BY created_at ASC`,
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
    const sectionId = String(req.body?.sectionId || '').trim();
    const teacherUserId = String(req.body?.teacherUserId || '').trim() || null;
    const periodId = String(req.body?.periodId || 'P1').trim() || 'P1';
    const blockKey = String(req.body?.blockKey || '').trim() || null;
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim() || null;
    const points = Number.isFinite(Number(req.body?.points)) ? Number(req.body.points) : 0;
    const activityType = String(req.body?.activityType || '').trim() || null;
    const scheduledDate = String(req.body?.scheduledDate || '').trim() || null;

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!name) throw badRequest('El nombre de la actividad es obligatorio.');

    const result = await query(
      `INSERT INTO activities (school_id, section_id, teacher_user_id, period_id, block_key, name, description, points, activity_type, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, school_id, section_id, teacher_user_id, period_id, block_key, name, description, points, activity_type, scheduled_date, created_at, updated_at`,
      [schoolId, sectionId, teacherUserId, periodId, blockKey, name, description, points, activityType, scheduledDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const activityId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || '').trim();
    const sectionId = String(req.body?.sectionId || '').trim();
    const teacherUserId = String(req.body?.teacherUserId || '').trim() || null;
    const periodId = String(req.body?.periodId || 'P1').trim() || 'P1';
    const blockKey = String(req.body?.blockKey || '').trim() || null;
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim() || null;
    const points = Number.isFinite(Number(req.body?.points)) ? Number(req.body.points) : 0;
    const activityType = String(req.body?.activityType || '').trim() || null;
    const scheduledDate = String(req.body?.scheduledDate || '').trim() || null;

    if (!activityId) throw badRequest('El id de la actividad es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!name) throw badRequest('El nombre de la actividad es obligatorio.');

    const result = await query(
      `UPDATE activities
       SET section_id = $1,
           teacher_user_id = $2,
           period_id = $3,
           block_key = $4,
           name = $5,
           description = $6,
           points = $7,
           activity_type = $8,
           scheduled_date = $9,
           updated_at = NOW()
       WHERE id = $10 AND school_id = $11
       RETURNING id, school_id, section_id, teacher_user_id, period_id, block_key, name, description, points, activity_type, scheduled_date, created_at, updated_at`,
      [sectionId, teacherUserId, periodId, blockKey, name, description, points, activityType, scheduledDate, activityId, schoolId]
    );

    if (!result.rows[0]) throw badRequest('No se encontró la actividad a actualizar.');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const activityId = String(req.params?.id || '').trim();
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();

    if (!activityId) throw badRequest('El id de la actividad es obligatorio.');
    if (!schoolId) throw badRequest('schoolId es obligatorio.');

    const deleted = await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM evaluations
         WHERE activity_id = $1 AND school_id = $2`,
        [activityId, schoolId]
      );
      const result = await client.query(
        `DELETE FROM activities
         WHERE id = $1 AND school_id = $2
         RETURNING id, school_id, section_id, teacher_user_id, period_id, block_key, name, description, points, activity_type, scheduled_date, created_at, updated_at`,
        [activityId, schoolId]
      );
      return result.rows[0] || null;
    });

    if (!deleted) throw badRequest('No se encontró la actividad a eliminar.');
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
