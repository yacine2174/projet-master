const preuveRepository = require('../repositories/preuveRepository');

const getAllPreuves = async (req, res) => {
  try {
    const preuves = await preuveRepository.findAll();
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPreuve = async (req, res) => {
  try {
    const preuveData = {
      ...req.body
    };
    const preuve = await preuveRepository.create(preuveData);
    const populatedPreuve = await preuveRepository.findById(preuve._id);
    res.status(201).json(populatedPreuve);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPreuveById = async (req, res) => {
  try {
    const preuve = await preuveRepository.findById(req.params.id);
    if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });
    res.json(preuve);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePreuve = async (req, res) => {
  try {
    const preuve = await preuveRepository.updateById(req.params.id, req.body);
    if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });
    res.json(preuve);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePreuve = async (req, res) => {
  try {
    const preuve = await preuveRepository.deleteById(req.params.id);
    if (!preuve) return res.status(404).json({ message: 'Preuve non trouvée' });
    res.json({ message: 'Preuve supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPreuvesByAudit = async (req, res) => {
  try {
    const preuves = await preuveRepository.findByAudit(req.params.auditId);
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPreuvesByTypeFichier = async (req, res) => {
  try {
    const { typeFichier } = req.params;
    const preuves = await preuveRepository.findByTypeFichier(typeFichier);
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPreuvesByNomFichier = async (req, res) => {
  try {
    const { nomFichier } = req.params;
    const preuves = await preuveRepository.findByNomFichier(nomFichier);
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPreuvesStats = async (req, res) => {
  try {
    const stats = await preuveRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPreuvesByExtension = async (req, res) => {
  try {
    const { extension } = req.params;
    const preuves = await preuveRepository.findByExtension(extension);
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentPreuves = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const preuves = await preuveRepository.findRecent(limit);
    res.json(preuves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPreuves,
  createPreuve,
  getPreuveById,
  updatePreuve,
  deletePreuve,
  getPreuvesByAudit,
  getPreuvesByTypeFichier,
  getPreuvesByNomFichier,
  getPreuvesStats,
  getPreuvesByExtension,
  getRecentPreuves
}; 