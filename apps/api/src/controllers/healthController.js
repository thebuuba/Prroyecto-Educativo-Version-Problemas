const healthService = require('../services/healthService');

async function getHealth(_req, res, next) {
  try {
    const payload = await healthService.getHealthStatus();
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
