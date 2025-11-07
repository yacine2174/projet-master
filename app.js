require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const auditRoutes = require('./routes/auditRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const constatRoutes = require('./routes/constatRoutes');
const recommandationRoutes = require('./routes/recommandationRoutes');
const planActionRoutes = require('./routes/planActionRoutes');
const preuveRoutes = require('./routes/preuveRoutes');
const normesRoutes = require('./routes/normesRoutes');
const projetRoutes = require('./routes/projetRoutes');
const swotRoutes = require('./routes/swotRoutes');
const conceptionRoutes = require('./routes/conceptionRoutes');
const risquesRoutes = require('./routes/risquesRoutes');
const pasRoutes = require('./routes/pasRoutes');
const securiteProjetRoutes = require('./routes/securiteProjetRoutes');
const errorHandler = require('./middleware/errorHandler');

// Create the app
const app = express();

// Security and CORS middleware
app.use(helmet());

// Dynamic CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3001', 
  'http://127.0.0.1:3001',
  'http://192.168.1.12:3001',     // Network IP
  'http://192.168.100.244:3001',  // Your actual network IP
  'http://192.168.100.245:3001',  // Other devices on network
  'http://192.168.100.246:3001',  // Additional network devices
  'http://192.168.1.132:3001',    // Previous frontend IP
  'http://192.168.1.70:3001'      // User's current frontend IP
];

// Add production frontend URL from environment variable
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel/Render patterns
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.endsWith('.vercel.app') || 
        origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware to parse JSON
app.use(express.json());

// Middleware to prevent browser auth dialog for AJAX requests
app.use((req, res, next) => {
  // Check if this is an AJAX request
  const isAjaxRequest = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
  
  if (isAjaxRequest) {
    // Override res.status to remove WWW-Authenticate header for 401 responses
    const originalStatus = res.status.bind(res);
    res.status = function(code) {
      if (code === 401) {
        // Remove WWW-Authenticate header to prevent browser auth dialog
        res.removeHeader('WWW-Authenticate');
      }
      return originalStatus(code);
    };
  }
  
  next();
});

// Routes
app.use('/api/audits', auditRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/constats', constatRoutes);
app.use('/api/recommandations', recommandationRoutes);
app.use('/api/plans-action', planActionRoutes);
app.use('/api/preuves', preuveRoutes);
app.use('/api/normes', normesRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/swots', swotRoutes);
app.use('/api/conceptions', conceptionRoutes);
app.use('/api/risques', risquesRoutes);
app.use('/api/pas', pasRoutes);
app.use('/api/securite-projets', securiteProjetRoutes);
app.use(errorHandler);
// (Swagger setup removed)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    const HOST = '0.0.0.0'; // Listen on all network interfaces
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on:`);
      console.log(`  - Local:   http://localhost:${PORT}`);
      console.log(`  - Network: http://192.168.1.12:${PORT}`);
    });
    
    // Handle port already in use error
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Server may already be running.`);
        process.exit(0);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// (Optional) Global error handler can be added here
