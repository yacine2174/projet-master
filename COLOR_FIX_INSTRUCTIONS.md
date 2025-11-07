# Dark Theme Color Fix Instructions

## Quick Fix - Run the Automated Script

I've created an automated script to fix all color issues across your application.

### Steps to Run:

1. **Open a terminal in the frontend directory:**
   ```bash
   cd c:\Users\bayou\OneDrive\Documents\projet\audit-frontend
   ```

2. **Run the color fix script:**
   ```bash
   node fix-colors.js
   ```

3. **The script will:**
   - Find all `.tsx`, `.ts`, `.jsx`, and `.js` files in `src/components`
   - Replace light theme colors with dark theme colors
   - Show you which files were updated
   - Report the total number of files modified

4. **After running the script:**
   - The dev server should auto-reload with Vite's HMR
   - If not, restart it: `npm run dev`
   - Refresh your browser (F5 or Ctrl+R)

## What the Script Changes:

### Background Colors:
- `bg-white` → `bg-slate-800`
- `bg-gray-50` → `bg-slate-900`
- `bg-gray-100` → `bg-slate-800`
- `bg-gray-200` → `bg-slate-700`

### Text Colors:
- `text-gray-900` → `text-white`
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
- `hover:bg-white` → `hover:bg-slate-700`

## Files That Will Be Updated:

The script will update approximately **46 files** with **141+ color class replacements**, including:

### High Priority Pages:
- ✅ All Dashboard pages (Reports, Risk, Conception, SWOT, etc.)
- ✅ All Detail pages (PAS, Risk, Norme, Preuve, etc.)
- ✅ Admin pages (UserManagement, PasswordRequests, UserApproval)
- ✅ User Profile page
- ✅ All Create/Form pages
- ✅ Common components (SearchAndFilter, NotificationSystem, etc.)

## Manual Review (Optional):

After running the script, you may want to manually review these critical pages:

1. **Login/Auth pages** - Already fixed
2. **Dashboard pages** - Check for any custom styling
3. **Form pages** - Ensure input fields are visible
4. **Modal/Popup components** - Check overlays and backgrounds

## Troubleshooting:

### If colors still look wrong:
1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard reload:** Ctrl+Shift+R or Ctrl+F5
3. **Check console:** Look for any CSS errors
4. **Restart dev server:** Stop and run `npm run dev` again

### If the script doesn't run:
- Make sure you're in the `audit-frontend` directory
- Check that Node.js is installed: `node --version`
- Try with `node ./fix-colors.js` (with `./`)

## Expected Result:

After running the script and reloading, you should see:
- ✅ Dark slate backgrounds throughout the app
- ✅ White/light text that's easy to read
- ✅ Proper contrast on all pages
- ✅ Consistent dark theme across all components
- ✅ No more white backgrounds or invisible text

## Date:
October 18, 2025
