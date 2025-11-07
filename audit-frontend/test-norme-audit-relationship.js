// Test script to verify norme-audit relationships
console.log('🔍 Testing norme-audit relationships...');

// Get data from localStorage
const audits = JSON.parse(localStorage.getItem('newAudits') || '[]');
const normes = JSON.parse(localStorage.getItem('normes') || '[]');

console.log('📋 Total audits:', audits.length);
console.log('📋 Total normes:', normes.length);

// Test each norme
normes.forEach(norme => {
  console.log(`\n🎯 Testing norme: ${norme.nom} (${norme._id})`);
  
  const associatedAudits = audits.filter(audit => {
    if (audit.normes && audit.normes.length > 0) {
      if (typeof audit.normes[0] === 'string') {
        return audit.normes.includes(norme._id);
      } else {
        return audit.normes.some(n => n._id === norme._id);
      }
    }
    return false;
  });
  
  console.log(`  ✅ Associated audits: ${associatedAudits.length}`);
  associatedAudits.forEach(audit => {
    console.log(`    - ${audit.nom} (${audit._id})`);
  });
});

// Test each audit
audits.forEach(audit => {
  console.log(`\n🔍 Testing audit: ${audit.nom} (${audit._id})`);
  console.log(`  📋 Normes:`, audit.normes);
  
  if (audit.normes && audit.normes.length > 0) {
    audit.normes.forEach(normeId => {
      const norme = normes.find(n => n._id === normeId);
      if (norme) {
        console.log(`    ✅ Found norme: ${norme.nom}`);
      } else {
        console.log(`    ❌ Missing norme: ${normeId}`);
      }
    });
  }
});

console.log('\n🎉 Relationship test complete!');
