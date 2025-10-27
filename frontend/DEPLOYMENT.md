# ARMS Platform - Deployment Guide

This guide covers deploying the ARMS Platform frontend to various hosting services.

## ✅ All Theme Issues Fixed

The obsidian dark theme has been fully implemented:
- ✅ Background: `dark:bg-neutral-950` (near-black)
- ✅ Cards/Panels: `dark:bg-neutral-900` 
- ✅ Borders: `dark:border-neutral-800` / `dark:border-neutral-700`
- ✅ No more blue/purple accents - pure neutral gray palette
- ✅ All text properly readable in dark mode

---

## Prerequisites

Before deploying, ensure you have:

1. **Environment Variables** - Copy `.env.example` to `.env` and fill in:
   - Firebase configuration (API key, project ID, etc.)
   - Google Client ID (optional)
   - Any other API endpoints

2. **Build Test** - Run locally to ensure everything works:
   ```bash
   npm run build
   ```

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
cd c:\Users\faisa\Downloads\arms\frontend
vercel
```

**Step 3: Configure Environment Variables**
- Go to your project dashboard on https://vercel.com
- Navigate to Settings → Environment Variables
- Add all variables from your `.env` file
- Redeploy: `vercel --prod`

**Build Configuration (Auto-detected)**
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

---

### Option 2: Netlify

**Method A: Netlify CLI**

```bash
npm install -g netlify-cli
cd c:\Users\faisa\Downloads\arms\frontend
netlify deploy --prod
```

**Method B: Git-based Deployment**

1. Push your code to GitHub/GitLab
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables in Site Settings → Environment

**_redirects File** (Create in `public` folder for SPA routing):
```
/*    /index.html   200
```

---

### Option 3: Firebase Hosting

**Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

**Step 2: Initialize**
```bash
cd c:\Users\faisa\Downloads\arms\frontend
firebase init hosting
```

Select:
- Public directory: `build`
- Single-page app: `Yes`
- GitHub automatic builds: `No` (or Yes if using GitHub)

**Step 3: Build and Deploy**
```bash
npm run build
firebase deploy --only hosting
```

**firebase.json** (Auto-created):
```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

---

### Option 4: GitHub Pages

**Step 1: Install gh-pages**
```bash
npm install --save-dev gh-pages
```

**Step 2: Update package.json**

Add these fields:
```json
{
  "homepage": "https://yourusername.github.io/arms-platform",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Step 3: Deploy**
```bash
npm run deploy
```

**Note**: Environment variables must be added as repository secrets in GitHub Actions if using CI/CD.

---

## Environment Variables Setup

For all deployment platforms, add these environment variables:

### Required Variables
```
REACT_APP_USE_FIREBASE=true
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Optional Variables
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_API_URL=https://your-backend-api.com/api
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Dark mode works correctly (obsidian neutral theme)
- [ ] Firebase authentication works
- [ ] File uploads work
- [ ] Course materials load
- [ ] Search functionality works
- [ ] Notifications appear
- [ ] User profiles display
- [ ] Chat/messaging functions
- [ ] All responsive breakpoints work

---

## Troubleshooting

### Build Fails
- Check Node version: `node -v` (should be 14+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors in console

### Environment Variables Not Working
- Ensure they start with `REACT_APP_`
- Restart dev server after adding new variables
- Redeploy after updating variables on hosting platform

### Routing Issues (404 on refresh)
- Add `_redirects` file for Netlify
- Configure rewrites for Firebase Hosting
- Add `vercel.json` for Vercel:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Dark Mode Not Working
- Verify Tailwind config includes `darkMode: 'class'`
- Check that dark mode state persists in localStorage

---

## Recommended: Vercel Deployment

For the fastest deployment:

1. **Sign up**: https://vercel.com
2. **Install CLI**: `npm install -g vercel`
3. **Deploy**:
   ```bash
   cd c:\Users\faisa\Downloads\arms\frontend
   vercel
   ```
4. **Add environment variables** in Vercel dashboard
5. **Deploy production**: `vercel --prod`

Your site will be live at `https://your-project.vercel.app`

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Firebase Docs: https://firebase.google.com/docs/hosting
- React Build Docs: https://create-react-app.dev/docs/deployment

