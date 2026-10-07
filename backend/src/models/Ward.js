/**
 * Ward / Municipality Data Access Model
 */
const { db } = require('../config/database');

const TABLE = 'wards';

class WardModel {
  static async findByPincode(pincode) {
    return db(TABLE).where({ pincode }).first();
  }

  static async listAll() {
    return db(TABLE).select('*').orderBy('ward_name', 'asc');
  }

  static async create(wardData) {
    const [ward] = await db(TABLE).insert(wardData).returning('*');
    return ward;
  }
}

module.exports = WardModel;
