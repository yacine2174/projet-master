const express = require('express');
const router = express.Router();
const { getAllAudits, createAudit, getAuditById, updateAudit, deleteAudit, addPointsForts, updateAuditStatut } = require('../controllers/auditController');
const { getAuditSynthese } = require('../controllers/auditSyntheseController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createAuditValidator, updateAuditValidator, updateAuditStatutValidator } = require('../validators/auditValidator');
const validate = require('../middleware/validate');

router.get('/', auth, authorize('RSSI', 'SSI'), getAllAudits);
router.post('/', auth, authorize('RSSI', 'SSI'), createAuditValidator, validate, createAudit);
router.get('/:id', auth, authorize('RSSI', 'SSI'), getAuditById); // consulter un audit spécifique
router.get('/:id/synthese', auth, authorize('RSSI', 'SSI'), getAuditSynthese); // aggregation synthèse
router.put('/:id', auth, authorize('RSSI', 'SSI'), updateAuditValidator, validate, updateAudit);  // éditer un audit
router.patch('/:id', auth, authorize('RSSI', 'SSI'), updateAuditValidator, validate, updateAudit);  // éditer un audit (PATCH)
router.post('/:id/points-forts', auth, authorize('RSSI', 'SSI'), addPointsForts); // ajouter des points forts
router.put('/:id/statut', auth, authorize('RSSI'), updateAuditStatutValidator, validate, updateAuditStatut); // RSSI only - update audit status
router.patch('/:id/statut', auth, authorize('RSSI'), updateAuditStatutValidator, validate, updateAuditStatut); // RSSI only - update audit status
router.delete('/:id', auth, authorize('RSSI', 'SSI'), deleteAudit); // supprimer un audit

module.exports = router;
