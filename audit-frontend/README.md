# Audit Frontend - Authentication Module

A modern React frontend for the audit system with comprehensive authentication features.

## Features

### Authentication
- **Login Page**: Email + password authentication with role-based redirects
- **Signup Page**: User registration with role selection (SSI/RSSI only)
- **Forgot Password**: Admin-approved password reset requests
- **Role-based Routing**: 
  - Admin → `/admin`
  - RSSI → `/rssi`
  - SSI → `/ssi`

### Admin Features
- **User Approval**: Approve/reject pending user registrations
- **User Management**: View, edit, and delete users
- **Password Reset Requests**: Handle user password reset requests

### Technical Features
- React 18 with TypeScript
- React Router v6 for navigation
- TailwindCSS for styling
- Axios for API communication
- React Context for state management
- Reusable components (Button, Input, Select)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Edit `src/config/config.ts` to set your API base URL
   - For local development: `http://localhost:3000/api`
   - For network deployment: `http://YOUR_IP:3000/api`

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Configuration

### Local Development
```typescript
// src/config/config.ts
const environment = 'development';
```

### Network Deployment
```typescript
// src/config/config.ts
const environment = 'production';
// Update the IP address in the production config
```

## API Endpoints

The frontend uses these backend endpoints:

- `POST /utilisateurs/login` - User login
- `POST /utilisateurs/signup` - User registration
- `POST /utilisateurs/forgot-password` - Request password reset
- `POST /utilisateurs/reset-password` - Reset password after approval
- `GET /utilisateurs/profile` - Get current user profile
- `GET /utilisateurs` - Get all users (Admin only)
- `PATCH /utilisateurs/:id/approve` - Approve user (Admin only)
- `PATCH /utilisateurs/:id/reject` - Reject user (Admin only)
- `GET /utilisateurs/password-reset-requests` - Get password reset requests (Admin only)

## Component Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── UserApproval.tsx
│   │   ├── UserManagement.tsx
│   │   └── PasswordRequests.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   └── user/
│       └── UserDashboard.tsx
├── contexts/
│   └── AuthContext.tsx
├── api/
│   └── api.ts
└── config/
    └── config.ts
```

## Usage

### Demo Accounts
- **Admin**: admin@audit.com / admin123
- **RSSI**: rssi@audit.com / rssi123
- **SSI**: ssi@audit.com / ssi123

### User Flow
1. **New User Registration**:
   - User signs up with SSI or RSSI role
   - Account status is set to "pending"
   - Admin must approve the account before login

2. **Password Reset**:
   - User requests password reset via "Forgot Password"
   - Admin receives the request and can approve/reject
   - User can reset password only after admin approval

3. **Admin Management**:
   - View all users and their status
   - Approve/reject pending registrations
   - Handle password reset requests
   - Edit user information

## Development

### Adding New Components
1. Create component in appropriate directory
2. Use existing reusable components (Button, Input, Select)
3. Follow TypeScript patterns established in the codebase
4. Use TailwindCSS for styling

### API Integration
1. Add new endpoints to `src/api/api.ts`
2. Use the centralized API helper functions
3. Handle errors consistently
4. Update types as needed

## Deployment

### Local Network Deployment
1. Update `src/config/config.ts` with your network IP
2. Set `environment = 'production'`
3. Build the project: `npm run build`
4. Serve the `dist` folder

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:3001
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for your frontend URL
2. **API Connection**: Verify API base URL in config
3. **Authentication**: Check JWT token storage and API headers

### Backend Requirements
- Backend must be running on the configured port
- CORS must be enabled for frontend domain
- JWT authentication must be implemented
- All required API endpoints must be available
