const Constat = require('../models/Constat');

class ConstatRepository {
  // Créer un constat
  async create(constatData) {
    return await Constat.create(constatData);
  }

  // Trouver un constat par ID avec toutes les relations
  async findById(id) {
    return await Constat.findById(id)
      .populate('audit')
      .populate('projet')
      .populate({
        path: 'recommandations',
        populate: {
          path: 'plansAction',
          model: 'PlanAction'
        }
      });
  }

  // Trouver tous les constats avec filtres
  async findAll(filters = {}) {
    const query = Constat.find(filters)
      .populate('audit')
      .populate('projet')
      .populate('recommandations')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les constats par audit
  async findByAudit(auditId) {
    return await Constat.find({ audit: auditId })
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Trouver les constats par type
  async findByType(type) {
    return await Constat.find({ type })
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Trouver les constats par criticité
  async findByCriticite(criticite) {
    return await Constat.find({ criticite })
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour un constat
  async updateById(id, updateData) {
    return await Constat.findByIdAndUpdate(id, updateData, { new: true })
      .populate('audit')
      .populate('projet')
      .populate('recommandations');
  }

  // Supprimer un constat
  async deleteById(id) {
    return await Constat.findByIdAndDelete(id);
  }

  // Ajouter des preuves à un constat
  async addPreuves(id, preuves) {
    return await Constat.findByIdAndUpdate(
      id,
      { $push: { preuves: { $each: preuves } } },
      { new: true }
    ).populate('preuves');
  }

  // Ajouter des recommandations à un constat
  async addRecommandations(id, recommandations) {
    return await Constat.findByIdAndUpdate(
      id,
      { $push: { recommandations: { $each: recommandations } } },
      { new: true }
    ).populate('recommandations');
  }

  // Trouver les constats par impact
  async findByImpact(impact) {
    return await Constat.find({ impact })
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Trouver les constats par probabilité
  async findByProbabilite(probabilite) {
    return await Constat.find({ probabilite })
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Compter les constats par audit
  async countByAudit(auditId) {
    return await Constat.countDocuments({ audit: auditId });
  }

  // Compter les constats par type
  async countByType(type) {
    return await Constat.countDocuments({ type });
  }

  // Trouver les constats récents
  async findRecent(limit = 10) {
    return await Constat.find()
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Statistiques des constats
  async getStats() {
    const totalConstats = await Constat.countDocuments();
    const constatsParType = await Constat.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const constatsParCriticite = await Constat.aggregate([
      {
        $group: {
          _id: '$criticite',
          count: { $sum: 1 }
        }
      }
    ]);

    const constatsParImpact = await Constat.aggregate([
      {
        $group: {
          _id: '$impact',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalConstats,
      parType: constatsParType,
      parCriticite: constatsParCriticite,
      parImpact: constatsParImpact
    };
  }

  // Trouver les constats avec recommandations
  async findWithRecommandations() {
    return await Constat.find({
      recommandations: { $exists: true, $ne: [] }
    })
      .populate('audit')
      .populate('recommandations')
      .sort({ createdAt: -1 });
  }

  // Trouver les constats sans recommandations
  async findWithoutRecommandations() {
    return await Constat.find({
      $or: [
        { recommandations: { $exists: false } },
        { recommandations: { $size: 0 } }
      ]
    })
      .populate('audit')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ConstatRepository(); 