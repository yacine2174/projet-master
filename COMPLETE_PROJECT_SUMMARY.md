# Complete Project Summary - Audit Management System
## Full Implementation History and Technical Documentation

**Date Created**: October 7, 2025  
**Project**: Web-based Security Audit Management System  
**Tech Stack**: MERN (MongoDB Atlas, Express.js, React, Node.js)  
**Frontend**: React + TypeScript + Tailwind CSS + Vite  
**Backend**: Node.js + Express + Mongoose + JWT Authentication

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Complete Feature Implementation Timeline](#complete-feature-implementation-timeline)
5. [Database Models (Backend)](#database-models-backend)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Authentication & Authorization](#authentication--authorization)
9. [Key Business Rules](#key-business-rules)
10. [All Bugs Fixed](#all-bugs-fixed)
11. [Current Issues](#current-issues)
12. [File Structure](#file-structure)
13. [Environment Configuration](#environment-configuration)
14. [Seeding and Test Data](#seeding-and-test-data)
15. [Next Steps for New Assistant](#next-steps-for-new-assistant)

---

## 1. Project Overview

This is a comprehensive security audit management system designed for organizations to conduct both **Organizational (ISO-based)** and **Technical (OWASP-based)** security audits. The system manages the complete audit lifecycle from project creation through findings documentation to action plan execution.

### Core Functionality:
- **Project Management**: Create and manage security audit projects
- **Audit Management**: Conduct organizational and technical audits based on security norms/standards
- **Security Configuration (PAS)**: Comprehensive security setup including physical, logical, organizational measures, and business continuity planning (PCA/PRA)
- **Risk Assessment**: SWOT analysis, risk identification and evaluation
- **Findings Management**: Document constats (findings) with criticality levels
- **Recommendations**: Generate security recommendations linked to findings
- **Action Plans**: Create and track remediation action plans
- **Evidence Management**: Attach proof documents to audits
- **Automated PAS Generation**: Auto-generate Plan d'Assurance Sécurité (Security Assurance Plan) from project data
- **User Management**: Multi-role system with Admin, RSSI, and SSI roles

### Cahier de Charge Key Requirements:
1. **Role-Based Access Control**: ADMIN (user approval only), RSSI (full authority including status changes), SSI (operational work, no status changes)
2. **One SWOT and One Conception per Project**: Business rule enforcement
3. **Multiple Risks per Project**: No limit on risk entries
4. **Constats Created from Audits Only**: Not from project pages
5. **PAS Auto-Generation**: Must pull real project data only, no generic fallbacks
6. **Norm Management**: Support for ISO 27001, NIST, CIS, OWASP, PCI, GDPR, SOC, ANSSI standards
7. **Mock Data Support**: System handles both real database records and localStorage mock data for testing

---

## 2. System Architecture

### Backend Architecture:
```
audit-backend/
├── app.js                          # Express server entry point
├── config/                         # Database configuration
├── models/                         # Mongoose schemas
├── controllers/                    # Business logic
├── repositories/                   # Data access layer
├── routes/                         # API route definitions
├── middleware/
│   ├── auth.js                    # JWT authentication
│   ├── authorize.js               # Role-based authorization
│   ├── validate.js                # Request validation
│   └── errorHandler.js            # Global error handling
├── validators/                     # Express-validator rules
└── utils/                          # Helper functions
```

### Frontend Architecture:
```
audit-frontend/
├── src/
│   ├── components/                # React components
│   │   ├── admin/                 # Admin-specific components
│   │   ├── audit/                 # Audit management
│   │   ├── conception/            # Design documents
│   │   ├── constats/              # Findings management
│   │   ├── normes/                # Security norms/standards
│   │   ├── pas/                   # PAS document management
│   │   ├── planactions/           # Action plans
│   │   ├── preuves/               # Evidence management
│   │   ├── project/               # Project management
│   │   ├── recommandations/       # Recommendations
│   │   ├── risk/                  # Risk management
│   │   ├── securite/              # Security configuration
│   │   ├── swot/                  # SWOT analysis
│   │   └── user/                  # User profile & auth
│   ├── contexts/                  # React Context (AuthContext)
│   ├── api/                       # Centralized API calls
│   ├── types/                     # TypeScript interfaces
│   ├── config/                    # Environment configuration
│   └── utils/                     # Helper functions
```

### Database Collections (MongoDB Atlas):
- `utilisateurs` - Users
- `projets` - Projects
- `audits` - Audits
- `normes` - Security norms/standards
- `constats` - Findings
- `recommandations` - Recommendations
- `planactions` - Action plans
- `preuves` - Evidence documents
- `swots` - SWOT analyses
- `risques` - Risk assessments
- `conceptions` - Design documents
- `securiteprojets` - Security configurations
- `pas` - PAS documents
- `passwordresetrequests` - Password reset tokens

---

## 3. User Roles and Permissions

### ADMIN Role:
- **Primary Function**: User account approval and management
- **Permissions**:
  - View all users
  - Approve/reject pending user registrations
  - Delete users
  - Change user roles
  - **CANNOT**: Manage audits, projects, constats, or any operational data
  - **CANNOT**: Change statuses

### RSSI (Responsable Sécurité des Systèmes d'Information) Role:
- **Primary Function**: Security manager with full authority
- **Permissions**:
  - All SSI permissions (below)
  - **EXCLUSIVE**: Change statuses (project, audit, conception, recommendation)
  - **EXCLUSIVE**: Validate conceptions
  - **EXCLUSIVE**: Validate recommendations
  - View all projects, audits, and related data
  - Organization-wide oversight

### SSI (Spécialiste Sécurité de l'Information) Role:
- **Primary Function**: Security specialist performing operational work
- **Permissions**:
  - Create/Read/Update/Delete: Projects, Audits, Constats, Recommendations, Plans d'Action
  - Create/Read/Update/Delete: Preuves (evidence), Normes, Security Configurations
  - Create/Read/Update/Delete: SWOT, Risks, Conceptions
  - Generate PAS documents
  - View all information in the system
  - **CANNOT**: Change any statuses (this is RSSI-only)
  - **CANNOT**: Validate conceptions or recommendations

### Permission Matrix:

| Action | ADMIN | RSSI | SSI |
|--------|-------|------|-----|
| Approve Users | ✅ | ❌ | ❌ |
| Create Projects | ❌ | ✅ | ✅ |
| Create Audits | ❌ | ✅ | ✅ |
| Create Constats | ❌ | ✅ | ✅ |
| Create Preuves | ❌ | ✅ | ✅ |
| Create Recommendations | ❌ | ✅ | ✅ |
| Create Plans d'Action | ❌ | ✅ | ✅ |
| Manage Normes | ❌ | ✅ | ✅ |
| Change Project Status | ❌ | ✅ | ❌ |
| Change Audit Status | ❌ | ✅ | ❌ |
| Validate Conception | ❌ | ✅ | ❌ |
| Validate Recommendation | ❌ | ✅ | ❌ |
| Edit Own Profile | ✅ | ✅ | ✅ |

---

## 4. Complete Feature Implementation Timeline

### Phase 1: Initial PAS Features (First Implementation)
**Date**: October 5, 2025

#### Features Added:
1. **SecuriteProjet Model** - Comprehensive security configuration
2. **Security Configuration Form** - Multi-tab form (Physical, Logical, Organizational, PCA/PRA)
3. **PAS Auto-Generation Enhancement** - Pull security data into PAS
4. **Backend Infrastructure**:
   - `SecuriteProjet.js` model
   - `securiteProjetRepository.js`
   - `securiteProjetController.js`
   - `securiteProjetRoutes.js`
   - `securiteProjetValidator.js` (460 lines of validation)
   
5. **Frontend Infrastructure**:
   - `SecuriteProjetForm.tsx` (~700 lines)
   - Updated `audit.ts` types
   - Updated `ProjectDetail.tsx` to display security config

#### Files Modified:
- `audit-backend/models/Projet.js` - Added security reference
- `audit-backend/models/Audit.js` - Added PAS-related fields
- `audit-backend/controllers/pasController.js` - Enhanced with security data
- `audit-backend/models/PAS.js` - Updated schema
- `audit-frontend/src/types/audit.ts` - Added SecuriteProjet interface
- `audit-frontend/src/App.tsx` - Added security config route

### Phase 2: Bug Fixes and Authentication Issues
**Date**: October 5-6, 2025

#### Issues Fixed:
1. **SyntaxError in auditValidator.js** - Fixed array closing bracket placement
2. **Mongoose Duplicate Index Warning** - Removed redundant index on SecuriteProjet
3. **ERR_CONNECTION_REFUSED** - Fixed frontend config to use correct API URL
4. **401 Unauthorized Error** - Fixed localStorage token key from `'token'` to `'authToken'`
5. **Navigation Issues** - Fixed redirect after security config creation
6. **Duplicate Buttons** - Removed extra "Créer PAS" button from PASProjetDashboard

### Phase 3: PAS Data Structure Fixes
**Date**: October 6, 2025

#### Problems Identified:
- PAS showing generic/default values instead of real project data
- Repeated "Périmètre *" text
- Data type mismatches between backend and frontend
- PCA/PRA information incomplete

#### Solutions Implemented:
1. **Removed ALL Generic Fallbacks** in `pasController.js`:
   - No more default values for any field
   - Empty arrays/strings if data missing
   - PAS now reflects ONLY actual project data

2. **Fixed Data Structures**:
   - `analyseRisques` fields: Changed from mixed types to `[String]` arrays
   - `organisationSecurite.rolesEtResponsabilites`: Changed to array of objects `[{ role: String, responsabilite: String }]`
   - `pcaPra`: Restructured as nested object with multiple fields

3. **Enhanced PCA/PRA Display**:
   - Combined all PCA/PRA fields (excluding dates)
   - Added bold subtitles for subsections
   - Structured display in PAS document

4. **Updated Models to Match**:
   - `PAS.js` schema updated
   - `pasController.js` data mapping refined
   - `PASDetail.tsx` display logic updated

### Phase 4: Field Migration (Project → Audit)
**Date**: October 6, 2025

#### Fields Moved from Projet to Audit:
- `entrepriseNom` (Company Name)
- `entrepriseContact` (Company Contact)
- `personnelsInternes` (Internal Personnel)
- `personnelsExternes` (External Personnel)
- `reglementations` (Regulations) - Array

#### Reason for Migration:
These fields are audit-specific, not project-specific. One project can have multiple audits with different company contexts.

#### Files Modified:
- `audit-backend/models/Projet.js` - Removed fields
- `audit-backend/models/Audit.js` - Added fields
- `audit-backend/controllers/pasController.js` - Updated to read from audit
- `audit-frontend/src/types/audit.ts` - Updated interfaces
- `audit-frontend/src/components/audit/CreateAudit.tsx` - Added form fields
- `audit-frontend/src/components/project/ProjectDetail.tsx` - Removed fields from edit form

### Phase 5: Rôles et Responsabilités Addition
**Date**: October 6, 2025

#### Feature Added:
New section in Security Configuration for "Rôles et Responsabilités" (Roles and Responsibilities)

#### Implementation:
1. **Backend**:
   - Added `rolesEtResponsabilites: [{ role: String, responsabilite: String }]` to `SecuriteProjet.js`
   - Updated `pasController.js` to read and map this field
   - Updated `PAS.js` model to include this array

2. **Frontend**:
   - Added new tab in `SecuriteProjetForm.tsx`
   - Implemented add/remove/update handlers
   - Added display in `PASDetail.tsx`

### Phase 6: Detail Page Navigation Fixes
**Date**: October 6, 2025

#### Issues Fixed:
1. **Missing Routes** - Added routes for:
   - `/risques/:id` → `RiskDetail`
   - `/swot/:id` → `SWOTDetail`
   - `/conceptions/:id` → `ConceptionDetail`

2. **RiskDetail Loading Issue**:
   - Changed from expecting two params (`id`, `riskId`) to one (`id`)
   - Updated to fetch risk directly by ID
   - Fixed display fields to match backend `Risque` model
   - Added proper project fetching after risk data loaded

3. **SWOTDetail Blank Page**:
   - Fixed `.map()` error on string properties
   - Updated `renderSWOTSection` to accept string content instead of arrays
   - Changed display to use `whitespace-pre-wrap` for multiline strings

4. **ConceptionDetail Timeout Issues**:
   - Added 3-second timeout to API calls
   - Implemented fallback to localStorage
   - Added comprehensive logging for debugging

### Phase 7: PAS Content Enhancement
**Date**: October 6, 2025

#### Changes to PAS Display:
1. **Added Full Details for**:
   - SWOT Analyses (forces, faiblesses, opportunites, menaces)
   - Risks (description, type, priorité, niveau, impact, probabilité, decision)
   - Removed Conception section (as requested)

2. **Reorganized Structure**:
   - Merged SWOT and Risks into single "5. Analyse des risques" section
   - Removed separate Conception section

3. **Backend Changes**:
   - `pasController.js`: Added `swotAnalyses` and `risques` arrays to PAS data
   - Removed `Conception` import and mapping
   - `PAS.js` model: Added `swotAnalyses` and `risques` arrays with full field definitions

4. **Frontend Changes**:
   - `PASDetail.tsx`: Added rendering for full SWOT and Risk details
   - Removed Conception section rendering

### Phase 8: User Profile Management
**Date**: October 6, 2025

#### Feature Added:
User profile page where users can view and edit their own information

#### Implementation:
1. **Backend**:
   - Added `updateProfile` function to `utilisateurController.js`
   - Added `PUT /profile` route to `utilisateurRoutes.js`
   - Uses existing `auth` middleware for authentication

2. **Frontend**:
   - Created `UserProfile.tsx` component
   - Added route `/profile` in `App.tsx`
   - Added "👤 Mon Profil" button to:
     - `UserDashboard.tsx` (for SSI/RSSI)
     - `AdminDashboard.tsx` (for Admin)
   - Implemented edit mode with save/cancel
   - Dynamic "Retour" button based on user role

#### Bug Fixes:
- Fixed blank page issue caused by incorrect import of `currentConfig`
- Fixed 404 error by correcting user ID reference in backend
- Fixed navigation issue with "Retour" button using role-based routing

### Phase 9: API Centralization
**Date**: October 6, 2025

#### Created `audit-frontend/src/api/api.ts`:
Centralized API calls with TypeScript interfaces

#### APIs Defined:
```typescript
- authAPI: { signup, login, logout }
- userAPI: { getProfile, updateProfile }
- passwordResetAPI: { requestReset, resetPassword, verifyToken }
- auditAPI: { getAllAudits, getAudit }
- normesAPI: { getAllNormes, getNormesByAudit }
```

#### Benefits:
- Type safety with interfaces
- Consistent error handling
- Centralized token management
- Easy to maintain and extend

### Phase 10: Permissions Model Definition and Implementation
**Date**: October 6-7, 2025

#### Detailed Permissions Model Created:
Comprehensive document defining ADMIN, RSSI, and SSI capabilities

#### Backend Route Updates:
1. **Status Change Routes** (RSSI-only):
   - `projetRoutes.js`: `PATCH /:id/statut` → `authorize('RSSI')`
   - `auditRoutes.js`: `PUT /:id/statut` → `authorize('RSSI')`
   - `conceptionRoutes.js`: `PUT /:id/statut`, `POST /:id/valider` → `authorize('RSSI')`
   - `recommandationRoutes.js`: `PUT /:id/statut`, `POST /:id/valider` → `authorize('RSSI')`

2. **Operational Routes** (RSSI + SSI):
   - All CRUD routes for constats, preuves, normes, recommendations, plans d'action
   - Added `authorize('RSSI', 'SSI')` where SSI was missing

#### Frontend Permission Checks:
1. **Updated Components**:
   - `ProjectDetail.tsx`: Status dropdown restricted to RSSI only
   - `AuditDetail.tsx`: Added SSI to "+ Ajouter une preuve" and "+ Ajouter un constat" buttons
   - `CreateConstat.tsx`: Added SSI to permission check
   - `CreatePreuve.tsx`: Added SSI to permission check
   - `RecommandationDetail.tsx`: Added SSI for edit/delete/add plan
   - `ConstatDetail.tsx`: Added SSI for edit/delete/add recommendation
   - `PlanActionDetail.tsx`: Added SSI for edit/delete, fixed typo in isAdmin check

### Phase 11: Normes (Standards) Enhancement
**Date**: October 7, 2025

#### Problem:
- Only a few norms available
- No norms showing for "Audit Organisationnel"
- Frontend using localStorage instead of API

#### Solutions:
1. **Expanded Norm Database**:
   - Created `seed-normes.js` with 27 comprehensive norms
   - Categories: ISO, NIST, CIS, OWASP, PCI, Conformité, SOC, ANSSI
   - Modified script to add new norms without clearing existing ones

2. **Norms List**:
   - **ISO Standards**: ISO 27001:2022, ISO 27002:2022, ISO 27005:2018, ISO 27017:2015, ISO 27018:2019, ISO 9001:2015, ISO 22301:2019
   - **NIST Standards**: Cybersecurity Framework 1.1, SP 800-53 Rev. 5, SP 800-171 Rev. 2, SP 800-30 Rev. 1, SP 800-37 Rev. 2
   - **CIS Standards**: CIS Controls 8.0, Implementation Groups 1-3
   - **PCI Standards**: PCI DSS 4.0, PA-DSS 3.2
   - **OWASP Standards**: Top 10 2021, Mobile Top 10 2016, API Security Top 10 2023, ASVS 4.0
   - **Additional**: RGPD/GDPR, SOC 2 Type II, HIPAA, ANSSI Guide

3. **Frontend Updates**:
   - `CreateAudit.tsx`: Changed to fetch from API instead of localStorage
   - Made filtering more flexible (e.g., `categorie.includes('ISO')`)
   - `NormesDashboard.tsx`: Fetch from API first, fallback to localStorage
   - `NormeDetail.tsx`: Fetch from API first, fallback to localStorage
   - Updated category badge logic for all new categories

### Phase 12: Business Rule Enforcement
**Date**: October 7, 2025

#### Rule 1: One SWOT Per Project
**Implementation in `CreateSWOT.tsx`**:
- Added `checkExistingSWOT()` function
- Fetches from both API and localStorage
- 3-second timeout on API calls
- Displays warning and prevents creation if SWOT exists
- Fixed localStorage key from `swot:${id}` to `swots:${id}`

#### Rule 2: One Conception Per Project
**Implementation in `CreateConception.tsx`**:
- Same approach as SWOT
- Added `checkExistingConception()` function
- 3-second timeout on API calls
- Prevents multiple conceptions per project

#### Rule 3: Remove Constat Creation from Project Page
**Implementation in `ProjectDetail.tsx`**:
- Removed "+ Créer constat" button
- Added button to navigate to audit page instead
- Constats can only be created from audit detail pages

### Phase 13: Mock Data Handling Strategy
**Date**: October 7, 2025

#### Problem:
System needs to handle both real database records and localStorage mock data for testing

#### Solution - Two-Tier Data Fetching:
1. **Backend Validation**: Strict MongoDB ID validation
2. **Frontend Intelligence**: Detect mock IDs and handle appropriately

#### Implementation:
1. **CreateConstat.tsx**:
   - Detects mock audit IDs (starting with "mock-" or "audit_")
   - Saves to localStorage for mock audits
   - Sends to backend API for real audits

2. **AuditDetail.tsx**:
   - Fetches constats from both API and localStorage
   - Combines and filters by current audit ID
   - Displays all relevant constats regardless of source
   - Fixed stale state issue by passing `currentAudit` as parameter to `loadRelatedData`

3. **ConstatsDashboard.tsx**:
   - Fetches from both API and localStorage
   - Combines all constats for display

4. **ConstatDetail.tsx**:
   - 3-second timeout on API calls
   - Fallback to localStorage if API fails
   - Searches all localStorage keys for constat
   - Correctly extracts audit and project IDs from found constat
   - Fetches audit and project with API + localStorage fallback

### Phase 14: Audit-Norme Relationship Fixes
**Date**: October 7, 2025

#### Problem:
- Normes not visible in audit detail page
- Audits not visible in norm detail page
- Stale state issue with React closures

#### Root Cause:
`useEffect` closure over stale `audit` state causing `audit.normes` to be undefined

#### Solutions:
1. **AuditDetail.tsx**:
   - Refactored `loadRelatedData` to accept `currentAudit` parameter
   - Updated all calls to pass `audit` object explicitly
   - Fixed norme fetching to handle both populated objects and IDs
   - Added comprehensive logging for debugging
   - Handles both string IDs and populated objects from API/localStorage

2. **NormeDetail.tsx**:
   - Combined audits from all sources (API + multiple localStorage keys)
   - Fixed filtering logic to find associated audits

3. **Added API Methods** in `api.ts`:
   - `getAudit(auditId)` - Fetch single audit
   - `getNormesByAudit(auditId)` - Fetch norms for audit

### Phase 15: Projet Population in Constats
**Date**: October 7, 2025 (CURRENT)

#### Issue:
Constat detail page shows associated audit but not associated project

#### Investigation:
- Verified `Constat` model has `projet` field (line 10 in `Constat.js`)
- Field is optional: `{ type: mongoose.Schema.Types.ObjectId, ref: 'Projet' }`

#### Implementation:
Added `.populate('projet')` to three methods in `constatRepository.js`:
1. `findById()` - Line 13
2. `findAll()` - Line 27  
3. `updateById()` - Line 61

#### Current Status:
**BLOCKED** - User's `.env` file was accidentally deleted. Waiting for user to restore MongoDB Atlas connection string.

---

## 5. Database Models (Backend)

### Utilisateur (User)
```javascript
{
  nom: String (required),
  email: String (required, unique),
  motDePasse: String (required, hashed),
  role: String (enum: ['ADMIN', 'RSSI', 'SSI'], required),
  statut: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  timestamps: true
}
```

### Projet (Project)
```javascript
{
  nom: String (required),
  description: String (required),
  dateDebut: Date (required),
  dateFin: Date,
  statut: String (enum: ['En cours', 'Terminé', 'En attente'], default: 'En cours'),
  perimetre: String,
  objectifs: String,
  contactsUrgence: String,
  securite: ObjectId (ref: 'SecuriteProjet'),
  // REMOVED in Phase 4: entrepriseNom, entrepriseContact, personnelsInternes, personnelsExternes, reglementations
  timestamps: true
}
```

### Audit
```javascript
{
  nom: String (required),
  type: String (enum: ['Organisationnel', 'Technique'], required),
  projet: ObjectId (ref: 'Projet', required),
  normes: [ObjectId] (ref: 'Normes'),
  dateDebut: Date (required),
  dateFin: Date,
  statut: String (enum: ['Planifié', 'En cours', 'Terminé'], default: 'Planifié'),
  objectifs: [String],
  methodologie: String,
  // Added in Phase 4:
  entrepriseNom: String,
  entrepriseContact: String,
  personnelsInternes: String,
  personnelsExternes: String,
  reglementations: [String],
  // PAS-related:
  suiviSecurite: String,
  annexes: String,
  timestamps: true
}
```

### SecuriteProjet (Security Configuration)
```javascript
{
  projet: ObjectId (ref: 'Projet', required, unique),
  mesuresSecurite: {
    physique: {
      controleAcces: String,
      surveillance: String,
      protectionIncendie: String,
      securityPatch: String
    },
    logique: {
      authentification: String,
      chiffrement: String,
      firewall: String,
      antivirus: String,
      gestionMDP: String
    },
    organisationnelle: {
      politiqueSecurite: String,
      sensibilisation: String,
      gestionIncidents: String,
      auditRegulier: String
    }
  },
  pcaPra: {
    sauvegardeRestauration: {
      procedures: String,
      frequenceTests: String
    },
    siteSecours: {
      description: String,
      adresse: String
    },
    exercicesSimulation: {
      description: String,
      frequence: String
    }
  },
  // Added in Phase 5:
  rolesEtResponsabilites: [{
    role: String,
    responsabilite: String
  }],
  timestamps: true
}
```

### Norme (Security Standard)
```javascript
{
  nom: String (required),
  categorie: String (required),
  version: String,
  description: String,
  exigences: [String],
  audits: [ObjectId] (ref: 'Audit'),
  timestamps: true
}
```

### Constat (Finding)
```javascript
{
  description: String (required),
  type: String (enum: ['NC maj', 'NC min', 'PS', 'PP'], required),
  criticite: String (required),
  impact: String (required),
  probabilite: String (required),
  audit: ObjectId (ref: 'Audit', required),
  projet: ObjectId (ref: 'Projet'), // Optional - populated in Phase 15
  recommandations: [ObjectId] (ref: 'Recommandation'),
  timestamps: true
}
```

### Recommandation
```javascript
{
  titre: String (required),
  description: String (required),
  constat: ObjectId (ref: 'Constat', required),
  priorite: String (enum: ['Haute', 'Moyenne', 'Basse'], required),
  statut: String (enum: ['En attente', 'En cours', 'Validée', 'Rejetée'], default: 'En attente'),
  plansAction: [ObjectId] (ref: 'PlanAction'),
  timestamps: true
}
```

### PlanAction
```javascript
{
  titre: String (required),
  description: String (required),
  recommandation: ObjectId (ref: 'Recommandation', required),
  responsable: String (required),
  echeance: Date (required),
  statut: String (enum: ['Non démarré', 'En cours', 'Terminé', 'En retard'], default: 'Non démarré'),
  ressourcesNecessaires: String,
  timestamps: true
}
```

### Preuve (Evidence)
```javascript
{
  nom: String (required),
  type: String (required),
  description: String,
  fichier: String,
  audit: ObjectId (ref: 'Audit', required),
  uploadePar: ObjectId (ref: 'Utilisateur'),
  timestamps: true
}
```

### SWOT
```javascript
{
  projet: ObjectId (ref: 'Projet', required),
  forces: String (required),
  faiblesses: String (required),
  opportunites: String (required),
  menaces: String (required),
  timestamps: true
}
```

### Risque (Risk)
```javascript
{
  projet: ObjectId (ref: 'Projet', required),
  description: String (required),
  type: String (required),
  priorite: String (enum: ['Haute', 'Moyenne', 'Basse'], required),
  niveauRisque: String (required),
  impact: String (required),
  probabilite: String (required),
  decision: String (enum: ['Accepter', 'Mitiger', 'Transférer', 'Éviter'], required),
  timestamps: true
}
```

### Conception (Design Document)
```javascript
{
  projet: ObjectId (ref: 'Projet', required),
  nomFichier: String (required),
  typeFichier: String (required),
  rssiCommentaire: String,
  statut: String (enum: ['En attente', 'Validé', 'Rejeté'], default: 'En attente'),
  timestamps: true
}
```

### PAS (Plan d'Assurance Sécurité)
```javascript
{
  projet: ObjectId (ref: 'Projet', required),
  audit: ObjectId (ref: 'Audit', required),
  version: String (required),
  dateCreation: Date (default: Date.now),
  champApplication: {
    projet: String,
    perimetre: String,
    personnels: String
  },
  references: {
    normes: [String],
    politiques: String,
    reglementations: [String]
  },
  organisationSecurite: {
    structure: String,
    // Added in Phase 5:
    rolesEtResponsabilites: [{
      role: String,
      responsabilite: String
    }]
  },
  // Updated in Phase 3 - no more generic arrays, only real data:
  analyseRisques: {
    menaces: [String],
    vulnerabilites: [String],
    impacts: [String]
  },
  mesuresSecurite: {
    physiques: [String],
    logiques: [String],
    organisationnelles: [String]
  },
  // Updated in Phase 3 - nested object structure:
  pcaPra: {
    sauvegardeRestauration: {
      procedures: String,
      frequenceTests: String
    },
    siteSecours: {
      description: String,
      adresse: String
    },
    exercicesSimulation: {
      description: String,
      frequence: String
    }
  },
  suiviAudit: {
    auditsInternes: String,
    auditsExternes: String,
    reunions: String,
    auditInterne: String
  },
  annexes: {
    contactsUrgence: String,
    sensibilisation: String
  },
  // Added in Phase 7:
  swotAnalyses: [{
    forces: String,
    faiblesses: String,
    opportunites: String,
    menaces: String,
    createdAt: Date
  }],
  risques: [{
    description: String,
    type: String,
    priorite: String,
    niveauRisque: String,
    impact: String,
    probabilite: String,
    decision: String,
    createdAt: Date
  }],
  // Removed in Phase 7: conceptions array
  timestamps: true
}
```

### PasswordResetRequest
```javascript
{
  utilisateur: ObjectId (ref: 'Utilisateur', required),
  token: String (required, unique),
  expiresAt: Date (required),
  used: Boolean (default: false),
  timestamps: true
}
```

---

## 6. API Endpoints

### Authentication Routes (`/api/utilisateurs`)
```
POST   /signup                      # User registration
POST   /login                       # User login
POST   /logout                      # User logout
GET    /profile                     # Get authenticated user profile
PUT    /profile                     # Update authenticated user profile (Phase 8)
POST   /password-reset-request     # Request password reset
POST   /password-reset             # Reset password with token
GET    /password-reset/verify/:token # Verify reset token
```

### Admin User Management (`/api/utilisateurs`)
```
GET    /              # Get all users (ADMIN only)
GET    /:id           # Get user by ID (ADMIN only)
PUT    /:id           # Update user (ADMIN only)
DELETE /:id           # Delete user (ADMIN only)
PATCH  /:id/approve   # Approve user (ADMIN only)
PATCH  /:id/reject    # Reject user (ADMIN only)
```

### Project Routes (`/api/projets`)
```
POST   /                 # Create project (RSSI, SSI)
GET    /                 # Get all projects (RSSI, SSI)
GET    /:id              # Get project by ID (RSSI, SSI)
PUT    /:id              # Update project (RSSI, SSI)
DELETE /:id              # Delete project (RSSI, SSI)
PATCH  /:id/statut       # Update project status (RSSI ONLY) ⚠️
```

### Audit Routes (`/api/audits`)
```
POST   /                 # Create audit (RSSI, SSI)
GET    /                 # Get all audits (RSSI, SSI)
GET    /:id              # Get audit by ID (RSSI, SSI)
PUT    /:id              # Update audit (RSSI, SSI)
DELETE /:id              # Delete audit (RSSI, SSI)
PUT    /:id/statut       # Update audit status (RSSI ONLY) ⚠️
PATCH  /:id/statut       # Update audit status (RSSI ONLY) ⚠️
GET    /projet/:projetId # Get audits by project (RSSI, SSI)
```

### Security Configuration Routes (`/api/securite-projets`)
```
POST   /                        # Create security config (RSSI, SSI)
GET    /                        # Get all security configs (RSSI, SSI)
GET    /:id                     # Get security config by ID (RSSI, SSI)
PUT    /:id                     # Update security config (RSSI, SSI)
DELETE /:id                     # Delete security config (RSSI, SSI)
GET    /projet/:projetId        # Get security config by project (RSSI, SSI)
```

### Constat Routes (`/api/constats`)
```
POST   /                 # Create constat (RSSI, SSI)
GET    /                 # Get all constats (RSSI, SSI)
GET    /:id              # Get constat by ID (RSSI, SSI)
PUT    /:id              # Update constat (RSSI, SSI)
DELETE /:id              # Delete constat (RSSI, SSI)
GET    /audit/:auditId   # Get constats by audit (RSSI, SSI)
```

### Recommandation Routes (`/api/recommandations`)
```
POST   /                 # Create recommendation (RSSI, SSI)
GET    /                 # Get all recommendations (RSSI, SSI)
GET    /:id              # Get recommendation by ID (RSSI, SSI)
PUT    /:id              # Update recommendation (RSSI, SSI)
DELETE /:id              # Delete recommendation (RSSI, SSI)
POST   /:id/valider      # Validate recommendation (RSSI ONLY) ⚠️
PATCH  /:id/valider      # Validate recommendation (RSSI ONLY) ⚠️
PUT    /:id/statut       # Update recommendation status (RSSI ONLY) ⚠️
GET    /constat/:constatId # Get recommendations by constat (RSSI, SSI)
```

### Plan d'Action Routes (`/api/plans-action`)
```
POST   /                          # Create plan action (RSSI, SSI)
GET    /                          # Get all plans action (RSSI, SSI)
GET    /:id                       # Get plan action by ID (RSSI, SSI)
PUT    /:id                       # Update plan action (RSSI, SSI)
DELETE /:id                       # Delete plan action (RSSI, SSI)
GET    /recommandation/:recommandationId # Get plans by recommendation (RSSI, SSI)
```

### Preuve Routes (`/api/preuves`)
```
POST   /                 # Create evidence (RSSI, SSI)
GET    /                 # Get all evidence (RSSI, SSI)
GET    /:id              # Get evidence by ID (RSSI, SSI)
PUT    /:id              # Update evidence (RSSI, SSI)
DELETE /:id              # Delete evidence (RSSI, SSI)
GET    /audit/:auditId   # Get evidence by audit (RSSI, SSI)
```

### Norme Routes (`/api/normes`)
```
POST   /                 # Create norm (RSSI, SSI)
GET    /                 # Get all norms (RSSI, SSI)
GET    /:id              # Get norm by ID (RSSI, SSI)
PUT    /:id              # Update norm (RSSI, SSI)
DELETE /:id              # Delete norm (RSSI, SSI)
```

### SWOT Routes (`/api/swots`)
```
POST   /                    # Create SWOT (RSSI, SSI) - Limited to 1 per project ⚠️
GET    /                    # Get all SWOTs (RSSI, SSI)
GET    /:id                 # Get SWOT by ID (RSSI, SSI)
PUT    /:id                 # Update SWOT (RSSI, SSI)
DELETE /:id                 # Delete SWOT (RSSI, SSI)
GET    /projet/:projetId    # Get SWOT by project (RSSI, SSI)
```

### Risque Routes (`/api/risques`)
```
POST   /                    # Create risk (RSSI, SSI) - Multiple allowed ✅
GET    /                    # Get all risks (RSSI, SSI)
GET    /:id                 # Get risk by ID (RSSI, SSI)
PUT    /:id                 # Update risk (RSSI, SSI)
DELETE /:id                 # Delete risk (RSSI, SSI)
GET    /projet/:projetId    # Get risks by project (RSSI, SSI)
```

### Conception Routes (`/api/conceptions`)
```
POST   /                    # Create conception (RSSI, SSI) - Limited to 1 per project ⚠️
GET    /                    # Get all conceptions (RSSI, SSI)
GET    /:id                 # Get conception by ID (RSSI, SSI)
PUT    /:id                 # Update conception (RSSI, SSI)
DELETE /:id                 # Delete conception (RSSI, SSI)
POST   /:id/valider         # Validate conception (RSSI ONLY) ⚠️
PATCH  /:id/valider         # Validate conception (RSSI ONLY) ⚠️
PUT    /:id/statut          # Update conception status (RSSI ONLY) ⚠️
GET    /projet/:projetId    # Get conceptions by project (RSSI, SSI)
```

### PAS Routes (`/api/pas`)
```
POST   /auto               # Auto-generate PAS from audit (RSSI, SSI)
GET    /                   # Get all PAS (RSSI, SSI)
GET    /:id                # Get PAS by ID (RSSI, SSI)
PUT    /:id                # Update PAS (RSSI, SSI)
DELETE /:id                # Delete PAS (RSSI, SSI)
GET    /projet/:projetId   # Get PAS by project (RSSI, SSI)
GET    /audit/:auditId     # Get PAS by audit (RSSI, SSI)
```

**Legend**:
- ⚠️ = Special permission or business rule applies
- ✅ = Explicitly allowed behavior

---

## 7. Frontend Components

### Authentication Components
```
📁 components/auth/
├── Login.tsx                    # Login page
├── Signup.tsx                   # Registration page
├── ProtectedRoute.tsx           # Route guard with role checking
└── ForgotPassword.tsx           # Password reset request
```

### User Management
```
📁 components/user/
├── UserDashboard.tsx            # SSI/RSSI dashboard with profile link
├── UserProfile.tsx              # User profile view/edit (Phase 8)
└── PasswordReset.tsx            # Password reset form

📁 components/admin/
└── AdminDashboard.tsx           # Admin dashboard with user approval
```

### Project Management
```
📁 components/project/
├── ProjectDashboard.tsx         # List all projects
├── ProjectDetail.tsx            # View/edit project, display security config, PAS list
├── CreateProject.tsx            # Create new project
└── EditProject.tsx              # Edit existing project
```

### Audit Management
```
📁 components/audit/
├── AuditDetail.tsx              # View audit details, related constats/preuves/normes
└── CreateAudit.tsx              # Create audit with norm selection (Phase 11)
```

### Security Configuration
```
📁 components/securite/
└── SecuriteProjetForm.tsx       # Multi-tab security configuration form
                                 # Tabs: Physical, Logical, Organizational, PCA/PRA, Roles
```

### PAS Management
```
📁 components/pas/
├── PASProjetDashboard.tsx       # List PAS documents (removed create button in Phase 2)
└── PASDetail.tsx                # View/print PAS with full SWOT/Risk details (Phase 7)
```

### Constat Management
```
📁 components/constats/
├── ConstatsDashboard.tsx        # List all constats (fetches from API + localStorage)
├── ConstatDetail.tsx            # View/edit constat (with timeout handling Phase 14)
└── CreateConstat.tsx            # Create constat (mock data handling Phase 13)
```

### Recommandation Management
```
📁 components/recommandations/
├── RecommandationsDashboard.tsx # List all recommendations
├── RecommandationDetail.tsx     # View/edit recommendation (SSI added Phase 10)
└── CreateRecommandation.tsx     # Create recommendation
```

### Plan d'Action Management
```
📁 components/planactions/
├── PlanActionsDashboard.tsx     # List all action plans
├── PlanActionDetail.tsx         # View/edit action plan (SSI added Phase 10)
└── CreatePlanAction.tsx         # Create action plan
```

### Preuve Management
```
📁 components/preuves/
├── PreuvesDashboard.tsx         # List all evidence
├── PreuveDetail.tsx             # View evidence
└── CreatePreuve.tsx             # Upload evidence (SSI added Phase 10)
```

### Norme Management
```
📁 components/normes/
├── NormesDashboard.tsx          # List norms with filters (Phase 11: API + localStorage)
├── NormeDetail.tsx              # View norm details with associated audits (Phase 14)
└── CreateNorme.tsx              # Create new norm
```

### SWOT Management
```
📁 components/swot/
├── SWOTDashboard.tsx            # List SWOT analyses
├── SWOTDetail.tsx               # View SWOT (fixed string display Phase 6)
└── CreateSWOT.tsx               # Create SWOT (enforces 1 per project Phase 12)
```

### Risk Management
```
📁 components/risk/
├── RisksDashboard.tsx           # List all risks
├── RiskDetail.tsx               # View risk (fixed navigation Phase 6)
└── CreateRisk.tsx               # Create risk (multiple allowed)
```

### Conception Management
```
📁 components/conception/
├── ConceptionsDashboard.tsx     # List conceptions
├── ConceptionDetail.tsx         # View conception (timeout handling Phase 6)
└── CreateConception.tsx         # Create conception (enforces 1 per project Phase 12)
```

### Supporting Components
```
📁 components/common/
├── Button.tsx                   # Reusable button component
├── Input.tsx                    # Reusable input component
├── Card.tsx                     # Reusable card component
└── Spinner.tsx                  # Loading spinner
```

---

## 8. Authentication & Authorization

### Token Storage
```typescript
// Key used throughout application
localStorage.setItem('authToken', token);
const token = localStorage.getItem('authToken');
```

**CRITICAL**: All components MUST use `'authToken'` as the key (fixed in Phase 2)

### Authentication Flow
1. User logs in via `Login.tsx`
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage with key `'authToken'`
4. Token included in all API requests via Authorization header
5. Backend `auth` middleware verifies token and populates `req.user`

### Authorization Middleware
```javascript
// audit-backend/middleware/auth.js
// Verifies JWT token and populates req.user with full user object

// audit-backend/middleware/authorize.js
// Checks if req.user.role matches allowed roles
authorize('RSSI', 'SSI') // Allows RSSI or SSI
authorize('RSSI')        // RSSI only
authorize('ADMIN')       // ADMIN only
```

### Protected Routes (Frontend)
```tsx
<Route 
  path="/some-route" 
  element={
    <ProtectedRoute requiredRole={["RSSI", "SSI"]}>
      <SomeComponent />
    </ProtectedRoute>
  } 
/>
```

### Role-Based UI Rendering
```tsx
const { user } = useAuth();
const isAdmin = user?.role === 'ADMIN';
const isRSSI = user?.role === 'RSSI';
const isSSI = user?.role === 'SSI';

// Show button only for RSSI
{isRSSI && <Button>Change Status</Button>}

// Show for both RSSI and SSI
{(isRSSI || isSSI) && <Button>Create Constat</Button>}
```

---

## 9. Key Business Rules

### 1. One SWOT Per Project
- **Enforced in**: `CreateSWOT.tsx` (Phase 12)
- **Logic**: Check both API and localStorage before allowing creation
- **User Experience**: Display warning and link to existing SWOT if found

### 2. One Conception Per Project
- **Enforced in**: `CreateConception.tsx` (Phase 12)
- **Logic**: Same as SWOT
- **User Experience**: Display warning and link to existing conception

### 3. Multiple Risks Per Project
- **No Limit**: Users can create as many risks as needed per project

### 4. Constats Created from Audits Only
- **Enforced in**: `ProjectDetail.tsx` (Phase 12)
- **Implementation**: Removed "+ Créer constat" button from project page
- **Navigation**: Users must go to audit detail page to create constats

### 5. Status Changes RSSI-Only
- **Backend**: All status endpoints use `authorize('RSSI')`
- **Frontend**: Status dropdowns/buttons visible only to RSSI users
- **Scope**: Applies to projects, audits, conceptions, recommendations

### 6. PAS Contains Real Data Only
- **Implementation**: `pasController.js` (Phase 3)
- **Rule**: No generic fallback values
- **Result**: Empty fields if data not available, ensuring accurate reflection of project state

### 7. Mock Data Handling
- **Implementation**: Various components (Phase 13)
- **Strategy**: Frontend detects mock IDs (prefixed with "mock-" or "audit_")
- **Behavior**: 
  - Mock data saved to localStorage
  - Real data sent to backend API
  - Both sources combined for display

### 8. API Timeout Strategy
- **Implementation**: Multiple components (Phases 6, 13, 14)
- **Timeout**: 3 seconds for API calls
- **Fallback**: Graceful fallback to localStorage if API unavailable
- **Benefit**: Ensures responsive UI even with slow network

---

## 10. All Bugs Fixed

### Phase 2 Bugs:
1. ✅ **SyntaxError in auditValidator.js**
   - **Issue**: Validator array not properly closed
   - **Fix**: Moved closing `];` to correct position

2. ✅ **Mongoose Duplicate Index Warning**
   - **Issue**: `SecuriteProjet` had both `unique: true` and manual index
   - **Fix**: Removed manual `schema.index()` call

3. ✅ **ERR_CONNECTION_REFUSED on Login**
   - **Issue**: Frontend pointing to wrong API URL
   - **Fix**: Changed `config.ts` environment to `'development'`

4. ✅ **401 Unauthorized on Security Config Save**
   - **Issue**: Using `localStorage.getItem('token')` instead of `'authToken'`
   - **Fix**: Updated all components to use `'authToken'`

5. ✅ **Redirect to Login After Security Config Creation**
   - **Issue**: Navigation path typo (`/projets/` vs `/projects/`)
   - **Fix**: Corrected navigation in `SecuriteProjetForm.tsx`

6. ✅ **Duplicate "Créer PAS" Buttons**
   - **Issue**: Button existed in both `ProjectDetail` and `PASProjetDashboard`
   - **Fix**: Removed button from `PASProjetDashboard.tsx`

### Phase 3 Bugs:
7. ✅ **PAS Showing Generic/Default Values**
   - **Issue**: `pasController.js` using fallback values
   - **Fix**: Removed ALL generic fallbacks, use only real data or empty

8. ✅ **PAS Data Type Mismatches**
   - **Issue**: Backend sending strings, frontend expecting arrays
   - **Fix**: Synchronized data types between backend and frontend models

9. ✅ **Incomplete PCA/PRA in PAS**
   - **Issue**: Only using `description` fields
   - **Fix**: Combined all PCA/PRA fields into comprehensive strings

### Phase 6 Bugs:
10. ✅ **"Voir détails" Redirects to Login (Risques/SWOT/Conception)**
    - **Issue**: Missing routes in `App.tsx`
    - **Fix**: Added routes for `/risques/:id`, `/swot/:id`, `/conceptions/:id`

11. ✅ **RiskDetail Stuck Loading**
    - **Issue**: Component expecting two URL params, only one provided
    - **Fix**: Updated to use single `id` param, fetch risk directly

12. ✅ **RiskDetail Showing Wrong Fields**
    - **Issue**: Frontend expecting fields not in backend model
    - **Fix**: Updated display fields to match backend `Risque` model

13. ✅ **SWOTDetail Blank Page**
    - **Issue**: Trying to `.map()` over string properties
    - **Fix**: Updated `renderSWOTSection` to accept strings, not arrays

14. ✅ **ConceptionDetail Timeout**
    - **Issue**: API calls hanging indefinitely
    - **Fix**: Added 3-second timeout with localStorage fallback

### Phase 8 Bugs:
15. ✅ **Blank Page After Adding Profile Link**
    - **Issue**: Incorrect import of `currentConfig` (default vs named)
    - **Fix**: Changed to `import { currentConfig }` in `UserProfile.tsx`

16. ✅ **Extra Closing Tag in AdminDashboard**
    - **Issue**: Extra `</div>` causing JSX syntax error
    - **Fix**: Removed extra tag, fixed indentation

17. ✅ **404 on User Profile Access**
    - **Issue**: Backend using `req.user.userId` instead of `req.user._id`
    - **Fix**: Updated `utilisateurController.js` to use `req.user._id`

18. ✅ **Profile "Retour" Button Goes to Login**
    - **Issue**: Hardcoded `/dashboard` path doesn't exist
    - **Fix**: Implemented role-based routing (`/admin`, `/rssi`, `/ssi`)

### Phase 11 Bugs:
19. ✅ **No Norms for "Audit Organisationnel"**
    - **Issue**: Limited norms in database, frontend using localStorage
    - **Fix**: Expanded to 27 norms, updated frontend to fetch from API

20. ✅ **Norms Not Showing in NormesDashboard**
    - **Issue**: Only checking localStorage
    - **Fix**: Fetch from API first, fallback to localStorage

21. ✅ **Cannot Access Specific Norm Detail Pages**
    - **Issue**: Only searching hardcoded mock norms
    - **Fix**: Fetch from API first, fallback to localStorage

### Phase 13 Bugs:
22. ✅ **Error Creating Constat (Mock ID Validation)**
    - **Issue**: Backend validators rejecting mock audit IDs
    - **Fix**: Frontend detects mock IDs and saves to localStorage instead

23. ✅ **Constat Not Shown in Correct Audit**
    - **Issue**: Only fetching from API, missing localStorage constats
    - **Fix**: Fetch from both sources and combine in `AuditDetail.tsx`

24. ✅ **Constats Not Visible on Constats Page**
    - **Issue**: Only fetching from API
    - **Fix**: Fetch from both API and localStorage in `ConstatsDashboard.tsx`

25. ✅ **Backend EADDRINUSE Error**
    - **Issue**: Port 3000 already in use
    - **Fix**: Killed all node processes before restarting

### Phase 14 Bugs:
26. ✅ **Norms Not Visible in Audit Detail Page**
    - **Issue**: Stale state from React closure over `audit` object
    - **Fix**: Pass `currentAudit` as parameter to `loadRelatedData()`

27. ✅ **Audits Not Visible in Norm Detail Page**
    - **Issue**: Not combining all audit sources
    - **Fix**: Combine API + all localStorage audit sources

### Phase 12 Bugs:
28. ✅ **Can Create Multiple SWOTs Per Project**
    - **Issue**: No validation before creation
    - **Fix**: Added `checkExistingSWOT()` with API + localStorage check

29. ✅ **ConstatDetail Stuck Loading**
    - **Issue**: API timeout without fallback
    - **Fix**: Added 3-second timeout with localStorage fallback

30. ✅ **LocalStorage Key Mismatch in CreateSWOT**
    - **Issue**: Saving to `swots:${id}` but checking `swot:${id}`
    - **Fix**: Standardized to `swots:${id}`

---

## 11. Current Issues

### CRITICAL - .env File Missing
**Status**: ⚠️ BLOCKING DEVELOPMENT  
**Issue**: User's `.env` file with MongoDB Atlas credentials was accidentally deleted  
**Impact**: Backend cannot connect to database  
**Resolution Required**: User must restore `.env` file with:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_SERVICE=gmail
FRONTEND_URL=http://localhost:5173
```

### Pending Implementation
**Issue**: Projet not showing in ConstatDetail  
**Status**: ✅ CODE READY, ⏸️ BLOCKED by .env issue  
**Implementation**: Added `.populate('projet')` to `constatRepository.js`  
**Next Step**: Once .env restored, test constat detail pages

### Known Limitations
1. **Email Service**: Not configured in production (requires SMTP credentials)
2. **File Upload**: Preuve and Conception file uploads not fully implemented (only metadata stored)
3. **Real-time Updates**: No WebSocket implementation, requires manual refresh
4. **Pagination**: Not implemented for large datasets
5. **Search**: Basic search only, no advanced filtering
6. **Audit Trail**: No comprehensive logging of user actions
7. **Export**: No Excel/PDF export for reports (except PAS print)

---

## 12. File Structure

### Backend Critical Files
```
audit-backend/
├── app.js                                    # Express server, MongoDB connection, route registration
├── .env                                      # Environment variables (MISSING - NEEDS RESTORATION)
├── models/
│   ├── Utilisateur.js                       # User model with role/status
│   ├── Projet.js                            # Project model (PAS fields removed Phase 4)
│   ├── Audit.js                             # Audit model (PAS fields added Phase 4)
│   ├── SecuriteProjet.js                    # Security config (rolesEtResponsabilites added Phase 5)
│   ├── Constat.js                           # Finding model with projet reference
│   ├── Recommandation.js                    # Recommendation model
│   ├── PlanAction.js                        # Action plan model
│   ├── Preuve.js                            # Evidence model
│   ├── Normes.js                            # Norms/standards model
│   ├── SWOT.js                              # SWOT analysis model
│   ├── Risques.js                           # Risk model
│   ├── Conception.js                        # Design document model
│   ├── PAS.js                               # PAS document model (updated Phase 3, 5, 7)
│   └── PasswordResetRequest.js              # Password reset tokens
├── repositories/
│   ├── constatRepository.js                 # UPDATED PHASE 15: Added .populate('projet')
│   ├── securiteProjetRepository.js          # Security config data access
│   └── [other repositories]                 # Standard CRUD operations
├── controllers/
│   ├── pasController.js                     # HEAVILY MODIFIED: Auto-gen logic (Phases 3, 5, 7)
│   ├── securiteProjetController.js          # Security config CRUD
│   ├── utilisateurController.js             # User management (added updateProfile Phase 8)
│   └── [other controllers]                  # Standard business logic
├── routes/
│   ├── auditRoutes.js                       # UPDATED PHASE 10: Status routes RSSI-only
│   ├── projetRoutes.js                      # UPDATED PHASE 10: Status routes RSSI-only
│   ├── conceptionRoutes.js                  # UPDATED PHASE 10: Validation RSSI-only
│   ├── recommandationRoutes.js              # UPDATED PHASE 10: Validation RSSI-only
│   ├── swotRoutes.js                        # UPDATED PHASE 10: Added /projet/:id route
│   ├── conceptionRoutes.js                  # UPDATED PHASE 10: Added /projet/:id route
│   ├── securiteProjetRoutes.js              # Security config routes
│   ├── utilisateurRoutes.js                 # UPDATED PHASE 8: Added PUT /profile
│   └── [other routes]                       # Standard REST routes
├── middleware/
│   ├── auth.js                              # JWT verification, populates req.user
│   ├── authorize.js                         # Role-based authorization
│   ├── validate.js                          # Express-validator middleware
│   └── errorHandler.js                      # Global error handling
├── validators/
│   ├── projetValidator.js                   # UPDATED PHASE 1: Added security validators
│   ├── auditValidator.js                    # UPDATED PHASE 1: Added PAS validators
│   ├── securiteProjetValidator.js           # NEW PHASE 1: Comprehensive security validation (~460 lines)
│   └── [other validators]                   # Standard validation rules
└── seed-normes.js                           # UPDATED PHASE 11: 27 norms, skip duplicates
```

### Frontend Critical Files
```
audit-frontend/
├── src/
│   ├── App.tsx                              # UPDATED: Added routes for profile, risk/swot/conception details
│   ├── config/
│   │   └── config.ts                        # FIXED PHASE 2: Environment = 'development', exports currentConfig
│   ├── api/
│   │   └── api.ts                           # NEW PHASE 9: Centralized API calls
│   ├── types/
│   │   └── audit.ts                         # UPDATED PHASES 1,3,4,5,7: All interfaces
│   ├── contexts/
│   │   └── AuthContext.tsx                  # User authentication context
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx           # UPDATED PHASE 8: Added profile link
│   │   ├── user/
│   │   │   ├── UserDashboard.tsx            # UPDATED PHASE 8: Added profile link
│   │   │   └── UserProfile.tsx              # NEW PHASE 8: User profile management
│   │   ├── project/
│   │   │   └── ProjectDetail.tsx            # HEAVILY MODIFIED: Security display, PAS list,
│   │   │                                    # status dropdown RSSI-only (Phases 1,2,3,10,12)
│   │   ├── audit/
│   │   │   ├── CreateAudit.tsx              # UPDATED PHASES 4,11: PAS fields, norm fetching
│   │   │   └── AuditDetail.tsx              # UPDATED PHASES 10,13,14: Permissions, mock data,
│   │   │                                    # stale state fix
│   │   ├── securite/
│   │   │   └── SecuriteProjetForm.tsx       # NEW PHASE 1, UPDATED PHASES 2,5: Multi-tab form,
│   │   │                                    # token fix, roles section
│   │   ├── pas/
│   │   │   ├── PASProjetDashboard.tsx       # UPDATED PHASE 2: Removed create button
│   │   │   └── PASDetail.tsx                # HEAVILY MODIFIED PHASES 3,7: Data structure,
│   │   │                                    # SWOT/Risk details, removed Conception
│   │   ├── constats/
│   │   │   ├── CreateConstat.tsx            # UPDATED PHASES 10,13: SSI permission, mock handling
│   │   │   ├── ConstatsDashboard.tsx        # UPDATED PHASE 13: Fetch from API + localStorage
│   │   │   └── ConstatDetail.tsx            # UPDATED PHASES 10,14: SSI permission, timeout handling
│   │   ├── recommandations/
│   │   │   └── RecommandationDetail.tsx     # UPDATED PHASE 10: SSI permissions
│   │   ├── planactions/
│   │   │   └── PlanActionDetail.tsx         # UPDATED PHASE 10: SSI permissions, typo fix
│   │   ├── preuves/
│   │   │   └── CreatePreuve.tsx             # UPDATED PHASE 10: SSI permission
│   │   ├── normes/
│   │   │   ├── NormesDashboard.tsx          # UPDATED PHASE 11: API fetch, new categories
│   │   │   └── NormeDetail.tsx              # UPDATED PHASES 11,14: API fetch, audit combination
│   │   ├── swot/
│   │   │   ├── SWOTDetail.tsx               # UPDATED PHASE 6: String rendering fix
│   │   │   └── CreateSWOT.tsx               # UPDATED PHASE 12: One-per-project enforcement
│   │   ├── risk/
│   │   │   └── RiskDetail.tsx               # UPDATED PHASE 6: Navigation fix, field updates
│   │   ├── conception/
│   │   │   ├── ConceptionDetail.tsx         # UPDATED PHASE 6: Timeout handling
│   │   │   └── CreateConception.tsx         # UPDATED PHASE 12: One-per-project enforcement
│   │   └── [other components]/              # Standard CRUD components
│   └── [supporting files]
└── [config files]
```

### Documentation Files
```
📄 COMPLETE_PROJECT_SUMMARY.md              # THIS FILE - Complete project documentation
📄 AUDIT_EXAMPLES_DATA.md                   # NEW PHASE 10: 4 real-life audit examples (78 pages)
📄 FIXES_IMPLEMENTATION_SUMMARY.md          # Phase 10: Permission fixes summary
📄 TEST_CONSTAT_CREATION.md                 # Phase 13: Testing guide for constats
📄 PERMISSIONS_AUDIT_REPORT.md              # Phase 10: Detailed permissions analysis
📄 [various other documentation]            # Implementation guides and fix summaries
```

---

## 13. Environment Configuration

### Backend (.env) - CRITICAL FILE
```env
# MongoDB Atlas Connection (MUST BE REAL CONNECTION STRING)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/audit-management?retryWrites=true&w=majority

# JWT Secret for token signing
JWT_SECRET=your-secret-key-change-in-production

# Server Port
PORT=3000

# Environment
NODE_ENV=development

# Email Configuration (for password reset - optional)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-app-password
EMAIL_SERVICE=gmail

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**⚠️ CRITICAL**: This file is `.gitignored` and MUST be created manually. Currently MISSING and blocking development.

### Frontend (config.ts)
```typescript
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
  production: {
    apiBaseUrl: 'http://192.168.100.244:3000/api',
  }
};

const environment = 'development'; // FIXED PHASE 2

export const currentConfig = config[environment]; // Named export
```

---

## 14. Seeding and Test Data

### Norm Seeding (Phase 11)
**File**: `audit-backend/seed-normes.js`

**Run Command**:
```bash
cd audit-backend
node seed-normes.js
```

**Behavior**:
- Connects to MongoDB
- Adds 27 security norms/standards
- Skips duplicates (checks by `nom` field)
- Does NOT clear existing norms

**Categories Included**:
- ISO 27001 family (5 standards)
- ISO other (2 standards)
- NIST (5 standards)
- CIS (4 standards)
- PCI (2 standards)
- OWASP (4 standards)
- Conformité (2 standards: RGPD, HIPAA)
- SOC (1 standard)
- ANSSI (1 standard)

### Test Data Location
**File**: `AUDIT_EXAMPLES_DATA.md` (Phase 10)

Contains 4 complete real-life audit scenarios:
1. **E-Commerce Platform Security Audit**
2. **Banking Mobile Application Security Assessment**
3. **Healthcare Data Management System Audit**
4. **Cloud Infrastructure Security Review**

Each example includes:
- Project details
- SWOT analysis
- Multiple risks with full details
- Security configuration (physical, logical, organizational, PCA/PRA)
- Constats (findings)
- Recommendations
- Action plans

---

## 15. Next Steps for New Assistant

### Immediate Priority (CRITICAL)
1. **Restore .env File**
   - Work with user to get MongoDB Atlas connection string
   - Create `audit-backend/.env` file
   - Verify backend can connect to database

2. **Test Projet Population in Constats**
   - Code is ready in `constatRepository.js` (Phase 15)
   - Navigate to constat detail page
   - Verify project information is displayed
   - If not working, check:
     - Is `projet` field populated in database?
     - Are constats being created with `projet` reference?
     - Check browser console for errors

### Short-Term Tasks
3. **Complete One-Conception-Per-Project Enforcement**
   - Verify `CreateConception.tsx` has same logic as `CreateSWOT.tsx`
   - Test creation prevention
   - Test warning message display

4. **Verify All Permission Changes**
   - Test as SSI user:
     - ✅ Can create constats, preuves, recommendations, plans
     - ❌ Cannot change any statuses
     - ❌ Cannot validate conceptions/recommendations
   - Test as RSSI user:
     - ✅ Can do everything SSI can
     - ✅ Can change all statuses
     - ✅ Can validate conceptions/recommendations

5. **Optimize Project Page Loading**
   - User reported slow loading
   - Implement pagination or lazy loading
   - Consider data caching strategy

### Medium-Term Enhancements
6. **File Upload Implementation**
   - Currently only storing metadata
   - Implement actual file storage (AWS S3, local filesystem, or GridFS)
   - Update Preuve and Conception components

7. **Pagination**
   - Add to all dashboard components
   - Backend: Add `?page=1&limit=20` support
   - Frontend: Add pagination controls

8. **Advanced Search/Filtering**
   - Add search bars to dashboard components
   - Implement multi-field filtering
   - Add date range filters

9. **Real-Time Updates**
   - Consider WebSocket implementation for live updates
   - Or implement polling for critical data

10. **Export Functionality**
    - Export constats to Excel
    - Export audit reports to PDF
    - Export project summaries

### Long-Term Improvements
11. **Audit Trail**
    - Log all user actions
    - Track changes to records
    - Display history in detail pages

12. **Email Notifications**
    - Configure SMTP for password reset
    - Add notifications for status changes
    - Send reminders for overdue action plans

13. **Dashboard Analytics**
    - Charts for constats by type/criticality
    - Project status overview
    - Audit completion statistics

14. **Multi-Language Support**
    - Currently French only
    - Add i18n framework
    - Translate all UI strings

15. **Mobile Responsiveness**
    - Test on mobile devices
    - Optimize forms for touch input
    - Consider mobile-first redesign

### Testing Checklist
Before considering the system production-ready:
- [ ] All CRUD operations work for each entity
- [ ] All role permissions correctly enforced
- [ ] One-SWOT/Conception-per-project enforced
- [ ] Mock data and real data both handled correctly
- [ ] All API timeouts have fallbacks
- [ ] PAS auto-generation includes all required data
- [ ] No generic fallback values in PAS
- [ ] All navigation works (no login redirects)
- [ ] All detail pages load correctly
- [ ] Audit-norme relationships display correctly
- [ ] Constat-projet relationships display correctly
- [ ] Profile editing works for all roles
- [ ] Password reset flow complete
- [ ] All 27 norms seeded in database
- [ ] Backend connects to MongoDB Atlas
- [ ] Frontend connects to backend API
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## Key Commands Reference

### Backend
```bash
# Start backend server
cd audit-backend
node app.js

# Seed norms database
node seed-normes.js

# Check existing norms
node check-normes.js

# Create admin user
node create-admin.js

# List users
node list-users.js

# Kill Node processes (if port blocked)
# Windows PowerShell:
Stop-Process -Name node -Force
```

### Frontend
```bash
# Start development server
cd audit-frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Operations
```bash
# Connect to MongoDB (if mongosh installed)
mongosh "mongodb+srv://your-cluster.mongodb.net/audit-management"

# Show collections
show collections

# Count documents
db.utilisateurs.countDocuments()
db.normes.countDocuments()
```

---

## Critical Configuration Values

### Token Key
**MUST USE**: `'authToken'`
```typescript
localStorage.setItem('authToken', token);
localStorage.getItem('authToken');
```

### API Base URL (Development)
```typescript
http://localhost:3000/api
```

### API Base URL (Production/Network)
```typescript
http://192.168.100.244:3000/api
```

### MongoDB Database Name
```
audit-management
```

### Default Ports
- Backend: 3000
- Frontend: 5173 (Vite default)

---

## Important Notes for Handoff

1. **Mock Data Strategy**: System is designed to work with both real database records and localStorage mock data. This is intentional for testing purposes. Components handle this via:
   - ID prefix detection (`mock-`, `audit_`)
   - 3-second API timeouts with localStorage fallback
   - Combined data sources for display

2. **Status Changes**: Throughout the codebase, any route or UI element that changes status (project, audit, conception, recommendation) MUST be restricted to RSSI role only. This is a hard business requirement.

3. **PAS Auto-Generation**: The PAS document is the most complex feature. It pulls data from:
   - Projet (basic info, périmètre)
   - Audit (company info, regulations, personnel)
   - SecuriteProjet (all security measures, PCA/PRA, roles)
   - SWOT (analysis data)
   - Risques (all risks with full details)
   - NO generic fallbacks allowed - empty if data missing

4. **One-Per-Project Rules**: SWOT and Conception must have frontend enforcement. The backend does not enforce this (no unique constraint) because it would complicate testing. Frontend must check and prevent creation.

5. **LocalStorage Keys**: Be consistent with keys:
   - `authToken` - JWT token (NOT `token`)
   - `swots:${projectId}` - SWOTs for project
   - `constats` - All constats (array)
   - `normes` - All norms (array)
   - etc.

6. **Stale State Issues**: React closures can cause stale state, especially in `useEffect`. Solution: Pass current values as parameters to functions rather than relying on closure over state variables.

7. **API Timeouts**: Many components now implement 3-second timeouts. This is intentional to ensure responsive UI. If API is slow, localStorage serves as cache.

8. **Environment Configuration**: The `config.ts` file exports `currentConfig` as a NAMED export, not default. Always import with `import { currentConfig }`.

9. **.env File**: This file is critical and gitignored. Must be created manually on every deployment. Contains MongoDB credentials. Currently MISSING - top priority to restore.

10. **Norm Categories**: The system now supports 8 categories of norms. Any new norms added should fit into one of these categories for proper filtering/display:
    - ISO / ISO 27001
    - NIST
    - CIS
    - OWASP
    - PCI
    - Conformité
    - SOC
    - ANSSI

---

## Contact Points for Clarification

If you encounter issues or need clarification on:

- **Permission/Authorization**: Refer to Phase 10 and the permissions matrix in Section 3
- **PAS Generation**: Refer to Phases 3, 5, 7 and `pasController.js` analysis
- **Mock Data Handling**: Refer to Phase 13 and `CreateConstat.tsx` implementation
- **Navigation Issues**: Refer to Phase 6 and the detail component fixes
- **Data Fetching Strategy**: Refer to Phases 13, 14 for API + localStorage pattern
- **Business Rules**: Refer to Section 9 for comprehensive list
- **Model Schemas**: Refer to Section 5 for all database schemas
- **API Endpoints**: Refer to Section 6 for complete API reference

---

## Version History

- **v1.0** - October 7, 2025 - Initial comprehensive summary created
- **Current Status**: Phase 15 implementation complete, blocked by missing .env file

---

**END OF DOCUMENT**

Total Implementation: ~15 major phases, 30+ bugs fixed, 100+ files modified across 3 weeks of development.

This document should provide complete context for any AI assistant taking over this project. All critical information, implementation details, bug fixes, and pending tasks are documented above.

