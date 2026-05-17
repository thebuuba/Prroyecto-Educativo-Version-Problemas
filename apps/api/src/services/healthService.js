const healthRepository = require('../repositories/healthRepository');

async function getHealthStatus() {
  const time = await healthRepository.getDatabaseTime();
  return {
    ok: true,
    service: 'aulabase-sql-api',
    database: 'connected',
    time,
  };
}

module.exports = {
  getHealthStatus,
};
