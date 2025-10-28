# Firebase Authentication Setup

## ⚠️ Login Failed? Follow These Steps

### Step 1: Enable Authentication Methods in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **arms-8a8b8**
3. Click **Authentication** in the left sidebar
4. Go to **Sign-in method** tab
5. Enable the following providers:

#### Enable Email/Password
- Click on **Email/Password**
- Toggle **Enable** to ON
- Click **Save**

#### Enable Google Sign-In
- Click on **Google**
- Toggle **Enable** to ON
- Add your support email (your email address)
- Click **Save**

### Step 2: Add Authorized Domains

Still in Authentication → Settings → Authorized domains:
- Make sure `localhost` is in the list (should be by default)
- Add any production domains you'll use later

### Step 3: Restart Frontend

After enabling authentication methods:
```bash
# Stop the frontend (Ctrl+C in the terminal)
# Then restart:
cd frontend
npm start
```

### Step 4: Test Login

1. Open http://localhost:3000
2. Try to register a new account first:
   - Click "Register" or "Sign Up"
   - Enter email and password
   - Submit
3. Then try to login with those credentials

## Common Login Issues & Solutions

### Issue 1: "auth/operation-not-allowed"
**Solution**: Email/Password authentication is not enabled in Firebase Console. Follow Step 1 above.

### Issue 2: "auth/user-not-found"
**Solution**: You need to register first. Click "Register" or "Sign Up" to create an account.

### Issue 3: "auth/wrong-password"
**Solution**: Check your password. If you forgot it, use "Forgot Password" option.

### Issue 4: "auth/invalid-email"
**Solution**: Make sure you're entering a valid email format (e.g., user@example.com)

### Issue 5: "auth/weak-password"
**Solution**: Password should be at least 6 characters long.

### Issue 6: Google Sign-In fails
**Solution**: 
1. Enable Google Sign-In in Firebase Console (Step 1)
2. Make sure you added a support email
3. Clear browser cache and try again

## Verify Firebase Configuration

Check if your `.env` file has the correct values:
```bash
cd frontend
cat .env | grep REACT_APP_FIREBASE
```

Should show:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyB_OE_1Un1ufZIJHEFaX31_phbR3x6UOcY
REACT_APP_FIREBASE_AUTH_DOMAIN=arms-8a8b8.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=arms-8a8b8
REACT_APP_FIREBASE_STORAGE_BUCKET=arms-8a8b8.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=614056279037
REACT_APP_FIREBASE_APP_ID=1:614056279037:web:2d1f29553a67c74890b794
```

## Check Browser Console

1. Open your browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try to login again
5. Look for error messages

Common error messages and what they mean:
- `auth/operation-not-allowed` → Enable auth method in Firebase Console
- `auth/user-not-found` → User doesn't exist, register first
- `auth/wrong-password` → Incorrect password
- `auth/invalid-api-key` → Check your `.env` file
- `auth/network-request-failed` → Check internet connection

## Quick Test

To verify Firebase is working, open browser console (F12) and run:
```javascript
console.log(window.firebase);
```

If you see an object, Firebase is loaded. If `undefined`, there's a configuration issue.

## Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete (Chrome) or Cmd+Shift+Delete (Mac)
2. **Try incognito/private mode**: This rules out extension conflicts
3. **Check Firebase project status**: Make sure your Firebase project is active
4. **Verify billing**: Some Firebase features require Blaze (pay-as-you-go) plan

## Create Test User Manually

If automatic registration isn't working, create a user manually:

1. Go to Firebase Console
2. Authentication → Users tab
3. Click **Add user**
4. Enter email and password
5. Click **Add user**
6. Try logging in with these credentials

---

**After following these steps, your login should work!**

If you're still having issues, share the exact error message from the browser console.
