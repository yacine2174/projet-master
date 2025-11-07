const { body } = require('express-validator');

exports.createSWOTValidator = [
  // Each field must be an array of non-empty strings
  body('forces')
    .isArray({ min: 1 }).withMessage('Les forces doivent être une liste')
    .custom((arr) => arr.every((s) => typeof s === 'string' && s.trim().length >= 3))
    .withMessage('Chaque force doit être une chaîne non vide (≥ 3 caractères)'),

  body('faiblesses')
    .isArray({ min: 1 }).withMessage('Les faiblesses doivent être une liste')
    .custom((arr) => arr.every((s) => typeof s === 'string' && s.trim().length >= 3))
    .withMessage('Chaque faiblesse doit être une chaîne non vide (≥ 3 caractères)'),

  body('opportunites')
    .isArray({ min: 1 }).withMessage('Les opportunités doivent être une liste')
    .custom((arr) => arr.every((s) => typeof s === 'string' && s.trim().length >= 3))
    .withMessage('Chaque opportunité doit être une chaîne non vide (≥ 3 caractères)'),

  body('menaces')
    .isArray({ min: 1 }).withMessage('Les menaces doivent être une liste')
    .custom((arr) => arr.every((s) => typeof s === 'string' && s.trim().length >= 3))
    .withMessage('Chaque menace doit être une chaîne non vide (≥ 3 caractères)'),

  // Projet validation - must be a valid MongoDB ID and exist
  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) return true;
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) throw new Error('Le projet spécifié n\'existe pas');
      return true;
    }),
];

exports.updateSWOTValidator = [
  body('forces')
    .optional()
    .isArray({ min: 1 }).withMessage('Les forces doivent être une liste')
    .custom((arr) => Array.isArray(arr) ? arr.every((s) => typeof s === 'string' && s.trim().length >= 3) : true),

  body('faiblesses')
    .optional()
    .isArray({ min: 1 }).withMessage('Les faiblesses doivent être une liste')
    .custom((arr) => Array.isArray(arr) ? arr.every((s) => typeof s === 'string' && s.trim().length >= 3) : true),

  body('opportunites')
    .optional()
    .isArray({ min: 1 }).withMessage('Les opportunités doivent être une liste')
    .custom((arr) => Array.isArray(arr) ? arr.every((s) => typeof s === 'string' && s.trim().length >= 3) : true),

  body('menaces')
    .optional()
    .isArray({ min: 1 }).withMessage('Les menaces doivent être une liste')
    .custom((arr) => Array.isArray(arr) ? arr.every((s) => typeof s === 'string' && s.trim().length >= 3) : true),

  body('projet')
    .optional()
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) return true;
      const Projet = require('../models/Projet');
      const projet = await Projet.findById(value);
      if (!projet) throw new Error('Le projet spécifié n\'existe pas');
      return true;
    }),
];