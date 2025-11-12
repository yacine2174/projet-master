const express = require('express');
const router = express.Router();
const constatController = require('../controllers/constatController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createConstatValidator, updateConstatValidator } = require('../validators/constatValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), constatController.getAllConstats);
router.get('/audit/:auditId', auth, authorize('RSSI', 'SSI'), constatController.getConstatsByAudit);
router.get('/:id', auth, authorize('RSSI', 'SSI'), constatController.getConstatById);
router.post('/', auth, authorize('RSSI', 'SSI'), createConstatValidator, validate, constatController.createConstat);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateConstatValidator, validate, constatController.updateConstat); // RSSI & SSI
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updateConstatValidator, validate, constatController.updateConstat); // RSSI & SSI
router.delete('/:id', auth, authorize('RSSI', 'SSI'), constatController.deleteConstat); // RSSI & SSI
// Bulk link many constats to a project
router.post('/bulk-link-project', auth, authorize('RSSI', 'SSI'), constatController.bulkLinkProject);

router.get('/:id/recommandations', auth, authorize('RSSI', 'SSI'), constatController.listRecommandationsForConstat);
router.post('/:id/recommandations', auth, authorize('RSSI', 'SSI'), constatController.addRecommandationToConstat);
router.delete('/:id/recommandations/:recommandationId', auth, authorize('RSSI', 'SSI'), constatController.removeRecommandationFromConstat);

module.exports = router; 