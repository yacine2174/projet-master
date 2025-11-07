const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createPAS, getPAS, getPASByProjet, listPAS, updatePAS, deletePAS, createPASAuto } = require('../controllers/pasController');

// PAS CRUD - restricted to RSSI & SSI for create/update, all authenticated can read
// Order matters – project-scoped routes must come before generic '/:id'
router.post('/projet/:projetId/auto', auth, authorize('RSSI', 'SSI'), createPASAuto);
router.get('/projet/:projetId', auth, getPASByProjet);

router.post('/', auth, authorize('RSSI', 'SSI'), createPAS);
router.get('/', auth, listPAS);
router.get('/:id', auth, getPAS);
router.put('/:id', auth, authorize('RSSI', 'SSI'), updatePAS);
router.delete('/:id', auth, authorize('RSSI'), deletePAS);

module.exports = router;


