const mongoose = require('mongoose');

const swotSchema = new mongoose.Schema({
  forces: { type: [String], required: true, default: [] },
  faiblesses: { type: [String], required: true, default: [] },
  opportunites: { type: [String], required: true, default: [] },
  menaces: { type: [String], required: true, default: [] },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' }
}, {
  timestamps: true
});

module.exports = mongoose.model('SWOT', swotSchema);