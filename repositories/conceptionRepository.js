const Conception = require('../models/Conception');

class ConceptionRepository {
  // Créer une conception
  async create(conceptionData) {
    return await Conception.create(conceptionData);
  }

  // Trouver une conception par ID
  async findById(id) {
    return await Conception.findById(id).populate('projet');
  }

  // Trouver toutes les conceptions avec filtres
  async findAll(filters = {}) {
    const query = Conception.find(filters)
      .populate('projet')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les conceptions par projet
  async findByProjet(projetId) {
    return await Conception.find({ projet: projetId })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les conceptions par validation
  async findByValidation(validee) {
    return await Conception.find({ validee })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour une conception
  async updateById(id, updateData) {
    return await Conception.findByIdAndUpdate(id, updateData, { new: true })
      .populate('projet');
  }

  // Supprimer une conception
  async deleteById(id) {
    return await Conception.findByIdAndDelete(id);
  }

  // Valider une conception
  async valider(id, validationData) {
    return await Conception.findByIdAndUpdate(
      id,
      { 
        validee: validationData.validee,
        rssiCommentaire: validationData.commentaires
      },
      { new: true }
    ).populate('projet');
  }

  // Mettre à jour le statut d'une conception
  async updateStatut(id, statut) {
    return await Conception.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    ).populate('projet');
  }

  // Trouver les conceptions récentes
  async findRecent(limit = 10) {
    return await Conception.find()
      .populate('projet')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les conceptions par projet
  async countByProjet(projetId) {
    return await Conception.countDocuments({ projet: projetId });
  }

  // Compter les conceptions par validation
  async countByValidation(validee) {
    return await Conception.countDocuments({ validee });
  }

  // Statistiques des conceptions
  async getStats() {
    const totalConceptions = await Conception.countDocuments();
    const conceptionsValidees = await Conception.countDocuments({ validee: true });
    const conceptionsEnAttente = await Conception.countDocuments({ validee: false });
    
    // Par projet
    const parProjet = await Conception.aggregate([
      {
        $group: {
          _id: '$projet',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalConceptions,
      validees: conceptionsValidees,
      enAttente: conceptionsEnAttente,
      parProjet
    };
  }

  // Trouver les conceptions en attente de validation
  async findEnAttenteValidation() {
    return await Conception.find({ validee: false })
      .populate('projet')
      .sort({ createdAt: -1 });
  }

  // Trouver les conceptions validées
  async findValidees() {
    return await Conception.find({ validee: true })
      .populate('projet')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ConceptionRepository(); 