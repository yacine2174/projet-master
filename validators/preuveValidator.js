const { body } = require('express-validator');
const Audit = require('../models/Audit');

exports.createPreuveValidator = [
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

  // UrlFichier validation - string with minimum 10 characters, no empty strings, valid URL
  body('urlFichier')
    .notEmpty()
    .withMessage('L\'URL du fichier est requise')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('L\'URL du fichier doit être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('L\'URL du fichier ne peut pas être vide');
      }
      
      // Custom URL validation that accepts localhost URLs
      const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      if (!urlPattern.test(value)) {
        throw new Error('L\'URL du fichier doit être une URL valide (ex: http://localhost:3000/file.pdf ou https://example.com/file.pdf)');
      }
      
      return true;
    }),

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
      
      // Vérifier que l'audit existe dans la base de données
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error('L\'audit spécifié n\'existe pas');
      }
      
      return true;
    }),
];

exports.updatePreuveValidator = [
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

  // UrlFichier validation - optional but must meet requirements if provided
  body('urlFichier')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('L\'URL du fichier doit être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('L\'URL du fichier ne peut pas être vide');
      }
      if (value) {
        // Custom URL validation that accepts localhost URLs
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlPattern.test(value)) {
          throw new Error('L\'URL du fichier doit être une URL valide (ex: http://localhost:3000/file.pdf ou https://example.com/file.pdf)');
        }
      }
      return true;
    }),

  // Audit validation - optional but must be valid if provided
  body('audit')
    .optional()
    .isMongoId()
    .withMessage('audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que l'audit existe dans la base de données
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error('L\'audit spécifié n\'existe pas');
      }
      
      return true;
    }),
]; 