// Debug script to check audit and normes data
console.log('🔍 Debugging audit and normes data...');

// Check localStorage data
const audits = JSON.parse(localStorage.getItem('newAudits') || '[]');
const normes = JSON.parse(localStorage.getItem('normes') || '[]');

console.log('📋 Total audits:', audits.length);
console.log('📋 Total normes:', normes.length);

if (audits.length > 0) {
  const latestAudit = audits[0];
  console.log('🎯 Latest audit:', latestAudit.nom);
  console.log('📋 Audit normes:', latestAudit.normes);
  
  if (latestAudit.normes && latestAudit.normes.length > 0) {
    console.log('🔍 Looking for normes with IDs:', latestAudit.normes);
    
    const assignedNormes = normes.filter(n => latestAudit.normes.includes(n._id));
    console.log('✅ Found assigned normes:', assignedNormes.length);
    console.log('📋 Assigned normes:', assignedNormes.map(n => n.nom));
  } else {
    console.log('❌ No normes assigned to this audit');
  }
} else {
  console.log('❌ No audits found');
}

// Check if normes exist
if (normes.length > 0) {
  console.log('📋 Available normes:');
  normes.forEach(n => {
    console.log(`  - ${n.nom} (${n._id}) - ${n.categorie}`);
  });
} else {
  console.log('❌ No normes found in localStorage');
}
