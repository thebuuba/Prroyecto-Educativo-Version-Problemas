function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeProfileUpdate(auth, body = {}) {
  const email = String(auth?.user?.email || body?.email || '').trim().toLowerCase();
  const displayName = String(body?.displayName || '').trim();
  const phone = String(body?.phone || '').trim() || null;
  const authProviderUid = String(body?.authProviderUid || '').trim() || null;

  if (!email) throw badRequest('El correo es obligatorio.');
  if (!displayName) throw badRequest('El nombre es obligatorio.');

  return {
    email,
    displayName,
    phone,
    authProviderUid,
  };
}

module.exports = {
  normalizeProfileUpdate,
};
