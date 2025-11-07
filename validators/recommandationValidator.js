const { body } = require('express-validator');
const mongoose = require('mongoose');
const Constat = require('../models/Constat');
const PlanAction = require('../models/PlanAction');

exports.createRecommandationValidator = [
  // Contenu validation - string with minimum 10 characters and maximum 1000
  body('contenu')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le contenu doit être une chaîne de caractères entre 10 et 1000 caractères'),
  
  // Priorite validation - string with minimum 3 characters
  body('priorite')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Complexite validation - string with minimum 3 characters
  body('complexite')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La complexité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Constat validation - must be a valid MongoDB ID and constat must exist
  body('constat')
    .notEmpty()
    .isMongoId()
    .withMessage('constat doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        throw new Error('constat est requis');
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('constat doit être un seul ID, pas un tableau');
      }
      
      // Vérifier que le constat existe dans la base de données
      const constat = await Constat.findById(value);
      if (!constat) {
        throw new Error('Le constat spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // PlansAction validation - optional array of MongoDB IDs
  body('plansAction')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Les plans d\'action doivent être un tableau d\'IDs (maximum 20 éléments)'),
  
  body('plansAction.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque plan d\'action doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true;
      }
      
      // Vérifier que le plan d'action existe dans la base de données
      const planAction = await PlanAction.findById(value);
      if (!planAction) {
        throw new Error('Le plan d\'action spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // Statut validation - optional enum
  body('statut')
    .optional()
    .isIn(['en attente', 'validée', 'à revoir'])
    .withMessage('Le statut doit être "en attente", "validée" ou "à revoir"'),
];

exports.updateRecommandationValidator = [
  // Contenu validation - optional but must meet requirements if provided
  body('contenu')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le contenu doit être une chaîne de caractères entre 10 et 1000 caractères'),
  
  // Priorite validation - optional but must meet requirements if provided
  body('priorite')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Complexite validation - optional but must meet requirements if provided
  body('complexite')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La complexité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Constat validation - optional but must be valid if provided
  body('constat')
    .optional()
    .isMongoId()
    .withMessage('constat doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('constat doit être un seul ID, pas un tableau');
      }
      
      // Vérifier que le constat existe dans la base de données
      const constat = await Constat.findById(value);
      if (!constat) {
        throw new Error('Le constat spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // PlansAction validation - optional array of MongoDB IDs
  body('plansAction')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Les plans d\'action doivent être un tableau d\'IDs (maximum 20 éléments)'),
  
  body('plansAction.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque plan d\'action doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true;
      }
      
      // Vérifier que le plan d'action existe dans la base de données
      const planAction = await PlanAction.findById(value);
      if (!planAction) {
        throw new Error('Le plan d\'action spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // Statut validation - optional enum
  body('statut')
    .optional()
    .isIn(['en attente', 'validée', 'à revoir'])
    .withMessage('Le statut doit être "en attente", "validée" ou "à revoir"'),
];

// Validator specifically for status updates (RSSI only)
exports.updateRecommandationStatutValidator = [
  body('statut')
    .notEmpty()
    .withMessage('Le statut est requis')
    .custom((value) => {
      const validStatuses = ['en attente', 'validée', 'à revoir'];
      const normalizedValue = value.trim();
      
      if (!validStatuses.includes(normalizedValue)) {
        throw new Error(`Le statut doit être l'un des suivants: ${validStatuses.join(', ')}`);
      }
      
      return true;
    }),
]; 