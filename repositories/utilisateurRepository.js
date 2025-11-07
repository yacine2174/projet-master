const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');

class UtilisateurRepository {
  // Créer un utilisateur
  async create(userData) {
    return await Utilisateur.create(userData);
  }

  // Trouver un utilisateur par ID
  async findById(id) {
    return await Utilisateur.findById(id).select('-motDePasse');
  }

  // Trouver un utilisateur par email
  async findByEmail(email) {
    return await Utilisateur.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  }

  // Trouver tous les utilisateurs
  async findAll() {
    return await Utilisateur.find().select('-motDePasse');
  }

  // Trouver les utilisateurs par rôle
  async findByRole(role) {
    return await Utilisateur.find({ role }).select('-motDePasse');
  }

  // Mettre à jour un utilisateur
  async updateById(id, updateData) {
    return await Utilisateur.findByIdAndUpdate(id, updateData, { new: true }).select('-motDePasse');
  }

  // Mettre à jour un utilisateur par email
  async updateByEmail(email, updateData) {
    return await Utilisateur.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } }, 
      updateData, 
      { new: true }
    ).select('-motDePasse');
  }

  async findByEmail(email) {
    return await Utilisateur.findOne(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } }
    );
  }

  // Supprimer un utilisateur
  async deleteById(id) {
    return await Utilisateur.findByIdAndDelete(id);
  }

  // Authentifier un utilisateur
  async authenticate(email, motDePasse) {
    const utilisateur = await this.findByEmail(email);
    if (!utilisateur) return null;

    const isMatch = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!isMatch) return null;

    return utilisateur;
  }

  // Vérifier si un email existe déjà
  async emailExists(email) {
    const utilisateur = await this.findByEmail(email);
    return !!utilisateur;
  }

  // Changer le mot de passe
  async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.updateById(id, { motDePasse: hashedPassword });
  }

  // Trouver les RSSI
  async findRSSI() {
    return await Utilisateur.find({ role: 'RSSI' }).select('-motDePasse');
  }

  // Trouver les SSI
  async findSSI() {
    return await Utilisateur.find({ role: 'SSI' }).select('-motDePasse');
  }

  // Compter les utilisateurs par rôle
  async countByRole(role) {
    return await Utilisateur.countDocuments({ role });
  }

  // Trouver les utilisateurs récents
  async findRecent(limit = 10) {
    return await Utilisateur.find()
      .select('-motDePasse')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Vérifier les permissions
  async hasPermission(userId, requiredRole) {
    const utilisateur = await this.findById(userId);
    if (!utilisateur) return false;

    // RSSI a tous les droits
    if (utilisateur.role === 'RSSI') return true;

    // Vérifier le rôle requis
    return utilisateur.role === requiredRole;
  }

  // Trouver les utilisateurs avec leurs audits
  async findWithAudits(userId) {
    const utilisateur = await this.findById(userId);
    if (!utilisateur) return null;

    // Récupérer les audits de l'utilisateur
    const Audit = require('../models/Audit');
    const audits = await Audit.find({ creerPar: userId })
      .populate('constats')
      .populate('preuves')
      .sort({ createdAt: -1 });

    return {
      ...utilisateur.toObject(),
      audits
    };
  }

  // Trouver les informations publiques des utilisateurs (sans email) pour SSI et RSSI
  async findPublicInfo() {
    return await Utilisateur.find()
      .select('_id nom role status createdAt')
      .sort({ nom: 1 });
  }

  // Trouver les informations publiques d'un utilisateur spécifique (sans email) pour SSI et RSSI
  async findPublicInfoById(id) {
    return await Utilisateur.findById(id)
      .select('_id nom role status createdAt');
  }
}

module.exports = new UtilisateurRepository(); 