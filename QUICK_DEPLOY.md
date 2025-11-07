# Quick Deployment Steps

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Vercel account (sign up at https://vercel.com)

---

## 🚀 Backend Deployment (Render)

### 1. Set Up SSH Authentication (One-Time Setup)

1. **Generate SSH Key** (if you haven't already):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Optionally set a passphrase for extra security
   ```

2. **Add SSH Key to GitHub**:
   - Copy your public key to clipboard:
     ```bash
     type $env:USERPROFILE\.ssh\id_ed25519.pub | clip
     ```
   - Go to [GitHub SSH Keys](https://github.com/settings/keys)
   - Click "New SSH key"
   - Paste your key and save

3. **Test SSH Connection**:
   ```bash
   ssh -T git@github.com
   # Should see: "Hi username! You've successfully authenticated..."
   ```

### 2. Set Up Backend Repository

```bash
# Navigate to backend folder
cd c:\Users\bayou\OneDrive\Documents\projet\audit-backend

# Initialize Git
git init
git add .
git commit -m "Initial backend commit"

# Set remote URL using SSH
git remote add origin git@github.com:yacine2174/projet-master.git

# Push to GitHub
git branch -M main
git push -u origin main
# If you get a non-fast-forward error, use:
# git push -f origin main
```
    
### 2. Deploy on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub and select `audit-backend` repository
4. Fill in:
   - **Name**: `audit-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add these Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://yacine:Yacine2001@projectttttttttt.oisro9s.mongodb.net/?retryWrites=true&w=majority&appName=projectttttttttt
   JWT_SECRET=your-secret-key-change-in-production-2024
   PORT=3000
   ```
6. Click "Create Web Service"
7. **Copy your backend URL** (e.g., `https://audit-backend-xyz.onrender.com`)

---

## 🌐 Frontend Deployment (Vercel)

### 1. Update Configuration
First, update `audit-frontend/vercel.json` with your actual backend URL:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/:path*"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://YOUR-BACKEND-URL.onrender.com/api",
    "VITE_FRONTEND_URL": "https://your-app.vercel.app"
  }
}
```

### 2. Create GitHub Repository for Frontend
```bash
# Navigate to frontend folder
cd c:\Users\bayou\OneDrive\Documents\projet\audit-frontend

# Initialize Git
git init
git add .
git commit -m "Initial frontend commit"

# Create a new repository on GitHub named "audit-frontend"
# Then run:
git remote add origin https://github.com/YOUR-USERNAME/audit-frontend.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import `audit-frontend` repository
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
5. Click "Deploy"
6. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

---

## 🔄 Final Step: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add new environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Click "Save Changes" (Render will auto-redeploy)

---

## ✅ Testing

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Login with:
   - Email: `admin@audit.com`
   - Password: `admin123`
3. Test all features

---

## 📝 Important Notes

### First Request May Be Slow
- Render free tier spins down after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Subsequent requests are fast

### Custom Domain (Optional)
- In Vercel: Settings → Domains
- Add your custom domain
- Update DNS records as instructed
- Update backend environment variable with new domain

### MongoDB Atlas
Make sure MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas dashboard
2. Network Access → Add IP Address
3. Add: `0.0.0.0/0` (allows all IPs)

---

## 🆘 Troubleshooting

### Backend not responding
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend can't connect
- Verify backend URL in vercel.json
- Check browser console for errors
- Verify CORS is working

### CORS Errors
- Backend automatically allows `.vercel.app` and `.onrender.com` domains
- If using custom domain, add it to backend CORS configuration

---

## 🎉 Done!

Your application is now live on the internet!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://audit-backend-xyz.onrender.com`

Anyone can access it from anywhere in the world! 🌍
