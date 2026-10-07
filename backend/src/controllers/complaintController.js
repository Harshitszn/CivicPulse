/**
 * Complaint Controller
 */
const ComplaintService = require('../services/complaintService');
const CloudinaryService = require('../services/cloudinaryService');
const { ApiResponse } = require('../utils/ApiResponse');

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, address, pincode, latitude, longitude, assigned_department } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => CloudinaryService.uploadBuffer(file.buffer));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.url);
    } else if (req.body.image_urls) {
      imageUrls = Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls];
    }

    const complaint = await ComplaintService.createComplaint({
      title,
      description,
      category,
      priority,
      address,
      pincode,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      image_urls: imageUrls,
      user_id: req.user.id,
      assigned_department,
    });

    return ApiResponse.created(res, complaint, 'Complaint submitted successfully');
  } catch (err) {
    next(err);
  }
};

const getComplaint = async (req, res, next) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);
    return ApiResponse.ok(res, complaint);
  } catch (err) {
    next(err);
  }
};

const listComplaints = async (req, res, next) => {
  try {
    const {
      limit = 20,
      offset = 0,
      category,
      status,
      priority,
      pincode,
      userId,
      search,
      sortBy,
      sortOrder,
      nearLat,
      nearLng,
      radiusMeters,
    } = req.query;

    const result = await ComplaintService.listComplaints({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      category,
      status,
      priority,
      pincode,
      userId,
      search,
      sortBy,
      sortOrder,
      nearLat: nearLat ? parseFloat(nearLat) : undefined,
      nearLng: nearLng ? parseFloat(nearLng) : undefined,
      radiusMeters: radiusMeters ? parseInt(radiusMeters, 10) : undefined,
    });

    return ApiResponse.paginated(res, result.complaints, result.pagination);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await ComplaintService.updateStatus(req.params.id, status, req.user.id);
    return ApiResponse.ok(res, updated, 'Complaint status updated');
  } catch (err) {
    next(err);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    const insights = await ComplaintService.getInsights(pincode);
    return ApiResponse.ok(res, insights, 'Insights retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getComplaint,
  listComplaints,
  updateStatus,
  getInsights,
};
