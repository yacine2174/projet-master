const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, enum: ['Organisationnel', 'Technique'], required: true },
  perimetre: { type: String, required: true },
  objectifs: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  statut: { type: String, enum: ['Planifié', 'En cours', 'Terminé'], default: 'Planifié' },
  pointsForts: [{ type: String }],
  synthese: { type: mongoose.Schema.Types.Mixed },
  // Optional KPI fields to support PAS follow-up without breaking existing API
  kpis: [{ label: String, valeur: String }],
  // Optional security policy references used in PAS
  references: [{ type: String }],
  creerPar: { type: mongoose.Schema.Types.Mixed, ref: 'Utilisateur', required: true },
  normes: [{ type: mongoose.Schema.Types.Mixed, ref: 'Norme' }],
  // Optional list of projects associated to this audit (populated on project creation when an audit is provided)
  projets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Projet' }],
  
  // === PAS-RELATED FIELDS (for context and documentation) ===
  
  // Company/Organization Context (Section 2-3 of PAS)
  entrepriseNom: { type: String },
  // Example: "Acme Corp"
  
  entrepriseContact: { type: String },
  // Example: "contact@entreprise.fr"
  
  personnelsInternes: { type: String },
  // Example: "5 développeurs, 2 analysts, 1 chef de projet"
  
  personnelsExternes: { type: String },
  // Example: "2 consultants externes en cybersécurité (Société XYZ)"
  
  reglementations: [{ type: String }],
  // Example: ["RGPD", "ISO 27001", "Code du travail", "NIS 2"]
  
  // === PAS-RELATED FIELDS (for follow-up and documentation) ===
  
  // Follow-up & Governance (Section 8 of PAS)
  suiviSecurite: {
    reunions: {
      frequence: { type: String }, // "Mensuelles", "Hebdomadaires", etc.
      prochaine: { type: Date }
    },
    auditInterne: {
      frequence: { type: String }, // "Semestriel", "Annuel", etc.
      prochain: { type: Date }
    }
  },
  
  // Documentation & Annexes (Section 9 of PAS)
  annexes: {
    fichesSensibilisation: [{ type: String }],
    // Example: ["Formation_Phishing_2024.pdf", "Guide_MDP_Securises.pdf"]
    
    registreIncidents: { type: String },
    // Example: "https://incidents.company.com/register" or "RegistreIncidents_2024.xlsx"
    
    autresDocuments: [{ type: String }]
    // Other relevant documentation
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Audit', auditSchema);
