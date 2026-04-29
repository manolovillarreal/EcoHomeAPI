const express = require('express');

const userController = require('../controllers/userController');
const authJWT = require('../middleware/authJWT');
const authorize = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/me/stats', authJWT, authorize(['admin', 'staff']), userController.getMyStats);

module.exports = router;
