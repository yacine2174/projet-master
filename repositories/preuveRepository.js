const Preuve = require('../models/Preuve');

class PreuveRepository {
  // Créer une preuve
  async create(preuveData) {
    return await Preuve.create(preuveData);
  }

  // Trouver une preuve par ID
  async findById(id) {
    return await Preuve.findById(id).populate('audit');
  }

  // Trouver toutes les preuves avec filtres
  async findAll(filters = {}) {
    const query = Preuve.find(filters)
      .populate('audit')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les preuves par audit
  async findByAudit(auditId) {
    return await Preuve.find({ audit: auditId })
      .populate('audit')
      .sort({ createdAt: -1 });
  }

  // Trouver les preuves par type de fichier
  async findByTypeFichier(typeFichier) {
    return await Preuve.find({ typeFichier })
      .populate('audit')
      .sort({ createdAt: -1 });
  }

  // Trouver les preuves par nom de fichier
  async findByNomFichier(nomFichier) {
    return await Preuve.find({
      nomFichier: { $regex: nomFichier, $options: 'i' }
    })
      .populate('audit')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour une preuve
  async updateById(id, updateData) {
    return await Preuve.findByIdAndUpdate(id, updateData, { new: true })
      .populate('audit');
  }

  // Supprimer une preuve
  async deleteById(id) {
    return await Preuve.findByIdAndDelete(id);
  }

  // Trouver les preuves récentes
  async findRecent(limit = 10) {
    return await Preuve.find()
      .populate('audit')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Compter les preuves par audit
  async countByAudit(auditId) {
    return await Preuve.countDocuments({ audit: auditId });
  }

  // Compter les preuves par type de fichier
  async countByTypeFichier(typeFichier) {
    return await Preuve.countDocuments({ typeFichier });
  }

  // Statistiques des preuves
  async getStats() {
    const totalPreuves = await Preuve.countDocuments();
    
    // Par type de fichier
    const parTypeFichier = await Preuve.aggregate([
      {
        $group: {
          _id: '$typeFichier',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Par audit
    const parAudit = await Preuve.aggregate([
      {
        $group: {
          _id: '$audit',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalPreuves,
      parTypeFichier,
      parAudit
    };
  }

  // Trouver les preuves par extension
  async findByExtension(extension) {
    return await Preuve.find({
      nomFichier: { $regex: `\\.${extension}$`, $options: 'i' }
    })
      .populate('audit')
      .sort({ createdAt: -1 });
  }

  // Trouver les preuves par taille (approximative)
  async findByTaille(minTaille, maxTaille) {
    // Cette méthode pourrait être utilisée pour filtrer par taille de fichier
    // si on stocke cette information
    return await Preuve.find()
      .populate('audit')
      .sort({ createdAt: -1 });
  }

  // Vérifier si une preuve existe par URL
  async existsByUrl(urlFichier) {
    const preuve = await Preuve.findOne({ urlFichier });
    return !!preuve;
  }

  // Trouver les preuves par nom de fichier partiel
  async findByNomFichierPartiel(partieNom) {
    return await Preuve.find({
      nomFichier: { $regex: partieNom, $options: 'i' }
    })
      .populate('audit')
      .sort({ createdAt: -1 });
  }
}

module.exports = new PreuveRepository(); 