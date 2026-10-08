const http = require('http');
const app = require('./src/app');
const { generateAccessToken } = require('./src/utils/jwt');
const UserModel = require('./src/models/User');

async function testComplaintApi() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, '127.0.0.1', resolve));

  function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (data) headers['Content-Length'] = Buffer.byteLength(data);

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5098,
          path,
          method,
          headers,
        },
        (res) => {
          let resBody = '';
          res.on('data', (chunk) => (resBody += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(resBody) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: resBody });
            }
          });
        }
      );
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  try {
    // 1. Get or create a citizen user for testing
    let citizen = await UserModel.findByEmail('citizen@example.com');
    if (!citizen) {
      citizen = await UserModel.create({
        email: 'citizen@example.com',
        password_hash: 'hash',
        full_name: 'Test Citizen',
        role: 'citizen',
        pincode: '110001',
      });
    }

    const token = generateAccessToken({
      id: citizen.id,
      email: citizen.email,
      role: citizen.role,
      pincode: citizen.pincode,
    });

    console.log('1. Testing POST /api/complaints with JWT...');
    const createRes = await request(
      'POST',
      '/api/complaints',
      {
        title: 'Broken water pipeline leaking clean water',
        description: 'Large pressure leak on main street near market corner.',
        category: 'Water Supply',
        requirement: 'Urgent valve repair & pipe replacement',
        priority: 'high',
        pincode: '110001',
        latitude: 28.632,
        longitude: 77.22,
        is_anonymous: false,
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
        estimatedResolutionTime: '24–48 Hours',
      },
      token
    );

    console.log('Create Response Status:', createRes.status);
    console.log('Create Response Body:', createRes.data);

    if (createRes.status !== 201 || !createRes.data?.data?.complaint?.id) {
      throw new Error('Failed to create complaint via POST /api/complaints');
    }

    const created = createRes.data.data.complaint;
    console.log(`Created complaint id: ${created.id}, status: ${created.status}, created_by: ${created.created_by}`);

    if (created.status !== 'REPORTED') {
      throw new Error(`Expected default status 'REPORTED', got: ${created.status}`);
    }
    if (created.created_by !== citizen.id) {
      throw new Error(`Expected created_by to match JWT user id ${citizen.id}, got: ${created.created_by}`);
    }

    // 2. Test GET /api/complaints
    console.log('\n2. Testing GET /api/complaints...');
    const listRes = await request('GET', '/api/complaints?pincode=110001');
    console.log('List Response Status:', listRes.status);
    console.log('List Count:', listRes.data?.data?.length || 0);

    // 3. Test GET /api/complaints/:id
    console.log(`\n3. Testing GET /api/complaints/${created.id}...`);
    const getRes = await request('GET', `/api/complaints/${created.id}`);
    console.log('Get Response Status:', getRes.status);
    console.log('Get Response Title:', getRes.data?.data?.complaint?.title);

    if (getRes.status !== 200 || getRes.data?.data?.complaint?.id !== created.id) {
      throw new Error('Failed to fetch complaint by ID');
    }

    // 4. Test PATCH /api/complaints/:id
    console.log(`\n4. Testing PATCH /api/complaints/${created.id}...`);
    const patchRes = await request(
      'PATCH',
      `/api/complaints/${created.id}`,
      {
        requirement: 'Urgent valve repair & trench reinforcement',
      },
      token
    );
    console.log('Patch Response Status:', patchRes.status);
    console.log('Patch Requirement:', patchRes.data?.data?.complaint?.requirement);

    if (patchRes.status !== 200 || patchRes.data?.data?.complaint?.requirement !== 'Urgent valve repair & trench reinforcement') {
      throw new Error('Failed to patch complaint');
    }

    console.log('\n✅ ALL BACKEND COMPLAINT API ENDPOINT TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Complaint API test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testComplaintApi();
