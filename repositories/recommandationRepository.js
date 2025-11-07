const Recommandation = require('../models/Recommandation');
const Constat = require('../models/Constat');

class RecommandationRepository {
  // Créer une recommandation
  async create(recommandationData) {
    return await Recommandation.create(recommandationData);
  }

  // Trouver une recommandation par ID avec toutes les relations
  async findById(id) {
    return await Recommandation.findById(id)
      .populate('constat')
      .populate('plansAction');
  }

  // Trouver toutes les recommandations avec filtres
  async findAll(filters = {}) {
    const query = Recommandation.find(filters)
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les recommandations par constat
  async findByConstat(constatId) {
    return await Recommandation.find({ constat: constatId })
      .populate('constat')
      .populate('plansAction')
      .sort({ priorite: -1, createdAt: -1 });
  }

  // Trouver les recommandations par priorité
  async findByPriorite(priorite) {
    return await Recommandation.find({ priorite })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations par complexité
  async findByComplexite(complexite) {
    return await Recommandation.find({ complexite })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour une recommandation
  async updateById(id, updateData) {
    return await Recommandation.findByIdAndUpdate(id, updateData, { new: true })
      .populate('constat')
      .populate('plansAction');
  }

  // Supprimer une recommandation
  async deleteById(id) {
    return await Recommandation.findByIdAndDelete(id);
  }

  // Valider une recommandation (deprecated - use updateStatut instead)
  async valider(id, validationData) {
    const statut = validationData.validee ? 'validée' : 'à revoir';
    return await Recommandation.findByIdAndUpdate(
      id,
      { 
        statut,
        commentaires: validationData.commentaires
      },
      { new: true }
    ).populate('constat');
  }

  // Mettre à jour le statut d'une recommandation
  async updateStatut(id, statut) {
    return await Recommandation.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    ).populate('constat')
      .populate('plansAction');
  }

  // Créer plusieurs recommandations en lot
  async createBulk(recommandationsData) {
    const createdRecommandations = [];
    
    for (const recData of recommandationsData) {
      const { contenu, priorite, complexite, constatId } = recData;
      
      // Vérifier que le constat existe
      const constat = await Constat.findById(constatId);
      if (!constat) {
        throw new Error(`Constat ${constatId} non trouvé pour la recommandation: ${contenu}`);
      }
      
      // Créer la recommandation
      const recommandation = await Recommandation.create({
        contenu,
        priorite,
        complexite,
        constat: constatId,
        statut: 'en attente' // Default status
      });
      
      await recommandation.populate('constat');
      createdRecommandations.push(recommandation);
    }
    
    return createdRecommandations;
  }

  // Trouver les recommandations récentes
  async findRecent(limit = 10) {
    return await Recommandation.find()
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les recommandations par constat
  async countByConstat(constatId) {
    return await Recommandation.countDocuments({ constat: constatId });
  }

  // Compter les recommandations par priorité
  async countByPriorite(priorite) {
    return await Recommandation.countDocuments({ priorite });
  }

  // Compter les recommandations par statut
  async countByStatut(statut) {
    return await Recommandation.countDocuments({ statut });
  }

  // Statistiques des recommandations
  async getStats() {
    const totalRecommandations = await Recommandation.countDocuments();
    const recommandationsValidees = await Recommandation.countDocuments({ statut: 'validée' });
    const recommandationsEnAttente = await Recommandation.countDocuments({ statut: 'en attente' });
    const recommandationsARevoir = await Recommandation.countDocuments({ statut: 'à revoir' });
    
    // Par statut
    const parStatut = await Recommandation.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Par priorité
    const parPriorite = await Recommandation.aggregate([
      {
        $group: {
          _id: '$priorite',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Par complexité
    const parComplexite = await Recommandation.aggregate([
      {
        $group: {
          _id: '$complexite',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalRecommandations,
      validees: recommandationsValidees,
      enAttente: recommandationsEnAttente,
      aRevoir: recommandationsARevoir,
      parStatut,
      parPriorite,
      parComplexite
    };
  }

  // Trouver les recommandations non validées (en attente)
  async findNonValidees() {
    return await Recommandation.find({ statut: 'en attente' })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations validées
  async findValidees() {
    return await Recommandation.find({ statut: 'validée' })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations par audit
  async findByAudit(auditId) {
    return await Recommandation.find()
      .populate({
        path: 'constat',
        match: { audit: auditId }
      })
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations prioritaires
  async findPrioritaires() {
    return await Recommandation.find({
      priorite: { $in: ['Très élevée', 'Élevée'] }
    })
      .populate('constat')
      .populate('plansAction')
      .sort({ priorite: -1, createdAt: -1 });
  }

  // Trouver les recommandations par statut
  async findByStatut(statut) {
    return await Recommandation.find({ statut })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations en attente
  async findEnAttente() {
    return await Recommandation.find({ statut: 'en attente' })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }

  // Trouver les recommandations à revoir
  async findARevoir() {
    return await Recommandation.find({ statut: 'à revoir' })
      .populate('constat')
      .populate('plansAction')
      .sort({ createdAt: -1 });
  }
}

module.exports = new RecommandationRepository(); 