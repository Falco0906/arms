# Pre-Deployment Checklist

Run through this checklist before deploying to production.

## ✅ Code & Build

- [ ] **Test build locally**
  ```bash
  npm run build
  ```
  Should complete without errors

- [ ] **No console errors**
  - Open app in browser
  - Check browser console (F12)
  - Should have no red errors

- [ ] **Dark theme working**
  - Toggle dark mode
  - Verify neutral gray colors (not blue)
  - Check text is readable

## ✅ Configuration

- [ ] **.env file configured**
  - All Firebase variables filled in
  - Google Client ID added (if using)
  - Max file size set

- [ ] **Firebase setup complete**
  - Project created on Firebase Console
  - Authentication enabled (Google provider)
  - Firestore database created
  - Storage bucket created
  - Security rules configured

- [ ] **Domain restrictions**
  - Add your deployment domain to Firebase authorized domains
  - Update Google OAuth allowed origins

## ✅ Features Testing

Test these features before deploying:

- [ ] **Authentication**
  - Can register with @klh.edu.in email
  - Can login with Google
  - Can logout
  - Session persists on refresh

- [ ] **Courses**
  - Can view course list
  - Can select a course
  - Can search courses
  - Can filter courses

- [ ] **Materials**
  - Can upload files
  - Can download files
  - Can view material details
  - Can like materials
  - Can comment on materials

- [ ] **User Features**
  - Can view user profile
  - Can view rankings
  - Can access personal notes
  - Notes save/load correctly

- [ ] **Messaging**
  - Can send direct messages
  - Can send course chat messages
  - Messages appear in real-time

- [ ] **UI/UX**
  - Sidebar navigation works
  - Search bar functions
  - Dark mode toggle works
  - Mobile view looks good
  - Tablet view looks good

## ✅ Performance

- [ ] **Build size reasonable**
  ```bash
  npm run build
  # Check build/static/js/*.js sizes
  # Should be < 500KB gzipped per chunk
  ```

- [ ] **Images optimized**
  - No unnecessarily large images
  - Use appropriate formats (WebP, SVG)

- [ ] **No memory leaks**
  - Test app for 5+ minutes
  - Check browser memory usage stays stable

## ✅ Security

- [ ] **API keys not exposed**
  - Check that `.env` is in `.gitignore`
  - Firebase keys are in environment variables
  - No secrets in source code

- [ ] **Firestore rules configured**
  - Users can only edit their own data
  - Proper read/write permissions set

- [ ] **Storage rules configured**
  - File size limits enforced
  - File type restrictions in place
  - Users can only delete own files

- [ ] **Authentication rules**
  - Only @klh.edu.in emails allowed
  - Proper session handling
  - Logout clears session

## ✅ Deployment Platform Ready

### For Vercel:
- [ ] Account created on vercel.com
- [ ] CLI installed: `npm install -g vercel`
- [ ] Ready to run: `vercel`

### For Netlify:
- [ ] Account created on netlify.com
- [ ] CLI installed: `npm install -g netlify-cli`
- [ ] Ready to run: `netlify deploy`

### For Firebase:
- [ ] CLI installed: `npm install -g firebase-tools`
- [ ] Logged in: `firebase login`
- [ ] Hosting initialized: `firebase init hosting`

## ✅ Post-Deployment

After deploying, verify:

- [ ] **Site loads**
  - Visit deployment URL
  - Page loads within 3 seconds

- [ ] **All pages accessible**
  - Navigate through all sections
  - No 404 errors on page refresh

- [ ] **Environment variables working**
  - Firebase connected
  - File uploads work
  - Authentication works

- [ ] **Mobile responsive**
  - Open on phone browser
  - UI looks correct
  - Touch interactions work

- [ ] **Dark mode persists**
  - Toggle dark mode
  - Refresh page
  - Dark mode setting remembered

## 🚨 Common Issues

### Issue: Build fails
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment variables not working
**Solution**:
- Ensure they start with `REACT_APP_`
- Add them to deployment platform dashboard
- Redeploy after adding variables

### Issue: 404 on page refresh
**Solution**:
- Add `vercel.json` for Vercel
- Add `_redirects` for Netlify:
  Create `public/_redirects` with:
  ```
  /*    /index.html   200
  ```

### Issue: Firebase connection fails
**Solution**:
- Check Firebase config in `.env`
- Verify project ID is correct
- Check browser console for specific error
- Ensure deployment domain is in Firebase authorized domains

## 📝 Final Steps

1. Run build test: `npm run build`
2. Test locally: `npm start`
3. Check all features work
4. Deploy: `vercel` or `netlify deploy --prod`
5. Add environment variables in platform dashboard
6. Test deployed site
7. Add custom domain (optional)

## ✨ You're Ready!

Once all checkboxes are complete, you're ready to deploy your ARMS Platform!

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**
