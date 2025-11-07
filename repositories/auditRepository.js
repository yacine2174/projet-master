const Audit = require('../models/Audit');

class AuditRepository {
  // Créer un audit
  async create(auditData) {
    return await Audit.create(auditData);
  }

  // Trouver un audit par ID avec toutes les relations
  async findById(id) {
    return await Audit.findById(id)
      .populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description');
  }

  // Trouver tous les audits avec filtres
  async findAll(filters = {}) {
    const query = Audit.find(filters)
      .populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les audits par utilisateur
  async findByUser(userId, userRole) {
    let query = {};
    
    // RSSI peut voir tous les audits, SSI seulement les siens
    if (userRole === 'SSI') {
      query.creerPar = userId;
    }
    
    return await Audit.find(query)
      .populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour un audit
  async updateById(id, updateData) {
    return await Audit.findByIdAndUpdate(id, updateData, { new: true })
      .populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description');
  }

  // Supprimer un audit
  async deleteById(id) {
    return await Audit.findByIdAndDelete(id);
  }

  // Ajouter des points forts
  async addPointsForts(id, pointsForts) {
    return await Audit.findByIdAndUpdate(
      id,
      { $push: { pointsForts: { $each: pointsForts } } },
      { new: true }
    ).populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description');
  }

  // Générer la synthèse d'audit
  async generateSynthese(id) {
    const audit = await this.findById(id);
    if (!audit) return null;

    const constats = audit.constats || [];
    const statistiques = {
      totalConstats: constats.length,
      constatsCritiques: constats.filter(c => c.type === 'NC maj').length,
      constatsMajeurs: constats.filter(c => c.type === 'NC maj').length,
      constatsMineurs: constats.filter(c => c.type === 'NC min').length,
      recommandations: constats.reduce((acc, c) => acc + (c.recommandations?.length || 0), 0)
    };

    const repartitionParType = {};
    const repartitionParCriticite = {};
    
    constats.forEach(constat => {
      repartitionParType[constat.type] = (repartitionParType[constat.type] || 0) + 1;
      if (constat.criticite) {
        repartitionParCriticite[constat.criticite] = (repartitionParCriticite[constat.criticite] || 0) + 1;
      }
    });

    const synthese = {
      statistiques,
      graphiques: {
        repartitionParType,
        repartitionParCriticite,
        evolutionTemps: []
      }
    };

    return await this.updateById(id, { synthese });
  }

  // Trouver les audits par statut
  async findByStatus(status) {
    return await Audit.find({ statut: status })
      .populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour le statut d'un audit
  async updateStatut(id, statut) {
    return await Audit.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    ).populate('creerPar', 'nom email role')
      .populate('normes', 'nom categorie version description');
  }

  // Compter les audits par utilisateur
  async countByUser(userId) {
    return await Audit.countDocuments({ creerPar: userId });
  }

  // Trouver les audits récents
  async findRecent(limit = 10) {
    return await Audit.find()
      .populate('creerPar', 'nom email role')
      .populate('constats')
      .populate('normes', 'nom categorie version description')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new AuditRepository(); 