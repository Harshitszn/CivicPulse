/**
 * Complaint Controller
 */
const ComplaintService = require('../services/complaintService');
const CloudinaryService = require('../services/cloudinaryService');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requirement,
      priority,
      status = 'REPORTED',
      address,
      pincode,
      latitude,
      longitude,
      is_anonymous,
      isAnonymous,
      assigned_department,
      estimated_resolution_time,
      estimatedResolutionTime,
      estimatedResolution,
    } = req.body;

    // Do NOT trust user-provided user IDs — extract exclusively from authenticated JWT
    const authenticatedUserId = req.user.id;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => CloudinaryService.uploadBuffer(file.buffer));
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.url);
    } else if (req.body.image_urls) {
      imageUrls = Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls];
    } else if (req.body.imageUrl) {
      imageUrls = [req.body.imageUrl];
    }

    const complaint = await ComplaintService.createComplaint({
      title,
      description,
      category,
      requirement: requirement || null,
      priority: priority || 'medium',
      status: status || 'REPORTED',
      address,
      pincode,
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
      is_anonymous: is_anonymous !== undefined ? is_anonymous : isAnonymous,
      image_urls: imageUrls,
      user_id: authenticatedUserId,
      assigned_department,
      estimated_resolution_time: estimated_resolution_time || estimatedResolutionTime || estimatedResolution || '2–4 Days',
    });

    return ApiResponse.created(res, { complaint }, 'Complaint registered successfully');
  } catch (err) {
    next(err);
  }
};

const getComplaint = async (req, res, next) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);
    return ApiResponse.ok(res, { complaint });
  } catch (err) {
    next(err);
  }
};

const listComplaints = async (req, res, next) => {
  try {
    const {
      limit = 50,
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

const updateComplaint = async (req, res, next) => {
  try {
    const updated = await ComplaintService.updateComplaint(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    return ApiResponse.ok(res, { complaint: updated }, 'Complaint updated successfully');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      throw ApiError.badRequest('Status is required');
    }
    const updated = await ComplaintService.updateStatus(req.params.id, status, req.user.id, notes);
    return ApiResponse.ok(res, { complaint: updated }, 'Complaint status updated');
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
  updateComplaint,
  updateStatus,
  getInsights,
};
