const securiteProjetRepository = require('../repositories/securiteProjetRepository');
const { validationResult } = require('express-validator');

/**
 * Controller for SecuriteProjet entity
 * Handles CRUD operations for project security configurations
 */

/**
 * Create a new security configuration
 * @route POST /api/securite-projets
 * @access Private (RSSI, SSI)
 */
exports.createSecuriteProjet = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if project already has a security configuration
    const exists = await securiteProjetRepository.existsByProjetId(req.body.projet);
    if (exists) {
      return res.status(400).json({ 
        message: 'Ce projet possède déjà une configuration de sécurité. Veuillez la modifier au lieu d\'en créer une nouvelle.' 
      });
    }

    // Add creator information
    const securiteData = {
      ...req.body,
      creerPar: req.user._id
    };

    const securite = await securiteProjetRepository.create(securiteData);
    res.status(201).json(securite);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all security configurations
 * @route GET /api/securite-projets
 * @access Private (RSSI, SSI)
 */
exports.getAllSecuriteProjet = async (req, res, next) => {
  try {
    const securites = await securiteProjetRepository.findAll();
    res.json(securites);
  } catch (error) {
    next(error);
  }
};

/**
 * Get security configuration by ID
 * @route GET /api/securite-projets/:id
 * @access Private (RSSI, SSI)
 */
exports.getSecuriteProjetById = async (req, res, next) => {
  try {
    const securite = await securiteProjetRepository.findById(req.params.id);
    
    if (!securite) {
      return res.status(404).json({ message: 'Configuration de sécurité non trouvée' });
    }
    
    res.json(securite);
  } catch (error) {
    next(error);
  }
};

/**
 * Get security configuration by project ID
 * @route GET /api/securite-projets/projet/:projetId
 * @access Private (RSSI, SSI)
 */
exports.getSecuriteProjetByProjetId = async (req, res, next) => {
  try {
    const securite = await securiteProjetRepository.findByProjetId(req.params.projetId);
    
    if (!securite) {
      return res.status(404).json({ message: 'Aucune configuration de sécurité trouvée pour ce projet' });
    }
    
    res.json(securite);
  } catch (error) {
    next(error);
  }
};

/**
 * Update security configuration
 * @route PUT /api/securite-projets/:id
 * @access Private (RSSI, SSI)
 */
exports.updateSecuriteProjet = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if security configuration exists
    const existing = await securiteProjetRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Configuration de sécurité non trouvée' });
    }

    // Update
    const securite = await securiteProjetRepository.update(req.params.id, req.body);
    res.json(securite);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete security configuration
 * @route DELETE /api/securite-projets/:id
 * @access Private (RSSI only)
 */
exports.deleteSecuriteProjet = async (req, res, next) => {
  try {
    const securite = await securiteProjetRepository.findById(req.params.id);
    
    if (!securite) {
      return res.status(404).json({ message: 'Configuration de sécurité non trouvée' });
    }

    await securiteProjetRepository.delete(req.params.id);
    res.json({ message: 'Configuration de sécurité supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};
