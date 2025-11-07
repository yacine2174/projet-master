const http = require('http');

console.log('🔍 Testing backend connection...\n');

// Test if backend is running on port 3000
const testBackend = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/utilisateurs/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend is running! Status: ${res.statusCode}`);
    console.log(`   URL: http://localhost:3000`);
    console.log(`   Response headers:`, res.headers);
  });

  req.on('error', (error) => {
    console.log(`❌ Backend connection failed: ${error.message}`);
    console.log(`   Make sure to run: npm start`);
  });

  req.write(JSON.stringify({ email: 'test@example.com' }));
  req.end();
};

// Test if frontend can reach backend
const testFrontendConnection = () => {
  console.log('\n🌐 Testing frontend to backend connection...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Frontend can reach backend! Status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.log(`❌ Frontend cannot reach backend: ${error.message}`);
  });

  req.end();
};

testBackend();
setTimeout(testFrontendConnection, 1000);
