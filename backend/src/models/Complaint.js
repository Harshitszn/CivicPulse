/**
 * Complaint Data Access Model (Knex query builder with PostGIS support)
 */
const { db } = require('../config/database');

const TABLE = 'complaints';

class ComplaintModel {
  static formatRow(row) {
    if (!row) return null;

    let imageUrls = [];
    if (row.image_urls) {
      try {
        imageUrls = typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls;
      } catch {
        imageUrls = [row.image_urls];
      }
    }

    return {
      id: row.id,
      _id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      requirement: row.requirement || null,
      priority: row.priority || 'medium',
      status: row.status || 'REPORTED',
      pincode: row.pincode,
      address: row.address || null,
      area_id: row.area_id || null,
      created_by: row.user_id,
      user_id: row.user_id,
      department_id: row.department_id || null,
      department: row.assigned_department || 'General Municipal Administration',
      assigned_department: row.assigned_department || 'General Municipal Administration',
      assigned_staff_id: row.assigned_staff_id || null,
      ward: row.pincode ? `Ward ${row.pincode.slice(-2)}` : 'Ward 1',
      categorySlug: row.category ? row.category.toLowerCase().replace(/[^a-z0-9]/g, '') : 'other',
      commentCount: 0,
      latitude: row.latitude !== undefined && row.latitude !== null ? parseFloat(row.latitude) : null,
      longitude: row.longitude !== undefined && row.longitude !== null ? parseFloat(row.longitude) : null,
      is_anonymous: Boolean(row.is_anonymous),
      isAnonymous: Boolean(row.is_anonymous),
      estimated_resolution_time: row.estimated_resolution_time || '2–4 Days',
      estimatedResolution: row.estimated_resolution_time || '2–4 Days',
      ai_confidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
      ai_urgency_score: row.ai_urgency_score || null,
      upvotes: row.upvotes_count || 0,
      upvotes_count: row.upvotes_count || 0,
      downvotes: row.downvotes_count || 0,
      downvotes_count: row.downvotes_count || 0,
      is_flagged: Boolean(row.is_flagged),
      image_urls: imageUrls,
      imageUrl: imageUrls[0] || null,
      reportedBy: {
        id: row.user_id,
        name: row.is_anonymous ? 'Anonymous Resident' : (row.author_name || 'Citizen Resident'),
        avatar: row.is_anonymous ? null : (row.author_avatar || null),
        isAnonymous: Boolean(row.is_anonymous),
      },
      resolved_at: row.resolved_at || null,
      created_at: row.created_at,
      createdAt: row.created_at,
      updated_at: row.updated_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id) {
    const row = await db(TABLE)
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .where('complaints.id', id)
      .select(
        'complaints.*',
        'users.full_name as author_name',
        'users.email as author_email',
        'users.avatar_url as author_avatar',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude')
      )
      .first();

    if (!row) return null;

    // Fetch any attached complaint_images
    const images = await db('complaint_images')
      .where({ complaint_id: id })
      .select('image_url', 'cloudinary_url');
    if (images && images.length > 0) {
      const dbImages = images.map((i) => i.cloudinary_url || i.image_url).filter(Boolean);
      let existing = [];
      try {
        existing = typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : (row.image_urls || []);
      } catch {
        existing = [];
      }
      row.image_urls = Array.from(new Set([...dbImages, ...existing]));
    }

    return ComplaintModel.formatRow(row);
  }

  static async create({
    title,
    description,
    category,
    requirement = null,
    priority = 'medium',
    status = 'REPORTED',
    address = null,
    pincode,
    latitude = null,
    longitude = null,
    is_anonymous = false,
    image_urls = [],
    user_id,
    assigned_department = null,
    estimated_resolution_time = null,
    ai_confidence = null,
    ai_urgency_score = null,
  }) {
    const insertData = {
      title,
      description,
      category,
      requirement,
      priority,
      status: status || 'REPORTED',
      address,
      pincode,
      is_anonymous: Boolean(is_anonymous),
      image_urls: JSON.stringify(image_urls),
      user_id,
      assigned_department,
      estimated_resolution_time: estimated_resolution_time || '2–4 Days',
      ai_confidence,
      ai_urgency_score,
      upvotes_count: 0,
      downvotes_count: 0,
    };

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      insertData.location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude]);
    }

    const [inserted] = await db(TABLE).insert(insertData).returning('*');

    // Also associate or insert into complaint_images table if images are provided
    if (image_urls && image_urls.length > 0) {
      for (const url of image_urls) {
        if (!url) continue;
        // Check if an existing unassigned image record matches this URL
        const existing = await db('complaint_images')
          .where((builder) => {
            builder.where('cloudinary_url', url).orWhere('image_url', url);
          })
          .whereNull('complaint_id')
          .first();

        if (existing) {
          await db('complaint_images')
            .where({ id: existing.id })
            .update({ complaint_id: inserted.id });
        } else {
          await db('complaint_images').insert({
            complaint_id: inserted.id,
            image_url: url,
            cloudinary_url: url,
            created_at: db.fn.now(),
          });
        }
      }
    }

    return ComplaintModel.findById(inserted.id);
  }

  static async update(id, updates) {
    const data = { ...updates, updated_at: db.fn.now() };

    if (data.image_urls && Array.isArray(data.image_urls)) {
      data.image_urls = JSON.stringify(data.image_urls);
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (data.latitude !== null && data.longitude !== null) {
        data.location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [data.longitude, data.latitude]);
      } else {
        data.location = null;
      }
      delete data.latitude;
      delete data.longitude;
    }

    await db(TABLE).where({ id }).update(data);
    return ComplaintModel.findById(id);
  }

  static async list({
    limit = 50,
    offset = 0,
    category,
    status,
    priority,
    pincode,
    userId,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    nearLat,
    nearLng,
    radiusMeters = 10000,
  } = {}) {
    let query = db(TABLE)
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .select(
        'complaints.*',
        'users.full_name as author_name',
        'users.email as author_email',
        'users.avatar_url as author_avatar',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude')
      );

    if (category && category !== 'all') query = query.where('complaints.category', category);
    if (status && status !== 'all') query = query.where('complaints.status', status);
    if (priority && priority !== 'all') query = query.where('complaints.priority', priority);
    if (pincode && pincode !== 'all') query = query.where('complaints.pincode', pincode);
    if (userId) query = query.where('complaints.user_id', userId);

    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike('complaints.title', `%${search}%`)
          .orWhereILike('complaints.description', `%${search}%`)
          .orWhereILike('complaints.address', `%${search}%`);
      });
    }

    if (nearLat && nearLng) {
      query = query.whereRaw(
        'ST_DWithin(complaints.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
        [nearLng, nearLat, radiusMeters]
      );
    }

    const rows = await query.limit(limit).offset(offset).orderBy(`complaints.${sortBy}`, sortOrder);
    return rows.map(ComplaintModel.formatRow);
  }

  static async count(filters = {}) {
    let query = db(TABLE);
    if (filters.category && filters.category !== 'all') query = query.where({ category: filters.category });
    if (filters.status && filters.status !== 'all') query = query.where({ status: filters.status });
    if (filters.pincode && filters.pincode !== 'all') query = query.where({ pincode: filters.pincode });
    if (filters.userId) query = query.where({ user_id: filters.userId });
    const result = await query.count('id as count').first();
    return parseInt(result.count, 10);
  }
}

module.exports = ComplaintModel;
