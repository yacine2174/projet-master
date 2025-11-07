# 🔐 Permissions Audit Report

## ✅ **CORRECTLY IMPLEMENTED:**

### 1. **User Management (ADMIN Only)** ✅
- Backend: `utilisateurRoutes.js` lines 23-24, 27-30, 37-40
- All user management routes properly restricted to ADMIN
- Password reset approval: ADMIN only ✅

### 2. **Conception Validation (RSSI Only)** ✅
- Backend: `conceptionRoutes.js` lines 35-37
- `/valider` and `/statut` endpoints: RSSI only ✅
- SSI can create/edit, RSSI validates ✅

### 3. **Audit Status Changes (RSSI Only)** ✅
- Backend: `auditRoutes.js` lines 15-16
- `PUT/PATCH /:id/statut` endpoints: RSSI only ✅

### 4. **Project Status Changes (RSSI Only)** ✅
- Backend: `projetRoutes.js` line 14
- `PATCH /:id/statut` endpoint: RSSI only ✅

### 5. **Norme Management (Both SSI & RSSI)** ✅
- Backend: `normesRoutes.js` lines 11-14
- Create/Edit/Delete: Both RSSI & SSI ✅
- **Frontend ISSUE**: Lines 245-246 in App.tsx restrict CREATE to RSSI only ❌

### 6. **PAS Delete (RSSI Only)** ✅
- Backend: `pasRoutes.js` line 16
- DELETE restricted to RSSI ✅

---

## ❌ **ISSUES FOUND:**

### **FRONTEND ISSUES (App.tsx):**

#### 1. **Normes Create - Line 244-246** ❌
```tsx
<Route path="/normes/new" element={
  <ProtectedRoute requiredRole={["Admin", "RSSI"]}> // ❌ WRONG
    <CreateNorme />
```
**SHOULD BE:**
```tsx
<ProtectedRoute requiredRole={["SSI", "RSSI"]}> // ✅ CORRECT
```

#### 2. **Preuves Create - Line 261-263** ❌
```tsx
<Route path="/preuves/new" element={
  <ProtectedRoute requiredRole={["Admin", "RSSI"]}> // ❌ WRONG
    <CreatePreuve />
```
**SHOULD BE:**
```tsx
<ProtectedRoute requiredRole={["SSI", "RSSI"]}> // ✅ CORRECT
```

#### 3. **Recommandations Create - Line 278-280** ❌
```tsx
<Route path="/recommandations/new" element={
  <ProtectedRoute requiredRole={["Admin", "RSSI"]}> // ❌ WRONG
    <CreateRecommandation />
```
**SHOULD BE:**
```tsx
<ProtectedRoute requiredRole={["SSI", "RSSI"]}> // ✅ CORRECT
```

#### 4. **Constats Create - Line 295-297** ❌
```tsx
<Route path="/constats/new" element={
  <ProtectedRoute requiredRole={["Admin", "RSSI"]}> // ❌ WRONG
    <CreateConstat />
```
**SHOULD BE:**
```tsx
<ProtectedRoute requiredRole={["SSI", "RSSI"]}> // ✅ CORRECT
```

#### 5. **PlanActions Create - Line 312-314** ❌
```tsx
<Route path="/planactions/new" element={
  <ProtectedRoute requiredRole={["Admin", "RSSI"]}> // ❌ WRONG
    <CreatePlanAction />
```
**SHOULD BE:**
```tsx
<ProtectedRoute requiredRole={["SSI", "RSSI"]}> // ✅ CORRECT
```

---

### **BACKEND ISSUES:**

#### 1. **Recommandations Update/Delete - Lines 12-13** ❌
```javascript
router.put('/:id', auth, authorize('RSSI'), ...) // ❌ TOO RESTRICTIVE
router.delete('/:id', auth, authorize('RSSI'), ...) // ❌ TOO RESTRICTIVE
```
**ISSUE**: SSI should be able to UPDATE content (edit description, details, etc.)
**ONLY** status changes should be RSSI-only

**SHOULD BE:**
```javascript
router.put('/:id', auth, authorize('RSSI', 'SSI'), ...) // ✅ Both can edit
router.delete('/:id', auth, authorize('RSSI', 'SSI'), ...) // ✅ Both can delete
router.put('/:id/statut', auth, authorize('RSSI'), ...) // ✅ Only RSSI changes status
```

#### 2. **Constats Routes - Missing Status Endpoint** ⚠️
- No explicit status change endpoint found
- Need to add: `PUT/PATCH /:id/statut` restricted to RSSI

#### 3. **PlanActions Routes - Missing Status Endpoint** ⚠️
- No explicit status change endpoint found  
- Need to add: `PUT/PATCH /:id/statut` restricted to RSSI

---

## 📋 **SUMMARY OF REQUIRED CHANGES:**

### **Frontend (App.tsx):**
1. Line 245: Change `["Admin", "RSSI"]` to `["SSI", "RSSI"]` (Normes)
2. Line 262: Change `["Admin", "RSSI"]` to `["SSI", "RSSI"]` (Preuves)
3. Line 279: Change `["Admin", "RSSI"]` to `["SSI", "RSSI"]` (Recommandations)
4. Line 296: Change `["Admin", "RSSI"]` to `["SSI", "RSSI"]` (Constats)
5. Line 313: Change `["Admin", "RSSI"]` to `["SSI", "RSSI"]` (PlanActions)

### **Backend:**

#### recommandationRoutes.js:
```javascript
// Change line 12:
router.put('/:id', auth, authorize('RSSI', 'SSI'), ...) // Allow SSI to edit content

// Change line 13:
router.delete('/:id', auth, authorize('RSSI', 'SSI'), ...) // Allow SSI to delete

// Keep lines 14-16 as RSSI-only (validation and status changes) ✅
```

#### constatRoutes.js:
```javascript
// Add new route for status changes (RSSI only):
router.put('/:id/statut', auth, authorize('RSSI'), constatController.updateConstatStatut);
router.patch('/:id/statut', auth, authorize('RSSI'), constatController.updateConstatStatut);
```

#### planActionRoutes.js:
```javascript
// Add new route for status changes (RSSI only):
router.put('/:id/statut', auth, authorize('RSSI'), planActionController.updatePlanActionStatut);
router.patch('/:id/statut', auth, authorize('RSSI'), planActionController.updatePlanActionStatut);
```

---

## ✅ **CORRECT PERMISSION MODEL:**

| Entity | Create | Edit Content | Delete | Change Status |
|--------|--------|--------------|--------|---------------|
| **Users** | ADMIN | ADMIN | ADMIN | ADMIN |
| **Normes** | SSI, RSSI | SSI, RSSI | SSI, RSSI | N/A |
| **Audits** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ✅ |
| **Projects** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ✅ |
| **Risks** | SSI, RSSI | SSI, RSSI | SSI, RSSI | N/A |
| **SWOT** | SSI, RSSI | SSI, RSSI | SSI, RSSI | N/A |
| **Conceptions** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ✅ |
| **Recommandations** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ❌ |
| **Constats** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ❌ |
| **PlanActions** | SSI, RSSI | SSI, RSSI | SSI, RSSI | **RSSI** ❌ |
| **PAS** | SSI, RSSI | SSI, RSSI | **RSSI** ✅ | **RSSI** ✅ |
| **Preuves** | SSI, RSSI | SSI, RSSI | SSI, RSSI | N/A |

✅ = Currently implemented correctly
❌ = Needs implementation/fixing

---

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

