# Email Configuration Guide

## Quick Setup for Password Reset

To make the password reset functionality work, you need to create a `.env` file in the `audit-backend` directory with your email credentials.

### Step 1: Create .env file

Create a file named `.env` in the `audit-backend` directory with the following content:

```env
# Email Configuration for Password Reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:5173

# Database Configuration (if not already set)
MONGODB_URI=mongodb://localhost:27017/audit-system

# JWT Configuration (if not already set)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### Step 2: Configure Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate new app password
   - Select "Mail" and copy the 16-character password
3. **Update .env file**:
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-app-password` with the 16-character app password

### Step 3: Test the Configuration

After setting up the `.env` file:

1. Start the backend server: `npm start`
2. Go to the forgot password page
3. Enter your email: `bayoudhyacine3@gmail.com`
4. Check your email for the reset link

### Alternative Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Troubleshooting

1. **Email not sending**: Check your email credentials and 2FA settings
2. **Connection errors**: Verify firewall settings and SMTP port access
3. **Reset link not working**: Check FRONTEND_URL is correct

### Security Notes

- Never commit the `.env` file to version control
- Use app passwords, not your main password
- The `.env` file is already in `.gitignore`
