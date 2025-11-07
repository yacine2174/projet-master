// Configuration for different environments
export const config = {
  // Development environment
  development: {
    apiBaseUrl: '/api',  // Using Vite proxy
    frontendUrl: 'http://192.168.1.12:3001'
  },
  
  // Production/Network environment
  production: {
    apiBaseUrl: 'https://projet-master-90u5.onrender.com/api',
    frontendUrl: process.env.VITE_FRONTEND_URL || 'https://your-vercel-app.vercel.app'
  },
  
  // Test environment
  test: {
    apiBaseUrl: 'http://192.168.1.12:3000/api',
    frontendUrl: 'http://192.168.1.12:3001'
  }
};

// Get current environment
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Export current config
export const currentConfig = config[environment as keyof typeof config];

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/utilisateurs/login',
  SIGNUP: '/utilisateurs/signup',
  FORGOT_PASSWORD: '/utilisateurs/forgot-password',
  RESET_PASSWORD: '/utilisateurs/reset-password',
  GET_USERS: '/utilisateurs',
  UPDATE_USER: '/utilisateurs',
  DELETE_USER: '/utilisateurs',
  GET_PASSWORD_RESET_REQUESTS: '/utilisateurs/password-reset-requests',
  APPROVE_PASSWORD_RESET: '/utilisateurs/approve-password-reset',
  REJECT_PASSWORD_RESET: '/utilisateurs/reject-password-reset',
  
  // Audit Management
  GET_AUDITS: '/audits',
  GET_AUDIT: '/audits',
  CREATE_AUDIT: '/audits',
  UPDATE_AUDIT: '/audits',
  DELETE_AUDIT: '/audits',
  
  // Constats
  GET_CONSTATS: '/constats',
  GET_CONSTAT: '/constats',
  CREATE_CONSTAT: '/constats',
  UPDATE_CONSTAT: '/constats',
  DELETE_CONSTAT: '/constats',
  
  // Plan Action
  GET_PLAN_ACTIONS: '/plan-actions',
  GET_PLAN_ACTION: '/plan-actions',
  CREATE_PLAN_ACTION: '/plan-actions',
  UPDATE_PLAN_ACTION: '/plan-actions',
  DELETE_PLAN_ACTION: '/plan-actions',
  
  // Projects
  GET_PROJECTS: '/projets',
  GET_PROJECT: '/projets',
  CREATE_PROJECT: '/projets',
  UPDATE_PROJECT: '/projets',
  DELETE_PROJECT: '/projets',
  
  // SWOT Analysis
  GET_SWOT: '/swot',
  CREATE_SWOT: '/swot',
  UPDATE_SWOT: '/swot',
  
  // Risk Analysis
  GET_RISKS: '/risques',
  CREATE_RISK: '/risques',
  UPDATE_RISK: '/risques',
  DELETE_RISK: '/risques',
  
  // Conception
  GET_CONCEPTIONS: '/conceptions',
  CREATE_CONCEPTION: '/conceptions',
  UPDATE_CONCEPTION: '/conceptions',
  VALIDATE_CONCEPTION: '/conceptions/validate',
  
  // Normes
  GET_NORMES: '/normes',
  GET_NORME: '/normes',
  CREATE_NORME: '/normes',
  UPDATE_NORME: '/normes',
  ASSIGN_NORME: '/normes',
  
  // Recommendations
  GET_RECOMMENDATIONS: '/recommandations',
  GET_RECOMMENDATION: '/recommandations',
  CREATE_RECOMMENDATION: '/recommandations',
  UPDATE_RECOMMENDATION: '/recommandations',
  DELETE_RECOMMENDATION: '/recommandations',
  
  // Evidence/Preuves
  GET_PREUVES: '/preuves',
  GET_PREUVE: '/preuves',
  CREATE_PREUVE: '/preuves',
  UPDATE_PREUVE: '/preuves',
  DELETE_PREUVE: '/preuves',
  UPLOAD_PREUVE: '/preuves/upload',
  GET_PREUVES_BY_AUDIT: '/preuves/audit'
};

// Network configuration
export const NETWORK_CONFIG = {
  // CORS settings
  cors: {
    origin: [currentConfig.frontendUrl, 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://192.168.1.132:3001'],
    credentials: true
  },
  
  // Timeout settings
  timeout: 10000, // 10 seconds
  
  // Retry settings
  retry: {
    attempts: 3,
    delay: 1000
  }
};

// Security settings
export const SECURITY_CONFIG = {
  // Token settings
  token: {
    storageKey: 'authToken',
    expirationCheck: true,
    refreshThreshold: 5 * 60 * 1000 // 5 minutes
  },
  
  // Password requirements
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  }
};
