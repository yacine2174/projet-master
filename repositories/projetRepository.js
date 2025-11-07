const Projet = require('../models/Projet');
const SWOT = require('../models/SWOT');
const Conception = require('../models/Conception');
const Risque = require('../models/Risques');

class ProjetRepository {
  // Créer un projet
  async create(projetData) {
    return await Projet.create(projetData);
  }

  // Trouver un projet par ID avec toutes les relations
  async findById(id) {
    return await Projet.findById(id)
      .populate('creerPar', 'nom email role')
      .populate('validePar', 'nom email role')
      .populate('swot')
      .populate('conception')
      .populate('risques');
  }

  // Trouver tous les projets avec filtres
  async findAll(filters = {}) {
    const query = Projet.find(filters)
      .populate('creerPar', 'nom email role')
      .populate('validePar', 'nom email role')
      .populate('swot')
      .populate('conception')
      .populate('risques')
      .sort({ createdAt: -1 });
    
    return await query;
  }

  // Trouver les projets par utilisateur
  async findByUser(userId, userRole) {
    let query = {};
    
    // RSSI peut voir tous les projets, SSI seulement les siens
    if (userRole === 'SSI') {
      query.creerPar = userId;
    }
    
    return await Projet.find(query)
      .populate('creerPar', 'nom email role')
      .populate('validePar', 'nom email role')
      .populate('swot')
      .populate('conception')
      .populate('risques')
      .sort({ createdAt: -1 });
  }

  // Mettre à jour un projet
  async updateById(id, updateData) {
    return await Projet.findByIdAndUpdate(id, updateData, { new: true })
      .populate('creerPar', 'nom email role')
      .populate('validePar', 'nom email role')
      .populate('swot')
      .populate('conception')
      .populate('risques');
  }

  // Supprimer un projet
  async deleteById(id) {
    return await Projet.findByIdAndDelete(id);
  }

  // Créer une analyse SWOT pour un projet
  async createSWOT(projetId, swotData) {
    const swot = await SWOT.create({
      ...swotData,
      projet: projetId
    });

    await this.updateById(projetId, { 
      swot: swot._id,
      statut: 'Analyse SWOT'
    });

    return swot;
  }

  // Créer une analyse de sécurité
  async createAnalyseSecurite(projetId, risquesData) {
    const risquesCrees = [];
    
    for (const risqueData of risquesData) {
      const risque = await Risque.create({
        ...risqueData,
        projet: projetId
      });
      risquesCrees.push(risque);
    }

    await this.updateById(projetId, {
      risques: risquesCrees.map(r => r._id),
      statut: 'Analyse de sécurité'
    });

    return risquesCrees;
  }

  // Soumettre une conception
  async soumettreConception(projetId, conceptionData) {
    const conception = await Conception.create({
      ...conceptionData,
      projet: projetId,
      validee: false
    });

    await this.updateById(projetId, {
      conception: conception._id,
      statut: 'Conception'
    });

    return conception;
  }

  // Valider une conception (RSSI uniquement)
  async validerConception(projetId, validationData, validateurId) {
    const conception = await Conception.findOneAndUpdate(
      { projet: projetId },
      { 
        validee: validationData.validee,
        commentaire: validationData.commentaires
      },
      { new: true }
    );

    const newStatus = validationData.validee ? 'Approuvé' : 'Analyse de sécurité';
    await this.updateById(projetId, {
      statut: newStatus,
      validePar: validateurId,
      dateValidation: validationData.validee ? new Date() : null,
      commentairesValidation: validationData.commentaires
    });

    return conception;
  }

  // Trouver les projets par statut
  async findByStatus(status) {
    return await Projet.find({ statut: status })
      .populate('creerPar', 'nom email role')
      .populate('swot')
      .populate('conception')
      .sort({ createdAt: -1 });
  }

  // Trouver les projets en attente de validation
  async findPendingValidation() {
    return await Projet.find({ statut: 'Conception' })
      .populate('creerPar', 'nom email role')
      .populate('conception')
      .sort({ createdAt: -1 });
  }

  // Compter les projets par utilisateur
  async countByUser(userId) {
    return await Projet.countDocuments({ creerPar: userId });
  }

  // Trouver les projets récents
  async findRecent(limit = 10) {
    return await Projet.find()
      .populate('creerPar', 'nom email role')
      .populate('statut')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Mettre à jour le statut d'un projet
  async updateStatus(id, newStatus, validateurId = null) {
    const updateData = { statut: newStatus };
    
    // Debug: Log the repository data
    console.log('Repository: updateStatus called');
    console.log('validateurId type:', typeof validateurId);
    console.log('validateurId value:', validateurId);
    
    if (validateurId) {
      updateData.validePar = validateurId;
      updateData.dateValidation = new Date();
      console.log('Repository: updateData.validePar set to:', updateData.validePar);
    }

    return await this.updateById(id, updateData);
  }
}

module.exports = new ProjetRepository(); 