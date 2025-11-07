require('dotenv').config();
const mongoose = require('mongoose');
const Norme = require('./models/Normes');

async function checkNormes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const normes = await Norme.find().select('nom categorie version');
    
    console.log(`📊 Total normes in database: ${normes.length}\n`);
    console.log('📋 List of normes:\n');
    
    normes.forEach((norme, index) => {
      console.log(`${index + 1}. ${norme.nom}`);
      console.log(`   Category: "${norme.categorie}"`);
      console.log(`   Version: ${norme.version || 'N/A'}`);
      console.log('');
    });
    
    // Group by category
    const byCategory = {};
    normes.forEach(norme => {
      const cat = norme.categorie || 'Unknown';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(norme.nom);
    });
    
    console.log('📂 Grouped by category:\n');
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`${cat}:`);
      byCategory[cat].forEach(nom => {
        console.log(`  - ${nom}`);
      });
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNormes();

