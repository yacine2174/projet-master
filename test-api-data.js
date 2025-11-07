const mongoose = require('mongoose');
const config = require('./config');

async function checkData() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...');
    console.log('URI:', config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
    
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected successfully!\n');

    const Constat = require('./models/Constat');
    const Normes = require('./models/Normes');
    const Audit = require('./models/Audit');
    const Projet = require('./models/Projet');

    const constatCount = await Constat.countDocuments();
    const normesCount = await Normes.countDocuments();
    const auditCount = await Audit.countDocuments();
    const projetCount = await Projet.countDocuments();

    console.log('=== DATABASE COUNTS ===');
    console.log('Audits:', auditCount);
    console.log('Normes:', normesCount);
    console.log('Constats:', constatCount);
    console.log('Projets:', projetCount);
    console.log('');

    if (auditCount > 0) {
      const audits = await Audit.find().limit(3).select('nom type statut');
      console.log('Sample Audits:');
      audits.forEach(a => console.log(`  - ${a._id}: ${a.nom} (${a.type}) - ${a.statut}`));
      console.log('');
    }

    if (normesCount > 0) {
      const normes = await Normes.find().limit(3).select('nom reference');
      console.log('Sample Normes:');
      normes.forEach(n => console.log(`  - ${n._id}: ${n.nom} (${n.reference})`));
      console.log('');
    } else {
      console.log('⚠️  No normes found in database!');
    }

    if (constatCount > 0) {
      const constats = await Constat.find().limit(3).select('description type audit');
      console.log('Sample Constats:');
      constats.forEach(c => console.log(`  - ${c._id}: ${c.description.substring(0, 50)}... (${c.type})`));
      console.log('');
    } else {
      console.log('⚠️  No constats found in database!');
    }

    if (projetCount > 0) {
      const projets = await Projet.find().limit(3).select('nom statut audit constats');
      console.log('Sample Projets:');
      projets.forEach(p => console.log(`  - ${p._id}: ${p.nom} (${p.statut}) - Audit: ${p.audit}, Constats: ${p.constats.length}`));
      console.log('');
    }

    await mongoose.disconnect();
    console.log('✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();

