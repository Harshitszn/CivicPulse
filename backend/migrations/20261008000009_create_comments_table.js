/**
 * Comments table used by citizen discussion and official updates.
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('comments');
  if (exists) return;

  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('complaint_id').notNullable().references('id').inTable('complaints').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.boolean('is_official').notNullable().defaultTo(false);
    table.boolean('is_anonymous').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_comments_complaint_id ON comments (complaint_id, created_at);');
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('comments');
};
