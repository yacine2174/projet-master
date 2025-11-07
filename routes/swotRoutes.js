const express = require('express');
const router = express.Router();
const swotController = require('../controllers/swotController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createSWOTValidator, updateSWOTValidator } = require('../validators/swotValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), swotController.getAllSWOT);
router.get('/projet/:projetId', auth, authorize('RSSI', 'SSI'), swotController.getSWOTByProjet);
router.get('/:id', auth, authorize('RSSI', 'SSI'), swotController.getSWOTById);
router.post('/', auth, authorize('RSSI', 'SSI'), createSWOTValidator, validate, swotController.createSWOT);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateSWOTValidator, validate, swotController.updateSWOT);
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updateSWOTValidator, validate, swotController.updateSWOT);
router.delete('/:id', auth, authorize('RSSI', 'SSI'), swotController.deleteSWOT);

module.exports = router; 