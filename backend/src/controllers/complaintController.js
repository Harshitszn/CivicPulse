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
      image_id: req.body.image_id || req.body.imageId || null,
      image_ids: req.body.image_ids || null,
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
    const complaint = await ComplaintService.getComplaintById(req.params.id, req.user?.id);
    return ApiResponse.ok(res, { complaint });
  } catch (err) {
    next(err);
  }
};

const listComplaints = async (req, res, next) => {
  try {
    const {
      pincode,
      category,
      status,
      priority,
      sort,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20,
      offset,
      userId,
      search,
      nearLat,
      nearLng,
      radiusMeters,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const calculatedOffset = offset !== undefined ? Math.max(0, parseInt(offset, 10)) : (pageNum - 1) * limitNum;

    const result = await ComplaintService.listComplaints(
      {
        pincode,
        category,
        status,
        priority,
        sort: sort || sortBy || 'top',
        sortBy,
        sortOrder,
        page: pageNum,
        limit: limitNum,
        offset: calculatedOffset,
        userId,
        search,
        nearLat: nearLat ? parseFloat(nearLat) : undefined,
        nearLng: nearLng ? parseFloat(nearLng) : undefined,
        radiusMeters: radiusMeters ? parseInt(radiusMeters, 10) : undefined,
      },
      req.user?.id
    );

    const total = result.pagination.total;
    const totalPages = Math.ceil(total / limitNum);

    const paginationData = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      totalPages,
      hasNext: pageNum < totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrev: pageNum > 1,
      hasPrevPage: pageNum > 1,
    };

    return ApiResponse.paginated(res, result.complaints, paginationData, 'Complaints retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const voteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawVoteType = req.body.vote_type || req.body.voteType || req.body.type || req.body.vote;

    const result = await ComplaintService.voteComplaint({
      complaintId: id,
      userId: req.user.id,
      userPincode: req.user.pincode,
      rawVoteType,
    });

    return ApiResponse.ok(res, result, 'Vote recorded successfully');
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

const getMyComplaints = async (req, res, next) => {
  try {
    const { status, sort, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const result = await ComplaintService.listComplaints(
      {
        userId: req.user.id,
        status,
        sort: sort || 'new',
        page: pageNum,
        limit: limitNum,
        offset,
      },
      req.user.id
    );

    const total = result.pagination.total;
    const totalPages = Math.ceil(total / limitNum);
    const paginationData = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    return ApiResponse.paginated(res, result.complaints, paginationData, 'My complaints retrieved');
  } catch (err) {
    next(err);
  }
};

const getStatusHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await ComplaintService.getStatusHistory(id);
    return ApiResponse.ok(res, { history }, 'Status history retrieved');
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
  getMyComplaints,
  getStatusHistory,
  voteComplaint,
  updateComplaint,
  updateStatus,
  getInsights,
};
