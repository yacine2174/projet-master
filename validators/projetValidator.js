const { body } = require('express-validator');

exports.createProjetValidator = [
  // Audit validation - required and must exist
  body('audit')
    .notEmpty()
    .withMessage('L\'audit est requis')
    .isMongoId()
    .withMessage('audit doit être un ID MongoDB valide')
    .custom(async (value) => {
      const Audit = require('../models/Audit');
      const audit = await Audit.findById(value);
      if (!audit) {
        throw new Error('L\'audit spécifié n\'existe pas');
      }
      return true;
    }),
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

  // Perimetre validation - string with minimum 10 characters, no empty strings, comprehensible
  body('perimetre')
    .notEmpty()
    .withMessage('Le périmètre est requis')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le périmètre doit être une chaîne de caractères entre 10 et 1000 caractères')
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

  // Budget validation - must be a positive number
  body('budget')
    .notEmpty()
    .withMessage('Le budget est requis')
    .isNumeric()
    .withMessage('Le budget doit être un nombre')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Le budget doit être un nombre positif');
      }
      return true;
    }),

  // Priorite validation - string with minimum 3 characters, no empty strings
  body('priorite')
    .notEmpty()
    .withMessage('La priorité est requise')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 100 caractères')
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

  // DateDebut validation - must be valid ISO date
  body('dateDebut')
    .notEmpty()
    .withMessage('La date de début est requise')
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO 8601'),

  // DateFin validation - must be valid ISO date and after dateDebut
  body('dateFin')
    .notEmpty()
    .withMessage('La date de fin est requise')
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO 8601')
    .custom((value, { req }) => {
      if (req.body.dateDebut && value) {
        const dateDebut = new Date(req.body.dateDebut);
        const dateFin = new Date(value);
        
        if (dateDebut >= dateFin) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
      return true;
    }),

  // Statut validation - string with minimum 3 characters, no empty strings
  body('statut')
    .notEmpty()
    .withMessage('Le statut est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le statut doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('Le statut doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // SWOT validation - must be a valid MongoDB ID and SWOT must exist
  body('swot')
    .optional()
    .isMongoId()
    .withMessage('swot doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le SWOT existe dans la base de données
      const SWOT = require('../models/SWOT');
      const swot = await SWOT.findById(value);
      if (!swot) {
        throw new Error('Le SWOT spécifié n\'existe pas');
      }
      
      return true;
    }),

  // Conception validation - must be a valid MongoDB ID and conception must exist
  body('conception')
    .optional()
    .isMongoId()
    .withMessage('conception doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la conception existe dans la base de données
      const Conception = require('../models/Conception');
      const conception = await Conception.findById(value);
      if (!conception) {
        throw new Error('La conception spécifiée n\'existe pas');
      }
      
      return true;
    }),

  // Risques validation - optional array of MongoDB IDs
  body('risques')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les risques doivent être un tableau d\'IDs (maximum 50 éléments)'),

  body('risques.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque risque doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le risque existe dans la base de données
      const Risque = require('../models/Risques');
      const risque = await Risque.findById(value);
      if (!risque) {
        throw new Error(`Le risque avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),

  // Constats association is REQUIRED when creating a project
  body('constats')
    .isArray({ min: 1, max: 500 })
    .withMessage('constats est requis et doit être un tableau non vide d\'IDs'),

  body('constats.*')
    .isMongoId()
    .withMessage('Chaque constat doit être un ID MongoDB valide')
    .custom(async (value) => {
      const Constat = require('../models/Constat');
      const existe = await Constat.findById(value);
      if (!existe) {
        throw new Error(`Le constat ${value} n'existe pas`);
      }
      return true;
    }),

  // CreerPar validation - must be a valid MongoDB ID and user must exist
  body('creerPar')
    .optional()
    .isMongoId()
    .withMessage('creerPar doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que l'utilisateur existe dans la base de données
      const Utilisateur = require('../models/Utilisateur');
      const utilisateur = await Utilisateur.findById(value);
      if (!utilisateur) {
        throw new Error('L\'utilisateur spécifié n\'existe pas');
      }
      
      return true;
    }),
];

