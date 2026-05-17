function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeCreateSchoolInput(body = {}) {
  const name = String(body?.name || '').trim();
  const code = String(body?.code || '').trim() || null;
  const academicYear = String(body?.academicYear || '').trim() || null;
  const timezone = String(body?.timezone || '').trim() || 'America/Santo_Domingo';

  if (!name) throw badRequest('El nombre del centro es obligatorio.');

  return {
    name,
    code,
    academicYear,
    timezone,
  };
}

module.exports = {
  normalizeCreateSchoolInput,
};
