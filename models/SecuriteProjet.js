const mongoose = require('mongoose');

/**
 * SecuriteProjet Model
 * 
 * Stores detailed security configuration for a project.
 * This supports the PAS (Plan Assurance Sécurité) documentation requirements.
 * 
 * Related to:
 * - Section 6 of PAS: Mesures de sécurité (physique, logique, organisationnelle)
 * - Section 7 of PAS: Plan de continuité et reprise d'activité (PCA/PRA)
 */

const securiteProjetSchema = new mongoose.Schema({
  // Reference to the associated project (one-to-one relationship)
  projet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Projet', 
    required: true,
    unique: true // Each project can only have one security configuration
  },
  
  // Version tracking for the security plan
  version: { type: String, default: '1.0' },
  derniereRevision: { type: Date, default: Date.now },
  
  // === SECTION 6.1: Sécurité Physique ===
  mesuresSecurite: {
    physique: {
      controleAcces: { type: String },
      // Example: "Badge RFID, contrôle biométrique à l'entrée principale"
      
      videoSurveillance: { type: String },
      // Example: "12 caméras HD couvrant tous les points d'accès, enregistrement 30 jours"
      
      protectionIncendie: { type: String },
      // Example: "Détecteurs de fumée, extincteurs CO2, système sprinkler automatique"
      
      autresMesures: { type: String }
      // Any other physical security measures
    },
    
    // === SECTION 6.2: Sécurité Logique ===
    logique: {
      authentification: { type: String },
      // Example: "MFA obligatoire (Google Authenticator), politique de mot de passe forte"
      
      sauvegardes: { type: String },
      // Example: "Sauvegarde quotidienne incrémentale, hebdomadaire complète, stockage off-site"
      
      chiffrement: { type: String },
      // Example: "AES-256 pour données au repos, TLS 1.3 pour données en transit"
      
      pareFeuxAntivirus: { type: String },
      // Example: "Firewall Fortinet, Antivirus Kaspersky mis à jour automatiquement"
      
      autresMesures: { type: String }
    },
    
    // === SECTION 6.3: Sécurité Organisationnelle ===
    organisationnelle: {
      formationSensibilisation: { type: String },
      // Example: "Formation annuelle cybersécurité, quiz trimestriel phishing"
      
      proceduresHabilitation: { type: String },
      // Example: "Validation par manager + RSSI, révision annuelle des accès"
      
      clausesConfidentialite: { type: String },
      // Example: "NDA signé par tous les collaborateurs et sous-traitants"
      
      autresMesures: { type: String }
    }
  },
  
  // === SECTION 5: Rôles et Responsabilités ===
  rolesEtResponsabilites: [{
    role: { type: String },
    // Example: "RSSI", "Chef de projet", "Administrateur système"
    
    responsabilite: { type: String }
    // Example: "Définit la politique de sécurité et supervise sa mise en œuvre"
  }],
  
  // === SECTION 7: Plan de Continuité et Reprise d'Activité (PCA/PRA) ===
  pcaPra: {
    sauvegardeRestauration: {
      procedures: { type: String },
      // Example: "Procédure testée mensuellement, RTO: 4h, RPO: 1h"
      
      derniereTest: { type: Date },
      frequenceTests: { type: String }
      // Example: "Mensuel"
    },
    
    siteSecours: {
      description: { type: String },
      // Example: "Data center secondaire à Lyon, synchronisation en temps réel"
      
      adresse: { type: String }
    },
    
    exercicesSimulation: {
      description: { type: String },
      // Example: "Simulation de cyberattaque avec équipe de crise"
      
      dernierExercice: { type: Date },
      frequence: { type: String }
      // Example: "Semestriel"
    }
  },
  
  // Audit trail
  creerPar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur', 
    required: true 
  },
  
  // Optional validation by RSSI
  valideePar: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur' 
  },
  dateValidation: { type: Date },
  
  // Additional notes or comments
  notes: { type: String }
  
}, {
  timestamps: true
});

// Note: Index on 'projet' field is automatically created by unique: true
// No need for manual index definition

module.exports = mongoose.model('SecuriteProjet', securiteProjetSchema);
