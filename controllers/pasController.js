const pasRepository = require('../repositories/pasRepository');
const Projet = require('../models/Projet');
const Audit = require('../models/Audit');
const SWOT = require('../models/SWOT');
const Risque = require('../models/Risques');
const Norme = require('../models/Normes');
const SecuriteProjet = require('../models/SecuriteProjet');

exports.createPAS = async (req, res) => {
  try {
    const pas = await pasRepository.create({ ...req.body, creerPar: req.user?._id });
    res.status(201).json(pas);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPAS = async (req, res) => {
  try {
    const pas = await pasRepository.getById(req.params.id);
    if (!pas) return res.status(404).json({ message: 'PAS non trouvé' });
    res.json(pas);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPASByProjet = async (req, res) => {
  try {
    const list = await pasRepository.getByProjet(req.params.projetId);
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listPAS = async (_req, res) => {
  try {
    const list = await pasRepository.list();
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePAS = async (req, res) => {
  try {
    const pas = await pasRepository.update(req.params.id, { ...req.body, validePar: req.body.validePar });
    if (!pas) return res.status(404).json({ message: 'PAS non trouvé' });
    res.json(pas);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePAS = async (req, res) => {
  try {
    const pas = await pasRepository.delete(req.params.id);
    if (!pas) return res.status(404).json({ message: 'PAS non trouvé' });
    res.json({ message: 'PAS supprimé' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Auto-generate a PAS from existing project data
exports.createPASAuto = async (req, res) => {
  try {
    const { projetId } = req.params;
    const projet = await Projet.findById(projetId)
      .populate('creerPar', 'nom role')
      .populate('validePar', 'nom role')
      .populate('audit');
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });

    // Load related content
    const audit = projet.audit ? await Audit.findById(projet.audit).populate('normes') : null;
    const swots = await SWOT.find({ projet: projet._id }).sort({ createdAt: -1 });
    const risques = await Risque.find({ projet: projet._id }).sort({ createdAt: -1 });
    
    // ✅ NEW: Load security configuration
    const securite = await SecuriteProjet.findOne({ projet: projet._id });
    console.log('🔐 Security config found:', securite ? 'YES' : 'NO');
    if (securite) {
      console.log('   - Physical security:', Object.keys(securite.mesuresSecurite?.physique || {}).length, 'measures');
      console.log('   - Logical security:', Object.keys(securite.mesuresSecurite?.logique || {}).length, 'measures');
      console.log('   - Organizational security:', Object.keys(securite.mesuresSecurite?.organisationnelle || {}).length, 'measures');
    }

    const normesList = (audit?.normes || []).map(n => `${n.nom} ${n.version || ''}`.trim());

    // Build PAS data - prioritize real data from Projet and SecuriteProjet
    const objet = `Ce document décrit les mesures de sécurité pour le projet "${projet.nom}".`;
    
    // ✅ Get context data from AUDIT (not projet)
    const champApplication = {
      locauxEtInfrastructures: projet.perimetre && projet.perimetre.trim() !== '' && projet.perimetre !== '*' 
        ? projet.perimetre 
        : '',
      systemesInformation: audit?.perimetre && audit.perimetre.trim() !== '' 
        ? audit.perimetre 
        : '',
      personnels: audit?.personnelsInternes || audit?.personnelsExternes 
        ? `${audit.personnelsInternes || ''}${audit.personnelsInternes && audit.personnelsExternes ? ' | ' : ''}${audit.personnelsExternes || ''}`
        : ''
    };

    const references = {
      normes: normesList.length > 0 ? normesList : [],
      politiques: audit?.entrepriseNom ? [`Politique de sécurité interne de ${audit.entrepriseNom}`] : [],
      reglementations: audit?.reglementations && audit.reglementations.length > 0 
        ? audit.reglementations 
        : []
    };

    // ✅ Get roles from SecuriteProjet
    const rolesFromSecurite = securite?.rolesEtResponsabilites || [];
    
    const organisationSecurite = {
      rspNomFonction: projet.validePar ? `${projet.validePar.nom} (RSSI)` : (projet.creerPar ? `${projet.creerPar.nom}` : ''),
      rolesEtResponsabilites: rolesFromSecurite.map(r => ({
        role: r.role || '',
        responsabilite: r.responsabilite || ''
      }))
    };

    // Helpers to normalize to array of strings
    const toStringArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean).map(v => String(v));
      return [String(val)];
    };

    // Menaces from SWOT and Risques - ONLY use project data
    const menacesFromSWOT = swots.flatMap(s => toStringArray(s.menaces));
    const menacesFromRisques = risques.flatMap(r => toStringArray(r.description));
    const allMenaces = [...menacesFromSWOT, ...menacesFromRisques].filter(Boolean);
    
    // Get impacts from risques
    const impactsFromRisques = risques.flatMap(r => toStringArray(r.impact));
    
    // Get prevention measures from SWOT opportunities
    const opportunitiesFromSWOT = swots.flatMap(s => toStringArray(s.opportunites));
    
    const analyseRisques = {
      menaces: allMenaces,
      evaluationImpacts: impactsFromRisques,
      mesuresPrevention: opportunitiesFromSWOT
    };

    // ✅ ONLY use real security measures from SecuriteProjet - NO defaults!
    const mesuresSecurite = securite?.mesuresSecurite ? {
      physique: Object.values(securite.mesuresSecurite.physique || {}).filter(Boolean),
      logique: Object.values(securite.mesuresSecurite.logique || {}).filter(Boolean),
      organisationnelle: Object.values(securite.mesuresSecurite.organisationnelle || {}).filter(Boolean)
    } : {
      physique: [],
      logique: [],
      organisationnelle: []
    };

    // ✅ ONLY use real PCA/PRA from SecuriteProjet - NO defaults!
    // Structure data for proper display with subsections
    const pcaPra = securite?.pcaPra ? {
      sauvegardeRestauration: {
        procedures: securite.pcaPra.sauvegardeRestauration?.procedures || '',
        frequenceTests: securite.pcaPra.sauvegardeRestauration?.frequenceTests || ''
      },
      siteSecours: {
        description: securite.pcaPra.siteSecours?.description || '',
        adresse: securite.pcaPra.siteSecours?.adresse || ''
      },
      exercices: {
        description: securite.pcaPra.exercicesSimulation?.description || '',
        frequence: securite.pcaPra.exercicesSimulation?.frequence || ''
      }
    } : {
      sauvegardeRestauration: { procedures: '', frequenceTests: '' },
      siteSecours: { description: '', adresse: '' },
      exercices: { description: '', frequence: '' }
    };

    // ✅ ONLY use real follow-up data from Audit - NO defaults!
    const suiviAudit = {
      reunions: audit?.suiviSecurite?.reunions?.frequence 
        ? `Réunions de suivi sécurité ${audit.suiviSecurite.reunions.frequence.toLowerCase()}`
        : '',
      auditInterne: audit?.suiviSecurite?.auditInterne?.frequence 
        ? `Audit interne ${audit.suiviSecurite.auditInterne.frequence.toLowerCase()}`
        : '',
      kpis: audit?.kpis && audit.kpis.length > 0 
        ? audit.kpis 
        : []
    };

    // ✅ ONLY use real annexes from Audit and emergency contacts from Projet - NO defaults!
    const annexes = {
      sensibilisation: audit?.annexes?.fichesSensibilisation || [],
      modeleRegistreIncidents: audit?.annexes?.registreIncidents || '',
      contactsUrgence: projet.contactsUrgence && projet.contactsUrgence.length > 0
        ? projet.contactsUrgence.map(c => `${c.nom} (${c.fonction}): ${c.telephone} - ${c.email}`)
        : []
    };

    // ✅ Prepare full SWOT details
    const swotAnalyses = swots.map(swot => ({
      forces: toStringArray(swot.forces),
      faiblesses: toStringArray(swot.faiblesses),
      opportunites: toStringArray(swot.opportunites),
      menaces: toStringArray(swot.menaces),
      createdAt: swot.createdAt
    }));

    // ✅ Prepare full Risk details
    const risquesDetails = risques.map(risque => ({
      description: risque.description || '',
      type: risque.type || '',
      priorite: risque.priorite || '',
      niveauRisque: risque.niveauRisque || '',
      impact: risque.impact || '',
      probabilite: risque.probabilite || '',
      decision: risque.decision || '',
      createdAt: risque.createdAt
    }));

    const data = {
      projet: projet._id,
      version: '1.0',
      objet,
      champApplication,
      references,
      organisationSecurite,
      analyseRisques,
      swotAnalyses,
      risques: risquesDetails,
      mesuresSecurite,
      pcaPra,
      suiviAudit,
      annexes,
      creerPar: req.user?._id
    };

    console.log('📄 PAS data to save:');
    console.log('   - champApplication:', JSON.stringify(champApplication, null, 2));
    console.log('   - references:', JSON.stringify(references, null, 2));
    console.log('   - Mesures physique:', mesuresSecurite.physique);
    console.log('   - Mesures logique:', mesuresSecurite.logique);
    console.log('   - Mesures org:', mesuresSecurite.organisationnelle);
    console.log('   - PCA/PRA:', pcaPra);

    const pas = await pasRepository.create(data);
    res.status(201).json(pas);
  } catch (err) {
    console.error('Error auto-generating PAS:', err);
    res.status(400).json({ message: err.message, error: err.toString() });
  }
};


