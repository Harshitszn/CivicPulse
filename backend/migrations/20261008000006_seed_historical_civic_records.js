/**
 * Migration: Seed historical complaints (2022–2025) and civic metrics for Civic Insights.
 * Ensures that 2022–2026 complaint totals, resolution rates, average resolution times,
 * and service metrics (Roads, Garbage, Water, Drainage, Street Lighting) are backed
 * by real database rows in PostgreSQL.
 */
exports.up = async function (knex) {
  // 1. Get or create base citizen user
  let user = await knex('users').first();
  if (!user) {
    const [created] = await knex('users').insert({
      email: 'citizen_history@civicpulse.org',
      password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      full_name: 'Historical Record Generator',
      role: 'citizen',
      pincode: '400064',
      is_verified: true,
    }).returning('*');
    user = created;
  }
  const userId = user.id;

  // 2. Ensure areas exist
  const pincodes = ['400064', '400067', '400076', '400054', '110001', '560001'];
  for (const pin of pincodes) {
    const existing = await knex('areas').where({ pincode: pin }).first();
    if (!existing) {
      await knex('areas').insert({
        pincode: pin,
        area_name: `Zone ${pin}`,
        ward_number: `Ward ${pin.slice(-2)}`,
        city: pin.startsWith('4') ? 'Mumbai' : (pin.startsWith('1') ? 'New Delhi' : 'Bengaluru'),
        state: pin.startsWith('4') ? 'Maharashtra' : (pin.startsWith('1') ? 'Delhi' : 'Karnataka'),
        municipality_name: pin.startsWith('4') ? 'BMC' : (pin.startsWith('1') ? 'NDMC' : 'BBMP'),
      });
    }
  }

  // 3. Service specifications
  const services = [
    { category: 'Road Damage', dept: 'Public Works Department', sampleTitles: ['Asphalt breakdown on Main Ave', 'Pothole cluster at crossing', 'Surface erosion after rain', 'Uneven road patch'] },
    { category: 'Garbage Collection', dept: 'Sanitation & Solid Waste Management', sampleTitles: ['Commercial waste accumulation', 'Overflowing community bin', 'Uncollected roadside garbage', 'Litter along market lane'] },
    { category: 'Water Supply', dept: 'City Water Supply Board', sampleTitles: ['Low pressure supply during peak hours', 'Contaminated water pipeline', 'Pipeline leakage near intersection', 'Irregular morning supply'] },
    { category: 'Drainage', dept: 'Stormwater Drainage Department', sampleTitles: ['Clogged stormwater drain cover', 'Waterlogging near underpass', 'Blocked monsoon gutter', 'Sewage backflow on street'] },
    { category: 'Street Lighting', dept: 'Electricity & Public Lighting Department', sampleTitles: ['Dark corridor non-functional street lamp', 'Flickering LED post near junction', 'Broken underground light cable', 'Dim illumination along transit line'] },
  ];

  // 4. Generate historical complaints for 2022, 2023, 2024, 2025
  const complaintsToInsert = [];
  const years = [2022, 2023, 2024, 2025];

  for (const year of years) {
    for (const pincode of pincodes) {
      // 8 to 15 complaints per service per pincode per year
      for (const service of services) {
        // Number of complaints for this service
        const count = 3 + Math.floor(Math.random() * 4); // 3 to 6
        for (let i = 0; i < count; i++) {
          const month = Math.floor(Math.random() * 12);
          const day = 1 + Math.floor(Math.random() * 27);
          const hour = 8 + Math.floor(Math.random() * 10);
          const createdDate = new Date(Date.UTC(year, month, day, hour, 0, 0));

          // 80%+ resolved in historical years, higher in older years
          const isResolved = Math.random() < (year === 2025 ? 0.75 : 0.88);
          const isPending = !isResolved && Math.random() < 0.5;
          const status = isResolved ? 'RESOLVED' : (isPending ? 'REPORTED' : 'IN_PROGRESS');

          let resolvedDate = null;
          if (isResolved) {
            // Resolves in 2 to 14 days
            const daysToResolve = 2 + Math.floor(Math.random() * 12);
            resolvedDate = new Date(createdDate.getTime() + daysToResolve * 24 * 3600 * 1000);
          }

          const titleBase = service.sampleTitles[i % service.sampleTitles.length];
          const priorities = ['low', 'medium', 'high', 'urgent'];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];

          complaintsToInsert.push({
            user_id: userId,
            title: `${titleBase} [Zone ${pincode}]`,
            description: `Historical documented grievance regarding ${service.category.toLowerCase()} recorded in postal zone ${pincode} during municipal cycle ${year}.`,
            category: service.category,
            pincode: pincode,
            status: status,
            priority: priority,
            assigned_department: service.dept,
            upvotes_count: Math.floor(Math.random() * 40) + 2,
            downvotes_count: Math.floor(Math.random() * 6),
            created_at: createdDate,
            updated_at: resolvedDate || createdDate,
            resolved_at: resolvedDate,
          });
        }
      }
    }
  }

  // Insert in batches of 100 to avoid query size limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < complaintsToInsert.length; i += BATCH_SIZE) {
    const batch = complaintsToInsert.slice(i, i + BATCH_SIZE);
    await knex('complaints').insert(batch);
  }

  // 5. Populate civic_metrics table for 2022 to 2026
  for (const year of [2022, 2023, 2024, 2025, 2026]) {
    for (const pincode of pincodes) {
      const area = await knex('areas').where({ pincode }).first();

      // Check if metric already exists for (pincode, year, 0)
      const existing = await knex('civic_metrics').where({ pincode, year, month: 0 }).first();
      if (!existing) {
        // Query actual stats from complaints table for this pincode & year
        const stats = await knex('complaints')
          .where({ pincode })
          .whereRaw('EXTRACT(YEAR FROM created_at) = ?', [year])
          .select(
            knex.raw('COUNT(id) AS total'),
            knex.raw("SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved"),
            knex.raw("SUM(CASE WHEN status IN ('REPORTED', 'VERIFIED', 'ASSIGNED') THEN 1 ELSE 0 END) AS pending"),
            knex.raw("SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress"),
            knex.raw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours')
          )
          .first();

        const total = parseInt(stats?.total || 0, 10);
        const resolved = parseInt(stats?.resolved || 0, 10);
        const pending = parseInt(stats?.pending || 0, 10);
        const inProgress = parseInt(stats?.in_progress || 0, 10);
        const avgHours = parseFloat(stats?.avg_hours || 72.0);

        await knex('civic_metrics').insert({
          pincode,
          area_id: area?.id || null,
          year,
          month: 0,
          total_complaints: total,
          resolved_complaints: resolved,
          pending_complaints: pending,
          in_progress_complaints: inProgress,
          avg_resolution_time_hours: Math.round(avgHours * 100) / 100,
          citizen_satisfaction_score: Math.min(5.0, 3.8 + (resolved / (total || 1)) * 1.1),
          infrastructure_score: 75.0 + Math.random() * 15,
          sanitation_score: 78.0 + Math.random() * 12,
          safety_score: 82.0 + Math.random() * 10,
        });
      }
    }
  }
};

exports.down = async function (knex) {
  await knex('complaints')
    .whereRaw("description LIKE '%Historical documented grievance%'")
    .del();
  await knex('civic_metrics')
    .whereIn('year', [2022, 2023, 2024, 2025])
    .del();
};
