const express = require('express');
const router = express.Router();
const normesController = require('../controllers/normesController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createNormeValidator, updateNormeValidator } = require('../validators/normeValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), normesController.getAllNormes);
router.get('/:id', auth, authorize('RSSI', 'SSI'), normesController.getNormesById);
router.post('/', auth, authorize('RSSI', 'SSI'), createNormeValidator, validate, normesController.createNormes); // RSSI and SSI
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateNormeValidator, validate, normesController.updateNormes); // RSSI and SSI
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updateNormeValidator, validate, normesController.updateNormes); // RSSI and SSI
router.delete('/:id', auth, authorize('RSSI', 'SSI'), normesController.deleteNormes); // RSSI and SSI

module.exports = router; 