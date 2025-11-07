# 🔐 Password Reset Testing Guide

## 📋 Prerequisites

### 1. **Update Email Configuration**
Edit your `.env` file in the `audit-backend` directory:

```env
# Replace these with your actual Gmail credentials
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Add JWT configuration if missing
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### 2. **Gmail App Password Setup**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Use this 16-character password as `EMAIL_PASS`

### 3. **Start Servers**
```bash
# Terminal 1 - Backend
cd audit-backend
npm start

# Terminal 2 - Frontend  
cd audit-frontend
npm run dev
```

## 🧪 Testing Scenarios

### **Scenario 1: Basic Password Reset Flow**

#### Step 1: Create a Test User
1. Go to `http://localhost:3001/register`
2. Fill in the registration form:
   - **Nom**: Test
   - **Prénom**: User
   - **Email**: `test@example.com`
   - **Password**: `TestPassword123`
   - **Role**: SSI
3. Click "Créer un compte"
4. You should see: "Inscription réussie. Votre compte est en attente d'approbation"

#### Step 2: Approve the User (Admin)
1. Login as admin: `http://localhost:3001/login`
   - **Email**: `admin@audit.com`
   - **Password**: `admin123`
2. Go to Admin Dashboard: `http://localhost:3001/admin`
3. In the "Utilisateurs en attente" tab, click "Approuver" for the test user
4. You should see: "Utilisateur approuvé avec succès!"

#### Step 3: Test Password Reset
1. Go to `http://localhost:3001/forgot-password`
2. Enter the test user's email: `test@example.com`
3. Click "Demander la réinitialisation"
4. You should see: "Votre demande de réinitialisation a été envoyée à l'administrateur"

#### Step 4: Admin Approves Password Reset
1. In Admin Dashboard, go to "Réinitialisations" tab
2. You should see the password reset request
3. Click "Approuver" and add optional notes
4. You should see: "Demande approuvée avec succès"

#### Step 5: User Resets Password
1. Go to `http://localhost:3001/reset-password`
2. Enter email: `test@example.com`
3. Click "Vérifier le statut"
4. You should see the approved status
5. Enter new password: `NewPassword123`
6. Confirm password: `NewPassword123`
7. Click "Réinitialiser le mot de passe"
8. You should be automatically logged in and redirected to dashboard

### **Scenario 2: Error Handling Tests**

#### Test 1: Invalid Email
1. Go to `http://localhost:3001/forgot-password`
2. Enter invalid email: `invalid-email`
3. Click "Demander la réinitialisation"
4. **Expected**: Error message about invalid email format

#### Test 2: Non-existent Email
1. Go to `http://localhost:3001/forgot-password`
2. Enter non-existent email: `nonexistent@example.com`
3. Click "Demander la réinitialisation"
4. **Expected**: Error message about user not found

#### Test 3: Multiple Reset Requests
1. Request password reset for same email twice
2. **Expected**: Error message about existing pending request

#### Test 4: Reset Without Approval
1. Try to reset password without admin approval
2. **Expected**: Error message about no approved request

### **Scenario 3: Admin Workflow Tests**

#### Test 1: Reject Password Reset
1. Admin goes to "Réinitialisations" tab
2. Clicks "Rejeter" on a request
3. Adds rejection notes
4. **Expected**: Request marked as rejected

#### Test 2: User Checks Rejected Status
1. User goes to `http://localhost:3001/reset-password`
2. Enters email and checks status
3. **Expected**: Shows rejected status with admin notes

### **Scenario 4: Security Tests**

#### Test 1: Session Management
1. Login as user
2. Wait for session timeout (or manually expire)
3. Try to access protected pages
4. **Expected**: Redirected to login

#### Test 2: Account Lockout
1. Try to login with wrong password multiple times
2. **Expected**: Account gets locked after 5 failed attempts

## 🔍 Debugging Tips

### **Check Backend Logs**
```bash
# In backend terminal, look for:
- Email sending attempts
- Password reset request creation
- Admin approval/rejection actions
- Database operations
```

### **Check Frontend Console**
```bash
# Open browser DevTools (F12)
# Look for:
- API call responses
- Error messages
- Network requests
```

### **Check Database**
```bash
# Connect to MongoDB and check:
- passwordresetrequests collection
- utilisateurs collection
- Check if requests are being created/updated
```

### **Common Issues & Solutions**

#### Issue 1: Email Not Sending
**Symptoms**: No email received, backend error
**Solutions**:
- Check Gmail app password is correct
- Verify 2FA is enabled on Gmail
- Check firewall/network settings
- Verify SMTP port 587 is not blocked

#### Issue 2: Reset Link Not Working
**Symptoms**: Link gives error or doesn't work
**Solutions**:
- Check FRONTEND_URL in .env is correct
- Verify token hasn't expired
- Check database for token validity

#### Issue 3: Admin Can't See Requests
**Symptoms**: Admin dashboard shows no requests
**Solutions**:
- Check admin is logged in with correct role
- Verify requests are being created in database
- Check API endpoints are working

#### Issue 4: User Can't Reset Password
**Symptoms**: User gets error when trying to reset
**Solutions**:
- Check if request was approved by admin
- Verify request hasn't expired (7 days)
- Check if user exists in database

## 📊 Expected Results

### **Successful Flow**
1. ✅ User requests password reset
2. ✅ Admin receives notification
3. ✅ Admin approves request
4. ✅ User receives approval notification
5. ✅ User can reset password
6. ✅ User is automatically logged in

### **Error Handling**
1. ✅ Invalid emails are rejected
2. ✅ Non-existent users get appropriate error
3. ✅ Duplicate requests are prevented
4. ✅ Expired requests are handled
5. ✅ Unauthorized access is blocked

## 🎯 Testing Checklist

- [ ] User registration works
- [ ] Admin approval works
- [ ] Password reset request works
- [ ] Admin can see reset requests
- [ ] Admin can approve requests
- [ ] Admin can reject requests
- [ ] User can reset password after approval
- [ ] Error handling works for invalid inputs
- [ ] Security features work (session timeout, lockout)
- [ ] Email notifications work (if configured)

## 🚀 Production Testing

For production testing, also verify:
- [ ] HTTPS works correctly
- [ ] Rate limiting is active
- [ ] Logging is working
- [ ] Monitoring is set up
- [ ] Backup email service (if configured)
- [ ] Database backups are working

---

**Note**: This testing guide assumes you have the admin-approval based password reset system implemented. If you're using the email-based system instead, the flow will be slightly different (users receive email links directly).
