const mongoose = require('mongoose');

const recommandationSchema = new mongoose.Schema({
  contenu: { type: String, required: true },
  priorite: { type: String, required: true },
  complexite: { type: String, required: true },
  statut: { type: String, enum: ['en attente', 'validée', 'à revoir'], default: 'en attente' },
  constat: { type: mongoose.Schema.Types.ObjectId, ref: 'Constat', required: true },
  plansAction: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlanAction' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommandation', recommandationSchema); 