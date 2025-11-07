# API Schema Documentation

## Overview
This document defines the complete schema for all entities and attributes in the audit system backend. All field names are **FIXED** and should not be changed to maintain API consistency.

## Database Models

### 1. Utilisateur (User) Model

**Collection Name:** `utilisateurs`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  nom: String,             // REQUIRED - User's last name
  email: String,           // REQUIRED, UNIQUE - User's email address (validated format)
  motDePasse: String,      // REQUIRED - Hashed password (never returned in queries)
  role: String,            // REQUIRED - Enum: ['RSSI', 'SSI', 'ADMIN']
  status: String,          // DEFAULT: 'pending' - Enum: ['pending', 'approved', 'rejected']
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated timestamp
}
```

**Email Validation Rules:**
- ✅ Must be a valid email format (RFC 5322 compliant)
- ✅ Maximum 254 characters total
- ✅ Local part maximum 64 characters
- ✅ Domain maximum 253 characters
- ✅ No consecutive dots (..)
- ✅ Cannot start or end with dots
- ✅ Must have valid TLD (at least 2 characters)
- ❌ Disposable email domains are blocked
- ✅ Common domains are preferred (Gmail, Yahoo, Outlook, etc.)

**Field Constraints:**
- `email`: Must be unique, case-insensitive search
- `motDePasse`: Always hashed with bcrypt (salt rounds: 10)
- `role`: Only accepts 'RSSI', 'SSI', or 'ADMIN'
- `status`: Only accepts 'pending', 'approved', or 'rejected'

**Security Notes:**
- `motDePasse` is automatically excluded from all queries using `.select('-motDePasse')`
- Password is automatically hashed before saving using mongoose pre-save hook

### 2. PasswordResetRequest Model

**Collection Name:** `passwordresetrequests`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  userId: ObjectId,        // REQUIRED - Reference to user
  userEmail: String,       // REQUIRED - User's email (lowercase, trimmed)
  userName: String,        // REQUIRED - User's name
  userRole: String,        // REQUIRED - User's role (RSSI, SSI, ADMIN)
  status: String,          // DEFAULT: 'pending' - Enum: ['pending', 'approved', 'rejected', 'completed']
  requestedAt: Date,       // Auto-generated timestamp
  approvedAt: Date,        // When admin approved/rejected
  approvedBy: ObjectId,    // Reference to admin who approved/rejected
  completedAt: Date,       // When user completed password change
  adminNotes: String,      // Optional admin notes
  expiresAt: Date          // Auto-delete after 7 days
}
```

**Field Constraints:**
- `userEmail`: Stored in lowercase, trimmed
- `status`: Tracks the approval workflow
- `expiresAt`: Automatically deletes old requests using TTL index

**Security Notes:**
- Admin approval required for password reset
- Requests expire after 7 days
- Full audit trail of approvals and rejections

## API Endpoints

### Authentication Endpoints

#### POST `/api/utilisateurs/login`
**Request Body:**
```javascript
{
  email: String,           // REQUIRED - User's email
  motDePasse: String       // REQUIRED - User's password (or 'password' field accepted)
}
```

**Response:**
```javascript
{
  message: String,         // Success message
  token: String,           // JWT token
  utilisateur: {
    id: String,            // User ID
    nom: String,           // Last name
    email: String,         // Email
    role: String,          // User role
    status: String         // Account status
  }
}
```

#### POST `/api/utilisateurs/signup`
**Request Body:**
```javascript
{
  nom: String,             // REQUIRED - Last name
  email: String,           // REQUIRED - Email address
  motDePasse: String,      // REQUIRED - Password (or 'password' field accepted)
  role: String             // REQUIRED - User role
}
```

**Response:**
```javascript
{
  message: String,         // Success message
  utilisateur: {
    _id: String,           // User ID
    nom: String,           // Last name
    email: String,         // Email
    role: String,          // User role
    status: String         // Account status (always 'pending' for signup)
  }
}
```

#### POST `/api/utilisateurs/forgot-password`
**Request Body:**
```javascript
{
  email: String            // REQUIRED - Valid email address (must exist in database)
}
```

**Validation:**
- ✅ Email format validation (RFC 5322 compliant)
- ✅ Email must exist in database
- ✅ Disposable email domains blocked
- ✅ Maximum length and format checks

**Response:**
```javascript
{
  message: String          // Success message
}
```

**Error Responses:**
```javascript
{
  message: "Invalid email format"           // Invalid email format
}
{
  message: "No account found with this email address"  // Email doesn't exist
}
{
  message: "Une demande de réinitialisation de mot de passe est déjà en attente d'approbation."  // Already pending
}
```

#### POST `/api/utilisateurs/reset-password`
**Request Body:**
```javascript
{
  email: String,           // REQUIRED - User's email address
  newPassword: String      // REQUIRED - New password (min 8 characters)
}
```

**Response:**
```javascript
{
  message: String          // Success message
}
```

