const conceptionRepository = require('../repositories/conceptionRepository');

const getAllConceptions = async (req, res) => {
  try {
    const conceptions = await conceptionRepository.findAll();
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createConception = async (req, res) => {
  try {
    const conceptionData = {
      ...req.body // projet is already in req.body from frontend
    };
    const conception = await conceptionRepository.create(conceptionData);
    const populatedConception = await conceptionRepository.findById(conception._id);
    res.status(201).json(populatedConception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getConceptionById = async (req, res) => {
  try {
    const conception = await conceptionRepository.findById(req.params.id);
    if (!conception) return res.status(404).json({ message: 'Conception non trouvée' });
    res.json(conception);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateConception = async (req, res) => {
  try {
    // Additional security check: SSI users cannot update status-related fields
    if (req.user.role === 'SSI') {
      const restrictedFields = ['statut', 'validee', 'rssiCommentaire'];
      for (const field of restrictedFields) {
        if (req.body[field] !== undefined) {
          return res.status(403).json({ 
            message: `Les utilisateurs SSI ne peuvent pas modifier le champ "${field}"` 
          });
        }
      }
    }
    
    const conception = await conceptionRepository.updateById(req.params.id, req.body);
    if (!conception) return res.status(404).json({ message: 'Conception non trouvée' });
    res.json(conception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteConception = async (req, res) => {
  try {
    const conception = await conceptionRepository.deleteById(req.params.id);
    if (!conception) return res.status(404).json({ message: 'Conception non trouvée' });
    res.json({ message: 'Conception supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConceptionsByProjet = async (req, res) => {
  try {
    const conceptions = await conceptionRepository.findByProjet(req.params.projetId);
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validerConception = async (req, res) => {
  try {
    const validationData = {
      validee: req.body.validee,
      commentaires: req.body.commentaires
    };
    const conception = await conceptionRepository.valider(req.params.id, validationData);
    if (!conception) return res.status(404).json({ message: 'Conception non trouvée' });
    res.json(conception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getConceptionsByValidation = async (req, res) => {
  try {
    const { validee } = req.params;
    const conceptions = await conceptionRepository.findByValidation(validee === 'true');
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConceptionsEnAttenteValidation = async (req, res) => {
  try {
    const conceptions = await conceptionRepository.findEnAttenteValidation();
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConceptionsValidees = async (req, res) => {
  try {
    const conceptions = await conceptionRepository.findValidees();
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentConceptions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const conceptions = await conceptionRepository.findRecent(limit);
    res.json(conceptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConceptionsStats = async (req, res) => {
  try {
    const stats = await conceptionRepository.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateConceptionStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const conception = await conceptionRepository.updateStatut(req.params.id, statut);
    if (!conception) return res.status(404).json({ message: 'Conception non trouvée' });
    res.json(conception);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllConceptions,
  createConception,
  getConceptionById,
  updateConception,
  deleteConception,
  getConceptionsByProjet,
  validerConception,
  updateConceptionStatut,
  getConceptionsByValidation,
  getConceptionsEnAttenteValidation,
  getConceptionsValidees,
  getRecentConceptions,
  getConceptionsStats
}; 