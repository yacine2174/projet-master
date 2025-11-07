const { body } = require('express-validator');
const mongoose = require('mongoose');
const Audit = require('../models/Audit');
const Projet = require('../models/Projet');

exports.createConstatValidator = [
  // Description validation - string with minimum 10 characters and maximum 1000
  body('description')
    .notEmpty()
    .withMessage('La description est requise')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit être une chaîne de caractères entre 10 et 1000 caractères'),
  
  // Type validation - must be one of the allowed values
  body('type')
    .notEmpty()
    .withMessage('Le type est requis')
    .isIn(['NC maj', 'NC min', 'PS', 'PP'])
    .withMessage('Le type doit être "NC maj", "NC min", "PS" ou "PP"'),
  
  // Criticite validation - string with minimum 3 characters
  body('criticite')
    .notEmpty()
    .withMessage('La criticité est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La criticité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Impact validation - string with minimum 3 characters
  body('impact')
    .notEmpty()
    .withMessage('L\'impact est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('L\'impact doit être une chaîne de caractères entre 3 et 200 caractères'),
  
  // Probabilite validation - string with minimum 3 characters
  body('probabilite')
    .notEmpty()
    .withMessage('La probabilité est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La probabilité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Audit validation - must be a valid MongoDB ID and audit must exist
  body('audit')
    .notEmpty()
    .withMessage('audit est requis')
    .isMongoId()
    .withMessage('audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        throw new Error('audit est requis');
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('audit doit être un seul ID, pas un tableau');
      }
      
      // Vérifier que l'audit existe dans la base de données
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error('L\'audit spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // Projet validation - optional (can be linked later)
  body('projet')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('projet doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) return true;
      if (Array.isArray(value)) {
        throw new Error('projet doit être un seul ID, pas un tableau');
      }
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      return true;
    }),
  
  // Recommandations validation - optional array of MongoDB IDs
  body('recommandations')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les recommandations doivent être un tableau d\'IDs (maximum 50 éléments)'),
  
  body('recommandations.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque recommandation doit être un ID MongoDB valide'),
];

exports.updateConstatValidator = [
  // Description validation - optional but must meet requirements if provided
  body('description')
    .optional()
    .notEmpty()
    .withMessage('La description ne peut pas être vide')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit être une chaîne de caractères entre 10 et 1000 caractères'),
  
  // Type validation - optional but must be valid if provided
  body('type')
    .optional()
    .notEmpty()
    .withMessage('Le type ne peut pas être vide')
    .isIn(['NC maj', 'NC min', 'PS', 'PP'])
    .withMessage('Le type doit être "NC maj", "NC min", "PS" ou "PP"'),
  
  // Criticite validation - optional but must meet requirements if provided
  body('criticite')
    .optional()
    .notEmpty()
    .withMessage('La criticité ne peut pas être vide')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La criticité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Impact validation - optional but must meet requirements if provided
  body('impact')
    .optional()
    .notEmpty()
    .withMessage('L\'impact ne peut pas être vide')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('L\'impact doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Probabilite validation - optional but must meet requirements if provided
  body('probabilite')
    .optional()
    .notEmpty()
    .withMessage('La probabilité ne peut pas être vide')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('La probabilité doit être une chaîne de caractères entre 3 et 50 caractères'),
  
  // Audit validation - optional but must be valid if provided
  body('audit')
    .optional()
    .isMongoId()
    .withMessage('audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('audit doit être un seul ID, pas un tableau');
      }
      
      // Vérifier que l'audit existe dans la base de données
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error('L\'audit spécifié n\'existe pas');
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
      
      // Vérifier que c'est un seul ID (pas un array)
      if (Array.isArray(value)) {
        throw new Error('projet doit être un seul ID, pas un tableau');
      }
      
      // Vérifier que le projet existe dans la base de données
      const projet = await Projet.findById(value);
      if (!projet) {
        throw new Error('Le projet spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // Recommandations validation - optional array of MongoDB IDs
  body('recommandations')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les recommandations doivent être un tableau d\'IDs (maximum 50 éléments)'),
  
  body('recommandations.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque recommandation doit être un ID MongoDB valide'),
]; 