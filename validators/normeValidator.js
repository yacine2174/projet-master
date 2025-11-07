const { body } = require('express-validator');

exports.createNormeValidator = [
  // Nom validation - string with minimum 3 characters, no empty strings, comprehensible
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      // Check for comprehensible string (at least 2 words)
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

  // Categorie validation - must be one of the allowed values
  body('categorie')
    .notEmpty()
    .withMessage('La catégorie est requise')
    .isIn(['ISO', 'NIST', 'OWASP', 'CIS'])
    .withMessage('La catégorie doit être ISO, NIST, OWASP ou CIS')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La catégorie ne peut pas être vide');
      }
      return true;
    }),

  // Version validation - string with minimum 1 character, no empty strings
  body('version')
    .notEmpty()
    .withMessage('La version est requise')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La version doit être une chaîne de caractères entre 1 et 50 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('La version ne peut pas être vide');
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

  // Audits validation - optional array of MongoDB IDs
  body('audits')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les audits doivent être un tableau d\'IDs (maximum 100 éléments)'),

  body('audits.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que l'audit existe dans la base de données
      const Audit = require('../models/Audit');
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error(`L'audit avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
];

exports.updateNormeValidator = [
  // Nom validation - optional but must meet requirements if provided
  body('nom')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom doit être une chaîne de caractères entre 3 et 200 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words)
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

  // Categorie validation - optional but must be valid if provided
  body('categorie')
    .optional()
    .isIn(['ISO', 'NIST', 'OWASP', 'CIS'])
    .withMessage('La catégorie doit être ISO, NIST, OWASP ou CIS')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La catégorie ne peut pas être vide');
      }
      return true;
    }),

  // Version validation - optional but must meet requirements if provided
  body('version')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La version doit être une chaîne de caractères entre 1 et 50 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('La version ne peut pas être vide');
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

  // Audits validation - optional array of MongoDB IDs
  body('audits')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Les audits doivent être un tableau d\'IDs (maximum 100 éléments)'),

  body('audits.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que l'audit existe dans la base de données
      const Audit = require('../models/Audit');
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error(`L'audit avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),
]; 