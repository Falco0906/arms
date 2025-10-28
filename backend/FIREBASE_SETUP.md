# Firebase Backend Setup

## Your Firebase Project Details
- **Project ID**: arms-8a8b8
- **Storage Bucket**: arms-8a8b8.firebasestorage.app
- **Auth Domain**: arms-8a8b8.firebaseapp.com

## Steps to Enable Backend Firebase Integration

### 1. Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **arms-8a8b8**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file as `firebase-credentials.json` in this directory (`backend/`)

### 2. Update Application Properties

The `application.properties` file is already configured with:
```properties
firebase.project.id=arms-8a8b8
firebase.storage.bucket=arms-8a8b8.firebasestorage.app
firebase.credentials.path=firebase-credentials.json
```

### 3. Restart Backend

After placing `firebase-credentials.json` in the `backend/` directory:

```bash
cd backend
mvn spring-boot:run
```

The backend will automatically connect to Firebase!

## Security Note

⚠️ **IMPORTANT**: The `firebase-credentials.json` file is already in `.gitignore`. 
Never commit this file to Git as it contains sensitive credentials.

## Testing Firebase Connection

Once configured, test the connection:

```bash
# Health check (should show firebase: connected)
curl http://localhost:8080/api/health

# Get stats from Firestore
curl http://localhost:8080/api/stats
```

## Without Firebase Credentials

The backend works fine without Firebase credentials - it just won't be able to:
- Verify Firebase tokens
- Access Firestore data
- Use Firebase Storage

Since your frontend connects directly to Firebase, the backend Firebase integration is optional.
