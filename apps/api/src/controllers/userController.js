const userService = require('../services/userService');

async function getCurrentUser(req, res, next) {
  try {
    const user = await userService.getCurrentUser(req.auth);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const user = await userService.updateCurrentUser(req.auth, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentUser,
  updateCurrentUser,
};
