/**
 * Municipal Dashboard Controller
 */
const { db } = require('../config/database');
const WardModel = require('../models/Ward');
const { ApiResponse } = require('../utils/ApiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const { pincode } = req.query;

    let baseQuery = db('complaints');
    if (pincode) baseQuery = baseQuery.where({ pincode });

    const total = await baseQuery.clone().count('id as count').first();
    const resolved = await baseQuery.clone().where({ status: 'resolved' }).count('id as count').first();
    const pending = await baseQuery.clone().where({ status: 'pending' }).count('id as count').first();
    const inProgress = await baseQuery.clone().where({ status: 'in_progress' }).count('id as count').first();

    // Department breakdown
    const departmentBreakdown = await baseQuery
      .clone()
      .select('assigned_department')
      .count('id as count')
      .groupBy('assigned_department');

    // Recent activity
    const recentComplaints = await baseQuery
      .clone()
      .select('id', 'title', 'category', 'status', 'priority', 'created_at', 'pincode')
      .orderBy('created_at', 'desc')
      .limit(5);

    const totalNum = parseInt(total?.count || 0, 10);
    const resolvedNum = parseInt(resolved?.count || 0, 10);
    const pendingNum = parseInt(pending?.count || 0, 10);
    const inProgressNum = parseInt(inProgress?.count || 0, 10);

    return ApiResponse.ok(
      res,
      {
        summary: {
          total: totalNum,
          resolved: resolvedNum,
          pending: pendingNum,
          inProgress: inProgressNum,
          resolutionRate: totalNum > 0 ? Math.round((resolvedNum / totalNum) * 100) : 0,
        },
        departmentBreakdown,
        recentComplaints,
      },
      'Municipal statistics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

const getWards = async (req, res, next) => {
  try {
    const wards = await WardModel.listAll();
    return ApiResponse.ok(res, wards);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getWards,
};
