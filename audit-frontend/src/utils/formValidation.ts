export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rules.message || 'Ce champ est obligatoire';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value);

  // Length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `Ce champ doit contenir au moins ${rules.minLength} caractères`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `Ce champ doit contenir au maximum ${rules.maxLength} caractères`;
  }

  // Word count validation
  if (rules.minWords || rules.maxWords) {
    const wordCount = stringValue.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (rules.minWords && wordCount < rules.minWords) {
      return rules.message || `Ce champ doit contenir au moins ${rules.minWords} mots`;
    }
    
    if (rules.maxWords && wordCount > rules.maxWords) {
      return rules.message || `Ce champ doit contenir au maximum ${rules.maxWords} mots`;
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || 'Le format de ce champ est invalide';
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

export const validateForm = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const commonRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'Ce champ est obligatoire'
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Veuillez entrer une adresse email valide'
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: message || 'Veuillez entrer un numéro de téléphone valide'
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'Veuillez entrer une URL valide (http:// ou https://)'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Ce champ doit contenir au moins ${min} caractères`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Ce champ doit contenir au maximum ${max} caractères`
  }),

  minWords: (min: number, message?: string): ValidationRule => ({
    minWords: min,
    message: message || `Ce champ doit contenir au moins ${min} mots`
  }),

  maxWords: (max: number, message?: string): ValidationRule => ({
    maxWords: max,
    message: message || `Ce champ doit contenir au maximum ${max} mots`
  }),

  dateRange: (startDate: string, endDate: string, message?: string): ValidationRule => ({
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (date < start || date > end) {
        return message || `La date doit être entre ${start.toLocaleDateString('fr-FR')} et ${end.toLocaleDateString('fr-FR')}`;
      }
      return null;
    }
  }),

  futureDate: (message?: string): ValidationRule => ({
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (date < now) {
        return message || 'La date doit être dans le futur';
      }
      return null;
    }
  }),

  pastDate: (message?: string): ValidationRule => ({
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      if (date > now) {
        return message || 'La date doit être dans le passé';
      }
      return null;
    }
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      if (!value) return null;
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return message || 'Ce champ doit être un nombre positif';
      }
      return null;
    }
  }),

  integer: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      if (!value) return null;
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return message || 'Ce champ doit être un nombre entier';
      }
      return null;
    }
  }),

  mongoId: (message?: string): ValidationRule => ({
    pattern: /^[a-fA-F0-9]{24}$/,
    message: message || 'Format d\'ID invalide'
  }),

  auditName: (message?: string): ValidationRule => ({
    required: true,
    minLength: 8,
    maxLength: 200,
    minWords: 2,
    message: message || 'Le nom doit contenir entre 8 et 200 caractères et au moins 2 mots'
  }),

  auditPerimetre: (message?: string): ValidationRule => ({
    required: true,
    minLength: 8,
    maxLength: 500,
    minWords: 3,
    message: message || 'Le périmètre doit contenir entre 8 et 500 caractères et au moins 3 mots'
  }),

  auditObjectifs: (message?: string): ValidationRule => ({
    required: true,
    minLength: 8,
    maxLength: 1000,
    minWords: 4,
    message: message || 'Les objectifs doivent contenir entre 8 et 1000 caractères et au moins 4 mots'
  }),

  projectBudget: (message?: string): ValidationRule => ({
    required: true,
    custom: (value: any) => {
      if (!value) return 'Le budget est obligatoire';
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return message || 'Le budget doit être un nombre positif';
      }
      if (num > 10000000) {
        return 'Le budget ne peut pas dépasser 10,000,000';
      }
      return null;
    }
  }),

  riskLevel: (message?: string): ValidationRule => ({
    required: true,
    custom: (value: string) => {
      const validLevels = ['faible', 'moyen', 'élevé', 'critique'];
      if (!validLevels.includes(value)) {
        return message || 'Le niveau de risque doit être: faible, moyen, élevé ou critique';
      }
      return null;
    }
  }),

  status: (validStatuses: string[], message?: string): ValidationRule => ({
    required: true,
    custom: (value: string) => {
      if (!validStatuses.includes(value)) {
        return message || `Le statut doit être l'un des suivants: ${validStatuses.join(', ')}`;
      }
      return null;
    }
  })
};

// Predefined schemas for common forms
export const formSchemas = {
  audit: {
    nom: commonRules.auditName(),
    type: commonRules.status(['Organisationnel', 'Technique']),
    perimetre: commonRules.auditPerimetre(),
    objectifs: commonRules.auditObjectifs(),
    dateDebut: commonRules.required('La date de début est obligatoire'),
    dateFin: commonRules.required('La date de fin est obligatoire')
  },

  project: {
    nom: commonRules.required('Le nom du projet est obligatoire'),
    perimetre: commonRules.required('Le périmètre est obligatoire'),
    budget: commonRules.projectBudget(),
    priorite: commonRules.status(['faible', 'moyen', 'élevé', 'critique']),
    dateDebut: commonRules.required('La date de début est obligatoire'),
    dateFin: commonRules.required('La date de fin est obligatoire'),
    statut: commonRules.status(['Planifié', 'En cours', 'Terminé', 'Annulé'])
  },

  risk: {
    nom: commonRules.required('Le nom du risque est obligatoire'),
    description: commonRules.required('La description est obligatoire'),
    probabilite: commonRules.riskLevel('La probabilité doit être: faible, moyen, élevé ou critique'),
    impact: commonRules.riskLevel('L\'impact doit être: faible, moyen, élevé ou critique')
  },

  conception: {
    nomFichier: commonRules.required('Le nom du fichier est obligatoire'),
    typeFichier: commonRules.required('Le type de fichier est obligatoire'),
    projet: commonRules.mongoId('ID de projet invalide')
  },

  preuve: {
    nomFichier: commonRules.required('Le nom du fichier est obligatoire'),
    typeFichier: commonRules.required('Le type de fichier est obligatoire'),
    audit: commonRules.mongoId('ID d\'audit invalide')
  },

  recommandation: {
    contenu: commonRules.required('Le contenu de la recommandation est obligatoire'),
    priorite: commonRules.status(['faible', 'moyen', 'élevé']),
    complexite: commonRules.status(['simple', 'moyen', 'complexe']),
    statut: commonRules.status(['en attente', 'validée', 'à revoir']),
    constat: commonRules.mongoId('ID de constat invalide')
  },

  constat: {
    description: commonRules.required('La description du constat est obligatoire'),
    type: commonRules.status(['NC maj', 'NC min', 'PS', 'PP']),
    criticite: commonRules.required('La criticité est obligatoire'),
    impact: commonRules.required('L\'impact est obligatoire'),
    probabilite: commonRules.required('La probabilité est obligatoire'),
    audit: commonRules.mongoId('ID d\'audit invalide'),
    projet: commonRules.mongoId('ID de projet invalide')
  },

  planAction: {
    titre: commonRules.required('Le titre du plan d\'action est obligatoire'),
    description: commonRules.required('La description est obligatoire'),
    priorite: commonRules.status(['faible', 'moyen', 'élevé', 'critique'])
  }
};
