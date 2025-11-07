const mongoose = require('mongoose');

// PAS (Plan d'Assurance Sécurité) Schema
// Non-breaking: new model; no existing attributes renamed.
const pasSchema = new mongoose.Schema({
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
  version: { type: String, default: '1.0' },
  dateDocument: { type: Date, default: Date.now },

  // 1. Objet du document
  objet: { type: String },

  // 2. Champ d'application
  champApplication: {
    locauxEtInfrastructures: { type: String },
    systemesInformation: { type: String },
    personnels: { type: String }
  },

  // 3. Références
  references: {
    normes: [{ type: String }],
    politiques: [{ type: String }],
    reglementations: [{ type: String }]
  },

  // 4. Organisation de la sécurité
  organisationSecurite: {
    rspNomFonction: { type: String },
    rolesEtResponsabilites: [{
      role: { type: String },
      responsabilite: { type: String }
    }]
  },

  // 5. Analyse des risques (linkable with Risque/SWOT but keeping snapshot text)
  analyseRisques: {
    menaces: [{ type: String }],
    evaluationImpacts: [{ type: String }],
    mesuresPrevention: [{ type: String }]
  },

  // 5. SWOT Analysis Details
  swotAnalyses: [{
    forces: [{ type: String }],
    faiblesses: [{ type: String }],
    opportunites: [{ type: String }],
    menaces: [{ type: String }],
    createdAt: { type: Date }
  }],

  // 5. Detailed Risk Analysis
  risques: [{
    description: { type: String },
    type: { type: String },
    priorite: { type: String },
    niveauRisque: { type: String },
    impact: { type: String },
    probabilite: { type: String },
    decision: { type: String },
    createdAt: { type: Date }
  }],

  // 6. Mesures de sécurité
  mesuresSecurite: {
    physique: [{ type: String }],
    logique: [{ type: String }],
    organisationnelle: [{ type: String }]
  },

  // 7. PCA / PRA
  pcaPra: {
    sauvegardeRestauration: {
      procedures: { type: String },
      frequenceTests: { type: String }
    },
    siteSecours: {
      description: { type: String },
      adresse: { type: String }
    },
    exercices: {
      description: { type: String },
      frequence: { type: String }
    }
  },

  // 8. Suivi et audit
  suiviAudit: {
    reunions: { type: String },
    auditInterne: { type: String },
    kpis: [{ label: String, valeur: String }]
  },

  // 9. Annexes
  annexes: {
    sensibilisation: [{ type: String }],
    modeleRegistreIncidents: { type: String },
    contactsUrgence: [{ type: String }]
  },

  // Authoring
  creerPar: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  validePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }
}, {
  timestamps: true
});

module.exports = mongoose.model('PAS', pasSchema);


