const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const config = require('../config');

module.exports = async (req, res, next) => {
  // Check if this is an AJAX request to prevent browser auth dialog
  const isAjaxRequest = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
  
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Don't send WWW-Authenticate header for AJAX requests
    if (isAjaxRequest) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await Utilisateur.findById(decoded.userId).select('-motDePasse');
    if (!req.user) throw new Error();
    next();
  } catch {
    // Don't send WWW-Authenticate header for AJAX requests
    if (isAjaxRequest) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(401).json({ message: 'Token invalide' });
  }
};