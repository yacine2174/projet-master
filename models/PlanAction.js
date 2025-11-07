const mongoose = require('mongoose');

const planActionSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  priorite: { type: String, required: true },
  recommandations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommandation' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('PlanAction', planActionSchema); 