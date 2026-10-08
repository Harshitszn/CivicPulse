/**
 * Complaint Service
 */
const ComplaintModel = require('../models/Complaint');
const VoteModel = require('../models/Vote');
const AiService = require('./aiService');
const ApiError = require('../utils/ApiError');
const { db } = require('../config/database');

class ComplaintService {
  static async createComplaint({
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
    is_anonymous = false,
    image_urls = [],
    image_id = null,
    image_ids = [],
    user_id,
    assigned_department,
    estimated_resolution_time,
  }) {
    if (!title || !title.trim()) {
      throw ApiError.badRequest('Title is required');
    }
    if (!description || !description.trim()) {
      throw ApiError.badRequest('Description is required');
    }
    if (!pincode || !pincode.trim()) {
      throw ApiError.badRequest('Pincode is required');
    }

    // AI Classification & Triage through Backend Service Layer
    const firstImageUrl = (image_urls && image_urls[0]) || null;
    const aiTriage = await AiService.classifyComplaint({
      title,
      description,
      imageUrl: firstImageUrl,
    });

    const finalCategory = category || aiTriage.category;
    const finalPriority = priority || aiTriage.priority;
    const finalDept = assigned_department || aiTriage.department;
    const finalEstRes = estimated_resolution_time || aiTriage.estimated_resolution_time || null;
    const finalRequirement = requirement && requirement.trim() ? requirement.trim() : aiTriage.requirement;
    const aiConfidence = aiTriage.confidence;
    const aiUrgency = aiTriage.urgencyScore;

    const complaint = await ComplaintModel.create({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      requirement: finalRequirement,
      priority: finalPriority,
      status: status || 'REPORTED',
      address: address ? address.trim() : null,
      pincode: pincode.trim(),
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
      is_anonymous: Boolean(is_anonymous),
      image_urls,
      image_id,
      image_ids,
      user_id, // Authenticated user ID from JWT
      assigned_department: finalDept,
      estimated_resolution_time: finalEstRes,
      ai_confidence: aiConfidence,
      ai_urgency_score: aiUrgency,
    });

    // Record initial status history
    try {
      await db('complaint_status_history').insert({
        complaint_id: complaint.id,
        changed_by_user_id: user_id,
        from_status: null,
        to_status: status || 'REPORTED',
        notes: 'Complaint submitted by citizen.',
      });
    } catch (err) {
      console.warn('Could not record initial status history:', err.message);
    }

    return complaint;
  }

