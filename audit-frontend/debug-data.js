// Debug script to check all project-related data
console.log('=== PROJECT DATA DEBUG ===');

// Check projects
const projects = JSON.parse(localStorage.getItem('projects') || '[]');
console.log('📁 Projects:', projects.length, projects);

// Check SWOTs
const swots = JSON.parse(localStorage.getItem('swots') || '[]');
console.log('📊 SWOTs:', swots.length, swots.map(s => ({ id: s._id, projet: s.projet, forces: s.forces?.substring(0, 50) + '...' })));

// Check Conceptions
const conceptions = JSON.parse(localStorage.getItem('conceptions') || '[]');
console.log('🏗️ Conceptions:', conceptions.length, conceptions.map(c => ({ id: c._id, projet: c.projet, nom: c.nom })));

// Check Risques
const risques = JSON.parse(localStorage.getItem('risques') || '[]');
console.log('⚠️ Risques:', risques.length, risques.map(r => ({ id: r._id, projet: r.projet, nom: r.nom })));

// Check Constats
const constats = JSON.parse(localStorage.getItem('constats') || '[]');
console.log('📋 Constats:', constats.length, constats.map(c => ({ id: c._id, projet: c.projet, audit: c.audit, description: c.description?.substring(0, 50) + '...' })));

// Check Audits
const audits = JSON.parse(localStorage.getItem('audits') || '[]');
console.log('🔍 Audits:', audits.length, audits.map(a => ({ id: a._id, nom: a.nom, type: a.type })));

console.log('=== FILTERING TEST ===');
// Test filtering for a specific project ID
const testProjectId = 'projet_1'; // Change this to your actual project ID
console.log(`Testing filtering for project: ${testProjectId}`);

const filteredSWOTs = swots.filter(s => s.projet === testProjectId);
console.log('Filtered SWOTs:', filteredSWOTs.length, filteredSWOTs);

const filteredConceptions = conceptions.filter(c => c.projet === testProjectId);
console.log('Filtered Conceptions:', filteredConceptions.length, filteredConceptions);

const filteredRisques = risques.filter(r => r.projet === testProjectId);
console.log('Filtered Risques:', filteredRisques.length, filteredRisques);

const filteredConstats = constats.filter(c => c.projet === testProjectId);
console.log('Filtered Constats:', filteredConstats.length, filteredConstats);
