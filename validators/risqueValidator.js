const { body } = require('express-validator');

exports.createRisqueValidator = [
  // Description validation - string with minimum 10 characters, no empty strings, comprehensible
  body('description')
    .notEmpty()
    .withMessage('La description est requise')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit être une chaîne de caractères entre 10 et 1000 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La description ne peut pas être vide');
      }
      // Check for comprehensible string (at least 3 words for detailed description)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 3) {
        throw new Error('La description doit contenir au moins 3 mots pour être compréhensible');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 4) {
        throw new Error('La description doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),

  // Type validation - string with minimum 3 characters, no empty strings
  body('type')
    .notEmpty()
    .withMessage('Le type est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le type doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le type ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('Le type doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // Impact validation - string with minimum 3 characters, no empty strings
  body('impact')
    .notEmpty()
    .withMessage('L\'impact est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('L\'impact doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('L\'impact ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('L\'impact doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // Probabilite validation - string with minimum 3 characters, no empty strings
  body('probabilite')
    .notEmpty()
    .withMessage('La probabilité est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La probabilité doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La probabilité ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('La probabilité doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // Decision validation - must be one of the allowed values
  body('decision')
    .notEmpty()
    .withMessage('La décision est requise')
    .isIn(['Accepter', 'Réduire', 'Transférer', 'Empêcher'])
    .withMessage('La décision doit être Accepter, Réduire, Transférer ou Empêcher')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La décision ne peut pas être vide');
      }
      return true;
    }),

  // Projet validation - must be a valid MongoDB ID and projet must exist
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
];

exports.updateRisqueValidator = [
  // Description validation - optional but must meet requirements if provided
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit être une chaîne de caractères entre 10 et 1000 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La description ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 3 words for detailed description)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('La description doit contenir au moins 3 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 4) {
          throw new Error('La description doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // Type validation - optional but must meet requirements if provided
  body('type')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le type doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le type ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le type doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Impact validation - optional but must meet requirements if provided
  body('impact')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('L\'impact doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('L\'impact ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('L\'impact doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Probabilite validation - optional but must meet requirements if provided
  body('probabilite')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La probabilité doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La probabilité ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('La probabilité doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Decision validation - optional but must be valid if provided
  body('decision')
    .optional()
    .isIn(['Accepter', 'Réduire', 'Transférer', 'Empêcher'])
    .withMessage('La décision doit être Accepter, Réduire, Transférer ou Empêcher')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La décision ne peut pas être vide');
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
]; 