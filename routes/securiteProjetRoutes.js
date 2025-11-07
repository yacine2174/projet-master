const express = require('express');
const router = express.Router();
const securiteProjetController = require('../controllers/securiteProjetController');
const { createSecuriteProjetValidator, updateSecuriteProjetValidator } = require('../validators/securiteProjetValidator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * Routes for SecuriteProjet (Security Configuration)
 * All routes require authentication and RSSI/SSI role
 */

// Create a new security configuration
router.post(
  '/',
  auth,
  authorize('RSSI', 'SSI'),
  createSecuriteProjetValidator,
  securiteProjetController.createSecuriteProjet
);

// Get all security configurations
router.get(
  '/',
  auth,
  authorize('RSSI', 'SSI'),
  securiteProjetController.getAllSecuriteProjet
);

// Get security configuration by project ID
router.get(
  '/projet/:projetId',
  auth,
  authorize('RSSI', 'SSI'),
  securiteProjetController.getSecuriteProjetByProjetId
);

// Get security configuration by ID
router.get(
  '/:id',
  auth,
  authorize('RSSI', 'SSI'),
  securiteProjetController.getSecuriteProjetById
);

// Update security configuration
router.put(
  '/:id',
  auth,
  authorize('RSSI', 'SSI'),
  updateSecuriteProjetValidator,
  securiteProjetController.updateSecuriteProjet
);

// Delete security configuration (RSSI only)
router.delete(
  '/:id',
  auth,
  authorize('RSSI'),
  securiteProjetController.deleteSecuriteProjet
);

module.exports = router;
