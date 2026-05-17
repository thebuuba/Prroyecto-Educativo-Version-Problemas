const { query } = require('../db/pool');

async function getDatabaseTime() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0]?.now || null;
}

module.exports = {
  getDatabaseTime,
};
