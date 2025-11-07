const planActionRepository = require('../repositories/planActionRepository');

const getAllPlanActions = async (req, res) => {
  try {
    const plansAction = await planActionRepository.findAll();
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPlanAction = async (req, res) => {
  try {
    const planAction = await planActionRepository.create(req.body);
    const populatedPlanAction = await planActionRepository.findById(planAction._id);
    res.status(201).json(populatedPlanAction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPlanActionById = async (req, res) => {
  try {
    const planAction = await planActionRepository.findById(req.params.id);
    if (!planAction) return res.status(404).json({ message: 'Plan d\'action non trouvé' });
    res.json(planAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePlanAction = async (req, res) => {
  try {
    const planAction = await planActionRepository.updateById(req.params.id, req.body);
    if (!planAction) return res.status(404).json({ message: 'Plan d\'action non trouvé' });
    res.json(planAction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePlanAction = async (req, res) => {
  try {
    const planAction = await planActionRepository.deleteById(req.params.id);
    if (!planAction) return res.status(404).json({ message: 'Plan d\'action non trouvé' });
    res.json({ message: 'Plan d\'action supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlanActionsByAudit = async (req, res) => {
  try {
    const plansAction = await planActionRepository.findByAudit(req.params.auditId);
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlanActionsByProjet = async (req, res) => {
  try {
    const plansAction = await planActionRepository.findByProjet(req.params.projetId);
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addRecommandationsToPlanAction = async (req, res) => {
  try {
    const { recommandations } = req.body;
    const planAction = await planActionRepository.addRecommandations(req.params.id, recommandations);
    if (!planAction) return res.status(404).json({ message: 'Plan d\'action non trouvé' });
    res.json(planAction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const generateAutomatedPlan = async (req, res) => {
  try {
    const { auditId, auditNom } = req.body;
    const planAction = await planActionRepository.generateAutomatedPlan(auditId, auditNom);
    res.status(201).json(planAction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPlanActionsStats = async (req, res) => {
  try {
    const stats = await planActionRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlanActionsWithRecommandations = async (req, res) => {
  try {
    const plansAction = await planActionRepository.findWithRecommandations();
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlanActionsWithoutRecommandations = async (req, res) => {
  try {
    const plansAction = await planActionRepository.findWithoutRecommandations();
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentPlanActions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const plansAction = await planActionRepository.findRecent(limit);
    res.json(plansAction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPlanActions,
  createPlanAction,
  getPlanActionById,
  updatePlanAction,
  deletePlanAction,
  getPlanActionsByAudit,
  getPlanActionsByProjet,
  addRecommandationsToPlanAction,
  generateAutomatedPlan,
  getPlanActionsStats,
  getPlanActionsWithRecommandations,
  getPlanActionsWithoutRecommandations,
  getRecentPlanActions
}; 