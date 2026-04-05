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
      `SELECT id, email, display_name, phone, firebase_uid, status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || '').trim();
    const phone = String(req.body?.phone || '').trim() || null;
    const firebaseUid = String(req.body?.firebaseUid || '').trim() || null;

    if (!email) throw badRequest('El correo es obligatorio.');
    if (!displayName) throw badRequest('El nombre es obligatorio.');

    const result = await query(
      `INSERT INTO users (email, display_name, phone, firebase_uid)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, display_name, phone, firebase_uid, status, created_at, updated_at`,
      [email, displayName, phone, firebaseUid]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
