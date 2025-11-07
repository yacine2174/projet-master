const Norme = require('../models/Normes');

class NormesRepository {
  // Créer une norme
  async create(normeData) {
    return await Norme.create(normeData);
  }

  // Trouver une norme par ID
  async findById(id) {
    return await Norme.findById(id).populate('audits');
  }

  // Trouver toutes les normes avec filtres
  async findAll(filters = {}) {
    const query = Norme.find(filters)
      .populate('audits')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les normes par catégorie
  async findByCategorie(categorie) {
    return await Norme.find({ categorie })
      .populate('audits')
      .sort({ createdAt: -1 });
  }

  // Trouver les normes par nom
  async findByNom(nom) {
    return await Norme.find({
      nom: { $regex: nom, $options: 'i' }
    })
      .populate('audits')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour une norme
  async updateById(id, updateData) {
    return await Norme.findByIdAndUpdate(id, updateData, { new: true })
      .populate('audits');
  }

  // Supprimer une norme
  async deleteById(id) {
    return await Norme.findByIdAndDelete(id);
  }

  // Trouver les normes récentes
  async findRecent(limit = 10) {
    return await Norme.find()
      .populate('audits')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les normes par catégorie
  async countByCategorie(categorie) {
    return await Norme.countDocuments({ categorie });
  }

  // Statistiques des normes
  async getStats() {
    const totalNormes = await Norme.countDocuments();
    
    // Par catégorie
    const parCategorie = await Norme.aggregate([
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalNormes,
      parCategorie
    };
  }

  // Trouver les normes par nom partiel
  async findByNomPartiel(partieNom) {
    return await Norme.find({
      nom: { $regex: partieNom, $options: 'i' }
    })
      .populate('audits')
      .sort({ createdAt: -1 });
  }

  // Vérifier si une norme existe par nom
  async existsByNom(nom) {
    const norme = await Norme.findOne({ nom });
    return !!norme;
  }

  // Trouver les normes utilisées dans des audits
  async findUtilisees() {
    return await Norme.find({
      audits: { $exists: true, $ne: [] }
    })
      .populate('audits')
      .sort({ createdAt: -1 });
  }

  // Trouver les normes non utilisées
  async findNonUtilisees() {
    return await Norme.find({
      $or: [
        { audits: { $exists: false } },
        { audits: { $size: 0 } }
      ]
    })
      .populate('audits')
      .sort({ createdAt: -1 });
  }
}

module.exports = new NormesRepository(); 