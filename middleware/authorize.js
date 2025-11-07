module.exports = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  
  // Check if user's role is included in the allowed roles
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  
  next();
}; 