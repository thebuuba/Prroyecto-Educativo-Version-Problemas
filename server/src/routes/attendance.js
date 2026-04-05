const express = require('express');
const { query, withTransaction } = require('../db/pool');

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeMonthKey(monthKey) {
  return String(monthKey || '').trim();
}

function monthBounds(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
  const [year, month] = monthKey.split('-').map((value) => Number.parseInt(value, 10));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { start: formatDate(start), end: formatDate(end) };
}

router.get('/', async (req, res, next) => {
  try {
    const schoolId = String(req.query?.schoolId || '').trim();
    const sectionId = String(req.query?.sectionId || '').trim();
    const monthKey = String(req.query?.monthKey || '').trim();
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
    if (monthKey && /^\d{4}-\d{2}$/.test(monthKey)) {
      const [year, month] = monthKey.split('-').map((value) => Number.parseInt(value, 10));
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      params.push(formatDate(start));
      params.push(formatDate(end));
      where.push(`attendance_date >= $${params.length - 1}::date AND attendance_date < $${params.length}::date`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, school_id, section_id, student_id, attendance_date, status, reason, created_at, updated_at
       FROM attendance_records
       ${clause}
       ORDER BY attendance_date ASC, student_id ASC`,
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
    const monthKey = normalizeMonthKey(req.body?.monthKey || '');
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const bounds = monthBounds(monthKey);

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!bounds) throw badRequest('monthKey debe tener el formato YYYY-MM.');

    const cleanedRows = rows
      .map((row) => {
        const studentId = String(row?.studentId || '').trim();
        const attendanceDate = String(row?.attendanceDate || '').trim().slice(0, 10);
        const status = String(row?.status || '').trim().toUpperCase();
        const reason = String(row?.reason || '').trim() || null;
        if (!studentId || !attendanceDate || !status) return null;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) return null;
        return { studentId, attendanceDate, status, reason };
      })
      .filter(Boolean);

    const result = await withTransaction(async (client) => {
      const deleteResult = await client.query(
        `DELETE FROM attendance_records
         WHERE school_id = $1
           AND section_id = $2
           AND attendance_date >= $3::date
           AND attendance_date < $4::date`,
        [schoolId, sectionId, bounds.start, bounds.end]
      );

      let inserted = 0;
      for (const row of cleanedRows) {
        await client.query(
          `INSERT INTO attendance_records (school_id, section_id, student_id, attendance_date, status, reason)
           VALUES ($1, $2, $3, $4::date, $5, $6)
           ON CONFLICT (student_id, attendance_date)
           DO UPDATE SET
             school_id = EXCLUDED.school_id,
             section_id = EXCLUDED.section_id,
             status = EXCLUDED.status,
             reason = EXCLUDED.reason,
             updated_at = NOW()`,
          [schoolId, sectionId, row.studentId, row.attendanceDate, row.status, row.reason]
        );
        inserted += 1;
      }

      return {
        deletedCount: deleteResult.rowCount || 0,
        insertedCount: inserted,
      };
    });

    res.json({
      ok: true,
      schoolId,
      sectionId,
      monthKey,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const schoolId = String(req.body?.schoolId || req.query?.schoolId || '').trim();
    const sectionId = String(req.body?.sectionId || req.query?.sectionId || '').trim();
    const monthKey = normalizeMonthKey(req.body?.monthKey || req.query?.monthKey || '');
    const bounds = monthBounds(monthKey);

    if (!schoolId) throw badRequest('schoolId es obligatorio.');
    if (!sectionId) throw badRequest('sectionId es obligatorio.');
    if (!bounds) throw badRequest('monthKey debe tener el formato YYYY-MM.');

    const result = await query(
      `DELETE FROM attendance_records
       WHERE school_id = $1
         AND section_id = $2
         AND attendance_date >= $3::date
         AND attendance_date < $4::date`,
      [schoolId, sectionId, bounds.start, bounds.end]
    );

    res.json({
      ok: true,
      schoolId,
      sectionId,
      monthKey,
      deletedCount: result.rowCount || 0,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
