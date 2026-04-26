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
      `SELECT id, email, display_name, phone, firebase_uid, status, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.auth.userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const email = String(req.auth?.user?.email || req.body?.email || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || '').trim();
    const phone = String(req.body?.phone || '').trim() || null;
    const firebaseUid = String(req.body?.firebaseUid || '').trim() || null;

    if (!email) throw badRequest('El correo es obligatorio.');
    if (!displayName) throw badRequest('El nombre es obligatorio.');

    const result = await query(
      `UPDATE users
       SET email = $1,
           display_name = $2,
           phone = $3,
           firebase_uid = COALESCE($4, firebase_uid),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, display_name, phone, firebase_uid, status, created_at, updated_at`,
      [email, displayName, phone, firebaseUid, req.auth.userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
