const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projetController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createProjetValidator, updateProjetValidator, updateProjetStatutValidator } = require('../validators/projetValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), projetController.getAllProjets);
router.get('/:id', auth, authorize('RSSI', 'SSI'), projetController.getProjetById);
router.post('/', auth, authorize('RSSI', 'SSI'), createProjetValidator, validate, projetController.createProjet);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateProjetValidator, validate, projetController.updateProjet);
router.delete('/:id', auth, authorize('RSSI', 'SSI'), projetController.deleteProjet);
router.patch('/:id/statut', auth, authorize('RSSI'), (req, res, next) => {
  console.log('=== ROUTE MATCHED ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  next();
}, updateProjetStatutValidator, validate, projetController.updateProjetStatut); // RSSI only

module.exports = router; 