/**
 * Knex Migration: PostGIS extension, Users, Wards, Complaints, Votes, Comments
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Enable PostGIS and UUID extensions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis";');

  // 2. Users Table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable().index();
    table.string('password_hash').notNullable();
    table.string('full_name').notNullable();
    table.string('role').defaultTo('citizen').notNullable(); // 'citizen', 'official', 'admin'
    table.string('phone').nullable();
    table.string('pincode').nullable().index();
    table.string('avatar_url').nullable();
    table.timestamps(true, true);
  });

  // 3. Wards / Municipalities Table
  await knex.schema.createTable('wards', (table) => {
    table.increments('id').primary();
    table.string('pincode').unique().notNullable().index();
    table.string('ward_name').notNullable();
    table.string('zone_name').notNullable();
    table.string('municipality_name').notNullable();
    table.string('nodal_officer_name').nullable();
    table.string('nodal_officer_email').nullable();
    table.string('contact_number').nullable();
    table.timestamps(true, true);
  });

  // 4. Complaints Table
  await knex.schema.createTable('complaints', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('category').notNullable().index();
    table.string('priority').defaultTo('medium').notNullable().index(); // 'low', 'medium', 'high', 'critical'
    table.string('status').defaultTo('pending').notNullable().index(); // 'pending', 'in_progress', 'resolved', 'rejected'
    table.text('address').nullable();
    table.string('pincode').notNullable().index();
    table.jsonb('image_urls').defaultTo('[]');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.string('assigned_department').nullable();
    table.float('ai_confidence').nullable();
    table.integer('ai_urgency_score').nullable();
    table.integer('upvotes_count').defaultTo(0);
    table.integer('downvotes_count').defaultTo(0);
    table.boolean('is_flagged').defaultTo(false);
    table.timestamp('resolved_at').nullable();
    table.timestamps(true, true);
  });

  // Add PostGIS geometry column for location
  await knex.raw("SELECT AddGeometryColumn('complaints', 'location', 4326, 'POINT', 2);");
  await knex.raw('CREATE INDEX complaints_location_idx ON complaints USING GIST (location);');

  // 5. Votes Table
  await knex.schema.createTable('votes', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('complaint_id').references('id').inTable('complaints').onDelete('CASCADE').notNullable();
    table.string('vote_type').notNullable(); // 'upvote', 'downvote'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'complaint_id']);
  });

  // 6. Comments Table
  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('complaint_id').references('id').inTable('complaints').onDelete('CASCADE').notNullable();
    table.text('content').notNullable();
    table.boolean('is_official').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('votes');
  await knex.schema.dropTableIfExists('complaints');
  await knex.schema.dropTableIfExists('wards');
  await knex.schema.dropTableIfExists('users');
};
