// Script to fix audit data structure
console.log('🔧 Fixing audit data structure...');

// Get existing audits
const audits = JSON.parse(localStorage.getItem('newAudits') || '[]');
console.log('📋 Found audits:', audits.length);

// Fix each audit's normes structure
const fixedAudits = audits.map(audit => {
  if (audit.normes && audit.normes.length > 0) {
    // Check if normes are stored as objects instead of IDs
    if (typeof audit.normes[0] === 'object') {
      console.log('🔧 Fixing audit:', audit.nom);
      console.log('  - Converting norme objects to IDs');
      
      // Extract IDs from norme objects
      const normeIds = audit.normes.map(norme => norme._id || norme.id);
      console.log('  - Extracted IDs:', normeIds);
      
      return {
        ...audit,
        normes: normeIds
      };
    }
  }
  return audit;
});

// Save fixed audits
localStorage.setItem('newAudits', JSON.stringify(fixedAudits));
console.log('✅ Fixed audits saved to localStorage');

// Verify the fix
const verifyAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
console.log('🔍 Verification:');
verifyAudits.forEach(audit => {
  console.log(`  - ${audit.nom}: normes =`, audit.normes);
});

console.log('🎉 Data structure fix complete!');