  static async getComplaintById(id, currentUserId = null) {
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }
    if (currentUserId) {
      const userVote = await VoteModel.findUserVote(currentUserId, id);
      complaint.current_user_vote = userVote?.vote_type ? userVote.vote_type.toUpperCase() : null;
      complaint.currentUserVote = complaint.current_user_vote;
    }
    return complaint;
  }

  static async listComplaints(filters, currentUserId = null) {
    const complaints = await ComplaintModel.list(filters);
    const total = await ComplaintModel.count(filters);

    if (currentUserId && complaints.length > 0) {
      const ids = complaints.map((c) => c.id || c._id);
      const voteMap = await VoteModel.findUserVotesForComplaints(currentUserId, ids);
      for (const c of complaints) {
        c.current_user_vote = voteMap[c.id || c._id] || null;
        c.currentUserVote = c.current_user_vote;
      }
    }

    return {
      complaints,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      },
    };
  }

  static async voteComplaint({ complaintId, userId, userPincode, rawVoteType }) {
    return VoteModel.castVote({
      userId,
      complaintId,
      rawVoteType,
      userPincode,
    });
  }

  static async updateComplaint(id, updates, userId, userRole) {
    const existing = await ComplaintModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Complaint not found');
    }

    const isOwner = existing.user_id === userId || existing.created_by === userId;
    const isStaffOrAdmin = userRole === 'official' || userRole === 'staff' || userRole === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      throw ApiError.forbidden('You do not have permission to update this complaint');
    }

    const allowedUpdates = {};

    // Fields editable by the complaint owner (citizen)
    if (isOwner || isStaffOrAdmin) {
      if (updates.title) allowedUpdates.title = updates.title.trim();
      if (updates.description) allowedUpdates.description = updates.description.trim();
      if (updates.requirement !== undefined) allowedUpdates.requirement = updates.requirement;
      if (updates.address !== undefined) allowedUpdates.address = updates.address;
      if (updates.is_anonymous !== undefined) allowedUpdates.is_anonymous = updates.is_anonymous;
      if (updates.isAnonymous !== undefined) allowedUpdates.is_anonymous = updates.isAnonymous;
    }

    // Fields restricted to staff/admin only to prevent:
    // - Locality manipulation (pincode change)
    // - Artificial priority escalation (priority change)
    // - Category re-classification (category change)
    if (isStaffOrAdmin) {
      if (updates.category) allowedUpdates.category = updates.category;
      if (updates.priority) allowedUpdates.priority = updates.priority;
      if (updates.estimated_resolution_time) allowedUpdates.estimated_resolution_time = updates.estimated_resolution_time;
      if (updates.estimatedResolution) allowedUpdates.estimated_resolution_time = updates.estimatedResolution;
      if (updates.latitude !== undefined) allowedUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) allowedUpdates.longitude = updates.longitude;

      // Validate and accept pincode change from staff only
      if (updates.pincode) {
        const cleanPincode = String(updates.pincode).trim();
        if (!/^\d{6}$/.test(cleanPincode)) {
          throw ApiError.badRequest('Postal pincode must be a 6-digit numeric code');
        }
        allowedUpdates.pincode = cleanPincode;
      }
    }

    // Only staff/admin can change status and assigned department
    if (updates.status && updates.status !== existing.status) {
      if (!isStaffOrAdmin) {
        throw ApiError.forbidden('Only municipal officials can change complaint status');
      }
      allowedUpdates.status = updates.status;
      if (updates.status === 'resolved' || updates.status === 'RESOLVED') {
        allowedUpdates.resolved_at = db.fn.now();
      }

      // Log status history
      await db('complaint_status_history').insert({
        complaint_id: id,
        changed_by_user_id: userId,
        from_status: existing.status,
        to_status: updates.status,
        notes: updates.notes || `Status changed to ${updates.status}`,
      });
    }

    if (updates.assigned_department && isStaffOrAdmin) {
      allowedUpdates.assigned_department = updates.assigned_department;
    }

    const updated = await ComplaintModel.update(id, allowedUpdates);
    return updated;
  }

  static async updateStatus(id, status, officialId, notes) {
    const existing = await ComplaintModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Complaint not found');
    }

    const updated = await ComplaintModel.update(id, {
      status,
      resolved_at: status === 'resolved' || status === 'RESOLVED' ? db.fn.now() : null,
    });

    await db('complaint_status_history').insert({
      complaint_id: id,
      changed_by_user_id: officialId,
      from_status: existing.status,
      to_status: status,
      notes: notes || `Status updated to ${status}`,
    });

    return updated;
  }

  static async getStatusHistory(complaintId) {
    const rows = await db('complaint_status_history')
      .leftJoin('users', 'complaint_status_history.changed_by_user_id', '=', 'users.id')
      .where('complaint_status_history.complaint_id', complaintId)
      .select(
        'complaint_status_history.*',
        'users.full_name as changed_by_name',
        'users.role as changed_by_role'
      )
      .orderBy('complaint_status_history.created_at', 'asc');

    return rows.map((r) => ({
      id: r.id,
      complaint_id: r.complaint_id,
      from_status: r.from_status,
      to_status: r.to_status,
      old_status: r.from_status,
      new_status: r.to_status,
      notes: r.notes || null,
      changed_by: r.changed_by_user_id,
      changed_by_name: r.changed_by_name || 'System',
      changed_by_role: r.changed_by_role || 'system',
      timestamp: r.created_at,
      created_at: r.created_at,
    }));
  }

  static async getInsights(pincode) {
    let query = db('complaints');
    if (pincode && pincode !== 'all') query = query.where({ pincode });

    const totalCount = await query.clone().count('id as count').first();
    const resolvedCount = await query.clone().whereIn('status', ['resolved', 'RESOLVED', 'verified']).count('id as count').first();
    const pendingCount = await query.clone().whereIn('status', ['pending', 'REPORTED', 'open']).count('id as count').first();
    const inProgressCount = await query.clone().whereIn('status', ['in_progress', 'IN_PROGRESS', 'assigned']).count('id as count').first();

    const categoryBreakdown = await query
      .clone()
      .select('category')
      .count('id as count')
      .groupBy('category');

    const total = parseInt(totalCount?.count || 0, 10);
    const resolved = parseInt(resolvedCount?.count || 0, 10);
    const pending = parseInt(pendingCount?.count || 0, 10);
    const inProgress = parseInt(inProgressCount?.count || 0, 10);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      resolved,
      pending,
      inProgress,
      resolutionRate,
      categoryBreakdown,
    };
  }

  static async getNearbyComplaints(options, currentUserId = null) {
    const result = await ComplaintModel.findNearby(options);
    if (currentUserId && result.complaints.length > 0) {
      const ids = result.complaints.map((c) => c.id || c._id);
      const voteMap = await VoteModel.findUserVotesForComplaints(currentUserId, ids);
      for (const c of result.complaints) {
        c.current_user_vote = voteMap[c.id || c._id] || null;
        c.currentUserVote = c.current_user_vote;
      }
    }
    return result;
  }

  static async getAreaComplaints(options, currentUserId = null) {
    const result = await ComplaintModel.findInBoundingBox(options);
    if (currentUserId && result.complaints.length > 0) {
      const ids = result.complaints.map((c) => c.id || c._id);
      const voteMap = await VoteModel.findUserVotesForComplaints(currentUserId, ids);
      for (const c of result.complaints) {
        c.current_user_vote = voteMap[c.id || c._id] || null;
        c.currentUserVote = c.current_user_vote;
      }
    }
    return result;
  }

  static async getMapCoordinates(options) {
    return ComplaintModel.getMapCoordinates(options);
  }
}

module.exports = ComplaintService;
