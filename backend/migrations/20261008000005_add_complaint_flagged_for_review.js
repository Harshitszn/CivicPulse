/**
 * Migration: Add flagged_for_review to complaints
 * When enough citizens dispute a RESOLVED status, the complaint is flagged
 * for municipal review without automatically reverting to UNRESOLVED.
 */

exports.up = async function (knex) {
  const hasFlagged = await knex.schema.hasColumn('complaints', 'flagged_for_review');
  if (!hasFlagged) {
    await knex.schema.table('complaints', (table) => {
      table.boolean('flagged_for_review').notNullable().defaultTo(false);
      table.timestamp('flagged_at', { useTz: true }).nullable();
      table.integer('dispute_count').notNullable().defaultTo(0);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.table('complaints', (table) => {
    table.dropColumn('flagged_for_review');
    table.dropColumn('flagged_at');
    table.dropColumn('dispute_count');
  });
};
