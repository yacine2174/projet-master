const SWOT = require('../models/SWOT');

class SWOTRepository {
  // Créer une analyse SWOT
  async create(swotData) {
    return await SWOT.create(swotData);
  }

  // Trouver une analyse SWOT par ID
  async findById(id) {
    return await SWOT.findById(id).populate('projet');
  }

  // Trouver toutes les analyses SWOT avec filtres
  async findAll(filters = {}) {
    const query = SWOT.find(filters)
      .populate('projet')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les analyses SWOT par projet
  async findByProjet(projetId) {
    return await SWOT.find({ projet: projetId })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour une analyse SWOT
  async updateById(id, updateData) {
    return await SWOT.findByIdAndUpdate(id, updateData, { new: true })
      .populate('projet');
  }

  // Supprimer une analyse SWOT
  async deleteById(id) {
    return await SWOT.findByIdAndDelete(id);
  }

  // Trouver les analyses SWOT récentes
  async findRecent(limit = 10) {
    return await SWOT.find()
      .populate('projet')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les analyses SWOT par projet
  async countByProjet(projetId) {
    return await SWOT.countDocuments({ projet: projetId });
  }

  // Statistiques des analyses SWOT
  async getStats() {
    const totalSWOT = await SWOT.countDocuments();
    
    // Par projet
    const parProjet = await SWOT.aggregate([
      {
        $group: {
          _id: '$projet',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalSWOT,
      parProjet
    };
  }
}

module.exports = new SWOTRepository(); 