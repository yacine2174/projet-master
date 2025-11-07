// Debug script to check user data in localStorage
console.log('=== USER DEBUG INFO ===');
console.log('Auth Token:', localStorage.getItem('authToken'));
console.log('Auth User:', localStorage.getItem('authUser'));

try {
  const user = JSON.parse(localStorage.getItem('authUser') || '{}');
  console.log('Parsed User:', user);
  console.log('User Role:', user.role);
  console.log('User Status:', user.status);
} catch (e) {
  console.error('Error parsing user data:', e);
}

console.log('=== ALL LOCALSTORAGE KEYS ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key));
}
