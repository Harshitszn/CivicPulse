/**
 * Health check controller
 */
const { ApiResponse } = require('../utils/ApiResponse');

const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'CivicPulse API running',
  });
};

module.exports = {
  healthCheck,
};
