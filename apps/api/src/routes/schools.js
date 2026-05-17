const express = require('express');
const schoolController = require('../controllers/schoolController');

const router = express.Router();

router.get('/', schoolController.listSchools);
router.post('/', schoolController.createSchool);

module.exports = router;
