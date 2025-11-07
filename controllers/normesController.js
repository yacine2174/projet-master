const normesRepository = require('../repositories/normesRepository');

const getAllNormes = async (req, res) => {
  try {
    const normes = await normesRepository.findAll();
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNorme = async (req, res) => {
  try {
    // Vérifier si la norme existe déjà
    const normeExists = await normesRepository.existsByNom(req.body.nom);
    if (normeExists) {
      return res.status(400).json({ message: 'Cette norme existe déjà' });
    }

    const norme = await normesRepository.create(req.body);
    const populatedNorme = await normesRepository.findById(norme._id);
    res.status(201).json(populatedNorme);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getNormeById = async (req, res) => {
  try {
    const norme = await normesRepository.findById(req.params.id);
    if (!norme) return res.status(404).json({ message: 'Norme non trouvée' });
    res.json(norme);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateNorme = async (req, res) => {
  try {
    const norme = await normesRepository.updateById(req.params.id, req.body);
    if (!norme) return res.status(404).json({ message: 'Norme non trouvée' });
    res.json(norme);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteNorme = async (req, res) => {
  try {
    const norme = await normesRepository.deleteById(req.params.id);
    if (!norme) return res.status(404).json({ message: 'Norme non trouvée' });
    res.json({ message: 'Norme supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNormesByCategorie = async (req, res) => {
  try {
    const { categorie } = req.params;
    const normes = await normesRepository.findByCategorie(categorie);
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNormesByNom = async (req, res) => {
  try {
    const { nom } = req.params;
    const normes = await normesRepository.findByNom(nom);
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNormesStats = async (req, res) => {
  try {
    const stats = await normesRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNormesUtilisees = async (req, res) => {
  try {
    const normes = await normesRepository.findUtilisees();
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNormesNonUtilisees = async (req, res) => {
  try {
    const normes = await normesRepository.findNonUtilisees();
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentNormes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const normes = await normesRepository.findRecent(limit);
    res.json(normes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllNormes,
  createNormes: createNorme,
  getNormesById: getNormeById,
  updateNormes: updateNorme,
  deleteNormes: deleteNorme,
  getNormesByCategorie,
  getNormesByNom,
  getNormesStats,
  getNormesUtilisees,
  getNormesNonUtilisees,
  getRecentNormes
}; 