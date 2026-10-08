/**
 * Insights Routes
 * Public analytics and transparency endpoints for citizens and community exploration.
 */
const express = require('express');
const router = express.Router();
const ic = require('../controllers/insightsController');

// Overview tab: dynamic KPIs, top priorities, needs attention, CivicPulse Score
router.get('/overview', ic.getOverview);

// Civic Record tab: 2022–2026 complaint totals, resolution rates, SLA times, pending vs resolved
router.get('/record', ic.getCivicRecord);

// Services tab: Roads, Garbage, Water, Drainage, Street Lighting dynamic calculations
router.get('/services', ic.getServices);

// Root insights endpoint: returns all three or overview
router.get('/', ic.getAllInsights);

module.exports = router;
