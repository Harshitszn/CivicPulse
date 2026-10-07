/**
 * Complaint Data Access Model (Knex query builder with PostGIS support)
 */
const { db } = require('../config/database');

const TABLE = 'complaints';

class ComplaintModel {
  static async findById(id) {
    return db(TABLE)
      .join('users', 'complaints.user_id', '=', 'users.id')
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
  }

  static async create({
    title,
    description,
    category,
    priority = 'medium',
    status = 'pending',
    address,
    pincode,
    latitude,
    longitude,
    image_urls = [],
    user_id,
    assigned_department,
    ai_confidence,
    ai_urgency_score,
  }) {
    const insertData = {
      title,
      description,
      category,
      priority,
      status,
      address,
      pincode,
      image_urls: JSON.stringify(image_urls),
      user_id,
      assigned_department,
      ai_confidence,
      ai_urgency_score,
    };

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      insertData.location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude]);
    }

    const [inserted] = await db(TABLE).insert(insertData).returning('*');
    return inserted;
  }

  static async update(id, updates) {
    const data = { ...updates, updated_at: db.fn.now() };
    if (data.image_urls && Array.isArray(data.image_urls)) {
      data.image_urls = JSON.stringify(data.image_urls);
    }
    if (data.latitude !== undefined && data.longitude !== undefined) {
      data.location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [data.longitude, data.latitude]);
      delete data.latitude;
      delete data.longitude;
    }
    const [updated] = await db(TABLE).where({ id }).update(data).returning('*');
    return updated;
  }

  static async list({
    limit = 20,
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
    radiusMeters = 5000,
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

    if (category) query = query.where('complaints.category', category);
    if (status) query = query.where('complaints.status', status);
    if (priority) query = query.where('complaints.priority', priority);
    if (pincode) query = query.where('complaints.pincode', pincode);
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

    return query.limit(limit).offset(offset).orderBy(`complaints.${sortBy}`, sortOrder);
  }

  static async count(filters = {}) {
    let query = db(TABLE);
    if (filters.category) query = query.where({ category: filters.category });
    if (filters.status) query = query.where({ status: filters.status });
    if (filters.pincode) query = query.where({ pincode: filters.pincode });
    const result = await query.count('id as count').first();
    return parseInt(result.count, 10);
  }
}

module.exports = ComplaintModel;
