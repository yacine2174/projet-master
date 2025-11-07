const http = require('http');

// Test if port 3001 is available
const testPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.listen(port, () => {
      server.close();
      resolve(true); // Port is available
    });
    
    server.on('error', () => {
      resolve(false); // Port is not available
    });
  });
};

// Test if we can bind to 0.0.0.0
const testHost = async () => {
  console.log('Testing server configuration...');
  
  // Test port 3001
  const port3001Available = await testPort(3001);
  console.log(`Port 3001 available: ${port3001Available}`);
  
  // Test localhost binding
  const localhostTest = await testPort(3001);
  console.log(`Localhost binding test: ${localhostTest}`);
  
  if (port3001Available) {
    console.log('\n✅ Port 3001 is available');
    console.log('✅ You can start the server with: node app.js --host 0.0.0.0');
  } else {
    console.log('\n❌ Port 3001 is not available');
    console.log('❌ Something else is using this port');
  }
};

testHost();
