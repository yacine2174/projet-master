const express = require('express');
const router = express.Router();
const preuveController = require('../controllers/preuveController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createPreuveValidator, updatePreuveValidator } = require('../validators/preuveValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), preuveController.getAllPreuves);
router.get('/:id', auth, authorize('RSSI', 'SSI'), preuveController.getPreuveById);
router.post('/', auth, authorize('RSSI', 'SSI'), createPreuveValidator, validate, preuveController.createPreuve);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updatePreuveValidator, validate, preuveController.updatePreuve); // RSSI & SSI
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updatePreuveValidator, validate, preuveController.updatePreuve); // RSSI & SSI
router.delete('/:id', auth, authorize('RSSI', 'SSI'), preuveController.deletePreuve); // RSSI & SSI

module.exports = router; 