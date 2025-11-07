# How to Restart Servers After Authentication Fix

## Important: Backend Changes Made

I've updated the backend to prevent the browser authentication dialog:

1. **Updated `middleware/auth.js`** - Added check for AJAX requests
2. **Updated `app.js`** - Added global middleware to remove WWW-Authenticate header

## Steps to Apply the Fix

### 1. Restart the Backend Server

Open a terminal in the backend directory and restart the server:

```bash
cd c:\Users\bayou\OneDrive\Documents\projet\audit-backend
# Stop the current server (Ctrl+C if running)
# Then start it again:
npm start
# or
node app.js
```

### 2. Restart the Frontend Server (if needed)

The frontend should auto-reload with Vite's HMR, but if you need to restart:

```bash
cd c:\Users\bayou\OneDrive\Documents\projet\audit-frontend
# Stop the current server (Ctrl+C if running)
# Then start it again:
npm run dev
```

### 3. Clear Browser Cache

After restarting the servers:

1. Open your browser's Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: Ctrl+Shift+Delete → Clear browsing data

### 4. Test the Fix

1. **Test 1: Access a protected route without login**
   - Go to `http://localhost:3001/projects`
   - Should redirect to login WITHOUT showing browser auth dialog
   - URL should be: `http://localhost:3001/login?redirect=/projects`

2. **Test 2: Login and redirect**
   - Enter your credentials
   - After login, should redirect to `/projects`

3. **Test 3: Session expiration**
   - Log in successfully
   - Wait for token to expire or manually remove token from localStorage
   - Try to access a protected route
   - Should redirect to login WITHOUT browser auth dialog

## What Was Changed

### Backend Changes:

**File: `audit-backend/middleware/auth.js`**
- Added detection for AJAX requests using `x-requested-with` header
- Prevents WWW-Authenticate header for AJAX requests

**File: `audit-backend/app.js`**
- Added global middleware to intercept 401 responses
- Removes WWW-Authenticate header for AJAX requests

### Frontend Changes (Already Applied):

**File: `audit-frontend/src/api/api.ts`**
- Added `X-Requested-With: XMLHttpRequest` header to all requests
- Added centralized error handling for 401 responses

**File: `audit-frontend/src/contexts/AuthContext.tsx`**
- Added event listener for unauthorized events
- Improved logout and redirect handling

**File: `audit-frontend/src/components/auth/Login.tsx`**
- Added support for redirect URL parameters
- Updated to dark theme

## Troubleshooting

### If the browser dialog still appears:

1. **Make sure backend server restarted**
   - Check the terminal for "Server running on port 3000"
   - Look for any errors in the backend console

2. **Clear all browser data**
   - Sometimes the browser caches the auth headers
   - Try in an incognito/private window

3. **Check the Network tab**
   - Open DevTools → Network tab
   - Look at the 401 response headers
   - Should NOT see `WWW-Authenticate` header

4. **Verify the request headers**
   - In Network tab, check the request
   - Should see `X-Requested-With: XMLHttpRequest`

### If you see CORS errors:

Make sure your frontend URL is in the CORS whitelist in `app.js`:
```javascript
origin: [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  // ... other IPs
]
```

## Expected Behavior After Fix

✅ No browser authentication dialog
✅ Clean redirect to login page
✅ URL preservation for post-login redirect
✅ Proper error messages in the UI
✅ Session expiration handled gracefully

## Date
October 17, 2025
