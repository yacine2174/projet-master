require('dotenv').config();
const mongoose = require('mongoose');
const Norme = require('./models/Normes');

/**
 * Script to seed the database with default norms
 * Run with: node seed-normes.js
 */

const sampleNormes = [
  // ISO Standards (for Organisational audits)
  {
    nom: 'ISO 27001:2022',
    categorie: 'ISO 27001',
    version: '2022',
    description: 'Système de management de la sécurité de l\'information - Exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un système de management de la sécurité de l\'information'
  },
  {
    nom: 'ISO 27002:2022',
    categorie: 'ISO 27001',
    version: '2022',
    description: 'Code de bonnes pratiques pour le management de la sécurité de l\'information - Lignes directrices pour les contrôles de sécurité organisationnels'
  },
  {
    nom: 'ISO 27005:2018',
    categorie: 'ISO 27001',
    version: '2018',
    description: 'Management du risque lié à la sécurité de l\'information'
  },
  {
    nom: 'ISO 27017:2015',
    categorie: 'ISO 27001',
    version: '2015',
    description: 'Code de bonnes pratiques pour les contrôles de sécurité de l\'information fondés sur l\'ISO/IEC 27002 pour les services de cloud computing'
  },
  {
    nom: 'ISO 27018:2019',
    categorie: 'ISO 27001',
    version: '2019',
    description: 'Code de bonnes pratiques pour la protection des informations personnelles identifiables (PII) dans les clouds publics agissant en tant que sous-traitants de PII'
  },
  {
    nom: 'ISO 9001:2015',
    categorie: 'ISO',
    version: '2015',
    description: 'Systèmes de management de la qualité - Exigences'
  },
  {
    nom: 'ISO 22301:2019',
    categorie: 'ISO',
    version: '2019',
    description: 'Sécurité et résilience - Systèmes de management de la continuité d\'activité - Exigences'
  },
  
  // NIST Standards (for both Organisational and Technical audits)
  {
    nom: 'NIST Cybersecurity Framework',
    categorie: 'NIST',
    version: '1.1',
    description: 'Framework de cybersécurité du NIST - Approche basée sur les risques pour améliorer la cybersécurité des infrastructures critiques'
  },
  {
    nom: 'NIST SP 800-53',
    categorie: 'NIST',
    version: 'Rev. 5',
    description: 'Contrôles de sécurité et de confidentialité pour les systèmes d\'information et les organisations fédérales'
  },
  {
    nom: 'NIST SP 800-171',
    categorie: 'NIST',
    version: 'Rev. 2',
    description: 'Protection des informations non classifiées contrôlées (CUI) dans les systèmes et organisations non fédéraux'
  },
  {
    nom: 'NIST SP 800-30',
    categorie: 'NIST',
    version: 'Rev. 1',
    description: 'Guide pour la conduite d\'évaluations des risques'
  },
  {
    nom: 'NIST SP 800-37',
    categorie: 'NIST',
    version: 'Rev. 2',
    description: 'Cadre de gestion des risques pour les systèmes d\'information et les organisations'
  },
  
  // CIS Standards (for both Organisational and Technical audits)
  {
    nom: 'CIS Controls',
    categorie: 'CIS',
    version: '8.0',
    description: 'Contrôles de sécurité essentiels du CIS - Ensemble de meilleures pratiques prioritaires pour la cyber-défense'
  },
  {
    nom: 'CIS Critical Security Controls - Implementation Group 1',
    categorie: 'CIS',
    version: '8.0',
    description: 'Contrôles de sécurité essentiels pour les petites et moyennes organisations avec des ressources limitées en cybersécurité'
  },
  {
    nom: 'CIS Critical Security Controls - Implementation Group 2',
    categorie: 'CIS',
    version: '8.0',
    description: 'Contrôles de sécurité pour les organisations avec des capacités de cybersécurité modérées'
  },
  {
    nom: 'CIS Critical Security Controls - Implementation Group 3',
    categorie: 'CIS',
    version: '8.0',
    description: 'Contrôles de sécurité avancés pour les grandes organisations avec des équipes de sécurité matures'
  },
  
  // PCI Standards (for both Organisational and Technical audits)
  {
    nom: 'PCI DSS',
    categorie: 'PCI',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard - Norme de sécurité des données de l\'industrie des cartes de paiement'
  },
  {
    nom: 'PCI PA-DSS',
    categorie: 'PCI',
    version: '3.2',
    description: 'Payment Application Data Security Standard - Norme de sécurité des données pour les applications de paiement'
  },
  
  // OWASP Standards (for Technical audits)
  {
    nom: 'OWASP Top 10',
    categorie: 'OWASP',
    version: '2021',
    description: 'Top 10 des risques de sécurité des applications web - Liste des risques de sécurité les plus critiques pour les applications web'
  },
  {
    nom: 'OWASP Mobile Top 10',
    categorie: 'OWASP',
    version: '2016',
    description: 'Top 10 des risques de sécurité des applications mobiles'
  },
  {
    nom: 'OWASP API Security Top 10',
    categorie: 'OWASP',
    version: '2023',
    description: 'Top 10 des risques de sécurité des API - Vulnérabilités critiques affectant les API'
  },
  {
    nom: 'OWASP ASVS',
    categorie: 'OWASP',
    version: '4.0',
    description: 'Application Security Verification Standard - Standard de vérification de la sécurité des applications'
  },
  
  // Additional Standards
  {
    nom: 'RGPD (GDPR)',
    categorie: 'Conformité',
    version: '2018',
    description: 'Règlement Général sur la Protection des Données - Réglementation européenne sur la protection des données personnelles'
  },
  {
    nom: 'SOC 2 Type II',
    categorie: 'SOC',
    version: '2017',
    description: 'Service Organization Control 2 - Type II - Rapport d\'audit sur les contrôles internes'
  },
  {
    nom: 'HIPAA Security Rule',
    categorie: 'Conformité',
    version: '2013',
    description: 'Health Insurance Portability and Accountability Act - Règles de sécurité pour la protection des informations de santé'
  },
  {
    nom: 'ANSSI - Guide d\'hygiène informatique',
    categorie: 'ANSSI',
    version: '2021',
    description: 'Guide des bonnes pratiques de l\'ANSSI pour la sécurité des systèmes d\'information'
  }
];

