/**
 * Complaint Service
 */
const ComplaintModel = require('../models/Complaint');
const AiService = require('./aiService');
const ApiError = require('../utils/ApiError');
const { db } = require('../config/database');

class ComplaintService {
  static async createComplaint({
    title,
    description,
    category,
    priority,
    address,
    pincode,
    latitude,
    longitude,
    image_urls = [],
    user_id,
    assigned_department,
  }) {
    // If category or priority is not explicitly provided, run AI triage
    let finalCategory = category;
    let finalPriority = priority;
    let finalDept = assigned_department;
    let aiConfidence = 0.9;
    let aiUrgency = 50;

    if (!finalCategory || !finalPriority || !finalDept) {
      const aiTriage = await AiService.classifyComplaint(title, description);
      finalCategory = finalCategory || aiTriage.category;
      finalPriority = finalPriority || aiTriage.priority;
      finalDept = finalDept || aiTriage.department;
      aiConfidence = aiTriage.confidence;
      aiUrgency = aiTriage.urgencyScore;
    }

    const complaint = await ComplaintModel.create({
      title,
      description,
      category: finalCategory,
      priority: finalPriority,
      address,
      pincode,
      latitude,
      longitude,
      image_urls,
      user_id,
      assigned_department: finalDept,
      ai_confidence: aiConfidence,
      ai_urgency_score: aiUrgency,
    });

    return complaint;
  }

  static async getComplaintById(id) {
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }
    return complaint;
  }

  static async listComplaints(filters) {
    const complaints = await ComplaintModel.list(filters);
    const total = await ComplaintModel.count(filters);
    return {
      complaints,
      pagination: {
        total,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      },
    };
  }

  static async updateStatus(id, status, officialId) {
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = await ComplaintModel.update(id, {
      status,
      resolved_at: status === 'resolved' ? db.fn.now() : null,
    });

    return updated;
  }

  static async getInsights(pincode) {
    let query = db('complaints');
    if (pincode) query = query.where({ pincode });

    const totalCount = await query.clone().count('id as count').first();
    const resolvedCount = await query.clone().where({ status: 'resolved' }).count('id as count').first();
    const pendingCount = await query.clone().where({ status: 'pending' }).count('id as count').first();
    const inProgressCount = await query.clone().where({ status: 'in_progress' }).count('id as count').first();

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
}

module.exports = ComplaintService;
