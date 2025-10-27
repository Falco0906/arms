# 🚀 QUICK DEPLOY - 5 Minutes to Live

The fastest path to deploy your ARMS Platform.

## Prerequisites (1 minute)

1. **Ensure you have Node.js installed**:
   ```bash
   node -v
   # Should show v14+ or higher
   ```

2. **Check .env is configured**:
   - Open `.env` file
   - Verify Firebase variables are filled in
   - If not, copy from `.env.example` and add your Firebase config

## Option A: Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd c:\Users\faisa\Downloads\arms\frontend
vercel
```

**During setup, accept defaults**:
- Setup and deploy? `Y`
- Which scope? (select your account)
- Link to existing project? `N`
- Project name? (press Enter for default or type custom name)
- In which directory? `./` (press Enter)
- Auto-detected Create React App, continue? `Y`
- Override settings? `N`

**Wait for deployment (~2 minutes)**

### Step 3: Add Environment Variables

Visit the URL provided (e.g., `https://your-project.vercel.app/settings`)

1. Go to Settings → Environment Variables
2. Add each variable from your `.env` file:
   ```
   REACT_APP_USE_FIREBASE → true
   REACT_APP_FIREBASE_API_KEY → your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN → your_domain
   ... (add all remaining variables)
   ```

### Step 4: Redeploy with Environment Variables
```bash
vercel --prod
```

**Done! Your site is live! 🎉**

---

## Option B: Deploy to Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build Your App
```bash
npm run build
```

### Step 3: Deploy
```bash
netlify deploy
```

**During setup**:
- Authorize Netlify CLI in browser
- Create new site? `Y`
- Team: (select your team)
- Site name: (enter custom name or press Enter)
- Publish directory: `build`

**You'll get a draft URL to test**

### Step 4: Deploy to Production
```bash
netlify deploy --prod
```

### Step 5: Add Environment Variables

1. Visit your Netlify dashboard
2. Go to Site Settings → Environment Variables
3. Add all variables from `.env` file
4. Redeploy:
   ```bash
   netlify deploy --prod
   ```

**Done! Your site is live! 🎉**

---

## Option C: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Hosting
```bash
cd c:\Users\faisa\Downloads\arms\frontend
firebase init hosting
```

**During setup**:
- Use existing project? `Y`
- Select your Firebase project
- Public directory? `build`
- Configure as SPA? `Y`
- Set up automatic builds? `N`

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

**Done! Your site is live at your-project.web.app! 🎉**

---

## After Deployment

### 1. Test Your Site

Visit your deployment URL and verify:
- ✅ Site loads
- ✅ Dark mode works
- ✅ Can login with Google
- ✅ Firebase connected

### 2. Update Firebase Authorized Domains

1. Go to Firebase Console
2. Navigate to Authentication → Settings → Authorized Domains
3. Add your deployment URL (e.g., `your-project.vercel.app`)

### 3. Update Google OAuth

If using Google OAuth:
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your deployment URL to Authorized JavaScript origins

---

## Troubleshooting

### "Build failed" error
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Environment variables not working"
- Make sure they start with `REACT_APP_`
- Add them in the platform dashboard (Vercel/Netlify)
- Redeploy after adding

### "404 on page refresh"
Already handled by:
- `vercel.json` for Vercel
- For Netlify, create `public/_redirects` with:
  ```
  /*    /index.html   200
  ```

### "Firebase not connecting"
- Verify `.env` variables are correct
- Check Firebase project ID matches
- Ensure deployment domain is in Firebase authorized domains

---

## Custom Domain (Optional)

### Vercel
1. Go to your project settings
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records as instructed

### Firebase
```bash
firebase hosting:channel:deploy live --only hosting
```
Then add custom domain in Firebase Console

---

## Next Steps

- 📱 Test on mobile devices
- 🔒 Review Firebase security rules
- 📊 Set up analytics (optional)
- 💬 Share your live URL!

---

## Need More Help?

- **Detailed guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Pre-deployment checks**: See [pre-deploy-check.md](./pre-deploy-check.md)
- **Vercel docs**: https://vercel.com/docs
- **Netlify docs**: https://docs.netlify.com
- **Firebase docs**: https://firebase.google.com/docs/hosting

---

## Your Site is Live! 🎉

Congratulations on deploying your ARMS Platform!

**What you deployed:**
- ✨ Clean obsidian dark theme
- 🔐 Secure authentication
- 📚 Course management system
- 💬 Real-time messaging
- 📱 Fully responsive design
- 🌙 Dark/light mode toggle

Enjoy your deployed app!
