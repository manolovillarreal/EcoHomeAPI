const express = require('express');

const userController = require('../controllers/userController');
const authJWT = require('../middleware/authJWT');

const router = express.Router();

router.get('/me/stats', authJWT, userController.getMyStats);

module.exports = router;
