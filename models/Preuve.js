const mongoose = require('mongoose');

const preuveSchema = new mongoose.Schema({
  nomFichier: { type: String, required: true },
  typeFichier: { type: String, required: true },
  urlFichier: { type: String, required: true },
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Preuve', preuveSchema); 