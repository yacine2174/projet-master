const projetRepository = require('../repositories/projetRepository');
const Audit = require('../models/Audit');
const Constat = require('../models/Constat');

const getAllProjets = async (req, res) => {
  try {
    const projets = await projetRepository.findAll();
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProjet = async (req, res) => {
  try {
    const projetData = {
      ...req.body,
      creerPar: req.user._id
    };

    // Create project first
    const projet = await projetRepository.create(projetData);

    // If an audit is provided, attach project to the audit and set projet.audit
    if (req.body.audit) {
      await Audit.findByIdAndUpdate(
        req.body.audit,
        { $addToSet: { projets: projet._id } },
        { new: true }
      );
      // Ensure the project's audit field is saved (in case repository doesn't persist it)
      await projetRepository.updateById(projet._id, { audit: req.body.audit });
    }

    // If constats are provided, back-link them to this project
    if (Array.isArray(req.body.constats) && req.body.constats.length > 0) {
      await Constat.updateMany(
        { _id: { $in: req.body.constats } },
        { $set: { projet: projet._id } }
      );
    }

    const populatedProjet = await projetRepository.findById(projet._id);
    res.status(201).json(populatedProjet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getProjetById = async (req, res) => {
  try {
    const projet = await projetRepository.findById(req.params.id);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProjet = async (req, res) => {
  try {
    const projet = await projetRepository.updateById(req.params.id, req.body);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProjet = async (req, res) => {
  try {
    const projet = await projetRepository.deleteById(req.params.id);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json({ message: 'Projet supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSWOT = async (req, res) => {
  try {
    const swot = await projetRepository.createSWOT(req.params.id, req.body);
    res.status(201).json(swot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createAnalyseSecurite = async (req, res) => {
  try {
    const { risques } = req.body;
    const risquesCrees = await projetRepository.createAnalyseSecurite(req.params.id, risques);
    res.status(201).json(risquesCrees);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const soumettreConception = async (req, res) => {
  try {
    const conception = await projetRepository.soumettreConception(req.params.id, req.body);
    res.status(201).json(conception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const validerConception = async (req, res) => {
  try {
    const validationData = {
      validee: req.body.validee,
      commentaires: req.body.commentaires
    };
    const conception = await projetRepository.validerConception(req.params.id, validationData, req.user._id);
    res.json(conception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getProjetsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const projets = await projetRepository.findByUser(userId, userRole);
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjetsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const projets = await projetRepository.findByStatus(status);
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjetsEnAttenteValidation = async (req, res) => {
  try {
    const projets = await projetRepository.findPendingValidation();
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProjetStatut = async (req, res) => {
  try {
    const { statut, validePar, valideParObjectId } = req.body;
    
    // Debug: Log the request data
    console.log('Controller: updateProjetStatut called');
    console.log('Request body:', req.body);
    console.log('validePar type:', typeof validePar);
    console.log('validePar value:', validePar);
    console.log('valideParObjectId type:', typeof valideParObjectId);
    console.log('valideParObjectId value:', valideParObjectId);
    
    // Only RSSI can update status and must provide validePar
    if (req.user.role !== 'RSSI') {
      return res.status(403).json({
        message: 'Seuls les utilisateurs RSSI peuvent modifier le statut des projets'
      });
    }
    
    // Use the converted ObjectId if available, otherwise use the original validePar
    const validateurId = valideParObjectId || validePar;
    console.log('Controller: Using validateurId:', validateurId);
    
    const projet = await projetRepository.updateStatus(req.params.id, statut, validateurId);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (err) {
    console.log('Controller error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

const getRecentProjets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const projets = await projetRepository.findRecent(limit);
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllProjets,
  createProjet,
  getProjetById,
  updateProjet,
  deleteProjet,
  createSWOT,
  createAnalyseSecurite,
  soumettreConception,
  validerConception,
  getProjetsByUser,
  getProjetsByStatus,
  getProjetsEnAttenteValidation,
  updateProjetStatut,
  getRecentProjets
}; 