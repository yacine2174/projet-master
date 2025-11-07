const { body } = require('express-validator');
const { validateEmail } = require('../utils/emailValidator');

exports.createUserValidator = [
  // Nom validation - string with minimum 2 characters, no empty strings, comprehensible
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit être une chaîne de caractères entre 2 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      // Check for comprehensible string (at least 2 words for full name)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 2) {
        throw new Error('Le nom doit contenir au moins 2 mots (prénom et nom)');
      }
      // Check for meaningful content (not just repeated characters)
      const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
      if (uniqueChars.size < 3) {
        throw new Error('Le nom doit contenir des caractères variés pour être compréhensible');
      }
      return true;
    }),

  // Email validation - comprehensive validation
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .custom((value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    })
    .normalizeEmail(),

  // Mot de passe validation - minimum 8 characters with complexity
  body('motDePasse')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le mot de passe ne peut pas être vide');
      }
      // Check for password complexity (at least one letter and one number)
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      if (!hasLetter || !hasNumber) {
        throw new Error('Le mot de passe doit contenir au moins une lettre et un chiffre');
      }
      return true;
    }),

  // Role validation - must be one of the allowed values
  body('role')
    .notEmpty()
    .withMessage('Le rôle est requis')
    .isIn(['RSSI', 'SSI', 'ADMIN'])
    .withMessage('Le rôle doit être RSSI, SSI ou ADMIN')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le rôle ne peut pas être vide');
      }
      return true;
        }),
];

// Forgot password validation - email must be valid and exist in database
exports.forgotPasswordValidator = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .custom(async (value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    })
    .normalizeEmail(),
];

// Reset password validation (after admin approval)
exports.resetPasswordValidator = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .custom(async (value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    })
    .normalizeEmail(),
  
  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le mot de passe ne peut pas être vide');
      }
      // Check for password complexity (at least one letter and one number)
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      if (!hasLetter || !hasNumber) {
        throw new Error('Le mot de passe doit contenir au moins une lettre et un chiffre');
      }
      return true;
    }),
];

exports.updateUserValidator = [
  // Nom validation - optional but must meet requirements if provided
  body('nom')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit être une chaîne de caractères entre 2 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 2 words for full name)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
          throw new Error('Le nom doit contenir au moins 2 mots (prénom et nom)');
        }
        // Check for meaningful content (not just repeated characters)
        const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
        if (uniqueChars.size < 3) {
          throw new Error('Le nom doit contenir des caractères variés pour être compréhensible');
        }
      }
      return true;
    }),

  // Email validation - optional but must be valid if provided
  body('email')
    .optional()
    .custom((value) => {
      if (value) {
        const validation = validateEmail(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }
      return true;
    })
    .normalizeEmail(),

  // Mot de passe validation - optional but must meet requirements if provided
  body('motDePasse')
    .optional()
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le mot de passe ne peut pas être vide');
      }
      if (value) {
        // Check for password complexity (at least one letter and one number)
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasLetter || !hasNumber) {
          throw new Error('Le mot de passe doit contenir au moins une lettre et un chiffre');
        }
      }
      return true;
    }),

  // Role validation - optional but must be valid if provided
  body('role')
    .optional()
    .isIn(['RSSI', 'SSI', 'ADMIN'])
    .withMessage('Le rôle doit être RSSI, SSI ou ADMIN')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le rôle ne peut pas être vide');
      }
      return true;
    }),
]; 