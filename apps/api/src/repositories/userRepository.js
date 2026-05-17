const { query } = require('../db/pool');

const USER_COLUMNS = 'id, email, display_name, phone, auth_provider_uid, status, created_at, updated_at';

async function findById(userId) {
  const result = await query(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function updateProfile(userId, profile) {
  const result = await query(
    `UPDATE users
     SET email = $1,
         display_name = $2,
         phone = $3,
         auth_provider_uid = COALESCE($4, auth_provider_uid),
         updated_at = NOW()
     WHERE id = $5
     RETURNING ${USER_COLUMNS}`,
    [profile.email, profile.displayName, profile.phone, profile.authProviderUid, userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findById,
  updateProfile,
};
