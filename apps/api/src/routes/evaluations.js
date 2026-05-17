const express = require('express');
const { query, withTransaction } = require('../db/pool');
const { requireSchoolAccess } = require('../middleware/auth');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizePayload(value) {
  if (!value || typeof value !== 'object') return {};
  return JSON.parse(JSON.stringify(value));
}

function serializePayload(value) {
  return JSON.stringify(normalizePayload(value));
}

router.get('/', async (req, res, next) => {
  try {
    const schoolId = String(req.query?.schoolId || '').trim();
    const sectionId = String(req.query?.sectionId || '').trim();
    const periodId = String(req.query?.periodId || '').trim();
    const activityId = String(req.query?.activityId || '').trim();
    const studentId = String(req.query?.studentId || '').trim();
    const params = [];
    const where = [];

    await requireSchoolAccess(req, schoolId);
    params.push(schoolId);
    where.push(`school_id = $${params.length}`);
    if (sectionId) {
      params.push(sectionId);
      where.push(`section_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      where.push(`period_id = $${params.length}`);
    }
    if (activityId) {
      params.push(activityId);
      where.push(`activity_id = $${params.length}`);
    }
    if (studentId) {
      params.push(studentId);
      where.push(`student_id = $${params.length}`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    params.push(req.auth.userId);

    const result = await query(
      `SELECT id, school_id, section_id, activity_id, student_id, period_id, score, score_percent, notes, payload, evaluated_at, created_at, updated_at
       FROM evaluations
       ${clause} AND (owner_user_id = $${params.length} OR owner_user_id IS NULL)
       ORDER BY evaluated_at ASC, created_at ASC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [req.body || {}];
    const result = await withTransaction(async (client) => {
      const upserted = [];
      for (const row of rows) {
        const schoolId = String(row?.schoolId || '').trim();
        const sectionId = String(row?.sectionId || '').trim();
        const activityId = String(row?.activityId || '').trim();
        const studentId = String(row?.studentId || '').trim();
        const periodId = String(row?.periodId || 'P1').trim() || 'P1';
        const score = Number.isFinite(Number(row?.score)) ? Number(row.score) : 0;
        const scorePercent = row?.scorePercent === null || row?.scorePercent === undefined || row?.scorePercent === ''
          ? null
          : Number.isFinite(Number(row.scorePercent))
            ? Number(row.scorePercent)
            : null;
        const notes = String(row?.notes || '').trim() || null;
        const payload = serializePayload(row?.payload || row || {});
        const evaluatedAt = String(row?.evaluatedAt || row?.timestamp || '').trim() || null;

        if (!schoolId) throw badRequest('schoolId es obligatorio.');
        await requireSchoolAccess(req, schoolId);
        if (!sectionId) throw badRequest('sectionId es obligatorio.');
        if (!activityId) throw badRequest('activityId es obligatorio.');
        if (!studentId) throw badRequest('studentId es obligatorio.');

        await client.query(
          `INSERT INTO evaluations (
             school_id, section_id, activity_id, student_id, period_id,
             score, score_percent, notes, payload, evaluated_at, owner_user_id
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, COALESCE($10::timestamptz, NOW()), $11)
           ON CONFLICT (activity_id, student_id, period_id)
           DO UPDATE SET
             school_id = EXCLUDED.school_id,
             section_id = EXCLUDED.section_id,
             owner_user_id = EXCLUDED.owner_user_id,
             score = EXCLUDED.score,
             score_percent = EXCLUDED.score_percent,
             notes = EXCLUDED.notes,
             payload = EXCLUDED.payload,
             evaluated_at = EXCLUDED.evaluated_at,
             updated_at = NOW()
           RETURNING id, school_id, section_id, activity_id, student_id, period_id, score, score_percent, notes, payload, evaluated_at, created_at, updated_at`,
          [schoolId, sectionId, activityId, studentId, periodId, score, scorePercent, notes, payload, evaluatedAt, req.auth.userId]
        ).then((queryResult) => {
          if (queryResult.rows[0]) upserted.push(queryResult.rows[0]);
        });
      }
      return upserted;
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();
    const sectionId = String(req.body?.sectionId || req.query?.sectionId || '').trim();
    const periodId = String(req.body?.periodId || req.query?.periodId || '').trim();
    const activityId = String(req.body?.activityId || req.query?.activityId || '').trim();
    const studentId = String(req.body?.studentId || req.query?.studentId || '').trim();
    const params = [];
    const where = [];

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    await requireSchoolAccess(req, schoolId);

    params.push(schoolId);
    where.push(`school_id = $${params.length}`);
    params.push(req.auth.userId);
    where.push(`(owner_user_id = $${params.length} OR owner_user_id IS NULL)`);

    if (sectionId) {
      params.push(sectionId);
      where.push(`section_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      where.push(`period_id = $${params.length}`);
    }
    if (activityId) {
      params.push(activityId);
      where.push(`activity_id = $${params.length}`);
    }
    if (studentId) {
      params.push(studentId);
      where.push(`student_id = $${params.length}`);
    }

    const result = await query(
      `DELETE FROM evaluations
       WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      ok: true,
      deletedCount: result.rowCount || 0,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