async function seedNormes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if normes already exist
    const existingCount = await Norme.countDocuments();
    console.log(`📊 Existing normes in database: ${existingCount}`);
    
    console.log('🌱 Seeding/Updating normes (adding new ones, skipping duplicates)...');
    
    for (const normeData of sampleNormes) {
      // Check if norme with same nom already exists
      const existing = await Norme.findOne({ nom: normeData.nom });
      
      if (existing) {
        console.log(`⏭️  Skipping "${normeData.nom}" (already exists)`);
      } else {
        const norme = new Norme(normeData);
        await norme.save();
        console.log(`✅ Created norme: ${normeData.nom}`);
      }
    }
    
    const finalCount = await Norme.countDocuments();
    console.log('');
    console.log(`🎉 Seeding complete! Total normes in database: ${finalCount}`);
    console.log('');
    console.log('📋 Available norms by category:');
    const iso = await Norme.countDocuments({ categorie: 'ISO 27001' });
    const nist = await Norme.countDocuments({ categorie: 'NIST' });
    const cis = await Norme.countDocuments({ categorie: 'CIS' });
    const owasp = await Norme.countDocuments({ categorie: 'OWASP' });
    const pci = await Norme.countDocuments({ categorie: 'PCI' });
    console.log(`   - ISO 27001: ${iso}`);
    console.log(`   - NIST: ${nist}`);
    console.log(`   - CIS: ${cis}`);
    console.log(`   - OWASP: ${owasp}`);
    console.log(`   - PCI: ${pci}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding normes:', error);
    process.exit(1);
  }
}

seedNormes();