exports.updateProjetValidator = [
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

  // Perimetre validation - optional but must meet requirements if provided
  body('perimetre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le périmètre doit être une chaîne de caractères entre 10 et 1000 caractères')
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

  // Budget validation - optional but must be positive if provided
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Le budget doit être un nombre')
    .custom((value) => {
      if (value !== undefined && value < 0) {
        throw new Error('Le budget doit être un nombre positif');
      }
      return true;
    }),

  // Priorite validation - optional but must meet requirements if provided
  body('priorite')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La priorité doit être une chaîne de caractères entre 3 et 100 caractères')
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

  // DateDebut validation - optional but must be valid if provided
  body('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être une date valide au format ISO 8601'),

  // DateFin validation - optional but must be valid if provided
  body('dateFin')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être une date valide au format ISO 8601')
    .custom((value, { req }) => {
      if (req.body.dateDebut && value) {
        const dateDebut = new Date(req.body.dateDebut);
        const dateFin = new Date(value);
        
        if (dateDebut >= dateFin) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
      return true;
    }),

  // Statut validation - optional but must meet requirements if provided
  body('statut')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le statut doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      if (value) {
        // Check for comprehensible string (at least 1 word)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 1) {
          throw new Error('Le statut doit contenir au moins 1 mot pour être compréhensible');
        }
      }
      return true;
    }),

  // SWOT validation - optional but must be valid if provided
  body('swot')
    .optional()
    .isMongoId()
    .withMessage('swot doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le SWOT existe dans la base de données
      const SWOT = require('../models/SWOT');
      const swot = await SWOT.findById(value);
      if (!swot) {
        throw new Error('Le SWOT spécifié n\'existe pas');
      }
      
      return true;
    }),

  // Conception validation - optional but must be valid if provided
  body('conception')
    .optional()
    .isMongoId()
    .withMessage('conception doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la conception existe dans la base de données
      const Conception = require('../models/Conception');
      const conception = await Conception.findById(value);
      if (!conception) {
        throw new Error('La conception spécifiée n\'existe pas');
      }
      
      return true;
    }),

  // Risques validation - optional array of MongoDB IDs
  body('risques')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Les risques doivent être un tableau d\'IDs (maximum 50 éléments)'),

  body('risques.*')
    .optional()
    .isMongoId()
    .withMessage('Chaque risque doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le risque existe dans la base de données
      const Risque = require('../models/Risques');
      const risque = await Risque.findById(value);
      if (!risque) {
        throw new Error(`Le risque avec l'ID ${value} n'existe pas`);
      }
      
      return true;
    }),

  // Constat validation - optional but must be valid if provided
  body('constat')
    .optional()
    .isMongoId()
    .withMessage('constat doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que le constat existe dans la base de données
      const Constat = require('../models/Constat');
      const constat = await Constat.findById(value);
      if (!constat) {
        throw new Error('Le constat spécifié n\'existe pas');
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
      
      // Vérifier que l'utilisateur existe dans la base de données
      const Utilisateur = require('../models/Utilisateur');
      const utilisateur = await Utilisateur.findById(value);
      if (!utilisateur) {
        throw new Error('L\'utilisateur spécifié n\'existe pas');
      }
      
      return true;
    }),
  
  // === NEW PAS-RELATED FIELD VALIDATORS (for updates) ===
  
  // Personnel Internes - optional string with min 10 characters
  body('personnelsInternes')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Les personnels internes doivent être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Les personnels internes ne peuvent pas être vides');
      }
      if (value) {
        // Check for meaningful content (at least 3 words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('Les personnels internes doivent contenir au moins 3 mots pour être compréhensibles');
        }
      }
      return true;
    }),
  
  // Personnel Externes - optional string with min 10 characters
  body('personnelsExternes')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Les personnels externes doivent être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Les personnels externes ne peuvent pas être vides');
      }
      if (value) {
        // Check for meaningful content (at least 3 words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('Les personnels externes doivent contenir au moins 3 mots pour être compréhensibles');
        }
      }
      return true;
    }),
  
  // Reglementations - optional array of strings
  body('reglementations')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Les réglementations doivent être un tableau de chaînes (maximum 20 éléments)'),
  
  body('reglementations.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Chaque réglementation doit être une chaîne de caractères entre 2 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Une réglementation ne peut pas être vide');
      }
      return true;
    }),
  
  // Contacts Urgence - optional array of contact objects
  body('contactsUrgence')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Les contacts d\'urgence doivent être un tableau (maximum 10 éléments)'),
  
  body('contactsUrgence.*.nom')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du contact doit être une chaîne de caractères entre 2 et 100 caractères'),
  
  body('contactsUrgence.*.fonction')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La fonction du contact doit être une chaîne de caractères entre 2 et 100 caractères'),
  
  body('contactsUrgence.*.telephone')
    .optional()
    .isString()
    .trim()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Le téléphone doit contenir uniquement des chiffres et caractères valides (+, -, espace, parenthèses, point)'),
  
  body('contactsUrgence.*.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('L\'email du contact doit être une adresse email valide'),
  
  // Securite - optional MongoDB ID reference to SecuriteProjet
  body('securite')
    .optional()
    .isMongoId()
    .withMessage('securite doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la configuration de sécurité existe dans la base de données
      const SecuriteProjet = require('../models/SecuriteProjet');
      const securite = await SecuriteProjet.findById(value);
      if (!securite) {
        throw new Error('La configuration de sécurité spécifiée n\'existe pas');
      }
      
      return true;
    }),
];

