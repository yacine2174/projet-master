const express = require('express');
const router = express.Router();
const planActionController = require('../controllers/planActionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createPlanActionValidator, updatePlanActionValidator } = require('../validators/planActionValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), planActionController.getAllPlanActions);
router.get('/:id', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionById);
router.post('/', auth, authorize('RSSI', 'SSI'), createPlanActionValidator, validate, planActionController.createPlanAction); // RSSI & SSI
router.put('/:id', auth, authorize('RSSI', 'SSI'), updatePlanActionValidator, validate, planActionController.updatePlanAction); // RSSI & SSI
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updatePlanActionValidator, validate, planActionController.updatePlanAction); // RSSI & SSI
router.delete('/:id', auth, authorize('RSSI', 'SSI'), planActionController.deletePlanAction); // RSSI & SSI

// Additional routes
router.get('/audit/:auditId', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionsByAudit);
router.get('/projet/:projetId', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionsByProjet);
router.post('/:id/recommandations', auth, authorize('RSSI', 'SSI'), planActionController.addRecommandationsToPlanAction); // RSSI & SSI
router.post('/generate', auth, authorize('RSSI', 'SSI'), planActionController.generateAutomatedPlan); // RSSI & SSI
router.get('/stats/overview', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionsStats); // RSSI & SSI
router.get('/with-recommandations', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionsWithRecommandations);
router.get('/without-recommandations', auth, authorize('RSSI', 'SSI'), planActionController.getPlanActionsWithoutRecommandations);
router.get('/recent', auth, authorize('RSSI', 'SSI'), planActionController.getRecentPlanActions);

module.exports = router; 