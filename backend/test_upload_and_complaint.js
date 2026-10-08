const http = require('http');
const app = require('./src/app');
const { generateAccessToken } = require('./src/utils/jwt');
const UserModel = require('./src/models/User');
const { db } = require('./src/config/database');

async function testUploadFlow() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5102, '127.0.0.1', resolve));

  function multipartPost(path, fieldName, filename, mimeType, buffer, token, extraFields = {}) {
    return new Promise((resolve, reject) => {
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      let postData = '';

      // Extra fields
      for (const [key, val] of Object.entries(extraFields)) {
        postData += `--${boundary}\r\n`;
        postData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        postData += `${val}\r\n`;
      }

      if (buffer) {
        postData += `--${boundary}\r\n`;
        postData += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
        postData += `Content-Type: ${mimeType}\r\n\r\n`;
      }

      const postDataHead = Buffer.from(postData, 'utf-8');
      const postDataTail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
      const fullBody = buffer ? Buffer.concat([postDataHead, buffer, postDataTail]) : Buffer.from(`--${boundary}--\r\n`, 'utf-8');

      const headers = {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5102,
          path,
          method: 'POST',
          headers,
        },
        (res) => {
          let body = '';
          res.on('data', (d) => (body += d));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode, raw: body });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(fullBody);
      req.end();
    });
  }

  function jsonPost(path, body, token) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5102,
          path,
          method: 'POST',
          headers,
        },
        (res) => {
          let resBody = '';
          res.on('data', (d) => (resBody += d));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(resBody) });
            } catch {
              resolve({ status: res.statusCode, raw: resBody });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  try {
    // 1. Get test user & token
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

    console.log('1. Testing POST /api/uploads/complaint-image without auth (expect 401)...');
    const noAuthRes = await multipartPost('/api/uploads/complaint-image', 'image', 'test.jpg', 'image/jpeg', Buffer.from('fake'), null);
    console.log('No auth status:', noAuthRes.status);
    if (noAuthRes.status !== 401) throw new Error('Expected 401 for unauthenticated upload');

    console.log('\n2. Testing POST /api/uploads/complaint-image without file (expect 400)...');
    const noFileRes = await multipartPost('/api/uploads/complaint-image', 'image', null, null, null, token);
    console.log('No file status:', noFileRes.status);
    if (noFileRes.status !== 400) throw new Error('Expected 400 for upload without file');

    console.log('\n3. Testing POST /api/uploads/complaint-image with invalid MIME type (expect 400)...');
    const badMimeRes = await multipartPost('/api/uploads/complaint-image', 'image', 'test.txt', 'text/plain', Buffer.from('bad'), token);
    console.log('Bad MIME status:', badMimeRes.status);
    if (badMimeRes.status !== 400) throw new Error('Expected 400 for invalid MIME type');

    console.log('\n4. Testing POST /api/uploads/complaint-image with valid image buffer + JWT...');
    // Simple 1x1 PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const uploadRes = await multipartPost('/api/uploads/complaint-image', 'image', 'pothole_proof.png', 'image/png', pngBuffer, token);
    console.log('Upload status:', uploadRes.status);
    console.log('Upload response data:', uploadRes.data);

    if (uploadRes.status !== 201 || !uploadRes.data?.data?.image?.id) {
      throw new Error('Upload failed');
    }

    const imageInfo = uploadRes.data.data.image;
    console.log(`Uploaded image ID: ${imageInfo.id}, Cloudinary URL: ${imageInfo.cloudinary_url}`);

    // Verify row in PostgreSQL complaint_images table
    const dbRecord = await db('complaint_images').where({ id: imageInfo.id }).first();
    console.log('DB complaint_images row:', {
      id: dbRecord.id,
      cloudinary_url: dbRecord.cloudinary_url,
      public_id: dbRecord.public_id,
      created_at: dbRecord.created_at,
    });
    if (!dbRecord || !dbRecord.cloudinary_url) {
      throw new Error('Database record missing cloudinary_url');
    }

    console.log('\n5. Testing complaint creation linking the uploaded image...');
    const complaintRes = await jsonPost(
      '/api/complaints',
      {
        title: 'Deep crater on bypass road corner',
        description: 'Road cave-in requires immediate structural repair and barrier installation.',
        category: 'Roads & Infrastructure',
        requirement: 'Urgent asphalt patching and safety barriers',
        priority: 'high',
        pincode: '110001',
        imageUrl: imageInfo.cloudinary_url,
        imageId: imageInfo.id,
      },
      token
    );

    console.log('Complaint creation status:', complaintRes.status);
    const complaint = complaintRes.data?.data?.complaint;
    console.log('Created complaint ID:', complaint?.id);
    console.log('Complaint image URL:', complaint?.imageUrl);

    // Verify complaint_images table updated with complaint_id
    const updatedDbImage = await db('complaint_images').where({ id: imageInfo.id }).first();
    console.log('Updated complaint_images complaint_id:', updatedDbImage.complaint_id);
    if (updatedDbImage.complaint_id !== complaint.id) {
      throw new Error(`Expected complaint_id ${complaint.id}, got ${updatedDbImage.complaint_id}`);
    }

    console.log('\n✅ ALL CLOUD IMAGE UPLOAD AND COMPLAINT ASSOCIATIONS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testUploadFlow();
