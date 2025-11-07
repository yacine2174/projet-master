const PAS = require('../models/PAS');

module.exports = {
  async create(data) {
    const pas = new PAS(data);
    return await pas.save();
  },

  async getById(id) {
    return await PAS.findById(id).populate('projet', 'nom perimetre dateDebut dateFin');
  },

  async getByProjet(projetId) {
    return await PAS.find({ projet: projetId }).sort({ createdAt: -1 });
  },

  async list() {
    return await PAS.find().sort({ createdAt: -1 });
  },

  async update(id, data) {
    return await PAS.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await PAS.findByIdAndDelete(id);
  }
};


