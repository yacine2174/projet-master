const recommandationRepository = require('../repositories/recommandationRepository');

const getAllRecommandations = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findAll();
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRecommandation = async (req, res) => {
  try {
    const recommandation = await recommandationRepository.create(req.body);
    const populatedRecommandation = await recommandationRepository.findById(recommandation._id);
    res.status(201).json(populatedRecommandation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRecommandationById = async (req, res) => {
  try {
    const recommandation = await recommandationRepository.findById(req.params.id);
    if (!recommandation) return res.status(404).json({ message: 'Recommandation non trouvée' });
    res.json(recommandation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRecommandation = async (req, res) => {
  try {
    const recommandation = await recommandationRepository.updateById(req.params.id, req.body);
    if (!recommandation) return res.status(404).json({ message: 'Recommandation non trouvée' });
    res.json(recommandation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteRecommandation = async (req, res) => {
  try {
    const recommandation = await recommandationRepository.deleteById(req.params.id);
    if (!recommandation) return res.status(404).json({ message: 'Recommandation non trouvée' });
    res.json({ message: 'Recommandation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsByConstat = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findByConstat(req.params.constatId);
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsByPriorite = async (req, res) => {
  try {
    const { priorite } = req.params;
    const recommandations = await recommandationRepository.findByPriorite(priorite);
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsByComplexite = async (req, res) => {
  try {
    const { complexite } = req.params;
    const recommandations = await recommandationRepository.findByComplexite(complexite);
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validerRecommandation = async (req, res) => {
  try {
    const validationData = {
      validee: req.body.validee,
      commentaires: req.body.commentaires
    };
    const recommandation = await recommandationRepository.valider(req.params.id, validationData);
    if (!recommandation) return res.status(404).json({ message: 'Recommandation non trouvée' });
    res.json(recommandation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateRecommandationStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const recommandation = await recommandationRepository.updateStatut(req.params.id, statut);
    if (!recommandation) return res.status(404).json({ message: 'Recommandation non trouvée' });
    res.json(recommandation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createBulkRecommandations = async (req, res) => {
  try {
    const { recommandations } = req.body;
    const createdRecommandations = await recommandationRepository.createBulk(recommandations);
    res.status(201).json(createdRecommandations);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRecommandationsStats = async (req, res) => {
  try {
    const stats = await recommandationRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsNonValidees = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findNonValidees();
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsValidees = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findValidees();
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsByAudit = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findByAudit(req.params.auditId);
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommandationsPrioritaires = async (req, res) => {
  try {
    const recommandations = await recommandationRepository.findPrioritaires();
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentRecommandations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommandations = await recommandationRepository.findRecent(limit);
    res.json(recommandations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllRecommandations,
  createRecommandation,
  getRecommandationById,
  updateRecommandation,
  deleteRecommandation,
  getRecommandationsByConstat,
  getRecommandationsByPriorite,
  getRecommandationsByComplexite,
  validerRecommandation,
  updateRecommandationStatut,
  createBulkRecommandations,
  getRecommandationsStats,
  getRecommandationsNonValidees,
  getRecommandationsValidees,
  getRecommandationsByAudit,
  getRecommandationsPrioritaires,
  getRecentRecommandations
}; 