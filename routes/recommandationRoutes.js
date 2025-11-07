const express = require('express');
const router = express.Router();
const recommandationController = require('../controllers/recommandationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createRecommandationValidator, updateRecommandationValidator, updateRecommandationStatutValidator } = require('../validators/recommandationValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), recommandationController.getAllRecommandations);
router.get('/:id', auth, authorize('RSSI', 'SSI'), recommandationController.getRecommandationById);
router.post('/', auth, authorize('RSSI', 'SSI'), createRecommandationValidator, validate, recommandationController.createRecommandation);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateRecommandationValidator, validate, recommandationController.updateRecommandation); // RSSI & SSI can edit content
router.delete('/:id', auth, authorize('RSSI', 'SSI'), recommandationController.deleteRecommandation); // RSSI & SSI can delete
router.post('/:id/valider', auth, authorize('RSSI'), recommandationController.validerRecommandation); // RSSI only
router.patch('/:id/valider', auth, authorize('RSSI'), recommandationController.validerRecommandation); // RSSI only
router.put('/:id/statut', auth, authorize('RSSI'), updateRecommandationStatutValidator, validate, recommandationController.updateRecommandationStatut); // RSSI only
// If you add a validation route, protect it with auth, authorize('RSSI')

module.exports = router; 