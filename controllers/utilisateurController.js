const utilisateurRepository = require('../repositories/utilisateurRepository');
const jwt = require('jsonwebtoken');
const config = require('../config');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { validateEmailForPasswordReset } = require('../utils/emailValidator');

const getAllUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await utilisateurRepository.findAll();
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUtilisateur = async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const emailExists = await utilisateurRepository.emailExists(req.body.email);
    if (emailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Prevent creating admin accounts through this function
    if (req.body.role === 'ADMIN') {
      return res.status(403).json({ 
        message: 'Les comptes administrateur ne peuvent pas être créés via cette fonction' 
      });
    }

    let userData = { ...req.body };
    
    // Ensure consistent field naming - always use motDePasse
    if (userData.password) {
      userData.motDePasse = userData.password;
      delete userData.password;
    }
    
    // Set status based on role (no more admin creation)
    if (userData.role === 'RSSI') {
      userData.status = 'approved'; // RSSI users are auto-approved by admin
    } else {
      userData.status = 'pending'; // SSI users need admin approval
    }

    const utilisateur = await utilisateurRepository.create(userData);
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      utilisateur
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await utilisateurRepository.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUtilisateur = async (req, res) => {
  try {
    // Check if trying to update the permanent admin
    const existingUser = await utilisateurRepository.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    // Prevent modification of permanent admin
    if (existingUser.email === 'admin@audit.com') {
      return res.status(403).json({ 
        message: 'Le compte administrateur permanent ne peut pas être modifié' 
      });
    }
    
    const utilisateur = await utilisateurRepository.updateById(req.params.id, req.body);
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUtilisateur = async (req, res) => {
  try {
    // Check if trying to delete the permanent admin
    const existingUser = await utilisateurRepository.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    // Prevent deletion of permanent admin
    if (existingUser.email === 'admin@audit.com') {
      return res.status(403).json({ 
        message: 'Le compte administrateur permanent ne peut pas être supprimé' 
      });
    }
    
    const utilisateur = await utilisateurRepository.deleteById(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const signup = async (req, res) => {
  try {
    console.log('🔄 Signup attempt with data:', req.body);
    
    const emailExists = await utilisateurRepository.emailExists(req.body.email);
    if (emailExists) {
      console.log('❌ Email already exists:', req.body.email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Prevent creating admin accounts through signup
    if (req.body.role === 'ADMIN') {
      console.log('❌ Admin creation blocked');
      return res.status(403).json({ 
        message: 'Les comptes administrateur ne peuvent pas être créés via l\'inscription publique' 
      });
    }
    
    let userData = { ...req.body };
    console.log('📋 Processed user data:', userData);
    
    // Ensure consistent field naming - always use motDePasse
    if (userData.password) {
      userData.motDePasse = userData.password;
      delete userData.password;
    }
    
    // For public signup, ALL users start as pending (needs admin approval)
    userData.status = 'pending';
    console.log('✅ Final user data before creation:', userData);
    
    const utilisateur = await utilisateurRepository.create(userData);
    console.log('✅ User created successfully:', utilisateur._id);
    
    res.status(201).json({
      message: 'Inscription réussie. Votre compte est en attente d\'approbation par l\'administrateur.',
      utilisateur
    });
  } catch (err) {
    console.error('💥 Signup error:', err);
    console.error('Error message:', err.message);
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, motDePasse, password } = req.body;
    // Ensure consistent field naming - prefer motDePasse, fallback to password
    const userPassword = motDePasse || password;
    
    if (!email || !userPassword) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    const utilisateur = await utilisateurRepository.authenticate(email, userPassword);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    // Admin users can always log in regardless of status
    // Only RSSI and SSI users need approval
    if (utilisateur.role !== 'ADMIN' && utilisateur.status !== 'approved') {
      return res.status(403).json({ message: "Votre compte est en attente d'approbation par l'admin." });
    }
    const token = jwt.sign(
      { 
        userId: utilisateur._id, 
        email: utilisateur.email, 
        role: utilisateur.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        status: utilisateur.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password - requires authentication
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const utilisateur = await utilisateurRepository.changePassword(req.params.id, newPassword);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUtilisateursByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const utilisateurs = await utilisateurRepository.findByRole(role);
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRSSI = async (req, res) => {
  try {
    const rssi = await utilisateurRepository.findRSSI();
    res.json(rssi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSSI = async (req, res) => {
  try {
    const ssi = await utilisateurRepository.findSSI();
    res.json(ssi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUtilisateurWithAudits = async (req, res) => {
  try {
    const utilisateur = await utilisateurRepository.findWithAudits(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentUtilisateurs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const utilisateurs = await utilisateurRepository.findRecent(limit);
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkPermission = async (req, res) => {
  try {
    const { userId, requiredRole } = req.body;
    const hasPermission = await utilisateurRepository.hasPermission(userId, requiredRole);
    res.json({ hasPermission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const utilisateur = await utilisateurRepository.updateById(req.params.id, { status: 'approved' });
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur approuvé', utilisateur });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get public user info (without email) for SSI and RSSI
const getPublicUserInfo = async (req, res) => {
  try {
    const utilisateurs = await utilisateurRepository.findPublicInfo();
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get specific user public info (without email) for SSI and RSSI
const getPublicUserInfoById = async (req, res) => {
  try {
    const utilisateur = await utilisateurRepository.findPublicInfoById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user profile (requires authentication)
const getProfile = async (req, res) => {
  try {
    // The user object is already populated by auth middleware
    // Just return it (password is already excluded by the middleware)
    if (!req.user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user's own profile (name and email only)
const updateProfile = async (req, res) => {
  try {
    const { nom, email } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!nom || !nom.trim()) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'L\'email est requis' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Check if the new email is already used by another user
    if (email !== req.user.email) {
      const emailExists = await utilisateurRepository.emailExists(email);
      if (emailExists) {
        const existingUser = await utilisateurRepository.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
        }
      }
    }

    // Only allow updating name and email
    const updateData = {
      nom: nom.trim(),
      email: email.trim()
    };

    const updatedUser = await utilisateurRepository.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password - request admin approval
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Enhanced email validation
    const emailValidation = await validateEmailForPasswordReset(email, utilisateurRepository);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const validatedEmail = emailValidation.email;

    // Find the user
    const user = await utilisateurRepository.findByEmail(validatedEmail);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Check if there's already a pending or approved request
    const existingRequest = await PasswordResetRequest.findActiveRequest(user._id);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ 
          message: 'Une demande de réinitialisation de mot de passe est déjà en attente d\'approbation.' 
        });
      } else if (existingRequest.status === 'approved') {
        return res.status(400).json({ 
          message: 'Votre demande a été approuvée. Vous pouvez maintenant changer votre mot de passe.' 
        });
      }
    }

    // Create new password reset request
    const resetRequest = new PasswordResetRequest({
      userId: user._id,
      userEmail: validatedEmail,
      userName: user.nom,
      userRole: user.role,
      status: 'pending'
    });
    await resetRequest.save();

    res.json({ 
      message: 'Votre demande de réinitialisation de mot de passe a été envoyée à l\'administrateur pour approbation.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Erreur lors du traitement de la demande' });
  }
};

// Reset password - after admin approval
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Enhanced email validation
    const emailValidation = await validateEmailForPasswordReset(email, utilisateurRepository);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const validatedEmail = emailValidation.email;

    // Find the user
    const user = await utilisateurRepository.findByEmail(validatedEmail);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Check if there's an approved request
    const approvedRequest = await PasswordResetRequest.findOne({
      userId: user._id,
      status: 'approved',
      expiresAt: { $gt: new Date() }
    });

    if (!approvedRequest) {
      return res.status(400).json({ 
        message: 'Aucune demande approuvée trouvée. Veuillez demander une réinitialisation de mot de passe.' 
      });
    }

    // Update user password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const updatedUser = await utilisateurRepository.updateByEmail(validatedEmail, { motDePasse: hashedPassword });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mark request as completed
    await approvedRequest.complete();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

// Get all password reset requests (Admin only)
const getPasswordResetRequests = async (req, res) => {
  try {
    console.log('🔄 Getting password reset requests...');
    
    // First try to get all requests (not just pending)
    const requests = await PasswordResetRequest.findAllRequests();
    console.log(`✅ Found ${requests.length} password reset requests`);
    
    res.json(requests);
  } catch (err) {
    console.error('💥 Get password reset requests error:', err);
    
    // If there's an ObjectId casting error, try without populate
    if (err.message && err.message.includes('Cast to ObjectId failed')) {
      try {
        console.log('🔄 Retrying without populate due to ObjectId error...');
        const requests = await PasswordResetRequest.find({}).sort({ requestedAt: -1 }).lean();
        console.log(`✅ Found ${requests.length} password reset requests (without populate)`);
        res.json(requests);
        return;
      } catch (retryErr) {
        console.error('💥 Retry failed:', retryErr);
      }
    }
    
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes' });
  }
};

// Approve password reset request (Admin only)
const approvePasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;

    const request = await PasswordResetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cette demande ne peut plus être approuvée' });
    }

    await request.approve(req.user.userId, notes);

    res.json({ 
      message: 'Demande de réinitialisation de mot de passe approuvée',
      request
    });
  } catch (err) {
    console.error('Approve password reset error:', err);
    res.status(500).json({ message: 'Erreur lors de l\'approbation de la demande' });
  }
};

// Reject password reset request (Admin only)
const rejectPasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;

    const request = await PasswordResetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cette demande ne peut plus être rejetée' });
    }

    await request.reject(req.user.userId, notes);

    res.json({ 
      message: 'Demande de réinitialisation de mot de passe rejetée',
      request
    });
  } catch (err) {
    console.error('Reject password reset error:', err);
    res.status(500).json({ message: 'Erreur lors du rejet de la demande' });
  }
};

// Check password reset request status (for users)
const checkPasswordResetStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await utilisateurRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const request = await PasswordResetRequest.findActiveRequest(user._id);
    
    if (!request) {
      return res.json({ status: 'none', message: 'Aucune demande active' });
    }

    res.json({ 
      status: request.status,
      requestedAt: request.requestedAt,
      approvedAt: request.approvedAt,
      adminNotes: request.adminNotes
    });
  } catch (err) {
    console.error('Check password reset status error:', err);
    res.status(500).json({ message: 'Erreur lors de la vérification du statut' });
  }
};

// Test endpoint to check password reset requests collection
const testPasswordResetRequests = async (req, res) => {
  try {
    console.log('🔄 Testing password reset requests collection...');
    
    // Check if collection exists and count documents
    const count = await PasswordResetRequest.countDocuments();
    console.log(`📊 Password reset requests count: ${count}`);
    
    // Try to get one document without populate
    const sample = await PasswordResetRequest.findOne({}).lean();
    console.log('📋 Sample document:', sample);
    
    res.json({ 
      message: 'Password reset requests collection test',
      count,
      sample: sample ? {
        _id: sample._id,
        userEmail: sample.userEmail,
        userName: sample.userName,
        status: sample.status,
        requestedAt: sample.requestedAt
      } : null
    });
  } catch (err) {
    console.error('💥 Test password reset requests error:', err);
    res.status(500).json({ 
      message: 'Erreur lors du test de la collection',
      error: err.message 
    });
  }
};

module.exports = {
  getAllUtilisateurs,
  createUtilisateur,
  getUtilisateurById,
  updateUtilisateur,
  deleteUtilisateur,
  login,
  signup,
  changePassword,
  getUtilisateursByRole,
  getRSSI,
  getSSI,
  getUtilisateurWithAudits,
  getRecentUtilisateurs,
  checkPermission,
  approveUser,
  getPublicUserInfo,
  getPublicUserInfoById,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getPasswordResetRequests,
  approvePasswordReset,
  rejectPasswordReset,
  checkPasswordResetStatus,
  testPasswordResetRequests
}; 