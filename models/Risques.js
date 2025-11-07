const mongoose = require('mongoose');

const risquesSchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: { type: String, required: true },
  priorite: { type: String, required: true },
  niveauRisque: { type: String, required: true },
  impact: { type: String, required: true },
  probabilite: { type: String, required: true },
  decision: { type: String, required: true },
  preuves: { type: [String], default: [] },
  mesures: { type: [String], default: [] },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Risque', risquesSchema);