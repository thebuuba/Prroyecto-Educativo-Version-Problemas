const schoolRepository = require('../repositories/schoolRepository');
const schoolValidator = require('../validators/schoolValidator');

async function listCurrentUserSchools(auth) {
  return schoolRepository.findActiveByUser(auth.userId);
}

async function createCurrentUserSchool(auth, body) {
  const school = schoolValidator.normalizeCreateSchoolInput(body);
  return schoolRepository.createWithTeacherMembership(school, auth.userId);
}

module.exports = {
  createCurrentUserSchool,
  listCurrentUserSchools,
};
