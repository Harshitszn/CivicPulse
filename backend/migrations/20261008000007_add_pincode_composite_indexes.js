/**
 * Migration to add composite indexes for high-performance pincode-based filtering
 * across FeedLoop, Search, Community Priorities, and Services.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Composite index for FeedLoop timeline queries filtered by pincode
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_complaints_pincode_created_at
    ON complaints (pincode, created_at DESC);
  `);

  // Composite index for Category-specific filtering by pincode (Services & Insights)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_complaints_pincode_category
    ON complaints (pincode, category);
  `);

  // Composite index for Priority-based community priority calculation by pincode
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_complaints_pincode_priority
    ON complaints (pincode, priority);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_complaints_pincode_created_at;');
  await knex.schema.raw('DROP INDEX IF EXISTS idx_complaints_pincode_category;');
  await knex.schema.raw('DROP INDEX IF EXISTS idx_complaints_pincode_priority;');
};
