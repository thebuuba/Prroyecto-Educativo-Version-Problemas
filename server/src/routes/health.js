const express = require('express');
const { query } = require('../db/pool');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT NOW() AS now');
    res.json({
      ok: true,
      service: 'aulabase-sql-api',
      database: 'connected',
      time: result.rows[0]?.now || null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
