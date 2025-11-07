const constatRepository = require('../repositories/constatRepository');
const Constat = require('../models/Constat');

const getAllConstats = async (req, res) => {
  try {
    const constats = await constatRepository.findAll();
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createConstat = async (req, res) => {
  try {
    const constatData = {
      ...req.body // Now directly uses audit and projet from req.body
    };
    const constat = await constatRepository.create(constatData);
    const populatedConstat = await constatRepository.findById(constat._id);
    res.status(201).json(populatedConstat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getConstatById = async (req, res) => {
  try {
    const constat = await constatRepository.findById(req.params.id);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateConstat = async (req, res) => {
  try {
    const constat = await constatRepository.updateById(req.params.id, req.body);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteConstat = async (req, res) => {
  try {
    const constat = await constatRepository.deleteById(req.params.id);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json({ message: 'Constat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstatsByAudit = async (req, res) => {
  try {
    const constats = await constatRepository.findByAudit(req.params.auditId);
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstatsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const constats = await constatRepository.findByType(type);
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstatsByCriticite = async (req, res) => {
  try {
    const { criticite } = req.params;
    const constats = await constatRepository.findByCriticite(criticite);
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPreuvesToConstat = async (req, res) => {
  try {
    const { preuves } = req.body;
    const constat = await constatRepository.addPreuves(req.params.id, preuves);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addRecommandationsToConstat = async (req, res) => {
  try {
    const { recommandations } = req.body;
    const constat = await constatRepository.addRecommandations(req.params.id, recommandations);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getConstatsStats = async (req, res) => {
  try {
    const stats = await constatRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstatsWithRecommandations = async (req, res) => {
  try {
    const constats = await constatRepository.findWithRecommandations();
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstatsWithoutRecommandations = async (req, res) => {
  try {
    const constats = await constatRepository.findWithoutRecommandations();
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentConstats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const constats = await constatRepository.findRecent(limit);
    res.json(constats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listRecommandationsForConstat = async (req, res) => {
  try {
    const constat = await constatRepository.findById(req.params.id);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat.recommandations || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addRecommandationToConstat = async (req, res) => {
  try {
    const { recommandationId } = req.body;
    const constat = await constatRepository.addRecommandations(req.params.id, [recommandationId]);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    res.json(constat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeRecommandationFromConstat = async (req, res) => {
  try {
    const constat = await constatRepository.findById(req.params.id);
    if (!constat) return res.status(404).json({ message: 'Constat non trouvé' });
    
    const updatedConstat = await constatRepository.updateById(req.params.id, {
      recommandations: constat.recommandations.filter(r => r.toString() !== req.params.recommandationId)
    });
    res.json(updatedConstat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const bulkLinkProject = async (req, res) => {
  try {
    const { projetId, constatIds = [], auditId } = req.body || {};
    if (!projetId) return res.status(400).json({ message: "'projetId' requis" });

    let filter = {};
    if (Array.isArray(constatIds) && constatIds.length > 0) {
      filter = { _id: { $in: constatIds } };
    } else if (auditId) {
      // Link all constats of this audit that don't yet have a project
      filter = { audit: auditId, $or: [{ projet: { $exists: false } }, { projet: null }] };
    } else {
      return res.status(400).json({ message: "Fournir 'constatIds' ou 'auditId'" });
    }

    const result = await Constat.updateMany(filter, { $set: { projet: projetId } });
    const updated = await Constat.find(filter, { _id: 1 });
    return res.json({ matched: result.matchedCount ?? result.nModified ?? result.modifiedCount, modified: result.modifiedCount ?? result.nModified ?? 0, updatedIds: updated.map(d => d._id) });
  } catch (err) {
    console.error('bulkLinkProject error:', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllConstats,
  createConstat,
  getConstatById,
  updateConstat,
  deleteConstat,
  getConstatsByAudit,
  getConstatsByType,
  getConstatsByCriticite,
  addPreuvesToConstat,
  addRecommandationsToConstat,
  listRecommandationsForConstat,
  addRecommandationToConstat,
  removeRecommandationFromConstat,
  getConstatsStats,
  getConstatsWithRecommandations,
  getConstatsWithoutRecommandations,
  getRecentConstats,
  bulkLinkProject
};