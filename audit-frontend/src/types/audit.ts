// Audit Management Types - EXACTLY matching backend field names

export interface Audit {
  _id: string;
  nom: string;
  type: 'Organisationnel' | 'Technique'; // Backend enum values
  perimetre: string;
  objectifs: string;
  dateDebut: string;
  dateFin: string;
  statut: 'Planifié' | 'En cours' | 'Terminé'; // Backend enum values
  pointsForts?: string[]; // Backend field (commented but should be implemented)
  synthese?: any; // Backend field (commented but should be implemented)
  creerPar: string; // Backend field name
  normes: string[]; // Backend field name
  // NEW PAS-related fields (Company/Organization Context)
  entrepriseNom?: string;
  entrepriseContact?: string;
  personnelsInternes?: string;
  personnelsExternes?: string;
  reglementations?: string[];
  // Follow-up & Documentation
  suiviSecurite?: {
    reunions?: {
      frequence?: string;
      prochaine?: string;
    };
    auditInterne?: {
      frequence?: string;
      prochain?: string;
    };
  };
  annexes?: {
    fichesSensibilisation?: string[];
    registreIncidents?: string;
    autresDocuments?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuditData {
  nom: string;
  type: 'Organisationnel' | 'Technique';
  perimetre: string;
  objectifs: string;
  dateDebut: string;
  dateFin: string;
  pointsForts?: string[];
  synthese?: any;
  creerPar: string; // Backend requires this field
  normes?: string[]; // Add normes field for frontend
  // PAS-related fields
  entrepriseNom?: string;
  entrepriseContact?: string;
  personnelsInternes?: string;
  personnelsExternes?: string;
  reglementations?: string[];
}

export interface UpdateAuditData extends Partial<CreateAuditData> {
  statut?: 'Planifié' | 'En cours' | 'Terminé';
}

// Points Forts (Strengths) - Backend doesn't have this model yet
export interface PointFort {
  _id: string;
  auditId: string;
  nom: string;
  description: string;
  controleNormatif: string;
  impact: 'faible' | 'moyen' | 'élevé';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePointFortData {
  nom: string;
  description: string;
  controleNormatif: string;
  impact: 'faible' | 'moyen' | 'élevé';
}

// Constats (Findings) - EXACTLY matching backend
export interface Constat {
  _id: string;
  description: string; // Backend field name
  type: 'NC maj' | 'NC min' | 'PS' | 'PP'; // Backend enum values
  criticite: string; // Backend field name
  impact: string; // Backend field name
  probabilite: string; // Backend field name
  audit: string; // Backend field name (not auditId)
  projet: string; // Backend field name (not projetId)
  recommandations: string[]; // Backend field name
  createdAt: string;
  updatedAt: string;
}

export interface CreateConstatData {
  description: string;
  type: 'NC maj' | 'NC min' | 'PS' | 'PP';
  criticite: string;
  impact: string;
  probabilite: string;
  audit: string;
  projet?: string;
  recommandations: string[];
}

// Plan d'Action (Action Plan) - EXACTLY matching backend
export interface PlanAction {
  _id: string;
  titre: string; // Backend field name (not nom)
  description: string;
  priorite: string; // Backend field name
  statut: 'en attente' | 'en cours' | 'terminé' | 'annulé'; // Backend enum values
  recommandations: string[]; // Backend field name
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanActionData {
  titre: string;
  description: string;
  priorite: string;
  statut: 'en attente' | 'en cours' | 'terminé' | 'annulé';
  recommandations: string[];
}

// Projet (Project) - EXACTLY matching backend
export interface Projet {
  _id: string;
  nom: string;
  perimetre: string;
  budget: number;
  priorite: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  creerPar: string; // Backend field name
  validePar?: string; // Backend field name
  audit?: string; // Optional linkage to audit
  swot?: string;
  conception?: string;
  risques: string[];
  constats: string[];
  // NEW PAS-related fields
  entrepriseNom?: string;
  entrepriseContact?: string;
  personnelsInternes?: string;
  personnelsExternes?: string;
  reglementations?: string[];
  contactsUrgence?: {
    nom: string;
    fonction: string;
    telephone: string;
    email: string;
  }[];
  securite?: string; // Reference to SecuriteProjet
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjetData {
  nom: string;
  perimetre: string;
  budget: number;
  priorite: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  audit: string; // Required audit ID
  constats: string[]; // Required constats array
}

// SWOT Analysis - EXACTLY matching backend
export interface SWOT {
  _id: string;
  forces: string; // Backend field name
  faiblesses: string; // Backend field name
  opportunites: string; // Backend field name
  menaces: string; // Backend field name
  projet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSWOTData {
  forces: string;
  faiblesses: string;
  opportunites: string;
  menaces: string;
  projet?: string;
}

// Normes (Standards) - EXACTLY matching backend
export interface Norme {
  _id: string;
  nom: string;
  categorie: string;
  version: string;
  description: string;
  audits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNormeData {
  nom: string;
  categorie: string;
  version: string;
  description: string;
}

// Recommandation - EXACTLY matching backend
export interface Recommandation {
  _id: string;
  contenu: string; // Backend field name
  priorite: string;
  complexite: string; // Backend field name
  statut: 'en attente' | 'validée' | 'à revoir'; // Backend enum values
  constat: string; // Backend field name (required)
  plansAction: string[]; // Backend field name
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommandationData {
  contenu: string;
  priorite: string;
  complexite: string;
  statut: 'en attente' | 'validée' | 'à revoir';
  constat: string; // Required field
  plansAction: string[];
}

// Preuve (Evidence) - EXACTLY matching backend
export interface Preuve {
  _id: string;
  nom: string;
  type: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreuveData {
  nom: string;
  type: string;
  url: string;
  description?: string;
}

// Risque (Risk) - EXACTLY matching backend
export interface Risque {
  _id: string;
  nom?: string;
  description: string;
  probabilite: string;
  impact: string;
  niveau?: string; // frontend-calculated label
  niveauRisque?: string; // backend field
  type?: string;
  priorite?: string;
  decision?: string;
  preuves?: string[];
  mesures?: string[];
  projet?: string; // Optional for backward compatibility
  createdAt: string;
  updatedAt: string;
}

export interface CreateRisqueData {
  // Core fields
  description: string;
  probabilite: string;
  impact: string;
  niveau: string; // frontend-calculated
  decision: string;

  // Project association
  projet?: string;

  // Additional fields used by the form
  actifCible: string;
  menace: string;
  vulnerabilite: string;
  preuves: string[];
  mesures: string[];
  responsable?: string;
  echeance?: string;
  statut?: string;
  priorite?: string;
  nom?: string;
  type?: string;
}

// Conception - EXACTLY matching backend
export interface Conception {
  _id: string;
  nomFichier: string; // Display name/title
  nomFichierOriginal: string; // Original uploaded file name
  typeFichier: string;
  urlFichier?: string; // Added for frontend file handling
  projet: string;
  rssiCommentaire?: string;
  statut: 'en attente' | 'validée' | 'à revoir';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConceptionData {
  nomFichier: string;
  typeFichier: string;
  projet: string;
  rssiCommentaire?: string;
  statut?: 'en attente' | 'validée' | 'à revoir';
}


// Preuve (Evidence) - EXACTLY matching backend
export interface Preuve {
  _id: string;
  nomFichier: string;
  typeFichier: string;
  urlFichier: string;
  audit: string; // Audit ID
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreuveData {
  nomFichier: string;
  typeFichier: string;
  urlFichier: string;
  audit: string;
}

// SecuriteProjet (Security Configuration) - NEW for PAS
export interface SecuriteProjet {
  _id: string;
  projet: string;
  version?: string;
  derniereRevision?: string;
  rolesEtResponsabilites?: Array<{
    role: string;
    responsabilite: string;
  }>;
  mesuresSecurite?: {
    securitePhysique?: {
      controleAcces?: string;
      videosurveillance?: string;
      protectionIncendie?: string;
      autres?: string;
    };
    securiteLogique?: {
      authentification?: string;
      sauvegardes?: string;
      chiffrement?: string;
      pareFeuAntivirus?: string;
      gestionAcces?: string;
      autres?: string;
    };
    securiteOrganisationnelle?: {
      formation?: string;
      habilitation?: string;
      confidentialite?: string;
      charteUtilisation?: string;
      autres?: string;
    };
  };
  pcaPra?: {
    sauvegardeRestauration?: {
      strategie?: string;
      frequence?: string;
      support?: string;
      rpoRto?: string;
      tests?: string;
    };
    siteSecours?: {
      type?: string;
      localisation?: string;
      capacite?: string;
      contratSLA?: string;
    };
    exercicesSimulation?: {
      typeExercice?: string;
      frequence?: string;
      derniereDate?: string;
      prochaineDate?: string;
      resultats?: string;
    }[];
  };
  creerPar?: string;
  valideePar?: string;
  dateValidation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSecuriteProjetData {
  projet: string;
  version?: string;
  mesuresSecurite?: {
    securitePhysique?: {
      controleAcces?: string;
      videosurveillance?: string;
      protectionIncendie?: string;
      autres?: string;
    };
    securiteLogique?: {
      authentification?: string;
      sauvegardes?: string;
      chiffrement?: string;
      pareFeuAntivirus?: string;
      gestionAcces?: string;
      autres?: string;
    };
    securiteOrganisationnelle?: {
      formation?: string;
      habilitation?: string;
      confidentialite?: string;
      charteUtilisation?: string;
      autres?: string;
    };
  };
  pcaPra?: {
    sauvegardeRestauration?: {
      strategie?: string;
      frequence?: string;
      support?: string;
      rpoRto?: string;
      tests?: string;
    };
    siteSecours?: {
      type?: string;
      localisation?: string;
      capacite?: string;
      contratSLA?: string;
    };
    exercicesSimulation?: {
      typeExercice?: string;
      frequence?: string;
      derniereDate?: string;
      prochaineDate?: string;
      resultats?: string;
    }[];
  };
  notes?: string;
}

// PAS (Plan d'Assurance Sécurité)
export interface PAS {
  _id: string;
  projet: string | Projet;
  version: string;
  dateDocument?: string;
  objet?: string;
  champApplication?: {
    locauxEtInfrastructures?: string;
    systemesInformation?: string;
    personnels?: string;
  };
  references?: {
    normes?: string[];
    politiques?: string[];
    reglementations?: string[];
  };
  organisationSecurite?: {
    rspNomFonction?: string;
    rolesEtResponsabilites?: {
      role: string;
      responsabilite: string;
    }[];
  };
  analyseRisques?: {
    menaces?: string[];
    evaluationImpacts?: string[];
    mesuresPrevention?: string[];
  };
  swotAnalyses?: {
    forces: string;
    faiblesses: string;
    opportunites: string;
    menaces: string;
    createdAt?: string;
  }[];
  risques?: {
    description: string;
    type: string;
    priorite: string;
    niveauRisque: string;
    impact: string;
    probabilite: string;
    decision: string;
    createdAt?: string;
  }[];
  mesuresSecurite?: {
    physique?: string[];
    logique?: string[];
    organisationnelle?: string[];
  };
  pcaPra?: {
    sauvegardeRestauration?: {
      procedures?: string;
      frequenceTests?: string;
    };
    siteSecours?: {
      description?: string;
      adresse?: string;
    };
    exercices?: {
      description?: string;
      frequence?: string;
    };
  };
  suiviAudit?: {
    reunions?: string;
    auditInterne?: string;
    kpis?: { label: string; valeur: string }[];
  };
  annexes?: {
    sensibilisation?: string[];
    modeleRegistreIncidents?: string;
    contactsUrgence?: string[];
  };
  creerPar?: string;
  validePar?: string;
  createdAt?: string;
  updatedAt?: string;
}

