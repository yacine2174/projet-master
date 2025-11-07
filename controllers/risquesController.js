const risquesRepository = require('../repositories/risquesRepository');

const getAllRisques = async (req, res) => {
  try {
    const risques = await risquesRepository.findAll();
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRisque = async (req, res) => {
  try {
    const risqueData = {
      ...req.body // projet is already in req.body from frontend
    };
    const risque = await risquesRepository.create(risqueData);
    const populatedRisque = await risquesRepository.findById(risque._id);
    res.status(201).json(populatedRisque);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRisqueById = async (req, res) => {
  try {
    const risque = await risquesRepository.findById(req.params.id);
    if (!risque) return res.status(404).json({ message: 'Risque non trouvé' });
    res.json(risque);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRisque = async (req, res) => {
  try {
    const risque = await risquesRepository.updateById(req.params.id, req.body);
    if (!risque) return res.status(404).json({ message: 'Risque non trouvé' });
    res.json(risque);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteRisque = async (req, res) => {
  try {
    const risque = await risquesRepository.deleteById(req.params.id);
    if (!risque) return res.status(404).json({ message: 'Risque non trouvé' });
    res.json({ message: 'Risque supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByProjet = async (req, res) => {
  try {
    const risques = await risquesRepository.findByProjet(req.params.projetId);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByNiveau = async (req, res) => {
  try {
    const { niveau } = req.params;
    const risques = await risquesRepository.findByNiveau(niveau);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByProbabilite = async (req, res) => {
  try {
    const { probabilite } = req.params;
    const risques = await risquesRepository.findByProbabilite(probabilite);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByImpact = async (req, res) => {
  try {
    const { impact } = req.params;
    const risques = await risquesRepository.findByImpact(impact);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByDecision = async (req, res) => {
  try {
    const { decision } = req.params;
    const risques = await risquesRepository.findByDecision(decision);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesCritiques = async (req, res) => {
  try {
    const risques = await risquesRepository.findCritiques();
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByActifCible = async (req, res) => {
  try {
    const { actifCible } = req.params;
    const risques = await risquesRepository.findByActifCible(actifCible);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByMenace = async (req, res) => {
  try {
    const { menace } = req.params;
    const risques = await risquesRepository.findByMenace(menace);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesByVulnerabilite = async (req, res) => {
  try {
    const { vulnerabilite } = req.params;
    const risques = await risquesRepository.findByVulnerabilite(vulnerabilite);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentRisques = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const risques = await risquesRepository.findRecent(limit);
    res.json(risques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRisquesStats = async (req, res) => {
  try {
    const stats = await risquesRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllRisques,
createRisque,
   getRisqueById,
 updateRisque,
 deleteRisque,
  getRisquesByProjet,
  getRisquesByNiveau,
  getRisquesByProbabilite,
  getRisquesByImpact,
  getRisquesByDecision,
  getRisquesCritiques,
  getRisquesByActifCible,
  getRisquesByMenace,
  getRisquesByVulnerabilite,
  getRecentRisques,
  getRisquesStats
}; 