const { body } = require('express-validator');
const mongoose = require('mongoose');
const Utilisateur = require('../models/Utilisateur');

exports.createAuditValidator = [
  // Nom validation - string with minimum 8 characters, no empty strings, comprehensible
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isString()
    .trim()
    .isLength({ min: 8, max: 200 })
    .withMessage('Le nom doit être une chaîne de caractères entre 8 et 200 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      // Check for comprehensible string (at least 2 words or meaningful content)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 2) {
        throw new Error('Le nom doit contenir au moins 2 mots pour être compréhensible');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 3) {
        throw new Error('Le nom doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),
  
  // Type validation - must be one of the allowed values
  body('type')
    .notEmpty()
    .withMessage('Le type est requis')
    .isIn(['Organisationnel', 'Technique'])
    .withMessage('Le type doit être "Organisationnel" ou "Technique"'),
  
  // Perimetre validation - string with minimum 8 characters, no empty strings, comprehensible
  body('perimetre')
    .notEmpty()
    .withMessage('Le périmètre est requis')
    .isString()
    .trim()
    .isLength({ min: 8, max: 500 })
    .withMessage('Le périmètre doit être une chaîne de caractères entre 8 et 500 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le périmètre ne peut pas être vide');
      }
      // Check for comprehensible string (at least 3 words for detailed description)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 3) {
        throw new Error('Le périmètre doit contenir au moins 3 mots pour être compréhensible');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 4) {
        throw new Error('Le périmètre doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),
  
  // Objectifs validation - string with minimum 8 characters, no empty strings, comprehensible
  body('objectifs')
    .notEmpty()
    .withMessage('Les objectifs sont requis')
    .isString()
    .trim()
    .isLength({ min: 8, max: 1000 })
    .withMessage('Les objectifs doivent être une chaîne de caractères entre 8 et 1000 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Les objectifs ne peuvent pas être vides');
      }
      // Check for comprehensible string (at least 4 words for detailed objectives)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 4) {
        throw new Error('Les objectifs doivent contenir au moins 4 mots pour être compréhensibles');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 5) {
        throw new Error('Les objectifs doivent contenir des caractères variés pour être compréhensibles');
      }
      return true;
    }),
  
  // Date validation - must be valid ISO dates and logical
  body('dateDebut')
    .notEmpty()
    .withMessage('La date de début est requise')
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO 8601')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      
      // Check if date is not too far in the past (max 10 years ago for historical records)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 10);
      if (date < minDate) {
        throw new Error('La date de début ne peut pas être plus de 10 ans dans le passé');
      }
      
      // Check if date is not too far in the future (max 2 years)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      if (date > maxDate) {
        throw new Error('La date de début ne peut pas être plus de 2 ans dans le futur');
      }
      
      return true;
    }),
  
  body('dateFin')
    .notEmpty()
    .withMessage('La date de fin est requise')
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO 8601')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      
      // Check if date is not too far in the past (max 10 years ago for historical records)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 10);
      if (date < minDate) {
        throw new Error('La date de fin ne peut pas être plus de 10 ans dans le passé');
      }
      
      // Check if date is not too far in the future (max 3 years)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 3);
      if (date > maxDate) {
        throw new Error('La date de fin ne peut pas être plus de 3 ans dans le futur');
      }
      
      return true;
    }),
  
  // Date range validation - dateDebut must be before dateFin with logical constraints
  body('dateFin')
    .custom((value, { req }) => {
      if (req.body.dateDebut && value) {
        const dateDebut = new Date(req.body.dateDebut);
        const dateFin = new Date(value);
        
        if (dateDebut >= dateFin) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
        
        // Ensure minimum audit duration (at least 1 day)
        const diffTime = dateFin.getTime() - dateDebut.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
          throw new Error('L\'audit doit durer au moins 1 jour');
        }
        
        // Ensure maximum audit duration (max 1 year)
        if (diffDays > 365) {
          throw new Error('L\'audit ne peut pas durer plus d\'un an');
        }
      }
      return true;
    }),
  
  // Statut validation - REMOVED from create validator
  // Status can only be updated through RSSI-only status update routes
  
  // Points forts validation - array of strings with minimum 5 characters each, no empty strings
  body('pointsForts')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les points forts doivent être un tableau (maximum 50 éléments)'),
  
  body('pointsForts.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Chaque point fort doit être une chaîne de caractères entre 5 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Un point fort ne peut pas être vide');
      }
      return true;
    }),
  
  // CreerPar validation - must be a single valid MongoDB ID or mock ID, and user must exist if it's a real ID
  body('creerPar')
    .notEmpty()
    .withMessage('creerPar est requis')
    .custom(async (value) => {
      if (!value) {
        throw new Error('creerPar est requis');
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('creerPar doit être un seul ID utilisateur, pas un tableau');
      }
      
      // Check if it's a mock ID (starts with 'mock-' or 'user_')
      const isMockId = value.startsWith('mock-') || value.startsWith('user_');
      
      if (isMockId) {
        // Mock IDs are allowed, no need to check database
        return true;
      }
      
      // For real IDs, verify that the user exists in the database
      const utilisateur = await Utilisateur.findById(value);
      if (!utilisateur) {
        throw new Error('L\'utilisateur spécifié dans creerPar n\'existe pas');
      }
      
      // Vérifier que l'utilisateur a un rôle valide (RSSI, SSI, ADMIN)
      if (!['RSSI', 'SSI', 'ADMIN'].includes(utilisateur.role)) {
        throw new Error('L\'utilisateur doit avoir un rôle RSSI, SSI ou ADMIN pour créer un audit');
      }
      
      // Vérifier que l'utilisateur est approuvé (sauf pour ADMIN)
      if (utilisateur.role !== 'ADMIN' && utilisateur.status !== 'approved') {
        throw new Error('L\'utilisateur doit être approuvé pour créer un audit');
      }
      
      return true;
    }),
  
  // Preuves validation - array of MongoDB IDs
  body('preuves')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les preuves doivent être un tableau d\'IDs (maximum 100 éléments)'),
  
  body('preuves.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque preuve doit être un ID MongoDB valide'),
  
  // Constats validation - array of MongoDB IDs
  body('constats')
    .optional()
    .isArray({ min: 0, max: 200 })
    .withMessage('Les constats doivent être un tableau d\'IDs (maximum 200 éléments)'),
  
  body('constats.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque constat doit être un ID MongoDB valide'),
  
  // Normes validation - array of MongoDB IDs or mock IDs
  body('normes')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les normes doivent être un tableau d\'IDs (maximum 50 éléments)'),
  
  body('normes.*')
    .optional()
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Check if it's a mock ID (starts with 'mock-' or 'norme_')
      const isMockId = value.startsWith('mock-') || value.startsWith('norme_');
      
      if (isMockId) {
        // Mock IDs are allowed, no need to check database
        return true;
      }
      
      // For real IDs, verify that the norme exists in the database
      const Norme = require('../models/Normes');
      const norme = await Norme.findById(value);
      if (!norme) {
        throw new Error(`La norme avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
  
  // PlanAction validation - must be valid MongoDB ID
  body('planAction')
    .optional()
    .isMongoId()
    .withMessage('planAction doit être un ID MongoDB valide'),
];

exports.updateAuditValidator = [
  // Nom validation - optional but must meet requirements if provided
  body('nom')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 200 })
    .withMessage('Le nom doit être une chaîne de caractères entre 8 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words or meaningful content)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le nom doit contenir au moins 2 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le nom doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),
  
  // Type validation - optional but must be valid if provided
  body('type')
    .optional()
    .isIn(['Organisationnel', 'Technique'])
    .withMessage('Le type doit être "Organisationnel" ou "Technique"'),
  
  // Perimetre validation - optional but must meet requirements if provided
  body('perimetre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 500 })
    .withMessage('Le périmètre doit être une chaîne de caractères entre 8 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le périmètre ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 3 words for detailed description)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('Le périmètre doit contenir au moins 3 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 4) {
          throw new Error('Le périmètre doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),
  
  // Objectifs validation - optional but must meet requirements if provided
  body('objectifs')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 1000 })
    .withMessage('Les objectifs doivent être une chaîne de caractères entre 8 et 1000 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Les objectifs ne peuvent pas être vides');
      }
      if (value) {
        // Check for comprehensible string (at least 4 words for detailed objectives)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 4) {
          throw new Error('Les objectifs doivent contenir au moins 4 mots pour être compréhensibles');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 5) {
          throw new Error('Les objectifs doivent contenir des caractères variés pour être compréhensibles');
        }
      }
      return true;
    }),
  
  // Date validation - optional but must be valid if provided
  body('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO 8601')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        
        // Check if date is not too far in the past (max 10 years ago for historical records)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 10);
        if (date < minDate) {
          throw new Error('La date de début ne peut pas être plus de 10 ans dans le passé');
        }
        
        // Check if date is not too far in the future (max 2 years)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        if (date > maxDate) {
          throw new Error('La date de début ne peut pas être plus de 2 ans dans le futur');
        }
      }
      return true;
    }),
  
  body('dateFin')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO 8601')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        
        // Check if date is not too far in the past (max 10 years ago for historical records)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 10);
        if (date < minDate) {
          throw new Error('La date de fin ne peut pas être plus de 10 ans dans le passé');
        }
        
        // Check if date is not too far in the future (max 3 years)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 3);
        if (date > maxDate) {
          throw new Error('La date de fin ne peut pas être plus de 3 ans dans le futur');
        }
      }
      return true;
    }),
  
  // Date range validation for updates - only validate if both dates are provided
  body('dateFin')
    .optional()
    .custom((value, { req }) => {
      if (req.body.dateDebut && value) {
        const dateDebut = new Date(req.body.dateDebut);
        const dateFin = new Date(value);
        
        if (dateDebut >= dateFin) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
        
        // Ensure minimum audit duration (at least 1 day)
        const diffTime = dateFin.getTime() - dateDebut.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
          throw new Error('L\'audit doit durer au moins 1 jour');
        }
        
        // Ensure maximum audit duration (max 1 year)
        if (diffDays > 365) {
          throw new Error('L\'audit ne peut pas durer plus d\'un an');
        }
      }
      return true;
    }),
  
  // Statut validation - REMOVED from general update validator
  // Status can only be updated through RSSI-only status update routes
  
  // Points forts validation - optional array of strings
  body('pointsForts')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les points forts doivent être un tableau (maximum 50 éléments)'),
  
  body('pointsForts.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Chaque point fort doit être une chaîne de caractères entre 5 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Un point fort ne peut pas être vide');
      }
      return true;
    }),
  
  // CreerPar validation - optional but must be valid if provided
  body('creerPar')
    .optional()
    .isMongoId()
    .withMessage('creerPar doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('creerPar doit être un seul ID utilisateur, pas un tableau');
      }
      
      // Vérifier que l'utilisateur existe dans la base de données
      const utilisateur = await Utilisateur.findById(value);
      if (!utilisateur) {
        throw new Error('L\'utilisateur spécifié dans creerPar n\'existe pas');
      }
      
      // Vérifier que l'utilisateur a un rôle valide (RSSI, SSI, ADMIN)
      if (!['RSSI', 'SSI', 'ADMIN'].includes(utilisateur.role)) {
        throw new Error('L\'utilisateur doit avoir un rôle RSSI, SSI ou ADMIN pour créer un audit');
      }
      
      // Vérifier que l'utilisateur est approuvé (sauf pour ADMIN)
      if (utilisateur.role !== 'ADMIN' && utilisateur.status !== 'approved') {
        throw new Error('L\'utilisateur doit être approuvé pour créer un audit');
      }
      
      return true;
    }),
  
  // Preuves validation - optional array of MongoDB IDs
  body('preuves')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les preuves doivent être un tableau d\'IDs (maximum 100 éléments)'),
  
  body('preuves.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque preuve doit être un ID MongoDB valide'),
  
  // Constats validation - optional array of MongoDB IDs
  body('constats')
    .optional()
    .isArray({ min: 0, max: 200 })
    .withMessage('Les constats doivent être un tableau d\'IDs (maximum 200 éléments)'),
  
  body('constats.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque constat doit être un ID MongoDB valide'),
  
  // Normes validation - optional array of MongoDB IDs
  body('normes')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les normes doivent être un tableau d\'IDs (maximum 50 éléments)'),
  
  body('normes.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque norme doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la norme existe dans la base de données
      const Norme = require('../models/Normes');
      const norme = await Norme.findById(value);
      if (!norme) {
        throw new Error(`La norme avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
  
  // PlanAction validation - optional but must be valid MongoDB ID if provided
  body('planAction')
    .optional()
    .isMongoId()
    .withMessage('planAction doit être un ID MongoDB valide'),

  // === NEW PAS-RELATED FIELD VALIDATORS ===
  
  // Suivi Sécurité - Réunions
  body('suiviSecurite.reunions.frequence')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('La fréquence des réunions doit être une chaîne de caractères entre 5 et 100 caractères'),

  body('suiviSecurite.reunions.prochaine')
    .optional()
    .isISO8601()
    .withMessage('La prochaine réunion doit être une date valide au format ISO 8601'),

  // Suivi Sécurité - Audit Interne
  body('suiviSecurite.auditInterne.frequence')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('La fréquence des audits internes doit être une chaîne de caractères entre 5 et 100 caractères'),

  body('suiviSecurite.auditInterne.prochain')
    .optional()
    .isISO8601()
    .withMessage('Le prochain audit doit être une date valide au format ISO 8601'),

  // Annexes - Fiches de Sensibilisation
  body('annexes.fichesSensibilisation')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les fiches de sensibilisation doivent être un tableau (maximum 50 éléments)'),

  body('annexes.fichesSensibilisation.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Chaque fiche doit être une chaîne de caractères entre 3 et 200 caractères'),

  // Annexes - Registre des Incidents
  body('annexes.registreIncidents')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le registre des incidents doit être une chaîne de caractères entre 5 et 200 caractères'),

  // Annexes - Autres Documents
  body('annexes.autresDocuments')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les autres documents doivent être un tableau (maximum 50 éléments)'),

  body('annexes.autresDocuments.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Chaque document doit être une chaîne de caractères entre 3 et 200 caractères'),
];

// Validator specifically for status updates (RSSI only)
exports.updateAuditStatutValidator = [
  body('statut')
    .notEmpty()
    .withMessage('Le statut est requis')
    .custom((value) => {
      const validStatuses = ['Planifié', 'En cours', 'Terminé'];
      const normalizedValue = value.trim();
      
      if (!validStatuses.includes(normalizedValue)) {
        throw new Error(`Le statut doit être l'un des suivants: ${validStatuses.join(', ')}`);
      }
      
      return true;
    }),
]; 