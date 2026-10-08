/**
 * Migration: Add cloudinary_url and make complaint_id nullable on complaint_images table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.config = { transaction: false };

exports.up = async function (knex) {
  // Make complaint_id nullable
  await knex.schema.raw('ALTER TABLE complaint_images ALTER COLUMN complaint_id DROP NOT NULL;');

  // Add cloudinary_url column if not present
  const hasCloudinaryUrl = await knex.schema.hasColumn('complaint_images', 'cloudinary_url');
  if (!hasCloudinaryUrl) {
    await knex.schema.alterTable('complaint_images', (table) => {
      table.text('cloudinary_url').nullable();
    });
  }

  // Populate existing image_url to cloudinary_url if any exist
  await knex.schema.raw('UPDATE complaint_images SET cloudinary_url = image_url WHERE cloudinary_url IS NULL;');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('complaint_images', (table) => {
    table.dropColumn('cloudinary_url');
  });
};
