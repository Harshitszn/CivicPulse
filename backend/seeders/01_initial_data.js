/**
 * Seed initial sample data for CivicPulse (Production PostgreSQL + PostGIS Schema)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Clear existing entries in reverse foreign-key order
  await knex('civic_metrics').del();
  await knex('resolution_verifications').del();
  await knex('complaint_status_history').del();
  await knex('votes').del();
  await knex('complaint_images').del();
  await knex('complaints').del();
  await knex('staff').del();
  await knex('departments').del();
  await knex('areas').del();
  await knex('users').del();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Users
  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@civicpulse.org',
      password_hash: passwordHash,
      full_name: 'Municipal Administrator',
      role: 'admin',
      phone: '+919876543210',
      pincode: '110001',
      is_verified: true,
    })
    .returning('*');

  const [staffUser] = await knex('users')
    .insert({
      email: 'officer.verma@ndmc.gov.in',
      password_hash: passwordHash,
      full_name: 'R. K. Verma',
      role: 'official',
      phone: '+919876543212',
      pincode: '110001',
      is_verified: true,
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
      is_verified: true,
    })
    .returning('*');

  // 2. Seed Areas
  const [area1] = await knex('areas')
    .insert({
      pincode: '110001',
      area_name: 'Connaught Place & Central Secretariat',
      ward_number: 'Ward 01',
      zone_name: 'Central Delhi Zone',
      city: 'New Delhi',
      state: 'Delhi',
      municipality_name: 'New Delhi Municipal Council (NDMC)',
    })
    .returning('*');

  const [area2] = await knex('areas')
    .insert({
      pincode: '560001',
      area_name: 'MG Road & Brigade Area',
      ward_number: 'Ward 110',
      zone_name: 'East Zone',
      city: 'Bengaluru',
      state: 'Karnataka',
      municipality_name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    })
    .returning('*');

  // 3. Seed Departments
  const [deptRoads] = await knex('departments')
    .insert({
      name: 'Road Works & Infrastructure Department',
      code: 'PWD_ROADS',
      description: 'Responsible for road maintenance, potholes, footpaths, and flyovers.',
      contact_email: 'roads@ndmc.gov.in',
      contact_phone: '011-23340001',
    })
    .returning('*');

  const [deptSanitation] = await knex('departments')
    .insert({
      name: 'Sanitation & Solid Waste Management',
      code: 'MUNI_SANITATION',
      description: 'Garbage disposal, street sweeping, and public hygiene.',
      contact_email: 'sanitation@ndmc.gov.in',
      contact_phone: '011-23340002',
    })
    .returning('*');

  // 4. Seed Staff
  const [staffMember] = await knex('staff')
    .insert({
      user_id: staffUser.id,
      department_id: deptRoads.id,
      area_id: area1.id,
      designation: 'Senior Nodal Engineer',
      employee_id: 'NDMC-ENG-0842',
    })
    .returning('*');

  // 5. Seed Complaints
  const [complaint1] = await knex('complaints')
    .insert({
      title: 'Dangerous Pothole on Inner Circle Road',
      description: 'Large crater in the middle lane causing severe traffic slowdown and a high accident risk for two-wheelers.',
      category: 'Roads & Infrastructure',
      priority: 'high',
      status: 'in_progress',
      address: 'Block B, Inner Circle, Connaught Place',
      pincode: '110001',
      area_id: area1.id,
      user_id: citizen.id,
      department_id: deptRoads.id,
      assigned_staff_id: staffMember.id,
      ai_confidence: 96.5,
      ai_urgency_score: 85,
      upvotes_count: 32,
      downvotes_count: 1,
    })
    .returning('*');

  // Set PostGIS Point location for complaint1 (Connaught Place coordinates: 28.6315, 77.2197)
  await knex.raw(
    `UPDATE complaints SET location = ST_SetSRID(ST_MakePoint(77.2197, 28.6315), 4326) WHERE id = ?`,
    [complaint1.id]
  );

  // 6. Seed Complaint Images (Cloudinary URLs + metadata, no raw binaries)
  await knex('complaint_images').insert([
    {
      complaint_id: complaint1.id,
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      public_id: 'civicpulse/complaints/pothole_cp_01',
      file_size: 428100,
      mime_type: 'image/jpeg',
      is_resolution_proof: false,
    },
  ]);

  // 7. Seed Votes
  await knex('votes').insert([
    {
      user_id: citizen.id,
      complaint_id: complaint1.id,
      vote_type: 'upvote',
    },
  ]);

  // 8. Seed Status History
  await knex('complaint_status_history').insert([
    {
      complaint_id: complaint1.id,
      changed_by_user_id: citizen.id,
      from_status: null,
      to_status: 'pending',
      notes: 'Complaint submitted by citizen via mobile app.',
    },
    {
      complaint_id: complaint1.id,
      changed_by_user_id: staffUser.id,
      from_status: 'pending',
      to_status: 'in_progress',
      notes: 'Assigned to field inspection team. Repair scheduled for tonight.',
    },
  ]);

  // 9. Seed Civic Metrics
  await knex('civic_metrics').insert([
    {
      pincode: '110001',
      area_id: area1.id,
      year: 2026,
      month: 0, // annual summary
      total_complaints: 142,
      resolved_complaints: 118,
      pending_complaints: 14,
      in_progress_complaints: 10,
      avg_resolution_time_hours: 28.5,
      citizen_satisfaction_score: 4.35,
      infrastructure_score: 82.4,
      sanitation_score: 89.1,
      safety_score: 86.0,
    },
    {
      pincode: '560001',
      area_id: area2.id,
      year: 2026,
      month: 0,
      total_complaints: 98,
      resolved_complaints: 76,
      pending_complaints: 12,
      in_progress_complaints: 10,
      avg_resolution_time_hours: 34.0,
      citizen_satisfaction_score: 4.1,
      infrastructure_score: 78.5,
      sanitation_score: 83.2,
      safety_score: 81.0,
    },
  ]);
};
