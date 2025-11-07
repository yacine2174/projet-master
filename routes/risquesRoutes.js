const express = require('express');
const router = express.Router();
const risquesController = require('../controllers/risquesController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createRisqueValidator, updateRisqueValidator } = require('../validators/risqueValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), risquesController.getAllRisques);
router.get('/projet/:projetId', auth, authorize('RSSI', 'SSI'), risquesController.getRisquesByProjet);
router.get('/:id', auth, authorize('RSSI', 'SSI'), risquesController.getRisqueById);
router.post('/', auth, authorize('RSSI', 'SSI'), createRisqueValidator, validate, risquesController.createRisque);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateRisqueValidator, validate, risquesController.updateRisque);
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updateRisqueValidator, validate, risquesController.updateRisque);
router.delete('/:id', auth, authorize('RSSI', 'SSI'), risquesController.deleteRisque);

module.exports = router; 