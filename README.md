# Audit Management Application

A comprehensive audit management system with user authentication, audit tracking, risk analysis, and reporting features.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express.js + MongoDB
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## 📁 Project Structure

```
projet/
├── audit-backend/          # Backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth & error handling
│   └── app.js            # Main server file
│
├── audit-frontend/        # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Auth & state management
│   │   ├── api/          # API integration
│   │   └── config/       # Configuration
│   └── vite.config.js    # Vite configuration
│
├── DEPLOYMENT_GUIDE.md   # Detailed deployment instructions
├── QUICK_DEPLOY.md       # Quick deployment steps
└── README.md             # This file
```

## 🚀 Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd audit-backend
npm install
npm start
```
Backend runs on http://localhost:3000

### Frontend Setup
```bash
cd audit-frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3001

## 🌐 Network Access

The application is configured to run on your local network:
- **Backend**: http://192.168.1.12:3000
- **Frontend**: http://192.168.1.12:3001

Access from any device on your network using these URLs.

## 🌍 Internet Deployment

Deploy your application to the internet for global access:

### Quick Deployment (Recommended)
Follow the **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** guide for step-by-step instructions.

### Detailed Deployment
See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for comprehensive deployment documentation.

### Hosting Platforms
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **Database**: MongoDB Atlas (Free)

## 👥 Default Users

### Admin Account
- **Email**: `admin@audit.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: Full system access

### Test Accounts
Create additional users through the signup page or admin panel.

## 🔧 Configuration

### Environment Variables

**Backend** (.env):
```env
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Frontend**:
Environment variables are set in `vercel.json` for production or in `config.ts` for development.

## 📱 Features

- **User Management**: Admin, RSSI, and SSI roles
- **Audit Management**: Create, track, and manage audits
- **Risk Analysis**: SWOT analysis and risk assessment
- **Project Management**: Security project tracking
- **Evidence Management**: Upload and manage audit evidence
- **Reporting**: Generate compliance reports
- **Dashboard**: Real-time statistics and insights

## 🔒 Security Features

- JWT authentication
- Role-based access control (RBAC)
- Password encryption
- CORS protection
- Helmet security headers
- Input validation

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT
- Bcrypt
- Helmet
- CORS

## 📄 API Documentation

Base URL: `/api`

### Authentication
- `POST /api/utilisateurs/login` - User login
- `POST /api/utilisateurs/signup` - User registration
- `POST /api/utilisateurs/forgot-password` - Password reset request
- `POST /api/utilisateurs/reset-password` - Reset password

### Audits
- `GET /api/audits` - Get all audits
- `POST /api/audits` - Create audit
- `PUT /api/audits/:id` - Update audit
- `DELETE /api/audits/:id` - Delete audit

### Projects
- `GET /api/projets` - Get all projects
- `POST /api/projets` - Create project
- `PUT /api/projets/:id` - Update project
- `DELETE /api/projets/:id` - Delete project

## 🐛 Troubleshooting

### Port Already in Use
The application has built-in error handling for port conflicts. If you see a friendly message saying "Port already in use", it means the server is already running.

### CORS Errors
- Check that backend CORS configuration includes your frontend URL
- Verify credentials are set to true

### Database Connection
- Ensure MongoDB Atlas allows connections from your IP
- Check connection string in .env file

## 📞 Support

For deployment issues, refer to:
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📝 License

This project is private and proprietary.

## 🎉 Deployment Status

- ✅ Local Development: Working
- ✅ Network Access: Configured
- ⏳ Internet Deployment: Ready (Follow deployment guides)

---

**Ready to deploy?** Start with [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for fast deployment!
