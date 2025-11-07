
const jwt = require('jsonwebtoken');
const config = require('./config');

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('Usage: node test-auth-token.js <token>');
  console.log('\nTo get your token:');
  console.log('1. Open browser console (F12)');
  console.log('2. Run: localStorage.getItem("authToken")');
  console.log('3. Copy the token and pass it as argument');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, config.jwtSecret);
  console.log('✅ Token is VALID!');
  console.log('\nDecoded token:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('\nUser ID:', decoded.userId);
  console.log('Issued at:', new Date(decoded.iat * 1000).toLocaleString());
  console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
  
  const now = Date.now() / 1000;
  if (decoded.exp < now) {
    console.log('\n❌ WARNING: Token has EXPIRED! Please log in again.');
  } else {
    const hoursLeft = ((decoded.exp - now) / 3600).toFixed(1);
    console.log(`\n✅ Token is still valid for ${hoursLeft} hours`);
  }
} catch (error) {
  console.log('❌ Token is INVALID!');
  console.log('Error:', error.message);
  console.log('\nPlease log in again to get a new token.');
}

