/**
 * Knex Migration: PostgreSQL + PostGIS Schema for CivicPulse
 * Creates tables:
 *  1. users
 *  2. areas
 *  3. departments
 *  4. staff
 *  5. complaints
 *  6. complaint_images
 *  7. votes
 *  8. complaint_status_history
 *  9. resolution_verifications
 * 10. civic_metrics
 *
 * Includes indexes, composite indexes, PostGIS spatial columns, and triggers for updated_at.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.config = { transaction: false };

exports.up = async function (knex) {
  // 1. Extensions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis";');

  // Clean existing tables if any partial runs occurred
  await knex.raw(`
    DROP TABLE IF EXISTS 
      civic_metrics, 
      resolution_verifications, 
      complaint_status_history, 
      votes, 
      complaint_images, 
      complaints, 
      staff, 
      departments, 
      areas, 
      users CASCADE;
  `);

  // Helper trigger function for auto updating updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ─────────────────────────────────────────────────────────────
  // 1. USERS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('citizen'); // 'citizen', 'official', 'staff', 'admin'
    table.string('phone', 50).nullable();
    table.string('pincode', 20).nullable();
    table.text('avatar_url').nullable();
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_users_pincode ON users (pincode);');
  await knex.schema.raw('CREATE INDEX idx_users_role ON users (role);');
  await knex.schema.raw(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 2. AREAS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('areas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('pincode', 20).notNullable().unique();
    table.string('area_name', 255).notNullable();
    table.string('ward_number', 100).nullable();
    table.string('zone_name', 255).notNullable();
    table.string('city', 255).notNullable().defaultTo('Delhi');
    table.string('state', 255).notNullable().defaultTo('Delhi');
    table.string('municipality_name', 255).notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_areas_zone_name ON areas (zone_name);');
  await knex.schema.raw(`
    CREATE TRIGGER update_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 3. DEPARTMENTS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('departments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable().unique();
    table.string('code', 50).notNullable().unique();
    table.text('description').nullable();
    table.string('contact_email', 255).nullable();
    table.string('contact_phone', 50).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 4. STAFF TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('staff', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('department_id').notNullable().references('id').inTable('departments').onDelete('RESTRICT');
    table.uuid('area_id').nullable().references('id').inTable('areas').onDelete('SET NULL');
    table.string('designation', 100).notNullable();
    table.string('employee_id', 100).notNullable().unique();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_staff_user_id ON staff (user_id);');
  await knex.schema.raw('CREATE INDEX idx_staff_department_id ON staff (department_id);');
  await knex.schema.raw('CREATE INDEX idx_staff_area_id ON staff (area_id);');
  await knex.schema.raw(`
    CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 5. COMPLAINTS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('complaints', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.string('category', 100).notNullable();
    table.string('priority', 50).notNullable().defaultTo('medium'); // 'low', 'medium', 'high', 'critical'
    table.string('status', 50).notNullable().defaultTo('pending'); // 'pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'verified'
    table.text('address').nullable();
    table.string('pincode', 20).notNullable();
    table.uuid('area_id').nullable().references('id').inTable('areas').onDelete('SET NULL');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.uuid('assigned_staff_id').nullable().references('id').inTable('staff').onDelete('SET NULL');
    table.specificType('location', 'geometry(Point, 4326)').nullable();
    table.specificType('ai_confidence', 'numeric(5, 2)').nullable();
    table.integer('ai_urgency_score').nullable();
    table.integer('upvotes_count').notNullable().defaultTo(0);
    table.integer('downvotes_count').notNullable().defaultTo(0);
    table.boolean('is_flagged').notNullable().defaultTo(false);
    table.timestamp('resolved_at', { useTz: true }).nullable();
    table.timestamps(true, true);
  });

  // Single-column indexes
  await knex.schema.raw('CREATE INDEX idx_complaints_pincode ON complaints (pincode);');
  await knex.schema.raw('CREATE INDEX idx_complaints_category ON complaints (category);');
  await knex.schema.raw('CREATE INDEX idx_complaints_status ON complaints (status);');
  await knex.schema.raw('CREATE INDEX idx_complaints_created_at ON complaints (created_at DESC);');
  await knex.schema.raw('CREATE INDEX idx_complaints_location ON complaints USING GIST (location);');
  await knex.schema.raw('CREATE INDEX idx_complaints_user_id ON complaints (user_id);');
  await knex.schema.raw('CREATE INDEX idx_complaints_dept_id ON complaints (department_id);');

  // Composite indexes for query optimization
  await knex.schema.raw('CREATE INDEX idx_complaints_pincode_status ON complaints (pincode, status);');
  await knex.schema.raw('CREATE INDEX idx_complaints_category_status ON complaints (category, status);');
  await knex.schema.raw('CREATE INDEX idx_complaints_status_created_at ON complaints (status, created_at DESC);');
  await knex.schema.raw('CREATE INDEX idx_complaints_user_created ON complaints (user_id, created_at DESC);');

  await knex.schema.raw(`
    CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 6. COMPLAINT IMAGES TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('complaint_images', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('complaint_id').notNullable().references('id').inTable('complaints').onDelete('CASCADE');
    table.text('image_url').notNullable();
    table.string('public_id', 255).nullable();
    table.integer('file_size').nullable();
    table.string('mime_type', 100).nullable();
    table.boolean('is_resolution_proof').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_complaint_images_complaint_id ON complaint_images (complaint_id);');
  await knex.schema.raw('CREATE INDEX idx_complaint_images_proof ON complaint_images (complaint_id, is_resolution_proof);');

  // ─────────────────────────────────────────────────────────────
  // 7. VOTES TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('votes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('complaint_id').notNullable().references('id').inTable('complaints').onDelete('CASCADE');
    table.string('vote_type', 20).notNullable(); // 'upvote', 'downvote'
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'complaint_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_votes_complaint_id ON votes (complaint_id);');
  await knex.schema.raw('CREATE INDEX idx_votes_user_id ON votes (user_id);');

  // ─────────────────────────────────────────────────────────────
  // 8. COMPLAINT STATUS HISTORY TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('complaint_status_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('complaint_id').notNullable().references('id').inTable('complaints').onDelete('CASCADE');
    table.uuid('changed_by_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('from_status', 50).nullable();
    table.string('to_status', 50).notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_status_history_complaint_id ON complaint_status_history (complaint_id);');
  await knex.schema.raw('CREATE INDEX idx_status_history_created_at ON complaint_status_history (created_at DESC);');

  // ─────────────────────────────────────────────────────────────
  // 9. RESOLUTION VERIFICATIONS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('resolution_verifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('complaint_id').notNullable().references('id').inTable('complaints').onDelete('CASCADE');
    table.uuid('verified_by_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_confirmed_resolved').notNullable();
    table.integer('feedback_rating').nullable(); // 1 to 5
    table.text('remarks').nullable();
    table.text('proof_image_url').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_res_verif_complaint_id ON resolution_verifications (complaint_id);');
  await knex.schema.raw('CREATE INDEX idx_res_verif_user_id ON resolution_verifications (verified_by_user_id);');
  await knex.schema.raw(`
    CREATE TRIGGER update_resolution_verifications_updated_at
    BEFORE UPDATE ON resolution_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // ─────────────────────────────────────────────────────────────
  // 10. CIVIC METRICS TABLE
  // ─────────────────────────────────────────────────────────────
  await knex.schema.createTable('civic_metrics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('pincode', 20).notNullable();
    table.uuid('area_id').nullable().references('id').inTable('areas').onDelete('SET NULL');
    table.integer('year').notNullable();
    table.integer('month').notNullable().defaultTo(0); // 0 = full year, 1-12 = specific month
    table.integer('total_complaints').notNullable().defaultTo(0);
    table.integer('resolved_complaints').notNullable().defaultTo(0);
    table.integer('pending_complaints').notNullable().defaultTo(0);
    table.integer('in_progress_complaints').notNullable().defaultTo(0);
    table.specificType('avg_resolution_time_hours', 'numeric(8, 2)').notNullable().defaultTo(0.00);
    table.specificType('citizen_satisfaction_score', 'numeric(4, 2)').notNullable().defaultTo(0.00);
    table.specificType('infrastructure_score', 'numeric(4, 2)').notNullable().defaultTo(0.00);
    table.specificType('sanitation_score', 'numeric(4, 2)').notNullable().defaultTo(0.00);
    table.specificType('safety_score', 'numeric(4, 2)').notNullable().defaultTo(0.00);
    table.timestamps(true, true);

    table.unique(['pincode', 'year', 'month']);
  });

  await knex.schema.raw('CREATE INDEX idx_civic_metrics_pincode ON civic_metrics (pincode);');
  await knex.schema.raw('CREATE INDEX idx_civic_metrics_year ON civic_metrics (year);');
  await knex.schema.raw('CREATE INDEX idx_civic_metrics_pincode_year ON civic_metrics (pincode, year);');
  await knex.schema.raw(`
    CREATE TRIGGER update_civic_metrics_updated_at
    BEFORE UPDATE ON civic_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('civic_metrics');
  await knex.schema.dropTableIfExists('resolution_verifications');
  await knex.schema.dropTableIfExists('complaint_status_history');
  await knex.schema.dropTableIfExists('votes');
  await knex.schema.dropTableIfExists('complaint_images');
  await knex.schema.dropTableIfExists('complaints');
  await knex.schema.dropTableIfExists('staff');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('areas');
  await knex.schema.dropTableIfExists('users');

  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;');
};