**Error Responses:**
```javascript
{
  message: "Aucune demande approuvée trouvée. Veuillez demander une réinitialisation de mot de passe."  // No approved request
}
```

### User Management Endpoints

#### GET `/api/utilisateurs/profile`
**Headers:**
```javascript
Authorization: Bearer <jwt_token>
```

**Response:**
```javascript
{
  _id: String,             // User ID
  nom: String,             // Last name
  email: String,           // Email
  role: String,            // User role
  status: String           // Account status
}
```

#### GET `/api/utilisateurs` (Admin Only)
**Headers:**
```javascript
Authorization: Bearer <jwt_token>
```

**Response:**
```javascript
[
  {
    _id: String,           // User ID
    nom: String,           // Last name
    email: String,         // Email
    role: String,          // User role
    status: String         // Account status
  }
]
```

#### POST `/api/utilisateurs` (Admin Only)
**Request Body:**
```javascript
{
  nom: String,             // REQUIRED - Last name
  email: String,           // REQUIRED - Email address
  motDePasse: String,      // REQUIRED - Password (or 'password' field accepted)
  role: String             // REQUIRED - User role
}
```

#### PATCH `/api/utilisateurs/:id/approve` (Admin Only)
**Response:**
```javascript
{
  message: String,         // Success message
  utilisateur: {
    _id: String,           // User ID
    nom: String,           // Last name
    email: String,         // Email
    role: String,          // User role
    status: String         // Account status (now 'approved')
  }
}
```

#### GET `/api/utilisateurs/password-reset-requests` (Admin Only)
**Response:**
```javascript
[
  {
    _id: String,           // Request ID
    userId: Object,        // User object
    userEmail: String,     // User's email
    userName: String,      // User's name
    userRole: String,      // User's role
    status: String,        // Request status
    requestedAt: Date,     // When requested
    approvedAt: Date,      // When approved/rejected
    approvedBy: Object,    // Admin who approved/rejected
    adminNotes: String     // Admin notes
  }
]
```

#### PATCH `/api/utilisateurs/password-reset-requests/:requestId/approve` (Admin Only)
**Request Body:**
```javascript
{
  notes: String            // Optional admin notes
}
```

**Response:**
```javascript
{
  message: String,         // Success message
  request: Object          // Updated request object
}
```

#### PATCH `/api/utilisateurs/password-reset-requests/:requestId/reject` (Admin Only)
**Request Body:**
```javascript
{
  notes: String            // Optional admin notes
}
```

**Response:**
```javascript
{
  message: String,         // Success message
  request: Object          // Updated request object
}
```

#### GET `/api/utilisateurs/password-reset-status/:email` (Public)
**Response:**
```javascript
{
  status: String,          // 'none', 'pending', 'approved', 'rejected', 'completed'
  requestedAt: Date,       // When requested
  approvedAt: Date,        // When approved/rejected
  adminNotes: String       // Admin notes
}
```

## Field Name Consistency Rules

### 1. Password Field Handling
- **Database Field:** Always `motDePasse`
- **API Input:** Accepts both `motDePasse` and `password` for backward compatibility
- **API Output:** Never returns password field
- **Internal Processing:** Always converts to `motDePasse` before database operations

### 2. Email Field Handling
- **Database Storage:** Always lowercase and trimmed
- **API Input:** Case-insensitive matching
- **API Output:** Returns as stored (lowercase)

### 3. Role Field Constraints
- **Valid Values:** `'RSSI'`, `'SSI'`, `'ADMIN'`
- **Case Sensitivity:** Exact match required
- **Default:** No default value (required field)

### 4. Status Field Constraints
- **Valid Values:** `'pending'`, `'approved'`, `'rejected'`
- **Default:** `'pending'` for new users
- **Auto-approval:** `'ADMIN'` and `'RSSI'` roles are auto-approved

## Security Considerations

### 1. Password Security
- All passwords are hashed using bcrypt with 10 salt rounds
- Password field is automatically excluded from all queries
- Password reset tokens are hashed before storage

### 2. Email Security
- Password reset emails don't reveal if email exists
- Reset tokens expire after 24 hours
- Reset tokens can only be used once

### 3. Authentication
- JWT tokens are used for authentication
- Tokens include user ID, email, and role
- Tokens expire based on configuration

## Migration Notes

### Breaking Changes
- None planned - all field names are stable
- Backward compatibility maintained for password field names

### Future Considerations
- All new fields should follow existing naming conventions
- French field names should be maintained for consistency
- Database indexes should be considered for performance

## Validation Rules

### Email Validation
- Must be valid email format
- Must be unique in database
- Case-insensitive matching

### Password Validation
- Minimum 6 characters for reset
- Minimum 8 characters for new accounts (configurable)
- Must contain at least one letter and one number

### Role Validation
- Must be one of: 'RSSI', 'SSI', 'ADMIN'
- Case-sensitive matching

### Status Validation
- Must be one of: 'pending', 'approved', 'rejected'
- Case-sensitive matching
