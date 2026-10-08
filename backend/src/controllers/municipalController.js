/**
 * Admin Controller — Municipal Command Center
 * All endpoints require official/staff/admin role (enforced via requireRole middleware).
 */
const { db } = require('../config/database');
const ComplaintModel = require('../models/Complaint');
const ComplaintService = require('../services/complaintService');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// ── Palette for charts (consistent order) ─────────────────────────────────────
const CAT_PALETTE = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF', '#64748B', '#0EA5E9', '#8B5CF6'];

// Helper to normalise status strings from DB for display
function normaliseStatus(s) {
  if (!s) return 'Reported';
  const m = {
    reported: 'Reported', open: 'Reported', REPORTED: 'Reported',
    verified: 'Verified', VERIFIED: 'Verified',
    assigned: 'Assigned', ASSIGNED: 'Assigned',
    in_progress: 'In Progress', IN_PROGRESS: 'In Progress',
    resolved: 'Resolved', RESOLVED: 'Resolved',
    reopened: 'Reopened', REOPENED: 'Reopened',
  };
  return m[s] || s;
}

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const { pincode } = req.query;

    let base = db('complaints');
    if (pincode && pincode !== 'all') base = base.where({ pincode });

    // KPI counts
    const [total, highPriority, flagged, avgResRow] = await Promise.all([
      base.clone().count('id as count').first(),
      base.clone().whereIn('priority', ['high', 'urgent', 'HIGH', 'URGENT']).count('id as count').first(),
      base.clone().where({ flagged_for_review: true }).count('id as count').first(),
      // Avg resolution time in hours for resolved complaints
      db.raw(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours
        FROM complaints
        WHERE resolved_at IS NOT NULL
        ${pincode && pincode !== 'all' ? 'AND pincode = :pincode' : ''}
      `, { pincode }),
    ]);

    // Status breakdown
    const statusRows = await base.clone()
      .select('status')
      .count('id as count')
      .groupBy('status');

    const statusCounts = {
      total: parseInt(total?.count || 0, 10),
      reported: 0, verified: 0, assigned: 0,
      in_progress: 0, resolved: 0, reopened: 0,
    };
    for (const r of statusRows) {
      const cnt = parseInt(r.count, 10);
      const s = (r.status || '').toUpperCase();
      if (['REPORTED', 'OPEN'].includes(s)) statusCounts.reported += cnt;
      else if (s === 'VERIFIED') statusCounts.verified += cnt;
      else if (s === 'ASSIGNED') statusCounts.assigned += cnt;
      else if (s === 'IN_PROGRESS') statusCounts.in_progress += cnt;
      else if (s === 'RESOLVED') statusCounts.resolved += cnt;
      else if (s === 'REOPENED') statusCounts.reopened += cnt;
      else statusCounts.reported += cnt;
    }

    const pending = statusCounts.reported + statusCounts.verified + statusCounts.assigned;
    const resolutionRate = statusCounts.total > 0
      ? Math.round((statusCounts.resolved / statusCounts.total) * 100)
      : 0;

    // Category breakdown
    const categoryRows = await base.clone()
      .select('category')
      .count('id as count')
      .groupBy('category')
      .orderBy('count', 'desc');

    const categoryBreakdown = categoryRows.map((r, idx) => ({
      name: r.category || 'General',
      value: parseInt(r.count, 10),
      color: CAT_PALETTE[idx % CAT_PALETTE.length],
    }));

    // Pincode breakdown (top 10)
    const pincodeRows = await base.clone()
      .select('pincode')
      .count('id as count')
      .groupBy('pincode')
      .orderBy('count', 'desc')
      .limit(10);

    const pincodeBreakdown = pincodeRows.map(r => ({
      pincode: `📍 ${r.pincode}`,
      count: parseInt(r.count, 10),
    }));

    // Status chart data
    const statusChartData = [
      { name: 'Reported', count: statusCounts.reported, fill: '#93C5FD' },
      { name: 'Verified', count: statusCounts.verified, fill: '#60A5FA' },
      { name: 'Assigned', count: statusCounts.assigned, fill: '#3B82F6' },
      { name: 'In Progress', count: statusCounts.in_progress, fill: '#2563EB' },
      { name: 'Resolved', count: statusCounts.resolved, fill: '#10B981' },
      { name: 'Reopened', count: statusCounts.reopened, fill: '#F59E0B' },
    ].filter(d => d.count > 0);

    // Priority breakdown
    const priorityRows = await base.clone()
      .select('priority')
      .count('id as count')
      .groupBy('priority');

    const priorityCounts = { urgent: 0, high: 0, medium: 0, low: 0 };
    for (const r of priorityRows) {
      const p = (r.priority || 'medium').toLowerCase();
      if (p === 'urgent' || p === 'critical') priorityCounts.urgent += parseInt(r.count, 10);
      else if (p === 'high') priorityCounts.high += parseInt(r.count, 10);
      else if (p === 'low') priorityCounts.low += parseInt(r.count, 10);
      else priorityCounts.medium += parseInt(r.count, 10);
    }

    const priorityData = [
      { name: 'Urgent', count: priorityCounts.urgent, fill: '#EF4444' },
      { name: 'High', count: priorityCounts.high, fill: '#F97316' },
      { name: 'Medium', count: priorityCounts.medium, fill: '#3B82F6' },
      { name: 'Low', count: priorityCounts.low, fill: '#10B981' },
    ];

    // Recent 8 complaints for activity feed
    const recentComplaints = await base.clone()
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .select(
        'complaints.id', 'complaints.title', 'complaints.category',
        'complaints.status', 'complaints.priority', 'complaints.pincode',
        'complaints.assigned_department', 'complaints.upvotes_count',
        'complaints.downvotes_count', 'complaints.flagged_for_review',
        'complaints.created_at', 'users.full_name as author_name'
      )
      .orderBy('complaints.created_at', 'desc')
      .limit(8);

    // Top flagged complaints
    const flaggedComplaints = await base.clone()
      .where({ flagged_for_review: true })
      .select('id', 'title', 'status', 'priority', 'pincode', 'dispute_count', 'flagged_at', 'created_at')
      .orderBy('dispute_count', 'desc')
      .limit(5);

    const avgHours = parseFloat(avgResRow.rows?.[0]?.avg_hours || 0);
    const avgResolutionLabel = avgHours > 0
      ? (avgHours < 24 ? `${Math.round(avgHours)}h` : `${Math.round(avgHours / 24)}d`)
      : 'N/A';

    return ApiResponse.ok(res, {
      kpi: {
        total: statusCounts.total,
        pending,
        in_progress: statusCounts.in_progress,
        resolved: statusCounts.resolved,
        high_priority: parseInt(highPriority?.count || 0, 10),
        flagged_for_review: parseInt(flagged?.count || 0, 10),
        resolution_rate: resolutionRate,
        avg_resolution_hours: Math.round(avgHours),
        avg_resolution_label: avgResolutionLabel,
      },
      charts: {
        byCategory: categoryBreakdown,
        byStatus: statusChartData,
        byPincode: pincodeBreakdown,
        byPriority: priorityData,
      },
      recentComplaints: recentComplaints.map(r => ({
        ...r,
        _id: r.id,
        department: r.assigned_department,
        net_score: (r.upvotes_count || 0) - (r.downvotes_count || 0),
      })),
      flaggedComplaints,
    }, 'Dashboard data retrieved');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/complaints ─────────────────────────────────────────────────
const getAdminComplaints = async (req, res, next) => {
  try {
    const {
      pincode, category, status, priority,
      sort = 'new', page = 1, limit = 25,
      search, flagged,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * limitNum;

    let query = db('complaints')
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .select(
        'complaints.*',
        'users.full_name as author_name',
        'users.email as author_email'
      );

    if (pincode && pincode !== 'all') query.where('complaints.pincode', pincode);
    if (status && status !== 'all') query.whereILike('complaints.status', status);
    if (priority && priority !== 'all') query.whereILike('complaints.priority', priority);
    if (category && category !== 'all') query.whereILike('complaints.category', `%${category}%`);
    if (flagged === 'true') query.where('complaints.flagged_for_review', true);
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      query.where(b => b.whereILike('complaints.title', term).orWhereILike('complaints.description', term));
    }

    const s = (sort || 'new').toLowerCase();
    if (s === 'top') query.orderByRaw('(COALESCE(complaints.upvotes_count,0) - COALESCE(complaints.downvotes_count,0)) DESC, complaints.created_at DESC');
    else if (s === 'urgent') query.orderByRaw(`CASE LOWER(complaints.priority) WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC, complaints.created_at DESC`);
    else query.orderBy('complaints.created_at', 'desc');

    const countQuery = db('complaints');
    if (pincode && pincode !== 'all') countQuery.where({ pincode });
    if (status && status !== 'all') countQuery.whereILike('status', status);
    if (priority && priority !== 'all') countQuery.whereILike('priority', priority);
    if (category && category !== 'all') countQuery.whereILike('category', `%${category}%`);
    if (flagged === 'true') countQuery.where({ flagged_for_review: true });
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      countQuery.where(b => b.whereILike('title', term).orWhereILike('description', term));
    }
    const totalRow = await countQuery.count('id as count').first();
    const total = parseInt(totalRow?.count || 0, 10);

    const rows = await query.limit(limitNum).offset(offset);
    const complaints = rows.map(row => ({
      ...ComplaintModel.formatRow(row),
      author_name: row.author_name,
      author_email: row.author_email,
    }));

    const totalPages = Math.ceil(total / limitNum);
    return ApiResponse.paginated(res, complaints, {
      page: pageNum, limit: limitNum, total,
      totalPages, hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
    }, 'Admin complaints retrieved');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/complaints/:id ─────────────────────────────────────────────
const getAdminComplaint = async (req, res, next) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) throw ApiError.notFound('Complaint not found');

    // Fetch status history
    const history = await db('complaint_status_history')
      .leftJoin('users', 'complaint_status_history.changed_by_user_id', '=', 'users.id')
      .where('complaint_status_history.complaint_id', req.params.id)
      .select('complaint_status_history.*', 'users.full_name as changed_by_name', 'users.role as changed_by_role')
      .orderBy('complaint_status_history.created_at', 'asc');

    // Fetch comments
    const comments = await db('comments')
      .leftJoin('users', 'comments.user_id', '=', 'users.id')
      .where('comments.complaint_id', req.params.id)
      .select('comments.*', 'users.full_name as author_name', 'users.role as author_role')
      .orderBy('comments.created_at', 'asc')
      .catch(() => []);

    // Fetch verification aggregates
    const verRows = await db('resolution_verifications')
      .where({ complaint_id: req.params.id })
      .select('is_confirmed_resolved')
      .count('id as count')
      .groupBy('is_confirmed_resolved');

    let verConfirmed = 0, verDisputed = 0;
    for (const r of verRows) {
      const cnt = parseInt(r.count, 10);
      if (r.is_confirmed_resolved) verConfirmed = cnt;
      else verDisputed = cnt;
    }

    return ApiResponse.ok(res, {
      complaint,
      statusHistory: history,
      comments: comments.map(c => ({
        ...c,
        author: { name: c.author_name || 'Resident', role: c.author_role, isOfficial: c.is_official },
      })),
      verification: { confirmed: verConfirmed, disputed: verDisputed, total: verConfirmed + verDisputed },
    }, 'Complaint detail retrieved');
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/complaints/:id/status ────────────────────────────────────
const updateAdminComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, assigned_department } = req.body;

    const VALID_STATUSES = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'];
    if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
      throw ApiError.badRequest(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const existing = await ComplaintModel.findById(id);
    if (!existing) throw ApiError.notFound('Complaint not found');

    const updates = {
      status: status.toUpperCase(),
      updated_at: db.fn.now(),
    };
    if (status.toUpperCase() === 'RESOLVED') updates.resolved_at = db.fn.now();
    if (assigned_department) updates.assigned_department = assigned_department;

    await db('complaints').where({ id }).update(updates);

    await db('complaint_status_history').insert({
      complaint_id: id,
      changed_by_user_id: req.user.id,
      from_status: existing.status,
      to_status: status.toUpperCase(),
      notes: notes?.trim() || `Status updated to ${status.toUpperCase()} by ${req.user.full_name || 'official'}`,
    });

    const updated = await ComplaintModel.findById(id);
    return ApiResponse.ok(res, { complaint: updated }, 'Status updated successfully');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    let base = db('complaints');
    if (pincode && pincode !== 'all') base = base.where({ pincode });

    // All breakdown queries in parallel
    const [catRows, pincodeRows, statusRows, priorityRows, deptRows, monthlyRows, avgResRow] = await Promise.all([
      // Category
      base.clone().select('category').count('id as count').groupBy('category').orderBy('count', 'desc'),
      // Pincode
      base.clone().select('pincode').count('id as count').groupBy('pincode').orderBy('count', 'desc').limit(12),
      // Status
      base.clone().select('status').count('id as count').groupBy('status'),
      // Priority
      base.clone().select('priority').count('id as count').groupBy('priority'),
      // Department
      base.clone().select('assigned_department').count('id as count').groupBy('assigned_department').orderBy('count', 'desc').limit(8),
      // Monthly trend (last 6 months)
      db.raw(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
          DATE_TRUNC('month', created_at) AS month_date,
          COUNT(id) AS count,
          SUM(CASE WHEN UPPER(status) = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
        FROM complaints
        ${pincode && pincode !== 'all' ? 'WHERE pincode = :pincode' : ''}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date DESC
        LIMIT 6
      `, { pincode }),
      // Avg resolution time
      db.raw(`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours,
          MIN(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS min_hours,
          MAX(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS max_hours
        FROM complaints
        WHERE resolved_at IS NOT NULL
        ${pincode && pincode !== 'all' ? 'AND pincode = :pincode' : ''}
      `, { pincode }),
    ]);

    // Format category chart
    const categoryData = catRows.map((r, idx) => ({
      name: r.category || 'General',
      value: parseInt(r.count, 10),
      color: CAT_PALETTE[idx % CAT_PALETTE.length],
    }));

    // Format pincode chart
    const pincodeData = pincodeRows.map(r => ({
      pincode: `📍 ${r.pincode}`,
      count: parseInt(r.count, 10),
    }));

    // Format status chart
    const statusMap = { reported: 0, verified: 0, assigned: 0, in_progress: 0, resolved: 0, reopened: 0 };
    for (const r of statusRows) {
      const s = (r.status || '').toLowerCase();
      const cnt = parseInt(r.count, 10);
      if (s === 'open' || s === 'reported') statusMap.reported += cnt;
      else if (statusMap[s] !== undefined) statusMap[s] += cnt;
      else statusMap.reported += cnt;
    }
    const STATUS_COLORS = { Reported: '#93C5FD', Verified: '#60A5FA', Assigned: '#3B82F6', 'In Progress': '#2563EB', Resolved: '#10B981', Reopened: '#F59E0B' };
    const statusData = Object.entries({
      Reported: statusMap.reported, Verified: statusMap.verified,
      Assigned: statusMap.assigned, 'In Progress': statusMap.in_progress,
      Resolved: statusMap.resolved, Reopened: statusMap.reopened,
    }).filter(([, v]) => v > 0).map(([name, count]) => ({ name, count, fill: STATUS_COLORS[name] || '#2563EB' }));

    // Priority
    const prCounts = { urgent: 0, high: 0, medium: 0, low: 0 };
    for (const r of priorityRows) {
      const p = (r.priority || 'medium').toLowerCase();
      const cnt = parseInt(r.count, 10);
      if (p === 'urgent' || p === 'critical') prCounts.urgent += cnt;
      else if (p === 'high') prCounts.high += cnt;
      else if (p === 'low') prCounts.low += cnt;
      else prCounts.medium += cnt;
    }
    const priorityData = [
      { name: 'Urgent', count: prCounts.urgent, fill: '#EF4444' },
      { name: 'High', count: prCounts.high, fill: '#F97316' },
      { name: 'Medium', count: prCounts.medium, fill: '#3B82F6' },
      { name: 'Low', count: prCounts.low, fill: '#10B981' },
    ];

    // Department
    const deptData = deptRows.map(r => ({
      name: (r.assigned_department || 'Unassigned').replace(/ Department$/, '').replace(/ Dept\.?$/, ''),
      count: parseInt(r.count, 10),
    }));

    // Monthly trend (reverse so oldest first)
    const monthlyData = (monthlyRows.rows || []).reverse().map(r => ({
      month: r.month,
      complaints: parseInt(r.count, 10),
      resolved: parseInt(r.resolved, 10),
    }));

    const avgHours = parseFloat(avgResRow.rows?.[0]?.avg_hours || 0);
    const avgResolutionLabel = avgHours > 0
      ? (avgHours < 24 ? `${Math.round(avgHours)}h` : `${(avgHours / 24).toFixed(1)}d`)
      : 'N/A';

    return ApiResponse.ok(res, {
      charts: { byCategory: categoryData, byPincode: pincodeData, byStatus: statusData, byPriority: priorityData, byDepartment: deptData, monthly: monthlyData },
      avgResolution: {
        hours: Math.round(avgHours),
        label: avgResolutionLabel,
        minHours: Math.round(parseFloat(avgResRow.rows?.[0]?.min_hours || 0)),
        maxHours: Math.round(parseFloat(avgResRow.rows?.[0]?.max_hours || 0)),
      },
    }, 'Analytics retrieved');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/dashboard (legacy alias) ───────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  return getDashboard(req, res, next);
};

const getWards = async (req, res, next) => {
  try {
    const WardModel = require('../models/Ward');
    const wards = await WardModel.listAll();
    return ApiResponse.ok(res, wards);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getDashboardStats,
  getAdminComplaints,
  getAdminComplaint,
  updateAdminComplaintStatus,
  getAnalytics,
  getWards,
};
