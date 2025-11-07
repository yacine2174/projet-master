const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  perimetre: { type: String, required: true },
  budget: { type: Number, required: true },
  priorite: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  statut: { type: String, required: true },
  creerPar: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  validePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  // Optional enterprise/company context for PAS documents
  entrepriseNom: { type: String },
  entrepriseContact: { type: String },
  // Optional direct linkage to the associated audit (referenced by frontend)
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit' },
  swot: { type: mongoose.Schema.Types.ObjectId, ref: 'SWOT' },
  conception: { type: mongoose.Schema.Types.ObjectId, ref: 'Conception' },
  risques: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Risque' }],
  constats: [{ type: mongoose.Schema.Types.Mixed, ref: 'Constat' }],
  
  // === PAS-RELATED FIELDS (for security documentation) ===
  
  // Personnel information (Section 2 of PAS)
  personnelsInternes: { type: String },
  // Example: "5 développeurs, 2 analysts, 1 chef de projet"
  
  personnelsExternes: { type: String },
  // Example: "2 consultants externes en cybersécurité (Société XYZ)"
  
  // Compliance/Regulations (Section 3 of PAS)
  reglementations: [{ type: String }],
  // Example: ["RGPD", "ISO 27001", "NIS 2", "Code du travail"]
  
  // Emergency contacts (Section 9 of PAS)
  contactsUrgence: [{
    nom: { type: String },
    fonction: { type: String },
    telephone: { type: String },
    email: { type: String }
  }],
  
  // Reference to detailed security configuration
  securite: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SecuriteProjet' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Projet', projetSchema); 