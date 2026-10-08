/**
 * Migration: Add assigned_department and image_urls to complaints table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.config = { transaction: false };

exports.up = async function (knex) {
  const hasAssignedDept = await knex.schema.hasColumn('complaints', 'assigned_department');
  if (!hasAssignedDept) {
    await knex.schema.alterTable('complaints', (table) => {
      table.string('assigned_department', 255).nullable();
    });
  }

  const hasImageUrls = await knex.schema.hasColumn('complaints', 'image_urls');
  if (!hasImageUrls) {
    await knex.schema.alterTable('complaints', (table) => {
      table.text('image_urls').nullable().defaultTo('[]');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('complaints', (table) => {
    table.dropColumn('assigned_department');
    table.dropColumn('image_urls');
  });
};
