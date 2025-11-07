# Color Fix Script - Dark Theme Conversion

## Files That Need Color Updates

### High Priority (User-Facing Pages):
1. **Dashboard Pages:**
   - ReportsDashboard.tsx (15 bg-white)
   - RiskDashboard.tsx (9 bg-white)
   - ConceptionDashboard.tsx (6 bg-white)
   - SWOTDashboard.tsx (5 bg-white)
   - RisqueProjetDashboard.tsx (5 bg-white)
   - ConceptionProjetDashboard.tsx (5 bg-white)
   - SWOTProjetDashboard.tsx (2 bg-white)
   - PASProjetDashboard.tsx (1 bg-white)

2. **Detail Pages:**
   - PASDetail.tsx (9 bg-white)
   - RiskDetail.tsx (6 bg-white)
   - NormeDetail.tsx (4 bg-white)
   - PreuveDetail.tsx (4 bg-white)
   - ProjectDetail.tsx (3 bg-white) - Already partially fixed
   - SWOTDetail.tsx (2 bg-white)
   - ConceptionDetail.tsx (1 bg-white)
   - RecommandationDetail.tsx (1 bg-white)

3. **Admin Pages:**
   - UserManagement.tsx (10 bg-white)
   - PasswordRequests.tsx (4 bg-white)
   - UserApproval.tsx (2 bg-white)
   - UserProfile.tsx (3 bg-white)

4. **Form Pages:**
   - SecuriteProjetForm.tsx (7 bg-white)
   - All Create* components (1-2 bg-white each)

## Color Replacement Rules

### Background Colors:
- `bg-white` → `bg-slate-800` or `bg-slate-800/70`
- `bg-gray-50` → `bg-slate-900`
- `bg-gray-100` → `bg-slate-800`
- `bg-gray-200` → `bg-slate-700`

### Text Colors:
- `text-gray-900` → `text-white` or `text-slate-100`
- `text-gray-800` → `text-slate-200`
- `text-gray-700` → `text-slate-300`
- `text-gray-600` → `text-slate-400`
- `text-black` → `text-white`

### Border Colors:
- `border-gray-200` → `border-slate-700`
- `border-gray-300` → `border-slate-600`
- `border-gray-400` → `border-slate-500`

### Hover States:
- `hover:bg-gray-50` → `hover:bg-slate-700`
- `hover:bg-gray-100` → `hover:bg-slate-600`

## Implementation Strategy

I'll use find-and-replace with regex to update all files systematically.
