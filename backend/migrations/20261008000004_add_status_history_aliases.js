/**
 * Migration: Add old_status, new_status, changed_by, note columns to complaint_status_history
 * @param { import("knex").Knex } knex
 */
exports.config = { transaction: false };

exports.up = async function (knex) {
  const hasOldStatus = await knex.schema.hasColumn('complaint_status_history', 'old_status');
  if (!hasOldStatus) {
    await knex.schema.alterTable('complaint_status_history', (table) => {
      table.string('old_status', 50).nullable();
      table.string('new_status', 50).nullable();
      table.string('changed_by', 255).nullable();
      table.text('note').nullable();
    });

    // Populate existing rows
    await knex.raw(`
      UPDATE complaint_status_history
      SET old_status = from_status,
          new_status = to_status,
          changed_by = changed_by_user_id::text,
          note = notes
      WHERE new_status IS NULL;
    `);
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('complaint_status_history', (table) => {
    table.dropColumn('old_status');
    table.dropColumn('new_status');
    table.dropColumn('changed_by');
    table.dropColumn('note');
  });
};
