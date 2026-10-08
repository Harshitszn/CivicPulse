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
      created_by: row.is_anonymous ? null : row.user_id,
      user_id: row.is_anonymous ? null : row.user_id,
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
        id: row.is_anonymous ? null : row.user_id,
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
    image_id = null,
    image_ids = [],
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

    let finalLng = longitude !== undefined && longitude !== null ? parseFloat(longitude) : null;
    let finalLat = latitude !== undefined && latitude !== null ? parseFloat(latitude) : null;

    if ((finalLng === null || isNaN(finalLng) || finalLat === null || isNaN(finalLat)) && pincode) {
      const PINCODE_CENTROIDS = {
        '400064': { lat: 19.1866, lng: 72.8485 },
        '400067': { lat: 19.2062, lng: 72.8407 },
        '400076': { lat: 19.1176, lng: 72.9060 },
        '400054': { lat: 19.0833, lng: 72.8368 },
        '110001': { lat: 28.6315, lng: 77.2197 },
        '560001': { lat: 12.9716, lng: 77.5946 },
      };
      const centroid = PINCODE_CENTROIDS[String(pincode).trim()] || { lat: 19.1000, lng: 72.8500 };
      // Small random micro-jitter within 150m
      const jitterLat = (Math.random() - 0.5) * 0.003;
      const jitterLng = (Math.random() - 0.5) * 0.003;
      finalLat = parseFloat((centroid.lat + jitterLat).toFixed(6));
      finalLng = parseFloat((centroid.lng + jitterLng).toFixed(6));
    }

    if (finalLat !== null && finalLng !== null) {
      insertData.location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [finalLng, finalLat]);
    }

    const [inserted] = await db(TABLE).insert(insertData).returning('*');

    // Link pre-uploaded image IDs if passed directly
    const targetIds = [...(image_ids || []), ...(image_id ? [image_id] : [])].filter(Boolean);
    if (targetIds.length > 0) {
      await db('complaint_images')
        .whereIn('id', targetIds)
        .whereNull('complaint_id')
        .update({ complaint_id: inserted.id });
    }

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

  static applyFilters(query, filters = {}) {
    const { category, status, priority, pincode, userId, search, nearLat, nearLng, radiusMeters = 10000 } = filters;

    if (pincode && pincode !== 'all') {
      query.where('complaints.pincode', String(pincode).trim());
    }

    if (category && category !== 'all') {
      const catTrim = String(category).trim().toLowerCase();
      query.where((builder) => {
        builder.whereILike('complaints.category', `%${catTrim}%`);
        if (catTrim === 'roads' || catTrim === 'road') {
          builder.orWhereILike('complaints.category', '%road%');
        } else if (catTrim === 'garbage') {
          builder.orWhereILike('complaints.category', '%garbage%').orWhereILike('complaints.category', '%waste%').orWhereILike('complaints.category', '%sanitation%');
        } else if (catTrim === 'water') {
          builder.orWhereILike('complaints.category', '%water%');
        } else if (catTrim === 'drainage') {
          builder.orWhereILike('complaints.category', '%drain%').orWhereILike('complaints.category', '%sewage%');
        } else if (catTrim.includes('light') || catTrim === 'streetlights') {
          builder.orWhereILike('complaints.category', '%light%').orWhereILike('complaints.category', '%electric%');
        } else if (catTrim.includes('infra') || catTrim === 'public infrastructure') {
          builder.orWhereILike('complaints.category', '%infra%');
        }
      });
    }

    if (status && status !== 'all') {
      query.whereILike('complaints.status', String(status).trim());
    }

    if (priority && priority !== 'all') {
      query.whereILike('complaints.priority', String(priority).trim());
    }

    if (userId) {
      query.where('complaints.user_id', userId);
    }

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      query.where((builder) => {
        builder
          .whereILike('complaints.title', term)
          .orWhereILike('complaints.description', term)
          .orWhereILike('complaints.address', term);
      });
    }

    if (nearLat && nearLng) {
      query.whereRaw(
        'ST_DWithin(complaints.location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
        [nearLng, nearLat, radiusMeters]
      );
    }

    if (filters.bbox) {
      const parts = String(filters.bbox).split(',').map((n) => parseFloat(n.trim()));
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        query.whereRaw('complaints.location && ST_MakeEnvelope(?, ?, ?, ?, 4326)', parts);
      }
    } else if (filters.minLat !== undefined && filters.minLng !== undefined && filters.maxLat !== undefined && filters.maxLng !== undefined) {
      query.whereRaw(
        'complaints.location && ST_MakeEnvelope(?, ?, ?, ?, 4326)',
        [parseFloat(filters.minLng), parseFloat(filters.minLat), parseFloat(filters.maxLng), parseFloat(filters.maxLat)]
      );
    }

    return query;
  }

  static applySorting(query, { sort, sortBy, sortOrder = 'desc' } = {}) {
    const s = (sort || sortBy || 'top').toLowerCase().trim();

    if (s === 'top') {
      query.orderByRaw('(COALESCE(complaints.upvotes_count, 0) - COALESCE(complaints.downvotes_count, 0)) DESC, complaints.created_at DESC');
    } else if (s === 'new' || s === 'newest' || s === 'latest' || s === 'created_at') {
      query.orderBy('complaints.created_at', sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc');
    } else if (s === 'old' || s === 'oldest') {
      query.orderBy('complaints.created_at', 'asc');
    } else if (s === 'urgent' || s === 'priority') {
      query.orderByRaw(
        `CASE LOWER(complaints.priority)
          WHEN 'urgent' THEN 1
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END ASC, complaints.created_at DESC`
      );
    } else if (s === 'discussed' || s === 'comments') {
      query.orderBy('complaints.created_at', 'desc');
    } else {
      const validCols = new Set(['title', 'category', 'status', 'priority', 'pincode', 'created_at', 'updated_at', 'upvotes_count']);
      const safeCol = validCols.has(s) ? s : 'created_at';
      query.orderBy(`complaints.${safeCol}`, sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc');
    }

    return query;
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
    sort,
    sortBy,
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
        'users.avatar_url as author_avatar',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude')
      );

    ComplaintModel.applyFilters(query, {
      category,
      status,
      priority,
      pincode,
      userId,
      search,
      nearLat,
      nearLng,
      radiusMeters,
    });

    ComplaintModel.applySorting(query, { sort, sortBy, sortOrder });

    const rows = await query.limit(limit).offset(offset);
    return rows.map(ComplaintModel.formatRow);
  }

  static async count(filters = {}) {
    let query = db(TABLE);
    ComplaintModel.applyFilters(query, filters);
    const result = await query.count('complaints.id as count').first();
    return parseInt(result?.count || 0, 10);
  }

  /**
   * 1 & 2. Find complaints near a coordinate within a radius (SRID 4326 PostGIS)
   * Uses PostGIS ST_DWithin and index-assisted ST_Distance calculation
   */
  static async findNearby({
    lat,
    lng,
    radiusMeters = 5000,
    category,
    status,
    priority,
    pincode,
    limit = 50,
    offset = 0,
  } = {}) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radNum = Math.min(100000, Math.max(10, parseInt(radiusMeters, 10) || 5000));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    let query = db(TABLE)
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .whereNotNull('complaints.location')
      .whereRaw(
        'ST_DWithin(complaints.location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
        [lngNum, latNum, radNum]
      )
      .select(
        'complaints.*',
        'users.full_name as author_name',
        'users.avatar_url as author_avatar',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude'),
        db.raw(
          'ROUND(ST_Distance(complaints.location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography)::numeric, 1) as distance_meters',
          [lngNum, latNum]
        )
      );

    ComplaintModel.applyFilters(query, { category, status, priority, pincode });

    // Order by distance ascending using index-backed PostGIS geography distance
    query.orderByRaw(
      'complaints.location::geography <-> ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography ASC',
      [lngNum, latNum]
    );

    const rows = await query.limit(limitNum).offset(offsetNum);

    // Total count in radius
    let countQuery = db(TABLE)
      .whereNotNull('complaints.location')
      .whereRaw(
        'ST_DWithin(complaints.location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
        [lngNum, latNum, radNum]
      );
    ComplaintModel.applyFilters(countQuery, { category, status, priority, pincode });
    const countRes = await countQuery.count('complaints.id as count').first();
    const total = parseInt(countRes?.count || 0, 10);

    const complaints = rows.map((r) => {
      const formatted = ComplaintModel.formatRow(r);
      formatted.distance_meters = parseFloat(r.distance_meters || 0);
      formatted.distanceMeters = formatted.distance_meters;
      formatted.distanceKm = parseFloat((formatted.distance_meters / 1000).toFixed(2));
      return formatted;
    });

    return {
      complaints,
      center: { latitude: latNum, longitude: lngNum },
      radiusMeters: radNum,
      radiusKm: parseFloat((radNum / 1000).toFixed(1)),
      total,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  /**
   * 3. Retrieve complaints within a geographic area / bounding envelope (SRID 4326 PostGIS)
   */
  static async findInBoundingBox({
    minLat,
    minLng,
    maxLat,
    maxLng,
    category,
    status,
    priority,
    pincode,
    limit = 100,
    offset = 0,
  } = {}) {
    const minLatNum = parseFloat(minLat);
    const minLngNum = parseFloat(minLng);
    const maxLatNum = parseFloat(maxLat);
    const maxLngNum = parseFloat(maxLng);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    let query = db(TABLE)
      .leftJoin('users', 'complaints.user_id', '=', 'users.id')
      .whereNotNull('complaints.location')
      .whereRaw(
        'complaints.location && ST_MakeEnvelope(?, ?, ?, ?, 4326)',
        [minLngNum, minLatNum, maxLngNum, maxLatNum]
      )
      .select(
        'complaints.*',
        'users.full_name as author_name',
        'users.avatar_url as author_avatar',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude')
      );

    ComplaintModel.applyFilters(query, { category, status, priority, pincode });
    query.orderBy('complaints.created_at', 'desc');

    const rows = await query.limit(limitNum).offset(offsetNum);

    let countQuery = db(TABLE)
      .whereNotNull('complaints.location')
      .whereRaw(
        'complaints.location && ST_MakeEnvelope(?, ?, ?, ?, 4326)',
        [minLngNum, minLatNum, maxLngNum, maxLatNum]
      );
    ComplaintModel.applyFilters(countQuery, { category, status, priority, pincode });
    const countRes = await countQuery.count('complaints.id as count').first();
    const total = parseInt(countRes?.count || 0, 10);

    return {
      complaints: rows.map(ComplaintModel.formatRow),
      bbox: { minLat: minLatNum, minLng: minLngNum, maxLat: maxLatNum, maxLng: maxLngNum },
      total,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  /**
   * 4. Return coordinates for municipal map visualization (SRID 4326 PostGIS)
   */
  static async getMapCoordinates({ pincode, category, status, priority, bbox, limit = 500 } = {}) {
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10) || 500));

    let query = db(TABLE)
      .whereNotNull('complaints.location')
      .select(
        'complaints.id',
        'complaints.title',
        'complaints.category',
        'complaints.priority',
        'complaints.status',
        'complaints.pincode',
        'complaints.address',
        'complaints.upvotes_count',
        'complaints.downvotes_count',
        'complaints.created_at',
        db.raw('ST_X(complaints.location::geometry) as longitude'),
        db.raw('ST_Y(complaints.location::geometry) as latitude'),
        db.raw('ST_AsGeoJSON(complaints.location) as geojson')
      );

    ComplaintModel.applyFilters(query, { pincode, category, status, priority });

    if (bbox) {
      const parts = String(bbox).split(',').map((n) => parseFloat(n.trim()));
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        // [minLng, minLat, maxLng, maxLat]
        query.whereRaw('complaints.location && ST_MakeEnvelope(?, ?, ?, ?, 4326)', parts);
      }
    }

    query.orderBy('complaints.created_at', 'desc').limit(limitNum);
    const rows = await query;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      priority: r.priority,
      status: r.status,
      pincode: r.pincode,
      address: r.address,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      coordinates: [parseFloat(r.longitude), parseFloat(r.latitude)],
      geojson: r.geojson ? JSON.parse(r.geojson) : null,
      upvotes: r.upvotes_count || 0,
      downvotes: r.downvotes_count || 0,
      createdAt: r.created_at,
    }));
  }
}

module.exports = ComplaintModel;
