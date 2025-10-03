# Firebase Setup Guide for ARMS Platform

## 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "arms-platform" 
4. Disable Google Analytics (optional)
5. Create project

## 2. Set up Authentication
1. Go to Authentication → Sign-in method
2. Enable Email/password
3. Enable Google:
   - Download config file
   - Add localhost:3000 to authorized domains
4. Go to Settings → Authorized domains
5. Add your production domain later

## 3. Set up Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Choose a location (us-central1 recommended)
4. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading user profiles for course materials
      allow read: if request.auth != null;
    }
    
    // Anyone authenticated can read courses
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Adjust permissions as needed
    }
    
    // Anyone authenticated can read/write materials
    match /materials/{materialId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // News/announcements
    match /news/{newsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Pins, ratings, activities - user-specific
    match /pins/{pinId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /activities/{activityId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 4. Set up Firebase Storage
1. Go to Storage
2. Get started with default rules
3. Update rules for file uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /exam-packs/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Add app" → Web app
4. Register app name: "arms-platform-web"
5. Copy the config object

## 6. Update your firebase.js config file
Replace the config in `/frontend/src/firebase.js` with your values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 7. Test Authentication
1. Try signing up with email/password
2. Try Google sign-in
3. Check Firebase Console → Authentication → Users

## 8. Create Initial Data (Optional)
You can manually add some test courses in Firestore Console:

Collection: `courses`
Document 1:
```json
{
  "code": "CS101",
  "name": "Introduction to Programming", 
  "description": "Learn the basics of programming",
  "instructor": "Dr. Smith",
  "semester": "Fall 2024",
  "credits": 3,
  "createdAt": [current timestamp]
}
```

## 9. Domain Restrictions
In Authentication → Settings → Authorized domains:
- Add your production domain
- For development: localhost is automatically included

## Notes:
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`
- Consider setting up Firebase hosting for production deployment
- Update security rules based on your specific needs
- Enable email verification in Authentication → Templates if needed