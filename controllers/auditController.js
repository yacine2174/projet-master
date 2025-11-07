const auditRepository = require('../repositories/auditRepository');
const PlanAction = require('../models/PlanAction');

const getAllAudits = async (req, res) => {
  try {
    const audits = await auditRepository.findAll();
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAudit = async (req, res) => {
  try {
    const auditData = {
      ...req.body,
      creerPar: req.user._id
    };
    const audit = await auditRepository.create(auditData);
    const populatedAudit = await auditRepository.findById(audit._id);
    res.status(201).json(populatedAudit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAuditById = async (req, res) => {
  try {
    const audit = await auditRepository.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAudit = async (req, res) => {
  try {
    const { statut, ...updateData } = req.body;
    
    // Check if user is trying to update status
    if (statut !== undefined) {
      // Only RSSI users can update status through general update route
      if (req.user.role !== 'RSSI') {
        return res.status(403).json({ 
          message: 'Le statut ne peut être modifié que par les utilisateurs RSSI' 
        });
      }
      // For RSSI users, include status in the update
      updateData.statut = statut;
    }
    
    const audit = await auditRepository.updateById(req.params.id, updateData);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json(audit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAudit = async (req, res) => {
  try {
    const audit = await auditRepository.deleteById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json({ message: 'Audit supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add points forts to audit
const addPointsForts = async (req, res) => {
  try {
    const { pointsForts } = req.body;
    const audit = await auditRepository.addPointsForts(req.params.id, pointsForts);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json(audit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Generate audit synthesis
const generateSynthese = async (req, res) => {
  try {
    const audit = await auditRepository.generateSynthese(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate automated action plan
const generatePlanAction = async (req, res) => {
  try {
    const audit = await auditRepository.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    
    // Collect all recommendations from all findings
    const allRecommendations = [];
    audit.constats.forEach(constat => {
      if (constat.recommandations) {
        constat.recommandations.forEach(rec => {
          allRecommendations.push({
            contenu: rec.contenu,
            priorite: rec.priorite,
            complexite: rec.complexite,
            constatId: constat._id,
            constatNomenclature: constat.nomenclature
          });
        });
      }
    });
    
    // Remove duplicates and organize by priority
    const uniqueRecommendations = allRecommendations.filter((rec, index, self) =>
      index === self.findIndex(r => r.contenu === rec.contenu)
    );
    
    // Sort by priority
    const sortedRecommendations = uniqueRecommendations.sort((a, b) => {
      const priorityOrder = { 'Très élevée': 4, 'Élevée': 3, 'Moyenne': 2, 'Faible': 1 };
      return priorityOrder[b.priorite] - priorityOrder[a.priorite];
    });
    
    // Create action plan
    const planAction = await PlanAction.create({
      titre: `Plan d'action - Audit ${audit.nom}`,
      description: `Plan d'action généré automatiquement pour l'audit ${audit.nom}`,
      recommandations: sortedRecommendations.map(rec => rec._id),
      audit: audit._id
    });
    
    // Update audit with action plan
    const updatedAudit = await auditRepository.updateById(req.params.id, { planAction: planAction._id });
    
    res.json({
      audit: updatedAudit,
      planAction,
      recommendations: sortedRecommendations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get audits by user role
const getAuditsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const audits = await auditRepository.findByUser(userId, userRole);
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get audits by status
const getAuditsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const audits = await auditRepository.findByStatus(status);
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent audits
const getRecentAudits = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const audits = await auditRepository.findRecent(limit);
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update audit status (RSSI only)
const updateAuditStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const audit = await auditRepository.updateStatut(req.params.id, statut);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });
    res.json(audit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllAudits,
  createAudit,
  getAuditById,
  updateAudit,
  deleteAudit,
  addPointsForts,
  generateSynthese,
  generatePlanAction,
  getAuditsByUser,
  getAuditsByStatus,
  getRecentAudits,
  updateAuditStatut
};
