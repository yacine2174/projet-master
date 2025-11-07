const mongoose = require('mongoose');

/**
 * Utilisateur (User) Schema
 * 
 * IMPORTANT: Field names are FIXED and should not be changed to maintain API consistency.
 * See API_SCHEMA.md for complete documentation.
 */
const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },                    // Last name - FIXED
  email: { type: String, required: true, unique: true },    // Email - FIXED
  motDePasse: { type: String, required: true },             // Password - FIXED (always hashed)
  role: { type: String, enum: ['RSSI', 'SSI', 'ADMIN'], required: true },  // Role - FIXED
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }  // Status - FIXED
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

const bcrypt = require('bcryptjs');
utilisateurSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema); 