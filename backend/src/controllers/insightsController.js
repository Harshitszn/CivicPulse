/**
 * Insights Controller
 * Consumed by Civic Insights frontend.
 * Pure database-driven responses without any hardcoded metrics.
 */
const AnalyticsService = require('../services/analyticsService');
const { ApiResponse } = require('../utils/ApiResponse');

const getOverview = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const overview = await AnalyticsService.getOverview(pincode);
    return ApiResponse.ok(res, overview, 'Civic Insights overview retrieved');
  } catch (err) {
    next(err);
  }
};

const getCivicRecord = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const record = await AnalyticsService.getCivicRecord(pincode);
    return ApiResponse.ok(res, record, 'Civic Record history retrieved');
  } catch (err) {
    next(err);
  }
};

const getServices = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const services = await AnalyticsService.getServices(pincode);
    return ApiResponse.ok(res, services, 'Civic Services analytics retrieved');
  } catch (err) {
    next(err);
  }
};

const getAllInsights = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const [overview, record, services] = await Promise.all([
      AnalyticsService.getOverview(pincode),
      AnalyticsService.getCivicRecord(pincode),
      AnalyticsService.getServices(pincode),
    ]);
    return ApiResponse.ok(res, { overview, record, services }, 'All Civic Insights retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getCivicRecord,
  getServices,
  getAllInsights,
};
