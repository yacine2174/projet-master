const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['RSSI', 'SSI', 'ADMIN'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  completedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true
  },
  // Auto-delete after 7 days
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
passwordResetRequestSchema.index({ status: 1, requestedAt: -1 });
passwordResetRequestSchema.index({ userEmail: 1, status: 1 });

// Method to approve request
passwordResetRequestSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

// Method to reject request
passwordResetRequestSchema.methods.reject = function(adminId, notes = '') {
  this.status = 'rejected';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

// Method to mark as completed
passwordResetRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to find pending requests
passwordResetRequestSchema.statics.findPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('userId', 'nom email role')
    .populate('approvedBy', 'nom email')
    .sort({ requestedAt: -1 })
    .lean(); // Use lean() to avoid mongoose document overhead
};

// Static method to find all requests (for admin panel)
passwordResetRequestSchema.statics.findAllRequests = function() {
  return this.find({})
    .populate('userId', 'nom email role')
    .populate('approvedBy', 'nom email')
    .sort({ requestedAt: -1 })
    .lean();
};

// Static method to find requests by user
passwordResetRequestSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('approvedBy', 'nom email')
    .sort({ requestedAt: -1 });
};

// Static method to find active request for user
passwordResetRequestSchema.statics.findActiveRequest = function(userId) {
  return this.findOne({ 
    userId, 
    status: { $in: ['pending', 'approved'] },
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
