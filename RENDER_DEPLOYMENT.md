# Deploying ARMS Platform to Render

## 🚀 Quick Deployment Guide

### Option 1: Using render.yaml (Recommended - Blueprint)

This deploys both frontend and backend together.

#### Step 1: Push to GitHub

```bash
cd /Users/macbookair/Downloads/arms-platform

# Initialize git if not already done
git init
git add .
git commit -m "Ready for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/arms-platform.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Render

1. Go to https://dashboard.render.com/
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Select the `arms-platform` repository
5. Render will automatically detect `render.yaml`
6. Click **Apply**

Render will deploy both services automatically!

---

### Option 2: Manual Deployment (Step by Step)

Deploy backend and frontend separately.

## Backend Deployment (Spring Boot)

### Step 1: Create Web Service

1. Go to https://dashboard.render.com/
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select `arms-platform` repository

### Step 2: Configure Backend Service

**Basic Settings:**
- **Name**: `arms-backend`
- **Region**: Choose closest to you
- **Branch**: `main` (or `main2`)
- **Root Directory**: `backend`
- **Environment**: `Java`
- **Build Command**: 
  ```bash
  mvn clean package -DskipTests
  ```
- **Start Command**: 
  ```bash
  java -jar target/platform-0.0.1-SNAPSHOT.jar
  ```

**Advanced Settings:**
- **Instance Type**: Free (or Starter)
- **Health Check Path**: `/api/health`

### Step 3: Add Environment Variables

Click **Environment** tab and add:

```
SERVER_PORT=8080
FIREBASE_PROJECT_ID=arms-8a8b8
FIREBASE_STORAGE_BUCKET=arms-8a8b8.firebasestorage.app
JAVA_OPTS=-Xmx512m
```

### Step 4: Deploy

Click **Create Web Service**

Your backend will be available at: `https://arms-backend.onrender.com`

---

## Frontend Deployment (React)

### Step 1: Create Static Site

1. Go to https://dashboard.render.com/
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Select `arms-platform` repository

### Step 2: Configure Frontend Service

**Basic Settings:**
- **Name**: `arms-frontend`
- **Branch**: `main` (or `main2`)
- **Root Directory**: `frontend`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: 
  ```bash
  build
  ```

### Step 3: Add Environment Variables

Click **Environment** tab and add:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyB_OE_1Un1ufZIJHEFaX31_phbR3x6UOcY
REACT_APP_FIREBASE_AUTH_DOMAIN=arms-8a8b8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=arms-8a8b8
REACT_APP_FIREBASE_STORAGE_BUCKET=arms-8a8b8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=614056279037
REACT_APP_FIREBASE_APP_ID=1:614056279037:web:2d1f29553a67c74890b794
REACT_APP_API_URL=https://arms-backend.onrender.com
```

### Step 4: Configure Redirects/Rewrites

Add a `_redirects` file for React Router:

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

### Step 5: Deploy

Click **Create Static Site**

Your frontend will be available at: `https://arms-frontend.onrender.com`

---

## Update CORS for Production

After deployment, update backend CORS settings:

1. Go to Render Dashboard → Backend Service
2. Add environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://arms-frontend.onrender.com
   ```
3. Redeploy backend

---

## Custom Domain (Optional)

### For Frontend:
1. Go to your static site settings
2. Click **Custom Domain**
3. Add your domain (e.g., `arms.yourdomain.com`)
4. Follow DNS configuration instructions

### For Backend:
1. Go to your web service settings
2. Click **Custom Domain**
3. Add your API domain (e.g., `api.yourdomain.com`)
4. Update CORS settings with your custom domain

---

## Firebase Configuration for Production

### Update Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `arms-8a8b8`
3. Authentication → Settings → Authorized domains
4. Add:
   - `arms-frontend.onrender.com`
   - Your custom domain (if any)

---

## Monitoring & Logs

### View Logs:
1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab

### View Metrics:
1. Select your service
2. Click **Metrics** tab
3. Monitor CPU, Memory, and Response times

---

## Troubleshooting

### Backend Issues

**Build Fails:**
- Check Java version (should be 17)
- Verify Maven is working
- Check logs for specific errors

**Service Won't Start:**
- Check `SERVER_PORT=8080` is set
- Verify health check path: `/api/health`
- Check logs for startup errors

**CORS Errors:**
- Update `CORS_ALLOWED_ORIGINS` with frontend URL
- Redeploy backend after changing

### Frontend Issues

**Build Fails:**
- Check Node version (should be 18+)
- Verify all environment variables are set
- Check for missing dependencies

**Blank Page:**
- Check browser console for errors
- Verify Firebase credentials
- Check API URL is correct

**Routes Not Working:**
- Verify `_redirects` file exists in `public/`
- Check static site configuration

---

## Cost Estimate

### Free Tier:
- ✅ Backend: Free (with 750 hours/month)
- ✅ Frontend: Free (100 GB bandwidth/month)
- ✅ Total: **$0/month**

### Paid Tier (if needed):
- Backend: $7/month (Starter)
- Frontend: Free
- Total: **$7/month**

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Firebase authorized domains updated
- [ ] Health checks passing
- [ ] Test login/authentication
- [ ] Test all features

---

## Quick Commands

### Update Deployment:
```bash
git add .
git commit -m "Update deployment"
git push origin main
```

Render will automatically redeploy!

### Manual Redeploy:
1. Go to Render Dashboard
2. Select service
3. Click **Manual Deploy** → **Deploy latest commit**

---

## Support

If you encounter issues:
1. Check Render logs
2. Check browser console
3. Verify environment variables
4. Check Firebase Console

**Your app will be live at:**
- Frontend: `https://arms-frontend.onrender.com`
- Backend API: `https://arms-backend.onrender.com/api/health`

🎉 **Deployment Complete!**
