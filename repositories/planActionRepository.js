const PlanAction = require('../models/PlanAction');

class PlanActionRepository {
  async create(planActionData) {
    return await PlanAction.create(planActionData);
  }

  async findById(id) {
    return await PlanAction.findById(id)
      .populate('recommandations');
  }

  async findAll(filters = {}) {
    const query = PlanAction.find(filters)
      .populate('recommandations');
    return await query;
  }

  async findByRecommandation(recommandationId) {
    return await PlanAction.find({ recommandations: recommandationId })
      .populate('recommandations');
  }

  async findByPriorite(priorite) {
    return await PlanAction.find({ priorite })
      .populate('recommandations');
  }

  async updateById(id, updateData) {
    return await PlanAction.findByIdAndUpdate(id, updateData, { new: true })
      .populate('recommandations');
  }

  async deleteById(id) {
    return await PlanAction.findByIdAndDelete(id);
  }

  async addRecommandations(id, recommandations) {
    return await PlanAction.findByIdAndUpdate(
      id,
      { $addToSet: { recommandations: { $each: recommandations } } },
      { new: true }
    ).populate('recommandations');
  }

  async findAllWithStats() {
    return await PlanAction.find()
      .populate('recommandations');
  }

  async countByRecommandation(recommandationId) {
    return await PlanAction.countDocuments({ recommandations: recommandationId });
  }

  async getStats() {
    const totalPlansAction = await PlanAction.countDocuments();
    const parRecommandation = await PlanAction.aggregate([
      { $unwind: '$recommandations' },
      { $group: { _id: '$recommandations', count: { $sum: 1 } } },
      { $lookup: { from: 'recommandations', localField: '_id', foreignField: '_id', as: 'recommandation' } },
      { $unwind: '$recommandation' },
      { $project: { recommandation: '$recommandation.contenu', count: 1 } }
    ]);

    return {
      total: totalPlansAction,
      parRecommandation
    };
  }

  async generateAutomatedPlan(auditId, auditNom) {
    const planAction = await PlanAction.create({
      titre: `Plan d'action automatique - ${auditNom}`,
      description: `Plan d'action généré automatiquement pour l'audit ${auditNom}`,
      priorite: 'Moyenne',
      recommandations: []
    });
    return planAction;
  }

  async findWithRecommandations() {
    return await PlanAction.find({
      recommandations: { $exists: true, $ne: [] }
    }).populate('recommandations');
  }

  async findWithoutRecommandations() {
    return await PlanAction.find({
      $or: [
        { recommandations: { $exists: false } },
        { recommandations: { $size: 0 } }
      ]
    });
  }

  async findRecent(limit = 10) {
    return await PlanAction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('recommandations');
  }
}

module.exports = new PlanActionRepository(); 