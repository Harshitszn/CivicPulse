/**
 * Seed initial sample data for CivicPulse
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Clear existing entries
  await knex('comments').del();
  await knex('votes').del();
  await knex('complaints').del();
  await knex('wards').del();
  await knex('users').del();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Seed Users
  const [admin] = await knex('users')
    .insert({
      email: 'admin@civicpulse.org',
      password_hash: passwordHash,
      full_name: 'Municipal Admin',
      role: 'admin',
      phone: '+919876543210',
      pincode: '110001',
    })
    .returning('*');

  const [citizen] = await knex('users')
    .insert({
      email: 'citizen@example.com',
      password_hash: passwordHash,
      full_name: 'Harshit Sharma',
      role: 'citizen',
      phone: '+919876543211',
      pincode: '110001',
    })
    .returning('*');

  // Seed Wards
  await knex('wards').insert([
    {
      pincode: '110001',
      ward_name: 'Connaught Place Ward 01',
      zone_name: 'Central Delhi Zone',
      municipality_name: 'New Delhi Municipal Council (NDMC)',
      nodal_officer_name: 'R. K. Verma',
      nodal_officer_email: 'ward01@ndmc.gov.in',
      contact_number: '011-23340001',
    },
    {
      pincode: '560001',
      ward_name: 'MG Road Ward 110',
      zone_name: 'East Zone',
      municipality_name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
      nodal_officer_name: 'S. Nagaraj',
      nodal_officer_email: 'ward110@bbmp.gov.in',
      contact_number: '080-22221111',
    },
  ]);

  // Seed Complaints with PostGIS point
  const [c1] = await knex('complaints')
    .insert({
      title: 'Dangerous Pothole on Inner Circle Road',
      description: 'Large crater in middle lane causing severe traffic slowdown and hazard for two-wheelers.',
      category: 'Roads & Infrastructure',
      priority: 'high',
      status: 'in_progress',
      address: 'Block B, Inner Circle, Connaught Place',
      pincode: '110001',
      image_urls: JSON.stringify(['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80']),
      user_id: citizen.id,
      assigned_department: 'Road Works Department',
      ai_confidence: 0.96,
      ai_urgency_score: 85,
      upvotes_count: 24,
      downvotes_count: 1,
    })
    .returning('*');

  await knex.raw(
    `UPDATE complaints SET location = ST_SetSRID(ST_MakePoint(77.2197, 28.6315), 4326) WHERE id = ?`,
    [c1.id]
  );
};
