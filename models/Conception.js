const mongoose = require('mongoose');

const conceptionSchema = new mongoose.Schema({
  nomFichier: { type: String, required: true },
  typeFichier: { type: String, required: true },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' },
  rssiCommentaire: { type: String },
  statut: { type: String, enum: ['en attente', 'validée', 'à revoir'], default: 'en attente' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conception', conceptionSchema); 