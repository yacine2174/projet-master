/**
 * Comprehensive Email Validation Utility
 * Validates email format, domain, and common patterns
 */

// Enhanced email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains (can be expanded)
const DISPOSABLE_DOMAINS = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'throwaway.email'
];

// Common valid email domains
const VALID_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'mail.com'
];

/**
 * Comprehensive email validation
 * @param {string} email - Email to validate
 * @returns {object} - Validation result with isValid and message
 */
const validateEmail = (email) => {
  // Basic checks
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required and must be a string' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check if empty after trimming
  if (trimmedEmail === '') {
    return { isValid: false, message: 'Email cannot be empty' };
  }

  // Check length
  if (trimmedEmail.length > 254) {
    return { isValid: false, message: 'Email is too long (maximum 254 characters)' };
  }

  // Check for invalid characters
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  // Split email into local and domain parts
  const [localPart, domain] = trimmedEmail.split('@');

  // Validate local part
  if (!localPart || localPart.length === 0) {
    return { isValid: false, message: 'Email local part is missing' };
  }

  if (localPart.length > 64) {
    return { isValid: false, message: 'Email local part is too long (maximum 64 characters)' };
  }

  // Check for consecutive dots in local part
  if (localPart.includes('..')) {
    return { isValid: false, message: 'Email local part cannot contain consecutive dots' };
  }

  // Check if local part starts or ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: 'Email local part cannot start or end with a dot' };
  }

  // Validate domain
  if (!domain || domain.length === 0) {
    return { isValid: false, message: 'Email domain is missing' };
  }

  if (domain.length > 253) {
    return { isValid: false, message: 'Email domain is too long (maximum 253 characters)' };
  }

  // Check for consecutive dots in domain
  if (domain.includes('..')) {
    return { isValid: false, message: 'Email domain cannot contain consecutive dots' };
  }

  // Check if domain starts or ends with dot
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, message: 'Email domain cannot start or end with a dot' };
  }

  // Check for valid TLD (at least 2 characters after last dot)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, message: 'Email domain must have a valid TLD' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, message: 'Email TLD must be at least 2 characters' };
  }

  // Check for disposable email domains (optional - can be disabled)
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { isValid: false, message: 'Disposable email addresses are not allowed' };
  }

  // Check for common valid domains (optional - can be used for additional validation)
  const isCommonDomain = VALID_DOMAINS.includes(domain);
  
  return { 
    isValid: true, 
    message: 'Email is valid',
    isCommonDomain,
    domain,
    localPart
  };
};

/**
 * Check if email exists in database
 * @param {string} email - Email to check
 * @param {object} utilisateurRepository - User repository instance
 * @returns {Promise<boolean>} - True if email exists
 */
const emailExists = async (email, utilisateurRepository) => {
  try {
    if (!email || !utilisateurRepository) {
      return false;
    }
    
    const trimmedEmail = email.trim().toLowerCase();
    return await utilisateurRepository.emailExists(trimmedEmail);
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
};

/**
 * Validate email for password reset
 * @param {string} email - Email to validate
 * @param {object} utilisateurRepository - User repository instance
 * @returns {Promise<object>} - Validation result
 */
const validateEmailForPasswordReset = async (email, utilisateurRepository) => {
  // First validate email format
  const formatValidation = validateEmail(email);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // Then check if email exists in database
  const exists = await emailExists(email, utilisateurRepository);
  if (!exists) {
    return { 
      isValid: false, 
      message: 'No account found with this email address' 
    };
  }

  return { 
    isValid: true, 
    message: 'Email is valid and account exists',
    email: email.trim().toLowerCase()
  };
};

module.exports = {
  validateEmail,
  emailExists,
  validateEmailForPasswordReset,
  EMAIL_REGEX,
  DISPOSABLE_DOMAINS,
  VALID_DOMAINS
};
