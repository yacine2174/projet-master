const mongoose = require('mongoose');

const normesSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  categorie: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, required: true },
  audits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Audit' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Norme', normesSchema); 