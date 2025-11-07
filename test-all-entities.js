const mongoose = require('mongoose');
const config = require('./config');

async function checkAllEntities() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected successfully!\n');

    // Import all models
    const Audit = require('./models/Audit');
    const Normes = require('./models/Normes');
    const Constat = require('./models/Constat');
    const Projet = require('./models/Projet');
    const SWOT = require('./models/SWOT');
    const Risque = require('./models/Risques');
    const Conception = require('./models/Conception');
    const Recommandation = require('./models/Recommandation');
    const PlanAction = require('./models/PlanAction');
    const Preuve = require('./models/Preuve');
    const PAS = require('./models/PAS');
    const Utilisateur = require('./models/Utilisateur');

    console.log('═══════════════════════════════════════════════════════');
    console.log('           DATABASE ENTITY COUNT REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    // Count all entities
    const counts = {
      'Utilisateurs': await Utilisateur.countDocuments(),
      'Audits': await Audit.countDocuments(),
      'Normes': await Normes.countDocuments(),
      'Constats': await Constat.countDocuments(),
      'Projets': await Projet.countDocuments(),
      'SWOT': await SWOT.countDocuments(),
      'Risques': await Risque.countDocuments(),
      'Conceptions': await Conception.countDocuments(),
      'Recommandations': await Recommandation.countDocuments(),
      'Plans d\'Action': await PlanAction.countDocuments(),
      'Preuves': await Preuve.countDocuments(),
      'PAS': await PAS.countDocuments(),
    };

    // Display counts
    for (const [entity, count] of Object.entries(counts)) {
      const status = count === 0 ? '❌ EMPTY' : '✅';
      console.log(`${status} ${entity.padEnd(20)} : ${count}`);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('           DETAILED SAMPLES (First 3 of each)');
    console.log('═══════════════════════════════════════════════════════\n');

    // Show samples
    if (counts.Normes > 0) {
      console.log('📋 NORMES:');
      const normes = await Normes.find().limit(3);
      normes.forEach(n => {
        console.log(`   ${n._id}`);
        console.log(`   └─ Nom: ${n.nom || 'N/A'}`);
        console.log(`   └─ Reference: ${n.reference || 'N/A'}`);
        console.log(`   └─ Description: ${n.description ? n.description.substring(0, 50) + '...' : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ NORMES: No data found\n');
    }

    if (counts.Audits > 0) {
      console.log('📋 AUDITS:');
      const audits = await Audit.find().limit(3).populate('normes');
      audits.forEach(a => {
        console.log(`   ${a._id}`);
        console.log(`   └─ Nom: ${a.nom || 'N/A'}`);
        console.log(`   └─ Type: ${a.type || 'N/A'}`);
        console.log(`   └─ Statut: ${a.statut || 'N/A'}`);
        console.log(`   └─ Normes liées: ${a.normes ? a.normes.length : 0}`);
        console.log('');
      });
    } else {
      console.log('❌ AUDITS: No data found\n');
    }

    if (counts.Constats > 0) {
      console.log('📋 CONSTATS:');
      const constats = await Constat.find().limit(3);
      constats.forEach(c => {
        console.log(`   ${c._id}`);
        console.log(`   └─ Description: ${c.description ? c.description.substring(0, 60) : 'N/A'}`);
        console.log(`   └─ Type: ${c.type || 'N/A'}`);
        console.log(`   └─ Audit: ${c.audit || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ CONSTATS: No data found\n');
    }

    if (counts.Projets > 0) {
      console.log('📋 PROJETS:');
      const projets = await Projet.find().limit(3);
      projets.forEach(p => {
        console.log(`   ${p._id}`);
        console.log(`   └─ Nom: ${p.nom || 'N/A'}`);
        console.log(`   └─ Statut: ${p.statut || 'N/A'}`);
        console.log(`   └─ Audit: ${p.audit || 'N/A'}`);
        console.log(`   └─ Constats: ${p.constats ? p.constats.length : 0}`);
        console.log('');
      });
    } else {
      console.log('❌ PROJETS: No data found\n');
    }

    if (counts.SWOT > 0) {
      console.log('📋 SWOT:');
      const swots = await SWOT.find().limit(3);
      swots.forEach(s => {
        console.log(`   ${s._id}`);
        console.log(`   └─ Projet: ${s.projet || 'N/A'}`);
        console.log(`   └─ Forces: ${s.forces ? s.forces.substring(0, 40) + '...' : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ SWOT: No data found\n');
    }

    if (counts.Risques > 0) {
      console.log('📋 RISQUES:');
      const risques = await Risque.find().limit(3);
      risques.forEach(r => {
        console.log(`   ${r._id}`);
        console.log(`   └─ Nom: ${r.nom || 'N/A'}`);
        console.log(`   └─ Niveau: ${r.niveau || 'N/A'}`);
        console.log(`   └─ Projet: ${r.projet || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ RISQUES: No data found\n');
    }

    if (counts.Conceptions > 0) {
      console.log('📋 CONCEPTIONS:');
      const conceptions = await Conception.find().limit(3);
      conceptions.forEach(c => {
        console.log(`   ${c._id}`);
        console.log(`   └─ Nom: ${c.nomFichier || 'N/A'}`);
        console.log(`   └─ Projet: ${c.projet || 'N/A'}`);
        console.log(`   └─ Statut: ${c.statut || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ CONCEPTIONS: No data found\n');
    }

    if (counts.Recommandations > 0) {
      console.log('📋 RECOMMANDATIONS:');
      const recommandations = await Recommandation.find().limit(3);
      recommandations.forEach(r => {
        console.log(`   ${r._id}`);
        console.log(`   └─ Titre: ${r.titre || 'N/A'}`);
        console.log(`   └─ Priorite: ${r.priorite || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ RECOMMANDATIONS: No data found\n');
    }

    if (counts['Plans d\'Action'] > 0) {
      console.log('📋 PLANS D\'ACTION:');
      const plans = await PlanAction.find().limit(3);
      plans.forEach(p => {
        console.log(`   ${p._id}`);
        console.log(`   └─ Titre: ${p.titre || 'N/A'}`);
        console.log(`   └─ Statut: ${p.statut || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ PLANS D\'ACTION: No data found\n');
    }

    if (counts.Preuves > 0) {
      console.log('📋 PREUVES:');
      const preuves = await Preuve.find().limit(3);
      preuves.forEach(p => {
        console.log(`   ${p._id}`);
        console.log(`   └─ Nom: ${p.nom || 'N/A'}`);
        console.log(`   └─ Type: ${p.type || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ PREUVES: No data found\n');
    }

    if (counts.PAS > 0) {
      console.log('📋 PAS:');
      const pas = await PAS.find().limit(3);
      pas.forEach(p => {
        console.log(`   ${p._id}`);
        console.log(`   └─ Projet: ${p.projet || 'N/A'}`);
        console.log(`   └─ Version: ${p.version || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ PAS: No data found\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('                    SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const emptyEntities = Object.entries(counts).filter(([_, count]) => count === 0);
    const populatedEntities = Object.entries(counts).filter(([_, count]) => count > 0);

    console.log(`✅ Populated entities: ${populatedEntities.length}`);
    populatedEntities.forEach(([entity, count]) => {
      console.log(`   - ${entity}: ${count}`);
    });

    console.log(`\n❌ Empty entities: ${emptyEntities.length}`);
    if (emptyEntities.length > 0) {
      emptyEntities.forEach(([entity]) => {
        console.log(`   - ${entity}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAllEntities();

