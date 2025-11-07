const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { 
  createUserValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator 
} = require('../validators/utilisateurValidator');
const validate = require('../middleware/validate');

// Public routes
router.post('/login', utilisateurController.login); // Public
router.post('/signup', createUserValidator, validate, utilisateurController.signup); // Public signup
router.post('/forgot-password', forgotPasswordValidator, validate, utilisateurController.forgotPassword); // Public - request admin approval
router.post('/reset-password', resetPasswordValidator, validate, utilisateurController.resetPassword); // Public - reset password after approval
router.get('/password-reset-status/:email', utilisateurController.checkPasswordResetStatus); // Public - check request status
router.get('/profile', auth, utilisateurController.getProfile); // Get current user profile
router.put('/profile', auth, utilisateurController.updateProfile); // Update current user profile

// ADMIN only routes - SPECIFIC ROUTES FIRST
router.post('/', auth, authorize('ADMIN'), createUserValidator, validate, utilisateurController.createUtilisateur); // ADMIN only
router.get('/', auth, authorize('ADMIN'), utilisateurController.getAllUtilisateurs); // ADMIN only

// Password reset request management (Admin only) - MUST BE BEFORE /:id ROUTES
router.get('/password-reset-requests', auth, authorize('ADMIN'), utilisateurController.getPasswordResetRequests); // Get all pending requests
router.get('/password-reset-requests-test', auth, authorize('ADMIN'), utilisateurController.testPasswordResetRequests); // Test endpoint
router.patch('/password-reset-requests/:requestId/approve', auth, authorize('ADMIN'), utilisateurController.approvePasswordReset); // Approve request
router.patch('/password-reset-requests/:requestId/reject', auth, authorize('ADMIN'), utilisateurController.rejectPasswordReset); // Reject request

// SSI and RSSI can get user info without emails - MUST BE BEFORE /:id ROUTES
router.get('/public', auth, authorize('RSSI', 'SSI'), utilisateurController.getPublicUserInfo); // Get users without emails
router.get('/public/:id', auth, authorize('RSSI', 'SSI'), utilisateurController.getPublicUserInfoById); // Get specific user without email

// PARAMETERIZED ROUTES LAST
router.get('/:id', auth, authorize('ADMIN'), utilisateurController.getUtilisateurById); // ADMIN only
router.put('/:id', auth, authorize('ADMIN'), utilisateurController.updateUtilisateur); // ADMIN only
router.delete('/:id', auth, authorize('ADMIN'), utilisateurController.deleteUtilisateur); // ADMIN only
router.patch('/:id/approve', auth, authorize('ADMIN'), utilisateurController.approveUser); // ADMIN approves user

module.exports = router; 