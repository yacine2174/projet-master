const express = require('express');
const router = express.Router();
const conceptionController = require('../controllers/conceptionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createConceptionValidator, updateConceptionValidator, updateConceptionSSIValidator, updateConceptionRSSIValidator } = require('../validators/conceptionValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), conceptionController.getAllConceptions);
router.get('/projet/:projetId', auth, authorize('RSSI', 'SSI'), conceptionController.getConceptionsByProjet);
router.get('/:id', auth, authorize('RSSI', 'SSI'), conceptionController.getConceptionById);
router.post('/', auth, authorize('RSSI', 'SSI'), createConceptionValidator, validate, conceptionController.createConception);
// Middleware to apply different validators based on user role
const applyConceptionValidator = (req, res, next) => {
  const validators = req.user.role === 'RSSI' ? updateConceptionRSSIValidator : updateConceptionSSIValidator;
  
  // Use express-validator's validationResult to check all validators
  const { validationResult } = require('express-validator');
  
  // Apply all validators
  Promise.all(validators.map(validation => validation.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    })
    .catch(next);
};

router.put('/:id', auth, authorize('RSSI', 'SSI'), applyConceptionValidator, validate, conceptionController.updateConception);
router.patch('/:id', auth, authorize('RSSI', 'SSI'), applyConceptionValidator, validate, conceptionController.updateConception);
router.delete('/:id', auth, authorize('RSSI'), conceptionController.deleteConception);

router.post('/:id/valider', auth, authorize('RSSI'), conceptionController.validerConception); // RSSI only
router.patch('/:id/valider', auth, authorize('RSSI'), conceptionController.validerConception); // RSSI only
router.put('/:id/statut', auth, authorize('RSSI'), conceptionController.updateConceptionStatut); // RSSI only

module.exports = router; 