// Validator for RSSI status updates (includes validePar)
exports.updateProjetStatutValidator = [
  // Debug: Add a simple validation first to see if the validator is being called
  body('debug')
    .optional()
    .custom((value, { req }) => {
      console.log('=== VALIDATOR IS BEING CALLED ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);
      return true;
    }),
  // Statut validation - string with minimum 3 characters, no empty strings
  body('statut')
    .notEmpty()
    .withMessage('Le statut est requis')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le statut doit être une chaîne de caractères entre 3 et 100 caractères')
    .custom((value) => {
      if (value.trim() === '') {
        throw new Error('Le statut ne peut pas être vide');
      }
      // Check for comprehensible string (at least 1 word)
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 1) {
        throw new Error('Le statut doit contenir au moins 1 mot pour être compréhensible');
      }
      return true;
    }),

  // ValidePar validation - required for RSSI status updates (MUST be name, not ID)
  body('validePar')
    .notEmpty()
    .withMessage('Le nom du RSSI est requis pour valider le projet')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit être une chaîne de caractères entre 2 et 100 caractères')
    .custom(async (value, { req }) => {
      console.log('=== VALIDATOR CUSTOM FUNCTION CALLED ===');
      console.log('Value received:', value);
      console.log('User role:', req.user.role);
      console.log('User ID:', req.user._id);
      console.log('Validator: validePar custom validation started');
      console.log('Input value:', value);
      if (!value) {
        throw new Error('Le nom du RSSI est requis pour valider le projet');
      }
      
      if (value.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      
      // Check if the logged-in user is RSSI
      if (req.user.role !== 'RSSI') {
        throw new Error('Seuls les utilisateurs RSSI peuvent valider les projets');
      }
      
      // Vérifier que l'utilisateur existe dans la base de données
      const Utilisateur = require('../models/Utilisateur');
      const mongoose = require('mongoose');
      
      // Search by name only (no ID allowed) - case insensitive
      console.log('Searching for user with name:', value);
      const utilisateur = await Utilisateur.findOne({ 
        nom: { $regex: new RegExp(`^${value}$`, 'i') }, 
        role: 'RSSI' 
      });
      
      console.log('User found:', utilisateur);
      
      if (!utilisateur) {
        // Let's also try a broader search to see what RSSI users exist
        const allRSSI = await Utilisateur.find({ role: 'RSSI' });
        console.log('All RSSI users:', allRSSI.map(u => ({ nom: u.nom, id: u._id })));
        throw new Error(`Aucun utilisateur RSSI trouvé avec le nom "${value}". Utilisateurs RSSI disponibles: ${allRSSI.map(u => u.nom).join(', ')}`);
      }
      
      if (utilisateur.role !== 'RSSI') {
        throw new Error('Seuls les utilisateurs RSSI peuvent valider les projets');
      }
      
      // Ensure the logged-in user is validating with their own name
      if (utilisateur._id.toString() !== req.user._id.toString()) {
        throw new Error(`Vous ne pouvez valider qu'avec votre propre nom. Vous êtes connecté en tant que "${req.user.nom}" mais vous essayez de valider avec "${value}"`);
      }
      
             // Store the converted ObjectId in a separate property
       req.body.valideParObjectId = utilisateur._id;
       
       // Debug: Log the conversion
       console.log('Validator: Converting name to ObjectId');
       console.log('Original value:', value);
       console.log('User found:', utilisateur.nom);
       console.log('User ID:', utilisateur._id);
       console.log('Converted valideParObjectId:', req.body.valideParObjectId);
      
      return true;
    }),
  
  // === NEW PAS-RELATED FIELD VALIDATORS ===
  
  // Personnel Internes - optional string with min 10 characters
  body('personnelsInternes')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Les personnels internes doivent être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Les personnels internes ne peuvent pas être vides');
      }
      if (value) {
        // Check for meaningful content (at least 3 words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('Les personnels internes doivent contenir au moins 3 mots pour être compréhensibles');
        }
      }
      return true;
    }),
  
  // Personnel Externes - optional string with min 10 characters
  body('personnelsExternes')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Les personnels externes doivent être une chaîne de caractères entre 10 et 500 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Les personnels externes ne peuvent pas être vides');
      }
      if (value) {
        // Check for meaningful content (at least 3 words)
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
          throw new Error('Les personnels externes doivent contenir au moins 3 mots pour être compréhensibles');
        }
      }
      return true;
    }),
  
  // Reglementations - optional array of strings
  body('reglementations')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Les réglementations doivent être un tableau de chaînes (maximum 20 éléments)'),
  
  body('reglementations.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Chaque réglementation doit être une chaîne de caractères entre 2 et 100 caractères')
    .custom((value) => {
      if (value && value.trim() === '') {
        throw new Error('Une réglementation ne peut pas être vide');
      }
      return true;
    }),
  
  // Contacts Urgence - optional array of contact objects
  body('contactsUrgence')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Les contacts d\'urgence doivent être un tableau (maximum 10 éléments)'),
  
  body('contactsUrgence.*.nom')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du contact doit être une chaîne de caractères entre 2 et 100 caractères'),
  
  body('contactsUrgence.*.fonction')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La fonction du contact doit être une chaîne de caractères entre 2 et 100 caractères'),
  
  body('contactsUrgence.*.telephone')
    .optional()
    .isString()
    .trim()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Le téléphone doit contenir uniquement des chiffres et caractères valides (+, -, espace, parenthèses, point)'),
  
  body('contactsUrgence.*.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('L\'email du contact doit être une adresse email valide'),
  
  // Securite - optional MongoDB ID reference to SecuriteProjet
  body('securite')
    .optional()
    .isMongoId()
    .withMessage('securite doit être un ID MongoDB valide')
    .custom(async (value) => {
      if (!value) {
        return true; // Optional field
      }
      
      // Vérifier que la configuration de sécurité existe dans la base de données
      const SecuriteProjet = require('../models/SecuriteProjet');
      const securite = await SecuriteProjet.findById(value);
      if (!securite) {
        throw new Error('La configuration de sécurité spécifiée n\'existe pas');
      }
      
      return true;
    }),
]; 