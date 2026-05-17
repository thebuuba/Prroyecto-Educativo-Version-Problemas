const { query, withTransaction } = require('../db/pool');

const SCHOOL_COLUMNS = 'id, name, code, academic_year, timezone, created_at, updated_at';

function getExecutor(client) {
  return client?.query ? client.query.bind(client) : query;
}

async function findActiveByUser(userId, client = null) {
  const execute = getExecutor(client);
  const result = await execute(
    `SELECT s.${SCHOOL_COLUMNS.replaceAll(', ', ', s.')}
     FROM schools s
     INNER JOIN school_memberships sm ON sm.school_id = s.id
     WHERE sm.user_id = $1
       AND sm.status = 'active'
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function upsertSchool(school, client = null) {
  const execute = getExecutor(client);
  const result = await execute(
    `INSERT INTO schools (name, code, academic_year, timezone)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO UPDATE
     SET academic_year = COALESCE(EXCLUDED.academic_year, schools.academic_year),
         timezone = EXCLUDED.timezone,
         updated_at = NOW()
     RETURNING ${SCHOOL_COLUMNS}`,
    [school.name, school.code, school.academicYear, school.timezone]
  );
  return result.rows[0];
}

async function activateTeacherMembership(schoolId, userId, client = null) {
  const execute = getExecutor(client);
  await execute(
    `INSERT INTO school_memberships (school_id, user_id, role)
     VALUES ($1, $2, 'teacher')
     ON CONFLICT (school_id, user_id) DO UPDATE
     SET status = 'active'`,
    [schoolId, userId]
  );
}

async function createWithTeacherMembership(school, userId) {
  return withTransaction(async (client) => {
    const savedSchool = await upsertSchool(school, client);
    await activateTeacherMembership(savedSchool.id, userId, client);
    return savedSchool;
  });
}

module.exports = {
  createWithTeacherMembership,
  findActiveByUser,
};
