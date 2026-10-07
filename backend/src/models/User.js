/**
 * User Data Access Model (Knex query builder wrapper)
 */
const { db } = require('../config/database');

const TABLE = 'users';

class UserModel {
  static async findById(id) {
    return db(TABLE)
      .where({ id })
      .select('id', 'email', 'full_name', 'role', 'phone', 'pincode', 'avatar_url', 'created_at', 'updated_at')
      .first();
  }

  static async findByEmail(email) {
    return db(TABLE).where({ email: email.toLowerCase().trim() }).first();
  }

  static async create(userData) {
    const [user] = await db(TABLE)
      .insert({
        email: userData.email.toLowerCase().trim(),
        password_hash: userData.password_hash,
        full_name: userData.full_name,
        role: userData.role || 'citizen',
        phone: userData.phone || null,
        pincode: userData.pincode || null,
        avatar_url: userData.avatar_url || null,
      })
      .returning(['id', 'email', 'full_name', 'role', 'phone', 'pincode', 'avatar_url', 'created_at']);
    return user;
  }

  static async update(id, updates) {
    const [user] = await db(TABLE)
      .where({ id })
      .update({
        ...updates,
        updated_at: db.fn.now(),
      })
      .returning(['id', 'email', 'full_name', 'role', 'phone', 'pincode', 'avatar_url', 'updated_at']);
    return user;
  }

  static async list({ limit = 20, offset = 0, role, pincode } = {}) {
    let query = db(TABLE).select('id', 'email', 'full_name', 'role', 'phone', 'pincode', 'avatar_url', 'created_at');
    if (role) query = query.where({ role });
    if (pincode) query = query.where({ pincode });
    return query.limit(limit).offset(offset).orderBy('created_at', 'desc');
  }
}

module.exports = UserModel;
