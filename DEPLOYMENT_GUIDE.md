# Deployment Guide - Audit Application

## Overview
This guide will help you deploy your audit application to the internet using free hosting services.

## Architecture
- **Frontend**: Deployed on Vercel (React + Vite)
- **Backend**: Deployed on Render (Node.js + Express)
- **Database**: Already hosted on MongoDB Atlas

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account (or email)

### 1.2 Create GitHub Repository
1. Go to https://github.com
2. Create a new repository called `audit-backend`
3. Push your backend code:
```bash
cd c:\Users\bayou\OneDrive\Documents\projet\audit-backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/audit-backend.git
git push -u origin main
```

### 1.3 Deploy on Render
1. Go to Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `audit-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://yacine:Yacine2001@projectttttttttt.oisro9s.mongodb.net/?retryWrites=true&w=majority&appName=projectttttttttt`
   - `JWT_SECRET` = `your-secret-key-change-in-production`
   - `PORT` = `3000`
   - `EMAIL_USER` = `your-email@example.com`
   - `EMAIL_PASS` = `your-email-password`
   - `EMAIL_SERVICE` = `gmail`
   - `FRONTEND_URL` = (leave empty for now, we'll update after frontend deployment)

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Your backend will be available at: `https://audit-backend-XXXX.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account

### 2.2 Create GitHub Repository for Frontend
1. Create a new repository called `audit-frontend`
2. Push your frontend code:
```bash
cd c:\Users\bayou\OneDrive\Documents\projet\audit-frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/audit-frontend.git
git push -u origin main
```

### 2.3 Update vercel.json
Before deploying, update `vercel.json` with your actual backend URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/:path*"
    }
  ],
  "env": {
    "VITE_API_URL": "https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api"
  }
}
```

### 2.4 Deploy on Vercel
1. Go to Vercel dashboard
2. Click "New Project"
3. Import your `audit-frontend` repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`

6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Your frontend will be available at: `https://your-app.vercel.app`

---

## Step 3: Update Backend CORS

After both deployments, update the backend CORS configuration:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add a new environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`

5. Go to your backend code (`app.js`) and ensure CORS includes your Vercel URL

6. Commit and push the changes - Render will auto-redeploy

---

## Step 4: Test Your Deployed Application

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try logging in with your credentials
3. Test all features to ensure everything works

---

## Important Notes

### Free Tier Limitations
- **Render Free Tier**: 
  - Service spins down after 15 minutes of inactivity
  - First request after inactivity takes ~30 seconds to wake up
  - 750 hours/month free

- **Vercel Free Tier**:
  - 100 GB bandwidth/month
  - Unlimited deployments

### Custom Domain (Optional)
If you have a custom domain:
1. In Vercel: Go to Settings → Domains → Add your domain
2. Update DNS records as instructed
3. Update backend CORS and environment variables with new domain

### Environment Variables Security
- Never commit `.env` files to Git
- Always use environment variables in production
- Rotate your JWT_SECRET regularly

### Database Connection
- Your MongoDB Atlas is already configured
- Make sure IP whitelist allows connections from anywhere (0.0.0.0/0) for Render

---

## Troubleshooting

### Backend doesn't start
- Check Render logs for errors
- Verify all environment variables are set correctly
- Check MongoDB connection string

### Frontend can't connect to backend
- Verify CORS is configured correctly
- Check that backend URL in vercel.json is correct
- Inspect browser console for errors

### CORS Errors
- Add your frontend URL to backend CORS configuration
- Ensure credentials: true is set in both frontend and backend

---

## Alternative: Quick Deploy with Render for Both

If you prefer to deploy both on Render:
1. Deploy backend as described above
2. For frontend, create another Web Service:
   - Build Command: `npm run build`
   - Start Command: `npx serve -s dist -p $PORT`
   - Add `serve` to package.json dependencies

---

## Support

If you encounter issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Check MongoDB Atlas whitelist
4. Ensure all dependencies are in package.json

Your application is now deployed and accessible from anywhere on the internet! 🚀
