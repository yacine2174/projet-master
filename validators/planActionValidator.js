const { body } = require('express-validator');

exports.createPlanActionValidator = [
  // Titre validation - string with minimum 3 characters, no empty strings, comprehensible
  body('titre')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le titre ne peut pas être vide');
      }
      // Check for comprehensible string (at least 2 words)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 2) {
        throw new Error('Le titre doit contenir au moins 2 mots pour être compréhensible');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 3) {
        throw new Error('Le titre doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),

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

  // Priorite validation - string with minimum 3 characters, no empty strings
  body('priorite')
    .notEmpty()
    .withMessage('La priorité est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 50 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La priorité ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('La priorité doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // Recommandations validation - optional array of MongoDB IDs
  body('recommandations')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les recommandations doivent être un tableau d\'IDs (maximum 100 éléments)'),

  body('recommandations.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque recommandation doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la recommandation existe dans la base de données
      const Recommandation = require('../models/Recommandation');
      const recommandation = await Recommandation.findById(value);
      if (!recommandation) {
        throw new Error(`La recommandation avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
];

exports.updatePlanActionValidator = [
  // Titre validation - optional but must meet requirements if provided
  body('titre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le titre ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le titre doit contenir au moins 2 mots pour être compréhensible');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le titre doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

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

  // Priorite validation - optional but must meet requirements if provided
  body('priorite')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 50 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La priorité ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('La priorité doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // Recommandations validation - optional array of MongoDB IDs
  body('recommandations')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les recommandations doivent être un tableau d\'IDs (maximum 100 éléments)'),

  body('recommandations.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque recommandation doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la recommandation existe dans la base de données
      const Recommandation = require('../models/Recommandation');
      const recommandation = await Recommandation.findById(value);
      if (!recommandation) {
        throw new Error(`La recommandation avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
]; 