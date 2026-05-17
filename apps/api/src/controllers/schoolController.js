const schoolService = require('../services/schoolService');

async function listSchools(req, res, next) {
  try {
    const schools = await schoolService.listCurrentUserSchools(req.auth);
    res.json(schools);
  } catch (error) {
    next(error);
  }
}

async function createSchool(req, res, next) {
  try {
    const school = await schoolService.createCurrentUserSchool(req.auth, req.body);
    res.status(201).json(school);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSchool,
  listSchools,
};
