const SecuriteProjet = require('../models/SecuriteProjet');

/**
 * Repository for SecuriteProjet entity
 * Handles all database operations for security configurations
 */

class SecuriteProjetRepository {
  /**
   * Create a new security configuration
   * @param {Object} securiteData - Security configuration data
   * @returns {Promise<Object>} Created security configuration
   */
  async create(securiteData) {
    const securite = new SecuriteProjet(securiteData);
    return await securite.save();
  }

  /**
   * Find security configuration by ID
   * @param {String} id - Security configuration ID
   * @returns {Promise<Object|null>} Security configuration or null
   */
  async findById(id) {
    return await SecuriteProjet.findById(id)
      .populate('projet', 'nom')
      .populate('creerPar', 'nom prenom email')
      .populate('valideePar', 'nom prenom email');
  }

  /**
   * Find security configuration by project ID
   * @param {String} projetId - Project ID
   * @returns {Promise<Object|null>} Security configuration or null
   */
  async findByProjetId(projetId) {
    return await SecuriteProjet.findOne({ projet: projetId })
      .populate('projet', 'nom')
      .populate('creerPar', 'nom prenom email')
      .populate('valideePar', 'nom prenom email');
  }

  /**
   * Find all security configurations
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of security configurations
   */
  async findAll(filters = {}) {
    return await SecuriteProjet.find(filters)
      .populate('projet', 'nom statut')
      .populate('creerPar', 'nom prenom email')
      .populate('valideePar', 'nom prenom email')
      .sort({ createdAt: -1 });
  }

  /**
   * Update security configuration
   * @param {String} id - Security configuration ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated security configuration or null
   */
  async update(id, updateData) {
    return await SecuriteProjet.findByIdAndUpdate(
      id,
      { ...updateData, derniereRevision: new Date() },
      { new: true, runValidators: true }
    )
      .populate('projet', 'nom')
      .populate('creerPar', 'nom prenom email')
      .populate('valideePar', 'nom prenom email');
  }

  /**
   * Delete security configuration
   * @param {String} id - Security configuration ID
   * @returns {Promise<Object|null>} Deleted security configuration or null
   */
  async delete(id) {
    return await SecuriteProjet.findByIdAndDelete(id);
  }

  /**
   * Check if project already has a security configuration
   * @param {String} projetId - Project ID
   * @returns {Promise<Boolean>} True if exists, false otherwise
   */
  async existsByProjetId(projetId) {
    const count = await SecuriteProjet.countDocuments({ projet: projetId });
    return count > 0;
  }
}

module.exports = new SecuriteProjetRepository();
