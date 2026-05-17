const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getCurrentUser);
router.post('/', userController.updateCurrentUser);

module.exports = router;
