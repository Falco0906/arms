# 🚀 Deploy ARMS Platform to Render

Complete guide for deploying your React app to Render.

## Prerequisites

1. **GitHub account** - Your code is already pushed to GitHub ✅
2. **Render account** - Sign up at https://render.com (free tier available)
3. **Environment variables ready** - From your `.env` file

---

## Deployment Steps

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub (recommended for easier deployment)
4. Authorize Render to access your GitHub repositories

### Step 2: Create New Static Site

1. From Render Dashboard, click **"New +"** button
2. Select **"Static Site"**
3. Connect your GitHub repository:
   - Click "Connect account" if not already connected
   - Search for your repository: `Falco0906/arms`
   - Click "Connect" next to the repository

### Step 3: Configure Build Settings

Fill in the configuration:

**Basic Settings:**
- **Name**: `arms-platform` (or any name you prefer)
- **Branch**: `main2` (or `main` if you merge)
- **Root Directory**: `frontend`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  frontend/build
  ```

**Advanced Settings:**
- **Auto-Deploy**: Yes (recommended - deploys on every push)

### Step 4: Add Environment Variables

Scroll down to **Environment Variables** section and add each variable from your `.env` file:

Click "Add Environment Variable" for each:

```
REACT_APP_USE_FIREBASE = true
REACT_APP_FIREBASE_API_KEY = your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
REACT_APP_FIREBASE_APP_ID = your_app_id
REACT_APP_GOOGLE_CLIENT_ID = your_google_client_id (optional)
REACT_APP_MAX_FILE_SIZE = 104857600
```

**Important**: Make sure variable names start with `REACT_APP_`

### Step 5: Add Rewrite Rules for SPA Routing

Create a `render.yaml` file in your frontend directory to handle client-side routing:

1. In the Environment section, add these headers/redirects OR
2. Render will auto-detect Create React App and configure routing

If needed, you can add custom headers by creating `frontend/render.yaml`:

```yaml
services:
  - type: web
    name: arms-platform
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Step 6: Deploy!

1. Click **"Create Static Site"** button at the bottom
2. Render will start building your app
3. Wait 3-5 minutes for the build to complete
4. Once done, you'll get a URL like: `https://arms-platform.onrender.com`

---

## Post-Deployment Setup

### 1. Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Render URL: `arms-platform.onrender.com` (use your actual subdomain)

### 2. Update Google OAuth Settings (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   ```
   https://arms-platform.onrender.com
   ```
5. Save changes

### 3. Test Your Deployment

Visit your Render URL and verify:
- ✅ Site loads correctly
- ✅ Dark mode works (obsidian theme)
- ✅ Firebase authentication works
- ✅ Can login with Google
- ✅ File uploads work
- ✅ All features functional

---

## Updating Your Deployment

### Automatic Updates (Recommended)

With Auto-Deploy enabled, every push to your `main2` branch will automatically redeploy:

```bash
# Make changes to your code
git add .
git commit -m "your changes"
git push origin main2

# Render automatically rebuilds and deploys!
```

### Manual Deploy

From Render Dashboard:
1. Go to your static site
2. Click **"Manual Deploy"** button
3. Select branch and click **"Deploy"**

---

## Managing Environment Variables

To update environment variables after deployment:

1. Go to Render Dashboard
2. Select your static site
3. Navigate to **Environment** tab
4. Edit or add variables
5. Click **"Save Changes"**
6. Render will automatically redeploy with new variables

---

## Custom Domain (Optional)

### Add Custom Domain

1. In Render Dashboard, go to your site
2. Navigate to **Settings** tab
3. Scroll to **Custom Domain** section
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `arms.yourdomain.com`)
6. Follow DNS instructions provided

### Update DNS Records

Add these records to your domain registrar:

**For subdomain (e.g., arms.yourdomain.com):**
```
Type: CNAME
Name: arms
Value: your-site.onrender.com
```

**For root domain (e.g., yourdomain.com):**
```
Type: A
Name: @
Value: (IP provided by Render)
```

---

## Render.yaml Configuration (Optional Advanced Setup)

Create `frontend/render.yaml` for full control:

```yaml
services:
  - type: web
    name: arms-platform
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: NODE_VERSION
        value: 18
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## Troubleshooting

### Build Failed

**Check build logs** in Render Dashboard:
1. Click on your deployment
2. View **Logs** tab
3. Look for error messages

**Common fixes:**
```bash
# If Node version issue
# Add to render.yaml:
envVars:
  - key: NODE_VERSION
    value: 18

# If dependency issue
# Clear npm cache in build command:
npm ci --cache .npm --prefer-offline && npm run build
```

### Environment Variables Not Working

1. Verify all variables start with `REACT_APP_`
2. Check for typos in variable names
3. Ensure variables are saved in Render dashboard
4. Trigger manual redeploy after adding variables

### Site Returns 404 on Refresh

- Render should auto-configure routing for Create React App
- If not, create `frontend/render.yaml` with rewrite rules (see above)
- Or create `frontend/public/_redirects`:
  ```
  /*    /index.html   200
  ```

### Firebase Connection Issues

1. Verify Firebase config variables are correct
2. Check Firebase authorized domains includes Render URL
3. Check browser console for specific errors
4. Ensure CORS is enabled in Firebase Storage rules

---

## Performance Optimization

### Enable HTTP/2 and Compression

Render automatically enables:
- ✅ HTTP/2
- ✅ Brotli compression
- ✅ Gzip compression
- ✅ CDN caching

### Custom Headers

Add in `render.yaml`:
```yaml
headers:
  - path: /static/*
    name: Cache-Control
    value: public, max-age=31536000, immutable
```

---

## Monitoring & Logs

### View Deployment Logs

1. Go to Render Dashboard
2. Select your static site
3. Click **"Logs"** tab
4. View real-time build and deployment logs

### Check Build Status

- **Green**: Successfully deployed
- **Yellow**: Building in progress
- **Red**: Build failed (check logs)

---

## Render Free Tier Limits

✅ **Included in Free Tier:**
- Static site hosting
- Automatic SSL/TLS certificates
- Global CDN
- Unlimited bandwidth
- Automatic deployments from Git
- Custom domains

⚠️ **Note**: Free tier static sites spin down after 15 minutes of inactivity. First request after inactivity may take a few seconds to wake up.

**For always-on hosting**, upgrade to paid plan ($7/month).

---

## Quick Reference

### Your Deployment URLs

- **Render URL**: `https://arms-platform.onrender.com` (replace with your actual URL)
- **Custom Domain**: (add after setup)

### Useful Commands

```bash
# Push changes (auto-deploys if enabled)
git add .
git commit -m "update message"
git push origin main2

# View your site
# Visit your Render URL in browser
```

### Important Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs/static-sites
- **Support**: https://render.com/docs/support

---

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Set up custom domain (optional)
3. ✅ Share your live URL with team/users
4. ✅ Set up monitoring (Render provides basic metrics)
5. ✅ Configure automatic backups (Git handles this)

---

## Congratulations! 🎉

Your ARMS Platform is now live on Render!

**What you deployed:**
- ✨ Obsidian dark theme
- 🔐 Firebase authentication
- 📚 Course management
- 💬 Real-time messaging
- 📱 Fully responsive
- 🌙 Dark/light mode toggle

Enjoy your deployed app at: `https://your-site.onrender.com`
