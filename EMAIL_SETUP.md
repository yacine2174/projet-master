# Email Setup for Password Reset

## Overview
The password reset system uses Nodemailer to send secure reset links via email. This guide explains how to configure the email service.

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

## Gmail Setup (Recommended)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification
- Click "App passwords"
- Generate a new app password for "Mail"
- Use this password as `EMAIL_PASS`

### 3. Configure Environment Variables
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Security Features

1. **Secure Token Generation**: Uses crypto.randomBytes(32) for secure tokens
2. **Token Hashing**: Tokens are hashed before storage in database
3. **Automatic Expiration**: Tokens expire after 24 hours
4. **Single Use**: Tokens can only be used once
5. **Email Validation**: Verifies email exists before sending reset link
6. **Rate Limiting**: Prevents abuse (implemented via express-rate-limit)

## Testing

1. Start the backend server
2. Navigate to the forgot password page
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link to reset your password

## Troubleshooting

### Email Not Sending
- Check your email credentials
- Verify 2FA is enabled (for Gmail)
- Check firewall/network settings
- Verify SMTP port is not blocked

### Reset Link Not Working
- Check FRONTEND_URL is correct
- Verify token expiration
- Check database connection
- Review server logs for errors

## Production Considerations

1. **Use Environment Variables**: Never hardcode email credentials
2. **SSL/TLS**: Use secure connections in production
3. **Rate Limiting**: Implement proper rate limiting
4. **Monitoring**: Set up email delivery monitoring
5. **Backup Email Service**: Consider using services like SendGrid or Mailgun
