// Script to manually set up normes in localStorage
const sampleNormes = [
  {
    _id: 'norme-iso27001',
    nom: 'ISO 27001:2022',
    categorie: 'ISO 27001',
    version: '2022',
    description: 'Système de management de la sécurité de l\'information',
    audits: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'norme-nist-csf',
    nom: 'NIST Cybersecurity Framework',
    categorie: 'NIST',
    version: '1.1',
    description: 'Framework de cybersécurité du NIST',
    audits: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'norme-cis-controls',
    nom: 'CIS Controls',
    categorie: 'CIS',
    version: '8.0',
    description: 'Contrôles de sécurité essentiels du CIS',
    audits: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'norme-owasp-top10',
    nom: 'OWASP Top 10',
    categorie: 'OWASP',
    version: '2021',
    description: 'Top 10 des risques de sécurité des applications web',
    audits: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'norme-nist-sp800-53',
    nom: 'NIST SP 800-53',
    categorie: 'NIST',
    version: 'Rev. 5',
    description: 'Contrôles de sécurité pour systèmes fédéraux',
    audits: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Set in localStorage
localStorage.setItem('normes', JSON.stringify(sampleNormes));
console.log('✅ Normes set in localStorage:', sampleNormes.length);
console.log('📋 Normes:', sampleNormes.map(n => n.nom));

// Test filtering
const orgNormes = sampleNormes.filter(n => n.categorie === 'ISO 27001' || n.categorie === 'NIST' || n.categorie === 'CIS');
const techNormes = sampleNormes.filter(n => n.categorie === 'OWASP' || n.categorie === 'NIST' || n.categorie === 'CIS');

console.log('🏢 Organisationnel normes:', orgNormes.length, orgNormes.map(n => n.nom));
console.log('🔧 Technique normes:', techNormes.length, techNormes.map(n => n.nom));
