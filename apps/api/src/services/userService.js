const userRepository = require('../repositories/userRepository');
const userValidator = require('../validators/userValidator');

async function getCurrentUser(auth) {
  return userRepository.findById(auth.userId);
}

async function updateCurrentUser(auth, body) {
  const profile = userValidator.normalizeProfileUpdate(auth, body);
  return userRepository.updateProfile(auth.userId, profile);
}

module.exports = {
  getCurrentUser,
  updateCurrentUser,
};
