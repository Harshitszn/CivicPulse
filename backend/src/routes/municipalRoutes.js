/**
 * Admin / Municipal Command Center routes
 * All routes require official, staff, or admin role.
 */
const express = require('express');
const router = express.Router();
const mc = require('../controllers/municipalController');
const { authenticate, requireRole } = require('../middleware/auth');

const isAdmin = [authenticate, requireRole('official', 'staff', 'admin')];

// Dashboard overview (KPIs + charts + recent activity)
router.get('/dashboard', isAdmin, mc.getDashboard);

// Complaint management (list with full filters)
router.get('/complaints', isAdmin, mc.getAdminComplaints);

// Single complaint detail (includes history, comments, verification)
router.get('/complaints/:id', isAdmin, mc.getAdminComplaint);

// Update complaint status (staff/admin action)
router.patch('/complaints/:id/status', isAdmin, mc.updateAdminComplaintStatus);

// Analytics (charts for the Analytics page)
router.get('/analytics', isAdmin, mc.getAnalytics);

// Registered citizens with complaint counts
router.get('/citizens', isAdmin, mc.getCitizens);

// Legacy endpoints kept for backward compat — still require authentication
router.get('/stats', isAdmin, mc.getDashboardStats);
router.get('/wards', isAdmin, mc.getWards);

module.exports = router;
