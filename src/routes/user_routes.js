'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

// Metodo para validar usuario en proceso
router.post('/user/in-process/validate', userController.user);

module.exports = router;
