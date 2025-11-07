const Risque = require('../models/Risques');

class RisquesRepository {
  // Créer un risque
  async create(risqueData) {
    return await Risque.create(risqueData);
  }

  // Trouver un risque par ID
  async findById(id) {
    return await Risque.findById(id).populate('projet');
  }

  // Trouver tous les risques avec filtres
  async findAll(filters = {}) {
    const query = Risque.find(filters)
      .populate('projet')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les risques par projet
  async findByProjet(projetId) {
    return await Risque.find({ projet: projetId })
      .populate('projet')
      .sort({ niveauRisque: -1, createdAt: -1 });
  }

  // Trouver les risques par niveau
  async findByNiveau(niveauRisque) {
    return await Risque.find({ niveauRisque })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les risques par probabilité
  async findByProbabilite(probabilite) {
    return await Risque.find({ probabilite })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les risques par impact
  async findByImpact(impact) {
    return await Risque.find({ impact })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les risques par décision
  async findByDecision(decision) {
    return await Risque.find({ decision })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour un risque
  async updateById(id, updateData) {
    return await Risque.findByIdAndUpdate(id, updateData, { new: true })
      .populate('projet');
  }

  // Supprimer un risque
  async deleteById(id) {
    return await Risque.findByIdAndDelete(id);
  }

  // Trouver les risques récents
  async findRecent(limit = 10) {
    return await Risque.find()
      .populate('projet')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les risques par projet
  async countByProjet(projetId) {
    return await Risque.countDocuments({ projet: projetId });
  }

  // Compter les risques par niveau
  async countByNiveau(niveauRisque) {
    return await Risque.countDocuments({ niveauRisque });
  }

  // Statistiques des risques
  async getStats() {
    const totalRisques = await Risque.countDocuments();
    
    // Par niveau de risque
    const parNiveau = await Risque.aggregate([
      {
        $group: {
          _id: '$niveauRisque',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Par probabilité
    const parProbabilite = await Risque.aggregate([
      {
        $group: {
          _id: '$probabilite',
          count: { $sum: 1 }
        }
      }
    ]);

    // Par impact
    const parImpact = await Risque.aggregate([
      {
        $group: {
          _id: '$impact',
          count: { $sum: 1 }
        }
      }
    ]);

    // Par décision
    const parDecision = await Risque.aggregate([
      {
        $group: {
          _id: '$decision',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalRisques,
      parNiveau,
      parProbabilite,
      parImpact,
      parDecision
    };
  }

  // Trouver les risques critiques (niveau élevé)
  async findCritiques() {
    return await Risque.find({
      niveauRisque: { $in: ['Élevé', 'Très élevé'] }
    })
      .populate('projet')
      .sort({ niveauRisque: -1, createdAt: -1 });
  }

  // Trouver les risques par actif cible
  async findByActifCible(actifCible) {
    return await Risque.find({
      actifsCibles: { $regex: actifCible, $options: 'i' }
    })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les risques par menace
  async findByMenace(menace) {
    return await Risque.find({
      menaces: { $regex: menace, $options: 'i' }
    })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les risques par vulnérabilité
  async findByVulnerabilite(vulnerabilite) {
    return await Risque.find({
      vulnerabilites: { $regex: vulnerabilite, $options: 'i' }
    })
      .populate('projet')
      .sort({ createdAt: -1 });
  }
}

module.exports = new RisquesRepository(); 