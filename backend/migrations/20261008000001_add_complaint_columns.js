/**
 * Migration: Add requirement, is_anonymous, and estimated_resolution_time to complaints table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.config = { transaction: false };

exports.up = async function (knex) {
  const hasRequirement = await knex.schema.hasColumn('complaints', 'requirement');
  if (!hasRequirement) {
    await knex.schema.alterTable('complaints', (table) => {
      table.text('requirement').nullable();
    });
  }

  const hasAnonymous = await knex.schema.hasColumn('complaints', 'is_anonymous');
  if (!hasAnonymous) {
    await knex.schema.alterTable('complaints', (table) => {
      table.boolean('is_anonymous').notNullable().defaultTo(false);
    });
  }

  const hasEstRes = await knex.schema.hasColumn('complaints', 'estimated_resolution_time');
  if (!hasEstRes) {
    await knex.schema.alterTable('complaints', (table) => {
      table.string('estimated_resolution_time', 100).nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('complaints', (table) => {
    table.dropColumn('requirement');
    table.dropColumn('is_anonymous');
    table.dropColumn('estimated_resolution_time');
  });
};
