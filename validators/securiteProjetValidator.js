const { body } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validators for SecuriteProjet entity
 * Comprehensive validation rules for security configuration
 */

/**
 * Validation rules for creating a security configuration
 */
exports.createSecuriteProjetValidator = [
  // Project reference - required
  body('projet')
    .notEmpty().withMessage('projet est requis')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('projet doit être un ID MongoDB valide'),

  // Version - optional
  body('version')
    .optional()
    .isString().withMessage('version doit être une chaîne de caractères')
    .isLength({ max: 50 }).withMessage('version ne peut pas dépasser 50 caractères'),

  // Derniere revision - optional date
  body('derniereRevision')
    .optional()
    .isISO8601().withMessage('derniereRevision doit être une date valide'),
  
  // === Physical Security Measures ===
  body('mesuresSecurite.physique.controleAcces')
    .optional()
    .isString().withMessage('controleAcces doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('controleAcces ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.videoSurveillance')
    .optional()
    .isString().withMessage('videoSurveillance doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('videoSurveillance ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.protectionIncendie')
    .optional()
    .isString().withMessage('protectionIncendie doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('protectionIncendie ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (physique) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (physique) ne peut pas dépasser 1000 caractères'),

  // === Logical Security Measures ===
  body('mesuresSecurite.logique.authentification')
    .optional()
    .isString().withMessage('authentification doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('authentification ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.sauvegardes')
    .optional()
    .isString().withMessage('sauvegardes doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('sauvegardes ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.chiffrement')
    .optional()
    .isString().withMessage('chiffrement doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('chiffrement ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.pareFeuxAntivirus')
    .optional()
    .isString().withMessage('pareFeuxAntivirus doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('pareFeuxAntivirus ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (logique) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (logique) ne peut pas dépasser 1000 caractères'),

  // === Organizational Security Measures ===
  body('mesuresSecurite.organisationnelle.formationSensibilisation')
    .optional()
    .isString().withMessage('formationSensibilisation doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('formationSensibilisation ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.proceduresHabilitation')
    .optional()
    .isString().withMessage('proceduresHabilitation doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('proceduresHabilitation ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.clausesConfidentialite')
    .optional()
    .isString().withMessage('clausesConfidentialite doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('clausesConfidentialite ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (organisationnelle) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (organisationnelle) ne peut pas dépasser 1000 caractères'),

  // === BCP/DRP - Backup and Restoration ===
  body('pcaPra.sauvegardeRestauration.procedures')
    .optional()
    .isString().withMessage('procedures doit être une chaîne de caractères')
    .isLength({ max: 2000 }).withMessage('procedures ne peut pas dépasser 2000 caractères'),

  body('pcaPra.sauvegardeRestauration.derniereTest')
    .optional()
    .isISO8601().withMessage('derniereTest doit être une date valide'),
  
  body('pcaPra.sauvegardeRestauration.frequenceTests')
    .optional()
    .isString().withMessage('frequenceTests doit être une chaîne de caractères')
    .isLength({ max: 100 }).withMessage('frequenceTests ne peut pas dépasser 100 caractères'),

  // === BCP/DRP - Disaster Recovery Site ===
  body('pcaPra.siteSecours.description')
    .optional()
    .isString().withMessage('description (site secours) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('description (site secours) ne peut pas dépasser 1000 caractères'),

  body('pcaPra.siteSecours.adresse')
    .optional()
    .isString().withMessage('adresse doit être une chaîne de caractères')
    .isLength({ max: 500 }).withMessage('adresse ne peut pas dépasser 500 caractères'),

  // === BCP/DRP - Simulation Exercises ===
  body('pcaPra.exercicesSimulation.description')
    .optional()
    .isString().withMessage('description (exercices) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('description (exercices) ne peut pas dépasser 1000 caractères'),

  body('pcaPra.exercicesSimulation.dernierExercice')
    .optional()
    .isISO8601().withMessage('dernierExercice doit être une date valide'),
  
  body('pcaPra.exercicesSimulation.frequence')
    .optional()
    .isString().withMessage('frequence doit être une chaîne de caractères')
    .isLength({ max: 100 }).withMessage('frequence ne peut pas dépasser 100 caractères'),

  // Validation information
  body('valideePar')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('valideePar doit être un ID MongoDB valide'),

  body('dateValidation')
    .optional()
    .isISO8601().withMessage('dateValidation doit être une date valide'),

  // Notes
  body('notes')
    .optional()
    .isString().withMessage('notes doit être une chaîne de caractères')
    .isLength({ max: 5000 }).withMessage('notes ne peut pas dépasser 5000 caractères')
];

/**
 * Validation rules for updating a security configuration
 * Same as create, but projet is optional (cannot be changed)
 */
exports.updateSecuriteProjetValidator = [
  // Version - optional
  body('version')
    .optional()
    .isString().withMessage('version doit être une chaîne de caractères')
    .isLength({ max: 50 }).withMessage('version ne peut pas dépasser 50 caractères'),
  
  // Derniere revision - optional date
  body('derniereRevision')
    .optional()
    .isISO8601().withMessage('derniereRevision doit être une date valide'),
  
  // === Physical Security Measures ===
  body('mesuresSecurite.physique.controleAcces')
    .optional()
    .isString().withMessage('controleAcces doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('controleAcces ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.videoSurveillance')
    .optional()
    .isString().withMessage('videoSurveillance doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('videoSurveillance ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.protectionIncendie')
    .optional()
    .isString().withMessage('protectionIncendie doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('protectionIncendie ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.physique.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (physique) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (physique) ne peut pas dépasser 1000 caractères'),

  // === Logical Security Measures ===
  body('mesuresSecurite.logique.authentification')
    .optional()
    .isString().withMessage('authentification doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('authentification ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.sauvegardes')
    .optional()
    .isString().withMessage('sauvegardes doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('sauvegardes ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.chiffrement')
    .optional()
    .isString().withMessage('chiffrement doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('chiffrement ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.pareFeuxAntivirus')
    .optional()
    .isString().withMessage('pareFeuxAntivirus doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('pareFeuxAntivirus ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.logique.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (logique) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (logique) ne peut pas dépasser 1000 caractères'),

  // === Organizational Security Measures ===
  body('mesuresSecurite.organisationnelle.formationSensibilisation')
    .optional()
    .isString().withMessage('formationSensibilisation doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('formationSensibilisation ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.proceduresHabilitation')
    .optional()
    .isString().withMessage('proceduresHabilitation doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('proceduresHabilitation ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.clausesConfidentialite')
    .optional()
    .isString().withMessage('clausesConfidentialite doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('clausesConfidentialite ne peut pas dépasser 1000 caractères'),

  body('mesuresSecurite.organisationnelle.autresMesures')
    .optional()
    .isString().withMessage('autresMesures (organisationnelle) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('autresMesures (organisationnelle) ne peut pas dépasser 1000 caractères'),

  // === BCP/DRP - Backup and Restoration ===
  body('pcaPra.sauvegardeRestauration.procedures')
    .optional()
    .isString().withMessage('procedures doit être une chaîne de caractères')
    .isLength({ max: 2000 }).withMessage('procedures ne peut pas dépasser 2000 caractères'),

  body('pcaPra.sauvegardeRestauration.derniereTest')
    .optional()
    .isISO8601().withMessage('derniereTest doit être une date valide'),
  
  body('pcaPra.sauvegardeRestauration.frequenceTests')
    .optional()
    .isString().withMessage('frequenceTests doit être une chaîne de caractères')
    .isLength({ max: 100 }).withMessage('frequenceTests ne peut pas dépasser 100 caractères'),

  // === BCP/DRP - Disaster Recovery Site ===
  body('pcaPra.siteSecours.description')
    .optional()
    .isString().withMessage('description (site secours) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('description (site secours) ne peut pas dépasser 1000 caractères'),

  body('pcaPra.siteSecours.adresse')
    .optional()
    .isString().withMessage('adresse doit être une chaîne de caractères')
    .isLength({ max: 500 }).withMessage('adresse ne peut pas dépasser 500 caractères'),

  // === BCP/DRP - Simulation Exercises ===
  body('pcaPra.exercicesSimulation.description')
    .optional()
    .isString().withMessage('description (exercices) doit être une chaîne de caractères')
    .isLength({ max: 1000 }).withMessage('description (exercices) ne peut pas dépasser 1000 caractères'),

  body('pcaPra.exercicesSimulation.dernierExercice')
    .optional()
    .isISO8601().withMessage('dernierExercice doit être une date valide'),
  
  body('pcaPra.exercicesSimulation.frequence')
    .optional()
    .isString().withMessage('frequence doit être une chaîne de caractères')
    .isLength({ max: 100 }).withMessage('frequence ne peut pas dépasser 100 caractères'),

  // Validation information
  body('valideePar')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('valideePar doit être un ID MongoDB valide'),

  body('dateValidation')
    .optional()
    .isISO8601().withMessage('dateValidation doit être une date valide'),

  // Notes
  body('notes')
    .optional()
    .isString().withMessage('notes doit être une chaîne de caractères')
    .isLength({ max: 5000 }).withMessage('notes ne peut pas dépasser 5000 caractères')
];
