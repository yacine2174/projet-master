const swotRepository = require('../repositories/swotRepository');

const getAllSWOT = async (req, res) => {
  try {
    const swot = await swotRepository.findAll();
    res.json(swot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSWOT = async (req, res) => {
  try {
    const swotData = {
      ...req.body // projet is already in req.body from frontend
    };
    const swot = await swotRepository.create(swotData);
    const populatedSWOT = await swotRepository.findById(swot._id);
    res.status(201).json(populatedSWOT);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getSWOTById = async (req, res) => {
  try {
    const swot = await swotRepository.findById(req.params.id);
    if (!swot) return res.status(404).json({ message: 'Analyse SWOT non trouvée' });
    res.json(swot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSWOT = async (req, res) => {
  try {
    const swot = await swotRepository.updateById(req.params.id, req.body);
    if (!swot) return res.status(404).json({ message: 'Analyse SWOT non trouvée' });
    res.json(swot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteSWOT = async (req, res) => {
  try {
    const swot = await swotRepository.deleteById(req.params.id);
    if (!swot) return res.status(404).json({ message: 'Analyse SWOT non trouvée' });
    res.json({ message: 'Analyse SWOT supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSWOTByProjet = async (req, res) => {
  try {
    const swot = await swotRepository.findByProjet(req.params.projetId);
    res.json(swot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentSWOT = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const swot = await swotRepository.findRecent(limit);
    res.json(swot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSWOTStats = async (req, res) => {
  try {
    const stats = await swotRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllSWOT,
  createSWOT,
  getSWOTById,
  updateSWOT,
  deleteSWOT,
  getSWOTByProjet,
  getRecentSWOT,
  getSWOTStats
}; 