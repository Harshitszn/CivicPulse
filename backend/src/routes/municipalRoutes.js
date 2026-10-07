/**
 * Municipal dashboard routes
 */
const express = require('express');
const router = express.Router();
const municipalController = require('../controllers/municipalController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', municipalController.getDashboardStats);
router.get('/wards', municipalController.getWards);

module.exports = router;
