const mongoose = require('mongoose');

const constatSchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: { type: String, enum: ['NC maj', 'NC min', 'PS', 'PP'], required: true },
  criticite: { type: String, required: true },
  impact: { type: String, required: true },
  probabilite: { type: String, required: true },
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' },
  recommandations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommandation' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Constat', constatSchema); 