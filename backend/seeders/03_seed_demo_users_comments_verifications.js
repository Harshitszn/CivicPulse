/**
 * Seed demo users, discussion comments, and resolution verifications.
 * Complaint rows themselves live in 01_initial_data and 02_seed_feedloop_complaints.
 * @param { import("knex").Knex } knex
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const demoUsers = [
    { email: 'citizen1@demo.com', full_name: 'Priya Sharma', role: 'citizen', pincode: '400064' },
    { email: 'citizen2@demo.com', full_name: 'Aarav Mehta', role: 'citizen', pincode: '400064' },
    { email: 'citizen3@demo.com', full_name: 'Rohan Gupta', role: 'citizen', pincode: '400076' },
    { email: 'citizen4@demo.com', full_name: 'Meena Singh', role: 'citizen', pincode: '400067' },
    { email: 'citizen5@demo.com', full_name: 'Vikram Patel', role: 'citizen', pincode: '400054' },
    { email: 'officer@demo.com', full_name: 'Officer Rajesh V.', role: 'official', pincode: '400064' },
    { email: 'ravi.kumar@demo.com', full_name: 'Ravi Kumar', role: 'citizen', pincode: '400064' },
    { email: 'kavita.m@demo.com', full_name: 'Kavita M.', role: 'citizen', pincode: '400076' },
    { email: 'suresh.b@demo.com', full_name: 'Suresh B.', role: 'citizen', pincode: '400064' },
  ];

  const userByEmail = {};
  for (const u of demoUsers) {
    let existing = await knex('users').where({ email: u.email }).first();
    if (!existing) {
      const [created] = await knex('users')
        .insert({
          email: u.email,
          password_hash: passwordHash,
          full_name: u.full_name,
          role: u.role,
          pincode: u.pincode,
          is_verified: true,
        })
        .returning('*');
      existing = created;
    }
    userByEmail[u.email] = existing;
  }

  const officer =
    (await knex('users').where({ email: 'officer.verma@ndmc.gov.in' }).first()) ||
    userByEmail['officer@demo.com'];

  const commentsByTitle = [
    {
      title: 'Hazardous deep pothole on Link Road near Orlem Junction',
      comments: [
        { email: 'ravi.kumar@demo.com', content: 'I witnessed a scooter skid near this exact pothole yesterday. Needs immediate asphalt patching!', is_official: false },
        { email: officer?.email, content: 'Official Update: Inspection completed. Road repair crew assigned under Work Order #RW-4892. Patchwork scheduled for tomorrow 8 AM.', is_official: true },
        { email: 'citizen4@demo.com', content: 'Thank you for the quick official response! Really appreciate the update.', is_official: false },
      ],
    },
    {
      title: 'No water supply for 3 days in Hiranandani Gardens Sector 4',
      comments: [
        { email: 'kavita.m@demo.com', content: 'Same issue in Sector 4! Water pressure has been zero since Tuesday morning.', is_official: false },
        { email: officer?.email, content: 'Official Update: Emergency water tankers dispatched to Hiranandani Sector 4 market square. Main valve repair in progress.', is_official: true },
      ],
    },
    {
      title: 'Garbage dump accumulating near St. Joseph High School',
      comments: [
        { email: 'suresh.b@demo.com', content: 'Stray animals are spreading this garbage all over the pavement. Needs daily morning collection.', is_official: false },
        { email: officer?.email, content: 'Official Update: Dedicated compactor truck dispatched for morning clearing.', is_official: true },
      ],
    },
  ];

  for (const group of commentsByTitle) {
    const complaint = await knex('complaints').where({ title: group.title }).first();
    if (!complaint) continue;

    for (const c of group.comments) {
      const author = c.email ? (userByEmail[c.email] || await knex('users').where({ email: c.email }).first()) : officer;
      if (!author) continue;

      const existing = await knex('comments')
        .where({ complaint_id: complaint.id, user_id: author.id, content: c.content })
        .first();
      if (existing) continue;

      await knex('comments').insert({
        complaint_id: complaint.id,
        user_id: author.id,
        content: c.content,
        is_official: Boolean(c.is_official),
        is_anonymous: false,
      });
    }
  }

  const verificationTargets = [
    { title: 'Hazardous deep pothole on Link Road near Orlem Junction', confirmed: true },
    { title: 'No water supply for 3 days in Hiranandani Gardens Sector 4', confirmed: true },
    { title: 'Garbage dump accumulating near St. Joseph High School', confirmed: false },
  ];

  const citizens = Object.values(userByEmail).filter((u) => u.role === 'citizen');
  for (const target of verificationTargets) {
    const complaint = await knex('complaints').where({ title: target.title }).first();
    if (!complaint) continue;

    for (const citizen of citizens.slice(0, 3)) {
      if (String(citizen.pincode) !== String(complaint.pincode)) continue;
      const existing = await knex('resolution_verifications')
        .where({ complaint_id: complaint.id, verified_by_user_id: citizen.id })
        .first();
      if (existing) continue;
      await knex('resolution_verifications').insert({
        complaint_id: complaint.id,
        verified_by_user_id: citizen.id,
        is_confirmed_resolved: target.confirmed,
        remarks: target.confirmed ? 'Status confirmed by resident' : 'Issue still visible on site',
      });
    }
  }

  console.log('Seeded demo users, comments, and verifications.');
};
