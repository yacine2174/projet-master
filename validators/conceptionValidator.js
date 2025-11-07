const { body } = require('express-validator');

exports.createConceptionValidator = [
  // NomFichier validation - string with minimum 3 characters, no empty strings, comprehensible
  body('nomFichier')
    .notEmpty()
    .withMessage('Le nom du fichier est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom du fichier doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le nom du fichier ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('Le nom du fichier doit contenir au moins 1 mot pour être compréhensible');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 2) {
        throw new Error('Le nom du fichier doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),

  // TypeFichier validation - string with minimum 2 characters, no empty strings
  body('typeFichier')
    .notEmpty()
    .withMessage('Le type du fichier est requis')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type du fichier doit être une chaîne de caractères entre 2 et 50 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le type du fichier ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('Le type du fichier doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // Projet validation - optional but must be valid if provided
  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le projet existe dans la base de données
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      
      return true;
    }),

  // Validee validation - optional boolean
  body('validee')
    .optional()
    .isBoolean()
    .withMessage('validee doit être un booléen'),

  // RssiCommentaire validation - optional string with minimum 5 characters if provided
  body('rssiCommentaire')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Le commentaire RSSI doit être une chaîne de caractères entre 5 et 1000 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le commentaire RSSI ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words for meaningful comment)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le commentaire RSSI doit contenir au moins 2 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le commentaire RSSI doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // Statut validation - optional enum
  body('statut')
    .optional()
    .isIn(['en attente', 'validée', 'à revoir'])
    .withMessage('Le statut doit être "en attente", "validée" ou "à revoir"')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      return true;
    }),
];

// Original validator (for backward compatibility)
exports.updateConceptionValidator = [
  // NomFichier validation - optional but must meet requirements if provided
  body('nomFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom du fichier doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le nom du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 2) {
          throw new Error('Le nom du fichier doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // TypeFichier validation - optional but must meet requirements if provided
  body('typeFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type du fichier doit être une chaîne de caractères entre 2 et 50 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le type du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le type du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Projet validation - optional but must be valid if provided
  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le projet existe dans la base de données
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      
      return true;
    }),

  // Validee validation - optional boolean
  body('validee')
    .optional()
    .isBoolean()
    .withMessage('validee doit être un booléen'),

  // RssiCommentaire validation - optional string with minimum 5 characters if provided
  body('rssiCommentaire')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Le commentaire RSSI doit être une chaîne de caractères entre 5 et 1000 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le commentaire RSSI ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words for meaningful comment)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le commentaire RSSI doit contenir au moins 2 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le commentaire RSSI doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // Statut validation - optional enum
  body('statut')
    .optional()
    .isIn(['en attente', 'validée', 'à revoir'])
    .withMessage('Le statut doit être "en attente", "validée" ou "à revoir"')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      return true;
    }),
];

// Validator for RSSI users (includes all fields)
exports.updateConceptionRSSIValidator = [
  // NomFichier validation - optional but must meet requirements if provided
  body('nomFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom du fichier doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le nom du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 2) {
          throw new Error('Le nom du fichier doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // TypeFichier validation - optional but must meet requirements if provided
  body('typeFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type du fichier doit être une chaîne de caractères entre 2 et 50 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le type du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le type du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Projet validation - optional but must be valid if provided
  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le projet existe dans la base de données
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      
      return true;
    }),

  // Validee validation - optional boolean
  body('validee')
    .optional()
    .isBoolean()
    .withMessage('validee doit être un booléen'),

  // RssiCommentaire validation - optional string with minimum 5 characters if provided
  body('rssiCommentaire')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Le commentaire RSSI doit être une chaîne de caractères entre 5 et 1000 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le commentaire RSSI ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words for meaningful comment)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le commentaire RSSI doit contenir au moins 2 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le commentaire RSSI doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // Statut validation - optional enum
  body('statut')
    .optional()
    .isIn(['en attente', 'validée', 'à revoir'])
    .withMessage('Le statut doit être "en attente", "validée" ou "à revoir"')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      return true;
    }),
];

// Validator for SSI users (excludes status and RSSI comment fields)
exports.updateConceptionSSIValidator = [
  // NomFichier validation - optional but must meet requirements if provided
  body('nomFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom du fichier doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le nom du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 2) {
          throw new Error('Le nom du fichier doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // TypeFichier validation - optional but must meet requirements if provided
  body('typeFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type du fichier doit être une chaîne de caractères entre 2 et 50 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le type du fichier ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le type du fichier doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Projet validation - optional but must be valid if provided
  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le projet existe dans la base de données
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      
      return true;
    }),

  // SSI users cannot modify validation status, RSSI comments, or conception status
  body('validee')
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Les utilisateurs SSI ne peuvent pas modifier le statut de validation');
      }
      return true;
    }),

  body('rssiCommentaire')
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Les utilisateurs SSI ne peuvent pas ajouter de commentaires RSSI');
      }
      return true;
    }),

  body('statut')
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined) {
        throw new Error('Les utilisateurs SSI ne peuvent pas modifier le statut des conceptions');
      }
      return true;
    }),
]; 