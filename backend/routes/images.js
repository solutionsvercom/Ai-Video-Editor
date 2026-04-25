const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const imagesController = require('../controllers/imagesController');

router.post('/generate', authMiddleware, imagesController.generate);

module.exports = router;
